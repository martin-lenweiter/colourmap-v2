import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL not set');

const sql = postgres(url, { ssl: 'require', max: 1 });

const file = process.argv[2];
if (!file) throw new Error('Usage: bun scripts/run-migration.ts <path-to-sql>');

const query = readFileSync(file, 'utf-8');

try {
  await sql.unsafe(query);
  console.log('Migration applied successfully.');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await sql.end();
}
