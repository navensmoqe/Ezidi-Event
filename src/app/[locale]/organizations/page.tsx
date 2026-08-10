import React from 'react';
import { db } from '@/lib/db';
import { OrganizationsDirectoryClient } from '@/components/organizations/OrganizationsDirectoryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Verified Organizations | Ezidi Events Worldwide',
  description: 'Explore verified Ezidi community organizations, cultural centers, and human-rights associations.',
};

export default async function OrganizationsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const verifiedOrgs = await db.organizations.findVerifiedPublic();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <OrganizationsDirectoryClient
        initialOrganizations={verifiedOrgs}
        locale={locale}
      />
    </div>
  );
}
