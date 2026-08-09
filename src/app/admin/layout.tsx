import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
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
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allEvents = await db.events.findAllAdmin();
  const pendingSubmissions = allEvents.filter((e) => e.status === 'pending');
  const pendingChanges = await db.events.getPendingChanges();
  const allOrgs = await db.organizations.findAllAdmin();
  const pendingOrgs = allOrgs.filter((o) => o.verification_status === 'pending');
  const allReports = await db.reports.getAllAdmin();
  const openReports = allReports.filter((r) => r.status === 'open');

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/events', label: 'All Events', icon: Calendar },
    { href: '/admin/submissions', label: 'Submissions Queue', icon: Inbox, count: pendingSubmissions.length },
    { href: '/admin/pending-changes', label: 'Sensitive Edits Diff', icon: GitPullRequest, count: pendingChanges.length },
    { href: '/admin/organizations', label: 'Organizations & Direct Pub', icon: Building2, count: pendingOrgs.length },
    { href: '/admin/reports', label: 'Community Reports', icon: AlertTriangle, count: openReports.length },
    { href: '/admin/users', label: 'Users & Roles', icon: Users },
    { href: '/admin/categories', label: 'Event Categories', icon: Layers },
    { href: '/admin/countries', label: 'Countries & Cities', icon: Globe2 },
    { href: '/admin/media', label: 'Media & Storage', icon: ImageIcon },
    { href: '/admin/audit-logs', label: 'Audit Trail', icon: ScrollText },
    { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              👑
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">ADMIN SAAS</span>
              <span className="text-[10px] text-amber-400 font-medium tracking-wider uppercase">
                Ezidi Events Platform
              </span>
            </div>
          </Link>

          {/* Super Admin Status Card */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Super Admin</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-800">
              2FA ACTIVE
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
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
        <div className="pt-6 border-t border-slate-900 space-y-2">
          <Link
            href="/en"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Public Website</span>
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
