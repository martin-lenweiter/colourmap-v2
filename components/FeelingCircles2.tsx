'use client';

import { useEffect, useRef, useState } from 'react';
import EmotionMultiSelect from '@/components/EmotionMultiSelect';
import MoodWord from '@/components/MoodWord';
import SquareSlider from '@/components/SquareSlider';
import { syncEvent, syncPref } from '@/lib/sync';

/* ─── Circle configs ─────────────────────────────────────────── */
const CIRCLES = [
  {
    id: 'emotions',
    title: 'Emotions',
    lsIdxKey: 'colourmap:process-idx',
    lsFragKey: 'colourmap:ring-emotions-frag',
    lsLogKey: 'colourmap:emotions-log',
    defaultIdx: 4,
    reflectPrompt: 'What are you feeling right now?',
    levels: [
      { label: 'Shame', color: '#A8C0D0' },
      { label: 'Apathy', color: '#C0A0B8' },
      { label: 'Grief', color: '#C098B0' },
      { label: 'Fear', color: '#C07898' },
      { label: 'Anger', color: '#C49080' },
      { label: 'Courage', color: '#C8A858' },
      { label: 'Acceptance', color: '#C4C068' },
      { label: 'Reason', color: '#90B880' },
      { label: 'Love', color: '#80B898' },
      { label: 'Peace', color: '#80B0C8' },
    ],
  },
  {
    id: 'body',
    title: 'Body',
    lsIdxKey: 'colourmap:body-idx',
    lsFragKey: 'colourmap:ring-body-frag',
    lsLogKey: 'colourmap:body-log',
    defaultIdx: 3,
    reflectPrompt: 'How does your body feel?',
    levels: [
      { label: 'Depleted', color: '#8A7060' },
      { label: 'Drained', color: '#9A7E68' },
      { label: 'Heavy', color: '#A88C70' },
      { label: 'Tense', color: '#C09878' },
      { label: 'Warming', color: '#C4A468' },
      { label: 'Good', color: '#C8A858' },
      { label: 'Active', color: '#C8A848' },
      { label: 'Energized', color: '#C8A030' },
    ],
  },
];

/* ─── Focus levels ───────────────────────────────────────────── */
const FOCUS_LEVELS = [
  { label: 'Scattered', color: '#9098A8' },
  { label: 'Distracted', color: '#A898B0' },
  { label: 'Restless', color: '#B8A890' },
  { label: 'Warming', color: '#C4A868' },
  { label: 'Present', color: '#C4B058' },
  { label: 'Locked', color: '#A8B870' },
  { label: 'Flowing', color: '#8BA870' },
  { label: 'Zone', color: '#7A9E58' },
];

/* ─── Types ──────────────────────────────────────────────────── */
type TrackEntry = { ts: string; idx: number; note: string; word?: string };
type FocusEntry = { ts: string; focusIdx: number; note: string; kind: 'reflect' | 'idea' };
type Circle = (typeof CIRCLES)[number];

/* ─── Ring constants (used by VizRing) ──────────────────────── */
const SIZE = 210;
const STROKE = 20;
const R = (SIZE - STROKE) / 2;

/* ─── Circle visual variants ─────────────────────────────────── */
type VizProps = {
  idx: number;
  levels: { color: string; label: string }[];
  dragging: boolean;
  moodWord?: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
};

/* V1 — Ball (draggable sphere) */
function VizBall({ idx, levels, dragging, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const c = levels[idx]?.color ?? '#C4A060';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <span
        className="block rounded-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: 'block',
          width: 90,
          height: 90,
          background: c,
          boxShadow: `0 12px 32px -8px ${c}88`,
          transition: 'background 0.3s, box-shadow 0.3s',
          cursor: 'ew-resize',
          touchAction: 'none',
          userSelect: 'none',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: 700,
          color: c,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}
      >
        {levels[idx]?.label}
      </span>
      <div
        style={{
          maxHeight: dragging ? 40 : 0,
          opacity: dragging ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.15s, opacity 0.15s',
          pointerEvents: dragging ? 'auto' : 'none',
        }}
      >
        <SquareSlider
          colors={levels.map((l) => l.color)}
          value={idx}
          onChange={() => {}}
          size={16}
          gap={5}
        />
      </div>
    </div>
  );
}

/* V2 — Ring (SVG fill ring) */
function VizRing({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const c = levels[idx]?.color ?? '#C4A060';
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', touchAction: 'none', userSelect: 'none' }}
    >
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ display: 'block', cursor: 'ew-resize' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={`${c}20`}
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={c}
            strokeWidth={STROKE}
            style={{ transition: 'stroke 0.3s' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: STROKE,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: 26,
              fontWeight: 700,
              color: c,
              lineHeight: 1.1,
              textAlign: 'center',
              transition: 'color 0.3s',
            }}
          >
            {levels[idx]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* V3 — Arc gauge (speedometer) */
function VizArc({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const ACX = 70,
    ACY = 72,
    AR = 52;
  const START = 135,
    TOTAL = 270;
  const c = levels[idx]?.color ?? '#C4A060';
  const rat = levels.length > 1 ? idx / (levels.length - 1) : 0;
  function ap(deg: number) {
    const r = (deg * Math.PI) / 180;
    return { x: ACX + AR * Math.cos(r), y: ACY + AR * Math.sin(r) };
  }
  const p0 = ap(START),
    pE = ap(START + rat * TOTAL),
    pF = ap(START + TOTAL);
  const bg = `M ${p0.x} ${p0.y} A ${AR} ${AR} 0 1 1 ${pF.x} ${pF.y}`;
  const large = rat * TOTAL > 180 ? 1 : 0;
  const fill = rat > 0 ? `M ${p0.x} ${p0.y} A ${AR} ${AR} 0 ${large} 1 ${pE.x} ${pE.y}` : '';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={140}
        height={120}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <filter id="arc-g">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={bg} fill="none" stroke={c} strokeWidth={11} opacity={0.12} strokeLinecap="round" />
        {rat > 0 && (
          <path
            d={fill}
            fill="none"
            stroke={c}
            strokeWidth={11}
            strokeLinecap="round"
            filter="url(#arc-g)"
          />
        )}
        <circle cx={pE.x} cy={pE.y} r={9} fill={c} filter="url(#arc-g)" />
        <circle cx={pE.x} cy={pE.y} r={3.5} fill="rgba(255,255,255,0.9)" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: 700,
          color: c,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {levels[idx]?.label}
      </span>
    </div>
  );
}

/* V4 — Segment ring (N dots arranged in circle) */
function VizSegments({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const SCX = 70,
    SCY = 70,
    SR = 54;
  const n = levels.length;
  const c = levels[idx]?.color ?? '#C4A060';
  return (
    <div style={{ touchAction: 'none', userSelect: 'none' }}>
      <svg
        width={140}
        height={140}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <filter id="seg-g">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {levels.map((lv, i) => {
          const ang = (i / n) * 360 - 90;
          const rad = (ang * Math.PI) / 180;
          const x = SCX + SR * Math.cos(rad),
            y = SCY + SR * Math.sin(rad);
          const active = i <= idx,
            isCur = i === idx;
          return (
            <g key={i}>
              {isCur && (
                <circle cx={x} cy={y} r={14} fill={lv.color} opacity={0.2} filter="url(#seg-g)" />
              )}
              <circle
                cx={x}
                cy={y}
                r={active ? (isCur ? 8 : 5) : 3.5}
                fill={lv.color}
                opacity={active ? 1 : 0.18}
              />
              {isCur && <circle cx={x} cy={y} r={3} fill="rgba(255,255,255,0.9)" />}
            </g>
          );
        })}
        <text
          x={SCX}
          y={SCY - 5}
          textAnchor="middle"
          fill={c}
          fontSize={11}
          fontWeight={700}
          style={{
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {levels[idx]?.label}
        </text>
        <text
          x={SCX}
          y={SCY + 9}
          textAnchor="middle"
          fill={c}
          fontSize={8}
          opacity={0.45}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {idx + 1} / {n}
        </text>
      </svg>
    </div>
  );
}

/* V5 — Liquid fill */
function VizLiquid({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const LCX = 60,
    LCY = 60,
    LR = 50;
  const c = levels[idx]?.color ?? '#C4A060';
  const rat = levels.length > 1 ? idx / (levels.length - 1) : 0;
  const fillY = LCY + LR - rat * 2 * LR;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={120}
        height={120}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <clipPath id="liq-clip">
            <circle cx={LCX} cy={LCY} r={LR} />
          </clipPath>
          <filter id="liq-g">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={LCX} cy={LCY} r={LR} fill="none" stroke={c} strokeWidth={1.5} opacity={0.3} />
        {rat > 0 && (
          <rect
            x={LCX - LR}
            y={fillY}
            width={LR * 2}
            height={LCY + LR - fillY}
            fill={c}
            opacity={0.7}
            clipPath="url(#liq-clip)"
            filter="url(#liq-g)"
          />
        )}
        {rat > 0 && rat < 1 && (
          <line
            x1={LCX - LR + 2}
            y1={fillY}
            x2={LCX + LR - 2}
            y2={fillY}
            stroke={c}
            strokeWidth={1.5}
            opacity={0.55}
            clipPath="url(#liq-clip)"
          />
        )}
        <text
          x={LCX}
          y={LCY + 5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.92)"
          fontSize={11}
          fontWeight={700}
          opacity={rat > 0.45 ? 1 : 0}
          style={{
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'opacity 0.3s',
          }}
        >
          {levels[idx]?.label}
        </text>
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: 700,
          color: c,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          opacity: rat <= 0.45 ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        {levels[idx]?.label}
      </span>
    </div>
  );
}

/* V6 — Bar (horizontal fill) */
function VizBar({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const c = levels[idx]?.color ?? '#C4A060';
  const rat = levels.length > 1 ? idx / (levels.length - 1) : 0;
  return (
    <div
      style={{
        width: '100%',
        touchAction: 'none',
        userSelect: 'none',
        padding: '4px 8px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          fontWeight: 700,
          color: c,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}
      >
        {levels[idx]?.label}
      </span>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: 'relative',
          height: 28,
          width: '100%',
          borderRadius: 14,
          background: `${c}18`,
          border: `1.5px solid ${c}40`,
          overflow: 'hidden',
          cursor: 'ew-resize',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(rat * 100, 2)}%`,
            background: `linear-gradient(90deg, ${c}55, ${c})`,
            borderRadius: 14,
            boxShadow: `0 0 14px ${c}55`,
            transition: 'width 0.2s, background 0.3s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 700,
              color: c,
              opacity: 0.75,
            }}
          >
            {idx + 1} / {levels.length}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 2px',
        }}
      >
        {levels.map((lv, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: i === idx ? 10 : 6,
              borderRadius: 1.5,
              background: i <= idx ? lv.color : `${lv.color}22`,
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* V7 — Pulse (concentric rings fill outward) */
function _VizPulse({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const n = levels.length;
  const c = levels[idx]?.color ?? '#C4A060';
  const CX = 70,
    CY = 70,
    maxR = 60;
  return (
    <div style={{ touchAction: 'none', userSelect: 'none' }}>
      <svg
        width={140}
        height={140}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <filter id="pls-g">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {levels.map((lv, i) => {
          const r = ((i + 1) / n) * maxR;
          const active = i <= idx;
          const isCur = i === idx;
          return (
            <g key={i}>
              {isCur && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={r + 6}
                  fill={lv.color}
                  opacity={0.12}
                  filter="url(#pls-g)"
                />
              )}
              <circle
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                stroke={lv.color}
                strokeWidth={isCur ? 3 : active ? 2 : 1}
                opacity={isCur ? 1 : active ? 0.45 : 0.1}
                style={{ transition: 'all 0.25s' }}
              />
            </g>
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r={5}
          fill={c}
          filter="url(#pls-g)"
          style={{ transition: 'fill 0.3s' }}
        />
        <circle cx={CX} cy={CY} r={2.5} fill="rgba(255,255,255,0.9)" />
        <text
          x={CX}
          y={CY + 22}
          textAnchor="middle"
          fill={c}
          fontSize={11}
          fontWeight={700}
          style={{
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {levels[idx]?.label}
        </text>
      </svg>
    </div>
  );
}

/* V8 — Petals (radial flower petals) */
function VizPetals({ idx, levels, onPointerDown, onPointerMove, onPointerUp }: VizProps) {
  const n = levels.length;
  const c = levels[idx]?.color ?? '#C4A060';
  const CX = 80,
    CY = 80,
    dist = 54,
    petalR = 10;
  return (
    <div style={{ touchAction: 'none', userSelect: 'none' }}>
      <svg
        width={160}
        height={160}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <filter id="pet-g">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {levels.map((lv, i) => {
          const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
          const px = CX + Math.cos(ang) * dist;
          const py = CY + Math.sin(ang) * dist;
          const active = i <= idx;
          const isCur = i === idx;
          const r = isCur ? petalR : active ? petalR * 0.65 : petalR * 0.28;
          return (
            <g key={i}>
              {isCur && (
                <circle
                  cx={px}
                  cy={py}
                  r={petalR + 5}
                  fill={lv.color}
                  opacity={0.15}
                  filter="url(#pet-g)"
                />
              )}
              <circle
                cx={px}
                cy={py}
                r={r}
                fill={active ? lv.color : 'none'}
                stroke={lv.color}
                strokeWidth={active ? 0 : 1}
                opacity={active ? 1 : 0.2}
                style={{ transition: 'all 0.25s' }}
              />
            </g>
          );
        })}
        <circle
          cx={CX}
          cy={CY}
          r={11}
          fill={c}
          filter="url(#pet-g)"
          style={{ transition: 'fill 0.3s' }}
        />
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={8}
          fontWeight={800}
          style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.06em' }}
        >
          {idx + 1}
        </text>
      </svg>
    </div>
  );
}

/* V10 — Diamond Empty (outline only, thick stroke, name in centre) */
function _VizDiamondEmpty({
  idx,
  levels,
  moodWord,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: VizProps) {
  const c = levels[idx]?.color ?? '#C4A060';
  const centreText = moodWord || levels[idx]?.label;
  const isCustom = !!moodWord;
  const S = 142;
  const CX = S / 2,
    CY = S / 2;
  const HALF = 56;
  const top = `${CX},${CY - HALF}`;
  const right = `${CX + HALF},${CY}`;
  const bottom = `${CX},${CY + HALF}`;
  const left = `${CX - HALF},${CY}`;
  const outline = `M${top} L${right} L${bottom} L${left} Z`;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Outline only — thick */}
        <path
          d={outline}
          fill="none"
          stroke={c}
          strokeWidth={2.5}
          strokeLinejoin="miter"
          opacity={0.85}
        />
        {/* Name centred */}
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={c}
          fontSize={isCustom ? (centreText.length > 9 ? 11 : 16) : 17}
          fontWeight={700}
          style={{
            fontFamily: isCustom ? 'var(--font-handwritten)' : 'var(--font-serif)',
            letterSpacing: '0.04em',
          }}
        >
          {centreText}
        </text>
      </svg>
    </div>
  );
}

/* V11 — Diamond Full (solid fill, thick stroke, name in centre) */
function VizDiamondFull({
  idx,
  levels,
  moodWord,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: VizProps) {
  const c = levels[idx]?.color ?? '#C4A060';
  const centreText = moodWord || levels[idx]?.label;
  const isCustom = !!moodWord;
  const S = 142;
  const CX = S / 2,
    CY = S / 2;
  const HALF = 56;
  const top = `${CX},${CY - HALF}`;
  const right = `${CX + HALF},${CY}`;
  const bottom = `${CX},${CY + HALF}`;
  const left = `${CX - HALF},${CY}`;
  const outline = `M${top} L${right} L${bottom} L${left} Z`;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Outline only — no fill, no glow */}
        <path d={outline} fill="none" stroke={c} strokeWidth={2} strokeLinejoin="miter" />
        {/* Name centred */}
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={c}
          fontSize={isCustom ? (centreText.length > 9 ? 11 : 16) : 17}
          fontWeight={700}
          style={{
            fontFamily: isCustom ? 'var(--font-handwritten)' : 'var(--font-serif)',
            letterSpacing: '0.04em',
          }}
        >
          {centreText}
        </text>
      </svg>
    </div>
  );
}

/* V9 — Diamond / lozenge (perfect square rotated 45°, fill from bottom) */
function _VizDiamond({
  idx,
  levels,
  moodWord,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: VizProps) {
  const c = levels[idx]?.color ?? '#C4A060';
  const centreText = moodWord || levels[idx]?.label;
  const isCustom = !!moodWord;
  const rat = levels.length > 1 ? idx / (levels.length - 1) : 0;
  // Perfect square diamond: W = H so all four arms are equal
  const S = 142; // SVG canvas size
  const CX = S / 2,
    CY = S / 2;
  const HALF = 56; // half-arm length — equal in all directions
  const top = `${CX},${CY - HALF}`;
  const right = `${CX + HALF},${CY}`;
  const bottom = `${CX},${CY + HALF}`;
  const left = `${CX - HALF},${CY}`;
  const outline = `M${top} L${right} L${bottom} L${left} Z`;
  // Fill rises from the bottom point
  const fillY = CY + HALF - rat * HALF * 2;
  const clipId = `dia-clip-${idx}`;
  const filterId = `dia-glow-${idx}`;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        width={S}
        height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ display: 'block', cursor: 'ew-resize', overflow: 'visible' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={outline} />
          </clipPath>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`dia-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.95" />
            <stop offset="100%" stopColor={c} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* Outline */}
        <path
          d={outline}
          fill="none"
          stroke={c}
          strokeWidth={1.5}
          strokeLinejoin="miter"
          opacity={rat > 0 ? 0.6 : 0.3}
        />
        {/* Fill */}
        {rat > 0 && (
          <rect
            x={CX - HALF - 1}
            y={fillY}
            width={HALF * 2 + 2}
            height={CY + HALF - fillY + 1}
            fill={`url(#dia-grad-${idx})`}
            clipPath={`url(#${clipId})`}
            filter={`url(#${filterId})`}
          />
        )}
        {/* Label */}
        <text
          x={CX}
          y={CY + 5}
          textAnchor="middle"
          fill={rat > 0.45 ? 'rgba(255,255,255,0.92)' : c}
          fontSize={isCustom ? (centreText.length > 9 ? 11 : 16) : 17}
          fontWeight={700}
          style={{
            fontFamily: isCustom ? 'var(--font-handwritten)' : 'var(--font-serif)',
            letterSpacing: '0.04em',
            transition: 'fill 0.3s',
          }}
        >
          {centreText}
        </text>
      </svg>
    </div>
  );
}

const CIRCLE_VIZS = [
  VizDiamondFull,
  VizBall,
  VizRing,
  VizArc,
  VizSegments,
  VizLiquid,
  VizBar,
  VizPetals,
] as const;
const _CIRCLE_VIZ_LABELS = [
  'Diamond',
  'Ball',
  'Ring',
  'Arc',
  'Dots',
  'Liquid',
  'Bar',
  'Petals',
] as const;

/* ─── Shared helpers ─────────────────────────────────────────── */
function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function getLast7Days(log: TrackEntry[], levels: { color: string }[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86400000;
    const entry = log.find((e) => {
      const t = new Date(e.ts).getTime();
      return t >= start && t < end;
    });
    return {
      dayLabel: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      isToday: i === 6,
      color: entry ? (levels[entry.idx]?.color ?? null) : null,
    };
  });
}

/* ─── Shared sub-components ──────────────────────────────────── */
function ReflectInput({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (note: string) => void;
}) {
  const [val, setVal] = useState('');
  const [lastSaved, setLastSaved] = useState('');
  const [confirming, setConfirming] = useState(false);

  const trimmed = val.trim();
  const alreadySaved = trimmed !== '' && trimmed === lastSaved;
  const canSave = trimmed !== '' && !alreadySaved;

  function submit() {
    if (!canSave) return;
    onAdd(trimmed);
    setLastSaved(trimmed);
    setVal('');
    setConfirming(true);
    setTimeout(() => setConfirming(false), 1600);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <textarea
        value={val}
        rows={1}
        onChange={(e) => {
          setVal(e.target.value);
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="placeholder:uppercase placeholder:tracking-[0.14em] placeholder:text-[11px] placeholder:text-[#7A5438] placeholder:opacity-80"
        style={{
          background: 'rgba(196,160,96,0.07)',
          border: '1px solid rgba(196,160,96,0.2)',
          borderRadius: 10,
          outline: 'none',
          fontFamily: 'var(--font-serif)',
          fontStyle: 'normal',
          fontSize: 13,
          color: '#2E1206',
          padding: '10px 14px',
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          lineHeight: 1.5,
          maxHeight: 120,
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: 24 }}>
        {(trimmed || confirming) && (
          <button
            type="button"
            onClick={submit}
            disabled={!canSave && !confirming}
            style={{
              padding: '3px 16px',
              borderRadius: 99,
              border: confirming
                ? '1px solid rgba(196,160,96,0.85)'
                : alreadySaved
                  ? '1px solid rgba(196,160,96,0.15)'
                  : '1px solid rgba(196,160,96,0.35)',
              background: confirming
                ? 'rgba(196,160,96,0.75)'
                : alreadySaved
                  ? 'transparent'
                  : 'rgba(196,160,96,0.1)',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: confirming
                ? 'rgba(92,48,24,0.95)'
                : alreadySaved
                  ? 'rgba(122,84,56,0.25)'
                  : 'rgba(122,84,56,0.8)',
              cursor: canSave ? 'pointer' : 'default',
              opacity: confirming ? 1 : 1,
              transition: 'background 1.4s ease, border 1.4s ease, color 1.4s ease',
            }}
          >
            {confirming ? '✓' : 'save'}
          </button>
        )}
      </div>
    </div>
  );
}

function WeekRow({ log, levels }: { log: TrackEntry[]; levels: { color: string }[] }) {
  const days = getLast7Days(log, levels);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
          opacity: 0.65,
          textAlign: 'center',
        }}
      >
        Week
      </span>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        {days.map(({ dayLabel, isToday, color }, i) => (
          <div
            key={i}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
          >
            <span
              style={{
                display: 'block',
                width: 26,
                height: 26,
                borderRadius: 6,
                background: color ? 'rgba(196,160,96,0.55)' : 'rgba(196,160,96,0.1)',
                border: isToday
                  ? `1.5px solid rgba(196,160,96,0.6)`
                  : `1px solid rgba(196,160,96,0.18)`,
                transition: 'background 0.3s',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 9,
                color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
                opacity: isToday ? 0.9 : 0.55,
              }}
            >
              {dayLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryList({
  log,
  levels,
}: {
  log: TrackEntry[];
  levels: { label: string; color: string }[];
}) {
  const [open, setOpen] = useState(false);
  if (log.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 0',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
            opacity: 0.65,
          }}
        >
          History
        </span>
        <span
          style={{
            fontSize: 9,
            color: '#C4A060',
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▾
        </span>
      </button>
      {open &&
        log.slice(0, 12).map((entry, i) => {
          const lv = levels[entry.idx];
          return (
            <div
              key={i}
              style={{
                border: '1px solid rgba(196,160,96,0.14)',
                borderRadius: 10,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: 1.5,
                    background: lv?.color,
                    flexShrink: 0,
                  }}
                />
                {entry.word ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: lv?.color,
                      flexShrink: 0,
                    }}
                  >
                    {entry.word}
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: lv?.color,
                      flexShrink: 0,
                    }}
                  >
                    {lv?.label}
                  </span>
                )}
                <span style={{ flex: 1 }} />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    color: '#C09878',
                    opacity: 0.6,
                  }}
                >
                  {timeAgo(entry.ts)}
                </span>
              </div>
              {entry.note ? (
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 13,
                    color: '#3A1E08',
                    opacity: 0.88,
                    lineHeight: 1.45,
                  }}
                >
                  {entry.note}
                </span>
              ) : null}
            </div>
          );
        })}
    </div>
  );
}

function FragmentField({
  fragment,
  editing,
  setEditing,
  saveFrag,
  inputRef,
  color,
}: {
  fragment: string;
  editing: boolean;
  setEditing: (v: boolean) => void;
  saveFrag: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  color: string;
}) {
  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={fragment}
        onChange={(e) => saveFrag(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setEditing(false);
        }}
        spellCheck={false}
        autoCorrect="off"
        style={{
          pointerEvents: 'all',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid ${color}55`,
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 12,
          color,
          textAlign: 'center',
          width: '88%',
          padding: '1px 0',
        }}
      />
    );
  }
  return (
    <span
      onClick={() => {
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      style={{
        pointerEvents: 'all',
        cursor: 'text',
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 12,
        color,
        opacity: fragment ? 0.7 : 0.3,
        textAlign: 'center',
      }}
    >
      {fragment || '…'}
    </span>
  );
}

/* ─── CircleTracker — cockpit strip + expanded ───────────────── */
function CircleTracker({
  circle,
  circleVariant,
  onVariantChange,
}: {
  circle: Circle;
  circleVariant: number;
  onVariantChange: (v: number) => void;
}) {
  const [idx, setIdx] = useState(circle.defaultIdx);
  const [fragment, setFragment] = useState('');
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [log, setLog] = useState<TrackEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [moodWord, setMoodWord] = useState('');
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef(idx);
  const inputRef = useRef<HTMLInputElement>(null);
  idxRef.current = idx;

  useEffect(() => {
    try {
      const v = localStorage.getItem(circle.lsIdxKey);
      if (v !== null) setIdx(Math.min(circle.levels.length - 1, Math.max(0, Number(v))));
      const f = localStorage.getItem(circle.lsFragKey);
      if (f) setFragment(f);
      const l = localStorage.getItem(circle.lsLogKey);
      if (l) setLog(JSON.parse(l));
    } catch {}
  }, [circle.lsIdxKey, circle.lsFragKey, circle.lsLogKey, circle.levels.length]);

  useEffect(() => {
    if (circle.id !== 'emotions') return;
    try {
      setMoodWord(localStorage.getItem('colourmap:mood-word') || '');
    } catch {}
    function onMoodChanged(e: Event) {
      setMoodWord((e as CustomEvent<string>).detail || '');
    }
    window.addEventListener('colourmap:mood-changed', onMoodChanged);
    return () => window.removeEventListener('colourmap:mood-changed', onMoodChanged);
  }, [circle.id]);

  function saveIdx(i: number) {
    const c = Math.max(0, Math.min(circle.levels.length - 1, i));
    setIdx(c);
    idxRef.current = c;
    try {
      localStorage.setItem(circle.lsIdxKey, String(c));
    } catch {}
    syncEvent('axis_snapshot', { circle: circle.id, idx: c });
  }

  function saveFrag(v: string) {
    setFragment(v);
    try {
      localStorage.setItem(circle.lsFragKey, v);
    } catch {}
    syncPref(circle.lsFragKey, v);
  }

  function addEntry(note: string) {
    const entry: TrackEntry = {
      ts: new Date().toISOString(),
      idx: idxRef.current,
      note,
      word: moodWord || undefined,
    };
    const next = [entry, ...log];
    setLog(next);
    try {
      localStorage.setItem(circle.lsLogKey, JSON.stringify(next.slice(0, 100)));
    } catch {}
    syncEvent('circle_note', { circle: circle.id, idx: idxRef.current, note });
  }

  const level = circle.levels[idx] ?? circle.levels[0];

  return (
    <div
      style={{
        border: `1px solid rgba(196,160,96,0.2)`,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          padding: '14px 16px',
          borderBottom: expanded ? `1px solid rgba(196,160,96,0.2)` : 'none',
          background: 'rgba(196,160,96,0.1)',
          cursor: 'pointer',
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
            color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
          }}
        >
          {circle.title}
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: '#C4A060',
              opacity: 0.4,
              fontSize: 11,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </span>
      </div>

      {/* ── Expanded ─────────────────────────────────────────── */}
      {expanded && (
        <div
          style={{ padding: '22px 16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          {/* Circle visual */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {(() => {
              const Viz = CIRCLE_VIZS[circleVariant] ?? VizBall;
              return (
                <Viz
                  idx={idx}
                  levels={circle.levels}
                  dragging={dragging}
                  moodWord={circle.id === 'emotions' ? moodWord : undefined}
                  onPointerDown={(e) => {
                    (e.currentTarget as Element).setPointerCapture(e.pointerId);
                    dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
                    setDragging(true);
                  }}
                  onPointerMove={(e) => {
                    if (!dragRef.current || e.buttons !== 1) return;
                    const steps = Math.round((e.clientX - dragRef.current.startX) / 22);
                    const next = Math.max(
                      0,
                      Math.min(circle.levels.length - 1, dragRef.current.startIdx + steps),
                    );
                    if (next !== idxRef.current) saveIdx(next);
                  }}
                  onPointerUp={() => {
                    dragRef.current = null;
                    setDragging(false);
                  }}
                />
              );
            })()}

            <FragmentField
              fragment={fragment}
              editing={editing}
              setEditing={setEditing}
              saveFrag={saveFrag}
              inputRef={inputRef}
              color={level.color}
            />
          </div>

          {/* Write */}
          {circle.id === 'emotions' && <MoodWord />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ReflectInput placeholder={circle.reflectPrompt} onAdd={addEntry} />
            {circle.id === 'emotions' && <EmotionMultiSelect />}
          </div>

          {/* Weekly tracker */}
          <WeekRow log={log} levels={circle.levels} />

          {/* History */}
          <HistoryList log={log} levels={circle.levels} />
        </div>
      )}
    </div>
  );
}

/* ─── Focus log input ────────────────────────────────────────── */
function FocusLogSection({
  label,
  placeholder,
  entries,
  onAdd,
}: {
  label: string;
  placeholder: string;
  entries: FocusEntry[];
  onAdd: (note: string) => void;
}) {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8A6A4A',
          opacity: 0.45,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      {entries.slice(-3).map((e, i) => (
        <span
          key={i}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'normal',
            fontSize: 13,
            color: '#2E1206',
            opacity: 0.88,
            lineHeight: 1.35,
            textAlign: 'center',
          }}
        >
          {e.note}
        </span>
      ))}
      <textarea
        value={val}
        rows={1}
        onChange={(e) => {
          setVal(e.target.value);
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (val.trim()) {
              onAdd(val.trim());
              setVal('');
            }
          }
        }}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="placeholder:uppercase placeholder:tracking-[0.14em] placeholder:text-[10px] placeholder:opacity-50"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid rgba(196,160,96,0.18)`,
          fontFamily: 'var(--font-serif)',
          fontStyle: 'normal',
          fontSize: 13,
          color: '#2E1206',
          padding: '2px 0',
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          lineHeight: 1.35,
          maxHeight: 72,
          textAlign: 'center',
        }}
      />
    </div>
  );
}

/* ─── Focus tracker ──────────────────────────────────────────── */
function _FocusTracker({ circleVariant }: { circleVariant: number }) {
  const [focusIdx, setFocusIdx] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [log, setLog] = useState<FocusEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const dragRef = useRef<{ startX: number; startIdx: number } | null>(null);
  const idxRef = useRef(focusIdx);
  idxRef.current = focusIdx;

  useEffect(() => {
    try {
      const v = localStorage.getItem('colourmap:focus-idx');
      if (v !== null) setFocusIdx(Math.min(7, Math.max(0, Number(v))));
      const l = localStorage.getItem('colourmap:focus-log');
      if (l) setLog(JSON.parse(l));
    } catch {}
  }, []);

  function saveIdx(i: number) {
    const c = Math.max(0, Math.min(7, i));
    setFocusIdx(c);
    idxRef.current = c;
    try {
      localStorage.setItem('colourmap:focus-idx', String(c));
    } catch {}
    syncEvent('axis_snapshot', { circle: 'focus', idx: c });
  }

  function addEntry(note: string, kind: 'reflect' | 'idea') {
    const entry: FocusEntry = {
      ts: new Date().toISOString(),
      focusIdx: idxRef.current,
      note,
      kind,
    };
    const next = [entry, ...log];
    setLog(next);
    try {
      localStorage.setItem('colourmap:focus-log', JSON.stringify(next.slice(0, 50)));
    } catch {}
    syncEvent('focus_note', { focusIdx: idxRef.current, note, kind });
  }

  const _level = FOCUS_LEVELS[focusIdx];
  const reflections = log.filter((e) => e.kind === 'reflect');
  const ideas = log.filter((e) => e.kind === 'idea');

  /* weekly tracker for focus */
  const focusWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86400000;
    const entry = log.find((e) => {
      const t = new Date(e.ts).getTime();
      return t >= start && t < end;
    });
    return {
      dayLabel: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      isToday: i === 6,
      color: entry ? (FOCUS_LEVELS[entry.focusIdx]?.color ?? null) : null,
    };
  });

  return (
    <div
      style={{
        border: `1px solid rgba(196,160,96,0.2)`,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          padding: '14px 16px',
          borderBottom: expanded ? `1px solid rgba(196,160,96,0.2)` : 'none',
          background: 'rgba(196,160,96,0.1)',
          cursor: 'pointer',
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
            color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
          }}
        >
          Focus
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: '#C4A060',
              opacity: 0.4,
              fontSize: 11,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div
          style={{ padding: '22px 16px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          {/* Focus visual */}
          {(() => {
            const Viz = CIRCLE_VIZS[circleVariant] ?? VizBall;
            return (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Viz
                  idx={focusIdx}
                  levels={FOCUS_LEVELS}
                  dragging={dragging}
                  onPointerDown={(e) => {
                    (e.currentTarget as Element).setPointerCapture(e.pointerId);
                    dragRef.current = { startX: e.clientX, startIdx: idxRef.current };
                    setDragging(true);
                  }}
                  onPointerMove={(e) => {
                    if (!dragRef.current || e.buttons !== 1) return;
                    const steps = Math.round((e.clientX - dragRef.current.startX) / 22);
                    const next = Math.max(0, Math.min(7, dragRef.current.startIdx + steps));
                    if (next !== idxRef.current) saveIdx(next);
                  }}
                  onPointerUp={() => {
                    dragRef.current = null;
                    setDragging(false);
                  }}
                />
              </div>
            );
          })()}

          <FocusLogSection
            label="Reflect"
            placeholder="What's your experience right now?"
            entries={reflections}
            onAdd={(note) => addEntry(note, 'reflect')}
          />
          <FocusLogSection
            label="Ideas to improve"
            placeholder="What could sharpen your focus?"
            entries={ideas}
            onAdd={(note) => addEntry(note, 'idea')}
          />

          {/* Weekly */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8A6A4A',
                opacity: 0.38,
                textAlign: 'center',
              }}
            >
              Week
            </span>
            <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
              {focusWeekDays.map(({ dayLabel, isToday, color }, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: color ?? 'rgba(196,160,96,0.1)',
                      border: isToday
                        ? `1.5px solid rgba(196,160,96,0.5)`
                        : `1px solid rgba(196,160,96,0.15)`,
                      transition: 'background 0.3s',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      color: '#8A6A4A',
                      opacity: isToday ? 0.7 : 0.3,
                    }}
                  >
                    {dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {log.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#8A6A4A',
                  opacity: 0.38,
                  textAlign: 'center',
                }}
              >
                History
              </span>
              {log.slice(0, 8).map((entry, i) => {
                const el = FOCUS_LEVELS[entry.focusIdx];
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 10,
                        color: '#C09878',
                        opacity: 0.7,
                        flexShrink: 0,
                        minWidth: 26,
                        textAlign: 'right',
                      }}
                    >
                      {timeAgo(entry.ts)}
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRadius: 1.5,
                        background: el?.color,
                        flexShrink: 0,
                        alignSelf: 'center',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: el?.color,
                        flexShrink: 0,
                      }}
                    >
                      {el?.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 12,
                        color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
                        opacity: 0.52,
                        lineHeight: 1.3,
                      }}
                    >
                      {entry.note}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Behaviour tracker ──────────────────────────────────────── */
const BEHAVIOUR_COLORS = [
  '#C4A060',
  '#90B880',
  '#80B0C8',
  '#C07898',
  '#C4B058',
  '#A098C0',
  '#B8A088',
  '#7A9E58',
];

type Behaviour = { id: string; name: string; colorIdx: number };
type BehaviourEntry = { ts: string; behaviourId: string; contexts: string[] };

const DEFAULT_BEHAVIOURS: Behaviour[] = [
  { id: 'bdef1', name: 'Exercise', colorIdx: 1 },
  { id: 'bdef3', name: 'Avoided calls', colorIdx: 4 },
  { id: 'bdef4', name: 'Journalled', colorIdx: 0 },
];

function BehaviourTracker() {
  const [expanded, setExpanded] = useState(false);
  const [behaviours, setBehaviours] = useState<Behaviour[]>([]);
  const [log, setLog] = useState<BehaviourEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const b = localStorage.getItem('colourmap:behaviours');
      setBehaviours(b ? JSON.parse(b) : DEFAULT_BEHAVIOURS);
      const l = localStorage.getItem('colourmap:behaviour-log');
      if (l) setLog(JSON.parse(l));
    } catch {}
  }, []);

  function saveBehaviours(next: Behaviour[]) {
    setBehaviours(next);
    try {
      localStorage.setItem('colourmap:behaviours', JSON.stringify(next));
    } catch {}
    syncPref('colourmap:behaviours', next);
  }

  function saveLog(next: BehaviourEntry[]) {
    setLog(next);
    try {
      localStorage.setItem('colourmap:behaviour-log', JSON.stringify(next.slice(0, 500)));
    } catch {}
  }

  function toggleLog(bId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const alreadyIdx = log.findIndex((e) => e.behaviourId === bId && new Date(e.ts) >= todayStart);
    if (alreadyIdx !== -1) {
      saveLog(log.filter((_, i) => i !== alreadyIdx));
    } else {
      const name = behaviours.find((b) => b.id === bId)?.name ?? bId;
      saveLog([{ ts: new Date().toISOString(), behaviourId: bId, contexts: [] }, ...log]);
      syncEvent('behavior_log', { behaviorId: bId, behaviorName: name });
    }
  }

  function addBehaviour() {
    const name = newName.trim();
    if (!name) return;
    const next: Behaviour[] = [
      ...behaviours,
      { id: `b${Date.now()}`, name, colorIdx: behaviours.length % BEHAVIOUR_COLORS.length },
    ];
    saveBehaviours(next);
    setNewName('');
    setAdding(false);
  }

  function isLoggedToday(bId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return log.some((e) => e.behaviourId === bId && new Date(e.ts) >= start);
  }

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
  });

  function weekDots(bId: string) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      const entries = log.filter(
        (e) =>
          e.behaviourId === bId &&
          new Date(e.ts).getTime() >= start &&
          new Date(e.ts).getTime() < end,
      );
      return {
        isToday: i === 6,
        logged: entries.length > 0,
        stress: entries.some((e) => e.contexts.includes('stress')),
        weekend: entries.some((e) => e.contexts.includes('weekend')),
      };
    });
  }

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
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '14px 16px',
          borderBottom: expanded ? '1px solid rgba(196,160,96,0.2)' : 'none',
          background: 'rgba(196,160,96,0.1)',
          cursor: 'pointer',
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
            color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
          }}
        >
          Behaviours
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: '#C4A060',
              opacity: 0.4,
              fontSize: 11,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </span>
      </div>

      {expanded && (
        <div
          style={{ padding: '18px 16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* Day-label header row */}
          {behaviours.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 26 }}>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 5 }}>
                {dayLabels.map((l, i) => (
                  <span
                    key={i}
                    style={{
                      width: 22,
                      textAlign: 'center',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      color: '#8A6A4A',
                      opacity: i === 6 ? 0.65 : 0.25,
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Behaviour rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {behaviours.map((b) => {
              const c = BEHAVIOUR_COLORS[b.colorIdx % BEHAVIOUR_COLORS.length];
              const dots = weekDots(b.id);
              const done = isLoggedToday(b.id);
              return (
                <div
                  key={b.id}
                  onClick={() => toggleLog(b.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '7px 9px',
                    borderRadius: 10,
                    background: done ? 'rgba(196,160,96,0.09)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${done ? 'rgba(196,160,96,0.3)' : 'rgba(196,160,96,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Colour dot */}
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: c,
                      flexShrink: 0,
                      boxShadow: `0 0 7px ${c}99`,
                      transition: 'box-shadow 0.2s',
                    }}
                  />
                  {/* Name */}
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: done ? c : '#8A6A4A',
                      flex: 1,
                      letterSpacing: '0.05em',
                      opacity: done ? 1 : 0.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    {b.name}
                  </span>
                  {/* Checkmark */}
                  {done && (
                    <span style={{ fontSize: 10, color: c, opacity: 0.7, flexShrink: 0 }}>✓</span>
                  )}
                  {/* Week grid */}
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {dots.map((dot, i) => (
                      <span
                        key={i}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: dot.logged ? `${c}AA` : 'rgba(196,160,96,0.07)',
                          border: dot.isToday
                            ? `1.5px solid ${c}55`
                            : '1px solid rgba(196,160,96,0.1)',
                          transition: 'background 0.25s',
                          fontSize: 8,
                          flexShrink: 0,
                        }}
                      >
                        {dot.logged && dot.stress && <span style={{ opacity: 0.75 }}>⚡</span>}
                        {dot.logged && !dot.stress && dot.weekend && (
                          <span style={{ opacity: 0.6 }}>☀</span>
                        )}
                      </span>
                    ))}
                  </div>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveBehaviours(behaviours.filter((bv) => bv.id !== b.id));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--palette-panel-muted, rgba(196,160,96,0.2))',
                      fontSize: 13,
                      lineHeight: 1,
                      padding: '0 2px',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add behaviour */}
          {adding ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={addRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addBehaviour();
                  if (e.key === 'Escape') {
                    setAdding(false);
                    setNewName('');
                  }
                }}
                placeholder="Name this behaviour…"
                spellCheck={false}
                autoCorrect="off"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(196,160,96,0.25)',
                  borderRadius: 8,
                  padding: '7px 10px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  color: 'var(--palette-panel-text, rgba(196,160,96,0.88))',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={addBehaviour}
                style={{
                  background: 'rgba(196,160,96,0.15)',
                  border: '1px solid rgba(196,160,96,0.3)',
                  borderRadius: 8,
                  padding: '0 12px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#C4A060',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                ADD
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setTimeout(() => addRef.current?.focus(), 0);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0 4px',
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: 'var(--palette-panel-muted, rgba(196,160,96,0.55))',
                letterSpacing: '0.06em',
                alignSelf: 'flex-start',
              }}
            >
              + add behaviour
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Export ─────────────────────────────────────────────────── */
export default function FeelingCircles2() {
  const [circleVariant, setCircleVariant] = useState(0);

  useEffect(() => {
    try {
      const v = localStorage.getItem('colourmap:circle-variant');
      if (v !== null) setCircleVariant(Math.min(CIRCLE_VIZS.length - 1, Math.max(0, Number(v))));
    } catch {}
  }, []);

  function switchCircleVariant(v: number) {
    setCircleVariant(v);
    try {
      localStorage.setItem('colourmap:circle-variant', String(v));
    } catch {}
    syncPref('colourmap:circle-variant', v);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0 32px' }}>
      {CIRCLES.map((c) => (
        <CircleTracker
          key={c.id}
          circle={c}
          circleVariant={circleVariant}
          onVariantChange={switchCircleVariant}
        />
      ))}
      <BehaviourTracker />
    </div>
  );
}
