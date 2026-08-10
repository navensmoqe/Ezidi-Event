'use client';

import React, { useState } from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Organization } from '@/types/database';
import { updateOrganizationProfileAction } from '@/lib/actions/organizations';
import { Settings, Lock, Bell, Shield, CheckCircle2, Save, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface OrgSettingsClientProps {
  organization: Organization;
}

export function OrgSettingsClient({ organization }: OrgSettingsClientProps) {
  const { t, isRtl } = useOrgLanguage();
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 4) {
      setPasswordError(isRtl ? 'كلمة المرور يجب أن تكون 4 خانات على الأقل.' : 'Password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isRtl ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await updateOrganizationProfileAction(organization.id, {
      password: newPassword,
    });
    setLoading(false);

    if (res.success) {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 5000);
    } else {
      setPasswordError(res.error || (isRtl ? 'تعذر تغيير كلمة المرور.' : 'Failed to update password.'));
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>{isRtl ? 'إعدادات الحساب والأمان' : 'Organization Account Settings'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isRtl
            ? `تعديل كلمة المرور وتفضيلات الإشعارات لمنظمة: "${organization.name}".`
            : `Manage password and notification preferences for "${organization.name}".`}
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'تم حفظ التفضيلات بنجاح!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      {/* 1. Dedicated Change Password Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
          <KeyRound className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">
            {isRtl ? 'تغيير كلمة المرور الخاصة ببوابة المنظمة' : 'Change Portal Password'}
          </h3>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isRtl ? '✓ تم تحديث كلمة المرور بنجاح! يمكنك الآن الدخول بكلمة السر الجديدة.' : '✓ Password changed successfully!'}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'كلمة المرور الجديدة *' : 'New Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${isRtl ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'تأكيد كلمة المرور الجديدة *' : 'Confirm New Password *'}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? (isRtl ? 'جاري التحديث...' : 'Updating...') : (isRtl ? 'تحديث كلمة المرور' : 'Update Password')}</span>
          </button>
        </form>
      </div>

      {/* 2. Notifications Form */}
      <form onSubmit={handleSaveNotifications} className="space-y-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'تفضيلات الإشعارات والتنبيهات' : 'Notification Alerts'}</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500" />
              <div>
                <span className="font-semibold text-white block">
                  {isRtl ? 'إشعارات قبول ومراجعة الفعاليات' : 'Event Moderation & Verification Alerts'}
                </span>
                <span className="text-xs text-slate-400">
                  {isRtl
                    ? 'إرسال تنبيه بالبريد فور قيام إدارة المنصة بقبول أو اعتماد أو نشر فعاليات المنظمة.'
                    : 'Notify me when an administrator reviews or verifies our event submissions.'}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500" />
              <div>
                <span className="font-semibold text-white block">
                  {isRtl ? 'تنبيهات البلاغات واقتراحات التعديل' : 'Community Correction Alerts'}
                </span>
                <span className="text-xs text-slate-400">
                  {isRtl
                    ? 'استلام تنبيه عند تقديم أي تعديل أو تصحيح لموقع أو توقيت فعاليات المنظمة.'
                    : 'Receive alerts when community members submit corrections or reports.'}
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isRtl ? 'حفظ تفضيلات الإشعارات' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
