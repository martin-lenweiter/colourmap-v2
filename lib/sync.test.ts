import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, from, upsert } = vi.hoisted(() => {
  const insert = vi.fn(() => Promise.resolve({}));
  const upsert = vi.fn(() => Promise.resolve({}));
  const select = vi.fn(() => Promise.resolve({ data: [], error: null }));
  const from = vi.fn(() => ({ insert, upsert, select }));

  return {
    createClient: vi.fn(() => ({ from })),
    from,
    insert,
    upsert,
    select,
  };
});

vi.mock('@/lib/supabase/client', () => ({
  createClient,
}));

import { hydrate, syncEvent, syncPref } from './sync';

describe('client sync helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it('skips background sync when Supabase env is not configured', async () => {
    syncEvent('ritual_done', { ritualId: 'r1' });
    syncPref('colourmap:test', { ok: true });
    await hydrate();

    expect(createClient).not.toHaveBeenCalled();
  });

  it('syncs preferences when Supabase env is configured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';

    syncPref('colourmap:test', { ok: true });

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith('user_prefs');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'colourmap:test', value: { ok: true } }),
    );
  });
});
