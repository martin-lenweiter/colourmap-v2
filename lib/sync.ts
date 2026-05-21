'use client';

import { createClient } from '@/lib/supabase/client';

export type SyncEventType =
  | 'axis_snapshot'
  | 'circle_note'
  | 'focus_note'
  | 'feel_note'
  | 'needs_note'
  | 'behavior_log'
  | 'ritual_done';

function canSyncWithSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Append a time-series event to day_events.
 * Fire-and-forget; never blocks the UI.
 */
export function syncEvent(type: SyncEventType, payload: Record<string, unknown>): void {
  if (!canSyncWithSupabase()) return;

  const client = createClient();
  client
    .from('day_events')
    .insert({ date: todayDate(), type, payload })
    .then(() => {});
}

/**
 * Upsert a key/value pair into user_prefs.
 * Fire-and-forget; never blocks the UI.
 *
 * Use this for config blobs and preferences that aren't time-series:
 * ritual/behavior definitions, card lists, UI settings, etc.
 * The key should be the full localStorage key (e.g. 'colourmap:rituals').
 */
export function syncPref(key: string, value: unknown): void {
  if (!canSyncWithSupabase()) return;

  const client = createClient();
  client
    .from('user_prefs')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .then(() => {});
}

/**
 * Pull all user_prefs from Supabase and write them into localStorage.
 *
 * Design: silent background restore. The current session renders
 * from whatever is in localStorage already (instant). This call
 * overwrites localStorage with server data so the next session
 * or next page refresh starts with the correct cross-device state.
 *
 * Call once near app mount; no await needed unless you want to gate
 * rendering on it.
 */
export async function hydrate(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!canSyncWithSupabase()) return;

  try {
    const client = createClient();
    const { data, error } = await client.from('user_prefs').select('key, value');
    if (error || !data?.length) return;
    for (const row of data) {
      const val = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
      localStorage.setItem(row.key, val);
    }
    window.dispatchEvent(new CustomEvent('colourmap:hydrated'));
  } catch {}
}
