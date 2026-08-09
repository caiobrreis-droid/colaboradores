import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/session';
import { getStoredFile, isBucketConfigured } from '@/lib/railway/bucket';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  if (!isBucketConfigured()) return NextResponse.json({ message: 'Bucket não configurado.' }, { status: 503 });

  const { key: parts } = await context.params;
  const key = parts.map(decodeURIComponent).join('/');
  try {
    const object = await getStoredFile(key);
    if (!object.Body) return NextResponse.json({ message: 'Arquivo não encontrado.' }, { status: 404 });

    return new Response(object.Body.transformToWebStream(), {
      headers: {
        'Content-Type': object.ContentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    if (status === 404) return NextResponse.json({ message: 'Arquivo não encontrado.' }, { status: 404 });
    return NextResponse.json({ message: 'Não foi possível carregar o arquivo.' }, { status: 502 });
  }
}
