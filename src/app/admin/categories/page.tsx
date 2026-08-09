import React from 'react';
import { db } from '@/lib/db';
import { Layers, PlusCircle, Edit } from 'lucide-react';

export const metadata = {
  title: 'Event Categories | Admin Dashboard',
};

export default async function AdminCategoriesPage() {
  const categories = await db.categories.getAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>Multilingual Event Categories</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage category taxonomies across English, Arabic, German, and French.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">English</th>
              <th className="py-3.5 px-4">Arabic (العربية)</th>
              <th className="py-3.5 px-4">German (Deutsch)</th>
              <th className="py-3.5 px-4">French (Français)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">{cat.slug}</td>
                <td className="py-3.5 px-4 font-bold text-white">{cat.name_en}</td>
                <td className="py-3.5 px-4 font-arabic text-amber-200" dir="rtl">{cat.name_ar}</td>
                <td className="py-3.5 px-4">{cat.name_de}</td>
                <td className="py-3.5 px-4">{cat.name_fr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
