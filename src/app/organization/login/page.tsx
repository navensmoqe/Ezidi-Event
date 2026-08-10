'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrgLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = (localStorage.getItem('ezidi_org_lang') as 'ar' | 'en') || 'ar';
    setLang(savedLang);
  }, []);

  const isRtl = lang === 'ar';

  const handleLogin = async (e: React.FormEvent) => {
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
      setError(res.error || (isRtl ? 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة السر.' : 'Invalid credentials. Please verify your email and password.'));
    } else {
      if (res.organization) {
        localStorage.setItem('ezidi_active_org_id', res.organization.id);
      }
      router.push('/organization/dashboard');
    }
  };

  return (
    <div className={`min-h-screen bg-[#070A10] text-white flex items-center justify-center p-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        {/* Header with Language Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                {isRtl ? 'دخول بوابة المنظمات' : 'Organization Portal'}
              </h1>
              <span className="text-[11px] text-amber-400 font-medium">
                {isRtl ? 'تسجيل الدخول بالبريد وكلمة السر' : 'Secure Credential Login'}
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isRtl ? 'البريد الإلكتروني الرسمي للمنظمة' : 'Official Contact Email'}
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@your-organization.org"
                className={`w-full py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isRtl ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                  isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 ${isRtl ? 'left-3.5' : 'right-3.5'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? (isRtl ? 'جاري التحقق والدخول...' : 'Authenticating...') : (isRtl ? 'تسجيل الدخول إلى البوابة' : 'Sign In to Dashboard')}</span>
            </button>
          </div>
        </form>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <span className="font-bold text-slate-300 block flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'ملاحظة للمنظمات المعتمدة:' : 'For Verified Organizations:'}</span>
          </span>
          <p className="leading-relaxed">
            {isRtl
              ? 'يتم إرسال بيانات الدخول (البريد وكلمة السر) من قِبل إدارة المنصة، ويمكن لصاحب المنظمة تغيير كلمة المرور وتعديل كافة البيانات من داخل لوحة التحكم بعد الدخول.'
              : 'Login credentials are provided by platform administrators. You can update your password and details anytime from within your organization settings.'}
          </p>
        </div>

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
