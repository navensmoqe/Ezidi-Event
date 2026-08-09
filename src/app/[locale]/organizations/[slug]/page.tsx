import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { EventCard } from '@/components/events/EventCard';
import { generateGoogleMapsUrl } from '@/lib/maps/google-maps';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const org = await db.organizations.findBySlug(slug);
  if (!org) return { title: 'Organization Not Found' };

  return {
    title: `${org.name} | Verified Organization | Ezidi Events Worldwide`,
    description: org.description.slice(0, 160),
  };
}

export default async function OrganizationProfilePage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const org = await db.organizations.findBySlug(slug);
  if (!org || org.verification_status !== 'verified') {
    notFound();
  }

  // Security Rule: Retrieve only published public events for this organization
  const allEvents = await db.events.findPublicEvents({ organization: org.id });
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = allEvents.filter((e) => e.date >= today);
  const pastEvents = allEvents.filter((e) => e.date < today);

  const googleMapsUrl = generateGoogleMapsUrl(org.latitude, org.longitude);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Cover & Profile Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
        {/* Cover Image */}
        <div className="relative w-full h-48 sm:h-72 bg-slate-900">
          {org.cover_image ? (
            <Image
              src={org.cover_image}
              alt={org.name}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-amber-900/40 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Profile Info Bar */}
        <div className="p-6 sm:p-8 pt-0 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Logo */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-900 border-4 border-slate-950 shadow-2xl shrink-0">
              {org.logo ? (
                <Image src={org.logo} alt={org.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-500/20 text-amber-400">
                  🏛️
                </div>
              )}
            </div>

            {/* Titles */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/90 px-2.5 py-1 rounded-full border border-amber-500/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>✓ Verified Organization</span>
                </span>
                {org.direct_publishing_enabled && (
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded">
                    Direct Publishing Enabled
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">{org.name}</h1>
              <p className="text-xs sm:text-sm text-amber-400 font-medium">{org.organization_type}</p>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Official Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {org.email && (
              <a
                href={`mailto:${org.email}`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Overview & Address */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            About Organization
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            {org.description}
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Headquarters & Location
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{org.full_address}</span>
            </div>
            {org.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{org.phone}</span>
              </div>
            )}
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>📍 Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Events by this organization */}
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>Events by {org.name}</span>
          </h2>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Upcoming Events ({upcomingEvents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Past & Historical Events ({pastEvents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {allEvents.length === 0 && (
          <div className="glass-panel rounded-2xl p-8 text-center text-sm text-slate-400 border border-slate-800">
            No published public events currently listed for this organization.
          </div>
        )}
      </div>
    </div>
  );
}
