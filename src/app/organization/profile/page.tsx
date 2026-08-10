import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';
import { OrgProfileClient } from './OrgProfileClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'ملف المنظمة | Organization Profile',
};

export default async function OrgProfilePage() {
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

  return <OrgProfileClient organization={currentOrg} />;
}
