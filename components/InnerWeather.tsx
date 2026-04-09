'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   INNER WEATHER — Emotional climate tab
   Used inside CaringDepth as the Weather tab.
   ═══════════════════════════════════════════════════════════ */

export interface WeatherEntry {
  id: string;
  name: string;
  kind: 'storm' | 'rain' | 'fog' | 'breeze' | 'sun';
  intensity: number;
  lastSeen: string;
}

const WK = ['storm', 'rain', 'fog', 'breeze', 'sun'] as const;
type WKind = (typeof WK)[number];

const WM: Record<
  string,
  { emoji: string; color: string; grad: [string, string]; skyT: string; skyB: string }
> = {
  storm: {
    emoji: '⛈',
    color: '#8B5E3C',
    grad: ['#6B4830', '#A0784C'],
    skyT: '#5A4030',
    skyB: '#9A7858',
  },
  rain: {
    emoji: '🌧',
    color: '#4A7898',
    grad: ['#3A6080', '#78B0D8'],
    skyT: '#3A5A78',
    skyB: '#88B8D8',
  },
  fog: {
    emoji: '🌫',
    color: '#8A7A60',
    grad: ['#7A6A50', '#B8A880'],
    skyT: '#9A8A70',
    skyB: '#C8B890',
  },
  breeze: {
    emoji: '🍃',
    color: '#4A8A5A',
    grad: ['#3A7A4A', '#80C880'],
    skyT: '#4A8058',
    skyB: '#A0D8A0',
  },
  sun: {
    emoji: '☀',
    color: '#C49030',
    grad: ['#D07030', '#E8C840'],
    skyT: '#D08840',
    skyB: '#F0D870',
  },
};

const WS: Record<string, string[]> = {
  storm: ['Anger', 'Overwhelm', 'Frustration', 'Panic'],
  rain: ['Sadness', 'Grief', 'Loneliness', 'Nostalgia'],
  fog: ['Confusion', 'Numbness', 'Avoidance', 'Fatigue'],
  breeze: ['Calm', 'Hope', 'Acceptance', 'Curiosity'],
  sun: ['Joy', 'Gratitude', 'Confidence', 'Love'],
};

export default function InnerWeather({
  weather,
  setWeather,
}: {
  weather: WeatherEntry[];
  setWeather: (w: WeatherEntry[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingKind, setAddingKind] = useState<WKind | null>(null);
  const [input, setInput] = useState('');

  const add = (name: string, kind: WKind) => {
    if (!name.trim()) return;
    setWeather([
      ...weather,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        kind,
        intensity: 3,
        lastSeen: new Date().toISOString(),
      },
    ]);
    setInput('');
    setAddingKind(null);
  };
  const rate = (id: string, intensity: number) =>
    setWeather(
      weather.map((w) =>
        w.id === id ? { ...w, intensity, lastSeen: new Date().toISOString() } : w,
      ),
    );
  const remove = (id: string) => {
    setWeather(weather.filter((w) => w.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const kc = WK.map((k) => ({ kind: k, entries: weather.filter((w) => w.kind === k) }));
  const dom =
    weather.length > 0
      ? kc.reduce(
          (a, b) =>
            b.entries.reduce((s, e) => s + e.intensity, 0) >
            a.entries.reduce((s, e) => s + e.intensity, 0)
              ? b
              : a,
          kc[0],
        )
      : null;
  const warmth =
    weather.length > 0
      ? Math.round(
          (weather.reduce((s, e) => s + (WK.indexOf(e.kind) / 4) * (e.intensity / 5), 0) /
            weather.length) *
            100,
        )
      : 50;
  const d = dom?.entries.length ? WM[dom.kind] : null;

  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div className="space-y-3">
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors duration-700"
        style={{ color: d ? d.color : '#C4A060' }}
      >
        Inner Weather
      </p>

      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d ? d.skyT : '#B0A080'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={d ? d.skyB : '#D8C8A0'} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={sz} height={sz} rx="16" fill="url(#sg)" />
          <line
            x1="15"
            y1={cy + 15}
            x2={sz - 15}
            y2={cy + 15}
            stroke={d ? d.color : '#C4B890'}
            strokeWidth="0.5"
            opacity="0.12"
          />

          {WK.map((k, i) => {
            const m = WM[k];
            const kE = kc[i].entries;
            const has = kE.length > 0;
            const avgI = has ? kE.reduce((s, e) => s + e.intensity, 0) / kE.length : 0;
            const pos = [
              { x: 32, y: 50 },
              { x: 62, y: 36 },
              { x: 100, y: 30 },
              { x: 138, y: 36 },
              { x: 168, y: 50 },
            ][i];
            const oR = has ? 12 + avgI * 4 : 10;
            return (
              <g key={k}>
                {has && <circle cx={pos.x} cy={pos.y} r={oR + 8} fill={m.color} opacity="0.06" />}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={oR}
                  fill={m.color}
                  opacity={has ? 0.12 + avgI * 0.06 : 0.04}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: has ? `${10 + avgI * 1.5}px` : '9px', opacity: has ? 1 : 0.3 }}
                >
                  {m.emoji}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + oR + 10}
                  textAnchor="middle"
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                    fill: m.color,
                    opacity: has ? 0.7 : 0.2,
                  }}
                >
                  {k}
                </text>
              </g>
            );
          })}

          <text
            x={cx}
            y={cy + 48}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: d ? d.color : '#B8905A',
              opacity: 0.45,
            }}
          >
            {warmth}
          </text>
          <text
            x={cx}
            y={cy + 62}
            textAnchor="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fill: d ? d.color : '#B8905A',
              opacity: 0.25,
            }}
          >
            warmth
          </text>

          {weather.length === 0 && (
            <>
              <circle cx={cx} cy={cy - 5} r={24} fill="#C4A060" opacity="0.06" />
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '20px' }}
              >
                🌤
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-center gap-1">
        {WK.map((k) => {
          const m = WM[k];
          const cnt = weather.filter((e) => e.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setAddingKind(addingKind === k ? null : k)}
              className="flex cursor-pointer flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all"
              style={{
                background: addingKind === k ? `${m.color}15` : 'transparent',
                border: `1.5px solid ${addingKind === k ? `${m.color}40` : `${m.color}10`}`,
                minWidth: 40,
              }}
            >
              <span style={{ fontSize: '14px', filter: cnt > 0 ? undefined : 'grayscale(0.6)' }}>
                {m.emoji}
              </span>
              <span
                className="text-[7px] font-bold capitalize"
                style={{
                  color: m.color,
                  fontFamily: 'var(--font-handwritten)',
                  opacity: cnt > 0 ? 1 : 0.4,
                }}
              >
                {k}
              </span>
            </button>
          );
        })}
      </div>

      {addingKind && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{
              background: `${WM[addingKind].color}08`,
              border: `1px solid ${WM[addingKind].color}18`,
            }}
          >
            <span style={{ fontSize: '12px' }}>{WM[addingKind].emoji}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add(input, addingKind);
              }}
              placeholder={`Name this ${addingKind}...`}
              className="flex-1 bg-transparent text-xs outline-none"
              style={{
                color: WM[addingKind].color,
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 600,
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1 pl-1">
            {WS[addingKind]
              .filter((s) => !weather.some((w) => w.name === s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s, addingKind)}
                  className="cursor-pointer rounded-full px-2 py-0.5 text-[9px] hover:scale-105"
                  style={{
                    background: `${WM[addingKind].color}10`,
                    border: `1px solid ${WM[addingKind].color}18`,
                    color: WM[addingKind].color,
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

      {weather.length > 0 && (
        <div className="space-y-1">
          {weather.map((e) => {
            const m = WM[e.kind];
            const isA = activeId === e.id;
            return (
              <div key={e.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(isA ? null : e.id)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition-all"
                  style={{
                    background: isA ? `${m.color}10` : `${m.color}04`,
                    border: `1px solid ${isA ? `${m.color}30` : `${m.color}10`}`,
                  }}
                >
                  <span style={{ fontSize: '11px' }}>{m.emoji}</span>
                  <span
                    className="flex-1 text-[10px]"
                    style={{
                      color: m.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                    }}
                  >
                    {e.name}
                  </span>
                  <div className="flex gap-px">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <div
                        key={v}
                        className="rounded-full"
                        style={{
                          width: v <= e.intensity ? 5 : 3,
                          height: v <= e.intensity ? 5 : 3,
                          background: m.color,
                          opacity: v <= e.intensity ? 0.6 : 0.1,
                        }}
                      />
                    ))}
                  </div>
                </button>
                {isA && (
                  <div className="mt-1 flex items-center gap-1 px-2.5 animate-in fade-in duration-150">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => rate(e.id, v)}
                        className="flex-1 cursor-pointer rounded-md transition-all"
                        style={{
                          height: v === e.intensity ? 16 : 6,
                          background: `linear-gradient(135deg, ${m.grad[0]}, ${m.grad[1]})`,
                          opacity: v === e.intensity ? 0.8 : 0.1,
                          border: 'none',
                          padding: 0,
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      className="cursor-pointer text-[8px] ml-1"
                      style={{ color: m.color, opacity: 0.3, background: 'none', border: 'none' }}
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
          className="text-center text-[10px]"
          style={{ color: '#B8905A', opacity: 0.3, fontFamily: 'var(--font-handwritten)' }}
        >
          Tap a weather to name what you&apos;re feeling.
        </p>
      )}
    </div>
  );
}
