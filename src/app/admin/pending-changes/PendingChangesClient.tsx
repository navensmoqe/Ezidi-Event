'use client';

import React, { useState } from 'react';
import { EventItem, EventPendingChange } from '@/types/database';
import { resolvePendingChangeAction } from '@/lib/actions/admin';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  GitPullRequest,
  Check,
  AlertCircle,
} from 'lucide-react';

interface EnrichedChange extends EventPendingChange {
  currentEvent?: EventItem;
}

interface PendingChangesClientProps {
  initialChanges: EnrichedChange[];
}

export function PendingChangesClient({ initialChanges }: PendingChangesClientProps) {
  const [changes, setChanges] = useState<EnrichedChange[]>(initialChanges);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as any,
    email: 'admin@ezidievents.org',
  };

  const handleResolve = async (changeId: string, action: 'approved' | 'rejected') => {
    setLoadingId(changeId);
    const res = await resolvePendingChangeAction(
      changeId,
      action,
      action === 'approved' ? 'Administrator approved sensitive changes' : 'Administrator rejected modifications',
      adminContext
    );
    setLoadingId(null);

    if (res.success) {
      setChanges((prev) => prev.filter((c) => c.id !== changeId));
    }
  };

  if (changes.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Pending Sensitive Changes</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          All proposed modifications to live events have been reviewed. The public directory is up-to-date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {changes.map((change) => {
        const current = change.currentEvent;
        const proposed = change.proposed_data;

        return (
          <div
            key={change.id}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 text-xs font-bold border border-blue-800">
                  Proposed Changes for Published Event
                </span>
                <h3 className="text-xl font-bold text-white">{current?.title}</h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleResolve(change.id, 'rejected')}
                  disabled={loadingId === change.id}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-bold border border-red-800/60 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Changes</span>
                </button>

                <button
                  onClick={() => handleResolve(change.id, 'approved')}
                  disabled={loadingId === change.id}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{loadingId === change.id ? 'Applying...' : 'Approve & Apply to Live Event'}</span>
                </button>
              </div>
            </div>

            {/* Changed Fields Tags */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Modified Fields:</span>
              <div className="flex flex-wrap gap-1.5">
                {change.changed_fields.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/40"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Side-by-Side Comparison Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Version */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Live Version
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                    ACTIVE PUBLIC
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <span className="font-mono font-bold text-white">
                      {current?.date} • {current?.start_time} - {current?.end_time || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timezone:</span>
                    <span className="font-mono text-slate-300">{current?.timezone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Venue & Full Address:</span>
                    <span className="text-white font-medium">{current?.full_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Coordinates:</span>
                    <span className="font-mono text-slate-400">
                      {current?.latitude}, {current?.longitude}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proposed Modifications */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Proposed Modifications
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-500/50">
                    PENDING APPROVAL
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {proposed.date || current?.date} • {proposed.start_time || current?.start_time} - {proposed.end_time || current?.end_time || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timezone:</span>
                    <span className="font-mono text-amber-200">{proposed.timezone || current?.timezone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Venue & Full Address:</span>
                    <span className="text-amber-200 font-medium">{proposed.full_address || current?.full_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Coordinates:</span>
                    <span className="font-mono text-amber-400">
                      {proposed.latitude || current?.latitude}, {proposed.longitude || current?.longitude}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
