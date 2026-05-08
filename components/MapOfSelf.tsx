'use client';

import { useEffect, useRef, useState } from 'react';
import { appendEntry } from '@/lib/day-timeline';

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

type VP = { indices: number[]; harmony: number; onSetIndex: (ai: number, ci: number) => void };

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
function V1({ indices, harmony, onSetIndex }: VP) {
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
        function handleArcClick(e: React.MouseEvent<SVGElement>) {
          const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect();
          const dx = e.clientX - rect.left - CX;
          const dy = e.clientY - rect.top - CY;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          const norm = ((angle % 360) + 360) % 360;
          const ci = Math.round((norm / 360) * (axis.colors.length - 1));
          onSetIndex(i, Math.min(axis.colors.length - 1, Math.max(0, ci)));
        }
        return (
          <g key={i} transform={`rotate(-90,${CX},${CY})`}>
            <circle
              cx={CX}
              cy={CY}
              r={rad}
              fill="none"
              stroke={c}
              strokeWidth={SW + 8}
              opacity={0}
              style={{ cursor: 'pointer' }}
              onClick={handleArcClick}
            />
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

function V5({ indices, harmony, onSetIndex }: VP) {
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
          const s = ARC_STARTS[ai] + ci * segDeg + 1.8;
          const e = ARC_STARTS[ai] + (ci + 1) * segDeg - 1.8;
          return (
            <path
              key={`${ai}-${ci}`}
              d={arcPath(s, e)}
              fill="none"
              stroke={c}
              strokeWidth={R_SW}
              strokeLinecap="butt"
              opacity={indices[ai] === ci ? 1 : 0.38}
              style={{ cursor: 'pointer' }}
              onClick={() => onSetIndex(ai, ci)}
            />
          );
        });
      })}
      {/* Tick indicators */}
      {AXES.map((axis, ai) => (
        <g key={ai}>
          <path
            d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + ARC_DEG)}
            fill="none"
            stroke="transparent"
            strokeWidth={R_SW + 16}
            style={{ cursor: 'pointer' }}
            onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
            onPointerMove={(ev) => {
              if (ev.buttons !== 1) return;
              onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, ARC_DEG, ARC_STARTS));
            }}
          />
          <RingTick
            ai={ai}
            ci={indices[ai]}
            n={axis.colors.length}
            color={col(axis, indices[ai])}
            r={R_RING}
            sw={R_SW}
            arcDeg={ARC_DEG}
            starts={ARC_STARTS}
          />
        </g>
      ))}
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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V3 — RAINBOW RING with NSEW gaps
   Same as V5 but gaps fall exactly at N / E / S / W
══════════════════════════════════════════════════════ */
const NSEW_STARTS = [-88, 2, 92, 182]; // 4° gap centred on each cardinal point

function V3({ indices, harmony, onSetIndex }: VP) {
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
          const s = NSEW_STARTS[ai] + ci * segDeg + 1.8;
          const e = NSEW_STARTS[ai] + (ci + 1) * segDeg - 1.8;
          return (
            <path
              key={`${ai}-${ci}`}
              d={arcPath(s, e)}
              fill="none"
              stroke={c}
              strokeWidth={R_SW}
              strokeLinecap="butt"
              opacity={indices[ai] === ci ? 1 : 0.38}
              style={{ cursor: 'pointer' }}
              onClick={() => onSetIndex(ai, ci)}
            />
          );
        });
      })}

      {/* Tick indicators + drag overlays */}
      {AXES.map((axis, ai) => (
        <g key={ai}>
          <path
            d={arcPath(NSEW_STARTS[ai], NSEW_STARTS[ai] + ARC_DEG)}
            fill="none"
            stroke="transparent"
            strokeWidth={R_SW + 16}
            style={{ cursor: 'pointer' }}
            onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
            onPointerMove={(ev) => {
              if (ev.buttons !== 1) return;
              onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, ARC_DEG, NSEW_STARTS));
            }}
          />
          <RingTick
            ai={ai}
            ci={indices[ai]}
            n={axis.colors.length}
            color={col(axis, indices[ai])}
            r={R_RING}
            sw={R_SW}
            arcDeg={ARC_DEG}
            starts={NSEW_STARTS}
          />
        </g>
      ))}

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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED RING HELPERS
══════════════════════════════════════════════════════ */
const CONT_DEG = 84; // each arc spans 84° — leaves 6° NSEW gap

// Drag-along-arc helper: given pointer position, returns segment index for axis ai
function arcHitIndex(
  e: React.PointerEvent<SVGElement>,
  ai: number,
  n: number,
  arcDeg: number,
  starts: number[],
): number {
  const svg = (e.currentTarget as SVGElement).closest('svg')!;
  const rect = svg.getBoundingClientRect();
  const dx = e.clientX - rect.left - CX;
  const dy = e.clientY - rect.top - CY;
  const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  const base = (starts[ai] + 360) % 360;
  const rel = (angle - base + 360) % 360;
  return Math.min(n - 1, Math.max(0, Math.floor((rel / arcDeg) * n)));
}

// Perpendicular tick mark at midpoint of a segment — replaces the white dot
function RingTick({
  ai,
  ci,
  n,
  color,
  r,
  sw,
  arcDeg,
  starts,
}: {
  ai: number;
  ci: number;
  n: number;
  color: string;
  r: number;
  sw: number;
  arcDeg: number;
  starts: number[];
}) {
  const midDeg = starts[ai] + (ci + 0.5) * (arcDeg / n);
  const inner = ptOn(midDeg, r - sw / 2 - 2);
  const outer = ptOn(midDeg, r + sw / 2 + 2);
  return (
    <line
      x1={inner.x}
      y1={inner.y}
      x2={outer.x}
      y2={outer.y}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      opacity={0.9}
      style={{ pointerEvents: 'none' }}
    />
  );
}

function CenterText({ harmony }: { harmony: number }) {
  return (
    <>
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
    </>
  );
}

/* ══════════════════════════════════════════════════════
   V_SMOOTH — original continuous ring
   Rounded caps, uniform opacity — seamless within each arc
══════════════════════════════════════════════════════ */
function VSmooth({ indices, harmony, onSetIndex }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="vsdot" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AXES.map((axis, ai) => {
        const segDeg = ARC_DEG / axis.colors.length;
        return (
          <g key={ai}>
            {axis.colors.map((c, ci) => {
              const s = ARC_STARTS[ai] + ci * segDeg + 0.6;
              const e = ARC_STARTS[ai] + (ci + 1) * segDeg - 0.6;
              return (
                <path
                  key={ci}
                  d={arcPath(s, e)}
                  fill="none"
                  stroke={c}
                  strokeWidth={R_SW}
                  strokeLinecap="round"
                  opacity={0.82}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSetIndex(ai, ci)}
                  onPointerMove={(e) => {
                    if (e.buttons === 1) onSetIndex(ai, ci);
                  }}
                />
              );
            })}
          </g>
        );
      })}
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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V6 — CLARITY RING
   Continuous within each quadrant (no internal gaps)
   Sharp 6° NSEW gaps, active level highlighted + tick
══════════════════════════════════════════════════════ */
function V6({ indices, harmony, onSetIndex }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v6glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AXES.map((axis, ai) => {
        const segDeg = CONT_DEG / axis.colors.length;
        return (
          <g key={ai}>
            {axis.colors.map((c, ci) => {
              const s = ARC_STARTS[ai] + ci * segDeg;
              const e = s + segDeg;
              return (
                <path
                  key={ci}
                  d={arcPath(s, e)}
                  fill="none"
                  stroke={c}
                  strokeWidth={R_SW}
                  strokeLinecap="butt"
                  opacity={indices[ai] === ci ? 1 : 0.28}
                  filter={indices[ai] === ci ? 'url(#v6glow)' : undefined}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSetIndex(ai, ci)}
                  onPointerMove={(ev) => {
                    if (ev.buttons === 1) onSetIndex(ai, ci);
                  }}
                />
              );
            })}
            {/* Invisible wide drag overlay */}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + CONT_DEG)}
              fill="none"
              stroke="transparent"
              strokeWidth={R_SW + 16}
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
              onPointerMove={(ev) => {
                if (ev.buttons !== 1) return;
                onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, CONT_DEG, ARC_STARTS));
              }}
            />
          </g>
        );
      })}
      {AXES.map((axis, ai) => {
        const midDeg = ARC_STARTS[ai] + CONT_DEG / 2;
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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V7 — ORBIT RINGS
   Each axis on its own concentric ring (4 radii)
   All continuous within arc, NSEW gaps
══════════════════════════════════════════════════════ */
const ORBIT_RADII = [54, 72, 90, 108];
const ORBIT_SW = 12;

function V7({ indices, harmony, onSetIndex }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v7glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AXES.map((axis, ai) => {
        const _r = ORBIT_RADII[ai];
        const segDeg = CONT_DEG / axis.colors.length;
        return (
          <g key={ai}>
            {/* Dim full background ring */}
            {axis.colors.map((c, ci) => {
              const s = ARC_STARTS[ai] + ci * segDeg;
              return (
                <path
                  key={`bg-${ci}`}
                  d={arcPath(s, s + segDeg)}
                  fill="none"
                  stroke={c}
                  strokeWidth={ORBIT_SW}
                  strokeLinecap="butt"
                  opacity={0.18}
                />
              );
            })}
            {/* Highlight only active segment */}
            {(() => {
              const ci = indices[ai];
              const s = ARC_STARTS[ai] + ci * segDeg;
              return (
                <path
                  d={arcPath(s, s + segDeg)}
                  fill="none"
                  stroke={col(axis, ci)}
                  strokeWidth={ORBIT_SW + 4}
                  strokeLinecap="butt"
                  opacity={0.95}
                  filter="url(#v7glow)"
                />
              );
            })()}
            {/* Drag overlay */}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + CONT_DEG)}
              fill="none"
              stroke="transparent"
              strokeWidth={ORBIT_SW + 16}
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
              onPointerMove={(ev) => {
                if (ev.buttons !== 1) return;
                onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, CONT_DEG, ARC_STARTS));
              }}
              onClick={(ev) =>
                onSetIndex(
                  ai,
                  arcHitIndex(
                    ev as unknown as React.PointerEvent<SVGElement>,
                    ai,
                    axis.colors.length,
                    CONT_DEG,
                    ARC_STARTS,
                  ),
                )
              }
            />
          </g>
        );
      })}
      {AXES.map((axis, ai) => {
        const r = ORBIT_RADII[ai];
        const midDeg = ARC_STARTS[ai] + CONT_DEG / 2;
        const p = ptOn(midDeg, r + ORBIT_SW / 2 + 13);
        const anchor = Math.abs(p.x - CX) < 10 ? 'middle' : p.x > CX ? 'start' : 'end';
        return (
          <text
            key={ai}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill={col(axis, indices[ai])}
            fontSize={7.5}
            fontWeight={800}
            letterSpacing="0.12em"
            opacity={0.7}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {axis.levelLabels[indices[ai]].toUpperCase()}
          </text>
        );
      })}
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V8 — TWIN ARC
   Each axis: thin outer spectrum ring + thick inner level arc
   Both continuous within quadrant
══════════════════════════════════════════════════════ */
const TWIN_OUTER_R = 100;
const _TWIN_INNER_R = 84;
const TWIN_OUTER_SW = 7;
const TWIN_INNER_SW = 14;

function V8({ indices, harmony, onSetIndex }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v8glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AXES.map((axis, ai) => {
        const segDeg = CONT_DEG / axis.colors.length;
        const ci = indices[ai];
        const c = col(axis, ci);
        return (
          <g key={ai}>
            {/* Outer ring: full spectrum, thin, continuous */}
            {axis.colors.map((cc, cj) => {
              const s = ARC_STARTS[ai] + cj * segDeg;
              return (
                <path
                  key={cj}
                  d={arcPath(s, s + segDeg)}
                  fill="none"
                  stroke={cc}
                  strokeWidth={TWIN_OUTER_SW}
                  strokeLinecap="butt"
                  opacity={ci === cj ? 0.9 : 0.35}
                />
              );
            })}
            {/* Inner ring: only active level, thick */}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + ci * segDeg + segDeg)}
              fill="none"
              stroke={c}
              strokeWidth={TWIN_INNER_SW}
              strokeLinecap="butt"
              opacity={0.75}
              filter="url(#v8glow)"
            />
            {/* Inner ring background */}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + CONT_DEG)}
              fill="none"
              stroke={c}
              strokeWidth={TWIN_INNER_SW}
              strokeLinecap="butt"
              opacity={0.08}
            />
            {/* Drag overlay */}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + CONT_DEG)}
              fill="none"
              stroke="transparent"
              strokeWidth={TWIN_OUTER_SW + TWIN_INNER_SW + 20}
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
              onPointerMove={(ev) => {
                if (ev.buttons !== 1) return;
                onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, CONT_DEG, ARC_STARTS));
              }}
              onClick={(ev) =>
                onSetIndex(
                  ai,
                  arcHitIndex(
                    ev as unknown as React.PointerEvent<SVGElement>,
                    ai,
                    axis.colors.length,
                    CONT_DEG,
                    ARC_STARTS,
                  ),
                )
              }
            />
          </g>
        );
      })}
      {AXES.map((axis, ai) => {
        const midDeg = ARC_STARTS[ai] + CONT_DEG / 2;
        const p = ptOn(midDeg, TWIN_OUTER_R + TWIN_OUTER_SW / 2 + 17);
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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V9 — WIDE BAND
   Thick continuous arcs (SW=28), wider NSEW gap (8°)
   Colors blend seamlessly, level shown by tick
══════════════════════════════════════════════════════ */
const WIDE_DEG = 82;
const WIDE_R = 88;
const WIDE_SW = 26;

function V9({ indices, harmony, onSetIndex }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v9glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AXES.map((axis, ai) => {
        const segDeg = WIDE_DEG / axis.colors.length;
        return (
          <g key={ai}>
            {axis.colors.map((c, ci) => {
              const s = ARC_STARTS[ai] + ci * segDeg;
              const e = s + segDeg;
              return (
                <path
                  key={ci}
                  d={arcPath(s, e)}
                  fill="none"
                  stroke={c}
                  strokeWidth={WIDE_SW}
                  strokeLinecap="butt"
                  opacity={indices[ai] === ci ? 0.95 : 0.22}
                  filter={indices[ai] === ci ? 'url(#v9glow)' : undefined}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSetIndex(ai, ci)}
                  onPointerMove={(ev) => {
                    if (ev.buttons === 1) onSetIndex(ai, ci);
                  }}
                />
              );
            })}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + WIDE_DEG)}
              fill="none"
              stroke="transparent"
              strokeWidth={WIDE_SW + 12}
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
              onPointerMove={(ev) => {
                if (ev.buttons !== 1) return;
                onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, WIDE_DEG, ARC_STARTS));
              }}
            />
          </g>
        );
      })}
      {AXES.map((axis, ai) => {
        const midDeg = ARC_STARTS[ai] + WIDE_DEG / 2;
        const p = ptOn(midDeg, WIDE_R + WIDE_SW / 2 + 15);
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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   V10 — BLOOM
   Like V6 (Clarity) but with a radial bloom behind each active segment
   Gives a soft petal / corona effect
══════════════════════════════════════════════════════ */
function V10({ indices, harmony, onSetIndex }: VP) {
  return (
    <svg width={S} height={S} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="v10bloom" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="v10seg" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {AXES.map((axis, ai) => {
        const segDeg = CONT_DEG / axis.colors.length;
        const ci = indices[ai];
        const c = col(axis, ci);
        const s = ARC_STARTS[ai] + ci * segDeg;
        return (
          <g key={ai}>
            {/* Bloom layer — active segment at larger radius */}
            <path
              d={arcPath(s, s + segDeg)}
              fill="none"
              stroke={c}
              strokeWidth={R_SW + 12}
              strokeLinecap="butt"
              opacity={0.18}
              filter="url(#v10bloom)"
            />
            {/* All segments continuous */}
            {axis.colors.map((cc, cj) => {
              const ss = ARC_STARTS[ai] + cj * segDeg;
              return (
                <path
                  key={cj}
                  d={arcPath(ss, ss + segDeg)}
                  fill="none"
                  stroke={cc}
                  strokeWidth={R_SW}
                  strokeLinecap="butt"
                  opacity={ci === cj ? 1 : 0.28}
                  filter={ci === cj ? 'url(#v10seg)' : undefined}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSetIndex(ai, cj)}
                  onPointerMove={(ev) => {
                    if (ev.buttons === 1) onSetIndex(ai, cj);
                  }}
                />
              );
            })}
            {/* Drag overlay */}
            <path
              d={arcPath(ARC_STARTS[ai], ARC_STARTS[ai] + CONT_DEG)}
              fill="none"
              stroke="transparent"
              strokeWidth={R_SW + 16}
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => ev.currentTarget.setPointerCapture(ev.pointerId)}
              onPointerMove={(ev) => {
                if (ev.buttons !== 1) return;
                onSetIndex(ai, arcHitIndex(ev, ai, axis.colors.length, CONT_DEG, ARC_STARTS));
              }}
            />
          </g>
        );
      })}
      {AXES.map((axis, ai) => {
        const midDeg = ARC_STARTS[ai] + CONT_DEG / 2;
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
      <CenterText harmony={harmony} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
const VARIANTS = [V1, VSmooth, V5, V3, V6, V7, V8, V9, V10] as const;
const V_LABELS = [
  'Arcs',
  'Ring',
  'Ring+',
  'Cross+',
  'Clear',
  'Orbits',
  'Twin',
  'Wide',
  'Bloom',
] as const;

export default function MapOfSelf() {
  const [indices, setIndices] = useState(() => AXES.map((a) => a.defaultIdx));
  const [variant, setVariant] = useState(1);

  function setIndex(ai: number, ci: number) {
    setIndices((prev) => {
      const next = [...prev];
      next[ai] = ci;
      try {
        localStorage.setItem(AXES[ai].lsKey, String(ci));
      } catch {}
      appendEntry(next);
      return next;
    });
  }

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

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    if (pickerOpen) document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [pickerOpen]);

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
          position: 'relative',
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
          style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
          ref={pickerRef}
        >
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            aria-label="Design options"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '1px solid rgba(196,160,96,0.45)',
              background: pickerOpen ? '#C4A060' : 'transparent',
              boxShadow: pickerOpen ? '0 0 7px rgba(196,160,96,0.6)' : 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              transition: 'all 0.18s',
            }}
          />
          {pickerOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 12,
                zIndex: 200,
                marginTop: 6,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 66px)',
                gap: 8,
              }}
            >
              {(VARIANTS as unknown as React.ComponentType<VP>[]).map((V, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    switchVariant(i);
                    setPickerOpen(false);
                  }}
                  title={V_LABELS[i]}
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 10,
                    border:
                      variant === i ? '1.5px solid #C4A060' : '1px solid rgba(196,160,96,0.2)',
                    background: variant === i ? 'rgba(196,160,96,0.12)' : 'rgba(196,160,96,0.04)',
                    cursor: 'pointer',
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: variant === i ? '0 0 8px rgba(196,160,96,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div
                    style={{
                      width: 260,
                      height: 260,
                      transform: 'scale(0.254)',
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}
                  >
                    <V indices={indices} harmony={harmony} onSetIndex={() => {}} />
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 3,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      fontSize: 7.5,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: variant === i ? '#C4A060' : '#8A6A4A',
                      fontFamily: 'var(--font-serif)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {V_LABELS[i]}
                  </span>
                </button>
              ))}
            </div>
          )}
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
        <Viz indices={indices} harmony={harmony} onSetIndex={setIndex} />

        {/* Legend — two centered columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 8px',
            width: '100%',
            maxWidth: 256,
          }}
        >
          {AXES.map((axis, i) => {
            const c = col(axis, indices[i]);
            const isRight = i % 2 === 1;
            return (
              <div
                key={axis.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRight ? 'flex-end' : 'flex-start',
                  gap: 3,
                }}
              >
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    flexDirection: isRight ? 'row-reverse' : 'row',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: c,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${c}CC`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
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
