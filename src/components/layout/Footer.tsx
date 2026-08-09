import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldCheck, Heart, Globe, Building2, Calendar, Lock } from 'lucide-react';

export function Footer() {
  const t = useTranslations('nav');
  const common = useTranslations('common');

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                ☀️
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                EZIDI EVENTS WORLDWIDE
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The independent international platform dedicated to documenting, discovering, and verifying Ezidi solidarity rallies, memorial forums, vigils, and cultural gatherings worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Public Verification & Moderation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore Directory
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/events" className="hover:text-amber-300 transition-colors">
                  {t('events')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-amber-300 transition-colors">
                  {t('map')}
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-amber-300 transition-colors">
                  {t('organizations')}
                </Link>
              </li>
              <li>
                <Link href="/countries" className="hover:text-amber-300 transition-colors">
                  {t('countries')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  {t('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Participation & Organizations */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Community & NGOs
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/events/add" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('addEvent')}</span>
                </Link>
              </li>
              <li>
                <Link href="/organizations/register" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Register NGO / Association</span>
                </Link>
              </li>
              <li>
                <Link href="/organization/dashboard" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('orgPortal')}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('adminPortal')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & GDPR */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal & Privacy
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-amber-300 transition-colors">
                  {t('privacy')} (GDPR Compliant)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-300 transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-normal">
              🔒 All private evidence and verification documents are securely protected.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Ezidi Events Worldwide. Dedicated to global community solidarity & human rights documentation.</p>
          <div className="flex items-center gap-4">
            <span className="text-amber-400/80">Independent & Non-Profit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
