import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  PlusCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';

export default async function OrgDashboardPage() {
  const org = (await db.organizations.findVerifiedPublic())[0];
  const allEvents = await db.events.findAllAdmin();
  const orgEvents = org ? allEvents.filter((e) => e.organization_id === org.id) : allEvents.slice(0, 3);

  const published = orgEvents.filter((e) => e.status === 'published');
  const pending = orgEvents.filter((e) => e.status === 'pending');
  const pendingChanges = await db.events.getPendingChanges();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Organization Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Managing: <span className="font-bold text-amber-300">{org?.name || 'Yazidi Global Solidarity Initiative'}</span>
          </p>
        </div>

        <Link
          href="/organization/events/new"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Event</span>
        </Link>
      </div>

      {/* Direct Publishing Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-start gap-4 ${
          org?.direct_publishing_enabled
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}
      >
        <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm block text-white">
            Direct Publishing Status:{' '}
            <span className={org?.direct_publishing_enabled ? 'text-emerald-400' : 'text-amber-400'}>
              {org?.direct_publishing_enabled ? '✓ Enabled (Instant Public Publishing)' : 'Pending Review Workflow'}
            </span>
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {org?.direct_publishing_enabled
              ? 'Your organization is verified and authorized to publish events immediately to the global directory and world map without prior administrator review.'
              : 'Your event submissions enter the standard moderation review queue before becoming publicly visible.'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Published Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{published.length}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{pending.length}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Changes</span>
            <AlertCircle className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{pendingChanges.length}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Estimated Views</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono">1,840</span>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Your Recent Events</h3>
          <Link
            href="/organization/events"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orgEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 font-semibold text-white truncate max-w-xs">{e.title}</td>
                  <td className="py-3.5 px-4 font-mono">{e.date}</td>
                  <td className="py-3.5 px-4">{e.city?.name_en}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      e.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/organization/events`}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Manage
                    </Link>
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
