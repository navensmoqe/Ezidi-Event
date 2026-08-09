'use client';

import React from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { Image as ImageIcon, Lock, ShieldCheck, HardDrive, FileText } from 'lucide-react';

export function AdminMediaClient() {
  const { t, isRtl } = useAdminLanguage();

  const buckets = [
    {
      name: 'event-posters',
      titleAr: 'ملصقات وبوسترات الفعاليات',
      access: 'Public',
      allowed: 'JPEG, PNG, WebP (Max 5MB)',
      items: 18,
    },
    {
      name: 'org-logos',
      titleAr: 'شعارات ولوغوهات المنظمات',
      access: 'Public',
      allowed: 'JPEG, PNG, WebP (Max 2MB)',
      items: 12,
    },
    {
      name: 'org-documents',
      titleAr: 'وثائق وإثباتات المنظمات الرسمية',
      access: 'Private (Signed URLs 15m)',
      allowed: 'PDF, JPG, PNG (Max 10MB)',
      items: 6,
    },
    {
      name: 'evidence-files',
      titleAr: 'ملفات وأدلة الفعاليات الحساسة',
      access: 'Private (Signed URLs 15m)',
      allowed: 'PDF, JPG, PNG (Max 10MB)',
      items: 4,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'حاويات التخزين السحابي والوسائط' : 'Storage Buckets & Media Assets'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'فحص سحابة التخزين، التحقق الصارم من أنواع الملفات MIME، حظر ملفات SVG الخبيثة، وحماية الروابط الموقعة 15 دقيقة.'
              : 'Strict MIME-type validation, SVG rejection, and 15-minute signed URL protection for private documents.'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'حماية الروابط الموقعة مفعلة' : 'Signed URLs Protected'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {buckets.map((b) => (
          <div key={b.name} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-sm font-bold text-white block">{b.name}</span>
                <span className="text-xs text-amber-300">{isRtl ? b.titleAr : ''}</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  b.access.startsWith('Private')
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {b.access.startsWith('Private')
                  ? (isRtl ? '🔒 حاوية خاصة مشفرة' : '🔒 Private Bucket')
                  : (isRtl ? '🌐 شبكة توصيل عامة CDN' : '🌐 Public CDN')}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400">{isRtl ? 'صيغ الملفات المسموحة: ' : 'Policy: '}</span>
                <strong className="text-slate-200">{b.allowed}</strong>
              </div>
              <div>
                <span className="text-slate-400">{isRtl ? 'الملفات المخزنة: ' : 'Stored Files: '}</span>
                <strong className="text-amber-400 font-mono">{b.items} {isRtl ? 'ملف' : 'assets'}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
