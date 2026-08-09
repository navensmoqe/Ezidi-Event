'use server';

import { db } from '@/lib/db';
import { logAuditEvent } from '@/lib/services/audit';
import { NotificationService } from '@/lib/services/notifications';
import { UserRole, EventVerificationStatus } from '@/types/database';

export async function approveSubmissionAction(
  eventId: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (!['super_admin', 'admin', 'moderator', 'editor'].includes(adminContext.role)) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const event = await db.events.findById(eventId);
  if (!event) return { success: false, error: 'Event not found.' };

  const updated = await db.events.update(eventId, {
    status: 'published',
    visibility: 'public',
    event_verification_status: 'admin_verified',
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'EVENT_SUBMISSION_APPROVED',
    entity_type: 'event',
    entity_id: eventId,
    reason: 'Approved by administrator moderation review',
    previous_values: { status: event.status, visibility: event.visibility },
    new_values: { status: 'published', visibility: 'public' },
  });

  if (event.created_by) {
    await NotificationService.send({
      userId: event.created_by,
      title: 'Your Event Has Been Published!',
      message: `"${event.title}" has been reviewed, approved, and is now live on the public directory.`,
      type: 'success',
      link: `/events/${event.slug}`,
    });
  }

  return { success: true, event: updated };
}

export async function rejectSubmissionAction(
  eventId: string,
  reason: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (!['super_admin', 'admin', 'moderator'].includes(adminContext.role)) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A valid moderation reason is required to reject an event submission.' };
  }

  const event = await db.events.findById(eventId);
  if (!event) return { success: false, error: 'Event not found.' };

  await db.events.update(eventId, {
    status: 'rejected',
    visibility: 'private',
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'EVENT_SUBMISSION_REJECTED',
    entity_type: 'event',
    entity_id: eventId,
    reason,
    previous_values: { status: event.status },
    new_values: { status: 'rejected' },
  });

  if (event.created_by) {
    await NotificationService.send({
      userId: event.created_by,
      title: 'Event Submission Update',
      message: `Your event submission "${event.title}" was not approved. Reason: ${reason}`,
      type: 'warning',
    });
  }

  return { success: true };
}

export async function updateEventVerificationAction(
  eventId: string,
  verificationStatus: EventVerificationStatus,
  reason: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (!['super_admin', 'admin', 'moderator'].includes(adminContext.role)) {
    return { success: false, error: 'Unauthorized.' };
  }

  const event = await db.events.findById(eventId);
  if (!event) return { success: false, error: 'Event not found.' };

  await db.events.update(eventId, { event_verification_status: verificationStatus });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'EVENT_VERIFICATION_STATUS_CHANGED',
    entity_type: 'event',
    entity_id: eventId,
    reason: reason || 'Updated by admin',
    previous_values: { event_verification_status: event.event_verification_status },
    new_values: { event_verification_status: verificationStatus },
  });

  return { success: true };
}

export async function resolvePendingChangeAction(
  changeId: string,
  action: 'approved' | 'rejected',
  reason: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (!['super_admin', 'admin', 'moderator'].includes(adminContext.role)) {
    return { success: false, error: 'Unauthorized.' };
  }

  const success = await db.events.resolvePendingChange(changeId, action, adminContext.id, reason);
  if (!success) return { success: false, error: 'Pending change record not found.' };

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: action === 'approved' ? 'EVENT_SENSITIVE_CHANGE_APPROVED' : 'EVENT_SENSITIVE_CHANGE_REJECTED',
    entity_type: 'event',
    entity_id: changeId,
    reason: reason || (action === 'approved' ? 'Admin approved proposed modifications' : 'Admin rejected proposed modifications'),
  });

  return { success: true };
}

export async function verifyOrganizationAction(
  orgId: string,
  notes: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only administrators can verify organizations.' };
  }

  const org = await db.organizations.findById(orgId);
  if (!org) return { success: false, error: 'Organization not found.' };

  await db.organizations.update(orgId, {
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    verified_by: adminContext.id,
    verification_notes: notes || 'Verified via official registration verification.',
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'ORGANIZATION_VERIFIED',
    entity_type: 'organization',
    entity_id: orgId,
    reason: notes || 'Verified official status',
    previous_values: { verification_status: org.verification_status },
    new_values: { verification_status: 'verified' },
  });

  return { success: true };
}

export async function updateUserRoleAction(
  userId: string,
  role: UserRole,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Administrators can alter user roles.' };
  }

  const user = await db.users.findById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  await db.users.updateRole(userId, role);

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'USER_ROLE_CHANGED',
    entity_type: 'user',
    entity_id: userId,
    previous_values: { role: user.role },
    new_values: { role },
  });

  return { success: true };
}

export async function createUserAction(
  userData: { full_name: string; email: string; role: UserRole; is_active?: boolean; is_2fa_enabled?: boolean },
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Administrators can add new users.' };
  }

  if (!userData.full_name || userData.full_name.trim().length < 2) {
    return { success: false, error: 'User name is required.' };
  }

  if (!userData.email || !userData.email.includes('@')) {
    return { success: false, error: 'Valid email address is required.' };
  }

  const existing = await db.users.findByEmail(userData.email);
  if (existing) {
    return { success: false, error: 'A user with this email already exists.' };
  }

  const newUser = await db.users.create({
    full_name: userData.full_name,
    email: userData.email,
    role: userData.role,
    is_active: userData.is_active !== undefined ? userData.is_active : true,
    is_2fa_enabled: userData.is_2fa_enabled || false,
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'USER_CREATED',
    entity_type: 'user',
    entity_id: newUser.id,
    new_values: { email: newUser.email, role: newUser.role },
  });

  return { success: true, user: newUser };
}

export async function updateUserAction(
  userId: string,
  updates: { full_name?: string; email?: string; role?: UserRole; is_active?: boolean; is_2fa_enabled?: boolean },
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Administrators can modify users.' };
  }

  const user = await db.users.findById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  const updated = await db.users.update(userId, updates);

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'USER_UPDATED',
    entity_type: 'user',
    entity_id: userId,
    previous_values: user as unknown as Record<string, unknown>,
    new_values: updates as Record<string, unknown>,
  });

  return { success: true, user: updated };
}

export async function deleteUserAction(
  userId: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized: Only Super Administrators can delete users.' };
  }

  const user = await db.users.findById(userId);
  if (!user) return { success: false, error: 'User not found.' };

  await db.users.delete(userId);

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'USER_DELETED',
    entity_type: 'user',
    entity_id: userId,
    previous_values: { email: user.email, role: user.role },
  });

  return { success: true };
}

export async function createCategoryAction(
  catData: { name_en: string; name_ar: string; name_de?: string; name_fr?: string; slug?: string; description?: string; icon_name?: string },
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Administrators can create categories.' };
  }

  if (!catData.name_ar || !catData.name_en) {
    return { success: false, error: 'Category names in Arabic and English are required.' };
  }

  const slug = catData.slug || catData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const newCat = await db.categories.create({
    slug,
    name_en: catData.name_en,
    name_ar: catData.name_ar,
    name_de: catData.name_de || catData.name_en,
    name_fr: catData.name_fr || catData.name_en,
    description: catData.description || catData.name_ar,
    icon_name: catData.icon_name || 'Tag',
  });

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'CATEGORY_CREATED',
    entity_type: 'category',
    entity_id: newCat.id,
    new_values: { name_en: newCat.name_en, name_ar: newCat.name_ar, slug },
  });

  return { success: true, category: newCat };
}

export async function updateCategoryAction(
  catId: string,
  updates: { name_en?: string; name_ar?: string; name_de?: string; name_fr?: string; slug?: string; description?: string; icon_name?: string },
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Administrators can edit categories.' };
  }

  const cat = await db.categories.update(catId, updates);
  if (!cat) return { success: false, error: 'Category not found.' };

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'CATEGORY_UPDATED',
    entity_type: 'category',
    entity_id: catId,
    new_values: updates as Record<string, unknown>,
  });

  return { success: true, category: cat };
}

export async function deleteCategoryAction(
  catId: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (adminContext.role !== 'super_admin' && adminContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only Administrators can delete categories.' };
  }

  await db.categories.delete(catId);

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: 'CATEGORY_DELETED',
    entity_type: 'category',
    entity_id: catId,
  });

  return { success: true };
}

