import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { canWrite, getCurrentUser } from '@/lib/auth/session';
import { CATEGORY_COLORS, CATEGORY_ICONS, slugifyCategory } from '@/lib/categories';
import { isDatabaseConfigured, query } from '@/lib/db';
import type { Categoria } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const categoryFields = {
  nome: z.string().trim().min(2).max(120),
  descricao: z.string().trim().max(255).optional().default(''),
  cor: z.string().refine((value) => value in CATEGORY_COLORS).default('blue'),
  icone: z.string().refine((value) => value in CATEGORY_ICONS).default('building'),
  ativo: z.boolean().optional().default(true),
};
const createCategorySchema = z.object(categoryFields);
const updateCategorySchema = z.object({ slug: z.string().min(1).max(60), ...categoryFields });
const reorderSchema = z.object({ ordem: z.array(z.string().min(1).max(60)).min(1).max(200) });

interface CategoryRow {
  slug: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

const CATEGORY_COLUMNS = 'slug, nome, descricao, cor, icone, ordem, ativo';

function formatCategory(row: CategoryRow): Categoria {
  return { ...row, ordem: Number(row.ordem) };
}

async function requireAccess(level: 'read' | 'write' | 'admin' = 'read') {
  if (!isDatabaseConfigured()) {
    return { error: NextResponse.json({ code: 'DATABASE_NOT_CONFIGURED' }, { status: 503 }) };
  }
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ message: 'Não autorizado.' }, { status: 401 }) };
  if (level === 'write' && !canWrite(user)) {
    return { error: NextResponse.json({ message: 'Seu acesso permite apenas visualizar.' }, { status: 403 }) };
  }
  if (level === 'admin' && user.permissao !== 'Administrador') {
    return { error: NextResponse.json({ message: 'Somente o administrador pode excluir categorias.' }, { status: 403 }) };
  }
  return { user };
}

function duplicatedName(error: unknown) {
  return (error as { code?: string })?.code === '23505'
    ? NextResponse.json({ message: 'Já existe uma categoria com este nome.' }, { status: 409 })
    : null;
}

export async function GET() {
  const access = await requireAccess();
  if (access.error) return access.error;
  const result = await query<CategoryRow>(`SELECT ${CATEGORY_COLUMNS} FROM categorias ORDER BY ordem ASC, nome ASC`);
  return NextResponse.json({ categories: result.rows.map(formatCategory), mode: 'railway' });
}

export async function POST(request: NextRequest) {
  const access = await requireAccess('write');
  if (access.error) return access.error;
  const parsed = createCategorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Informe um nome com pelo menos 2 caracteres.' }, { status: 400 });

  const { nome, descricao, cor, icone, ativo } = parsed.data;
  const base = slugifyCategory(nome);
  const taken = await query<{ slug: string }>('SELECT slug FROM categorias WHERE slug = $1 OR slug LIKE $2', [base, `${base}\\_%`]);
  const usedSlugs = new Set(taken.rows.map((row) => row.slug));
  let slug = base;
  for (let suffix = 2; usedSlugs.has(slug); suffix += 1) slug = `${base}_${suffix}`;

  try {
    const result = await query<CategoryRow>(
      `INSERT INTO categorias (slug, nome, descricao, cor, icone, ativo, ordem)
       VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(ordem), 0) + 1 FROM categorias))
       RETURNING ${CATEGORY_COLUMNS}`,
      [slug, nome, descricao, cor, icone, ativo],
    );
    return NextResponse.json({ category: formatCategory(result.rows[0]) }, { status: 201 });
  } catch (error) {
    return duplicatedName(error) || NextResponse.json({ message: 'Não foi possível criar a categoria.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const access = await requireAccess('write');
  if (access.error) return access.error;
  const parsed = updateCategorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Dados da categoria inválidos.' }, { status: 400 });

  const { slug, nome, descricao, cor, icone, ativo } = parsed.data;
  try {
    const result = await query<CategoryRow>(
      `UPDATE categorias SET nome = $1, descricao = $2, cor = $3, icone = $4, ativo = $5
        WHERE slug = $6
        RETURNING ${CATEGORY_COLUMNS}`,
      [nome, descricao, cor, icone, ativo, slug],
    );
    if (!result.rows[0]) return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    return NextResponse.json({ category: formatCategory(result.rows[0]) });
  } catch (error) {
    return duplicatedName(error) || NextResponse.json({ message: 'Não foi possível atualizar a categoria.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const access = await requireAccess('write');
  if (access.error) return access.error;
  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: 'Ordem inválida.' }, { status: 400 });
  await query(
    `UPDATE categorias c SET ordem = o.posicao
       FROM UNNEST($1::text[]) WITH ORDINALITY AS o(slug, posicao)
      WHERE c.slug = o.slug`,
    [parsed.data.ordem],
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const access = await requireAccess('admin');
  if (access.error) return access.error;
  const slug = request.nextUrl.searchParams.get('slug');
  const moveTo = request.nextUrl.searchParams.get('moverPara');
  if (!slug) return NextResponse.json({ message: 'Categoria inválida.' }, { status: 400 });
  if (moveTo === slug) return NextResponse.json({ message: 'Escolha outra categoria de destino.' }, { status: 400 });

  const usage = await query<{ total: string }>('SELECT COUNT(*) AS total FROM colaboradores WHERE categoria = $1', [slug]);
  const total = Number(usage.rows[0]?.total || 0);
  if (total > 0) {
    if (!moveTo) {
      return NextResponse.json({
        code: 'CATEGORY_IN_USE',
        message: `Existem ${total} colaborador(es) nesta categoria. Escolha para onde movê-los.`,
      }, { status: 409 });
    }
    const target = await query('SELECT 1 FROM categorias WHERE slug = $1', [moveTo]);
    if (!target.rowCount) return NextResponse.json({ message: 'Categoria de destino não encontrada.' }, { status: 404 });
    await query(
      `UPDATE colaboradores
          SET categoria = $2, dados = jsonb_set(dados, '{categoria}', to_jsonb($2::text))
        WHERE categoria = $1`,
      [slug, moveTo],
    );
  }

  const result = await query('DELETE FROM categorias WHERE slug = $1', [slug]);
  if (!result.rowCount) return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
  return NextResponse.json({ ok: true, moved: total });
}
