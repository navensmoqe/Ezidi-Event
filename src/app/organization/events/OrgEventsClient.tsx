'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Organization, EventItem } from '@/types/database';
import { PlusCircle, Calendar, Edit, ExternalLink, Trash2, MapPin, Clock, ShieldCheck, Search } from 'lucide-react';

interface OrgEventsClientProps {
  organization: Organization;
  events: EventItem[];
}

export function OrgEventsClient({ organization, events: initialEvents }: OrgEventsClientProps) {
  const { t, isRtl } = useOrgLanguage();
  const [eventsList, setEventsList] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState('');

  // Sync with localStorage & API
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ezidi_submitted_events') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setEventsList((prev) => {
          const map = new Map<string, EventItem>();
          // Add local events for this org
          stored.forEach((e: EventItem) => {
            if (
              e &&
              e.id &&
              (e.organization_id === organization.id ||
                e.organizer_name === organization.name ||
                e.contact_email?.toLowerCase() === organization.email?.toLowerCase())
            ) {
              map.set(e.id, e);
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

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        const events = Array.isArray(data) ? data : data?.events || [];
        if (Array.isArray(events) && events.length > 0) {
          const orgSpecific = events.filter(
            (e: EventItem) =>
              e.organization_id === organization.id ||
              e.organizer_name === organization.name ||
              e.contact_email?.toLowerCase() === organization.email?.toLowerCase()
          );
          if (orgSpecific.length > 0) {
            setEventsList((prev) => {
              const map = new Map<string, EventItem>();
              orgSpecific.forEach((e: EventItem) => {
                if (e && e.id) map.set(e.id, e);
              });
              prev.forEach((e) => {
                if (e && e.id && !map.has(e.id)) map.set(e.id, e);
              });
              return Array.from(map.values());
            });
          }
        }
      })
      .catch(() => {});
  }, [organization]);

  const filtered = eventsList.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.full_address?.toLowerCase().includes(q) ||
      e.city_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'إدارة فعاليات المنظمة' : 'Organization Events'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? `عرض وإدارة فعاليات منظمة "${organization.name}" المعتمدة.`
              : `Manage events published by "${organization.name}".`}
          </p>
        </div>

        <Link
          href="/organization/events/new"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRtl ? 'إضافة فعالية جديدة' : 'Add New Event'}</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          placeholder={isRtl ? 'البحث في فعاليات المنظمة بالاسم أو العنوان...' : 'Search organization events...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
            isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'عنوان الفعالية' : 'Title'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'التاريخ والوقت' : 'Date & Time'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المكان والمقر' : 'Venue'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'حالة النشر' : 'Publishing Status'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'خيارات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    {isRtl ? 'لم تنشر هذه المنظمة أي فعاليات بعد.' : 'No events found for this organization.'}
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {event.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {event.date} • {event.start_time}
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-[200px]">{event.full_address}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          event.status === 'published'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {event.status === 'published'
                          ? (isRtl ? '✓ منشور للعامة' : '✓ Published')
                          : (isRtl ? '⏳ قيد المراجعة' : '⏳ Pending')}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ar/events/${event.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title={isRtl ? 'معاينة في الموقع' : 'View on site'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
