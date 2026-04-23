'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   RAINBOW SLIDER — pastel desaturated 8-step slider.
   Three visual styles: circles, squares, losanges.
   Used by all compass rating bars.
   ═══════════════════════════════════════════════════════════ */

// Pastel desaturated rainbow — 8 steps from warm to cool
const RAINBOW = [
  '#E0908A', // soft coral
  '#E8A878', // peach
  '#D8C078', // warm gold
  '#C0D088', // sage
  '#A0C8A0', // mint
  '#90C0C0', // teal
  '#A0B0D0', // periwinkle
  '#B0A0C8', // lavender
];

type SliderStyle = 'circles' | 'squares' | 'losanges';

const STYLE_KEY = 'colourmap:rainbow-slider-style';

export default function RainbowSlider({
  value,
  onChange,
  label,
  labelColor,
  rhyme,
}: {
  value: number; // 1–8
  onChange: (n: number) => void;
  label: string;
  labelColor: string;
  rhyme?: string;
}) {
  const [style, setStyle] = useState<SliderStyle>(() => {
    if (typeof window === 'undefined') return 'circles';
    const s = localStorage.getItem(STYLE_KEY);
    if (s === 'squares' || s === 'losanges') return s;
    return 'circles';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STYLE_KEY, style);
    } catch {}
  }, [style]);

  const cycleStyle = () => {
    setStyle((s) => (s === 'circles' ? 'squares' : s === 'squares' ? 'losanges' : 'circles'));
  };

  const size = 26;
  const gap = 6;

  return (
    <div className="mx-auto max-w-[300px] space-y-2">
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-semibold"
          style={{ color: labelColor, fontFamily: 'var(--font-serif)' }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          {rhyme && (
            <span
              className="text-xs"
              style={{ color: labelColor, opacity: 0.5, fontFamily: 'var(--font-serif)' }}
            >
              {value}. {rhyme}
            </span>
          )}
          {/* Style toggle */}
          <button
            type="button"
            onClick={cycleStyle}
            className="flex cursor-pointer items-center justify-center"
            style={{ width: 16, height: 16, background: 'none', border: 'none' }}
            aria-label="Toggle slider style"
          >
            <span
              style={{
                display: 'block',
                width: 10,
                height: 10,
                background: '#8A6A4A',
                opacity: 0.4,
                borderRadius: style === 'circles' ? '50%' : '2px',
                transform: style === 'losanges' ? 'rotate(45deg)' : 'none',
                transition: 'all 0.2s',
              }}
            />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ gap: `${gap}px` }}>
        {RAINBOW.map((color, i) => {
          const n = i + 1;
          const isActive = n === value;
          const dist = Math.abs(n - value);

          const baseStyle: React.CSSProperties = {
            width: size,
            height: size,
            background: color,
            opacity: isActive ? 1 : dist === 1 ? 0.55 : 0.2,
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: isActive ? 'scale(1.15)' : 'scale(1)',
            boxShadow: isActive ? `0 3px 10px -3px ${color}` : 'none',
          };

          if (style === 'circles') {
            baseStyle.borderRadius = '50%';
          } else if (style === 'squares') {
            baseStyle.borderRadius = '3px';
          } else {
            baseStyle.borderRadius = '2px';
            baseStyle.transform = isActive ? 'rotate(45deg) scale(1.15)' : 'rotate(45deg)';
          }

          return <button key={n} type="button" onClick={() => onChange(n)} style={baseStyle} />;
        })}
      </div>
    </div>
  );
}
