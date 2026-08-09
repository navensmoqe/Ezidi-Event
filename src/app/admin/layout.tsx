import React from 'react';
import { db } from '@/lib/db';
import '@/app/globals.css';
import { AdminLanguageProvider } from '@/components/admin/AdminLanguageProvider';
import { AdminSidebarClient } from '@/components/admin/AdminSidebarClient';

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
          <div className="min-h-screen bg-[#070A10] text-white flex flex-col md:flex-row">
            {/* Multilingual Admin Sidebar with Arabic RTL toggle */}
            <AdminSidebarClient
              pendingSubmissionsCount={pendingSubmissions.length}
              pendingChangesCount={pendingChanges.length}
              pendingOrgsCount={pendingOrgs.length}
              openReportsCount={openReports.length}
            />

            {/* Main Admin Area */}
            <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
              {children}
            </main>
          </div>
        </AdminLanguageProvider>
      </body>
    </html>
  );
}

