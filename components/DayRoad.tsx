'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  appendEntry,
  forceAppendEntry,
  getTodayEntries,
  type TimelineEntry,
} from '@/lib/day-timeline';
import { syncEvent, syncPref } from '@/lib/sync';

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
    color: '#C09878',
    def: 3,
    levels: ['Depleted', 'Drained', 'Heavy', 'Tense', 'Warming', 'Good', 'Active', 'Energized'],
  },
  {
    short: 'F',
    label: 'Focus',
    max: 7,
    lsKey: 'colourmap:focus-idx',
    color: '#8BA870',
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
const QUAD_DEG = 78;
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
              strokeLinecap="round"
              opacity={0.1}
            />
            {norm > 0.01 && (
              <path
                d={arc(QUAD_START[ai], activeEnd, r)}
                fill="none"
                stroke={ax.color}
                strokeWidth={RING_SW}
                strokeLinecap="round"
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
const SLIDER_H = 140;

function AxisSlider({
  ai,
  value,
  onChange,
}: {
  ai: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<SVGSVGElement>(null);
  const ax = AXES[ai];
  const PAD = 6;
  const usableH = SLIDER_H - PAD * 2;

  function valueFromEvent(clientY: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return Math.round((1 - relY) * ax.max);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: ax.color,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {ax.short}
      </span>

      <svg
        ref={trackRef}
        width={24}
        height={SLIDER_H}
        style={{ display: 'block', overflow: 'visible', cursor: 'ns-resize', touchAction: 'none' }}
        onPointerDown={(e) => {
          (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
          onChange(valueFromEvent(e.clientY));
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          onChange(valueFromEvent(e.clientY));
        }}
      >
        <defs>
          <filter id={`asg-${ai}`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ax.levels.map((_, li) => {
          const y = PAD + (1 - li / ax.max) * usableH;
          const isCur = li === value;
          const isBelow = li < value;
          const r = isCur ? 5 : isBelow ? 2.8 : 2.0;
          const opacity = isCur ? 1 : isBelow ? 0.45 : 0.1;
          return (
            <circle
              key={li}
              cx={12}
              cy={y}
              r={r}
              fill={ax.color}
              opacity={opacity}
              filter={isCur ? `url(#asg-${ai})` : undefined}
              style={{ transition: 'all 0.2s' }}
            />
          );
        })}
      </svg>

      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ax.color,
          fontFamily: 'var(--font-serif)',
          textAlign: 'center',
          maxWidth: 36,
          lineHeight: 1.2,
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

/* ── Example generator ──────────────────────────────────────────── */
function generateExampleEntries(): TimelineEntry[] {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const t0 = midnight.getTime();
  const DAY = 24 * 60 * 60 * 1000;
  const N = 16;
  // Start from morning lows
  const vals = AXES.map((a) => Math.floor(a.max * 0.2 + Math.random() * a.max * 0.2));
  const entries: TimelineEntry[] = [];
  for (let i = 0; i < N; i++) {
    const t = t0 + (i / (N - 1)) * DAY;
    entries.push({ t, i: [...vals] });
    for (let ai = 0; ai < AXES.length; ai++) {
      const a = AXES[ai];
      // Sinusoidal arc: peaks in midday, low at edges
      const arc = Math.sin(((i + 1) / N) * Math.PI) * a.max * 0.45;
      const noise = (Math.random() - 0.45) * a.max * 0.35;
      const target = a.max * 0.3 + arc + noise;
      vals[ai] = Math.max(0, Math.min(a.max, Math.round(vals[ai] * 0.55 + target * 0.45)));
    }
  }
  return entries;
}

/* ── What do you feel? ──────────────────────────────────────────── */
const LS_FEEL = 'colourmap:road-feel';

function FeelSection({ live, onLog }: { live: number[]; onLog: () => void }) {
  const [val, setVal] = useState('');
  const [entries, setEntries] = useState<string[]>([]);
  const [justLogged, setJustLogged] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_FEEL);
      if (s) setEntries(JSON.parse(s));
    } catch {}
  }, []);

  function submit() {
    const t = val.trim();
    forceAppendEntry(live);
    onLog();
    const next = t ? [t, ...entries].slice(0, 8) : entries;
    setEntries(next);
    setVal('');
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 900);
    try {
      if (t) localStorage.setItem(LS_FEEL, JSON.stringify(next));
    } catch {}
    if (t) {
      syncEvent('feel_note', { note: t });
      syncPref(LS_FEEL, next);
    }
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }

  return (
    <div
      style={{
        border: `1px solid rgba(196,160,96,${justLogged ? '0.45' : '0.22'})`,
        borderRadius: 28,
        padding: '10px 18px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: justLogged ? 'rgba(196,160,96,0.1)' : 'rgba(196,160,96,0.04)',
        transition: 'all 0.2s',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: justLogged ? 'rgba(196,160,96,0.8)' : 'rgba(196,160,96,0.5)',
          textAlign: 'center',
        }}
      >
        {justLogged ? '✓ logged' : 'what do you feel'}
      </span>

      <textarea
        ref={inputRef}
        value={val}
        rows={1}
        onChange={(e) => {
          setVal(e.target.value);
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="name it…"
        spellCheck={false}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(196,160,96,0.15)',
          outline: 'none',
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          color: '#C09878',
          padding: '2px 0 6px',
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          lineHeight: 1.4,
          maxHeight: 80,
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      />

      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entries.map((e, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                color: '#C09878',
                opacity: 1 - i * 0.1,
                textAlign: 'center',
                lineHeight: 1.35,
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── What do you need? ──────────────────────────────────────────── */
const LS_NEEDS = 'colourmap:road-needs';

function NeedsSection() {
  const [val, setVal] = useState('');
  const [entries, setEntries] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_NEEDS);
      if (s) setEntries(JSON.parse(s));
    } catch {}
  }, []);

  function submit() {
    const t = val.trim();
    if (!t) return;
    const next = [t, ...entries].slice(0, 8);
    setEntries(next);
    setVal('');
    try {
      localStorage.setItem(LS_NEEDS, JSON.stringify(next));
    } catch {}
    syncEvent('needs_note', { note: t });
    syncPref(LS_NEEDS, next);
  }

  return (
    <div
      style={{
        padding: '4px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Pill box */}
      <div
        style={{
          border: '1px solid rgba(196,160,96,0.22)',
          borderRadius: 28,
          padding: '10px 18px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'rgba(196,160,96,0.04)',
        }}
      >
        {/* Label */}
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(196,160,96,0.5)',
            textAlign: 'center',
          }}
        >
          What do you need?
        </span>

        {/* Input */}
        <textarea
          ref={inputRef}
          value={val}
          rows={1}
          onChange={(e) => {
            setVal(e.target.value);
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="rest · movement · connection · silence…"
          spellCheck={false}
          className="placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[9px] placeholder:opacity-40"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(196,160,96,0.15)',
            outline: 'none',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: '#C09878',
            padding: '2px 0 6px',
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            lineHeight: 1.4,
            maxHeight: 80,
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        />

        {/* Recent entries */}
        {entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {entries.map((e, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  color: '#C09878',
                  opacity: 1 - i * 0.1,
                  textAlign: 'center',
                  lineHeight: 1.35,
                }}
              >
                {e}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
  const [tab, setTab] = useState<'today' | 'example'>('today');
  const [exampleEntries, setExampleEntries] = useState<TimelineEntry[]>(() =>
    generateExampleEntries(),
  );

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

  /* Graph data depends on active tab */
  const isExample = tab === 'example';
  const graphEntries = isExample ? exampleEntries : all;
  const tMin = isExample ? exampleEntries[0].t : Math.min(midnight, all[0].t);
  const tEnd = isExample ? exampleEntries[exampleEntries.length - 1].t : now;
  const tRange = tEnd - tMin || 1;
  const exRingIndices = (() => {
    const mid = exampleEntries[Math.floor(exampleEntries.length / 2)];
    return mid?.i ?? live;
  })();

  function toPoints(ai: number) {
    return graphEntries.map((e) => ({
      x: PAD.left + ((e.t - tMin) / tRange) * PW,
      y: PAD.top + (1 - (e.i[ai] ?? 0) / AXES[ai].max) * PH,
    }));
  }

  const timeLabels: { x: number; label: string }[] = [];
  const hourSet = isExample ? [6, 9, 12, 15, 18, 21] : [6, 9, 12, 15, 18, 21];
  for (const h of hourSet) {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    const ts = d.getTime();
    if (ts >= tMin && ts <= tEnd) {
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
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '92svh',
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
        <div style={{ padding: '2px 20px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(196,160,96,0.45)',
              flex: 1,
            }}
          >
            Day Road
          </span>
          {/* Tab switcher */}
          {(['today', 'example'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                border: `1px solid rgba(196,160,96,${tab === t ? '0.55' : '0.2'})`,
                background: tab === t ? 'rgba(196,160,96,0.14)' : 'transparent',
                color: tab === t ? '#C4A060' : 'rgba(196,160,96,0.4)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {t}
            </button>
          ))}
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

        {/* Today: 2 sliders | ring (centered) | 2 sliders + log */}
        {tab === 'today' && (
          <div
            style={{
              padding: '0 16px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
              }}
            >
              {/* Left sliders: E, M */}
              <div style={{ display: 'flex', gap: 16 }}>
                {[0, 1].map((ai) => (
                  <AxisSlider
                    key={ai}
                    ai={ai}
                    value={live[ai]}
                    onChange={(v) => setAxisValue(ai, v)}
                  />
                ))}
              </div>
              {/* Ring centered */}
              <div style={{ flexShrink: 0 }}>
                <MiniRing indices={live} />
              </div>
              {/* Right sliders: B, F */}
              <div style={{ display: 'flex', gap: 16 }}>
                {[2, 3].map((ai) => (
                  <AxisSlider
                    key={ai}
                    ai={ai}
                    value={live[ai]}
                    onChange={(v) => setAxisValue(ai, v)}
                  />
                ))}
              </div>
            </div>
            {/* Feel input */}
            <div style={{ paddingTop: 10, width: '100%' }}>
              <FeelSection
                live={live}
                onLog={() => {
                  setEntries(getTodayEntries());
                }}
              />
            </div>
          </div>
        )}

        {/* Example: mini ring preview + shuffle */}
        {tab === 'example' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px 14px',
            }}
          >
            <MiniRing indices={exRingIndices} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(196,160,96,0.35)',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                simulated
                <br />
                full day
              </p>
              <button
                type="button"
                onClick={() => setExampleEntries(generateExampleEntries())}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: '1px solid rgba(196,160,96,0.35)',
                  background: 'transparent',
                  color: 'rgba(196,160,96,0.65)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                ↺ shuffle
              </button>
            </div>
          </div>
        )}

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
            {!isExample && (
              <line
                x1={PAD.left + PW}
                y1={PAD.top}
                x2={PAD.left + PW}
                y2={PAD.top + PH}
                stroke="rgba(196,160,96,0.18)"
                strokeWidth={0.5}
                strokeDasharray="2,3"
              />
            )}
            {AXES.map((ax, ai) => {
              const pts = toPoints(ai);
              return (
                <g key={ai}>
                  <path
                    d={smoothPath(pts)}
                    fill="none"
                    stroke={ax.color}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.8}
                    filter={`url(#dg${ai})`}
                  />
                  <circle
                    cx={pts[pts.length - 1].x}
                    cy={pts[pts.length - 1].y}
                    r={3}
                    fill={ax.color}
                    opacity={0.95}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* What do you need? */}
        <NeedsSection />
      </div>
    </div>
  );
}
