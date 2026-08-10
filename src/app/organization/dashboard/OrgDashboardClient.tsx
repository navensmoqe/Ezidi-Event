'use client';

import React from 'react';
import Link from 'next/link';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Organization, EventItem, EventPendingChange } from '@/types/database';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  PlusCircle,
  ShieldCheck,
  Building2,
  MapPin,
} from 'lucide-react';

interface OrgDashboardClientProps {
  organization: Organization;
  orgEvents: EventItem[];
  pendingChanges: EventPendingChange[];
}

export function OrgDashboardClient({
  organization,
  orgEvents,
  pendingChanges,
}: OrgDashboardClientProps) {
  const { t, isRtl } = useOrgLanguage();

  const published = orgEvents.filter((e) => e.status === 'published');
  const pending = orgEvents.filter((e) => e.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-amber-400" />
            <span>{t('dashboard')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl ? 'حساب المنظمة:' : 'Managing Organization:'}{' '}
            <span className="font-bold text-amber-300">
              {organization.name}
            </span>{' '}
            {organization.verification_status === 'verified' ? (
              <span className="text-emerald-400 text-xs font-semibold">({isRtl ? '✓ موثقة رسمياً' : '✓ Verified'})</span>
            ) : (
              <span className="text-amber-400 text-xs font-semibold">({isRtl ? '⏳ قيد التدقيق' : '⏳ Pending Review'})</span>
            )}
          </p>
        </div>

        <Link
          href="/organization/events/new"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('publishNewEventBtn')}</span>
        </Link>
      </div>

      {/* Direct Publishing Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-4 ${
          organization.direct_publishing_enabled
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}
      >
        <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <span className="font-bold text-sm block text-white">
            {t('directPublishing')}:{' '}
            <span className={organization.direct_publishing_enabled ? 'text-emerald-400' : 'text-amber-400'}>
              {organization.direct_publishing_enabled
                ? (isRtl ? '✓ مفعّل (نشر مباشر فوري على الخريطة)' : '✓ Enabled (Instant Public Publishing)')
                : (isRtl ? 'قيد المراجعة والتدقيق' : 'Standard Moderation Queue')}
            </span>
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {organization.direct_publishing_enabled
              ? (isRtl
                  ? 'تم منح منظمتكم صلاحية النشر المباشر. ستظهر فعالياتكم فوراً على الموقع العام وخريطة العالم دون الحاجة لانتظار موافقة الإدارة.'
                  : 'Your organization is verified and authorized to publish events immediately to the global directory and world map without prior administrator review.')
              : (isRtl
                  ? 'يتم إرسال فعالياتكم أولاً إلى طابور التدقيق الإداري السريع لضمان دقة العناوين والتفاصيل قبل ظهورها للعامة.'
                  : 'Your event submissions enter the standard moderation review queue before becoming publicly visible.')}
          </p>
        </div>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('publishedEvents')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{published.length}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('pendingReview')}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{pending.length}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('pendingChanges')}</span>
            <AlertCircle className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{pendingChanges.length}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('estimatedViews')}</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">
            {published.length * 150}
          </span>
        </div>
      </div>

      {/* Real Recent Events of this Organization */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{t('recentEvents')}</span>
          </h2>
          <Link
            href="/organization/events"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            {t('exploreAllEvents')} →
          </Link>
        </div>

        {orgEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-3">
            <p>{t('noEventsYet')}</p>
            <Link
              href="/organization/events/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('publishNewEventBtn')}</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {orgEvents.map((event) => (
              <div key={event.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white text-sm block">{event.title}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{event.full_address}</span>
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    event.status === 'published'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {event.status === 'published'
                    ? (isRtl ? 'منشور' : 'Published')
                    : (isRtl ? 'قيد المراجعة' : 'Pending')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
