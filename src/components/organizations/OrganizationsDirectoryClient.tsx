'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Organization } from '@/types/database';
import { Link } from '@/i18n/routing';
import { Building2, ShieldCheck, MapPin, Globe, Mail, Phone, PlusCircle, Search } from 'lucide-react';

interface OrganizationsDirectoryClientProps {
  initialOrganizations: Organization[];
  locale: string;
}

export function OrganizationsDirectoryClient({
  initialOrganizations,
  locale,
}: OrganizationsDirectoryClientProps) {
  const [orgs, setOrgs] = useState<Organization[]>(initialOrganizations);
  const [search, setSearch] = useState('');

  // Client-side synchronization with API and localStorage for 0ms lag
  useEffect(() => {
    const syncOrgs = async () => {
      try {
        const res = await fetch('/api/organizations', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.organizations)) {
            let verifiedIds: string[] = [];
            try {
              verifiedIds = JSON.parse(localStorage.getItem('ezidi_verified_org_ids') || '[]');
            } catch {}

            const activeVerified = data.organizations.filter(
              (o: Organization) =>
                (o.verification_status === 'verified' || verifiedIds.includes(o.id)) &&
                o.organization_status !== 'suspended'
            );

            setOrgs((prev) => {
              const map = new Map<string, Organization>();
              // Initial or previous verified orgs
              prev.forEach((o) => {
                if (o && o.id) map.set(o.id, o);
              });
              // Verified from API & Local
              activeVerified.forEach((o: Organization) => {
                if (o && o.id) map.set(o.id, { ...o, verification_status: 'verified' });
              });
              return Array.from(map.values());
            });
          }
        }
      } catch {}
    };

    syncOrgs();
    const interval = setInterval(syncOrgs, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrgs = orgs.filter((org) => {
    if (!org) return false;
    const isVerified = org.verification_status === 'verified';
    if (!isVerified) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (org.name && org.name.toLowerCase().includes(q)) ||
      (org.name_ar && org.name_ar.toLowerCase().includes(q)) ||
      (org.description && org.description.toLowerCase().includes(q)) ||
      (org.full_address && org.full_address.toLowerCase().includes(q)) ||
      (org.organization_type && org.organization_type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-400" />
            <span>
              {locale === 'ar' ? 'المنظمات والمؤسسات المعتمدة' : 'Verified Organizations'}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            {locale === 'ar'
              ? 'الجمعيات والمراكز الثقافية والمنظمات الحقوقية الإيزيدية الموثقة والمعتمدة رسمياً في المنصة.'
              : 'Official community associations, cultural institutions, and human rights NGOs verified by our moderation team.'}
          </p>
        </div>

        <Link
          href="/organizations/register"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{locale === 'ar' ? 'تسجيل منظمة جديدة' : 'Register Organization'}</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale === 'ar' ? 'ابحث باسم المنظمة، المدينة، أو الدولة...' : 'Search by organization, city, or country...'}
          className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-amber-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
        />
      </div>

      {/* Organizations Grid */}
      {filteredOrgs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                {/* Logo + Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 shadow-md">
                    {org.logo ? (
                      <Image
                        src={org.logo}
                        alt={org.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-xl">
                        🏛️
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{locale === 'ar' ? 'معتمدة وموثقة ✓' : '✓ Verified'}</span>
                    </div>
                    {org.direct_publishing_enabled && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                        {locale === 'ar' ? 'نشر مباشر مفعل' : 'Direct Publishing Active'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Type */}
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                    {org.organization_type}
                  </span>
                  <Link href={`/organizations/${org.slug}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {locale === 'ar' && org.name_ar ? org.name_ar : org.name}
                    </h3>
                  </Link>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {locale === 'ar' && org.description_ar ? org.description_ar : org.description}
                </p>
              </div>

              {/* Address & Link */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                {org.full_address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{org.full_address}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {org.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[140px]">{org.email}</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/organizations/${org.slug}`}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{locale === 'ar' ? 'عرض الفعاليات ←' : 'View Events →'}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm font-medium">
            {locale === 'ar' ? 'لا توجد منظمات مطابقة لبحثك حالياً.' : 'No verified organizations found.'}
          </p>
        </div>
      )}
    </div>
  );
}
