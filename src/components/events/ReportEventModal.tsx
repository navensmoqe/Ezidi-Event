'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { submitReportAction } from '@/lib/actions/reports';
import { AlertCircle, CheckCircle, X, ShieldAlert } from 'lucide-react';

interface ReportEventModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportEventModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
}: ReportEventModalProps) {
  const t = useTranslations('reports');
  const common = useTranslations('common');

  const [reportType, setReportType] = useState('incorrect_information');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitReportAction({
      event_id: eventId,
      report_type: reportType,
      description,
      evidence_url: evidenceUrl || undefined,
      reporter_email: reporterEmail || undefined,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Failed to submit report. Please try again.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">{t('modalTitle')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Submit a correction or notice for: <strong className="text-white">&quot;{eventTitle}&quot;</strong>. All reports are handled privately by our moderation team.
        </p>

        {success ? (
          <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-emerald-200">Report Received</h4>
            <p className="text-xs text-emerald-300/80">{t('successMessage')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/70 flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('reason')}
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="incorrect_information">Inaccurate / Outdated Information</option>
                <option value="wrong_date">Incorrect Date or Time</option>
                <option value="wrong_location">Incorrect Venue / Address</option>
                <option value="cancelled_event">Event Has Been Cancelled</option>
                <option value="postponed_event">Event Has Been Postponed</option>
                <option value="duplicate_event">Duplicate Event Listing</option>
                <option value="fake_event">Fake or Unauthorized Event</option>
                <option value="spam">Spam / Inappropriate Content</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('description')} *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Explain what information is inaccurate and provide correct details..."
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Evidence URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Evidence / Source URL (Optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://example.org/announcement"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Reporter Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Email (Optional, kept strictly private)
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="you@domain.org"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                {common('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || description.length < 10}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : t('submitReport')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
