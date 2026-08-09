import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';

import { isDatabaseConfigured, query } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'vessel_session';
const DEMO_COOKIE_NAME = 'vessel_demo_auth';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  nome: string;
  email: string;
  permissao: 'Administrador' | 'Operador' | 'Visualizador';
  ativo: boolean;
  avatarUrl: string;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function avatarUrlFromKey(key?: string | null) {
  return key ? `/api/files/${key.split('/').map(encodeURIComponent).join('/')}` : '';
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await query(
    `INSERT INTO sessoes (usuario_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  if (!isDatabaseConfigured()) {
    if (cookieStore.get(DEMO_COOKIE_NAME)?.value !== 'true') return null;
    return {
      id: 'demo-admin',
      nome: 'Admin User',
      email: 'admin@vessel.com',
      permissao: 'Administrador',
      ativo: true,
      avatarUrl: '',
    };
  }

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const result = await query<{
    id: string;
    nome: string;
    email: string;
    permissao: SessionUser['permissao'];
    ativo: boolean;
    avatar_key: string | null;
  }>(
    `SELECT u.id, u.nome, u.email, u.permissao, u.ativo, u.avatar_key
       FROM sessoes s
       JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND u.ativo = TRUE
      LIMIT 1`,
    [hashToken(token)],
  );

  const user = result.rows[0];
  if (!user) return null;
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    permissao: user.permissao,
    ativo: user.ativo,
    avatarUrl: avatarUrlFromKey(user.avatar_key),
  };
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token && isDatabaseConfigured()) {
    await query('DELETE FROM sessoes WHERE token_hash = $1', [hashToken(token)]);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(DEMO_COOKIE_NAME);
}

export function canWrite(user: SessionUser) {
  return user.permissao === 'Administrador' || user.permissao === 'Operador';
}
