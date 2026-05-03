'use client';

import { useEffect, useState } from 'react';

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
            color: '#3A2010',
            letterSpacing: '0.18em',
            transition: 'color 0.3s',
          }}
        >
          {current.label}
        </span>
      </div>

      {/* Range slider */}
      <input
        type="range"
        min={0}
        max={DOING_LEVELS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => pick(Number(e.target.value))}
        style={{ width: '100%', maxWidth: 220, accentColor: current.color, cursor: 'pointer' }}
      />
      <div className="flex w-full justify-between" style={{ maxWidth: 220 }}>
        <span
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: DOING_LEVELS[0].color,
            opacity: 0.6,
          }}
        >
          Deep Rest
        </span>
        <span
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: DOING_LEVELS[DOING_LEVELS.length - 1].color,
            opacity: 0.6,
          }}
        >
          Tunnel Vision
        </span>
      </div>

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
