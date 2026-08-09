'use client';

import React, { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { Organization } from '@/types/database';
import { verifyOrganizationAction } from '@/lib/actions/admin';
import { toggleDirectPublishingAction, suspendOrganizationAction, registerOrganizationAction } from '@/lib/actions/organizations';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle, Building2, Zap, ZapOff, PlusCircle, Search, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

interface AdminOrgsClientProps {
  initialOrganizations: Organization[];
}

export function AdminOrgsClient({ initialOrganizations }: AdminOrgsClientProps) {
  const { t, isRtl } = useAdminLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ezidi_submitted_orgs') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setOrgs((prev) => {
          const existingIds = new Set(prev.map((o) => o.id));
          const toAdd = stored.filter((item: Organization) => item && item.id && !existingIds.has(item.id));
          if (toAdd.length > 0) {
            return [...toAdd, ...prev];
          }
          return prev;
        });
      }
    } catch {}
  }, []);

  // Add Org Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    organization_type: 'Human Rights NGO',
    country_id: 'c-de',
    city_id: 'city-berlin',
    full_address: 'Berlin, Germany',
    latitude: 52.5200,
    longitude: 13.4050,
    email: '',
    website: '',
    phone: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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
    const res = await verifyOrganizationAction(orgId, 'Verified via administrator approval', adminContext);
    if (res.success) {
      setOrgs((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, verification_status: 'verified' } : o))
      );
    }
  };

  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    const res = await registerOrganizationAction(addFormData, adminContext);
    setAddLoading(false);

    if (!res.success) {
      setAddError(res.error || 'Failed to add organization.');
    } else if (res.organization) {
      // Auto verify when created by admin
      await verifyOrganizationAction(res.organization.id, 'Created and verified by Super Admin', adminContext);
      const verifiedOrg = { ...res.organization, verification_status: 'verified' as const };
      setOrgs([verifiedOrg, ...orgs]);
      setShowAddModal(false);
      setAddFormData({
        name: '',
        name_ar: '',
        description: '',
        organization_type: 'Human Rights NGO',
        country_id: 'c-de',
        city_id: 'city-berlin',
        full_address: 'Berlin, Germany',
        latitude: 52.5200,
        longitude: 13.4050,
        email: '',
        website: '',
        phone: '',
      });
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

  const filteredOrgs = orgs.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch = o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? o.verification_status === 'pending'
        : statusFilter === 'verified'
        ? o.verification_status === 'verified'
        : o.organization_status === 'suspended';
    return matchesSearch && matchesStatus;
  });

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
              ? 'فحص طلبات تسجيل المنظمات، منح التوثيق الرسمي، وإتاحة النشر المباشر للفعاليات.'
              : 'Audit documentation, grant direct publishing rights to trusted NGOs, and suspend rogue accounts.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRtl ? 'إضافة منظمة جديدة' : 'Add Organization'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={isRtl ? 'البحث باسم المنظمة أو البريد الإلكتروني...' : 'Search by organization name or email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
        >
          <option value="all">{isRtl ? `جميع المنظمات (${orgs.length})` : `All Organizations (${orgs.length})`}</option>
          <option value="pending">{isRtl ? `قيد المراجعة (${orgs.filter(o => o.verification_status === 'pending').length})` : `Pending Review (${orgs.filter(o => o.verification_status === 'pending').length})`}</option>
          <option value="verified">{isRtl ? `موثقة (${orgs.filter(o => o.verification_status === 'verified').length})` : `Verified (${orgs.filter(o => o.verification_status === 'verified').length})`}</option>
          <option value="suspended">{isRtl ? `معلقة (${orgs.filter(o => o.organization_status === 'suspended').length})` : `Suspended (${orgs.filter(o => o.organization_status === 'suspended').length})`}</option>
        </select>
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
              {filteredOrgs.map((org) => (
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
                          : 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                      }`}
                    >
                      {org.verification_status === 'verified'
                        ? (isRtl ? '✓ موثقة رسمياً' : '✓ Verified')
                        : org.verification_status === 'suspended'
                        ? (isRtl ? 'معلقة' : 'Suspended')
                        : (isRtl ? 'قيد التدقيق والمراجعة' : 'Pending Verification')}
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
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700/50 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'الموافقة والتوثيق' : 'Approve & Verify'}</span>
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

      {/* Modal: Add Organization */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'إضافة منظمة جديدة وتوثيقها' : 'Add & Verify New Organization'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddOrg} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'اسم المنظمة الرسمي *' : 'Organization Name *'}</label>
                <input
                  type="text"
                  required
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  placeholder="e.g. Lalish Cultural Foundation"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'البريد الإلكتروني الرسمي *' : 'Official Email *'}</label>
                <input
                  type="email"
                  required
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  placeholder="contact@org.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'نوع ونشاط المنظمة' : 'Organization Type'}</label>
                <select
                  value={addFormData.organization_type}
                  onChange={(e) => setAddFormData({ ...addFormData, organization_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Human Rights NGO">{isRtl ? 'منظمة حقوق إنسان وعدالة' : 'Human Rights NGO'}</option>
                  <option value="Cultural & Diaspora Center">{isRtl ? 'مركز ثقافي واجتماعي' : 'Cultural & Diaspora Center'}</option>
                  <option value="Youth Association">{isRtl ? 'رابطة شبابية وطلابية' : 'Youth Association'}</option>
                  <option value="Religious & Heritage Institution">{isRtl ? 'مؤسسة دينية وتراثية' : 'Religious & Heritage Institution'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'المدينة والمقر' : 'City & Address'}</label>
                <input
                  type="text"
                  required
                  value={addFormData.full_address}
                  onChange={(e) => setAddFormData({ ...addFormData, full_address: e.target.value })}
                  placeholder="e.g. Hanover, Germany"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'نبذة ووصف المنظمة *' : 'Description *'}</label>
                <textarea
                  required
                  rows={2}
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  placeholder="Brief description of goals and activities..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md disabled:opacity-50"
                >
                  {addLoading ? (isRtl ? 'جاري الإضافة...' : 'Adding...') : (isRtl ? 'إضافة وتوثيق' : 'Add & Verify')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
