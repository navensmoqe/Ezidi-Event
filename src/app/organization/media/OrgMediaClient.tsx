'use client';

import React, { useState } from 'react';
import { useOrgLanguage } from '@/components/organization/OrgLanguageProvider';
import { UploadCloud, Image as ImageIcon, Trash2, PlusCircle, X } from 'lucide-react';

export function OrgMediaClient() {
  const { t, isRtl } = useOrgLanguage();
  const [mediaItems, setMediaItems] = useState([
    { id: '1', title: 'بوستر وقفة برلين 2026', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&h=300&fit=crop', size: '1.2 MB' },
    { id: '2', title: 'بانر التراث الثقافي الإيزيدي', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop', size: '2.4 MB' },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    setMediaItems([
      ...mediaItems,
      {
        id: Date.now().toString(),
        title: newTitle,
        url: newUrl,
        size: '1.8 MB',
      },
    ]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewUrl('');
  };

  const handleDelete = (id: string) => {
    setMediaItems(mediaItems.filter((m) => m.id !== id));
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'معرض الوسائط والشعارات' : 'Media Gallery'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRtl
              ? 'إدارة بوسترات الفعاليات، الشعارات، وتصاميم الإعلانات الخاصة بالمنظمة.'
              : 'Upload and manage posters, flyers, and event graphics.'}
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto transition-all hover:scale-105"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{isRtl ? 'رفع صورة أو بوستر' : 'Upload Image'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {mediaItems.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 space-y-3 p-3 group">
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-900">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{item.title}</h4>
                <span className="text-[10px] text-slate-500 font-mono">{item.size}</span>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'إضافة صورة أو بوستر جديد' : 'Add New Media'}</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'عنوان الصورة / البوستر *' : 'Title *'}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ezidi Culture Night Banner"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">{isRtl ? 'رابط الصورة (URL) *' : 'Image URL *'}</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  {isRtl ? 'إضافة إلى المعرض' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
