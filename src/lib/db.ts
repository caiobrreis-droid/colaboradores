import 'server-only';

import { Pool, type QueryResultRow } from 'pg';

const globalDatabase = globalThis as typeof globalThis & { vesselPool?: Pool };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada.');
  }

  if (!globalDatabase.vesselPool) {
    globalDatabase.vesselPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return globalDatabase.vesselPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}
