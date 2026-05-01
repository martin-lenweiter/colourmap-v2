'use client';

import { useEffect, useState } from 'react';

/*
 * DoingStateCircle — big circle + dot selector for the Doing tab.
 * 7 stops from green (Deep Rest) to blue (Tunnel Vision).
 * Mirrors the SharingCheckIn circle pattern so F / D / S share the same anchor.
 */

const DOING_LEVELS = [
  { label: 'Deep Rest', color: '#5A9A70' },
  { label: 'Drifting', color: '#4A9A85' },
  { label: 'Present', color: '#4A9898' },
  { label: 'Working', color: '#4A8AA8' },
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

function DotSelector({ idx, onSelect }: { idx: number; onSelect: (i: number) => void }) {
  const DOT = 28;
  const GAP = 6;

  return (
    <div className="flex items-center" style={{ gap: GAP }}>
      {DOING_LEVELS.map((l, i) => {
        const isActive = i === idx;
        const dist = Math.abs(i - idx);
        return (
          <button
            key={l.label}
            type="button"
            onClick={() => onSelect(i)}
            className="cursor-pointer transition-all duration-200"
            style={{
              width: isActive ? DOT : 10,
              height: isActive ? DOT : 10,
              borderRadius: '50%',
              background: l.color,
              opacity: isActive ? 1 : dist === 1 ? 0.5 : 0.25,
              boxShadow: isActive ? `0 4px 14px ${l.color}66` : 'none',
              border: 'none',
              padding: 0,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

export default function DoingStateCircle({ onDone }: { onDone?: () => void }) {
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

      {/* Dot selector — no track line, no tick marks */}
      <DotSelector idx={idx} onSelect={pick} />

      {/* Done button */}
      <button
        type="button"
        onClick={onDone}
        className="cursor-pointer rounded-full px-6 py-1.5"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#C4A060',
          background: '#C4A06012',
          border: '1px solid #C4A06040',
        }}
      >
        Done
      </button>
    </div>
  );
}
