import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';
import { OrgAddEventClientForm } from './OrgAddEventClientForm';
import { PlusCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrgCreateEventPage() {
  const session = await getCurrentUserSession();
  if (!session) {
    redirect('/organization/login');
  }

  let currentOrg = null;
  if (session.organizationId) {
    currentOrg = await db.organizations.findById(session.organizationId);
  }
  if (!currentOrg && session.email) {
    currentOrg = await db.organizations.findByEmail(session.email);
  }
  if (!currentOrg && ['super_admin', 'admin'].includes(session.role)) {
    const all = await db.organizations.findAllAdmin();
    currentOrg = all[0] || null;
  }

  if (!currentOrg) {
    redirect('/organization/login');
  }

  const categories = await db.categories.getAll();
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-amber-400" />
          <span>إضافة فعالية جديدة باسم المنظمة</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          نشر فعالية جديدة تابعة لمنظمة: <strong className="text-amber-300">{currentOrg.name}</strong>
        </p>
      </div>

      <OrgAddEventClientForm
        categories={categories}
        countries={countries}
        cities={cities}
        organization={currentOrg}
      />
    </div>
  );
}
