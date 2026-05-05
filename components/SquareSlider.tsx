'use client';

import { useRef } from 'react';

export default function SquareSlider({
  colors,
  value,
  onChange,
  size = 14,
  gap = 5,
}: {
  colors: string[];
  value: number;
  onChange: (i: number) => void;
  size?: number;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function indexAt(clientX: number): number {
    if (!ref.current) return value;
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const i = Math.round(x / (size + gap));
    return Math.max(0, Math.min(colors.length - 1, i));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(indexAt(e.clientX));
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    const i = indexAt(e.clientX);
    if (i !== value) onChange(i);
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        touchAction: 'none',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {colors.map((c, si) => {
        const isActive = si === value;
        const dist = Math.abs(si - value);
        return (
          <div
            key={si}
            style={{
              width: size,
              height: size,
              background: c,
              borderRadius: 2,
              flexShrink: 0,
              opacity: isActive ? 1 : dist === 1 ? 0.55 : 0.2,
              transform: isActive ? 'scale(1.15)' : 'scale(1)',
              boxShadow: isActive ? `0 3px 10px -3px ${c}` : 'none',
              transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
            }}
          />
        );
      })}
    </div>
  );
}
