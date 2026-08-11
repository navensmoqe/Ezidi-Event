'use client';

import { ChangeEvent, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ImagePlus, LoaderCircle, Trash2, UploadCloud } from 'lucide-react';

interface PosterUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  isRtl?: boolean;
}

const MAX_SIZE_MB = 4;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PosterUploadField({ value, onChange, isRtl = false }: PosterUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(isRtl ? 'يرجى اختيار صورة بصيغة JPG أو PNG أو WebP.' : 'Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(isRtl ? 'يجب ألا يتجاوز حجم الصورة 4 ميغابايت.' : 'The image must be 4 MB or smaller.');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await fetch('/api/uploads/poster', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      onChange(result.url);
      setFileName(file.name);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error && uploadError.message
          ? uploadError.message
          : isRtl
            ? 'تعذر رفع الصورة. يرجى المحاولة مرة أخرى.'
            : 'Unable to upload the image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-300">
        {isRtl ? 'صورة أو بوستر الفعالية (اختياري)' : 'Event poster image (optional)'}
      </label>

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-3">
          <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
            <Image src={value} alt="" width={48} height={56} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>{isRtl ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'}</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-slate-400">{fileName || value}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setFileName('');
            }}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-950/50 hover:text-red-300"
            title={isRtl ? 'إزالة الصورة' : 'Remove image'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-4 py-5 text-center transition-colors hover:border-amber-400 hover:bg-slate-900">
          {uploading ? <LoaderCircle className="h-7 w-7 animate-spin text-amber-400" /> : <UploadCloud className="h-7 w-7 text-amber-400" />}
          <span className="text-xs font-bold text-slate-200">
            {uploading
              ? (isRtl ? 'جارٍ رفع الصورة…' : 'Uploading image…')
              : (isRtl ? 'اضغط لاختيار صورة من جهازك' : 'Choose an image from your device')}
          </span>
          <span className="text-[11px] text-slate-500">JPG, PNG, WebP · {MAX_SIZE_MB} MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-300">
          <ImagePlus className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
