import React from 'react';
import { db } from '@/lib/db';
import { AdminOrgsClient } from './AdminOrgsClient';
import { Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Organization Verification & Direct Publishing | Admin Dashboard',
};

export default async function AdminOrganizationsPage() {
  const organizations = await db.organizations.findAllAdmin();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-amber-400" />
          <span>Organization Verification & Direct Publishing Control</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify registered NGOs, suspend organizations upon violations, and exclusively control direct publishing permissions.
        </p>
      </div>

      <AdminOrgsClient initialOrganizations={organizations} />
    </div>
  );
}
