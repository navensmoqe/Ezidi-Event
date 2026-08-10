import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';
import '@/app/globals.css';
import { OrgLanguageProvider } from '@/components/organization/OrgLanguageProvider';
import { OrgSidebarClient } from '@/components/organization/OrgSidebarClient';
import { Organization } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  let currentOrg: Organization | null = null;

  if (session) {
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
  }

  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#070A10] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <OrgLanguageProvider>
          {currentOrg ? (
            <div className="min-h-screen bg-[#070A10] text-white flex flex-col md:flex-row">
              {/* Authenticated Organization Sidebar */}
              <OrgSidebarClient organization={currentOrg} />

              {/* Main Content Area */}
              <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
                {children}
              </main>
            </div>
          ) : (
            // Full Screen (e.g. /organization/login when unauthenticated)
            <div className="min-h-screen bg-[#070A10] text-white">
              {children}
            </div>
          )}
        </OrgLanguageProvider>
      </body>
    </html>
  );
}
