'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * DoingStateCircle — big circle + drag slider for the Doing tab.
 * Mirrors the SharingCheckIn circle+slider pattern so F / D / S
 * all share the same visual anchor: colour circle → label → drag dots.
 * Scale: Deep Rest → Tunnel Vision (engagement / focus intensity).
 */

const DOING_LEVELS = [
  { label: 'Deep Rest', color: '#A8B8D0' },
  { label: 'Drifting', color: '#90A8C0' },
  { label: 'Present', color: '#7898B0' },
  { label: 'Working', color: '#6890B0' },
  { label: 'Focused', color: '#5080A8' },
  { label: 'Driven', color: '#3870A0' },
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

function DragSlider({ idx, onSelect }: { idx: number; onSelect: (i: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const n = DOING_LEVELS.length;
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
          background: `linear-gradient(to right, ${DOING_LEVELS[0].color}60, ${DOING_LEVELS[n - 1].color}60)`,
          borderRadius: 2,
        }}
      />
      {/* Tick marks */}
      {DOING_LEVELS.map((_, i) => (
        <div
          key={`tick-${i}`}
          className="absolute"
          style={{
            left: i * (DOT + GAP) + DOT / 2 - 1,
            top: '72%',
            width: 2,
            height: 6,
            background: 'rgba(26,18,9,0.35)',
            borderRadius: 1,
          }}
        />
      ))}
      {/* Stop dots */}
      {DOING_LEVELS.map((l, i) => {
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

export default function DoingStateCircle() {
  const [idx, setIdx] = useState(3);

  useEffect(() => {
    setIdx(loadIdx());
  }, []);

  function pick(i: number) {
    setIdx(i);
    try {
      localStorage.setItem(LS_KEY, String(i));
    } catch {
      /* silent */
    }
  }

  const current = DOING_LEVELS[idx];

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-8">
      <p
        className="text-center font-semibold uppercase"
        style={{
          color: current.color,
          fontSize: '12px',
          letterSpacing: '0.22em',
          transition: 'color 0.3s',
        }}
      >
        Doing
      </p>

      {/* Big circle */}
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
        Deep Rest · Tunnel Vision
      </p>
    </div>
  );
}
