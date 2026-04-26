'use client';

import { useEffect, useState } from 'react';

/*
 * WeekShape — Layer 2 of the Overview vision: a horizontal
 * heat-river of feeling + doing across the past 7 days.
 *
 * Spec: docs/specs/overview-vision-progression-patterns-beauty.md
 *
 * Reads from the existing colourmap:check-ins localStorage entries
 * (the same store FeelingCheckInCard writes). For each of the past
 * 7 days, picks the latest check-in of that day and paints two
 * stacked "rivers" — mindColor on top (feeling tone), modeColor on
 * the bottom (doing tone). Band heights modulate with the
 * hawkinsIdx (consciousness/energy score) so days with high energy
 * read taller than quiet days.
 *
 * No counters. No labels beyond the soft day initial. The shape
 * IS the streak. Per the Overview vision: recognition + beauty,
 * not metrics.
 *
 * Returns null when there are zero check-ins so the surface stays
 * silent for first-time users.
 */

const LS_CHECKINS = 'colourmap:check-ins';

interface CheckIn {
  id: string;
  date: string;
  mind?: string;
  mindColor?: string;
  hawkinsIdx?: number;
  mode?: string;
  modeColor?: string;
}

interface DayCell {
  isoDay: string; // YYYY-MM-DD
  weekday: string; // 'M', 'T', 'W' ...
  isToday: boolean;
  feelingColour?: string;
  doingColour?: string;
  /** 0..1 intensity from hawkins. Empty days = 0. */
  intensity: number;
  hasCheckin: boolean;
}

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function loadCheckIns(): CheckIn[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_CHECKINS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildWeek(checkins: CheckIn[]): DayCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: DayCell[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isoDay = d.toISOString().slice(0, 10);
    // Find the *latest* check-in for that day.
    const dayCheckins = checkins.filter((c) => {
      if (!c.date) return false;
      return new Date(c.date).toISOString().slice(0, 10) === isoDay;
    });
    const latest = dayCheckins[0]; // entries are saved newest-first
    const intensity =
      latest && typeof latest.hawkinsIdx === 'number'
        ? Math.max(0.2, Math.min(1, latest.hawkinsIdx / 9))
        : 0;
    cells.push({
      isoDay,
      weekday: WEEKDAY_INITIALS[d.getDay()],
      isToday: i === 0,
      feelingColour: latest?.mindColor,
      doingColour: latest?.modeColor,
      intensity,
      hasCheckin: !!latest,
    });
  }
  return cells;
}

export default function WeekShape() {
  const [cells, setCells] = useState<DayCell[]>([]);
  const [hasAny, setHasAny] = useState(false);

  useEffect(() => {
    const checkins = loadCheckIns();
    setHasAny(checkins.length > 0);
    setCells(buildWeek(checkins));
    function onStorage(e: StorageEvent) {
      if (e.key === LS_CHECKINS || e.key === null) {
        const c = loadCheckIns();
        setHasAny(c.length > 0);
        setCells(buildWeek(c));
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!hasAny) return null;

  // Drawing constants. SVG renders at 100% width via viewBox.
  const W = 700;
  const H = 110;
  const padX = 6;
  const cellGap = 4;
  const cellW = (W - padX * 2 - cellGap * 6) / 7;
  const riverY = H / 2;
  const maxBandH = 36;

  return (
    <div
      className="rounded-xl"
      style={{
        background: '#C4A06010',
        border: '1px solid #C4A06022',
        padding: '14px 14px 10px',
      }}
    >
      <p
        className="mb-2 text-center uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#7A5438',
          opacity: 0.85,
        }}
      >
        week shape
      </p>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-label="Heat-river of feeling + doing across 7 days"
      >
        <title>Week shape — feeling on top, doing on bottom</title>
        {cells.map((cell, i) => {
          const x = padX + i * (cellW + cellGap);
          const bandH = Math.max(8, maxBandH * cell.intensity);
          // Feeling band — sits above the central river line
          const fY = riverY - bandH;
          // Doing band — sits below
          const dY = riverY;
          return (
            <g key={cell.isoDay}>
              {/* Soft baseline (paper line) — drawn always */}
              <rect x={x} y={riverY - 0.5} width={cellW} height={1} fill="#C4A06030" />
              {/* Feeling band */}
              {cell.hasCheckin && (
                <rect
                  x={x}
                  y={fY}
                  width={cellW}
                  height={bandH}
                  rx={2}
                  fill={cell.feelingColour || '#D4805A'}
                  fillOpacity={0.85}
                />
              )}
              {/* Doing band */}
              {cell.hasCheckin && (
                <rect
                  x={x}
                  y={dY}
                  width={cellW}
                  height={bandH}
                  rx={2}
                  fill={cell.doingColour || '#7AAA58'}
                  fillOpacity={0.78}
                />
              )}
              {/* Empty-day soft dot at the river line */}
              {!cell.hasCheckin && <circle cx={x + cellW / 2} cy={riverY} r={2} fill="#C4A06040" />}
              {/* Day initial below */}
              <text
                x={x + cellW / 2}
                y={H - 2}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: cell.isToday ? 700 : 500,
                  fill: cell.isToday ? '#5C3018' : '#8A6A4A',
                  opacity: cell.isToday ? 1 : 0.6,
                }}
              >
                {cell.weekday}
              </text>
              {cell.isToday && (
                <circle cx={x + cellW / 2} cy={H - 13} r={1.6} fill="#B33A2B" opacity={0.85} />
              )}
            </g>
          );
        })}
      </svg>
      <p
        className="mt-1 text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10.5,
          color: '#8A6A4A',
          opacity: 0.55,
          letterSpacing: '0.04em',
        }}
      >
        feeling above · doing below · today is the marked dot
      </p>
    </div>
  );
}
