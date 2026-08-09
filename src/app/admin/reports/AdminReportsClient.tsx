'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { EventReport } from '@/types/database';
import { resolveReportAction } from '@/lib/actions/reports';
import { CheckCircle2, XCircle, AlertTriangle, Eye, Lock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface AdminReportsClientProps {
  initialReports: EventReport[];
}

export function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const { t, isRtl } = useAdminLanguage();
  const [reports, setReports] = useState<EventReport[]>(initialReports);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as const,
    email: 'admin@ezidievents.org',
  };

  const handleResolve = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setLoadingId(reportId);
    const res = await resolveReportAction(
      reportId,
      status,
      status === 'resolved' ? 'Reviewed and verified by administrator' : 'Report dismissed upon review',
      adminContext
    );
    setLoadingId(null);

    if (res.success) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'inaccurate_details':
        return isRtl ? 'معلومات غير دقيقة' : 'Inaccurate Details';
      case 'fake_event':
        return isRtl ? 'فعالية وهمية / مضللة' : 'Fake Event';
      case 'hate_speech':
        return isRtl ? 'خطاب كراهية / محتوى مسيء' : 'Hate Speech';
      case 'duplicate':
        return isRtl ? 'فعالية مكررة' : 'Duplicate';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span>{isRtl ? 'بلاغات المجتمع ومكافحة التضليل' : 'Community Reports & Moderation'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'متابعة البلاغات الواردة من الجمهور حول الفعاليات غير الصحيحة أو المكررة أو المخالفة.'
              : 'Audit user complaints regarding fake events, hate speech, or inaccurate venues.'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-800/60 text-xs font-mono text-red-300 font-bold">
          {reports.filter((r) => r.status === 'open').length} {isRtl ? 'بلاغات مفتوحة' : 'Open Reports'}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الفعالية المبلغ عنها' : 'Event'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'نوع البلاغ' : 'Report Type'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الوصف والتفاصيل' : 'Description & Evidence'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                    {report.event?.title || (isRtl ? 'فعالية محددة' : 'Target Event')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-300 font-semibold text-[11px] border border-red-800">
                      {getReportTypeLabel(report.report_type)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="text-slate-300 leading-normal line-clamp-2">{report.description}</p>
                    {report.reporter_email && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>{isRtl ? 'صاحب البلاغ (خاص ومشفر): ' : 'Private Reporter: '}{report.reporter_email}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        report.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : report.status === 'dismissed'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                      }`}
                    >
                      {report.status === 'resolved'
                        ? (isRtl ? 'تمت المعالجة' : 'Resolved')
                        : report.status === 'dismissed'
                        ? (isRtl ? 'مرفوض / غير دقيق' : 'Dismissed')
                        : (isRtl ? 'قيد المتابعة' : 'Open')}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                    {report.status === 'open' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResolve(report.id, 'dismissed')}
                          disabled={loadingId === report.id}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          {isRtl ? 'إغلاق البلاغ' : 'Dismiss'}
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, 'resolved')}
                          disabled={loadingId === report.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-700/50"
                        >
                          {isRtl ? 'معالجة واتخاذ إجراء' : 'Resolve'}
                        </button>
                      </div>
                    )}
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
