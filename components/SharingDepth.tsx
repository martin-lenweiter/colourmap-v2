'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   SHARING DEPTH — The Constellation
   Box 3: People as stars. Brightness = connection recency.
   ═══════════════════════════════════════════════════════════ */

const PEOPLE_KEY = 'colourmap:sharing-people';
const CONNECTED_KEY = 'colourmap:share-connected';

function loadList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export default function SharingDepth() {
  const [people, setPeople] = useState<string[]>([]);
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    setPeople(loadList(PEOPLE_KEY));
    setConnected(loadList(CONNECTED_KEY));
    const poll = () => {
      setPeople(loadList(PEOPLE_KEY));
      setConnected(loadList(CONNECTED_KEY));
    };
    window.addEventListener('focus', poll);
    return () => window.removeEventListener('focus', poll);
  }, []);

  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;

  if (people.length === 0) {
    return (
      <div
        className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
          boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
        }}
      >
        <p
          className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: '#6B7F4E' }}
        >
          Constellation
        </p>
        <p
          className="text-center text-xs"
          style={{ color: '#6B7F4E', opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
        >
          Add people above to see your constellation.
        </p>
      </div>
    );
  }

  const connectedSet = new Set(connected.map((c) => c.toLowerCase()));
  const warmth =
    people.length > 0 ? Math.round((connected.length / Math.max(people.length, 1)) * 100) : 0;

  const stars = people.map((name, i) => {
    const angle = (i / people.length) * Math.PI * 2 - Math.PI / 2;
    const isConnected = connectedSet.has(name.toLowerCase());
    const brightness = isConnected ? 0.9 : 0.3;
    const dist = isConnected ? 0.5 : 0.8;
    const r = 30 + dist * 50;
    return {
      name,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      brightness,
      isConnected,
    };
  });

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#6B7F4E' }}
      >
        Constellation
      </p>

      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          {/* Connection lines between adjacent stars */}
          {stars.length >= 2 &&
            stars.map((s, i) => {
              const next = stars[(i + 1) % stars.length];
              if (!s.isConnected && !next.isConnected) return null;
              return (
                <line
                  key={`l-${i}`}
                  x1={s.x}
                  y1={s.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="#C4A060"
                  strokeWidth="0.4"
                  opacity={0.12}
                  strokeDasharray="3 3"
                />
              );
            })}

          {/* Stars */}
          {stars.map((s) => (
            <g key={s.name}>
              <circle
                cx={s.x}
                cy={s.y}
                r={s.brightness * 5 + 3}
                fill="#C4A060"
                opacity={s.brightness * 0.6 + 0.1}
                style={{
                  filter: s.brightness > 0.6 ? 'drop-shadow(0 0 5px #C4A06050)' : undefined,
                }}
                className="transition-all duration-500"
              />
              <text
                x={s.x}
                y={s.y + (s.brightness * 5 + 3) + 10}
                textAnchor="middle"
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-handwritten)',
                  fontWeight: 600,
                  fill: '#6B7F4E',
                  opacity: s.brightness * 0.4 + 0.3,
                }}
              >
                {s.name}
              </text>
            </g>
          ))}

          {/* Center warmth */}
          <text
            x={cx}
            y={cy + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#6B7F4E',
              opacity: 0.5,
            }}
          >
            {warmth}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            style={{
              fontSize: '7px',
              fontFamily: 'var(--font-handwritten)',
              fill: '#6B7F4E',
              opacity: 0.3,
            }}
          >
            warmth
          </text>
        </svg>
      </div>
    </div>
  );
}
