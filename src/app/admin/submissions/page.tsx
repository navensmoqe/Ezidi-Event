import React from 'react';
import { db } from '@/lib/db';
import { AdminSubmissionsClient } from './AdminSubmissionsClient';
import { Inbox } from 'lucide-react';

export const metadata = {
  title: 'Submissions Queue | Admin Dashboard',
};

export default async function AdminSubmissionsPage() {
  const allEvents = await db.events.findAllAdmin();
  const pendingSubmissions = allEvents.filter((e) => e.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Inbox className="w-6 h-6 text-amber-400" />
          <span>Incoming Submissions Moderation Queue</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review community and non-direct submissions. Approving an event immediately publishes it to the public directory.
        </p>
      </div>

      <AdminSubmissionsClient initialSubmissions={pendingSubmissions} allEvents={allEvents} />
    </div>
  );
}
