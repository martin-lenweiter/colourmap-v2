'use client';

import { useEffect, useRef, useState } from 'react';
import SharingReflect from '@/components/SharingReflect';
import SquareSlider from '@/components/SquareSlider';

export const SHARING_LEVELS = [
  { label: 'Disconnected', color: '#9A8070' },
  { label: 'Distant', color: '#B8957A' },
  { label: 'Present', color: '#C49068' },
  { label: 'Warm', color: '#CC7858' },
  { label: 'Flowing', color: '#C06040' },
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

export default function SharingCheckIn() {
  const [idx, setIdx] = useState(2);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;

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

  function onCirclePointerDown(e: React.PointerEvent<HTMLSpanElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
    setDragging(true);
  }

  function onCirclePointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (!dragRef.current || e.buttons !== 1) return;
    const dx = e.clientX - dragRef.current.startX;
    const steps = Math.round(dx / 24);
    pick(dragRef.current.startIdx + steps);
  }

  function onCirclePointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  const current = SHARING_LEVELS[idx];

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-8">
      {/* Big dot — draggable */}
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
            fontSize: 22,
            fontWeight: 700,
            color: current.color,
            letterSpacing: '0.18em',
            transition: 'color 0.3s',
          }}
        >
          {current.label}
        </span>
      </div>

      {/* Square slider — visible only while dragging */}
      <div
        style={{
          maxHeight: dragging ? 40 : 0,
          opacity: dragging ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.15s, opacity 0.15s',
          pointerEvents: dragging ? 'auto' : 'none',
        }}
      >
        <SquareSlider
          colors={SHARING_LEVELS.map((l) => l.color)}
          value={idx}
          onChange={pick}
          size={18}
          gap={6}
        />
      </div>

      <div className="w-full">
        <SharingReflect />
      </div>
    </div>
  );
}
