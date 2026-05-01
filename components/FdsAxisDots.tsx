'use client';

import { useState } from 'react';

/*
 * FdsAxisDots — lightweight F/D/S selector showing the 4 compass
 * sub-items for the chosen axis as losange (rotated-square) dots
 * in a horizontal or vertical layout.
 *
 * Axis names and gradient colours unified with CompassCarousel so
 * the two surfaces read as one system. This component is the
 * shallow entry point; CompassCarousel is the deep one.
 */

type Axis = 'feeling' | 'doing' | 'sharing';
type Layout = 'h' | 'v';

const AXES: Record<
  Axis,
  { label: string; color: string; items: { name: string; color: string }[] }
> = {
  feeling: {
    label: 'F',
    color: '#D4805A',
    items: [
      { name: 'Care', color: '#D4B088' },
      { name: 'Attitude', color: '#D09060' },
      { name: 'Rest', color: '#C47850' },
      { name: 'Emotions', color: '#B85A30' },
    ],
  },
  doing: {
    label: 'D',
    color: '#6890B0',
    items: [
      { name: 'Structure', color: '#9AABB8' },
      { name: 'Target', color: '#7A98B0' },
      { name: 'Action', color: '#5A88A8' },
      { name: 'Resources', color: '#4878A8' },
    ],
  },
  sharing: {
    label: 'S',
    color: '#6B7F4E',
    items: [
      { name: 'Social Life', color: '#9AAF80' },
      { name: 'Authentic', color: '#7A9860' },
      { name: 'Roots', color: '#5A8840' },
      { name: 'Express', color: '#4A6A2A' },
    ],
  },
};

const ORDER: Axis[] = ['feeling', 'doing', 'sharing'];
const font = 'var(--font-serif)';

export default function FdsAxisDots() {
  const [active, setActive] = useState<Axis | null>(null);
  const [layout, setLayout] = useState<Layout>('h');

  const axis = active ? AXES[active] : null;

  return (
    <div className="space-y-3">
      {/* F / D / S pill selector */}
      <div className="flex justify-center gap-3">
        {ORDER.map((id) => {
          const a = AXES[id];
          const isOn = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(isOn ? null : id)}
              style={{
                fontFamily: font,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: isOn ? a.color : '#8A6A4A',
                background: isOn ? `${a.color}15` : 'transparent',
                border: `1px solid ${isOn ? `${a.color}50` : '#C4A06025'}`,
                borderRadius: 20,
                padding: '3px 16px',
                cursor: 'pointer',
                opacity: active !== null && !isOn ? 0.4 : 1,
                transition: 'all 0.15s',
              }}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {/* 4-dot display for selected axis */}
      {axis && (
        <div className="animate-in fade-in duration-150 space-y-4">
          {/* H / V toggle */}
          <div className="flex justify-center gap-1">
            {(['h', 'v'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLayout(l)}
                style={{
                  background: layout === l ? `${axis.color}18` : 'transparent',
                  border: `1px solid ${layout === l ? `${axis.color}40` : `${axis.color}18`}`,
                  borderRadius: 20,
                  padding: '2px 10px',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontFamily: font,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: axis.color,
                  opacity: layout === l ? 1 : 0.45,
                }}
              >
                {l === 'h' ? '—' : '|'}
              </button>
            ))}
          </div>

          {layout === 'h' ? (
            <div className="flex justify-center gap-7">
              {axis.items.map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-2.5">
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      background: item.color,
                      display: 'block',
                      transform: 'rotate(45deg)',
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 11,
                      fontWeight: 500,
                      color: item.color,
                      letterSpacing: '0.06em',
                      textAlign: 'center',
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {axis.items.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      background: item.color,
                      display: 'block',
                      transform: 'rotate(45deg)',
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font,
                      fontSize: 14,
                      fontWeight: 500,
                      color: item.color,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
