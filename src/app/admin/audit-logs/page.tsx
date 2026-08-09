import React from 'react';
import { db } from '@/lib/db';
import { ScrollText, ShieldAlert, Filter } from 'lucide-react';

export const metadata = {
  title: 'Append-Only Audit Trail | Admin Dashboard',
};

export default async function AdminAuditLogsPage() {
  const auditLogs = await db.audit.getAll(50);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <ScrollText className="w-6 h-6 text-amber-400" />
          <span>Append-Only Security Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable audit record tracking every moderation decision, role change, direct publishing permission change, and organization suspension.
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Mandatory Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {log.created_at.replace('T', ' ').slice(0, 19)}
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
                    {log.reason || 'System operation'}
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
