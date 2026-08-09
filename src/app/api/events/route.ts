import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const events = await db.events.findAllAdmin();
  return NextResponse.json({ success: true, events });
}
