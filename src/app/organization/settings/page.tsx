import React from 'react';
import { OrgSettingsClient } from './OrgSettingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'إعدادات الحساب | Organization Settings',
};

export default function OrgSettingsPage() {
  return <OrgSettingsClient />;
}
