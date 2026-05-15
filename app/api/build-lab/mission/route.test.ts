import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  requireBuildLabAccess,
  resolveProjectDirectory,
  createCheckpoint,
  listChangedFiles,
  runMission,
} = vi.hoisted(() => ({
  requireBuildLabAccess: vi.fn(),
  resolveProjectDirectory: vi.fn(),
  createCheckpoint: vi.fn(),
  listChangedFiles: vi.fn(),
  runMission: vi.fn(),
}));

vi.mock('@/lib/coding-agents/route-auth', () => ({ requireBuildLabAccess }));
vi.mock('@/lib/coding-agents/paths', () => ({ resolveProjectDirectory }));
vi.mock('@/lib/coding-agents/git', () => ({ createCheckpoint, listChangedFiles }));
vi.mock('@/lib/coding-agents/adapters', () => ({
  getCodingAgentAdapter: (id: string) =>
    id === 'codex' ? { id: 'codex', name: 'Codex', runMission } : null,
}));

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost/api/build-lab/mission', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function readBody(response: Response) {
  return response.text();
}

describe('build lab mission route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-1' } });
    resolveProjectDirectory.mockResolvedValue('C:/repo');
    createCheckpoint.mockResolvedValue({ created: true, path: 'checkpoint.patch' });
    listChangedFiles.mockResolvedValue(['app/page.tsx']);
    runMission.mockImplementation(async function* () {
      yield { type: 'output', stream: 'stdout', text: 'hello' };
      yield { type: 'mission_complete', success: true };
    });
  });

  it('streams mission events', async () => {
    const response = await POST(
      request({ agentId: 'codex', projectPath: 'C:/repo', prompt: 'Do work', mode: 'build' }),
    );

    expect(response.status).toBe(200);
    const body = await readBody(response);
    expect(body).toContain('"type":"checkpoint"');
    expect(body).toContain('"text":"hello"');
    expect(body).toContain('"type":"file_changed"');
    expect(runMission).toHaveBeenCalledWith({
      projectPath: 'C:/repo',
      prompt: 'Do work',
      mode: 'build',
    });
  });

  it('rejects unknown agents', async () => {
    const response = await POST(
      request({ agentId: 'missing', projectPath: 'C:/repo', prompt: 'Do work' }),
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Unknown coding agent.');
  });

  it('rejects empty prompts', async () => {
    const response = await POST(
      request({ agentId: 'codex', projectPath: 'C:/repo', prompt: '   ' }),
    );

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Mission prompt is required.');
  });
});
