'use client';

import { useEffect, useState } from 'react';

/* ── Palettes (must stay in sync with FeelingCircles2) ────────── */
const EMOTION_COLORS = [
  '#A8C0D0',
  '#C0A0B8',
  '#C098B0',
  '#C07898',
  '#C49080',
  '#C8A858',
  '#C4C068',
  '#90B880',
  '#80B898',
  '#80B0C8',
];
const EMOTION_LABELS = [
  'Shame',
  'Apathy',
  'Grief',
  'Fear',
  'Anger',
  'Courage',
  'Acceptance',
  'Reason',
  'Love',
  'Peace',
];
const MIND_COLORS = ['#B89088', '#C4A888', '#B0A0B8', '#C4B880', '#98BC90', '#A098C0'];
const MIND_LABELS = ['Absent', 'Scattered', 'Confused', 'Drifting', 'Present', 'Flowing'];
const BODY_COLORS = [
  '#A89090',
  '#B09890',
  '#B8A088',
  '#C09878',
  '#B0A878',
  '#98B890',
  '#80B898',
  '#70B098',
];
const BODY_LABELS = [
  'Depleted',
  'Drained',
  'Heavy',
  'Tense',
  'Warming',
  'Good',
  'Active',
  'Energized',
];
const FOCUS_COLORS = [
  '#9098A8',
  '#A898B0',
  '#B8A890',
  '#C4A868',
  '#C4B058',
  '#A8B870',
  '#88B888',
  '#60C890',
];
const FOCUS_LABELS = [
  'Scattered',
  'Distracted',
  'Restless',
  'Warming',
  'Present',
  'Locked',
  'Flowing',
  'Zone',
];

const AXES = [
  {
    label: 'Emotions',
    lsKey: 'colourmap:process-idx',
    colors: EMOTION_COLORS,
    levelLabels: EMOTION_LABELS,
    defaultIdx: 4,
  },
  {
    label: 'Mind',
    lsKey: 'colourmap:presence-idx',
    colors: MIND_COLORS,
    levelLabels: MIND_LABELS,
    defaultIdx: 3,
  },
  {
    label: 'Body',
    lsKey: 'colourmap:body-idx',
    colors: BODY_COLORS,
    levelLabels: BODY_LABELS,
    defaultIdx: 3,
  },
  {
    label: 'Focus',
    lsKey: 'colourmap:focus-idx',
    colors: FOCUS_COLORS,
    levelLabels: FOCUS_LABELS,
    defaultIdx: 3,
  },
];

const S = 260;
const CX = S / 2;
const CY = S / 2;

type VP = { indices: number[]; harmony: number };

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}
function ptOn(deg: number, r: number) {
  return { x: CX + Math.cos(deg2rad(deg)) * r, y: CY + Math.sin(deg2rad(deg)) * r };
}
function col(axis: (typeof AXES)[number], idx: number) {
  return axis.colors[idx] ?? axis.colors[0];
}

/* ══════════════════════════════════════════════════════
   V1 — CONCENTRIC ARCS
══════════════════════════════════════════════════════ */
function V1({ indices, harmony }: VP) {
  const RINGS = [104, 84, 64, 44];
  const SW = 13;
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v1g" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="v1bg">
          <stop offset="0%" stopColor="rgba(196,160,96,0.09)" />
          <stop offset="100%" stopColor="rgba(196,160,96,0)" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={112} fill="url(#v1bg)" />
      {AXES.map((axis, i) => {
        const r = indices[i] / (axis.colors.length - 1 || 1);
        const c = col(axis, indices[i]);
        const rad = RINGS[i];
        const circ = 2 * Math.PI * rad;
        return (
          <g key={i} transform={`rotate(-90,${CX},${CY})`}>
            <circle cx={CX} cy={CY} r={rad} fill="none" stroke={c} strokeWidth={SW} opacity={0.1} />
            {r > 0 && (
              <circle
                cx={CX}
                cy={CY}
                r={rad}
                fill="none"
                stroke={c}
                strokeWidth={SW}
                strokeDasharray={`${r * circ} ${circ}`}
                strokeLinecap="round"
                filter="url(#v1g)"
              />
            )}
          </g>
        );
      })}
      {/* Labels at arc ends */}
      {AXES.map((axis, i) => {
        const r = indices[i] / (axis.colors.length - 1 || 1);
        const endDeg = -90 + r * 360;
        const p = ptOn(endDeg, RINGS[i] + SW / 2 + 12);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={col(axis, indices[i])}
            fontSize={7.5}
            fontWeight={800}
            letterSpacing="0.12em"
            opacity={0.8}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {axis.label.toUpperCase()}
          </text>
        );
      })}
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        fill="#5C3018"
        fontSize={22}
        fontWeight={800}
        opacity={0.85}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {harmony}
      </text>
      <text
        x={CX}
        y={CY + 10}
        textAnchor="middle"
        fill="#8A6A4A"
        fontSize={7}
        fontWeight={700}
        letterSpacing="0.18em"
        opacity={0.5}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        BALANCE
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V5 — RAINBOW SPECTRUM RING
   4 arcs each showing full colour range, dot at level
══════════════════════════════════════════════════════ */
const ARC_DEG = 86;
const R_RING = 96;
const R_SW = 18;
const ARC_STARTS = [-90, 0, 90, 180];

function arcPath(startDeg: number, endDeg: number): string {
  const s = deg2rad(startDeg);
  const e = deg2rad(endDeg);
  const x1 = CX + R_RING * Math.cos(s);
  const y1 = CY + R_RING * Math.sin(s);
  const x2 = CX + R_RING * Math.cos(e);
  const y2 = CY + R_RING * Math.sin(e);
  return `M ${x1} ${y1} A ${R_RING} ${R_RING} 0 ${endDeg - startDeg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

function V5({ indices, harmony }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v5dot" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Colour spectrum arcs */}
      {AXES.map((axis, ai) => {
        const segDeg = ARC_DEG / axis.colors.length;
        return axis.colors.map((c, ci) => {
          const s = ARC_STARTS[ai] + ci * segDeg + 0.6;
          const e = ARC_STARTS[ai] + (ci + 1) * segDeg - 0.6;
          return (
            <path
              key={`${ai}-${ci}`}
              d={arcPath(s, e)}
              fill="none"
              stroke={c}
              strokeWidth={R_SW}
              strokeLinecap="round"
              opacity={0.82}
            />
          );
        });
      })}
      {/* Indicator dots */}
      {AXES.map((axis, ai) => {
        const segDeg = ARC_DEG / axis.colors.length;
        const dotDeg = ARC_STARTS[ai] + (indices[ai] + 0.5) * segDeg;
        const c = col(axis, indices[ai]);
        const p = ptOn(dotDeg, R_RING);
        return (
          <g key={ai} filter="url(#v5dot)">
            <circle cx={p.x} cy={p.y} r={11} fill={c} opacity={0.18} />
            <circle cx={p.x} cy={p.y} r={7} fill={c} />
            <circle cx={p.x} cy={p.y} r={2.5} fill="rgba(255,255,255,0.9)" />
          </g>
        );
      })}
      {/* Axis labels */}
      {AXES.map((axis, ai) => {
        const midDeg = ARC_STARTS[ai] + ARC_DEG / 2;
        const p = ptOn(midDeg, R_RING + R_SW / 2 + 17);
        const anchor = Math.abs(p.x - CX) < 10 ? 'middle' : p.x > CX ? 'start' : 'end';
        return (
          <text
            key={ai}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#8A6A4A"
            fontSize={8.5}
            fontWeight={800}
            letterSpacing="0.16em"
            opacity={0.65}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {axis.label.toUpperCase()}
          </text>
        );
      })}
      {/* Center — transparent background, just text */}
      <text
        x={CX}
        y={CY - 9}
        textAnchor="middle"
        fill="#5C3018"
        fontSize={24}
        fontWeight={800}
        opacity={0.9}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {harmony}
      </text>
      <text
        x={CX}
        y={CY + 11}
        textAnchor="middle"
        fill="#8A6A4A"
        fontSize={7.5}
        fontWeight={700}
        letterSpacing="0.18em"
        opacity={0.5}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        BALANCE
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V3 — RAINBOW RING with NSEW gaps
   Same as V5 but gaps fall exactly at N / E / S / W
══════════════════════════════════════════════════════ */
const NSEW_STARTS = [-88, 2, 92, 182]; // 4° gap centred on each cardinal point

function V3({ indices, harmony }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v3dot" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Colour spectrum arcs */}
      {AXES.map((axis, ai) => {
        const segDeg = ARC_DEG / axis.colors.length;
        return axis.colors.map((c, ci) => {
          const s = NSEW_STARTS[ai] + ci * segDeg + 0.6;
          const e = NSEW_STARTS[ai] + (ci + 1) * segDeg - 0.6;
          return (
            <path
              key={`${ai}-${ci}`}
              d={arcPath(s, e)}
              fill="none"
              stroke={c}
              strokeWidth={R_SW}
              strokeLinecap="round"
              opacity={0.82}
            />
          );
        });
      })}

      {/* Indicator dots */}
      {AXES.map((axis, ai) => {
        const segDeg = ARC_DEG / axis.colors.length;
        const dotDeg = NSEW_STARTS[ai] + (indices[ai] + 0.5) * segDeg;
        const c = col(axis, indices[ai]);
        const p = ptOn(dotDeg, R_RING);
        return (
          <g key={ai} filter="url(#v3dot)">
            <circle cx={p.x} cy={p.y} r={11} fill={c} opacity={0.18} />
            <circle cx={p.x} cy={p.y} r={7} fill={c} />
            <circle cx={p.x} cy={p.y} r={2.5} fill="rgba(255,255,255,0.9)" />
          </g>
        );
      })}

      {/* Axis labels */}
      {AXES.map((axis, ai) => {
        const midDeg = NSEW_STARTS[ai] + ARC_DEG / 2;
        const p = ptOn(midDeg, R_RING + R_SW / 2 + 17);
        const anchor = Math.abs(p.x - CX) < 10 ? 'middle' : p.x > CX ? 'start' : 'end';
        return (
          <text
            key={ai}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#8A6A4A"
            fontSize={8.5}
            fontWeight={800}
            letterSpacing="0.16em"
            opacity={0.65}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {axis.label.toUpperCase()}
          </text>
        );
      })}

      {/* Center — no background circle, just text */}
      <text
        x={CX}
        y={CY - 9}
        textAnchor="middle"
        fill="#5C3018"
        fontSize={24}
        fontWeight={800}
        opacity={0.9}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {harmony}
      </text>
      <text
        x={CX}
        y={CY + 11}
        textAnchor="middle"
        fill="#8A6A4A"
        fontSize={7.5}
        fontWeight={700}
        letterSpacing="0.18em"
        opacity={0.5}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        BALANCE
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
const VARIANTS = [V1, V5, V3] as const;
const V_LABELS = ['Arcs', 'Ring', 'Cross'] as const;

export default function MapOfSelf() {
  const [indices, setIndices] = useState(() => AXES.map((a) => a.defaultIdx));
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    setIndices(
      AXES.map((a) => {
        try {
          const v = localStorage.getItem(a.lsKey);
          if (v !== null) return Math.min(a.colors.length - 1, Math.max(0, Number(v)));
        } catch {}
        return a.defaultIdx;
      }),
    );
    try {
      const sv = localStorage.getItem('colourmap:map-variant');
      if (sv !== null) setVariant(Math.min(VARIANTS.length - 1, Math.max(0, Number(sv))));
      else setVariant(1);
    } catch {}
  }, []);

  function switchVariant(v: number) {
    setVariant(v);
    try {
      localStorage.setItem('colourmap:map-variant', String(v));
    } catch {}
  }

  const harmony = Math.round(
    (indices.reduce((s, idx, i) => s + idx / (AXES[i].colors.length - 1 || 1), 0) / AXES.length) *
      100,
  );
  const Viz = VARIANTS[variant];

  return (
    <div
      style={{
        border: '1px solid rgba(196,160,96,0.2)',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(196,160,96,0.1)',
          borderBottom: '1px solid rgba(196,160,96,0.2)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#5C3018',
          }}
        >
          Map of Self
        </span>
        <span
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 7,
            alignItems: 'center',
          }}
        >
          {V_LABELS.map((lbl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => switchVariant(i)}
              title={lbl}
              style={{
                width: variant === i ? 10 : 7,
                height: variant === i ? 10 : 7,
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: variant === i ? '#C4A060' : 'rgba(196,160,96,0.28)',
                boxShadow: variant === i ? '0 0 8px #C4A06099' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            />
          ))}
        </span>
      </div>

      {/* Wheel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          padding: '24px 16px 28px',
        }}
      >
        <Viz indices={indices} harmony={harmony} />

        {/* Legend */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px 24px',
            width: '100%',
            maxWidth: 256,
          }}
        >
          {AXES.map((axis, i) => {
            const c = col(axis, indices[i]);
            return (
              <div key={axis.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    display: 'block',
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: c,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${c}CC`,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#8A6A4A',
                      opacity: 0.55,
                      lineHeight: 1,
                    }}
                  >
                    {axis.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: c,
                      lineHeight: 1,
                    }}
                  >
                    {axis.levelLabels[indices[i]]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
