'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   BOX DESIGN TOGGLE — per-box typography selector
   Elegant dropdown that controls the font used within a single card.
   ═══════════════════════════════════════════════════════════ */

export type BoxFont = 'handwritten' | 'cowboy' | 'serif' | 'groovy' | 'sketch';

export const BOX_FONTS: { id: BoxFont; name: string; font: string; color: string }[] = [
  { id: 'handwritten', name: 'Handwritten', font: 'var(--font-handwritten)', color: '#C4A060' },
  { id: 'cowboy', name: 'Cowboy', font: 'var(--font-cowboy)', color: '#8A7050' },
  { id: 'serif', name: 'Old School', font: 'var(--font-serif)', color: '#6B4830' },
  { id: 'groovy', name: 'Groovy', font: 'var(--font-groovy)', color: '#C4A060' },
  { id: 'sketch', name: 'Sketch', font: 'var(--font-sketch)', color: '#7A5A3A' },
];

interface BoxDesignToggleProps {
  storageKey: string;
  accentColor?: string;
  value: BoxFont;
  onChange: (font: BoxFont) => void;
}

export function useBoxFont(storageKey: string, defaultFont: BoxFont = 'handwritten') {
  const [font, setFontState] = useState<BoxFont>(() => {
    if (typeof window === 'undefined') return defaultFont;
    try {
      return (localStorage.getItem(storageKey) as BoxFont) || defaultFont;
    } catch {
      return defaultFont;
    }
  });

  function setFont(f: BoxFont) {
    setFontState(f);
    localStorage.setItem(storageKey, f);
  }

  const config = BOX_FONTS.find((b) => b.id === font) || BOX_FONTS[0];
  return { font, setFont, fontFamily: config.font, config };
}

export default function BoxDesignToggle({
  accentColor = '#C4A060',
  value,
  onChange,
}: BoxDesignToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" style={{ zIndex: 10 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wider transition-all"
        style={{
          color: open ? accentColor : `${accentColor}60`,
          background: open ? `${accentColor}10` : 'transparent',
          border: `1px solid ${open ? `${accentColor}30` : 'transparent'}`,
        }}
      >
        design
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 animate-in fade-in duration-150 rounded-xl overflow-hidden w-[140px]"
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border) / 0.3)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {BOX_FONTS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onChange(b.id);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-muted/30"
              style={{
                border: 'none',
                background: value === b.id ? `${b.color}10` : 'transparent',
              }}
            >
              <span
                style={{
                  fontFamily: b.font,
                  fontSize: '14px',
                  fontWeight: value === b.id ? 700 : 400,
                  color: value === b.id ? b.color : 'hsl(var(--muted-foreground))',
                }}
              >
                {b.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
