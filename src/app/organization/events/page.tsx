import React from 'react';
import { db } from '@/lib/db';
import { OrgEventsClient } from './OrgEventsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'فعاليات المنظمة | Organization Events',
};

export default async function OrgEventsPage() {
  const allOrgs = await db.organizations.findAllAdmin();
  const allEvents = await db.events.findAllAdmin();

  return (
    <OrgEventsClient
      initialOrganizations={allOrgs}
      allEvents={allEvents}
    />
  );
}
