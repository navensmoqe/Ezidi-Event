'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import {
  Inbox,
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { EventItem, Organization, EventPendingChange, EventReport, AuditLog } from '@/types/database';

interface OverviewProps {
  publishedEventsCount: number;
  pendingSubmissions: EventItem[];
  pendingChanges: EventPendingChange[];
  verifiedOrgsCount: number;
  pendingOrgs: Organization[];
  allOrgs: Organization[];
  openReports: EventReport[];
  recentAudits: AuditLog[];
}

export function AdminOverviewClient({
  publishedEventsCount,
  pendingSubmissions,
  pendingChanges,
  pendingOrgs,
  allOrgs,
  openReports,
  recentAudits,
}: OverviewProps) {
  const { t, isRtl } = useAdminLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('adminHeading')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('adminSubheading')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/submissions"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <Inbox className="w-4 h-4" />
            <span>{t('reviewSubmissions')} ({pendingSubmissions.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          href="/admin/events"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('publishedEvents')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono block">{publishedEventsCount}</span>
        </Link>

        <Link
          href="/admin/submissions"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('pendingSubmissions')}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400 font-mono block">{pendingSubmissions.length}</span>
        </Link>

        <Link
          href="/admin/pending-changes"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('sensitiveEditsCount')}</span>
            <GitPullRequest className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-blue-400 font-mono block">{pendingChanges.length}</span>
        </Link>

        <Link
          href="/admin/reports"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">{t('openReports')}</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-3xl font-black text-red-400 font-mono block">{openReports.length}</span>
        </Link>
      </div>

      {/* Main Grid: Pending Submissions & Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Submissions Queue */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">{t('incomingSubmissions')}</h2>
            </div>
            <Link
              href="/admin/submissions"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>{t('reviewAll')} ({pendingSubmissions.length})</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {isRtl ? 'لا توجد فعاليات معلقة تتطلب المراجعة حالياً.' : 'No pending submissions currently.'}
              </div>
            ) : (
              pendingSubmissions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 truncate">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{sub.title}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{sub.date}</span>
                      <span>•</span>
                      <span>{sub.full_address}</span>
                    </p>
                  </div>
                  <Link
                    href="/admin/submissions"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold shrink-0"
                  >
                    {t('moderate')}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Organization Verification Queue */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">{t('orgVerificationQueue')}</h2>
            </div>
            <Link
              href="/admin/organizations"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>{t('manageAll')} ({allOrgs.length})</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {allOrgs.slice(0, 4).map((org) => (
              <div
                key={org.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 truncate">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{org.name}</h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        org.verification_status === 'verified'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {org.verification_status === 'verified' ? t('verified') : t('pending')}
                    </span>
                  </div>
                </div>
                <Link
                  href="/admin/organizations"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                >
                  {t('inspect')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs Stream */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {t('recentAuditTrail')}
            </h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>{t('fullAuditExplorer')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className={`p-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{t('timestamp')}</th>
                <th className={`p-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{t('actorRole')}</th>
                <th className={`p-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{t('action')}</th>
                <th className={`p-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{t('entityType')}</th>
                <th className={`p-3 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{t('reasonDetails')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentAudits.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString(isRtl ? 'ar-IQ' : 'en-US', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="p-3 text-amber-300 font-semibold">{log.actor_role}</td>
                  <td className="p-3 text-white font-bold">{log.action}</td>
                  <td className="p-3 text-slate-400">{log.entity_type}</td>
                  <td className="p-3 text-slate-300 max-w-xs truncate font-sans">
                    {log.reason || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
