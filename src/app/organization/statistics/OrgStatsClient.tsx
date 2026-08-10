'use client';

import React from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { BarChart3, TrendingUp, Eye, Users, MapPin, Share2 } from 'lucide-react';

export function OrgStatsClient() {
  const { t, isRtl } = useOrgLanguage();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          <span>{isRtl ? 'التحليلات ومؤشرات الوصول' : 'Organization Event Analytics'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isRtl
            ? 'متابعة إحصائيات المشاهدات، التفاعل، والنقرات على مواقع فعاليات المنظمة.'
            : 'Audience engagement insights and public event view metrics.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">{isRtl ? 'إجمالي المشاهدات' : 'Total Views'}</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-white font-mono block">2,480</span>
          <span className="text-xs text-emerald-400 font-medium">{isRtl ? '↑ +32% هذا الشهر' : '↑ +32% this month'}</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">{isRtl ? 'نقرات خرائط Google' : 'Google Maps Clicks'}</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400 font-mono block">428</span>
          <span className="text-xs text-slate-400 font-medium">{isRtl ? 'توجيهات مباشرة لموقع الفعالية' : 'Direct venue clicks'}</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">{isRtl ? 'المشاركات عبر الشبكات' : 'Social Shares'}</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400 font-mono block">315</span>
          <span className="text-xs text-slate-400 font-medium">{isRtl ? 'مشاركات عبر واتساب وفيسبوك' : 'Social & direct shares'}</span>
        </div>
      </div>
    </div>
  );
}
