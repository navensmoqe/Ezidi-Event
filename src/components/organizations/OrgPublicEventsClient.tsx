'use client';

import React, { useState, useEffect } from 'react';
import { EventItem, Organization } from '@/types/database';
import { EventCard } from '@/components/events/EventCard';
import { Calendar, Sparkles } from 'lucide-react';

interface OrgPublicEventsClientProps {
  organization: Organization;
  initialEvents: EventItem[];
}

export function OrgPublicEventsClient({
  organization,
  initialEvents,
}: OrgPublicEventsClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  useEffect(() => {
    // 1. Sync from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('ezidi_submitted_events') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setEvents((prev) => {
          const map = new Map<string, EventItem>();
          // Match by ID, name, or email
          stored.forEach((e: EventItem) => {
            if (
              e &&
              e.id &&
              (e.organization_id === organization.id ||
                e.organizer_name === organization.name ||
                (e.contact_email && e.contact_email.toLowerCase() === organization.email?.toLowerCase()))
            ) {
              map.set(e.id, { ...e, status: 'published', visibility: 'public' });
            }
          });
          prev.forEach((e) => {
            if (e && e.id && !map.has(e.id)) {
              map.set(e.id, e);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch {}

    // 2. Fetch fresh events from /api/events
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        const eventsList = Array.isArray(data) ? data : data?.events || [];
        if (Array.isArray(eventsList) && eventsList.length > 0) {
          const orgEvents = eventsList.filter(
            (e: EventItem) =>
              e &&
              e.id &&
              (e.status === 'published' || e.visibility === 'public') &&
              (e.organization_id === organization.id ||
                e.organizer_name === organization.name ||
                (e.contact_email && e.contact_email.toLowerCase() === organization.email?.toLowerCase()))
          );
          if (orgEvents.length > 0) {
            setEvents((prev) => {
              const map = new Map<string, EventItem>();
              orgEvents.forEach((e: EventItem) => {
                map.set(e.id, e);
              });
              prev.forEach((e) => {
                if (e && e.id && !map.has(e.id)) {
                  map.set(e.id, e);
                }
              });
              return Array.from(map.values());
            });
          }
        }
      })
      .catch(() => {});
  }, [organization]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => (e.date || '') >= today);
  const pastEvents = events.filter((e) => (e.date || '') < today);

  // If no upcoming date distinction, show all events
  const displayEvents = events;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-400" />
          <span>Events by {organization.name}</span>
        </h2>
        {displayEvents.length > 0 && (
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full">
            {displayEvents.length} {displayEvents.length === 1 ? 'Event' : 'Events'}
          </span>
        )}
      </div>

      {displayEvents.length > 0 ? (
        <div className="space-y-6">
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Upcoming Events ({upcomingEvents.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Past & Concluded Events ({pastEvents.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-85 hover:opacity-100 transition-opacity">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-8 text-center text-sm text-slate-400 border border-slate-800 space-y-2">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No published public events currently listed for this organization.</p>
        </div>
      )}
    </div>
  );
}
