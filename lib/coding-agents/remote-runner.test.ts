import { describe, expect, it } from 'vitest';

import { buildLabAttachmentStoragePath, isRunnerOnline } from './remote-runner';

describe('remote Build Lab runner contract', () => {
  it('marks a runner offline when heartbeat is stale', () => {
    expect(isRunnerOnline('2026-05-19T10:00:00.000Z', Date.parse('2026-05-19T10:00:30.000Z'))).toBe(
      true,
    );
    expect(isRunnerOnline('2026-05-19T10:00:00.000Z', Date.parse('2026-05-19T10:01:00.000Z'))).toBe(
      false,
    );
    expect(isRunnerOnline(null)).toBe(false);
  });

  it('builds storage paths under the user and mission prefix', () => {
    expect(
      buildLabAttachmentStoragePath({
        userId: 'user-1',
        missionId: 'mission-1',
        attachmentId: 'shot-1',
        name: 'Phone Overlap',
        mimeType: 'image/webp',
      }),
    ).toBe('user-1/mission-1/shot-1-phone-overlap.webp');

    expect(
      buildLabAttachmentStoragePath({
        userId: 'user-1',
        missionId: 'mission-1',
        attachmentId: 'shot-2',
        name: 'bad/name?.png',
        mimeType: 'image/png',
      }),
    ).toBe('user-1/mission-1/shot-2-bad-name-.png');
  });
});
