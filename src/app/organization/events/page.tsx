import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { PlusCircle, Calendar, Edit, ExternalLink, Trash2 } from 'lucide-react';

export default async function OrgEventsManagementPage() {
  const org = (await db.organizations.findVerifiedPublic())[0];
  const allEvents = await db.events.findAllAdmin();
  const orgEvents = org ? allEvents.filter((e) => e.organization_id === org.id) : allEvents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white">Event Management</h1>
          <p className="text-xs text-slate-400">
            Create, update, cancel, and manage your organization&apos;s events.
          </p>
        </div>

        <Link
          href="/organization/events/new"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Event</span>
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Venue</th>
                <th className="py-3 px-4">Publishing Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orgEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                    {event.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {event.date} • {event.start_time}
                  </td>
                  <td className="py-3.5 px-4 truncate max-w-[180px]">{event.full_address}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        event.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-amber-400 font-medium">
                      {event.event_verification_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {event.status === 'published' && (
                      <Link
                        href={`/en/events/${event.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-white"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5 inline" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
