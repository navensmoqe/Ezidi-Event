import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';
import { OrgSettingsClient } from './OrgSettingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'إعدادات الحساب | Organization Settings',
};

export default async function OrgSettingsPage() {
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

  return <OrgSettingsClient organization={currentOrg} />;
}
