import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada.');
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(currentDirectory, '..', 'db', 'migrations', '001_railway_schema.sql');
const migration = await readFile(migrationPath, 'utf8');
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
});

try {
  await pool.query(migration);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || 'Administrador';

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) {
      throw new Error('ADMIN_PASSWORD deve ter pelo menos 8 caracteres.');
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, permissao, ativo)
       VALUES ($1, $2, $3, 'Administrador', TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [adminName, adminEmail, passwordHash],
    );
    console.log(`Administrador preparado: ${adminEmail}`);
  } else {
    console.warn('Schema criado sem administrador. Configure ADMIN_EMAIL e ADMIN_PASSWORD.');
  }

  console.log('Migração do Railway concluída.');
} finally {
  await pool.end();
}
