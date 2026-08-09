import React from 'react';
import { ShieldCheck, Lock, UserCheck, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy (GDPR) | Ezidi Events Worldwide',
  description: 'Learn how Ezidi Events Worldwide protects user data and adheres to GDPR data minimization principles.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>GDPR / Data Protection Compliant</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            1. Overview & Data Minimization
          </h2>
          <p>
            Ezidi Events Worldwide is dedicated to protecting the privacy of civil society activists, community organizers, and visitors. Under GDPR principles (Article 5), we collect only the minimal data strictly necessary to operate a verified international events directory.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            2. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li><strong className="text-slate-200">Public Event Submissions:</strong> Event titles, descriptions, venue coordinates, public source links, and organizer contact details provided explicitly during submission.</li>
            <li><strong className="text-slate-200">Organization Registrations:</strong> Official NGO names, contact emails, and registration charters uploaded for verification.</li>
            <li><strong className="text-slate-200">Community Reports:</strong> Descriptions of inaccurate details and optional reporter emails, which remain strictly private and are never published.</li>
            <li><strong className="text-slate-200">Technical Logs:</strong> Rate-limiting records and security audit logs stored with sensitive tokens redacted.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            3. Protection of Private Storage Documents
          </h2>
          <p>
            Organization verification documents, NGO registration certificates, and private evidence are stored in isolated private storage buckets. They cannot be indexed or downloaded by public search engines and are accessible only to verified administrators via short-lived signed URLs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            4. Your Rights Under GDPR
          </h2>
          <p>
            Under European data protection law (GDPR), you have the right to access, rectify, or request the deletion (Right to be Forgotten) of your submitted organization details or user accounts. Contact our administrative privacy team at <span className="text-amber-400 font-mono">privacy@ezidievents.org</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
