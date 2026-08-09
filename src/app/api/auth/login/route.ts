import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createSession } from '@/lib/auth/session';
import { isDatabaseConfigured, query } from '@/lib/db';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: 'Informe um e-mail e uma senha válidos.' }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  if (!isDatabaseConfigured()) {
    if (email !== 'admin@vessel.com' || parsed.data.password !== '123456') {
      return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
    }
    const cookieStore = await cookies();
    cookieStore.set('vessel_demo_auth', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 86_400,
    });
    return NextResponse.json({ ok: true, mode: 'demo' });
  }

  const result = await query<{
    id: string;
    senha_hash: string;
    ativo: boolean;
  }>('SELECT id, senha_hash, ativo FROM usuarios WHERE LOWER(email) = $1 LIMIT 1', [email]);
  const user = result.rows[0];
  if (!user?.ativo || !(await bcrypt.compare(parsed.data.password, user.senha_hash))) {
    return NextResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 });
  }

  await query('DELETE FROM sessoes WHERE expires_at <= NOW()');
  await createSession(user.id);
  return NextResponse.json({ ok: true, mode: 'railway' });
}
