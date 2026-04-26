'use client';

import { useEffect, useState } from 'react';

/*
 * CompassFlower — Layer 3 of the Overview vision. A 4-axis radial
 * "flower" showing the past 14 days of activity across four life
 * dimensions:
 *
 *   Inner — feeling check-ins
 *   Doing — objectives, focus minutes
 *   Care  — social, family, health entries (life-log)
 *   Play  — music, art, notebook ideas
 *
 * Each petal blooms or wilts based on how much the user has
 * tended that dimension. A balanced life is a round flower; a
 * drift is a lopsided one. One sentence underneath observes the
 * shape gently.
 *
 * V1 heuristic — counts past-14-day events per dimension, normalises
 * to a 0..1 petal-length. A real "balance" engine would also track
 * intensity (hawkins score, session length) — that comes later.
 *
 * Spec: docs/specs/overview-vision-progression-patterns-beauty.md
 */

const LS_CHECKINS = 'colourmap:check-ins';
const LS_OBJECTIVES_TODAY = 'colourmap:today-objectives';
const LS_LIFE_LOG = 'colourmap:life-log';
const LS_NOTEBOOK = 'colourmap:notebook-entries';
const LS_TUNER_MIXES = 'colourmap:tuner-mixes';

interface DateRecord {
  date?: string;
  createdAt?: string;
  completedAt?: string;
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

function countWithinDays(records: DateRecord[], days: number): number {
  const cutoff = Date.now() - days * 86_400_000;
  let n = 0;
  for (const r of records) {
    const iso = r.date || r.createdAt || r.completedAt;
    if (!iso) continue;
    const t = new Date(iso).getTime();
    if (Number.isFinite(t) && t >= cutoff) n++;
  }
  return n;
}

interface Petal {
  label: string;
  count: number;
  /** 0..1 normalized */
  intensity: number;
  colour: string;
}

const TARGETS = { inner: 14, doing: 10, care: 7, play: 7 };

export default function CompassFlower() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkins = loadJSON<DateRecord[]>(LS_CHECKINS, []);
    const objectives = loadJSON<DateRecord[]>(LS_OBJECTIVES_TODAY, []);
    const lifeLog = loadJSON<DateRecord[]>(LS_LIFE_LOG, []);
    const notebook = loadJSON<DateRecord[]>(LS_NOTEBOOK, []);
    const mixes = loadJSON<DateRecord[]>(LS_TUNER_MIXES, []);

    const inner = countWithinDays(checkins, 14);
    const doing = countWithinDays(objectives, 14);
    const care = countWithinDays(lifeLog, 14);
    const play = countWithinDays(notebook, 14) + countWithinDays(mixes, 14);

    const built: Petal[] = [
      {
        label: 'Inner',
        count: inner,
        intensity: Math.max(0.05, Math.min(1, inner / TARGETS.inner)),
        colour: '#D4805A',
      },
      {
        label: 'Doing',
        count: doing,
        intensity: Math.max(0.05, Math.min(1, doing / TARGETS.doing)),
        colour: '#7AAA58',
      },
      {
        label: 'Care',
        count: care,
        intensity: Math.max(0.05, Math.min(1, care / TARGETS.care)),
        colour: '#9B6BA0',
      },
      {
        label: 'Play',
        count: play,
        intensity: Math.max(0.05, Math.min(1, play / TARGETS.play)),
        colour: '#5AA8B0',
      },
    ];

    const total = inner + doing + care + play;
    setShow(total > 0);
    setPetals(built);
  }, []);

  if (!show) return null;

  // Drawing — 4 petals at 0°, 90°, 180°, 270° around a centre.
  const cx = 110;
  const cy = 110;
  const minR = 18;
  const maxR = 80;
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // top, right, bottom, left

  // Find which petal is the smallest — the one to gently note.
  const smallest =
    petals.length > 0 ? petals.reduce((a, b) => (a.intensity < b.intensity ? a : b)) : null;
  const largest =
    petals.length > 0 ? petals.reduce((a, b) => (a.intensity > b.intensity ? a : b)) : null;
  let observation = '';
  if (smallest && largest && largest.intensity - smallest.intensity > 0.4) {
    observation = `Your ${largest.label} petal is full this fortnight. Your ${smallest.label} petal could use water.`;
  } else if (largest && largest.intensity > 0.7) {
    observation = `A round flower. Even tending across all four.`;
  } else {
    observation = `Early days — keep watering wherever it feels alive.`;
  }

  return (
    // Phone: no card wrapper, just breathing room. Desktop: soft tan
    // card so the compass sits inside the column rhythm. (Martin
    // 2026-04-26: "drop the white box around the compasses in phone
    // view.")
    <div
      className="rounded-xl px-1 py-3 md:border md:px-3.5 md:py-3"
      style={{
        background: 'transparent',
        borderColor: '#C4A06022',
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
        compass · last 14 days
      </p>
      <svg
        width="100%"
        height={220}
        viewBox="0 0 220 220"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Four-axis compass flower"
      >
        <title>Compass flower — Inner / Doing / Care / Play balance</title>
        {/* Background grid — concentric rings */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={minR + (maxR - minR) * r}
            fill="none"
            stroke="#C4A06030"
            strokeDasharray="2 4"
          />
        ))}
        {/* Petals */}
        {petals.map((p, i) => {
          const angle = angles[i];
          const r = minR + (maxR - minR) * p.intensity;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          // Petal shape — an ellipse along the axis
          const ex = cx + (r / 2) * Math.cos(angle);
          const ey = cy + (r / 2) * Math.sin(angle);
          const rx = r / 2;
          const ry = Math.max(8, r * 0.3);
          const rotateDeg = (angle * 180) / Math.PI;
          // Label position — just past the petal tip
          const lx = cx + (r + 14) * Math.cos(angle);
          const ly = cy + (r + 14) * Math.sin(angle);
          return (
            <g key={p.label}>
              <ellipse
                cx={ex}
                cy={ey}
                rx={rx}
                ry={ry}
                fill={p.colour}
                fillOpacity={0.45}
                transform={`rotate(${rotateDeg} ${ex} ${ey})`}
              />
              <circle cx={px} cy={py} r={4} fill={p.colour} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 700,
                  fill: p.colour,
                  letterSpacing: '0.04em',
                }}
              >
                {p.label}
              </text>
            </g>
          );
        })}
        {/* Centre dot */}
        <circle cx={cx} cy={cy} r={3} fill="#5C3018" opacity={0.6} />
      </svg>
      <p
        className="mt-2 text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          color: '#7A5438',
          opacity: 0.85,
          lineHeight: 1.5,
        }}
      >
        {observation}
      </p>
    </div>
  );
}
