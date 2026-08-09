import React from 'react';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { isDemoMode } from '@/lib/config/env';
import { EventCard } from '@/components/events/EventCard';
import { EventMap } from '@/components/maps/EventMap';
import { Link } from '@/i18n/routing';
import {
  Calendar,
  MapPin,
  Building2,
  Globe2,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const heroT = await getTranslations({ locale, namespace: 'hero' });
  const statsT = await getTranslations({ locale, namespace: 'stats' });
  const common = await getTranslations({ locale, namespace: 'common' });

  // Security Rule: Public queries retrieve strictly published, public, non-deleted records
  const publishedEvents = await db.events.findPublicEvents();
  const statistics = await db.events.getPublicStatistics();
  const verifiedOrgs = await db.organizations.findVerifiedPublic();

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = publishedEvents.filter((e) => e.date >= today).slice(0, 6);
  const todayEvents = publishedEvents.filter((e) => e.date === today);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="w-full bg-amber-950/70 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2 text-center">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{common('demoModeBanner')}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide shadow-sm animate-in fade-in zoom-in-95">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Documenting & Uniting the Global Ezidi Diaspora</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            <span className="text-gold-gradient block">EZIDI EVENTS</span>
            <span>WORLDWIDE</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            {heroT('subtitle')}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/events"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{heroT('ctaPrimary')}</span>
            </Link>

            <Link
              href="/map"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base border border-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{heroT('ctaSecondary')}</span>
            </Link>

            <Link
              href="/events/add"
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-semibold text-sm sm:text-base border border-amber-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>{heroT('ctaSubmit')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400">
              {statsT('title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-slate-800/80">
            <div className="space-y-1">
              <span className="text-3xl sm:text-5xl font-black text-white font-mono">
                {statistics.totalPublishedEvents}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {statsT('publishedEvents')}
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <span className="text-3xl sm:text-5xl font-black text-amber-400 font-mono">
                {statistics.totalCountries}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {statsT('countries')}
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <span className="text-3xl sm:text-5xl font-black text-white font-mono">
                {statistics.totalCities}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {statsT('cities')}
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <span className="text-3xl sm:text-5xl font-black text-amber-400 font-mono">
                {statistics.verifiedOrganizations}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {statsT('verifiedOrgs')}
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0 col-span-2 md:col-span-1">
              <span className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">
                {statistics.upcomingEventsCount}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                {statsT('upcoming')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Today (If Any) */}
      {todayEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-500 pl-4 rtl:pl-0 rtl:pr-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('todayTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayEvents.map((event) => (
              <EventCard key={event.id} event={event} featured={true} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Published Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('upcomingTitle')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t('upcomingSubtitle')}
            </p>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>{t('viewAllEvents')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Interactive World Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('mapSectionTitle')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t('mapSectionSubtitle')}
            </p>
          </div>
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Open Fullscreen Map</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <EventMap events={publishedEvents} height="480px" />
      </section>

      {/* Featured Verified Organizations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('orgsTitle')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t('orgsSubtitle')}
            </p>
          </div>
          <Link
            href="/organizations"
            className="flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>{t('viewAllOrgs')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedOrgs.slice(0, 3).map((org) => (
            <div
              key={org.id}
              className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>✓ Verified Organization</span>
                  </div>
                  {org.direct_publishing_enabled && (
                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Direct Publishing
                    </span>
                  )}
                </div>

                <Link href={`/organizations/${org.slug}`}>
                  <h3 className="text-lg font-bold text-white hover:text-amber-300 transition-colors">
                    {org.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {org.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{org.full_address.split(',')[0]}</span>
                </div>

                <Link
                  href={`/organizations/${org.slug}`}
                  className="font-semibold text-amber-400 hover:text-amber-300"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
