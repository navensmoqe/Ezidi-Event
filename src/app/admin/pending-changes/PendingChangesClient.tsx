'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { EventItem, EventPendingChange } from '@/types/database';
import { resolvePendingChangeAction } from '@/lib/actions/admin';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
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
  const { t, isRtl } = useAdminLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const [changes, setChanges] = useState<EnrichedChange[]>(initialChanges);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as const,
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
        <h3 className="text-lg font-bold text-white">
          {isRtl ? 'لا توجد تعديلات حساسة معلقة' : 'No Pending Sensitive Changes'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {isRtl
            ? 'تمت مراجعة جميع طلبات التعديل الحساسة على الفعاليات المنشورة بنجاح.'
            : 'All proposed modifications to live events have been reviewed. The public directory is up-to-date.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <GitPullRequest className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'مراجعة التعديلات الحساسة على الفعاليات' : 'Sensitive Edits Diff & Moderation'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'مقارنة الفروقات بين البيانات الحالية والتعديلات المقترحة (التاريخ، التوقيت، الموقع) قبل تطبيقها.'
              : 'Visual side-by-side diff comparing current live data against proposed changes.'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold font-mono">
          {changes.length} {isRtl ? 'تعديلات معلقة' : 'Pending Diffs'}
        </div>
      </div>

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
                  {isRtl ? 'تعديلات مقترحة على فعالية منشورة' : 'Proposed Changes for Published Event'}
                </span>
                <h3 className="text-xl font-bold text-white">{current?.title}</h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolve(change.id, 'rejected')}
                  disabled={loadingId === change.id}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-bold border border-red-800/60 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isRtl ? 'رفض التعديلات' : 'Reject Modifications'}</span>
                </button>

                <button
                  onClick={() => handleResolve(change.id, 'approved')}
                  disabled={loadingId === change.id}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{loadingId === change.id ? (isRtl ? 'جاري التطبيق...' : 'Applying...') : (isRtl ? 'الموافقة وتطبيق التعديل' : 'Approve & Apply Live')}</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Diff Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CURRENT LIVE DATA */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-2">
                  {isRtl ? 'البيانات الحالية المنشورة' : 'Current Published Data'}
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'العنوان:' : 'Title:'}</span>
                    <span className="text-slate-200 font-semibold">{current?.title}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                    <span className="text-slate-200 font-mono">
                      {current?.date} • {current?.start_time} - {current?.end_time || '—'} ({current?.timezone})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'الموقع والعنوان:' : 'Location Address:'}</span>
                    <span className="text-slate-200">{current?.full_address}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'الوصف:' : 'Description:'}</span>
                    <p className="text-slate-300 line-clamp-3">{current?.description}</p>
                  </div>
                </div>
              </div>

              {/* PROPOSED DATA */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block border-b border-amber-500/30 pb-2">
                  {isRtl ? 'البيانات والتعديلات الجديدة المقترحة' : 'Proposed New Modifications'}
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'العنوان المقترح:' : 'Proposed Title:'}</span>
                    <span className={`font-semibold ${proposed.title !== current?.title ? 'text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded' : 'text-slate-200'}`}>
                      {proposed.title}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'التاريخ والوقت المقترح:' : 'Proposed Date & Time:'}</span>
                    <span className={`font-mono ${proposed.date !== current?.date || proposed.start_time !== current?.start_time ? 'text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded' : 'text-slate-200'}`}>
                      {proposed.date} • {proposed.start_time} - {proposed.end_time || '—'} ({proposed.timezone})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'الموقع المقترح:' : 'Proposed Location:'}</span>
                    <span className={`${proposed.full_address !== current?.full_address ? 'text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded' : 'text-slate-200'}`}>
                      {proposed.full_address}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">{isRtl ? 'الوصف المقترح:' : 'Proposed Description:'}</span>
                    <p className={`line-clamp-3 ${proposed.description !== current?.description ? 'text-amber-200' : 'text-slate-300'}`}>
                      {proposed.description}
                    </p>
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
