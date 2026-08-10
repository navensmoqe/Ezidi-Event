'use client';

import React, { useState } from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Users, UserPlus, Shield, ShieldCheck, X } from 'lucide-react';

export function OrgMembersClient() {
  const { t, isRtl } = useOrgLanguage();
  const [members, setMembers] = useState([
    { id: '1', name: 'د. مراد حسن', email: 'director@ezidi-world.org', role: 'مالك المنظمة (Owner)', status: 'نشط' },
    { id: '2', name: 'زوزان رشو', email: 'events@ezidi-world.org', role: 'مشرف فعاليات (Admin)', status: 'نشط' },
    { id: '3', name: 'دلشاد كفال', email: 'press@ezidi-world.org', role: 'محرر وموثق (Editor)', status: 'نشط' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('مشرف فعاليات (Admin)');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setMembers([
      ...members,
      {
        id: Date.now().toString(),
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: isRtl ? 'دعوة مرسلة' : 'Pending',
      },
    ]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'فريق العمل والصلاحيات' : 'Team Members & Permissions'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'إدارة أعضاء الفريق وتعيين الرتب: مالك المنظمة (كامل الصلاحيات)، مشرف، أو محرر فعاليات.'
              : 'Assign team roles: Owner (Full control), Admin (Manage events & org), and Editor (Manage events).'}
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRtl ? 'دعوة عضو جديد' : 'Invite Member'}</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'اسم العضو' : 'Member Name'}</th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الرتبة والصلاحية' : 'Role'}</th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
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

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'دعوة عضو جديد لفريق المنظمة' : 'Invite Team Member'}</span>
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'الاسم الكامل *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Samir Murad"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="samir@example.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'الصلاحية والرتبة' : 'Role'}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={isRtl ? 'مشرف فعاليات (Admin)' : 'Admin (Events & Org)'}>{isRtl ? 'مشرف فعاليات (Admin)' : 'Admin'}</option>
                  <option value={isRtl ? 'محرر فعاليات (Editor)' : 'Editor (Events Only)'}>{isRtl ? 'محرر فعاليات (Editor)' : 'Editor'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  {isRtl ? 'إرسال الدعوة' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
