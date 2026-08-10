'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { Organization } from '@/types/database';
import { verifyOrganizationAction } from '@/lib/actions/admin';
import {
  toggleDirectPublishingAction,
  suspendOrganizationAction,
  registerOrganizationAction,
  adminResetOrgPasswordAction,
} from '@/lib/actions/organizations';
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  AlertTriangle,
  Building2,
  Zap,
  ZapOff,
  PlusCircle,
  Search,
  Globe,
  Mail,
  RefreshCw,
  KeyRound,
  Copy,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

interface AdminOrgsClientProps {
  initialOrganizations: Organization[];
}

export function AdminOrgsClient({ initialOrganizations }: AdminOrgsClientProps) {
  const { t, isRtl } = useAdminLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveOrgs = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/organizations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.organizations)) {
          setOrgs(data.organizations);
        }
      }
    } catch {}
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLiveOrgs();
    const interval = setInterval(fetchLiveOrgs, 8000);
    return () => clearInterval(interval);
  }, [fetchLiveOrgs]);

  // Credentials Modal State
  const [credModal, setCredModal] = useState<{
    open: boolean;
    org: Organization | null;
    customPassword: string;
    copied: boolean;
    saved: boolean;
    error: string | null;
  }>({
    open: false,
    org: null,
    customPassword: '',
    copied: false,
    saved: false,
    error: null,
  });

  // Add Org Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    name_ar: '',
    password: '',
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

  const handleOpenCreds = (org: Organization) => {
    setCredModal({
      open: true,
      org,
      customPassword: org.password || 'Ezidi@2026',
      copied: false,
      saved: false,
      error: null,
    });
  };

  const handleSaveCredPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credModal.org) return;

    const res = await adminResetOrgPasswordAction(
      credModal.org.id,
      credModal.customPassword,
      adminContext
    );

    if (res.success) {
      setCredModal((prev) => ({ ...prev, saved: true, error: null }));
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === credModal.org?.id ? { ...o, password: credModal.customPassword } : o
        )
      );
      setTimeout(() => setCredModal((prev) => ({ ...prev, saved: false })), 3000);
    } else {
      setCredModal((prev) => ({ ...prev, error: res.error || 'Failed to save password' }));
    }
  };

  const handleCopyCredentials = () => {
    if (!credModal.org) return;
    const text = `بيانات الدخول لبوابة المنظمة:\nالمنظمة: ${credModal.org.name}\nالبريد: ${credModal.org.email}\nكلمة المرور: ${credModal.customPassword}\nرابط الدخول: https://bespoke-belekoy-66c19b.netlify.app/organization/login`;
    navigator.clipboard.writeText(text);
    setCredModal((prev) => ({ ...prev, copied: true }));
    setTimeout(() => setCredModal((prev) => ({ ...prev, copied: false })), 3000);
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
        password: '',
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

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) return;

    setLoading(true);

    if (modalState.actionType === 'toggle_direct_pub') {
      const res = await toggleDirectPublishingAction(
        modalState.orgId,
        !!modalState.targetValue,
        reason,
        adminContext
      );
      if (res.success) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === modalState.orgId
              ? { ...o, direct_publishing_enabled: !!modalState.targetValue }
              : o
          )
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

  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.email?.toLowerCase().includes(search.toLowerCase()) ||
      org.organization_type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && org.verification_status === 'verified') ||
      (statusFilter === 'pending' && org.verification_status === 'pending') ||
      (statusFilter === 'suspended' && org.organization_status === 'suspended');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-400" />
            <span>{isRtl ? 'إدارة المنظمات والمؤسسات المعتمدة' : 'Organizations & Verification'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'مراجعة طلبات الانضمام، إرسال وتعديل بيانات الدخول، ومنح صلاحيات النشر المباشر.'
              : 'Review registrations, manage login credentials, and grant direct publishing rights.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchLiveOrgs}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            title={isRtl ? 'تحديث حي للبيانات' : 'Live refresh'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRtl ? 'تحديث حي' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isRtl ? 'إضافة منظمة جديدة' : 'Add Organization'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-500 absolute top-3 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={isRtl ? 'البحث بالاسم، البريد أو النوع...' : 'Search by name, email, or type...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {['all', 'verified', 'pending', 'suspended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' && (isRtl ? 'الكل' : 'All')}
              {tab === 'verified' && (isRtl ? 'الموثقة' : 'Verified')}
              {tab === 'pending' && (isRtl ? 'قيد المراجعة' : 'Pending')}
              {tab === 'suspended' && (isRtl ? 'الموقوفة' : 'Suspended')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'المنظمة' : 'Organization'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'النوع والمقر' : 'Type & HQ'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'حالة التوثيق' : 'Verification'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'النشر المباشر' : 'Direct Pub'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? 'الحالة' : 'Status'}</th>
                <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{isRtl ? 'الإجراءات وبيانات الدخول' : 'Actions & Credentials'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-amber-400 shrink-0 border border-slate-700">
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{org.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{org.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="block text-slate-300 font-medium">{org.organization_type}</span>
                    <span className="text-[11px] text-slate-500">{org.full_address}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {org.verification_status === 'verified' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800 text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'موثقة رسمياً' : 'Verified'}</span>
                      </span>
                    ) : org.verification_status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 font-bold border border-amber-800 text-[10px]">
                        <span>⏳ {isRtl ? 'قيد المراجعة' : 'Pending Review'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 font-bold border border-red-800 text-[10px]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'موقوفة' : 'Suspended'}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {org.direct_publishing_enabled ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                        <Zap className="w-4 h-4 fill-emerald-400" />
                        <span>{isRtl ? 'مفعّل (نشر فوري)' : 'Enabled (Instant)'}</span>
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
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Credentials Button */}
                      <button
                        onClick={() => handleOpenCreds(org)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1 transition-all"
                        title={isRtl ? 'عرض ونسخ وتعديل بيانات الدخول' : 'View & Copy Login Credentials'}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'بيانات الدخول' : 'Credentials'}</span>
                      </button>

                      {org.verification_status !== 'verified' && (
                        <button
                          onClick={() => handleVerify(org.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700/50 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'توثيق' : 'Verify'}</span>
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
                          ? (isRtl ? 'تعطيل النشر' : 'Disable Pub')
                          : (isRtl ? 'منح النشر' : 'Grant Pub')}
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
                          className="px-2 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 font-semibold text-xs border border-red-800"
                        >
                          {isRtl ? 'تعليق' : 'Suspend'}
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

      {/* Modal: View & Manage Organization Credentials */}
      {credModal.open && credModal.org && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-amber-500/50 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'بيانات دخول المنظمة (إرسال / تعديل)' : 'Organization Login Credentials'}</span>
              </h3>
              <button
                onClick={() => setCredModal((prev) => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {credModal.saved && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isRtl ? 'تم حفظ كلمة المرور الجديدة بنجاح!' : 'Password updated successfully!'}</span>
              </div>
            )}

            {credModal.error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs">
                <span>{credModal.error}</span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">
                {isRtl ? 'اسم المنظمة:' : 'Organization:'}{' '}
                <strong className="text-white">{credModal.org.name}</strong>
              </div>
              <div className="text-slate-400">
                {isRtl ? 'البريد الإلكتروني الرسمي:' : 'Login Email:'}{' '}
                <strong className="text-amber-300 font-mono">{credModal.org.email}</strong>
              </div>
              <div className="text-slate-400">
                {isRtl ? 'رابط بوابة الدخول:' : 'Portal URL:'}{' '}
                <strong className="text-slate-300 font-mono">/organization/login</strong>
              </div>
            </div>

            <form onSubmit={handleSaveCredPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-300 mb-1">
                  {isRtl ? 'كلمة المرور الخاصة بالمنظمة (يمكنك تعديلها وحفظها):' : 'Organization Password:'}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    value={credModal.customPassword}
                    onChange={(e) =>
                      setCredModal((prev) => ({ ...prev, customPassword: e.target.value }))
                    }
                    className={`w-full bg-slate-950 border border-amber-500/80 rounded-xl py-2.5 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
                >
                  {isRtl ? 'حفظ كلمة السر' : 'Save Password'}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  {credModal.copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isRtl ? 'تم النسخ بنجاح ✓' : 'Copied! ✓'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isRtl ? 'نسخ البيانات للإرسال' : 'Copy Credentials'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'اسم المنظمة بالعربية' : 'Arabic Name'}</label>
                <input
                  type="text"
                  value={addFormData.name_ar}
                  onChange={(e) => setAddFormData({ ...addFormData, name_ar: e.target.value })}
                  placeholder="مؤسسة لالش الثقافية"
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
                  placeholder="contact@lalish-center.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-300 mb-1">{isRtl ? 'كلمة المرور المخصصة للدخول' : 'Initial Password'}</label>
                <input
                  type="text"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  placeholder="Ezidi@2026"
                  className="w-full bg-slate-900 border border-amber-500/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'نوع المنظمة' : 'Organization Type'}</label>
                <select
                  value={addFormData.organization_type}
                  onChange={(e) => setAddFormData({ ...addFormData, organization_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Human Rights NGO">{isRtl ? 'منظمة حقوق إنسان' : 'Human Rights NGO'}</option>
                  <option value="Cultural Association">{isRtl ? 'مركز ثقافي وتراثي' : 'Cultural Association'}</option>
                  <option value="Youth Association">{isRtl ? 'رابطة شبابية' : 'Youth Association'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'العنوان والمقر' : 'Full Address'}</label>
                <input
                  type="text"
                  required
                  value={addFormData.full_address}
                  onChange={(e) => setAddFormData({ ...addFormData, full_address: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  {addLoading ? (isRtl ? 'جاري الإضافة...' : 'Adding...') : (isRtl ? 'إضافة وتوثيق المنظمة' : 'Add & Verify')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mandatory Reason for Direct Pub / Suspend */}
      {modalState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'سبب الإجراء الإداري (إلزامي)' : 'Mandatory Reason Required'}</span>
              </h3>
              <button
                onClick={() => setModalState({ open: false, orgId: '', orgName: '', actionType: 'toggle_direct_pub' })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {modalState.actionType === 'toggle_direct_pub'
                ? isRtl
                  ? `أنت على وشك ${modalState.targetValue ? 'منح' : 'تعطيل'} صلاحية النشر المباشر لمنظمة "${modalState.orgName}". يرجى كتابة السبب للتدقيق.`
                  : `You are modifying direct publishing for "${modalState.orgName}". Reason is logged for audit.`
                : isRtl
                ? `أنت على وشك تعليق منظمة "${modalState.orgName}". سيتم إيقاف صلاحياتها فوراً.`
                : `You are about to suspend "${modalState.orgName}". All permissions will be revoked.`}
            </p>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {isRtl ? 'سبب التغيير (5 أحرف على الأقل) *' : 'Audit Reason (min 5 chars) *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isRtl ? 'اكتب سبب المنح أو التعليق...' : 'Enter reason for this action...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalState({ open: false, orgId: '', orgName: '', actionType: 'toggle_direct_pub' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading || reason.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {loading ? (isRtl ? 'جاري التنفيذ...' : 'Processing...') : (isRtl ? 'تأكيد وحفظ' : 'Confirm Action')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
