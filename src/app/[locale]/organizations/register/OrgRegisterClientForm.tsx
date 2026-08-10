'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Country, City } from '@/types/database';
import { registerOrganizationAction } from '@/lib/actions/organizations';
import { LocationPicker } from '@/components/maps/LocationPicker';
import {
  Building2,
  FileText,
  MapPin,
  Globe,
  Mail,
  Phone,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface OrgRegisterClientFormProps {
  countries: Country[];
  cities: City[];
  locale?: string;
}

export function OrgRegisterClientForm({ countries, cities, locale = 'ar' }: OrgRegisterClientFormProps) {
  const router = useRouter();
  const isAr = locale === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    password: '',
    description: '',
    description_ar: '',
    organization_type: 'Human Rights NGO',
    country_id: countries[0]?.id || '',
    city_id: cities[0]?.id || '',
    full_address: 'Berlin, Germany',
    latitude: 52.5163,
    longitude: 13.3777,
    website: '',
    email: '',
    phone: '',
    logo: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrg, setSuccessOrg] = useState<any>(null);

  const filteredCities = countries.find((c) => c.id === formData.country_id)
    ? cities.filter((c) => c.country_id === formData.country_id)
    : cities;

  const [customCityName, setCustomCityName] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);

  const handleLocationSelect = (lat: number, lon: number, address?: string, details?: any) => {
    setFormData((prev) => {
      let matchedCountryId = prev.country_id;
      let matchedCityId = prev.city_id;

      if (details?.countryCode) {
        const c = countries.find(
          (cnt) => cnt.code.toLowerCase() === details.countryCode.toLowerCase()
        );
        if (c) matchedCountryId = c.id;
      }

      if (details?.cityName) {
        const existingCity = cities.find(
          (ct) =>
            ct.name_en.toLowerCase() === details.cityName.toLowerCase() ||
            ct.name_ar === details.cityName
        );
        if (existingCity) {
          matchedCityId = existingCity.id;
          setIsCustomCity(false);
          setCustomCityName('');
        } else {
          matchedCityId = `custom:${details.cityName}`;
          setCustomCityName(details.cityName);
          setIsCustomCity(true);
        }
      }

      return {
        ...prev,
        latitude: lat,
        longitude: lon,
        full_address: address || prev.full_address,
        country_id: matchedCountryId,
        city_id: matchedCityId,
      };
    });
  };

  const handleCustomCityChange = (name: string) => {
    setCustomCityName(name);
    setFormData((prev) => ({ ...prev, city_id: name ? `custom:${name}` : '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submissionData = {
      ...formData,
      city_id: isCustomCity && customCityName ? `custom:${customCityName}` : formData.city_id,
    };

    const res = await registerOrganizationAction(submissionData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || (isAr ? 'تعذر إرسال طلب التسجيل. يرجى مراجعة البيانات.' : 'Failed to submit registration.'));
    } else if (res.organization) {
      setSuccessOrg(res.organization);
      try {
        const stored = JSON.parse(localStorage.getItem('ezidi_submitted_orgs') || '[]');
        const filtered = stored.filter((o: any) => o.id !== res.organization.id);
        filtered.unshift(res.organization);
        localStorage.setItem('ezidi_submitted_orgs', JSON.stringify(filtered));
        localStorage.setItem('ezidi_active_org_id', res.organization.id);
      } catch {}
    }
  };

  if (successOrg) {
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/10">
          ✓
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isAr ? 'تم إرسال طلب تسجيل المنظمة بنجاح!' : 'Registration Application Submitted!'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            {isAr ? (
              <>
                تم إرسال طلب تسجيل منظمة <strong className="text-amber-300">&quot;{successOrg.name}&quot;</strong> بنجاح إلى طابور التدقيق الإداري.
              </>
            ) : (
              <>
                Your application for <strong className="text-amber-300">&quot;{successOrg.name}&quot;</strong> has been securely submitted to the administrative verification queue.
              </>
            )}
          </p>
        </div>

        {/* Credentials Info Box */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-left max-w-md mx-auto space-y-1.5 text-xs text-slate-200">
          <span className="font-bold text-amber-300 block flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? 'بيانات الدخول المعتمدة لبوابة المنظمة:' : 'Saved Organization Login Credentials:'}</span>
          </span>
          <div className="font-mono bg-slate-900/90 p-2.5 rounded-xl space-y-1 border border-slate-800">
            <div>
              <span className="text-slate-400">{isAr ? 'البريد:' : 'Email:'}</span>{' '}
              <strong className="text-white">{successOrg.email}</strong>
            </div>
            <div>
              <span className="text-slate-400">{isAr ? 'كلمة السر:' : 'Password:'}</span>{' '}
              <strong className="text-amber-400">{successOrg.password || 'Ezidi@2026'}</strong>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/organizations')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
          >
            {isAr ? 'استكشاف المنظمات الموثقة' : 'Explore Verified Organizations'}
          </button>
          <button
            onClick={() => router.push('/organization/login')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'الدخول إلى بوابة المنظمة ←' : 'Enter Organization Portal →'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Identity & Type */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building2 className="w-5 h-5 text-amber-400" />
          <span>{isAr ? '1. هوية وبيانات المنظمة' : '1. Organization Identity'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'اسم المنظمة الرسمي (بالإنجليزي أو اللاتيني) *' : 'Official Organization Name *'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isAr ? 'مثال: Yazidi Global Solidarity' : 'e.g. Yazidi Global Solidarity'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'اسم المنظمة بالعربية (اختياري)' : 'Arabic Organization Name (Optional)'}
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder={isAr ? 'مثال: المبادرة الإيزيدية العالمية' : 'e.g. المبادرة الإيزيدية العالمية'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'نوع ونشاط المنظمة *' : 'Organization Type *'}
            </label>
            <select
              value={formData.organization_type}
              onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-semibold"
            >
              <option value="Human Rights NGO">{isAr ? 'منظمة حقوق إنسان وعدالة اجتماعية' : 'Human Rights & Advocacy NGO'}</option>
              <option value="Cultural & Diaspora Center">{isAr ? 'مركز ثقافي واجتماعي في المهجر' : 'Cultural & Diaspora Center'}</option>
              <option value="Youth Association">{isAr ? 'رابطة شبابية وطلابية' : 'Youth & Student Association'}</option>
              <option value="Women's Organization">{isAr ? 'منظمة تمكين المرأة الإيزيدية' : "Women's Empowerment Organization"}</option>
              <option value="Religious & Heritage Institution">{isAr ? 'مؤسسة دينية وتراثية' : 'Religious & Heritage Institution'}</option>
              <option value="Media & Documentation Group">{isAr ? 'مجموعة إعلامية وتوثيقية' : 'Media & Documentation Group'}</option>
              <option value="Other">{isAr ? 'منظمة أو مبادرة أخرى' : 'Other Non-Profit'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'رابط شعار المنظمة (اختياري)' : 'Logo Image URL (Optional)'}
            </label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.org/logo.png"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'رسالة ونبذة عن المنظمة وأهدافها *' : 'Mission & Description *'}
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isAr ? 'اكتب نبذة عن أهداف المنظمة وأنشطتها ومجالات عملها المجتمعي...' : "Describe your organization's mission, community activities, and goals..."}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Location */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <span>{isAr ? '2. المقر والموقع الجغرافي حول العالم' : '2. Headquarters & Location'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'الدولة *' : 'Country *'}
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? (c.name_ar || c.name_en) : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {isAr ? 'المدينة / المنطقة *' : 'City *'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCity(!isCustomCity);
                  if (!isCustomCity) {
                    setCustomCityName('');
                  }
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
              >
                {isCustomCity
                  ? (isAr ? '← اختيار من القائمة' : '← Choose from list')
                  : (isAr ? '+ كتابة اسم أي مدينة بالعالم' : '+ Enter custom city worldwide')}
              </button>
            </div>

            {isCustomCity ? (
              <input
                type="text"
                required
                value={customCityName}
                onChange={(e) => handleCustomCityChange(e.target.value)}
                placeholder={isAr ? 'اكتب اسم المدينة (مثل: لالش، هانوفر، دهوك، برلين، باريس)...' : 'Type city name (e.g. Lalish, Berlin, Erbil, Paris)...'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            ) : (
              <select
                value={formData.city_id}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCity(true);
                  } else {
                    setFormData({ ...formData, city_id: e.target.value });
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {filteredCities.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {isAr ? (ct.name_ar || ct.name_en) : ct.name_en}
                  </option>
                ))}
                <option value="custom">
                  ✍️ {isAr ? 'مدينة أخرى حول العالم (اكتب أو حدد على الخريطة)...' : 'Other worldwide city (type / pick on map)...'}
                </option>
              </select>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'العنوان والمقر الكامل *' : 'Complete Official Address *'}
            </label>
            <input
              type="text"
              required
              value={formData.full_address}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              placeholder={isAr ? 'مثال: شارع المحطة 12، هانوفر، ألمانيا' : 'e.g. Station Street 12, Hanover, Germany'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'تحديد الموقع على خريطة العالم التفاعلية' : 'Map Location Pin'}
            </label>
            <LocationPicker
              initialLatitude={formData.latitude}
              initialLongitude={formData.longitude}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </div>

      {/* 3. Official Contact Info & Password */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Mail className="w-5 h-5 text-amber-400" />
          <span>{isAr ? '3. بيانات التواصل وحساب الدخول' : '3. Official Contact & Portal Account'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'البريد الإلكتروني الرسمي (للدخول) *' : 'Official Login Email *'}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@your-ngo.org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5">
              {isAr ? 'كلمة المرور للدخول *' : 'Portal Login Password *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ezidi@2026"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-amber-500/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'رقم الهاتف / الواتساب الرسمي' : 'Official Phone / WhatsApp'}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 123 456789"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'الموقع الرسمي أو رابط الصفحة' : 'Official Website / Social Page'}
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://facebook.com/your-org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* 4. Verification Evidence & Documents */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>{isAr ? '4. وثائق التوثيق والاعتماد (اختياري / إثبات النشاط)' : '4. Verification Evidence & Documents'}</span>
        </h3>

        <div className="p-5 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center space-y-3">
          <UploadCloud className="w-10 h-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <span className="text-sm font-bold text-white block">
              {isAr ? 'إرفاق وثيقة تسجيل أو ترخيص المنظمة' : 'Attach Registration Certificate or Official Documentation'}
            </span>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isAr
                ? 'يمكنك رفع شهادة تسجيل المنظمة غير الربحية أو كتاب رسمي لإثبات الصفة القانونية.'
                : 'Upload proof of non-profit status, official registration letter, or founding documents.'}
            </p>
          </div>
          <input
            type="file"
            className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
        >
          {loading ? (
            <span>{isAr ? 'جاري إرسال طلب المنظمة...' : 'Submitting Application...'}</span>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>{isAr ? 'إرسال طلب تسجيل وتوثيق المنظمة' : 'Submit Organization Application'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
