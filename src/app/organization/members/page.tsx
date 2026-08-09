import React from 'react';
import { Users, UserPlus, Shield, ShieldCheck } from 'lucide-react';

export default function OrgMembersPage() {
  const members = [
    { id: '1', name: 'Dr. Murad Hassan', email: 'director@demo-yazidi.org', role: 'Owner', status: 'Active' },
    { id: '2', name: 'Zozan Rasho', email: 'events@demo-yazidi.org', role: 'Admin', status: 'Active' },
    { id: '3', name: 'Dilshad Kaval', email: 'press@demo-yazidi.org', role: 'Editor', status: 'Active' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Team Members & Permissions</h1>
          <p className="text-xs text-slate-400">
            Assign team roles: Owner (Full control), Admin (Manage events & org), and Editor (Manage events).
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Member Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{m.email}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 font-semibold text-[11px] border border-slate-700">
                    {m.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 font-medium">● {m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
