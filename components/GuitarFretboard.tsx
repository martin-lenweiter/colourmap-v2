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

const SCALE_INTERVALS: Record<ScaleName, string> = {
  Major: 'W W H W W W H',
  Minor: 'W H W W H W W',
  'Pentatonic Minor': 'W+H W W W+H W',
  'Pentatonic Major': 'W W W+H W W+H',
  Blues: 'W+H W H H W+H W',
  Dorian: 'W H W W W H W',
  Phrygian: 'H W W W H W W',
  'Phrygian Dominant': 'H W+H H W H W W',
  'Harmonic Minor': 'W H W W H W+H H',
};

const SCALE_NAMES = Object.keys(SCALES) as ScaleName[];

function getScaleDegree(note: number, root: number, intervals: number[]): number {
  const normalized = (((note - root) % 12) + 12) % 12;
  return intervals.indexOf(normalized) + 1; // 1-based, 0 = not in scale
}

type LabelMode = 'degree' | 'note';
type PositionWindow = 'all' | 'open' | '5-9' | '9-12';

const POSITION_WINDOWS: { id: PositionWindow; label: string; start: number; end: number }[] = [
  { id: 'all', label: 'Full', start: 0, end: 12 },
  { id: 'open', label: '1–4', start: 0, end: 4 },
  { id: '5-9', label: '5–9', start: 5, end: 9 },
  { id: '9-12', label: '9–12', start: 9, end: 12 },
];

/* ─── SVG geometry ───────────────────────────────────────── */

const NUT_X = 48;
const FRET_WIDTH = 54;
const STRING_TOP = 26;
const STRING_SPACING = 28;
const SVG_HEIGHT = STRING_TOP + 5 * STRING_SPACING + 26;

const FRET_MARKERS = [3, 5, 7, 9];
const DOUBLE_MARKERS = [12];

function fretCenterX(fret: number, startFret: number): number {
  const relative = fret - startFret;
  if (fret === 0) return NUT_X / 2;
  return NUT_X + (relative - 0.5) * FRET_WIDTH;
}

function stringY(s: number): number {
  return STRING_TOP + s * STRING_SPACING;
}

/* ─── Component ──────────────────────────────────────────── */

export default function GuitarFretboard() {
  const [root, setRoot] = useState(0); // 0 = C
  const [scaleName, setScaleName] = useState<ScaleName>('Minor');
  const [labelMode, setLabelMode] = useState<LabelMode>('degree');
  const [position, setPosition] = useState<PositionWindow>('all');

  const intervals = SCALES[scaleName];
  const scaleSet = new Set(intervals.map((i) => (root + i) % 12));

  const window = POSITION_WINDOWS.find((p) => p.id === position)!;
  const startFret = window.start;
  const endFret = window.end;
  const numFrets = endFret - startFret;
  const svgWidth = NUT_X + numFrets * FRET_WIDTH + 8;

  return (
    <div className="space-y-5">
      {/* Scale formula */}
      <div
        className="rounded-xl px-4 py-2.5"
        style={{ background: '#C4A06008', border: '1px solid #C4A06018' }}
      >
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="text-[13px] font-semibold"
            style={{ color: 'var(--foreground)', letterSpacing: '0.04em' }}
          >
            {NOTE_NAMES[root]} {scaleName}
          </span>
          <span
            className="font-mono text-[11px]"
            style={{ color: '#C4A060', letterSpacing: '0.08em' }}
          >
            {SCALE_INTERVALS[scaleName]}
          </span>
        </div>
        <p
          className="mt-1 text-[10px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          {intervals.length} notes · root = {NOTE_NAMES[root]} (gold dot)
        </p>
      </div>

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

      {/* Position + label controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <span
            className="text-[10px] uppercase tracking-[0.1em] mr-2"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Position
          </span>
          {POSITION_WINDOWS.map((p) => {
            const active = p.id === position;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPosition(p.id)}
                className="cursor-pointer rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] transition-all"
                style={{
                  background: active ? '#C4A06020' : 'transparent',
                  color: active ? '#C4A060' : 'var(--muted-foreground)',
                  border: active ? '1px solid #C4A06040' : '1px solid transparent',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span
            className="text-[10px] uppercase tracking-[0.1em] mr-2"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Labels
          </span>
          {(['degree', 'note'] as LabelMode[]).map((m) => {
            const active = m === labelMode;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setLabelMode(m)}
                className="cursor-pointer rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] transition-all"
                style={{
                  background: active ? '#C4A06020' : 'transparent',
                  color: active ? '#C4A060' : 'var(--muted-foreground)',
                  border: active ? '1px solid #C4A06040' : '1px solid transparent',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {m === 'degree' ? '1–7' : 'A–G'}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG fretboard */}
      <div style={{ overflowX: 'auto' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
          style={{ display: 'block', minWidth: 280 }}
          aria-label={`${NOTE_NAMES[root]} ${scaleName} scale on guitar fretboard`}
        >
          {/* Neck background */}
          <rect
            x={NUT_X}
            y={STRING_TOP - 14}
            width={numFrets * FRET_WIDTH}
            height={5 * STRING_SPACING + 28}
            rx={4}
            fill="#2A1A0E"
          />

          {/* Position marker dots */}
          {FRET_MARKERS.filter((f) => f >= startFret + 1 && f <= endFret).map((fret) => (
            <circle
              key={fret}
              cx={fretCenterX(fret, startFret)}
              cy={STRING_TOP + 2.5 * STRING_SPACING}
              r={5}
              fill="#4A3020"
            />
          ))}
          {DOUBLE_MARKERS.filter((f) => f >= startFret + 1 && f <= endFret).map((fret) => (
            <g key={fret}>
              <circle
                cx={fretCenterX(fret, startFret)}
                cy={STRING_TOP + 1.5 * STRING_SPACING}
                r={5}
                fill="#4A3020"
              />
              <circle
                cx={fretCenterX(fret, startFret)}
                cy={STRING_TOP + 3.5 * STRING_SPACING}
                r={5}
                fill="#4A3020"
              />
            </g>
          ))}

          {/* Fret lines */}
          {Array.from({ length: numFrets + 1 }, (_, f) => {
            const absFret = startFret + f;
            const x = NUT_X + f * FRET_WIDTH;
            const isNut = absFret === 0;
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

          {/* Start-fret label (when not at open position) */}
          {startFret > 0 && (
            <text
              x={NUT_X - 4}
              y={STRING_TOP - 2}
              textAnchor="end"
              fontSize={9}
              fill="#A08060"
              fontFamily="var(--font-serif)"
            >
              {startFret}fr
            </text>
          )}

          {/* Fret numbers at bottom */}
          {Array.from({ length: numFrets + 1 }, (_, f) => {
            const absFret = startFret + f;
            if (absFret === 0) return null;
            return (
              <text
                key={absFret}
                x={fretCenterX(absFret, startFret)}
                y={SVG_HEIGHT - 4}
                textAnchor="middle"
                fontSize={9}
                fill="#A08060"
                fontFamily="var(--font-serif)"
              >
                {absFret}
              </text>
            );
          })}

          {/* String lines + labels */}
          {OPEN_NOTES.map((_, s) => {
            const y = stringY(s);
            const strokeW = s === 0 || s === 1 ? 2.5 : s === 2 || s === 3 ? 1.8 : 1.2;
            return (
              <g key={s}>
                <line
                  x1={NUT_X}
                  y1={y}
                  x2={NUT_X + numFrets * FRET_WIDTH}
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

          {/* Scale note dots */}
          {OPEN_NOTES.map((openNote, s) => {
            const y = stringY(s);
            return Array.from({ length: numFrets + 1 }, (_, f) => {
              const absFret = startFret + f;
              const note = (openNote + absFret) % 12;
              if (!scaleSet.has(note)) return null;
              const degree = getScaleDegree(note, root, intervals);
              const isRoot = note === root;
              const cx = fretCenterX(absFret, startFret);
              const dotLabel =
                labelMode === 'note' ? NOTE_NAMES[note] : degree > 0 ? String(degree) : '';
              const fontSize = NOTE_NAMES[note].includes('#') ? 7.5 : 9.5;
              return (
                <g key={`${s}-${absFret}`}>
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
                    y={y + 4}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="700"
                    fill={isRoot ? '#1A0E04' : '#F0E0C0'}
                    fontFamily="var(--font-serif)"
                  >
                    {dotLabel}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 text-[11px] flex-wrap"
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
        <span className="ml-auto italic opacity-70">scroll to explore · tap root to transpose</span>
      </div>
    </div>
  );
}
