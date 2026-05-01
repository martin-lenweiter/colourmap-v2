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

const BOX_CELL_W = 18;
const BOX_CELL_H = 16;
const BOX_STRINGS = 6;
const BOX_FRETS = 5;
const BOX_LEFT = 14; // x where string 0 starts
const BOX_TOP = 22; // y where nut/fret-1 starts
const DOT_R = 6;

interface ChordBoxProps {
  chord: ChordDef;
}

function ChordBox({ chord }: ChordBoxProps) {
  const { fretStart, strings, barre, name, style } = chord;
  const showOpen = fretStart === 1;
  const totalW = BOX_LEFT + (BOX_STRINGS - 1) * BOX_CELL_W + BOX_LEFT;
  const totalH = BOX_TOP + BOX_FRETS * BOX_CELL_H + 8;

  const styleColor: Record<ChordStyle, string> = {
    open: '#C4A060',
    soul: '#7090B8',
    flamenco: '#C06040',
  };
  const color = styleColor[style];

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      aria-label={`${name} chord diagram`}
    >
      {/* Fret position marker if not open */}
      {!showOpen && (
        <text
          x={2}
          y={BOX_TOP + BOX_CELL_H * 0.6}
          fontSize={9}
          fill="#A08060"
          fontFamily="var(--font-serif)"
        >
          {fretStart}fr
        </text>
      )}

      {/* Nut (thick bar) or top line */}
      <line
        x1={BOX_LEFT}
        y1={BOX_TOP}
        x2={BOX_LEFT + (BOX_STRINGS - 1) * BOX_CELL_W}
        y2={BOX_TOP}
        stroke={showOpen ? '#C8A878' : '#5A3C20'}
        strokeWidth={showOpen ? 4 : 1.5}
      />

      {/* Fret lines */}
      {Array.from({ length: BOX_FRETS }, (_, f) => (
        <line
          key={f}
          x1={BOX_LEFT}
          y1={BOX_TOP + (f + 1) * BOX_CELL_H}
          x2={BOX_LEFT + (BOX_STRINGS - 1) * BOX_CELL_W}
          y2={BOX_TOP + (f + 1) * BOX_CELL_H}
          stroke="#5A3C20"
          strokeWidth={1}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: BOX_STRINGS }, (_, s) => (
        <line
          key={s}
          x1={BOX_LEFT + s * BOX_CELL_W}
          y1={BOX_TOP}
          x2={BOX_LEFT + s * BOX_CELL_W}
          y2={BOX_TOP + BOX_FRETS * BOX_CELL_H}
          stroke="#5A3C20"
          strokeWidth={1}
        />
      ))}

      {/* Barre bar */}
      {barre !== undefined && (
        <rect
          x={BOX_LEFT + DOT_R * 0.5}
          y={BOX_TOP + (barre - fretStart) * BOX_CELL_H + BOX_CELL_H / 2 - DOT_R}
          width={(BOX_STRINGS - 1) * BOX_CELL_W - DOT_R}
          height={DOT_R * 2}
          rx={DOT_R}
          fill={color}
          opacity={0.7}
        />
      )}

      {/* X / O markers + finger dots */}
      {strings.map((fret, s) => {
        const cx = BOX_LEFT + s * BOX_CELL_W;
        if (fret === -1) {
          // Muted: X above nut
          return (
            <text
              key={s}
              x={cx}
              y={BOX_TOP - 6}
              textAnchor="middle"
              fontSize={9}
              fill="#C06040"
              fontWeight="bold"
            >
              ×
            </text>
          );
        }
        if (fret === 0 && showOpen) {
          // Open: O above nut
          return (
            <circle
              key={s}
              cx={cx}
              cy={BOX_TOP - 7}
              r={4}
              fill="none"
              stroke="#A08060"
              strokeWidth={1.2}
            />
          );
        }
        if (fret > 0) {
          const relFret = fret - fretStart + 1; // row in box (1-based)
          const cy = BOX_TOP + (relFret - 0.5) * BOX_CELL_H;
          const isBarreString = barre === fret;
          return (
            <circle
              key={s}
              cx={cx}
              cy={cy}
              r={DOT_R}
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
  soul: '#7090B8',
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
