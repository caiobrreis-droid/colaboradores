import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { avatarUrlFromKey, getCurrentUser } from '@/lib/auth/session';
import { isDatabaseConfigured, query } from '@/lib/db';
import { deleteStoredFile, isBucketConfigured, storeDataUrl } from '@/lib/railway/bucket';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(255),
  avatarUrl: z.string().max(7_500_000).optional().default(''),
});

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ code: 'DATABASE_NOT_CONFIGURED' }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ code: 'DATABASE_NOT_CONFIGURED' }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

  const parsed = updateProfileSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Dados do perfil inválidos.' }, { status: 400 });

  const current = await query<{ avatar_key: string | null }>('SELECT avatar_key FROM usuarios WHERE id = $1', [user.id]);
  const previousAvatarKey = current.rows[0]?.avatar_key || null;
  let avatarKey = previousAvatarKey;
  if (!parsed.data.avatarUrl) {
    avatarKey = null;
  } else if (parsed.data.avatarUrl.startsWith('data:')) {
    if (!isBucketConfigured()) {
      return NextResponse.json({ code: 'BUCKET_NOT_CONFIGURED', message: 'Railway Storage Bucket não configurado.' }, { status: 503 });
    }
    avatarKey = await storeDataUrl(parsed.data.avatarUrl, 'profiles', user.id);
  }

  try {
    const result = await query<{
      id: string;
      nome: string;
      email: string;
      permissao: typeof user.permissao;
      ativo: boolean;
      avatar_key: string | null;
    }>(
      `UPDATE usuarios
          SET nome = $1, avatar_key = $2
        WHERE id = $3
        RETURNING id, nome, email, permissao, ativo, avatar_key`,
      [parsed.data.name, avatarKey, user.id],
    );
    if (previousAvatarKey && previousAvatarKey !== avatarKey) {
      await deleteStoredFile(previousAvatarKey).catch(() => undefined);
    }
    const updated = result.rows[0];
    return NextResponse.json({
      user: { ...updated, avatarUrl: avatarUrlFromKey(updated.avatar_key) },
    });
  } catch {
    if (avatarKey && avatarKey !== previousAvatarKey) {
      await deleteStoredFile(avatarKey).catch(() => undefined);
    }
    return NextResponse.json({ message: 'Não foi possível atualizar o perfil.' }, { status: 500 });
  }
}
