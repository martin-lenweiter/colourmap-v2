'use client';

import { useState } from 'react';

/* ─── Chapter data ───────────────────────────────────────── */

interface Chapter {
  n: number;
  title: string;
  desc: string;
  content: React.ReactNode;
}

/* Minimal inline SVG tab diagram for pentatonic box */
function PentatonicBox() {
  const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
  const dots: Record<string, number[]> = {
    E: [5, 8],
    A: [5, 7],
    D: [5, 7],
    G: [5, 7],
    B: [5, 8],
    e: [5, 8],
  };
  const CELL = 22;
  const LEFT = 24;
  const TOP = 8;
  const frets = [4, 5, 6, 7, 8];
  const W = LEFT + frets.length * CELL + 12;
  const H = TOP + 5 * CELL + 20;

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Am pentatonic box 1">
        {/* Fret numbers */}
        {frets.map((f, i) => (
          <text
            key={f}
            x={LEFT + (i + 0.5) * CELL}
            y={TOP - 2}
            textAnchor="middle"
            fontSize={8}
            fill="#A08060"
            fontFamily="var(--font-serif)"
          >
            {f}
          </text>
        ))}
        {/* Neck */}
        <rect
          x={LEFT}
          y={TOP}
          width={frets.length * CELL}
          height={5 * CELL}
          rx={3}
          fill="#221208"
          opacity={0.85}
        />
        {/* Fret bars */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={LEFT + i * CELL}
            y1={TOP}
            x2={LEFT + i * CELL}
            y2={TOP + 5 * CELL}
            stroke="#6B4820"
            strokeWidth={i === 0 ? 2.5 : 1}
          />
        ))}
        {/* String lines */}
        {strings.map((s, si) => (
          <g key={s}>
            <line
              x1={LEFT}
              y1={TOP + si * CELL}
              x2={LEFT + frets.length * CELL}
              y2={TOP + si * CELL}
              stroke="#A09070"
              strokeWidth={1 + (5 - si) * 0.28}
            />
            <text
              x={LEFT - 6}
              y={TOP + si * CELL + 4}
              textAnchor="end"
              fontSize={8}
              fill="#908060"
              fontFamily="var(--font-serif)"
            >
              {s}
            </text>
          </g>
        ))}
        {/* Dots */}
        {strings.map((s, si) => {
          const key = s === 'e' && si === 0 ? 'e' : s;
          return (dots[key] || []).map((fret) => {
            const isRoot = fret === 5 && (s === 'e' || s === 'A');
            const fi = frets.indexOf(fret);
            if (fi < 0) return null;
            return (
              <circle
                key={fret}
                cx={LEFT + (fi + 0.5) * CELL}
                cy={TOP + si * CELL}
                r={7}
                fill={isRoot ? '#C4A060' : '#7A5A3A'}
                stroke={isRoot ? '#E8C880' : '#A08060'}
                strokeWidth={0.8}
              />
            );
          });
        })}
      </svg>
      <p
        className="mt-1 text-[10px]"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
      >
        Gold = root note (A). Frets 5–8. Start on A string fret 5.
      </p>
    </div>
  );
}

/* Inline lick diagram — shows a short passage on a fret window */
interface LickNote {
  string: number; // 0=high e, 5=low E
  fret: number; // absolute fret
  technique?: 'bend' | 'slide' | 'hammer' | 'pull'; // decorates the dot
}

function LickDiagram({
  notes,
  fretMin,
  fretMax,
  label,
}: {
  notes: LickNote[];
  fretMin: number;
  fretMax: number;
  label: string;
}) {
  const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];
  const CELL_W = 26;
  const CELL_H = 20;
  const LEFT = 20;
  const TOP = 10;
  const fretCount = fretMax - fretMin + 1;
  const W = LEFT + fretCount * CELL_W + 10;
  const H = TOP + 5 * CELL_H + 20;

  const TECH_COLORS: Record<string, string> = {
    bend: '#C4A060',
    slide: '#7A9870',
    hammer: '#C07838',
    pull: '#9B6BA0',
  };

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label={label}>
        {/* Fret numbers */}
        {Array.from({ length: fretCount }, (_, i) => (
          <text
            key={i}
            x={LEFT + (i + 0.5) * CELL_W}
            y={TOP - 2}
            textAnchor="middle"
            fontSize={7}
            fill="#A08060"
            fontFamily="var(--font-serif)"
          >
            {fretMin + i}
          </text>
        ))}
        {/* Neck */}
        <rect
          x={LEFT}
          y={TOP}
          width={fretCount * CELL_W}
          height={5 * CELL_H}
          rx={2}
          fill="#221208"
          opacity={0.85}
        />
        {/* Fret bars */}
        {Array.from({ length: fretCount + 1 }, (_, i) => (
          <line
            key={i}
            x1={LEFT + i * CELL_W}
            y1={TOP}
            x2={LEFT + i * CELL_W}
            y2={TOP + 5 * CELL_H}
            stroke="#6B4820"
            strokeWidth={i === 0 ? 2.5 : 0.8}
          />
        ))}
        {/* Strings */}
        {STRINGS.map((s, si) => (
          <g key={s}>
            <line
              x1={LEFT}
              y1={TOP + si * CELL_H}
              x2={LEFT + fretCount * CELL_W}
              y2={TOP + si * CELL_H}
              stroke="#A09070"
              strokeWidth={0.8 + (5 - si) * 0.22}
            />
            <text
              x={LEFT - 4}
              y={TOP + si * CELL_H + 4}
              textAnchor="end"
              fontSize={7}
              fill="#908060"
              fontFamily="var(--font-serif)"
            >
              {s}
            </text>
          </g>
        ))}
        {/* Notes */}
        {notes.map((n, i) => {
          const cx = LEFT + (n.fret - fretMin + 0.5) * CELL_W;
          const cy = TOP + n.string * CELL_H;
          const color = n.technique ? TECH_COLORS[n.technique] : '#7A5A3A';
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={7}
                fill={color}
                stroke={color}
                strokeWidth={0.5}
                opacity={0.9}
              />
              {n.technique === 'bend' && (
                <text
                  x={cx + 7}
                  y={cy - 4}
                  fontSize={7}
                  fill="#C4A060"
                  fontFamily="var(--font-serif)"
                >
                  ↑
                </text>
              )}
              {n.technique === 'slide' && (
                <text
                  x={cx + 7}
                  y={cy + 3}
                  fontSize={7}
                  fill="#7A9870"
                  fontFamily="var(--font-serif)"
                >
                  /
                </text>
              )}
              {n.technique === 'hammer' && (
                <text
                  x={cx + 7}
                  y={cy + 3}
                  fontSize={7}
                  fill="#C07838"
                  fontFamily="var(--font-serif)"
                >
                  h
                </text>
              )}
              {n.technique === 'pull' && (
                <text
                  x={cx + 7}
                  y={cy + 3}
                  fontSize={7}
                  fill="#9B6BA0"
                  fontFamily="var(--font-serif)"
                >
                  p
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p
        className="mt-1 text-[9px]"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
      >
        {label}
      </p>
    </div>
  );
}

function ScaleFormula({
  name,
  intervals,
  feeling,
}: {
  name: string;
  intervals: string[];
  feeling: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 space-y-1"
      style={{ background: '#C4A06010', border: '1px solid #C4A06020' }}
    >
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
          {name}
        </span>
        <span
          className="text-[11px]"
          style={{
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
          }}
        >
          {feeling}
        </span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {intervals.map((iv, i) => (
          <span
            key={i}
            className="rounded px-1.5 py-0.5 text-[10px] font-mono"
            style={{
              background: iv.startsWith('b') || iv.startsWith('#') ? '#C0604015' : '#C4A06015',
              color: iv.startsWith('b') || iv.startsWith('#') ? '#C06040' : '#C4A060',
            }}
          >
            {iv}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChordStack({
  label,
  intervals,
  color,
}: {
  label: string;
  intervals: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl px-3 py-2.5"
      style={{ background: `${color}10`, border: `1px solid ${color}25` }}
    >
      <span className="text-[14px] font-bold" style={{ color }}>
        {label}
      </span>
      <span
        className="text-[10px]"
        style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
      >
        {intervals}
      </span>
    </div>
  );
}

function Progression({ chords, note }: { chords: string[]; note?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        {chords.map((ch, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className="rounded-lg px-3 py-1.5 text-[13px] font-bold"
              style={{ background: '#C4A06015', color: '#C4A060', border: '1px solid #C4A06030' }}
            >
              {ch}
            </span>
            {i < chords.length - 1 && <span style={{ color: '#C4A06060' }}>→</span>}
          </span>
        ))}
      </div>
      {note && (
        <p
          className="text-[11px] italic"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/* ─── Chapter content ────────────────────────────────────── */

const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: 'Your First 5 Chords',
    desc: 'Am, E, G, C, D — the five CAGED shapes that unlock hundreds of songs.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          These five chords unlock most of popular music. Learn the shapes, then practice the
          transitions — smooth chord changes matter more than perfect hand position at this stage.
        </p>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            Starter progression
          </p>
          <Progression
            chords={['Am', 'E', 'G', 'C']}
            note="4/4 time — one chord per bar. Strum DOWN · DOWN · DOWN-UP · DOWN-UP."
          />
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            Transition drill
          </p>
          <div
            className="rounded-lg px-3 py-2.5 text-[12px] space-y-1"
            style={{
              background: '#C4A06008',
              border: '1px solid #C4A06018',
              fontFamily: 'var(--font-serif)',
            }}
          >
            <p style={{ color: 'var(--muted-foreground)' }}>
              1. Hold Am for 4 beats, then G for 4 beats. Repeat 10×.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              2. Am → C → G → D. Do it slowly until clean. Then add speed.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              3. Record yourself once a week. Progress is invisible day-to-day but obvious over
              weeks.
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            Songs you can play now
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Wonderwall (Oasis), House of the Rising Sun (Animals), Horse With No Name (America), Mr
            Tambourine Man (Dylan), Brown Eyed Girl (Morrison)
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 2,
    title: 'The Pentatonic Box',
    desc: 'Minor pentatonic in the first position — your first scale for soloing and improvisation.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          The Am pentatonic (A C D E G) is the most versatile scale in guitar. It works over blues,
          rock, pop, and soul — and it lives entirely in a neat 5-fret box starting at fret 5.
        </p>
        <PentatonicBox />
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            How to use it
          </p>
          <div
            className="rounded-lg px-3 py-2.5 text-[12px] space-y-1"
            style={{
              background: '#C4A06008',
              border: '1px solid #C4A06018',
              fontFamily: 'var(--font-serif)',
            }}
          >
            <p style={{ color: 'var(--muted-foreground)' }}>
              1. Play the pattern top-to-bottom, then bottom-to-top. Get it in your fingers first.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              2. Put on any Am, E minor or A blues backing track. Just start noodling — every note
              works.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              3. Bend the G string fret 7 (D note) up slightly — that blue note is the secret sauce
              of blues.
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            Transposing
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Slide the whole box up 2 frets (start at fret 7) and you're playing Bm pentatonic. The
            same shape works in every key — just move the root note on the A string to the key you
            need.
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 3,
    title: 'The Major Scale Across the Neck',
    desc: 'Five CAGED positions mapped out — see how the same notes connect across the whole fretboard.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          The major scale has 7 notes following the pattern: Whole Whole Half Whole Whole Whole Half
          (W W H W W W H). In C major that's C D E F G A B — the white keys on a piano.
        </p>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            The formula
          </p>
          <div
            className="rounded-lg px-3 py-2.5 font-mono text-[12px]"
            style={{ background: '#C4A06008', border: '1px solid #C4A06018', color: '#C4A060' }}
          >
            W · W · H · W · W · W · H
          </div>
          <p
            className="text-[11px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            W = 2 frets, H = 1 fret. Start on any note and apply the formula to build a major scale
            in that key.
          </p>
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            The CAGED system
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Your five open chord shapes (C, A, G, E, D) tile across the entire neck. Each shape
            corresponds to a major scale position. Learning all 5 positions in one key gives you the
            complete fretboard — the same notes in 5 different "windows."
          </p>
          <div className="flex gap-2 flex-wrap">
            {['C', 'A', 'G', 'E', 'D'].map((shape) => (
              <span
                key={shape}
                className="rounded-full px-3 py-1 text-[12px] font-bold"
                style={{ background: '#C4A06015', color: '#C4A060', border: '1px solid #C4A06030' }}
              >
                {shape} shape
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            Practice tip
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Start with the G major scale in the E-shape position (root on low E string fret 3). Play
            it ascending and descending, naming each note out loud. Then find the same notes in the
            D-shape position — higher up the neck.
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 4,
    title: 'Chord Families',
    desc: 'Major, minor, 7th, sus2, sus4 — how to build any chord from intervals.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Every chord is built from stacked intervals above a root note. Learn the interval recipe
          and you can build — and name — any chord you encounter.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ChordStack label="Major" intervals="1 · 3 · 5" color="#C4A060" />
          <ChordStack label="Minor" intervals="1 · b3 · 5" color="#C07838" />
          <ChordStack label="Dom 7th" intervals="1 · 3 · 5 · b7" color="#C07838" />
          <ChordStack label="Maj 7th" intervals="1 · 3 · 5 · 7" color="#C4A060" />
          <ChordStack label="min 7th" intervals="1 · b3 · 5 · b7" color="#6890B0" />
          <ChordStack label="sus2" intervals="1 · 2 · 5" color="#7A8A50" />
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            The feeling of each type
          </p>
          <div className="space-y-1 text-[12px]" style={{ fontFamily: 'var(--font-serif)' }}>
            <p style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#C4A060', fontWeight: 700 }}>Major</span> — bright, resolved,
              happy
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#C07838', fontWeight: 700 }}>Minor</span> — darker,
              introspective, emotional
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#C07838', fontWeight: 700 }}>Dominant 7th</span> — bluesy
              tension, wants to resolve
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#C4A060', fontWeight: 700 }}>Major 7th</span> — dreamy,
              sophisticated, jazz
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#6890B0', fontWeight: 700 }}>Minor 7th</span> — smooth, soul,
              laid-back tension
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: '#7A8A50', fontWeight: 700 }}>sus2 / sus4</span> — open,
              unresolved, floating
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            The diatonic family in C major
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            I=Cmaj · II=Dm · III=Em · IV=F · V=G7 · VI=Am · VII=Bdim — every key follows the same
            pattern of chord qualities (maj, min, min, maj, dom7, min, dim).
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 5,
    title: 'Modes — The Emotional Colours',
    desc: 'Dorian, Phrygian, Lydian … each mode gives a different emotional flavour to the same set of notes.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Modes are rotations of the major scale. The C major scale starting on D (D E F G A B C D)
          is D Dorian. Same notes, completely different emotional feel — because the tonal center
          shifts.
        </p>
        <div className="space-y-2">
          {[
            {
              name: 'Ionian (I)',
              intervals: ['1', '2', '3', '4', '5', '6', '7'],
              feel: 'Bright · resolved · happy (standard major)',
            },
            {
              name: 'Dorian (ii)',
              intervals: ['1', '2', 'b3', '4', '5', '6', 'b7'],
              feel: 'Dark but with light in it · soul · jazz · Santana',
            },
            {
              name: 'Phrygian (iii)',
              intervals: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
              feel: 'Dark · Spanish · mysterious · tense',
            },
            {
              name: 'Lydian (IV)',
              intervals: ['1', '2', '3', '#4', '5', '6', '7'],
              feel: 'Dreamy · ethereal · film scores · wonder',
            },
            {
              name: 'Mixolydian (V)',
              intervals: ['1', '2', '3', '4', '5', '6', 'b7'],
              feel: 'Bluesy · rock · dominant — the blues scale',
            },
            {
              name: 'Aeolian (vi)',
              intervals: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
              feel: 'Natural minor — melancholy · emotional',
            },
            {
              name: 'Locrian (vii)',
              intervals: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
              feel: 'Unstable · dissonant · rare but effective',
            },
          ].map((m) => (
            <ScaleFormula key={m.name} name={m.name} intervals={m.intervals} feeling={m.feel} />
          ))}
        </div>
        <div className="space-y-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C4A060' }}
          >
            How to practice modes
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Take D Dorian (D E F G A B C) over a Dm7 vamp. Notice the raised 6th (B natural) — that
            is what gives Dorian its unique "soul in the dark" quality compared to pure natural
            minor (which would have Bb).
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 6,
    title: 'The Andalusian World',
    desc: 'Phrygian Dominant, the flamenco cadence, and the soul of Spanish music.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Phrygian Dominant is Phrygian with a raised 3rd. That single change — from a minor 3rd to
          a major 3rd — creates one of the most powerful scales in music: the sound of flamenco,
          Middle Eastern music, and Andalusian soul.
        </p>
        <ScaleFormula
          name="Phrygian Dominant (A)"
          intervals={['A', 'Bb', 'C#', 'D', 'E', 'F', 'G']}
          feeling="A b2 3 4 5 b6 b7 · flamenco · Arabic · Sephardic"
        />
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C06040' }}
          >
            The Andalusian Cadence
          </p>
          <Progression
            chords={['Am', 'G', 'F', 'E']}
            note="In A Phrygian Dominant. The E major chord is the key — it has G#, the raised 3rd of the scale. Play it slowly and feel the tension release on E."
          />
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C06040' }}
          >
            Why E major sounds so strong here
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            In A Phrygian Dominant, E is the dominant (5th degree). E major has G#, the chromatic
            tone that doesn't belong to the parent scale of A minor. This creates maximum harmonic
            tension — which the E chord resolves by pulling back to Am with powerful finality.
          </p>
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C06040' }}
          >
            Try this
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Play the Am chord. Then slowly move down: Am → G → F → E (let each ring). Then improvise
            over this four-chord loop using A Phrygian Dominant notes. Every note will either sound
            tense or resolved — the architecture of flamenco.
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 7,
    title: 'Soul Harmony',
    desc: 'Extended chords — 7ths, 9ths, maj7s — the ii-V-I progression, and how soul guitar creates depth.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Soul and jazz harmony go beyond triads. By stacking thirds above the 7th — adding the 9th,
          11th, 13th — you build chords that shimmer with complexity while still feeling smooth and
          warm.
        </p>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C07838' }}
          >
            The ii-V-I progression
          </p>
          <Progression
            chords={['Dm7', 'G7', 'Cmaj7']}
            note="The cornerstone of jazz and soul. Each chord pulls to the next. In any key: IIm7 → V7 → Imaj7."
          />
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C07838' }}
          >
            Extended voicings
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ChordStack label="Am9" intervals="A · C · E · G · B" color="#C07838" />
            <ChordStack label="Gmaj9" intervals="G · B · D · F# · A" color="#C4A060" />
            <ChordStack label="E9" intervals="E · G# · B · D · F#" color="#C07838" />
            <ChordStack label="Cmaj13" intervals="C · E · G · B · D · A" color="#C4A060" />
          </div>
        </div>
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C07838' }}
          >
            Voicing secrets
          </p>
          <div
            className="rounded-lg px-3 py-2.5 text-[12px] space-y-1"
            style={{
              background: '#C4A06008',
              border: '1px solid #C4A06018',
              fontFamily: 'var(--font-serif)',
            }}
          >
            <p style={{ color: 'var(--muted-foreground)' }}>
              1. Leave out the root — bass player covers it. This frees strings for extensions.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              2. Prioritize the 3rd and 7th — they define the chord's quality (major vs minor vs
              dominant).
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              3. The 9th (2nd octave) and 13th (6th octave) add color without changing function.
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#C07838' }}
          >
            Soul progression to practice
          </p>
          <Progression
            chords={['Am7', 'Dm7', 'G7', 'Cmaj7']}
            note="Im7 → IVm7 → V7 → bVIImaj7 — the rhythm and soul of Marvin Gaye and Stevie Wonder."
          />
        </div>
      </div>
    ),
  },
  {
    n: 8,
    title: 'Blues Licks — The Vocabulary',
    desc: 'Classic Am pentatonic licks — bends, hammer-ons, turnarounds. Each lick connects a chord change or decorates a chord.',
    content: (
      <div className="space-y-5">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Blues licks are phrases — short melodic ideas that live between chord changes or sit on
          top of a chord. Learn each one as a unit, then string them together over a 12-bar backing.
        </p>

        {/* Lick 1 — Classic bend */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Lick 1 — The Am Bend (over A7)
          </p>
          <LickDiagram
            label="G-string bend fret 7 + B-string — over A7"
            fretMin={5}
            fretMax={9}
            notes={[
              { string: 2, fret: 7, technique: 'bend' },
              { string: 1, fret: 5 },
              { string: 2, fret: 5 },
              { string: 3, fret: 7 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Bend G-string fret 7 (D→E), release, then descend to fret 5 on B, and resolve on
            D-string fret 7. The bend is the emotional core — push it slowly.
          </p>
        </div>

        {/* Lick 2 — Turnaround lick */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Lick 2 — Turnaround (A7 → E9)
          </p>
          <LickDiagram
            label="Classic A-blues turnaround, low strings"
            fretMin={0}
            fretMax={5}
            notes={[
              { string: 5, fret: 5 },
              { string: 5, fret: 4 },
              { string: 5, fret: 3 },
              { string: 5, fret: 2 },
              { string: 4, fret: 2 },
              { string: 4, fret: 0 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Descend the low E string frets 5→4→3→2, then A string 2→0. This chromatic descent is the
            classic A-blues turnaround. Lands on the open A (root) going into E9.
          </p>
        </div>

        {/* Lick 3 — Hammer on connector */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Lick 3 — Hammer-On Connector (A7 → D9)
          </p>
          <LickDiagram
            label="Hammer-on phrase connecting I to IV"
            fretMin={5}
            fretMax={8}
            notes={[
              { string: 3, fret: 5, technique: 'hammer' },
              { string: 3, fret: 7 },
              { string: 2, fret: 5, technique: 'hammer' },
              { string: 2, fret: 8 },
              { string: 1, fret: 5 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Hammer from D-string fret 5 to 7, then B-string 5 to 8 — land on high e fret 5. This
            cascading hammer phrase resolves on the 9th of D9, perfectly leading into the IV chord.
          </p>
        </div>

        {/* Lick 4 — Triple repeat call */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Lick 4 — The Triple Repeat (over D9)
          </p>
          <LickDiagram
            label="Repeated high note phrase over D9"
            fretMin={7}
            fretMax={10}
            notes={[
              { string: 0, fret: 8, technique: 'bend' },
              { string: 0, fret: 8, technique: 'bend' },
              { string: 0, fret: 8, technique: 'bend' },
              { string: 0, fret: 10 },
              { string: 1, fret: 8 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Repeat-bend the high e fret 8 three times — this is the call. Then answer by stepping up
            to fret 10 and landing on B-string 8. Albert King's signature: make the guitar say
            words.
          </p>
        </div>

        {/* Lick 5 — Sliding 6ths */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Lick 5 — Sliding 6ths (over E9 → A7)
          </p>
          <LickDiagram
            label="Double-stop 6ths sliding down to A resolution"
            fretMin={4}
            fretMax={9}
            notes={[
              { string: 0, fret: 9, technique: 'slide' },
              { string: 2, fret: 9, technique: 'slide' },
              { string: 0, fret: 7 },
              { string: 2, fret: 7 },
              { string: 0, fret: 5 },
              { string: 2, fret: 5 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Play e and G strings together (6th interval) at fret 9, slide down to 7, then 5. This is
            the V→I lick — feels like a sigh of resolution. Use ring + index together and let them
            slide.
          </p>
        </div>

        <div
          className="rounded-lg px-3 py-2.5 text-[12px] space-y-1.5"
          style={{
            background: '#5A7EA808',
            border: '1px solid #5A7EA820',
            fontFamily: 'var(--font-serif)',
          }}
        >
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            How to practice these over a 12-bar
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            1. Put on a slow A blues backing (80–90 BPM). Play Lick 1 over bars 1–4 (A7).
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            2. Use Lick 3 as the connecting phrase going into D9 (bar 5).
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            3. Use Lick 4 over bars 5–6 (D9) — triple repeat over the IV chord.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            4. Lick 5 over E9 → A7 (bar 9–10). Lick 2 for the turnaround (bar 11–12).
          </p>
        </div>
      </div>
    ),
  },
  {
    n: 9,
    title: 'Blues for Rock — Applied Vocabulary',
    desc: 'How blues licks translate directly into rock solos. Chuck Berry double-stops, the pentatonic riff, and minor blues over power chords.',
    content: (
      <div className="space-y-5">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Rock guitar IS blues guitar — applied to louder amplifiers and heavier rhythms. Every
          great rock solo (Page, Hendrix, SRV, Angus Young, Clapton) is built from the same Am
          pentatonic vocabulary. The blues framework just runs at a different energy level.
        </p>

        {/* Double stops — Chuck Berry */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Double-Stop Rock Riff (Chuck Berry / Keith Richards)
          </p>
          <LickDiagram
            label="Classic rock double-stop in A — D + G strings"
            fretMin={4}
            fretMax={7}
            notes={[
              { string: 2, fret: 5 },
              { string: 3, fret: 5 },
              { string: 2, fret: 7 },
              { string: 3, fret: 7 },
              { string: 2, fret: 5 },
              { string: 3, fret: 5 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Play D and G strings together. Fret 5 (A+D), then slide to fret 7 (B+E), back to 5. This
            is the Chuck Berry "Johnny B. Goode" rock-and-roll riff. Over A power chord or A7.
          </p>
        </div>

        {/* Power riff with blues note */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Blues Scale Power Riff (Zeppelin / Angus Young)
          </p>
          <LickDiagram
            label="E minor blues scale into a rock riff — low strings"
            fretMin={0}
            fretMax={5}
            notes={[
              { string: 5, fret: 0 },
              { string: 5, fret: 2 },
              { string: 5, fret: 3 },
              { string: 4, fret: 0, technique: 'hammer' },
              { string: 4, fret: 2 },
              { string: 4, fret: 3 },
            ]}
          />
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            E minor blues scale on the low strings: E0 → E2 → E3 (the blue note Gb) → A0 → A2 → A3.
            This is the riff spine of "Whole Lotta Love," "Back in Black," and hundreds more. The Gb
            (b5) is the "blue note" that gives rock its grit.
          </p>
        </div>

        {/* Minor pentatonic over power chords */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Minor Pentatonic Over Em–D–A Rock Progression
          </p>
          <Progression
            chords={['Em', 'D', 'A', 'Em']}
            note="Use Am/Em pentatonic (frets 5–8) throughout. Works over all three chords — that's the magic of pentatonic."
          />
          <div
            className="rounded-lg px-3 py-2.5 text-[12px] space-y-1"
            style={{
              background: '#C4A06008',
              border: '1px solid #C4A06018',
              fontFamily: 'var(--font-serif)',
            }}
          >
            <p style={{ color: 'var(--muted-foreground)' }}>
              The Am pentatonic (A C D E G) works as a solo scale over Em, D, and A chords — they
              all draw notes from it.
            </p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Over Em: land on E (root) at e-string fret 5. Over D: land on D (root) at B-string
              fret 7. Over A: land on A (root) at A-string fret 5.
            </p>
          </div>
        </div>

        {/* Rock vs Blues feel */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            Blues Feel vs Rock Feel — same notes, different delivery
          </p>
          <div
            className="grid grid-cols-2 gap-2 text-[11px]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <div
              className="rounded-lg px-3 py-2.5"
              style={{ background: '#5A7EA810', border: '1px solid #5A7EA825' }}
            >
              <p className="font-semibold mb-1" style={{ color: '#5A7EA8' }}>
                Blues
              </p>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Slow vibrato · wide bends · space between notes · call and response · emotion first
              </p>
            </div>
            <div
              className="rounded-lg px-3 py-2.5"
              style={{ background: '#C4A06010', border: '1px solid #C4A06025' }}
            >
              <p className="font-semibold mb-1" style={{ color: '#C4A060' }}>
                Rock
              </p>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Fast runs · palm muting · power chords · sustained distortion · energy and
                aggression
              </p>
            </div>
          </div>
        </div>

        {/* SRV / Hendrix crossover */}
        <div className="space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: '#5A7EA8' }}
          >
            The Crossover: SRV / Hendrix Style
          </p>
          <p
            className="text-[12px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            SRV and Hendrix lived exactly at the crossover — blues vocabulary at rock volume and
            intensity. The key is mixing the E7#9 (Hendrix chord) with pentatonic runs and full-tone
            bends. Try: E7#9 held (2 bars) → burst of Am pentatonic licks → resolve back to E7#9.
            That's the template.
          </p>
          <Progression
            chords={['E7#9', 'Am7', 'D9', 'E7#9']}
            note="Hendrix blues-rock loop. Hold E7#9 rhythmically, solo in Am pent over Am7 and D9, snap back."
          />
        </div>

        <div
          className="rounded-lg px-3 py-2.5 text-[12px] space-y-1.5"
          style={{
            background: '#5A7EA808',
            border: '1px solid #5A7EA820',
            fontFamily: 'var(--font-serif)',
          }}
        >
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Practice path
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            1. Learn Licks 1–3 from the Blues Vocabulary chapter. Make them fluent.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            2. Play them over Em–D–A at a heavier, faster tempo. Notice how the same phrase sounds
            different with rock energy.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            3. Add palm muting on the rhythm chord, then release into the lick. That contrast IS
            rock guitar.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            4. Learn the Chuck Berry double-stop riff and use it as the rhythmic foundation between
            licks.
          </p>
        </div>
      </div>
    ),
  },
];

/* ─── Main component ─────────────────────────────────────── */

export default function GuitarLearn() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2.5">
      {CHAPTERS.map((ch) => {
        const isOpen = open === ch.n;
        return (
          <div
            key={ch.n}
            className="rounded-xl overflow-hidden"
            style={{
              background: isOpen ? '#C4A06010' : '#C4A06006',
              border: `1px solid ${isOpen ? '#C4A06035' : '#C4A06015'}`,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : ch.n)}
              className="w-full cursor-pointer text-left"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <div className="flex items-start gap-3 px-5 py-4">
                <span
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold"
                  style={{ background: '#C4A060', color: '#fff' }}
                >
                  {ch.n}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap justify-between">
                    <span
                      className="text-[14px] font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {ch.title}
                    </span>
                    <span
                      className="text-[10px] transition-transform duration-200"
                      style={{
                        color: '#C4A06080',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[12px] leading-relaxed"
                    style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                  >
                    {ch.desc}
                  </p>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 animate-in fade-in duration-200">
                <div className="h-px mb-4" style={{ background: '#C4A06020' }} />
                {ch.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
