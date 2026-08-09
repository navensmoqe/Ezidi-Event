'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { EventCategory } from '@/types/database';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/lib/actions/admin';
import { Layers, PlusCircle, Edit, Trash2, Check, X, AlertCircle, Tag, Search } from 'lucide-react';

interface Props {
  initialCategories: EventCategory[];
}

export function AdminCategoriesClient({ initialCategories }: Props) {
  const { t, isRtl } = useAdminLanguage();
  const [categories, setCategories] = useState<EventCategory[]>(initialCategories);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCat, setEditingCat] = useState<EventCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    name_de: '',
    name_fr: '',
    slug: '',
    description: '',
    icon_name: 'Megaphone',
  });

  const adminCtx = {
    id: 'user-super-admin',
    role: 'super_admin' as const,
    email: 'admin@ezidievents.org',
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createCategoryAction(
      {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        slug: formData.slug || formData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description || formData.name_ar,
        icon_name: formData.icon_name || 'Tag',
      },
      adminCtx
    );
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create category.');
    } else if (res.category) {
      setCategories([...categories, res.category]);
      setShowAddModal(false);
      setFormData({ name_ar: '', name_en: '', name_de: '', name_fr: '', slug: '', description: '', icon_name: 'Megaphone' });
      setSuccessMsg(isRtl ? 'تم إضافة التصنيف الجديد بنجاح!' : 'Category created successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    setLoading(true);
    setError(null);

    const res = await updateCategoryAction(
      editingCat.id,
      {
        name_ar: editingCat.name_ar,
        name_en: editingCat.name_en,
        name_de: editingCat.name_de,
        name_fr: editingCat.name_fr,
        slug: editingCat.slug,
        description: editingCat.description,
        icon_name: editingCat.icon_name,
      },
      adminCtx
    );
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to update category.');
    } else {
      setCategories(categories.map((c) => (c.id === editingCat.id ? editingCat : c)));
      setEditingCat(null);
      setSuccessMsg(isRtl ? 'تم تحديث بيانات التصنيف بنجاح!' : 'Category updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف التصنيف "${catName}"؟` : `Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    const res = await deleteCategoryAction(catId, adminCtx);
    if (res.success) {
      setCategories(categories.filter((c) => c.id !== catId));
      setSuccessMsg(isRtl ? 'تم حذف التصنيف بنجاح!' : 'Category deleted successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      alert(res.error || 'Failed to delete category.');
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name_ar.includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'إدارة تصنيفات الفعاليات' : 'Multilingual Event Categories'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'إضافة وتعديل وحذف أنواع وتصنيفات الفعاليات متعددة اللغات (العربية، الإنجليزية، الألمانية، الفرنسية).'
              : 'Create, update, and manage event categories across English, Arabic, German, and French.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isRtl ? 'إضافة تصنيف جديد' : 'New Category'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
        <input
          type="text"
          placeholder={isRtl ? 'البحث عن تصنيف...' : 'Search categories...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
            isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
          }`}
        />
      </div>

      {/* Categories Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'الاسم بالعربية' : 'Arabic (العربية)'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'الاسم بالإنجليزية' : 'English'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'المعرف (Slug)' : 'Slug'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'الأيقونة' : 'Icon'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                {isRtl ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCategories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-amber-300 text-sm">
                  {cat.name_ar}
                </td>
                <td className="py-3.5 px-4 font-semibold text-white">
                  {cat.name_en}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400 text-xs">
                  {cat.slug}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
                    {cat.icon_name || 'Tag'}
                  </span>
                </td>
                <td className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingCat(cat)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name_ar)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-red-400 transition-colors"
                      title={isRtl ? 'حذف التصنيف' : 'Delete Category'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Category */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'إضافة تصنيف فعالية جديد' : 'Add New Event Category'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'اسم التصنيف (بالعربية)' : 'Category Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="مثال: وقفة احتجاجية، مؤتمر حقوقي، مهرجان فني..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'اسم التصنيف (بالإنجليزية)' : 'Category Name (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Protest Rally, Cultural Festival, Memorial"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'المعرف الرابط (Slug اختياري)' : 'URL Slug (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="protest-rally"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'رمز الأيقونة (Icon Name)' : 'Icon Name'}
                </label>
                <select
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="Megaphone">Megaphone (مكبر صوت / مظاهرة)</option>
                  <option value="HeartHandshake">HeartHandshake (تضامن)</option>
                  <option value="Flame">Flame (شعلة / شموع)</option>
                  <option value="Monument">Monument (نصب تذكاري)</option>
                  <option value="Presentation">Presentation (مؤتمر / ندوة)</option>
                  <option value="Palette">Palette (ثقافة وفنون)</option>
                  <option value="Scale">Scale (حقوق وقانون)</option>
                  <option value="Users">Users (مجتمع وتجمع)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? (isRtl ? 'جاري الإضافة...' : 'Adding...') : (isRtl ? 'إضافة التصنيف' : 'Add Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'تعديل تصنيف الفعالية' : 'Edit Event Category'}</span>
              </h3>
              <button onClick={() => setEditingCat(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'الاسم بالعربية' : 'Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={editingCat.name_ar}
                  onChange={(e) => setEditingCat({ ...editingCat, name_ar: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'الاسم بالإنجليزية' : 'Name (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name_en}
                  onChange={(e) => setEditingCat({ ...editingCat, name_en: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'المعرف الرابط (Slug)' : 'URL Slug'}
                </label>
                <input
                  type="text"
                  value={editingCat.slug}
                  onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'رمز الأيقونة (Icon Name)' : 'Icon Name'}
                </label>
                <select
                  value={editingCat.icon_name || 'Tag'}
                  onChange={(e) => setEditingCat({ ...editingCat, icon_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="Megaphone">Megaphone (مكبر صوت / مظاهرة)</option>
                  <option value="HeartHandshake">HeartHandshake (تضامن)</option>
                  <option value="Flame">Flame (شعلة / شموع)</option>
                  <option value="Monument">Monument (نصب تذكاري)</option>
                  <option value="Presentation">Presentation (مؤتمر / ندوة)</option>
                  <option value="Palette">Palette (ثقافة وفنون)</option>
                  <option value="Scale">Scale (حقوق وقانون)</option>
                  <option value="Users">Users (مجتمع وتجمع)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ التعديلات' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
