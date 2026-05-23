'use client';

import { useState } from 'react';
import AnimatedFigure from '@/components/AnimatedFigure';
import GoldenGod, { type FigureAsset } from '@/components/GoldenGod';

const STATIC_FIGURES: FigureAsset[] = [
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

const ANIMATED_FIGURES = [
  { key: 'robot', label: 'Robot', url: '/models/robot.glb', color: '#E0A040' },
  { key: 'soldier', label: 'Soldier', url: '/models/soldier.glb', color: '#C9A06A' },
  { key: 'cesium', label: 'Cesium Man', url: '/models/test-animated.glb', color: '#E8C898' },
];

const SERIF = 'var(--font-serif)';

type Mode = 'static' | 'animated';

export default function FiguresPage() {
  const [mode, setMode] = useState<Mode>('static');
  const [staticFig, setStaticFig] = useState<FigureAsset>(STATIC_FIGURES[0]);
  const [animFig, setAnimFig] = useState(ANIMATED_FIGURES[0]);

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
          flexWrap: 'wrap',
          gap: 10,
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
        <div style={{ display: 'flex', gap: 6 }}>
          <ModeButton active={mode === 'static'} onClick={() => setMode('static')}>
            Static (Level A)
          </ModeButton>
          <ModeButton active={mode === 'animated'} onClick={() => setMode('animated')}>
            Animated (Level B)
          </ModeButton>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(mode === 'static' ? STATIC_FIGURES : ANIMATED_FIGURES).map((f) => {
            const isActive = mode === 'static' ? staticFig.key === f.key : animFig.key === f.key;
            return (
              <ModeButton
                key={f.key}
                active={isActive}
                onClick={() => {
                  if (mode === 'static') setStaticFig(f as FigureAsset);
                  else setAnimFig(f as (typeof ANIMATED_FIGURES)[number]);
                }}
              >
                {f.label}
              </ModeButton>
            );
          })}
        </div>
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        {mode === 'static' ? (
          <GoldenGod
            key={staticFig.key}
            assetUrl={staticFig.url}
            goldColor={staticFig.goldColor}
            hologramColor={staticFig.hologramColor}
            starColor={staticFig.starColor}
          />
        ) : (
          <AnimatedFigure key={animFig.key} assetUrl={animFig.url} color={animFig.color} />
        )}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        background: active ? 'rgba(255,200,100,0.18)' : 'transparent',
        border: `1px solid ${active ? 'rgba(255,200,100,0.55)' : 'rgba(240,216,152,0.25)'}`,
        borderRadius: 999,
        color: active ? '#FFD080' : 'rgba(240,216,152,0.7)',
        fontFamily: SERIF,
        fontSize: 12,
        letterSpacing: '0.1em',
        cursor: 'pointer',
        padding: '6px 14px',
      }}
    >
      {children}
    </button>
  );
}
