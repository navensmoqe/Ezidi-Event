import React from 'react';
import { db } from '@/lib/db';
import { AdminSubmissionsClient } from './AdminSubmissionsClient';
import { Inbox } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'طابور مراجعة الطلبات الجديدة | Submissions & Registrations Queue',
};

export default async function AdminSubmissionsPage() {
  const allEvents = await db.events.findAllAdmin();
  const pendingEvents = allEvents.filter((e) => e.status === 'pending');

  const allOrgs = await db.organizations.findAllAdmin();
  const pendingOrgs = allOrgs.filter((o) => o.verification_status === 'pending');

  return (
    <div className="space-y-6">
      <AdminSubmissionsClient
        initialEvents={pendingEvents}
        allEvents={allEvents}
        initialOrganizations={pendingOrgs}
      />
    </div>
  );
}
