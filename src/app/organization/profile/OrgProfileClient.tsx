'use client';

import React, { useState, useEffect } from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Organization } from '@/types/database';
import { updateOrganizationProfileAction } from '@/lib/actions/organizations';
import { Building2, Save, MapPin, Globe, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrgProfileClientProps {
  initialOrganizations: Organization[];
}

export function OrgProfileClient({ initialOrganizations }: OrgProfileClientProps) {
  const { t, isRtl } = useOrgLanguage();
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);
  const [activeOrgId, setActiveOrgId] = useState<string>(initialOrganizations[0]?.id || '');
  const [formData, setFormData] = useState<Partial<Organization>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ezidi_active_org_id');
    if (saved && orgs.some((o) => o.id === saved)) {
      setActiveOrgId(saved);
    } else if (orgs[0]) {
      setActiveOrgId(orgs[0].id);
    }
  }, [orgs]);

  useEffect(() => {
    const active = orgs.find((o) => o.id === activeOrgId) || orgs[0];
    if (active) {
      setFormData({
        name: active.name,
        name_ar: active.name_ar,
        description: active.description,
        email: active.email,
        phone: active.phone,
        website: active.website,
        full_address: active.full_address,
      });
    }
  }, [activeOrgId, orgs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const active = orgs.find((o) => o.id === activeOrgId) || orgs[0];
    if (!active) return;

    const res = await updateOrganizationProfileAction(active.id, formData, {
      id: 'user-org-admin',
      role: 'organization_owner',
      email: active.email,
    });

    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-amber-400" />
          <span>{isRtl ? 'ملف وبيانات المنظمة' : 'Organization Profile'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isRtl
            ? 'تعديل وتحديث معلومات المنظمة، الشعار، النبذة التعريفية، وبيانات التواصل الرسمية.'
            : "Manage your organization's public information, logo, mission, and contact details."}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'تم حفظ وتحديث بيانات المنظمة بنجاح!' : 'Organization profile updated successfully!'}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'اسم المنظمة الرسمي *' : 'Organization Name *'}
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'الاسم بالعربية' : 'Arabic Name'}
            </label>
            <input
              type="text"
              value={formData.name_ar || ''}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'النبذة التعريفية ورسالة المنظمة *' : 'Description & Mission *'}
            </label>
            <textarea
              rows={4}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'البريد الإلكتروني الرسمي *' : 'Official Email *'}
            </label>
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'الموقع الرسمي أو رابط الصفحة' : 'Website / Social Link'}
            </label>
            <input
              type="text"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'المقر والعنوان الكامل' : 'Address'}
            </label>
            <input
              type="text"
              value={formData.full_address || ''}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ تعديلات الملف' : 'Save Changes')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
