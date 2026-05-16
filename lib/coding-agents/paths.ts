import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function resolveProjectDirectory(projectPath: string, fallbackPath = '') {
  const trimmed = projectPath.trim() || fallbackPath.trim();
  if (!trimmed) throw new Error('Project path is required.');

  const resolved = path.resolve(trimmed);
  const stat = await fs.stat(resolved).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error('Project path must resolve to an existing directory.');
  }

  return resolved;
}
