'use client';

import { useState } from 'react';

/* ─── Music theory ───────────────────────────────────────── */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard tuning E A D G B e (low → high), as semitone class mod 12
const OPEN_NOTES = [4, 9, 2, 7, 11, 4]; // string index 0 = low E (drawn at top)
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

type ScaleName =
  | 'Major'
  | 'Minor'
  | 'Pentatonic Minor'
  | 'Pentatonic Major'
  | 'Blues'
  | 'Dorian'
  | 'Phrygian'
  | 'Phrygian Dominant'
  | 'Harmonic Minor';

const SCALES: Record<ScaleName, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  Blues: [0, 3, 5, 6, 7, 10],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  'Phrygian Dominant': [0, 1, 4, 5, 7, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
};

const SCALE_NAMES = Object.keys(SCALES) as ScaleName[];

function getScaleDegree(note: number, root: number, intervals: number[]): number {
  const normalized = (((note - root) % 12) + 12) % 12;
  return intervals.indexOf(normalized) + 1; // 1-based, 0 = not in scale
}

/* ─── SVG geometry ───────────────────────────────────────── */

const NUT_X = 48;
const FRET_WIDTH = 54;
const STRING_TOP = 26;
const STRING_SPACING = 28;
const NUM_FRETS = 12;
const SVG_WIDTH = NUT_X + NUM_FRETS * FRET_WIDTH + 8; // 704
const SVG_HEIGHT = STRING_TOP + 5 * STRING_SPACING + 26; // 192

const FRET_MARKERS = [3, 5, 7, 9]; // single dots
const DOUBLE_MARKERS = [12]; // double dots

function fretCenterX(fret: number): number {
  if (fret === 0) return NUT_X / 2;
  return NUT_X + (fret - 0.5) * FRET_WIDTH;
}

function stringY(s: number): number {
  return STRING_TOP + s * STRING_SPACING;
}

/* ─── Component ──────────────────────────────────────────── */

export default function GuitarFretboard() {
  const [root, setRoot] = useState(0); // 0 = C
  const [scaleName, setScaleName] = useState<ScaleName>('Minor');

  const intervals = SCALES[scaleName];
  const scaleSet = new Set(intervals.map((i) => (root + i) % 12));

  return (
    <div className="space-y-5">
      {/* Root picker */}
      <div className="flex flex-wrap gap-2">
        {NOTE_NAMES.map((name, i) => {
          const active = i === root;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setRoot(i)}
              className="cursor-pointer rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] transition-all"
              style={{
                background: active ? '#C4A060' : '#C4A06015',
                color: active ? '#fff' : '#C4A060',
                border: active ? '1px solid #C4A060' : '1px solid #C4A06030',
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Scale picker */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {SCALE_NAMES.map((name) => {
          const active = name === scaleName;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setScaleName(name)}
              className="cursor-pointer bg-transparent text-[12px] uppercase tracking-[0.08em] transition-all"
              style={{
                fontFamily: 'var(--font-serif)',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: active ? 700 : 400,
                borderBottom: active ? '1px solid #C4A060' : '1px solid transparent',
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* SVG fretboard */}
      <div style={{ overflowX: 'auto' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ display: 'block', minWidth: 340 }}
          aria-label={`${NOTE_NAMES[root]} ${scaleName} scale on guitar fretboard`}
        >
          {/* Neck background */}
          <rect
            x={NUT_X}
            y={STRING_TOP - 14}
            width={NUM_FRETS * FRET_WIDTH}
            height={5 * STRING_SPACING + 28}
            rx={4}
            fill="#2A1A0E"
          />

          {/* Fret position marker dots (3,5,7,9 single; 12 double) */}
          {FRET_MARKERS.map((fret) => (
            <circle
              key={fret}
              cx={fretCenterX(fret)}
              cy={STRING_TOP + 2.5 * STRING_SPACING}
              r={5}
              fill="#4A3020"
            />
          ))}
          {DOUBLE_MARKERS.map((fret) => (
            <g key={fret}>
              <circle
                cx={fretCenterX(fret)}
                cy={STRING_TOP + 1.5 * STRING_SPACING}
                r={5}
                fill="#4A3020"
              />
              <circle
                cx={fretCenterX(fret)}
                cy={STRING_TOP + 3.5 * STRING_SPACING}
                r={5}
                fill="#4A3020"
              />
            </g>
          ))}

          {/* Fret lines */}
          {Array.from({ length: NUM_FRETS + 1 }, (_, f) => {
            const x = NUT_X + f * FRET_WIDTH;
            const isNut = f === 0;
            return (
              <line
                key={f}
                x1={x}
                y1={STRING_TOP - 10}
                x2={x}
                y2={STRING_TOP + 5 * STRING_SPACING + 10}
                stroke={isNut ? '#C8A878' : '#5A3C20'}
                strokeWidth={isNut ? 4 : 1.5}
              />
            );
          })}

          {/* Fret numbers */}
          {[3, 5, 7, 9, 12].map((fret) => (
            <text
              key={fret}
              x={fretCenterX(fret)}
              y={SVG_HEIGHT - 4}
              textAnchor="middle"
              fontSize={9}
              fill="#A08060"
              fontFamily="var(--font-serif)"
            >
              {fret}
            </text>
          ))}

          {/* String lines + labels */}
          {OPEN_NOTES.map((_, s) => {
            const y = stringY(s);
            const strokeW = s === 0 || s === 1 ? 2.5 : s === 2 || s === 3 ? 1.8 : 1.2;
            return (
              <g key={s}>
                <line
                  x1={NUT_X}
                  y1={y}
                  x2={NUT_X + NUM_FRETS * FRET_WIDTH}
                  y2={y}
                  stroke="#A0907A"
                  strokeWidth={strokeW}
                />
                <text
                  x={NUT_X - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="#A08060"
                  fontFamily="var(--font-serif)"
                >
                  {STRING_LABELS[s]}
                </text>
              </g>
            );
          })}

          {/* Scale note dots (frets 0–12) */}
          {OPEN_NOTES.map((openNote, s) => {
            const y = stringY(s);
            return Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
              const note = (openNote + fret) % 12;
              if (!scaleSet.has(note)) return null;
              const degree = getScaleDegree(note, root, intervals);
              const isRoot = note === root;
              const cx = fretCenterX(fret);
              return (
                <g key={`${s}-${fret}`}>
                  <circle
                    cx={cx}
                    cy={y}
                    r={11}
                    fill={isRoot ? '#C4A060' : '#7A5A3A'}
                    stroke={isRoot ? '#E8C880' : '#A08060'}
                    strokeWidth={1}
                  />
                  <text
                    x={cx}
                    y={y + 4.5}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="700"
                    fill={isRoot ? '#1A0E04' : '#F0E0C0'}
                    fontFamily="var(--font-serif)"
                  >
                    {degree}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 text-[11px]"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-4 w-4 rounded-full" style={{ background: '#C4A060' }} />
          Root ({NOTE_NAMES[root]})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-4 w-4 rounded-full" style={{ background: '#7A5A3A' }} />
          Scale tone
        </span>
      </div>
    </div>
  );
}
