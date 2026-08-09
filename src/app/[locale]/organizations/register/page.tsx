import React from 'react';
import { db } from '@/lib/db';
import { OrgRegisterClientForm } from './OrgRegisterClientForm';
import { Building2, ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Register Organization | Ezidi Events Worldwide',
  description: 'Apply for official organization verification to publish verified Ezidi events worldwide.',
};

export default async function OrgRegisterPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Organization Registry</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Register Your Organization
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Non-profit organizations, associations, cultural centers, and human-rights institutions can register to manage and publish verified Ezidi community events.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Private Verification Pipeline</span>
          <p className="text-slate-400 text-xs leading-relaxed">
            All submitted registration documents and evidence are stored in secure private storage and reviewed exclusively by platform administrators. Organizations start in a pending verification state.
          </p>
        </div>
      </div>

      <OrgRegisterClientForm countries={countries} cities={cities} />
    </div>
  );
}
