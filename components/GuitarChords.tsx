'use client';

import { useState } from 'react';

/* ─── Data model ─────────────────────────────────────────── */
// strings[0]=low E, strings[5]=high e
// -1=muted, 0=open, N=absolute fret number
// Open tuning semitones: E=4, A=9, D=2, G=7, B=11, e=4

type ChordStyle = 'open' | 'soul' | 'spanish';

interface ChordVoicing {
  fretStart: number;
  strings: [number, number, number, number, number, number];
  barre?: number;
  label: string;
}

interface ChordInfo {
  name: string;
  style: ChordStyle;
  feel: string;
  theory: string;
  voicings: ChordVoicing[];
}

interface ProgressionDef {
  name: string;
  style: ChordStyle;
  chords: string[];
  description: string;
  feel: string;
}

/* ─── Chord library ──────────────────────────────────────── */

const CHORDS: ChordInfo[] = [
  // ═══ OPEN ═════════════════════════════════════════════════
  {
    name: 'Am',
    style: 'open',
    feel: 'Melancholy, introspective',
    theory: 'A minor tonic — root of countless folk, rock, and flamenco progressions.',
    voicings: [
      { fretStart: 1, strings: [-1, 0, 2, 2, 1, 0], label: 'open' },
      { fretStart: 5, strings: [5, 7, 7, 5, 5, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'E',
    style: 'open',
    feel: 'Full, bright, resolved',
    theory: 'E major — the "home" chord of many flamenco pieces. Powerful dominant resolution.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 2, 1, 0, 0], label: 'open' },
      { fretStart: 7, strings: [7, 9, 9, 8, 7, 7], barre: 7, label: 'barre 7' },
    ],
  },
  {
    name: 'Em',
    style: 'open',
    feel: 'Dark, resonant, open',
    theory: 'E minor — the deepest open chord on guitar. Rings all 6 strings.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 2, 0, 0, 0], label: 'open' },
      { fretStart: 7, strings: [7, 9, 9, 7, 7, 7], barre: 7, label: 'barre 7' },
    ],
  },
  {
    name: 'G',
    style: 'open',
    feel: 'Bright, full-range, joyful',
    theory: 'G major — uses all 6 strings. Spans the full register of the guitar.',
    voicings: [
      { fretStart: 1, strings: [3, 2, 0, 0, 0, 3], label: 'open' },
      { fretStart: 1, strings: [3, 2, 0, 0, 3, 3], label: 'alt open' },
    ],
  },
  {
    name: 'C',
    style: 'open',
    feel: 'Warm, stable, versatile',
    theory: 'C major — the most common key center. Pairs with Am, G, F, Dm.',
    voicings: [
      { fretStart: 1, strings: [-1, 3, 2, 0, 1, 0], label: 'open' },
      { fretStart: 3, strings: [-1, 3, 5, 5, 5, 3], barre: 3, label: 'barre 3' },
    ],
  },
  {
    name: 'D',
    style: 'open',
    feel: 'Bright, cutting, assertive',
    theory: 'D major — punchy V chord in G. The "lift" in many progressions.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 0, 2, 3, 2], label: 'open' },
      { fretStart: 5, strings: [5, 5, 7, 7, 7, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'A',
    style: 'open',
    feel: 'Bright, stable, mid-register',
    theory: 'A major — the I chord in A, the V in D, and the IV in E.',
    voicings: [
      { fretStart: 1, strings: [-1, 0, 2, 2, 2, 0], label: 'open' },
      { fretStart: 1, strings: [-1, 0, 2, 2, 2, 2], label: 'alt open' },
    ],
  },
  {
    name: 'Dm',
    style: 'open',
    feel: 'Sad, minor, introspective',
    theory: 'D minor — the iv in Am, the ii in C. Weighs heavy in minor progressions.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 0, 2, 3, 1], label: 'open' },
      { fretStart: 5, strings: [-1, 5, 7, 7, 6, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'E7',
    style: 'open',
    feel: 'Tense, resolving, dominant',
    theory: 'E dominant 7th — adds the b7 (D) to E. The flamenco and blues V7 chord.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 0, 1, 0, 0], label: 'open' },
      { fretStart: 1, strings: [0, 2, 0, 1, 3, 0], label: 'E9 shape' },
    ],
  },
  {
    name: 'A7',
    style: 'open',
    feel: 'Blues grit, dominant pull',
    theory: 'A dominant 7th — the blues workhorse. V7 in D, I7 in blues in A.',
    voicings: [
      { fretStart: 1, strings: [-1, 0, 2, 0, 2, 0], label: 'open' },
      { fretStart: 1, strings: [-1, 0, 2, 2, 2, 3], label: 'alt' },
    ],
  },
  {
    name: 'B7',
    style: 'open',
    feel: 'Spanish tension, flamenco pull',
    theory: 'B dominant 7th — the V7 resolving to Em. Dramatic tension in Spanish music.',
    voicings: [
      { fretStart: 1, strings: [-1, 2, 1, 2, 0, 2], label: 'open' },
      { fretStart: 1, strings: [-1, 2, 4, 2, 4, 2], label: 'alt' },
    ],
  },

  // ═══ SOUL / JAZZ ══════════════════════════════════════════
  {
    name: 'Am7',
    style: 'soul',
    feel: 'Silky, introspective, floating',
    theory: 'A minor 7th — the i7 in jazz minor. Melancholic but smooth. Ubiquitous in soul.',
    voicings: [
      { fretStart: 1, strings: [-1, 0, 2, 0, 1, 0], label: 'open' },
      { fretStart: 5, strings: [5, 7, 7, 5, 8, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'Dm7',
    style: 'soul',
    feel: 'Dark, velvety, yearning',
    theory: 'D minor 7th — the ii7 in C. The opening chord of the jazz ii-V-I.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 0, 2, 1, 1], label: 'open' },
      { fretStart: 5, strings: [-1, 5, 7, 5, 6, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'G7',
    style: 'soul',
    feel: 'Driving, expectant, propulsive',
    theory: 'G dominant 7th — the V7 in C. Creates the strongest tension-resolution pull in music.',
    voicings: [
      { fretStart: 1, strings: [3, 2, 0, 0, 0, 1], label: 'open' },
      { fretStart: 3, strings: [3, 2, 0, 2, 0, 1], label: 'G13' },
    ],
  },
  {
    name: 'Cmaj7',
    style: 'soul',
    feel: 'Warm, dreamy, resolved',
    theory: 'C major 7th — the Imaj7 tonic. Sounds like a summer afternoon. Smooth resolution.',
    voicings: [
      { fretStart: 1, strings: [-1, 3, 2, 0, 0, 0], label: 'open' },
      { fretStart: 1, strings: [-1, 3, 2, 4, 0, 0], label: 'add 9' },
    ],
  },
  {
    name: 'Em7',
    style: 'soul',
    feel: 'Gentle, wistful, suspended',
    theory: 'E minor 7th — the iii7 in C. Lighter than Em, hangs between tonic and dominant.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 2, 0, 3, 0], label: 'open' },
      { fretStart: 1, strings: [0, 2, 2, 0, 0, 0], label: 'simple' },
    ],
  },
  {
    name: 'Fmaj7',
    style: 'soul',
    feel: 'Lush, sustained, ethereal',
    theory: 'F major 7th — the IVmaj7 in C. No barre needed. The most beautiful chord in soul.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 3, 2, 1, 0], label: 'open' },
      { fretStart: 1, strings: [1, 3, 3, 2, 1, 0], barre: 1, label: 'full barre 1' },
    ],
  },
  {
    name: 'E9',
    style: 'soul',
    feel: 'Funky, bright, rhythmic',
    theory: 'E dominant 9th — adds F# (9th) to E7. The funk and soul rhythm chord.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 0, 1, 0, 2], label: 'open' },
      { fretStart: 7, strings: [-1, 7, 6, 7, 7, -1], label: 'jazz close' },
    ],
  },
  {
    name: 'A9',
    style: 'soul',
    feel: 'Warm, funky, soulful',
    theory: 'A add9 — adds B (9th) to A major. The Stevie Wonder rhythm grip.',
    voicings: [
      { fretStart: 1, strings: [-1, 0, 2, 2, 0, 0], label: 'open' },
      { fretStart: 1, strings: [-1, 0, 2, 4, 2, 0], label: 'alt' },
    ],
  },
  {
    name: 'Dsus2',
    style: 'soul',
    feel: 'Open, spacious, unresolved',
    theory: 'D suspended 2nd — no 3rd, adds E (2nd). Neither major nor minor, just open sky.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 0, 2, 3, 0], label: 'open' },
      { fretStart: 1, strings: [-1, -1, 0, 2, 0, 0], label: 'minimal' },
    ],
  },
  {
    name: 'E7#9',
    style: 'soul',
    feel: 'Tense, electric, provocative',
    theory: 'Hendrix chord — E7 with #9 (G natural). The "Purple Haze" chord. Bluesy and fierce.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 2, 1, 3, 3], label: 'open grip' },
      { fretStart: 7, strings: [-1, 7, 6, 7, 8, -1], label: 'barre 7' },
    ],
  },
  {
    name: 'Cadd9',
    style: 'soul',
    feel: 'Lush, modern, warm',
    theory: 'C add9 — adds D (9th) to C major. Open strings ring freely. Neo-soul staple.',
    voicings: [{ fretStart: 1, strings: [-1, 3, 2, 0, 3, 0], label: 'open' }],
  },
  {
    name: 'Bm7',
    style: 'soul',
    feel: 'Dark, sophisticated, passing',
    theory:
      'B minor 7th — the iii7 in G, the vii7 in C. Creates smooth motion in descending lines.',
    voicings: [
      { fretStart: 2, strings: [-1, 2, 4, 2, 3, 2], barre: 2, label: 'barre 2' },
      { fretStart: 7, strings: [7, 9, 9, 7, 10, 7], barre: 7, label: 'barre 7' },
    ],
  },
  {
    name: 'D7',
    style: 'soul',
    feel: 'Bluesy, expectant, warm tension',
    theory: 'D dominant 7th — the V7 in G. Blues and soul movement, wants to resolve to G.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 0, 2, 1, 2], label: 'open' },
      { fretStart: 1, strings: [2, 1, 2, 0, -1, -1], label: 'alt low' },
    ],
  },
  {
    name: 'Am9',
    style: 'soul',
    feel: 'Dreamy, floating, neo-soul',
    theory: 'A minor 9th — adds B (9th) over Am7. No 3rd in this voicing — intentionally open.',
    voicings: [{ fretStart: 1, strings: [-1, 0, 2, 0, 0, 0], label: 'open' }],
  },
  {
    name: 'Cm7',
    style: 'soul',
    feel: 'Dark, minor, sophisticated',
    theory: 'C minor 7th — the i7 in Cm. Moves beautifully to F7 in a minor ii-V-I.',
    voicings: [
      { fretStart: 3, strings: [-1, 3, 5, 3, 4, 3], barre: 3, label: 'barre 3' },
      { fretStart: 8, strings: [-1, 8, 10, 8, 9, 8], barre: 8, label: 'barre 8' },
    ],
  },

  // ═══ SPANISH / FLAMENCO ═══════════════════════════════════
  {
    name: 'Am',
    style: 'spanish',
    feel: 'The flamenco home chord',
    theory: 'i in A minor Phrygian. The deep, dark root of cante jondo — the deep song.',
    voicings: [
      { fretStart: 1, strings: [-1, 0, 2, 2, 1, 0], label: 'open' },
      { fretStart: 5, strings: [5, 7, 7, 5, 5, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'E',
    style: 'spanish',
    feel: 'Resolution, brightness, arrival',
    theory:
      'The V chord in A minor Phrygian. The Andalusian cadence resolves here — moment of release.',
    voicings: [{ fretStart: 1, strings: [0, 2, 2, 1, 0, 0], label: 'open' }],
  },
  {
    name: 'E7',
    style: 'spanish',
    feel: 'Dominant pull, Spanish fire',
    theory: 'V7 in Am. Adds b7 (D). Creates fiercer resolution than plain E.',
    voicings: [
      { fretStart: 1, strings: [0, 2, 0, 1, 0, 0], label: 'open' },
      { fretStart: 1, strings: [0, 2, 0, 1, 0, 3], label: 'alt (b9)' },
    ],
  },
  {
    name: 'F',
    style: 'spanish',
    feel: 'Heavy, barre tension, stepping',
    theory:
      'bVI in Phrygian. The step above E in the Andalusian descent. Requires barre at fret 1.',
    voicings: [
      { fretStart: 1, strings: [1, 1, 2, 3, 3, 1], barre: 1, label: 'barre 1' },
      { fretStart: 1, strings: [-1, -1, 3, 2, 1, 1], label: 'partial (no barre)' },
    ],
  },
  {
    name: 'G',
    style: 'spanish',
    feel: 'Stepping, transitional, rising',
    theory: 'bVII in the Andalusian cadence. Bridges F and Am in the descending sequence.',
    voicings: [
      { fretStart: 1, strings: [3, 2, 0, 0, 0, 3], label: 'open' },
      { fretStart: 3, strings: [-1, -1, 5, 4, 3, 3], label: 'upper voicing' },
    ],
  },
  {
    name: 'Dm',
    style: 'spanish',
    feel: 'Melancholy, introspective, stepping',
    theory: 'iv in Am. Appears in Farruca and Rumba patterns. Adds weight and sadness.',
    voicings: [
      { fretStart: 1, strings: [-1, -1, 0, 2, 3, 1], label: 'open' },
      { fretStart: 5, strings: [-1, 5, 7, 7, 6, 5], barre: 5, label: 'barre 5' },
    ],
  },
  {
    name: 'B7',
    style: 'spanish',
    feel: 'Dramatic Spanish pull',
    theory:
      'V7 in Em. The dominant to the relative minor. Creates yearning tension in Romance and Farruca.',
    voicings: [{ fretStart: 1, strings: [-1, 2, 1, 2, 0, 2], label: 'open' }],
  },
  {
    name: 'Gm',
    style: 'spanish',
    feel: 'Dark barre, deep Phrygian weight',
    theory: 'Gm appears in the Phrygian descent (Gm-F-E). Adds minor weight before resolution.',
    voicings: [
      { fretStart: 3, strings: [3, 5, 5, 3, 3, 3], barre: 3, label: 'barre 3' },
      { fretStart: 3, strings: [-1, 5, 5, 3, 3, 3], label: 'no low E' },
    ],
  },
  {
    name: 'Bb',
    style: 'spanish',
    feel: 'Heavy descent, dark warmth',
    theory: 'bII in Phrygian. Signals Spanish music immediately. Dark and forceful barre chord.',
    voicings: [{ fretStart: 1, strings: [-1, 1, 3, 3, 3, 1], barre: 1, label: 'barre 1' }],
  },
  {
    name: 'C',
    style: 'spanish',
    feel: 'Relative major, lightness',
    theory:
      'bIII in Am. The relative major. Provides contrast and momentary brightness in minor pieces.',
    voicings: [{ fretStart: 1, strings: [-1, 3, 2, 0, 1, 0], label: 'open' }],
  },
];

/* ─── Progressions ───────────────────────────────────────── */

const PROGRESSIONS: ProgressionDef[] = [
  // Soul / Jazz
  {
    name: 'ii-V-I',
    style: 'soul',
    chords: ['Dm7', 'G7', 'Cmaj7'],
    description:
      'The backbone of jazz harmony. Dm7 creates tension, G7 intensifies it, Cmaj7 resolves.',
    feel: 'Jazz resolution',
  },
  {
    name: 'Soul Cycle',
    style: 'soul',
    chords: ['Am7', 'Dm7', 'G7', 'Cmaj7'],
    description: 'Full four-bar groove — i7, iv7, V7, Imaj7. The Marvin Gaye / Sam Cooke universe.',
    feel: 'Classic soul groove',
  },
  {
    name: 'I-VI-ii-V',
    style: 'soul',
    chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
    description:
      'The Great American Songbook turnaround. Loops endlessly. Add a bass walk and fly.',
    feel: 'Eternal turnaround',
  },
  {
    name: 'Neo-Soul',
    style: 'soul',
    chords: ['Cmaj7', 'Em7', 'Fmaj7', 'G7'],
    description: 'Warm and modern. I-iii-IV-V with maj7 and 7th colours throughout.',
    feel: 'Modern warmth',
  },
  {
    name: 'Hendrix Funk',
    style: 'soul',
    chords: ['E9', 'A9'],
    description:
      'Dominant I-IV blues shuffle. Two chords, infinite groove. Add wah and 16th strumming.',
    feel: 'Raw funk swagger',
  },
  {
    name: 'Dorian Rise',
    style: 'soul',
    chords: ['Am7', 'Bm7', 'Cmaj7'],
    description: 'Ascending Dorian line — i-ii-III. Bright, rising feel. Carlos Santana territory.',
    feel: 'Dorian ascent',
  },
  {
    name: 'Minor Blues',
    style: 'soul',
    chords: ['Am7', 'Dm7', 'Am7', 'E9'],
    description: 'Minor i-iv-i-V7. Darker than major blues. Slow and soulful, wide bends.',
    feel: 'Deep soul blues',
  },
  {
    name: 'Stevie Circle',
    style: 'soul',
    chords: ['Cmaj7', 'Fmaj7', 'Bm7', 'E9'],
    description:
      'I-IV-vii-III — a smooth soul cycle borrowed from jazz. Sophisticated and graceful.',
    feel: 'Flowing sophistication',
  },

  // Spanish / Flamenco
  {
    name: 'Andalusian Cadence',
    style: 'spanish',
    chords: ['Am', 'G', 'F', 'E'],
    description:
      'The flamenco heartbeat. Descend Am→G→F→E. Resolve hard on E. Then repeat or vary.',
    feel: 'Flamenco soul',
  },
  {
    name: 'Solea Pattern',
    style: 'spanish',
    chords: ['Am', 'G', 'F', 'E', 'Am'],
    description: 'Solea cycle — the Andalusian cadence closing back to Am. 12-beat rhythmic cycle.',
    feel: 'Solea cante jondo',
  },
  {
    name: 'Rumba Flamenca',
    style: 'spanish',
    chords: ['Am', 'Dm', 'E7', 'Am'],
    description:
      'Festive, rhythmic cycle — i-iv-V7-i. The Gipsy Kings template. Rhythmic and joyful.',
    feel: 'Festive rhythm',
  },
  {
    name: 'Spanish Romance',
    style: 'spanish',
    chords: ['Em', 'Am', 'B7', 'Em'],
    description:
      'Classical fingerpicking pattern. i-iv-V7-i in E minor. Calm, lyrical, atmospheric.',
    feel: 'Classical fingerpicking',
  },
  {
    name: 'Phrygian Descent',
    style: 'spanish',
    chords: ['Gm', 'F', 'E'],
    description: 'Dark downward motion. bVII-bVI-V. The weight before resolution. Very Spanish.',
    feel: 'Dark Phrygian drama',
  },
  {
    name: 'Farruca',
    style: 'spanish',
    chords: ['Am', 'Dm', 'Am', 'E', 'Am'],
    description: 'Serious, grave, masculine. i-iv-i-V-i. Slower and more internal than Solea.',
    feel: 'Serious and grave',
  },
  {
    name: 'Bulería Loop',
    style: 'spanish',
    chords: ['Am', 'G', 'F', 'E'],
    description:
      'Same harmony as Andalusian but at blistering speed with percussive staccato attack.',
    feel: 'Fast percussive fire',
  },
];

/* ─── SVG chord box — horizontal strings ─────────────────── */

const CB_CELL_W = 18;
const CB_CELL_H = 16;
const CB_FRETS = 4;
const CB_LEFT = 32;
const CB_TOP = 14;
const CB_DOT_R = 5.5;

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];
const STRING_WIDTHS = [2.2, 1.8, 1.4, 1.2, 1.0, 0.8];

const CB_W = CB_LEFT + CB_FRETS * CB_CELL_W + 10;
const CB_H = CB_TOP + 5 * CB_CELL_H + 14;

const STYLE_COLORS: Record<ChordStyle, string> = {
  open: '#C4A060',
  soul: '#C07838',
  spanish: '#C06040',
};

const STYLE_LABELS: Record<ChordStyle, string> = {
  open: 'Open',
  soul: 'Soul',
  spanish: 'Spanish',
};

function ChordBox({ voicing, color }: { voicing: ChordVoicing; color: string }) {
  const { fretStart, strings, barre } = voicing;
  const showOpen = fretStart === 1;

  return (
    <svg width={CB_W} height={CB_H} viewBox={`0 0 ${CB_W} ${CB_H}`}>
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
            <text x={4} y={y + 4} fontSize={9} fill="#908060" fontFamily="var(--font-serif)">
              {label}
            </text>
          </g>
        );
      })}
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
          const relFret = fret - fretStart + 1;
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

/* ─── Chord card ─────────────────────────────────────────── */

function ChordCard({
  chord,
  isSelected,
  onSelect,
}: {
  chord: ChordInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [voicingIdx, setVoicingIdx] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const color = STYLE_COLORS[chord.style];
  const voicing = chord.voicings[Math.min(voicingIdx, chord.voicings.length - 1)];
  const hasAlts = chord.voicings.length > 1;

  return (
    <div
      className="flex flex-col items-center rounded-xl py-3 px-2 transition-all"
      style={{
        background: isSelected ? `${color}14` : '#C4A06008',
        border: isSelected ? `1px solid ${color}50` : '1px solid #C4A06018',
        cursor: 'pointer',
      }}
      onClick={onSelect}
    >
      <ChordBox voicing={voicing} color={color} />

      {/* Voicing navigator */}
      {hasAlts && (
        <div
          className="flex items-center gap-1 mt-1"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setVoicingIdx((i) => Math.max(0, i - 1))}
            disabled={voicingIdx === 0}
            className="cursor-pointer px-1 text-[10px] disabled:opacity-20"
            style={{ color, background: 'none', border: 'none' }}
          >
            ←
          </button>
          <span
            className="text-[9px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            {voicing.label}
          </span>
          <button
            type="button"
            onClick={() => setVoicingIdx((i) => Math.min(chord.voicings.length - 1, i + 1))}
            disabled={voicingIdx === chord.voicings.length - 1}
            className="cursor-pointer px-1 text-[10px] disabled:opacity-20"
            style={{ color, background: 'none', border: 'none' }}
          >
            →
          </button>
        </div>
      )}

      {/* Name row */}
      <div className="mt-1 flex w-full items-center justify-between px-1">
        <span
          className="text-[13px] font-semibold"
          style={{ color: 'var(--foreground)', letterSpacing: '0.04em' }}
        >
          {chord.name}
        </span>
        <button
          type="button"
          title="Show info"
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo((v) => !v);
          }}
          className="cursor-pointer text-[11px] leading-none transition-opacity hover:opacity-80"
          style={{
            color: showInfo ? color : 'var(--muted-foreground)',
            background: 'none',
            border: 'none',
            opacity: showInfo ? 1 : 0.5,
          }}
        >
          ⓘ
        </button>
      </div>

      {/* Style badge */}
      <span
        className="mt-0.5 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]"
        style={{
          background: `${color}18`,
          color,
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
        }}
      >
        {STYLE_LABELS[chord.style]}
      </span>

      {/* Info panel */}
      {showInfo && (
        <div
          className="mt-2 w-full rounded-lg p-2 text-left animate-in fade-in duration-150"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <p
            className="text-[11px] font-semibold italic mb-0.5"
            style={{ color, fontFamily: 'var(--font-serif)' }}
          >
            {chord.feel}
          </p>
          <p
            className="text-[10px] leading-[1.45]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            {chord.theory}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Progression card ───────────────────────────────────── */

function ProgressionCard({
  prog,
  highlighted,
  selectedChord,
}: {
  prog: ProgressionDef;
  highlighted: boolean;
  selectedChord: string | null;
}) {
  const color = STYLE_COLORS[prog.style];
  return (
    <div
      className="rounded-xl px-4 py-3 space-y-2 transition-all"
      style={{
        background: highlighted ? `${color}10` : '#C4A06006',
        border: highlighted ? `1px solid ${color}40` : '1px solid #C4A06015',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className="text-[12px] font-semibold"
            style={{ color: 'var(--foreground)', letterSpacing: '0.04em' }}
          >
            {prog.name}
          </p>
          <p className="text-[10px] italic" style={{ color, fontFamily: 'var(--font-serif)' }}>
            {prog.feel}
          </p>
        </div>
      </div>

      {/* Chord sequence */}
      <div className="flex flex-wrap items-center gap-1">
        {prog.chords.map((name, i) => {
          const isActive = selectedChord === name;
          return (
            <span key={`${name}-${i}`} className="flex items-center gap-1">
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all"
                style={{
                  background: isActive ? color : `${color}15`,
                  color: isActive ? '#fff' : color,
                  border: `1px solid ${isActive ? color : `${color}30`}`,
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {name}
              </span>
              {i < prog.chords.length - 1 && (
                <span
                  className="text-[10px]"
                  style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}
                >
                  →
                </span>
              )}
            </span>
          );
        })}
      </div>

      <p
        className="text-[11px] leading-relaxed"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
      >
        {prog.description}
      </p>
    </div>
  );
}

/* ─── Filter rail ────────────────────────────────────────── */

type Filter = 'all' | ChordStyle;
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'soul', label: 'Soul' },
  { id: 'spanish', label: 'Spanish' },
];

/* ─── Main component ─────────────────────────────────────── */

export default function GuitarChords() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  const visibleChords = filter === 'all' ? CHORDS : CHORDS.filter((c) => c.style === filter);

  const visibleProgressions =
    filter === 'all' || filter === 'open'
      ? PROGRESSIONS
      : PROGRESSIONS.filter((p) => p.style === filter);

  const highlightedProgressions = selectedChord
    ? new Set(PROGRESSIONS.filter((p) => p.chords.includes(selectedChord)).map((p) => p.name))
    : null;

  return (
    <div className="space-y-6">
      {/* Filter rail */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setSelectedChord(null);
              }}
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

      {/* Selected chord context hint */}
      {selectedChord && (
        <div
          className="rounded-xl px-4 py-2 flex items-center justify-between animate-in fade-in duration-150"
          style={{ background: '#C4A06010', border: '1px solid #C4A06025' }}
        >
          <p
            className="text-[12px]"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}
          >
            <span style={{ color: '#C4A060', fontWeight: 700 }}>{selectedChord}</span> · appears in{' '}
            <span style={{ color: '#C4A060' }}>{highlightedProgressions?.size ?? 0}</span>{' '}
            progression{(highlightedProgressions?.size ?? 0) !== 1 ? 's' : ''} below
          </p>
          <button
            type="button"
            onClick={() => setSelectedChord(null)}
            className="cursor-pointer text-[11px] opacity-50 hover:opacity-80"
            style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Chord grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
        {visibleChords.map((chord, i) => (
          <ChordCard
            key={`${chord.style}-${chord.name}-${i}`}
            chord={chord}
            isSelected={selectedChord === chord.name}
            onSelect={() => setSelectedChord((prev) => (prev === chord.name ? null : chord.name))}
          />
        ))}
      </div>

      {/* Progressions section */}
      {visibleProgressions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: 1, background: '#C4A06015' }} />
            <span
              className="shrink-0 text-[10px] uppercase tracking-[0.16em]"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
            >
              Progressions
            </span>
            <div style={{ flex: 1, height: 1, background: '#C4A06015' }} />
          </div>
          {visibleProgressions.map((prog) => (
            <ProgressionCard
              key={prog.name}
              prog={prog}
              highlighted={highlightedProgressions?.has(prog.name) ?? false}
              selectedChord={selectedChord}
            />
          ))}
        </div>
      )}
    </div>
  );
}
