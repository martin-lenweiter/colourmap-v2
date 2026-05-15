import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireBuildLabAccess } = vi.hoisted(() => ({
  requireBuildLabAccess: vi.fn(),
}));

vi.mock('@/lib/coding-agents/route-auth', () => ({ requireBuildLabAccess }));

import { createQueuedMission } from '@/lib/coding-agents/queue';

import { PATCH } from './route';

describe('build lab queued mission route', () => {
  beforeEach(() => {
    requireBuildLabAccess.mockResolvedValue({ ok: true, value: { id: 'user-queue-patch' } });
  });

  it('updates queued mission status and appends a runner event', async () => {
    const mission = createQueuedMission('user-queue-patch', {
      title: 'Queued patch test',
      channelId: 'phone-runner',
      agentId: 'codex',
      projectPath: 'C:/Users/victor/colourmap-v2',
      prompt: 'Patch queue status.',
    });

    const response = await PATCH(
      new Request(`http://localhost/api/build-lab/queue/${mission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'running',
          event: { type: 'claimed', text: 'Desktop runner claimed this mission.' },
        }),
      }),
      { params: Promise.resolve({ id: mission.id }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('running');
    expect(body.events[0].type).toBe('claimed');
  });

  it('rejects invalid statuses', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/build-lab/queue/missing', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'bad' }),
      }),
      { params: Promise.resolve({ id: 'missing' }) },
    );

    expect(response.status).toBe(400);
  });
});
