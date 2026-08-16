import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getCurrentUserSession();
  const isAdmin = session && ['super_admin', 'admin', 'moderator', 'editor'].includes(session.role);
  const events = isAdmin ? await db.events.findAllAdmin() : await db.events.findPublicEvents();
  return NextResponse.json({ success: true, events });
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Use the secured event submission action.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}
