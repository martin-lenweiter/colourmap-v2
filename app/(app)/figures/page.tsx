'use client';

import { useState } from 'react';
import GoldenGod, { type FigureAsset } from '@/components/GoldenGod';

const FIGURES: FigureAsset[] = [
  {
    key: 'golden-god',
    label: 'Golden God',
    url: '/models/golden-god.obj',
    goldColor: '#E0A040',
    hologramColor: '#FFD080',
    starColor: '#FFE2A0',
  },
  {
    key: 'kid-lotus',
    label: 'Kid Lotus',
    url: '/models/kid-lotus.obj',
    goldColor: '#C9A06A',
    hologramColor: '#E8C898',
    starColor: '#F2D89A',
  },
];

const SERIF = 'var(--font-serif)';

export default function FiguresPage() {
  const [figure, setFigure] = useState<FigureAsset>(FIGURES[0]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0604',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '14px 22px 12px',
          borderBottom: '1px solid rgba(240,216,152,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,216,152,0.55)',
          }}
        >
          3D Figures · preview
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {FIGURES.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFigure(f)}
              aria-pressed={figure.key === f.key}
              style={{
                background: figure.key === f.key ? 'rgba(255,200,100,0.18)' : 'transparent',
                border: `1px solid ${figure.key === f.key ? 'rgba(255,200,100,0.55)' : 'rgba(240,216,152,0.25)'}`,
                borderRadius: 999,
                color: figure.key === f.key ? '#FFD080' : 'rgba(240,216,152,0.7)',
                fontFamily: SERIF,
                fontSize: 12,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                padding: '6px 14px',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        <GoldenGod
          key={figure.key}
          assetUrl={figure.url}
          goldColor={figure.goldColor}
          hologramColor={figure.hologramColor}
          starColor={figure.starColor}
        />
      </div>
    </div>
  );
}
