'use client';

import { useEffect, useState } from 'react';
import AtomVisualizer, { type VisualizerMode } from '@/components/AtomVisualizer';
import BinauralTuner from '@/components/BinauralTuner';
import LofiLooper from '@/components/LofiLooper';
import MagicMaker from '@/components/MagicMaker';
import MusicSetlist from '@/components/MusicSetlist';

/* ═══════════════════════════════════════════════════════════
   MUSIC (fka Sound Lab) — category tabs: Relaxing / Maker /
   Looper / Visuals / Songs.
   ═══════════════════════════════════════════════════════════ */

type Mode = 'tuner' | 'maker' | 'looper' | 'visuals' | 'songs';

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
    <div className="space-y-5">
      {/* Category tabs — flat text with an underline marker on active.
          No pill boxes, no outer frame: sits directly on the page
          background so the content below gets the full width. */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-2">
        {(
          [
            { id: 'tuner' as const, label: 'Relaxing Sounds' },
            { id: 'maker' as const, label: 'Magic Maker' },
            { id: 'looper' as const, label: 'Lo-fi Looper' },
            { id: 'visuals' as const, label: 'Visuals' },
            { id: 'songs' as const, label: 'Songs' },
          ] satisfies readonly { id: Mode; label: string }[]
        ).map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className="cursor-pointer bg-transparent px-1 pb-1 text-[13px] font-semibold uppercase tracking-[0.16em] transition-all"
              style={{
                color: '#5C3018',
                opacity: active ? 1 : 0.55,
                borderBottom: active ? '1.5px solid #5C3018' : '1.5px solid transparent',
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Content — no outer box; each mode is responsible for its own
          interior structure and breathes across the full page width. */}
      {mode === 'tuner' && <BinauralTuner />}
      {mode === 'maker' && <MagicMaker />}
      {mode === 'looper' && <LofiLooper />}
      {mode === 'songs' && <MusicSetlist />}
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
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
            {VISUALIZER_MODES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVisualMode(v.id)}
                className="cursor-pointer bg-transparent px-1 py-0.5 text-[11px] uppercase tracking-[0.1em] transition-all"
                style={{
                  color: '#5C3018',
                  opacity: visualMode === v.id ? 1 : 0.5,
                  fontFamily: 'var(--font-serif)',
                  borderBottom:
                    visualMode === v.id ? '1px solid #5C301860' : '1px solid transparent',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
