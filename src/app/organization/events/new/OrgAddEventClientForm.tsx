'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
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
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface OrgAddEventClientFormProps {
  categories: EventCategory[];
  countries: Country[];
  cities: City[];
  organization: Organization;
}

export function OrgAddEventClientForm({
  categories,
  countries,
  cities,
  organization,
}: OrgAddEventClientFormProps) {
  const router = useRouter();
  const { t, isRtl } = useOrgLanguage();

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
    city_id: 'هانوفر (Hannover)',
    full_address: organization.full_address || 'Hanover, Lower Saxony, Germany',
    latitude: organization.latitude || 52.3759,
    longitude: organization.longitude || 9.732,
    organization_id: organization.id,
    organizer_name: organization.name,
    poster_url: '',
    source_url: '',
    contact_email: organization.email,
    contact_phone: organization.phone || '',
    official_website: organization.website || '',
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
      organization_id: organization.id,
      organizer_name: organization.name,
      country_id: formData.country_id || 'Global',
      city_id: formData.city_id || 'Global',
    };

    const res = await createEventAction(submissionData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || (isRtl ? 'تعذر نشر الفعالية.' : 'Failed to publish event.'));
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
            {isDirect
              ? (isRtl ? 'تم نشر الفعالية مباشرة بنجاح!' : 'Event Published Successfully!')
              : (isRtl ? 'تم إرسال الفعالية للمراجعة السريعة' : 'Event Submitted for Review')}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
            {isDirect
              ? (isRtl
                  ? 'تم نشر الفعالية فوراً بالاعتماد على صلاحية النشر المباشر لمنظمتكم، وهي ظاهرة الآن على الموقع العام وخريطة العالم.'
                  : 'Your event was published directly by your verified organization and is now live on the public website and world map.')
              : (isRtl
                  ? 'تم استلام بيانات الفعالية وإدراجها في طابور المراجعة الإدارية للتحقق من دقة الموقع والتفاصيل قبل النشر.'
                  : 'Your submission has been received and entered into our moderation review queue.')}
          </p>
        </div>

        {duplicateWarning && (
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs text-left max-w-md mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">{isRtl ? 'ملاحظة تشابه:' : 'Potential Duplicate Note:'}</span>
              <span>{duplicateWarning}</span>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/organization/events')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm"
          >
            {isRtl ? 'العودة لفعاليات المنظمة' : 'Back to My Events'}
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
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md"
          >
            {isRtl ? '+ إضافة فعالية أخرى' : '+ Publish Another Event'}
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

      {/* 1. Basic Info */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? '1. العنوان والوصف' : '1. Event Title & Description'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'عنوان الفعالية *' : 'Event Title *'}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isRtl ? 'مثال: وقفة تضامنية وإحياء ذكرى الإبادة الإيزيدية' : 'e.g. Annual Ezidi Remembrance & Peace Vigil'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'تصنيف ونوع الفعالية *' : 'Category *'}
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isRtl ? (c.name_ar || c.name_en) : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'المنظمة الناشرة' : 'Publishing Organization'}
            </label>
            <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-sm">
              {organization.name}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'تفاصيل وبرنامج الفعالية *' : 'Detailed Description *'}
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isRtl ? 'اكتب تفاصيل الفعالية، جدول الأعمال، المتحدثين، وأي تعليمات للمشاركين...' : 'Provide complete context, schedule, guest speakers, and instructions...'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* 2. Date & Time */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? '2. الموعد والتوقيت' : '2. Date & Timing'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'تاريخ الفعالية *' : 'Date *'}
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
              {isRtl ? 'وقت البدء *' : 'Start Time *'}
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
              {isRtl ? 'وقت الانتهاء (اختياري)' : 'End Time'}
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
              {isRtl ? 'المنطقة الزمنية *' : 'Timezone *'}
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

      {/* 3. Smart Location Manager */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? '3. المكان والموقع الجغرافي الدقيق (تعبئة تلقائية لجميع دول ومدن العالم)' : '3. Location & Global Venue'}</span>
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
          isRtl={isRtl}
        />
      </div>

      {/* 4. Media & Contact */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? '4. بوستر الفعالية والتواصل' : '4. Poster & Contact Information'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'رابط بوستر / صورة الفعالية' : 'Poster Image URL'}
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
              {isRtl ? 'البريد الإلكتروني للاستفسارات' : 'Inquiries Email'}
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isRtl ? 'رابط الإعلان الرسمي / فيسبوك' : 'Official Link / Facebook Event'}
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
            <span>{isRtl ? 'جاري نشر الفعالية...' : 'Publishing Event...'}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>{isRtl ? 'نشر الفعالية باسم المنظمة' : 'Publish Event'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
