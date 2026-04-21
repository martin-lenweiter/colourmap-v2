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
    build: (ctx) => buildNoise(ctx, 'highpass', 800, 1.2),
  },
  {
    id: 'ocean',
    label: 'Ocean',
    color: '#5A8AAA',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 300, 1.5),
  },
  {
    id: 'wind',
    label: 'Wind',
    color: '#A0C8A0',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 400, 1.0),
  },
  {
    id: 'fire',
    label: 'Fire',
    color: '#D4805A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 600, 0.8),
  },
  {
    id: 'forest',
    label: 'Forest',
    color: '#7AAA58',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'bandpass', 2000, 0.6),
  },
  {
    id: 'thunder',
    label: 'Thunder',
    color: '#8A6A4A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'lowpass', 100, 1.8),
  },
  {
    id: 'birds',
    label: 'Birds',
    color: '#C8906A',
    group: 'nature',
    build: (ctx) => buildNoise(ctx, 'highpass', 3500, 0.4),
  },
  {
    id: 'waves',
    label: 'Waves',
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
  const [binauralOn, setBinauralOn] = useState(true);
  const panLRef = useRef<StereoPannerNode | null>(null);
  const panRRef = useRef<StereoPannerNode | null>(null);
  const binGainRef = useRef<GainNode | null>(null);
  const [baseFreq, setBaseFreq] = useState(60);
  const [beatFreq, setBeatFreq] = useState(4);
  const [volume, setVolume] = useState(0.15);
  const [activeLayers, setActiveLayers] = useState<Record<string, number>>({});
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [view, setView] = useState<'presets' | 'layers' | 'genres'>('presets');
  const [tremolo, setTremolo] = useState(false);
  const [tremoloSpeed, _setTremoloSpeed] = useState(0.15); // Hz — very slow wave
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
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
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

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
      const panL = ctx.createStereoPanner();
      panL.pan.value = -0.8;
      const panR = ctx.createStereoPanner();
      panR.pan.value = 0.8;
      panLRef.current = panL;
      panRRef.current = panR;

      // Binaural gain — can be muted independently
      const binGain = ctx.createGain();
      binGain.gain.value = binauralOn ? 1 : 0;
      binGainRef.current = binGain;

      oscL.connect(panL);
      panL.connect(binGain);
      oscR.connect(panR);
      panR.connect(binGain);

      binGain.connect(gain);
      gain.connect(ctx.destination);

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
    if (binGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      binGainRef.current.gain.cancelScheduledValues(now);
      binGainRef.current.gain.setValueAtTime(binGainRef.current.gain.value, now);
      binGainRef.current.gain.linearRampToValueAtTime(binauralOn ? 1 : 0, now + 0.5);
    }
  }, [binauralOn]);

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
  }, [tremolo, tremoloSpeed, volume]);

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
  const W = 320;
  const H = 100;
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
        {/* Binaural on/off */}
        <button
          type="button"
          onClick={() => setBinauralOn((s) => !s)}
          className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
          style={{
            color: binauralOn ? activeColor : '#8A6A4A',
            background: binauralOn ? `${activeColor}15` : 'transparent',
            border: `1px solid ${binauralOn ? `${activeColor}40` : '#C4A06018'}`,
            opacity: binauralOn ? 1 : 0.4,
          }}
        >
          binaural {binauralOn ? 'on' : 'off'}
        </button>
        <button
          type="button"
          onClick={() => setTremolo((s) => !s)}
          className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
          style={{
            color: tremolo ? '#6890B0' : '#8A6A4A',
            background: tremolo ? '#6890B015' : 'transparent',
            border: `1px solid ${tremolo ? '#6890B040' : '#C4A06018'}`,
            opacity: tremolo ? 1 : 0.4,
          }}
        >
          wave {tremolo ? 'on' : 'off'}
        </button>
      </div>

      {/* Adaptive suggestion — below the wave */}
      {suggestion && showSuggestion && (
        <div className="flex items-center justify-center gap-2">
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
                setBaseFreq(p.base);
                setBeatFreq(p.beat);
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

      {/* Audio error */}
      {audioError && (
        <p
          className="text-center"
          style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: '#D06040' }}
        >
          {audioError}
        </p>
      )}

      {/* View tabs: presets / genres / layers */}
      <div className="flex justify-center gap-1.5">
        {(
          [
            ['presets', 'sliders'],
            ['genres', 'genres'],
            ['layers', 'layers'],
          ] as const
        ).map(([v, label]) => (
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
            {label}
          </button>
        ))}
      </div>

      {/* ── SLIDERS VIEW ── */}
      {view === 'presets' && (
        <div className="space-y-4">
          <div className="space-y-3 px-2">
            <SliderRow
              label="binaural beat"
              value={beatFreq}
              min={1}
              max={10}
              unit="Hz"
              color={activeColor}
              onChange={setBeatFreq}
            />
            <SliderRow
              label="base tone"
              value={baseFreq}
              min={30}
              max={130}
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
                        <div
                          className="flex flex-1 gap-[2px] cursor-pointer"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const x = (e.clientX - rect.left) / rect.width;
                            setLayerVol(l.id, Math.max(0, Math.min(1, x)));
                          }}
                        >
                          {Array.from({ length: 8 }, (_, si) => {
                            const t = si / 7;
                            // Subtle degrade: lighten at start, full color at end
                            const lightness = 1 - t * 0.3; // 1.0 → 0.7
                            return (
                              <div
                                key={si}
                                className="flex-1 rounded-[3px] transition-all"
                                style={{
                                  height: 10,
                                  background: l.color,
                                  opacity: t <= vol ? 0.25 + t * 0.55 : 0.06,
                                  filter: `brightness(${lightness})`,
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save mix + saved mixes */}
      <div className="space-y-2 pt-2">
        {!showSave ? (
          <button
            type="button"
            onClick={() => setShowSave(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2 transition-all"
            style={{ background: '#C4A06008', border: '1px solid #C4A06018' }}
          >
            <span
              className="rotate-45 rounded-[2px] block"
              style={{ width: 8, height: 8, background: '#C4A060', opacity: 0.5 }}
            />
            <span
              className="italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                color: '#8A6A4A',
                opacity: 0.6,
              }}
            >
              save this mix
            </span>
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveMix();
              }}
              placeholder="name your mix..."
              autoFocus
              className="flex-1 rounded-lg border bg-transparent px-3 py-1.5 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                color: '#5C3018',
                borderColor: '#C4A06025',
              }}
            />
            <button
              type="button"
              onClick={saveMix}
              className="cursor-pointer rounded-lg px-3 py-1.5"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#7AAA58',
                background: '#7AAA5810',
                border: '1px solid #7AAA5830',
              }}
            >
              save
            </button>
            <button
              type="button"
              onClick={() => setShowSave(false)}
              className="cursor-pointer text-[11px]"
              style={{ color: '#8A6A4A', opacity: 0.4, background: 'none', border: 'none' }}
            >
              cancel
            </button>
          </div>
        )}
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
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}) {
  const count = 10;
  const pct = (value - min) / (max - min);
  const activeIdx = Math.round(pct * (count - 1));
  const sq = 20;
  const gap = 6;
  return (
    <div className="space-y-1.5">
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
      <div className="flex justify-center" style={{ gap }}>
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
    </div>
  );
}
