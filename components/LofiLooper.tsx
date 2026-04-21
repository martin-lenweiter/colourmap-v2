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

const STORAGE_KEY = 'colourmap:lofi-patterns';

// ── Drum synthesis ──
function playKick(ctx: AudioContext, dest: AudioNode, t: number, v: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.15);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.3);
}
function playSnare(ctx: AudioContext, dest: AudioNode, t: number, v: number) {
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
  g.connect(dest);
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
  og.connect(dest);
  o.start(t);
  o.stop(t + 0.08);
}
function playHat(ctx: AudioContext, dest: AudioNode, t: number, v: number) {
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
  g.connect(dest);
  n.start(t);
  n.stop(t + 0.04);
}
function playClap(ctx: AudioContext, dest: AudioNode, t: number, v: number) {
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
  g.connect(dest);
  n.start(t);
  n.stop(t + 0.08);
}
function playShaker(ctx: AudioContext, dest: AudioNode, t: number, v: number) {
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
  g.connect(dest);
  n.start(t);
  n.stop(t + 0.06);
}

// ── Bass synthesis — 8 types ──
interface BassType {
  id: string;
  label: string;
  color: string;
  play: (ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) => void;
}

function bassSub(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.7, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.55);
}

function bassPluck(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.2);
}

function bassSmooth(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v * 0.6, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.45);
}

function bassGrowl(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
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
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.3);
}

function bassBounce(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq * 1.5, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.8, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  o.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.25);
}

function bassWobble(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
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
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.4);
}

function bassTape(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  // Slight pitch drift: random detune +/- 5 cents each note
  o.detune.value = (Math.random() - 0.5) * 10;
  o.frequency.value = freq;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(v * 0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o.connect(f);
  f.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + 0.45);
}

function bassFunk(ctx: AudioContext, dest: AudioNode, t: number, freq: number, v: number) {
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
  g.connect(dest);
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
  { id: 'tape', label: 'Tape', color: '#5A8AAA', play: bassTape },
  { id: 'funk', label: 'Funk', color: '#D06040', play: bassFunk },
];

// ── Melody synthesis ──
function playMelody(
  ctx: AudioContext,
  dest: AudioNode,
  t: number,
  freq: number,
  v: number,
  instType: string,
) {
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
  g.connect(dest);
  o.start(t);
  o.stop(t + attack + release + 0.05);
}

// ── Types ──
type DrumId = 'kick' | 'snare' | 'hat' | 'clap' | 'shaker';
const DRUMS: {
  id: DrumId;
  label: string;
  color: string;
  play: (ctx: AudioContext, dest: AudioNode, t: number, v: number) => void;
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
  // ── 6 new presets ──
  {
    id: 'midnight',
    label: 'Midnight Drive',
    color: '#3A5A8A',
    bpm: 70,
    beat: {
      kick: b('1000100010001000'),
      snare: b('0000100000001000'),
      hat: b('1010101010101010'),
      clap: b('0000000000000000'),
      shaker: b('0000000000000000'),
    },
    bass: [
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
      130.81,
      null,
      null,
      null,
    ],
    melody: [
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
      440.0,
      null,
      null,
      null,
      null,
      null,
    ],
    melodyInst: 'pad',
  },
  {
    id: 'garden',
    label: 'Garden Party',
    color: '#8ABB68',
    bpm: 80,
    beat: {
      kick: b('1000000010000000'),
      snare: b('0000000000000000'),
      hat: b('0000000000000000'),
      clap: b('0000000000000000'),
      shaker: b('1111111111111111'),
    },
    bass: [
      130.81,
      null,
      null,
      164.81,
      null,
      null,
      196.0,
      null,
      130.81,
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
      null,
      587.33,
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
    id: 'tokyo',
    label: 'Tokyo Subway',
    color: '#B06080',
    bpm: 75,
    beat: {
      kick: b('0000000000000000'),
      snare: b('0000000000000000'),
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
      659.25,
      null,
      null,
      null,
      523.25,
      null,
      null,
      null,
      null,
      null,
      440.0,
      null,
      null,
      null,
    ],
    melodyInst: 'lead',
  },
  {
    id: 'vinyl',
    label: 'Vinyl Sunset',
    color: '#D08050',
    bpm: 65,
    beat: {
      kick: b('1000000010000000'),
      snare: b('0000100000001000'),
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
      523.25,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      440.0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    melodyInst: 'piano',
  },
  {
    id: 'storm',
    label: 'Storm Brewing',
    color: '#6A6A8A',
    bpm: 60,
    beat: {
      kick: b('1000100100001000'),
      snare: b('0000000000000000'),
      hat: b('0000000000000000'),
      clap: b('0000000010000000'),
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
      null,
      null,
      null,
      null,
      164.81,
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
    ],
    melodyInst: 'pad',
  },
  {
    id: 'blanket',
    label: 'Warm Blanket',
    color: '#C09060',
    bpm: 55,
    beat: {
      kick: b('1000000010000000'),
      snare: b('0000000000000000'),
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
      523.25,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      440.0,
      null,
      null,
      null,
    ],
    melodyInst: 'pad',
  },
];

const BPM_OPTIONS = [55, 60, 65, 70, 75, 80, 85, 90];
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

// ── Melody notes: C3-B4 (2 octaves, 14 notes) ──
const melodyNotes = [
  0, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0,
  440.0, 493.88,
]; // null + C3-B4
const melodyLabels = [
  'B4',
  'A4',
  'G4',
  'F4',
  'E4',
  'D4',
  'C4',
  'B3',
  'A3',
  'G3',
  'F3',
  'E3',
  'D3',
  'C3',
];

// ── Generate reverb impulse response ──
function createReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const length = ctx.sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return impulse;
}

// ── Saved state shape ──
interface SavedState {
  beat: Record<DrumId, boolean[]>;
  bass: (number | null)[];
  melody: (number | null)[];
  bpm: number;
  activePreset: string | null;
  swing: number;
  filterCutoff: number;
  reverbMix: number;
  bassType: string;
  melodyInst: string;
  volume: number;
  muteBeat: boolean;
  muteBass: boolean;
  muteMelody: boolean;
}

function loadSavedState(): Partial<SavedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SavedState>;
  } catch {
    return null;
  }
}

export default function LofiLooper() {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(72);
  const [volume, setVolume] = useState(0.35);
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeLayer, setActiveLayer] = useState<Layer>('beat');
  const [palette, setPalette] = useState('warm');
  const [melodyInst, setMelodyInst] = useState('piano');
  const [bassType, setBassType] = useState('sub');
  const [swing, setSwing] = useState(50); // 50-75, 50 = no swing
  const [filterCutoff, setFilterCutoff] = useState(5000); // 200-8000 Hz
  const [reverbMix, setReverbMix] = useState(0.15); // 0-1
  const [activePreset, setActivePreset] = useState<string | null>(null);

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
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
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
  const swingRef = useRef(swing);
  swingRef.current = swing;

  // Master effects chain refs
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);

  const pal = PALETTES[palette] || PALETTES.warm;

  // ── Load saved state on mount ──
  useEffect(() => {
    const saved = loadSavedState();
    if (!saved) return;
    if (saved.beat) setBeat(saved.beat);
    if (saved.bass) setBass(saved.bass);
    if (saved.melody) setMelody(saved.melody);
    if (saved.bpm) setBpm(saved.bpm);
    if (saved.activePreset !== undefined) setActivePreset(saved.activePreset);
    if (saved.swing !== undefined) setSwing(saved.swing);
    if (saved.filterCutoff !== undefined) setFilterCutoff(saved.filterCutoff);
    if (saved.reverbMix !== undefined) setReverbMix(saved.reverbMix);
    if (saved.bassType) setBassType(saved.bassType);
    if (saved.melodyInst) setMelodyInst(saved.melodyInst);
    if (saved.volume !== undefined) setVolume(saved.volume);
    if (saved.muteBeat !== undefined) setMuteBeat(saved.muteBeat);
    if (saved.muteBass !== undefined) setMuteBass(saved.muteBass);
    if (saved.muteMelody !== undefined) setMuteMelody(saved.muteMelody);
  }, []);

  // ── Save state on any change ──
  useEffect(() => {
    const state: SavedState = {
      beat,
      bass,
      melody,
      bpm,
      activePreset,
      swing,
      filterCutoff,
      reverbMix,
      bassType,
      melodyInst,
      volume,
      muteBeat,
      muteBass,
      muteMelody,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [
    beat,
    bass,
    melody,
    bpm,
    activePreset,
    swing,
    filterCutoff,
    reverbMix,
    bassType,
    melodyInst,
    volume,
    muteBeat,
    muteBass,
    muteMelody,
  ]);

  function getCtx() {
    if (!ctxRef.current) {
      const c = new AudioContext();
      if (c.state === 'suspended') c.resume();
      ctxRef.current = c;
    }
    return ctxRef.current;
  }

  function ensureEffectsChain(ctx: AudioContext) {
    if (masterGainRef.current) return masterGainRef.current;

    // Chain: instruments -> masterGain -> filter -> split(dry/wet) -> destination
    const masterGain = ctx.createGain();
    masterGainRef.current = masterGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterCutoff;
    filter.Q.value = 0.7;
    filterNodeRef.current = filter;

    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulse(ctx, 2.5, 3);
    convolverRef.current = convolver;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 1 - reverbMix;
    dryGainRef.current = dryGain;

    const wetGain = ctx.createGain();
    wetGain.gain.value = reverbMix;
    wetGainRef.current = wetGain;

    masterGain.connect(filter);
    filter.connect(dryGain);
    filter.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);

    return masterGain;
  }

  // Update filter cutoff in real-time
  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.frequency.value = filterCutoff;
    }
  }, [filterCutoff]);

  // Update reverb mix in real-time
  useEffect(() => {
    if (dryGainRef.current) dryGainRef.current.gain.value = 1 - reverbMix;
    if (wetGainRef.current) wetGainRef.current.gain.value = reverbMix;
  }, [reverbMix]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx and ensureEffectsChain use refs
  const scheduleLoop = useCallback(() => {
    const ctx = getCtx();
    const dest = ensureEffectsChain(ctx);
    const stepDuration = (60 / bpm / 4) * 1000; // ms per 16th step
    const swingAmount = swingRef.current;

    // Clear any previous timers
    for (const t of timerRef.current) clearTimeout(t);
    timerRef.current = [];

    stepRef.current = 0;

    function scheduleStep(stepIndex: number, baseTime: number) {
      // Swing: offset odd steps
      let offset = 0;
      if (stepIndex % 2 === 1) {
        offset = ((swingAmount - 50) / 50) * stepDuration * 0.5;
      }
      const delayMs = baseTime + offset;

      const timerId = setTimeout(() => {
        const step = stepIndex % STEPS;
        const now = ctx.currentTime;
        const m = mutesRef.current;

        // Beat
        if (!m.beat) {
          for (const drum of DRUMS) {
            if (beatRef.current[drum.id][step]) drum.play(ctx, dest, now, volume);
          }
        }
        // Bass
        if (!m.bass) {
          const freq = bassRef.current[step];
          if (freq) {
            const bt = BASS_TYPES.find((bt) => bt.id === bassTypeRef.current) || BASS_TYPES[0];
            bt.play(ctx, dest, now, freq, volume * 0.6);
          }
        }
        // Melody
        if (!m.melody) {
          const freq = melodyRef.current[step];
          if (freq) playMelody(ctx, dest, now, freq, volume, melodyInstRef.current);
        }
        setCurrentStep(step);
      }, delayMs);

      timerRef.current.push(timerId);
    }

    // Schedule all steps for one full loop, then repeat
    function scheduleFullLoop(loopStartMs: number) {
      for (let i = 0; i < STEPS; i++) {
        const baseTime = loopStartMs + i * stepDuration;
        scheduleStep(i, baseTime);
      }
      // Schedule the next loop
      const loopDuration = STEPS * stepDuration;
      const nextLoopTimer = setTimeout(() => {
        scheduleFullLoop(0);
      }, loopStartMs + loopDuration);
      timerRef.current.push(nextLoopTimer);
    }

    scheduleFullLoop(0);
    setPlaying(true);
  }, [bpm, volume]);

  const stop = useCallback(() => {
    for (const t of timerRef.current) clearTimeout(t);
    timerRef.current = [];
    setPlaying(false);
    setCurrentStep(-1);
    stepRef.current = 0;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional restart on bpm/swing
  useEffect(() => {
    if (playing) {
      stop();
      setTimeout(() => scheduleLoop(), 50);
    }
  }, [bpm]);

  useEffect(
    () => () => {
      for (const t of timerRef.current) clearTimeout(t);
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
    setActivePreset(arr.id);
    setMuteBeat(false);
    setMuteBass(false);
    setMuteMelody(false);
  }

  function clearAll() {
    setBeat({ ...EMPTY_BEAT });
    setBass(Array(STEPS).fill(null));
    setMelody(Array(STEPS).fill(null));
    setActivePreset(null);
  }

  function toggleBeat(drum: DrumId, step: number) {
    setBeat((prev) => ({ ...prev, [drum]: prev[drum].map((v, i) => (i === step ? !v : v)) }));
    setActivePreset(null);
  }

  const bassNotes = [0, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94]; // null + C-B

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
            style={{
              background: activePreset === arr.id ? `${arr.color}15` : 'none',
              border:
                activePreset === arr.id ? `1px solid ${arr.color}30` : '1px solid transparent',
            }}
          >
            <span
              className="block rounded-full"
              style={{
                width: 8,
                height: 8,
                background: arr.color,
                opacity: activePreset === arr.id ? 1 : 0.8,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#5C3018',
                opacity: activePreset === arr.id ? 1 : 0.7,
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
          style={{ background: 'none', border: '1px solid transparent' }}
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

      {/* ── BASS PIANO ROLL ── */}
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
          {/* Piano roll — notes on Y, steps on X */}
          <div className="space-y-0">
            {[...bassNotes]
              .reverse()
              .filter((f) => f > 0)
              .map((noteFreq) => {
                const noteIdx = bassNotes.indexOf(noteFreq);
                const noteName = NOTES[noteIdx - 1];
                return (
                  <div key={noteFreq} className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#7AAA58',
                        width: 16,
                        textAlign: 'right',
                        opacity: 0.7,
                      }}
                    >
                      {noteName}
                    </span>
                    <div className="flex flex-1 gap-[1px]">
                      {Array.from({ length: STEPS }, (_, s) => {
                        const isOn = bass[s] === noteFreq;
                        const cur = currentStep === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              const next = [...bass];
                              next[s] = isOn ? null : noteFreq;
                              setBass(next);
                              setActivePreset(null);
                            }}
                            className="flex-1 cursor-pointer rounded-[2px] transition-all"
                            style={{
                              height: 14,
                              background: isOn
                                ? '#7AAA58'
                                : cur
                                  ? `${pal.active}15`
                                  : s % 4 === 0
                                    ? '#C4A06008'
                                    : 'transparent',
                              opacity: isOn ? (cur ? 1 : 0.65) : 1,
                              border: 'none',
                              boxShadow: cur && isOn ? '0 0 6px #7AAA5850' : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="flex gap-[1px]" style={{ marginLeft: 20 }}>
            {Array.from({ length: STEPS }, (_, s) => (
              <div
                key={s}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 3,
                  background: '#7AAA58',
                  opacity: currentStep === s ? 0.8 : 0.06,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MELODY PIANO ROLL ── */}
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
          {/* Piano roll — 14 notes (C3-B4) on Y, steps on X */}
          {(() => {
            const instColor =
              MELODY_INSTRUMENTS.find((i) => i.id === melodyInst)?.color || '#9B6BA0';
            const reversedNotes = [...melodyNotes].slice(1).reverse();
            return (
              <div className="space-y-0">
                {reversedNotes.map((noteFreq, ri) => (
                  <div key={noteFreq} className="flex items-center gap-1">
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '8px',
                        fontWeight: 600,
                        color: instColor,
                        width: 20,
                        textAlign: 'right',
                        opacity: 0.6,
                      }}
                    >
                      {melodyLabels[ri]}
                    </span>
                    <div className="flex flex-1 gap-[1px]">
                      {Array.from({ length: STEPS }, (_, s) => {
                        const isOn = melody[s] === noteFreq;
                        const cur = currentStep === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              const next = [...melody];
                              next[s] = isOn ? null : noteFreq;
                              setMelody(next);
                              setActivePreset(null);
                            }}
                            className="flex-1 cursor-pointer rounded-[2px] transition-all"
                            style={{
                              height: 12,
                              background: isOn
                                ? instColor
                                : cur
                                  ? `${pal.active}15`
                                  : s % 4 === 0
                                    ? '#C4A06008'
                                    : 'transparent',
                              opacity: isOn ? (cur ? 1 : 0.6) : 1,
                              border: 'none',
                              boxShadow: cur && isOn ? `0 0 6px ${instColor}50` : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          <div className="flex gap-[1px]" style={{ marginLeft: 24 }}>
            {Array.from({ length: STEPS }, (_, s) => (
              <div
                key={s}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 3,
                  background:
                    MELODY_INSTRUMENTS.find((i) => i.id === melodyInst)?.color || '#9B6BA0',
                  opacity: currentStep === s ? 0.8 : 0.06,
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
          onClick={playing ? stop : scheduleLoop}
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
          {BPM_OPTIONS.map((bpmOpt) => (
            <button
              key={bpmOpt}
              type="button"
              onClick={() => setBpm(bpmOpt)}
              className="cursor-pointer rounded-lg px-1.5 py-0.5 transition-all"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: bpm === bpmOpt ? 700 : 500,
                color: bpm === bpmOpt ? '#5C3018' : '#8A6A4A',
                background: bpm === bpmOpt ? '#C4A06010' : 'transparent',
                border: `1px solid ${bpm === bpmOpt ? '#C4A06030' : '#C4A06008'}`,
                opacity: bpm === bpmOpt ? 1 : 0.4,
              }}
            >
              {bpmOpt}
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

      {/* Swing */}
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
            swing
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: pal.active,
              fontWeight: 600,
            }}
          >
            {swing}%
          </span>
        </div>
        <div
          className="flex gap-[2px] cursor-pointer"
          onClick={(e) => {
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const pct = (e.clientX - r.left) / r.width;
            setSwing(Math.round(50 + pct * 25));
          }}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const segmentVal = 50 + (i / 9) * 25;
            return (
              <div
                key={i}
                className="flex-1 rounded-[3px] transition-all"
                style={{
                  height: 8,
                  background: pal.active,
                  opacity: segmentVal <= swing ? 0.3 + (i / 9) * 0.5 : 0.06,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Master Effects ── */}
      <div className="px-4 space-y-2">
        {/* Filter */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                color: '#7A5438',
                opacity: 0.6,
              }}
            >
              filter
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                color: pal.active,
                fontWeight: 600,
              }}
            >
              {filterCutoff >= 1000 ? `${(filterCutoff / 1000).toFixed(1)}k` : filterCutoff} Hz
            </span>
          </div>
          <div
            className="flex gap-[2px] cursor-pointer"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
              // Logarithmic scale: 200-8000 Hz
              const freq = Math.round(200 * (8000 / 200) ** pct);
              setFilterCutoff(Math.max(200, Math.min(8000, freq)));
            }}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const segmentFreq = 200 * (8000 / 200) ** (i / 9);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-[3px] transition-all"
                  style={{
                    height: 8,
                    background: '#88B0C8',
                    opacity: segmentFreq <= filterCutoff ? 0.3 + (i / 9) * 0.5 : 0.06,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Reverb */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                color: '#7A5438',
                opacity: 0.6,
              }}
            >
              reverb
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                color: pal.active,
                fontWeight: 600,
              }}
            >
              {Math.round(reverbMix * 100)}%
            </span>
          </div>
          <div
            className="flex gap-[2px] cursor-pointer"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
              setReverbMix(Math.round(pct * 100) / 100);
            }}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-[3px] transition-all"
                style={{
                  height: 8,
                  background: '#9B6BA0',
                  opacity: i / 9 <= reverbMix ? 0.3 + (i / 9) * 0.5 : 0.06,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
