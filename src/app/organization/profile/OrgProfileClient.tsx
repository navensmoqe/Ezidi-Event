'use client';

import React, { useState } from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { Organization } from '@/types/database';
import { updateOrganizationProfileAction } from '@/lib/actions/organizations';
import {
  Building2,
  Save,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface OrgProfileClientProps {
  organization: Organization;
}

export function OrgProfileClient({ organization }: OrgProfileClientProps) {
  const { t, isRtl } = useOrgLanguage();
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: organization.name || '',
    name_ar: organization.name_ar || '',
    password: organization.password || 'Ezidi@2026',
    description: organization.description || '',
    description_ar: organization.description_ar || '',
    email: organization.email || '',
    phone: organization.phone || '',
    website: organization.website || '',
    logo: organization.logo || '',
    cover_image: organization.cover_image || '',
    full_address: organization.full_address || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const res = await updateOrganizationProfileAction(organization.id, formData);

    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(res.error || (isRtl ? 'فشل حفظ التعديلات.' : 'Failed to update profile.'));
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-amber-400" />
          <span>{isRtl ? 'ملف وبيانات المنظمة (تعديل كامل)' : 'Organization Profile & Settings'}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isRtl
            ? `تعديل الاسم، كلمة المرور، البريد، الشعار وصورة الغلاف لمنظمة: "${organization.name}".`
            : `Update name, password, email, logo, and cover image for "${organization.name}".`}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {isRtl
              ? '✓ تم حفظ وتحديث كافة بيانات المنظمة وكلمة المرور بنجاح!'
              : '✓ All organization details and credentials have been updated successfully!'}
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        {/* Section 1: Credentials & Access */}
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Lock className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'بيانات الدخول والحساب الرسمي (البريد وكلمة السر)' : 'Login Credentials & Access'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                {isRtl ? 'البريد الإلكتروني لتسجيل الدخول *' : 'Login Email *'}
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500 ${
                    isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                {isRtl ? 'كلمة المرور (تعديل كلمة السر) *' : 'Password (Change Password) *'}
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ezidi@2026"
                  className={`w-full py-2.5 rounded-xl bg-slate-900 border border-amber-500/80 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
          </div>
        </div>

        {/* Section 2: Names & Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            {isRtl ? 'اسم وهوية المنظمة' : 'Organization Name & Identity'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isRtl ? 'اسم المنظمة الرسمي (إنجليزي / لاتيني) *' : 'Official Organization Name *'}
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
                {isRtl ? 'اسم المنظمة بالعربية' : 'Arabic Name'}
              </label>
              <input
                type="text"
                value={formData.name_ar || ''}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Logo & Cover Banner with Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            {isRtl ? 'الشعار وصورة الغلاف (Logo & Cover)' : 'Logo & Cover Banner'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {isRtl ? 'رابط الشعار الرسمي (Logo URL)' : 'Logo Image URL'}
              </label>
              <input
                type="text"
                value={formData.logo || ''}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.org/logo.png"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
              {formData.logo && (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-white/5"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                  <span className="text-[11px] text-slate-400">{isRtl ? 'معاينة الشعار' : 'Logo Preview'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {isRtl ? 'رابط صورة الغلاف / البانر (Cover Image URL)' : 'Cover Banner Image URL'}
              </label>
              <input
                type="text"
                value={formData.cover_image || ''}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://example.org/cover.jpg"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
              {formData.cover_image && (
                <div className="relative w-full h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={formData.cover_image}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Mission & Descriptions */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            {isRtl ? 'الرسالة والنبذة التعريفية' : 'Description & Mission'}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'نبذة عن المنظمة وأهدافها (إنجليزي / لاتيني) *' : 'Description & Mission *'}
            </label>
            <textarea
              rows={3}
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'النبذة بالعربية (اختياري)' : 'Arabic Description (Optional)'}
            </label>
            <textarea
              rows={3}
              value={formData.description_ar || ''}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 5: Contact & Social */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            {isRtl ? 'بيانات التواصل والمقر' : 'Contact & Location'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isRtl ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isRtl ? 'الموقع الرسمي أو رابط الصفحة' : 'Official Website / Social Link'}
              </label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 hover:scale-[1.01] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>
              {loading
                ? (isRtl ? 'جاري حفظ التعديلات...' : 'Saving Changes...')
                : (isRtl ? 'حفظ وتحديث بيانات المنظمة' : 'Save Organization Profile')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
