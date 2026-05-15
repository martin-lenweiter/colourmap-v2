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

describe('build lab availability route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-1' } });
    isAvailable.mockReset();
    isAvailable.mockResolvedValue(true);
  });

  it('returns agent availability', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      agents: [
        { id: 'codex', name: 'Codex', available: true },
        { id: 'claude', name: 'Claude Code', available: true },
      ],
    });
  });

  it('returns the access failure response', async () => {
    requireBuildLabAccess.mockResolvedValue({
      ok: false,
      response: new Response('Forbidden', { status: 403 }),
    });

    const response = await GET();

    expect(response.status).toBe(403);
  });
});
