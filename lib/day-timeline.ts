import { syncEvent } from '@/lib/sync';

export type TimelineEntry = { t: number; i: number[] };

const KEY = 'colourmap:day-timeline-v1';

function midnightToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function forceAppendEntry(indices: number[]): void {
  if (typeof window === 'undefined') return;
  const entries = getTodayEntries();
  entries.push({ t: Date.now(), i: [...indices] });
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {}
  syncEvent('axis_snapshot', { t: Date.now(), axes: indices });
}

export function appendEntry(indices: number[]): void {
  if (typeof window === 'undefined') return;
  const entries = getTodayEntries();
  const last = entries[entries.length - 1];
  const same = last && last.i.length === indices.length && last.i.every((v, j) => v === indices[j]);
  if (same) return;
  if (last && Date.now() - last.t < 20_000) {
    last.i = [...indices];
    last.t = Date.now();
  } else {
    entries.push({ t: Date.now(), i: [...indices] });
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {}
}

export function getTodayEntries(): TimelineEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as TimelineEntry[];
    const midnight = midnightToday();
    return all.filter((e) => e.t >= midnight);
  } catch {
    return [];
  }
}
