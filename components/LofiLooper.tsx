'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   LOFI STUDIO — beat + bass + melody layers with effects.
   Lazy genius mode: one-tap full arrangements.
   ═══════════════════════════════════════════════════════════ */

const STEPS = 16;
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const _NOTE_FREQ: Record<string, number> = {
  C: 130.81,
  D: 146.83,
  E: 164.81,
  F: 174.61,
  G: 196.0,
  A: 220.0,
  B: 246.94,
};

// ── Drum synthesis ──
function playKick(ctx: AudioContext, t: number, v: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.15);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.3);
}
function playSnare(ctx: AudioContext, t: number, v: number) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.7;
  const n = ctx.createBufferSource();
  n.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 1200;
  n.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  n.start(t);
  n.stop(t + 0.12);
  const o = ctx.createOscillator();
  const og = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(80, t + 0.06);
  og.gain.setValueAtTime(v * 0.3, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(og);
  og.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.08);
}
function playHat(ctx: AudioContext, t: number, v: number) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.25;
  const n = ctx.createBufferSource();
  n.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 7000;
  n.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  n.start(t);
  n.stop(t + 0.04);
}
function playClap(ctx: AudioContext, t: number, v: number) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
  const n = ctx.createBufferSource();
  n.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 2500;
  n.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  n.start(t);
  n.stop(t + 0.08);
}
function playShaker(ctx: AudioContext, t: number, v: number) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
  const n = ctx.createBufferSource();
  n.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 5000;
  n.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  n.start(t);
  n.stop(t + 0.06);
}

// ── Bass synthesis — 8 types ──
interface BassType {
  id: string;
  label: string;
  color: string;
  play: (ctx: AudioContext, t: number, freq: number, v: number) => void;
}

function bassSub(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.7, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.55);
}

function bassPluck(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.2);
}

function bassSmooth(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v * 0.6, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.45);
}

function bassGrowl(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = freq;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 400;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  o.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.3);
}

function bassBounce(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq * 1.5, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.8, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.25);
}

function bassWobble(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = freq;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(200, t);
  f.frequency.linearRampToValueAtTime(800, t + 0.15);
  f.frequency.linearRampToValueAtTime(200, t + 0.3);
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.4);
}

function bassDeep(ctx: AudioContext, t: number, freq: number, v: number) {
  const o1 = ctx.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = freq;
  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = freq / 2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o1.connect(g);
  o2.connect(g);
  g.connect(ctx.destination);
  o1.start(t);
  o1.stop(t + 0.45);
  o2.start(t);
  o2.stop(t + 0.45);
}

function bassFunk(ctx: AudioContext, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'square';
  o.frequency.setValueAtTime(freq * 1.2, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 600;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  o.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + 0.22);
}

const BASS_TYPES: BassType[] = [
  { id: 'sub', label: 'Sub', color: '#5C3018', play: bassSub },
  { id: 'pluck', label: 'Pluck', color: '#7AAA58', play: bassPluck },
  { id: 'smooth', label: 'Smooth', color: '#6890B0', play: bassSmooth },
  { id: 'growl', label: 'Growl', color: '#D4805A', play: bassGrowl },
  { id: 'bounce', label: 'Bounce', color: '#C4A060', play: bassBounce },
  { id: 'wobble', label: 'Wobble', color: '#9B6BA0', play: bassWobble },
  { id: 'deep', label: 'Deep', color: '#5A8AAA', play: bassDeep },
  { id: 'funk', label: 'Funk', color: '#D06040', play: bassFunk },
];

// ── Melody synthesis ──
function playMelody(ctx: AudioContext, t: number, freq: number, v: number, instType: string) {
  const o = ctx.createOscillator();
  o.type =
    instType === 'piano'
      ? 'triangle'
      : instType === 'flute'
        ? 'sine'
        : instType === 'lead'
          ? 'sawtooth'
          : 'sine';
  o.frequency.value = freq;
  const g = ctx.createGain();
  const attack = instType === 'pad' ? 0.15 : 0.02;
  const release = instType === 'pad' ? 0.8 : instType === 'piano' ? 0.4 : 0.25;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v * 0.3, t + attack);
  g.gain.exponentialRampToValueAtTime(0.001, t + attack + release);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + attack + release + 0.05);
}

// ── Types ──
type DrumId = 'kick' | 'snare' | 'hat' | 'clap' | 'shaker';
const DRUMS: {
  id: DrumId;
  label: string;
  color: string;
  play: (ctx: AudioContext, t: number, v: number) => void;
}[] = [
  { id: 'kick', label: 'Kick', color: '#D4805A', play: playKick },
  { id: 'snare', label: 'Snare', color: '#C4A060', play: playSnare },
  { id: 'hat', label: 'Hat', color: '#88B0C8', play: playHat },
  { id: 'clap', label: 'Clap', color: '#9B6BA0', play: playClap },
  { id: 'shaker', label: 'Shaker', color: '#A0907A', play: playShaker },
];

type Layer = 'beat' | 'bass' | 'melody';

// ── Lazy Genius Arrangements ──
interface Arrangement {
  id: string;
  label: string;
  color: string;
  bpm: number;
  beat: Record<DrumId, boolean[]>;
  bass: (number | null)[];
  melody: (number | null)[];
  melodyInst: string;
}

const EMPTY_BEAT: Record<DrumId, boolean[]> = {
  kick: Array(STEPS).fill(false),
  snare: Array(STEPS).fill(false),
  hat: Array(STEPS).fill(false),
  clap: Array(STEPS).fill(false),
  shaker: Array(STEPS).fill(false),
};

const b = (s: string) => s.split('').map((c) => c === '1');

const ARRANGEMENTS: Arrangement[] = [
  {
    id: 'sunday',
    label: 'Sunday Morning',
    color: '#C4A060',
    bpm: 68,
    beat: {
      kick: b('1000000010000000'),
      snare: b('0000100000001000'),
      hat: b('0010001000100010'),
      clap: b('0000000000000000'),
      shaker: b('0000000000000000'),
    },
    bass: [
      130.81,
      null,
      null,
      null,
      130.81,
      null,
      null,
      null,
      164.81,
      null,
      null,
      null,
      196.0,
      null,
      null,
      null,
    ],
    melody: [
      523.25,
      null,
      null,
      659.25,
      null,
      null,
      587.33,
      null,
      null,
      null,
      523.25,
      null,
      null,
      null,
      null,
      null,
    ],
    melodyInst: 'piano',
  },
  {
    id: 'latenight',
    label: 'Late Night Code',
    color: '#6890B0',
    bpm: 75,
    beat: {
      kick: b('1000001010000000'),
      snare: b('0000100000001001'),
      hat: b('1010101010101010'),
      clap: b('0000000000000000'),
      shaker: b('0000000000000000'),
    },
    bass: [
      130.81,
      null,
      null,
      null,
      null,
      null,
      130.81,
      null,
      164.81,
      null,
      null,
      null,
      null,
      null,
      196.0,
      null,
    ],
    melody: [
      null,
      null,
      659.25,
      null,
      null,
      523.25,
      null,
      null,
      null,
      null,
      587.33,
      null,
      null,
      null,
      null,
      null,
    ],
    melodyInst: 'pad',
  },
  {
    id: 'coffee',
    label: 'Coffee Shop',
    color: '#D4805A',
    bpm: 80,
    beat: {
      kick: b('1000000010000010'),
      snare: b('0000100000001000'),
      hat: b('1010101010101010'),
      clap: b('0000000000000000'),
      shaker: b('0101010101010101'),
    },
    bass: [
      130.81,
      null,
      130.81,
      null,
      164.81,
      null,
      null,
      null,
      196.0,
      null,
      null,
      null,
      164.81,
      null,
      null,
      null,
    ],
    melody: [
      523.25,
      null,
      null,
      null,
      659.25,
      null,
      587.33,
      null,
      null,
      null,
      523.25,
      null,
      440.0,
      null,
      null,
      null,
    ],
    melodyInst: 'piano',
  },
  {
    id: 'rainy',
    label: 'Rainy Walk',
    color: '#5A8AAA',
    bpm: 65,
    beat: {
      kick: b('1000000010000000'),
      snare: b('0000000000001000'),
      hat: b('0000001000000010'),
      clap: b('0000000000000000'),
      shaker: b('0010001000100010'),
    },
    bass: [
      130.81,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      164.81,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    melody: [
      null,
      null,
      null,
      null,
      659.25,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      523.25,
      null,
      null,
      null,
    ],
    melodyInst: 'flute',
  },
  {
    id: 'groovy',
    label: 'Groovy Lazy',
    color: '#7AAA58',
    bpm: 72,
    beat: {
      kick: b('1000001010000100'),
      snare: b('0000100000001000'),
      hat: b('1010101010101010'),
      clap: b('0000100000001000'),
      shaker: b('0000000000000000'),
    },
    bass: [
      130.81,
      null,
      130.81,
      null,
      null,
      null,
      164.81,
      null,
      196.0,
      null,
      null,
      null,
      164.81,
      null,
      130.81,
      null,
    ],
    melody: [
      523.25,
      null,
      null,
      659.25,
      null,
      587.33,
      null,
      null,
      523.25,
      null,
      null,
      440.0,
      null,
      523.25,
      null,
      null,
    ],
    melodyInst: 'lead',
  },
  {
    id: 'deepfocus',
    label: 'Deep Focus',
    color: '#9B6BA0',
    bpm: 60,
    beat: {
      kick: b('1000000000000000'),
      snare: b('0000000010000000'),
      hat: b('0000000000000000'),
      clap: b('0000000000000000'),
      shaker: b('0000000000000000'),
    },
    bass: [
      130.81,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    melody: [
      null,
      null,
      null,
      null,
      null,
      null,
      523.25,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    melodyInst: 'pad',
  },
];

const BPM_OPTIONS = [60, 65, 70, 75, 80, 85, 90];
const MELODY_INSTRUMENTS = [
  { id: 'piano', label: 'Piano', color: '#C4A060' },
  { id: 'flute', label: 'Flute', color: '#88B0C8' },
  { id: 'lead', label: 'Lead', color: '#D4805A' },
  { id: 'pad', label: 'Pad', color: '#9B6BA0' },
];
const PALETTES: Record<string, Record<string, string>> = {
  warm: { bg: '#C4A06008', active: '#C4A060', beat: '#D4805A' },
  neon: { bg: '#6890B008', active: '#6890B0', beat: '#88B0C8' },
  forest: { bg: '#7AAA5808', active: '#7AAA58', beat: '#6B7F4E' },
  sunset: { bg: '#D0604008', active: '#D06040', beat: '#E8A878' },
};

export default function LofiLooper() {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(72);
  const [volume, setVolume] = useState(0.35);
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeLayer, setActiveLayer] = useState<Layer>('beat');
  const [palette, setPalette] = useState('warm');
  const [melodyInst, setMelodyInst] = useState('piano');
  const [bassType, setBassType] = useState('sub');

  // Beat grid
  const [beat, setBeat] = useState<Record<DrumId, boolean[]>>(() => ({
    kick: Array(STEPS).fill(false),
    snare: Array(STEPS).fill(false),
    hat: Array(STEPS).fill(false),
    clap: Array(STEPS).fill(false),
    shaker: Array(STEPS).fill(false),
  }));
  // Bass: frequency per step (null = silent)
  const [bass, setBass] = useState<(number | null)[]>(Array(STEPS).fill(null));
  // Melody: frequency per step
  const [melody, setMelody] = useState<(number | null)[]>(Array(STEPS).fill(null));
  // Layer mutes
  const [muteBeat, setMuteBeat] = useState(false);
  const [muteBass, setMuteBass] = useState(false);
  const [muteMelody, setMuteMelody] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const beatRef = useRef(beat);
  beatRef.current = beat;
  const bassRef = useRef(bass);
  bassRef.current = bass;
  const melodyRef = useRef(melody);
  melodyRef.current = melody;
  const mutesRef = useRef({ beat: muteBeat, bass: muteBass, melody: muteMelody });
  mutesRef.current = { beat: muteBeat, bass: muteBass, melody: muteMelody };
  const melodyInstRef = useRef(melodyInst);
  melodyInstRef.current = melodyInst;
  const bassTypeRef = useRef(bassType);
  bassTypeRef.current = bassType;

  const pal = PALETTES[palette] || PALETTES.warm;

  function getCtx() {
    if (!ctxRef.current) {
      const c = new AudioContext();
      if (c.state === 'suspended') c.resume();
      ctxRef.current = c;
    }
    return ctxRef.current;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx uses ref
  const tick = useCallback(() => {
    const ctx = getCtx();
    const step = stepRef.current % STEPS;
    const now = ctx.currentTime;
    const m = mutesRef.current;
    // Beat
    if (!m.beat)
      for (const drum of DRUMS) {
        if (beatRef.current[drum.id][step]) drum.play(ctx, now, volume);
      }
    // Bass
    if (!m.bass) {
      const freq = bassRef.current[step];
      if (freq) {
        const bt = BASS_TYPES.find((b) => b.id === bassTypeRef.current) || BASS_TYPES[0];
        bt.play(ctx, now, freq, volume * 0.6);
      }
    }
    // Melody
    if (!m.melody) {
      const freq = melodyRef.current[step];
      if (freq) playMelody(ctx, now, freq, volume, melodyInstRef.current);
    }
    setCurrentStep(step);
    stepRef.current++;
  }, [volume]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx uses ref
  const start = useCallback(() => {
    if (timerRef.current) return;
    getCtx();
    stepRef.current = 0;
    const ms = (60 / bpm / 4) * 1000;
    tick();
    timerRef.current = setInterval(tick, ms);
    setPlaying(true);
  }, [bpm, tick]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
    setCurrentStep(-1);
    stepRef.current = 0;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional restart on bpm
  useEffect(() => {
    if (playing) {
      stop();
      setTimeout(() => start(), 50);
    }
  }, [bpm]);
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ctxRef.current) ctxRef.current.close();
    },
    [],
  );

  function loadArrangement(arr: Arrangement) {
    setBeat({ ...arr.beat });
    setBass([...arr.bass]);
    setMelody([...arr.melody]);
    setBpm(arr.bpm);
    setMelodyInst(arr.melodyInst);
    setMuteBeat(false);
    setMuteBass(false);
    setMuteMelody(false);
  }

  function clearAll() {
    setBeat({ ...EMPTY_BEAT });
    setBass(Array(STEPS).fill(null));
    setMelody(Array(STEPS).fill(null));
  }

  function toggleBeat(drum: DrumId, step: number) {
    setBeat((prev) => ({ ...prev, [drum]: prev[drum].map((v, i) => (i === step ? !v : v)) }));
  }

  const bassNotes = [0, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94]; // null + C-B
  const melodyNotes = [
    0, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25,
  ]; // null + C4-E5

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center space-y-1">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5C3018',
          }}
        >
          Lo-fi Studio
        </p>
        <p
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            color: '#8A6A4A',
            opacity: 0.95,
          }}
        >
          tap a mood or build your own
        </p>
      </div>

      {/* ── MOODS — one-tap arrangements ── */}
      <div className="flex flex-wrap justify-center gap-1">
        {ARRANGEMENTS.map((arr) => (
          <button
            key={arr.id}
            type="button"
            onClick={() => loadArrangement(arr)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 transition-all hover:bg-[#C4A06008]"
            style={{ background: 'none', border: 'none' }}
          >
            <span
              className="block rounded-full"
              style={{ width: 8, height: 8, background: arr.color, opacity: 0.8 }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#5C3018',
                opacity: 0.7,
              }}
            >
              {arr.label}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={clearAll}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 transition-all"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="block rounded-full"
            style={{ width: 8, height: 8, background: '#8A6A4A', opacity: 0.15 }}
          />
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: '#8A6A4A',
              opacity: 0.3,
            }}
          >
            clear
          </span>
        </button>
      </div>

      {/* ── LAYER TABS ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['beat', 'bass', 'melody'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLayer(l)}
              className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: activeLayer === l ? '#5C3018' : '#8A6A4A',
                background: activeLayer === l ? '#5C301810' : 'transparent',
                border: `1px solid ${activeLayer === l ? '#5C301825' : '#C4A06010'}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
        {/* Mute toggles */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMuteBeat((s) => !s)}
            title="Mute beat"
            className="cursor-pointer rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
            style={{
              color: '#D4805A',
              opacity: muteBeat ? 0.25 : 0.8,
              background: 'none',
              border: 'none',
            }}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => setMuteBass((s) => !s)}
            title="Mute bass"
            className="cursor-pointer rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
            style={{
              color: '#7AAA58',
              opacity: muteBass ? 0.25 : 0.8,
              background: 'none',
              border: 'none',
            }}
          >
            Ba
          </button>
          <button
            type="button"
            onClick={() => setMuteMelody((s) => !s)}
            title="Mute melody"
            className="cursor-pointer rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
            style={{
              color: '#9B6BA0',
              opacity: muteMelody ? 0.25 : 0.8,
              background: 'none',
              border: 'none',
            }}
          >
            M
          </button>
        </div>
      </div>

      {/* ── BEAT GRID ── */}
      {activeLayer === 'beat' && (
        <div className="space-y-1">
          {DRUMS.map((drum) => (
            <div key={drum.id} className="flex items-center gap-1.5">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: drum.color,
                  width: 40,
                  textAlign: 'right',
                }}
              >
                {drum.label}
              </span>
              <div className="flex flex-1 gap-[2px]">
                {Array.from({ length: STEPS }, (_, s) => {
                  const on = beat[drum.id][s];
                  const cur = currentStep === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleBeat(drum.id, s)}
                      className="flex-1 cursor-pointer rounded-[3px] transition-all"
                      style={{
                        height: 22,
                        background: on
                          ? drum.color
                          : cur
                            ? `${pal.active}20`
                            : s % 4 === 0
                              ? pal.bg
                              : `${pal.bg}`,
                        opacity: on ? (cur ? 1 : 0.65) : 1,
                        border: 'none',
                        boxShadow: cur && on ? `0 0 8px ${drum.color}60` : 'none',
                        transform: cur && on ? 'scaleY(1.15)' : 'scaleY(1)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          {/* Playhead indicator */}
          <div className="flex gap-[2px]" style={{ marginLeft: 46 }}>
            {Array.from({ length: STEPS }, (_, s) => (
              <div
                key={s}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 3,
                  background: pal.active,
                  opacity: currentStep === s ? 0.8 : 0.08,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── BASS GRID ── */}
      {activeLayer === 'bass' && (
        <div className="space-y-2">
          {/* Bass type selector */}
          <div className="flex flex-wrap justify-center gap-1">
            {BASS_TYPES.map((bt) => (
              <button
                key={bt.id}
                type="button"
                onClick={() => setBassType(bt.id)}
                className="cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all"
                style={{
                  color: bassType === bt.id ? bt.color : '#8A6A4A',
                  background: bassType === bt.id ? `${bt.color}12` : 'transparent',
                  border: `1px solid ${bassType === bt.id ? `${bt.color}30` : '#C4A06010'}`,
                  opacity: bassType === bt.id ? 1 : 0.45,
                }}
              >
                {bt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '10px',
                fontWeight: 600,
                color: '#7AAA58',
                width: 40,
                textAlign: 'right',
              }}
            >
              Bass
            </span>
            <div className="flex flex-1 gap-[2px]">
              {bass.map((freq, s) => {
                const cur = currentStep === s;
                const noteIdx = freq ? bassNotes.indexOf(freq) : 0;
                const hasNote = noteIdx > 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const next = [...bass];
                      const ni = (noteIdx + 1) % bassNotes.length;
                      next[s] = ni === 0 ? null : bassNotes[ni];
                      setBass(next);
                    }}
                    className="flex-1 cursor-pointer rounded-[3px] transition-all flex items-center justify-center"
                    style={{
                      height: 28,
                      background: hasNote ? '#7AAA58' : cur ? `${pal.active}20` : pal.bg,
                      opacity: hasNote ? (cur ? 1 : 0.5 + noteIdx * 0.07) : 1,
                      border: 'none',
                      boxShadow: cur && hasNote ? '0 0 8px #7AAA5860' : 'none',
                    }}
                  >
                    {hasNote && (
                      <span style={{ fontSize: '8px', color: '#F5ECDC', fontWeight: 700 }}>
                        {NOTES[noteIdx - 1]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-[2px]" style={{ marginLeft: 46 }}>
            {Array.from({ length: STEPS }, (_, s) => (
              <div
                key={s}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 3,
                  background: '#7AAA58',
                  opacity: currentStep === s ? 0.8 : 0.08,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MELODY GRID ── */}
      {activeLayer === 'melody' && (
        <div className="space-y-2">
          {/* Instrument selector */}
          <div className="flex justify-center gap-1.5">
            {MELODY_INSTRUMENTS.map((inst) => (
              <button
                key={inst.id}
                type="button"
                onClick={() => setMelodyInst(inst.id)}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
                style={{
                  color: melodyInst === inst.id ? inst.color : '#8A6A4A',
                  background: melodyInst === inst.id ? `${inst.color}12` : 'transparent',
                  border: `1px solid ${melodyInst === inst.id ? `${inst.color}30` : '#C4A06010'}`,
                  opacity: melodyInst === inst.id ? 1 : 0.5,
                }}
              >
                {inst.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '10px',
                fontWeight: 600,
                color: '#9B6BA0',
                width: 40,
                textAlign: 'right',
              }}
            >
              Note
            </span>
            <div className="flex flex-1 gap-[2px]">
              {melody.map((freq, s) => {
                const cur = currentStep === s;
                const noteIdx = freq ? melodyNotes.indexOf(freq) : 0;
                const hasNote = noteIdx > 0;
                const instColor =
                  MELODY_INSTRUMENTS.find((i) => i.id === melodyInst)?.color || '#9B6BA0';
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const next = [...melody];
                      const ni = (noteIdx + 1) % melodyNotes.length;
                      next[s] = ni === 0 ? null : melodyNotes[ni];
                      setMelody(next);
                    }}
                    className="flex-1 cursor-pointer rounded-[3px] transition-all flex items-center justify-center"
                    style={{
                      height: 28,
                      background: hasNote ? instColor : cur ? `${pal.active}20` : pal.bg,
                      opacity: hasNote ? (cur ? 1 : 0.5 + noteIdx * 0.04) : 1,
                      border: 'none',
                      boxShadow: cur && hasNote ? `0 0 8px ${instColor}60` : 'none',
                    }}
                  >
                    {hasNote && (
                      <span style={{ fontSize: '7px', color: '#F5ECDC', fontWeight: 700 }}>
                        {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E'][noteIdx - 1]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-[2px]" style={{ marginLeft: 46 }}>
            {Array.from({ length: STEPS }, (_, s) => (
              <div
                key={s}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 3,
                  background: '#9B6BA0',
                  opacity: currentStep === s ? 0.8 : 0.08,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── TRANSPORT ── */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={playing ? stop : start}
          className="flex cursor-pointer items-center justify-center rounded-full transition-all"
          style={{
            width: 48,
            height: 48,
            background: playing ? `${pal.active}20` : `${pal.active}10`,
            border: `2px solid ${pal.active}${playing ? '60' : '30'}`,
          }}
        >
          {playing ? (
            <div className="flex gap-1">
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 16, background: pal.active }}
              />
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 16, background: pal.active }}
              />
            </div>
          ) : (
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderLeft: `14px solid ${pal.active}`,
                borderTop: '9px solid transparent',
                borderBottom: '9px solid transparent',
                marginLeft: 3,
              }}
            />
          )}
        </button>

        {/* BPM */}
        <div className="flex gap-1">
          {BPM_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBpm(b)}
              className="cursor-pointer rounded-lg px-1.5 py-0.5 transition-all"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: bpm === b ? 700 : 500,
                color: bpm === b ? '#5C3018' : '#8A6A4A',
                background: bpm === b ? '#C4A06010' : 'transparent',
                border: `1px solid ${bpm === b ? '#C4A06030' : '#C4A06008'}`,
                opacity: bpm === b ? 1 : 0.4,
              }}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Palette */}
        <div className="flex gap-1">
          {Object.entries(PALETTES).map(([id, p]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPalette(id)}
              className="cursor-pointer rounded-full transition-all"
              style={{
                width: 10,
                height: 10,
                background: p.active,
                opacity: palette === id ? 1 : 0.25,
                border: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Volume */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-1">
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: '#7A5438',
              opacity: 0.6,
            }}
          >
            volume
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: pal.active,
              fontWeight: 600,
            }}
          >
            {Math.round(volume * 100)}%
          </span>
        </div>
        <div
          className="flex gap-[2px] cursor-pointer"
          onClick={(e) => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setVolume(Math.max(0.05, (e.clientX - r.left) / r.width));
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[3px] transition-all"
              style={{
                height: 8,
                background: pal.active,
                opacity: i / 9 <= volume ? 0.3 + (i / 9) * 0.5 : 0.06,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
