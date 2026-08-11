'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { logAuditEvent } from '@/lib/services/audit';
import { NotificationService } from '@/lib/services/notifications';
import { UserRole, Organization } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getCurrentUserSession } from '@/lib/actions/auth';
import { isProduction } from '@/lib/config/env';

function normalizeUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getRegistrationRateLimitKey(userContext?: { id: string }) {
  if (userContext?.id) return `org-registration:user:${userContext.id}`;

  try {
    const requestHeaders = headers();
    const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = requestHeaders.get('x-real-ip')?.trim();
    return `org-registration:ip:${forwardedFor || realIp || 'anonymous'}`;
  } catch {
    return 'org-registration:anonymous';
  }
}

const orgRegistrationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  name_ar: z.string().optional(),
  password: z.string().optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  description_ar: z.string().optional(),
  organization_type: z.string().min(2, 'Organization type is required'),
  country_id: z.string().min(1, 'Country is required'),
  city_id: z.string().min(1, 'City is required'),
  full_address: z.string().min(3, 'Full address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  website: z.string().optional().or(z.literal('')),
  email: z.string().email('Valid official contact email is required'),
  phone: z.string().optional(),
  logo: z.string().optional().or(z.literal('')),
});

export async function registerOrganizationAction(formData: unknown, userContext?: { id: string; role: UserRole; email: string }) {
  const rateLimitKey = getRegistrationRateLimitKey(userContext);
  const rateCheck = await checkRateLimit(rateLimitKey, 'ORG_REGISTRATION');
  if (!rateCheck.success) {
    return {
      success: false,
      error: 'Organization registration rate limit reached. Please wait before attempting again.',
    };
  }

  const raw = formData as Record<string, unknown>;
  const sanitized = {
    ...raw,
    website: typeof raw.website === 'string' ? normalizeUrl(raw.website) || '' : '',
    logo: typeof raw.logo === 'string' ? normalizeUrl(raw.logo) || '' : '',
  };

  const parsed = orgRegistrationSchema.safeParse(sanitized);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid organization registration data.',
    };
  }

  const data = parsed.data;
  const slug = `org-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;

  // Dynamic Worldwide City/Country resolution
  let resolvedCityId = data.city_id;
  let resolvedCountryId = data.country_id;

  if (!isProduction && data.city_id && (data.city_id.startsWith('custom:') || !data.city_id.startsWith('city-'))) {
    const rawCityName = data.city_id.replace(/^custom:/, '');
    const cityObj = await db.cities.findOrCreateByName(rawCityName, resolvedCountryId, data.latitude, data.longitude);
    resolvedCityId = cityObj.id;
  }

  const initialPassword = (typeof raw.password === 'string' && raw.password.trim()) ? raw.password.trim() : 'Ezidi@2026';

  let newOrg: Organization;
  try {
    newOrg = await db.organizations.create(
      {
        name: data.name,
        name_ar: data.name_ar,
        slug,
        password: initialPassword,
        description: data.description,
        description_ar: data.description_ar,
        organization_type: data.organization_type,
        country_id: resolvedCountryId,
        city_id: resolvedCityId,
        full_address: data.full_address,
        latitude: data.latitude,
        longitude: data.longitude,
        website: data.website || null,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || null,
        logo: data.logo || null,
        organization_status: 'active',
        verification_status: 'pending',
        direct_publishing_enabled: false,
        is_demo: false,
      },
      { requireCloudSync: true }
    );
  } catch {
    return {
      success: false,
      error: 'Unable to deliver your registration to the review queue. Please try again shortly.',
    };
  }

  await logAuditEvent({
    actor_id: userContext?.id || 'anonymous',
    actor_email: userContext?.email,
    actor_role: userContext?.role || 'user',
    action: 'ORGANIZATION_REGISTRATION_SUBMITTED',
    entity_type: 'organization',
    entity_id: newOrg.id,
    new_values: { name: newOrg.name, email: newOrg.email },
  });

  await NotificationService.notifyAdmins(
    'New Organization Registration Awaiting Verification',
    `"${newOrg.name}" has registered and submitted documents for administrator verification.`,
    '/admin/organizations'
  );

  try {
    revalidatePath('/admin/organizations');
    revalidatePath('/admin');
  } catch {}

  return {
    success: true,
    organization: newOrg,
  };
}

export async function toggleDirectPublishingAction(
  orgId: string,
  enable: boolean,
  reason: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only administrators can modify direct publishing permissions.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A mandatory reason is required to modify direct publishing privileges.' };
  }

  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };

  if (enable && org.organization_status === 'suspended') {
    return { success: false, error: 'Cannot enable direct publishing on a suspended organization.' };
  }

  const previousValue = org.direct_publishing_enabled;
  await db.organizations.update(orgId, { direct_publishing_enabled: enable });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: enable ? 'DIRECT_PUBLISHING_ENABLED' : 'DIRECT_PUBLISHING_REVOKED',
    entity_type: 'organization',
    entity_id: orgId,
    reason,
    previous_values: { direct_publishing_enabled: previousValue },
    new_values: { direct_publishing_enabled: enable },
  });

  return { success: true };
}

export async function suspendOrganizationAction(
  orgId: string,
  reason: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only administrators can suspend organizations.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A mandatory reason is required to suspend an organization.' };
  }

  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };

  // Suspension automatically revokes direct publishing server-side
  await db.organizations.update(orgId, {
    organization_status: 'suspended',
    direct_publishing_enabled: false,
    verification_status: 'suspended',
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'ORGANIZATION_SUSPENDED',
    entity_type: 'organization',
    entity_id: orgId,
    reason,
    previous_values: { organization_status: org.organization_status, direct_publishing_enabled: org.direct_publishing_enabled },
    new_values: { organization_status: 'suspended', direct_publishing_enabled: false },
  });

  return { success: true };
}

export async function reactivateOrganizationAction(
  orgId: string,
  reason: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only administrators can reactivate organizations.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A mandatory reason is required to reactivate an organization.' };
  }

  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };
  if (org.organization_status !== 'suspended') {
    return { success: false, error: 'Only suspended organizations can be reactivated.' };
  }

  // Reactivation restores access but never restores publishing privileges automatically.
  // A fresh verification is required before the organization can publish again.
  await db.organizations.update(orgId, {
    organization_status: 'active',
    verification_status: 'pending',
    verified_at: null,
    verified_by: null,
    direct_publishing_enabled: false,
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'ORGANIZATION_REACTIVATED',
    entity_type: 'organization',
    entity_id: orgId,
    reason,
    previous_values: {
      organization_status: org.organization_status,
      verification_status: org.verification_status,
      direct_publishing_enabled: org.direct_publishing_enabled,
    },
    new_values: {
      organization_status: 'active',
      verification_status: 'pending',
      direct_publishing_enabled: false,
    },
  });

  try {
    revalidatePath('/admin/organizations');
    revalidatePath('/admin/submissions');
    revalidatePath('/admin');
  } catch {}

  return { success: true };
}

export async function updateOrganizationProfileAction(
  orgId: string,
  formData: Partial<Organization>,
  _userContext?: { id: string; role: UserRole; email: string }
) {
  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };

  // Privileged attributes are only changed by dedicated, audited admin actions.
  const protectedFields: Array<keyof Organization> = [
    'id',
    'slug',
    'organization_status',
    'verification_status',
    'verified_at',
    'verified_by',
    'verification_notes',
    'direct_publishing_enabled',
    'country_id',
    'region_id',
    'city_id',
    'latitude',
    'longitude',
    'is_demo',
    'created_at',
    'updated_at',
  ];
  if (protectedFields.some((field) => Object.prototype.hasOwnProperty.call(formData, field))) {
    return { success: false, error: 'Unauthorized: Protected organization attributes cannot be updated here.' };
  }

  // Resolve identity from the server-side session. Never trust a user object
  // supplied with a server action request.
  let session: Awaited<ReturnType<typeof getCurrentUserSession>>;
  try {
    session = await getCurrentUserSession();
  } catch {
    return { success: false, error: 'Unauthorized: Please sign in to update this organization.' };
  }
  if (!session) {
    return { success: false, error: 'Unauthorized: Please sign in to update this organization.' };
  }

  const isPlatformAdmin = session.role === 'super_admin' || session.role === 'admin';
  const isOrganizationOwner =
    session.organizationId === orgId ||
    (['organization_owner', 'organization_admin'].includes(session.role) && session.email === org.email);

  if (!isPlatformAdmin && !isOrganizationOwner) {
    return { success: false, error: 'Unauthorized: You cannot update this organization.' };
  }

  const editableFields: Array<keyof Organization> = [
    'name',
    'name_ar',
    'name_de',
    'name_fr',
    'description',
    'description_ar',
    'description_de',
    'description_fr',
    'email',
    'phone',
    'website',
    'logo',
    'cover_image',
    'full_address',
    'postal_code',
    'street',
    'house_number',
    'password',
  ];
  const safeData = Object.fromEntries(
    editableFields.flatMap((field) =>
      Object.prototype.hasOwnProperty.call(formData, field) ? [[field, formData[field]]] : []
    )
  ) as Partial<Organization>;

  if (safeData.email) safeData.email = safeData.email.toLowerCase().trim();
  if (safeData.website) safeData.website = normalizeUrl(safeData.website);
  if (safeData.logo) safeData.logo = normalizeUrl(safeData.logo);
  if (safeData.cover_image) safeData.cover_image = normalizeUrl(safeData.cover_image);

  const updated = await db.organizations.update(orgId, safeData);

  await logAuditEvent({
    actor_id: session.userId,
    actor_email: session.email,
    actor_role: session.role as UserRole,
    action: 'ORGANIZATION_PROFILE_UPDATED',
    entity_type: 'organization',
    entity_id: orgId,
    previous_values: org as unknown as Record<string, unknown>,
    new_values: safeData as Record<string, unknown>,
  });

  try {
    revalidatePath('/admin/organizations');
    revalidatePath('/organization/profile');
    revalidatePath('/organization/dashboard');
  } catch {}

  return { success: true, organization: updated };
}

export async function adminResetOrgPasswordAction(
  orgId: string,
  newPassword: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' };
  }

  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };

  await db.organizations.update(orgId, { password: newPassword.trim() });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'ORGANIZATION_PASSWORD_RESET',
    entity_type: 'organization',
    entity_id: orgId,
    reason: 'Admin password reset',
  });

  try {
    revalidatePath('/admin/organizations');
  } catch {}

  return { success: true };
}
