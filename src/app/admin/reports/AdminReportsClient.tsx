'use client';

import React, { useState } from 'react';
import { EventReport } from '@/types/database';
import { resolveReportAction } from '@/lib/actions/reports';
import { CheckCircle2, XCircle, AlertTriangle, Eye, Lock } from 'lucide-react';
import Link from 'next/link';

interface AdminReportsClientProps {
  initialReports: EventReport[];
}

export function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const [reports, setReports] = useState<EventReport[]>(initialReports);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as any,
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

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Report Type</th>
                <th className="py-3.5 px-4">Description & Evidence</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                    {report.event?.title || 'Unknown Event'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 font-semibold text-[10px] border border-red-800">
                      {report.report_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="text-slate-300 leading-normal line-clamp-2">{report.description}</p>
                    {report.reporter_email && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Private Reporter: {report.reporter_email}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300'
                          : report.status === 'dismissed'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {report.status === 'open' && (
                      <>
                        <button
                          onClick={() => handleResolve(report.id, 'resolved')}
                          disabled={loadingId === report.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900 font-bold border border-emerald-800 text-[11px]"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleResolve(report.id, 'dismissed')}
                          disabled={loadingId === report.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 font-semibold text-[11px]"
                        >
                          Dismiss
                        </button>
                      </>
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
