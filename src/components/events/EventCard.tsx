'use client';

import React from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { EventItem } from '@/types/database';
import { EventVerificationBadge } from '@/components/ui/EventVerificationBadge';
import { formatEventDateTime } from '@/lib/utils/timezone';
import { Calendar, MapPin, Building2, ExternalLink, Clock } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const locale = useLocale();

  // Localized title & description fallback
  const title =
    locale === 'ar' && event.title_ar
      ? event.title_ar
      : locale === 'de' && event.title_de
      ? event.title_de
      : locale === 'fr' && event.title_fr
      ? event.title_fr
      : event.title;

  const { formattedDate, formattedTime, timeZoneAbbr } = formatEventDateTime(
    event.date,
    event.start_time,
    event.timezone,
    locale
  );

  const fallbackPoster =
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&h=600&fit=crop';

  return (
    <div
      className={`group relative rounded-2xl glass-card overflow-hidden flex flex-col justify-between border border-slate-800/90 ${
        featured ? 'ring-1 ring-amber-500/40 shadow-glass-gold' : ''
      }`}
    >
      {/* Top Image / Poster */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-900">
        <Image
          src={event.poster_url || fallbackPoster}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Verification Status Badge */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
          <EventVerificationBadge
            status={event.status}
            verificationStatus={event.event_verification_status}
            size="sm"
          />
        </div>

        {/* Category Pill */}
        {event.category && (
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 text-xs font-semibold border border-amber-500/30 backdrop-blur-md">
              {locale === 'ar'
                ? event.category.name_ar
                : locale === 'de'
                ? event.category.name_de
                : locale === 'fr'
                ? event.category.name_fr
                : event.category.name_en}
            </span>
          </div>
        )}

        {/* Date & Time Overlay Banner */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-1.5 font-medium bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80 backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 font-medium bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80 backdrop-blur-md text-amber-300">
            <Clock className="w-3 h-3" />
            <span>
              {formattedTime} <span className="text-[10px] text-slate-400">{timeZoneAbbr}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location details */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {event.city
                ? (locale === 'ar' ? event.city.name_ar || event.city.name_en : event.city.name_en || event.city.name_ar)
                : event.city_id || ''}
              {event.country
                ? `, ${locale === 'ar' ? event.country.name_ar || event.country.name_en : event.country.name_en || event.country.name_ar}`
                : event.country_id ? `, ${event.country_id}` : ''}
              {!event.city && !event.country && event.full_address ? event.full_address : ''}
            </span>
          </div>

          {/* Event Title */}
          <Link href={`/events/${event.slug}`} className="block group-hover:text-amber-300 transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>
        </div>

        {/* Organizer info & Action Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate font-medium">
              {event.organization?.name || event.organizer_name || 'Community Organizer'}
            </span>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
