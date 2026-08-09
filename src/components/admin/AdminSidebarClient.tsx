'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminLanguage } from './AdminLanguageProvider';
import {
  LayoutDashboard,
  Calendar,
  Inbox,
  GitPullRequest,
  Building2,
  Users,
  AlertTriangle,
  Layers,
  Globe2,
  Image as ImageIcon,
  ScrollText,
  Settings,
  ShieldCheck,
  LogOut,
  Globe,
  Languages,
} from 'lucide-react';

interface SidebarProps {
  pendingSubmissionsCount: number;
  pendingChangesCount: number;
  pendingOrgsCount: number;
  openReportsCount: number;
}

export function AdminSidebarClient({
  pendingSubmissionsCount,
  pendingChangesCount,
  pendingOrgsCount,
  openReportsCount,
}: SidebarProps) {
  const pathname = usePathname();
  const { lang, setLang, t } = useAdminLanguage();

  const navItems = [
    { href: '/admin', labelKey: 'overview', icon: LayoutDashboard },
    { href: '/admin/events', labelKey: 'allEvents', icon: Calendar },
    { href: '/admin/submissions', labelKey: 'submissionsQueue', icon: Inbox, count: pendingSubmissionsCount },
    { href: '/admin/pending-changes', labelKey: 'sensitiveEdits', icon: GitPullRequest, count: pendingChangesCount },
    { href: '/admin/organizations', labelKey: 'organizationsDirectPub', icon: Building2, count: pendingOrgsCount },
    { href: '/admin/reports', labelKey: 'communityReports', icon: AlertTriangle, count: openReportsCount },
    { href: '/admin/users', labelKey: 'usersRoles', icon: Users },
    { href: '/admin/categories', labelKey: 'categories', icon: Layers },
    { href: '/admin/countries', labelKey: 'countriesCities', icon: Globe2 },
    { href: '/admin/media', labelKey: 'mediaStorage', icon: ImageIcon },
    { href: '/admin/audit-logs', labelKey: 'auditTrail', icon: ScrollText },
    { href: '/admin/settings', labelKey: 'settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
            👑
          </div>
          <div>
            <span className="text-sm font-extrabold text-white block tracking-wide">
              {t('adminSaas')}
            </span>
            <span className="text-[10px] text-amber-400 font-medium tracking-wider">
              {t('platformName')}
            </span>
          </div>
        </Link>

        {/* Language Switcher Bar */}
        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1">
          <button
            onClick={() => setLang('ar')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              lang === 'ar'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>العربية (AR)</span>
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              lang === 'en'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>English (EN)</span>
          </button>
        </div>

        {/* Super Admin Status Card */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{t('superAdmin')}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-800 font-bold">
            {t('twoFactorActive')}
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-slate-800 text-amber-300 border border-slate-700 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-300' : 'text-amber-400'
                    }`}
                  />
                  <span>{t(item.labelKey)}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold font-mono border border-amber-500/40">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer shortcuts */}
      <div className="pt-5 border-t border-slate-900 space-y-2">
        <a
          href="/ar"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{t('publicWebsite')}</span>
        </a>
        <a
          href="/admin/login"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('signOut')}</span>
        </a>
      </div>
    </aside>
  );
}
