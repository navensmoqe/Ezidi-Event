import React from 'react';
import { OrgMediaClient } from './OrgMediaClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'معرض الوسائط | Media Gallery',
};

export default function OrgMediaPage() {
  return <OrgMediaClient />;
}
