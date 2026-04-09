'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   DOING DEPTH — The Life Wheel
   Reads trackers from Box 1. Shows radar shape with colour.
   Add quick ratings directly if no trackers exist.
   ═══════════════════════════════════════════════════════════ */

const TRACKERS_KEY = 'colourmap:doing-trackers-list';
const WHEEL_KEY = 'colourmap:wheel-aspects';
const MISSIONS_KEY = 'colourmap:missions';

interface WheelAspect {
  name: string;
  value: number; // 1-8
}

function loadTrackers(): { id: string; name: string; days: boolean[] }[] {
  try {
    return JSON.parse(localStorage.getItem(TRACKERS_KEY) || '[]');
  } catch {
    return [];
  }
}
function loadWheelAspects(): WheelAspect[] {
  try {
    return JSON.parse(localStorage.getItem(WHEEL_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveWheelAspects(aspects: WheelAspect[]) {
  localStorage.setItem(WHEEL_KEY, JSON.stringify(aspects));
}
function loadMissions(): { name: string; progress: number }[] {
  try {
    return JSON.parse(localStorage.getItem(MISSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

const ASPECT_COLORS = [
  '#D4805A',
  '#C4A060',
  '#7A9A7A',
  '#6890B0',
  '#9B6BA0',
  '#C87050',
  '#6B8F4E',
  '#B07070',
];

const SUGGESTED_ASPECTS = [
  'Sleep',
  'Sport',
  'Work',
  'Reading',
  'Social',
  'Creative',
  'Health',
  'Rest',
];

export default function DoingDepth() {
  const [trackers, setTrackers] = useState<{ id: string; name: string; days: boolean[] }[]>([]);
  const [aspects, setAspects] = useState<WheelAspect[]>([]);
  const [missions, setMissions] = useState<{ name: string; progress: number }[]>([]);
  const [activeAspect, setActiveAspect] = useState<string | null>(null);
  const [newAspect, setNewAspect] = useState('');

  useEffect(() => {
    setTrackers(loadTrackers());
    setAspects(loadWheelAspects());
    setMissions(loadMissions());
    const poll = () => {
      setTrackers(loadTrackers());
      setAspects(loadWheelAspects());
      setMissions(loadMissions());
    };
    window.addEventListener('focus', poll);
    return () => window.removeEventListener('focus', poll);
  }, []);

  const trackerData = trackers.map((t) => ({
    name: t.name,
    completed: t.days.filter(Boolean).length,
  }));
  const allPoints = [
    ...trackerData.map((t) => ({ name: t.name, value: Math.round((t.completed / 7) * 8) })),
    ...aspects.filter((a) => !trackerData.some((t) => t.name === a.name)),
  ];

  const addAspect = (name: string) => {
    if (!name.trim() || allPoints.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const next = [...aspects, { name: name.trim(), value: 4 }];
    setAspects(next);
    saveWheelAspects(next);
    setNewAspect('');
  };

  const rateAspect = (name: string, value: number) => {
    const next = aspects.map((a) => (a.name === name ? { ...a, value } : a));
    if (!next.some((a) => a.name === name)) next.push({ name, value });
    setAspects(next);
    saveWheelAspects(next);
  };

  const removeAspect = (name: string) => {
    const next = aspects.filter((a) => a.name !== name);
    setAspects(next);
    saveWheelAspects(next);
    if (activeAspect === name) setActiveAspect(null);
  };

  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 85;
  const count = allPoints.length;
  const totalScore =
    count > 0 ? Math.round((allPoints.reduce((s, p) => s + p.value, 0) / (count * 8)) * 100) : 0;

  // Mission progress ring
  const missionProgress =
    missions.length > 0
      ? Math.round(missions.reduce((s, m) => s + m.progress, 0) / missions.length)
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
        style={{ color: '#7A9A7A' }}
      >
        Life Wheel
      </p>

      {/* Radar SVG */}
      {count >= 3 && (
        <div className="flex justify-center">
          <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
            <defs>
              {/* Coloured gradient fill for the data shape */}
              <radialGradient id="wheel-fill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#7A9A7A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#C4A060" stopOpacity="0.08" />
              </radialGradient>
            </defs>

            {/* Grid rings with subtle colour */}
            {[0.25, 0.5, 0.75, 1].map((r, i) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={maxR * r}
                fill="none"
                stroke={i === 3 ? '#7A9A7A' : '#C4B890'}
                strokeWidth={i === 3 ? '0.6' : '0.4'}
                opacity={i === 3 ? 0.2 : 0.1}
              />
            ))}

            {/* Spoke lines with colour */}
            {allPoints.map((p, i) => {
              const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
              const color = ASPECT_COLORS[i % ASPECT_COLORS.length];
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={cx + maxR * Math.cos(angle)}
                  y2={cy + maxR * Math.sin(angle)}
                  stroke={color}
                  strokeWidth="0.5"
                  opacity={0.2}
                />
              );
            })}

            {/* Data shape with gradient */}
            <path
              d={`${allPoints
                .map((p, i) => {
                  const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                  const r = maxR * (p.value / 8);
                  return `${i === 0 ? 'M' : 'L'} ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)}`;
                })
                .join(' ')} Z`}
              fill="url(#wheel-fill)"
              stroke="#7A9A7A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Coloured dots + labels per aspect */}
            {allPoints.map((p, i) => {
              const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
              const r = maxR * (p.value / 8);
              const color = ASPECT_COLORS[i % ASPECT_COLORS.length];
              const isActive = activeAspect === p.name;
              return (
                <g
                  key={p.name}
                  className="cursor-pointer"
                  onClick={() => setActiveAspect(isActive ? null : p.name)}
                >
                  {/* Glow behind dot */}
                  {isActive && (
                    <circle
                      cx={cx + r * Math.cos(angle)}
                      cy={cy + r * Math.sin(angle)}
                      r={10}
                      fill={color}
                      opacity={0.15}
                    />
                  )}
                  <circle
                    cx={cx + r * Math.cos(angle)}
                    cy={cy + r * Math.sin(angle)}
                    r={isActive ? 5 : 3.5}
                    fill={color}
                    opacity={isActive ? 0.9 : 0.7}
                  />
                  <text
                    x={cx + (maxR + 16) * Math.cos(angle)}
                    y={cy + (maxR + 16) * Math.sin(angle)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: isActive ? '11px' : '9px',
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: isActive ? 700 : 500,
                      fill: color,
                    }}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}

            {/* Mission progress arc (outer ring) */}
            {missions.length > 0 && (
              <path
                d={(() => {
                  const r = maxR + 6;
                  const endAngle = -Math.PI / 2 + (missionProgress / 100) * Math.PI * 2;
                  const largeArc = missionProgress > 50 ? 1 : 0;
                  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${cx + r * Math.cos(endAngle)} ${cy + r * Math.sin(endAngle)}`;
                })()}
                fill="none"
                stroke="#D4805A"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={0.4}
              />
            )}

            {/* Center score */}
            <text
              x={cx}
              y={cy + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '18px',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 700,
                fill: '#7A9A7A',
                opacity: 0.5,
              }}
            >
              {totalScore}
            </text>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              style={{
                fontSize: '7px',
                fontFamily: 'var(--font-handwritten)',
                fill: '#7A9A7A',
                opacity: 0.3,
              }}
            >
              rhythm
            </text>
          </svg>
        </div>
      )}

      {/* Active aspect rating */}
      {activeAspect &&
        (() => {
          const idx = allPoints.findIndex((p) => p.name === activeAspect);
          const aspect = allPoints[idx];
          if (!aspect) return null;
          const color = ASPECT_COLORS[idx % ASPECT_COLORS.length];
          return (
            <div className="mx-auto max-w-[280px] space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color, fontFamily: 'var(--font-handwritten)' }}
                >
                  {aspect.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs"
                    style={{ color, opacity: 0.5, fontFamily: 'var(--font-handwritten)' }}
                  >
                    {aspect.value}/8
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAspect(aspect.name)}
                    className="cursor-pointer text-[9px]"
                    style={{ color, opacity: 0.3, background: 'none', border: 'none' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-[3px]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                  const isN = n === aspect.value;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => rateAspect(aspect.name, n)}
                      className="flex-1 cursor-pointer transition-all duration-200"
                      style={{
                        height: isN ? 22 : 10,
                        borderRadius: 3,
                        background: color,
                        opacity: isN ? 0.8 : n <= aspect.value ? 0.3 : 0.08,
                        border: 'none',
                        padding: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })()}

      {/* Aspect suggestions */}
      {count < 3 && (
        <div className="space-y-3">
          <p
            className="text-center text-xs"
            style={{ color: '#7A9A7A', opacity: 0.5, fontFamily: 'var(--font-handwritten)' }}
          >
            Add at least 3 aspects to see your wheel.
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SUGGESTED_ASPECTS.filter((s) => !allPoints.some((p) => p.name === s)).map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => addAspect(s)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all hover:scale-105"
                style={{
                  background: `${ASPECT_COLORS[i % ASPECT_COLORS.length]}10`,
                  border: `1px solid ${ASPECT_COLORS[i % ASPECT_COLORS.length]}20`,
                  color: ASPECT_COLORS[i % ASPECT_COLORS.length],
                  fontFamily: 'var(--font-handwritten)',
                  fontWeight: 600,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add custom aspect */}
      <input
        type="text"
        value={newAspect}
        onChange={(e) => setNewAspect(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') addAspect(newAspect);
        }}
        placeholder="+ add aspect..."
        className="w-full border-b bg-transparent pb-2 text-sm outline-none text-center"
        style={{
          color: '#7A9A7A',
          borderColor: '#7A9A7A20',
          fontFamily: 'var(--font-handwritten)',
        }}
      />
    </div>
  );
}
