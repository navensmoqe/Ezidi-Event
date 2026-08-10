'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Organization, EventItem } from '@/types/database';
import { PlusCircle, Calendar, Edit, ExternalLink, Trash2, MapPin, Clock, ShieldCheck, Search } from 'lucide-react';

interface OrgEventsClientProps {
  initialOrganizations: Organization[];
  allEvents: EventItem[];
}

export function OrgEventsClient({ initialOrganizations, allEvents }: OrgEventsClientProps) {
  const { t, isRtl } = useOrgLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);
  const [activeOrgId, setActiveOrgId] = useState<string>(initialOrganizations[0]?.id || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_active_org_id');
    if (saved && orgs.some((o) => o.id === saved)) {
      setActiveOrgId(saved);
    } else if (orgs[0]) {
      setActiveOrgId(orgs[0].id);
    }
  }, [orgs]);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  const orgEvents = activeOrg
    ? allEvents.filter((e) => e.organization_id === activeOrg.id)
    : allEvents;

  const filtered = orgEvents.filter((e) => {
    const q = search.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.full_address.toLowerCase().includes(q);
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
              ? 'إنشاء ومتابعة وتعديل فعاليات المنظمة المنشورة وقيد المراجعة.'
              : "Create, update, cancel, and manage your organization's events."}
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
                    {isRtl ? 'لا توجد فعاليات مطابقة.' : 'No events found.'}
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
                          : (isRtl ? '⏳ قيد المراجعة' : '⏳ Pending Review')}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ar/events/${event.slug}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title={isRtl ? 'معاينة في الموقع العام' : 'Preview on public site'}
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
