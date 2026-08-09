import { AuditLog, UserRole } from '@/types/database';
import { db } from '@/lib/db';

export interface AuditLogEntry {
  actor_id: string;
  actor_email?: string;
  actor_role: UserRole;
  action: string;
  entity_type: 'event' | 'organization' | 'user' | 'report' | 'category' | 'auth';
  entity_id: string;
  reason?: string | null;
  previous_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
}

// GDPR sanitization: Redact sensitive secrets, passwords, OTPs from audit payloads
function sanitizeAuditPayload(data?: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!data) return null;
  const sanitized = { ...data };
  const sensitiveKeys = ['password', 'totp_secret', 'secret', 'backup_codes', 'token', 'key'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<AuditLog> {
  const logRecord: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actor_id: entry.actor_id,
    actor_email: entry.actor_email,
    actor_role: entry.actor_role,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    reason: entry.reason || null,
    previous_values: sanitizeAuditPayload(entry.previous_values),
    new_values: sanitizeAuditPayload(entry.new_values),
    ip_address: entry.ip_address || null,
    created_at: new Date().toISOString(),
  };

  await db.audit.create(logRecord);
  return logRecord;
}
