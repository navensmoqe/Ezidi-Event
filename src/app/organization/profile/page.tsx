import React from 'react';
import { db } from '@/lib/db';
import { OrgProfileClient } from './OrgProfileClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'ملف المنظمة | Organization Profile',
};

export default async function OrgProfilePage() {
  const allOrgs = await db.organizations.findAllAdmin();

  return <OrgProfileClient initialOrganizations={allOrgs} />;
}
