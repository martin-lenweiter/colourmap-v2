'use client';

import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   SHARING CHECK-IN — big dot + drag slider.
   Shares the Lonely → Connected scale with ReflectThreeDots
   (same LS key so the Overview reflect box and this dot
   stay in sync).
   ═══════════════════════════════════════════════════════════ */

export const SHARING_LEVELS = [
  { label: 'Lonely', color: '#7B6FA0' },
  { label: 'Withdrawn', color: '#8880B0' },
  { label: 'Distant', color: '#8BAAC8' },
  { label: 'Present', color: '#7ABCB8' },
  { label: 'Warm', color: '#6ABDA8' },
  { label: 'Close', color: '#5AAFA0' },
  { label: 'Connected', color: '#48A898' },
];

export const SHARING_IDX_KEY = 'colourmap:sharing-idx';

function loadIdx(): number {
  if (typeof window === 'undefined') return 3;
  try {
    const v = localStorage.getItem(SHARING_IDX_KEY);
    return v !== null ? Math.max(0, Math.min(SHARING_LEVELS.length - 1, Number(v))) : 3;
  } catch {
    return 3;
  }
}

function DragSlider({ idx, onSelect }: { idx: number; onSelect: (i: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const n = SHARING_LEVELS.length;
  const DOT = 28;
  const GAP = 6;
  const TOTAL = n * DOT + (n - 1) * GAP;

  function idxFromX(clientX: number) {
    const el = containerRef.current;
    if (!el) return idx;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(n - 1, Math.round((x / rect.width) * (n - 1))));
  }

  return (
    <div
      ref={containerRef}
      className="relative flex cursor-pointer items-center"
      style={{ width: TOTAL, height: DOT, touchAction: 'none' }}
      onMouseDown={(e) => onSelect(idxFromX(e.clientX))}
      onMouseMove={(e) => {
        if (e.buttons > 0) onSelect(idxFromX(e.clientX));
      }}
      onTouchStart={(e) => onSelect(idxFromX(e.touches[0].clientX))}
      onTouchMove={(e) => {
        e.preventDefault();
        onSelect(idxFromX(e.touches[0].clientX));
      }}
    >
      {/* Track line */}
      <div
        className="absolute"
        style={{
          left: DOT / 2,
          right: DOT / 2,
          top: '50%',
          height: 2,
          transform: 'translateY(-50%)',
          background: `linear-gradient(to right, ${SHARING_LEVELS[0].color}60, ${SHARING_LEVELS[n - 1].color}60)`,
          borderRadius: 2,
        }}
      />
      {/* Stop dots */}
      {SHARING_LEVELS.map((l, i) => {
        const isActive = i === idx;
        const dist = Math.abs(i - idx);
        return (
          <div
            key={l.label}
            className="absolute transition-all duration-150"
            style={{
              left: i * (DOT + GAP),
              width: DOT,
              height: DOT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="block rounded-full transition-all duration-200"
              style={{
                width: isActive ? DOT : 10,
                height: isActive ? DOT : 10,
                background: l.color,
                opacity: isActive ? 1 : dist === 1 ? 0.5 : 0.25,
                boxShadow: isActive ? `0 4px 14px ${l.color}66` : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function SharingCheckIn() {
  const [idx, setIdx] = useState(3);

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
    <div
      className="flex flex-col items-center gap-6 rounded-3xl border px-5 py-8"
      style={{
        borderColor: `${current.color}30`,
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
        transition: 'border-color 0.3s',
      }}
    >
      <p
        className="text-center font-semibold uppercase"
        style={{
          color: current.color,
          fontSize: '12px',
          letterSpacing: '0.22em',
          transition: 'color 0.3s',
        }}
      >
        Sharing
      </p>

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
            color: current.color,
            letterSpacing: '0.18em',
            transition: 'color 0.3s',
          }}
        >
          {current.label}
        </span>
      </div>

      {/* Drag slider */}
      <DragSlider idx={idx} onSelect={pick} />

      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          color: '#8A6A4A',
          opacity: 0.5,
        }}
      >
        Lonely · Connected
      </p>
    </div>
  );
}
