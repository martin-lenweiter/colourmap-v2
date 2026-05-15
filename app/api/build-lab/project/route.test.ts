import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  requireBuildLabAccess,
  resolveProjectDirectory,
  isGitRepo,
  getGitBranch,
  listChangedFiles,
} = vi.hoisted(() => ({
  requireBuildLabAccess: vi.fn(),
  resolveProjectDirectory: vi.fn(),
  isGitRepo: vi.fn(),
  getGitBranch: vi.fn(),
  listChangedFiles: vi.fn(),
}));

vi.mock('@/lib/coding-agents/route-auth', () => ({ requireBuildLabAccess }));
vi.mock('@/lib/coding-agents/paths', () => ({ resolveProjectDirectory }));
vi.mock('@/lib/coding-agents/git', () => ({ isGitRepo, getGitBranch, listChangedFiles }));

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost/api/build-lab/project', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('build lab project route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-1' } });
    resolveProjectDirectory.mockResolvedValue('C:/repo');
    isGitRepo.mockResolvedValue(true);
    getGitBranch.mockResolvedValue('feature/test');
    listChangedFiles.mockResolvedValue(['app/page.tsx']);
  });

  it('returns project metadata', async () => {
    const response = await POST(request({ projectPath: 'C:/repo' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      projectPath: 'C:/repo',
      git: true,
      branch: 'feature/test',
      changedFiles: ['app/page.tsx'],
    });
  });

  it('returns 400 for invalid paths', async () => {
    resolveProjectDirectory.mockRejectedValue(new Error('Bad path'));

    const response = await POST(request({ projectPath: 'missing' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Bad path' });
  });
});
