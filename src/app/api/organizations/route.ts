import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CloudSync } from '@/lib/db/cloud-sync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const orgs = await db.organizations.findAllAdmin();
  return NextResponse.json({ success: true, organizations: orgs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body) {
      if (body.organization) {
        await CloudSync.saveOrganization(body.organization);
      } else if (Array.isArray(body)) {
        for (const org of body) {
          await CloudSync.saveOrganization(org);
        }
      }
    }
    const updated = await db.organizations.findAllAdmin();
    return NextResponse.json({ success: true, organizations: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
