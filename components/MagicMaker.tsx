'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { playSampledNote, type SamplePackId } from '@/lib/sample-pack';
import { type SaveStatus, saveToNotebook } from '@/lib/save-to-notebook';

/* ═══════════════════════════════════════════════════════════
   MAGIC MAKER — visual sound instrument.
   Tap colored cells to play notes. Every note is in tune.
   Cruise control = auto-play meditation mode.
   Loop studio = record layers over a fixed-length loop.
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
// `sampledPack` flips an instrument to play real CC0 samples from
// public/sounds/<pack>/ instead of the oscillator synth. Attack/decay/
// sustain/release are ignored in sampled mode — the recording carries
// its own envelope.
interface Instrument {
  id: string;
  name: string;
  color: string;
  type: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  sampledPack?: SamplePackId;
}

const INSTRUMENTS: Instrument[] = [
  {
    id: 'pure',
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
  {
    id: 'warm',
    name: 'Warm',
    color: '#D4805A',
    type: 'triangle',
    attack: 0.1,
    decay: 0.4,
    sustain: 0.5,
    release: 1.2,
  },
  {
    id: 'strings',
    name: 'Strings',
    color: '#A0907A',
    type: 'sawtooth',
    attack: 0.2,
    decay: 0.3,
    sustain: 0.7,
    release: 1.5,
  },
  {
    id: 'glass',
    name: 'Glass',
    color: '#5A8AAA',
    type: 'sine',
    attack: 0.005,
    decay: 0.8,
    sustain: 0.05,
    release: 2.0,
  },
  {
    id: 'organ',
    name: 'Organ',
    color: '#8A6A4A',
    type: 'square',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.8,
    release: 0.3,
  },
  {
    id: 'flute',
    name: 'Flute',
    color: '#90C0C0',
    type: 'sine',
    attack: 0.08,
    decay: 0.2,
    sustain: 0.6,
    release: 0.5,
  },
  {
    id: 'marimba',
    name: 'Marimba',
    color: '#C87050',
    type: 'triangle',
    attack: 0.003,
    decay: 0.15,
    sustain: 0.02,
    release: 0.3,
  },
  {
    id: 'choir',
    name: 'Choir',
    color: '#B0A0C8',
    type: 'sine',
    attack: 0.4,
    decay: 0.3,
    sustain: 0.7,
    release: 2.0,
  },
  {
    id: 'bass',
    name: 'Bass',
    color: '#5C3018',
    type: 'sine',
    attack: 0.01,
    decay: 0.3,
    sustain: 0.2,
    release: 0.2,
  },
  {
    id: 'harp',
    name: 'Harp',
    color: '#C8B898',
    type: 'triangle',
    attack: 0.01,
    decay: 0.5,
    sustain: 0.15,
    release: 1.0,
  },
  {
    id: 'lead',
    name: 'Lead',
    color: '#D06040',
    type: 'sawtooth',
    attack: 0.01,
    decay: 0.15,
    sustain: 0.5,
    release: 0.3,
  },
  {
    id: 'ambient',
    name: 'Ambient',
    color: '#A0C8D0',
    type: 'sine',
    attack: 0.5,
    decay: 0.8,
    sustain: 0.6,
    release: 3.0,
  },
  // Cinematic pack
  {
    id: 'angels',
    name: 'Angels',
    color: '#E8D8C8',
    type: 'sine',
    attack: 0.6,
    decay: 0.5,
    sustain: 0.8,
    release: 3.5,
  },
  {
    id: 'epic',
    name: 'Epic',
    color: '#B33A2B',
    type: 'sawtooth',
    attack: 0.15,
    decay: 0.4,
    sustain: 0.7,
    release: 2.0,
  },
  {
    id: 'horizon',
    name: 'Horizon',
    color: '#D8A878',
    type: 'sine',
    attack: 0.8,
    decay: 0.6,
    sustain: 0.5,
    release: 4.0,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    color: '#E0844A',
    type: 'square',
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 0.15,
  },
  // Real sampled instruments — ADSR fields are unused in sampled mode
  // (the recording supplies its own envelope).
  {
    id: 'real-piano',
    name: 'Real Piano',
    color: '#5C3018',
    type: 'sine',
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    sampledPack: 'piano',
  },
  {
    id: 'real-violin',
    name: 'Real Violin',
    color: '#8A3A2B',
    type: 'sine',
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    sampledPack: 'violin',
  },
  {
    id: 'real-flute',
    name: 'Real Flute',
    color: '#6890B0',
    type: 'sine',
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    sampledPack: 'flute',
  },
  {
    id: 'real-harp',
    name: 'Real Harp',
    color: '#C4A060',
    type: 'sine',
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 0,
    sampledPack: 'harp',
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
type CruisePattern = 'breathing' | 'rain' | 'ascending' | 'random' | 'phrase' | 'loop';

// ── Musical phrases per scale — pre-composed note index sequences ──
const PHRASES: Record<string, number[][]> = {
  pentatonic: [
    [0, 2, 4, 2, 0, 4, 2, 0],
    [4, 3, 2, 0, 2, 3, 4, 4],
    [0, 0, 2, 4, 4, 2, 0, 2],
  ],
  blues: [
    [0, 2, 3, 4, 3, 2, 0, 5],
    [5, 4, 3, 2, 0, 2, 3, 0],
    [0, 3, 5, 3, 0, 2, 4, 2],
  ],
  japanese: [
    [0, 1, 2, 4, 2, 1, 0, 4],
    [4, 2, 1, 0, 1, 2, 4, 2],
    [0, 4, 2, 0, 1, 4, 2, 1],
  ],
  arabic: [
    [0, 1, 3, 4, 6, 4, 3, 1],
    [6, 4, 3, 1, 0, 1, 3, 4],
    [0, 3, 6, 3, 0, 1, 4, 1],
  ],
  minor: [
    [0, 2, 3, 4, 6, 4, 3, 2],
    [6, 4, 3, 2, 0, 2, 3, 4],
    [0, 3, 4, 6, 4, 2, 0, 3],
  ],
  major: [
    [0, 2, 4, 5, 4, 2, 0, 6],
    [6, 5, 4, 2, 0, 2, 4, 5],
    [0, 4, 2, 5, 4, 0, 2, 6],
  ],
};

// ── Loop layer type ──
interface LoopNote {
  idx: number;
  time: number; // ms offset within the loop duration
}

interface LoopLayer {
  id: number;
  notes: LoopNote[];
  color: string;
  muted: boolean;
}

const LOOP_DURATIONS = [
  { label: '2s', ms: 2000 },
  { label: '4s', ms: 4000 },
  { label: '8s', ms: 8000 },
  { label: '16s', ms: 16000 },
];

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

// Layer colors for loop layers
const LAYER_COLORS = ['#C4A060', '#6890B0', '#D4805A', '#7AAA58', '#9B6BA0', '#88B0C8'];

// ── localStorage keys ──
const LS_KEY_LAYERS = 'magicmaker-loopLayers';
const LS_KEY_DURATION_IDX = 'magicmaker-loopDurationIdx';
const LS_KEY_LOOP_SCALE = 'magicmaker-loopScaleId';

// ── Quantize helper ──
function quantizeNote(timeMs: number, loopDurationMs: number): number {
  const subdivisions = 16;
  const gridSize = loopDurationMs / subdivisions;
  return Math.round(timeMs / gridSize) * gridSize;
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
  const [cruiseSpeed, setCruiseSpeed] = useState(0.25);
  const [cellShape, setCellShape] = useState<'square' | 'circle'>('square');
  const [showInstruments, setShowInstruments] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [filterCutoff, setFilterCutoff] = useState(2000);
  const [reverbMix, setReverbMix] = useState(0.5);
  const [detune, setDetune] = useState(5);
  const reverbRef = useRef<ConvolverNode | null>(null);

  // ── Collapsible settings drawer ──
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── Quantize toggle ──
  const [quantize, setQuantize] = useState(false);

  // ── Loop state ──
  const [loopLayers, setLoopLayers] = useState<LoopLayer[]>([]);
  const [recording, setRecording] = useState(false);
  const [loopPlaying, setLoopPlaying] = useState(false);
  const [loopDurationIdx, setLoopDurationIdx] = useState(1); // default 4s
  const [momentStatus, setMomentStatus] = useState<SaveStatus>(null);

  /**
   * Save the current Magic Maker state to the user's Notebook.
   * Captures root + scale + instrument + palette + active loop
   * layers so the user can find this exact pattern later.
   */
  async function saveMomentToNotebook() {
    setMomentStatus('saving');
    const lines = [
      `Root ${root} · scale ${scaleId} · ${octaves} octave${octaves === 1 ? '' : 's'}`,
      `Instrument ${instrumentId} · palette ${paletteId}`,
      `Volume ${Math.round(volume * 100)}%`,
    ];
    if (loopLayers.length > 0) {
      lines.push(`${loopLayers.length} loop layer${loopLayers.length === 1 ? '' : 's'} recorded`);
    }
    if (cruising) {
      lines.push(`Cruise pattern: ${cruisePattern}`);
    }
    const result = await saveToNotebook({
      tool: 'magic-maker',
      content: lines.join('\n'),
    });
    setMomentStatus(result);
    setTimeout(() => setMomentStatus(null), 1800);
  }
  const [loopProgress, setLoopProgress] = useState(0); // 0-1 for timeline
  const [loopScaleId, setLoopScaleId] = useState('pentatonic');
  const recordStartRef = useRef(0);
  const currentLayerNotesRef = useRef<LoopNote[]>([]);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopStartRef = useRef(0);
  const loopAnimRef = useRef<number | null>(null);
  const nextLayerIdRef = useRef(1);

  // Track whether loop was playing when overdub started
  const overdubPlayingRef = useRef(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const cruiseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cruiseIdxRef = useRef(0);

  // ── localStorage: restore on mount ──
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const savedLayers = localStorage.getItem(LS_KEY_LAYERS);
      if (savedLayers) {
        const parsed = JSON.parse(savedLayers) as LoopLayer[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLoopLayers(parsed);
          // Ensure nextLayerIdRef is higher than any existing id
          const maxId = Math.max(...parsed.map((l) => l.id));
          nextLayerIdRef.current = maxId + 1;
        }
      }
      const savedDurIdx = localStorage.getItem(LS_KEY_DURATION_IDX);
      if (savedDurIdx !== null) {
        const idx = Number.parseInt(savedDurIdx, 10);
        if (idx >= 0 && idx < LOOP_DURATIONS.length) setLoopDurationIdx(idx);
      }
      const savedLoopScale = localStorage.getItem(LS_KEY_LOOP_SCALE);
      if (savedLoopScale && savedLoopScale in SCALES) setLoopScaleId(savedLoopScale);
    } catch {
      // localStorage unavailable — proceed with defaults
    }
    setHydrated(true);
  }, []);

  // ── localStorage: persist on change (after hydration) ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY_LAYERS, JSON.stringify(loopLayers));
    } catch {
      // quota exceeded or unavailable
    }
  }, [loopLayers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY_DURATION_IDX, String(loopDurationIdx));
    } catch {
      // quota exceeded or unavailable
    }
  }, [loopDurationIdx, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY_LOOP_SCALE, loopScaleId);
    } catch {
      // quota exceeded or unavailable
    }
  }, [loopScaleId, hydrated]);

  const notes = buildNotes(root, scaleId, octaves);
  const loopNotes = buildNotes(root, loopScaleId, octaves);
  const instrument = INSTRUMENTS.find((i) => i.id === instrumentId) || INSTRUMENTS[0];
  const palette = PALETTES[paletteId] || PALETTES.warm;
  const cols = Math.min(notes.length, Math.ceil(Math.sqrt(notes.length)));
  const loopDuration = LOOP_DURATIONS[loopDurationIdx].ms;

  function getCtx() {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  }

  // Create reverb impulse response on first use
  function getReverb(ctx: AudioContext): ConvolverNode {
    if (reverbRef.current) return reverbRef.current;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    reverbRef.current = conv;
    return conv;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: getCtx/getReverb use refs
  const playNote = useCallback(
    (freq: number, idx: number) => {
      const ctx = getCtx();

      // Sampled instrument — play a real recording through the dry/wet bus.
      if (instrument.sampledPack) {
        const packId = instrument.sampledPack;
        const bus = ctx.createGain();
        bus.gain.value = 1;
        const dryGain = ctx.createGain();
        dryGain.gain.value = 1 - reverbMix;
        bus.connect(dryGain);
        dryGain.connect(ctx.destination);
        if (reverbMix > 0.01) {
          const wetGain = ctx.createGain();
          wetGain.gain.value = reverbMix;
          const reverb = getReverb(ctx);
          bus.connect(wetGain);
          wetGain.connect(reverb);
          reverb.connect(ctx.destination);
        }
        playSampledNote(ctx, packId, freq, volume, bus);
        return;
      }

      const now = ctx.currentTime;
      const dur = instrument.attack + instrument.decay + instrument.release;

      // Main oscillator
      const osc1 = ctx.createOscillator();
      osc1.type = instrument.type;
      osc1.frequency.value = freq;

      // Second oscillator — slightly detuned for richness
      const osc2 = ctx.createOscillator();
      osc2.type = instrument.type;
      osc2.frequency.value = freq;
      osc2.detune.value = detune;

      // Third oscillator — harmonics, sub-octaves
      let osc3: OscillatorNode | null = null;
      const harmonicIds = [
        'bell',
        'crystal',
        'glass',
        'strings',
        'choir',
        'organ',
        'epic',
        'angels',
      ];
      if (harmonicIds.includes(instrument.id)) {
        osc3 = ctx.createOscillator();
        osc3.type =
          instrument.id === 'organ' ? 'square' : instrument.id === 'epic' ? 'sawtooth' : 'sine';
        const r =
          instrument.id === 'bell'
            ? 2.756
            : instrument.id === 'glass'
              ? 4.0
              : ['choir', 'angels'].includes(instrument.id)
                ? 1.01
                : instrument.id === 'epic'
                  ? 0.5
                  : 2.0;
        osc3.frequency.value = freq * r;
      }
      if (instrument.id === 'bass') {
        osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq / 2;
      }
      // Angels: 4th osc for thick choir
      let osc4: OscillatorNode | null = null;
      if (instrument.id === 'angels') {
        osc4 = ctx.createOscillator();
        osc4.type = 'sine';
        osc4.frequency.value = freq * 2.01;
      }
      // Vibrato for flute/horizon
      if (instrument.id === 'flute' || instrument.id === 'horizon') {
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = instrument.id === 'horizon' ? 2 : 5;
        const lg = ctx.createGain();
        lg.gain.value = instrument.id === 'horizon' ? 6 : 3;
        lfo.connect(lg);
        lg.connect(osc1.frequency);
        lfo.start(now);
        lfo.stop(now + dur + 0.1);
      }

      // Envelope
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(volume, now + instrument.attack);
      env.gain.linearRampToValueAtTime(
        volume * instrument.sustain,
        now + instrument.attack + instrument.decay,
      );
      env.gain.linearRampToValueAtTime(0, now + dur);

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterCutoff;
      filter.Q.value = 1;

      // Connect: oscs → filter → env → (dry + reverb) → destination
      const osc2gain = ctx.createGain();
      osc2gain.gain.value = 0.3;
      osc1.connect(filter);
      osc2.connect(osc2gain);
      osc2gain.connect(filter);
      if (osc3) {
        const osc3gain = ctx.createGain();
        osc3gain.gain.value =
          instrument.id === 'angels' ? 0.2 : instrument.id === 'epic' ? 0.25 : 0.12;
        osc3.connect(osc3gain);
        osc3gain.connect(filter);
        osc3.start(now);
        osc3.stop(now + dur + 0.1);
      }
      if (osc4) {
        const osc4gain = ctx.createGain();
        osc4gain.gain.value = 0.08;
        osc4.connect(osc4gain);
        osc4gain.connect(filter);
        osc4.start(now);
        osc4.stop(now + dur + 0.1);
      }
      filter.connect(env);

      // Dry path
      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - reverbMix;
      env.connect(dryGain);
      dryGain.connect(ctx.destination);

      // Reverb path
      if (reverbMix > 0.01) {
        const wetGain = ctx.createGain();
        wetGain.gain.value = reverbMix;
        const reverb = getReverb(ctx);
        env.connect(wetGain);
        wetGain.connect(reverb);
        reverb.connect(ctx.destination);
      }

      osc1.start(now);
      osc1.stop(now + dur + 0.1);
      osc2.start(now);
      osc2.stop(now + dur + 0.1);

      // Record tap for loop layer
      if (recording) {
        const elapsed = Date.now() - recordStartRef.current;
        const wrapped = elapsed % loopDuration;
        const finalTime = quantize ? quantizeNote(wrapped, loopDuration) : wrapped;
        currentLayerNotesRef.current.push({ idx, time: finalTime });
      }

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
    [instrument, volume, filterCutoff, reverbMix, detune, recording, loopDuration, quantize],
  );

  // ── Loop playback engine ──
  const playLoopOnce = useCallback(() => {
    if (loopLayers.length === 0) return;
    const allNotes: { idx: number; time: number }[] = [];
    for (const layer of loopLayers) {
      if (layer.muted) continue;
      for (const note of layer.notes) {
        allNotes.push(note);
      }
    }
    allNotes.sort((a, b) => a.time - b.time);

    loopStartRef.current = Date.now();

    // Schedule all notes
    for (const note of allNotes) {
      const noteIdx = note.idx % loopNotes.length;
      if (noteIdx >= 0 && noteIdx < loopNotes.length) {
        setTimeout(() => {
          if (!loopPlaying) return;
          playNote(loopNotes[noteIdx], noteIdx);
        }, note.time);
      }
    }

    // Schedule next loop iteration
    loopTimerRef.current = setTimeout(() => {
      if (loopPlaying) playLoopOnce();
    }, loopDuration);
  }, [loopLayers, loopNotes, loopDuration, loopPlaying, playNote]);

  // Start/stop loop playback
  const layerCount = loopLayers.length;
  useEffect(() => {
    if (loopPlaying && layerCount > 0) {
      playLoopOnce();
    }
    if (!loopPlaying) {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    }
    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    };
  }, [loopPlaying, playLoopOnce, layerCount]);

  // Animate loop progress
  useEffect(() => {
    if (!loopPlaying && !recording) {
      setLoopProgress(0);
      if (loopAnimRef.current) cancelAnimationFrame(loopAnimRef.current);
      return;
    }
    function tick() {
      const elapsed = (Date.now() - loopStartRef.current) % loopDuration;
      setLoopProgress(elapsed / loopDuration);
      loopAnimRef.current = requestAnimationFrame(tick);
    }
    loopAnimRef.current = requestAnimationFrame(tick);
    return () => {
      if (loopAnimRef.current) cancelAnimationFrame(loopAnimRef.current);
    };
  }, [loopPlaying, recording, loopDuration]);

  // Start recording a new layer (supports overdub while playing)
  function startRecording() {
    currentLayerNotesRef.current = [];
    recordStartRef.current = Date.now();
    // If loop is already playing, keep it playing (overdub mode)
    // Sync the recording start to the current loop position
    if (loopPlaying) {
      overdubPlayingRef.current = true;
      // Align record start to current loop phase so notes line up
      const elapsed = (Date.now() - loopStartRef.current) % loopDuration;
      recordStartRef.current = Date.now() - elapsed;
    } else {
      overdubPlayingRef.current = false;
      loopStartRef.current = Date.now();
    }
    setRecording(true);

    // Auto-stop after one loop duration
    setTimeout(() => {
      finishRecording();
    }, loopDuration);
  }

  function finishRecording() {
    setRecording(false);
    const recordedNotes = [...currentLayerNotesRef.current];
    if (recordedNotes.length === 0) return;
    const layerId = nextLayerIdRef.current++;
    const color = LAYER_COLORS[loopLayers.length % LAYER_COLORS.length];
    setLoopLayers((prev) => [...prev, { id: layerId, notes: recordedNotes, color, muted: false }]);
    currentLayerNotesRef.current = [];
  }

  function toggleLayerMute(id: number) {
    setLoopLayers((prev) => prev.map((l) => (l.id === id ? { ...l, muted: !l.muted } : l)));
  }

  function removeLayer(id: number) {
    setLoopLayers((prev) => prev.filter((l) => l.id !== id));
  }

  function clearAllLayers() {
    setLoopLayers([]);
    setLoopPlaying(false);
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
  }

  // Cruise control
  const cruiseStep = useCallback(() => {
    if (!cruising || notes.length === 0) return;

    let idx: number;
    if (cruisePattern === 'phrase') {
      const phrases = PHRASES[scaleId] || PHRASES.pentatonic;
      const phrase = phrases[phraseIdx % phrases.length];
      const noteInPhrase = cruiseIdxRef.current % phrase.length;
      const scaleIdx = phrase[noteInPhrase] % notes.length;
      idx = scaleIdx;
      cruiseIdxRef.current++;
    } else if (cruisePattern === 'ascending') {
      idx = cruiseIdxRef.current % notes.length;
      cruiseIdxRef.current++;
    } else if (cruisePattern === 'random') {
      idx = Math.floor(Math.random() * notes.length);
    } else if (cruisePattern === 'breathing') {
      const period = notes.length * 2;
      const pos = cruiseIdxRef.current % period;
      idx = pos < notes.length ? pos : period - pos - 1;
      cruiseIdxRef.current++;
    } else {
      idx = Math.floor(Math.random() * notes.length);
    }

    playNote(notes[idx], idx);

    // Speed: 0.1 = ultra slow (6x), 0.5 = moderate (2x), 1.0 = fast (0.5x)
    const speedMult =
      cruiseSpeed < 0.3
        ? 6.0 - cruiseSpeed * 13.3 // 0.1→4.7x, 0.3→2.0x — ultra slow range
        : 2.0 - cruiseSpeed * 1.5; // 0.3→1.55x, 1.0→0.5x — normal range
    const interval =
      (cruisePattern === 'phrase'
        ? 500 + Math.random() * 300
        : cruisePattern === 'breathing'
          ? 800 + Math.random() * 600
          : cruisePattern === 'rain'
            ? 500 + Math.random() * 1200
            : cruisePattern === 'ascending'
              ? 600 + Math.random() * 300
              : 400 + Math.random() * 800) * speedMult;

    cruiseRef.current = setTimeout(cruiseStep, interval);
  }, [cruising, cruisePattern, notes, playNote, cruiseSpeed, scaleId, phraseIdx]);

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

      {/* ── SYNTH CONTROLS — below grid ── */}
      <div className="flex justify-center gap-4 px-2">
        <div className="flex-1 space-y-1">
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              color: '#C4A060',
              opacity: 0.6,
            }}
          >
            filter
          </span>
          <div
            className="flex gap-[2px] cursor-pointer"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setFilterCutoff(Math.round(200 + ((e.clientX - r.left) / r.width) * 4800));
            }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 8,
                  background: '#C4A060',
                  opacity: i / 7 <= (filterCutoff - 200) / 4800 ? 0.4 + (i / 7) * 0.4 : 0.08,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              color: '#6890B0',
              opacity: 0.6,
            }}
          >
            reverb
          </span>
          <div
            className="flex gap-[2px] cursor-pointer"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setReverbMix(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
            }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 8,
                  background: '#6890B0',
                  opacity: i / 7 <= reverbMix ? 0.4 + (i / 7) * 0.4 : 0.08,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              color: '#D4805A',
              opacity: 0.6,
            }}
          >
            detune
          </span>
          <div
            className="flex gap-[2px] cursor-pointer"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setDetune(Math.round(((e.clientX - r.left) / r.width) * 50));
            }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all"
                style={{
                  height: 8,
                  background: '#D4805A',
                  opacity: i / 7 <= detune / 50 ? 0.4 + (i / 7) * 0.4 : 0.08,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── CRUISE SPEED — below synth controls ── */}
      <div className="px-2">
        <div className="space-y-1">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              color: '#7A5438',
              opacity: 0.5,
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
                  height: 12,
                  background: instrument.color,
                  opacity: i / 7 <= cruiseSpeed ? 0.3 + (i / 7) * 0.5 : 0.08,
                }}
              />
            ))}
          </div>
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
        <div className="flex flex-wrap gap-1">
          {(['breathing', 'rain', 'ascending', 'random', 'phrase'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setCruisePattern(p);
                if (p === 'phrase') setPhraseIdx(Math.floor(Math.random() * 3));
              }}
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

      {/* ══════════════════════════════════════════════
          LOOP STUDIO — record layers over a base loop
          ══════════════════════════════════════════════ */}
      <div
        className="mx-2 rounded-2xl px-4 py-4 space-y-4"
        style={{
          background: '#5C301806',
          border: '1px solid #5C301812',
        }}
      >
        <div className="flex items-center justify-between">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#5C3018',
              opacity: 0.8,
            }}
          >
            loop studio
          </p>
          {loopLayers.length > 0 && (
            <button
              type="button"
              onClick={clearAllLayers}
              className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#8A6A4A',
                opacity: 0.4,
                background: 'none',
                border: 'none',
              }}
            >
              clear all
            </button>
          )}
        </div>

        {/* Duration + Scale selector */}
        <div className="flex gap-4">
          <div className="space-y-1">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '10px',
                color: '#7A5438',
                opacity: 0.5,
              }}
            >
              duration
            </p>
            <div className="flex gap-1">
              {LOOP_DURATIONS.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    if (loopLayers.length === 0) setLoopDurationIdx(i);
                  }}
                  className="cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold transition-all"
                  style={{
                    color: loopDurationIdx === i ? '#5C3018' : '#8A6A4A',
                    background: loopDurationIdx === i ? '#C4A06015' : 'transparent',
                    border: `1px solid ${loopDurationIdx === i ? '#C4A06035' : '#C4A06010'}`,
                    opacity: loopDurationIdx === i ? 1 : loopLayers.length > 0 ? 0.2 : 0.4,
                    fontFamily: 'var(--font-serif)',
                  }}
                  disabled={loopLayers.length > 0}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '10px',
                color: '#7A5438',
                opacity: 0.5,
              }}
            >
              loop scale
            </p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(SCALES).map(([id, s]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLoopScaleId(id)}
                  className="cursor-pointer rounded-full px-1.5 py-0.5 text-[9px] font-semibold transition-all"
                  style={{
                    color: loopScaleId === id ? '#5C3018' : '#8A6A4A',
                    background: loopScaleId === id ? '#5C301810' : 'transparent',
                    border: `1px solid ${loopScaleId === id ? '#5C301830' : '#C4A06008'}`,
                    opacity: loopScaleId === id ? 1 : 0.4,
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quantize toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantize((q) => !q)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 transition-all"
            style={{
              background: quantize ? '#C4A06012' : 'transparent',
              border: `1px solid ${quantize ? '#C4A06035' : '#C4A06015'}`,
            }}
          >
            <span
              className="block rounded-sm"
              style={{
                width: 10,
                height: 10,
                background: quantize ? '#C4A060' : '#8A6A4A',
                opacity: quantize ? 0.8 : 0.2,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '10px',
                fontWeight: 600,
                color: quantize ? '#5C3018' : '#8A6A4A',
                opacity: quantize ? 0.9 : 0.4,
              }}
            >
              quantize
            </span>
          </button>
          {quantize && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '9px',
                color: '#8A6A4A',
                opacity: 0.4,
              }}
            >
              snap to 1/16
            </span>
          )}
        </div>

        {/* Visual timeline */}
        <div className="space-y-2">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              height: Math.max(48, loopLayers.length * 20 + 16),
              background: '#5C301806',
              border: '1px solid #5C301812',
            }}
          >
            {/* Beat tick marks — faint vertical lines at every quarter */}
            {[1, 2, 3].map((tick) => (
              <div
                key={`tick-${tick}`}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${(tick / 4) * 100}%`,
                  width: 1,
                  background: '#5C3018',
                  opacity: 0.08,
                  zIndex: 1,
                }}
              />
            ))}
            {/* Finer 8th-note ticks */}
            {Array.from({ length: 7 }, (_, i) => i + 1)
              .filter((i) => i % 2 !== 0)
              .map((tick) => (
                <div
                  key={`fine-${tick}`}
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${(tick / 8) * 100}%`,
                    width: 1,
                    background: '#5C3018',
                    opacity: 0.04,
                    zIndex: 1,
                  }}
                />
              ))}

            {/* Playhead with glow */}
            {(loopPlaying || recording) && (
              <>
                <div
                  className="absolute top-0 bottom-0 transition-none"
                  style={{
                    left: `${loopProgress * 100}%`,
                    width: 6,
                    background: recording ? '#D0604025' : '#C4A06020',
                    transform: 'translateX(-3px)',
                    zIndex: 9,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 transition-none"
                  style={{
                    left: `${loopProgress * 100}%`,
                    width: 2,
                    background: recording ? '#D06040' : '#C4A060',
                    opacity: 0.9,
                    zIndex: 10,
                  }}
                />
              </>
            )}

            {/* Layer lanes with colored backgrounds */}
            {loopLayers.map((layer, layerIdx) => {
              const laneTop = 6 + layerIdx * 20;
              return (
                <div
                  key={layer.id}
                  className="absolute left-0 right-0"
                  style={{
                    top: laneTop,
                    height: 16,
                    opacity: layer.muted ? 0.15 : 1,
                  }}
                >
                  {/* Lane background */}
                  <div
                    className="absolute inset-0 rounded-sm"
                    style={{ background: `${layer.color}06` }}
                  />
                  {/* Note bars — short horizontal bars instead of dots */}
                  {layer.notes.map((note, ni) => {
                    const x = (note.time / loopDuration) * 100;
                    return (
                      <div
                        key={`${layer.id}-${ni}`}
                        className="absolute rounded-sm"
                        style={{
                          left: `${x}%`,
                          top: 2,
                          width: 12,
                          height: 12,
                          background: layer.color,
                          opacity: 0.6,
                          transform: 'translateX(-6px)',
                          borderRadius: '3px',
                        }}
                      />
                    );
                  })}
                  {/* Layer label */}
                  <span
                    className="absolute right-1"
                    style={{
                      top: 2,
                      fontFamily: 'var(--font-serif)',
                      fontSize: '8px',
                      fontWeight: 700,
                      color: layer.color,
                      opacity: 0.4,
                    }}
                  >
                    {layerIdx + 1}
                  </span>
                </div>
              );
            })}

            {/* Empty state */}
            {loopLayers.length === 0 && !recording && (
              <div className="flex items-center justify-center h-full">
                <p
                  className="italic"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    color: '#8A6A4A',
                    opacity: 0.3,
                  }}
                >
                  tap record to lay down a loop
                </p>
              </div>
            )}
          </div>

          {/* Time markers */}
          <div className="flex justify-between px-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '9px',
                  color: '#8A6A4A',
                  opacity: 0.3,
                }}
              >
                {((loopDuration / 1000) * (i / 4)).toFixed(1)}s
              </span>
            ))}
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Record button */}
          <button
            type="button"
            onClick={() => {
              if (recording) {
                finishRecording();
              } else {
                startRecording();
              }
            }}
            className="flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-all"
            style={{
              background: recording ? '#D0604018' : '#D0604008',
              border: `1px solid ${recording ? '#D0604050' : '#D0604020'}`,
            }}
          >
            <span
              className="block rounded-full"
              style={{
                width: 10,
                height: 10,
                background: '#D06040',
                opacity: recording ? 1 : 0.5,
                boxShadow: recording ? '0 0 8px #D0604060' : 'none',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                fontWeight: 600,
                color: recording ? '#D06040' : '#7A5438',
              }}
            >
              {recording ? 'recording...' : 'record layer'}
            </span>
          </button>

          {/* Play/Stop loop */}
          {loopLayers.length > 0 && (
            <button
              type="button"
              onClick={() => setLoopPlaying((s) => !s)}
              className="flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 transition-all"
              style={{
                background: loopPlaying ? '#C4A06015' : '#C4A06008',
                border: `1px solid ${loopPlaying ? '#C4A06040' : '#C4A06020'}`,
              }}
            >
              {loopPlaying ? (
                <div className="flex gap-1">
                  <span
                    className="block rounded-sm"
                    style={{ width: 3, height: 12, background: '#C4A060' }}
                  />
                  <span
                    className="block rounded-sm"
                    style={{ width: 3, height: 12, background: '#C4A060' }}
                  />
                </div>
              ) : (
                <span
                  className="block"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid #C4A060',
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    marginLeft: 1,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: loopPlaying ? '#C4A060' : '#7A5438',
                }}
              >
                {loopPlaying ? 'stop' : 'play loop'}
              </span>
            </button>
          )}
        </div>

        {/* Layer list */}
        {loopLayers.length > 0 && (
          <div className="space-y-1">
            {loopLayers.map((layer, i) => (
              <div
                key={layer.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1"
                style={{
                  background: layer.muted ? 'transparent' : `${layer.color}08`,
                  border: `1px solid ${layer.muted ? '#C4A06008' : `${layer.color}18`}`,
                }}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    background: layer.color,
                    opacity: layer.muted ? 0.2 : 0.8,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: layer.muted ? '#8A6A4A' : layer.color,
                    opacity: layer.muted ? 0.4 : 0.8,
                    flex: 1,
                  }}
                >
                  layer {i + 1} · {layer.notes.length} notes
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayerMute(layer.id)}
                  className="cursor-pointer rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider transition-all"
                  style={{
                    color: layer.muted ? '#8A6A4A' : layer.color,
                    background: layer.muted ? '#8A6A4A08' : `${layer.color}10`,
                    border: `1px solid ${layer.muted ? '#8A6A4A15' : `${layer.color}25`}`,
                    opacity: layer.muted ? 0.4 : 0.7,
                  }}
                >
                  {layer.muted ? 'unmute' : 'mute'}
                </button>
                <button
                  type="button"
                  onClick={() => removeLayer(layer.id)}
                  className="cursor-pointer text-[10px] transition-all"
                  style={{
                    color: '#8A6A4A',
                    opacity: 0.3,
                    background: 'none',
                    border: 'none',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save this pattern → Notebook (Ideas). Mirrors the
          Chill / Groove "→ notebook" buttons so saved snapshots
          from every tool land in one place. */}
      <div className="px-2">
        <button
          type="button"
          onClick={saveMomentToNotebook}
          disabled={momentStatus === 'saving'}
          className="mx-auto block cursor-pointer rounded-xl px-4 py-2.5 transition-all hover:opacity-85 disabled:opacity-50"
          style={{
            background: momentStatus === 'saved' ? '#7AAA5815' : '#9B6BA010',
            border: `1.5px solid ${momentStatus === 'saved' ? '#7AAA5840' : '#9B6BA040'}`,
            color: momentStatus === 'saved' ? '#7AAA58' : '#9B6BA0',
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {momentStatus === 'saving'
            ? '…'
            : momentStatus === 'saved'
              ? '✓ saved to notebook'
              : momentStatus === 'error'
                ? 'error · try again'
                : '→ save to notebook'}
        </button>
      </div>

      {/* ── COLLAPSIBLE SETTINGS DRAWER ── */}
      <div className="px-2">
        <button
          type="button"
          onClick={() => setSettingsOpen((s) => !s)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-all"
          style={{
            background: settingsOpen ? '#5C301808' : '#5C301804',
            border: `1px solid ${settingsOpen ? '#5C301815' : '#5C301808'}`,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 600,
              fontStyle: 'italic',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            settings
          </span>
          <span
            className="text-[10px] transition-transform duration-200"
            style={{
              color: '#7A543880',
              transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}
          >
            ▾
          </span>
        </button>

        {settingsOpen && (
          <div
            className="mt-2 space-y-5 rounded-xl px-3 py-3"
            style={{
              background: '#5C301804',
              border: '1px solid #5C301808',
            }}
          >
            {/* ── SOUND GROUP ── */}
            <div className="space-y-3">
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#C4A060',
                  opacity: 0.6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                sound
              </p>

              {/* Instrument — dot toggle + dropdown */}
              <div className="relative space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowInstruments((s) => !s)}
                  className="flex w-full cursor-pointer items-center gap-2"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span
                    className="block rounded-full"
                    style={{ width: 14, height: 14, background: instrument.color }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: instrument.color,
                    }}
                  >
                    {instrument.name}
                  </span>
                  <span
                    className="text-[10px] transition-transform duration-200"
                    style={{
                      color: `${instrument.color}80`,
                      transform: showInstruments ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▾
                  </span>
                </button>
                {showInstruments && (
                  <div
                    className="animate-in fade-in duration-150 rounded-xl px-2 py-2"
                    style={{
                      background: '#F5ECDC',
                      border: '1px solid #8A6A4A20',
                      boxShadow: '0 8px 24px rgba(92,48,24,0.12)',
                    }}
                  >
                    <div className="grid grid-cols-4 gap-1">
                      {INSTRUMENTS.map((inst) => (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => {
                            setInstrumentId(inst.id);
                            setShowInstruments(false);
                          }}
                          className="flex cursor-pointer flex-col items-center gap-1 rounded-lg py-1.5 transition-all"
                          style={{
                            background:
                              instrumentId === inst.id ? `${inst.color}12` : 'transparent',
                            border: `1px solid ${instrumentId === inst.id ? `${inst.color}30` : 'transparent'}`,
                          }}
                        >
                          <span
                            className="block rounded-full"
                            style={{
                              width: 10,
                              height: 10,
                              background: inst.color,
                              opacity: instrumentId === inst.id ? 1 : 0.5,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '10px',
                              fontWeight: instrumentId === inst.id ? 700 : 500,
                              color: instrumentId === inst.id ? inst.color : '#8A6A4A',
                              opacity: instrumentId === inst.id ? 1 : 0.6,
                            }}
                          >
                            {inst.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
            </div>

            {/* ── FEEL GROUP ── */}
            <div className="space-y-3">
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#C4A060',
                  opacity: 0.6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                feel
              </p>

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

              {/* Shape */}
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
        )}
      </div>
    </div>
  );
}
