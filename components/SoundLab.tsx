'use client';

import { useEffect, useState } from 'react';
import AtomVisualizer, { type VisualizerMode } from '@/components/AtomVisualizer';
import BinauralTuner from '@/components/BinauralTuner';
import LofiLooper from '@/components/LofiLooper';
import MagicMaker from '@/components/MagicMaker';

/* ═══════════════════════════════════════════════════════════
   SOUND LAB — toggles between Tuner, Maker, Looper, Visuals.
   ═══════════════════════════════════════════════════════════ */

type Mode = 'tuner' | 'maker' | 'looper' | 'visuals';

const VISUALIZER_MODES: { id: VisualizerMode; label: string }[] = [
  { id: 'atom', label: 'Atom' },
  { id: 'fibonacci', label: 'Fibonacci' },
  { id: 'phyllotaxis', label: 'Sunflower' },
  { id: 'wave', label: 'Wave' },
  { id: 'lissajous', label: 'Lissajous' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'helix', label: 'Helix' },
  { id: 'tunnel', label: 'Tunnel' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'solar', label: 'Solar' },
  { id: 'saturn', label: 'Saturn' },
  { id: 'orbital', label: 'Orbital' },
  { id: 'morph', label: 'Morph' },
];

export default function SoundLab() {
  const [mode, setMode] = useState<Mode>('tuner');
  const [visualMode, setVisualMode] = useState<VisualizerMode>('atom');
  const [visualSize, setVisualSize] = useState({ width: 360, height: 240 });

  useEffect(() => {
    function update() {
      const w = Math.min(window.innerWidth - 40, 720);
      const h = Math.max(200, Math.min(420, Math.round(w * 0.65)));
      setVisualSize({ width: w, height: h });
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode toggle — 4 categories, scrollable on phone if overflow */}
      <div className="flex justify-center gap-2 overflow-x-auto">
        {(
          [
            { id: 'tuner' as const, label: 'Calming Sounds' },
            { id: 'maker' as const, label: 'Magic Maker' },
            { id: 'looper' as const, label: 'Lo-fi Looper' },
            { id: 'visuals' as const, label: 'Visuals' },
          ] satisfies readonly { id: Mode; label: string }[]
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
            style={{
              color: '#5C3018',
              background: mode === m.id ? '#5C301812' : 'transparent',
              border: `1px solid ${mode === m.id ? '#5C301830' : '#5C301810'}`,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className="rounded-3xl border border-[#7a543833] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
          boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
        }}
      >
        {mode === 'tuner' && <BinauralTuner />}
        {mode === 'maker' && <MagicMaker />}
        {mode === 'looper' && <LofiLooper />}
        {mode === 'visuals' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <AtomVisualizer
                mode={visualMode}
                width={visualSize.width}
                height={visualSize.height}
                intensity={0.6}
                speed={0.55}
                density={0.6}
                scale={0.5}
                opacity={1}
                depth3d={0.3}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {VISUALIZER_MODES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVisualMode(v.id)}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] transition-all"
                  style={{
                    color: visualMode === v.id ? '#5C3018' : '#8A6A4A',
                    background: visualMode === v.id ? '#C4A06020' : 'transparent',
                    border: `1px solid ${visualMode === v.id ? '#C4A06060' : '#5C301818'}`,
                    fontFamily: 'var(--font-serif)',
                    opacity: visualMode === v.id ? 1 : 0.7,
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
