import React from 'react';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { EventsDirectoryClient } from './EventsDirectoryClient';

export const metadata = {
  title: 'Global Events Directory | Ezidi Events Worldwide',
  description: 'Search and filter verified Ezidi demonstrations, memorial conferences, and community gatherings worldwide.',
};

export default async function EventsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams?: {
    category?: string;
    country?: string;
    city?: string;
    status?: string;
    search?: string;
    sort?: string;
  };
}) {
  const t = await getTranslations({ locale, namespace: 'events' });

  // Security Rule: Public query strictly fetches published public non-deleted events
  const initialEvents = await db.events.findPublicEvents({
    category: searchParams?.category,
    country: searchParams?.country,
    city: searchParams?.city,
    status: searchParams?.status,
    search: searchParams?.search,
    sort: (searchParams?.sort as any) || 'upcoming',
  });

  const categories = await db.categories.getAll();
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('directoryTitle')}
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          {t('directorySubtitle')}
        </p>
      </div>

      {/* Interactive Directory Client */}
      <EventsDirectoryClient
        initialEvents={initialEvents}
        categories={categories}
        countries={countries}
        cities={cities}
      />
    </div>
  );
}
