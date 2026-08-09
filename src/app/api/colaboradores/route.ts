import { NextRequest, NextResponse } from 'next/server';

import { canWrite, getCurrentUser } from '@/lib/auth/session';
import { isDatabaseConfigured } from '@/lib/db';
import { BucketNotConfiguredError, createEmployee, employeeSchema, listEmployees } from '@/lib/employees/repository';
import type { FuncionarioCompleto } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

function databaseError(error: unknown) {
  if (error instanceof BucketNotConfiguredError) {
    return NextResponse.json({ code: 'BUCKET_NOT_CONFIGURED', message: error.message }, { status: 503 });
  }
  if ((error as { code?: string })?.code === '23505') {
    return NextResponse.json({ message: 'Já existe um colaborador cadastrado com este CPF.' }, { status: 409 });
  }
  return NextResponse.json({ message: 'Não foi possível salvar o colaborador.' }, { status: 500 });
}

export async function GET() {
  const access = await requireAccess();
  if (access.error) return access.error;
  return NextResponse.json({ employees: await listEmployees(), mode: 'railway' });
}

export async function POST(request: NextRequest) {
  const access = await requireAccess(true);
  if (access.error) return access.error;
  const parsed = employeeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: 'Confira os dados obrigatórios do colaborador.' }, { status: 400 });
  }
  try {
    const employee = await createEmployee(parsed.data as FuncionarioCompleto, access.user!.id);
    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    return databaseError(error);
  }
}
