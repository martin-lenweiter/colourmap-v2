'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   TRANSFORMATION ROADMAP — 6 design options.
   Each shows the same data: life categories with their
   current state (flowing / stuck / quiet) and recent history.
   The goal is a dense, clear, graphical "vue d'ensemble"
   of your evolution across all life branches.
   ═══════════════════════════════════════════════════════════ */

type State = 'flowing' | 'stuck' | 'quiet';

interface DemoCategory {
  name: string;
  color: string;
  current: State;
  /** 8 weeks of history — most recent last */
  history: State[];
}

const DEMO: DemoCategory[] = [
  {
    name: 'Body',
    color: '#D4805A',
    current: 'flowing',
    history: ['stuck', 'stuck', 'stuck', 'quiet', 'quiet', 'flowing', 'flowing', 'flowing'],
  },
  {
    name: 'Music',
    color: '#C4A060',
    current: 'flowing',
    history: ['flowing', 'flowing', 'quiet', 'flowing', 'flowing', 'flowing', 'flowing', 'flowing'],
  },
  {
    name: 'Organisation',
    color: '#9B6BA0',
    current: 'stuck',
    history: ['quiet', 'stuck', 'stuck', 'quiet', 'stuck', 'stuck', 'stuck', 'stuck'],
  },
  {
    name: 'Social',
    color: '#7AAA58',
    current: 'quiet',
    history: ['flowing', 'flowing', 'quiet', 'quiet', 'quiet', 'quiet', 'quiet', 'quiet'],
  },
  {
    name: 'Mission',
    color: '#6890B0',
    current: 'flowing',
    history: ['stuck', 'quiet', 'quiet', 'flowing', 'stuck', 'quiet', 'flowing', 'flowing'],
  },
  {
    name: 'Reading',
    color: '#A07A50',
    current: 'stuck',
    history: ['flowing', 'quiet', 'stuck', 'stuck', 'stuck', 'stuck', 'stuck', 'stuck'],
  },
];

function stateColor(state: State, catColor: string): string {
  if (state === 'flowing') return catColor;
  if (state === 'stuck') return '#C07060';
  return '#C4A06040';
}

function stateOpacity(state: State): number {
  if (state === 'flowing') return 1;
  if (state === 'stuck') return 0.7;
  return 0.25;
}

/* ─── Demo 1: Signal List ───────────────────────────────────
   The simplest — a vertical list. Each category: coloured dot
   (green/red/grey for state), name, and a tiny word label.
   Dense, scannable, zero decoration. */
function SignalList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 4px' }}>
      {DEMO.map((c) => (
        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 24 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: stateColor(c.current, c.color),
              opacity: stateOpacity(c.current),
              flexShrink: 0,
            }}
          />
          <span
            style={{
              flex: 1,
              color: '#5C3018',
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {c.name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color:
                c.current === 'flowing' ? '#6A9A50' : c.current === 'stuck' ? '#A05A40' : '#8A6A4A',
              opacity: c.current === 'quiet' ? 0.5 : 0.85,
              textTransform: 'uppercase',
            }}
          >
            {c.current}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Demo 2: Dot Matrix ────────────────────────────────────
   Each category row has 8 dots (one per week). The dot colour
   shows the state at that time. Current week is larger.
   You see both the current state and the trajectory. */
function DotMatrix() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 4px' }}>
      {DEMO.map((c) => (
        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 72,
              flexShrink: 0,
              color: '#5C3018',
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {c.name}
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {c.history.map((s, i) => {
              const isLast = i === c.history.length - 1;
              return (
                <span
                  key={i}
                  style={{
                    width: isLast ? 10 : 7,
                    height: isLast ? 10 : 7,
                    borderRadius: '50%',
                    background: stateColor(s, c.color),
                    opacity: stateOpacity(s),
                    transition: 'all 0.2s',
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 4,
          paddingLeft: 80,
          fontSize: '10px',
          fontFamily: 'var(--font-serif)',
          color: '#8A6A4A',
          opacity: 0.6,
        }}
      >
        <span>← 8w ago</span>
        <span style={{ marginLeft: 'auto' }}>now →</span>
      </div>
    </div>
  );
}

/* ─── Demo 3: Stacked Bars ──────────────────────────────────
   Horizontal bars grouped by state. Flowing categories on top
   (green tones), stuck in middle (warm), quiet at bottom (grey).
   Bar width = number of flowing weeks out of 8.
   Instant read on where momentum lives. */
function StackedBars() {
  const groups: { label: string; state: State; items: DemoCategory[] }[] = [
    { label: 'Flowing', state: 'flowing', items: DEMO.filter((c) => c.current === 'flowing') },
    { label: 'Stuck', state: 'stuck', items: DEMO.filter((c) => c.current === 'stuck') },
    { label: 'Quiet', state: 'quiet', items: DEMO.filter((c) => c.current === 'quiet') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 4px' }}>
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <div key={g.label}>
              <p
                style={{
                  color:
                    g.state === 'flowing' ? '#6A9A50' : g.state === 'stuck' ? '#A05A40' : '#8A6A4A',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                  opacity: g.state === 'quiet' ? 0.6 : 0.85,
                }}
              >
                {g.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {g.items.map((c) => {
                  const flowingWeeks = c.history.filter((s) => s === 'flowing').length;
                  const pct = Math.max(12, (flowingWeeks / 8) * 100);
                  return (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 60,
                          flexShrink: 0,
                          fontFamily: 'var(--font-serif)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#5C3018',
                        }}
                      >
                        {c.name}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          background: '#C4A06015',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: 4,
                            background: c.color,
                            opacity: g.state === 'quiet' ? 0.3 : 0.75,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '10px',
                          color: '#8A6A4A',
                          opacity: 0.7,
                          width: 24,
                          textAlign: 'right',
                        }}
                      >
                        {flowingWeeks}/8
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ),
      )}
    </div>
  );
}

/* ─── Demo 4: Pulse Grid ────────────────────────────────────
   A compact grid. Rows = categories, columns = weeks.
   Each cell is a small rectangle coloured by state.
   Like a GitHub contribution graph for your life. */
function PulseGrid() {
  const weeks = ['8w', '7w', '6w', '5w', '4w', '3w', '2w', '1w'];

  return (
    <div style={{ padding: '8px 4px' }}>
      {/* Week labels */}
      <div
        style={{
          display: 'flex',
          gap: 3,
          paddingLeft: 72,
          marginBottom: 4,
        }}
      >
        {weeks.map((w) => (
          <span
            key={w}
            style={{
              width: 22,
              textAlign: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: '9px',
              color: '#8A6A4A',
              opacity: 0.5,
            }}
          >
            {w}
          </span>
        ))}
      </div>
      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {DEMO.map((c) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 66,
                flexShrink: 0,
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#5C3018',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.name}
            </span>
            <div style={{ display: 'flex', gap: 3 }}>
              {c.history.map((s, i) => (
                <span
                  key={i}
                  style={{
                    width: 22,
                    height: 14,
                    borderRadius: 3,
                    background: s === 'flowing' ? c.color : s === 'stuck' ? '#C07060' : '#C4A06020',
                    opacity: s === 'quiet' ? 0.4 : s === 'stuck' ? 0.65 : 0.85,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 8,
          paddingLeft: 72,
          fontSize: '10px',
          fontFamily: 'var(--font-serif)',
          color: '#8A6A4A',
          opacity: 0.65,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: 2, background: '#7AAA58', opacity: 0.85 }}
          />
          flowing
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: 2, background: '#C07060', opacity: 0.65 }}
          />
          stuck
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span
            style={{ width: 8, height: 8, borderRadius: 2, background: '#C4A060', opacity: 0.25 }}
          />
          quiet
        </span>
      </div>
    </div>
  );
}

/* ─── Demo 5: Orbit Map ─────────────────────────────────────
   Categories as circles orbiting a centre. Distance from centre
   = how flowing (close = flowing, far = stuck, faded = quiet).
   A spatial "life constellation" snapshot. */
function OrbitMap() {
  const W = 280;
  const H = 220;
  const cx = W / 2;
  const cy = H / 2;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Orbit map — distance from centre shows flow state</title>
      {/* Orbit rings */}
      {[35, 65, 95].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#C4A060"
          strokeWidth={0.5}
          strokeOpacity={0.2}
          strokeDasharray="3 3"
        />
      ))}
      {/* Centre */}
      <circle cx={cx} cy={cy} r={4} fill="#C4A060" opacity={0.5} />
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#8A6A4A"
        fontSize={8}
        fontFamily="var(--font-serif)"
        opacity={0.5}
      >
        you
      </text>
      {/* Categories */}
      {DEMO.map((c, i) => {
        const angle = -Math.PI / 2 + (i / DEMO.length) * Math.PI * 2;
        const dist = c.current === 'flowing' ? 35 : c.current === 'stuck' ? 75 : 95;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const radius = c.current === 'flowing' ? 14 : c.current === 'stuck' ? 11 : 8;
        const op = c.current === 'quiet' ? 0.3 : c.current === 'stuck' ? 0.6 : 0.85;

        return (
          <g key={c.name}>
            <circle cx={x} cy={y} r={radius} fill={c.color} opacity={op} />
            <text
              x={x}
              y={y + radius + 10}
              textAnchor="middle"
              fill="#5C3018"
              fontSize={10}
              fontFamily="var(--font-serif)"
              fontWeight={600}
            >
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Demo 6: River Bands ───────────────────────────────────
   Horizontal flowing bands — one per category. Each band's
   height pulses with the state (thick = flowing, thin = stuck,
   dotted = quiet). Like a river system seen from above.
   Combines trajectory + current state in one glance. */
function RiverBands() {
  const W = 280;
  const H = 200;
  const bandH = H / DEMO.length;
  const steps = 8;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>River bands — width shows flow, colour shows category</title>
      {DEMO.map((c, row) => {
        const baseY = row * bandH + bandH / 2;
        const points: string[] = [];
        const pointsBottom: string[] = [];

        for (let i = 0; i < steps; i++) {
          const x = (i / (steps - 1)) * (W - 80) + 40;
          const s = c.history[i];
          const halfH = s === 'flowing' ? 8 : s === 'stuck' ? 3 : 1;
          points.push(`${x},${baseY - halfH}`);
          pointsBottom.unshift(`${x},${baseY + halfH}`);
        }

        const pathD = `M ${points.join(' L ')} L ${pointsBottom.join(' L ')} Z`;

        return (
          <g key={c.name}>
            <path d={pathD} fill={c.color} opacity={c.current === 'quiet' ? 0.2 : 0.6} />
            {/* Centre line */}
            <line
              x1={40}
              y1={baseY}
              x2={W - 40}
              y2={baseY}
              stroke={c.color}
              strokeWidth={0.5}
              strokeOpacity={0.3}
            />
            {/* Label left */}
            <text
              x={4}
              y={baseY + 4}
              fill="#5C3018"
              fontSize={10}
              fontFamily="var(--font-serif)"
              fontWeight={600}
            >
              {c.name}
            </text>
          </g>
        );
      })}
      {/* Time axis */}
      <text
        x={40}
        y={H - 2}
        fill="#8A6A4A"
        fontSize={8}
        fontFamily="var(--font-serif)"
        opacity={0.5}
      >
        8w ago
      </text>
      <text
        x={W - 40}
        y={H - 2}
        fill="#8A6A4A"
        fontSize={8}
        fontFamily="var(--font-serif)"
        opacity={0.5}
        textAnchor="end"
      >
        now
      </text>
    </svg>
  );
}

/* ─── Registry ──────────────────────────────────────────── */

const DEMOS = [
  {
    id: 'signal-list',
    title: '1. Signal List',
    description:
      'Pure list. One coloured dot per category — green flowing, warm stuck, faded quiet. The densest read.',
    render: SignalList,
  },
  {
    id: 'dot-matrix',
    title: '2. Dot Matrix',
    description:
      'One row per category, one dot per week. See the trajectory at a glance — patterns emerge from the dots.',
    render: DotMatrix,
  },
  {
    id: 'stacked-bars',
    title: '3. Stacked Bars',
    description:
      'Categories grouped by current state. Bar length = how many flowing weeks. Where is the momentum?',
    render: StackedBars,
  },
  {
    id: 'pulse-grid',
    title: '4. Pulse Grid',
    description:
      'GitHub-style heatmap for your life. Rows are branches, columns are weeks. Colour = state.',
    render: PulseGrid,
  },
  {
    id: 'orbit-map',
    title: '5. Orbit Map',
    description:
      'Spatial snapshot. Flowing categories orbit close to centre, stuck ones drift out, quiet fades. Your life as a constellation.',
    render: OrbitMap,
  },
  {
    id: 'river-bands',
    title: '6. River Bands',
    description:
      'Each category is a river flowing left to right through time. Width = flowing, thin = stuck, thread = quiet.',
    render: RiverBands,
  },
];

export default function TransformationRoadmapDemos() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('colourmap:roadmap-demos-open') !== 'false';
  });

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:roadmap-demos-open', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer flex-col items-center gap-1"
      >
        <div className="flex items-center gap-2">
          <p
            className="text-center font-semibold uppercase"
            style={{ color: '#C4A060', fontSize: '12px', letterSpacing: '0.22em' }}
          >
            Transformation roadmap — design options
          </p>
          <span
            className="text-sm transition-transform duration-200"
            style={{
              color: '#C4A06080',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▾
          </span>
        </div>
        <p
          className="text-center italic"
          style={{
            color: '#8A6A4A',
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            opacity: 0.8,
          }}
        >
          six ways to see your evolution — same categories, same states
        </p>
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {DEMOS.map((demo) => (
            <div
              key={demo.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: '#C4A06030',
                background: 'rgba(245,236,220,0.55)',
              }}
            >
              <p
                className="mb-1"
                style={{
                  color: '#5C3018',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                }}
              >
                {demo.title}
              </p>
              <p
                className="mb-3 italic"
                style={{
                  color: '#8A6A4A',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  opacity: 0.85,
                  lineHeight: 1.4,
                }}
              >
                {demo.description}
              </p>
              <div
                className="rounded-xl"
                style={{
                  background: '#F5ECDC',
                  border: '1px solid #8A6A4A15',
                  padding: '6px',
                }}
              >
                <demo.render />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
