'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { appendEntry, getTodayEntries, type TimelineEntry } from '@/lib/day-timeline';

/* ── Axis config ────────────────────────────────────────────────── */
const AXES = [
  {
    short: 'E',
    label: 'Emotions',
    max: 9,
    lsKey: 'colourmap:process-idx',
    color: '#C4A060',
    def: 4,
    levels: [
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
    ],
  },
  {
    short: 'M',
    label: 'Mind',
    max: 5,
    lsKey: 'colourmap:presence-idx',
    color: '#B898D0',
    def: 3,
    levels: ['Absent', 'Scattered', 'Confused', 'Drifting', 'Present', 'Flowing'],
  },
  {
    short: 'B',
    label: 'Body',
    max: 7,
    lsKey: 'colourmap:body-idx',
    color: '#78C0A8',
    def: 3,
    levels: ['Depleted', 'Drained', 'Heavy', 'Tense', 'Warming', 'Good', 'Active', 'Energized'],
  },
  {
    short: 'F',
    label: 'Focus',
    max: 7,
    lsKey: 'colourmap:focus-idx',
    color: '#88D098',
    def: 3,
    levels: [
      'Scattered',
      'Distracted',
      'Restless',
      'Warming',
      'Present',
      'Locked',
      'Flowing',
      'Zone',
    ],
  },
];

/* ── Mini ring ──────────────────────────────────────────────────── */
const RS = 160;
const RCX = 80;
const RCY = 80;
const RING_R = [64, 52, 40, 28];
const RING_SW = 10;
const QUAD_DEG = 84;
const QUAD_START = [-90, 0, 90, 180];

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}
function ptOn(deg: number, r: number) {
  return { x: RCX + Math.cos(deg2rad(deg)) * r, y: RCY + Math.sin(deg2rad(deg)) * r };
}
function arc(s: number, e: number, r: number): string {
  const a = ptOn(s, r);
  const b = ptOn(e, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`;
}

function MiniRing({ indices }: { indices: number[] }) {
  return (
    <svg width={RS} height={RS} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="rg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="rbg">
          <stop offset="0%" stopColor="rgba(196,160,96,0.07)" />
          <stop offset="100%" stopColor="rgba(196,160,96,0)" />
        </radialGradient>
      </defs>
      <circle cx={RCX} cy={RCY} r={72} fill="url(#rbg)" />
      {AXES.map((ax, ai) => {
        const r = RING_R[ai];
        const norm = indices[ai] / ax.max;
        const trackEnd = QUAD_START[ai] + QUAD_DEG;
        const activeEnd = QUAD_START[ai] + norm * QUAD_DEG;
        return (
          <g key={ai}>
            <path
              d={arc(QUAD_START[ai], trackEnd, r)}
              fill="none"
              stroke={ax.color}
              strokeWidth={RING_SW}
              strokeLinecap="butt"
              opacity={0.1}
            />
            {norm > 0.01 && (
              <path
                d={arc(QUAD_START[ai], activeEnd, r)}
                fill="none"
                stroke={ax.color}
                strokeWidth={RING_SW}
                strokeLinecap="butt"
                opacity={0.88}
                filter="url(#rg)"
              />
            )}
          </g>
        );
      })}
      <text
        x={RCX}
        y={RCY - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(196,160,96,0.7)"
        fontSize={11}
        fontWeight={800}
        letterSpacing="0.04em"
        fontFamily="var(--font-serif)"
      >
        {Math.round((indices.reduce((s, v, i) => s + v / AXES[i].max, 0) / AXES.length) * 100)}
      </text>
      <text
        x={RCX}
        y={RCY + 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(196,160,96,0.35)"
        fontSize={6}
        fontWeight={700}
        letterSpacing="0.18em"
        fontFamily="var(--font-serif)"
      >
        BALANCE
      </text>
    </svg>
  );
}

/* ── Vertical axis slider ───────────────────────────────────────── */
const SLIDER_H = 190;

function AxisSlider({
  ai,
  value,
  onChange,
}: {
  ai: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ax = AXES[ai];

  function valueFromEvent(clientY: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return Math.round((1 - relY) * ax.max);
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 14,
        top: 48,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* Top label (best state) */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: ax.color,
          opacity: 0.8,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {ax.levels[ax.max]}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onChange(valueFromEvent(e.clientY));
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          onChange(valueFromEvent(e.clientY));
        }}
        style={{
          width: 28,
          height: SLIDER_H,
          position: 'relative',
          cursor: 'ns-resize',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Track line */}
        <div
          style={{
            width: 2,
            height: '100%',
            borderRadius: 2,
            background: `linear-gradient(to bottom, ${ax.color}CC, ${ax.color}22)`,
          }}
        />
        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            top: (1 - value / ax.max) * SLIDER_H - 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: ax.color,
            boxShadow: `0 0 10px ${ax.color}88`,
            border: '2px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }}
        />
        {/* Level ticks */}
        {ax.levels.map((_, li) => (
          <div
            key={li}
            style={{
              position: 'absolute',
              top: (1 - li / ax.max) * SLIDER_H - 0.5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: li === value ? 10 : 5,
              height: 1,
              background: li === value ? ax.color : `${ax.color}44`,
            }}
          />
        ))}
      </div>

      {/* Bottom label (lowest state) */}
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: ax.color,
          opacity: 0.4,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {ax.levels[0]}
      </span>

      {/* Current level name */}
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: ax.color,
          fontFamily: 'var(--font-serif)',
          marginTop: 2,
        }}
      >
        {ax.levels[value]}
      </span>
    </div>
  );
}

/* ── Smooth SVG path ────────────────────────────────────────────── */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cp = (p0.x + p1.x) / 2;
    d += ` C ${cp} ${p0.y} ${cp} ${p1.y} ${p1.x} ${p1.y}`;
  }
  return d;
}

/* ── Graph constants ────────────────────────────────────────────── */
const GW = 340;
const GH = 150;
const PAD = { top: 18, right: 18, bottom: 28, left: 18 };
const PW = GW - PAD.left - PAD.right;
const PH = GH - PAD.top - PAD.bottom;

/* ── Main component ─────────────────────────────────────────────── */
export default function DayRoad({ onClose }: { onClose?: () => void }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [live, setLive] = useState(() => AXES.map((a) => a.def));
  const [activeAxis, setActiveAxis] = useState<number | null>(null);

  const loadFromStorage = useCallback(() => {
    setEntries(getTodayEntries());
    setLive(
      AXES.map((a) => {
        try {
          const v = localStorage.getItem(a.lsKey);
          return v !== null ? Math.min(a.max, Math.max(0, Number(v))) : a.def;
        } catch {
          return a.def;
        }
      }),
    );
  }, []);

  useEffect(() => {
    loadFromStorage();
    window.addEventListener('storage', loadFromStorage);
    return () => window.removeEventListener('storage', loadFromStorage);
  }, [loadFromStorage]);

  function setAxisValue(ai: number, ci: number) {
    setLive((prev) => {
      const next = [...prev];
      next[ai] = ci;
      try {
        localStorage.setItem(AXES[ai].lsKey, String(ci));
      } catch {}
      appendEntry(next);
      return next;
    });
  }

  /* Build effective entry list */
  const now = Date.now();
  const midnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const base: TimelineEntry[] = entries.length > 0 ? entries : [{ t: midnight, i: live }];
  const all: TimelineEntry[] = [...base, { t: now, i: live }];
  const tMin = Math.min(midnight, all[0].t);
  const tRange = now - tMin || 1;

  function toPoints(ai: number) {
    return all.map((e) => ({
      x: PAD.left + ((e.t - tMin) / tRange) * PW,
      y: PAD.top + (1 - (e.i[ai] ?? 0) / AXES[ai].max) * PH,
    }));
  }

  const timeLabels: { x: number; label: string }[] = [];
  for (const h of [6, 9, 12, 15, 18, 21]) {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    const ts = d.getTime();
    if (ts >= tMin && ts <= now) {
      const x = PAD.left + ((ts - tMin) / tRange) * PW;
      timeLabels.push({ x, label: h < 12 ? `${h}am` : h === 12 ? '12' : `${h - 12}pm` });
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          background: '#0c0806',
          borderTop: '1px solid rgba(196,160,96,0.2)',
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',
          fontFamily: 'var(--font-serif)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div
            style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(196,160,96,0.25)' }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: '2px 20px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(196,160,96,0.45)',
            }}
          >
            Day Road
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(196,160,96,0.4)',
              fontSize: 16,
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>

        {/* EMBF axis selector boxes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '0 20px 14px' }}>
          {AXES.map((ax, ai) => {
            const on = activeAxis === ai;
            return (
              <button
                key={ai}
                type="button"
                onClick={() => setActiveAxis(on ? null : ai)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: 10,
                  border: on ? `1px solid ${ax.color}` : '1px solid rgba(196,160,96,0.2)',
                  background: on ? `${ax.color}18` : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'all 0.15s',
                  boxShadow: on ? `0 0 10px ${ax.color}33` : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: on ? ax.color : 'rgba(196,160,96,0.4)',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {ax.short}
                </span>
                <span
                  style={{
                    fontSize: 7.5,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: on ? ax.color : 'rgba(196,160,96,0.28)',
                  }}
                >
                  {ax.levels[live[ai]]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mandala + optional slider */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 12 }}>
            <MiniRing indices={live} />
          </div>
          {activeAxis !== null && (
            <AxisSlider
              ai={activeAxis}
              value={live[activeAxis]}
              onChange={(v) => setAxisValue(activeAxis, v)}
            />
          )}
        </div>

        {/* Horizon */}
        <div
          style={{
            height: 1,
            background:
              'linear-gradient(to right, transparent, rgba(196,160,96,0.3) 20%, rgba(196,160,96,0.3) 80%, transparent)',
            margin: '0 16px',
          }}
        />

        {/* Graph */}
        <div style={{ padding: '10px 8px 4px' }}>
          <svg
            viewBox={`0 0 ${GW} ${GH}`}
            width="100%"
            style={{ display: 'block', overflow: 'visible' }}
          >
            <defs>
              {AXES.map((_, i) => (
                <filter key={i} id={`dg${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>
            {[0.25, 0.5, 0.75, 1].map((v) => (
              <line
                key={v}
                x1={PAD.left}
                y1={PAD.top + (1 - v) * PH}
                x2={PAD.left + PW}
                y2={PAD.top + (1 - v) * PH}
                stroke="rgba(196,160,96,0.055)"
                strokeWidth={0.5}
              />
            ))}
            {timeLabels.map(({ x, label }) => (
              <text
                key={label}
                x={x}
                y={GH - 5}
                textAnchor="middle"
                fill="rgba(196,160,96,0.28)"
                fontSize={7}
                fontFamily="var(--font-serif)"
              >
                {label}
              </text>
            ))}
            <line
              x1={PAD.left + PW}
              y1={PAD.top}
              x2={PAD.left + PW}
              y2={PAD.top + PH}
              stroke="rgba(196,160,96,0.18)"
              strokeWidth={0.5}
              strokeDasharray="2,3"
            />
            {AXES.map((ax, ai) => {
              const pts = toPoints(ai);
              const isActive = activeAxis === ai;
              return (
                <g key={ai}>
                  <path
                    d={smoothPath(pts)}
                    fill="none"
                    stroke={ax.color}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isActive ? 1 : activeAxis !== null ? 0.3 : 0.8}
                    filter={`url(#dg${ai})`}
                  />
                  <circle
                    cx={pts[pts.length - 1].x}
                    cy={pts[pts.length - 1].y}
                    r={isActive ? 4 : 3}
                    fill={ax.color}
                    opacity={isActive ? 1 : activeAxis !== null ? 0.3 : 0.95}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            padding: '2px 16px 20px',
            flexWrap: 'wrap',
          }}
        >
          {AXES.map((a) => (
            <span
              key={a.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: a.color,
                opacity: 0.65,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 2,
                  background: a.color,
                  display: 'inline-block',
                  borderRadius: 1,
                }}
              />
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
