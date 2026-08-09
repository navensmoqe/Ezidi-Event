import React from 'react';
import { db } from '@/lib/db';
import { Building2, Save, MapPin, Globe, Mail, Phone } from 'lucide-react';

export default async function OrgProfileEditorPage() {
  const org = (await db.organizations.findVerifiedPublic())[0];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Organization Profile</h1>
        <p className="text-xs text-slate-400">
          Manage your organization&apos;s public information, logo, cover image, and contact details.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              defaultValue={org?.name}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Mission
            </label>
            <textarea
              rows={4}
              defaultValue={org?.description}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Email
            </label>
            <input
              type="email"
              defaultValue={org?.email}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Website
            </label>
            <input
              type="url"
              defaultValue={org?.website || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Headquarters Address
            </label>
            <input
              type="text"
              defaultValue={org?.full_address}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Save Profile Updates
          </button>
        </div>
      </div>
    </div>
  );
}
