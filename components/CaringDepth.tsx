'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARING DEPTH — Inner Weather (Full Colour)
   Your emotional patterns visualised as weather.
   The whole card shifts colour with your dominant climate.
   ═══════════════════════════════════════════════════════════ */

const WEATHER_KEY = 'colourmap:inner-weather';

interface WeatherEntry {
  id: string;
  name: string;
  kind: 'storm' | 'rain' | 'fog' | 'breeze' | 'sun';
  intensity: number; // 1-5
  lastSeen: string;
}

const KIND_META: Record<
  string,
  {
    emoji: string;
    color: string;
    label: string;
    gradient: [string, string];
    skyTop: string;
    skyBottom: string;
    cardBg: [string, string];
    border: string;
  }
> = {
  storm: {
    emoji: '⛈',
    color: '#8B5E3C',
    label: 'intense',
    gradient: ['#6B4830', '#A0784C'],
    skyTop: '#5A4030',
    skyBottom: '#9A7858',
    cardBg: ['rgba(90,64,48,0.12)', 'rgba(160,120,76,0.08)'],
    border: '#8B5E3C50',
  },
  rain: {
    emoji: '🌧',
    color: '#4A7898',
    label: 'heavy',
    gradient: ['#3A6080', '#78B0D8'],
    skyTop: '#3A5A78',
    skyBottom: '#88B8D8',
    cardBg: ['rgba(58,96,128,0.10)', 'rgba(120,176,216,0.06)'],
    border: '#4A789850',
  },
  fog: {
    emoji: '🌫',
    color: '#8A7A60',
    label: 'unclear',
    gradient: ['#7A6A50', '#B8A880'],
    skyTop: '#9A8A70',
    skyBottom: '#C8B890',
    cardBg: ['rgba(154,138,112,0.10)', 'rgba(200,184,144,0.06)'],
    border: '#8A7A6050',
  },
  breeze: {
    emoji: '🍃',
    color: '#4A8A5A',
    label: 'gentle',
    gradient: ['#3A7A4A', '#80C880'],
    skyTop: '#4A8058',
    skyBottom: '#A0D8A0',
    cardBg: ['rgba(74,138,90,0.10)', 'rgba(128,200,128,0.06)'],
    border: '#4A8A5A50',
  },
  sun: {
    emoji: '☀',
    color: '#C49030',
    label: 'bright',
    gradient: ['#D07030', '#E8C840'],
    skyTop: '#D08840',
    skyBottom: '#F0D870',
    cardBg: ['rgba(208,136,64,0.12)', 'rgba(240,216,112,0.06)'],
    border: '#C4903050',
  },
};

const KINDS: Array<WeatherEntry['kind']> = ['storm', 'rain', 'fog', 'breeze', 'sun'];

const SUGGESTIONS: Record<string, string[]> = {
  storm: ['Anger', 'Overwhelm', 'Frustration', 'Panic'],
  rain: ['Sadness', 'Grief', 'Loneliness', 'Nostalgia'],
  fog: ['Confusion', 'Numbness', 'Avoidance', 'Fatigue'],
  breeze: ['Calm', 'Hope', 'Acceptance', 'Curiosity'],
  sun: ['Joy', 'Gratitude', 'Confidence', 'Love'],
};

function load(): WeatherEntry[] {
  try {
    return JSON.parse(localStorage.getItem(WEATHER_KEY) || '[]');
  } catch {
    return [];
  }
}
function save(e: WeatherEntry[]) {
  localStorage.setItem(WEATHER_KEY, JSON.stringify(e));
}

export default function CaringDepth() {
  const [entries, setEntries] = useState<WeatherEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingKind, setAddingKind] = useState<WeatherEntry['kind'] | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setEntries(load());
  }, []);

  const add = (name: string, kind: WeatherEntry['kind']) => {
    if (!name.trim()) return;
    const next = [
      ...entries,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        kind,
        intensity: 3,
        lastSeen: new Date().toISOString(),
      },
    ];
    setEntries(next);
    save(next);
    setInput('');
    setAddingKind(null);
  };

  const rate = (id: string, intensity: number) => {
    const next = entries.map((e) =>
      e.id === id ? { ...e, intensity, lastSeen: new Date().toISOString() } : e,
    );
    setEntries(next);
    save(next);
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    save(next);
    if (activeId === id) setActiveId(null);
  };

  // Climate calculation
  const kindCounts = KINDS.map((k) => ({
    kind: k,
    entries: entries.filter((e) => e.kind === k),
  }));
  const dominantKind =
    entries.length > 0
      ? kindCounts.reduce((a, b) => {
          const aScore = a.entries.reduce((s, e) => s + e.intensity, 0);
          const bScore = b.entries.reduce((s, e) => s + e.intensity, 0);
          return bScore > aScore ? b : a;
        }, kindCounts[0])
      : null;

  const warmth =
    entries.length > 0
      ? Math.round(
          (entries.reduce((s, e) => {
            const kindIdx = KINDS.indexOf(e.kind);
            return s + (kindIdx / 4) * (e.intensity / 5);
          }, 0) /
            entries.length) *
            100,
        )
      : 50;

  // Dominant weather drives card colour
  const dom = dominantKind?.entries.length ? KIND_META[dominantKind.kind] : null;
  const cardBg = dom
    ? `linear-gradient(180deg, ${dom.cardBg[0]}, ${dom.cardBg[1]}), linear-gradient(180deg, rgba(242,232,210,0.92), rgba(236,224,204,0.90))`
    : 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))';
  const cardBorder = dom ? dom.border : '#8A6A4A50';
  const titleColor = dom ? dom.color : '#C4A060';

  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div
      className="space-y-4 rounded-3xl border px-5 py-6 transition-all duration-700"
      style={{
        background: cardBg,
        borderColor: cardBorder,
        boxShadow: dom
          ? `0 28px 55px -36px ${dom.color}30`
          : '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors duration-700"
        style={{ color: titleColor }}
      >
        Inner Weather
      </p>

      {/* Sky visualisation */}
      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            {/* Full sky gradient — shifts with dominant weather */}
            <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dom ? dom.skyTop : '#B0A080'} stopOpacity="0.25" />
              <stop offset="50%" stopColor={dom ? dom.skyBottom : '#D8C8A0'} stopOpacity="0.12" />
              <stop offset="100%" stopColor="#E8D8B8" stopOpacity="0.06" />
            </linearGradient>
            {/* Per-weather glow defs */}
            {KINDS.map((k) => (
              <radialGradient key={k} id={`glow-${k}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={KIND_META[k].color} stopOpacity="0.35" />
                <stop offset="60%" stopColor={KIND_META[k].color} stopOpacity="0.10" />
                <stop offset="100%" stopColor={KIND_META[k].color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width={sz} height={sz} rx="20" fill="url(#sky-grad)" />

          {/* Horizon band with colour */}
          <rect
            x="0"
            y={cy + 20}
            width={sz}
            height={sz - cy - 20}
            rx="0"
            fill={dom ? dom.color : '#C4B890'}
            opacity="0.04"
          />
          <line
            x1="20"
            y1={cy + 20}
            x2={sz - 20}
            y2={cy + 20}
            stroke={dom ? dom.color : '#C4B890'}
            strokeWidth="0.6"
            opacity="0.15"
          />

          {/* All 5 weather positions — always visible, coloured */}
          {KINDS.map((k, i) => {
            const meta = KIND_META[k];
            const kEntries = kindCounts[i].entries;
            const hasEntries = kEntries.length > 0;
            const avgIntensity = hasEntries
              ? kEntries.reduce((s, e) => s + e.intensity, 0) / kEntries.length
              : 0;

            // Fixed positions in a gentle arc
            const positions = [
              { x: 38, y: 58 }, // storm — top-left
              { x: 75, y: 42 }, // rain — upper-left
              { x: 110, y: 35 }, // fog — top-center
              { x: 145, y: 42 }, // breeze — upper-right
              { x: 182, y: 58 }, // sun — top-right
            ];
            const pos = positions[i];
            const orbR = hasEntries ? 14 + avgIntensity * 5 : 12;
            const opacity = hasEntries ? 0.15 + avgIntensity * 0.08 : 0.04;

            return (
              <g key={k} className="transition-all duration-700">
                {/* Colour glow */}
                {hasEntries && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={orbR + 12}
                    fill={`url(#glow-${k})`}
                    className="transition-all duration-700"
                  />
                )}
                {/* Orb body */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={orbR}
                  fill={meta.color}
                  opacity={opacity}
                  className="transition-all duration-700"
                  style={{
                    filter:
                      hasEntries && avgIntensity > 3
                        ? `drop-shadow(0 0 ${avgIntensity * 4}px ${meta.color}50)`
                        : undefined,
                  }}
                />
                {/* Inner bright core */}
                {hasEntries && avgIntensity > 2 && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={orbR * 0.4}
                    fill={meta.gradient[1]}
                    opacity={0.2}
                  />
                )}
                {/* Emoji */}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: hasEntries ? `${12 + avgIntensity * 2}px` : '10px',
                    opacity: hasEntries ? 1 : 0.3,
                  }}
                >
                  {meta.emoji}
                </text>
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + orbR + 12}
                  textAnchor="middle"
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                    fill: meta.color,
                    opacity: hasEntries ? 0.8 : 0.25,
                  }}
                >
                  {k}
                </text>
                {/* Count badge */}
                {hasEntries && (
                  <text
                    x={pos.x}
                    y={pos.y + orbR + 22}
                    textAnchor="middle"
                    style={{
                      fontSize: '7px',
                      fontFamily: 'var(--font-handwritten)',
                      fill: meta.color,
                      opacity: 0.4,
                    }}
                  >
                    {kEntries.length}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center warmth score — coloured by dominant */}
          <text
            x={cx}
            y={cy + 55}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '22px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: dom ? dom.color : '#B8905A',
              opacity: 0.5,
            }}
          >
            {warmth}
          </text>
          <text
            x={cx}
            y={cy + 72}
            textAnchor="middle"
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-handwritten)',
              fill: dom ? dom.color : '#B8905A',
              opacity: 0.3,
            }}
          >
            warmth
          </text>

          {/* Colour bar at bottom showing weather mix */}
          {entries.length > 0 &&
            (() => {
              const total = entries.reduce((s, e) => s + e.intensity, 0);
              let xOffset = 25;
              const barWidth = sz - 50;
              return (
                <g>
                  {KINDS.map((k) => {
                    const kEntries = entries.filter((e) => e.kind === k);
                    if (kEntries.length === 0) return null;
                    const kTotal = kEntries.reduce((s, e) => s + e.intensity, 0);
                    const width = (kTotal / total) * barWidth;
                    const meta = KIND_META[k];
                    const segment = (
                      <rect
                        key={k}
                        x={xOffset}
                        y={cy + 85}
                        width={width}
                        height={4}
                        rx={2}
                        fill={meta.color}
                        opacity={0.4}
                      />
                    );
                    xOffset += width + 1;
                    return segment;
                  })}
                </g>
              );
            })()}
        </svg>
      </div>

      {/* Weather kind buttons — coloured backgrounds */}
      <div className="flex justify-center gap-1.5">
        {KINDS.map((k) => {
          const meta = KIND_META[k];
          const count = entries.filter((e) => e.kind === k).length;
          const isAdding = addingKind === k;
          const isDominant = dominantKind?.kind === k && dominantKind.entries.length > 0;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setAddingKind(isAdding ? null : k)}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-300"
              style={{
                background: isAdding
                  ? `linear-gradient(180deg, ${meta.gradient[0]}20, ${meta.gradient[1]}10)`
                  : isDominant
                    ? `${meta.color}0A`
                    : 'transparent',
                border: `1.5px solid ${isAdding ? `${meta.color}50` : isDominant ? `${meta.color}25` : `${meta.color}12`}`,
                minWidth: 50,
                boxShadow: isAdding ? `0 4px 12px -4px ${meta.color}30` : undefined,
              }}
            >
              <span style={{ fontSize: '18px', filter: count > 0 ? undefined : 'grayscale(0.6)' }}>
                {meta.emoji}
              </span>
              <span
                className="text-[9px] font-bold capitalize"
                style={{
                  color: meta.color,
                  fontFamily: 'var(--font-handwritten)',
                  opacity: count > 0 ? 1 : 0.4,
                }}
              >
                {k}
              </span>
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 text-[7px] font-bold"
                  style={{ background: `${meta.color}15`, color: meta.color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add input — appears when a kind is selected */}
      {addingKind && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: `linear-gradient(135deg, ${KIND_META[addingKind].gradient[0]}10, ${KIND_META[addingKind].gradient[1]}08)`,
              border: `1px solid ${KIND_META[addingKind].color}20`,
            }}
          >
            <span style={{ fontSize: '16px' }}>{KIND_META[addingKind].emoji}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add(input, addingKind);
              }}
              placeholder={`Name this ${addingKind}...`}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{
                color: KIND_META[addingKind].color,
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 600,
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pl-2">
            {SUGGESTIONS[addingKind]
              .filter((s) => !entries.some((e) => e.name === s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s, addingKind)}
                  className="cursor-pointer rounded-full px-3 py-1 text-[10px] transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${KIND_META[addingKind].gradient[0]}12, ${KIND_META[addingKind].gradient[1]}08)`,
                    border: `1px solid ${KIND_META[addingKind].color}25`,
                    color: KIND_META[addingKind].color,
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 700,
                  }}
                >
                  {s}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Entries list — each entry coloured by its weather */}
      {entries.length > 0 && (
        <div className="space-y-1.5">
          {entries.map((e) => {
            const meta = KIND_META[e.kind];
            const isActive = activeId === e.id;
            return (
              <div key={e.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(isActive ? null : e.id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-300"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${meta.gradient[0]}15, ${meta.gradient[1]}08)`
                      : `${meta.color}05`,
                    border: `1px solid ${isActive ? `${meta.color}35` : `${meta.color}15`}`,
                    boxShadow: isActive ? `0 4px 12px -6px ${meta.color}20` : undefined,
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{meta.emoji}</span>
                  <span
                    className="flex-1 text-xs"
                    style={{
                      color: meta.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                    }}
                  >
                    {e.name}
                  </span>
                  {/* Coloured intensity dots */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="rounded-full transition-all"
                        style={{
                          width: n <= e.intensity ? 7 : 5,
                          height: n <= e.intensity ? 7 : 5,
                          background:
                            n <= e.intensity
                              ? `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`
                              : meta.color,
                          opacity: n <= e.intensity ? 0.7 : 0.1,
                        }}
                      />
                    ))}
                  </div>
                </button>
                {isActive && (
                  <div className="mt-1.5 flex items-center gap-1.5 px-3 animate-in fade-in duration-150">
                    <span
                      className="text-[9px]"
                      style={{
                        color: meta.color,
                        opacity: 0.5,
                        fontFamily: 'var(--font-handwritten)',
                      }}
                    >
                      faint
                    </span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => rate(e.id, n)}
                        className="flex-1 cursor-pointer rounded-lg transition-all duration-300"
                        style={{
                          height: n === e.intensity ? 20 : 8,
                          background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
                          opacity: n === e.intensity ? 0.8 : 0.12,
                          border: 'none',
                          padding: 0,
                          boxShadow:
                            n === e.intensity ? `0 3px 8px -3px ${meta.color}40` : undefined,
                        }}
                      />
                    ))}
                    <span
                      className="text-[9px]"
                      style={{
                        color: meta.color,
                        opacity: 0.5,
                        fontFamily: 'var(--font-handwritten)',
                      }}
                    >
                      intense
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      className="cursor-pointer text-[9px] ml-1"
                      style={{
                        color: meta.color,
                        opacity: 0.3,
                        background: 'none',
                        border: 'none',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {entries.length === 0 && !addingKind && (
        <p
          className="text-center text-xs"
          style={{ color: '#B8905A', opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
        >
          Tap a weather to name what you&apos;re feeling.
        </p>
      )}
    </div>
  );
}
