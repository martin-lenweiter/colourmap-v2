import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { resolveProjectDirectory } from './paths';

const tempPaths: string[] = [];

afterEach(async () => {
  await Promise.all(tempPaths.map((item) => rm(item, { recursive: true, force: true })));
  tempPaths.length = 0;
});

describe('resolveProjectDirectory', () => {
  it('resolves existing directories', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'colourmap-build-lab-'));
    tempPaths.push(dir);

    await expect(resolveProjectDirectory(dir)).resolves.toBe(path.resolve(dir));
  });

  it('rejects files', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'colourmap-build-lab-'));
    tempPaths.push(dir);
    const filePath = path.join(dir, 'note.txt');
    await writeFile(filePath, 'hello', 'utf8');

    await expect(resolveProjectDirectory(filePath)).rejects.toThrow(
      'Project path must resolve to an existing directory.',
    );
  });

  it('rejects empty paths', async () => {
    await expect(resolveProjectDirectory('')).rejects.toThrow('Project path is required.');
  });
});
