'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   LOFI LOOPER — chill beat maker with drum patterns + soft loops.
   Focus: relaxing lo-fi beats you can create in seconds.
   ═══════════════════════════════════════════════════════════ */

// ── Drum sounds via synthesis ──
function playKick(ctx: AudioContext, time: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
  gain.gain.setValueAtTime(vol, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.3);
}

function playSnare(ctx: AudioContext, time: number, vol: number) {
  // Noise burst
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.8;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.6, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.15);
  // Body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
  oscGain.gain.setValueAtTime(vol * 0.4, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.1);
}

function playHat(ctx: AudioContext, time: number, vol: number) {
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(time);
  noise.stop(time + 0.05);
}

function playRim(ctx: AudioContext, time: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, time);
  gain.gain.setValueAtTime(vol * 0.2, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.04);
}

// ── Types ──
type DrumType = 'kick' | 'snare' | 'hat' | 'rim';

const DRUMS: {
  id: DrumType;
  label: string;
  color: string;
  play: (ctx: AudioContext, time: number, vol: number) => void;
}[] = [
  { id: 'kick', label: 'Kick', color: '#D4805A', play: playKick },
  { id: 'snare', label: 'Snare', color: '#C4A060', play: playSnare },
  { id: 'hat', label: 'Hat', color: '#88B0C8', play: playHat },
  { id: 'rim', label: 'Rim', color: '#A0907A', play: playRim },
];

const STEPS = 16;

// ── Pre-made patterns ──
const PATTERNS: { id: string; label: string; grid: Record<DrumType, boolean[]> }[] = [
  {
    id: 'chill',
    label: 'Chill',
    grid: {
      kick: [
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      snare: [
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ],
      hat: [
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
      ],
      rim: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
  },
  {
    id: 'lofi',
    label: 'Lo-fi',
    grid: {
      kick: [
        true,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      snare: [
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        true,
      ],
      hat: [
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
      ],
      rim: [
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
      ],
    },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    grid: {
      kick: [
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      snare: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
      hat: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
      ],
      rim: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
  },
  {
    id: 'rain',
    label: 'Rainy',
    grid: {
      kick: [
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
      ],
      snare: [
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
      ],
      hat: [
        true,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        true,
        false,
        true,
        false,
        true,
        false,
        true,
        false,
      ],
      rim: [
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
      ],
    },
  },
];

const BPM_OPTIONS = [60, 70, 80, 90];

export default function LofiLooper() {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(70);
  const [volume, setVolume] = useState(0.4);
  const [currentStep, setCurrentStep] = useState(-1);
  const [grid, setGrid] = useState<Record<DrumType, boolean[]>>(() => ({
    kick: Array(STEPS).fill(false),
    snare: Array(STEPS).fill(false),
    hat: Array(STEPS).fill(false),
    rim: Array(STEPS).fill(false),
  }));
  const [_swing, _setSwing] = useState(0); // 0-0.3 — future use

  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  function getCtx() {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx uses ref
  const tick = useCallback(() => {
    const ctx = getCtx();
    const step = stepRef.current % STEPS;
    const g = gridRef.current;
    const now = ctx.currentTime;

    for (const drum of DRUMS) {
      if (g[drum.id][step]) {
        drum.play(ctx, now, volume);
      }
    }

    setCurrentStep(step);
    stepRef.current++;
  }, [volume]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx uses ref
  const start = useCallback(() => {
    if (timerRef.current) return;
    // Ensure AudioContext is created on user gesture
    getCtx();
    stepRef.current = 0;
    const stepMs = (60 / bpm / 4) * 1000; // 16th notes
    tick();
    timerRef.current = setInterval(tick, stepMs);
    setPlaying(true);
  }, [bpm, tick]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
    setCurrentStep(-1);
    stepRef.current = 0;
  }, []);

  // Restart loop when BPM changes while playing
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional restart on bpm change
  useEffect(() => {
    if (playing) {
      stop();
      setTimeout(() => start(), 50);
    }
  }, [bpm]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ctxRef.current) ctxRef.current.close();
    };
  }, []);

  function toggleCell(drum: DrumType, step: number) {
    setGrid((prev) => ({
      ...prev,
      [drum]: prev[drum].map((v, i) => (i === step ? !v : v)),
    }));
  }

  function loadPattern(pattern: (typeof PATTERNS)[0]) {
    setGrid({ ...pattern.grid });
  }

  function clearAll() {
    setGrid({
      kick: Array(STEPS).fill(false),
      snare: Array(STEPS).fill(false),
      hat: Array(STEPS).fill(false),
      rim: Array(STEPS).fill(false),
    });
  }

  return (
    <div className="space-y-5">
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
          Lo-fi Looper
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
          tap cells to build a beat
        </p>
      </div>

      {/* Pattern presets */}
      <div className="flex justify-center gap-1.5">
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => loadPattern(p)}
            className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
            style={{
              color: '#7A5438',
              background: '#C4A06008',
              border: '1px solid #C4A06020',
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={clearAll}
          className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
          style={{
            color: '#8A6A4A',
            opacity: 0.4,
            background: 'none',
            border: '1px solid #C4A06012',
          }}
        >
          clear
        </button>
      </div>

      {/* ── THE GRID ── */}
      <div className="space-y-1.5">
        {DRUMS.map((drum) => (
          <div key={drum.id} className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: 600,
                color: drum.color,
                width: 36,
                textAlign: 'right',
              }}
            >
              {drum.label}
            </span>
            <div className="flex flex-1 gap-[3px]">
              {Array.from({ length: STEPS }, (_, step) => {
                const active = grid[drum.id][step];
                const isCurrent = currentStep === step;
                const isDownbeat = step % 4 === 0;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => toggleCell(drum.id, step)}
                    className="flex-1 cursor-pointer rounded-[3px] transition-all"
                    style={{
                      height: 24,
                      background: active ? drum.color : isDownbeat ? '#C4A06012' : '#C4A06008',
                      opacity: active ? (isCurrent ? 1 : 0.7) : isCurrent ? 0.3 : 1,
                      border: 'none',
                      boxShadow: isCurrent && active ? `0 2px 8px -2px ${drum.color}` : 'none',
                      transform: isCurrent && active ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Play / Stop + BPM */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={playing ? stop : start}
          className="flex cursor-pointer items-center justify-center rounded-full transition-all"
          style={{
            width: 44,
            height: 44,
            background: playing ? '#D4805A20' : '#C4A06010',
            border: `2px solid ${playing ? '#D4805A60' : '#C4A06030'}`,
          }}
        >
          {playing ? (
            <div className="flex gap-1">
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 14, background: '#D4805A' }}
              />
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 14, background: '#D4805A' }}
              />
            </div>
          ) : (
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid #C4A060',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                marginLeft: 2,
              }}
            />
          )}
        </button>

        {/* BPM selector */}
        <div className="flex gap-1">
          {BPM_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBpm(b)}
              className="cursor-pointer rounded-lg px-2 py-1 transition-all"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                fontWeight: bpm === b ? 700 : 500,
                color: bpm === b ? '#5C3018' : '#8A6A4A',
                background: bpm === b ? '#C4A06012' : 'transparent',
                border: `1px solid ${bpm === b ? '#C4A06035' : '#C4A06012'}`,
                opacity: bpm === b ? 1 : 0.5,
              }}
            >
              {b}
            </button>
          ))}
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              color: '#8A6A4A',
              opacity: 0.5,
              alignSelf: 'center',
              marginLeft: 2,
            }}
          >
            bpm
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-1">
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            volume
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#C4A060',
              fontWeight: 600,
            }}
          >
            {Math.round(volume * 100)}%
          </span>
        </div>
        <div
          className="flex gap-[3px] cursor-pointer"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setVolume(Math.max(0.05, (e.clientX - rect.left) / rect.width));
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[3px] transition-all"
              style={{
                height: 10,
                background: '#C4A060',
                opacity: i / 9 <= volume ? 0.3 + (i / 9) * 0.5 : 0.08,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
