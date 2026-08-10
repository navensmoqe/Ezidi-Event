'use client';

import React, { useState } from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Settings, Lock, Bell, Shield, CheckCircle2, Save } from 'lucide-react';

export function OrgSettingsClient() {
  const { t, isRtl } = useOrgLanguage();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
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
            ? 'تخصيص تفضيلات التنبيهات، إشعارات المراجعة الإدارية، وإجراءات الأمان.'
            : 'Manage your organization notification preferences and security credentials.'}
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'تم حفظ التفضيلات بنجاح!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
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
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'أمان المنظمة والتحقق بخطوتين' : 'Security & Verification'}</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">{isRtl ? 'حالة التوثيق الرسمي' : 'Official Verification Status'}</span>
              <span className="text-xs text-slate-400">{isRtl ? 'المنظمة موثقة ومعتمدة من الإدارة' : 'Organization is verified and active'}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
              {isRtl ? '✓ موثقة' : '✓ Verified'}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isRtl ? 'حفظ الإعدادات' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
