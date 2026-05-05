'use client';

import { useEffect, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';

const DOING_LEVELS = [
  { label: 'Disconnected', color: '#5A9A70' },
  { label: 'Idle', color: '#529888' },
  { label: 'Distracted', color: '#4A9890' },
  { label: 'Drifting', color: '#4A9A85' },
  { label: 'Present', color: '#4A9898' },
  { label: 'Working', color: '#4A8AA8' },
  { label: 'Focused', color: '#5080A8' },
  { label: 'Driven', color: '#3870A0' },
  { label: 'Absorbed', color: '#2E68A0' },
  { label: 'Tunnel Vision', color: '#286098' },
];

const LS_KEY = 'colourmap:doing-state-idx';

function loadIdx(): number {
  if (typeof window === 'undefined') return 3;
  try {
    const v = localStorage.getItem(LS_KEY);
    return v !== null ? Math.max(0, Math.min(DOING_LEVELS.length - 1, Number(v))) : 3;
  } catch {
    return 3;
  }
}

export default function DoingStateCircle({ onDone: _onDone }: { onDone?: () => void }) {
  const [idx, setIdx] = useState(3);

  useEffect(() => {
    setIdx(loadIdx());
  }, []);

  function pick(i: number) {
    const clamped = Math.max(0, Math.min(DOING_LEVELS.length - 1, i));
    setIdx(clamped);
    try {
      localStorage.setItem(LS_KEY, String(clamped));
    } catch {}
  }

  const current = DOING_LEVELS[idx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          fontWeight: 700,
          color: current.color,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}
      >
        {current.label}
      </span>
      <SquareSlider
        colors={DOING_LEVELS.map((l) => l.color)}
        value={idx}
        onChange={pick}
        size={16}
        gap={5}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: 2,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            color: DOING_LEVELS[0].color,
            opacity: 0.45,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Disconnected
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            color: DOING_LEVELS[DOING_LEVELS.length - 1].color,
            opacity: 0.45,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Tunnel Vision
        </span>
      </div>
    </div>
  );
}
