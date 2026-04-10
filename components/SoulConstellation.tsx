'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   SOUL CONSTELLATION — Inner Terrain + People Stars
   Place emotional aspects and people on the same map.
   Aspects are organic cells. People are stars.
   Closeness to center = importance. Colour = category.
   ═══════════════════════════════════════════════════════════ */

const SOUL_KEY = 'colourmap:soul-constellation';

const CATEGORIES = [
  { id: 'fear', label: 'Fear', color: '#D4605A', emoji: '🔥' },
  { id: 'emotion', label: 'Emotion', color: '#E0844A', emoji: '💧' },
  { id: 'need', label: 'Need', color: '#C49850', emoji: '🌱' },
  { id: 'strength', label: 'Strength', color: '#7AAA58', emoji: '⚡' },
  { id: 'shadow', label: 'Shadow', color: '#5B6FB0', emoji: '🌙' },
  { id: 'person', label: 'Person', color: '#C4A060', emoji: '⭐' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface SoulPoint {
  id: string;
  name: string;
  category: CategoryId;
  intensity: number; // 1-5
  angle: number; // radians, position on the circle
  createdAt: string;
}

const CELL_SHAPES = [
  '60% 40% 55% 45% / 50% 60% 40% 50%',
  '45% 55% 40% 60% / 55% 45% 55% 45%',
  '50% 50% 45% 55% / 40% 60% 50% 50%',
  '55% 45% 60% 40% / 50% 50% 45% 55%',
  '52% 48% 42% 58% / 48% 52% 56% 44%',
  '58% 42% 50% 50% / 44% 56% 42% 58%',
];

const PROMPTS: Partial<Record<CategoryId, string[]>> = {
  fear: ['Anger', 'Doubt', 'Loss', 'Rejection'],
  emotion: ['Sadness', 'Joy', 'Longing', 'Peace'],
  need: ['Rest', 'Connection', 'Freedom', 'Safety'],
  strength: ['Courage', 'Empathy', 'Focus', 'Patience'],
  shadow: ['Control', 'Avoidance', 'Shame', 'Perfectionism'],
};

function load(): SoulPoint[] {
  try {
    return JSON.parse(localStorage.getItem(SOUL_KEY) || '[]');
  } catch {
    return [];
  }
}
function save(pts: SoulPoint[]) {
  localStorage.setItem(SOUL_KEY, JSON.stringify(pts));
}

export default function SoulConstellation() {
  const [points, setPoints] = useState<SoulPoint[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingCat, setAddingCat] = useState<CategoryId | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setPoints(load());
  }, []);

  const add = (name: string, category: CategoryId) => {
    if (!name.trim()) return;
    const existing = points.filter((p) => p.category === category);
    const baseAngle =
      (CATEGORIES.findIndex((c) => c.id === category) / CATEGORIES.length) * Math.PI * 2;
    const offset = existing.length * 0.4;
    const next = [
      ...points,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        intensity: 3,
        angle: baseAngle + offset - Math.PI / 2,
        createdAt: new Date().toISOString(),
      },
    ];
    setPoints(next);
    save(next);
    setInput('');
    setAddingCat(null);
  };

  const rate = (id: string, intensity: number) => {
    const next = points.map((p) => (p.id === id ? { ...p, intensity } : p));
    setPoints(next);
    save(next);
  };

  const remove = (id: string) => {
    const next = points.filter((p) => p.id !== id);
    setPoints(next);
    save(next);
    if (activeId === id) setActiveId(null);
  };

  const sz = 280;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 110;

  // Category stats
  const catCounts = CATEGORIES.map((c) => ({
    ...c,
    count: points.filter((p) => p.category === c.id).length,
    avgIntensity:
      points.filter((p) => p.category === c.id).length > 0
        ? points.filter((p) => p.category === c.id).reduce((s, p) => s + p.intensity, 0) /
          points.filter((p) => p.category === c.id).length
        : 0,
  }));

  const totalBalance =
    points.length > 0
      ? Math.round((points.reduce((s, p) => s + p.intensity, 0) / (points.length * 5)) * 100)
      : 0;

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
        style={{ color: '#8A6A4A' }}
      >
        Soul Map
      </p>

      {/* SVG Terrain */}
      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            {CATEGORIES.map((c) => (
              <radialGradient key={c.id} id={`soul-${c.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0" />
              </radialGradient>
            ))}
            <radialGradient id="soul-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C4A060" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C4A060" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Center warmth */}
          <circle cx={cx} cy={cy} r={60} fill="url(#soul-center)" />

          {/* Orbit rings */}
          {[0.3, 0.55, 0.8, 1].map((r, i) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={maxR * r}
              fill="none"
              stroke="#C4B890"
              strokeWidth="0.3"
              opacity={0.06 + i * 0.02}
              strokeDasharray="4 6"
            />
          ))}

          {/* Category zone arcs — faint background sectors */}
          {CATEGORIES.map((c, i) => {
            const startAngle = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
            const endAngle = ((i + 1) / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
            const midAngle = (startAngle + endAngle) / 2;
            const hasPoints = catCounts[i].count > 0;
            return (
              <g key={c.id}>
                {/* Zone label at edge */}
                <text
                  x={cx + (maxR + 16) * Math.cos(midAngle)}
                  y={cy + (maxR + 16) * Math.sin(midAngle)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                    fill: c.color,
                    opacity: hasPoints ? 0.6 : 0.2,
                  }}
                >
                  {c.emoji} {c.label}
                </text>
                {/* Faint sector line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + maxR * Math.cos(startAngle)}
                  y2={cy + maxR * Math.sin(startAngle)}
                  stroke={c.color}
                  strokeWidth="0.3"
                  opacity={0.06}
                />
              </g>
            );
          })}

          {/* Points — organic cells for aspects, glowing circles for people */}
          {points.map((p, idx) => {
            const cat = CATEGORIES.find((c) => c.id === p.category);
            if (!cat) return null;
            const dist = maxR * (1 - (p.intensity - 1) / 4); // high intensity = closer to center
            const x = cx + dist * Math.cos(p.angle);
            const y = cy + dist * Math.sin(p.angle);
            const isActive = activeId === p.id;
            const isPerson = p.category === 'person';
            const cellSize = 14 + p.intensity * 4;

            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onClick={() => setActiveId(isActive ? null : p.id)}
              >
                {/* Glow */}
                <circle
                  cx={x}
                  cy={y}
                  r={cellSize + 6}
                  fill={`url(#soul-${p.category})`}
                  className="transition-all duration-500"
                />

                {isPerson ? (
                  <>
                    {/* Star shape for people */}
                    <circle
                      cx={x}
                      cy={y}
                      r={cellSize * 0.5}
                      fill={cat.color}
                      opacity={0.15 + p.intensity * 0.12}
                      className="transition-all duration-500"
                      style={{
                        filter:
                          p.intensity > 3
                            ? `drop-shadow(0 0 ${p.intensity * 3}px ${cat.color}40)`
                            : undefined,
                      }}
                    />
                    <circle cx={x} cy={y} r={cellSize * 0.2} fill="#fff" opacity={0.25} />
                  </>
                ) : (
                  <>
                    {/* Organic cell shape for inner aspects */}
                    <foreignObject
                      x={x - cellSize / 2}
                      y={y - cellSize / 2}
                      width={cellSize}
                      height={cellSize}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: CELL_SHAPES[idx % CELL_SHAPES.length],
                          background: cat.color,
                          opacity: 0.2 + p.intensity * 0.1,
                          transition: 'all 0.5s ease',
                        }}
                      />
                    </foreignObject>
                  </>
                )}

                {/* Name */}
                <text
                  x={x}
                  y={y + cellSize * 0.5 + 10}
                  textAnchor="middle"
                  style={{
                    fontSize: isActive ? '10px' : '8px',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: isActive ? 700 : 500,
                    fill: cat.color,
                    opacity: 0.7,
                  }}
                >
                  {p.name}
                </text>
              </g>
            );
          })}

          {/* Center score */}
          <text
            x={cx}
            y={cy + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '20px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#8A6A4A',
              opacity: 0.4,
            }}
          >
            {totalBalance}
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fill: '#8A6A4A',
              opacity: 0.25,
            }}
          >
            balance
          </text>
        </svg>
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {CATEGORIES.map((c) => {
          const count = points.filter((p) => p.category === c.id).length;
          const isAdding = addingCat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setAddingCat(isAdding ? null : c.id)}
              className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 transition-all duration-200"
              style={{
                background: isAdding ? `${c.color}18` : count > 0 ? `${c.color}08` : 'transparent',
                border: `1.5px solid ${isAdding ? `${c.color}40` : `${c.color}15`}`,
              }}
            >
              <span style={{ fontSize: '12px' }}>{c.emoji}</span>
              <span
                className="text-[9px] font-bold"
                style={{
                  color: c.color,
                  fontFamily: 'var(--font-handwritten)',
                  opacity: count > 0 ? 1 : 0.4,
                }}
              >
                {c.label}
              </span>
              {count > 0 && (
                <span
                  className="text-[7px] font-bold rounded-full px-1"
                  style={{ background: `${c.color}15`, color: c.color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add input */}
      {addingCat && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: `${CATEGORIES.find((c) => c.id === addingCat)!.color}08`,
              border: `1px solid ${CATEGORIES.find((c) => c.id === addingCat)!.color}20`,
            }}
          >
            <span style={{ fontSize: '14px' }}>
              {CATEGORIES.find((c) => c.id === addingCat)!.emoji}
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add(input, addingCat);
              }}
              placeholder={`Name a ${addingCat}...`}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{
                color: CATEGORIES.find((c) => c.id === addingCat)!.color,
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 600,
              }}
              autoFocus
            />
          </div>
          {PROMPTS[addingCat] && (
            <div className="flex flex-wrap gap-1.5 pl-2">
              {PROMPTS[addingCat]!.filter((s) => !points.some((p) => p.name === s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s, addingCat)}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] transition-all hover:scale-105"
                  style={{
                    background: `${CATEGORIES.find((c) => c.id === addingCat)!.color}10`,
                    border: `1px solid ${CATEGORIES.find((c) => c.id === addingCat)!.color}20`,
                    color: CATEGORIES.find((c) => c.id === addingCat)!.color,
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active point detail */}
      {activeId &&
        (() => {
          const point = points.find((p) => p.id === activeId);
          if (!point) return null;
          const cat = CATEGORIES.find((c) => c.id === point.category)!;
          return (
            <div className="mx-auto max-w-[280px] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: '12px' }}>{cat.emoji}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: cat.color, fontFamily: 'var(--font-handwritten)' }}
                  >
                    {point.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(point.id)}
                  className="cursor-pointer text-[9px]"
                  style={{ color: cat.color, opacity: 0.3, background: 'none', border: 'none' }}
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px]"
                  style={{
                    color: cat.color,
                    opacity: 0.4,
                    fontFamily: 'var(--font-handwritten)',
                  }}
                >
                  faint
                </span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => rate(point.id, n)}
                    className="flex-1 cursor-pointer rounded-lg transition-all duration-300"
                    style={{
                      height: n === point.intensity ? 20 : 8,
                      background: cat.color,
                      opacity: n === point.intensity ? 0.7 : 0.1,
                      border: 'none',
                      padding: 0,
                    }}
                  />
                ))}
                <span
                  className="text-[9px]"
                  style={{
                    color: cat.color,
                    opacity: 0.4,
                    fontFamily: 'var(--font-handwritten)',
                  }}
                >
                  core
                </span>
              </div>
            </div>
          );
        })()}

      {points.length === 0 && !addingCat && (
        <p
          className="text-center text-xs"
          style={{ color: '#8A6A4A', opacity: 0.35, fontFamily: 'var(--font-handwritten)' }}
        >
          Map your inner terrain. Fears, needs, strengths, shadows, people.
        </p>
      )}
    </div>
  );
}
