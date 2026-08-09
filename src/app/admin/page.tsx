import React from 'react';
import { db } from '@/lib/db';
import { AdminOverviewClient } from './AdminOverviewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOverviewPage() {
  const allEvents = await db.events.findAllAdmin();
  const publishedEvents = allEvents.filter((e) => e.status === 'published');
  const pendingSubmissions = allEvents.filter((e) => e.status === 'pending');
  const pendingChanges = await db.events.getPendingChanges();

  const allOrgs = await db.organizations.findAllAdmin();
  const verifiedOrgs = allOrgs.filter((o) => o.verification_status === 'verified');
  const pendingOrgs = allOrgs.filter((o) => o.verification_status === 'pending');

  const allReports = await db.reports.getAllAdmin();
  const openReports = allReports.filter((r) => r.status === 'open');

  const recentAudits = await db.audit.getAll(6);

  return (
    <AdminOverviewClient
      publishedEventsCount={publishedEvents.length}
      pendingSubmissions={pendingSubmissions}
      pendingChanges={pendingChanges}
      verifiedOrgsCount={verifiedOrgs.length}
      pendingOrgs={pendingOrgs}
      allOrgs={allOrgs}
      openReports={openReports}
      recentAudits={recentAudits}
    />
  );
}
