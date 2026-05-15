import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireBuildLabAccess, isAvailable } = vi.hoisted(() => ({
  requireBuildLabAccess: vi.fn(),
  isAvailable: vi.fn(),
}));

vi.mock('@/lib/coding-agents/route-auth', () => ({ requireBuildLabAccess }));
vi.mock('@/lib/coding-agents/adapters', () => ({
  codingAgentAdapters: [
    { id: 'codex', name: 'Codex', isAvailable },
    { id: 'claude', name: 'Claude Code', isAvailable },
  ],
}));

import { GET } from './route';

describe('build lab runner route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-1' } });
    isAvailable.mockReset();
    isAvailable.mockResolvedValue(true);
  });

  it('reports the desktop runner status and available agents', async () => {
    const response = await GET(new Request('http://localhost/api/build-lab/runner'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.runner.online).toBe(true);
    expect(body.runner.executionOwner).toBe('desktop-server');
    expect(body.runner.remoteRunReady).toBe(true);
    expect(body.agents).toEqual([
      { id: 'codex', name: 'Codex', available: true },
      { id: 'claude', name: 'Claude Code', available: true },
    ]);
  });

  it('marks remote run unavailable when no desktop agent is installed', async () => {
    isAvailable.mockResolvedValue(false);

    const response = await GET(new Request('http://localhost/api/build-lab/runner'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.runner.remoteRunReady).toBe(false);
  });

  it('returns the access failure response', async () => {
    requireBuildLabAccess.mockResolvedValue({
      ok: false,
      response: new Response('Forbidden', { status: 403 }),
    });

    const response = await GET(new Request('http://localhost/api/build-lab/runner'));

    expect(response.status).toBe(403);
  });
});
