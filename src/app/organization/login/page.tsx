'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { Organization } from '@/types/database';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, Zap, CheckCircle2, Globe, Sparkles, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrgLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [email, setEmail] = useState('contact@ezidi-world.org');
  const [password, setPassword] = useState('demo123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = (localStorage.getItem('ezidi_org_lang') as 'ar' | 'en') || 'ar';
    setLang(savedLang);

    async function loadOrgs() {
      try {
        const res = await fetch('/api/organizations', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.organizations)) {
            setOrgs(data.organizations);
            if (data.organizations.length > 0) {
              setSelectedOrgId(data.organizations[0].id);
            }
          }
        }
      } catch {}
    }
    loadOrgs();
  }, []);

  const isRtl = lang === 'ar';

  const handleInstantAccess = (orgId?: string) => {
    const targetId = orgId || selectedOrgId;
    if (!targetId) return;
    localStorage.setItem('ezidi_active_org_id', targetId);
    router.push('/organization/dashboard');
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAction({
      email,
      password,
      portalType: 'organization',
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || (isRtl ? 'فشل تسجيل الدخول.' : 'Login failed.'));
    } else {
      if (selectedOrgId) {
        localStorage.setItem('ezidi_active_org_id', selectedOrgId);
      }
      router.push('/organization/dashboard');
    }
  };

  return (
    <div className={`min-h-screen bg-[#070A10] text-white flex items-center justify-center p-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        {/* Header with Language Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isRtl ? 'بوابة المنظمات المعتمدة' : 'Organization Portal'}
              </h1>
              <span className="text-[11px] text-amber-400 font-medium">
                {isRtl ? 'منصة فعاليات الإيزيديين حول العالم' : 'Ezidi Events Worldwide'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
          >
            {lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-CLICK INSTANT ACCESS BOX (Highlighted) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400">
            <Zap className="w-5 h-5 fill-amber-400" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              {isRtl ? '⚡ الدخول المباشر الفوري (بدون كلمة مرور)' : '⚡ Instant 1-Click Access (No Password Required)'}
            </h2>
          </div>

          <p className="text-xs text-slate-300">
            {isRtl
              ? 'اختر منظمتك المسجلة للدخول الفوري إلى لوحة التحكم وإدارة الفعاليات بضغطة زر واحدة:'
              : 'Select your registered organization to enter its management portal directly in 1 click:'}
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                {isRtl ? 'المنظمة المسجلة:' : 'Select Organization:'}
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/80 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.verification_status === 'verified' ? '✓ (موثقة)' : '⏳ (قيد التدقيق)'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleInstantAccess()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{isRtl ? 'دخول مباشر فوري إلى بوابة المنظمة ←' : 'Enter Organization Portal Instantly →'}</span>
            </button>
          </div>
        </div>

        {/* OR TRADITIONAL EMAIL LOGIN ACCORDION */}
        <details className="group border border-slate-800 rounded-2xl p-4 bg-slate-900/40">
          <summary className="text-xs font-semibold text-slate-400 cursor-pointer hover:text-white flex items-center justify-between">
            <span>{isRtl ? 'أو تسجيل الدخول بالبريد الإلكتروني وكلمة المرور' : 'Or Sign in with Email and Password'}</span>
            <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>

          <form onSubmit={handleFormLogin} className="mt-4 space-y-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{isRtl ? 'البريد الإلكتروني الرسمي' : 'Official Email'}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{isRtl ? 'كلمة المرور' : 'Password'}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              {loading ? (isRtl ? 'جاري الدخول...' : 'Signing In...') : (isRtl ? 'دخول بالبيانات' : 'Sign In')}
            </button>
          </form>
        </details>

        {/* Register Org Link */}
        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>{isRtl ? 'ليس لديك منظمة مسجلة بعد؟' : "Don't have a registered organization?"}</span>
          <Link
            href="/ar/organizations/register"
            className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسجيل منظمة جديدة الآن' : 'Register New Organization'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
