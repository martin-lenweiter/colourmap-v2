'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   SHARING CHECK-IN — big dot + 5-square rainbow selector.
   Scale: Disconnected → Flowing (5 levels).
   ═══════════════════════════════════════════════════════════ */

export const SHARING_LEVELS = [
  { label: 'Disconnected', color: '#A08878' },
  { label: 'Distant', color: '#BEA878' },
  { label: 'Present', color: '#C4A060' },
  { label: 'Warm', color: '#80A870' },
  { label: 'Flowing', color: '#5AA880' },
];

export const SHARING_IDX_KEY = 'colourmap:sharing-idx';

function loadIdx(): number {
  if (typeof window === 'undefined') return 2;
  try {
    const v = localStorage.getItem(SHARING_IDX_KEY);
    return v !== null ? Math.max(0, Math.min(SHARING_LEVELS.length - 1, Number(v))) : 2;
  } catch {
    return 2;
  }
}

function RainbowSlider({ idx, onSelect }: { idx: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex w-full gap-[5px]" style={{ maxWidth: 220 }}>
      {SHARING_LEVELS.map((l, i) => (
        <button
          key={l.label}
          type="button"
          onClick={() => onSelect(i)}
          className="flex-1 cursor-pointer transition-all duration-200"
          style={{
            height: 14,
            borderRadius: 3,
            background: l.color,
            opacity: i <= idx ? 0.85 : 0.15,
            border: 'none',
            boxShadow: i === idx ? `0 2px 8px ${l.color}55` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function SharingCheckIn() {
  const [idx, setIdx] = useState(2);

  useEffect(() => {
    setIdx(loadIdx());
  }, []);

  function pick(i: number) {
    setIdx(i);
    try {
      localStorage.setItem(SHARING_IDX_KEY, String(i));
    } catch {
      /* silent */
    }
  }

  const current = SHARING_LEVELS[idx];

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-8">
      {/* Big dot */}
      <div className="flex flex-col items-center gap-3">
        <span
          className="block rounded-full"
          style={{
            width: 96,
            height: 96,
            background: current.color,
            opacity: 0.92,
            boxShadow: `0 12px 32px -8px ${current.color}88`,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        />
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            fontWeight: 700,
            color: '#3A2010',
            letterSpacing: '0.18em',
            transition: 'color 0.3s',
          }}
        >
          {current.label}
        </span>
      </div>

      {/* 5-square rainbow slider */}
      <RainbowSlider idx={idx} onSelect={pick} />

      <div className="flex w-full justify-between" style={{ maxWidth: 220 }}>
        <span
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: SHARING_LEVELS[0].color,
            opacity: 0.6,
          }}
        >
          Disconnected
        </span>
        <span
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: SHARING_LEVELS[4].color,
            opacity: 0.6,
          }}
        >
          Flowing
        </span>
      </div>
    </div>
  );
}
