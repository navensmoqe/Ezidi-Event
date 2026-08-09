'use client';

import React, { useState } from 'react';
import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider';
import { UserProfile, UserRole } from '@/types/database';
import { createUserAction, updateUserAction, deleteUserAction } from '@/lib/actions/admin';
import { Users, UserPlus, Shield, KeyRound, Check, X, Edit, Trash2, Search, AlertCircle } from 'lucide-react';

interface Props {
  initialUsers: UserProfile[];
}

export function AdminUsersClient({ initialUsers }: Props) {
  const { t, isRtl } = useAdminLanguage();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'moderator' as UserRole,
    is_2fa_enabled: false,
    is_active: true,
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

    const res = await createUserAction(formData, adminCtx);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create user.');
    } else if (res.user) {
      setUsers([res.user, ...users]);
      setShowAddModal(false);
      setFormData({ full_name: '', email: '', role: 'moderator', is_2fa_enabled: false, is_active: true });
      setSuccessMsg(isRtl ? 'تم إضافة المستخدم بنجاح!' : 'User created successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setError(null);

    const res = await updateUserAction(
      editingUser.id,
      {
        full_name: editingUser.full_name,
        role: editingUser.role,
        is_active: editingUser.is_active,
        is_2fa_enabled: editingUser.is_2fa_enabled,
      },
      adminCtx
    );
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to update user.');
    } else {
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
      setSuccessMsg(isRtl ? 'تم تحديث صلاحيات المستخدم بنجاح!' : 'User permissions updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف المستخدم "${userName}"؟` : `Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    const res = await deleteUserAction(userId, adminCtx);
    if (res.success) {
      setUsers(users.filter((u) => u.id !== userId));
      setSuccessMsg(isRtl ? 'تم حذف المستخدم بنجاح!' : 'User deleted successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      alert(res.error || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'admin':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'moderator':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'editor':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'organization_admin':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>{isRtl ? 'إدارة المستخدمين والصلاحيات (RBAC)' : 'User Access Control & RBAC Roles'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isRtl
              ? 'إدارة المشرفين، المدراء، المحررين، وتعيين الصلاحيات والتحقق الثنائي 2FA.'
              : 'Manage system administrators, moderators, editors, and enforce 2FA security.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRtl ? 'إضافة مستخدم جديد' : 'Add New User'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={isRtl ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 ${
              isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
        >
          <option value="all">{isRtl ? 'جميع الرتب' : 'All Roles'}</option>
          <option value="super_admin">Super Admin (المشرف الأعلى)</option>
          <option value="admin">Admin (مدير النظام)</option>
          <option value="moderator">Moderator (مشرف مراجعة)</option>
          <option value="editor">Editor (محرر)</option>
          <option value="organization_admin">Org Admin (مدير منظمة)</option>
          <option value="user">User (مستخدم عادي)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'المستخدم' : 'User'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'الصلاحية والرتبة' : 'RBAC Role'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'التحقق الثنائي 2FA' : 'Two-Factor 2FA'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                {isRtl ? 'الحالة' : 'Status'}
              </th>
              <th className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                {isRtl ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">
                  <div className="text-slate-100">{u.full_name}</div>
                  <span className="text-[11px] text-slate-400 font-mono font-normal">{u.email}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full font-mono font-bold text-[11px] border ${getRoleBadgeColor(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {u.is_2fa_enabled ? (
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'مفعّل' : 'Enabled'}</span>
                    </span>
                  ) : (
                    <span className="text-amber-400/80 font-semibold text-xs">
                      {isRtl ? 'غير مفعّل' : 'Disabled'}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className={u.is_active ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                    ● {u.is_active ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Disabled')}
                  </span>
                </td>
                <td className={`py-3.5 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تعديل الصلاحية' : 'Edit Role'}</span>
                    </button>
                    {u.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDelete(u.id, u.full_name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-red-400 transition-colors"
                        title={isRtl ? 'حذف المستخدم' : 'Delete User'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'إضافة مستخدم جديد إلى النظام' : 'Add New Platform User'}</span>
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
                  {isRtl ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Navin Darwesh"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@ezidievents.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'الصلاحية / الرتبة (Role)' : 'Role / Permission Level'}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="super_admin">Super Admin (مشرف أعلى - كامل الصلاحيات)</option>
                  <option value="admin">Admin (مدير نظام - مراجعة وتوثيق)</option>
                  <option value="moderator">Moderator (مشرف مراجعة فعاليات وبلاغات)</option>
                  <option value="editor">Editor (محرر محتوى)</option>
                  <option value="organization_admin">Organization Admin (مدير منظمة)</option>
                  <option value="user">Standard User (مستخدم عادي)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-300 font-semibold">{isRtl ? 'تفعيل التحقق بخطوتين (2FA)' : 'Enforce 2FA Security'}</span>
                <input
                  type="checkbox"
                  checked={formData.is_2fa_enabled}
                  onChange={(e) => setFormData({ ...formData, is_2fa_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                />
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
                  {loading ? (isRtl ? 'جاري الإضافة...' : 'Adding...') : (isRtl ? 'إضافة المستخدم' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Role */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <span>{isRtl ? 'تعديل رتبة وصلاحية المستخدم' : 'Edit User Role & Permissions'}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">{isRtl ? 'المستخدم' : 'User'}</label>
                <input
                  type="text"
                  disabled
                  value={`${editingUser.full_name} (${editingUser.email})`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isRtl ? 'الصلاحية الجديدة' : 'New Role Level'}
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="super_admin">Super Admin (مشرف أعلى - كامل الصلاحيات)</option>
                  <option value="admin">Admin (مدير نظام - مراجعة وتوثيق)</option>
                  <option value="moderator">Moderator (مشرف مراجعة فعاليات وبلاغات)</option>
                  <option value="editor">Editor (محرر محتوى)</option>
                  <option value="organization_admin">Organization Admin (مدير منظمة)</option>
                  <option value="user">Standard User (مستخدم عادي)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-300 font-semibold">{isRtl ? 'حالة الحساب (نشط)' : 'Account Active Status'}</span>
                <input
                  type="checkbox"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-300 font-semibold">{isRtl ? 'التحقق الثنائي 2FA' : '2FA Enabled'}</span>
                <input
                  type="checkbox"
                  checked={editingUser.is_2fa_enabled}
                  onChange={(e) => setEditingUser({ ...editingUser, is_2fa_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
