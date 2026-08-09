import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/supabase/config';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const permissionSchema = z.enum(['Administrador', 'Operador', 'Visualizador']);

const createUserSchema = z.object({
  nome: z.string().trim().min(2),
  email: z.string().trim().email(),
  senha: z.string().min(6),
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

async function requireAdmin() {
  if (!isSupabaseAdminConfigured()) {
    return { error: NextResponse.json({ code: 'DATABASE_NOT_CONFIGURED' }, { status: 503 }) };
  }

  const sessionClient = await createServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 }) };
  }

  const { data: profile } = await sessionClient
    .from('profiles')
    .select('permissao, ativo')
    .eq('id', user.id)
    .single();

  if (!profile?.ativo || profile.permissao !== 'Administrador') {
    return { error: NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 }) };
  }

  return { admin: createAdminClient() };
}

function formatUser(profile: any) {
  return {
    id: profile.id,
    nome: profile.nome,
    email: profile.email,
    permissao: profile.permissao,
    ativo: profile.ativo,
    criadoEm: new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(profile.created_at)),
  };
}

export async function GET() {
  const access = await requireAdmin();
  if (access.error) return access.error;

  const { data, error } = await access.admin!
    .from('profiles')
    .select('id, nome, email, permissao, ativo, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ users: (data || []).map(formatUser) });
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;

  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Dados do usuário inválidos.' }, { status: 400 });

  const { nome, email, senha, permissao, ativo } = parsed.data;
  const { data: authData, error: authError } = await access.admin!.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { full_name: nome },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ message: authError?.message || 'Não foi possível criar o acesso.' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await access.admin!
    .from('profiles')
    .upsert({ id: authData.user.id, nome, email, permissao, ativo }, { onConflict: 'id' })
    .select('id, nome, email, permissao, ativo, created_at')
    .single();

  if (profileError) {
    await access.admin!.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ message: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ user: formatUser(profile) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;

  const parsed = updateUserSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Dados do usuário inválidos.' }, { status: 400 });

  const { id, nome, email, permissao, ativo } = parsed.data;
  const { error: authError } = await access.admin!.auth.admin.updateUserById(id, {
    email,
    user_metadata: { full_name: nome },
  });
  if (authError) return NextResponse.json({ message: authError.message }, { status: 400 });

  const { data: profile, error } = await access.admin!
    .from('profiles')
    .update({ nome, email, permissao, ativo })
    .eq('id', id)
    .select('id, nome, email, permissao, ativo, created_at')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ user: formatUser(profile) });
}

export async function DELETE(request: NextRequest) {
  const access = await requireAdmin();
  if (access.error) return access.error;

  const id = request.nextUrl.searchParams.get('id');
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ message: 'Usuário inválido.' }, { status: 400 });
  }

  const { error } = await access.admin!.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
