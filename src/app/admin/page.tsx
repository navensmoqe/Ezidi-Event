import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  Calendar,
  Inbox,
  GitPullRequest,
  Building2,
  AlertTriangle,
  Users,
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  const allEvents = await db.events.findAllAdmin();
  const publishedEvents = allEvents.filter((e) => e.status === 'published');
  const pendingSubmissions = allEvents.filter((e) => e.status === 'pending');
  const pendingChanges = await db.events.getPendingChanges();

  const allOrgs = await db.organizations.findAllAdmin();
  const verifiedOrgs = allOrgs.filter((o) => o.verification_status === 'verified');
  const pendingOrgs = allOrgs.filter((o) => o.verification_status === 'pending');

  const allReports = await db.reports.getAllAdmin();
  const openReports = allReports.filter((r) => r.status === 'open');

  const recentAudits = await db.audit.getAll(6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Administrative Oversight Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time moderation queues, organization verification, and system audit stream.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/submissions"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Inbox className="w-4 h-4" />
            <span>Review Submissions ({pendingSubmissions.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          href="/admin/events"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Published Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{publishedEvents.length}</span>
        </Link>

        <Link
          href="/admin/submissions"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Pending Submissions</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400 font-mono">{pendingSubmissions.length}</span>
        </Link>

        <Link
          href="/admin/pending-changes"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Sensitive Edits Diff</span>
            <GitPullRequest className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-blue-400 font-mono">{pendingChanges.length}</span>
        </Link>

        <Link
          href="/admin/reports"
          className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Open Reports</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-3xl font-black text-red-400 font-mono">{openReports.length}</span>
        </Link>
      </div>

      {/* Moderation Alert Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions Box */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-400" />
              <span>Incoming Event Submissions</span>
            </h3>
            <Link
              href="/admin/submissions"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Review All ({pendingSubmissions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No pending event submissions awaiting moderation.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white truncate max-w-xs">{sub.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{sub.date} • {sub.city?.name_en}</p>
                  </div>
                  <Link
                    href="/admin/submissions"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30"
                  >
                    Moderate
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Organizations Box */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Organization Verification Queue</span>
            </h3>
            <Link
              href="/admin/organizations"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Manage All ({allOrgs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {allOrgs.slice(0, 3).map((org) => (
              <div
                key={org.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white truncate max-w-xs">{org.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    org.verification_status === 'verified'
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-amber-950 text-amber-300'
                  }`}>
                    {org.verification_status}
                  </span>
                </div>
                <Link
                  href="/admin/organizations"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Append-Only Audit Trail Stream */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span>Recent System Audit Trail (Append-Only)</span>
          </h3>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Full Audit Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Reason / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentAudits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40 text-[11px]">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {a.created_at.slice(0, 19).replace('T', ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400">{a.actor_role}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{a.action}</td>
                  <td className="py-2.5 px-3 text-slate-400">{a.entity_type}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-sm">
                    {a.reason || 'Standard system action'}
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
