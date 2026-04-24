'use client';

import { useEffect, useState } from 'react';

/*
 * DayRail — optional right-side column on desktop (≥1024px).
 *
 * On a phone the Day page column sits in a 520px center pocket — fine.
 * On a laptop the rest of the screen is empty waste. This rail surfaces
 * ambient context the user didn't ask for but usually wants to see:
 *
 *   - Last check-in (date + short mood summary)
 *   - Current streak (how many consecutive days with a check-in)
 *   - What's playing (if Calming Sounds has state)
 *
 * Uses localStorage directly (same keys the check-in and binaural
 * components write to). Does not trigger any network calls — this is
 * a read-only display surface.
 *
 * Hidden entirely on <1024px via Tailwind's `hidden lg:block`. Never
 * shown on phones.
 */

const LS_CHECKINS = 'colourmap:check-ins';
const LS_BASE_FREQ = 'colourmap:base-freq';
const LS_BEAT_FREQ = 'colourmap:beat-freq';

interface CheckInEntry {
  date: string;
  mind?: string;
  mode?: string;
  emotions?: { text?: string }[];
}

function loadCheckIns(): CheckInEntry[] {
  try {
    const raw = localStorage.getItem(LS_CHECKINS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function computeStreak(entries: CheckInEntry[]): number {
  if (entries.length === 0) return 0;
  // Entries are ordered newest-first. Walk from the top counting
  // consecutive dates back to the latest gap > 1 day.
  const days = new Set<string>();
  for (const e of entries) {
    if (!e.date) continue;
    const day = new Date(e.date).toISOString().slice(0, 10);
    days.add(day);
  }
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else if (i > 0) break; // allow missing today; break on first missing non-today
  }
  return streak;
}

function formatRelativeDate(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const dayDiff = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff === 0) return 'today';
  if (dayDiff === 1) return 'yesterday';
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return then.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function DayRail() {
  const [lastCheckIn, setLastCheckIn] = useState<CheckInEntry | null>(null);
  const [streak, setStreak] = useState(0);
  const [baseFreq, setBaseFreq] = useState<number | null>(null);
  const [beatFreq, setBeatFreq] = useState<number | null>(null);

  useEffect(() => {
    const entries = loadCheckIns();
    setLastCheckIn(entries[0] ?? null);
    setStreak(computeStreak(entries));
    try {
      const bf = Number.parseFloat(localStorage.getItem(LS_BASE_FREQ) ?? '');
      const bt = Number.parseFloat(localStorage.getItem(LS_BEAT_FREQ) ?? '');
      setBaseFreq(Number.isFinite(bf) ? bf : null);
      setBeatFreq(Number.isFinite(bt) ? bt : null);
    } catch {
      /* silent */
    }
  }, []);

  return (
    <aside
      className="hidden lg:block w-64 shrink-0 space-y-6 pl-6 pt-2"
      aria-label="Today at a glance"
    >
      <Panel title="Streak" accent="#C4A060">
        {streak > 0 ? (
          <>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 36,
                fontWeight: 700,
                color: '#C4A060',
                lineHeight: 1,
              }}
            >
              {streak}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#8A6A4A',
                  opacity: 0.7,
                  marginLeft: 6,
                }}
              >
                day{streak === 1 ? '' : 's'}
              </span>
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                color: '#8A6A4A',
                opacity: 0.65,
                marginTop: 6,
                fontStyle: 'italic',
              }}
            >
              of checking in
            </p>
          </>
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              color: '#8A6A4A',
              opacity: 0.75,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            No check-ins yet. Your first one starts the map.
          </p>
        )}
      </Panel>

      {lastCheckIn?.date && (
        <Panel title="Last check-in" accent="#6890B0">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 16,
              color: '#5C3018',
              fontWeight: 600,
            }}
          >
            {formatRelativeDate(lastCheckIn.date)}
          </p>
          {lastCheckIn.mind && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: '#8A6A4A',
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              {lastCheckIn.mind}
            </p>
          )}
        </Panel>
      )}

      {baseFreq !== null && beatFreq !== null && (
        <Panel title="Last tuned to" accent="#9B6BA0">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 16,
              color: '#5C3018',
              fontWeight: 600,
            }}
          >
            {baseFreq} Hz
            <span style={{ opacity: 0.5, margin: '0 6px' }}>·</span>
            {beatFreq} Hz beat
          </p>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: '#8A6A4A',
              opacity: 0.7,
              marginTop: 4,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            calming sounds
          </p>
        </Panel>
      )}
    </aside>
  );
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{
        // Solid card — user: 'streak box no degrade'. Previously used
        // a gradient that faded from accent to card.
        background: 'var(--card)',
        borderColor: `${accent}30`,
      }}
    >
      <p
        className="uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: accent,
          opacity: 0.85,
          marginBottom: 10,
          fontWeight: 600,
        }}
      >
        {title}
      </p>
      {children}
    </section>
  );
}
