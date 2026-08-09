'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Calendar,
  MapPin,
  Building2,
  PlusCircle,
  Menu,
  X,
  Shield,
  Search,
  Globe2,
} from 'lucide-react';

export function Header() {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/events', label: t('events'), icon: Calendar },
    { href: '/map', label: t('map'), icon: MapPin },
    { href: '/organizations', label: t('organizations'), icon: Building2 },
    { href: '/countries', label: t('countries'), icon: Globe2 },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {/* Cultural 8-ray sun motif */}
                <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-yellow-200 shadow-sm shadow-amber-400/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors">
                EZIDI EVENTS
              </span>
              <span className="text-[10px] sm:text-xs text-amber-400/90 font-medium tracking-widest uppercase">
                Worldwide
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Language, Add Event CTA, Portals */}
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/events/add"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addEvent')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Link
              href="/events/add"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addEvent')}</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/organization/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700"
              >
                {t('orgPortal')}
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-amber-400 border border-slate-700"
              >
                {t('adminPortal')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
