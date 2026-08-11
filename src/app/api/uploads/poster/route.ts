import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isProduction } from '@/lib/config/env';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import {
  hasValidImageSignature,
  sanitizeFilename,
  UPLOAD_LIMITS,
  validateUploadedFile,
} from '@/lib/security/file-upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POSTER_BUCKET = 'event-posters';

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'anonymous';
}

async function ensurePosterBucket() {
  const admin = createAdminClient();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) throw new Error('Unable to access media storage.');

  const existingBucket = buckets?.find((bucket) => bucket.id === POSTER_BUCKET);
  if (!existingBucket) {
    const { error: createError } = await admin.storage.createBucket(POSTER_BUCKET, {
      public: true,
      fileSizeLimit: UPLOAD_LIMITS.POSTER.maxSizeBytes,
      allowedMimeTypes: UPLOAD_LIMITS.POSTER.allowedMimeTypes,
    });
    if (createError) throw new Error('Unable to create the poster storage bucket.');
  }

  return admin;
}

export async function POST(request: NextRequest) {
  if (!isProduction) {
    return NextResponse.json(
      { success: false, error: 'Direct poster uploads are available after Supabase production mode is configured.' },
      { status: 503 }
    );
  }

  const rateLimit = await checkRateLimit(`poster-upload:${getClientIp(request)}`, 'FILE_UPLOAD');
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: 'Upload limit reached. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Please choose an image file.' }, { status: 400 });
    }

    const validation = validateUploadedFile(file.name, file.type, file.size, UPLOAD_LIMITS.POSTER);
    if (!validation.valid || !validation.sanitizedFilename) {
      return NextResponse.json({ success: false, error: validation.error || 'Invalid image file.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(fileBuffer, file.type)) {
      return NextResponse.json(
        { success: false, error: 'The image file content does not match its declared format.' },
        { status: 400 }
      );
    }

    const admin = await ensurePosterBucket();
    const datePrefix = new Date().toISOString().slice(0, 7);
    const path = `${datePrefix}/${sanitizeFilename(file.name)}`;
    const { error: uploadError } = await admin.storage.from(POSTER_BUCKET).upload(path, fileBuffer, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw new Error('Unable to upload the poster image.');

    const { data } = admin.storage.from(POSTER_BUCKET).getPublicUrl(path);
    return NextResponse.json({ success: true, url: data.publicUrl, path });
  } catch (error) {
    console.error('Poster upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to upload the poster image. Please try again.' },
      { status: 500 }
    );
  }
}
