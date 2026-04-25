/*
 * Groove Machine — 7 curated soundscape presets.
 *
 * Each preset is a complete bundle: bpm + swing + pattern overrides
 * for relevant tracks + which tracks default to active + a colour
 * palette for the big-dot picker. The engine in components/
 * GrooveMachine.tsx applies a preset by overriding the base tracks
 * — non-overridden tracks keep their default funk-tech-house
 * patterns (which is fine when the preset doesn't activate them).
 *
 * Per Martin (2026-04-25): "make sure u do the 7 groove landscapes.
 * what we have now is just one. make them complementary. and
 * differentiated. add more atmo pads on base one. add different
 * rythmic parts. so it isnt the same rythm box forever."
 *
 * Spec: docs/specs/groove-machine-7-soundscapes.md
 */

export type TrackId =
  | 'kick'
  | 'snare'
  | 'clap'
  | 'hihat'
  | 'perc'
  | 'bass'
  | 'subpulse'
  | 'wobble'
  | 'rhodes'
  | 'guitar'
  | 'pluck'
  | 'arp'
  | 'lead'
  | 'pad'
  | 'chop';

export interface GroovePreset {
  id: string;
  name: string;
  /** One-line poetic description shown under the big dot. */
  vibe: string;
  /** Colour for the big dot in the preset picker + the group accent. */
  dot: string;
  /** Default tempo in bpm. */
  bpm: number;
  /** Swing amount 0..0.5. 0 = mechanical; 0.17 = funky. */
  swing: number;
  /** Which tracks default to ON when this preset loads. */
  activeSet: Partial<Record<TrackId, boolean>>;
  /** Per-track pattern overrides. Track ids not listed keep the
   *  default pattern from TRACKS. Length 16 = one bar of 16ths. */
  patternOverrides?: Partial<Record<TrackId, number[]>>;
  /** Per-track notes overrides — frequencies for melodic tracks. */
  notesOverrides?: Partial<Record<TrackId, number[]>>;
  /** Per-track variation pools — alternative 16-step patterns the
   *  scheduler can swap to per-bar based on the current arc phase.
   *  Keeps the groove from sounding repetitive after a minute.
   *  See docs/specs/groove-machine-infinite-tracks.md. */
  variationPools?: Partial<Record<TrackId, number[][]>>;
}

/* ─── Arc phases ───────────────────────────────────────────────
 * Phase 1 of the infinite-tracks evolution. The 80-bar loop:
 *   intro   8 bars  — sparse / inviting
 *   verse  16 bars  — main groove
 *   lift    4 bars  — riser feel
 *   chorus 16 bars  — full mix
 *   bdwn    8 bars  — bass + pad only (breakdown)
 *   verse' 16 bars  — verse with variation
 *   outro   8 bars  — softening
 *   reprise 4 bars  — back to intro shape
 */
export type ArcPhase =
  | 'intro'
  | 'verse'
  | 'lift'
  | 'chorus'
  | 'breakdown'
  | 'verse2'
  | 'outro'
  | 'reprise';

const PHASE_BAR_LENGTHS: { phase: ArcPhase; bars: number }[] = [
  { phase: 'intro', bars: 8 },
  { phase: 'verse', bars: 16 },
  { phase: 'lift', bars: 4 },
  { phase: 'chorus', bars: 16 },
  { phase: 'breakdown', bars: 8 },
  { phase: 'verse2', bars: 16 },
  { phase: 'outro', bars: 8 },
  { phase: 'reprise', bars: 4 },
];

const ARC_TOTAL_BARS = PHASE_BAR_LENGTHS.reduce((acc, p) => acc + p.bars, 0); // 80

/** Map a global bar number to its arc phase. */
export function getPhaseForBar(bar: number): ArcPhase {
  let b = bar % ARC_TOTAL_BARS;
  for (const { phase, bars } of PHASE_BAR_LENGTHS) {
    if (b < bars) return phase;
    b -= bars;
  }
  return 'intro';
}

/** Phase-specific weights for picking from a variation pool. The
 *  pool is `[A, B, C, D, ...]` from "main" to "busier" to
 *  "sparse" to "alt." The weights here favour different ones per
 *  phase. Phases not listed = uniform. */
const PHASE_VARIATION_WEIGHTS: Partial<Record<ArcPhase, number[]>> = {
  intro: [0, 0, 1, 0.4], // sparse-leaning
  verse: [1, 0.5, 0, 0.2], // mostly the main pattern
  lift: [0.4, 1, 0, 0.4], // busier
  chorus: [0.6, 1, 0, 0.4], // busiest
  breakdown: [0, 0, 1, 0.6], // sparse + alt
  verse2: [0.6, 0.5, 0.2, 1], // main + alt mixed
  outro: [0.4, 0, 1, 0.2], // softening
  reprise: [0, 0, 1, 0], // back to sparse
};

/**
 * Pick a variation index from a pool based on the current arc phase.
 * Returns 0 if the pool is empty/missing. Uses weighted random pick;
 * for very simple pools (1–2 alternatives) you'll usually get the
 * same one twice in a row, which is fine — the structure isn't in
 * the small picks but in the long arc.
 */
export function pickVariationIndex(phase: ArcPhase, poolSize: number): number {
  if (poolSize <= 0) return 0;
  if (poolSize === 1) return 0;
  const weights = PHASE_VARIATION_WEIGHTS[phase];
  if (!weights) return Math.floor(Math.random() * poolSize);
  const trimmed = weights.slice(0, poolSize);
  const total = trimmed.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let r = Math.random() * total;
  for (let i = 0; i < trimmed.length; i++) {
    r -= trimmed[i];
    if (r <= 0) return i;
  }
  return 0;
}

// Frequencies for melodic notes (matches GrooveMachine.tsx constants)
const A2 = 110;
const C3 = 130.81;
const D3 = 146.83;
const E3 = 164.81;
const F3 = 174.61;
const G3 = 196;
const A3 = 220;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const G4 = 392;
const A4 = 440;
const C5 = 523.25;

export const GROOVE_PRESETS: readonly GroovePreset[] = [
  {
    id: 'sun-up-funk',
    name: 'Sun-up Funk',
    vibe: 'Daft Punk · Jamiroquai · golden hour',
    dot: '#C4A060',
    bpm: 112,
    swing: 0.17,
    activeSet: {
      kick: true,
      snare: true,
      hihat: true,
      bass: true,
      pad: true,
      guitar: true,
    },
    // Default patterns are already funk-flavoured — small tweaks only.
    variationPools: {
      kick: [
        // A — main funk kick (1, ghost on &a3)
        [1, 0, 0, 0, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 0, 0.4, 0],
        // B — busier (extra hits on the 2 and 4)
        [1, 0, 0, 0, 1, 0, 0.5, 0, 1, 0, 0, 0, 1, 0, 0.4, 0],
        // C — half-time (only 1 and 9)
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — funky pickup (hit on the &-of-4 leading to next bar)
        [1, 0, 0, 0, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      ],
      snare: [
        // A — backbeat with ghost
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.35, 0],
        // B — busier with extra ghost on the &a of 1
        [0, 0, 0.3, 0, 1, 0, 0, 0, 0, 0, 0.3, 0, 1, 0, 0.4, 0],
        // C — sparse, just 2 + 4
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        // D — ghost-heavy
        [0, 0, 0.25, 0, 1, 0, 0.3, 0, 0, 0, 0.25, 0, 1, 0, 0.35, 0],
      ],
      hihat: [
        // A — main swung 16ths with open
        [0.45, 0.3, 0.7, 0.3, 0.45, 0.3, 1, 0.3, 0.45, 0.3, 0.7, 0.3, 0.45, 0.3, 1, 0.5],
        // B — busier all-16ths
        [0.5, 0.4, 0.7, 0.4, 0.5, 0.4, 1, 0.4, 0.5, 0.4, 0.7, 0.4, 0.5, 0.4, 1, 0.7],
        // C — sparse 8ths
        [0.45, 0, 0.5, 0, 0.45, 0, 0.7, 0, 0.45, 0, 0.5, 0, 0.45, 0, 0.7, 0],
        // D — alt with offbeat accents
        [0.4, 0.3, 0.5, 0.5, 0.4, 0.3, 0.8, 0.4, 0.4, 0.3, 0.5, 0.5, 0.4, 0.3, 0.9, 0.5],
      ],
      bass: [
        // A — main funk bass with ghosts
        [1, 0, 0, 0.6, 0, 1, 0, 0.5, 1, 0, 0, 0, 1, 0, 0.7, 0.5],
        // B — busier with more 16ths
        [1, 0.3, 0, 0.6, 0.4, 1, 0, 0.5, 1, 0.3, 0, 0.4, 1, 0, 0.7, 0.5],
        // C — root-only sparse
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — alt with the 5th on offbeats
        [1, 0, 0, 0.4, 0, 0.7, 0, 0.5, 1, 0, 0, 0, 0.7, 0, 0.5, 0.4],
      ],
    },
  },
  {
    id: 'tech-house',
    name: 'Tech House',
    vibe: 'Berlin late-night · Kompakt records',
    dot: '#3A6890',
    bpm: 124,
    swing: 0.04, // tight, almost zero
    activeSet: {
      kick: true,
      hihat: true,
      perc: true,
      subpulse: true,
      pad: true,
    },
    patternOverrides: {
      // 4-on-floor — kick on every beat
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Off-beat hat (the genre's heartbeat)
      hihat: [0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0],
      // Sub on the 1, sustained
      subpulse: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Sparse percussion offbeats
      perc: [0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0],
      // Atmo pad sustained
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      subpulse: [A2 / 2, 0, 0, 0, 0, 0, 0, 0, A2 / 2, 0, 0, 0, 0, 0, 0, 0],
      pad: [A2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        // A — main 4-on-floor
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        // B — main + ghost on the &-of-4
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.5, 0],
        // C — three-quarter (drops one beat — chorus drama)
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — pickup with extra 16th
        [1, 0, 0, 0, 1, 0, 0, 0.5, 1, 0, 0, 0, 1, 0, 0, 0.5],
      ],
      hihat: [
        // A — main offbeat
        [0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0],
        // B — alt with closed on every 16th
        [0.3, 0.3, 0.7, 0.3, 0.3, 0.3, 0.7, 0.3, 0.3, 0.3, 0.7, 0.3, 0.3, 0.3, 0.7, 0.3],
        // C — sparse, just every 4th
        [0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0],
        // D — open hat on the &-of-4
        [0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 1, 0.5],
      ],
      perc: [
        // A — sparse offbeat shaker
        [0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0],
        // B — busier shaker
        [0.4, 0, 0.4, 0.5, 0.4, 0, 0.4, 0, 0.4, 0, 0.4, 0.5, 0.4, 0, 0.4, 0],
        // C — silent
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — clave-like cross-rhythm
        [0, 0, 0, 1, 0.4, 0, 1, 0, 0, 0, 1, 0, 0.4, 0, 1, 0],
      ],
    },
  },
  {
    id: 'tropical',
    name: 'Tropical',
    vibe: 'Kygo sunset · steel pan + marimba',
    dot: '#E08858',
    bpm: 104,
    swing: 0.08,
    activeSet: {
      kick: true,
      snare: true,
      perc: true,
      pluck: true,
      bass: true,
      pad: true,
    },
    patternOverrides: {
      // Soft kick on 1+3, gentle ghost on 2&
      kick: [1, 0, 0, 0, 0, 0, 0.4, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Snare on 2+4 only
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Shaker 16ths
      perc: [0.5, 0.4, 0.6, 0.4, 0.5, 0.4, 0.6, 0.4, 0.5, 0.4, 0.6, 0.4, 0.5, 0.4, 0.6, 0.4],
      // Plucked bass — root + fifth
      bass: [1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.7, 0],
      // Tropical pluck — marimba-like, I-V-vi-IV pattern
      pluck: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.6, 0],
      // Atmo pad
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      bass: [A2, A2, A2, A2, A2, A2, E3, A2, A2, A2, A2, A2, A2, A2, G3 / 2, A2],
      pluck: [A4, 0, 0, 0, E4, 0, 0, 0, F3 * 2, 0, 0, 0, D4, 0, A4, 0],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, A3, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        // A — soft on 1+3 with ghost on &-of-2
        [1, 0, 0, 0, 0, 0, 0.4, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // B — busier with kick on every beat
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        // C — sparse, just 1
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — pickup with extra hit on the &-of-4
        [1, 0, 0, 0, 0, 0, 0.4, 0, 1, 0, 0, 0, 0, 0, 0.6, 0],
      ],
      perc: [
        // A — main shaker 16ths
        [0.5, 0.4, 0.6, 0.4, 0.5, 0.4, 0.6, 0.4, 0.5, 0.4, 0.6, 0.4, 0.5, 0.4, 0.6, 0.4],
        // B — busier with accents
        [0.6, 0.5, 0.7, 0.5, 0.6, 0.5, 1, 0.5, 0.6, 0.5, 0.7, 0.5, 0.6, 0.5, 1, 0.6],
        // C — sparse 8ths
        [0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0],
        // D — silent (room to breathe)
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      pluck: [
        // A — main I-V pattern
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.6, 0],
        // B — busier with extra 16ths
        [1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.6, 0.4],
        // C — sparse, just on the 1
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — alt rhythm with offbeats
        [1, 0, 0, 0.5, 0.7, 0, 0, 0.5, 1, 0, 0, 0.5, 0.7, 0, 0.6, 0.4],
      ],
    },
  },
  {
    id: 'slow-roll',
    name: 'Slow Roll',
    vibe: 'sexy R&B · low-BPM bedroom soul',
    dot: '#7A3850',
    bpm: 78,
    swing: 0.12,
    activeSet: {
      kick: true,
      snare: true,
      bass: true,
      rhodes: true,
      pad: true,
    },
    patternOverrides: {
      // Big slow kick on 1 only (half-time feel)
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Snare drag on 3 only
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      // Long sustained bass
      bass: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Rhodes m9 chord every 2 bars — sparse stabs
      rhodes: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Big atmospheric pad
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      bass: [A2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, F3 / 2, 0, 0, 0],
      rhodes: [0, 0, 0, 0, A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        // A — slow kick on 1 only (half-time)
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // B — add a ghost on the &-of-3
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 0, 0, 0, 0, 0],
        // C — silent (full breath)
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — alt — kick on 1 + 11 (gentle pickup)
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0],
      ],
      snare: [
        // A — snare drag on 3 only
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // B — light double on 3 + 11
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.3, 0, 0, 0, 0, 0],
        // C — silent
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — drag on 3 + soft tail at 15
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.3, 0],
      ],
      bass: [
        // A — long sustained
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        // B — busier with mid hit
        [1, 0, 0, 0, 0, 0, 0.4, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        // C — root only
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — slide-in alternate
        [1, 0, 0, 0.4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.5, 0],
      ],
    },
  },
  {
    id: 'boom-bap',
    name: 'Boom Bap',
    vibe: 'Biggie · Nas · J Dilla · 1995 Brooklyn',
    dot: '#6A4A2A',
    bpm: 90,
    swing: 0.2, // strong swing
    activeSet: {
      kick: true,
      snare: true,
      hihat: true,
      bass: true,
      rhodes: true,
      chop: true,
    },
    patternOverrides: {
      // Dusty kick — 1 + & of 2 + 3
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0.5, 0],
      // Loud dry snare on 2+4
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // 8th-note hat with humanization (velocities vary)
      hihat: [0.6, 0, 0.5, 0, 0.7, 0, 0.4, 0, 0.6, 0, 0.5, 0, 0.7, 0, 0.4, 0],
      // Walking jazz upright bass
      bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Jazzy Rhodes loop chopped
      rhodes: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      // Vocal chop on the &-of-3 every 2 bars
      chop: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    },
    notesOverrides: {
      bass: [A2, 0, 0, 0, C3, 0, 0, 0, D3, 0, 0, 0, E3, 0, 0, 0],
      rhodes: [A3, 0, 0, 0, 0, 0, C4, 0, 0, 0, E4, 0, 0, 0, 0, 0],
      chop: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, E4, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        // A — main dusty kick
        [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0.5, 0],
        // B — busier with extra ghost
        [1, 0, 0.4, 0, 0, 0, 1, 0, 1, 0, 0.4, 0, 0, 0, 0.6, 0],
        // C — sparse just 1 + 9
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — alt with the &-of-2 instead of the &-of-3
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.5, 0],
      ],
      snare: [
        // A — 2+4 dry
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        // B — with subtle ghost on 14
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.3, 0],
        // C — only on 2
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — drag on 13.5 leading into next bar
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0.4, 0.3, 0],
      ],
      hihat: [
        // A — main 8th-note swung
        [0.6, 0, 0.5, 0, 0.7, 0, 0.4, 0, 0.6, 0, 0.5, 0, 0.7, 0, 0.4, 0],
        // B — busier with closed 16ths
        [0.5, 0.3, 0.5, 0.3, 0.7, 0.3, 0.4, 0.3, 0.5, 0.3, 0.5, 0.3, 0.7, 0.3, 0.4, 0.3],
        // C — sparse — every quarter
        [0.6, 0, 0, 0, 0.7, 0, 0, 0, 0.6, 0, 0, 0, 0.7, 0, 0, 0],
        // D — alt — open hat at the end
        [0.6, 0, 0.5, 0, 0.7, 0, 0.4, 0, 0.6, 0, 0.5, 0, 0.7, 0, 1, 0],
      ],
    },
  },
  {
    id: 'epic-electro',
    name: 'Epic Electro',
    vibe: 'Justice · Discovery-era Daft Punk · Madeon',
    dot: '#3868D8',
    bpm: 126,
    swing: 0,
    activeSet: {
      kick: true,
      snare: true,
      clap: true,
      hihat: true,
      wobble: true,
      lead: true,
      pad: true,
    },
    patternOverrides: {
      // Compressed kick punching through everything
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Snare on 2+4 with reverb tail
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Clap doubled on snare hits
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Hat 16ths driving
      hihat: [0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.7, 0.5],
      // Distorted square sub with wobble
      wobble: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0.7, 0],
      // Octaved square-wave riff motif
      lead: [1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.8, 0],
      // Big pad chord sustained
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      lead: [A4, 0, C5, 0, A4, 0, C5, 0, G4, 0, A4, 0, E4, 0, G4, 0],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        // A — main 4-on-floor punch
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        // B — busier with extra ghost
        [1, 0, 0, 0, 1, 0, 0.5, 0, 1, 0, 0, 0, 1, 0, 0.4, 0],
        // C — chorus drama: drop the 13
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — pickup with extra 16th
        [1, 0, 0, 0, 1, 0, 0, 0.5, 1, 0, 0, 0, 1, 0, 0, 0.5],
      ],
      snare: [
        // A — main 2+4
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        // B — busier with snare roll on 14
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0.4, 0.3, 0.4],
        // C — sparse, just on 2
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — alt with extra ghost
        [0, 0, 0.3, 0, 1, 0, 0, 0, 0, 0, 0.3, 0, 1, 0, 0, 0],
      ],
      hihat: [
        // A — driving 16ths
        [0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.7, 0.5],
        // B — busier with louder accents
        [0.6, 0.6, 0.8, 0.6, 0.6, 0.6, 1, 0.6, 0.6, 0.6, 0.8, 0.6, 0.6, 0.6, 1, 0.6],
        // C — sparse 8ths
        [0.5, 0, 0.7, 0, 0.5, 0, 0.7, 0, 0.5, 0, 0.7, 0, 0.5, 0, 0.7, 0],
        // D — alt — open on the 8 + 16
        [0.5, 0.4, 0.7, 0.4, 0.5, 0.4, 0.7, 1, 0.5, 0.4, 0.7, 0.4, 0.5, 0.4, 0.7, 1],
      ],
      lead: [
        // A — main octaved riff
        [1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.6, 0, 1, 0, 0.8, 0],
        // B — busier — extra notes
        [1, 0.4, 0.6, 0.4, 1, 0.4, 0.6, 0.4, 1, 0.4, 0.6, 0.4, 1, 0.4, 0.8, 0.4],
        // C — sparse — just on 1 + 9
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        // D — alt — held over with end fill
        [1, 0, 0, 0, 0, 0, 0.6, 0, 1, 0, 0, 0, 0.6, 0, 0.8, 0.5],
      ],
    },
  },
  {
    id: 'lofi-rooftop',
    name: 'Lofi Rooftop',
    vibe: 'Nujabes · J Dilla · study beats',
    dot: '#6A4A7A',
    bpm: 82,
    swing: 0.25, // major swing
    activeSet: {
      kick: true,
      snare: true,
      hihat: true,
      bass: true,
      rhodes: true,
      pad: true,
    },
    patternOverrides: {
      // Soft kick — like Boom Bap but quieter and swung more
      kick: [0.7, 0, 0, 0, 0, 0, 0.6, 0, 0.7, 0, 0, 0, 0, 0, 0.5, 0],
      // Brushed snare on 2+4
      snare: [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0],
      // 8th-note hat, swung
      hihat: [0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0],
      // Soft upright bass walking
      bass: [0.7, 0, 0, 0, 0.6, 0, 0, 0, 0.7, 0, 0, 0, 0.6, 0, 0, 0],
      // Lush jazz 9 chord every 4 bars
      rhodes: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Atmo pad always on
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      bass: [A2, 0, 0, 0, F3 / 2, 0, 0, 0, A2, 0, 0, 0, G3 / 2, 0, 0, 0],
      rhodes: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        // A — soft swung kick
        [0.7, 0, 0, 0, 0, 0, 0.6, 0, 0.7, 0, 0, 0, 0, 0, 0.5, 0],
        // B — busier with extra ghost
        [0.7, 0, 0.4, 0, 0, 0, 0.6, 0, 0.7, 0, 0.4, 0, 0, 0, 0.5, 0],
        // C — minimal, just 1 + 9
        [0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0],
        // D — alt with offbeat pickup
        [0.7, 0, 0, 0, 0.5, 0, 0.6, 0, 0.7, 0, 0, 0, 0, 0, 0.5, 0],
      ],
      snare: [
        // A — brushed 2+4
        [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0],
        // B — with light ghost on the 14
        [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0.3, 0],
        // C — just on 2
        [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // D — drag on 13.5
        [0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.4, 0.3, 0],
      ],
      hihat: [
        // A — main soft 8ths
        [0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0],
        // B — busier, mostly closed
        [0.5, 0.3, 0.4, 0.3, 0.5, 0.3, 0.4, 0.3, 0.5, 0.3, 0.4, 0.3, 0.5, 0.3, 0.4, 0.3],
        // C — sparse, every quarter
        [0.5, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0, 0.5, 0, 0, 0],
        // D — open hat at the end
        [0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0, 0.5, 0, 0.4, 0, 0.5, 0, 0.7, 0],
      ],
    },
  },
];

export const DEFAULT_PRESET_ID = GROOVE_PRESETS[0].id;
export const PRESET_LS_KEY = 'colourmap:groove-preset';

export function getPreset(id: string | null | undefined): GroovePreset {
  if (!id) return GROOVE_PRESETS[0];
  return GROOVE_PRESETS.find((p) => p.id === id) ?? GROOVE_PRESETS[0];
}
