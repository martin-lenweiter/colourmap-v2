'use client';

import { useEffect, useState } from 'react';

/*
 * SlowWins — Layer 7 of the Overview vision. A quiet line of
 * unannounced milestones — surfaced *after* the fact when they
 * cross gentle thresholds. Never a popup. Never an interruption.
 * Just there if you scroll to the bottom.
 *
 * Examples:
 *   "You've checked in 30 days in a row."
 *   "You've returned to Chill Machine after 2 weeks away."
 *   "You've written 100 notebook entries this season."
 *
 * One at a time. The component picks the highest-priority Win
 * available right now and shows that one.
 *
 * Spec: docs/specs/overview-vision-progression-patterns-beauty.md
 */

const LS_CHECKINS = 'colourmap:check-ins';
const LS_NOTEBOOK = 'colourmap:notebook-entries';
const LS_TUNER_MIXES = 'colourmap:tuner-mixes';
const LS_LIFE_LOG = 'colourmap:life-log';

interface CheckIn {
  date?: string;
}

interface NotebookEntry {
  id: string;
  createdAt?: string;
}

interface Mix {
  name: string;
}

interface LogEntry {
  id: string;
  createdAt?: string;
}

interface Win {
  text: string;
  priority: number; // higher wins
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

function uniqueDays(records: { date?: string; createdAt?: string }[]): Set<string> {
  const days = new Set<string>();
  for (const r of records) {
    const iso = r.date || r.createdAt;
    if (!iso) continue;
    days.add(new Date(iso).toISOString().slice(0, 10));
  }
  return days;
}

function computeStreak(days: Set<string>): number {
  if (days.size === 0) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function pickWin(): Win | null {
  const checkins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
  const notebook = loadJSON<NotebookEntry[]>(LS_NOTEBOOK, []);
  const mixes = loadJSON<Mix[]>(LS_TUNER_MIXES, []);
  const lifeLog = loadJSON<LogEntry[]>(LS_LIFE_LOG, []);

  const wins: Win[] = [];

  // Streak wins — bigger streaks crowd out smaller ones.
  const streak = computeStreak(uniqueDays(checkins));
  if (streak >= 100) wins.push({ text: `100 days in a row of checking in.`, priority: 100 });
  else if (streak >= 50)
    wins.push({ text: `${streak} days in a row of checking in.`, priority: 90 });
  else if (streak >= 30)
    wins.push({ text: `${streak} days in a row of checking in.`, priority: 80 });
  else if (streak >= 14)
    wins.push({ text: `${streak} days in a row — two weeks of showing up.`, priority: 60 });
  else if (streak >= 7)
    wins.push({ text: `${streak} days in a row of checking in.`, priority: 40 });

  // Notebook entries milestones.
  if (notebook.length >= 100)
    wins.push({ text: `100 notebook entries this season.`, priority: 75 });
  else if (notebook.length >= 50)
    wins.push({ text: `50 notebook entries — a real archive forming.`, priority: 55 });
  else if (notebook.length >= 25)
    wins.push({ text: `${notebook.length} notebook entries so far.`, priority: 30 });

  // Saved mixes / sound exploration.
  if (mixes.length >= 20)
    wins.push({ text: `20 saved sound moments — a personal sound library.`, priority: 50 });
  else if (mixes.length >= 5)
    wins.push({ text: `${mixes.length} saved sound moments.`, priority: 20 });

  // Life-log entries — sustained tending of life categories.
  if (lifeLog.length >= 50)
    wins.push({ text: `${lifeLog.length} life-log entries — sustained attention.`, priority: 65 });
  else if (lifeLog.length >= 10)
    wins.push({ text: `${lifeLog.length} life-log entries — building a habit.`, priority: 25 });

  if (wins.length === 0) return null;
  wins.sort((a, b) => b.priority - a.priority);
  return wins[0];
}

export default function SlowWins() {
  const [win, setWin] = useState<Win | null>(null);

  useEffect(() => {
    setWin(pickWin());
  }, []);

  if (!win) return null;

  return (
    <div
      className="rounded-xl"
      style={{
        background: '#7AAA580C',
        border: '1px solid #7AAA5828',
        padding: '12px 18px',
      }}
    >
      <p
        className="text-center"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          color: '#5C3018',
          letterSpacing: '0.04em',
          lineHeight: 1.5,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#7AAA58',
            marginRight: 9,
            verticalAlign: 'middle',
          }}
        />
        <span style={{ color: '#5F7447', fontWeight: 600 }}>{win.text}</span>
      </p>
    </div>
  );
}
