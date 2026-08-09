import React from 'react';
import { db } from '@/lib/db';
import { PendingChangesClient } from './PendingChangesClient';
import { GitPullRequest } from 'lucide-react';

export const metadata = {
  title: 'Sensitive Changes Diff Review | Admin Dashboard',
};

export default async function AdminPendingChangesPage() {
  const pendingChanges = await db.events.getPendingChanges();
  const allEvents = await db.events.findAllAdmin();

  const enrichedChanges = pendingChanges.map((change) => ({
    ...change,
    currentEvent: allEvents.find((e) => e.id === change.event_id),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <GitPullRequest className="w-6 h-6 text-blue-400" />
          <span>Sensitive Changes Side-by-Side Diff Review</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          When an organization edits sensitive fields (date, time, venue, coordinates) of an already published event, the live version remains active while proposed changes are reviewed here.
        </p>
      </div>

      <PendingChangesClient initialChanges={enrichedChanges} />
    </div>
  );
}
