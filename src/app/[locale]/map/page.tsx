import React from 'react';
import { db } from '@/lib/db';
import { EventMap } from '@/components/maps/EventMap';
import { Link } from '@/i18n/routing';
import { EventVerificationBadge } from '@/components/ui/EventVerificationBadge';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Interactive World Map | Ezidi Events Worldwide',
  description: 'Explore verified Ezidi rallies, memorial conferences, and cultural events on the global map.',
};

export default async function MapPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Security Rule: Public query strictly fetches published public non-deleted events
  const events = await db.events.findPublicEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-amber-400" />
            <span>Interactive Worldwide Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Displaying <strong className="text-amber-400 font-mono">{events.length}</strong> published events across the globe.
          </p>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EventMap events={events} height="620px" />
        </div>

        {/* Sidebar Event List */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 h-[620px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Locations & Venues
            </h3>
            <span className="text-xs font-mono text-slate-400">{events.length} Pins</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <EventVerificationBadge
                    status={event.status}
                    verificationStatus={event.event_verification_status}
                    size="sm"
                  />
                  <span className="text-[11px] font-mono text-slate-400">{event.date}</span>
                </div>

                <Link href={`/events/${event.slug}`} className="block">
                  <h4 className="text-xs font-bold text-white hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h4>
                </Link>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="truncate">{event.city?.name_en}, {event.country?.name_en}</span>
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <Link
              href="/events"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Switch to Directory Table View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
