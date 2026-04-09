'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   SHARING DEPTH — The Constellation
   People as stars. Add names, rate closeness, see the shape.
   ═══════════════════════════════════════════════════════════ */

const CONSTELLATION_KEY = 'colourmap:constellation';

interface Star {
  id: string;
  name: string;
  closeness: number; // 1-5 (1=distant, 5=very close)
  createdAt: string;
}

function loadStars(): Star[] {
  try {
    return JSON.parse(localStorage.getItem(CONSTELLATION_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStars(stars: Star[]) {
  localStorage.setItem(CONSTELLATION_KEY, JSON.stringify(stars));
}

export default function SharingDepth() {
  const [stars, setStars] = useState<Star[]>([]);
  const [input, setInput] = useState('');
  const [activeStar, setActiveStar] = useState<string | null>(null);

  useEffect(() => {
    setStars(loadStars());
  }, []);

  const addStar = (name: string) => {
    if (!name.trim() || stars.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    const next = [
      ...stars,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        closeness: 3,
        createdAt: new Date().toISOString(),
      },
    ];
    setStars(next);
    saveStars(next);
    setInput('');
  };

  const rateStar = (id: string, closeness: number) => {
    const next = stars.map((s) => (s.id === id ? { ...s, closeness } : s));
    setStars(next);
    saveStars(next);
  };

  const removeStar = (id: string) => {
    const next = stars.filter((s) => s.id !== id);
    setStars(next);
    saveStars(next);
    if (activeStar === id) setActiveStar(null);
  };

  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;
  const count = stars.length;
  const avgCloseness =
    count > 0 ? Math.round((stars.reduce((s, st) => s + st.closeness, 0) / count) * 20) : 0;

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

      {/* Star map */}
      {count > 0 && (
        <div className="flex justify-center">
          <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
            {/* Connection lines */}
            {stars.length >= 2 &&
              stars.map((s, i) => {
                const next = stars[(i + 1) % stars.length];
                const a1 = (i / count) * Math.PI * 2 - Math.PI / 2;
                const a2 = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2;
                const r1 = 30 + (5 - s.closeness) * 14;
                const r2 = 30 + (5 - next.closeness) * 14;
                if (s.closeness < 3 && next.closeness < 3) return null;
                return (
                  <line
                    key={`l-${i}`}
                    x1={cx + r1 * Math.cos(a1)}
                    y1={cy + r1 * Math.sin(a1)}
                    x2={cx + r2 * Math.cos(a2)}
                    y2={cy + r2 * Math.sin(a2)}
                    stroke="#C4A060"
                    strokeWidth="0.4"
                    opacity={0.1}
                    strokeDasharray="3 3"
                  />
                );
              })}

            {/* Stars */}
            {stars.map((s, i) => {
              const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
              const dist = 30 + (5 - s.closeness) * 14; // closer = nearer center
              const x = cx + dist * Math.cos(angle);
              const y = cy + dist * Math.sin(angle);
              const brightness = s.closeness / 5;
              const isActive = activeStar === s.id;

              return (
                <g
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => setActiveStar(isActive ? null : s.id)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={brightness * 5 + 3}
                    fill="#C4A060"
                    opacity={brightness * 0.6 + 0.15}
                    className="transition-all duration-500"
                    style={{
                      filter: brightness > 0.6 ? 'drop-shadow(0 0 5px #C4A06050)' : undefined,
                    }}
                  />
                  <text
                    x={x}
                    y={y + (brightness * 5 + 3) + 11}
                    textAnchor="middle"
                    style={{
                      fontSize: isActive ? '11px' : '9px',
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: isActive ? 700 : 500,
                      fill: '#6B7F4E',
                      opacity: brightness * 0.4 + 0.3,
                    }}
                  >
                    {s.name}
                  </text>
                </g>
              );
            })}

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
              {avgCloseness}
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
      )}

      {/* Active star rating */}
      {activeStar &&
        (() => {
          const star = stars.find((s) => s.id === activeStar);
          if (!star) return null;
          return (
            <div className="mx-auto max-w-[280px] space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#6B7F4E', fontFamily: 'var(--font-handwritten)' }}
                >
                  {star.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeStar(star.id)}
                  className="cursor-pointer text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60"
                  style={{ background: 'none', border: 'none' }}
                >
                  remove
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: '#6B7F4E', opacity: 0.4 }}>
                  distant
                </span>
                <div className="flex flex-1 items-center gap-[4px]">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isN = n === star.closeness;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => rateStar(star.id, n)}
                        className="flex-1 cursor-pointer rounded-full transition-all duration-200"
                        style={{
                          height: isN ? 20 : 10,
                          background: '#6B7F4E',
                          opacity: isN ? 0.7 : n < star.closeness ? 0.3 : 0.1,
                          border: 'none',
                          padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px]" style={{ color: '#6B7F4E', opacity: 0.4 }}>
                  close
                </span>
              </div>
            </div>
          );
        })()}

      {count === 0 && (
        <p
          className="text-center text-xs"
          style={{ color: '#6B7F4E', opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
        >
          Add the people who matter. See how close you feel.
        </p>
      )}

      {/* Add person */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') addStar(input);
        }}
        placeholder="+ add a person..."
        className="w-full border-b bg-transparent pb-2 text-sm outline-none text-center"
        style={{
          color: '#6B7F4E',
          borderColor: '#6B7F4E20',
          fontFamily: 'var(--font-handwritten)',
        }}
      />
    </div>
  );
}
