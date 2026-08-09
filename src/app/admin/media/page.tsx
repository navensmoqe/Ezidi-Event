import React from 'react';
import { UploadCloud, Image as ImageIcon, Lock, ShieldCheck, FileText } from 'lucide-react';

export const metadata = {
  title: 'Media & Storage | Admin Dashboard',
};

export default function AdminMediaPage() {
  const buckets = [
    { name: 'event-posters', access: 'Public', allowed: 'JPEG, PNG, WebP (Max 5MB)', items: 18 },
    { name: 'org-logos', access: 'Public', allowed: 'JPEG, PNG, WebP (Max 2MB)', items: 12 },
    { name: 'org-documents', access: 'Private (Signed URLs 15m)', allowed: 'PDF, JPG (Max 10MB)', items: 6 },
    { name: 'evidence-files', access: 'Private (Signed URLs 15m)', allowed: 'PDF, JPG (Max 10MB)', items: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <ImageIcon className="w-6 h-6 text-amber-400" />
          <span>Storage Buckets & Media Assets</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Strict MIME-type validation, SVG rejection, and 15-minute signed URL protection for private documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {buckets.map((b) => (
          <div key={b.name} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">{b.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                b.access.startsWith('Private') ? 'bg-amber-950 text-amber-300 border border-amber-500/50' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {b.access.startsWith('Private') ? '🔒 Private Bucket' : '🌐 Public CDN'}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div>Policy: <strong className="text-slate-300">{b.allowed}</strong></div>
              <div>Stored Files: <strong className="text-white font-mono">{b.items} assets</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
