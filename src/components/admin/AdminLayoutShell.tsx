'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebarClient } from './AdminSidebarClient';
import { useAdminLanguage } from './AdminLanguageProvider';
import { PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react';

interface AdminLayoutShellProps {
  pendingSubmissionsCount: number;
  pendingChangesCount: number;
  pendingOrgsCount: number;
  openReportsCount: number;
  children: React.ReactNode;
}

export function AdminLayoutShell({
  pendingSubmissionsCount,
  pendingChangesCount,
  pendingOrgsCount,
  openReportsCount,
  children,
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const { isRtl } = useAdminLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_admin_sidebar_open');
    if (saved !== null) {
      setSidebarOpen(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !sidebarOpen;
    setSidebarOpen(nextState);
    localStorage.setItem('ezidi_admin_sidebar_open', String(nextState));
  };

  // If on login page -> DO NOT SHOW SIDEBAR AT ALL
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login');

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#070A10] text-white flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A10] text-white flex flex-col md:flex-row relative">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <span className="font-bold text-sm text-white">لوحة الإدارة</span>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar (Collapsible / Toggleable) */}
      {sidebarOpen && (
        <AdminSidebarClient
          pendingSubmissionsCount={pendingSubmissionsCount}
          pendingChangesCount={pendingChangesCount}
          pendingOrgsCount={pendingOrgsCount}
          openReportsCount={openReportsCount}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto min-h-screen">
        {/* Desktop Sidebar Open Toggle when hidden */}
        {!sidebarOpen && (
          <div className="mb-4">
            <button
              onClick={toggleSidebar}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              title="إظهار القائمة الجانبية"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span>{isRtl ? 'إظهار القائمة الجانبية' : 'Show Sidebar'}</span>
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
