import React from 'react';
import { OrgMembersClient } from './OrgMembersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'فريق العمل | Members & Roles',
};

export default function OrgMembersPage() {
  return <OrgMembersClient />;
}
