'use client';

import React, { useState, useEffect } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { EventItem } from '@/types/database';
import { approveSubmissionAction, rejectSubmissionAction } from '@/lib/actions/admin';
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
} from 'lucide-react';

interface AdminSubmissionsClientProps {
  initialSubmissions: EventItem[];
  allEvents: EventItem[];
}

export function AdminSubmissionsClient({
  initialSubmissions,
  allEvents,
}: AdminSubmissionsClientProps) {
  const { t, isRtl } = useAdminLanguage();
  const [submissions, setSubmissions] = useState<EventItem[]>(initialSubmissions);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; eventId: string; title: string }>({
    open: false,
    eventId: '',
    title: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveSubmissions = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/events', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          const pending = data.events.filter((e: EventItem) => e.status === 'pending');
          setSubmissions(pending);
        }
      }
    } catch {}
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchLiveSubmissions();
    const interval = setInterval(fetchLiveSubmissions, 8000);
    return () => clearInterval(interval);
  }, []);

  const adminContext = {
    id: 'user-super-admin',
    role: 'super_admin' as const,
    email: 'admin@ezidievents.org',
  };

  const handleApprove = async (eventId: string) => {
    setLoadingId(eventId);
    const res = await approveSubmissionAction(eventId, adminContext);
    setLoadingId(null);

    if (res.success) {
      setSubmissions((prev) => prev.filter((s) => s.id !== eventId));
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingId(rejectModal.eventId);

    const res = await rejectSubmissionAction(rejectModal.eventId, rejectReason, adminContext);
    setLoadingId(null);

    if (res.success) {
      setSubmissions((prev) => prev.filter((s) => s.id !== rejectModal.eventId));
      setRejectModal({ open: false, eventId: '', title: '' });
      setRejectReason('');
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">
          {isRtl ? 'طابور المراجعة فارغ تماماً' : 'Submissions Queue Clear'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {isRtl
            ? 'تمت مراجعة جميع الفعاليات المقدمة من المجتمع بنجاح. ستظهر أي طلبات جديدة هنا تلقائياً.'
            : 'All submitted events have been reviewed. New community submissions will appear here automatically.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'طابور مراجعة الفعاليات الجديدة' : 'Incoming Submissions Moderation Queue'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'مراجعة طلبات الفعاليات المقدمة من الجمهور والمنظمات قبل نشرها للعامة.'
              : 'Review community-submitted events with duplicate detection and source verification.'}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
          {submissions.length} {isRtl ? 'طلبات قيد المراجعة' : 'Pending Submissions'}
        </div>
      </div>

      {submissions.map((sub) => {
        const dupCheck = detectDuplicateEvent(sub, allEvents);

        return (
          <div
            key={sub.id}
            className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden"
          >
            {/* Header & Duplicate Warning */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-xs font-semibold border border-amber-500/40">
                    {isRtl ? 'بانتظار الموافقة' : 'Awaiting Approval'}
                  </span>
                  <span className="text-xs font-mono text-slate-500">ID: {sub.id}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{sub.title}</h3>
              </div>

              {/* Action Buttons */}
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
                  onClick={() => handleApprove(sub.id)}
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

            {/* Duplicate Detector Alert */}
            {dupCheck.isPotentialDuplicate && (
              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-amber-300">
                    {isRtl
                      ? `تنبيه: احتمال وجود فعالية مكررة (نسبة التطابق: ${dupCheck.score}%)`
                      : `Potential Duplicate Warning (Match Score: ${dupCheck.score}%)`}
                  </strong>
                  <p className="text-slate-300 text-xs">
                    {isRtl ? 'الأسباب:' : 'Reasons:'} {dupCheck.reasons.join(', ')}. {isRtl ? 'تطابق الفعالية المسجلة:' : 'Matching:'}{' '}
                    <span className="font-semibold text-white">&quot;{dupCheck.matchedEvent?.title}&quot;</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isRtl ? 'التاريخ:' : 'Date:'} <strong className="text-white font-mono">{sub.date}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isRtl ? 'الوقت:' : 'Time:'} <strong className="text-white font-mono">{sub.start_time}</strong> ({sub.timezone})
                </span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{isRtl ? 'الموقع:' : 'Venue:'} {sub.full_address}</span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wider text-[10px]">
                {isRtl ? 'ملخص ووصف الفعالية:' : 'Event Summary & Description:'}
              </span>
              {sub.description}
            </div>

            {/* Source & Contact */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              {sub.source_url && (
                <a
                  href={sub.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'رابط المصدر / الخبر' : 'View Source URL'}</span>
                </a>
              )}
              {sub.contact_email && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{sub.contact_email}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Reject Reason Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {isRtl ? 'رفض الفعالية:' : 'Reject Submission:'} &quot;{rejectModal.title}&quot;
            </h3>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isRtl
                    ? 'سبب الرفض الإلزامي * (يُرسل إلى مقدم الطلب ويُحفظ في سجل التدقيق)'
                    : 'Mandatory Rejection Reason * (Logged to Audit Trail)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={isRtl ? 'مثال: فعالية مكررة، المصدر غير موثق، العنوان غير مكتمل...' : 'e.g. Duplicate listing, unverifiable source...'}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, eventId: '', title: '' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={rejectReason.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
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
