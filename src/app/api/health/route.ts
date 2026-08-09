import { NextResponse } from 'next/server';

import { isDatabaseConfigured, query } from '@/lib/db';
import { isBucketConfigured } from '@/lib/railway/bucket';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ status: 'error', database: 'not_configured' }, { status: 503 });
  }
  try {
    await query('SELECT 1');
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      bucket: isBucketConfigured() ? 'configured' : 'not_configured',
    });
  } catch {
    return NextResponse.json({ status: 'error', database: 'unavailable' }, { status: 503 });
  }
}
