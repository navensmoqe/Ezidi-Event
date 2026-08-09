import React from 'react';
import { db } from '@/lib/db';
import { AdminReportsClient } from './AdminReportsClient';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Community Reports Triage | Admin Dashboard',
};

export default async function AdminReportsPage() {
  const reports = await db.reports.getAllAdmin();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <span>Community Reports Triage</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review community reports regarding inaccurate dates, wrong locations, cancellations, or duplicates. Reporter identity is kept strictly private.
        </p>
      </div>

      <AdminReportsClient initialReports={reports} />
    </div>
  );
}
