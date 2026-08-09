'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { EventItem } from '@/types/database';
import { formatViewerLocalTime } from '@/lib/utils/timezone';
import { ReportEventModal } from '@/components/events/ReportEventModal';
import { Share2, AlertTriangle, Check, Clock } from 'lucide-react';

interface EventDetailClientActionsProps {
  event: EventItem;
}

export function EventDetailClientActions({ event }: EventDetailClientActionsProps) {
  const t = useTranslations('events');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewerTime, setViewerTime] = useState<string | null>(null);

  useEffect(() => {
    const formatted = formatViewerLocalTime(event.date, event.start_time, event.timezone);
    setViewerTime(formatted);
  }, [event.date, event.start_time, event.timezone]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Ezidi Event: ${event.title}`,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Viewer Local Time Converter Banner */}
      {viewerTime && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('viewerTime')}</span>
          </div>
          <p className="text-slate-300 font-mono">{viewerTime}</p>
        </div>
      )}

      {/* Action Buttons: Share & Report */}
      <div className="space-y-2">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Event</span>
            </>
          )}
        </button>

        <button
          onClick={() => setReportModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900/60 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs font-medium border border-slate-800 hover:border-red-900/60 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t('reportEvent')}</span>
        </button>
      </div>

      <ReportEventModal
        eventId={event.id}
        eventTitle={event.title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
