'use client';

import { useEffect, useState } from 'react';

const CONTEXTS = ['Process', 'Focus', 'Idea'] as const;
const LS_KEY = 'colourmap:open-contexts';

export default function ContextBoxes() {
  const [active, setActive] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as string[];
      setActive(new Set(stored));
    } catch {}
  }, []);

  function toggle(label: string) {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {CONTEXTS.map((label) => {
        const on = active.has(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(label)}
            style={{
              padding: '4px 11px',
              borderRadius: 20,
              border: on ? '1px solid #C4A060' : '1px solid rgba(196,160,96,0.28)',
              background: on ? 'rgba(196,160,96,0.15)' : 'transparent',
              color: on ? '#7A5010' : '#A08060',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: on ? 700 : 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: on ? '0 0 7px rgba(196,160,96,0.35)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
