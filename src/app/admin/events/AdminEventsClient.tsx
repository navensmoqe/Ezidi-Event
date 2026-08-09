'use client';

import React, { useState } from 'react';
import { EventItem } from '@/types/database';
import { updateEventVerificationAction } from '@/lib/actions/admin';
import { softDeleteEventAction } from '@/lib/actions/events';
import { EventVerificationBadge } from '@/components/ui/EventVerificationBadge';
import { Search, ShieldCheck, Trash2, ExternalLink, AlertTriangle, Check, X } from 'lucide-react';
import Link from 'next/link';

interface AdminEventsClientProps {
  initialEvents: EventItem[];
}

export function AdminEventsClient({ initialEvents }: AdminEventsClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reason modal state for destructive actions
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    eventId: string;
    actionType: 'soft_delete' | 'unverify';
    eventTitle: string;
  }>({
    open: false,
    eventId: '',
    actionType: 'soft_delete',
    eventTitle: '',
  });
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = events.filter((e) => {
    const matchesStatus = statusFilter === 'all' ? true : e.status === statusFilter;
    const matchesSearch =
      search.trim() === ''
        ? true
        : e.title.toLowerCase().includes(search.toLowerCase()) ||
          (e.organizer_name && e.organizer_name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleVerify = async (eventId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'admin_verified' ? 'unverified' : 'admin_verified';
    const adminContext = { id: 'user-super-admin', role: 'super_admin' as any, email: 'admin@ezidievents.org' };

    const res = await updateEventVerificationAction(eventId, nextStatus, 'Verified via admin panel', adminContext);
    if (res.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, event_verification_status: nextStatus } : e))
      );
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const adminContext = { id: 'user-super-admin', role: 'super_admin' as any, email: 'admin@ezidievents.org' };

    if (actionModal.actionType === 'soft_delete') {
      const res = await softDeleteEventAction(actionModal.eventId, reason, adminContext);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e.id !== actionModal.eventId));
      }
    }

    setLoading(false);
    setActionModal({ open: false, eventId: '', actionType: 'soft_delete', eventTitle: '' });
    setReason('');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title or organizer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-400 font-semibold shrink-0">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All ({events.length})</option>
            <option value="published">Published</option>
            <option value="pending">Pending Review</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Event Title</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((event) => (
                <tr key={event.id} className="hover:bg-slate-900/50">
                  <td className="py-3.5 px-4 max-w-xs truncate font-semibold text-white">
                    {event.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {event.date} • {event.start_time}
                  </td>
                  <td className="py-3.5 px-4 truncate max-w-[160px]">{event.full_address}</td>
                  <td className="py-3.5 px-4">
                    <EventVerificationBadge
                      status={event.status}
                      verificationStatus={event.event_verification_status}
                      size="sm"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleVerify(event.id, event.event_verification_status)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        event.event_verification_status === 'admin_verified'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {event.event_verification_status === 'admin_verified' ? '✓ Verified' : 'Mark Verified'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {event.status === 'published' && (
                      <Link
                        href={`/en/events/${event.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white inline-flex items-center"
                        title="View Public Event Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    <button
                      onClick={() =>
                        setActionModal({
                          open: true,
                          eventId: event.id,
                          actionType: 'soft_delete',
                          eventTitle: event.title,
                        })
                      }
                      className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900/60 border border-red-800/40 inline-flex items-center"
                      title="Soft Delete (Requires Reason)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Reason Modal for Administrative Actions */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Administrative Action Required</h3>
              </div>
              <button
                onClick={() => setActionModal({ open: false, eventId: '', actionType: 'soft_delete', eventTitle: '' })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are performing an administrative action on: <strong className="text-white">&quot;{actionModal.eventTitle}&quot;</strong>.
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mandatory Administrative Reason * (Saved to Audit Log)
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the justification for this administrative decision (minimum 5 characters)..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, eventId: '', actionType: 'soft_delete', eventTitle: '' })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || reason.trim().length < 5}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? 'Executing...' : 'Confirm & Log to Audit Trail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
