import React from 'react';
import { ShieldCheck, Heart, Users, Globe, Lock, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Ezidi Events Worldwide | Mission & Trust Architecture',
  description: 'Learn about the mission, moderation standards, and verification architecture of Ezidi Events Worldwide.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Heart className="w-4 h-4 text-amber-400" />
          <span>Independent Non-Profit Community Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About Ezidi Events Worldwide
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Dedicated to documenting, unifying, and publishing verified Ezidi gatherings, solidarity rallies, memorial forums, and cultural events across the globe.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" />
          <span>Our Global Mission</span>
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          The Ezidi (Yazidi) community spans ancient ancestral homelands in Sinjar and Shekhan/Lalish (Iraq), Armenia, Georgia, Syria, and vibrant diaspora hubs across Germany, France, the United States, Australia, the United Kingdom, and Canada.
        </p>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Ezidi Events Worldwide was established to provide an open, verified, and permanent digital infrastructure where human rights activists, community centers, cultural associations, and diaspora youth can discover and participate in solidarity rallies, annual August 3 Genocide memorials, and cultural preservation gatherings.
        </p>
      </div>

      {/* Trust & Moderation Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          Our Four Core Trust & Moderation Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <h3 className="text-base font-bold text-white">1. Strict Public Visibility Rule</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              No unreviewed or unpublished event is ever shown to the public. All public submissions pass through administrative moderation or are published directly by vetted verified organizations.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <Lock className="w-8 h-8 text-amber-400" />
            <h3 className="text-base font-bold text-white">2. Private Evidence Security</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Organization registration charters and sensitive evidence documents are encrypted in private storage buckets and only viewable by authorized administrators via short-lived signed URLs.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">3. Clear Verification Badges</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We clearly distinguish between Admin Verified, Organization Verified, and Published events, ensuring transparent provenance for every listing.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
            <Users className="w-8 h-8 text-blue-400" />
            <h3 className="text-base font-bold text-white">4. Multilingual & RTL Heritage</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Full native support for Arabic (العربية with RTL), English, German (Deutsch), and French (Français), honoring the multilingual reality of the global Ezidi diaspora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
