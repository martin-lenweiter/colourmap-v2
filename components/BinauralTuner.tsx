'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   BINAURAL TUNER — adaptive soundscape generator.
   Reads your check-in state to suggest a frequency.
   Full layered soundscape: nature, tones, textures.
   Genre modes: trippy, classical, groovy, logical.
   ═══════════════════════════════════════════════════════════ */

// ── Brain state presets ──
const PRESETS = [
  { id: 'deep-sleep', label: 'Deep Sleep', base: 40, beat: 2, color: '#9B6BA0' },
  { id: 'meditation', label: 'Meditation', base: 60, beat: 5, color: '#6890B0' },
  { id: 'creativity', label: 'Creativity', base: 70, beat: 6, color: '#D4805A' },
  { id: 'calm-focus', label: 'Calm Focus', base: 80, beat: 8, color: '#7AAA58' },
  { id: 'presence', label: 'Presence', base: 50, beat: 4, color: '#C4A060' },
  { id: 'stillness', label: 'Stillness', base: 35, beat: 2, color: '#A0907A' },
];

// ── Default layers per preset ──
const PRESET_LAYERS: Record<string, string[]> = {
  'deep-sleep': ['ocean', 'sub'],
  meditation: ['rain', 'breath'],
  creativity: ['birds', 'wind', 'bowl'],
  'calm-focus': ['hum', 'wind'],
  presence: ['breath', 'drone'],
  stillness: ['bowl', 'breath'],
};

// ── Soundscape layers ──
interface LayerDef {
  id: string;
  label: string;
  color: string;
  group: 'nature' | 'tones' | 'texture' | 'ambient' | 'real';
  build: (
    ctx: AudioContext,
    baseFreq: number,
  ) => { node: AudioNode; source: AudioBufferSourceNode | OscillatorNode };
}

function buildNoise(
  ctx: AudioContext,
  filterType: BiquadFilterType,
  filterFreq: number,
  gain: number,
): { node: AudioNode; source: AudioBufferSourceNode } {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * gain;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  source.connect(filter);
  return { node: filter, source };
}

function buildTone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
): { node: AudioNode; source: OscillatorNode } {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  return { node: osc, source: osc };
}

const LAYERS: LayerDef[] = [
  // Nature
  {
    id: 'rain',
    label: 'Synth Rain',
    color: '#6890B0',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'highpass', 800, 1.2),
  },
  {
    id: 'ocean',
    label: 'Synth Ocean',
    color: '#5A8AAA',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 300, 1.5),
  },
  {
    id: 'wind',
    label: 'Synth Wind',
    color: '#A0C8A0',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 400, 1.0),
  },
  {
    id: 'fire',
    label: 'Synth Fire',
    color: '#D4805A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 600, 0.8),
  },
  {
    id: 'forest',
    label: 'Synth Forest',
    color: '#7AAA58',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 2000, 0.6),
  },
  {
    id: 'thunder',
    label: 'Synth Thunder',
    color: '#8A6A4A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 100, 1.8),
  },
  {
    id: 'birds',
    label: 'Synth Birds',
    color: '#C8906A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'highpass', 3500, 0.4),
  },
  {
    id: 'waves',
    label: 'Synth Waves',
    color: '#88B0C8',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 200, 1.0),
  },
  // Tones
  {
    id: 'drone',
    label: 'Drone',
    color: '#C4A060',
    group: 'tones',
    build: (ctx, base) => buildTone(ctx, base / 4, 'sine'),
  },
  {
    id: 'bowl',
    label: 'Bowl',
    color: '#9B6BA0',
    group: 'tones',
    build: (ctx, base) => buildTone(ctx, base * 1.5, 'sine'),
  },
  {
    id: 'harmonic',
    label: 'Harmonic',
    color: '#6890B0',
    group: 'tones',
    build: (ctx, base) => buildTone(ctx, base * 2, 'triangle'),
  },
  {
    id: 'sub',
    label: 'Sub Bass',
    color: '#5C3018',
    group: 'tones',
    build: (ctx, base) => buildTone(ctx, base / 8, 'sine'),
  },
  // Textures
  {
    id: 'crackle',
    label: 'Vinyl',
    color: '#B8A080',
    group: 'texture',
    build: (ctx) => buildNoise(ctx, 'highpass', 3000, 0.3),
  },
  {
    id: 'breath',
    label: 'Breath',
    color: '#C8C8A0',
    group: 'texture',
    build: (ctx) => buildNoise(ctx, 'bandpass', 500, 0.5),
  },
  {
    id: 'hum',
    label: 'Room Hum',
    color: '#A0907A',
    group: 'texture',
    build: (ctx) => buildTone(ctx, 60, 'sine'),
  },
  // Ambient — noise, periodic sounds, atmospheric
  {
    id: 'whitenoise',
    label: 'White Noise',
    color: '#C8C8C8',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 4;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'pinknoise',
    label: 'Pink Noise',
    color: '#E8B8C8',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 4;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + w * 0.0555179;
          b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856;
          b4 = 0.55 * b4 + w * 0.5329522;
          b5 = -0.7616 * b5 - w * 0.016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.04;
          b6 = w * 0.115926;
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'brownnoise',
    label: 'Brown Noise',
    color: '#A08060',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => buildNoise(ctx, 'lowpass', 200, 2.0),
  },
  {
    id: 'chimes',
    label: 'Chimes',
    color: '#88D8D0',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 8;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 8; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 0.5));
          const f = 800 + Math.random() * 2000;
          const l = Math.floor(ctx.sampleRate * (0.1 + Math.random() * 0.3));
          for (let i = 0; i < l && p + i < n; i++) {
            d[p + i] += Math.sin((i / ctx.sampleRate) * f * Math.PI * 2) * (1 - i / l) ** 2 * 0.06;
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'bubbles',
    label: 'Bubbles',
    color: '#90C0E0',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 6;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 12; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 0.1));
          const bf = 200 + Math.random() * 400;
          const l = Math.floor(ctx.sampleRate * (0.03 + Math.random() * 0.06));
          for (let i = 0; i < l && p + i < n; i++) {
            const t = i / l;
            d[p + i] +=
              Math.sin((i / ctx.sampleRate) * bf * (1 + t * 3) * Math.PI * 2) *
              (1 - t) ** 1.5 *
              0.04;
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'echoes',
    label: 'Echoes',
    color: '#B0A0D0',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 10;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 5; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 2));
          const f = 300 + Math.random() * 200;
          for (let rep = 0; rep < 4; rep++) {
            const offset = p + Math.floor(rep * ctx.sampleRate * 0.4);
            const vol = 0.08 * 0.8 ** rep;
            const l = Math.floor(ctx.sampleRate * 0.15);
            for (let i = 0; i < l && offset + i < n; i++) {
              d[offset + i] +=
                Math.sin((i / ctx.sampleRate) * f * Math.PI * 2) * (1 - i / l) ** 2 * vol;
            }
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'rollingwaves',
    label: 'Rolling Waves',
    color: '#5A8AAA',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 12;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        let last = 0;
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.02 * w) / 1.02;
          const wave = Math.sin((i / ctx.sampleRate) * 0.15 * Math.PI * 2);
          d[i] = last * 1.2 * Math.max(0, wave * 0.7 + 0.3);
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 400;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  {
    id: 'whispers',
    label: 'Whispers',
    color: '#D8C8B8',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 8;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 6; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 0.8));
          const l = Math.floor(ctx.sampleRate * (0.3 + Math.random() * 0.5));
          for (let i = 0; i < l && p + i < n; i++) {
            const env = Math.sin((i / l) * Math.PI);
            d[p + i] += (Math.random() * 2 - 1) * env * 0.03;
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2000;
      f.Q.value = 2;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  {
    id: 'jungle',
    label: 'Jungle',
    color: '#5F7447',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 10;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 10; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 0.5));
          const isChirp = Math.random() > 0.5;
          const f = isChirp ? 2000 + Math.random() * 3000 : 500 + Math.random() * 800;
          const l = Math.floor(
            ctx.sampleRate * (isChirp ? 0.05 + Math.random() * 0.1 : 0.2 + Math.random() * 0.3),
          );
          for (let i = 0; i < l && p + i < n; i++) {
            const t = i / l;
            const env = isChirp ? (1 - t) ** 2 : Math.sin(t * Math.PI);
            const fMod = isChirp ? f * (1 + t * 0.5) : f;
            d[p + i] +=
              Math.sin((i / ctx.sampleRate) * fMod * Math.PI * 2) * env * (isChirp ? 0.04 : 0.03);
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'crickets',
    label: 'Crickets',
    color: '#A0B070',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 6;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 15; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 0.3));
          const f = 4000 + Math.random() * 2000;
          const chirps = 3 + Math.floor(Math.random() * 4);
          for (let k = 0; k < chirps; k++) {
            const cp = p + Math.floor(k * ctx.sampleRate * 0.06);
            const l = Math.floor(ctx.sampleRate * 0.02);
            for (let i = 0; i < l && cp + i < n; i++) {
              d[cp + i] += Math.sin((i / ctx.sampleRate) * f * Math.PI * 2) * 0.02;
            }
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 3000;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  {
    id: 'laughter',
    label: 'Laughter',
    color: '#E0844A',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      // Synthesized gentle giggles — short bursts of modulated tones
      const n = ctx.sampleRate * 12;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 4; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 1.5));
          const baseF = 250 + Math.random() * 150;
          // Each laugh = 4-7 syllables
          const syllables = 4 + Math.floor(Math.random() * 4);
          for (let s = 0; s < syllables; s++) {
            const sp = p + Math.floor(s * ctx.sampleRate * (0.12 + Math.random() * 0.08));
            const sl = Math.floor(ctx.sampleRate * (0.06 + Math.random() * 0.04));
            const pitch = baseF * (1 + s * 0.03); // slight rising pitch
            for (let i = 0; i < sl && sp + i < n; i++) {
              const t = i / sl;
              const env = Math.sin(t * Math.PI);
              // Mix fundamental + formant-like harmonics
              d[sp + i] +=
                (Math.sin((i / ctx.sampleRate) * pitch * Math.PI * 2) * 0.3 +
                  Math.sin((i / ctx.sampleRate) * pitch * 3 * Math.PI * 2) * 0.15 +
                  (Math.random() * 2 - 1) * 0.1) *
                env *
                0.03;
            }
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 800;
      f.Q.value = 0.5;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  {
    id: 'deepspace',
    label: 'Deep Space',
    color: '#3A3A6A',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      // Slow sweeping low tones — sci-fi atmosphere
      const n = ctx.sampleRate * 16;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let i = 0; i < n; i++) {
          const t = i / n;
          const sweep = 40 + 30 * Math.sin(t * Math.PI * 2 * 0.5);
          const env = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 0.3);
          d[i] =
            Math.sin((i / ctx.sampleRate) * sweep * Math.PI * 2) * env * 0.08 +
            (Math.random() * 2 - 1) * 0.01;
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 200;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  {
    id: 'heartbeat',
    label: 'Heartbeat',
    color: '#C85050',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      // Rhythmic double-thump — like a slow heartbeat
      const bpm = 60; // 60bpm = 1 beat per second
      const beatLen = ctx.sampleRate * (60 / bpm);
      const n = Math.floor(beatLen * 4); // 4 beats loop
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let beat = 0; beat < 4; beat++) {
          const offset = Math.floor(beat * beatLen);
          // Lub (lower)
          const lubLen = Math.floor(ctx.sampleRate * 0.08);
          for (let i = 0; i < lubLen; i++) {
            const t = i / lubLen;
            d[offset + i] += Math.sin(t * 50 * Math.PI * 2) * (1 - t) ** 2 * 0.12;
          }
          // Dub (higher, slightly delayed)
          const dubOffset = offset + Math.floor(ctx.sampleRate * 0.15);
          const dubLen = Math.floor(ctx.sampleRate * 0.06);
          for (let i = 0; i < dubLen && dubOffset + i < n; i++) {
            const t = i / dubLen;
            d[dubOffset + i] += Math.sin(t * 70 * Math.PI * 2) * (1 - t) ** 2 * 0.08;
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 150;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  // More nature variety
  {
    id: 'frogs',
    label: 'Frogs',
    color: '#6B8F4E',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 8;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 8; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 0.4));
          const f = 600 + Math.random() * 400;
          const ribbitCount = 2 + Math.floor(Math.random() * 3);
          for (let r = 0; r < ribbitCount; r++) {
            const rp = p + Math.floor(r * ctx.sampleRate * 0.12);
            const rl = Math.floor(ctx.sampleRate * 0.08);
            for (let i = 0; i < rl && rp + i < n; i++) {
              const t = i / rl;
              const freq = f * (1 - t * 0.3);
              d[rp + i] +=
                Math.sin((i / ctx.sampleRate) * freq * Math.PI * 2) * Math.sin(t * Math.PI) * 0.05;
            }
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      return { node: s as AudioNode, source: s };
    },
  },
  {
    id: 'nightbirds',
    label: 'Night Birds',
    color: '#3A5A7A',
    group: 'ambient' as const,
    build: (ctx: AudioContext) => {
      const n = ctx.sampleRate * 14;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let j = 0; j < 5; j++) {
          const p = Math.floor(Math.random() * (n - ctx.sampleRate * 1));
          const baseF = 1500 + Math.random() * 1500;
          // Each call = 2-4 descending notes
          const notes = 2 + Math.floor(Math.random() * 3);
          for (let nt = 0; nt < notes; nt++) {
            const np = p + Math.floor(nt * ctx.sampleRate * 0.2);
            const nf = baseF * (1 - nt * 0.12);
            const nl = Math.floor(ctx.sampleRate * (0.1 + Math.random() * 0.1));
            for (let i = 0; i < nl && np + i < n; i++) {
              const t = i / nl;
              d[np + i] +=
                Math.sin((i / ctx.sampleRate) * nf * Math.PI * 2) * Math.sin(t * Math.PI) * 0.035;
            }
          }
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 2500;
      f.Q.value = 1;
      s.connect(f);
      return { node: f, source: s };
    },
  },
  {
    id: 'stream',
    label: 'Stream',
    color: '#70A8C0',
    group: 'nature' as const,
    build: (ctx: AudioContext) => {
      // Babbling brook — filtered noise with rhythmic amplitude modulation
      const n = ctx.sampleRate * 6;
      const b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        let last = 0;
        for (let i = 0; i < n; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.04 * w) / 1.04;
          // Multiple rhythm layers for babbling effect
          const mod1 = 0.5 + 0.5 * Math.sin((i / ctx.sampleRate) * 3.7 * Math.PI * 2);
          const mod2 = 0.7 + 0.3 * Math.sin((i / ctx.sampleRate) * 1.3 * Math.PI * 2);
          d[i] = last * 0.8 * mod1 * mod2;
        }
      }
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1500;
      f.Q.value = 0.3;
      s.connect(f);
      return { node: f, source: s };
    },
  },
];

// Audio file cache for real recorded sounds
const audioCache = new Map<string, AudioBuffer>();

function buildRealSound(
  ctx: AudioContext,
  url: string,
): { node: AudioNode; source: AudioBufferSourceNode } {
  const source = ctx.createBufferSource();
  source.loop = true;
  const cached = audioCache.get(url);
  if (cached) {
    source.buffer = cached;
  } else {
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        audioCache.set(url, decoded);
        try {
          source.buffer = decoded;
        } catch {
          /* source may have been stopped */
        }
      })
      .catch(() => {});
  }
  return { node: source, source };
}

const REAL_LAYERS: LayerDef[] = [
  {
    id: 'real-birds',
    label: 'Birds',
    color: '#D4805A',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-birds.ogg'),
  },
  {
    id: 'real-garden',
    label: 'Garden Birds',
    color: '#C8906A',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-garden-birds.ogg'),
  },
  {
    id: 'real-rain',
    label: 'Rain',
    color: '#6890B0',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-rain.ogg'),
  },
  {
    id: 'real-thunder',
    label: 'Thunder',
    color: '#8A6A4A',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-thunder.ogg'),
  },
  {
    id: 'real-wind',
    label: 'Wind & Thunder',
    color: '#A0C8A0',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-wind-thunder.ogg'),
  },
  {
    id: 'real-forest',
    label: 'Forest',
    color: '#7AAA58',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-forest.ogg'),
  },
  {
    id: 'real-cicada',
    label: 'Cicada',
    color: '#A0B070',
    group: 'real',
    build: (ctx) => buildRealSound(ctx, '/sounds/real-cicada.ogg'),
  },
];

const ALL_LAYERS = [...LAYERS, ...REAL_LAYERS];

// ── Genre modes ──
interface Genre {
  id: string;
  label: string;
  color: string;
  subtitle: string;
  beat: number;
  base: number;
  layers: string[];
}

const GENRES: Genre[] = [
  {
    id: 'deep-ocean',
    label: 'Deep Ocean',
    color: '#5A8AAA',
    subtitle: 'waves · drone · vast stillness',
    beat: 3,
    base: 45,
    layers: ['ocean', 'waves', 'sub', 'breath'],
  },
  {
    id: 'forest-morning',
    label: 'Forest Morning',
    color: '#7AAA58',
    subtitle: 'birds · wind · alive',
    beat: 6,
    base: 65,
    layers: ['forest', 'birds', 'wind'],
  },
  {
    id: 'fireside',
    label: 'Fireside',
    color: '#D4805A',
    subtitle: 'fire · drone · warm crackle',
    beat: 5,
    base: 55,
    layers: ['fire', 'drone', 'crackle'],
  },
  {
    id: 'rain-night',
    label: 'Rain Night',
    color: '#6890B0',
    subtitle: 'rain · thunder · deep rest',
    beat: 3,
    base: 40,
    layers: ['rain', 'thunder', 'sub'],
  },
  {
    id: 'focus',
    label: 'Focus',
    color: '#C4A060',
    subtitle: 'bowl · hum · clear mind',
    beat: 8,
    base: 75,
    layers: ['bowl', 'hum', 'wind'],
  },
  {
    id: 'trippy',
    label: 'Trippy',
    color: '#9B6BA0',
    subtitle: 'harmonic · ocean · floating',
    beat: 4,
    base: 50,
    layers: ['ocean', 'harmonic', 'sub', 'breath'],
  },
  {
    id: 'storm',
    label: 'Storm',
    color: '#8A6A4A',
    subtitle: 'thunder · rain · waves · power',
    beat: 3,
    base: 35,
    layers: ['thunder', 'rain', 'waves', 'wind'],
  },
  {
    id: 'zen',
    label: 'Zen',
    color: '#A0907A',
    subtitle: 'bowl · breath · silence',
    beat: 4,
    base: 45,
    layers: ['bowl', 'breath'],
  },
];

function _getBrainState(beat: number): string {
  if (beat <= 4) return 'delta · deep rest';
  if (beat <= 8) return 'theta · meditation';
  if (beat <= 14) return 'alpha · relaxed focus';
  if (beat <= 30) return 'beta · active thinking';
  return 'gamma · peak awareness';
}

function loadNum(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

// ── Adaptive suggestion from check-in state ──
function getSuggestion(
  body: number,
  focus: number,
  clarity: number,
): { preset: string; reason: string } {
  const tense = body >= 3;
  const relaxed = body <= 1;
  const focused = focus <= 1;
  const drifting = focus >= 3;
  const foggy = clarity >= 3;

  if (tense && foggy)
    return {
      preset: 'meditation',
      reason: 'you seem tense and foggy — try theta waves to calm the mind',
    };
  if (tense && focused)
    return {
      preset: 'calm-focus',
      reason: 'intense focus detected — alpha waves can sustain it without burning out',
    };
  if (tense && drifting)
    return { preset: 'deep-sleep', reason: 'tension + disconnection — delta waves to reset' };
  if (relaxed && drifting)
    return { preset: 'active-mind', reason: 'relaxed but drifting — beta waves to sharpen' };
  if (relaxed && focused)
    return { preset: 'creativity', reason: 'you are in a sweet spot — theta can deepen the flow' };
  if (foggy)
    return { preset: 'calm-focus', reason: 'clarity is low — alpha waves can clear the fog' };
  if (drifting)
    return { preset: 'active-mind', reason: 'mind is wandering — beta waves to engage' };
  return { preset: 'calm-focus', reason: 'balanced state — alpha waves to maintain' };
}

// ── Crossfade duration in seconds ──
const CROSSFADE_DURATION = 1.5;

export default function BinauralTuner() {
  const [playing, setPlaying] = useState(false);
  const [binauralOn, setBinauralOn] = useState(true);
  const [baseToneOn, setBaseToneOn] = useState(true);
  const panLRef = useRef<StereoPannerNode | null>(null);
  const panRRef = useRef<StereoPannerNode | null>(null);
  const binGainRef = useRef<GainNode | null>(null);
  const oscLGainRef = useRef<GainNode | null>(null);
  const oscRGainRef = useRef<GainNode | null>(null);
  const [baseFreq, setBaseFreq] = useState(60);
  const [beatFreq, setBeatFreq] = useState(4);
  const [volume, setVolume] = useState(0.15);
  const [activeLayers, setActiveLayers] = useState<Record<string, number>>({});
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [_view, _setView] = useState<'presets' | 'layers' | 'genres'>('presets');
  const [tremolo, setTremolo] = useState(false);
  const tremoloSpeed = 0.15;
  const warmth = 0.3; // always-on gentle warmth for smoother sound
  const filterFreq = 5000; // wide open — no muffling
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const warmOscRef = useRef<OscillatorNode | null>(null);
  const warmGainRef = useRef<GainNode | null>(null);
  const binFilterRef = useRef<BiquadFilterNode | null>(null);
  const [savedMixes, setSavedMixes] = useState<
    {
      name: string;
      base: number;
      beat: number;
      vol: number;
      layers: Record<string, number>;
      binaural: boolean;
    }[]
  >([]);
  const [reverbMix, setReverbMix] = useState(0.3);
  const [layerReverb, setLayerReverb] = useState(30); // 0-100, shared layer reverb
  const layerReverbRef = useRef<ConvolverNode | null>(null);
  const layerDryRef = useRef<GainNode | null>(null);
  const layerWetRef = useRef<GainNode | null>(null);
  // Harmony tones — musical intervals relative to base frequency
  const HARMONICS = [
    { id: 'fifth', label: 'Fifth', ratio: 3 / 2, color: '#6890B0' },
    { id: 'octave', label: 'Octave', ratio: 2, color: '#7AAA58' },
    { id: 'third', label: 'Third', ratio: 5 / 4, color: '#D4805A' },
    { id: 'fourth', label: 'Fourth', ratio: 4 / 3, color: '#9B6BA0' },
    { id: 'minor3', label: 'Minor 3rd', ratio: 6 / 5, color: '#C4A060' },
  ] as const;
  const [activeHarmonics, setActiveHarmonics] = useState<Set<string>>(new Set());
  const harmOscsRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map());

  // Sacred / Solfeggio frequencies
  const SACRED = [
    { id: 's174', label: '174', freq: 174, desc: 'foundation', color: '#A0907A' },
    { id: 's285', label: '285', freq: 285, desc: 'healing', color: '#88B0C8' },
    { id: 's396', label: '396', freq: 396, desc: 'liberation', color: '#9B6BA0' },
    { id: 's417', label: '417', freq: 417, desc: 'change', color: '#D4805A' },
    { id: 's432', label: '432', freq: 432, desc: 'nature', color: '#7AAA58' },
    { id: 's528', label: '528', freq: 528, desc: 'love', color: '#C4A060' },
    { id: 's639', label: '639', freq: 639, desc: 'connection', color: '#6890B0' },
    { id: 's741', label: '741', freq: 741, desc: 'intuition', color: '#B0A0C8' },
    { id: 's852', label: '852', freq: 852, desc: 'spiritual', color: '#D8A878' },
    { id: 's963', label: '963', freq: 963, desc: 'higher self', color: '#88C8E8' },
  ] as const;
  const [activeSacred, setActiveSacred] = useState<Set<string>>(new Set());
  const sacredOscsRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map());
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);

  // Generative melodies
  const MELODIES = [
    {
      id: 'piano',
      label: 'Soft Piano',
      color: '#9B6BA0',
      type: 'triangle' as OscillatorType,
      attack: 0.3,
      release: 3.5,
      octave: 4,
    },
    {
      id: 'musicbox',
      label: 'Music Box',
      color: '#88C8E8',
      type: 'sine' as OscillatorType,
      attack: 0.15,
      release: 2.5,
      octave: 6,
    },
    {
      id: 'pad',
      label: 'Ambient Pad',
      color: '#7AAA58',
      type: 'sine' as OscillatorType,
      attack: 1.2,
      release: 6.0,
      octave: 3,
    },
    {
      id: 'harp',
      label: 'Harp',
      color: '#C4A060',
      type: 'triangle' as OscillatorType,
      attack: 0.1,
      release: 2.0,
      octave: 5,
    },
    {
      id: 'strings',
      label: 'Strings',
      color: '#D4805A',
      type: 'sawtooth' as OscillatorType,
      attack: 0.8,
      release: 5.0,
      octave: 3,
    },
  ] as const;
  // Musical scales for melodies
  const MELODY_SCALES: Record<string, { label: string; notes: number[] }> = {
    pentatonic: { label: 'Pentatonic', notes: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21] },
    major: { label: 'Major', notes: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19] },
    minor: { label: 'Minor', notes: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19] },
    japanese: { label: 'Japanese', notes: [0, 1, 5, 7, 8, 12, 13, 17, 19, 20] },
    blues: { label: 'Blues', notes: [0, 3, 5, 6, 7, 10, 12, 15, 17, 18, 19, 22] },
    arabic: { label: 'Arabic', notes: [0, 1, 4, 5, 7, 8, 11, 12, 13, 16, 17, 19] },
    wholeTone: { label: 'Whole Tone', notes: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] },
  };
  const [melodyScale, setMelodyScale] = useState('pentatonic');
  const [activeMelodies, setActiveMelodies] = useState<Set<string>>(new Set());
  const [melodySpeed, setMelodySpeed] = useState(50); // 0-100, 0=very slow, 100=fast
  const [melodyReverb, setMelodyReverb] = useState(60); // 0-100
  const melodyTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const melodyActiveIdsRef = useRef<Set<string>>(new Set());
  const melodyReverbRef = useRef<ConvolverNode | null>(null);
  const melodyDryRef = useRef<GainNode | null>(null);
  const melodyWetRef = useRef<GainNode | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: uses refs, stable
  const playMelodyNote = useCallback((melDef: (typeof MELODIES)[number]) => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain || !melodyActiveIdsRef.current.has(melDef.id)) return;

    // Pick a random note from the selected scale
    const scaleNotes = MELODY_SCALES[melodyScale]?.notes || MELODY_SCALES.pentatonic.notes;
    const noteIdx = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
    const baseNote = 261.63 * 2 ** (melDef.octave - 4); // C of the octave
    const freq = baseNote * 2 ** (noteIdx / 12);

    const osc = ctx.createOscillator();
    osc.type = melDef.type;
    osc.frequency.value = freq;

    // For strings, add lowpass filter
    let source: AudioNode = osc;
    if (melDef.id === 'strings') {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 800;
      lp.Q.value = 0.5;
      osc.connect(lp);
      source = lp;
    }

    // For pad, add second detuned osc
    let osc2: OscillatorNode | null = null;
    if (melDef.id === 'pad') {
      osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 1.003; // slight detune
    }

    const env = ctx.createGain();
    const now = ctx.currentTime;
    const vol = melDef.id === 'pad' ? 0.12 : melDef.id === 'strings' ? 0.08 : 0.15;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(vol, now + melDef.attack);
    env.gain.linearRampToValueAtTime(0, now + melDef.attack + melDef.release);

    source.connect(env);
    if (osc2) {
      const env2 = ctx.createGain();
      env2.gain.setValueAtTime(0, now);
      env2.gain.linearRampToValueAtTime(vol * 0.7, now + melDef.attack);
      env2.gain.linearRampToValueAtTime(0, now + melDef.attack + melDef.release);
      osc2.connect(env2);
      env2.connect(gain);
      osc2.start(now);
      osc2.stop(now + melDef.attack + melDef.release + 0.1);
    }

    // Route through melody reverb if set up, otherwise direct
    if (melodyDryRef.current && melodyReverbRef.current) {
      env.connect(melodyDryRef.current);
      env.connect(melodyReverbRef.current);
    } else {
      env.connect(gain);
    }
    osc.start(now);
    osc.stop(now + melDef.attack + melDef.release + 0.1);

    // Schedule next note — speed 0=slow, 50=normal, 100=fast
    const speedMult =
      melodySpeed < 50 ? 1 + (50 - melodySpeed) / 10 : 1 / (1 + (melodySpeed - 50) / 25);
    const baseInterval =
      melDef.id === 'pad'
        ? 3000 + Math.random() * 4000
        : melDef.id === 'harp'
          ? 400 + Math.random() * 800
          : 1500 + Math.random() * 3000;
    const interval = baseInterval * speedMult;

    melodyTimersRef.current.set(
      melDef.id,
      setTimeout(() => {
        if (melodyActiveIdsRef.current.has(melDef.id)) playMelodyNote(melDef);
      }, interval),
    );
  }, []);

  // Start/stop melodies — supports multiple simultaneous
  // biome-ignore lint/correctness/useExhaustiveDependencies: MELODIES stable, melodyReverb used in setup only
  useEffect(() => {
    // Start newly activated melodies
    for (const m of MELODIES) {
      if (activeMelodies.has(m.id) && !melodyActiveIdsRef.current.has(m.id) && ctxRef.current) {
        melodyActiveIdsRef.current.add(m.id);

        // Set up melody reverb on first melody activation
        if (!melodyReverbRef.current && ctxRef.current) {
          const ctx = ctxRef.current;
          const len = ctx.sampleRate * 4;
          const buf = ctx.createBuffer(2, len, ctx.sampleRate);
          for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) {
              d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
            }
          }
          const rev = ctx.createConvolver();
          rev.buffer = buf;
          melodyReverbRef.current = rev;
          const dry = ctx.createGain();
          dry.gain.value = 1 - melodyReverb / 100;
          melodyDryRef.current = dry;
          const wet = ctx.createGain();
          wet.gain.value = melodyReverb / 100;
          melodyWetRef.current = wet;
          dry.connect(ctx.destination);
          rev.connect(wet);
          wet.connect(ctx.destination);
        }

        playMelodyNote(m);
      }
    }
    // Stop removed melodies
    for (const id of melodyActiveIdsRef.current) {
      if (!activeMelodies.has(id)) {
        melodyActiveIdsRef.current.delete(id);
        const timer = melodyTimersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          melodyTimersRef.current.delete(id);
        }
      }
    }
    return () => {
      // Cleanup all on unmount
      for (const [, timer] of melodyTimersRef.current) {
        clearTimeout(timer);
      }
      melodyTimersRef.current.clear();
      melodyActiveIdsRef.current.clear();
    };
  }, [activeMelodies, playMelodyNote]);

  // Melody reverb mix update
  useEffect(() => {
    if (melodyDryRef.current) melodyDryRef.current.gain.value = 1 - melodyReverb / 100;
    if (melodyWetRef.current) melodyWetRef.current.gain.value = melodyReverb / 100;
  }, [melodyReverb]);

  // Layer reverb mix update
  useEffect(() => {
    if (layerDryRef.current) layerDryRef.current.gain.value = 1 - layerReverb / 100;
    if (layerWetRef.current) layerWetRef.current.gain.value = layerReverb / 100;
  }, [layerReverb]);

  // Voice / Poetry system
  const VOICE_CONTENT = {
    affirmations: [
      'I am exactly where I need to be.',
      'This moment is enough.',
      'I release what I cannot control.',
      'My breath is my anchor.',
      'I am becoming who I was meant to be.',
      'Stillness is not emptiness. It is fullness.',
      'I trust the process of my life.',
      'Every breath is a new beginning.',
      'I am worthy of peace.',
      'The light in me recognizes the light in others.',
      'I choose calm over chaos.',
      'My feelings are valid. I honor them.',
    ],
    meditation: [
      'Close your eyes. Feel the weight of your body.',
      'Breathe in through the nose. Slowly. Deeply.',
      'Hold. Feel the stillness between breaths.',
      'Breathe out. Let everything go.',
      'Notice where you hold tension. Let it soften.',
      'You are safe. You are here. You are whole.',
      'The thoughts will come. Let them pass like clouds.',
      'Return to the breath. Always the breath.',
      'Feel the ground beneath you. Solid. Still.',
      'You are not your thoughts. You are the space that holds them.',
    ],
    poetry: [
      'The river does not push. It flows. And in flowing, it arrives.',
      'Between the notes, silence. Between the words, truth.',
      'You were not made to be small. You were made to be the whole sky.',
      'The wound is where the light enters you.',
      'Do not be afraid of the dark. It is where the stars live.',
      'Let yourself be silently drawn by the strange pull of what you really love.',
      'The quieter you become, the more you can hear.',
      'Out beyond ideas of wrongdoing and rightdoing, there is a field. I will meet you there.',
      'You are not a drop in the ocean. You are the entire ocean in a drop.',
      'Be like water. Soft enough to flow, strong enough to carve stone.',
    ],
  };
  const [voiceMode, setVoiceMode] = useState<'off' | 'affirmations' | 'meditation' | 'poetry'>(
    'off',
  );
  const [voiceRate, setVoiceRate] = useState(0.7); // 0.5-1.0
  const [voicePitch, setVoicePitch] = useState(1.0); // 0.5-1.5
  const [voiceVolume, setVoiceVolume] = useState(0.8);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceIdxRef = useRef(0);
  const voiceActiveRef = useRef(false);

  function speakLine(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = voiceRate;
    utter.pitch = voicePitch;
    utter.volume = voiceVolume;
    // Try to find a soft/calm voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Female')),
    );
    if (preferred) utter.voice = preferred;
    else if (voices.length > 0)
      utter.voice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
    window.speechSynthesis.speak(utter);
  }

  function scheduleNextVoiceLine() {
    if (!voiceActiveRef.current || voiceMode === 'off') return;
    const content = VOICE_CONTENT[voiceMode];
    if (!content) return;
    const line = content[voiceIdxRef.current % content.length];
    voiceIdxRef.current++;
    speakLine(line);
    // Schedule next line — longer pauses for poetry, shorter for affirmations
    const pause =
      voiceMode === 'meditation'
        ? 8000 + Math.random() * 5000
        : voiceMode === 'poetry'
          ? 12000 + Math.random() * 8000
          : 10000 + Math.random() * 6000;
    voiceTimerRef.current = setTimeout(scheduleNextVoiceLine, pause);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: voice scheduling uses refs
  useEffect(() => {
    if (voiceMode !== 'off') {
      voiceActiveRef.current = true;
      voiceIdxRef.current = Math.floor(Math.random() * 10);
      // Small delay before first line
      voiceTimerRef.current = setTimeout(scheduleNextVoiceLine, 2000);
    } else {
      voiceActiveRef.current = false;
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    }
    return () => {
      voiceActiveRef.current = false;
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    };
  }, [voiceMode]);

  const [saveName, setSaveName] = useState('');
  const [_showSave, setShowSave] = useState(false);
  const crossfadingRef = useRef(false);

  // Collapsible section state
  const [layersOpen, setLayersOpen] = useState(true);
  const [genresOpen, setGenresOpen] = useState(false);
  const [brainStatesOpen, setBrainStatesOpen] = useState(false);
  const [savedSoundsOpen, setSavedSoundsOpen] = useState(false);

  // Load saved mixes
  useEffect(() => {
    try {
      const raw = localStorage.getItem('colourmap:tuner-mixes');
      if (raw) setSavedMixes(JSON.parse(raw));
    } catch {}
  }, []);

  function saveMix() {
    if (!saveName.trim()) return;
    const mix = {
      name: saveName.trim(),
      base: baseFreq,
      beat: beatFreq,
      vol: volume,
      layers: { ...activeLayers },
      binaural: binauralOn,
    };
    const next = [mix, ...savedMixes].slice(0, 20);
    setSavedMixes(next);
    localStorage.setItem('colourmap:tuner-mixes', JSON.stringify(next));
    setSaveName('');
    setShowSave(false);
  }

  function loadMix(mix: (typeof savedMixes)[0]) {
    setBaseFreq(mix.base);
    setBeatFreq(mix.beat);
    setVolume(mix.vol);
    setBinauralOn(mix.binaural);
    // Stop current layers
    if (ctxRef.current) {
      for (const [id, node] of layerNodesRef.current) {
        try {
          node.source.stop();
        } catch {}
        node.gain.disconnect();
        layerNodesRef.current.delete(id);
      }
      // Start mix layers
      for (const [id, vol] of Object.entries(mix.layers)) {
        if (vol > 0) startLayer(ctxRef.current, id, vol);
      }
    }
    setActiveLayers(mix.layers);
  }

  const ctxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const layerNodesRef = useRef<
    Map<string, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }>
  >(new Map());

  // Adaptive: read check-in state
  const [suggestion, setSuggestion] = useState<{ preset: string; reason: string } | null>(null);
  useEffect(() => {
    const body = loadNum('colourmap:body-idx', 2);
    const focus = loadNum('colourmap:focus-idx', 2);
    const clarity = loadNum('colourmap:clarity-idx', 2);
    setSuggestion(getSuggestion(body, focus, clarity));
  }, []);

  const [audioError, setAudioError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: startLayer uses refs, stable in component body
  const startAudio = useCallback(() => {
    try {
      if (ctxRef.current) return;
      setAudioError(null);
      const ctx = new AudioContext();
      // Resume context — required by browsers after user gesture
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => setAudioError('browser blocked audio'));
      }
      ctxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainRef.current = gain;

      // Connect both channels to stereo output for binaural effect
      // But also send to both ears so it's audible without headphones
      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = baseFreq;
      oscLeftRef.current = oscL;

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = baseFreq + beatFreq;
      oscRightRef.current = oscR;

      // Stereo panning: left osc panned left, right osc panned right
      // When binaural is off, center the left pan so tone plays in both ears
      const panL = ctx.createStereoPanner();
      panL.pan.value = binauralOn ? -0.8 : 0;
      const panR = ctx.createStereoPanner();
      panR.pan.value = 0.8;
      panLRef.current = panL;
      panRRef.current = panR;

      // Master gain for oscillators — always on, individual muting via oscL/oscR gains
      const binGain = ctx.createGain();
      binGain.gain.value = 1;
      binGainRef.current = binGain;

      // Individual gain for base tone and beat tone
      const oscLGain = ctx.createGain();
      oscLGain.gain.value = baseToneOn ? 1 : 0;
      oscLGainRef.current = oscLGain;
      const oscRGain = ctx.createGain();
      oscRGain.gain.value = binauralOn ? 1 : 0;
      oscRGainRef.current = oscRGain;

      oscL.connect(oscLGain);
      oscLGain.connect(panL);
      panL.connect(binGain);
      oscR.connect(oscRGain);
      oscRGain.connect(panR);
      panR.connect(binGain);

      // Filter on binaural signal
      const binFilter = ctx.createBiquadFilter();
      binFilter.type = 'lowpass';
      binFilter.frequency.value = filterFreq;
      binFilter.Q.value = 0.5;
      binFilterRef.current = binFilter;

      binGain.connect(binFilter);
      binFilter.connect(gain);

      // Warmth — adds a harmonic layer
      if (warmth > 0.01) {
        const warmOsc = ctx.createOscillator();
        warmOsc.type = 'triangle';
        warmOsc.frequency.value = baseFreq * 2;
        const wg = ctx.createGain();
        wg.gain.value = warmth * 0.15;
        warmOsc.connect(wg);
        wg.connect(binFilter);
        warmOsc.start();
        warmOscRef.current = warmOsc;
        warmGainRef.current = wg;
      }

      // Reverb — smooths the overall binaural sound
      const reverbLen = ctx.sampleRate * 3;
      const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = reverbBuf.getChannelData(ch);
        for (let i = 0; i < reverbLen; i++) {
          d[i] = (Math.random() * 2 - 1) * (1 - i / reverbLen) ** 2.5;
        }
      }
      const reverb = ctx.createConvolver();
      reverb.buffer = reverbBuf;
      reverbNodeRef.current = reverb;

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - reverbMix;
      dryGainRef.current = dryGain;
      const wetGain = ctx.createGain();
      wetGain.gain.value = reverbMix;
      wetGainRef.current = wetGain;

      gain.connect(dryGain);
      dryGain.connect(ctx.destination);
      gain.connect(reverb);
      reverb.connect(wetGain);
      wetGain.connect(ctx.destination);

      oscL.start();
      oscR.start();
      setPlaying(true);

      // Start any active layers
      for (const [layerId, vol] of Object.entries(activeLayers)) {
        if (vol > 0) startLayer(ctx, layerId, vol);
      }
    } catch {
      setAudioError('could not start audio');
    }
  }, [baseFreq, beatFreq, volume, activeLayers]);

  const stopAudio = useCallback(() => {
    for (const [, node] of layerNodesRef.current) {
      try {
        node.source.stop();
      } catch {}
      node.gain.disconnect();
    }
    layerNodesRef.current.clear();
    oscLeftRef.current?.stop();
    oscRightRef.current?.stop();
    ctxRef.current?.close();
    ctxRef.current = null;
    oscLeftRef.current = null;
    oscRightRef.current = null;
    gainRef.current = null;
    setPlaying(false);
  }, []);

  function ensureLayerReverb(ctx: AudioContext) {
    if (layerReverbRef.current) return;
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.5;
      }
    }
    const rev = ctx.createConvolver();
    rev.buffer = buf;
    layerReverbRef.current = rev;
    const dry = ctx.createGain();
    dry.gain.value = 1 - layerReverb / 100;
    layerDryRef.current = dry;
    const wet = ctx.createGain();
    wet.gain.value = layerReverb / 100;
    layerWetRef.current = wet;
    dry.connect(ctx.destination);
    rev.connect(wet);
    wet.connect(ctx.destination);
  }

  function startLayer(ctx: AudioContext, layerId: string, vol: number) {
    const def = ALL_LAYERS.find((l) => l.id === layerId);
    if (!def) return;
    ensureLayerReverb(ctx);
    const { node, source } = def.build(ctx, baseFreq);
    const layerGain = ctx.createGain();
    layerGain.gain.value = vol;
    node.connect(layerGain);
    // Route through layer reverb bus
    if (layerDryRef.current && layerReverbRef.current) {
      layerGain.connect(layerDryRef.current);
      layerGain.connect(layerReverbRef.current);
    } else {
      layerGain.connect(ctx.destination);
    }
    if ('start' in source) source.start();
    layerNodesRef.current.set(layerId, { source, gain: layerGain });
  }

  function startLayerWithFadeIn(ctx: AudioContext, layerId: string, targetVol: number) {
    const def = ALL_LAYERS.find((l) => l.id === layerId);
    if (!def) return;
    ensureLayerReverb(ctx);
    const { node, source } = def.build(ctx, baseFreq);
    const layerGain = ctx.createGain();
    layerGain.gain.value = 0;
    node.connect(layerGain);
    if (layerDryRef.current && layerReverbRef.current) {
      layerGain.connect(layerDryRef.current);
      layerGain.connect(layerReverbRef.current);
    } else {
      layerGain.connect(ctx.destination);
    }
    if ('start' in source) source.start();
    layerNodesRef.current.set(layerId, { source, gain: layerGain });
    // Fade in over crossfade duration
    const now = ctx.currentTime;
    layerGain.gain.setValueAtTime(0, now);
    layerGain.gain.linearRampToValueAtTime(targetVol, now + CROSSFADE_DURATION);
  }

  function fadeOutLayer(ctx: AudioContext, layerId: string) {
    const existing = layerNodesRef.current.get(layerId);
    if (!existing) return;
    const now = ctx.currentTime;
    existing.gain.gain.cancelScheduledValues(now);
    existing.gain.gain.setValueAtTime(existing.gain.gain.value, now);
    existing.gain.gain.linearRampToValueAtTime(0, now + CROSSFADE_DURATION);
    // Schedule cleanup after fade
    setTimeout(
      () => {
        try {
          existing.source.stop();
        } catch {}
        existing.gain.disconnect();
        layerNodesRef.current.delete(layerId);
      },
      CROSSFADE_DURATION * 1000 + 100,
    );
  }

  function toggleLayer(layerId: string) {
    const current = activeLayers[layerId] || 0;
    const newVol = current > 0 ? 0 : 0.25;
    setActiveLayers((prev) => ({ ...prev, [layerId]: newVol }));

    if (ctxRef.current) {
      const existing = layerNodesRef.current.get(layerId);
      if (existing && newVol <= 0) {
        try {
          existing.source.stop();
        } catch {}
        existing.gain.disconnect();
        layerNodesRef.current.delete(layerId);
      } else if (!existing && newVol > 0) {
        startLayer(ctxRef.current, layerId, newVol);
      }
    }
  }

  function setLayerVol(layerId: string, vol: number) {
    setActiveLayers((prev) => ({ ...prev, [layerId]: vol }));
    const existing = layerNodesRef.current.get(layerId);
    if (existing) existing.gain.gain.value = vol;
  }

  function applyGenre(genre: Genre) {
    const ctx = ctxRef.current;
    setActiveGenre(genre.id);
    setBaseFreq(genre.base);
    setBeatFreq(genre.beat);

    if (ctx && !crossfadingRef.current) {
      crossfadingRef.current = true;
      // Fade out all current layers
      const oldLayerIds = [...layerNodesRef.current.keys()];
      for (const id of oldLayerIds) {
        fadeOutLayer(ctx, id);
      }
      // After fade out completes, start new layers with fade in
      setTimeout(
        () => {
          const newLayers: Record<string, number> = {};
          for (const id of genre.layers) {
            newLayers[id] = 0.2;
            startLayerWithFadeIn(ctx, id, 0.2);
          }
          setActiveLayers(newLayers);
          crossfadingRef.current = false;
        },
        CROSSFADE_DURATION * 1000 + 150,
      );
    } else {
      // No audio context or already crossfading — just set state
      const newLayers: Record<string, number> = {};
      for (const id of genre.layers) {
        newLayers[id] = 0.2;
      }
      setActiveLayers(newLayers);
    }
  }

  function applyPresetWithLayers(preset: (typeof PRESETS)[0]) {
    setBaseFreq(preset.base);
    setBeatFreq(preset.beat);
    const defaultLayers = PRESET_LAYERS[preset.id];
    if (!defaultLayers) return;

    const ctx = ctxRef.current;
    if (ctx && !crossfadingRef.current) {
      crossfadingRef.current = true;
      // Fade out all current layers
      const oldLayerIds = [...layerNodesRef.current.keys()];
      for (const id of oldLayerIds) {
        fadeOutLayer(ctx, id);
      }
      // After fade out, start preset layers with fade in
      setTimeout(
        () => {
          const newLayers: Record<string, number> = {};
          for (const id of defaultLayers) {
            newLayers[id] = 0.2;
            startLayerWithFadeIn(ctx, id, 0.2);
          }
          setActiveLayers(newLayers);
          crossfadingRef.current = false;
        },
        CROSSFADE_DURATION * 1000 + 150,
      );
    } else {
      // No audio context — just set state
      const newLayers: Record<string, number> = {};
      for (const id of defaultLayers) {
        newLayers[id] = 0.2;
      }
      setActiveLayers(newLayers);
    }
  }

  useEffect(() => {
    if (oscLeftRef.current) oscLeftRef.current.frequency.value = baseFreq;
    if (oscRightRef.current) oscRightRef.current.frequency.value = baseFreq + beatFreq;
  }, [baseFreq, beatFreq]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  // Binaural beat (right osc) toggle
  useEffect(() => {
    if (oscRGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      oscRGainRef.current.gain.cancelScheduledValues(now);
      oscRGainRef.current.gain.setValueAtTime(oscRGainRef.current.gain.value, now);
      oscRGainRef.current.gain.linearRampToValueAtTime(binauralOn ? 1 : 0, now + 0.5);
    }
  }, [binauralOn]);

  // Mono routing: center panL when binaural is off, restore stereo when on
  useEffect(() => {
    if (panLRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      panLRef.current.pan.cancelScheduledValues(now);
      panLRef.current.pan.setValueAtTime(panLRef.current.pan.value, now);
      panLRef.current.pan.linearRampToValueAtTime(binauralOn ? -0.8 : 0, now + 0.3);
    }
  }, [binauralOn]);

  // Base tone (left osc) toggle
  useEffect(() => {
    if (oscLGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      oscLGainRef.current.gain.cancelScheduledValues(now);
      oscLGainRef.current.gain.setValueAtTime(oscLGainRef.current.gain.value, now);
      oscLGainRef.current.gain.linearRampToValueAtTime(baseToneOn ? 1 : 0, now + 0.5);
    }
  }, [baseToneOn]);

  // Reverb mix update
  useEffect(() => {
    if (dryGainRef.current) dryGainRef.current.gain.value = 1 - reverbMix;
    if (wetGainRef.current) wetGainRef.current.gain.value = reverbMix;
  }, [reverbMix]);

  // Harmony tones — start/stop oscillators based on activeHarmonics
  useEffect(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    // Start new harmonics — route through binFilter so they get reverb too
    const binFilter = binFilterRef.current;
    for (const h of HARMONICS) {
      if (activeHarmonics.has(h.id) && !harmOscsRef.current.has(h.id)) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = baseFreq * h.ratio;
        const g = ctx.createGain();
        g.gain.value = 0;
        osc.connect(g);
        // Connect to filter chain (same as main oscs) so harmonics get reverb
        g.connect(binFilter || gain);
        osc.start();
        // Fade in to full audible volume
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.8);
        harmOscsRef.current.set(h.id, { osc, gain: g });
      }
    }

    // Stop removed harmonics
    for (const [id, node] of harmOscsRef.current) {
      if (!activeHarmonics.has(id)) {
        const now = ctx.currentTime;
        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
        node.gain.gain.linearRampToValueAtTime(0, now + 0.5);
        setTimeout(() => {
          try {
            node.osc.stop();
          } catch {}
          node.gain.disconnect();
        }, 600);
        harmOscsRef.current.delete(id);
      }
    }

    // Update frequencies for existing harmonics (when baseFreq changes)
    for (const h of HARMONICS) {
      const node = harmOscsRef.current.get(h.id);
      if (node) node.osc.frequency.value = baseFreq * h.ratio;
    }
  }, [activeHarmonics, baseFreq, HARMONICS]);

  // Sacred tones — fixed frequencies, same pattern
  useEffect(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    const binFilter = binFilterRef.current;

    for (const s of SACRED) {
      if (activeSacred.has(s.id) && !sacredOscsRef.current.has(s.id)) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = s.freq;
        const g = ctx.createGain();
        g.gain.value = 0;
        osc.connect(g);
        g.connect(binFilter || gain);
        osc.start();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.0);
        sacredOscsRef.current.set(s.id, { osc, gain: g });
      }
    }

    for (const [id, node] of sacredOscsRef.current) {
      if (!activeSacred.has(id)) {
        const now = ctx.currentTime;
        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
        node.gain.gain.linearRampToValueAtTime(0, now + 0.8);
        setTimeout(() => {
          try {
            node.osc.stop();
          } catch {}
          node.gain.disconnect();
        }, 900);
        sacredOscsRef.current.delete(id);
      }
    }
  }, [activeSacred, SACRED]);

  // Warmth — create/destroy harmonic oscillator dynamically
  useEffect(() => {
    const ctx = ctxRef.current;
    const binFilter = binFilterRef.current;
    if (!ctx || !binFilter) return;

    if (warmth > 0.01) {
      if (warmOscRef.current) {
        // Update existing
        warmGainRef.current!.gain.value = warmth * 0.15;
        warmOscRef.current.frequency.value = baseFreq * 2;
      } else {
        // Create new
        const warmOsc = ctx.createOscillator();
        warmOsc.type = 'triangle';
        warmOsc.frequency.value = baseFreq * 2;
        const wg = ctx.createGain();
        wg.gain.value = warmth * 0.15;
        warmOsc.connect(wg);
        wg.connect(binFilter);
        warmOsc.start();
        warmOscRef.current = warmOsc;
        warmGainRef.current = wg;
      }
    } else {
      // Destroy if exists
      if (warmOscRef.current) {
        try {
          warmOscRef.current.stop();
        } catch {}
        warmOscRef.current = null;
      }
      if (warmGainRef.current) {
        warmGainRef.current.disconnect();
        warmGainRef.current = null;
      }
    }
  }, [baseFreq]);

  // Tremolo — slow wave effect on main gain
  useEffect(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;
    if (tremolo) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = tremoloSpeed;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = volume * 0.4; // modulation depth
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
    } else {
      if (lfoRef.current) {
        try {
          lfoRef.current.stop();
        } catch {}
        lfoRef.current = null;
      }
      if (lfoGainRef.current) {
        lfoGainRef.current.disconnect();
        lfoGainRef.current = null;
      }
    }
  }, [tremolo, volume]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        for (const [, node] of layerNodesRef.current) {
          try {
            node.source.stop();
          } catch {}
        }
        oscLeftRef.current?.stop();
        oscRightRef.current?.stop();
        ctxRef.current.close();
      }
    };
  }, []);

  // Wave visualization — tremolo modulates amplitude when active
  const W = 320;
  const H = 100;
  const cy = H / 2;
  const wavelength = Math.max(20, 80 - beatFreq * 1.5);
  const baseAmplitude = 15 + volume * 30;
  const [waveTime, setWaveTime] = useState(0);
  useEffect(() => {
    if (!tremolo || !playing) return;
    let raf: number;
    const start = performance.now();
    function animate() {
      setWaveTime((performance.now() - start) / 1000);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [tremolo, playing]);

  const points: string[] = [];
  for (let x = 0; x <= W; x += 2) {
    const tremoloMod =
      tremolo && playing
        ? 1 - 0.35 * Math.sin(waveTime * tremoloSpeed * Math.PI * 2 + (x / W) * 0.5)
        : 1;
    const amplitude = baseAmplitude * tremoloMod;
    const y = cy + Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
    points.push(`${x},${y.toFixed(1)}`);
  }
  const pathD = `M ${points.join(' L ')}`;
  const preset = PRESETS.find((p) => p.beat === beatFreq && p.base === baseFreq);
  const genre = GENRES.find((g) => g.id === activeGenre);
  const activeColor = genre?.color || preset?.color || '#C4A060';
  const _activeLayerCount = Object.values(activeLayers).filter((v) => v > 0).length;

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
          Calming Sounds
        </p>
        <p
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            color: '#8A6A4A',
            opacity: 0.95,
          }}
        >
          find your frequency
        </p>
      </div>

      {/* Wave visualization — no horizontal center line */}
      <div className="flex justify-center">
        <svg width={W} height={H}>
          <path
            d={pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ transition: 'all 0.3s' }}
          />
          <path
            d={pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={playing ? 0.2 : 0.05}
            style={{ transition: 'all 0.3s' }}
          />
        </svg>
      </div>

      {/* Play button — centered, no brain state text, no save bookmark */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={playing ? stopAudio : startAudio}
          className="flex cursor-pointer items-center justify-center rounded-full transition-all"
          style={{
            width: 44,
            height: 44,
            background: playing ? `${activeColor}20` : `${activeColor}10`,
            border: `2px solid ${activeColor}${playing ? '60' : '30'}`,
          }}
        >
          {playing ? (
            <div className="flex gap-1">
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 14, background: activeColor }}
              />
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 14, background: activeColor }}
              />
            </div>
          ) : (
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderLeft: `12px solid ${activeColor}`,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                marginLeft: 2,
              }}
            />
          )}
        </button>
      </div>

      {/* Audio error */}
      {audioError && (
        <p
          className="text-center"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: '#D06040' }}
        >
          {audioError}
        </p>
      )}

      {/* Sliders: beat (with binaural toggle), tone (with tone toggle), reverb, wave */}
      <div className="space-y-3 px-2">
        <SliderRow
          label="beat"
          value={beatFreq}
          min={1}
          max={10}
          unit="Hz"
          color={activeColor}
          onChange={setBeatFreq}
          toggleOn={binauralOn}
          onToggle={() => setBinauralOn((s) => !s)}
        />
        <SliderRow
          label="tone"
          value={baseFreq}
          min={30}
          max={80}
          unit="Hz"
          color="#7A5438"
          onChange={setBaseFreq}
          toggleOn={baseToneOn}
          onToggle={() => setBaseToneOn((s) => !s)}
        />
        <SliderRow
          label="reverb"
          value={Math.round(reverbMix * 100)}
          min={0}
          max={100}
          unit="%"
          color="#A0907A"
          onChange={(v) => setReverbMix(v / 100)}
        />
        <SliderRow
          label="wave"
          value={tremolo ? 1 : 0}
          min={0}
          max={1}
          unit=""
          color="#6890B0"
          onChange={() => setTremolo((s) => !s)}
          toggleOn={tremolo}
          onToggle={() => setTremolo((s) => !s)}
        />
      </div>

      {/* Volume bar — always visible */}
      <div className="px-2">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2"
          style={{ background: '#5C301804' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#8A6A4A',
              opacity: 0.5,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            vol
          </span>
          <div
            className="flex flex-1 gap-[3px] cursor-pointer"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setVolume(Math.max(0.02, (e.clientX - rect.left) / rect.width));
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-[2px] transition-all"
                style={{
                  height: 6,
                  background: '#8A6A4A',
                  opacity: i / 11 <= volume ? 0.25 + (i / 11) * 0.4 : 0.06,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: '#8A6A4A',
              opacity: 0.4,
              flexShrink: 0,
            }}
          >
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Harmony — musical intervals that fit the base tone */}
      <div className="px-2">
        <p
          className="text-center mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#7A5438',
            opacity: 0.5,
          }}
        >
          harmonics — {baseFreq}Hz
        </p>
        <div className="flex justify-center gap-2">
          {HARMONICS.map((h) => {
            const isOn = activeHarmonics.has(h.id);
            const freq = Math.round(baseFreq * h.ratio);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  setActiveHarmonics((prev) => {
                    const next = new Set(prev);
                    if (next.has(h.id)) next.delete(h.id);
                    else next.add(h.id);
                    return next;
                  });
                }}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-xl px-2.5 py-2 transition-all"
                style={{
                  background: isOn ? `${h.color}15` : 'transparent',
                  border: `1px solid ${isOn ? `${h.color}40` : '#C4A06012'}`,
                }}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background: h.color,
                    opacity: isOn ? 1 : 0.3,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    fontWeight: isOn ? 700 : 500,
                    color: isOn ? h.color : '#8A6A4A',
                    opacity: isOn ? 1 : 0.5,
                  }}
                >
                  {h.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '9px',
                    color: '#8A6A4A',
                    opacity: 0.35,
                  }}
                >
                  {freq}Hz
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sacred frequencies — Solfeggio + 432Hz */}
      <div className="px-2">
        <p
          className="text-center mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#7A5438',
            opacity: 0.5,
          }}
        >
          sacred frequencies
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {SACRED.map((s) => {
            const isOn = activeSacred.has(s.id);
            // Check if this sacred freq is a harmonic of the base tone (within 5%)
            const ratio = s.freq / baseFreq;
            const nearestInt = Math.round(ratio);
            const isAligned =
              nearestInt >= 2 && nearestInt <= 16 && Math.abs(ratio - nearestInt) < 0.05;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSacred((prev) => {
                    const next = new Set(prev);
                    if (next.has(s.id)) next.delete(s.id);
                    else next.add(s.id);
                    return next;
                  });
                }}
                className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition-all"
                style={{
                  background: isOn ? `${s.color}18` : isAligned ? `${s.color}08` : 'transparent',
                  border: `1px solid ${isOn ? `${s.color}40` : isAligned ? `${s.color}20` : '#C4A06010'}`,
                }}
                title={`${s.desc}${isAligned ? ` · harmonic ×${nearestInt} of ${baseFreq}Hz` : ''}`}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: s.color,
                    opacity: isOn ? 1 : isAligned ? 0.6 : 0.3,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '10px',
                    fontWeight: isOn ? 700 : 500,
                    color: isOn ? s.color : '#8A6A4A',
                    opacity: isOn ? 1 : isAligned ? 0.7 : 0.45,
                  }}
                >
                  {s.label}
                </span>
                {isAligned && !isOn && (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '8px',
                      color: s.color,
                      opacity: 0.5,
                    }}
                  >
                    ×{nearestInt}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Generative melodies */}
      <div className="px-2">
        <p
          className="text-center mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#7A5438',
            opacity: 0.5,
          }}
        >
          melodies
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {MELODIES.map((m) => {
            const isOn = activeMelodies.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setActiveMelodies((prev) => {
                    const next = new Set(prev);
                    if (next.has(m.id)) next.delete(m.id);
                    else next.add(m.id);
                    return next;
                  });
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-all"
                style={{
                  background: isOn ? `${m.color}18` : 'transparent',
                  border: `1px solid ${isOn ? `${m.color}40` : '#C4A06010'}`,
                }}
              >
                <span
                  className="block rounded-full"
                  style={{ width: 7, height: 7, background: m.color, opacity: isOn ? 1 : 0.3 }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    fontWeight: isOn ? 700 : 500,
                    color: isOn ? m.color : '#8A6A4A',
                    opacity: isOn ? 1 : 0.5,
                  }}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Scale selector */}
        <div className="flex flex-wrap justify-center gap-1 pt-1">
          {Object.entries(MELODY_SCALES).map(([id, s]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMelodyScale(id)}
              className="cursor-pointer rounded-full px-2 py-0.5 text-[9px] font-semibold transition-all"
              style={{
                color: melodyScale === id ? '#5C3018' : '#8A6A4A',
                background: melodyScale === id ? '#5C301810' : 'transparent',
                border: `1px solid ${melodyScale === id ? '#5C301830' : '#C4A06008'}`,
                opacity: melodyScale === id ? 1 : 0.4,
                fontFamily: 'var(--font-serif)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {activeMelodies.size > 0 && (
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                speed
              </span>
              <div
                className="flex gap-[2px] cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setMelodySpeed(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                }}
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all"
                    style={{
                      width: 10,
                      height: 6,
                      background: '#9B6BA0',
                      opacity: i / 7 <= melodySpeed / 100 ? 0.4 + (i / 7) * 0.4 : 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                reverb
              </span>
              <div
                className="flex gap-[2px] cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setMelodyReverb(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                }}
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all"
                    style={{
                      width: 10,
                      height: 6,
                      background: '#A0907A',
                      opacity: i / 7 <= melodyReverb / 100 ? 0.4 + (i / 7) * 0.4 : 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice / Poetry */}
      <div className="px-2">
        <p
          className="text-center mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#7A5438',
            opacity: 0.5,
          }}
        >
          voices
        </p>
        <div className="flex justify-center gap-2">
          {(['off', 'affirmations', 'meditation', 'poetry'] as const).map((mode) => {
            const isOn = voiceMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setVoiceMode(isOn ? 'off' : mode)}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                style={{
                  color: isOn ? '#9B6BA0' : '#8A6A4A',
                  background: isOn ? '#9B6BA015' : 'transparent',
                  border: `1px solid ${isOn ? '#9B6BA040' : '#C4A06010'}`,
                  opacity: isOn ? 1 : mode === 'off' ? 0.3 : 0.5,
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>
        {voiceMode !== 'off' && (
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                speed
              </span>
              <div
                className="flex gap-[2px] cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setVoiceRate(0.5 + ((e.clientX - rect.left) / rect.width) * 0.5);
                }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all"
                    style={{
                      width: 8,
                      height: 5,
                      background: '#9B6BA0',
                      opacity: i / 5 <= (voiceRate - 0.5) / 0.5 ? 0.4 + (i / 5) * 0.4 : 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                pitch
              </span>
              <div
                className="flex gap-[2px] cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setVoicePitch(0.5 + ((e.clientX - rect.left) / rect.width) * 1.0);
                }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all"
                    style={{
                      width: 8,
                      height: 5,
                      background: '#9B6BA0',
                      opacity: i / 5 <= (voicePitch - 0.5) / 1.0 ? 0.4 + (i / 5) * 0.4 : 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                vol
              </span>
              <div
                className="flex gap-[2px] cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setVoiceVolume(Math.max(0.1, (e.clientX - rect.left) / rect.width));
                }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all"
                    style={{
                      width: 8,
                      height: 5,
                      background: '#9B6BA0',
                      opacity: i / 5 <= voiceVolume ? 0.4 + (i / 5) * 0.4 : 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layers — closable, 3-column grid with volume */}
      <div className="px-2">
        <button
          type="button"
          onClick={() => setLayersOpen((s) => !s)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 py-2"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: '#7A5438' }}
          >
            layers
          </span>
          <span
            style={{
              transform: layersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#7A543880',
            }}
          >
            ▾
          </span>
        </button>
        {layersOpen && (
          <div className="animate-in fade-in duration-150 space-y-2 pt-1">
            {/* Layer reverb control */}
            <div className="flex items-center justify-center gap-2">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                layer reverb
              </span>
              <div
                className="flex gap-[2px] cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setLayerReverb(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                }}
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-all"
                    style={{
                      width: 10,
                      height: 6,
                      background: '#A0907A',
                      opacity: i / 7 <= layerReverb / 100 ? 0.4 + (i / 7) * 0.4 : 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['real', 'nature', 'tones', 'texture', 'ambient'] as const).map((group) => (
                <div key={group} className="space-y-1">
                  <p
                    className="uppercase tracking-[0.14em] text-center"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#5C3018',
                      opacity: 0.6,
                    }}
                  >
                    {group}
                  </p>
                  {ALL_LAYERS.filter((l) => l.group === group).map((l) => {
                    const vol = activeLayers[l.id] || 0;
                    const isOn = vol > 0;
                    return (
                      <div key={l.id} className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => toggleLayer(l.id)}
                          className="flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 transition-all"
                          style={{
                            background: isOn ? `${l.color}15` : 'transparent',
                            border: `1px solid ${isOn ? `${l.color}35` : '#C4A06010'}`,
                          }}
                        >
                          <span
                            className="block rounded-full shrink-0"
                            style={{
                              width: 7,
                              height: 7,
                              background: l.color,
                              opacity: isOn ? 1 : 0.3,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '11px',
                              fontWeight: isOn ? 700 : 500,
                              color: isOn ? l.color : '#8A6A4A',
                              opacity: isOn ? 1 : 0.5,
                            }}
                          >
                            {l.label}
                          </span>
                        </button>
                        {isOn && (
                          <div
                            className="flex gap-[2px] px-1 cursor-pointer"
                            onClick={(e) => {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              const x = Math.max(
                                0.05,
                                Math.min(1, (e.clientX - rect.left) / rect.width),
                              );
                              setLayerVol(l.id, x);
                            }}
                          >
                            {Array.from({ length: 6 }, (_, i) => (
                              <div
                                key={i}
                                className="flex-1 rounded-[2px] transition-all"
                                style={{
                                  height: 4,
                                  background: l.color,
                                  opacity: i / 5 <= vol ? 0.4 + (i / 5) * 0.4 : 0.08,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible: Genres */}
      <div className="px-2">
        <button
          type="button"
          onClick={() => setGenresOpen((s) => !s)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 py-2"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: '#C4A060' }}
          >
            genres
          </span>
          <span
            style={{
              transform: genresOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#C4A060',
            }}
          >
            ▾
          </span>
        </button>
        {genresOpen && (
          <div className="animate-in fade-in duration-150 flex flex-wrap justify-center gap-2 pt-1">
            {GENRES.map((g) => {
              const isActive = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => applyGenre(g)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition-all"
                  style={{
                    background: isActive ? `${g.color}18` : '#C4A06006',
                    border: `1px solid ${isActive ? `${g.color}40` : '#C4A06015'}`,
                  }}
                  title={g.subtitle}
                >
                  <span
                    className="block rounded-full shrink-0"
                    style={{
                      width: 8,
                      height: 8,
                      background: g.color,
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? g.color : '#7A5438',
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Collapsible: Brain States */}
      <div className="px-2">
        <button
          type="button"
          onClick={() => setBrainStatesOpen((s) => !s)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 py-2"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: '#C4A060' }}
          >
            brain states
          </span>
          <span
            style={{
              transform: brainStatesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#C4A060',
            }}
          >
            ▾
          </span>
        </button>
        {brainStatesOpen && (
          <div className="animate-in fade-in duration-150">
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {PRESETS.map((p) => {
                const isActive = p.base === baseFreq && p.beat === beatFreq;
                const presetLayers = PRESET_LAYERS[p.id] || [];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPresetWithLayers(p)}
                    className="cursor-pointer rounded-full px-3 py-1.5 text-left transition-all"
                    style={{
                      background: isActive ? `${p.color}15` : 'transparent',
                      border: `1px solid ${isActive ? `${p.color}40` : '#C4A06015'}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isActive ? p.color : '#7A5438',
                        opacity: isActive ? 1 : 0.6,
                      }}
                    >
                      {p.label}
                    </span>
                    {isActive && presetLayers.length > 0 && (
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '10px',
                          color: p.color,
                          opacity: 0.6,
                          marginLeft: 4,
                        }}
                      >
                        +{presetLayers.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible: Saved Sounds */}
      <div className="px-2">
        <button
          type="button"
          onClick={() => setSavedSoundsOpen((s) => !s)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 py-2"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="text-center text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: '#C4A060' }}
          >
            saved sounds
          </span>
          <span
            style={{
              transform: savedSoundsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#C4A060',
            }}
          >
            ▾
          </span>
        </button>
        {savedSoundsOpen && (
          <div className="animate-in fade-in duration-150 space-y-2 pt-1">
            {/* Save input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveMix();
                }}
                placeholder="name this mix..."
                className="flex-1 rounded-lg border bg-transparent px-2 py-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  color: '#5C3018',
                  borderColor: '#C4A06025',
                }}
              />
              <button
                type="button"
                onClick={saveMix}
                className="cursor-pointer rounded-lg px-2 py-1"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#7AAA58',
                  background: '#7AAA5810',
                  border: '1px solid #7AAA5830',
                }}
              >
                save
              </button>
            </div>
            {/* Saved mixes list */}
            {savedMixes.length > 0 && (
              <div className="space-y-1">
                {savedMixes.map((mix, i) => (
                  <button
                    key={`${mix.name}-${i}`}
                    type="button"
                    onClick={() => loadMix(mix)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-all hover:bg-[#C4A06008]"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <span
                      className="block rounded-full"
                      style={{ width: 8, height: 8, background: '#C4A060', opacity: 0.5 }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '13px',
                        color: '#5C3018',
                        fontWeight: 600,
                      }}
                    >
                      {mix.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '11px',
                        color: '#8A6A4A',
                        opacity: 0.4,
                        marginLeft: 'auto',
                      }}
                    >
                      {mix.beat}Hz · {Object.values(mix.layers).filter((v) => v > 0).length} layers
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adaptive suggestion */}
      {suggestion && showSuggestion && (
        <div className="flex items-center justify-center gap-2 px-2">
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#7A5438',
              opacity: 0.6,
            }}
          >
            {suggestion.reason}
          </p>
          <button
            type="button"
            onClick={() => {
              const p = PRESETS.find((pr) => pr.id === suggestion.preset);
              if (p) {
                applyPresetWithLayers(p);
              }
              setShowSuggestion(false);
            }}
            className="shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all"
            style={{ color: '#C4A060', background: '#C4A06012', border: '1px solid #C4A06025' }}
          >
            try
          </button>
        </div>
      )}
    </div>
  );
}

const RAINBOW = [
  '#E0908A',
  '#E8A878',
  '#D8C078',
  '#C0D088',
  '#A0C8A0',
  '#90C0C0',
  '#A0B0D0',
  '#B0A0C8',
  '#C8A8C8',
  '#E0908A',
];

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  color,
  onChange,
  toggleOn,
  onToggle,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
  toggleOn?: boolean;
  onToggle?: () => void;
}) {
  const count = 20;
  const pct = (value - min) / (max - min);
  const activeIdx = Math.round(pct * (count - 1));
  const sq = 12;
  const gap = 3;
  const muted = toggleOn === false;
  return (
    <div className="flex items-center gap-2" style={{ opacity: muted ? 0.35 : 1 }}>
      {/* Label — clickable to toggle if toggle exists */}
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            color: muted ? '#8A6A4A' : '#7A5438',
            fontWeight: 600,
            width: 48,
            flexShrink: 0,
            textAlign: 'right',
            background: 'none',
            border: 'none',
            textDecoration: muted ? 'line-through' : 'none',
          }}
          title={muted ? `tap to enable ${label}` : `tap to mute ${label}`}
        >
          {label}
        </button>
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            color: '#7A5438',
            opacity: 0.7,
            width: 48,
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
          {label}
        </span>
      )}
      <div className="flex flex-1 justify-center" style={{ gap }}>
        {Array.from({ length: count }, (_, i) => {
          const selected = i === activeIdx;
          const segColor = RAINBOW[i % RAINBOW.length];
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(Math.round(min + (i / (count - 1)) * (max - min)))}
              className="cursor-pointer rounded-[3px] transition-all"
              style={{
                width: sq,
                height: sq,
                background: segColor,
                opacity: selected ? 1 : i <= activeIdx ? 0.55 : 0.2,
                border: 'none',
                transform: selected ? 'scale(1.15)' : 'scale(1)',
                boxShadow: selected ? `0 4px 12px -4px ${segColor}` : 'none',
              }}
            />
          );
        })}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          color,
          fontWeight: 600,
          width: 40,
          flexShrink: 0,
          textAlign: 'left',
        }}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}
