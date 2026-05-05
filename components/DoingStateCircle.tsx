'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function DoingStateCircle({ onDone }: { onDone?: () => void }) {
  const [idx, setIdx] = useState(3);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;

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

  function onCirclePointerDown(e: React.PointerEvent<HTMLSpanElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
  }

  function onCirclePointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (!dragRef.current || e.buttons !== 1) return;
    const dx = e.clientX - dragRef.current.startX;
    const steps = Math.round(dx / 18);
    pick(dragRef.current.startIdx + steps);
  }

  function onCirclePointerUp() {
    dragRef.current = null;
  }

  const current = DOING_LEVELS[idx];

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-8">
      {/* Big circle — draggable */}
      <div className="flex flex-col items-center gap-3">
        <span
          className="block rounded-full"
          onPointerDown={onCirclePointerDown}
          onPointerMove={onCirclePointerMove}
          onPointerUp={onCirclePointerUp}
          style={{
            width: 96,
            height: 96,
            background: current.color,
            opacity: 0.92,
            boxShadow: `0 12px 32px -8px ${current.color}88`,
            transition: 'background 0.3s, box-shadow 0.3s',
            cursor: 'ew-resize',
            touchAction: 'none',
            userSelect: 'none',
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

      {/* Square slider */}
      <SquareSlider colors={DOING_LEVELS.map((l) => l.color)} value={idx} onChange={pick} />
    </div>
  );
}
