import React from 'react';
import { db } from '@/lib/db';
import { OrgDashboardClient } from './OrgDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'لوحة تحكم المنظمة | Organization Dashboard',
};

export default async function OrgDashboardPage() {
  const allOrgs = await db.organizations.findAllAdmin();
  const allEvents = await db.events.findAllAdmin();
  const pendingChanges = await db.events.getPendingChanges();

  return (
    <OrgDashboardClient
      initialOrganizations={allOrgs}
      allEvents={allEvents}
      pendingChanges={pendingChanges}
    />
  );
}
