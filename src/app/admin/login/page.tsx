'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_admin_lang') as 'ar' | 'en' | null;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLang(saved);
    }
  }, []);

  const isRtl = lang === 'ar';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAction({
      email,
      password,
      portalType: 'admin',
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || (isRtl ? 'فشل تسجيل الدخول. يرجى التحقق من البيانات.' : 'Authentication failed.'));
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className={`min-h-screen bg-[#070A10] text-white flex items-center justify-center p-4 w-full ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        {/* Language Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{isRtl ? 'لوحة الإدارة الآمنة' : 'Admin Security Portal'}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = lang === 'ar' ? 'en' : 'ar';
              setLang(next);
              localStorage.setItem('ezidi_admin_lang', next);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white"
          >
            {lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            👑
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isRtl ? 'تسجيل دخول الإدارة العليا' : 'Admin SaaS Dashboard'}
          </h1>
          <p className="text-xs text-slate-400">
            {isRtl
              ? 'الوصول الإداري الآمن لإدارة الفعاليات والمنظمات والتوثيق الأمني.'
              : 'Secure administrative access for moderation, verification, and oversight.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isRtl ? 'البريد الإلكتروني للإدارة' : 'Administrator Email'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isRtl ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono ${
                      isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${isRtl ? 'left-3.5' : 'right-3.5'}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
          </>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>{loading ? (isRtl ? 'جاري التحقق...' : 'Authenticating...') : (isRtl ? 'تسجيل الدخول إلى لوحة الإدارة' : 'Sign In to Admin Panel')}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center space-y-2 text-xs text-slate-400">
          <Link href="/ar" className="hover:text-white transition-colors flex items-center justify-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>{isRtl ? 'العودة للموقع العام ←' : 'Return to Public Website ←'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
