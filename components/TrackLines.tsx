'use client';

import { useEffect, useState } from 'react';

/*
 * TrackLines — Layer 4 of the Overview vision. Horizontal lines,
 * one per ongoing pursuit (life category). Each ● is a logged
 * session/touch in the past 30 days. Faded trailing dots = momentum
 * slipping. Bright leading dot = active in the past few days.
 *
 * Honest, not motivational. The neglected tracks look thin so the
 * user *sees* what they've been letting slide.
 *
 * Reads:
 *   - colourmap:life-categories — the user's named categories
 *   - colourmap:life-log         — entries dated to a category
 *
 * Returns null if the user has no categories yet.
 *
 * Spec: docs/specs/overview-vision-progression-patterns-beauty.md
 */

const LS_CATS = 'colourmap:life-categories';
const LS_LOG = 'colourmap:life-log';

interface LifeCategory {
  id: string;
  name: string;
  color: string;
}

interface LogEntry {
  id: string;
  categoryId: string;
  createdAt?: string;
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

interface TrackRow {
  id: string;
  name: string;
  colour: string;
  /** Booleans for the past 30 days, oldest first → newest last. */
  days: boolean[];
  /** Was the most recent touch in the past 7 days? */
  active: boolean;
}

const DAYS = 30;

function buildTracks(cats: LifeCategory[], log: LogEntry[]): TrackRow[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return cats.map((cat) => {
    const days: boolean[] = new Array(DAYS).fill(false);
    let mostRecent = -1;
    for (const entry of log) {
      if (entry.categoryId !== cat.id) continue;
      if (!entry.createdAt) continue;
      const t = new Date(entry.createdAt);
      t.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - t.getTime()) / 86_400_000);
      if (diff < 0 || diff >= DAYS) continue;
      const idx = DAYS - 1 - diff;
      days[idx] = true;
      if (diff < mostRecent || mostRecent === -1) mostRecent = diff;
    }
    return {
      id: cat.id,
      name: cat.name,
      colour: cat.color,
      days,
      active: mostRecent >= 0 && mostRecent < 7,
    };
  });
}

export default function TrackLines() {
  const [tracks, setTracks] = useState<TrackRow[]>([]);

  useEffect(() => {
    const cats = loadJSON<LifeCategory[]>(LS_CATS, []);
    const log = loadJSON<LogEntry[]>(LS_LOG, []);
    setTracks(buildTracks(cats, log));
  }, []);

  if (tracks.length === 0) return null;

  return (
    <div
      className="rounded-xl"
      style={{
        background: '#C4A06010',
        border: '1px solid #C4A06022',
        padding: '14px 16px 12px',
      }}
    >
      <p
        className="mb-3 text-center uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#7A5438',
          opacity: 0.85,
        }}
      >
        tracks · last 30 days
      </p>
      <div className="space-y-2.5">
        {tracks.map((t) => {
          const totalTouches = t.days.filter(Boolean).length;
          return (
            <div key={t.id} className="flex items-center gap-3">
              <span
                className="shrink-0 truncate"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: t.colour,
                  width: 90,
                  letterSpacing: '0.04em',
                  opacity: t.active ? 1 : 0.55,
                }}
              >
                ✦ {t.name}
              </span>
              <div className="flex flex-1 items-center gap-[2px]">
                {t.days.map((touched, i) => {
                  // Newer days (right) are slightly brighter.
                  const recency = i / (DAYS - 1);
                  return (
                    <span
                      key={i}
                      className="block rounded-full"
                      style={{
                        width: 4,
                        height: touched ? 8 : 3,
                        background: touched ? t.colour : '#C4A06030',
                        opacity: touched ? 0.5 + recency * 0.5 : 0.3,
                      }}
                    />
                  );
                })}
              </div>
              <span
                className="shrink-0"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.colour,
                  opacity: 0.7,
                  letterSpacing: '0.04em',
                  width: 28,
                  textAlign: 'right',
                }}
              >
                {totalTouches}
              </span>
            </div>
          );
        })}
      </div>
      <p
        className="mt-3 text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10.5,
          color: '#8A6A4A',
          opacity: 0.55,
          letterSpacing: '0.04em',
        }}
      >
        bright leading = active · faded trailing = drifting
      </p>
    </div>
  );
}
