import React from 'react';
import { db } from '@/lib/db';
import { AdminEventsClient } from './AdminEventsClient';
import { Calendar, ShieldCheck, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'All Events Management | Admin Dashboard',
};

export default async function AdminEventsPage() {
  const events = await db.events.findAllAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>Event Moderation & Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control publication status, verification badges, soft deletion, and event lifecycle.
          </p>
        </div>

        <Link
          href="/events/add"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Event Form</span>
        </Link>
      </div>

      <AdminEventsClient initialEvents={events} />
    </div>
  );
}
