'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   MAGIC MAKER — visual sound instrument.
   Tap colored cells to play notes. Every note is in tune.
   Cruise control = auto-play meditation mode.
   ═══════════════════════════════════════════════════════════ */

// ── Musical scales (intervals from root in semitones) ──
const SCALES: Record<string, { name: string; intervals: number[] }> = {
  pentatonic: { name: 'Pentatonic', intervals: [0, 2, 4, 7, 9] },
  major: { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor: { name: 'Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  blues: { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
  japanese: { name: 'Japanese', intervals: [0, 1, 5, 7, 8] },
  arabic: { name: 'Arabic', intervals: [0, 1, 4, 5, 7, 8, 11] },
};

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ROOT_FREQ: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

// ── Instruments (oscillator type + ADSR envelope) ──
interface Instrument {
  id: string;
  name: string;
  color: string;
  type: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const INSTRUMENTS: Instrument[] = [
  {
    id: 'sine',
    name: 'Pure',
    color: '#6890B0',
    type: 'sine',
    attack: 0.05,
    decay: 0.3,
    sustain: 0.4,
    release: 0.8,
  },
  {
    id: 'bell',
    name: 'Bell',
    color: '#9B6BA0',
    type: 'sine',
    attack: 0.01,
    decay: 0.6,
    sustain: 0.1,
    release: 1.5,
  },
  {
    id: 'pluck',
    name: 'Pluck',
    color: '#7AAA58',
    type: 'triangle',
    attack: 0.005,
    decay: 0.2,
    sustain: 0.05,
    release: 0.4,
  },
  {
    id: 'pad',
    name: 'Pad',
    color: '#C4A060',
    type: 'sine',
    attack: 0.3,
    decay: 0.5,
    sustain: 0.6,
    release: 2.0,
  },
  {
    id: 'crystal',
    name: 'Crystal',
    color: '#88B0C8',
    type: 'sine',
    attack: 0.02,
    decay: 0.4,
    sustain: 0.2,
    release: 1.0,
  },
];

// ── Palettes ──
const PALETTES: Record<string, string[]> = {
  warm: ['#D4805A', '#C8906A', '#C4A060', '#D8C078', '#E8A878', '#E0908A', '#B8A080'],
  ocean: ['#5A8AAA', '#6890B0', '#88B0C8', '#A0C8D0', '#90C0C0', '#6AA0B0', '#5080A0'],
  forest: ['#7AAA58', '#6B7F4E', '#8CA46E', '#A0C8A0', '#7B9560', '#5F7447', '#90B078'],
  sunset: ['#D4805A', '#E0908A', '#C4A060', '#9B6BA0', '#D06040', '#C87050', '#E8A878'],
  mono: ['#5C3018', '#7A5438', '#8A6A4A', '#A08060', '#B8A080', '#C8B898', '#D8C8A8'],
};

// ── Cruise control patterns ──
type CruisePattern = 'breathing' | 'rain' | 'ascending' | 'random';

// Generate note frequencies for a scale
function buildNotes(root: string, scaleId: string, octaves: number): number[] {
  const base = ROOT_FREQ[root] || 261.63;
  const scale = SCALES[scaleId] || SCALES.pentatonic;
  const notes: number[] = [];
  for (let oct = 0; oct < octaves; oct++) {
    for (const interval of scale.intervals) {
      const semitones = interval + oct * 12;
      notes.push(base * 2 ** (semitones / 12));
    }
  }
  return notes;
}

export default function MagicMaker() {
  const [root, setRoot] = useState('C');
  const [scaleId, setScaleId] = useState('pentatonic');
  const [octaves, setOctaves] = useState(2);
  const [instrumentId, setInstrumentId] = useState('bell');
  const [paletteId, setPaletteId] = useState('warm');
  const [cruising, setCruising] = useState(false);
  const [cruisePattern, setCruisePattern] = useState<CruisePattern>('breathing');
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [volume, setVolume] = useState(0.3);
  const [cruiseSpeed, setCruiseSpeed] = useState(0.5); // 0=slow, 1=fast
  const [cellShape, setCellShape] = useState<'square' | 'circle'>('square');

  const ctxRef = useRef<AudioContext | null>(null);
  const cruiseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cruiseIdxRef = useRef(0);

  const notes = buildNotes(root, scaleId, octaves);
  const instrument = INSTRUMENTS.find((i) => i.id === instrumentId) || INSTRUMENTS[0];
  const palette = PALETTES[paletteId] || PALETTES.warm;
  const cols = Math.min(notes.length, Math.ceil(Math.sqrt(notes.length)));

  function getCtx() {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx uses ref, stable
  const playNote = useCallback(
    (freq: number, idx: number) => {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      osc.type = instrument.type;
      osc.frequency.value = freq;

      // For bell/crystal: add a harmonic
      let osc2: OscillatorNode | null = null;
      if (instrument.id === 'bell' || instrument.id === 'crystal') {
        osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * (instrument.id === 'bell' ? 2.756 : 3.0);
      }

      const env = ctx.createGain();
      const now = ctx.currentTime;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(volume, now + instrument.attack);
      env.gain.linearRampToValueAtTime(
        volume * instrument.sustain,
        now + instrument.attack + instrument.decay,
      );
      env.gain.linearRampToValueAtTime(
        0,
        now + instrument.attack + instrument.decay + instrument.release,
      );

      osc.connect(env);
      if (osc2) {
        const env2 = ctx.createGain();
        env2.gain.value = 0.15;
        osc2.connect(env2);
        env2.connect(env);
        osc2.start(now);
        osc2.stop(now + instrument.attack + instrument.decay + instrument.release + 0.1);
      }
      env.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + instrument.attack + instrument.decay + instrument.release + 0.1);

      // Visual feedback
      setActiveNotes((prev) => new Set(prev).add(idx));
      setTimeout(
        () => {
          setActiveNotes((prev) => {
            const next = new Set(prev);
            next.delete(idx);
            return next;
          });
        },
        (instrument.attack + instrument.decay) * 1000 + 200,
      );
    },
    [instrument, volume],
  );

  // Cruise control
  const cruiseStep = useCallback(() => {
    if (!cruising || notes.length === 0) return;

    let idx: number;
    if (cruisePattern === 'ascending') {
      idx = cruiseIdxRef.current % notes.length;
      cruiseIdxRef.current++;
    } else if (cruisePattern === 'random') {
      idx = Math.floor(Math.random() * notes.length);
    } else if (cruisePattern === 'breathing') {
      // Slow pendulum
      const period = notes.length * 2;
      const pos = cruiseIdxRef.current % period;
      idx = pos < notes.length ? pos : period - pos - 1;
      cruiseIdxRef.current++;
    } else {
      // Rain — sparse random
      idx = Math.floor(Math.random() * notes.length);
    }

    playNote(notes[idx], idx);

    const speedMult = 1.5 - cruiseSpeed; // 0.5=fast, 1.5=slow
    const interval =
      (cruisePattern === 'breathing'
        ? 600 + Math.random() * 400
        : cruisePattern === 'rain'
          ? 200 + Math.random() * 800
          : cruisePattern === 'ascending'
            ? 400 + Math.random() * 200
            : 300 + Math.random() * 600) * speedMult;

    cruiseRef.current = setTimeout(cruiseStep, interval);
  }, [cruising, cruisePattern, notes, playNote, cruiseSpeed]);

  useEffect(() => {
    if (cruising) {
      cruiseIdxRef.current = 0;
      cruiseStep();
    } else {
      if (cruiseRef.current) clearTimeout(cruiseRef.current);
    }
    return () => {
      if (cruiseRef.current) clearTimeout(cruiseRef.current);
    };
  }, [cruising, cruiseStep]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) ctxRef.current.close();
    };
  }, []);

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
          Magic Maker
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
          tap a cell to play · every note is in tune
        </p>
      </div>

      {/* ── THE GRID ── */}
      <div className="flex justify-center">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 6,
            maxWidth: 320,
            width: '100%',
          }}
        >
          {notes.map((freq, idx) => {
            const isActive = activeNotes.has(idx);
            const color = palette[idx % palette.length];
            const scale = SCALES[scaleId] || SCALES.pentatonic;
            const noteInScale = idx % scale.intervals.length;
            const _octave = Math.floor(idx / scale.intervals.length);
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const semitone = (ROOTS.indexOf(root) * 2 + scale.intervals[noteInScale]) % 12;
            const noteName = noteNames[semitone >= 0 ? semitone : 0];
            return (
              <button
                key={`${freq}-${idx}`}
                type="button"
                onClick={() => playNote(freq, idx)}
                className="cursor-pointer transition-all flex items-center justify-center"
                style={{
                  aspectRatio: '1',
                  background: color,
                  opacity: isActive ? 1 : 0.45,
                  border: 'none',
                  borderRadius: cellShape === 'circle' ? '50%' : '12px',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 16px -4px ${color}` : 'none',
                }}
              >
                {isActive && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#F5ECDC',
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {noteName}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CRUISE CONTROL ── */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setCruising((s) => !s)}
          className="flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-all"
          style={{
            background: cruising ? `${instrument.color}15` : '#C4A06008',
            border: `1px solid ${cruising ? `${instrument.color}40` : '#C4A06020'}`,
          }}
        >
          {cruising ? (
            <div className="flex gap-1">
              <span
                className="block rounded-sm"
                style={{ width: 3, height: 12, background: instrument.color }}
              />
              <span
                className="block rounded-sm"
                style={{ width: 3, height: 12, background: instrument.color }}
              />
            </div>
          ) : (
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderLeft: `10px solid ${instrument.color}`,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                marginLeft: 1,
              }}
            />
          )}
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 600,
              color: cruising ? instrument.color : '#7A5438',
            }}
          >
            {cruising ? 'stop' : 'cruise'}
          </span>
        </button>
        {/* Pattern selector */}
        <div className="flex gap-1">
          {(['breathing', 'rain', 'ascending', 'random'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCruisePattern(p)}
              className="cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: cruisePattern === p ? instrument.color : '#8A6A4A',
                background: cruisePattern === p ? `${instrument.color}12` : 'transparent',
                border: `1px solid ${cruisePattern === p ? `${instrument.color}30` : '#C4A06012'}`,
                opacity: cruisePattern === p ? 1 : 0.4,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="space-y-3 px-2">
        {/* Scale */}
        <div className="space-y-1.5">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            scale
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SCALES).map(([id, s]) => (
              <button
                key={id}
                type="button"
                onClick={() => setScaleId(id)}
                className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all"
                style={{
                  color: scaleId === id ? '#5C3018' : '#8A6A4A',
                  background: scaleId === id ? '#5C301810' : 'transparent',
                  border: `1px solid ${scaleId === id ? '#5C301830' : '#C4A06012'}`,
                  opacity: scaleId === id ? 1 : 0.5,
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Root note */}
        <div className="space-y-1.5">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            root note
          </p>
          <div className="flex gap-2">
            {ROOTS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoot(r)}
                className="cursor-pointer rounded-lg transition-all"
                style={{
                  width: 36,
                  height: 32,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: root === r ? 700 : 500,
                  color: root === r ? '#5C3018' : '#8A6A4A',
                  background: root === r ? '#C4A06015' : 'transparent',
                  border: `1px solid ${root === r ? '#C4A06040' : '#C4A06012'}`,
                  opacity: root === r ? 1 : 0.5,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Instrument */}
        <div className="space-y-1.5">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            instrument
          </p>
          <div className="flex gap-1.5">
            {INSTRUMENTS.map((inst) => (
              <button
                key={inst.id}
                type="button"
                onClick={() => setInstrumentId(inst.id)}
                className="flex-1 cursor-pointer rounded-lg py-1.5 text-center transition-all"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontWeight: instrumentId === inst.id ? 700 : 500,
                  color: instrumentId === inst.id ? inst.color : '#8A6A4A',
                  background: instrumentId === inst.id ? `${inst.color}12` : 'transparent',
                  border: `1px solid ${instrumentId === inst.id ? `${inst.color}35` : '#C4A06012'}`,
                  opacity: instrumentId === inst.id ? 1 : 0.5,
                }}
              >
                {inst.name}
              </button>
            ))}
          </div>
        </div>

        {/* Palette */}
        <div className="space-y-1.5">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            palette
          </p>
          <div className="flex gap-2">
            {Object.entries(PALETTES).map(([id, colors]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPaletteId(id)}
                className="flex cursor-pointer gap-[2px] rounded-lg px-2 py-1.5 transition-all"
                style={{
                  background: paletteId === id ? '#5C301808' : 'transparent',
                  border: `1px solid ${paletteId === id ? '#5C301825' : '#C4A06008'}`,
                }}
              >
                {colors.slice(0, 4).map((c, ci) => (
                  <span
                    key={`${id}-${ci}`}
                    className="block rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      background: c,
                      opacity: paletteId === id ? 1 : 0.4,
                    }}
                  />
                ))}
              </button>
            ))}
          </div>
        </div>

        {/* Shape + Speed */}
        <div className="flex gap-4">
          <div className="space-y-1">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#7A5438',
                opacity: 0.7,
              }}
            >
              shape
            </p>
            <div className="flex gap-1.5">
              {(['square', 'circle'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCellShape(s)}
                  className="cursor-pointer rounded-lg px-2 py-1 text-[11px] transition-all"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: cellShape === s ? 700 : 500,
                    color: cellShape === s ? '#5C3018' : '#8A6A4A',
                    background: cellShape === s ? '#C4A06010' : 'transparent',
                    border: `1px solid ${cellShape === s ? '#C4A06030' : '#C4A06010'}`,
                    opacity: cellShape === s ? 1 : 0.5,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1 flex-1">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#7A5438',
                opacity: 0.7,
              }}
            >
              cruise speed
            </p>
            <div
              className="flex gap-[2px] cursor-pointer"
              onClick={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setCruiseSpeed(Math.max(0.1, Math.min(1, (e.clientX - r.left) / r.width)));
              }}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[3px] transition-all"
                  style={{
                    height: 20,
                    background: instrument.color,
                    opacity: i / 7 <= cruiseSpeed ? 0.3 + (i / 7) * 0.5 : 0.08,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Octaves + Volume */}
        <div className="flex gap-4">
          <div className="space-y-1 flex-1">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#7A5438',
                opacity: 0.7,
              }}
            >
              octaves
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOctaves(o)}
                  className="flex-1 cursor-pointer rounded-lg py-1 text-center transition-all"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '13px',
                    fontWeight: octaves === o ? 700 : 500,
                    color: octaves === o ? '#5C3018' : '#8A6A4A',
                    background: octaves === o ? '#C4A06012' : 'transparent',
                    border: `1px solid ${octaves === o ? '#C4A06035' : '#C4A06012'}`,
                    opacity: octaves === o ? 1 : 0.5,
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1 flex-1">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#7A5438',
                opacity: 0.7,
              }}
            >
              volume
            </p>
            <div
              className="flex gap-[2px] cursor-pointer"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setVolume(Math.max(0.05, (e.clientX - rect.left) / rect.width));
              }}
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[3px] transition-all"
                  style={{
                    height: 24,
                    background: instrument.color,
                    opacity: i / 7 <= volume ? 0.3 + (i / 7) * 0.5 : 0.08,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
