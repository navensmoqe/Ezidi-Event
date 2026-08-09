'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { AuditLog } from '@/types/database';
import { ScrollText, Search, ShieldCheck } from 'lucide-react';

interface Props {
  auditLogs: AuditLog[];
}

export function AdminAuditLogsClient({ auditLogs }: Props) {
  const { t, isRtl } = useAdminLanguage();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor_role.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.reason && log.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ScrollText className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'سجل التدقيق والرقابة الأمني (Append-Only)' : 'Append-Only Security Audit Trail'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'سجل غير قابل للتعديل يوثق كل قرارات المراجعة، تعديل الصلاحيات، منح النشر المباشر، وتوثيق المنظمات.'
              : 'Immutable audit record tracking every moderation decision, role change, and permission update.'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'مشفر وغير قابل للتلاعب' : 'Immutable & Tamper-Proof'}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          placeholder={isRtl ? 'البحث في سجل التدقيق (الإجراء، الرتبة، الكيان، السبب)...' : 'Search audit trail (action, role, entity, notes)...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
            isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'الوقت والتاريخ' : 'Timestamp'}
                </th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'رتبة الفاعل' : 'Actor Role'}
                </th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'الإجراء' : 'Action'}
                </th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'الكيان المستهدف' : 'Target Entity'}
                </th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {isRtl ? 'السبب / الملاحظات' : 'Reason / Notes'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString(isRtl ? 'ar-IQ' : 'en-US', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-amber-400 font-bold">{log.actor_role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white font-bold">{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.entity_type} ({log.entity_id})
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-sm truncate">
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
