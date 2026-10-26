import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada.');
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(currentDirectory, '..', 'db', 'migrations');
// As migrações são idempotentes e rodam todas, em ordem, a cada deploy.
const migrationFiles = (await readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort();
const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
});

try {
  for (const file of migrationFiles) {
    await pool.query(await readFile(path.join(migrationsDirectory, file), 'utf8'));
    console.log(`Migração aplicada: ${file}`);
  }

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
