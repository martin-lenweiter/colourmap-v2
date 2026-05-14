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

/** Per-voice tweaks that let each preset shape the same synth with
 *  its own timbre. All fields are optional; absent values fall back
 *  to the engine defaults so a preset without `voiceTweaks` sounds
 *  identical to a pre-tweak preset. */
export interface PresetVoiceTweaks {
  kick?: {
    /** Starting frequency of the body sweep, Hz. Default 150. */
    freqStart?: number;
    /** Ending frequency of the body sweep, Hz. Default 40. */
    freqEnd?: number;
    /** Sweep duration in seconds. Default 0.12. */
    sweepSec?: number;
    /** Body decay duration in seconds. Default 0.35. */
    decaySec?: number;
    /** Click (beater) gain. Default 0.18. Set 0 to remove the click. */
    clickGain?: number;
    /** Click high-pass cutoff Hz. Default 4000. Lower = thuddier. */
    clickHpHz?: number;
    /** Body gain at peak. Default 0.9. */
    bodyGain?: number;
  };
  snare?: {
    /** Noise high-pass cutoff Hz. Default 1200. */
    noiseHpHz?: number;
    /** Noise decay seconds. Default 0.15. */
    noiseDecaySec?: number;
    /** Tonal body start Hz. Default 220. */
    bodyFreq?: number;
    /** Body decay seconds. Default 0.1. */
    bodyDecaySec?: number;
    /** Noise gain at peak. Default 0.35. */
    noiseGain?: number;
  };
  hihat?: {
    /** High-pass cutoff Hz. Default 7000. */
    hpHz?: number;
    /** Decay seconds. Default 0.05. Higher = more "open" hat feel. */
    decaySec?: number;
    /** Gain at peak. Default 0.12. */
    gain?: number;
  };
  rhodes?: {
    /** Lowpass cutoff Hz for the rhodes tone. Default 2500. Lower
     *  = mellower / dustier; higher = brighter electric piano. */
    lpHz?: number;
    /** Decay seconds. Default 0.45. Longer = sustained pad-like
     *  rhodes; shorter = stab. */
    decaySec?: number;
    /** Peak gain. Default 0.3. */
    gain?: number;
    /** Ratio of upper-partial triangle to fundamental sine. Default
     *  3 (third octave). 1.5 = clean-mellow; 4 = bell-like. */
    overtoneRatio?: number;
  };
  bass?: {
    /** Oscillator type. Default 'sawtooth'. */
    oscType?: OscillatorType;
    /** Filter starting cutoff Hz. Default 1200. */
    lpStartHz?: number;
    /** Filter ending cutoff Hz. Default 300. */
    lpEndHz?: number;
    /** Filter sweep duration seconds. Default 0.15. */
    sweepSec?: number;
    /** Filter resonance. Default 4. Higher = squelchier acid. */
    lpQ?: number;
    /** Peak gain. Default 0.55. */
    gain?: number;
    /** Decay seconds. Default 0.2. */
    decaySec?: number;
  };
  pad?: {
    /** Oscillator type. Default 'sawtooth'. 'sine' = pure clean
     *  drone; 'triangle' = soft warm; 'sawtooth' = full string-like;
     *  'square' = retro arcade pad. */
    oscType?: OscillatorType;
    /** Detune ratio between the two unison oscillators. Default
     *  1.005 — small chorus. Higher = wider, almost out of tune. */
    detune?: number;
    /** Lowpass cutoff Hz. Default 1800. Lower = darker / dustier. */
    lpHz?: number;
    /** Lowpass resonance. Default 1. Higher = ringy synth feel. */
    lpQ?: number;
    /** Peak gain. Default 0.12. */
    gain?: number;
    /** Fade-in seconds. Default 1.5. */
    fadeInSec?: number;
    /** Sustain duration before fade-out, seconds. Default 2.3
     *  (fadeIn 1.5 + sustain 2.3 = total 3.8). */
    sustainSec?: number;
  };
}

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
  /** Per-voice timbre tweaks (kick/snare/hihat envelopes + filters)
   *  so the same synth speaks differently per preset. Partial — any
   *  field can be omitted to fall back to engine defaults. */
  voiceTweaks?: PresetVoiceTweaks;
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
    id: 'desert-pulse',
    name: 'Desert Pulse',
    vibe: 'open-air melodic house - warm arps, patient bass, wide pads',
    dot: '#4F83A6',
    bpm: 122,
    swing: 0.035,
    voiceTweaks: {
      kick: {
        freqStart: 185,
        freqEnd: 48,
        sweepSec: 0.09,
        decaySec: 0.28,
        clickGain: 0.16,
        clickHpHz: 4600,
        bodyGain: 0.9,
      },
      hihat: { hpHz: 8200, decaySec: 0.065, gain: 0.095 },
      bass: {
        oscType: 'sawtooth',
        lpStartHz: 1050,
        lpEndHz: 260,
        lpQ: 5.5,
        gain: 0.48,
        decaySec: 0.24,
      },
      pad: {
        oscType: 'sawtooth',
        detune: 1.007,
        lpHz: 1350,
        lpQ: 1.2,
        gain: 0.105,
        fadeInSec: 1.8,
        sustainSec: 3.1,
      },
      rhodes: { lpHz: 1900, decaySec: 0.75, gain: 0.22, overtoneRatio: 2 },
    },
    activeSet: {
      kick: true,
      hihat: true,
      perc: true,
      bass: true,
      rhodes: true,
      arp: true,
      pad: true,
    },
    patternOverrides: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0, 0.5, 0, 0.72, 0, 0.45, 0, 0.82, 0, 0.5, 0, 0.72, 0, 0.45, 0, 0.9],
      perc: [0, 0, 0.34, 0, 0, 0.18, 0, 0.46, 0, 0, 0.3, 0, 0, 0.22, 0, 0.52],
      bass: [1, 0, 0, 0.42, 0, 0, 0.55, 0, 0.82, 0, 0, 0.32, 0, 0.62, 0, 0],
      rhodes: [0.45, 0, 0, 0, 0, 0, 0.36, 0, 0.42, 0, 0, 0, 0, 0, 0.34, 0],
      arp: [0.42, 0, 0.58, 0, 0, 0.7, 0, 0.36, 0.48, 0, 0.62, 0, 0, 0.78, 0, 0.5],
      pad: [0.7, 0, 0, 0, 0, 0, 0, 0, 0.62, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      bass: [A2, E3, G3, D3, A2, C3, E3, G3],
      rhodes: [A3, C4, E4, G4, D4, E4, C4, A3],
      arp: [A3, C4, E4, G4, A4, G4, E4, C4],
      pad: [A3, E3, G3, C4],
    },
    variationPools: {
      kick: [
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0.22, 1, 0, 0, 0, 1, 0, 0.25, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.2, 0, 1, 0, 0.32, 0],
      ],
      hihat: [
        [0, 0.5, 0, 0.72, 0, 0.45, 0, 0.82, 0, 0.5, 0, 0.72, 0, 0.45, 0, 0.9],
        [0.22, 0.55, 0, 0.78, 0.18, 0.5, 0, 0.86, 0.22, 0.55, 0, 0.78, 0.18, 0.5, 0, 0.94],
        [0, 0.42, 0, 0, 0, 0.38, 0, 0.62, 0, 0.42, 0, 0, 0, 0.38, 0, 0.72],
        [0, 0.45, 0.25, 0.64, 0, 0.48, 0, 0.78, 0, 0.45, 0.25, 0.64, 0, 0.48, 0, 0.86],
      ],
      bass: [
        [1, 0, 0, 0.42, 0, 0, 0.55, 0, 0.82, 0, 0, 0.32, 0, 0.62, 0, 0],
        [1, 0, 0, 0.48, 0, 0.28, 0.58, 0, 0.84, 0, 0, 0.35, 0, 0.68, 0.3, 0],
        [1, 0, 0, 0, 0, 0, 0.42, 0, 0.78, 0, 0, 0, 0, 0.42, 0, 0],
        [1, 0, 0.24, 0.42, 0, 0, 0.5, 0, 0.82, 0, 0.24, 0.32, 0, 0.62, 0, 0],
      ],
      arp: [
        [0.42, 0, 0.58, 0, 0, 0.7, 0, 0.36, 0.48, 0, 0.62, 0, 0, 0.78, 0, 0.5],
        [0.48, 0, 0.64, 0, 0.34, 0.76, 0, 0.42, 0.52, 0, 0.68, 0, 0.36, 0.84, 0, 0.56],
        [0.32, 0, 0, 0, 0, 0.48, 0, 0, 0.36, 0, 0, 0, 0, 0.5, 0, 0],
        [0.42, 0, 0.58, 0.24, 0, 0.7, 0, 0.36, 0.48, 0, 0.62, 0.24, 0, 0.78, 0, 0.5],
      ],
      pad: [
        [0.7, 0, 0, 0, 0, 0, 0, 0, 0.62, 0, 0, 0, 0, 0, 0, 0],
        [0.75, 0, 0, 0, 0, 0, 0, 0.38, 0.65, 0, 0, 0, 0, 0, 0, 0.34],
        [0.55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0.68, 0, 0, 0, 0, 0.32, 0, 0, 0.62, 0, 0, 0, 0, 0.32, 0, 0],
      ],
    },
  },
  {
    id: 'sun-up-funk',
    name: 'Sun-up Funk',
    vibe: 'Daft Punk · Jamiroquai · golden hour',
    dot: '#C4A060',
    bpm: 112,
    swing: 0.17,
    voiceTweaks: {
      kick: { freqStart: 160, freqEnd: 45, bodyGain: 0.95 },
      snare: { bodyFreq: 230, noiseHpHz: 1400 },
      hihat: { hpHz: 7500, gain: 0.13 },
      // Funk pad — warm sawtooth bed with subtle chorus.
      pad: { oscType: 'sawtooth', detune: 1.006, lpHz: 1800, gain: 0.13 },
      // Funk bass — bouncy sawtooth with classic Moog-style cutoff.
      bass: { oscType: 'sawtooth', lpStartHz: 1500, lpEndHz: 350, lpQ: 5, gain: 0.6 },
    },
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
    voiceTweaks: {
      // Punchy, short, mechanical — fast attack and crisp click.
      kick: {
        freqStart: 200,
        freqEnd: 50,
        sweepSec: 0.08,
        decaySec: 0.22,
        clickGain: 0.25,
        clickHpHz: 5000,
      },
      snare: { noiseHpHz: 2000, noiseDecaySec: 0.08, bodyFreq: 240 },
      hihat: { hpHz: 9000, decaySec: 0.04, gain: 0.1 },
      // Tech pad — clinical square wave, narrow chorus, brighter
      // filter so it sits over the 4-on-floor without warming it.
      pad: {
        oscType: 'square',
        detune: 1.003,
        lpHz: 2400,
        gain: 0.09,
        fadeInSec: 1.0,
      },
      // Tech bass note — Tech House preset uses subpulse not bass,
      // but if bass is enabled it should be the squelchy acid kind.
      bass: { oscType: 'square', lpStartHz: 1800, lpEndHz: 400, lpQ: 8, gain: 0.5 },
    },
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
    voiceTweaks: {
      // Light, bright — kick is more rim than thump, snare papery.
      kick: { freqStart: 130, freqEnd: 55, bodyGain: 0.7, clickGain: 0.1 },
      snare: { noiseHpHz: 1500, noiseGain: 0.28, bodyFreq: 250 },
      hihat: { hpHz: 6500, gain: 0.1 },
      // Tropical pad — clean triangle bed, soft and bright. The
      // low resonance keeps the steel-drum world airy.
      pad: { oscType: 'triangle', detune: 1.008, lpHz: 2200, gain: 0.11 },
      // Tropical bass — soft triangle, light and warm, no acid.
      bass: { oscType: 'triangle', lpStartHz: 800, lpEndHz: 250, lpQ: 1.5, gain: 0.5 },
    },
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
    voiceTweaks: {
      // Long-tail deep kick + thicker snare body — warm and patient.
      kick: {
        freqStart: 120,
        freqEnd: 35,
        sweepSec: 0.18,
        decaySec: 0.5,
        bodyGain: 1.0,
        clickGain: 0.1,
      },
      snare: { noiseHpHz: 1000, noiseDecaySec: 0.2, bodyFreq: 200 },
      hihat: { decaySec: 0.07 },
      // Slow Roll pad — wide, dark, slow-fade. Cinematic.
      pad: {
        oscType: 'sawtooth',
        detune: 1.012,
        lpHz: 1300,
        gain: 0.16,
        fadeInSec: 2.5,
        sustainSec: 3.5,
      },
      // Slow Roll bass — heavy, sustained, deep cinematic low end.
      bass: {
        oscType: 'sawtooth',
        lpStartHz: 700,
        lpEndHz: 180,
        sweepSec: 0.3,
        lpQ: 3,
        gain: 0.7,
        decaySec: 0.45,
      },
      // Slow Roll rhodes — wide cinematic chord, long sustain, bright.
      rhodes: { lpHz: 3200, decaySec: 0.85, gain: 0.32, overtoneRatio: 3 },
    },
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
    voiceTweaks: {
      // Dusty, lo-fi'd kick (bigger noise click, lower hp) + tight
      // crackly snare. Hat sits dirty and short.
      kick: {
        freqStart: 110,
        freqEnd: 38,
        decaySec: 0.3,
        clickGain: 0.3,
        clickHpHz: 3000,
      },
      snare: { noiseHpHz: 900, bodyFreq: 200, noiseGain: 0.4 },
      hihat: { hpHz: 6000, decaySec: 0.04 },
      // Boom Bap pad — dusty, narrow, low — sits behind the rhodes
      // chord without competing.
      pad: { oscType: 'triangle', detune: 1.002, lpHz: 900, gain: 0.1 },
      // Boom Bap bass — round 808-style sub, no acid, very dark.
      bass: {
        oscType: 'sine',
        lpStartHz: 600,
        lpEndHz: 180,
        lpQ: 2,
        gain: 0.65,
        decaySec: 0.32,
      },
      // Boom Bap rhodes — dusty stab, muffled tone, short decay.
      rhodes: { lpHz: 1600, decaySec: 0.35, gain: 0.28, overtoneRatio: 2 },
    },
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
    voiceTweaks: {
      // Big, room-filling kick (wider sweep) + bright snare + sizzly
      // hat. The "festival mainroom" weight without going dirty.
      kick: {
        freqStart: 180,
        freqEnd: 38,
        sweepSec: 0.15,
        bodyGain: 1.0,
        clickGain: 0.25,
      },
      snare: { noiseHpHz: 1800, noiseGain: 0.42, bodyFreq: 240 },
      hihat: { hpHz: 9500, gain: 0.14 },
      // Epic pad — wide, ringy, festival-stack. Higher resonance
      // so the chord rings; bigger fade so it carries.
      pad: {
        oscType: 'sawtooth',
        detune: 1.015,
        lpHz: 2800,
        lpQ: 4,
        gain: 0.16,
        fadeInSec: 1.2,
      },
      // Epic bass — big square wobble bass, opens up, ringy.
      bass: {
        oscType: 'square',
        lpStartHz: 2000,
        lpEndHz: 500,
        sweepSec: 0.2,
        lpQ: 6,
        gain: 0.65,
        decaySec: 0.28,
      },
    },
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
    voiceTweaks: {
      // Muffled slow kick (no click attack, low body), dampened
      // snare, dusty short hat. The "tape passed through three
      // generations" feel.
      kick: {
        freqStart: 110,
        freqEnd: 50,
        sweepSec: 0.18,
        decaySec: 0.4,
        clickGain: 0.05,
        clickHpHz: 2500,
        bodyGain: 0.75,
      },
      snare: { noiseHpHz: 800, noiseDecaySec: 0.18, bodyFreq: 200, noiseGain: 0.3 },
      hihat: { hpHz: 5500, decaySec: 0.06, gain: 0.1 },
      // Lofi pad — muffled triangle, very low cutoff, slow swell.
      // Tape-saturated feel — no sparkle, all warmth.
      pad: {
        oscType: 'triangle',
        detune: 1.004,
        lpHz: 800,
        gain: 0.13,
        fadeInSec: 2.2,
        sustainSec: 3.0,
      },
      // Lofi bass — soft upright-ish triangle, very dark, low Q.
      bass: {
        oscType: 'triangle',
        lpStartHz: 500,
        lpEndHz: 200,
        sweepSec: 0.25,
        lpQ: 1,
        gain: 0.5,
        decaySec: 0.3,
      },
      // Lofi rhodes — warm tape-saturated chord, mellow + sustained.
      rhodes: { lpHz: 1400, decaySec: 0.7, gain: 0.3, overtoneRatio: 2 },
    },
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
  {
    id: 'afrobeats',
    name: 'Afrobeats',
    vibe: 'Burna Boy · Mr Eazi · West-African syncopation',
    dot: '#D4884A',
    bpm: 102,
    swing: 0.05,
    voiceTweaks: {
      kick: { freqStart: 130, freqEnd: 45, sweepSec: 0.1, decaySec: 0.25, clickGain: 0.1 },
      snare: { noiseHpHz: 1400, bodyFreq: 230 },
      bass: { oscType: 'triangle', lpStartHz: 900, lpEndHz: 280, lpQ: 2.5, gain: 0.55 },
      pad: { oscType: 'triangle', detune: 1.006, lpHz: 1800, gain: 0.1, fadeInSec: 1.5 },
    },
    activeSet: { kick: true, snare: true, perc: true, bass: true, guitar: true },
    patternOverrides: {
      kick: [1, 0, 0, 0, 0.4, 0, 1, 0, 0.5, 0, 0.3, 0, 0, 0, 0.7, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0.3, 0, 0, 0, 0, 1, 0, 0.3, 0],
      perc: [0.7, 0, 0.5, 0.8, 0, 0.6, 0.8, 0, 0.7, 0, 0.5, 0.8, 0, 0.6, 0.8, 0],
      bass: [1, 0, 0, 0.5, 0, 0.8, 0, 0.4, 1, 0, 0, 0.5, 0, 0.7, 0, 0],
      guitar: [0, 0, 1, 0, 0, 0, 0.7, 0, 0, 0, 1, 0, 0, 0, 0.7, 0],
    },
    notesOverrides: {
      bass: [A2, A2, A2, G3 / 2, A2, E3, A2, D3, A2, A2, A2, G3 / 2, A2, C3, A2, A2],
      guitar: [0, 0, E3, 0, 0, 0, A3, 0, 0, 0, E3, 0, 0, 0, G3, 0],
    },
    variationPools: {
      kick: [
        [1, 0, 0, 0, 0.4, 0, 1, 0, 0.5, 0, 0.3, 0, 0, 0, 0.7, 0],
        [1, 0, 0.3, 0, 0.4, 0, 1, 0, 0.5, 0, 0.3, 0, 0.3, 0, 0.7, 0],
        [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0.7, 0],
        [1, 0, 0, 0, 0.6, 0, 0, 0, 0.5, 0, 0.4, 0, 0, 0, 0.8, 0],
      ],
      perc: [
        [0.7, 0, 0.5, 0.8, 0, 0.6, 0.8, 0, 0.7, 0, 0.5, 0.8, 0, 0.6, 0.8, 0],
        [0.8, 0, 0.6, 1, 0, 0.7, 1, 0, 0.8, 0, 0.6, 1, 0, 0.7, 1, 0],
        [0.6, 0, 0, 0.7, 0, 0.5, 0.7, 0, 0.6, 0, 0, 0.7, 0, 0.5, 0.7, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    },
  },
  {
    id: 'deep-chill',
    name: 'Deep Chill',
    vibe: 'Flume · Cashmere Cat · future bass warmth',
    dot: '#7AACC0',
    bpm: 88,
    swing: 0.03,
    voiceTweaks: {
      kick: { freqStart: 120, freqEnd: 40, sweepSec: 0.12, decaySec: 0.28, clickGain: 0.08 },
      hihat: { hpHz: 8000, decaySec: 0.045, gain: 0.09 },
      pad: {
        oscType: 'sawtooth',
        detune: 1.008,
        lpHz: 1600,
        gain: 0.13,
        fadeInSec: 2.0,
        sustainSec: 3.0,
      },
    },
    activeSet: { kick: true, hihat: true, subpulse: true, arp: true, pad: true },
    patternOverrides: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 0.4, 0, 0],
      hihat: [0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3],
      subpulse: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      arp: [1, 0, 0.7, 0, 1, 0, 0.7, 0, 1, 0, 0.8, 0.5, 1, 0, 0.7, 0.5],
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      subpulse: [A2 / 2, 0, 0, 0, 0, 0, 0, 0, A2 / 2, 0, 0, 0, 0, 0, 0, 0],
      arp: [A4, 0, C5, 0, E4, 0, G4, 0, A4, 0, C5, G4, E4, 0, A4, G4],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 0.4, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0.6, 0, 0.4, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0.4, 0, 0, 0, 0, 0.6, 0, 0, 0, 0.4, 0, 0, 0],
      ],
      arp: [
        [1, 0, 0.7, 0, 1, 0, 0.7, 0, 1, 0, 0.8, 0.5, 1, 0, 0.7, 0.5],
        [1, 0.5, 0.7, 0.5, 1, 0.5, 0.7, 0.5, 1, 0.5, 0.8, 0.5, 1, 0.5, 0.7, 0.5],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    },
  },
  {
    id: 'drum-and-bass',
    name: 'Drum & Bass',
    vibe: 'Goldie · Pendulum · liquid D&B rolls',
    dot: '#5040A0',
    bpm: 170,
    swing: 0,
    voiceTweaks: {
      kick: { freqStart: 160, freqEnd: 45, sweepSec: 0.06, decaySec: 0.18, clickGain: 0.2 },
      snare: { noiseHpHz: 2200, noiseDecaySec: 0.1, bodyFreq: 260, noiseGain: 0.45 },
      hihat: { hpHz: 9500, decaySec: 0.03, gain: 0.08 },
      bass: {
        oscType: 'sawtooth',
        lpStartHz: 800,
        lpEndHz: 200,
        lpQ: 3,
        gain: 0.6,
        decaySec: 0.25,
      },
      pad: {
        oscType: 'sawtooth',
        detune: 1.01,
        lpHz: 1200,
        gain: 0.1,
        fadeInSec: 1.8,
        sustainSec: 2.5,
      },
    },
    activeSet: { kick: true, snare: true, hihat: true, bass: true, pad: true },
    patternOverrides: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.7, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0.5, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0.5, 0],
      bass: [1, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0],
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      bass: [A2, 0, 0, 0, 0, 0, 0, 0, G3 / 2, 0, 0, 0, 0, 0, 0, 0],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.7, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0.5, 0, 1, 0, 0.7, 0, 0, 0, 0.5, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 0],
        [1, 0.4, 0, 0, 0, 0, 0, 0, 1, 0, 0.7, 0, 0.4, 0, 0, 0],
      ],
      snare: [
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.4, 0],
        [0, 0, 0, 0, 1, 0, 0.3, 0, 0, 0, 0, 0, 1, 0, 0.5, 0.3],
        [0, 0, 0, 0, 1, 0, 0, 0, 0.4, 0, 0, 0, 1, 0, 0, 0],
      ],
    },
  },
  {
    id: 'jazz-groove',
    name: 'Jazz Groove',
    vibe: 'Ahmad Jamal · McCoy Tyner · NYC underground jazz',
    dot: '#8A6A30',
    bpm: 95,
    swing: 0.22,
    voiceTweaks: {
      kick: {
        freqStart: 100,
        freqEnd: 40,
        sweepSec: 0.15,
        decaySec: 0.3,
        clickGain: 0.08,
        bodyGain: 0.7,
      },
      snare: { noiseHpHz: 900, noiseDecaySec: 0.2, bodyFreq: 200, noiseGain: 0.3 },
      hihat: { hpHz: 6000, decaySec: 0.07, gain: 0.1 },
      bass: {
        oscType: 'triangle',
        lpStartHz: 600,
        lpEndHz: 200,
        lpQ: 1.5,
        gain: 0.6,
        decaySec: 0.35,
      },
      rhodes: { lpHz: 2000, decaySec: 0.6, gain: 0.35, overtoneRatio: 3 },
    },
    activeSet: { kick: true, snare: true, hihat: true, bass: true, rhodes: true },
    patternOverrides: {
      kick: [1, 0, 0, 0, 0, 0.4, 0, 0, 0.6, 0, 0, 0, 0, 0, 0.4, 0],
      snare: [0, 0, 0, 0, 0.8, 0, 0, 0.3, 0, 0, 0, 0, 0.8, 0, 0, 0.3],
      hihat: [0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0],
      bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      rhodes: [0, 0, 0, 0.8, 0, 0.6, 0, 0, 0, 0, 0, 0.8, 0, 0.6, 0, 0],
    },
    notesOverrides: {
      bass: [A2, 0, 0, 0, C3, 0, 0, 0, E3, 0, 0, 0, G3 / 2, 0, 0, 0],
      rhodes: [0, 0, 0, A3, 0, E4, 0, 0, 0, 0, 0, A3, 0, C4, 0, 0],
    },
    variationPools: {
      kick: [
        [1, 0, 0, 0, 0, 0.4, 0, 0, 0.6, 0, 0, 0, 0, 0, 0.4, 0],
        [1, 0, 0, 0, 0, 0.4, 0, 0, 0.6, 0, 0.3, 0, 0, 0, 0.4, 0.3],
        [1, 0, 0, 0, 0, 0, 0, 0, 0.6, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0.3, 0, 0, 0.4, 0, 0.3, 0.6, 0, 0, 0, 0.4, 0, 0.4, 0],
      ],
      hihat: [
        [0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0],
        [0.6, 0.3, 0.5, 0.3, 0.6, 0.3, 0.5, 0.3, 0.6, 0.3, 0.5, 0.3, 0.6, 0.3, 0.5, 0.3],
        [0.6, 0, 0, 0, 0.6, 0, 0, 0, 0.6, 0, 0, 0, 0.6, 0, 0, 0],
        [0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 0.5, 0, 0.6, 0, 1, 0],
      ],
    },
  },
  {
    id: 'trap-soul',
    name: 'Trap Soul',
    vibe: 'Summer Walker · SZA · atmospheric R&B trap',
    dot: '#8050A0',
    bpm: 65,
    swing: 0.04,
    voiceTweaks: {
      kick: {
        freqStart: 140,
        freqEnd: 38,
        sweepSec: 0.15,
        decaySec: 0.4,
        clickGain: 0.05,
        bodyGain: 1.1,
      },
      hihat: { hpHz: 8500, decaySec: 0.035, gain: 0.09 },
      pad: {
        oscType: 'sawtooth',
        detune: 1.012,
        lpHz: 1200,
        gain: 0.14,
        fadeInSec: 2.5,
        sustainSec: 4.0,
      },
      rhodes: { lpHz: 1800, decaySec: 0.8, gain: 0.28, overtoneRatio: 2 },
    },
    activeSet: { kick: true, hihat: true, subpulse: true, rhodes: true, pad: true },
    patternOverrides: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      hihat: [0.4, 0.7, 0.4, 0, 0.4, 0.7, 0.4, 0.8, 0.4, 0.7, 0.4, 0, 0.4, 0.7, 0.4, 1],
      subpulse: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      rhodes: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      pad: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    notesOverrides: {
      subpulse: [A2 / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      rhodes: [0, 0, 0, 0, A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, E4, 0],
      pad: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    variationPools: {
      kick: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      hihat: [
        [0.4, 0.7, 0.4, 0, 0.4, 0.7, 0.4, 0.8, 0.4, 0.7, 0.4, 0, 0.4, 0.7, 0.4, 1],
        [0.4, 0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 0.8, 0.4, 0.7, 0.4, 0.7, 0.4, 0.7, 0.4, 1],
        [0.4, 0, 0.4, 0, 0.4, 0, 0.4, 0.8, 0.4, 0, 0.4, 0, 0.4, 0, 0.4, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
