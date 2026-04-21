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
  { id: 'deep-sleep', label: 'Deep Sleep', base: 180, beat: 2, color: '#9B6BA0' },
  { id: 'meditation', label: 'Meditation', base: 200, beat: 6, color: '#6890B0' },
  { id: 'creativity', label: 'Creativity', base: 210, beat: 7, color: '#D4805A' },
  { id: 'calm-focus', label: 'Calm Focus', base: 220, beat: 10, color: '#7AAA58' },
  { id: 'active-mind', label: 'Active Mind', base: 240, beat: 18, color: '#C4A060' },
  { id: 'peak', label: 'Peak', base: 260, beat: 35, color: '#D06040' },
];

// ── Soundscape layers ──
interface LayerDef {
  id: string;
  label: string;
  color: string;
  group: 'nature' | 'tones' | 'texture';
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
    label: 'Rain',
    color: '#6890B0',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'highpass', 800, 3.5),
  },
  {
    id: 'ocean',
    label: 'Ocean',
    color: '#5A8AAA',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 300, 4),
  },
  {
    id: 'wind',
    label: 'Wind',
    color: '#A0C8A0',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 400, 2.5),
  },
  {
    id: 'fire',
    label: 'Fire',
    color: '#D4805A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 600, 2),
  },
  {
    id: 'forest',
    label: 'Forest',
    color: '#7AAA58',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 2000, 1.5),
  },
  {
    id: 'thunder',
    label: 'Thunder',
    color: '#8A6A4A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 100, 5),
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
    build: (ctx) => buildNoise(ctx, 'highpass', 3000, 0.8),
  },
  {
    id: 'breath',
    label: 'Breath',
    color: '#C8C8A0',
    group: 'texture',
    build: (ctx) => buildNoise(ctx, 'bandpass', 500, 1.2),
  },
  {
    id: 'hum',
    label: 'Room Hum',
    color: '#A0907A',
    group: 'texture',
    build: (ctx) => buildTone(ctx, 60, 'sine'),
  },
];

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
    id: 'trippy',
    label: 'Trippy',
    color: '#9B6BA0',
    subtitle: 'deep · psychedelic · floating',
    beat: 6,
    base: 180,
    layers: ['ocean', 'harmonic', 'sub', 'breath'],
  },
  {
    id: 'classical',
    label: 'Classical',
    color: '#C4A060',
    subtitle: 'warm · elegant · grounded',
    beat: 10,
    base: 220,
    layers: ['fire', 'bowl', 'drone'],
  },
  {
    id: 'groovy',
    label: 'Groovy Slow',
    color: '#D4805A',
    subtitle: 'smooth · rhythmic · warm',
    beat: 8,
    base: 200,
    layers: ['rain', 'sub', 'crackle'],
  },
  {
    id: 'logical',
    label: 'Logical',
    color: '#6890B0',
    subtitle: 'clear · precise · sharp',
    beat: 14,
    base: 250,
    layers: ['wind', 'drone', 'hum'],
  },
  {
    id: 'night',
    label: 'Night',
    color: '#5A7A8A',
    subtitle: 'silent · vast · still',
    beat: 3,
    base: 160,
    layers: ['ocean', 'sub', 'breath'],
  },
  {
    id: 'forest',
    label: 'Forest',
    color: '#7AAA58',
    subtitle: 'alive · green · organic',
    beat: 7,
    base: 210,
    layers: ['forest', 'wind', 'fire'],
  },
];

function getBrainState(beat: number): string {
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

export default function BinauralTuner() {
  const [playing, setPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(220);
  const [beatFreq, setBeatFreq] = useState(10);
  const [volume, setVolume] = useState(0.3);
  const [activeLayers, setActiveLayers] = useState<Record<string, number>>({});
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [view, setView] = useState<'presets' | 'layers' | 'genres'>('presets');

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: startLayer uses refs, stable in component body
  const startAudio = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gainRef.current = gain;

    const merger = ctx.createChannelMerger(2);

    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = baseFreq;
    const gL = ctx.createGain();
    gL.gain.value = 1;
    oscL.connect(gL);
    gL.connect(merger, 0, 0);
    oscLeftRef.current = oscL;

    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = baseFreq + beatFreq;
    const gR = ctx.createGain();
    gR.gain.value = 1;
    oscR.connect(gR);
    gR.connect(merger, 0, 1);
    oscRightRef.current = oscR;

    merger.connect(gain);
    gain.connect(ctx.destination);

    oscL.start();
    oscR.start();
    setPlaying(true);

    // Start any active layers
    for (const [layerId, vol] of Object.entries(activeLayers)) {
      if (vol > 0) startLayer(ctx, layerId, vol);
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

  function startLayer(ctx: AudioContext, layerId: string, vol: number) {
    const def = LAYERS.find((l) => l.id === layerId);
    if (!def) return;
    const { node, source } = def.build(ctx, baseFreq);
    const layerGain = ctx.createGain();
    layerGain.gain.value = vol;
    node.connect(layerGain);
    layerGain.connect(ctx.destination);
    if ('start' in source) source.start();
    layerNodesRef.current.set(layerId, { source, gain: layerGain });
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
    setActiveGenre(genre.id);
    setBaseFreq(genre.base);
    setBeatFreq(genre.beat);
    // Stop all current layers
    if (ctxRef.current) {
      for (const [id, node] of layerNodesRef.current) {
        try {
          node.source.stop();
        } catch {}
        node.gain.disconnect();
        layerNodesRef.current.delete(id);
      }
    }
    // Set genre layers
    const newLayers: Record<string, number> = {};
    for (const id of genre.layers) {
      newLayers[id] = 0.2;
      if (ctxRef.current) startLayer(ctxRef.current, id, 0.2);
    }
    setActiveLayers(newLayers);
  }

  useEffect(() => {
    if (oscLeftRef.current) oscLeftRef.current.frequency.value = baseFreq;
    if (oscRightRef.current) oscRightRef.current.frequency.value = baseFreq + beatFreq;
  }, [baseFreq, beatFreq]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

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

  // Wave visualization
  const W = 300;
  const H = 60;
  const cy = H / 2;
  const wavelength = Math.max(20, 80 - beatFreq * 1.5);
  const amplitude = 15 + volume * 30;
  const points: string[] = [];
  for (let x = 0; x <= W; x += 2) {
    const y = cy + Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
    points.push(`${x},${y.toFixed(1)}`);
  }
  const pathD = `M ${points.join(' L ')}`;
  const preset = PRESETS.find((p) => p.beat === beatFreq && p.base === baseFreq);
  const genre = GENRES.find((g) => g.id === activeGenre);
  const activeColor = genre?.color || preset?.color || '#C4A060';
  const activeLayerCount = Object.values(activeLayers).filter((v) => v > 0).length;

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
          Tuner
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
          find your frequency
        </p>
      </div>

      {/* Adaptive suggestion */}
      {suggestion && showSuggestion && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 animate-in fade-in duration-300"
          style={{ background: '#C4A06008', border: '1px solid #C4A06020' }}
        >
          <span
            className="mt-0.5 block shrink-0 rotate-45 rounded-[2px]"
            style={{ width: 8, height: 8, background: '#C4A060' }}
          />
          <div className="flex-1">
            <p
              className="italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                color: '#7A5438',
                lineHeight: 1.5,
              }}
            >
              {suggestion.reason}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const p = PRESETS.find((pr) => pr.id === suggestion.preset);
              if (p) {
                setBaseFreq(p.base);
                setBeatFreq(p.beat);
              }
              setShowSuggestion(false);
            }}
            className="shrink-0 cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
            style={{ color: '#C4A060', background: '#C4A06015', border: '1px solid #C4A06030' }}
          >
            try it
          </button>
          <button
            type="button"
            onClick={() => setShowSuggestion(false)}
            className="shrink-0 cursor-pointer text-[11px] transition-all"
            style={{ color: '#8A6A4A', opacity: 0.4, background: 'none', border: 'none' }}
          >
            dismiss
          </button>
        </div>
      )}

      {/* Wave visualization */}
      <div className="flex justify-center">
        <svg width={W} height={H}>
          <line x1={0} y1={cy} x2={W} y2={cy} stroke="#C4A06015" strokeWidth={1} />
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

      {/* Brain state + play */}
      <div className="flex items-center justify-center gap-4">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            color: activeColor,
            fontWeight: 600,
            opacity: 0.8,
          }}
        >
          {getBrainState(beatFreq)} · {beatFreq}Hz
        </p>
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
        {activeLayerCount > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: '#8A6A4A',
              opacity: 0.5,
            }}
          >
            {activeLayerCount} layer{activeLayerCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* View tabs: presets / genres / layers */}
      <div className="flex justify-center gap-1.5">
        {(['presets', 'genres', 'layers'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
            style={{
              color: '#C4A060',
              background: view === v ? '#C4A06012' : 'transparent',
              border: `1px solid ${view === v ? '#C4A06040' : '#C4A06015'}`,
              opacity: view === v ? 1 : 0.5,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* ── PRESETS VIEW ── */}
      {view === 'presets' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-1.5">
            {PRESETS.map((p) => {
              const isActive = preset?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setBaseFreq(p.base);
                    setBeatFreq(p.beat);
                    setActiveGenre(null);
                  }}
                  className="cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
                  style={{
                    color: p.color,
                    background: isActive ? `${p.color}15` : 'transparent',
                    border: `1px solid ${isActive ? `${p.color}40` : `${p.color}18`}`,
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          {/* Sliders */}
          <div className="space-y-3 px-2">
            <SliderRow
              label="binaural beat"
              value={beatFreq}
              min={1}
              max={40}
              unit="Hz"
              color={activeColor}
              onChange={setBeatFreq}
            />
            <SliderRow
              label="base tone"
              value={baseFreq}
              min={100}
              max={400}
              unit="Hz"
              color="#7A5438"
              onChange={setBaseFreq}
            />
            <SliderRow
              label="volume"
              value={Math.round(volume * 100)}
              min={0}
              max={100}
              unit="%"
              color="#7A5438"
              onChange={(v) => setVolume(v / 100)}
            />
          </div>
        </div>
      )}

      {/* ── GENRES VIEW ── */}
      {view === 'genres' && (
        <div className="space-y-2">
          {GENRES.map((g) => {
            const isActive = activeGenre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => applyGenre(g)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                style={{
                  background: isActive ? `${g.color}10` : 'transparent',
                  border: `1px solid ${isActive ? `${g.color}30` : 'transparent'}`,
                }}
              >
                <span
                  className="block shrink-0 rounded-full"
                  style={{
                    width: 14,
                    height: 14,
                    background: g.color,
                    opacity: isActive ? 1 : 0.6,
                  }}
                />
                <div className="flex-1">
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: isActive ? g.color : '#5C3018',
                    }}
                  >
                    {g.label}
                  </p>
                  <p
                    className="italic"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      color: '#8A6A4A',
                      opacity: 0.7,
                    }}
                  >
                    {g.subtitle}
                  </p>
                </div>
                {isActive && (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      color: g.color,
                      fontWeight: 600,
                    }}
                  >
                    {g.layers.length} layers
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── LAYERS VIEW ── */}
      {view === 'layers' && (
        <div className="space-y-4 px-1">
          {(['nature', 'tones', 'texture'] as const).map((group) => (
            <div key={group} className="space-y-1.5">
              <p
                className="uppercase tracking-[0.16em]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                {group}
              </p>
              <div className="space-y-1">
                {LAYERS.filter((l) => l.group === group).map((l) => {
                  const vol = activeLayers[l.id] || 0;
                  const isOn = vol > 0;
                  return (
                    <div key={l.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleLayer(l.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition-all"
                        style={{
                          background: isOn ? `${l.color}12` : 'transparent',
                          border: `1px solid ${isOn ? `${l.color}30` : '#C4A06012'}`,
                          flex: '0 0 110px',
                        }}
                      >
                        <span
                          className="block rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            background: l.color,
                            opacity: isOn ? 1 : 0.3,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: isOn ? l.color : '#8A6A4A',
                            opacity: isOn ? 1 : 0.5,
                          }}
                        >
                          {l.label}
                        </span>
                      </button>
                      {isOn && (
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(vol * 100)}
                          onChange={(e) => setLayerVol(l.id, Number(e.target.value) / 100)}
                          className="flex-1"
                          style={{ accentColor: l.color }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  color,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            color: '#7A5438',
            opacity: 0.7,
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color, fontWeight: 600 }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}
