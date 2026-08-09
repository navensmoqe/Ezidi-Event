import React from 'react';
import { db } from '@/lib/db';
import { OrgAddEventClientForm } from './OrgAddEventClientForm';
import { PlusCircle, ShieldCheck } from 'lucide-react';

export default async function OrgCreateEventPage() {
  const categories = await db.categories.getAll();
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();
  const organizations = await db.organizations.findVerifiedPublic();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-amber-400" />
          <span>Publish New Organization Event</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Events submitted by verified organizations with direct publishing privileges are immediately published to the live directory.
        </p>
      </div>

      <OrgAddEventClientForm
        categories={categories}
        countries={countries}
        cities={cities}
        organizations={organizations}
      />
    </div>
  );
}
