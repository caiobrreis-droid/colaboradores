import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { canWrite, getCurrentUser } from '@/lib/auth/session';
import { isDatabaseConfigured } from '@/lib/db';
import {
  BucketNotConfiguredError,
  employeeSchema,
  getEmployee,
  removeEmployee,
  updateEmployee,
  updateEmployeeStatus,
} from '@/lib/employees/repository';
import type { FuncionarioCompleto } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const statusSchema = z.object({ status: z.enum(['positivado', 'negativado', 'nao_avaliado']) });

async function requireAccess(write = false) {
  if (!isDatabaseConfigured()) {
    return { error: NextResponse.json({ code: 'DATABASE_NOT_CONFIGURED' }, { status: 503 }) };
  }
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ message: 'Não autorizado.' }, { status: 401 }) };
  if (write && !canWrite(user)) {
    return { error: NextResponse.json({ message: 'Seu acesso permite apenas visualizar.' }, { status: 403 }) };
  }
  return { user };
}

function writeError(error: unknown) {
  if (error instanceof BucketNotConfiguredError) {
    return NextResponse.json({ code: 'BUCKET_NOT_CONFIGURED', message: error.message }, { status: 503 });
  }
  if ((error as { code?: string })?.code === '23505') {
    return NextResponse.json({ message: 'Já existe um colaborador cadastrado com este CPF.' }, { status: 409 });
  }
  return NextResponse.json({ message: 'Não foi possível atualizar o colaborador.' }, { status: 500 });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await requireAccess();
  if (access.error) return access.error;
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ message: 'Colaborador inválido.' }, { status: 400 });
  }
  const employee = await getEmployee(id);
  if (!employee) return NextResponse.json({ message: 'Colaborador não encontrado.' }, { status: 404 });
  return NextResponse.json({ employee });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await requireAccess(true);
  if (access.error) return access.error;
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ message: 'Colaborador inválido.' }, { status: 400 });
  }
  const body = await request.json();
  const parsedStatus = statusSchema.safeParse(body);
  try {
    const employee = parsedStatus.success
      ? await updateEmployeeStatus(id, parsedStatus.data.status)
      : await updateEmployee(employeeSchema.parse({ ...body, id }) as FuncionarioCompleto);
    if (!employee) return NextResponse.json({ message: 'Colaborador não encontrado.' }, { status: 404 });
    return NextResponse.json({ employee });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Confira os dados obrigatórios do colaborador.' }, { status: 400 });
    }
    return writeError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await requireAccess(true);
  if (access.error) return access.error;
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ message: 'Colaborador inválido.' }, { status: 400 });
  }
  const deleted = await removeEmployee(id);
  if (!deleted) return NextResponse.json({ message: 'Colaborador não encontrado.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
