'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setPasswordAction } from '@/lib/actions/auth';

export default function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? 'رابط الدعوة غير صالح أو انتهت صلاحيته. اطلب دعوة جديدة.' : null
  );
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setLoading(true);
    const result = await setPasswordAction(password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'تعذر تعيين كلمة المرور.');
      return;
    }
    router.replace(result.redirectTo || '/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-7 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-white">تعيين كلمة المرور</h1>
          <p className="text-sm leading-6 text-slate-400">اختر كلمة مرور قوية لإكمال إعداد حسابك في منصة Ezidi Events.</p>
        </div>

        {error && <p className="rounded-xl border border-red-800 bg-red-950/70 p-3 text-sm text-red-200">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5 text-sm font-semibold text-slate-200">
            <span>كلمة المرور الجديدة</span>
            <span className="relative block">
              <LockKeyhole className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={12}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pr-10 pl-3 text-left text-white outline-none focus:border-amber-500"
              />
            </span>
          </label>
          <label className="block space-y-1.5 text-sm font-semibold text-slate-200">
            <span>تأكيد كلمة المرور</span>
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={12}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-left text-white outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-400 py-3 font-black text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور والدخول'}
          </button>
        </form>
      </section>
    </main>
  );
}
