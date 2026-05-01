'use client';

import { useState } from 'react';

/* ─── Chord data model ───────────────────────────────────── */
// strings[0] = low E, strings[5] = high e
// -1 = muted (X), 0 = open (O), N = fret number (absolute)

type ChordStyle = 'open' | 'soul' | 'flamenco';

interface ChordDef {
  name: string;
  style: ChordStyle;
  fretStart: number; // lowest fret shown (1 for open position)
  strings: [number, number, number, number, number, number]; // E A D G B e
  barre?: number; // fret number with full barre
  label?: string; // optional subtitle (e.g. "barre 1")
}

const CHORDS: ChordDef[] = [
  // ── Open ──────────────────────────────────────────────────
  { name: 'Am', style: 'open', fretStart: 1, strings: [-1, 0, 2, 2, 1, 0] },
  { name: 'E', style: 'open', fretStart: 1, strings: [0, 2, 2, 1, 0, 0] },
  { name: 'Em', style: 'open', fretStart: 1, strings: [0, 2, 2, 0, 0, 0] },
  { name: 'G', style: 'open', fretStart: 1, strings: [3, 2, 0, 0, 0, 3] },
  { name: 'C', style: 'open', fretStart: 1, strings: [-1, 3, 2, 0, 1, 0] },
  { name: 'D', style: 'open', fretStart: 1, strings: [-1, -1, 0, 2, 3, 2] },
  { name: 'A', style: 'open', fretStart: 1, strings: [-1, 0, 2, 2, 2, 0] },

  // ── Soul / 7ths ───────────────────────────────────────────
  { name: 'Am7', style: 'soul', fretStart: 1, strings: [-1, 0, 2, 0, 1, 0] },
  { name: 'Dm7', style: 'soul', fretStart: 1, strings: [-1, -1, 0, 2, 1, 1] },
  { name: 'G7', style: 'soul', fretStart: 1, strings: [3, 2, 0, 0, 0, 1] },
  { name: 'Cmaj7', style: 'soul', fretStart: 1, strings: [-1, 3, 2, 0, 0, 0] },
  { name: 'Em7', style: 'soul', fretStart: 1, strings: [0, 2, 2, 0, 3, 0] },
  { name: 'Fmaj7', style: 'soul', fretStart: 1, strings: [-1, -1, 3, 2, 1, 0] },
  { name: 'E9', style: 'soul', fretStart: 1, strings: [0, 2, 0, 1, 0, 2] },
  { name: 'A9', style: 'soul', fretStart: 1, strings: [-1, 0, 2, 2, 0, 0] },
  { name: 'Dsus2', style: 'soul', fretStart: 1, strings: [-1, -1, 0, 2, 3, 0] },

  // ── Flamenco ─────────────────────────────────────────────
  { name: 'Am', style: 'flamenco', fretStart: 1, strings: [-1, 0, 2, 2, 1, 0] },
  { name: 'G', style: 'flamenco', fretStart: 1, strings: [3, 2, 0, 0, 0, 3] },
  {
    name: 'F',
    style: 'flamenco',
    fretStart: 1,
    strings: [1, 1, 2, 3, 3, 1],
    barre: 1,
    label: 'barre 1',
  },
  { name: 'E', style: 'flamenco', fretStart: 1, strings: [0, 2, 2, 1, 0, 0] },
  { name: 'E7', style: 'flamenco', fretStart: 1, strings: [0, 2, 0, 1, 0, 0] },
];

/* ─── SVG chord box ──────────────────────────────────────── */
/* Horizontal layout: strings = horizontal rows (E top, e bottom),
   frets = vertical columns, nut = thick bar on the left.
   Matches how the GuitarFretboard displays the neck. */

const CB_CELL_W = 18; // fret column width (px)
const CB_CELL_H = 16; // string row spacing (px)
const CB_FRETS = 4; // fret columns shown
const CB_LEFT = 32; // x where nut bar is drawn (room for labels + X/O)
const CB_TOP = 14; // y of string 0 (low E)
const CB_DOT_R = 5.5; // fingering dot radius

// String labels and thickness (index 0 = low E, 5 = high e)
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_WIDTHS = [2.2, 1.8, 1.4, 1.2, 1.0, 0.8];

const CB_W = CB_LEFT + CB_FRETS * CB_CELL_W + 10;
const CB_H = CB_TOP + 5 * CB_CELL_H + 14;

interface ChordBoxProps {
  chord: ChordDef;
}

function ChordBox({ chord }: ChordBoxProps) {
  const { fretStart, strings, barre, name, style } = chord;
  const showOpen = fretStart === 1;

  const styleColor: Record<ChordStyle, string> = {
    open: '#C4A060',
    soul: '#C07838',
    flamenco: '#C06040',
  };
  const color = styleColor[style];

  return (
    <svg
      width={CB_W}
      height={CB_H}
      viewBox={`0 0 ${CB_W} ${CB_H}`}
      aria-label={`${name} chord diagram`}
    >
      {/* Neck background */}
      <rect
        x={CB_LEFT}
        y={CB_TOP - 6}
        width={CB_FRETS * CB_CELL_W}
        height={5 * CB_CELL_H + 12}
        rx={3}
        fill="#221208"
        opacity={0.9}
      />

      {/* Fret position label for non-open chords */}
      {!showOpen && (
        <text
          x={CB_LEFT - 4}
          y={CB_TOP - 2}
          textAnchor="end"
          fontSize={8}
          fill="#A08060"
          fontFamily="var(--font-serif)"
        >
          {fretStart}fr
        </text>
      )}

      {/* Fret bars (vertical) — fret 0 = nut */}
      {Array.from({ length: CB_FRETS + 1 }, (_, f) => {
        const x = CB_LEFT + f * CB_CELL_W;
        const isNut = f === 0;
        return (
          <line
            key={f}
            x1={x}
            y1={CB_TOP - 5}
            x2={x}
            y2={CB_TOP + 5 * CB_CELL_H + 5}
            stroke={isNut && showOpen ? '#C8A878' : '#6B4820'}
            strokeWidth={isNut && showOpen ? 4 : 1.2}
          />
        );
      })}

      {/* String lines (horizontal) + labels — E top, e bottom */}
      {STRING_LABELS.map((label, s) => {
        const y = CB_TOP + s * CB_CELL_H;
        return (
          <g key={s}>
            <line
              x1={CB_LEFT}
              y1={y}
              x2={CB_LEFT + CB_FRETS * CB_CELL_W}
              y2={y}
              stroke="#A09070"
              strokeWidth={STRING_WIDTHS[s]}
            />
            {/* String label to the left of the nut */}
            <text x={4} y={y + 4} fontSize={9} fill="#908060" fontFamily="var(--font-serif)">
              {label}
            </text>
          </g>
        );
      })}

      {/* Barre — vertical bar at the barre fret spanning all strings */}
      {barre !== undefined && (
        <rect
          x={CB_LEFT + (barre - fretStart) * CB_CELL_W + CB_CELL_W * 0.5 - CB_DOT_R}
          y={CB_TOP - CB_DOT_R}
          width={CB_DOT_R * 2}
          height={5 * CB_CELL_H + CB_DOT_R * 2}
          rx={CB_DOT_R}
          fill={color}
          opacity={0.72}
        />
      )}

      {/* X / O markers + finger dots */}
      {strings.map((fret, s) => {
        const cy = CB_TOP + s * CB_CELL_H;
        if (fret === -1) {
          return (
            <text
              key={s}
              x={CB_LEFT - 10}
              y={cy + 4}
              textAnchor="middle"
              fontSize={10}
              fill="#C06040"
              fontWeight="bold"
            >
              ×
            </text>
          );
        }
        if (fret === 0 && showOpen) {
          return (
            <circle
              key={s}
              cx={CB_LEFT - 10}
              cy={cy}
              r={4}
              fill="none"
              stroke="#A08060"
              strokeWidth={1.2}
            />
          );
        }
        if (fret > 0) {
          const relFret = fret - fretStart + 1; // 1-based column
          const cx = CB_LEFT + (relFret - 0.5) * CB_CELL_W;
          const isBarreString = barre !== undefined && barre === fret;
          return (
            <circle
              key={s}
              cx={cx}
              cy={cy}
              r={CB_DOT_R}
              fill={color}
              opacity={isBarreString ? 0 : 1}
            />
          );
        }
        return null;
      })}
    </svg>
  );
}

/* ─── Filter rail ────────────────────────────────────────── */

type Filter = 'all' | ChordStyle;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'soul', label: 'Soul / 7ths' },
  { id: 'flamenco', label: 'Flamenco' },
];

const STYLE_LABELS: Record<ChordStyle, string> = {
  open: 'Open',
  soul: 'Soul',
  flamenco: 'Flamenco',
};
const STYLE_COLORS: Record<ChordStyle, string> = {
  open: '#C4A060',
  soul: '#C07838',
  flamenco: '#C06040',
};

/* ─── Andalusian cadence card ────────────────────────────── */
function AndalusianCard() {
  return (
    <div
      className="col-span-full rounded-xl px-5 py-4"
      style={{ background: '#C0604015', border: '1px solid #C0604030' }}
    >
      <p
        className="mb-1 text-[11px] uppercase tracking-[0.12em]"
        style={{ color: '#C06040', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
      >
        Andalusian Cadence
      </p>
      <p
        className="text-[14px] font-semibold"
        style={{ color: 'var(--foreground)', letterSpacing: '0.06em' }}
      >
        Am → G → F → E
      </p>
      <p
        className="mt-1 text-[11px]"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
      >
        The heart of flamenco — descend this cadence, feel the tension resolve on E.
      </p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function GuitarChords() {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = filter === 'all' ? CHORDS : CHORDS.filter((c) => c.style === filter);

  return (
    <div className="space-y-5">
      {/* Filter rail */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="cursor-pointer bg-transparent text-[12px] uppercase tracking-[0.08em] transition-all"
              style={{
                fontFamily: 'var(--font-serif)',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: active ? 700 : 400,
                borderBottom: active ? '1px solid #C4A060' : '1px solid transparent',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Chord grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
        {visible.map((chord, i) => (
          <div
            key={`${chord.style}-${chord.name}-${i}`}
            className="flex flex-col items-center gap-2 rounded-xl py-3 px-2"
            style={{ background: '#C4A06008', border: '1px solid #C4A06018' }}
          >
            <ChordBox chord={chord} />
            <div className="flex flex-col items-center gap-0.5">
              <span
                className="text-[13px] font-semibold"
                style={{ color: 'var(--foreground)', letterSpacing: '0.04em' }}
              >
                {chord.name}
              </span>
              {chord.label && (
                <span
                  className="text-[10px]"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                >
                  {chord.label}
                </span>
              )}
              <span
                className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]"
                style={{
                  background: `${STYLE_COLORS[chord.style]}18`,
                  color: STYLE_COLORS[chord.style],
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                }}
              >
                {STYLE_LABELS[chord.style]}
              </span>
            </div>
          </div>
        ))}

        {/* Andalusian card only in flamenco/all filter */}
        {(filter === 'all' || filter === 'flamenco') && <AndalusianCard />}
      </div>
    </div>
  );
}
