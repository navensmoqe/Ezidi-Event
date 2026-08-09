import React from 'react';

export const metadata = {
  title: 'Terms of Service | Ezidi Events Worldwide',
  description: 'Terms and conditions for publishing and browsing events on Ezidi Events Worldwide.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or contributing to Ezidi Events Worldwide, you agree to comply with these Terms of Service. This platform exists to provide accurate, verified information regarding Ezidi solidarity rallies, memorial forums, vigils, and cultural events.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            2. Event Submissions & Verification
          </h2>
          <p>
            Submissions must represent genuine, peaceful, and lawful community events. Misleading submissions, spam, or unauthorized representations of real organizations will result in immediate rejection and potential suspension.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            3. Direct Publishing Privileges
          </h2>
          <p>
            Direct publishing is an administrative privilege granted strictly to verified organizations with established accuracy records. Direct publishing privileges may be revoked at any time if an organization violates moderation standards.
          </p>
        </section>
      </div>
    </div>
  );
}
