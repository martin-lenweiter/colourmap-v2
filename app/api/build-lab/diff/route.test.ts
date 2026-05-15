import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireBuildLabAccess, resolveProjectDirectory, getGitDiff, listChangedFiles } = vi.hoisted(
  () => ({
    requireBuildLabAccess: vi.fn(),
    resolveProjectDirectory: vi.fn(),
    getGitDiff: vi.fn(),
    listChangedFiles: vi.fn(),
  }),
);

vi.mock('@/lib/coding-agents/route-auth', () => ({ requireBuildLabAccess }));
vi.mock('@/lib/coding-agents/paths', () => ({ resolveProjectDirectory }));
vi.mock('@/lib/coding-agents/git', () => ({ getGitDiff, listChangedFiles }));

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost/api/build-lab/diff', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('build lab diff route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-1' } });
    resolveProjectDirectory.mockResolvedValue('C:/repo');
    getGitDiff.mockResolvedValue('diff --git a/file b/file');
    listChangedFiles.mockResolvedValue(['file']);
  });

  it('returns diff and changed files', async () => {
    const response = await POST(request({ projectPath: 'C:/repo' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      diff: 'diff --git a/file b/file',
      changedFiles: ['file'],
    });
  });

  it('returns 400 when diff cannot be read', async () => {
    resolveProjectDirectory.mockRejectedValue(new Error('Bad path'));

    const response = await POST(request({ projectPath: 'missing' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Bad path' });
  });
});
