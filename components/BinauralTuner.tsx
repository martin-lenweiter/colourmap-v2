'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   BINAURAL TUNER — create your perfect frequency for focus or rest.
   Two oscillators with a Hz difference = binaural beat.
   Layer in nature sounds. Visual frequency string syncs with audio.
   ═══════════════════════════════════════════════════════════ */

const PRESETS: { id: string; label: string; base: number; beat: number; color: string }[] = [
  { id: 'deep-sleep', label: 'Deep Sleep', base: 180, beat: 2, color: '#9B6BA0' },
  { id: 'meditation', label: 'Meditation', base: 200, beat: 6, color: '#6890B0' },
  { id: 'creativity', label: 'Creativity', base: 210, beat: 7, color: '#D4805A' },
  { id: 'calm-focus', label: 'Calm Focus', base: 220, beat: 10, color: '#7AAA58' },
  { id: 'active-mind', label: 'Active Mind', base: 240, beat: 18, color: '#C4A060' },
  { id: 'peak', label: 'Peak Awareness', base: 260, beat: 35, color: '#D06040' },
];

const NATURE_LAYERS: { id: string; label: string; color: string; type: 'noise' | 'tone' }[] = [
  { id: 'rain', label: 'Rain', color: '#6890B0', type: 'noise' },
  { id: 'wind', label: 'Wind', color: '#A0C8A0', type: 'noise' },
  { id: 'drone', label: 'Drone', color: '#C4A060', type: 'tone' },
];

function getBrainState(beat: number): string {
  if (beat <= 4) return 'delta · deep rest';
  if (beat <= 8) return 'theta · meditation';
  if (beat <= 14) return 'alpha · relaxed focus';
  if (beat <= 30) return 'beta · active thinking';
  return 'gamma · peak awareness';
}

export default function BinauralTuner() {
  const [playing, setPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(220);
  const [beatFreq, setBeatFreq] = useState(10);
  const [volume, setVolume] = useState(0.3);
  const [layers, setLayers] = useState<Record<string, number>>({});

  const ctxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const noiseNodesRef = useRef<
    Map<string, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }>
  >(new Map());
  const mergerRef = useRef<ChannelMergerNode | null>(null);

  const startAudio = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const merger = ctx.createChannelMerger(2);
    mergerRef.current = merger;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gainRef.current = gain;

    // Left oscillator
    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = baseFreq;
    const gainL = ctx.createGain();
    gainL.gain.value = 1;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);
    oscLeftRef.current = oscL;

    // Right oscillator (base + beat)
    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = baseFreq + beatFreq;
    const gainR = ctx.createGain();
    gainR.gain.value = 1;
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);
    oscRightRef.current = oscR;

    merger.connect(gain);
    gain.connect(ctx.destination);

    oscL.start();
    oscR.start();
    setPlaying(true);
  }, [baseFreq, beatFreq, volume]);

  const stopAudio = useCallback(() => {
    // Stop nature layers
    for (const [, node] of noiseNodesRef.current) {
      try {
        node.source.stop();
      } catch {}
      node.gain.disconnect();
    }
    noiseNodesRef.current.clear();

    oscLeftRef.current?.stop();
    oscRightRef.current?.stop();
    ctxRef.current?.close();
    ctxRef.current = null;
    oscLeftRef.current = null;
    oscRightRef.current = null;
    gainRef.current = null;
    mergerRef.current = null;
    setPlaying(false);
  }, []);

  // Update frequencies in real time
  useEffect(() => {
    if (oscLeftRef.current) oscLeftRef.current.frequency.value = baseFreq;
    if (oscRightRef.current) oscRightRef.current.frequency.value = baseFreq + beatFreq;
  }, [baseFreq, beatFreq]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  // Nature layer management
  const toggleLayer = useCallback(
    (layerId: string, vol: number) => {
      const ctx = ctxRef.current;
      if (!ctx || !mergerRef.current) return;

      const existing = noiseNodesRef.current.get(layerId);
      if (existing) {
        if (vol <= 0) {
          try {
            existing.source.stop();
          } catch {}
          existing.gain.disconnect();
          noiseNodesRef.current.delete(layerId);
        } else {
          existing.gain.gain.value = vol;
        }
        return;
      }

      if (vol <= 0) return;

      const layer = NATURE_LAYERS.find((l) => l.id === layerId);
      if (!layer) return;

      const layerGain = ctx.createGain();
      layerGain.gain.value = vol;

      if (layer.type === 'noise') {
        // Brown/pink noise
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buffer.getChannelData(ch);
          let lastOut = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Brown noise filter
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * (layerId === 'rain' ? 3.5 : 2.5);
          }
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Filter for rain vs wind
        const filter = ctx.createBiquadFilter();
        filter.type = layerId === 'rain' ? 'highpass' : 'lowpass';
        filter.frequency.value = layerId === 'rain' ? 800 : 400;

        source.connect(filter);
        filter.connect(layerGain);
        layerGain.connect(ctx.destination);
        source.start();
        noiseNodesRef.current.set(layerId, { source, gain: layerGain });
      } else {
        // Drone — low sine
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = baseFreq / 4;
        osc.connect(layerGain);
        layerGain.connect(ctx.destination);
        osc.start();
        noiseNodesRef.current.set(layerId, { source: osc, gain: layerGain });
      }
    },
    [baseFreq],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        for (const [, node] of noiseNodesRef.current) {
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
    const phase = (x / wavelength) * Math.PI * 2;
    const y = cy + Math.sin(phase) * amplitude;
    points.push(`${x},${y.toFixed(1)}`);
  }
  const pathD = `M ${points.join(' L ')}`;

  const preset = PRESETS.find((p) => p.beat === beatFreq && p.base === baseFreq);
  const activeColor = preset?.color || '#C4A060';

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

      {/* Presets */}
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

      {/* Brain state */}
      <p
        className="text-center"
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

      {/* Play / Stop */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={playing ? stopAudio : startAudio}
          className="flex cursor-pointer items-center justify-center rounded-full transition-all"
          style={{
            width: 48,
            height: 48,
            background: playing ? `${activeColor}20` : `${activeColor}10`,
            border: `2px solid ${activeColor}${playing ? '60' : '30'}`,
          }}
        >
          {playing ? (
            <div className="flex gap-1">
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 16, background: activeColor }}
              />
              <span
                className="block rounded-sm"
                style={{ width: 4, height: 16, background: activeColor }}
              />
            </div>
          ) : (
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderLeft: `14px solid ${activeColor}`,
                borderTop: '9px solid transparent',
                borderBottom: '9px solid transparent',
                marginLeft: 3,
              }}
            />
          )}
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-3 px-2">
        {/* Beat frequency */}
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
              binaural beat
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: activeColor,
                fontWeight: 600,
              }}
            >
              {beatFreq}Hz
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={40}
            value={beatFreq}
            onChange={(e) => setBeatFreq(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: activeColor }}
          />
        </div>

        {/* Base frequency */}
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
              base tone
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#7A5438',
                fontWeight: 600,
              }}
            >
              {baseFreq}Hz
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={400}
            value={baseFreq}
            onChange={(e) => setBaseFreq(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: activeColor }}
          />
        </div>

        {/* Volume */}
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
              volume
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#7A5438',
                fontWeight: 600,
              }}
            >
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full"
            style={{ accentColor: activeColor }}
          />
        </div>
      </div>

      {/* Nature layers */}
      <div className="space-y-2 px-2">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            color: '#7A5438',
            opacity: 0.7,
          }}
        >
          layers
        </p>
        <div className="flex gap-2">
          {NATURE_LAYERS.map((l) => {
            const layerVol = layers[l.id] || 0;
            const isOn = layerVol > 0;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  const newVol = isOn ? 0 : 0.3;
                  setLayers((prev) => ({ ...prev, [l.id]: newVol }));
                  if (playing) toggleLayer(l.id, newVol);
                }}
                className="flex-1 cursor-pointer rounded-xl py-2 text-center transition-all"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: l.color,
                  background: isOn ? `${l.color}15` : 'transparent',
                  border: `1px solid ${isOn ? `${l.color}40` : `${l.color}18`}`,
                  opacity: isOn ? 1 : 0.5,
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
