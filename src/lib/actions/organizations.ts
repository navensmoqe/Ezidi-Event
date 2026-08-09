'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { logAuditEvent } from '@/lib/services/audit';
import { NotificationService } from '@/lib/services/notifications';
import { UserRole, Organization } from '@/types/database';

const orgRegistrationSchema = z.object({
  name: z.string().min(3, 'Organization name must be at least 3 characters'),
  name_ar: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  description_ar: z.string().optional(),
  organization_type: z.string().min(2, 'Organization type is required'),
  country_id: z.string().min(1, 'Country is required'),
  city_id: z.string().min(1, 'City is required'),
  full_address: z.string().min(5, 'Full address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email('Valid official contact email is required'),
  phone: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
});

export async function registerOrganizationAction(formData: unknown, userContext?: { id: string; role: UserRole; email: string }) {
  const rateLimitKey = userContext?.id || 'anon-org-reg';
  const rateCheck = await checkRateLimit(rateLimitKey, 'ORG_REGISTRATION');
  if (!rateCheck.success) {
    return {
      success: false,
      error: 'Organization registration rate limit reached. Please wait before attempting again.',
    };
  }

  const parsed = orgRegistrationSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid organization registration data.',
    };
  }

  const data = parsed.data;
  const slug = `demo-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;

  const newOrg = await db.organizations.create({
    name: data.name,
    name_ar: data.name_ar,
    slug,
    description: data.description,
    description_ar: data.description_ar,
    organization_type: data.organization_type,
    country_id: data.country_id,
    city_id: data.city_id,
    full_address: data.full_address,
    latitude: data.latitude,
    longitude: data.longitude,
    website: data.website || null,
    email: data.email,
    phone: data.phone || null,
    logo: data.logo || null,
    organization_status: 'active',
    verification_status: 'pending',
    direct_publishing_enabled: false,
    is_demo: true,
  });

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

export async function updateOrganizationProfileAction(
  orgId: string,
  formData: Partial<Organization>,
  userContext: { id: string; role: UserRole; email: string }
) {
  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };

  const isAdmin = userContext.role === 'super_admin' || userContext.role === 'admin';
  if (!isAdmin) {
    const isMember = await db.organizations.isMember(orgId, userContext.id);
    if (!isMember) {
      return { success: false, error: 'Unauthorized: You are not an authorized member of this organization.' };
    }
  }

  // Mass assignment protection: Strip lifecycle & permission fields
  const safeData: Partial<Organization> = { ...formData };
  if (!isAdmin) {
    delete safeData.organization_status;
    delete safeData.verification_status;
    delete safeData.direct_publishing_enabled;
    delete safeData.is_demo;
  }

  const updated = await db.organizations.update(orgId, safeData);

  await logAuditEvent({
    actor_id: userContext.id,
    actor_email: userContext.email,
    actor_role: userContext.role,
    action: 'ORGANIZATION_PROFILE_UPDATED',
    entity_type: 'organization',
    entity_id: orgId,
    previous_values: org as unknown as Record<string, unknown>,
    new_values: safeData as Record<string, unknown>,
  });

  return { success: true, organization: updated };
}
