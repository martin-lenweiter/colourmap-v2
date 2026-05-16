import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireBuildLabAccess } = vi.hoisted(() => ({
  requireBuildLabAccess: vi.fn(),
}));

vi.mock('@/lib/coding-agents/route-auth', () => ({ requireBuildLabAccess }));

import { GET, POST } from './route';

describe('build lab queue route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-queue-route' } });
  });

  it('creates and lists queued missions for the desktop runner', async () => {
    const projectPath = process.cwd();

    const createResponse = await POST(
      new Request('http://localhost/api/build-lab/queue', {
        method: 'POST',
        body: JSON.stringify({
          channelId: 'phone-runner',
          agentId: 'codex',
          projectPath,
          prompt: 'Build from phone.',
        }),
      }),
    );
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.status).toBe('queued');
    expect(created.channelId).toBe('phone-runner');

    const listResponse = await GET();
    const body = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(body.missions[0].prompt).toBe('Build from phone.');
  });

  it('rejects missing prompts', async () => {
    const response = await POST(
      new Request('http://localhost/api/build-lab/queue', {
        method: 'POST',
        body: JSON.stringify({ projectPath: process.cwd() }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
