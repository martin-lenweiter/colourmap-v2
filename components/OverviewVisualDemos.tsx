'use client';

/* ═══════════════════════════════════════════════════════════
   OVERVIEW VISUAL DEMOS — 5 mockups for the river / flow view.
   Each demo uses the same fake dataset (categories named +
   their flow/stuck trajectories over 12 weeks) so the user
   can compare the visual languages side-by-side.
   Purely visual, no interaction beyond hover / tooltip, no
   persistence. Meant to help pick the direction.
   ═══════════════════════════════════════════════════════════ */

interface DemoCategory {
  name: string;
  color: string;
  /** 12 values in [-1, 1] — negative = stuck, positive = flowing */
  trajectory: number[];
}

// Shared synthetic dataset — 6 categories across 12 weeks
const DEMO: DemoCategory[] = [
  {
    name: 'Music',
    color: '#D4805A',
    trajectory: [0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.7, 0.8, 0.9, 0.8, 0.9, 1.0],
  },
  {
    name: 'Shoulder',
    color: '#C4A060',
    trajectory: [-0.8, -0.7, -0.5, -0.3, -0.2, 0.0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7],
  },
  {
    name: 'Organisation',
    color: '#9B6BA0',
    trajectory: [-0.3, -0.4, -0.2, -0.1, 0.0, -0.2, -0.4, -0.5, -0.3, -0.1, 0.0, 0.1],
  },
  {
    name: 'Social',
    color: '#7AAA58',
    trajectory: [0.5, 0.4, 0.6, 0.7, 0.5, 0.6, 0.8, 0.9, 0.7, 0.6, 0.8, 0.9],
  },
  {
    name: 'Mission',
    color: '#6890B0',
    trajectory: [0.3, 0.5, 0.7, 0.4, 0.2, -0.1, -0.2, 0.0, 0.3, 0.5, 0.7, 0.8],
  },
  {
    name: 'Reading',
    color: '#A07A50',
    trajectory: [0.0, 0.1, -0.2, -0.4, -0.6, -0.7, -0.8, -0.7, -0.8, -0.9, -0.8, -0.7],
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ─── Demo 1: Radiating rivers from centre. Each category is a curve
       from the centre outward. Colour saturation follows the trajectory
       value at each point — bright where flowing, muted where stuck. */
function RadiatingRivers() {
  const W = 320;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2;
  const n = DEMO.length;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Radiating rivers — colour = flow/stuck, width = activity</title>
      {/* Centre anchor */}
      <circle cx={cx} cy={cy} r={8} fill="#C4A060" opacity={0.7} />
      {/* Each category as a gentle curve from centre outward */}
      {DEMO.map((c, i) => {
        const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const length = 105;
        // 12 points along the river, from centre to tip
        const points = c.trajectory.map((v, t) => {
          const r = (t / 11) * length + 10;
          const wobble = Math.sin(t * 0.8) * 4;
          const px = cx + Math.cos(angle) * r + Math.cos(angle + Math.PI / 2) * wobble;
          const py = cy + Math.sin(angle) * r + Math.sin(angle + Math.PI / 2) * wobble;
          return { x: px, y: py, v };
        });
        // Draw as segmented path so colour can change per segment
        return (
          <g key={c.name}>
            {points.slice(1).map((p, k) => {
              const prev = points[k];
              const avgV = (p.v + prev.v) / 2;
              // Flow → full colour; stuck → greyed toward sepia
              const opacity = lerp(0.25, 1, (avgV + 1) / 2);
              const width = lerp(1.5, 4.5, (Math.abs(avgV) + 0.3) / 1.3);
              return (
                <line
                  key={k}
                  x1={prev.x}
                  y1={prev.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={c.color}
                  strokeWidth={width}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                />
              );
            })}
            {/* Tip label */}
            <text
              x={points[points.length - 1].x}
              y={points[points.length - 1].y}
              fill="#5C3018"
              fontSize={10}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="middle"
              dy={Math.sin(angle) > 0 ? 14 : -6}
            >
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Demo 2: Horizontal trajectory lines. Each category is a line
       left-to-right (time), height up = flowing, height down = stuck. */
function HorizontalTrajectories() {
  const W = 320;
  const H = 260;
  const padX = 28;
  const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const mid = padY + innerH / 2;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Horizontal trajectories — up = flowing, down = stuck</title>
      {/* Middle baseline (zone equilibrium) */}
      <line x1={padX} y1={mid} x2={W - padX} y2={mid} stroke="#8A6A4A30" strokeDasharray="3 4" />
      {DEMO.map((c) => {
        const points = c.trajectory.map((v, t) => {
          const x = padX + (t / 11) * innerW;
          const y = mid - v * (innerH / 2 - 8);
          return { x, y };
        });
        const d = points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' ');
        const last = points[points.length - 1];
        return (
          <g key={c.name}>
            <path d={d} fill="none" stroke={c.color} strokeWidth={2} strokeLinecap="round" />
            <circle cx={last.x} cy={last.y} r={3.5} fill={c.color} />
            <text
              x={last.x + 5}
              y={last.y + 3}
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
      {/* Axis labels */}
      <text
        x={padX}
        y={padY + 8}
        fill="#8A6A4A80"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        flowing
      </text>
      <text
        x={padX}
        y={H - padY + 2}
        fill="#8A6A4A80"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        stuck
      </text>
    </svg>
  );
}

/* ─── Demo 3: Mountain silhouette. Each category is stacked area.
       Height reflects the flow magnitude. Feels like terrain. */
function MountainTerrain() {
  const W = 320;
  const H = 260;
  const padX = 14;
  const padY = 18;
  const innerW = W - padX * 2;
  const baseY = H - padY;
  const maxH = H - padY * 2;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Mountain terrain — each area's height tracks its flow</title>
      {DEMO.map((c, i) => {
        // Map trajectory (-1..1) to a height baseline (small = stuck, tall = flowing)
        const points = c.trajectory.map((v, t) => {
          const x = padX + (t / 11) * innerW;
          const heightNorm = (v + 1) / 2; // 0..1
          const y = baseY - heightNorm * maxH * 0.7 - 6;
          return { x, y };
        });
        const pathD = [
          `M ${padX} ${baseY}`,
          ...points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
          `L ${W - padX} ${baseY}`,
          'Z',
        ].join(' ');
        return (
          <path
            key={c.name}
            d={pathD}
            fill={c.color}
            fillOpacity={0.18}
            stroke={c.color}
            strokeWidth={1.2}
            strokeOpacity={0.7}
            style={{ mixBlendMode: 'multiply' }}
          />
        );
      })}
      {/* Legend of category dots at top */}
      {DEMO.map((c, i) => {
        const x = padX + 14 + i * 48;
        return (
          <g key={c.name}>
            <circle cx={x} cy={padY + 2} r={3} fill={c.color} />
            <text
              x={x + 6}
              y={padY + 5}
              fill="#5C3018"
              fontSize={9}
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

/* ─── Demo 4: River with pebbles. A single braided river (you) branching
       into tributaries. Pebbles along each tributary show events. */
function BraidedRiver() {
  const W = 320;
  const H = 260;
  const sourceY = H / 2;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Braided river — tributaries branch from the main flow</title>
      {/* Main river — curving down the middle */}
      <path
        d={`M 10 ${sourceY - 4} Q ${W / 2} ${sourceY + 12} ${W - 10} ${sourceY - 2}`}
        fill="none"
        stroke="#C4A060"
        strokeWidth={10}
        strokeOpacity={0.35}
        strokeLinecap="round"
      />
      <path
        d={`M 10 ${sourceY - 4} Q ${W / 2} ${sourceY + 12} ${W - 10} ${sourceY - 2}`}
        fill="none"
        stroke="#C4A060"
        strokeWidth={3}
        strokeOpacity={0.7}
        strokeLinecap="round"
      />
      {/* Tributaries — each category flows off from a point on the main river */}
      {DEMO.map((c, i) => {
        const t = 0.15 + (i / DEMO.length) * 0.7;
        const ax = lerp(10, W - 10, t);
        const ay = lerp(sourceY - 4, sourceY - 2, t) + Math.sin(t * Math.PI) * 12;
        const goesUp = i % 2 === 0;
        const bx = ax + (goesUp ? 6 : -6);
        const by = goesUp ? ay - 70 : ay + 70;
        const midX = (ax + bx) / 2 + (goesUp ? 14 : -14);
        const midY = (ay + by) / 2;
        const avgFlow = c.trajectory.reduce((a, b) => a + b, 0) / c.trajectory.length;
        const opacity = lerp(0.25, 1, (avgFlow + 1) / 2);
        const width = lerp(1, 3.5, (Math.abs(avgFlow) + 0.3) / 1.3);
        return (
          <g key={c.name}>
            <path
              d={`M ${ax} ${ay} Q ${midX} ${midY} ${bx} ${by}`}
              fill="none"
              stroke={c.color}
              strokeWidth={width}
              strokeOpacity={opacity}
              strokeLinecap="round"
            />
            {/* Pebbles — events along the tributary */}
            {[0.35, 0.65].map((s, k) => {
              const pt = lerp(ay, by, s);
              const px = lerp(ax, bx, s) + (goesUp ? 8 : -8);
              return <circle key={k} cx={px} cy={pt} r={2} fill={c.color} opacity={0.9} />;
            })}
            <text
              x={bx}
              y={by + (goesUp ? -4 : 12)}
              fill="#5C3018"
              fontSize={10}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="middle"
            >
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Demo 5: Dot stream — each category shown as a row of 12 dots
       (12 weeks), colour intensity tracking flow. Simplest, most honest. */
function DotStream() {
  const W = 320;
  const H = 260;
  const rowHeight = 34;
  const nameCol = 74;
  const dotsStart = nameCol + 8;
  const dotSize = 14;
  const gap = 5;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Dot stream — one row per category, each dot is a week</title>
      {DEMO.map((c, i) => {
        const y = 28 + i * rowHeight;
        return (
          <g key={c.name}>
            <text
              x={nameCol}
              y={y + dotSize / 2 + 1}
              fill="#5C3018"
              fontSize={11}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="end"
            >
              {c.name}
            </text>
            {c.trajectory.map((v, t) => {
              const x = dotsStart + t * (dotSize + gap);
              const opacity = lerp(0.2, 1, (v + 1) / 2);
              const size = lerp(dotSize * 0.5, dotSize, (Math.abs(v) + 0.4) / 1.4);
              return (
                <rect
                  key={t}
                  x={x}
                  y={y + (dotSize - size) / 2}
                  width={size}
                  height={size}
                  rx={2}
                  fill={c.color}
                  fillOpacity={opacity}
                />
              );
            })}
          </g>
        );
      })}
      {/* Time axis hint */}
      <text
        x={dotsStart}
        y={14}
        fill="#8A6A4A80"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        12 weeks ago
      </text>
      <text
        x={dotsStart + 11 * (dotSize + gap) + dotSize}
        y={14}
        fill="#8A6A4A80"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        textAnchor="end"
      >
        now
      </text>
    </svg>
  );
}

interface Demo {
  id: string;
  title: string;
  description: string;
  render: () => React.ReactElement;
}

const DEMOS: Demo[] = [
  {
    id: 'radiating',
    title: '1. Radiating rivers',
    description: 'Rivers flow outward from you at the centre. Colour saturation = flow vs stuck.',
    render: RadiatingRivers,
  },
  {
    id: 'trajectories',
    title: '2. Horizontal trajectories',
    description: 'Left-to-right = time. Up = flowing, down = stuck. Reads like a heart-rate line.',
    render: HorizontalTrajectories,
  },
  {
    id: 'mountain',
    title: '3. Mountain terrain',
    description:
      'Each category is a layer of terrain. Tall = flowing, flat = stuck. Stacks into a landscape.',
    render: MountainTerrain,
  },
  {
    id: 'braided',
    title: '4. Braided river',
    description:
      'Main river (you) with tributaries (categories) branching off. Pebbles along each = events.',
    render: BraidedRiver,
  },
  {
    id: 'dots',
    title: '5. Dot stream',
    description:
      'One row per category. Twelve dots = twelve weeks. Simplest, most honest, lowest cognitive load.',
    render: DotStream,
  },
];

export default function OverviewVisualDemos() {
  return (
    <div
      className="space-y-4 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <p
          className="text-center font-semibold uppercase"
          style={{ color: '#C4A060', fontSize: '12px', letterSpacing: '0.22em' }}
        >
          River visualisations — design options
        </p>
        <p
          className="text-center italic"
          style={{
            color: '#8A6A4A',
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            opacity: 0.8,
          }}
        >
          five ways of rendering flow &amp; stuck over time — same synthetic data, same six
          categories
        </p>
      </div>

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
    </div>
  );
}
