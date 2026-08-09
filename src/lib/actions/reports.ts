'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { logAuditEvent } from '@/lib/services/audit';
import { NotificationService } from '@/lib/services/notifications';
import { ReportType, UserRole } from '@/types/database';

const reportSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  report_type: z.enum([
    'incorrect_information',
    'wrong_date',
    'wrong_location',
    'cancelled_event',
    'postponed_event',
    'fake_event',
    'duplicate_event',
    'misleading_information',
    'spam',
    'abuse',
    'other',
  ]),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  reporter_name: z.string().optional(),
  reporter_email: z.string().email().optional().or(z.literal('')),
  evidence_url: z.string().url().optional().or(z.literal('')),
});

export async function submitReportAction(formData: unknown, userContext?: { id: string; email: string }) {
  const rateLimitKey = userContext?.id || userContext?.email || 'anon-reporter';
  const rateCheck = await checkRateLimit(rateLimitKey, 'COMMUNITY_REPORT');
  if (!rateCheck.success) {
    return {
      success: false,
      error: 'Community report submission limit reached (5 per hour). Thank you for helping keep the directory accurate.',
    };
  }

  const parsed = reportSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid report data.',
    };
  }

  const data = parsed.data;
  const event = await db.events.findById(data.event_id);
  if (!event) return { success: false, error: 'Reported event does not exist.' };

  const report = await db.reports.create({
    event_id: data.event_id,
    report_type: data.report_type as ReportType,
    description: data.description,
    reporter_name: data.reporter_name || null,
    reporter_email: data.reporter_email || null,
    evidence_url: data.evidence_url || null,
  });

  await logAuditEvent({
    actor_id: userContext?.id || 'anonymous',
    actor_email: userContext?.email,
    actor_role: 'user',
    action: 'COMMUNITY_REPORT_SUBMITTED',
    entity_type: 'report',
    entity_id: report.id,
    new_values: { event_id: data.event_id, report_type: data.report_type },
  });

  await NotificationService.notifyAdmins(
    'New Community Event Report Filed',
    `Report filed regarding "${event.title}": ${data.report_type}.`,
    '/admin/reports'
  );

  return { success: true };
}

export async function resolveReportAction(
  reportId: string,
  status: 'resolved' | 'dismissed',
  resolutionNotes: string,
  adminContext: { id: string; role: UserRole; email: string }
) {
  if (!['super_admin', 'admin', 'moderator'].includes(adminContext.role)) {
    return { success: false, error: 'Unauthorized.' };
  }

  const success = await db.reports.updateStatus(reportId, status, resolutionNotes, adminContext.id);
  if (!success) return { success: false, error: 'Report not found.' };

  await logAuditEvent({
    actor_id: adminContext.id,
    actor_email: adminContext.email,
    actor_role: adminContext.role,
    action: status === 'resolved' ? 'REPORT_RESOLVED' : 'REPORT_DISMISSED',
    entity_type: 'report',
    entity_id: reportId,
    reason: resolutionNotes,
  });

  return { success: true };
}
