'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useOrgLanguage } from './OrgLanguageProvider';
import { Organization } from '@/types/database';
import { logoutAction } from '@/lib/actions/auth';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Building2,
  Users,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Globe,
  Sparkles,
} from 'lucide-react';

interface OrgSidebarClientProps {
  organization: Organization;
}

export function OrgSidebarClient({ organization }: OrgSidebarClientProps) {
  const { lang, setLang, t, isRtl } = useOrgLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    localStorage.removeItem('ezidi_active_org_id');
    router.push('/organization/login');
  };

  const navItems = [
    { href: '/organization/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/organization/events', label: t('myEvents'), icon: Calendar },
    { href: '/organization/events/new', label: t('addEvent'), icon: PlusCircle },
    { href: '/organization/profile', label: t('orgProfile'), icon: Building2 },
    { href: '/organization/members', label: t('members'), icon: Users },
    { href: '/organization/media', label: t('mediaGallery'), icon: ImageIcon },
    { href: '/organization/statistics', label: t('analytics'), icon: BarChart3 },
    { href: '/organization/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-950 border-r md:border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="space-y-5">
        {/* Portal Header */}
        <Link href="/organization/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
            ☀️
          </div>
          <div>
            <span className="text-sm font-extrabold text-white block">
              {t('portalName')}
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
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              lang === 'ar'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>العربية (AR)</span>
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              lang === 'en'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>English (EN)</span>
          </button>
        </div>

        {/* Authenticated Organization Identity Card (Isolated to logged-in org only) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {isRtl ? 'حساب المنظمة:' : 'Organization Account:'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {organization.verification_status === 'verified'
                ? (isRtl ? '✓ موثقة رسمياً' : '✓ Verified')
                : (isRtl ? '⏳ قيد التدقيق' : '⏳ Pending')}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
              {organization.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate" title={organization.name}>
                {organization.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate block" title={organization.email}>
                {organization.email}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">{t('directPublishing')}:</span>
            <span
              className={`font-semibold ${
                organization.direct_publishing_enabled
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {organization.direct_publishing_enabled
                ? (isRtl ? 'مفعّل ✓' : 'Active ✓')
                : (isRtl ? 'معطّل' : 'Disabled')}
            </span>
          </div>
        </div>

        {/* Nav List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer shortcuts */}
      <div className="pt-5 border-t border-slate-900 space-y-1.5">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{t('publicWebsite')}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
