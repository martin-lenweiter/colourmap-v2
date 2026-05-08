import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

const migration = readFileSync(
  resolve(import.meta.dir, '../drizzle/migrations/0018_day_sync_tables.sql'),
  'utf8',
);

console.log('Running migration 0018_day_sync_tables…');
try {
  await sql.unsafe(migration);
  console.log('✓ Migration applied successfully');
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  // Tables already exist = safe to ignore
  if (msg.includes('already exists')) {
    console.log('⚠ Tables already exist — skipping (safe)');
  } else {
    console.error('✗ Migration failed:', msg);
    process.exit(1);
  }
} finally {
  await sql.end();
}
