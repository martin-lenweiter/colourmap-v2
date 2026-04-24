'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   GROOVE MACHINE — collective-ready groove box.
   References: Jamiroquai · Kalkbrenner · The Blaze · Lenny
   Kravitz · Nicolas Jaar. Mix of tech/electro, tropical house,
   rock with a real feel, and deliberate simplicity.
   Silences / breakdowns are first-class (dedicated buttons).
   State is Record<trackId, boolean> — trivial to sync across
   phones in a shared session later.
   ═══════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// Tracks
// ─────────────────────────────────────────────────────────────

type TrackId =
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

type Group = 'drums' | 'bass' | 'keys' | 'lead' | 'pads';

interface Track {
  id: TrackId;
  label: string;
  group: Group;
  color: string;
  // 16th-note pattern across 1 bar (16 steps). 0 = silent, 1 = hit,
  // 0.6 = accent-ish (ghost). For pitched tracks, see NOTE_LINES.
  pattern: number[];
  // Optional pitch cycle for melodic tracks (A minor pentatonic root 110 Hz)
  notes?: number[];
}

// A minor pentatonic + natural minor hybrid. Root = A2 (110 Hz).
// Frequencies in Hz. The bass line follows a Jamiroquai-flavoured
// 16th-note funk shape: lots of ghost notes, the root on the 1, the
// minor 7th on the offbeat push.
const A2 = 110;
const C3 = 130.81;
const D3 = 146.83;
const E3 = 164.81;
const G3 = 196;
const A3 = 220;
const C4 = 261.63;
const E4 = 329.63;
const G4 = 392;
const A4 = 440;

const TRACKS: Track[] = [
  // DRUMS — ghost notes, Nujabes-flavoured syncopation, not boring
  {
    id: 'kick',
    label: 'Kick',
    group: 'drums',
    color: '#D4805A',
    // Hip-hop / half-time flavour: 1 and 3 heavy, ghost on the &a of 3
    pattern: [1, 0, 0, 0, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 0, 0.4, 0],
  },
  {
    id: 'snare',
    label: 'Snare',
    group: 'drums',
    color: '#C44E2A',
    // Backbeat on 2 & 4, ghost on the 13.5 for life
    pattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.35, 0],
  },
  {
    id: 'clap',
    label: 'Clap',
    group: 'drums',
    color: '#E08858',
    // Layered clap on 2 & 4 for big sound; opt-in
    pattern: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
  {
    id: 'hihat',
    label: 'Hi-hat',
    group: 'drums',
    color: '#C4A060',
    // Swung 16ths with occasional open (velocity 1.0 ≈ open)
    pattern: [0.45, 0.3, 0.7, 0.3, 0.45, 0.3, 1, 0.3, 0.45, 0.3, 0.7, 0.3, 0.45, 0.3, 1, 0.5],
  },
  {
    id: 'perc',
    label: 'Perc',
    group: 'drums',
    color: '#8A6A4A',
    // Clave / shaker cross-rhythm — gives a Latin tech-house ride
    pattern: [0, 0, 0, 1, 0.4, 0, 1, 0, 0, 0, 1, 0, 0.4, 0, 1, 0],
  },
  // BASS
  {
    id: 'bass',
    label: 'Funk Bass',
    group: 'bass',
    color: '#5C3018',
    pattern: [1, 0, 0, 0.6, 0, 1, 0, 0.5, 1, 0, 0, 0, 1, 0, 0.7, 0.5],
    notes: [A2, A2, A2, C3, A2, E3, A2, A2, A2, A2, A2, A2, G3 / 2, G3 / 2, A2, D3],
  },
  {
    id: 'subpulse',
    label: 'Sub Pulse',
    group: 'bass',
    color: '#3A2A1E',
    pattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    notes: [A2 / 2, 0, 0, 0, 0, 0, 0, 0, A2 / 2, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'wobble',
    label: 'Wobble Bass',
    group: 'bass',
    color: '#2E1F54',
    // Dubstep-style half-time wobble — long notes on beats 1 and 3
    pattern: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.6, 0],
    notes: [A2, 0, 0, 0, 0, 0, 0, 0, G3 / 2, 0, 0, 0, 0, 0, D3, 0],
  },
  // KEYS
  {
    id: 'rhodes',
    label: 'Rhodes Stab',
    group: 'keys',
    color: '#7A4A5F',
    pattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    notes: [0, 0, A3, 0, 0, 0, C4, 0, 0, 0, E4, 0, 0, 0, A4, 0],
  },
  {
    id: 'guitar',
    label: 'Wah Guitar',
    group: 'keys',
    color: '#B8843A',
    pattern: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    notes: [0, E3, 0, E3, 0, G3, 0, G3, 0, E3, 0, E3, 0, A3, 0, A3],
  },
  {
    id: 'pluck',
    label: 'Tropical Pluck',
    group: 'keys',
    color: '#88C878',
    pattern: [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    notes: [A4, 0, 0, E4, G4, 0, E4, 0, A4, 0, 0, 0, G4, 0, E4, 0],
  },
  {
    id: 'arp',
    label: 'Ratatat Arp',
    group: 'keys',
    color: '#5A8AAA',
    // Fast 16th arpeggio — Ratatat-ish melodic electric
    pattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    notes: [A3, C4, E4, G4, A4, G4, E4, C4, A3, C4, E4, G4, A4, E4, C4, E4],
  },
  // LEAD
  {
    id: 'lead',
    label: 'Lead Motif',
    group: 'lead',
    color: '#6890B0',
    pattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    notes: [A4, 0, 0, 0, 0, 0, C4 * 2, 0, 0, 0, E4, 0, 0, 0, 0, 0],
  },
  {
    id: 'chop',
    label: 'Vocal Chop',
    group: 'lead',
    color: '#B08AA0',
    // Nujabes / Gramatik-style vocal stab — sparse, in pocket
    pattern: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    notes: [0, 0, 0, 0, 0, 0, 0, E4, 0, 0, 0, 0, 0, 0, 0, G4],
  },
  // PADS
  {
    id: 'pad',
    label: 'Atmo Pad',
    group: 'pads',
    color: '#9B6BA0',
    pattern: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    notes: [A3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

const GROUPS: { id: Group; label: string; accent: string }[] = [
  { id: 'drums', label: 'Drums', accent: '#D4805A' },
  { id: 'bass', label: 'Bass', accent: '#5C3018' },
  { id: 'keys', label: 'Keys', accent: '#B8843A' },
  { id: 'lead', label: 'Lead', accent: '#6890B0' },
  { id: 'pads', label: 'Pads', accent: '#9B6BA0' },
];

// ─────────────────────────────────────────────────────────────
// Synth voices — raw Web Audio. No sample files needed.
// Each voice is a short burst triggered at a specific time and
// frequency. Lifecycle is self-contained (source + envelope stop
// after the note decays, auto-disconnect via onended).
// ─────────────────────────────────────────────────────────────

type Voice = (ctx: AudioContext, when: number, velocity: number, noteFreq?: number) => void;

function triggerKick(ctx: AudioContext, when: number, vel: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.12);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.9 * vel, when + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.4);
}

function triggerSnare(ctx: AudioContext, when: number, vel: number) {
  // Noise + tonal body
  const bufSize = ctx.sampleRate * 0.2;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1200;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35 * vel, when);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.15);
  noise.connect(hp);
  hp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(when);
  noise.stop(when + 0.2);

  // Tonal body
  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(220, when);
  body.frequency.exponentialRampToValueAtTime(180, when + 0.08);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.25 * vel, when);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.1);
  body.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  body.start(when);
  body.stop(when + 0.15);
}

function triggerHihat(ctx: AudioContext, when: number, vel: number) {
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.12 * vel, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  noise.connect(hp);
  hp.connect(g);
  g.connect(ctx.destination);
  noise.start(when);
  noise.stop(when + 0.08);
}

function triggerPerc(ctx: AudioContext, when: number, vel: number) {
  // Short shaker: noise burst with bandpass
  const bufSize = ctx.sampleRate * 0.08;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 4500;
  bp.Q.value = 3;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.08 * vel, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(when);
  src.stop(when + 0.1);
}

function triggerBass(ctx: AudioContext, when: number, vel: number, freq: number) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, when);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1200, when);
  lp.frequency.exponentialRampToValueAtTime(300, when + 0.15);
  lp.Q.value = 4;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.55 * vel, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.2);
  osc.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.25);
}

function triggerSubPulse(ctx: AudioContext, when: number, vel: number, freq: number) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.4 * vel, when + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 1.8);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 2);
}

function triggerRhodes(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Rhodes: sine + triangle fifth, short attack, medium decay
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freq;
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = freq * 3;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.3 * vel, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.45);
  osc1.connect(lp);
  osc2.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc1.start(when);
  osc2.start(when);
  osc1.stop(when + 0.5);
  osc2.stop(when + 0.5);
}

function triggerGuitar(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Wah guitar chop: sawtooth + bandpass filter sweep
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(800, when);
  bp.frequency.linearRampToValueAtTime(2500, when + 0.08);
  bp.Q.value = 6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.22 * vel, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
  osc.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.2);
}

function triggerPluck(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Tropical pluck: triangle wave with quick filtered attack
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(4000, when);
  lp.frequency.exponentialRampToValueAtTime(500, when + 0.25);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.3 * vel, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.3);
  osc.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.32);
}

function triggerLead(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Lead: square w/ filter envelope — simple emotional line à la The Blaze
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = freq;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3000;
  lp.Q.value = 2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.18 * vel, when + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.5);
  osc.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.55);
}

function triggerPad(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Long sustained pad — slow fade in and out
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.value = freq;
  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.value = freq * 1.005; // slight detune for chorus
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1800;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(0.12 * vel, when + 1.5);
  g.gain.linearRampToValueAtTime(0.0001, when + 3.8);
  osc1.connect(lp);
  osc2.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc1.start(when);
  osc2.start(when);
  osc1.stop(when + 4);
  osc2.stop(when + 4);
}

function triggerClap(ctx: AudioContext, when: number, vel: number) {
  // Layered noise bursts with gaps simulating hand clap smear
  const bufSize = ctx.sampleRate * 0.18;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    // 3 quick bursts
    const t = i / ctx.sampleRate;
    let env = 0;
    if (t < 0.015) env = 1 - t / 0.015;
    else if (t > 0.02 && t < 0.035) env = 1 - (t - 0.02) / 0.015;
    else if (t > 0.04 && t < 0.12) env = Math.exp(-(t - 0.04) * 25);
    data[i] = (Math.random() * 2 - 1) * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400;
  bp.Q.value = 2;
  const g = ctx.createGain();
  g.gain.value = 0.32 * vel;
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(when);
  src.stop(when + 0.2);
}

function triggerWobble(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Dubstep wobble bass: saw + square through a filter that wobbles
  // on an LFO for the note duration (1 bar ≈ 2s at 115 bpm half-time).
  const dur = 1.7;
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.value = freq;
  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.value = freq * 0.5; // octave down
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 14;
  // Wobble: LFO on the filter cutoff (4x per bar)
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 4; // 4 wobbles per second ~ 8 per bar at this tempo
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 400;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  lp.frequency.value = 600;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.45 * vel, when + 0.02);
  g.gain.setValueAtTime(0.45 * vel, when + dur - 0.1);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc1.connect(lp);
  osc2.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc1.start(when);
  osc2.start(when);
  lfo.start(when);
  osc1.stop(when + dur);
  osc2.stop(when + dur);
  lfo.stop(when + dur);
}

function triggerArp(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Ratatat-style short bright arpeggio note — square wave + filter
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = freq;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3200;
  lp.Q.value = 3;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.14 * vel, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
  osc.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.15);
}

// White-noise riser played once when a DROP begins. 2 bars at 115 bpm
// ≈ 4.2s. Rises in pitch and volume to create anticipation, then cuts
// so the slam-back feels big.
function triggerRiser(ctx: AudioContext, when: number, durationSec: number) {
  const bufSize = Math.floor(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 6;
  // Sweep from 400Hz to 8kHz across the duration
  bp.frequency.setValueAtTime(400, when);
  bp.frequency.exponentialRampToValueAtTime(8000, when + durationSec - 0.1);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(0.3, when + durationSec - 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, when + durationSec);
  src.connect(bp);
  bp.connect(g);
  g.connect(ctx.destination);
  src.start(when);
  src.stop(when + durationSec);
}

function triggerChop(ctx: AudioContext, when: number, vel: number, freq: number) {
  // Short "ah" vocal chop — multi-partial periodic wave + vowel formant
  const osc = ctx.createOscillator();
  const real = new Float32Array([0, 1, 0.6, 0.4, 0.25, 0.15]);
  const imag = new Float32Array(real.length);
  const wave = ctx.createPeriodicWave(real, imag);
  osc.setPeriodicWave(wave);
  osc.frequency.value = freq;
  const formant = ctx.createBiquadFilter();
  formant.type = 'bandpass';
  formant.frequency.value = 900;
  formant.Q.value = 3;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.2 * vel, when + 0.02);
  g.gain.setValueAtTime(0.2 * vel, when + 0.14);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.25);
  osc.connect(formant);
  formant.connect(g);
  g.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.3);
}

const VOICES: Record<TrackId, Voice> = {
  kick: triggerKick,
  snare: triggerSnare,
  clap: triggerClap,
  hihat: triggerHihat,
  perc: triggerPerc,
  bass: (ctx, when, vel, f) => triggerBass(ctx, when, vel, f ?? A2),
  subpulse: (ctx, when, vel, f) => triggerSubPulse(ctx, when, vel, f ?? A2 / 2),
  wobble: (ctx, when, vel, f) => triggerWobble(ctx, when, vel, f ?? A2),
  rhodes: (ctx, when, vel, f) => triggerRhodes(ctx, when, vel, f ?? A3),
  guitar: (ctx, when, vel, f) => triggerGuitar(ctx, when, vel, f ?? E3),
  pluck: (ctx, when, vel, f) => triggerPluck(ctx, when, vel, f ?? A4),
  arp: (ctx, when, vel, f) => triggerArp(ctx, when, vel, f ?? A4),
  lead: (ctx, when, vel, f) => triggerLead(ctx, when, vel, f ?? A4),
  chop: (ctx, when, vel, f) => triggerChop(ctx, when, vel, f ?? A4),
  pad: (ctx, when, vel, f) => triggerPad(ctx, when, vel, f ?? A3),
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const DEFAULT_ACTIVE: Record<TrackId, boolean> = {
  kick: true,
  snare: true,
  clap: false,
  hihat: true,
  perc: false,
  bass: true,
  subpulse: false,
  wobble: false,
  rhodes: false,
  guitar: false,
  pluck: false,
  arp: false,
  lead: false,
  chop: false,
  pad: true,
};

type Mode = 'full' | 'drop' | 'breakdown' | 'silence';

export default function GrooveMachine() {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(115);
  const [active, setActive] = useState<Record<TrackId, boolean>>(DEFAULT_ACTIVE);
  const [mode, setMode] = useState<Mode>('full');
  const [openGroups, setOpenGroups] = useState<Record<Group, boolean>>({
    drums: true,
    bass: true,
    keys: true,
    lead: false,
    pads: false,
  });
  const [step, setStep] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextStepRef = useRef(0);
  const nextTimeRef = useRef(0);
  const modeRef = useRef(mode);
  const activeRef = useRef(active);
  const bpmRef = useRef(bpm);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const scheduleNextNotes = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const secondsPerSixteenth = 60 / bpmRef.current / 4;
    // Swing: offbeat 16ths sit ~17% late. Gives the grid breath.
    const SWING_AMOUNT = 0.17;
    const lookahead = 0.1;
    while (nextTimeRef.current < ctx.currentTime + lookahead) {
      const totalStep = nextStepRef.current;
      const stepIdx = totalStep % 16;
      const bar = Math.floor(totalStep / 16);
      // On bar 4 of every 4-bar cycle: a drum fill at steps 14-15 —
      // adds life without needing a second pattern.
      const isLastBarOfCycle = bar % 4 === 3;
      const isFillWindow = isLastBarOfCycle && stepIdx >= 14;
      const currentMode = modeRef.current;
      const currentActive = activeRef.current;
      // Swung timing: offbeat 16ths (odd step index) pushed later.
      const swingOffset = stepIdx % 2 === 1 ? secondsPerSixteenth * SWING_AMOUNT : 0;
      const when = nextTimeRef.current + swingOffset;

      for (const track of TRACKS) {
        let allowed = currentActive[track.id];
        if (currentMode === 'breakdown') {
          allowed = track.id === 'bass' || track.id === 'pad';
        } else if (currentMode === 'silence') {
          allowed = track.id === 'pad';
        } else if (currentMode === 'drop') {
          // DROP: drums muted during the riser — bass + pad keep a
          // bed under the tension, everything else silent except the
          // pad and wobble.
          if (track.group === 'drums') allowed = false;
        }
        if (!allowed) continue;
        let vel = track.pattern[stepIdx];
        // Fill bar: add extra snare + kick hits on 14-15 to sell the
        // approach to the downbeat.
        if (isFillWindow && currentMode === 'full') {
          if (track.id === 'snare' && (stepIdx === 14 || stepIdx === 15)) vel = 0.85;
          if (track.id === 'kick' && stepIdx === 15) vel = 0.7;
        }
        if (!vel) continue;
        const freq = track.notes?.[stepIdx] ?? undefined;
        if (freq === 0) continue;
        VOICES[track.id](ctx, when, vel, freq);
      }
      nextTimeRef.current += secondsPerSixteenth;
      nextStepRef.current++;
      setStep(stepIdx);
    }
  }, []);

  const startAudio = useCallback(() => {
    // biome-ignore lint/suspicious/noExplicitAny: webkit AudioContext
    const Ctor: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!ctxRef.current) ctxRef.current = new Ctor();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') void ctx.resume();
    nextStepRef.current = 0;
    nextTimeRef.current = ctx.currentTime + 0.05;
    setStep(0);
    scheduleNextNotes();
    timerRef.current = setInterval(scheduleNextNotes, 25);
    setPlaying(true);
  }, [scheduleNextNotes]);

  const stopAudio = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setStep(0);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  function toggleTrack(id: TrackId) {
    setActive((prev) => ({ ...prev, [id]: !prev[id] }));
    if (mode !== 'full') setMode('full'); // any manual tweak returns to full
  }

  function toggleGroup(g: Group) {
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  }

  function runDrop() {
    const ctx = ctxRef.current;
    const twoBarsSec = (60 / bpmRef.current) * 4 * 2;
    setMode('drop');
    // Schedule a 2-bar noise riser from now. The drums stay muted
    // (mode 'drop') while this rises, building tension; at the end
    // we snap back to 'full' and the first beat after slams.
    if (ctx) {
      const now = ctx.currentTime + 0.05;
      triggerRiser(ctx, now, twoBarsSec);
    }
    setTimeout(() => setMode('full'), (twoBarsSec * 1000) | 0);
  }

  function randomizeGroove() {
    // Keep anchors on: kick, bass, pad. Randomize everything else.
    const ANCHORS: TrackId[] = ['kick', 'bass', 'pad'];
    const next: Record<TrackId, boolean> = { ...DEFAULT_ACTIVE };
    for (const id of Object.keys(next) as TrackId[]) {
      if (ANCHORS.includes(id)) {
        next[id] = true;
      } else {
        // 35% chance for each non-anchor — gives a coherent sparse mix
        next[id] = Math.random() < 0.35;
      }
    }
    setActive(next);
    if (mode !== 'full') setMode('full');
  }

  const activeCount = Object.values(active).filter(Boolean).length;
  const totalTracks = TRACKS.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5C3018',
          }}
        >
          Groove Machine
        </p>
        <p
          className="mt-1 px-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            fontStyle: 'italic',
            color: '#8A6A4A',
            opacity: 0.8,
          }}
        >
          tech · tropical · rock · simplicity · silences matter
        </p>
      </div>

      {/* Desktop DJ layout: 2 columns on md+. Phone: stacked. */}
      <div className="space-y-5 md:grid md:grid-cols-[1fr_320px] md:gap-8 md:space-y-0">
        {/* LEFT — track channel strips */}
        <div className="space-y-3">
          {GROUPS.map((grp) => {
            const tracksInGroup = TRACKS.filter((t) => t.group === grp.id);
            const groupActiveCount = tracksInGroup.filter((t) => active[t.id]).length;
            const isOpen = openGroups[grp.id];
            return (
              <div
                key={grp.id}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: `${grp.accent}30` }}
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(grp.id)}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 transition-all"
                  style={{
                    background: `${grp.accent}10`,
                    border: 'none',
                  }}
                >
                  <span
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: grp.accent,
                    }}
                  >
                    {grp.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      color: grp.accent,
                      opacity: 0.7,
                    }}
                  >
                    {groupActiveCount}/{tracksInGroup.length} · {isOpen ? '▾' : '▸'}
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-1.5 bg-transparent px-3 py-2 animate-in fade-in duration-150">
                    {tracksInGroup.map((t) => {
                      const on = active[t.id];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTrack(t.id)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                          style={{
                            background: on ? `${t.color}1E` : 'transparent',
                            border: `1px solid ${on ? `${t.color}60` : `${t.color}20`}`,
                          }}
                          aria-pressed={on}
                        >
                          <span
                            className="block shrink-0 rounded-full"
                            style={{
                              width: 12,
                              height: 12,
                              background: on ? t.color : 'transparent',
                              border: `2px solid ${t.color}`,
                            }}
                          />
                          <span
                            className="flex-1 text-left"
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '14px',
                              fontWeight: on ? 700 : 500,
                              color: on ? t.color : '#5C3018',
                              opacity: on ? 1 : 0.75,
                            }}
                          >
                            {t.label}
                          </span>
                          {/* 16-step mini-sequencer view — shows when this track fires */}
                          <div className="hidden md:flex gap-[2px]">
                            {t.pattern.map((v, i) => (
                              <span
                                key={i}
                                className="block rounded-sm"
                                style={{
                                  width: 4,
                                  height: v > 0 ? 10 : 4,
                                  background: t.color,
                                  opacity:
                                    playing && step === i && on ? 1 : v > 0 && on ? 0.5 : 0.15,
                                  transition: 'opacity 60ms',
                                }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT — transport + actions + vibe meter */}
        <div className="space-y-4">
          {/* Transport */}
          <div
            className="rounded-2xl border px-5 py-5"
            style={{
              background: '#EEDFC4',
              borderColor: '#C4A06040',
            }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => (playing ? stopAudio() : startAudio())}
                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full transition-all"
                style={{
                  background: playing ? '#5C3018' : '#C4A060',
                  border: 'none',
                }}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <div className="flex gap-1">
                    <span className="block h-5 w-1.5 rounded-sm bg-[#F3E8D2]" />
                    <span className="block h-5 w-1.5 rounded-sm bg-[#F3E8D2]" />
                  </div>
                ) : (
                  <span
                    className="block"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '14px solid #F3E8D2',
                      borderTop: '9px solid transparent',
                      borderBottom: '9px solid transparent',
                      marginLeft: 3,
                    }}
                  />
                )}
              </button>
              <div className="text-right">
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#8A6A4A',
                  }}
                >
                  Tempo
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#5C3018',
                  }}
                >
                  {bpm}
                  <span style={{ fontSize: '13px', opacity: 0.65, marginLeft: 4 }}>bpm</span>
                </p>
              </div>
            </div>
            {/* Tempo slider */}
            <input
              type="range"
              min={80}
              max={140}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="mt-4 w-full cursor-pointer"
              aria-label="Tempo"
            />
          </div>

          {/* Mode / action buttons */}
          <div
            className="rounded-2xl border px-4 py-4"
            style={{ background: '#F3E8D2', borderColor: '#C4A06030' }}
          >
            <p
              className="mb-3 text-center uppercase"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: '#8A6A4A',
              }}
            >
              Dynamics
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label="Full"
                active={mode === 'full'}
                color="#C4A060"
                onClick={() => setMode('full')}
              />
              <ActionButton
                label="Breakdown"
                active={mode === 'breakdown'}
                color="#9B6BA0"
                onClick={() => setMode('breakdown')}
              />
              <ActionButton
                label="Drop"
                active={mode === 'drop'}
                color="#D4805A"
                onClick={runDrop}
              />
              <ActionButton
                label="Silence"
                active={mode === 'silence'}
                color="#7A5A40"
                onClick={() => setMode('silence')}
              />
            </div>
            {/* Randomize — keeps kick + bass + pad, rolls the rest.
                Fastest way to find a new vibe you didn't know you wanted. */}
            <button
              type="button"
              onClick={randomizeGroove}
              className="mt-3 w-full cursor-pointer rounded-xl py-2.5 transition-all hover:opacity-85"
              style={{
                background: 'transparent',
                border: '1.5px dashed #C4A06060',
                color: '#8A6A4A',
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontStyle: 'italic',
              }}
            >
              ✦ new groove
            </button>
          </div>

          {/* Vibe meter */}
          <div
            className="rounded-2xl border px-4 py-4"
            style={{ background: '#F3E8D2', borderColor: '#C4A06030' }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  color: '#8A6A4A',
                }}
              >
                Vibe
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  color: '#5C3018',
                  fontWeight: 600,
                }}
              >
                {activeCount}/{totalTracks}
              </span>
            </div>
            <div className="flex gap-[3px]">
              {TRACKS.map((t, i) => (
                <span
                  key={t.id}
                  className="flex-1 rounded-full"
                  style={{
                    height: 8,
                    background: active[t.id] ? t.color : '#C4A06020',
                    opacity: active[t.id] ? (playing ? 1 : 0.75) : 0.4,
                    transition: 'opacity 120ms',
                  }}
                  title={`${t.label} ${active[t.id] ? 'on' : 'off'}`}
                  data-step={step === i ? '1' : '0'}
                />
              ))}
            </div>
            <p
              className="mt-3 italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                color: '#8A6A4A',
                opacity: 0.7,
                textAlign: 'center',
              }}
            >
              {mode === 'silence'
                ? 'silence — let it breathe'
                : mode === 'breakdown'
                  ? 'breakdown — bass & pad'
                  : mode === 'drop'
                    ? 'drop incoming…'
                    : activeCount <= 3
                      ? 'sparse'
                      : activeCount <= 6
                        ? 'grooving'
                        : 'full throttle'}
            </p>
          </div>

          {/* Future-sharing hint */}
          <p
            className="px-2 text-center italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: '#8A6A4A',
              opacity: 0.55,
              lineHeight: 1.5,
            }}
          >
            Coming: share a Circle so friends each hold one switch — you make the vibe together.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-xl py-3 transition-all"
      style={{
        background: active ? `${color}25` : 'transparent',
        border: `1.5px solid ${active ? color : `${color}30`}`,
        color: active ? color : '#5C3018',
        fontFamily: 'var(--font-serif)',
        fontSize: '13px',
        fontWeight: active ? 700 : 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
