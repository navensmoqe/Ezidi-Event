'use client';

import React, { useState } from 'react';
import { Organization } from '@/types/database';
import { verifyOrganizationAction } from '@/lib/actions/admin';
import { toggleDirectPublishingAction, suspendOrganizationAction } from '@/lib/actions/organizations';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle, Building2, Zap, ZapOff } from 'lucide-react';
import Link from 'next/link';

interface AdminOrgsClientProps {
  initialOrganizations: Organization[];
}

export function AdminOrgsClient({ initialOrganizations }: AdminOrgsClientProps) {
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
    role: 'super_admin' as any,
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
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Org Status</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Direct Publishing (Admin Exclusive)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white max-w-xs truncate">{org.name}</div>
                    <span className="text-[11px] text-slate-500 font-mono">{org.email}</span>
                  </td>
                  <td className="py-3.5 px-4">{org.organization_type}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        org.organization_status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {org.organization_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {org.verification_status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerify(org.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/40"
                      >
                        Verify Org
                      </button>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        org.direct_publishing_enabled
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {org.direct_publishing_enabled ? (
                        <>
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <ZapOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {org.organization_status !== 'suspended' && (
                      <button
                        onClick={() =>
                          setModalState({
                            open: true,
                            orgId: org.id,
                            orgName: org.name,
                            actionType: 'suspend',
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 font-semibold text-[11px] border border-red-800/50"
                      >
                        Suspend
                      </button>
                    )}
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
            <h3 className="text-base font-bold text-white">
              {modalState.actionType === 'toggle_direct_pub'
                ? `Modify Direct Publishing: "${modalState.orgName}"`
                : `Suspend Organization: "${modalState.orgName}"`}
            </h3>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mandatory Administrative Reason * (Logged to Audit Trail)
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Justification for granting/revoking direct publishing or suspending organization..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState({ open: false, orgId: '', orgName: '', actionType: 'toggle_direct_pub' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reason.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  Confirm & Update Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
