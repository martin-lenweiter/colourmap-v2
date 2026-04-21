'use client';

import { useState } from 'react';
import BinauralTuner from '@/components/BinauralTuner';
import LofiLooper from '@/components/LofiLooper';
import MagicMaker from '@/components/MagicMaker';

/* ═══════════════════════════════════════════════════════════
   SOUND LAB — toggles between Tuner and Magic Maker.
   ═══════════════════════════════════════════════════════════ */

type Mode = 'tuner' | 'maker' | 'looper';

export default function SoundLab() {
  const [mode, setMode] = useState<Mode>('tuner');

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'tuner' as const, label: 'Calming Sounds' },
          { id: 'maker' as const, label: 'Magic Maker' },
          { id: 'looper' as const, label: 'Lo-fi Looper' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
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
      </div>
    </div>
  );
}
