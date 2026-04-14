'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   STAR COMPASS — Doing ring compass
   S(left) T(top) A(right) R(bottom)
   Includes: STAR blobs, Blocked/Moving columns, sub-cells, 3-step programs
   ═══════════════════════════════════════════════════════════ */

type StarAxis = 'structure' | 'target' | 'action' | 'resources';

type StarColorTheme = 'cool' | 'vivid' | 'forest' | 'vivid2';

const STAR_THEMES: {
  id: StarColorTheme;
  name: string;
  dot: string;
  colors: Record<StarAxis, string>;
}[] = [
  {
    id: 'cool',
    name: 'Cool',
    dot: '#7A9A7A',
    colors: { structure: '#6A8A9A', target: '#7A9A7A', action: '#6A8A9A', resources: '#7A9A7A' },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    dot: '#7AAA58',
    colors: { structure: '#3A8AC4', target: '#7AAA58', action: '#3A8AC4', resources: '#7AAA58' },
  },
  {
    id: 'forest',
    name: 'Forest',
    dot: '#4A7A4A',
    colors: { structure: '#5A8A5A', target: '#4A7A4A', action: '#5A8A5A', resources: '#4A7A4A' },
  },
  {
    id: 'vivid2',
    name: 'Vivid 2',
    dot: '#3A8AC4',
    colors: { structure: '#7AAA58', target: '#3A8AC4', action: '#7AAA58', resources: '#3A8AC4' },
  },
];

function getStarSlices(theme: (typeof STAR_THEMES)[0]) {
  return [
    {
      key: 'structure' as StarAxis,
      label: 'Structure',
      angle: Math.PI,
      color: theme.colors.structure,
    },
    { key: 'target' as StarAxis, label: 'Target', angle: -Math.PI / 2, color: theme.colors.target },
    { key: 'action' as StarAxis, label: 'Action', angle: 0, color: theme.colors.action },
    {
      key: 'resources' as StarAxis,
      label: 'Resources',
      angle: Math.PI / 2,
      color: theme.colors.resources,
    },
  ];
}

const SUB_CELLS: Record<string, { label: string; color: string }[]> = {
  Structure: [
    { label: 'Routines', color: '#6A8A9A' },
    { label: 'Systems', color: '#5A7A8A' },
    { label: 'Planning', color: '#4A6A7A' },
  ],
  Target: [
    { label: 'Direction', color: '#7A9A7A' },
    { label: 'Clarity', color: '#6A8A6A' },
    { label: 'Purpose', color: '#5A7A5A' },
  ],
  Action: [
    { label: 'Momentum', color: '#8A8A6A' },
    { label: 'Focus', color: '#7A7A5A' },
    { label: 'Discipline', color: '#6A6A4A' },
  ],
  Resources: [
    { label: 'Time', color: '#5A7A9A' },
    { label: 'Support', color: '#4A6A8A' },
    { label: 'Tools', color: '#3A5A7A' },
  ],
};

const SUB_PROGRAMS: Record<string, { reflect: string; rate: string; commit: string }> = {
  Routines: {
    reflect: 'Which routines are serving you well? Which ones need refreshing?',
    rate: 'How strong are your daily routines right now?',
    commit: 'What one routine will you protect or start today?',
  },
  Systems: {
    reflect: 'What systems do you rely on? Are any breaking down?',
    rate: 'How well are your systems supporting you?',
    commit: 'What one system will you fix or create today?',
  },
  Planning: {
    reflect: 'How far ahead are you looking? Is your plan clear?',
    rate: 'How organised does your path feel?',
    commit: 'What one thing will you plan or schedule today?',
  },
  Direction: {
    reflect: 'Do you know where you are heading? What pulls you forward?',
    rate: 'How clear is your direction right now?',
    commit: 'What one step will you take toward your target today?',
  },
  Clarity: {
    reflect: 'What feels foggy? What would help you see more clearly?',
    rate: 'How clear-headed do you feel about your goals?',
    commit: 'What will you simplify or clarify today?',
  },
  Purpose: {
    reflect: 'Why does what you are doing matter to you?',
    rate: 'How connected do you feel to your purpose?',
    commit: 'What will you do today that aligns with your deeper why?',
  },
  Momentum: {
    reflect: 'Where do you have momentum? Where have you stalled?',
    rate: 'How much momentum do you feel right now?',
    commit: 'What one action will keep your momentum going today?',
  },
  Focus: {
    reflect: 'What keeps pulling your attention away? What deserves it most?',
    rate: 'How focused have you been lately?',
    commit: 'What will you give your undivided attention to today?',
  },
  Discipline: {
    reflect: 'Where are you showing up consistently? Where are you slipping?',
    rate: 'How disciplined do you feel right now?',
    commit: 'What one thing will you follow through on today, no excuses?',
  },
  Time: {
    reflect: 'How are you spending your time? Does it match your priorities?',
    rate: 'How well are you managing your time?',
    commit: 'What will you protect your time from today?',
  },
  Support: {
    reflect: 'Who or what is helping you right now? What support are you missing?',
    rate: 'How supported do you feel in your doing?',
    commit: 'What help will you ask for or accept today?',
  },
  Tools: {
    reflect: 'Do you have what you need to do the work? What is missing?',
    rate: 'How well-equipped do you feel?',
    commit: 'What tool or resource will you set up or sharpen today?',
  },
};

const RHYMES = [
  '',
  'Far from the sun',
  'Pushing through',
  'Trying to be free',
  'Searching for more',
  'Coming alive',
  'Finding the mix',
  'Floating in heaven',
  'Feeling great',
];

const STORAGE_KEY = 'colourmap:star-values';
const BLOCKED_KEY = 'colourmap:star-blocked';
const MOVING_KEY = 'colourmap:star-moving';

function loadValues(): Record<StarAxis, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { structure: 50, target: 50, action: 50, resources: 50 };
}

function loadList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  sa: number,
  ea: number,
): string {
  const gap = 0.06;
  const s = sa + gap;
  const e = ea - gap;
  const ix1 = cx + innerR * Math.cos(s);
  const iy1 = cy + innerR * Math.sin(s);
  const ix2 = cx + innerR * Math.cos(e);
  const iy2 = cy + innerR * Math.sin(e);
  const ox1 = cx + outerR * Math.cos(s);
  const oy1 = cy + outerR * Math.sin(s);
  const ox2 = cx + outerR * Math.cos(e);
  const oy2 = cy + outerR * Math.sin(e);
  const large = e - s > Math.PI ? 1 : 0;
  return `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
}

export default function StarCompass() {
  const [showDesign, setShowDesign] = useState(false);
  const [starTheme, setStarTheme] = useState<StarColorTheme>(() => {
    try {
      return (localStorage.getItem('colourmap:star-color-theme') as StarColorTheme) || 'cool';
    } catch {
      return 'cool';
    }
  });
  const st = STAR_THEMES.find((t) => t.id === starTheme) || STAR_THEMES[0];
  const themedStarSlices = getStarSlices(st);
  const [values, setValues] = useState<Record<StarAxis, number>>(loadValues);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [subStep, setSubStep] = useState(0);
  const [subAnswers, setSubAnswers] = useState<Record<string, string>>({});
  const [blockedItems, setBlockedItems] = useState<string[]>(() => loadList(BLOCKED_KEY));
  const [movingItems, setMovingItems] = useState<string[]>(() => loadList(MOVING_KEY));
  const [blockedInput, setBlockedInput] = useState('');
  const [movingInput, setMovingInput] = useState('');

  const handleRating = (key: StarAxis, value: number) => {
    const next = { ...values, [key]: value };
    setValues(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addBlocked = (text: string) => {
    if (!text.trim()) return;
    const next = [...blockedItems, text.trim()];
    setBlockedItems(next);
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(next));
    setBlockedInput('');
  };
  const addMoving = (text: string) => {
    if (!text.trim()) return;
    const next = [...movingItems, text.trim()];
    setMovingItems(next);
    localStorage.setItem(MOVING_KEY, JSON.stringify(next));
    setMovingInput('');
  };
  const removeBlocked = (i: number) => {
    const next = blockedItems.filter((_, idx) => idx !== i);
    setBlockedItems(next);
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(next));
  };
  const removeMoving = (i: number) => {
    const next = movingItems.filter((_, idx) => idx !== i);
    setMovingItems(next);
    localStorage.setItem(MOVING_KEY, JSON.stringify(next));
  };

  const span = Math.PI / 2;
  const sz = 240;
  const cx = sz / 2;
  const cy = sz / 2;
  const innerR = 40;
  const outerR = 90;

  const activeQ = themedStarSlices.find((s) => s.label === activeSlice);
  const activeSubs = activeSlice ? SUB_CELLS[activeSlice] : null;
  const program = activeSub ? SUB_PROGRAMS[activeSub] : null;

  return (
    <div
      className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(250,241,225,0.96), rgba(246,232,212,0.92))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.35)',
      }}
    >
      <div className="relative">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#7A9A7A]">
          Doing
        </p>
        <div className="absolute right-0 top-0" style={{ zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setShowDesign(!showDesign)}
            className="cursor-pointer rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wider transition-all"
            style={{
              color: showDesign ? '#7A9A7A' : '#7A9A7A60',
              background: showDesign ? '#7A9A7A10' : 'transparent',
              border: `1px solid \${showDesign ? '#7A9A7A30' : 'transparent'}`,
            }}
          >
            design
          </button>
          {showDesign && (
            <div
              className="mt-1 animate-in fade-in duration-150 rounded-xl overflow-hidden"
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border) / 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {STAR_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setStarTheme(t.id);
                    localStorage.setItem('colourmap:star-color-theme', t.id);
                    setShowDesign(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-muted/30"
                  style={{
                    border: 'none',
                    background: starTheme === t.id ? `\${t.dot}10` : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: t.dot,
                      opacity: starTheme === t.id ? 1 : 0.4,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: starTheme === t.id ? 700 : 400,
                      color: starTheme === t.id ? t.dot : 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compass SVG */}
      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke="#ddb97f"
            strokeWidth="0.8"
            opacity={0.25}
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="none"
            stroke="#ddb97f"
            strokeWidth="0.5"
            opacity={0.15}
          />

          {themedStarSlices.map((q) => {
            const sa = q.angle - span / 2;
            const ea = q.angle + span / 2;
            const isAct = activeSlice === q.label;
            const v = values[q.key];
            return (
              <path
                key={q.key}
                d={arcPath(cx, cy, innerR, outerR, sa, ea)}
                fill={q.color}
                opacity={isAct ? 0.75 : 0.15 + (v / 100) * 0.4}
                className="cursor-pointer transition-all duration-300"
                style={{ filter: isAct ? `drop-shadow(0 0 8px ${q.color}60)` : undefined }}
                onClick={() => {
                  setActiveSlice(isAct ? null : q.label);
                  setActiveSub(null);
                  setSubStep(0);
                  setSubAnswers({});
                }}
              />
            );
          })}

          {/* Dividers */}
          {[0, 1, 2, 3].map((i) => {
            const a = -Math.PI / 4 + (i * Math.PI) / 2;
            return (
              <line
                key={i}
                x1={cx + innerR * Math.cos(a)}
                y1={cy + innerR * Math.sin(a)}
                x2={cx + outerR * Math.cos(a)}
                y2={cy + outerR * Math.sin(a)}
                stroke="#ddb97f"
                strokeWidth="0.5"
                opacity={0.18}
              />
            );
          })}

          {/* Labels */}
          {themedStarSlices.map((q) => {
            const labelR = (innerR + outerR) / 2;
            const lx = cx + labelR * Math.cos(q.angle);
            const ly = cy + labelR * Math.sin(q.angle);
            const isAct = activeSlice === q.label;
            return (
              <text
                key={`l-${q.key}`}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="cursor-pointer select-none"
                style={{
                  fontSize: isAct ? '17px' : '15px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fill: isAct ? q.color : '#8f6a47',
                  transition: 'all 0.3s',
                }}
                onClick={() => {
                  setActiveSlice(isAct ? null : q.label);
                  setActiveSub(null);
                  setSubStep(0);
                  setSubAnswers({});
                }}
              >
                {q.label}
              </text>
            );
          })}

          {/* Center — small 4-point star */}
          {(() => {
            const r1 = 12;
            const r2 = 4;
            const pts: string[] = [];
            for (let i = 0; i < 8; i++) {
              const a = -Math.PI / 2 + (i * Math.PI) / 4;
              const r = i % 2 === 0 ? r1 : r2;
              pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
            }
            return (
              <polygon
                points={pts.join(' ')}
                fill="#7A9A7A"
                opacity={0.3}
                stroke="#4A6A4A"
                strokeWidth="0.5"
                strokeOpacity={0.4}
              />
            );
          })()}
        </svg>
      </div>

      {/* STAR blobs */}
      <div className="flex items-center justify-center gap-3">
        {themedStarSlices.map((a) => (
          <div
            key={a.key}
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: a.color, opacity: 0.7 }}
          >
            <span
              className="text-xl font-black text-white select-none"
              style={{ fontFamily: 'var(--font-handwritten)', lineHeight: 1 }}
            >
              {a.label[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Blocked / Moving columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-center">
          <span
            className="text-xl font-bold"
            style={{ color: '#7A9A7A', fontFamily: 'var(--font-serif)' }}
          >
            Blocked
          </span>
          {blockedItems.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {blockedItems.map((item, i) => (
                <span
                  key={i}
                  onClick={() => removeBlocked(i)}
                  className="inline-flex cursor-pointer items-center rounded-full px-2 py-1 text-xs hover:opacity-70"
                  style={{
                    background: '#7A9A7A12',
                    border: '1px solid #7A9A7A20',
                    color: '#7A9A7A',
                  }}
                >
                  {item} ✕
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={blockedInput}
            onChange={(e) => setBlockedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addBlocked(blockedInput);
            }}
            placeholder="What's blocked?..."
            className="w-full border-b bg-transparent pb-1 text-center text-base outline-none"
            style={{
              color: '#7A9A7A',
              borderColor: '#7A9A7A30',
              fontFamily: 'var(--font-serif)',
            }}
          />
        </div>
        <div className="space-y-2 text-center">
          <span
            className="text-xl font-bold"
            style={{ color: '#7A9A7A', fontFamily: 'var(--font-serif)' }}
          >
            Moving
          </span>
          {movingItems.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {movingItems.map((item, i) => (
                <span
                  key={i}
                  onClick={() => removeMoving(i)}
                  className="inline-flex cursor-pointer items-center rounded-full px-2 py-1 text-xs hover:opacity-70"
                  style={{
                    background: '#7A9A7A12',
                    border: '1px solid #7A9A7A20',
                    color: '#7A9A7A',
                  }}
                >
                  {item} ✕
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            value={movingInput}
            onChange={(e) => setMovingInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addMoving(movingInput);
            }}
            placeholder="What's moving?..."
            className="w-full border-b bg-transparent pb-1 text-center text-base outline-none"
            style={{
              color: '#7A9A7A',
              borderColor: '#7A9A7A30',
              fontFamily: 'var(--font-serif)',
            }}
          />
        </div>
      </div>

      {/* Rating bar when slice active */}
      {activeQ &&
        (() => {
          const current = Math.max(1, Math.min(8, Math.round((values[activeQ.key] / 100) * 8)));
          return (
            <div className="mx-auto max-w-[280px] space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: activeQ.color, fontFamily: 'var(--font-serif)' }}
                >
                  {activeQ.label}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: activeQ.color,
                    opacity: 0.5,
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {current}. {RHYMES[current]}
                </span>
              </div>
              <div className="flex items-center gap-[3px]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                  const mapped = Math.round((n / 8) * 100);
                  const isN = n === current;
                  const dist = Math.abs(n - current);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleRating(activeQ.key, mapped)}
                      className="flex-1 cursor-pointer transition-all duration-200"
                      style={{
                        height: isN ? 24 : 12,
                        borderRadius: 2,
                        background: activeQ.color,
                        opacity: isN ? 1 : dist === 1 ? 0.4 : 0.12,
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

      {/* Sub-cells */}
      {activeSubs && (
        <div className="flex justify-center gap-3">
          {activeSubs.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setActiveSub(activeSub === s.label ? null : s.label);
                setSubStep(0);
                setSubAnswers({});
              }}
              className="cursor-pointer rounded-full px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: s.color,
                opacity: activeSub === s.label ? 1 : 0.6,
                fontFamily: 'var(--font-serif)',
                border: 'none',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* 3-step program */}
      {activeSub &&
        program &&
        activeQ &&
        (() => {
          const steps = [
            { type: 'reflect', prompt: program.reflect },
            { type: 'rate', prompt: program.rate },
            { type: 'commit', prompt: program.commit },
          ];
          const step = steps[subStep];
          if (!step) return null;

          return (
            <div
              className="mx-auto max-w-[320px] space-y-3 rounded-2xl p-4"
              style={{ background: `${activeQ.color}08`, border: `1px solid ${activeQ.color}18` }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: activeQ.color, fontFamily: 'var(--font-serif)' }}
                >
                  {activeSub}
                </span>
                <span className="text-xs text-muted-foreground">{subStep + 1} / 3</span>
              </div>

              <p
                className="text-base"
                style={{ color: activeQ.color, fontFamily: 'var(--font-serif)' }}
              >
                &ldquo;{step.prompt}&rdquo;
              </p>

              {step.type !== 'rate' && (
                <textarea
                  value={subAnswers[step.type] || ''}
                  onChange={(e) =>
                    setSubAnswers((prev) => ({ ...prev, [step.type]: e.target.value }))
                  }
                  placeholder={
                    step.type === 'reflect' ? 'Write your thoughts...' : 'Your commitment...'
                  }
                  className="min-h-[50px] w-full resize-none border-b bg-transparent pb-1 text-sm outline-none"
                  style={{
                    color: activeQ.color,
                    borderColor: `${activeQ.color}30`,
                    fontFamily: 'var(--font-serif)',
                  }}
                />
              )}

              {step.type === 'rate' && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const selected = Number(subAnswers.rate) === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSubAnswers((prev) => ({ ...prev, rate: String(n) }))}
                        className="flex-1 cursor-pointer transition-all duration-200"
                        style={{
                          height: selected ? 26 : 16,
                          borderRadius: 2,
                          background: activeQ.color,
                          opacity: selected ? 1 : 0.2,
                          border: 'none',
                        }}
                      />
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (subStep < 2) {
                      setSubStep(subStep + 1);
                    } else {
                      const entry = {
                        sub: activeSub,
                        ...subAnswers,
                        createdAt: new Date().toISOString(),
                      };
                      const existing = JSON.parse(
                        localStorage.getItem('colourmap:sub-programs') || '[]',
                      );
                      existing.unshift(entry);
                      localStorage.setItem(
                        'colourmap:sub-programs',
                        JSON.stringify(existing.slice(0, 200)),
                      );
                      setActiveSub(null);
                      setSubStep(0);
                      setSubAnswers({});
                    }
                  }}
                  className="cursor-pointer transition-all duration-300 hover:scale-110"
                  style={{
                    width: 20,
                    height: 20,
                    transform: 'rotate(45deg)',
                    background: activeQ.color,
                    borderRadius: 3,
                    border: 'none',
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })()}
    </div>
  );
}
