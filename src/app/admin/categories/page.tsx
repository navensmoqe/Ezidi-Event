import React from 'react';
import { db } from '@/lib/db';
import { AdminCategoriesClient } from './AdminCategoriesClient';

export const metadata = {
  title: 'تصنيفات الفعاليات | Event Categories',
};

export default async function AdminCategoriesPage() {
  const categories = await db.categories.getAll();

  return <AdminCategoriesClient initialCategories={categories} />;
}
