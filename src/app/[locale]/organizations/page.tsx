import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { Link } from '@/i18n/routing';
import { Building2, ShieldCheck, MapPin, Globe, Mail, Phone, PlusCircle } from 'lucide-react';

export const metadata = {
  title: 'Verified Organizations | Ezidi Events Worldwide',
  description: 'Explore verified Ezidi community organizations, cultural centers, and human-rights associations.',
};

export default async function OrganizationsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const verifiedOrgs = await db.organizations.findVerifiedPublic();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-400" />
            <span>Verified Organizations</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
            Official community associations, cultural institutions, and human rights NGOs verified by our moderation team.
          </p>
        </div>

        <Link
          href="/organizations/register"
          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Organization</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verifiedOrgs.map((org) => (
          <div
            key={org.id}
            className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              {/* Logo + Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>✓ Verified</span>
                  </div>
                  {org.direct_publishing_enabled && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono">
                      Direct Publishing Active
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
                  <h3 className="text-lg font-bold text-white hover:text-amber-300 transition-colors">
                    {org.name}
                  </h3>
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                {org.description}
              </p>
            </div>

            {/* Address & Link */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{org.full_address}</span>
              </div>

              <Link
                href={`/organizations/${org.slug}`}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition-colors"
              >
                View Organization Profile →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
