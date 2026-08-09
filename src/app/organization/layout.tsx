import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
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
} from 'lucide-react';

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = (await db.organizations.findVerifiedPublic())[0] || (await db.organizations.findAllAdmin())[0];

  const navItems = [
    { href: '/organization/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/organization/events', label: 'My Events', icon: Calendar },
    { href: '/organization/events/new', label: 'Add Event', icon: PlusCircle },
    { href: '/organization/profile', label: 'Organization Profile', icon: Building2 },
    { href: '/organization/members', label: 'Members & Roles', icon: Users },
    { href: '/organization/media', label: 'Media Gallery', icon: ImageIcon },
    { href: '/organization/statistics', label: 'Analytics', icon: BarChart3 },
    { href: '/organization/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/organization/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              ☀️
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">ORG PORTAL</span>
              <span className="text-[10px] text-amber-400 font-medium">Ezidi Events Worldwide</span>
            </div>
          </Link>

          {/* Org Status Card */}
          {org && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">{org.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Direct Publishing:</span>
                <span className={`font-semibold ${org.direct_publishing_enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {org.direct_publishing_enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          )}

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer shortcuts */}
        <div className="pt-6 border-t border-slate-900 space-y-2">
          <Link
            href="/en"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Public Website</span>
          </Link>
          <Link
            href="/organization/login"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
