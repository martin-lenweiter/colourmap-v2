'use client';

import { useEffect } from 'react';
import SharingReflect from '@/components/SharingReflect';
import SquareSlider from '@/components/SquareSlider';

export const SHARING_LEVELS = [
  { label: 'Disconnected', color: '#A08878' },
  { label: 'Distant', color: '#BEA878' },
  { label: 'Present', color: '#C4A060' },
  { label: 'Warm', color: '#80A870' },
  { label: 'Flowing', color: '#5AA880' },
];

export const SHARING_IDX_KEY = 'colourmap:sharing-idx';

import { useState } from 'react';

function loadIdx(): number {
  if (typeof window === 'undefined') return 2;
  try {
    const v = localStorage.getItem(SHARING_IDX_KEY);
    return v !== null ? Math.max(0, Math.min(SHARING_LEVELS.length - 1, Number(v))) : 2;
  } catch {
    return 2;
  }
}

export default function SharingCheckIn() {
  const [idx, setIdx] = useState(2);

  useEffect(() => {
    setIdx(loadIdx());
  }, []);

  function pick(i: number) {
    const clamped = Math.max(0, Math.min(SHARING_LEVELS.length - 1, i));
    setIdx(clamped);
    try {
      localStorage.setItem(SHARING_IDX_KEY, String(clamped));
    } catch {}
  }

  const current = SHARING_LEVELS[idx];

  return (
    <div className="space-y-6 px-1 py-4">
      {/* Level label + slider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
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
          colors={SHARING_LEVELS.map((l) => l.color)}
          value={idx}
          onChange={pick}
          size={18}
          gap={6}
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
              fontSize: 10,
              color: SHARING_LEVELS[0].color,
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
              fontSize: 10,
              color: SHARING_LEVELS[SHARING_LEVELS.length - 1].color,
              opacity: 0.45,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Flowing
          </span>
        </div>
      </div>

      <SharingReflect />
    </div>
  );
}
