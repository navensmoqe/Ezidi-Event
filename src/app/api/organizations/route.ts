import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getCurrentUserSession();
  const isAdministrator = session && ['super_admin', 'admin', 'moderator', 'editor'].includes(session.role);
  const orgs = isAdministrator
    ? await db.organizations.findAllAdmin()
    : await db.organizations.findVerifiedPublic();

  return NextResponse.json({ success: true, organizations: orgs });
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Organization registrations must be submitted through the secure registration form.' },
    { status: 405 }
  );
}
