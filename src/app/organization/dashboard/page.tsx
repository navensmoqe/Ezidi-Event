import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';
import { OrgDashboardClient } from './OrgDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'لوحة تحكم المنظمة | Organization Dashboard',
};

export default async function OrgDashboardPage() {
  const session = await getCurrentUserSession();
  if (!session) {
    redirect('/organization/login');
  }

  let currentOrg = null;
  if (session.organizationId) {
    currentOrg = await db.organizations.findById(session.organizationId);
  }
  if (!currentOrg && session.email) {
    currentOrg = await db.organizations.findByEmail(session.email);
  }
  if (!currentOrg && ['super_admin', 'admin'].includes(session.role)) {
    const all = await db.organizations.findAllAdmin();
    currentOrg = all[0] || null;
  }

  if (!currentOrg) {
    redirect('/organization/login');
  }

  const allEvents = await db.events.findAllAdmin();
  const orgEvents = allEvents.filter((e) => e.organization_id === currentOrg.id);
  const pendingChanges = await db.events.getPendingChanges();

  return (
    <OrgDashboardClient
      organization={currentOrg}
      orgEvents={orgEvents}
      pendingChanges={pendingChanges}
    />
  );
}
