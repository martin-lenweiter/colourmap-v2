'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARE COMPASS — Caring compass
   C(left) A(top) R(right) E(bottom)
   Includes: CARE blobs, Challenge/Flow columns, sub-cells, 3-step programs
   ═══════════════════════════════════════════════════════════ */

type CareAxis = 'care' | 'attitude' | 'rest' | 'emotions';

type ColorTheme = 'warm' | 'rest' | 'care' | 'earth' | 'vivid';

const CARE_THEMES: {
  id: ColorTheme;
  name: string;
  dot: string;
  colors: Record<CareAxis, string>;
}[] = [
  {
    id: 'warm',
    name: 'Warm',
    dot: '#C4A060',
    colors: { care: '#D4805A', attitude: '#C4A070', rest: '#D4805A', emotions: '#C4A070' },
  },
  {
    id: 'rest',
    name: 'Rest',
    dot: '#C4906A',
    colors: { care: '#C4906A', attitude: '#C4A070', rest: '#C4906A', emotions: '#C4A070' },
  },
  {
    id: 'care',
    name: 'Care',
    dot: '#D4805A',
    colors: { care: '#D4805A', attitude: '#C4A070', rest: '#D4805A', emotions: '#C4A070' },
  },
  {
    id: 'earth',
    name: 'Earth',
    dot: '#8A7A5A',
    colors: { care: '#B89868', attitude: '#C8A878', rest: '#B89868', emotions: '#C8A878' },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    dot: '#D45050',
    colors: { care: '#D45050', attitude: '#E8A030', rest: '#6890B0', emotions: '#7AAA58' },
  },
];

function getSlices(theme: (typeof CARE_THEMES)[0]) {
  return [
    { key: 'care' as CareAxis, label: 'Care', angle: Math.PI, color: theme.colors.care },
    {
      key: 'attitude' as CareAxis,
      label: 'Attitude',
      angle: -Math.PI / 2,
      color: theme.colors.attitude,
    },
    { key: 'rest' as CareAxis, label: 'Rest', angle: 0, color: theme.colors.rest },
    {
      key: 'emotions' as CareAxis,
      label: 'Emotions',
      angle: Math.PI / 2,
      color: theme.colors.emotions,
    },
  ];
}

const SUB_CELLS: Record<string, { label: string; color: string }[]> = {
  Care: [
    { label: 'Health', color: '#D4805A' },
    { label: 'Sport', color: '#C87050' },
    { label: 'Energy', color: '#B86840' },
  ],
  Attitude: [
    { label: 'Confidence', color: '#C4A070' },
    { label: 'Openness', color: '#B89060' },
    { label: 'Gratitude', color: '#A88050' },
  ],
  Rest: [
    { label: 'Relaxation', color: '#C4906A' },
    { label: 'Awareness', color: '#B48060' },
    { label: 'Grounding', color: '#A47050' },
  ],
  Emotions: [
    { label: 'Joy', color: '#B07A5A' },
    { label: 'Weight', color: '#A06A4A' },
    { label: 'Peace', color: '#906040' },
  ],
};

const SUB_PROGRAMS: Record<string, { reflect: string; rate: string; commit: string }> = {
  Health: {
    reflect: 'How is your body asking for attention right now?',
    rate: 'How well are you taking care of your health?',
    commit: "What's one kind thing you'll do for your body today?",
  },
  Sport: {
    reflect: 'When did you last feel strong and alive in your body?',
    rate: 'How active have you been?',
    commit: 'What movement will you make today, even for 10 minutes?',
  },
  Energy: {
    reflect: "What's draining your energy? What's fuelling it?",
    rate: "How's your energy level right now?",
    commit: 'What will you protect your energy from today?',
  },
  Confidence: {
    reflect: 'Where in your life do you feel most sure of yourself?',
    rate: 'How confident do you feel today?',
    commit: "What's one thing you'll do as if you fully believed in yourself?",
  },
  Openness: {
    reflect: 'What are you resisting that might be worth letting in?',
    rate: 'How open are you to the unexpected today?',
    commit: 'What will you approach with curiosity instead of judgement?',
  },
  Gratitude: {
    reflect: "What's something small that happened recently that you almost missed?",
    rate: 'How present is gratitude in your day?',
    commit: "Name one person or thing you'll consciously appreciate today.",
  },
  Relaxation: {
    reflect: 'Where in your body are you holding tension right now?',
    rate: 'How relaxed do you feel?',
    commit: 'When will you pause today and do nothing for 2 minutes?',
  },
  Awareness: {
    reflect: 'What have you noticed today that you usually overlook?',
    rate: 'How aware are you of this moment?',
    commit: "What's one thing you'll pay full attention to today?",
  },
  Grounding: {
    reflect: 'What makes you feel rooted and stable?',
    rate: 'How grounded do you feel right now?',
    commit: "What's one thing you'll do today to feel more anchored?",
  },
  Joy: {
    reflect: 'What brought you joy recently, even briefly?',
    rate: 'How much joy are you letting in?',
    commit: "What's one thing you'll do today purely because it brings you joy?",
  },
  Weight: {
    reflect: "What emotional weight are you carrying that isn't yours to hold?",
    rate: 'How heavy does your emotional load feel?',
    commit: "What's one thing you'll set down today, even temporarily?",
  },
  Peace: {
    reflect: 'When did you last feel truly at peace? What was different?',
    rate: 'How close to peace are you right now?',
    commit: 'What boundary will you honour today to protect your peace?',
  },
};

const RHYMES: Record<string, string[]> = {
  Care: [
    '',
    'Neglecting yourself',
    'Barely holding on',
    'Getting by',
    'Starting to notice',
    'Taking small steps',
    'Caring for yourself',
    'Nourishing deeply',
    'Fully tended to',
  ],
  Attitude: [
    '',
    'Closed and heavy',
    'Resistant',
    'Guarded',
    'Cautiously open',
    'Willing to try',
    'Genuinely open',
    'Embracing it all',
    'Radically present',
  ],
  Rest: [
    '',
    'Running on empty',
    'Depleted',
    'Tired but pushing',
    'Need a pause',
    'Catching up',
    'Rested enough',
    'Deeply recharged',
    'Completely restored',
  ],
  Emotions: [
    '',
    'Shut down',
    'Overwhelmed',
    'Turbulent',
    'Unsettled',
    'Processing',
    'Finding balance',
    'Calm and clear',
    'At peace',
  ],
};

const STORAGE_KEY = 'colourmap:care-values';

function loadValues(): Record<CareAxis, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { care: 50, attitude: 50, rest: 50, emotions: 50 };
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

export default function CareCompass() {
  const [showDesign, setShowDesign] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    try {
      return (localStorage.getItem('colourmap:care-theme') as ColorTheme) || 'vivid';
    } catch {
      return 'warm';
    }
  });
  const ct = CARE_THEMES.find((t) => t.id === colorTheme) || CARE_THEMES[0];
  const themedSlices = getSlices(ct);
  const [values, setValues] = useState<Record<CareAxis, number>>(loadValues);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [subStep, setSubStep] = useState(0);
  const [subAnswers, setSubAnswers] = useState<Record<string, string>>({});
  const handleRating = (key: CareAxis, value: number) => {
    const next = { ...values, [key]: value };
    setValues(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const span = Math.PI / 2;
  const sz = 240;
  const cx = sz / 2;
  const cy = sz / 2;
  const innerR = 40;
  const outerR = 90;

  const activeQ = themedSlices.find((s) => s.label === activeSlice);
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
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#C4A060]">
          Caring
        </p>
        <div className="absolute right-0 top-0" style={{ zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setShowDesign(!showDesign)}
            className="cursor-pointer rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wider transition-all"
            style={{
              color: showDesign ? '#C4A060' : '#C4A06060',
              background: showDesign ? '#C4A06010' : 'transparent',
              border: `1px solid ${showDesign ? '#C4A06030' : 'transparent'}`,
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
              {CARE_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setColorTheme(t.id);
                    localStorage.setItem('colourmap:care-theme', t.id);
                    setShowDesign(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-muted/30"
                  style={{
                    border: 'none',
                    background: colorTheme === t.id ? `${t.dot}10` : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: t.dot,
                      opacity: colorTheme === t.id ? 1 : 0.4,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: colorTheme === t.id ? 700 : 400,
                      color: colorTheme === t.id ? t.dot : 'hsl(var(--muted-foreground))',
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

          {themedSlices.map((q) => {
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
          {themedSlices.map((q) => {
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
            const points: string[] = [];
            for (let i = 0; i < 8; i++) {
              const a = -Math.PI / 2 + (i * Math.PI) / 4;
              const r = i % 2 === 0 ? r1 : r2;
              points.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
            }
            return (
              <polygon
                points={points.join(' ')}
                fill="#C4A060"
                opacity={0.3}
                stroke="#8A6A4A"
                strokeWidth="0.5"
                strokeOpacity={0.4}
              />
            );
          })()}
        </svg>
      </div>

      {/* CARE blobs */}
      <div className="flex items-center justify-center gap-3">
        {themedSlices.map((a) => (
          <div
            key={a.key}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: a.color, opacity: 0.5 }}
          >
            <span
              className="text-sm font-black text-white select-none"
              style={{ fontFamily: 'var(--font-handwritten)' }}
            >
              {a.label[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Rating bar when slice active */}
      {activeQ &&
        (() => {
          const current = Math.max(1, Math.min(8, Math.round((values[activeQ.key] / 100) * 8)));
          return (
            <div className="mx-auto max-w-[280px] space-y-2">
              <p
                className="text-center text-lg font-bold"
                style={{ color: activeQ.color, fontFamily: 'var(--font-serif)' }}
              >
                {activeQ.label}
              </p>
              <div className="flex items-center justify-center gap-[2px]">
                {(() => {
                  const rainbow = [
                    '#C83030',
                    '#D46050',
                    '#D87048',
                    '#C88820',
                    '#7AAA58',
                    '#3AA8A0',
                    '#3A8AC4',
                    '#9B6BA0',
                  ];
                  return [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const mapped = Math.round((n / 8) * 100);
                    const isN = n === current;
                    const dist = Math.abs(n - current);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleRating(activeQ.key, mapped)}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          background: rainbow[n - 1],
                          opacity: isN ? 1 : dist === 1 ? 0.5 : 0.2,
                          border: 'none',
                          padding: 0,
                        }}
                      />
                    );
                  });
                })()}
              </div>
              <p
                className="text-center text-base"
                style={{
                  color: activeQ.color,
                  opacity: 0.7,
                  fontFamily: 'var(--font-handwritten)',
                }}
              >
                {(RHYMES[activeQ.label] || [])[current] || ''}
              </p>
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
                <div className="flex items-center justify-center gap-[2px]">
                  {(() => {
                    const rainbow = [
                      '#C83030',
                      '#D46050',
                      '#D87048',
                      '#C88820',
                      '#7AAA58',
                      '#3AA8A0',
                      '#3A8AC4',
                      '#9B6BA0',
                    ];
                    return [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                      const selected = Number(subAnswers.rate) === n;
                      const dist = Math.abs(n - (Number(subAnswers.rate) || 0));
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSubAnswers((prev) => ({ ...prev, rate: String(n) }))}
                          className="cursor-pointer transition-all duration-200"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            background: rainbow[n - 1],
                            opacity: selected ? 1 : dist === 1 ? 0.5 : 0.2,
                            border: 'none',
                          }}
                        />
                      );
                    });
                  })()}
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
