'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { Country, City } from '@/types/database';
import { Globe2, MapPin, Search } from 'lucide-react';

interface Props {
  countries: Country[];
  cities: City[];
}

export function AdminCountriesClient({ countries, cities }: Props) {
  const { t, isRtl } = useAdminLanguage();
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name_ar.includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'الدول والمدن والمناطق الجغرافية' : 'Countries, Cities & Diaspora Hubs'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'المواقع الجغرافية المفهرسة ومراكز التواجد الإيزيدي حول العالم مع المناطق الزمنية IANA.'
              : 'Indexed geographical locations and default IANA time zones.'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
          {cities.length} {isRtl ? 'مدينة مسجلة' : 'Registered Cities'}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          placeholder={isRtl ? 'البحث عن دولة أو رمز دولة...' : 'Search countries or ISO codes...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
            isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCountries.map((c) => {
          const countryCities = cities.filter((ct) => ct.country_id === c.id);
          return (
            <div key={c.id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isRtl ? c.name_ar : c.name_en}</span>
                  <span className="text-slate-400 text-xs font-normal">({isRtl ? c.name_en : c.name_ar})</span>
                </h3>
                <span className="font-mono text-xs text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  {c.code}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-semibold block">
                  {isRtl ? 'المدن والمراكز المسجلة:' : 'Cities & Hubs:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {countryCities.length === 0 ? (
                    <span className="text-xs text-slate-500">
                      {isRtl ? 'يتم إضافة المدن تلقائياً عند إدراج الفعاليات' : 'Cities auto-indexed on event addition'}
                    </span>
                  ) : (
                    countryCities.map((ct) => (
                      <div key={ct.id} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        <span className="font-semibold text-white">{isRtl ? (ct.name_ar || ct.name_en) : ct.name_en}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {ct.latitude ? `${ct.latitude.toFixed(2)}, ${ct.longitude.toFixed(2)}` : 'GPS'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
