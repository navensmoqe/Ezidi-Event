import React from 'react';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { AddEventClientForm } from './AddEventClientForm';
import { PlusCircle, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Submit an Ezidi Event | Ezidi Events Worldwide',
  description: 'Submit an event to the global directory for verification and publishing.',
};

export default async function AddEventPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'addEvent' });

  const categories = await db.categories.getAll();
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();
  const organizations = await db.organizations.findVerifiedPublic();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <PlusCircle className="w-4 h-4" />
          <span>Global Submission Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Moderation Review Notice */}
      <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-amber-300">Public Visibility Rule</span>
          <p className="text-slate-300 text-xs leading-relaxed">
            {t('moderationNotice')} Verified organizations with direct publishing privileges will be published immediately upon submission.
          </p>
        </div>
      </div>

      {/* Submission Form */}
      <AddEventClientForm
        categories={categories}
        countries={countries}
        cities={cities}
        organizations={organizations}
      />
    </div>
  );
}
