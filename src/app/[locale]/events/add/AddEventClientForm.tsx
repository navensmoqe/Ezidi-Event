'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { EventCategory, Country, City, Organization } from '@/types/database';
import { POPULAR_TIMEZONES } from '@/lib/utils/timezone';
import { SmartLocationManager, LocationData } from '@/components/maps/SmartLocationManager';
import { createEventAction } from '@/lib/actions/events';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Building2,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface AddEventClientFormProps {
  categories: EventCategory[];
  countries: Country[];
  cities: City[];
  organizations: Organization[];
}

export function AddEventClientForm({
  categories,
  countries,
  cities,
  organizations,
}: AddEventClientFormProps) {
  const t = useTranslations('addEvent');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    category_id: categories[0]?.id || '',
    date: '',
    start_time: '16:00',
    end_time: '19:00',
    timezone: 'Europe/Berlin',
    country_id: 'ألمانيا (Germany)',
    city_id: 'برلين (Berlin)',
    full_address: 'Pariser Platz 1, 10117 Berlin, Germany',
    latitude: 52.5163,
    longitude: 13.3777,
    organization_id: '',
    organizer_name: '',
    poster_url: '',
    source_url: '',
    contact_email: '',
    contact_phone: '',
    official_website: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [resultEvent, setResultEvent] = useState<any>(null);

  const handleLocationChange = (loc: LocationData) => {
    setFormData((prev) => ({
      ...prev,
      country_id: loc.country || prev.country_id,
      city_id: loc.city || prev.city_id,
      full_address: loc.full_address || prev.full_address,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    const submissionData = {
      ...formData,
      country_id: formData.country_id || 'Global',
      city_id: formData.city_id || 'Global',
    };

    const res = await createEventAction(submissionData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to submit event.');
    } else {
      setResultEvent(res);
      if (res.event) {
        try {
          const stored = JSON.parse(localStorage.getItem('ezidi_submitted_events') || '[]');
          const filtered = stored.filter((ev: any) => ev.id !== res.event.id);
          filtered.unshift(res.event);
          localStorage.setItem('ezidi_submitted_events', JSON.stringify(filtered));
        } catch {}
      }
      if (res.potentialDuplicateWarning) {
        setDuplicateWarning(res.potentialDuplicateWarning);
      }
    }
  };

  if (resultEvent) {
    const isDirect = resultEvent.isPublishedDirectly;
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/10">
          ✓
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {isDirect ? (isAr ? 'تم نشر الفعالية مباشرة بنجاح!' : 'Event Published Successfully!') : t('successTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            {isDirect
              ? (isAr ? 'تم نشر الفعالية فوراً بالاعتماد على صلاحية النشر المباشر للمنظمة المعتمدة.' : 'Your event was published directly by your verified organization.')
              : t('successDesc')}
          </p>
        </div>

        {duplicateWarning && (
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs text-left max-w-md mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">{isAr ? 'ملاحظة تشابه:' : 'Potential Duplicate Note:'}</span>
              <span>{duplicateWarning}</span>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/events')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
          >
            {isAr ? 'استكشاف جميع الفعاليات' : 'Browse All Events'}
          </button>
          <button
            onClick={() => {
              setResultEvent(null);
              setFormData({
                ...formData,
                title: '',
                title_ar: '',
                description: '',
              });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md"
          >
            {isAr ? '+ إضافة فعالية أخرى' : '+ Submit Another Event'}
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

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>1. {t('sectionBasic')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldTitle')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isAr ? 'مثال: وقفة تضامنية وإحياء ذكرى الإبادة الإيزيدية' : 'e.g. Annual Ezidi Remembrance & Peace Vigil'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldCategory')} *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'المنظمة أو الجهة المنظمة' : 'Organizing Body'}
            </label>
            <input
              type="text"
              value={formData.organizer_name}
              onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
              placeholder={isAr ? 'اسم المنظمة أو اللجنة المنظمة' : 'Organization or Host Name'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldDescription')} *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isAr ? 'اكتب تفاصيل الفعالية، جدول الأعمال، المتحدثين، وأي تعليمات للمشاركين...' : 'Provide complete context, schedule, guest speakers, and instructions...'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Date and Time */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>2. {t('sectionDateTime')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldDate')} *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldStartTime')} *
            </label>
            <input
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldEndTime')}
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldTimezone')} *
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {POPULAR_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Smart Worldwide Location & Google Maps Auto-Fill Manager */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>3. {isAr ? 'المكان والموقع الجغرافي الدقيق (تعبئة تلقائية لجميع دول ومدن العالم)' : '3. Global Venue Location'}</span>
        </h3>

        <SmartLocationManager
          initialLocation={{
            country: formData.country_id,
            city: formData.city_id,
            full_address: formData.full_address,
            latitude: formData.latitude,
            longitude: formData.longitude,
          }}
          onChange={handleLocationChange}
          isRtl={isAr}
        />
      </div>

      {/* Section 4: Details & Organizer */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>4. {isAr ? 'المنظمة ووسائل الاتصال' : 'Organization & Media Links'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'المنظمة المسجلة (اختياري)' : 'Select Verified Organization (Optional)'}
            </label>
            <select
              value={formData.organization_id}
              onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">{isAr ? '-- بدون ربط بمنظمة محددة --' : '-- None / Independent Event --'}</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} {o.direct_publishing_enabled ? '⚡' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldPoster')}
            </label>
            <input
              type="text"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              placeholder="https://example.com/poster.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldContactEmail')}
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="events@ezidiorg.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('fieldSourceUrl')}
            </label>
            <input
              type="text"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              placeholder="https://facebook.com/events/123"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
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
            <span>{common('loading')}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{t('submitBtn')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
