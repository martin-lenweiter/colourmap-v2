'use client';

import { useState } from 'react';

/* ─── Music theory core ──────────────────────────────────── */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Open string semitones: E=4, A=9, D=2, G=7, B=11, e=4
const OPEN_NOTES = [4, 9, 2, 7, 11, 4];
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

type ScaleMode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'phrygian-dominant';

interface ScaleDef {
  label: string;
  intervals: number[];
  // quality of each diatonic degree: 'M'=major, 'm'=minor, 'd'=dim, 'aug'=augmented
  qualities: Array<'M' | 'm' | 'd' | 'aug'>;
  description: string;
}

const SCALES: Record<ScaleMode, ScaleDef> = {
  major: {
    label: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    qualities: ['M', 'm', 'm', 'M', 'M', 'm', 'd'],
    description: 'Bright, resolved. I-IV-V are all major. vi is the relative minor.',
  },
  minor: {
    label: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    qualities: ['m', 'd', 'M', 'm', 'm', 'M', 'M'],
    description: 'Dark, introspective. i-iv-v minor. VII-VI-III provide major contrast.',
  },
  dorian: {
    label: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    qualities: ['m', 'm', 'M', 'M', 'm', 'd', 'M'],
    description: 'Minor but with a raised 6th (major IV). Santana, Herbie Hancock. Warm minor.',
  },
  phrygian: {
    label: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    qualities: ['m', 'M', 'M', 'm', 'd', 'M', 'm'],
    description: 'Dark Spanish. bII is major — creates Spanish cadence. Used in flamenco.',
  },
  'phrygian-dominant': {
    label: 'Phrygian Dominant',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    qualities: ['M', 'M', 'd', 'm', 'd', 'M', 'm'],
    description: 'Most Spanish sound. Major I with bII. The E chord in flamenco cadences.',
  },
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function romanForDegree(deg: number, quality: 'M' | 'm' | 'd' | 'aug'): string {
  const r = ROMAN_NUMERALS[deg];
  const lower = quality === 'm' || quality === 'd';
  const suffix = quality === 'd' ? '°' : quality === 'aug' ? '+' : '';
  return (lower ? r.toLowerCase() : r) + suffix;
}

// Diatonic chord notes: root + quality
function chordNotes(root: number, quality: 'M' | 'm' | 'd' | 'aug'): number[] {
  const thirdInterval = quality === 'M' || quality === 'aug' ? 4 : 3;
  const fifthInterval = quality === 'd' ? 6 : quality === 'aug' ? 8 : 7;
  return [root % 12, (root + thirdInterval) % 12, (root + fifthInterval) % 12];
}

// Chord modifications for each quality
interface ChordMod {
  name: string;
  addIntervals: number[]; // extra semitones above root
  description: string;
}

const MODIFICATIONS: Record<'M' | 'm' | 'd', ChordMod[]> = {
  M: [
    { name: 'maj7', addIntervals: [11], description: 'Add major 7th — dreamy, lush' },
    { name: 'add9', addIntervals: [14], description: 'Add 9th — bright, open' },
    { name: 'sus2', addIntervals: [], description: 'Replace 3rd with 2nd — floating, ambiguous' },
    {
      name: 'sus4',
      addIntervals: [],
      description: 'Replace 3rd with 4th — anticipating resolution',
    },
    { name: '6', addIntervals: [9], description: 'Add 6th — smooth, classic' },
  ],
  m: [
    { name: 'm7', addIntervals: [10], description: 'Add minor 7th — smooth, soulful' },
    { name: 'm9', addIntervals: [10, 14], description: 'Add 7th + 9th — floating, neo-soul' },
    { name: 'm6', addIntervals: [9], description: 'Add 6th — bittersweet, unexpected brightness' },
    { name: 'madd9', addIntervals: [14], description: 'Add 9th without 7th — open, lyrical' },
    { name: 'm11', addIntervals: [10, 14, 17], description: 'Add 7th+9th+11th — Dorian shimmer' },
  ],
  d: [
    { name: 'dim7', addIntervals: [9], description: 'Add diminished 7th — tense, symmetrical' },
    {
      name: 'm7b5',
      addIntervals: [10],
      description: 'Half-diminished — used in ii-V-i (jazz minor)',
    },
  ],
};

// Substitution ideas per degree
interface SubIdea {
  sub: string;
  reason: string;
}

function getSubstitutions(degree: number, quality: 'M' | 'm' | 'd' | 'aug'): SubIdea[] {
  const subs: SubIdea[] = [];
  if (quality === 'M' && degree === 4) {
    // V chord
    subs.push({
      sub: 'bII (tritone sub)',
      reason: 'Tritone substitution — same function as V7 but descending bass',
    });
    subs.push({ sub: 'V7', reason: 'Add b7 for stronger resolution pull' });
    subs.push({ sub: 'V9', reason: 'Add 9th for soul/jazz colour' });
  }
  if (quality === 'm' && degree === 5) {
    // vi in major
    subs.push({
      sub: 'I (tonic sub)',
      reason: 'vi shares two notes with I — usable as tonic substitute',
    });
  }
  if (quality === 'M' && degree === 0) {
    // I chord
    subs.push({ sub: 'Imaj7', reason: 'Add major 7th for jazz/soul colour' });
    subs.push({ sub: 'I6/9', reason: 'Add 6+9 for neo-soul shimmer' });
  }
  if (quality === 'm' && degree === 1) {
    // ii minor
    subs.push({ sub: 'ii7', reason: 'Add 7th — standard jazz ii-V-I voicing' });
    subs.push({
      sub: 'IV (subdominant sub)',
      reason: 'IV shares two notes with ii — smoother in pop',
    });
  }
  return subs;
}

/* ─── Fretboard constants ────────────────────────────────── */

const FB_NUT_X = 40;
const FB_FRET_W = 46;
const FB_STRING_TOP = 22;
const FB_STRING_SPACING = 24;
const FB_NUM_FRETS = 12;
const FB_SVG_W = FB_NUT_X + FB_NUM_FRETS * FB_FRET_W + 6;
const FB_SVG_H = FB_STRING_TOP + 5 * FB_STRING_SPACING + 22;

const FB_FRET_MARKERS = [3, 5, 7, 9];
const FB_DOUBLE_MARKERS = [12];

function fbFretCenterX(fret: number): number {
  if (fret === 0) return FB_NUT_X / 2;
  return FB_NUT_X + (fret - 0.5) * FB_FRET_W;
}

function fbStringY(s: number): number {
  return FB_STRING_TOP + s * FB_STRING_SPACING;
}

// Role of a note in a chord: 'root' | '3rd' | '5th' | 'other'
function noteRole(note: number, chordNotesList: number[]): 'root' | '3rd' | '5th' | null {
  if (note === chordNotesList[0]) return 'root';
  if (note === chordNotesList[1]) return '3rd';
  if (note === chordNotesList[2]) return '5th';
  return null;
}

const ROLE_COLORS = {
  root: '#C4A060',
  '3rd': '#C07838',
  '5th': '#7A9080',
};

/* ─── Fretboard showing chord tones ─────────────────────── */

function ChordFretboard({
  chordNotesList,
  chordName,
}: {
  chordNotesList: number[];
  chordName: string;
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        width="100%"
        viewBox={`0 0 ${FB_SVG_W} ${FB_SVG_H}`}
        style={{ display: 'block', minWidth: 320 }}
        aria-label={`${chordName} chord positions on fretboard`}
      >
        {/* Neck */}
        <rect
          x={FB_NUT_X}
          y={FB_STRING_TOP - 12}
          width={FB_NUM_FRETS * FB_FRET_W}
          height={5 * FB_STRING_SPACING + 24}
          rx={3}
          fill="#2A1A0E"
        />
        {/* Position dots */}
        {FB_FRET_MARKERS.map((fret) => (
          <circle
            key={fret}
            cx={fbFretCenterX(fret)}
            cy={FB_STRING_TOP + 2.5 * FB_STRING_SPACING}
            r={4}
            fill="#4A3020"
          />
        ))}
        {FB_DOUBLE_MARKERS.map((fret) => (
          <g key={fret}>
            <circle
              cx={fbFretCenterX(fret)}
              cy={FB_STRING_TOP + 1.5 * FB_STRING_SPACING}
              r={4}
              fill="#4A3020"
            />
            <circle
              cx={fbFretCenterX(fret)}
              cy={FB_STRING_TOP + 3.5 * FB_STRING_SPACING}
              r={4}
              fill="#4A3020"
            />
          </g>
        ))}
        {/* Fret lines */}
        {Array.from({ length: FB_NUM_FRETS + 1 }, (_, f) => (
          <line
            key={f}
            x1={FB_NUT_X + f * FB_FRET_W}
            y1={FB_STRING_TOP - 8}
            x2={FB_NUT_X + f * FB_FRET_W}
            y2={FB_STRING_TOP + 5 * FB_STRING_SPACING + 8}
            stroke={f === 0 ? '#C8A878' : '#5A3C20'}
            strokeWidth={f === 0 ? 3.5 : 1.2}
          />
        ))}
        {/* Fret numbers */}
        {[3, 5, 7, 9, 12].map((fret) => (
          <text
            key={fret}
            x={fbFretCenterX(fret)}
            y={FB_SVG_H - 4}
            textAnchor="middle"
            fontSize={8}
            fill="#A08060"
            fontFamily="var(--font-serif)"
          >
            {fret}
          </text>
        ))}
        {/* Strings + labels */}
        {OPEN_NOTES.map((_, s) => {
          const y = fbStringY(s);
          const sw = s <= 1 ? 2.2 : s <= 3 ? 1.6 : 1.0;
          return (
            <g key={s}>
              <line
                x1={FB_NUT_X}
                y1={y}
                x2={FB_NUT_X + FB_NUM_FRETS * FB_FRET_W}
                y2={y}
                stroke="#A0907A"
                strokeWidth={sw}
              />
              <text
                x={FB_NUT_X - 6}
                y={y + 3.5}
                textAnchor="end"
                fontSize={9}
                fill="#A08060"
                fontFamily="var(--font-serif)"
              >
                {STRING_LABELS[s]}
              </text>
            </g>
          );
        })}
        {/* Chord tone dots */}
        {OPEN_NOTES.map((openNote, s) =>
          Array.from({ length: FB_NUM_FRETS + 1 }, (_, fret) => {
            const note = (openNote + fret) % 12;
            const role = noteRole(note, chordNotesList);
            if (!role) return null;
            const cx = fbFretCenterX(fret);
            const cy = fbStringY(s);
            const dotColor = ROLE_COLORS[role];
            const label = role === 'root' ? NOTE_NAMES[note] : role;
            const fontSize = label.includes('#') ? 6.5 : 8;
            return (
              <g key={`${s}-${fret}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill={dotColor}
                  stroke={role === 'root' ? '#E8C880' : 'transparent'}
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontWeight="700"
                  fill={role === 'root' ? '#1A0E04' : '#F0E0C0'}
                  fontFamily="var(--font-serif)"
                >
                  {label}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function HarmonyMap() {
  const [root, setRoot] = useState(9); // A
  const [mode, setMode] = useState<ScaleMode>('minor');
  const [selectedDegree, setSelectedDegree] = useState<number | null>(0);

  const scaleDef = SCALES[mode];
  const intervals = scaleDef.intervals;

  // Build 7 diatonic chords
  const diatonicChords = intervals.map((interval, deg) => {
    const chordRoot = (root + interval) % 12;
    const quality = scaleDef.qualities[deg];
    return {
      root: chordRoot,
      name: NOTE_NAMES[chordRoot],
      quality,
      roman: romanForDegree(deg, quality),
      notes: chordNotes(chordRoot, quality),
      degree: deg,
    };
  });

  const selected = selectedDegree !== null ? diatonicChords[selectedDegree] : null;
  const mods = selected
    ? (MODIFICATIONS[selected.quality === 'aug' ? 'M' : selected.quality] ?? [])
    : [];
  const subs = selected ? getSubstitutions(selected.degree, selected.quality) : [];

  return (
    <div className="space-y-6">
      {/* Scale formula banner */}
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: '#C4A06008', border: '1px solid #C4A06018' }}
      >
        <p
          className="text-[12px] font-semibold mb-0.5"
          style={{ color: 'var(--foreground)', letterSpacing: '0.04em' }}
        >
          {NOTE_NAMES[root]} {scaleDef.label}
        </p>
        <p
          className="text-[11px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          {scaleDef.description}
        </p>
      </div>

      {/* Root picker */}
      <div className="flex flex-wrap gap-1.5">
        {NOTE_NAMES.map((name, i) => {
          const active = i === root;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setRoot(i)}
              className="cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-all"
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

      {/* Mode picker */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {(Object.entries(SCALES) as [ScaleMode, ScaleDef][]).map(([id, def]) => {
          const active = id === mode;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className="cursor-pointer bg-transparent text-[12px] uppercase tracking-[0.08em] transition-all"
              style={{
                fontFamily: 'var(--font-serif)',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: active ? 700 : 400,
                borderBottom: active ? '1px solid #C4A060' : '1px solid transparent',
              }}
            >
              {def.label}
            </button>
          );
        })}
      </div>

      {/* Diatonic chord palette */}
      <div>
        <p
          className="mb-3 text-[10px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Diatonic chords — tap to explore
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {diatonicChords.map((chord) => {
            const isActive = selectedDegree === chord.degree;
            const qColor =
              chord.quality === 'M' ? '#C4A060' : chord.quality === 'd' ? '#9B6BA0' : '#6890B0';
            return (
              <button
                key={chord.degree}
                type="button"
                onClick={() =>
                  setSelectedDegree((prev) => (prev === chord.degree ? null : chord.degree))
                }
                className="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all"
                style={{
                  background: isActive ? `${qColor}18` : `${qColor}08`,
                  border: isActive ? `1px solid ${qColor}50` : `1px solid ${qColor}20`,
                }}
              >
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: qColor, fontFamily: 'var(--font-serif)' }}
                >
                  {chord.roman}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: isActive ? qColor : 'var(--foreground)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {chord.name}
                </span>
                <span
                  className="text-[8px] uppercase"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-serif)',
                    opacity: 0.7,
                  }}
                >
                  {chord.quality === 'M' ? 'maj' : chord.quality === 'd' ? 'dim' : 'min'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected chord detail */}
      {selected && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: '#C4A06010', border: '1px solid #C4A06025' }}
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="text-[18px] font-bold"
                style={{ color: 'var(--foreground)', letterSpacing: '0.04em' }}
              >
                {selected.name}
                {selected.quality === 'm' ? 'm' : selected.quality === 'd' ? '°' : ''}
              </span>
              <span
                className="text-[12px] font-semibold"
                style={{ color: '#C4A060', fontFamily: 'var(--font-serif)' }}
              >
                {selected.roman} in {NOTE_NAMES[root]} {scaleDef.label}
              </span>
            </div>
            <p
              className="mt-1 text-[11px]"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
            >
              Notes:{' '}
              {selected.notes.map((n, i) => {
                const role = i === 0 ? 'root' : i === 1 ? '3rd' : '5th';
                return (
                  <span key={i} style={{ color: ROLE_COLORS[role], fontWeight: 600 }}>
                    {NOTE_NAMES[n]}
                    {i < 2 ? ' · ' : ''}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Fretboard */}
          <div>
            <p
              className="mb-2 text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
            >
              All positions on the neck
            </p>
            <ChordFretboard chordNotesList={selected.notes} chordName={selected.name} />
            <div
              className="mt-2 flex items-center gap-4 text-[10px]"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: ROLE_COLORS.root }}
                />
                Root
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: ROLE_COLORS['3rd'] }}
                />
                3rd
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: ROLE_COLORS['5th'] }}
                />
                5th
              </span>
            </div>
          </div>

          {/* Works well with */}
          <div>
            <p
              className="mb-2 text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
            >
              Works well with
            </p>
            <div className="flex flex-wrap gap-1.5">
              {diatonicChords
                .filter((c) => c.degree !== selected.degree)
                .map((c) => {
                  const qColor =
                    c.quality === 'M' ? '#C4A060' : c.quality === 'd' ? '#9B6BA0' : '#6890B0';
                  return (
                    <button
                      key={c.degree}
                      type="button"
                      onClick={() => setSelectedDegree(c.degree)}
                      className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all hover:opacity-80"
                      style={{
                        background: `${qColor}15`,
                        color: qColor,
                        border: `1px solid ${qColor}30`,
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      {c.roman} · {c.name}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Modifications */}
          {mods.length > 0 && (
            <div>
              <p
                className="mb-2 text-[10px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                Modifications — add colour
              </p>
              <div className="space-y-1.5">
                {mods.map((mod) => (
                  <div
                    key={mod.name}
                    className="flex items-start gap-3 rounded-lg px-3 py-2"
                    style={{ background: '#C4A06008', border: '1px solid #C4A06015' }}
                  >
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
                      style={{
                        background: '#C4A06020',
                        color: '#C4A060',
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      {selected.name}
                      {mod.name}
                    </span>
                    <p
                      className="text-[11px]"
                      style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                    >
                      {mod.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Substitutions */}
          {subs.length > 0 && (
            <div>
              <p
                className="mb-2 text-[10px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                Substitutions
              </p>
              <div className="space-y-1.5">
                {subs.map((sub) => (
                  <div
                    key={sub.sub}
                    className="flex items-start gap-3 rounded-lg px-3 py-2"
                    style={{ background: '#9B6BA008', border: '1px solid #9B6BA018' }}
                  >
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
                      style={{
                        background: '#9B6BA020',
                        color: '#9B6BA0',
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      {sub.sub}
                    </span>
                    <p
                      className="text-[11px]"
                      style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                    >
                      {sub.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <p
          className="text-center italic py-4 text-[13px]"
          style={{
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-serif)',
            opacity: 0.65,
          }}
        >
          tap any chord above to see its positions on the neck, modifications, and substitutions
        </p>
      )}
    </div>
  );
}
