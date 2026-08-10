'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { EventItem, Organization } from '@/types/database';
import { approveSubmissionAction, rejectSubmissionAction, verifyOrganizationAction } from '@/lib/actions/admin';
import { suspendOrganizationAction } from '@/lib/actions/organizations';
import { detectDuplicateEvent } from '@/lib/utils/duplicate-detector';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Mail,
  Check,
  Inbox,
  Building2,
  Phone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface AdminSubmissionsClientProps {
  initialEvents: EventItem[];
  allEvents: EventItem[];
  initialOrganizations: Organization[];
}

export function AdminSubmissionsClient({
  initialEvents,
  allEvents,
  initialOrganizations,
}: AdminSubmissionsClientProps) {
  const { t, isRtl } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<'orgs' | 'events'>(
    initialOrganizations.length > 0 ? 'orgs' : 'events'
  );

  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);

  const [rejectModal, setRejectModal] = useState<{ open: boolean; eventId: string; title: string }>({
    open: false,
    eventId: '',
    title: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live polling for both Events and Organizations
  const fetchLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Events
      const evRes = await fetch('/api/events', { cache: 'no-store' });
      if (evRes.ok) {
        const data = await evRes.json();
        if (data.success && Array.isArray(data.events)) {
          const pending = data.events.filter((e: EventItem) => e.status === 'pending');
          setEvents(pending);
        }
      }

      // 2. Fetch Organizations
      const orgRes = await fetch('/api/organizations', { cache: 'no-store' });
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        if (orgData.success && Array.isArray(orgData.organizations)) {
          let verifiedLocal: string[] = [];
          try {
            verifiedLocal = JSON.parse(localStorage.getItem('ezidi_verified_org_ids') || '[]');
          } catch {}

          let submittedOrgs: Organization[] = [];
          try {
            submittedOrgs = JSON.parse(localStorage.getItem('ezidi_submitted_orgs') || '[]');
          } catch {}

          // Merge submitted from local if not yet in server list
          const combinedOrgs = [...orgData.organizations];
          submittedOrgs.forEach((locOrg) => {
            if (!combinedOrgs.some((o) => o.id === locOrg.id || o.name === locOrg.name)) {
              combinedOrgs.unshift(locOrg);
            }
          });

          const pendingOrgs = combinedOrgs.filter(
            (o: Organization) =>
              o.verification_status === 'pending' && !verifiedLocal.includes(o.id)
          );
          setOrgs(pendingOrgs);
        }
      }
    } catch {}
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as const,
    email: 'admin@ezidievents.org',
  };

  // Event Actions
  const handleApproveEvent = async (eventId: string) => {
    setLoadingId(eventId);
    const res = await approveSubmissionAction(eventId, adminContext);
    setLoadingId(null);

    if (res.success) {
      setEvents((prev) => prev.filter((s) => s.id !== eventId));
    }
  };

  const handleRejectEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingId(rejectModal.eventId);

    const res = await rejectSubmissionAction(rejectModal.eventId, rejectReason, adminContext);
    setLoadingId(null);

    if (res.success) {
      setEvents((prev) => prev.filter((s) => s.id !== rejectModal.eventId));
      setRejectModal({ open: false, eventId: '', title: '' });
      setRejectReason('');
    }
  };

  // Organization Actions
  const handleApproveOrg = async (orgId: string) => {
    setLoadingId(orgId);
    const res = await verifyOrganizationAction(orgId, 'Approved via Admin Submissions Queue', adminContext);
    setLoadingId(null);

    if (res.success) {
      try {
        const stored = JSON.parse(localStorage.getItem('ezidi_verified_org_ids') || '[]');
        if (!stored.includes(orgId)) {
          stored.push(orgId);
          localStorage.setItem('ezidi_verified_org_ids', JSON.stringify(stored));
        }
      } catch {}

      setOrgs((prev) => prev.filter((o) => o.id !== orgId));
    }
  };

  const totalPending = orgs.length + events.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-amber-400" />
            <span>{isRtl ? 'طابور الطلبات الجديدة والتدقيق' : 'Incoming Submissions Moderation Queue'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'مراجعة طلبات تسجيل المنظمات والفعاليات الجديدة والموافقة عليها بنقرة واحدة.'
              : 'Review and approve new organization registration requests and community events.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLiveData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
            {totalPending} {isRtl ? 'طلبات قيد التدقيق' : 'Pending Requests'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('orgs')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'orgs'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isRtl ? 'طلبات تسجيل المنظمات' : 'Organization Requests'}</span>
          {orgs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'orgs' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {orgs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isRtl ? 'طلبات نشر الفعاليات' : 'Event Submissions'}</span>
          {events.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'events' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {events.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PENDING ORGANIZATIONS */}
      {activeTab === 'orgs' && (
        <div className="space-y-4">
          {orgs.length > 0 ? (
            orgs.map((org) => (
              <div
                key={org.id}
                className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6 shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-500/[0.03] to-transparent"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-xs font-bold border border-amber-500/40">
                        {isRtl ? 'طلب تسجيل منظمة جديد 🏛️' : 'New Organization Request 🏛️'}
                      </span>
                      <span className="text-xs font-mono text-slate-500">ID: {org.id}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <span>{org.name}</span>
                      {org.name_ar && <span className="text-slate-400 text-lg font-normal">({org.name_ar})</span>}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveOrg(org.id)}
                      disabled={loadingId === org.id}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {loadingId === org.id
                          ? (isRtl ? 'جاري التوثيق...' : 'Verifying...')
                          : (isRtl ? 'الموافقة وتوثيق المنظمة ✓' : 'Approve & Verify Organization ✓')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                  {org.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{org.organization_type}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{org.full_address}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{org.email}</span>
                  </div>

                  {org.phone ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{org.phone}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{org.website || 'No website'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {isRtl ? 'لا توجد طلبات تسجيل منظمات معلقة' : 'No Pending Organization Requests'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isRtl
                  ? 'تمت مراجعة واعتماد جميع طلبات تسجيل المنظمات بنجاح.'
                  : 'All organization registration applications have been reviewed.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((sub) => {
              const dupCheck = detectDuplicateEvent(sub, allEvents);

              return (
                <div
                  key={sub.id}
                  className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-xs font-semibold border border-amber-500/40">
                          {isRtl ? 'فعالية بانتظار النشر 📅' : 'Event Awaiting Approval 📅'}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID: {sub.id}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{sub.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setRejectModal({ open: true, eventId: sub.id, title: sub.title })
                        }
                        disabled={loadingId === sub.id}
                        className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-400 text-xs font-bold border border-red-800/60 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isRtl ? 'رفض الطلب' : 'Reject'}</span>
                      </button>

                      <button
                        onClick={() => handleApproveEvent(sub.id)}
                        disabled={loadingId === sub.id}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {loadingId === sub.id
                            ? (isRtl ? 'جاري النشر...' : 'Publishing...')
                            : (isRtl ? 'الموافقة والنشر الفوري' : 'Approve & Publish Live')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {dupCheck.isPotentialDuplicate && (
                    <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold">تنبيه تكرار محتمل:</span>
                        <p>{dupCheck.reasons.join(' | ')}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                    {sub.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{sub.date} ({sub.start_time} - {sub.end_time || 'N/A'})</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{sub.full_address}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{sub.contact_email || 'No email provided'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {isRtl ? 'لا توجد فعاليات قيد المراجعة' : 'No Pending Events'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isRtl
                  ? 'تمت مراجعة ونشر جميع الفعاليات المقدمة من المجتمع بنجاح.'
                  : 'All community-submitted events have been reviewed.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-500/40 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {isRtl ? `رفض فعالية: ${rejectModal.title}` : `Reject: ${rejectModal.title}`}
            </h3>
            <form onSubmit={handleRejectEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'سبب الرفض (إلزامي):' : 'Rejection Reason (Required):'}
                </label>
                <textarea
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={isRtl ? 'يرجى كتابة سبب عدم قبول الفعالية...' : 'Enter moderation reason...'}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, eventId: '', title: '' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loadingId === rejectModal.eventId}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  {isRtl ? 'تأكيد الرفض' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
