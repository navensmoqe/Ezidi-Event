import React from 'react';
import { db } from '@/lib/db';
import { AdminUsersClient } from './AdminUsersClient';

export const metadata = {
  title: 'إدارة المستخدمين والصلاحيات | Users & RBAC Roles',
};

export default async function AdminUsersPage() {
  const users = await db.users.getAll();

  return <AdminUsersClient initialUsers={users} />;
}
