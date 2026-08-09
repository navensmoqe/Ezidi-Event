import React from 'react';
import { Users, Shield, KeyRound, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Users & RBAC Roles | Admin Dashboard',
};

export default function AdminUsersPage() {
  const users = [
    { id: '1', name: 'Super Admin', email: 'admin@ezidievents.org', role: 'super_admin', twoFactor: true, status: 'Active' },
    { id: '2', name: 'Murad Hassan', email: 'director@demo-yazidi.org', role: 'moderator', twoFactor: true, status: 'Active' },
    { id: '3', name: 'Zozan Rasho', email: 'zozan@community.org', role: 'editor', twoFactor: false, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-amber-400" />
          <span>User Access Control & RBAC Roles</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system administrators, moderators, editors, and enforce 2FA security.
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">RBAC Role</th>
              <th className="py-3.5 px-4">Two-Factor 2FA</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-bold text-white">
                  <div>{u.name}</div>
                  <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 font-semibold text-[11px] border border-slate-700">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {u.twoFactor ? (
                    <span className="text-emerald-400 font-semibold text-xs">✓ Enabled</span>
                  ) : (
                    <span className="text-amber-400 font-semibold text-xs">Disabled</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 font-medium">● {u.status}</span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs">
                    Edit Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
