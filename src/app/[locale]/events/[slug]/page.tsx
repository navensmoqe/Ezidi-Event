import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { formatEventDateTime } from '@/lib/utils/timezone';
import { EventVerificationBadge } from '@/components/ui/EventVerificationBadge';
import { EventJsonLd } from '@/components/events/EventJsonLd';
import { EventDetailClientActions } from './EventDetailClientActions';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Share2,
  FileText,
  Mail,
  Phone,
} from 'lucide-react';

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const event = await db.events.findPublicBySlug(slug);
  if (!event) return { title: 'Event Not Found | Ezidi Events Worldwide' };

  return {
    title: `${event.title} | Ezidi Events Worldwide`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.poster_url ? [{ url: event.poster_url }] : [],
    },
  };
}

export default async function EventDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations({ locale, namespace: 'events' });
  const common = await getTranslations({ locale, namespace: 'common' });

  // Security Rule: Return generic 404 for unpublished, private, or non-existent events
  const event = await db.events.findPublicBySlug(slug);
  if (!event) {
    notFound();
  }

  const { formattedDate, formattedTime, timeZoneAbbr } = formatEventDateTime(
    event.date,
    event.start_time,
    event.timezone,
    locale
  );

  const fallbackPoster =
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&h=800&fit=crop';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Schema.org Structured Data */}
      <EventJsonLd event={event} />

      {/* Top Banner / Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Events</span>
          <span>/</span>
          <span className="text-amber-400 font-medium">{event.city?.name_en}</span>
          <span>/</span>
          <span className="truncate max-w-xs text-slate-300">{event.title}</span>
        </div>

        <EventVerificationBadge
          status={event.status}
          verificationStatus={event.event_verification_status}
          size="md"
        />
      </div>

      {/* Main Grid: Left Column (Poster + Content) | Right Column (Sticky Venue & Organizer Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Poster Image */}
          <div className="relative w-full h-72 sm:h-96 md:h-[450px] rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl bg-slate-950">
            <Image
              src={event.poster_url || fallbackPoster}
              alt={event.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>

          {/* Title & Category */}
          <div className="space-y-4">
            {event.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30">
                {locale === 'ar'
                  ? event.category.name_ar
                  : locale === 'de'
                  ? event.category.name_de
                  : locale === 'fr'
                  ? event.category.name_fr
                  : event.category.name_en}
              </span>
            )}

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {event.title}
            </h1>

            {event.title_ar && locale !== 'ar' && (
              <p className="text-lg font-arabic text-amber-200/80 leading-normal" dir="rtl">
                {event.title_ar}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Program & Event Description</span>
            </h2>
            <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
              {event.description}
            </div>
          </div>

          {/* Public Sources & Evidence */}
          {event.sources && event.sources.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{t('sourcesTitle')}</span>
              </h3>
              <div className="space-y-3">
                {event.sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{src.source_title}</h4>
                      <p className="text-xs text-slate-400">
                        {src.source_organization || 'Official Source'} • {src.source_type}
                      </p>
                    </div>
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
                    >
                      <span>View Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Venue, Date/Time, Organizer & Actions) */}
        <div className="space-y-6">
          {/* Key Facts Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6 sticky top-24">
            {/* Date & Time */}
            <div className="space-y-3 pb-5 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-medium">Date</span>
                  <span className="text-base font-bold text-white">{formattedDate}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="block text-xs text-slate-400 font-medium">{t('localTime')}</span>
                  <span className="text-base font-bold text-amber-300">
                    {formattedTime} <span className="text-xs text-slate-400">({timeZoneAbbr})</span>
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500">
                    IANA: {event.timezone}
                  </span>
                </div>
              </div>
            </div>

            {/* Venue & Location Address */}
            <div className="space-y-4 pb-5 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="block text-xs text-slate-400 font-medium">{t('location')}</span>
                  <span className="text-sm font-semibold text-white leading-snug block">
                    {event.full_address}
                  </span>
                  <span className="block text-xs text-slate-400 font-mono">
                    {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Dynamic Google Maps Button */}
              <a
                href={event.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-sm font-bold border border-slate-700 transition-all shadow-md hover:scale-[1.02]"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>📍 {common('openInGoogleMaps')}</span>
              </a>
            </div>

            {/* Organizer Card */}
            <div className="space-y-3 pb-5 border-b border-slate-800">
              <span className="block text-xs text-slate-400 font-medium">{t('organizer')}</span>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-sm font-bold text-white block truncate">
                    {event.organization?.name || event.organizer_name || 'Community Organizer'}
                  </span>
                  {event.organization?.verification_status === 'verified' && (
                    <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Organization</span>
                    </span>
                  )}
                </div>
              </div>

              {event.contact_email && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <a href={`mailto:${event.contact_email}`} className="hover:text-amber-300 truncate">
                    {event.contact_email}
                  </a>
                </div>
              )}
            </div>

            {/* Interactive Client Actions: Share & Report Modal Trigger */}
            <EventDetailClientActions event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
