import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CloudSync } from '@/lib/db/cloud-sync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const events = await db.events.findAllAdmin();
  return NextResponse.json({ success: true, events });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body) {
      if (body.event) {
        await CloudSync.saveEvent(body.event);
      } else if (Array.isArray(body)) {
        for (const ev of body) {
          await CloudSync.saveEvent(ev);
        }
      }
    }
    const updated = await db.events.findAllAdmin();
    return NextResponse.json({ success: true, events: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
