import React from 'react';
import { db } from '@/lib/db';
import { AdminCountriesClient } from './AdminCountriesClient';

export const metadata = {
  title: 'الدول والمدن | Countries & Cities',
};

export default async function AdminCountriesPage() {
  const countries = await db.countries.getAll();
  const cities = await db.cities.getAll();

  return <AdminCountriesClient countries={countries} cities={cities} />;
}
