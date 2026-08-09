import React from 'react';
import { db } from '@/lib/db';
import { Globe2, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Countries & Cities | Admin Dashboard',
};

export default async function AdminCountriesPage() {
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Globe2 className="w-6 h-6 text-amber-400" />
          <span>Countries, Cities & Diaspora Hubs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Indexed geographical locations and default IANA time zones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {countries.map((c) => {
          const countryCities = cities.filter((ct) => ct.country_id === c.id);
          return (
            <div key={c.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{c.name_en}</span>
                  <span className="font-arabic text-amber-200 text-xs" dir="rtl">{c.name_ar}</span>
                </h3>
                <span className="font-mono text-xs text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  {c.code}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">Cities:</span>
                <div className="flex flex-wrap gap-2">
                  {countryCities.map((ct) => (
                    <div key={ct.id} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span className="font-semibold text-white">{ct.name_en}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">{ct.timezone || `${ct.latitude.toFixed(2)}, ${ct.longitude.toFixed(2)}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
