import { beforeEach, describe, expect, it } from 'vitest';

import { resetGeometryLiveStateForTest } from '@/lib/geometry-live';

import { GET, POST } from './route';

describe('/api/geometry-live', () => {
  beforeEach(() => {
    resetGeometryLiveStateForTest();
  });

  it('returns the current live projection state', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.presetName).toBe('Calm Field');
  });

  it('accepts controller updates', async () => {
    const response = await POST(
      new Request('http://localhost/api/geometry-live', {
        method: 'POST',
        body: JSON.stringify({
          presetName: 'Buddha Boy Currents',
          cfg: {
            preset: 'Golden Source',
            symmetry: 8,
            complexity: 7,
            glow: 8,
            breathSpeed: 0.5,
            intensity: 8,
            particles: 8,
            luminous: 4,
            stars: 8,
            mode: 'buddhaboycurrents',
          },
        }),
      }),
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.presetName).toBe('Buddha Boy Currents');
    expect(data.cfg.mode).toBe('buddhaboycurrents');
  });

  it('rejects invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/geometry-live', {
        method: 'POST',
        body: '{',
      }),
    );

    expect(response.status).toBe(400);
  });
});
