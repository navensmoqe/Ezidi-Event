'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { Organization } from '@/types/database';
import { verifyOrganizationAction } from '@/lib/actions/admin';
import { toggleDirectPublishingAction, suspendOrganizationAction } from '@/lib/actions/organizations';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle, Building2, Zap, ZapOff } from 'lucide-react';
import Link from 'next/link';

interface AdminOrgsClientProps {
  initialOrganizations: Organization[];
}

export function AdminOrgsClient({ initialOrganizations }: AdminOrgsClientProps) {
  const { t, isRtl } = useAdminLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);

  // Mandatory Reason Modal State
  const [modalState, setModalState] = useState<{
    open: boolean;
    orgId: string;
    orgName: string;
    actionType: 'toggle_direct_pub' | 'suspend';
    targetValue?: boolean;
  }>({
    open: false,
    orgId: '',
    orgName: '',
    actionType: 'toggle_direct_pub',
  });
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as const,
    email: 'admin@ezidievents.org',
  };

  const handleVerify = async (orgId: string) => {
    const res = await verifyOrganizationAction(orgId, 'Verified via official documentation', adminContext);
    if (res.success) {
      setOrgs((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, verification_status: 'verified' } : o))
      );
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (modalState.actionType === 'toggle_direct_pub') {
      const enable = !!modalState.targetValue;
      const res = await toggleDirectPublishingAction(modalState.orgId, enable, reason, adminContext);
      if (res.success) {
        setOrgs((prev) =>
          prev.map((o) => (o.id === modalState.orgId ? { ...o, direct_publishing_enabled: enable } : o))
        );
      }
    } else if (modalState.actionType === 'suspend') {
      const res = await suspendOrganizationAction(modalState.orgId, reason, adminContext);
      if (res.success) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === modalState.orgId
              ? {
                  ...o,
                  organization_status: 'suspended',
                  direct_publishing_enabled: false,
                  verification_status: 'suspended',
                }
              : o
          )
        );
      }
    }

    setLoading(false);
    setModalState({ open: false, orgId: '', orgName: '', actionType: 'toggle_direct_pub' });
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'إدارة المنظمات وصلاحيات النشر المباشر' : 'Organization Verification & Direct Publishing'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'فحص ملفات التوثيق، منح ميزة النشر المباشر للمنظمات الموثوقة، وتعليق الحسابات المخالفة.'
              : 'Audit documentation, grant direct publishing rights to trusted NGOs, and suspend rogue accounts.'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
          {orgs.length} {isRtl ? 'منظمات مسجلة' : 'Registered Orgs'}
        </div>
      </div>

      {/* Organizations Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المنظمة' : 'Organization'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'حالة التوثيق' : 'Verification'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'النشر المباشر' : 'Direct Publishing'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'حالة المنظمة' : 'Status'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات الإدارية' : 'Admin Controls'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{org.name}</div>
                    <span className="text-[11px] text-slate-400 font-mono">{org.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        org.verification_status === 'verified'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : org.verification_status === 'suspended'
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {org.verification_status === 'verified'
                        ? (isRtl ? '✓ موثقة رسمياً' : '✓ Verified')
                        : org.verification_status === 'suspended'
                        ? (isRtl ? 'معلقة' : 'Suspended')
                        : (isRtl ? 'قيد التدقيق' : 'Pending Verification')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {org.direct_publishing_enabled ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Zap className="w-4 h-4 fill-emerald-400" />
                        <span>{isRtl ? 'مفعّل (نشر فوري)' : 'Enabled (Instant Live)'}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 font-semibold text-xs">
                        <ZapOff className="w-4 h-4" />
                        <span>{isRtl ? 'معطّل (يتطلب مراجعة)' : 'Disabled (Requires Review)'}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={org.organization_status === 'active' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      ● {org.organization_status === 'active' ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'موقوف' : 'Suspended')}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                    <div className="flex items-center justify-end gap-2">
                      {org.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerify(org.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs border border-emerald-700/50"
                        >
                          {isRtl ? 'توثيق رسمي' : 'Verify'}
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setModalState({
                            open: true,
                            orgId: org.id,
                            orgName: org.name,
                            actionType: 'toggle_direct_pub',
                            targetValue: !org.direct_publishing_enabled,
                          })
                        }
                        className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs border transition-colors ${
                          org.direct_publishing_enabled
                            ? 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border-amber-800'
                            : 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800'
                        }`}
                      >
                        {org.direct_publishing_enabled
                          ? (isRtl ? 'تعطيل النشر المباشر' : 'Disable Direct Pub')
                          : (isRtl ? 'منح النشر المباشر' : 'Grant Direct Pub')}
                      </button>

                      {org.organization_status === 'active' && (
                        <button
                          onClick={() =>
                            setModalState({
                              open: true,
                              orgId: org.id,
                              orgName: org.name,
                              actionType: 'suspend',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 font-semibold text-xs border border-red-800"
                        >
                          {isRtl ? 'تعليق المنظمة' : 'Suspend'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Reason Modal */}
      {modalState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {isRtl ? 'مبرر إداري مطلوب للتوثيق والتدقيق' : 'Mandatory Audit Justification'}
                </h3>
              </div>
              <button
                onClick={() => setModalState({ open: false, orgId: '', orgName: '', actionType: 'toggle_direct_pub' })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {isRtl ? 'تغيير إعدادات المنظمة:' : 'Modifying settings for:'} <strong className="text-white">&quot;{modalState.orgName}&quot;</strong>.
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isRtl ? 'السبب الإداري الإلزامي * (يُسجل في سجل التدقيق الأمني)' : 'Administrative Reason * (Logged to System Audit Trail)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isRtl ? 'اكتب سبب منح الصلاحية أو تعليق المنظمة...' : 'State the reason for this administrative decision...'}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState({ open: false, orgId: '', orgName: '', actionType: 'toggle_direct_pub' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading || reason.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? (isRtl ? 'جاري التنفيذ...' : 'Saving...') : (isRtl ? 'تأكيد وحفظ القرار' : 'Confirm & Log Decision')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
