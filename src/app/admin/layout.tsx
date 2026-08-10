import React from 'react';
import { db } from '@/lib/db';
import '@/app/globals.css';
import { AdminLanguageProvider } from '@/components/admin/AdminLanguageProvider';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allEvents = await db.events.findAllAdmin();
  const pendingSubmissions = allEvents.filter((e) => e.status === 'pending');
  const pendingChanges = await db.events.getPendingChanges();
  const allOrgs = await db.organizations.findAllAdmin();
  const pendingOrgs = allOrgs.filter((o) => o.verification_status === 'pending');
  const allReports = await db.reports.getAllAdmin();
  const openReports = allReports.filter((r) => r.status === 'open');

  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#070A10] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <AdminLanguageProvider>
          <AdminLayoutShell
            pendingSubmissionsCount={pendingSubmissions.length}
            pendingChangesCount={pendingChanges.length}
            pendingOrgsCount={pendingOrgs.length}
            openReportsCount={openReports.length}
          >
            {children}
          </AdminLayoutShell>
        </AdminLanguageProvider>
      </body>
    </html>
  );
}
