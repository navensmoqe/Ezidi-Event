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
} from 'lucide-react';

interface OrgRegisterClientFormProps {
  countries: Country[];
  cities: City[];
}

export function OrgRegisterClientForm({ countries, cities }: OrgRegisterClientFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    organization_type: 'Human Rights NGO',
    country_id: countries[0]?.id || '',
    city_id: cities[0]?.id || '',
    full_address: 'Pariser Platz 1, 10117 Berlin, Germany',
    latitude: 52.5163,
    longitude: 13.3777,
    website: '',
    email: '',
    phone: '',
    logo: '',
  });

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
      setError(res.error || 'Failed to submit registration.');
    } else if (res.organization) {
      setSuccessOrg(res.organization);
      try {
        const stored = JSON.parse(localStorage.getItem('ezidi_submitted_orgs') || '[]');
        const filtered = stored.filter((o: any) => o.id !== res.organization.id);
        filtered.unshift(res.organization);
        localStorage.setItem('ezidi_submitted_orgs', JSON.stringify(filtered));
      } catch {}
    }
  };

  if (successOrg) {
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6 animate-in zoom-in-95">
        <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Registration Application Submitted!
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Your application for <strong className="text-amber-300">&quot;{successOrg.name}&quot;</strong> has been securely submitted to the administrative verification queue.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/organizations')}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
          >
            Explore Verified Organizations
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
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>1. Organization Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Yazidi Justice Coalition"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organization Name (Arabic / Optional)
            </label>
            <input
              type="text"
              dir="rtl"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder="اسم المنظمة بالعربية..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organization Type *
            </label>
            <select
              value={formData.organization_type}
              onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="Human Rights NGO">Human Rights NGO</option>
              <option value="Cultural Association">Cultural Association</option>
              <option value="Community Center">Community Center</option>
              <option value="Youth Association">Youth & Student Association</option>
              <option value="Women's Organization">Women&apos;s Empowerment Organization</option>
              <option value="Religious & Heritage Institution">Religious & Heritage Institution</option>
              <option value="Media & Documentation Group">Media & Documentation Group</option>
              <option value="Other">Other Non-Profit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Logo Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.org/logo.png"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mission & Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your organization's mission, community activities, and goals..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & Location */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>2. Headquarters & Location</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Country *
            </label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                City *
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
                {isCustomCity ? '← Choose from list' : '+ Enter custom city worldwide'}
              </button>
            </div>

            {isCustomCity ? (
              <input
                type="text"
                required
                value={customCityName}
                onChange={(e) => handleCustomCityChange(e.target.value)}
                placeholder="Type city name (e.g. Lalish, Berlin, Erbil, Paris, Lincoln)..."
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
                    {ct.name_en}
                  </option>
                ))}
                <option value="custom">
                  ✍️ Other worldwide city (type / pick on map)...
                </option>
              </select>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Complete Official Address *
            </label>
            <input
              type="text"
              required
              value={formData.full_address}
              onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Map Location Pin
            </label>
            <LocationPicker
              initialLatitude={formData.latitude}
              initialLongitude={formData.longitude}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </div>

      {/* 3. Communication & Verification Evidence */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>3. Verification & Official Contact</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@ngo.org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Website (Optional)
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://ngo.org"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 ..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Supporting Docs Box */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 text-center space-y-2">
          <UploadCloud className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-xs font-bold text-white uppercase">
            Upload Non-Profit Registration Charter (PDF / JPG)
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Supporting documents are encrypted in private storage and accessible only to verification admins.
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="block text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer mx-auto"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={loading || formData.name.length < 3 || !formData.email}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all disabled:opacity-50"
        >
          {loading ? 'Submitting Application...' : 'Submit Application for Verification'}
        </button>
      </div>
    </form>
  );
}
