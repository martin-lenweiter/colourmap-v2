'use client';

import { useRef, useState } from 'react';
import CareCompass from '@/components/CareCompass';
import CaringDepth from '@/components/CaringDepth';
import ShareCompass from '@/components/ShareCompass';
import StarCompass from '@/components/StarCompass';

const COMPASSES = [
  { id: 'caring', label: 'Caring', component: CareCompass },
  { id: 'doing', label: 'Doing', component: StarCompass },
  { id: 'sharing', label: 'Sharing', component: ShareCompass },
] as const;

type DepthTab = 'compass' | 'work' | 'reflect';

const DEPTH_TABS: { id: DepthTab; label: string; color: string }[] = [
  { id: 'compass', label: 'Compass', color: '#C4A060' },
  { id: 'work', label: 'Work', color: '#D4805A' },
  { id: 'reflect', label: 'Reflect', color: '#9B6BA0' },
];

export default function CompassCarousel() {
  const [idx, setIdx] = useState(0);
  const [depthTab, setDepthTab] = useState<DepthTab>('compass');
  const containerRef = useRef<HTMLDivElement>(null);
  const Current = COMPASSES[idx].component;

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (depthTab !== 'compass') return; // Carousel swipe only when viewing compass
    if (!containerRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) {
      setIdx((idx - 1 + COMPASSES.length) % COMPASSES.length);
    } else if (x > rect.width * 0.75) {
      setIdx((idx + 1) % COMPASSES.length);
    }
  };

  return (
    <div
      className="space-y-4 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#8A6A4A50',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Depth tabs — Compass / Work / Reflect */}
      <div className="flex justify-center gap-3">
        {DEPTH_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setDepthTab(t.id)}
            className="cursor-pointer rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition-all duration-200"
            style={{
              background: depthTab === t.id ? `${t.color}18` : 'transparent',
              border: `1px solid ${depthTab === t.id ? `${t.color}40` : '#C4A06020'}`,
              color: t.color,
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {depthTab === 'compass' && (
        <div ref={containerRef} className="relative cursor-pointer" onClick={handleTap}>
          {/* Left/right tap zones — visual hint arrows */}
          <div
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-lg"
            style={{ color: '#C4A060', opacity: 0.25, pointerEvents: 'none' }}
          >
            ‹
          </div>
          <div
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-lg"
            style={{ color: '#C4A060', opacity: 0.25, pointerEvents: 'none' }}
          >
            ›
          </div>

          {/* Compass */}
          <div className="animate-in fade-in duration-200">
            <Current />
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 pt-3">
            {COMPASSES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className="cursor-pointer transition-all"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#C4A060',
                  opacity: i === idx ? 0.8 : 0.2,
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {depthTab === 'work' && (
        <div className="animate-in fade-in duration-200">
          <CaringDepth forcedTab="work" />
        </div>
      )}

      {depthTab === 'reflect' && (
        <div className="animate-in fade-in duration-200">
          <CaringDepth forcedTab="reflect" />
        </div>
      )}
    </div>
  );
}
