import React from 'react';
import { BarChart3, TrendingUp, Eye, Users } from 'lucide-react';

export default function OrgStatisticsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <span>Organization Event Analytics</span>
        </h1>
        <p className="text-xs text-slate-400">
          Audience engagement insights and public event view metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Views</span>
          <span className="text-3xl font-black text-white font-mono block">1,840</span>
          <span className="text-xs text-emerald-400 font-medium">↑ +24% this month</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Google Maps Navigation Clicks</span>
          <span className="text-3xl font-black text-amber-400 font-mono block">312</span>
          <span className="text-xs text-slate-400 font-medium">Direct venue clicks</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Shares</span>
          <span className="text-3xl font-black text-purple-400 font-mono block">189</span>
          <span className="text-xs text-slate-400 font-medium">Social & direct shares</span>
        </div>
      </div>
    </div>
  );
}
