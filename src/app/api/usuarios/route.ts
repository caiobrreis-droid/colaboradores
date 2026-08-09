import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/session';
import { isDatabaseConfigured, query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const permissionSchema = z.enum(['Administrador', 'Operador', 'Visualizador']);
const createUserSchema = z.object({
  nome: z.string().trim().min(2),
  email: z.string().trim().email(),
  senha: z.string().min(8),
  permissao: permissionSchema,
  ativo: z.boolean(),
});
const updateUserSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(2),
  email: z.string().trim().email(),
  permissao: permissionSchema,
  ativo: z.boolean(),
});

interface UserRow {
  id: string;
  nome: string;
  email: string;
  permissao: z.infer<typeof permissionSchema>;
  ativo: boolean;
  created_at: Date | string;
}

function formatUser(user: UserRow) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    permissao: user.permissao,
    ativo: user.ativo,
    criadoEm: new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(user.created_at)),
  };
}

async function requireAdmin() {
  if (!isDatabaseConfigured()) {
    return { error: NextResponse.json({ code: 'DATABASE_NOT_CONFIGURED' }, { status: 503 }) };
  }
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ message: 'Não autorizado.' }, { status: 401 }) };
  if (user.permissao !== 'Administrador') {
    return { error: NextResponse.json({ message: 'Acesso restrito ao administrador.' }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const result = await query<UserRow>(
    'SELECT id, nome, email, permissao, ativo, created_at FROM usuarios ORDER BY created_at DESC',
  );
  return NextResponse.json({ users: result.rows.map(formatUser), mode: 'railway' });
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Dados do usuário inválidos. Use uma senha com 8 caracteres.' }, { status: 400 });

  const { nome, permissao, ativo } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  try {
    const passwordHash = await bcrypt.hash(parsed.data.senha, 12);
    const result = await query<UserRow>(
      `INSERT INTO usuarios (nome, email, senha_hash, permissao, ativo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, permissao, ativo, created_at`,
      [nome, email, passwordHash, permissao, ativo],
    );
    return NextResponse.json({ user: formatUser(result.rows[0]) }, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 });
    return NextResponse.json({ message: 'Não foi possível criar o usuário.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const parsed = updateUserSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Dados do usuário inválidos.' }, { status: 400 });

  const { id, nome, permissao, ativo } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  if (id === access.user!.id && (!ativo || permissao !== 'Administrador')) {
    return NextResponse.json({ message: 'O administrador conectado não pode remover o próprio acesso.' }, { status: 400 });
  }

  try {
    const result = await query<UserRow>(
      `UPDATE usuarios
          SET nome = $1, email = $2, permissao = $3, ativo = $4
        WHERE id = $5
        RETURNING id, nome, email, permissao, ativo, created_at`,
      [nome, email, permissao, ativo, id],
    );
    if (!result.rows[0]) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    return NextResponse.json({ user: formatUser(result.rows[0]) });
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 });
    return NextResponse.json({ message: 'Não foi possível atualizar o usuário.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;
  const id = request.nextUrl.searchParams.get('id');
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ message: 'Usuário inválido.' }, { status: 400 });
  }
  if (id === access.user!.id) {
    return NextResponse.json({ message: 'Você não pode excluir o próprio usuário.' }, { status: 400 });
  }
  const result = await query('DELETE FROM usuarios WHERE id = $1', [id]);
  if (!result.rowCount) return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
