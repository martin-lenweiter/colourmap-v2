'use client';

import { useEffect, useState } from 'react';

import { colours, fontSize, letterSpacing, radii, space } from '@/lib/design-tokens';

/*
 * NowBar — a single sentence that summarizes the present moment.
 * Sits at the top of the Overview tab and reads as a calm, human
 * status line. No metrics, no charts — just a soft *here is where
 * you are*.
 *
 * Reads:
 *  - last check-in (colourmap:check-ins) → tone phrase
 *  - current objective (colourmap:current-objective) → activity
 *  - last tuner mix (colourmap:tuner-mixes) → recent music
 *  - streak length → if 3+ days, weave it in
 *
 * Composition is rule-based, not AI — predictable + cheap.
 *
 * First piece of the Overview vision in
 * docs/specs/overview-vision-progression-patterns-beauty.md.
 * Dogfoods lib/design-tokens.ts (first call site).
 */

const LS_CHECKINS = 'colourmap:check-ins';
const LS_OBJECTIVE = 'colourmap:current-objective';
const LS_MIXES = 'colourmap:tuner-mixes';

interface CheckIn {
  date: string;
  feelingTone?: string;
  feelingNote?: string;
  feelingScore?: number;
}

interface Mix {
  name: string;
  base?: number;
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadStr(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function computeStreakDays(checkins: CheckIn[]): number {
  if (checkins.length === 0) return 0;
  const days = new Set<string>();
  for (const c of checkins) {
    if (!c.date) continue;
    days.add(new Date(c.date).toISOString().slice(0, 10));
  }
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function timeOfDay(): 'morning' | 'midday' | 'afternoon' | 'evening' | 'late' {
  const h = new Date().getHours();
  if (h < 6) return 'late';
  if (h < 11) return 'morning';
  if (h < 14) return 'midday';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'late';
}

function partOfDayPhrase(t: ReturnType<typeof timeOfDay>): string {
  switch (t) {
    case 'morning':
      return 'Quiet morning';
    case 'midday':
      return 'Midday';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
    case 'late':
      return 'Late hour';
  }
}

function composeSentence(): string {
  const checkins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
  const objective = loadStr(LS_OBJECTIVE).trim();
  const mixes = loadJSON<Mix[]>(LS_MIXES, []);
  const lastCheckin = checkins[checkins.length - 1];
  const lastMix = mixes[0]; // saved-mixes are stored newest-first

  const parts: string[] = [partOfDayPhrase(timeOfDay()) + '.'];

  if (lastMix) {
    const baseHz = lastMix.base ? `${lastMix.base}Hz` : '';
    parts.push(`You opened with ${lastMix.name}${baseHz ? ` (${baseHz})` : ''}.`);
  }

  if (objective) {
    const trimmed = objective.length > 60 ? objective.slice(0, 57) + '…' : objective;
    parts.push(`Your objective is ${trimmed}.`);
  }

  const streak = computeStreakDays(checkins);
  if (streak >= 3) {
    parts.push(`Last ${streak} days felt steady.`);
  } else if (lastCheckin?.feelingTone) {
    parts.push(`Last check-in: ${lastCheckin.feelingTone}.`);
  }

  return parts.join(' ');
}

export default function NowBar() {
  const [sentence, setSentence] = useState<string>('');

  useEffect(() => {
    setSentence(composeSentence());
    // Recompose when localStorage updates from another tab.
    function onStorage(e: StorageEvent) {
      if (e.key === LS_CHECKINS || e.key === LS_OBJECTIVE || e.key === LS_MIXES) {
        setSentence(composeSentence());
      }
    }
    window.addEventListener('storage', onStorage);
    // Also recompose every minute so the time-of-day phrase rolls
    // forward without a page refresh.
    const timer = setInterval(() => setSentence(composeSentence()), 60_000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(timer);
    };
  }, []);

  if (!sentence) return null;

  return (
    <div
      style={{
        background: `${colours.ochre}10`,
        border: `1px solid ${colours.ochre}28`,
        borderRadius: radii.lg,
        padding: `${space.md}px ${space.lg}px`,
      }}
    >
      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: fontSize.base,
          color: colours.brownDeep,
          lineHeight: 1.55,
          letterSpacing: letterSpacing.body,
        }}
      >
        {sentence}
      </p>
    </div>
  );
}
