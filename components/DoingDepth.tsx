'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   DOING DEPTH — The Life Wheel
   Reads trackers from Box 1. Shows radar shape.
   Add quick ratings directly if no trackers exist.
   ═══════════════════════════════════════════════════════════ */

const TRACKERS_KEY = 'colourmap:doing-trackers-list';
const WHEEL_KEY = 'colourmap:wheel-aspects';

interface TrackerData {
  name: string;
  completed: number; // days completed this week (0-7)
}

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
  const [activeAspect, setActiveAspect] = useState<string | null>(null);
  const [newAspect, setNewAspect] = useState('');

  useEffect(() => {
    setTrackers(loadTrackers());
    setAspects(loadWheelAspects());
    const poll = () => {
      setTrackers(loadTrackers());
      setAspects(loadWheelAspects());
    };
    window.addEventListener('focus', poll);
    return () => window.removeEventListener('focus', poll);
  }, []);

  // Merge trackers + manual aspects into one data set
  const trackerData: TrackerData[] = trackers.map((t) => ({
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
            {[0.25, 0.5, 0.75, 1].map((r) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={maxR * r}
                fill="none"
                stroke="#C4B890"
                strokeWidth="0.4"
                opacity={0.1}
              />
            ))}
            {allPoints.map((_, i) => {
              const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={cx + maxR * Math.cos(angle)}
                  y2={cy + maxR * Math.sin(angle)}
                  stroke="#C4B890"
                  strokeWidth="0.3"
                  opacity={0.15}
                />
              );
            })}
            <path
              d={`${allPoints
                .map((p, i) => {
                  const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                  const r = maxR * (p.value / 8);
                  return `${i === 0 ? 'M' : 'L'} ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)}`;
                })
                .join(' ')} Z`}
              fill="#7A9A7A"
              opacity={0.12}
              stroke="#7A9A7A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {allPoints.map((p, i) => {
              const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
              const r = maxR * (p.value / 8);
              const isActive = activeAspect === p.name;
              return (
                <g
                  key={p.name}
                  className="cursor-pointer"
                  onClick={() => setActiveAspect(isActive ? null : p.name)}
                >
                  <circle
                    cx={cx + r * Math.cos(angle)}
                    cy={cy + r * Math.sin(angle)}
                    r={isActive ? 5 : 3.5}
                    fill="#7A9A7A"
                    opacity={isActive ? 0.9 : 0.6}
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
                      fill: '#7A9A7A',
                    }}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
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
          const aspect = allPoints.find((p) => p.name === activeAspect);
          if (!aspect) return null;
          return (
            <div className="mx-auto max-w-[280px] space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#7A9A7A', fontFamily: 'var(--font-handwritten)' }}
                >
                  {aspect.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: '#7A9A7A', opacity: 0.5, fontFamily: 'var(--font-handwritten)' }}
                >
                  {aspect.value}/8
                </span>
              </div>
              <div className="flex items-center gap-[3px]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                  const isN = n === aspect.value;
                  const dist = Math.abs(n - aspect.value);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => rateAspect(aspect.name, n)}
                      className="flex-1 cursor-pointer transition-all duration-200"
                      style={{
                        height: isN ? 22 : 10,
                        borderRadius: 2,
                        background: '#7A9A7A',
                        opacity: isN ? 1 : dist === 1 ? 0.4 : 0.1,
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

      {/* Aspect suggestions (if fewer than 3) */}
      {count < 3 && (
        <div className="space-y-3">
          <p
            className="text-center text-xs"
            style={{ color: '#7A9A7A', opacity: 0.5, fontFamily: 'var(--font-handwritten)' }}
          >
            Add at least 3 aspects to see your wheel.
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SUGGESTED_ASPECTS.filter((s) => !allPoints.some((p) => p.name === s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addAspect(s)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all hover:scale-105"
                style={{
                  background: '#7A9A7A10',
                  border: '1px solid #7A9A7A20',
                  color: '#7A9A7A',
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
