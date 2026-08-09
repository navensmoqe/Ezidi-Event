import React from 'react';
import { db } from '@/lib/db';
import { AdminAuditLogsClient } from './AdminAuditLogsClient';

export const metadata = {
  title: 'سجل التدقيق الأمني | Audit Trail',
};

export default async function AdminAuditLogsPage() {
  const auditLogs = await db.audit.getAll(50);

  return <AdminAuditLogsClient auditLogs={auditLogs} />;
}
