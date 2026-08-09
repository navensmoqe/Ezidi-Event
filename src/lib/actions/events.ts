'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { isValidIanaTimeZone } from '@/lib/utils/timezone';
import { detectDuplicateEvent } from '@/lib/utils/duplicate-detector';
import { logAuditEvent } from '@/lib/services/audit';
import { NotificationService } from '@/lib/services/notifications';
import { EventItem, UserRole } from '@/types/database';
import { generateGoogleMapsUrl } from '@/lib/maps/google-maps';

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  title_ar: z.string().optional(),
  title_de: z.string().optional(),
  title_fr: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  description_ar: z.string().optional(),
  description_de: z.string().optional(),
  description_fr: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD required'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Valid start time HH:mm required'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Valid end time HH:mm required').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  country_id: z.string().min(1, 'Country is required'),
  city_id: z.string().min(1, 'City is required'),
  full_address: z.string().min(5, 'Full address is required'),
  postal_code: z.string().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  organization_id: z.string().optional().or(z.literal('')),
  organizer_name: z.string().optional(),
  poster_url: z.string().url().optional().or(z.literal('')),
  source_url: z.string().url().optional().or(z.literal('')),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  official_website: z.string().url().optional().or(z.literal('')),
});

export async function createEventAction(formData: unknown, userContext?: { id: string; role: UserRole; email: string }) {
  // 1. Rate Limiting Check
  const rateLimitKey = userContext?.id || 'anonymous-submitter';
  const rateCheck = await checkRateLimit(rateLimitKey, 'EVENT_SUBMISSION');
  if (!rateCheck.success) {
    return {
      success: false,
      error: 'Submission rate limit reached (maximum 10 per hour). Please wait before submitting again.',
    };
  }

  // 2. Schema Validation
  const parsed = createEventSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid event submission data.',
    };
  }

  const data = parsed.data;

  // 3. Validate IANA Timezone
  if (!isValidIanaTimeZone(data.timezone)) {
    return {
      success: false,
      error: `Invalid IANA timezone "${data.timezone}". Please select a valid timezone.`,
    };
  }

  // 4. Check Direct Publishing Eligibility (Backend Server/DB Security Rule)
  let status: EventItem['status'] = 'pending';
  let visibility: EventItem['visibility'] = 'private';
  let verificationStatus: EventItem['event_verification_status'] = 'unverified';

  if (userContext?.role === 'super_admin' || userContext?.role === 'admin') {
    status = 'published';
    visibility = 'public';
    verificationStatus = 'admin_verified';
  } else if (data.organization_id) {
    const org = await db.organizations.findById(data.organization_id);
    if (
      org &&
      org.verification_status === 'verified' &&
      org.organization_status === 'active' &&
      org.direct_publishing_enabled === true
    ) {
      status = 'published';
      visibility = 'public';
      verificationStatus = 'organization_verified';
    }
  }

  // 5. Generate Slug and Google Maps URL
  const baseSlug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  const google_maps_url = generateGoogleMapsUrl(data.latitude, data.longitude);

  // Dynamic Worldwide City/Country resolution: if user entered or geocoded any worldwide city
  let resolvedCityId = data.city_id;
  let resolvedCountryId = data.country_id;

  if (data.city_id && (data.city_id.startsWith('custom:') || !data.city_id.startsWith('city-'))) {
    const rawCityName = data.city_id.replace(/^custom:/, '');
    const cityObj = await db.cities.findOrCreateByName(rawCityName, resolvedCountryId, data.latitude, data.longitude);
    resolvedCityId = cityObj.id;
  }

  // 6. Duplicate Event Detection
  const existingEvents = await db.events.findAllAdmin();
  const dupCheck = detectDuplicateEvent(
    {
      title: data.title,
      date: data.date,
      city_id: resolvedCityId,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    existingEvents
  );

  // 7. Save to Database
  const newEvent = await db.events.create({
    slug,
    title: data.title,
    title_ar: data.title_ar,
    title_de: data.title_de,
    title_fr: data.title_fr,
    description: data.description,
    description_ar: data.description_ar,
    description_de: data.description_de,
    description_fr: data.description_fr,
    category_id: data.category_id,
    date: data.date,
    start_time: data.start_time,
    end_time: data.end_time || null,
    timezone: data.timezone,
    country_id: resolvedCountryId,
    city_id: resolvedCityId,
    full_address: data.full_address,
    postal_code: data.postal_code || null,
    street: data.street || null,
    house_number: data.house_number || null,
    latitude: data.latitude,
    longitude: data.longitude,
    google_maps_url,
    organization_id: data.organization_id || null,
    organizer_name: data.organizer_name || null,
    poster_url: data.poster_url || null,
    status,
    visibility,
    event_verification_status: verificationStatus,
    is_demo: true,
    is_featured: false,
    source_url: data.source_url || null,
    contact_email: data.contact_email || null,
    contact_phone: data.contact_phone || null,
    official_website: data.official_website || null,
    created_by: userContext?.id || 'anonymous-user',
  });

  // 8. Audit Log
  await logAuditEvent({
    actor_id: userContext?.id || 'anonymous',
    actor_email: userContext?.email,
    actor_role: userContext?.role || 'user',
    action: status === 'published' ? 'EVENT_DIRECT_PUBLISHED' : 'EVENT_SUBMITTED_FOR_REVIEW',
    entity_type: 'event',
    entity_id: newEvent.id,
    reason: status === 'published' ? 'Direct publishing permitted' : 'Public submission awaiting admin approval',
    new_values: { title: newEvent.title, status, date: newEvent.date },
  });

  // 9. Notifications
  if (status === 'pending') {
    await NotificationService.notifyAdmins(
      'New Event Submitted for Review',
      `"${newEvent.title}" was submitted and is awaiting moderation.`,
      '/admin/submissions'
    );
  }

  return {
    success: true,
    event: newEvent,
    isPublishedDirectly: status === 'published',
    potentialDuplicateWarning: dupCheck.isPotentialDuplicate ? dupCheck.reasons.join(', ') : null,
  };
}

export async function updateEventAction(
  eventId: string,
  formData: Partial<EventItem>,
  userContext: { id: string; role: UserRole; email: string }
) {
  const existing = await db.events.findById(eventId);
  if (!existing) {
    return { success: false, error: 'Event not found.' };
  }

  const isAdmin = userContext.role === 'super_admin' || userContext.role === 'admin';
  const isPublished = existing.status === 'published';

  // 1. IDOR & Ownership Authorization Check
  if (!isAdmin) {
    const isCreator = existing.created_by === userContext.id;
    let isOrgMember = false;
    if (existing.organization_id) {
      isOrgMember = await db.organizations.isMember(existing.organization_id, userContext.id);
    }

    if (!isCreator && !isOrgMember) {
      return { success: false, error: 'Unauthorized: You do not have permission to edit this event.' };
    }
  }

  // 2. Mass Assignment Protection: Strip lifecycle and security fields for non-admins
  const safeData: Partial<EventItem> = { ...formData };
  if (!isAdmin) {
    delete safeData.status;
    delete safeData.visibility;
    delete safeData.event_verification_status;
    delete safeData.is_demo;
    delete safeData.created_by;
    delete safeData.deleted_at;
  }

  // Check for sensitive field changes: date, time, timezone, location, full_address, coordinates, title
  const sensitiveFields: (keyof EventItem)[] = [
    'date',
    'start_time',
    'end_time',
    'timezone',
    'full_address',
    'latitude',
    'longitude',
    'title',
    'organization_id',
    'source_url',
  ];

  const changedSensitiveFields = sensitiveFields.filter(
    (field) => safeData[field] !== undefined && safeData[field] !== existing[field]
  );

  // If non-admin modifies a published event's sensitive fields -> create pending change review
  if (isPublished && !isAdmin && changedSensitiveFields.length > 0) {
    const pendingChange = await db.events.submitPendingChange({
      event_id: eventId,
      proposed_data: safeData,
      changed_fields: changedSensitiveFields as string[],
      submitted_by: userContext.id,
      status: 'pending',
      admin_notes: null,
    });

    await logAuditEvent({
      actor_id: userContext.id,
      actor_email: userContext.email,
      actor_role: userContext.role,
      action: 'EVENT_SENSITIVE_CHANGE_PROPOSED',
      entity_type: 'event',
      entity_id: eventId,
      reason: `Proposed modifications to sensitive fields: ${changedSensitiveFields.join(', ')}`,
      previous_values: existing as unknown as Record<string, unknown>,
      new_values: safeData as Record<string, unknown>,
    });

    await NotificationService.notifyAdmins(
      'Pending Event Sensitive Change Request',
      `Changes proposed for published event "${existing.title}".`,
      '/admin/pending-changes'
    );

    return {
      success: true,
      pendingReview: true,
      requiresReview: true,
      pendingChangeId: pendingChange.id,
      message:
        'Your requested changes to sensitive fields (date, time, or location) have been submitted for administrator review. The current published version remains visible in the meantime.',
    };
  }

  // Direct update by admin or non-sensitive update
  const updated = await db.events.update(eventId, safeData);

  await logAuditEvent({
    actor_id: userContext.id,
    actor_email: userContext.email,
    actor_role: userContext.role,
    action: 'EVENT_UPDATED',
    entity_type: 'event',
    entity_id: eventId,
    previous_values: existing as unknown as Record<string, unknown>,
    new_values: safeData as Record<string, unknown>,
  });

  return {
    success: true,
    event: updated,
  };
}

export async function cancelEventAction(eventId: string, reason: string, userContext: { id: string; role: UserRole; email: string }) {
  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A valid reason is required to cancel an event.' };
  }

  const event = await db.events.findById(eventId);
  if (!event) return { success: false, error: 'Event not found.' };

  const isAdmin = userContext.role === 'super_admin' || userContext.role === 'admin';
  if (!isAdmin) {
    const isCreator = event.created_by === userContext.id;
    let isOrgMember = false;
    if (event.organization_id) {
      isOrgMember = await db.organizations.isMember(event.organization_id, userContext.id);
    }
    if (!isCreator && !isOrgMember) {
      return { success: false, error: 'Unauthorized: You do not have permission to cancel this event.' };
    }
  }

  await db.events.update(eventId, { status: 'cancelled' });

  await logAuditEvent({
    actor_id: userContext.id,
    actor_email: userContext.email,
    actor_role: userContext.role,
    action: 'EVENT_CANCELLED',
    entity_type: 'event',
    entity_id: eventId,
    reason,
    previous_values: { status: event.status },
    new_values: { status: 'cancelled' },
  });

  return { success: true };
}

export async function softDeleteEventAction(eventId: string, reason: string, userContext: { id: string; role: UserRole; email: string }) {
  if (userContext.role !== 'super_admin' && userContext.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Only administrators can soft delete events.' };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A valid administrative reason is required for deletion.' };
  }

  await db.events.softDelete(eventId);

  await logAuditEvent({
    actor_id: userContext.id,
    actor_email: userContext.email,
    actor_role: userContext.role,
    action: 'EVENT_SOFT_DELETED',
    entity_type: 'event',
    entity_id: eventId,
    reason,
  });

  return { success: true };
}
