import React from 'react';
import { db } from '@/lib/db';
import { Link } from '@/i18n/routing';
import { Globe2, MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Countries & Diaspora Hubs | Ezidi Events Worldwide',
  description: 'Explore Ezidi diaspora communities and verified events across countries and cities worldwide.',
};

export default async function CountriesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();
  const publishedEvents = await db.events.findPublicEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-amber-400" />
          <span>Global Countries & Diaspora Hubs</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
          Discover verified events, community solidarity rallies, and memorial gatherings indexed by country and city.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => {
          const countryCities = cities.filter((c) => c.country_id === country.id);
          const countryEvents = publishedEvents.filter((e) => e.country_id === country.id);

          return (
            <div
              key={country.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/40">
                    {country.code}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {countryEvents.length} Events Listed
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {locale === 'ar' ? country.name_ar : country.name_en}
                  </h2>
                  {country.name_ar && locale !== 'ar' && (
                    <span className="text-xs text-slate-500 font-arabic block mt-0.5">
                      {country.name_ar}
                    </span>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    Indexed Cities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {countryCities.map((ct) => (
                      <span
                        key={ct.id}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-xs border border-slate-800"
                      >
                        {ct.name_en}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={`/events?country=${country.code}`}
                className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors"
              >
                <span>View {country.name_en} Events</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
