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
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const [saveName, setSaveName] = useState('');
  const [_showSave, setShowSave] = useState(false);
  const crossfadingRef = useRef(false);

  // Collapsible section state
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

  function startLayerWithFadeIn(ctx: AudioContext, layerId: string, targetVol: number) {
    const def = LAYERS.find((l) => l.id === layerId);
    if (!def) return;
    const { node, source } = def.build(ctx, baseFreq);
    const layerGain = ctx.createGain();
    layerGain.gain.value = 0;
    node.connect(layerGain);
    layerGain.connect(ctx.destination);
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

      {/* Sliders: beat, tone, reverb — always visible */}
      <div className="space-y-3 px-2">
        <SliderRow
          label="beat"
          value={beatFreq}
          min={1}
          max={10}
          unit="Hz"
          color={activeColor}
          onChange={setBeatFreq}
        />
        <SliderRow
          label="tone"
          value={baseFreq}
          min={30}
          max={80}
          unit="Hz"
          color="#7A5438"
          onChange={setBaseFreq}
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
      </div>

      {/* Toggles: tone on/off, binaural on/off, wave on/off — always visible */}
      <div className="space-y-2 px-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setBaseToneOn((s) => !s)}
            className="shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
            style={{
              color: baseToneOn ? '#7A5438' : '#8A6A4A',
              background: baseToneOn ? '#7A543815' : 'transparent',
              border: `1px solid ${baseToneOn ? '#7A543840' : '#C4A06018'}`,
              opacity: baseToneOn ? 1 : 0.4,
            }}
          >
            tone {baseToneOn ? 'on' : 'off'}
          </button>
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#8A6A4A',
              opacity: 0.45,
            }}
          >
            steady low tone — the foundation frequency your brain locks onto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setBinauralOn((s) => !s)}
            className="shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
            style={{
              color: binauralOn ? activeColor : '#8A6A4A',
              background: binauralOn ? `${activeColor}15` : 'transparent',
              border: `1px solid ${binauralOn ? `${activeColor}40` : '#C4A06018'}`,
              opacity: binauralOn ? 1 : 0.4,
            }}
          >
            binaural {binauralOn ? 'on' : 'off'}
          </button>
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#8A6A4A',
              opacity: 0.45,
            }}
          >
            second tone slightly higher — the difference creates a pulsing beat in your brain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTremolo((s) => !s)}
            className="shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
            style={{
              color: tremolo ? '#6890B0' : '#8A6A4A',
              background: tremolo ? '#6890B015' : 'transparent',
              border: `1px solid ${tremolo ? '#6890B040' : '#C4A06018'}`,
              opacity: tremolo ? 1 : 0.4,
            }}
          >
            wave {tremolo ? 'on' : 'off'}
          </button>
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              color: '#8A6A4A',
              opacity: 0.45,
            }}
          >
            gentle volume swell — like breathing
          </p>
        </div>
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

      {/* Layers section — always visible */}
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
                          const lightness = 1 - t * 0.3;
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
          <div className="animate-in fade-in duration-150 space-y-2">
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
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}) {
  const count = 20;
  const pct = (value - min) / (max - min);
  const activeIdx = Math.round(pct * (count - 1));
  const sq = 12;
  const gap = 3;
  return (
    <div className="flex items-center gap-3">
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
