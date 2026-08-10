import React from 'react';
import { OrgStatsClient } from './OrgStatsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'الإحصائيات والتحليلات | Analytics',
};

export default function OrgStatisticsPage() {
  return <OrgStatsClient />;
}
