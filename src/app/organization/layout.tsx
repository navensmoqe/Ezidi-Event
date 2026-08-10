import React from 'react';
import { db } from '@/lib/db';
import '@/app/globals.css';
import { OrgLanguageProvider } from '@/components/organization/OrgLanguageProvider';
import { OrgSidebarClient } from '@/components/organization/OrgSidebarClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allOrgs = await db.organizations.findAllAdmin();

  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#070A10] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <OrgLanguageProvider>
          <div className="min-h-screen bg-[#070A10] text-white flex flex-col md:flex-row">
            {/* Multilingual Organization Sidebar */}
            <OrgSidebarClient initialOrganizations={allOrgs} />

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
              {children}
            </main>
          </div>
        </OrgLanguageProvider>
      </body>
    </html>
  );
}
