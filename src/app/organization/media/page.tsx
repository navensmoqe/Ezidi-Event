import React from 'react';
import { UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function OrgMediaPage() {
  const mediaItems = [
    { id: '1', title: 'Berlin Rally Poster 2026', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&h=300&fit=crop', size: '1.2 MB' },
    { id: '2', title: 'Cultural Heritage Banner', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop', size: '2.4 MB' },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Media Library</h1>
          <p className="text-xs text-slate-400">
            Upload posters, flyers, and event graphics. Uploads undergo strict file validation.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {mediaItems.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl overflow-hidden border border-slate-800 space-y-3 p-3">
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-900">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{item.title}</h4>
                <span className="text-[10px] text-slate-500">{item.size}</span>
              </div>
              <button className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
