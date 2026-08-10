'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useOrgLanguage } from './OrgLanguageProvider';
import { Organization } from '@/types/database';
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
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface OrgSidebarClientProps {
  initialOrganizations: Organization[];
}

export function OrgSidebarClient({ initialOrganizations }: OrgSidebarClientProps) {
  const { lang, setLang, t, isRtl } = useOrgLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);
  const [activeOrgId, setActiveOrgId] = useState<string>(
    initialOrganizations[0]?.id || 'org-ezidi-world'
  );

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_active_org_id');
    if (saved && orgs.some((o) => o.id === saved)) {
      setActiveOrgId(saved);
    } else if (orgs[0]) {
      setActiveOrgId(orgs[0].id);
    }
  }, [orgs]);

  // Fetch updated cloud organizations on mount
  useEffect(() => {
    async function loadCloudOrgs() {
      try {
        const res = await fetch('/api/organizations', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.organizations)) {
            setOrgs(data.organizations);
          }
        }
      } catch {}
    }
    loadCloudOrgs();
  }, []);

  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  const handleSelectOrg = (orgId: string) => {
    setActiveOrgId(orgId);
    localStorage.setItem('ezidi_active_org_id', orgId);
    router.refresh();
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

        {/* Active Organization Switcher Card */}
        {activeOrg && (
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                {isRtl ? 'المنظمة الحالية:' : 'Active Organization:'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeOrg.verification_status === 'verified'
                  ? (isRtl ? '✓ موثقة' : '✓ Verified')
                  : (isRtl ? 'قيد التدقيق' : 'Pending')}
              </span>
            </div>

            <div className="relative">
              <select
                value={activeOrg.id}
                onChange={(e) => handleSelectOrg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 appearance-none cursor-pointer pr-6"
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">{t('directPublishing')}:</span>
              <span
                className={`font-semibold ${
                  activeOrg.direct_publishing_enabled
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {activeOrg.direct_publishing_enabled
                  ? (isRtl ? 'مفعّل ✓' : 'Active ✓')
                  : (isRtl ? 'معطّل' : 'Disabled')}
              </span>
            </div>
          </div>
        )}

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
        <Link
          href="/organization/login"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-400 hover:bg-amber-950/30 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isRtl ? 'تبديل المنظمة / الدخول السريع' : 'Switch Org / Quick Access'}</span>
        </Link>
      </div>
    </aside>
  );
}
