import 'server-only';

import { z } from 'zod';

import { avatarUrlFromKey } from '@/lib/auth/session';
import { query } from '@/lib/db';
import { deleteStoredFile, isBucketConfigured, storeDataUrl } from '@/lib/railway/bucket';
import type { FuncionarioCompleto } from '@/types';

export const employeeSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(2).max(255),
  cpf: z.string().trim().max(20).default(''),
  telefone: z.string().trim().max(30).default(''),
  cargo: z.string().trim().min(1).max(120),
  categoria: z.enum(['gabinete', 'casa', 'vice_presidencia', 'pmbv']),
  ativo: z.boolean().optional().default(true),
  foto_url: z.string().max(7_500_000).optional().default(''),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  endereco: z.object({
    bairro: z.string().max(120).optional().default(''),
  }).passthrough().optional(),
}).passthrough();

interface EmployeeRow {
  id: string;
  dados: FuncionarioCompleto | string;
  foto_key: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export class BucketNotConfiguredError extends Error {}

function asIsoDate(value: Date | string) {
  return new Date(value).toISOString();
}

export function formatEmployee(row: EmployeeRow): FuncionarioCompleto {
  const stored = typeof row.dados === 'string' ? JSON.parse(row.dados) : row.dados;
  return {
    ...stored,
    id: row.id,
    foto_url: row.foto_key ? avatarUrlFromKey(row.foto_key) : stored.foto_url || '',
    created_at: asIsoDate(row.created_at),
    updated_at: asIsoDate(row.updated_at),
  };
}

async function preparePhoto(employee: FuncionarioCompleto, currentKey?: string | null) {
  const photo = employee.foto_url || '';
  if (!photo.startsWith('data:')) {
    return {
      photoKey: photo ? currentKey || null : null,
      photoUrl: photo,
      replacedKey: !photo ? currentKey || null : null,
    };
  }
  if (!isBucketConfigured()) throw new BucketNotConfiguredError('Railway Storage Bucket não configurado.');
  const photoKey = await storeDataUrl(photo, 'employees', employee.id);
  return { photoKey, photoUrl: avatarUrlFromKey(photoKey), replacedKey: currentKey || null };
}

export async function listEmployees() {
  const result = await query<EmployeeRow>(
    'SELECT id, dados, foto_key, created_at, updated_at FROM colaboradores ORDER BY nome ASC',
  );
  return result.rows.map(formatEmployee);
}

export async function getEmployee(id: string) {
  const result = await query<EmployeeRow>(
    'SELECT id, dados, foto_key, created_at, updated_at FROM colaboradores WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ? formatEmployee(result.rows[0]) : null;
}

export async function createEmployee(employee: FuncionarioCompleto, userId: string) {
  const photo = await preparePhoto(employee);
  const payload = { ...employee, foto_url: photo.photoUrl };
  try {
    const result = await query<EmployeeRow>(
      `INSERT INTO colaboradores (id, nome, cpf, cargo, categoria, bairro, ativo, foto_key, dados, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
       RETURNING id, dados, foto_key, created_at, updated_at`,
      [
        employee.id,
        employee.nome,
        employee.cpf || null,
        employee.cargo,
        employee.categoria,
        employee.endereco?.bairro || null,
        employee.ativo !== false,
        photo.photoKey,
        JSON.stringify(payload),
        userId,
      ],
    );
    return formatEmployee(result.rows[0]);
  } catch (error) {
    if (photo.photoKey) await deleteStoredFile(photo.photoKey).catch(() => undefined);
    throw error;
  }
}

export async function updateEmployee(employee: FuncionarioCompleto) {
  const current = await query<{ foto_key: string | null }>(
    'SELECT foto_key FROM colaboradores WHERE id = $1 LIMIT 1',
    [employee.id],
  );
  if (!current.rows[0]) return null;

  const photo = await preparePhoto(employee, current.rows[0].foto_key);
  const payload = { ...employee, foto_url: photo.photoUrl };
  try {
    const result = await query<EmployeeRow>(
      `UPDATE colaboradores
          SET nome = $1, cpf = $2, cargo = $3, categoria = $4, bairro = $5,
              ativo = $6, foto_key = $7, dados = $8::jsonb
        WHERE id = $9
        RETURNING id, dados, foto_key, created_at, updated_at`,
      [
        employee.nome,
        employee.cpf || null,
        employee.cargo,
        employee.categoria,
        employee.endereco?.bairro || null,
        employee.ativo !== false,
        photo.photoKey,
        JSON.stringify(payload),
        employee.id,
      ],
    );
    if (photo.replacedKey && photo.replacedKey !== photo.photoKey) {
      await deleteStoredFile(photo.replacedKey).catch(() => undefined);
    }
    return result.rows[0] ? formatEmployee(result.rows[0]) : null;
  } catch (error) {
    if (photo.photoKey && photo.photoKey !== current.rows[0].foto_key) {
      await deleteStoredFile(photo.photoKey).catch(() => undefined);
    }
    throw error;
  }
}

export async function updateEmployeeStatus(id: string, status: 'positivado' | 'negativado' | 'nao_avaliado') {
  const employee = await getEmployee(id);
  if (!employee) return null;
  const timestamp = new Date().toISOString();
  const currentStatus = employee.status_redes?.[0];
  return updateEmployee({
    ...employee,
    updated_at: timestamp,
    status_redes: [{
      id: currentStatus?.id || `status-${id}`,
      funcionario_id: id,
      status,
      ultima_avaliacao: timestamp,
      observacoes: currentStatus?.observacoes,
    }],
  });
}

export async function removeEmployee(id: string) {
  const result = await query<{ foto_key: string | null }>(
    'DELETE FROM colaboradores WHERE id = $1 RETURNING foto_key',
    [id],
  );
  const deleted = result.rows[0];
  if (deleted?.foto_key) await deleteStoredFile(deleted.foto_key).catch(() => undefined);
  return Boolean(deleted);
}
