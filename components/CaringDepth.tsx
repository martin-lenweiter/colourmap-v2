'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARING DEPTH — Strengths & Weaknesses Map + Inner Weather
   Two tabs: MAP (colour pills + triangle wheel) and
   WEATHER (emotional climate from your patterns).
   ═══════════════════════════════════════════════════════════ */

/* ─── Storage ─── */
const PILLS_KEY = 'colourmap:pattern-pills';
const WEATHER_KEY = 'colourmap:inner-weather';

/* ─── Types ─── */
interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  intensity: number; // 1-5
  locked: boolean;
  createdAt: string;
}

interface WeatherEntry {
  id: string;
  name: string;
  kind: 'storm' | 'rain' | 'fog' | 'breeze' | 'sun';
  intensity: number;
  lastSeen: string;
}

/* ─── Colour palettes ─── */
const STRENGTH_COLORS = ['#D4805A', '#C4A060', '#C49030', '#D06848', '#B89040'];
const WEAKNESS_COLORS = ['#6890B0', '#9B6BA0', '#8B5E3C', '#7A7A9A', '#5A7A8A'];

const STRENGTH_SUGGESTIONS = [
  'Courage',
  'Empathy',
  'Discipline',
  'Creativity',
  'Honesty',
  'Patience',
  'Focus',
  'Resilience',
];
const WEAKNESS_SUGGESTIONS = [
  'Overthinking',
  'Avoidance',
  'Self-doubt',
  'Control',
  'People-pleasing',
  'Perfectionism',
  'Procrastination',
  'Impatience',
];

/* ─── Weather meta ─── */
const WEATHER_KINDS = ['storm', 'rain', 'fog', 'breeze', 'sun'] as const;
type WeatherKind = (typeof WEATHER_KINDS)[number];

const WEATHER_META: Record<
  string,
  { emoji: string; color: string; gradient: [string, string]; skyTop: string; skyBottom: string }
> = {
  storm: {
    emoji: '⛈',
    color: '#8B5E3C',
    gradient: ['#6B4830', '#A0784C'],
    skyTop: '#5A4030',
    skyBottom: '#9A7858',
  },
  rain: {
    emoji: '🌧',
    color: '#4A7898',
    gradient: ['#3A6080', '#78B0D8'],
    skyTop: '#3A5A78',
    skyBottom: '#88B8D8',
  },
  fog: {
    emoji: '🌫',
    color: '#8A7A60',
    gradient: ['#7A6A50', '#B8A880'],
    skyTop: '#9A8A70',
    skyBottom: '#C8B890',
  },
  breeze: {
    emoji: '🍃',
    color: '#4A8A5A',
    gradient: ['#3A7A4A', '#80C880'],
    skyTop: '#4A8058',
    skyBottom: '#A0D8A0',
  },
  sun: {
    emoji: '☀',
    color: '#C49030',
    gradient: ['#D07030', '#E8C840'],
    skyTop: '#D08840',
    skyBottom: '#F0D870',
  },
};

const WEATHER_SUGGESTIONS: Record<string, string[]> = {
  storm: ['Anger', 'Overwhelm', 'Frustration', 'Panic'],
  rain: ['Sadness', 'Grief', 'Loneliness', 'Nostalgia'],
  fog: ['Confusion', 'Numbness', 'Avoidance', 'Fatigue'],
  breeze: ['Calm', 'Hope', 'Acceptance', 'Curiosity'],
  sun: ['Joy', 'Gratitude', 'Confidence', 'Love'],
};

/* ─── Storage helpers ─── */
function loadPills(): PatternPill[] {
  try {
    return JSON.parse(localStorage.getItem(PILLS_KEY) || '[]');
  } catch {
    return [];
  }
}
function savePills(p: PatternPill[]) {
  localStorage.setItem(PILLS_KEY, JSON.stringify(p));
}

function loadWeather(): WeatherEntry[] {
  try {
    return JSON.parse(localStorage.getItem(WEATHER_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveWeather(w: WeatherEntry[]) {
  localStorage.setItem(WEATHER_KEY, JSON.stringify(w));
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CaringDepth() {
  const [tab, setTab] = useState<'map' | 'weather'>('map');
  const [pills, setPills] = useState<PatternPill[]>([]);
  const [weather, setWeather] = useState<WeatherEntry[]>([]);

  useEffect(() => {
    setPills(loadPills());
    setWeather(loadWeather());
  }, []);

  const strengths = pills.filter((p) => p.type === 'strength');
  const weaknesses = pills.filter((p) => p.type === 'weakness');
  const balance =
    pills.length > 0
      ? Math.round(
          ((strengths.reduce((s, p) => s + p.intensity, 0) -
            weaknesses.reduce((s, p) => s + p.intensity, 0) +
            pills.length * 5) /
            (pills.length * 10)) *
            100,
        )
      : 50;

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Tab switcher */}
      <div className="flex gap-1">
        {[
          { id: 'map' as const, label: 'Map', color: '#C4A060' },
          { id: 'weather' as const, label: 'Weather', color: '#4A8A5A' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 cursor-pointer rounded-lg py-1.5 text-center uppercase tracking-[0.18em] transition-all duration-200"
            style={{
              background: tab === t.id ? `${t.color}12` : 'transparent',
              border: `1.5px solid ${tab === t.id ? `${t.color}40` : `${t.color}15`}`,
              color: t.color,
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        <MapTab
          pills={pills}
          setPills={(next) => {
            setPills(next);
            savePills(next);
          }}
          strengths={strengths}
          weaknesses={weaknesses}
          balance={balance}
        />
      )}

      {tab === 'weather' && (
        <WeatherTab
          weather={weather}
          setWeather={(next) => {
            setWeather(next);
            saveWeather(next);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAP TAB — Colour pills + Triangle Wheel
   ═══════════════════════════════════════════════════════════ */
function MapTab({
  pills,
  setPills,
  strengths,
  weaknesses,
  balance,
}: {
  pills: PatternPill[];
  setPills: (p: PatternPill[]) => void;
  strengths: PatternPill[];
  weaknesses: PatternPill[];
  balance: number;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<'strength' | 'weakness' | null>(null);
  const [input, setInput] = useState('');

  const addPill = (name: string, type: 'strength' | 'weakness') => {
    if (!name.trim() || pills.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const colors = type === 'strength' ? STRENGTH_COLORS : WEAKNESS_COLORS;
    const existing = pills.filter((p) => p.type === type);
    const next = [
      ...pills,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        color: colors[existing.length % colors.length],
        intensity: 3,
        locked: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setPills(next);
    setInput('');
    setAddingType(null);
  };

  const ratePill = (id: string, intensity: number) => {
    setPills(pills.map((p) => (p.id === id ? { ...p, intensity } : p)));
  };

  const lockPill = (id: string) => {
    setPills(pills.map((p) => (p.id === id ? { ...p, locked: !p.locked } : p)));
  };

  const removePill = (id: string) => {
    setPills(pills.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(null);
  };

  /* ─── Triangle Wheel SVG ─── */
  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 85;
  const n = pills.length;

  return (
    <div className="space-y-4">
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#C4A060' }}
      >
        Strengths & Weaknesses
      </p>

      {/* Triangle Wheel — visible when 3+ pills */}
      {n >= 3 && (
        <div className="flex justify-center">
          <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
            {/* Background rings */}
            {[0.33, 0.66, 1].map((r) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={maxR * r}
                fill="none"
                stroke="#C4B890"
                strokeWidth="0.3"
                opacity="0.08"
              />
            ))}

            {/* Divider line: strengths right, weaknesses left */}
            <line
              x1={cx}
              y1={cy - maxR - 5}
              x2={cx}
              y2={cy + maxR + 5}
              stroke="#C4B890"
              strokeWidth="0.3"
              opacity="0.1"
            />

            {/* Triangle spokes */}
            {pills.map((pill, i) => {
              const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
              const tipR = maxR * (pill.intensity / 5);
              const innerR = tipR * 0.22;
              const spread = Math.min(0.35, Math.PI / n);
              const sa = angle - spread;
              const ea = angle + spread;
              const isActive = activeId === pill.id;

              const tipX = cx + tipR * Math.cos(angle);
              const tipY = cy + tipR * Math.sin(angle);
              const sX1 = cx + innerR * Math.cos(sa);
              const sY1 = cy + innerR * Math.sin(sa);
              const sX2 = cx + innerR * Math.cos(ea);
              const sY2 = cy + innerR * Math.sin(ea);

              return (
                <g
                  key={pill.id}
                  className="cursor-pointer"
                  onClick={() => setActiveId(isActive ? null : pill.id)}
                >
                  {/* Triangle spoke */}
                  <polygon
                    points={`${cx},${cy} ${sX1},${sY1} ${tipX},${tipY} ${sX2},${sY2}`}
                    fill={pill.color}
                    opacity={isActive ? 0.75 : 0.2 + (pill.intensity / 5) * 0.25}
                    className="transition-all duration-500"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${pill.color}50)` : undefined,
                    }}
                  />
                  {/* Dot at tip */}
                  <circle
                    cx={tipX}
                    cy={tipY}
                    r={isActive ? 5 : 3}
                    fill={pill.color}
                    opacity={isActive ? 0.9 : 0.7}
                    className="transition-all duration-300"
                  />
                  {/* Lock indicator */}
                  {pill.locked && (
                    <circle
                      cx={tipX}
                      cy={tipY}
                      r={6}
                      fill="none"
                      stroke={pill.color}
                      strokeWidth="1"
                      opacity="0.4"
                    />
                  )}
                  {/* Label outside */}
                  <text
                    x={cx + (maxR + 16) * Math.cos(angle)}
                    y={cy + (maxR + 16) * Math.sin(angle)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: isActive ? '10px' : '8px',
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: isActive ? 700 : 500,
                      fill: pill.color,
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    {pill.name}
                  </text>
                </g>
              );
            })}

            {/* Center balance score */}
            <circle cx={cx} cy={cy} r={16} fill="#C4A060" opacity="0.06" />
            <text
              x={cx}
              y={cy + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '16px',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 700,
                fill: '#B8905A',
                opacity: 0.5,
              }}
            >
              {balance}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              style={{
                fontSize: '6px',
                fontFamily: 'var(--font-handwritten)',
                fill: '#B8905A',
                opacity: 0.3,
              }}
            >
              balance
            </text>
          </svg>
        </div>
      )}

      {/* Active pill detail — intensity slider */}
      {activeId &&
        (() => {
          const pill = pills.find((p) => p.id === activeId);
          if (!pill) return null;
          return (
            <div className="mx-auto max-w-[280px] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: pill.color, opacity: 0.7 }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: pill.color, fontFamily: 'var(--font-handwritten)' }}
                  >
                    {pill.name}
                  </span>
                  <span
                    className="text-[8px] uppercase tracking-wider"
                    style={{ color: pill.color, opacity: 0.4 }}
                  >
                    {pill.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => lockPill(pill.id)}
                    className="cursor-pointer text-[9px]"
                    style={{
                      color: pill.color,
                      opacity: pill.locked ? 0.8 : 0.3,
                      background: 'none',
                      border: 'none',
                      fontFamily: 'var(--font-handwritten)',
                    }}
                  >
                    {pill.locked ? '🔒' : '🔓'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removePill(pill.id)}
                    className="cursor-pointer text-[9px]"
                    style={{ color: pill.color, opacity: 0.3, background: 'none', border: 'none' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px]"
                  style={{ color: pill.color, opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
                >
                  faint
                </span>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => ratePill(pill.id, v)}
                    className="flex-1 cursor-pointer rounded-lg transition-all duration-300"
                    style={{
                      height: v === pill.intensity ? 20 : 8,
                      background: pill.color,
                      opacity: v === pill.intensity ? 0.75 : 0.1,
                      border: 'none',
                      padding: 0,
                      boxShadow:
                        v === pill.intensity ? `0 3px 8px -3px ${pill.color}40` : undefined,
                    }}
                  />
                ))}
                <span
                  className="text-[9px]"
                  style={{ color: pill.color, opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
                >
                  core
                </span>
              </div>
            </div>
          );
        })()}

      {/* Two columns: strengths + weaknesses */}
      <div className="grid grid-cols-2 gap-3">
        {/* Strengths column */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setAddingType(addingType === 'strength' ? null : 'strength')}
            className="w-full cursor-pointer text-center text-xs font-bold uppercase tracking-wider py-1 rounded-lg transition-all"
            style={{
              color: '#D4805A',
              fontFamily: 'var(--font-serif)',
              background: addingType === 'strength' ? '#D4805A10' : 'transparent',
              border: `1px solid ${addingType === 'strength' ? '#D4805A30' : '#D4805A15'}`,
            }}
          >
            + Strength
          </button>
          {strengths.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(activeId === p.id ? null : p.id)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all duration-200"
              style={{
                background: activeId === p.id ? `${p.color}12` : `${p.color}05`,
                border: `1px solid ${activeId === p.id ? `${p.color}35` : `${p.color}12`}`,
              }}
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: p.color, opacity: 0.7 }}
              />
              <span
                className="flex-1 text-[11px]"
                style={{ color: p.color, fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
              >
                {p.name}
              </span>
              {p.locked && <span className="text-[7px]">🔒</span>}
              <div className="flex gap-px">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div
                    key={v}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: v <= p.intensity ? 5 : 3,
                      background: p.color,
                      opacity: v <= p.intensity ? 0.6 : 0.1,
                    }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Weaknesses column */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setAddingType(addingType === 'weakness' ? null : 'weakness')}
            className="w-full cursor-pointer text-center text-xs font-bold uppercase tracking-wider py-1 rounded-lg transition-all"
            style={{
              color: '#6890B0',
              fontFamily: 'var(--font-serif)',
              background: addingType === 'weakness' ? '#6890B010' : 'transparent',
              border: `1px solid ${addingType === 'weakness' ? '#6890B030' : '#6890B015'}`,
            }}
          >
            + Weakness
          </button>
          {weaknesses.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(activeId === p.id ? null : p.id)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all duration-200"
              style={{
                background: activeId === p.id ? `${p.color}12` : `${p.color}05`,
                border: `1px solid ${activeId === p.id ? `${p.color}35` : `${p.color}12`}`,
              }}
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: p.color, opacity: 0.7 }}
              />
              <span
                className="flex-1 text-[11px]"
                style={{ color: p.color, fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
              >
                {p.name}
              </span>
              {p.locked && <span className="text-[7px]">🔒</span>}
              <div className="flex gap-px">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div
                    key={v}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: v <= p.intensity ? 5 : 3,
                      background: p.color,
                      opacity: v <= p.intensity ? 0.6 : 0.1,
                    }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add input — appears when + button tapped */}
      {addingType &&
        (() => {
          const isStrength = addingType === 'strength';
          const accentColor = isStrength ? '#D4805A' : '#6890B0';
          const suggestions = isStrength ? STRENGTH_SUGGESTIONS : WEAKNESS_SUGGESTIONS;
          return (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: accentColor, opacity: 0.5 }}
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPill(input, addingType);
                  }}
                  placeholder={`Name a ${addingType}...`}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{
                    color: accentColor,
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                  }}
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pl-1">
                {suggestions
                  .filter((s) => !pills.some((p) => p.name === s))
                  .slice(0, 4)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addPill(s, addingType)}
                      className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] transition-all hover:scale-105"
                      style={{
                        background: `${accentColor}10`,
                        border: `1px solid ${accentColor}20`,
                        color: accentColor,
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          );
        })()}

      {/* Empty state */}
      {pills.length === 0 && !addingType && (
        <p
          className="text-center text-xs"
          style={{ color: '#B8905A', opacity: 0.35, fontFamily: 'var(--font-handwritten)' }}
        >
          Name your strengths and weaknesses. See your shape form.
        </p>
      )}

      {/* Prompt to add more for wheel */}
      {pills.length > 0 && pills.length < 3 && (
        <p
          className="text-center text-[10px]"
          style={{ color: '#B8905A', opacity: 0.3, fontFamily: 'var(--font-handwritten)' }}
        >
          Add {3 - pills.length} more to see your wheel
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WEATHER TAB — Inner Weather (emotional output)
   ═══════════════════════════════════════════════════════════ */
function WeatherTab({
  weather,
  setWeather,
}: {
  weather: WeatherEntry[];
  setWeather: (w: WeatherEntry[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingKind, setAddingKind] = useState<WeatherKind | null>(null);
  const [input, setInput] = useState('');

  const add = (name: string, kind: WeatherKind) => {
    if (!name.trim()) return;
    const next = [
      ...weather,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        kind,
        intensity: 3,
        lastSeen: new Date().toISOString(),
      },
    ];
    setWeather(next);
    setInput('');
    setAddingKind(null);
  };

  const rate = (id: string, intensity: number) => {
    setWeather(
      weather.map((w) =>
        w.id === id ? { ...w, intensity, lastSeen: new Date().toISOString() } : w,
      ),
    );
  };

  const remove = (id: string) => {
    setWeather(weather.filter((w) => w.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const kindCounts = WEATHER_KINDS.map((k) => ({
    kind: k,
    entries: weather.filter((w) => w.kind === k),
  }));

  const dominantKind =
    weather.length > 0
      ? kindCounts.reduce((a, b) => {
          const aS = a.entries.reduce((s, e) => s + e.intensity, 0);
          const bS = b.entries.reduce((s, e) => s + e.intensity, 0);
          return bS > aS ? b : a;
        }, kindCounts[0])
      : null;

  const warmth =
    weather.length > 0
      ? Math.round(
          (weather.reduce(
            (s, e) => s + (WEATHER_KINDS.indexOf(e.kind) / 4) * (e.intensity / 5),
            0,
          ) /
            weather.length) *
            100,
        )
      : 50;

  const dom = dominantKind?.entries.length ? WEATHER_META[dominantKind.kind] : null;

  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div className="space-y-4">
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors duration-700"
        style={{ color: dom ? dom.color : '#C4A060' }}
      >
        Inner Weather
      </p>

      {/* Sky */}
      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            <linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dom ? dom.skyTop : '#B0A080'} stopOpacity="0.25" />
              <stop offset="50%" stopColor={dom ? dom.skyBottom : '#D8C8A0'} stopOpacity="0.12" />
              <stop offset="100%" stopColor="#E8D8B8" stopOpacity="0.06" />
            </linearGradient>
            {WEATHER_KINDS.map((k) => (
              <radialGradient key={k} id={`wg-${k}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={WEATHER_META[k].color} stopOpacity="0.35" />
                <stop offset="60%" stopColor={WEATHER_META[k].color} stopOpacity="0.1" />
                <stop offset="100%" stopColor={WEATHER_META[k].color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          <rect x="0" y="0" width={sz} height={sz} rx="20" fill="url(#sky-g)" />
          <line
            x1="20"
            y1={cy + 20}
            x2={sz - 20}
            y2={cy + 20}
            stroke={dom ? dom.color : '#C4B890'}
            strokeWidth="0.6"
            opacity="0.15"
          />

          {/* 5 weather positions */}
          {WEATHER_KINDS.map((k, i) => {
            const meta = WEATHER_META[k];
            const kE = kindCounts[i].entries;
            const has = kE.length > 0;
            const avgI = has ? kE.reduce((s, e) => s + e.intensity, 0) / kE.length : 0;
            const positions = [
              { x: 38, y: 58 },
              { x: 75, y: 42 },
              { x: 110, y: 35 },
              { x: 145, y: 42 },
              { x: 182, y: 58 },
            ];
            const pos = positions[i];
            const orbR = has ? 14 + avgI * 5 : 12;
            return (
              <g key={k} className="transition-all duration-700">
                {has && <circle cx={pos.x} cy={pos.y} r={orbR + 12} fill={`url(#wg-${k})`} />}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={orbR}
                  fill={meta.color}
                  opacity={has ? 0.15 + avgI * 0.08 : 0.04}
                />
                {has && avgI > 2 && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={orbR * 0.4}
                    fill={meta.gradient[1]}
                    opacity="0.2"
                  />
                )}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: has ? `${12 + avgI * 2}px` : '10px', opacity: has ? 1 : 0.3 }}
                >
                  {meta.emoji}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + orbR + 12}
                  textAnchor="middle"
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                    fill: meta.color,
                    opacity: has ? 0.8 : 0.25,
                  }}
                >
                  {k}
                </text>
              </g>
            );
          })}

          {/* Center warmth */}
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

          {/* Colour bar */}
          {weather.length > 0 &&
            (() => {
              const total = weather.reduce((s, e) => s + e.intensity, 0);
              let xOff = 25;
              const bw = sz - 50;
              return (
                <g>
                  {WEATHER_KINDS.map((k) => {
                    const kE = weather.filter((e) => e.kind === k);
                    if (kE.length === 0) return null;
                    const kT = kE.reduce((s, e) => s + e.intensity, 0);
                    const w = (kT / total) * bw;
                    const seg = (
                      <rect
                        key={k}
                        x={xOff}
                        y={cy + 85}
                        width={w}
                        height={4}
                        rx={2}
                        fill={WEATHER_META[k].color}
                        opacity={0.4}
                      />
                    );
                    xOff += w + 1;
                    return seg;
                  })}
                </g>
              );
            })()}

          {weather.length === 0 && (
            <>
              <circle cx={cx} cy={cy - 10} r={30} fill="#C4A060" opacity="0.08" />
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '24px' }}
              >
                🌤
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Weather buttons */}
      <div className="flex justify-center gap-1.5">
        {WEATHER_KINDS.map((k) => {
          const meta = WEATHER_META[k];
          const count = weather.filter((e) => e.kind === k).length;
          const isAdding = addingKind === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setAddingKind(isAdding ? null : k)}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-300"
              style={{
                background: isAdding ? `${meta.color}15` : 'transparent',
                border: `1.5px solid ${isAdding ? `${meta.color}50` : `${meta.color}12`}`,
                minWidth: 44,
              }}
            >
              <span style={{ fontSize: '16px', filter: count > 0 ? undefined : 'grayscale(0.6)' }}>
                {meta.emoji}
              </span>
              <span
                className="text-[8px] font-bold capitalize"
                style={{
                  color: meta.color,
                  fontFamily: 'var(--font-handwritten)',
                  opacity: count > 0 ? 1 : 0.4,
                }}
              >
                {k}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add weather input */}
      {addingKind && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: `${WEATHER_META[addingKind].color}08`,
              border: `1px solid ${WEATHER_META[addingKind].color}20`,
            }}
          >
            <span style={{ fontSize: '14px' }}>{WEATHER_META[addingKind].emoji}</span>
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
                color: WEATHER_META[addingKind].color,
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 600,
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pl-2">
            {WEATHER_SUGGESTIONS[addingKind]
              .filter((s) => !weather.some((w) => w.name === s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s, addingKind)}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] transition-all hover:scale-105"
                  style={{
                    background: `${WEATHER_META[addingKind].color}10`,
                    border: `1px solid ${WEATHER_META[addingKind].color}20`,
                    color: WEATHER_META[addingKind].color,
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

      {/* Weather entries list */}
      {weather.length > 0 && (
        <div className="space-y-1.5">
          {weather.map((e) => {
            const meta = WEATHER_META[e.kind];
            const isActive = activeId === e.id;
            return (
              <div key={e.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(isActive ? null : e.id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-300"
                  style={{
                    background: isActive ? `${meta.color}10` : `${meta.color}05`,
                    border: `1px solid ${isActive ? `${meta.color}35` : `${meta.color}12`}`,
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{meta.emoji}</span>
                  <span
                    className="flex-1 text-[11px]"
                    style={{
                      color: meta.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                    }}
                  >
                    {e.name}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <div
                        key={v}
                        className="rounded-full transition-all"
                        style={{
                          width: v <= e.intensity ? 6 : 4,
                          height: v <= e.intensity ? 6 : 4,
                          background: meta.color,
                          opacity: v <= e.intensity ? 0.6 : 0.1,
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
                        opacity: 0.4,
                        fontFamily: 'var(--font-handwritten)',
                      }}
                    >
                      faint
                    </span>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => rate(e.id, v)}
                        className="flex-1 cursor-pointer rounded-lg transition-all duration-300"
                        style={{
                          height: v === e.intensity ? 20 : 8,
                          background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
                          opacity: v === e.intensity ? 0.8 : 0.12,
                          border: 'none',
                          padding: 0,
                        }}
                      />
                    ))}
                    <span
                      className="text-[9px]"
                      style={{
                        color: meta.color,
                        opacity: 0.4,
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

      {weather.length === 0 && !addingKind && (
        <p
          className="text-center text-xs"
          style={{ color: '#B8905A', opacity: 0.35, fontFamily: 'var(--font-handwritten)' }}
        >
          Tap a weather to name what you&apos;re feeling.
        </p>
      )}
    </div>
  );
}
