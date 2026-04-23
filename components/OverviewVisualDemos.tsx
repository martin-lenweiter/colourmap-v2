'use client';

import { useState } from 'react';

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

/* ─── Demo 6: Heatmap grid. Categories × weeks. Colour intensity = flow.
       Dense, diagnostic, reads like a GitHub contribution graph. */
function HeatmapGrid() {
  const W = 320;
  const H = 260;
  const nameCol = 72;
  const cellStart = nameCol + 8;
  const rowH = 26;
  const cellW = 19;
  const gap = 1;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Heatmap — dense, diagnostic; every cell a week × category</title>
      {DEMO.map((c, i) => {
        const y = 24 + i * rowH;
        return (
          <g key={c.name}>
            <text
              x={nameCol}
              y={y + rowH / 2 + 3}
              fill="#5C3018"
              fontSize={11}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="end"
            >
              {c.name}
            </text>
            {c.trajectory.map((v, t) => {
              const x = cellStart + t * (cellW + gap);
              const opacity = lerp(0.08, 1, (v + 1) / 2);
              return (
                <rect
                  key={t}
                  x={x}
                  y={y}
                  width={cellW}
                  height={rowH - 4}
                  rx={1}
                  fill={c.color}
                  fillOpacity={opacity}
                />
              );
            })}
          </g>
        );
      })}
      <text
        x={cellStart}
        y={14}
        fill="#8A6A4A80"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        12 weeks ago
      </text>
      <text
        x={cellStart + 11 * (cellW + gap) + cellW}
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

/* ─── Demo 7: Constellation. Dots in space, brightness = current flow.
       Organic, spatially groupable. No time dimension here — shows
       the present moment's shape. */
function Constellation() {
  const W = 320;
  const H = 260;
  // Hand-placed positions so it feels composed, not random
  const positions: Record<string, { x: number; y: number }> = {
    Music: { x: 90, y: 80 },
    Shoulder: { x: 170, y: 120 },
    Organisation: { x: 230, y: 70 },
    Social: { x: 60, y: 170 },
    Mission: { x: 180, y: 200 },
    Reading: { x: 260, y: 190 },
  };

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Constellation — brightness = flow, proximity suggests theme</title>
      {/* Subtle connection lines for related pairs */}
      {[
        ['Music', 'Social'],
        ['Shoulder', 'Mission'],
        ['Organisation', 'Reading'],
      ].map(([a, b]) => {
        const pa = positions[a];
        const pb = positions[b];
        return (
          <line
            key={`${a}-${b}`}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke="#8A6A4A30"
            strokeWidth={0.6}
            strokeDasharray="2 3"
          />
        );
      })}
      {DEMO.map((c) => {
        const p = positions[c.name];
        if (!p) return null;
        const latest = c.trajectory[c.trajectory.length - 1];
        const opacity = lerp(0.3, 1, (latest + 1) / 2);
        const r = lerp(5, 11, (latest + 1) / 2);
        return (
          <g key={c.name}>
            {/* Glow */}
            <circle cx={p.x} cy={p.y} r={r + 5} fill={c.color} opacity={opacity * 0.15} />
            <circle cx={p.x} cy={p.y} r={r} fill={c.color} opacity={opacity} />
            <text
              x={p.x}
              y={p.y + r + 14}
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

/* ─── Demo 8: Concentric orbits. Time as rings (innermost = now,
       outermost = 12 weeks ago). Each category is one orbit, dots at
       each week marking its state. Radial time. */
function ConcentricOrbits() {
  const W = 320;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2;
  const minR = 20;
  const maxR = 105;
  const n = DEMO.length;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Concentric orbits — inner = now, outer = 12 weeks ago</title>
      {/* Centre */}
      <circle cx={cx} cy={cy} r={4} fill="#C4A060" opacity={0.7} />
      <text
        x={cx}
        y={cy + 18}
        fill="#8A6A4A"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        textAnchor="middle"
      >
        now
      </text>
      {DEMO.map((c, i) => {
        const r = minR + (i / (n - 1)) * (maxR - minR);
        // Faint orbit line
        return (
          <g key={c.name}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={c.color}
              strokeOpacity={0.15}
              strokeWidth={0.8}
            />
            {c.trajectory.map((v, t) => {
              // Week 11 (most recent) sits at angle 0 (right), older rotates counter-clockwise
              const angle = -((11 - t) / 11) * Math.PI * 1.6 - Math.PI * 0.3;
              const px = cx + Math.cos(angle) * r;
              const py = cy + Math.sin(angle) * r;
              const opacity = lerp(0.25, 1, (v + 1) / 2);
              const size = lerp(1.8, 4, (Math.abs(v) + 0.3) / 1.3);
              return (
                <circle key={t} cx={px} cy={py} r={size} fill={c.color} fillOpacity={opacity} />
              );
            })}
            {/* Label at the end of orbit */}
            <text
              x={cx + r + 6}
              y={cy + 3}
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

/* ─── Demo 9: Garden. Each category is a plant. Bloom = flowing,
       small leaf = stuck. Living metaphor, allows seasonal rhythm. */
function Garden() {
  const W = 320;
  const H = 260;
  const groundY = H - 30;
  const slotW = W / DEMO.length;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Garden — each plant's bloom tracks its flow</title>
      {/* Ground line */}
      <line
        x1={10}
        y1={groundY}
        x2={W - 10}
        y2={groundY}
        stroke="#8A6A4A40"
        strokeDasharray="2 3"
      />
      {DEMO.map((c, i) => {
        const latest = c.trajectory[c.trajectory.length - 1];
        const avg = c.trajectory.reduce((a, b) => a + b, 0) / c.trajectory.length;
        const stemHeight = lerp(30, 130, (latest + 1) / 2);
        const bloomSize = lerp(4, 14, (latest + 1) / 2);
        const stemX = slotW * (i + 0.5);
        const stemTopY = groundY - stemHeight;
        const stemOpacity = lerp(0.35, 1, (avg + 1) / 2);

        return (
          <g key={c.name}>
            {/* Stem */}
            <line
              x1={stemX}
              y1={groundY}
              x2={stemX}
              y2={stemTopY}
              stroke="#7AAA58"
              strokeOpacity={stemOpacity}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Leaves at mid-stem */}
            <ellipse
              cx={stemX - 5}
              cy={groundY - stemHeight * 0.5}
              rx={5}
              ry={2.5}
              fill="#7AAA58"
              fillOpacity={stemOpacity * 0.7}
              transform={`rotate(-25 ${stemX - 5} ${groundY - stemHeight * 0.5})`}
            />
            <ellipse
              cx={stemX + 5}
              cy={groundY - stemHeight * 0.7}
              rx={5}
              ry={2.5}
              fill="#7AAA58"
              fillOpacity={stemOpacity * 0.7}
              transform={`rotate(25 ${stemX + 5} ${groundY - stemHeight * 0.7})`}
            />
            {/* Bloom */}
            <circle
              cx={stemX}
              cy={stemTopY}
              r={bloomSize}
              fill={c.color}
              fillOpacity={lerp(0.35, 1, (latest + 1) / 2)}
            />
            {/* Label */}
            <text
              x={stemX}
              y={groundY + 14}
              fill="#5C3018"
              fontSize={9}
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

/* ─── Demo 10: Sparklines compact list. Each category gets a tiny
       inline line graph next to its name. List-view friendly. */
function SparklinesList() {
  const W = 320;
  const H = 260;
  const rowH = 34;
  const labelW = 78;
  const sparkStart = labelW + 10;
  const sparkW = W - sparkStart - 14;
  const sparkH = 22;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Sparklines list — one tiny line per category</title>
      {DEMO.map((c, i) => {
        const y = 20 + i * rowH;
        const mid = y + sparkH / 2;
        const points = c.trajectory.map((v, t) => {
          const x = sparkStart + (t / 11) * sparkW;
          const py = mid - v * (sparkH / 2 - 2);
          return { x, y: py };
        });
        const d = points
          .map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' ');
        const last = points[points.length - 1];
        return (
          <g key={c.name}>
            <text
              x={labelW}
              y={mid + 4}
              fill="#5C3018"
              fontSize={11}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="end"
            >
              {c.name}
            </text>
            {/* Faint baseline */}
            <line
              x1={sparkStart}
              y1={mid}
              x2={sparkStart + sparkW}
              y2={mid}
              stroke="#8A6A4A20"
              strokeDasharray="2 3"
            />
            <path d={d} fill="none" stroke={c.color} strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={last.x} cy={last.y} r={2.5} fill={c.color} />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Demo 11: Tide pools. Each category is a horizontal pool.
       Water level = current flow. Watermark lines show past levels. */
function TidePools() {
  const W = 320;
  const H = 260;
  const poolW = W - 110;
  const poolH = 30;
  const poolX = 95;
  const rowGap = 8;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Tide pools — water level = flow; watermark lines = history</title>
      {DEMO.map((c, i) => {
        const y = 14 + i * (poolH + rowGap);
        const latest = c.trajectory[c.trajectory.length - 1];
        const waterLevel = lerp(4, poolH - 4, (latest + 1) / 2);
        const waterY = y + poolH - waterLevel;

        return (
          <g key={c.name}>
            {/* Label */}
            <text
              x={90}
              y={y + poolH / 2 + 4}
              fill="#5C3018"
              fontSize={11}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="end"
            >
              {c.name}
            </text>
            {/* Pool outline */}
            <rect
              x={poolX}
              y={y}
              width={poolW}
              height={poolH}
              fill="none"
              stroke="#8A6A4A40"
              strokeWidth={0.8}
              rx={2}
            />
            {/* Water fill */}
            <rect
              x={poolX + 1}
              y={waterY}
              width={poolW - 2}
              height={y + poolH - waterY - 1}
              fill={c.color}
              fillOpacity={lerp(0.25, 0.7, (latest + 1) / 2)}
              rx={1}
            />
            {/* Watermark lines — show past 4 levels */}
            {[2, 5, 8, 11].map((t) => {
              const v = c.trajectory[t];
              const wl = lerp(4, poolH - 4, (v + 1) / 2);
              const markY = y + poolH - wl;
              return (
                <line
                  key={t}
                  x1={poolX + 2 + (t / 11) * (poolW - 4)}
                  y1={markY - 1}
                  x2={poolX + 8 + (t / 11) * (poolW - 4)}
                  y2={markY - 1}
                  stroke={c.color}
                  strokeWidth={1}
                  strokeOpacity={0.6}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Demo 12: Wind rose. Radial petals, one per category.
       Length = current flow magnitude, colour = direction. */
function WindRose() {
  const W = 320;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2 + 8;
  const n = DEMO.length;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Wind rose — petal length = flow magnitude, colour = category</title>
      {/* Reference rings */}
      {[30, 60, 90].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#8A6A4A20" strokeWidth={0.6} />
      ))}
      {DEMO.map((c, i) => {
        const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const latest = c.trajectory[c.trajectory.length - 1];
        const avg = c.trajectory.reduce((a, b) => a + b, 0) / c.trajectory.length;
        // Petal grows with positive flow, shrinks with stuck
        const petalLen = lerp(20, 100, (latest + 1) / 2);
        const petalWidth = 22;
        const tipX = cx + Math.cos(angle) * petalLen;
        const tipY = cy + Math.sin(angle) * petalLen;
        const side1X = cx + Math.cos(angle - Math.PI / 2) * petalWidth * 0.5;
        const side1Y = cy + Math.sin(angle - Math.PI / 2) * petalWidth * 0.5;
        const side2X = cx + Math.cos(angle + Math.PI / 2) * petalWidth * 0.5;
        const side2Y = cy + Math.sin(angle + Math.PI / 2) * petalWidth * 0.5;
        const opacity = lerp(0.3, 0.85, (avg + 1) / 2);
        // Label position just beyond tip
        const labelX = cx + Math.cos(angle) * (petalLen + 14);
        const labelY = cy + Math.sin(angle) * (petalLen + 14);
        return (
          <g key={c.name}>
            <path
              d={`M ${side1X} ${side1Y} Q ${tipX} ${tipY} ${side2X} ${side2Y} Z`}
              fill={c.color}
              fillOpacity={opacity}
            />
            <text
              x={labelX}
              y={labelY + 3}
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
      {/* Centre */}
      <circle cx={cx} cy={cy} r={3} fill="#C4A060" opacity={0.8} />
    </svg>
  );
}

/* ─── Demo 13: Tree rings. A single disc showing concentric growth rings.
       Each ring is one week; ring thickness = aggregate flow that week. */
function TreeRings() {
  const W = 320;
  const H = 260;
  const cx = W / 2;
  const cy = H / 2;
  const innermost = 8;
  const step = 6;

  // Aggregate flow per week across all categories → ring thickness
  const weeklyMean = Array.from({ length: 12 }, (_, t) => {
    const sum = DEMO.reduce((acc, c) => acc + c.trajectory[t], 0);
    return sum / DEMO.length;
  });

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Tree rings — concentric weeks; thicker/brighter ring = flowing that week</title>
      {weeklyMean.map((v, t) => {
        const innerR = innermost + t * step;
        const ringThickness = lerp(0.5, step - 0.5, (v + 1) / 2);
        const outerR = innerR + ringThickness;
        // Draw as donut via two circles
        return (
          <g key={t}>
            <circle
              cx={cx}
              cy={cy}
              r={outerR}
              fill="#C4A060"
              fillOpacity={lerp(0.12, 0.75, (v + 1) / 2)}
            />
            <circle cx={cx} cy={cy} r={innerR} fill="#F5ECDC" />
          </g>
        );
      })}
      {/* Labels at the edge */}
      <text
        x={cx}
        y={cy}
        fill="#5C3018"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        textAnchor="middle"
      >
        now
      </text>
      <text
        x={cx + innermost + 12 * step + 14}
        y={cy + 3}
        fill="#8A6A4A"
        fontSize={9}
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        12 weeks ago
      </text>
    </svg>
  );
}

/* ─── Demo 14: Weather sky. Each category is a sky cell with a weather
       condition — clear (flowing), cloudy (mixed), storm (stuck), fog
       (confused). Honest about every condition being valid. */
function WeatherSky() {
  const W = 320;
  const H = 260;
  const cols = 3;
  const rows = 2;
  const cellW = (W - 20) / cols;
  const cellH = (H - 30) / rows;

  // Classify each category's current state
  const classify = (v: number): 'clear' | 'cloudy' | 'storm' | 'fog' => {
    if (v > 0.5) return 'clear';
    if (v > 0) return 'cloudy';
    if (v > -0.5) return 'fog';
    return 'storm';
  };

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Weather sky — each category has a condition. No bad weather, just weather.</title>
      {DEMO.map((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 10 + col * cellW;
        const y = 10 + row * cellH;
        const latest = c.trajectory[c.trajectory.length - 1];
        const condition = classify(latest);
        // Sky tint per condition
        const bgTint =
          condition === 'clear'
            ? '#F5E0A060'
            : condition === 'cloudy'
              ? '#D8C4A040'
              : condition === 'fog'
                ? '#C8B8A860'
                : '#A08878A0';

        return (
          <g key={c.name}>
            <rect x={x} y={y} width={cellW - 6} height={cellH - 6} rx={3} fill={bgTint} />
            {/* Weather icon */}
            {condition === 'clear' && (
              <circle cx={x + cellW / 2} cy={y + 22} r={10} fill={c.color} opacity={0.85} />
            )}
            {condition === 'cloudy' && (
              <g>
                <ellipse
                  cx={x + cellW / 2 - 8}
                  cy={y + 24}
                  rx={10}
                  ry={6}
                  fill="#ffffff"
                  opacity={0.7}
                />
                <ellipse
                  cx={x + cellW / 2 + 4}
                  cy={y + 22}
                  rx={12}
                  ry={7}
                  fill="#ffffff"
                  opacity={0.8}
                />
              </g>
            )}
            {condition === 'fog' && (
              <g>
                {[0, 6, 12].map((dy) => (
                  <line
                    key={dy}
                    x1={x + 14}
                    y1={y + 18 + dy}
                    x2={x + cellW - 20}
                    y2={y + 18 + dy}
                    stroke="#8A6A4A"
                    strokeWidth={2}
                    opacity={0.45}
                  />
                ))}
              </g>
            )}
            {condition === 'storm' && (
              <g>
                <ellipse
                  cx={x + cellW / 2}
                  cy={y + 18}
                  rx={16}
                  ry={6}
                  fill="#5C4838"
                  opacity={0.5}
                />
                <path
                  d={`M ${x + cellW / 2 - 2} ${y + 26} l -3 8 l 4 -1 l -2 7 l 7 -10 l -4 1 l 3 -5 z`}
                  fill="#E8A030"
                  opacity={0.9}
                />
              </g>
            )}
            {/* Category name */}
            <text
              x={x + cellW / 2 - 3}
              y={y + cellH - 14}
              fill="#5C3018"
              fontSize={11}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="middle"
            >
              {c.name}
            </text>
            {/* Condition label */}
            <text
              x={x + cellW / 2 - 3}
              y={y + cellH - 4}
              fill="#8A6A4A"
              fontSize={9}
              fontFamily="var(--font-serif)"
              fontStyle="italic"
              textAnchor="middle"
            >
              {condition}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Demo 15: Musical staff. Notes on a staff. Pitch = flow,
       x-position = time. Lines are ledger; notes are small circles. */
function MusicalStaff() {
  const W = 320;
  const H = 260;
  const rowH = 40;
  const nameCol = 72;
  const staffStart = nameCol + 8;
  const staffW = W - staffStart - 12;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <title>Musical staff — pitch = flow, reads left to right through time</title>
      {DEMO.map((c, i) => {
        const y = 20 + i * rowH;
        const staffTop = y + 4;
        const staffBot = y + rowH - 6;
        const mid = (staffTop + staffBot) / 2;
        const range = (staffBot - staffTop) / 2;

        return (
          <g key={c.name}>
            {/* Name */}
            <text
              x={nameCol}
              y={mid + 4}
              fill="#5C3018"
              fontSize={11}
              fontFamily="var(--font-serif)"
              fontWeight={600}
              textAnchor="end"
            >
              {c.name}
            </text>
            {/* 5 staff lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1={staffStart}
                y1={staffTop + pct * (staffBot - staffTop)}
                x2={staffStart + staffW}
                y2={staffTop + pct * (staffBot - staffTop)}
                stroke="#8A6A4A30"
                strokeWidth={0.6}
              />
            ))}
            {/* Notes */}
            {c.trajectory.map((v, t) => {
              const x = staffStart + 8 + (t / 11) * (staffW - 16);
              const py = mid - v * range;
              return (
                <g key={t}>
                  <ellipse
                    cx={x}
                    cy={py}
                    rx={3.5}
                    ry={2.8}
                    fill={c.color}
                    fillOpacity={0.9}
                    transform={`rotate(-18 ${x} ${py})`}
                  />
                  {/* Stem */}
                  <line
                    x1={x + 3}
                    y1={py}
                    x2={x + 3}
                    y2={py - 10}
                    stroke={c.color}
                    strokeWidth={1}
                    strokeOpacity={0.85}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
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
  {
    id: 'heatmap',
    title: '6. Heatmap grid',
    description:
      'Dense grid: categories × weeks, colour intensity = flow. Most diagnostic at a glance, least metaphorical.',
    render: HeatmapGrid,
  },
  {
    id: 'constellation',
    title: '7. Constellation',
    description:
      'Freeform dots in space. Brightness = current flow. Subtle connection lines suggest which areas move together.',
    render: Constellation,
  },
  {
    id: 'orbits',
    title: '8. Concentric orbits',
    description:
      'Time as rings. Each category is one orbit — dots around it mark its state each week, with "now" at the inside.',
    render: ConcentricOrbits,
  },
  {
    id: 'garden',
    title: '9. Garden',
    description:
      'Each category is a plant. Stem height + bloom size track the current flow. Allows seasonal rhythm without "failure."',
    render: Garden,
  },
  {
    id: 'sparklines',
    title: '10. Sparklines list',
    description:
      'Compact list-style. Tiny per-category line graph next to its name. Fits many categories without zooming.',
    render: SparklinesList,
  },
  {
    id: 'tide',
    title: '11. Tide pools',
    description:
      'Each category is a pool. Water level = current flow; small watermark ticks show past levels across the pool.',
    render: TidePools,
  },
  {
    id: 'windrose',
    title: '12. Wind rose',
    description:
      'Radial petals, one per category. Petal length = flow magnitude. Shows the shape of your whole life at a glance.',
    render: WindRose,
  },
  {
    id: 'treerings',
    title: '13. Tree rings',
    description:
      'One disc. Each concentric ring is a week; ring thickness = aggregate flow that week. Reads your year as growth.',
    render: TreeRings,
  },
  {
    id: 'weather',
    title: '14. Weather sky',
    description:
      'Each category is a sky cell with a weather icon (clear / cloudy / fog / storm). Makes every condition honest — no "bad" weather.',
    render: WeatherSky,
  },
  {
    id: 'music',
    title: '15. Musical staff',
    description:
      'Each category is a row of the score. Notes land higher when flowing, lower when stuck. Reads left-to-right like music.',
    render: MusicalStaff,
  },
];

export default function OverviewVisualDemos() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('colourmap:visual-demos-open') !== 'false';
  });

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:visual-demos-open', String(next));
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
            River visualisations — design options
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
          five ways of rendering flow &amp; stuck over time — same synthetic data, same six
          categories
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
