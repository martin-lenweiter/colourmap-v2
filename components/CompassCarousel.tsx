'use client';

import { useRef, useState } from 'react';
import CareCompass from '@/components/CareCompass';
import CompassListView from '@/components/CompassListView';
import ShareCompass from '@/components/ShareCompass';
import StarCompass from '@/components/StarCompass';

const COMPASSES = [
  { id: 'caring', label: 'Caring', component: CareCompass },
  { id: 'doing', label: 'Doing', component: StarCompass },
  { id: 'sharing', label: 'Sharing', component: ShareCompass },
] as const;

type DepthTab = 'compass' | 'list' | 'super';

const DEPTH_TABS: { id: DepthTab; label: string; color: string }[] = [
  { id: 'compass', label: 'Compass', color: '#C4A060' },
  { id: 'list', label: 'List', color: '#D4805A' },
  { id: 'super', label: 'Super', color: '#6890B0' },
];

/* ─── TRIO VIEW — three circles side by side, each with 4 slices ─── */
// Slice order matches compass: top (-π/2), right (0), bottom (π/2), left (π)
// With X offset (-π/4), index 0=top, 1=right, 2=bottom, 3=left
const TRIO_DATA = [
  {
    label: 'Caring',
    compassIdx: 0,
    color: '#D4805A',
    slices: [
      { letter: 'C', full: 'Care', color: '#C4A070' }, // left — lighter
      { letter: 'A', full: 'Attitude', color: '#D4805A' }, // top — darker
      { letter: 'R', full: 'Rest', color: '#C4A070' }, // right — lighter
      { letter: 'E', full: 'Emotions', color: '#D4805A' }, // bottom — darker
    ],
  },
  {
    label: 'Doing',
    compassIdx: 1,
    color: '#7AAA58',
    slices: [
      { letter: 'S', full: 'Structure', color: '#5A7A9A' }, // left — darker blue
      { letter: 'T', full: 'Target', color: '#8AB0C8' }, // top — lighter blue
      { letter: 'A', full: 'Action', color: '#5A7A9A' }, // right — darker blue
      { letter: 'R', full: 'Resources', color: '#8AB0C8' }, // bottom — lighter blue
    ],
  },
  {
    label: 'Sharing',
    compassIdx: 2,
    color: '#6B7F4E',
    slices: [
      { letter: 'S', full: 'Social Life', color: '#8CA46E' }, // left — lighter green
      { letter: 'A', full: 'Authentic', color: '#5F7447' }, // top — darker green
      { letter: 'R', full: 'Roots', color: '#8CA46E' }, // right — lighter green
      { letter: 'E', full: 'Express', color: '#5F7447' }, // bottom — darker green
    ],
  },
];

function TrioView({
  onSliceClick,
}: {
  onSliceClick: (compassIdx: number, sliceName: string) => void;
}) {
  const r = 44;
  const gap = 32;
  const totalW = r * 2 * 3 + gap * 2;
  const H = r * 2 + 44;
  const sliceOffset = (3 * Math.PI) / 4;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${totalW} ${H}`}>
        <title>Trio — three compasses side by side</title>
        {TRIO_DATA.map((compass, ci) => {
          const cx = r + ci * (r * 2 + gap);
          const cy = r + 6;

          return (
            <g key={compass.label}>
              {compass.slices.map((slice, si) => {
                const startAngle = sliceOffset + (si / 4) * Math.PI * 2;
                const endAngle = sliceOffset + ((si + 1) / 4) * Math.PI * 2;
                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);
                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                const midAngle = (startAngle + endAngle) / 2;
                const lx = cx + r * 0.6 * Math.cos(midAngle);
                const ly = cy + r * 0.6 * Math.sin(midAngle);

                return (
                  <g
                    key={`${compass.label}-${si}`}
                    onClick={() => onSliceClick(compass.compassIdx, slice.full)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d={d}
                      fill={slice.color}
                      fillOpacity={0.3}
                      stroke={slice.color}
                      strokeWidth={0.5}
                      strokeOpacity={0.4}
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#5C3018"
                      fontSize={13}
                      fontFamily="var(--font-serif)"
                      fontWeight={700}
                      style={{ pointerEvents: 'none' }}
                    >
                      {slice.letter}
                    </text>
                  </g>
                );
              })}
              <circle
                cx={cx}
                cy={cy}
                r={3.5}
                fill={compass.color}
                opacity={0.5}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={cx}
                y={cy + r + 16}
                textAnchor="middle"
                fill="#5C3018"
                fontSize={12}
                fontFamily="var(--font-serif)"
                fontWeight={700}
                style={{ pointerEvents: 'none' }}
              >
                {compass.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── SUPERCOMPASS — Caring pizza inside Doing donut ─── */
function SuperCompassView({
  onSliceClick,
}: {
  onSliceClick: (compassIdx: number, sliceName: string) => void;
}) {
  const W = 340;
  const H = 340;
  const svgCx = W / 2;
  const svgCy = H / 2;
  const outerR = 155;
  const innerR = 65;

  // Order: top, right, bottom, left (matches compass layout with X offset)
  const outerSlices = [
    { label: 'Target', color: '#7A9A7A', ring: 'doing' }, // top
    { label: 'Action', color: '#8A8A6A', ring: 'doing' }, // right
    { label: 'Resources', color: '#5A7A9A', ring: 'doing' }, // bottom
    { label: 'Structure', color: '#6A8A9A', ring: 'doing' }, // left
  ];

  const innerSlices = [
    { label: 'Attitude', color: '#C4A070', ring: 'caring' }, // top
    { label: 'Rest', color: '#C4906A', ring: 'caring' }, // right
    { label: 'Emotions', color: '#B07A5A', ring: 'caring' }, // bottom
    { label: 'Care', color: '#D4805A', ring: 'caring' }, // left
  ];

  function renderRing(
    slices: { label: string; color: string; ring: string }[],
    rOuter: number,
    rInner: number,
    labelR: number,
    fontSize: number,
  ) {
    return slices.map((slice, i) => {
      const startAngle = -Math.PI / 4 + (i / slices.length) * Math.PI * 2;
      const endAngle = -Math.PI / 4 + ((i + 1) / slices.length) * Math.PI * 2;

      let d: string;
      if (rInner === 0) {
        // Pizza slice (inner ring)
        const x1 = svgCx + rOuter * Math.cos(startAngle);
        const y1 = svgCy + rOuter * Math.sin(startAngle);
        const x2 = svgCx + rOuter * Math.cos(endAngle);
        const y2 = svgCy + rOuter * Math.sin(endAngle);
        d = `M ${svgCx} ${svgCy} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} Z`;
      } else {
        // Donut slice (outer ring)
        const ox1 = svgCx + rOuter * Math.cos(startAngle);
        const oy1 = svgCy + rOuter * Math.sin(startAngle);
        const ox2 = svgCx + rOuter * Math.cos(endAngle);
        const oy2 = svgCy + rOuter * Math.sin(endAngle);
        const ix2 = svgCx + rInner * Math.cos(endAngle);
        const iy2 = svgCy + rInner * Math.sin(endAngle);
        const ix1 = svgCx + rInner * Math.cos(startAngle);
        const iy1 = svgCy + rInner * Math.sin(startAngle);
        d = `M ${ox1} ${oy1} A ${rOuter} ${rOuter} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${rInner} ${rInner} 0 0 0 ${ix1} ${iy1} Z`;
      }

      const midAngle = (startAngle + endAngle) / 2;
      const lx = svgCx + labelR * Math.cos(midAngle);
      const ly = svgCy + labelR * Math.sin(midAngle);

      return (
        <g
          key={slice.label}
          onClick={() => onSliceClick(slice.ring === 'doing' ? 1 : 0, slice.label)}
          style={{ cursor: 'pointer' }}
        >
          <path
            d={d}
            fill={slice.color}
            fillOpacity={0.3}
            stroke={slice.color}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <text
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#5C3018"
            fontSize={fontSize}
            fontFamily="var(--font-serif)"
            fontWeight={600}
            style={{ pointerEvents: 'none' }}
          >
            {slice.label}
          </text>
        </g>
      );
    });
  }

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <title>Supercompass — Caring inside Doing</title>
        {renderRing(outerSlices, outerR, innerR + 22, (outerR + innerR + 22) / 2, 14)}
        {renderRing(innerSlices, innerR, 0, innerR * 0.45, 11)}
      </svg>
    </div>
  );
}

export default function CompassCarousel() {
  const [idx, setIdx] = useState(0);
  const [depthTab, setDepthTab] = useState<DepthTab>('compass');
  const [pendingSlice, setPendingSlice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const Current = COMPASSES[idx].component;

  // When a slice is clicked in Trio or Super, show the compass below with that slice active
  const handleSliceClick = (compassIdx: number, sliceName: string) => {
    if (idx === compassIdx && pendingSlice === sliceName) {
      // Toggle off
      setPendingSlice(null);
    } else {
      setIdx(compassIdx);
      setPendingSlice(sliceName);
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) {
      setIdx((idx - 1 + COMPASSES.length) % COMPASSES.length);
    } else if (x > rect.width * 0.75) {
      setIdx((idx + 1) % COMPASSES.length);
    }
  };

  return (
    <div
      className="space-y-4 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#8A6A4A50',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Depth tabs — Compass / Work / Reflect */}
      <div className="flex justify-center gap-3">
        {DEPTH_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setDepthTab(t.id);
              setPendingSlice(null);
            }}
            className="cursor-pointer rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition-all duration-200"
            style={{
              background: depthTab === t.id ? `${t.color}18` : 'transparent',
              border: `1px solid ${depthTab === t.id ? `${t.color}40` : '#C4A06020'}`,
              color: t.color,
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {depthTab === 'compass' && (
        <div className="space-y-4">
          {/* Trio on top — click a slice to open that compass below */}
          <TrioView onSliceClick={handleSliceClick} />

          {/* Compass opens below when a slice is clicked */}
          {pendingSlice && (
            <div ref={containerRef} className="relative cursor-pointer" onClick={handleTap}>
              {/* Left/right tap zones */}
              <div
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-lg"
                style={{ color: '#C4A060', opacity: 0.25, pointerEvents: 'none' }}
              >
                ‹
              </div>
              <div
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-lg"
                style={{ color: '#C4A060', opacity: 0.25, pointerEvents: 'none' }}
              >
                ›
              </div>

              <div className="animate-in fade-in duration-200">
                <Current key={`${idx}-${pendingSlice}`} initialSlice={pendingSlice} />
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 pt-3">
                {COMPASSES.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdx(i);
                      setPendingSlice(null);
                    }}
                    className="cursor-pointer transition-all"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#C4A060',
                      opacity: i === idx ? 0.8 : 0.2,
                      border: 'none',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {depthTab === 'list' && (
        <div className="animate-in fade-in duration-200">
          <CompassListView />
        </div>
      )}

      {depthTab === 'super' && (
        <div className="animate-in fade-in duration-200 space-y-4">
          <SuperCompassView onSliceClick={handleSliceClick} />
          {pendingSlice && (
            <div className="animate-in fade-in duration-200">
              <Current key={`super-${idx}-${pendingSlice}`} initialSlice={pendingSlice} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
