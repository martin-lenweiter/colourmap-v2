'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   WORKSHOP — Live visual tools with interactive demos
   ═══════════════════════════════════════════════════════════ */

/* ─── SVG Helpers ─── */
function arcPath(cx: number, cy: number, iR: number, oR: number, sa: number, ea: number) {
  const g = 0.06;
  const s = sa + g;
  const e = ea - g;
  return `M ${cx + oR * Math.cos(s)} ${cy + oR * Math.sin(s)} A ${oR} ${oR} 0 0 1 ${cx + oR * Math.cos(e)} ${cy + oR * Math.sin(e)} L ${cx + iR * Math.cos(e)} ${cy + iR * Math.sin(e)} A ${iR} ${iR} 0 0 0 ${cx + iR * Math.cos(s)} ${cy + iR * Math.sin(s)} Z`;
}

/* ─── Visual: Compass ─── */
function CompassDemo() {
  const [active, setActive] = useState<number | null>(null);
  const slices = [
    { label: 'Care', color: '#D4805A', value: 0.7 },
    { label: 'Attitude', color: '#C4A070', value: 0.5 },
    { label: 'Rest', color: '#6890B0', value: 0.6 },
    { label: 'Emotions', color: '#88A858', value: 0.4 },
  ];
  const angles = [Math.PI, -Math.PI / 2, 0, Math.PI / 2];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle cx={cx} cy={cy} r={78} fill="none" stroke="#ddb97f" strokeWidth="0.6" opacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={34}
        fill="none"
        stroke="#ddb97f"
        strokeWidth="0.4"
        opacity={0.12}
      />
      {slices.map((s, i) => (
        <path
          key={s.label}
          d={arcPath(cx, cy, 34, 78, angles[i] - Math.PI / 4, angles[i] + Math.PI / 4)}
          fill={s.color}
          opacity={active === i ? 0.8 : 0.15 + s.value * 0.4}
          className="cursor-pointer transition-all duration-300"
          style={{ filter: active === i ? `drop-shadow(0 0 6px ${s.color}60)` : undefined }}
          onClick={() => setActive(active === i ? null : i)}
        />
      ))}
      {slices.map((s, i) => {
        const r = 56;
        return (
          <text
            key={`l-${s.label}`}
            x={cx + r * Math.cos(angles[i])}
            y={cy + r * Math.sin(angles[i])}
            textAnchor="middle"
            dominantBaseline="middle"
            className="cursor-pointer select-none"
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fill: active === i ? s.color : '#8f6a47',
            }}
            onClick={() => setActive(active === i ? null : i)}
          >
            {s.label}
          </text>
        );
      })}
      <circle cx={cx} cy={cy} r={16} fill="#C4A060" opacity={0.08} />
    </svg>
  );
}

/* ─── Visual: Mandala ─── */
function MandalaDemo() {
  const [active, setActive] = useState<number | null>(null);
  const petals = [
    '#D44040',
    '#E8A030',
    '#70C040',
    '#3A8AC4',
    '#9B6BA0',
    '#C4A070',
    '#6B8F4E',
    '#D06080',
  ];
  const names = ['Warrior', 'Child', 'Healer', 'Thinker', 'Shadow', 'Anchor', 'Seeker', 'Lover'];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle cx={cx} cy={cy} r={90} fill="none" stroke="#C4B890" strokeWidth="0.3" opacity={0.1} />
      {petals.map((c, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const tipR = active === i ? 82 : 72;
        const tipX = cx + tipR * Math.cos(a);
        const tipY = cy + tipR * Math.sin(a);
        const pa = a + Math.PI / 2;
        const sp = active === i ? 18 : 14;
        const c1x = cx + 20 * Math.cos(a) + sp * Math.cos(pa);
        const c1y = cy + 20 * Math.sin(a) + sp * Math.sin(pa);
        const c2x = cx + 20 * Math.cos(a) - sp * Math.cos(pa);
        const c2y = cy + 20 * Math.sin(a) - sp * Math.sin(pa);
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} Q ${c1x} ${c1y} ${tipX} ${tipY} Q ${c2x} ${c2y} ${cx} ${cy} Z`}
            fill={c}
            opacity={active === i ? 0.7 : 0.3}
            className="cursor-pointer transition-all duration-500"
            style={{ filter: active === i ? `drop-shadow(0 0 8px ${c}50)` : undefined }}
            onClick={() => setActive(active === i ? null : i)}
          />
        );
      })}
      {names.map((n, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r = 52;
        return (
          <text
            key={n}
            x={cx + r * Math.cos(a)}
            y={cy + r * Math.sin(a)}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${(a * 180) / Math.PI + 90}, ${cx + r * Math.cos(a)}, ${cy + r * Math.sin(a)})`}
            style={{
              fontSize: '7px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 600,
              fill: active === i ? '#fff' : petals[i],
              opacity: active === i ? 1 : 0.7,
            }}
            className="cursor-pointer select-none"
            onClick={() => setActive(active === i ? null : i)}
          >
            {n}
          </text>
        );
      })}
      <circle cx={cx} cy={cy} r={12} fill="#C4B890" opacity={0.08} />
    </svg>
  );
}

/* ─── Visual: Echo Layers ─── */
function EchoDemo() {
  const [active, setActive] = useState<number | null>(null);
  const rings = [
    { label: 'Social Face', color: '#70C040' },
    { label: 'Behaviour', color: '#C4A070' },
    { label: 'Story', color: '#E8A030' },
    { label: 'Defence', color: '#E87040' },
    { label: 'Core', color: '#D44040' },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 90;
  const rw = maxR / 5.5;

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {[...rings].reverse().map((ring, ri) => {
        const i = rings.length - 1 - ri;
        const oR = maxR - ri * rw;
        const iR = Math.max(0, oR - rw + 2);
        const isAct = active === i;
        const dist = active !== null ? Math.abs(active - i) : 99;
        return (
          <g key={i} className="cursor-pointer" onClick={() => setActive(active === i ? null : i)}>
            <circle
              cx={cx}
              cy={cy}
              r={oR}
              fill={ring.color}
              opacity={isAct ? 0.6 : dist === 1 ? 0.25 : 0.12}
              className="transition-all duration-500"
              style={{ filter: isAct ? `drop-shadow(0 0 10px ${ring.color}50)` : undefined }}
            />
            {iR > 4 && (
              <circle cx={cx} cy={cy} r={iR} fill="hsl(var(--background))" opacity={0.85} />
            )}
            <text
              x={cx}
              y={cy - oR + rw * 0.55}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: isAct ? '10px' : '8px',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: isAct ? 700 : 500,
                fill: isAct ? '#fff' : ring.color,
              }}
            >
              {ring.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={5} fill="#D44040" opacity={0.3} />
    </svg>
  );
}

/* ─── Visual: Life Wheel ─── */
function WheelDemo() {
  const aspects = [
    { name: 'Sleep', value: 6 },
    { name: 'Sport', value: 4 },
    { name: 'Reading', value: 2 },
    { name: 'Work', value: 7 },
    { name: 'Partner', value: 5 },
    { name: 'Music', value: 3 },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 80;
  const pts = aspects.map((a, i) => {
    const angle = (i / aspects.length) * Math.PI * 2 - Math.PI / 2;
    const r = maxR * (a.value / 8);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      lx: cx + (maxR + 14) * Math.cos(angle),
      ly: cy + (maxR + 14) * Math.sin(angle),
      name: a.name,
    };
  });
  const dataPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={maxR * r}
          fill="none"
          stroke="#C4B890"
          strokeWidth="0.4"
          opacity={0.1}
        />
      ))}
      {pts.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos((i / aspects.length) * Math.PI * 2 - Math.PI / 2)}
          y2={cy + maxR * Math.sin((i / aspects.length) * Math.PI * 2 - Math.PI / 2)}
          stroke="#C4B890"
          strokeWidth="0.3"
          opacity={0.15}
        />
      ))}
      <path
        d={dataPath}
        fill="#7A9A7A"
        opacity={0.15}
        stroke="#7A9A7A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {pts.map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r={3} fill="#7A9A7A" opacity={0.7} />
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 600,
              fill: '#7A9A7A',
            }}
          >
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Visual: Mirror ─── */
function MirrorDemo() {
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <defs>
        <radialGradient id="w-chg" cx="35%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C87050" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C87050" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="w-flow" cx="65%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C4A060" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C4A060" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="w-overlap" cx="50%" cy="50%" r="30%">
          <stop offset="0%" stopColor="#B8905A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#B8905A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx - 25} cy={cy} r={65} fill="url(#w-chg)" />
      <circle cx={cx + 25} cy={cy} r={65} fill="url(#w-flow)" />
      <circle cx={cx} cy={cy} r={30} fill="url(#w-overlap)" />
      <text
        x={cx - 45}
        y={cy - 5}
        textAnchor="middle"
        style={{
          fontSize: '10px',
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fill: '#C87050',
          opacity: 0.7,
        }}
      >
        Challenge
      </text>
      <text
        x={cx + 45}
        y={cy - 5}
        textAnchor="middle"
        style={{
          fontSize: '10px',
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fill: '#C4A060',
          opacity: 0.7,
        }}
      >
        Flow
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        style={{
          fontSize: '8px',
          fontFamily: 'var(--font-handwritten)',
          fill: '#B8905A',
          opacity: 0.5,
        }}
      >
        integration
      </text>
    </svg>
  );
}

/* ─── Visual: Constellation ─── */
function ConstellationDemo() {
  const people = [
    { name: 'Mom', angle: 0, brightness: 0.9, dist: 0.5 },
    { name: 'Alex', angle: 1.2, brightness: 0.6, dist: 0.7 },
    { name: 'Sam', angle: 2.4, brightness: 0.3, dist: 0.9 },
    { name: 'Jo', angle: 3.6, brightness: 0.8, dist: 0.4 },
    { name: 'Maya', angle: 5.0, brightness: 0.5, dist: 0.6 },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {people.map((p) => {
        const r = 30 + p.dist * 50;
        const x = cx + r * Math.cos(p.angle);
        const y = cy + r * Math.sin(p.angle);
        return (
          <g key={p.name}>
            <circle
              cx={x}
              cy={y}
              r={p.brightness * 5 + 2}
              fill="#C4A060"
              opacity={p.brightness * 0.7 + 0.1}
              style={{ filter: p.brightness > 0.6 ? 'drop-shadow(0 0 4px #C4A06060)' : undefined }}
            />
            <text
              x={x}
              y={y + 12}
              textAnchor="middle"
              style={{
                fontSize: '7px',
                fontFamily: 'var(--font-handwritten)',
                fill: '#C4A060',
                opacity: p.brightness * 0.5 + 0.3,
              }}
            >
              {p.name}
            </text>
          </g>
        );
      })}
      {/* thin connection lines */}
      <line
        x1={cx + 30 * Math.cos(0) + 0.5 * 50 * Math.cos(0)}
        y1={cy + 30 * Math.sin(0) + 0.5 * 50 * Math.sin(0)}
        x2={cx + 30 * Math.cos(3.6) + 0.4 * 50 * Math.cos(3.6)}
        y2={cy + 30 * Math.sin(3.6) + 0.4 * 50 * Math.sin(3.6)}
        stroke="#C4A060"
        strokeWidth="0.3"
        opacity={0.15}
        strokeDasharray="2 2"
      />
    </svg>
  );
}

/* ─── Visual: Losange ─── */
function LosangeDemo() {
  const [emotion, setEmotion] = useState('Fear');
  const emotions = [
    { label: 'Fear', color: '#D46050' },
    { label: 'Hope', color: '#70C040' },
    { label: 'Peace', color: '#18B0B0' },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  const R = 70;
  const dims = ['Structure', 'Target', 'Action', 'Resources'];
  const corners = [
    { dx: -R, dy: 0 },
    { dx: 0, dy: -R },
    { dx: R, dy: 0 },
    { dx: 0, dy: R },
  ];
  const ec = emotions.find((e) => e.label === emotion) || emotions[0];

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
        {[1, 0.65, 0.35].map((s, si) => (
          <polygon
            key={si}
            points={corners.map((c) => `${cx + c.dx * s},${cy + c.dy * s}`).join(' ')}
            fill="none"
            stroke="#C4B890"
            strokeWidth={si === 0 ? '1' : '0.4'}
            opacity={si === 0 ? 0.25 : 0.12}
          />
        ))}
        {corners.map((c, i) => {
          const next = corners[(i + 1) % 4];
          return (
            <polygon
              key={i}
              points={`${cx},${cy} ${cx + c.dx},${cy + c.dy} ${cx + next.dx},${cy + next.dy}`}
              fill={ec.color}
              opacity={0.08}
            />
          );
        })}
        {corners.map((c, i) => (
          <text
            key={dims[i]}
            x={cx + c.dx * 0.55}
            y={cy + c.dy * 0.55}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fill: '#8A7A5A',
            }}
          >
            {dims[i]}
          </text>
        ))}
        <polygon
          points={`${cx},${cy - 8} ${cx + 8},${cy} ${cx},${cy + 8} ${cx - 8},${cy}`}
          fill={ec.color}
          opacity={0.35}
        />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: '7px',
            fontFamily: 'var(--font-handwritten)',
            fontWeight: 700,
            fill: '#fff',
          }}
        >
          {emotion}
        </text>
      </svg>
      <div className="flex gap-1.5">
        {emotions.map((e) => (
          <button
            key={e.label}
            type="button"
            onClick={() => setEmotion(e.label)}
            className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold text-white transition-all"
            style={{
              background: e.color,
              opacity: emotion === e.label ? 1 : 0.4,
              border: 'none',
              fontFamily: 'var(--font-handwritten)',
            }}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Visual: FACING blobs ─── */
function FacingDemo() {
  const [active, setActive] = useState<number | null>(null);
  const blobs = [
    { letter: 'F', color: '#C85050' },
    { letter: 'A', color: '#D09060' },
    { letter: 'C', color: '#A878A8' },
    { letter: 'I', color: '#6890B0' },
    { letter: 'N', color: '#C8A050' },
    { letter: 'G', color: '#88A858' },
  ];
  const shapes = [
    '60% 40% 55% 45% / 50% 60% 40% 50%',
    '45% 55% 40% 60% / 55% 45% 55% 45%',
    '50% 50% 45% 55% / 40% 60% 50% 50%',
    '55% 45% 60% 40% / 50% 50% 45% 55%',
    '52% 48% 42% 58% / 48% 52% 50% 50%',
    '48% 52% 55% 45% / 55% 45% 48% 52%',
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {blobs.map((b, i) => (
        <button
          key={b.letter}
          type="button"
          onClick={() => setActive(active === i ? null : i)}
          className="flex cursor-pointer items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            width: active === i ? 48 : 40,
            height: active === i ? 48 : 40,
            borderRadius: shapes[i],
            background: b.color,
            opacity: active === i ? 1 : 0.6,
            border: 'none',
          }}
        >
          <span
            className="text-sm font-black text-white select-none"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            {b.letter}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ─── Workshop Data ─── */
const WORKSHOPS = [
  {
    id: 'compass',
    title: 'The Compass',
    subtitle: 'Rate your 4 dimensions',
    color: '#C4A060',
    desc: 'Ring compass with clickable arcs. Each arc represents one dimension. Tap to rate 1-8. Sub-cells reveal deeper questions. Lives in Box 2 of every Day tab.',
    Visual: CompassDemo,
  },
  {
    id: 'mandala',
    title: 'The Mandala',
    subtitle: 'Sacred geometry with inner voices',
    color: '#C86AD0',
    desc: 'Eight petals, each an archetype. The mandala becomes your unique inner portrait. Tap a petal to hear its voice speak. Future: Journey page.',
    Visual: MandalaDemo,
  },
  {
    id: 'echo',
    title: 'The Echo Layers',
    subtitle: 'Peel the onion — depth rings',
    color: '#D44040',
    desc: "Concentric rings from surface to core. Click from outside in to reveal what's underneath. Five variants: Emotional Core, Decision Depth, Relationship, Energy, Growth. Future: Journey page.",
    Visual: EchoDemo,
  },
  {
    id: 'wheel',
    title: 'The Life Wheel',
    subtitle: 'Track habits as a radar shape',
    color: '#7A9A7A',
    desc: 'Spider chart where your trackers become the spokes. The shape shows which habits are strong vs weak. Compare this week to last. Lives in Box 3 of the Doing tab.',
    Visual: WheelDemo,
  },
  {
    id: 'mirror',
    title: 'The Mirror',
    subtitle: 'Challenge and Flow made visible',
    color: '#C4A070',
    desc: 'Two overlapping watercolour circles. Challenge grows the left. Flow grows the right. Where they overlap: integration. Lives in Box 3 of the Caring tab.',
    Visual: MirrorDemo,
  },
  {
    id: 'constellation',
    title: 'The Constellation',
    subtitle: 'Your people as stars',
    color: '#6B7F4E',
    desc: 'People become stars. Brightness = connection recency. Distant stars drift outward. Connected stars pull inward. Lives in Box 3 of the Sharing tab.',
    Visual: ConstellationDemo,
  },
  {
    id: 'losange',
    title: 'The Losange',
    subtitle: 'How emotions distort doing',
    color: '#9B6BA0',
    desc: 'Diamond with 4 Doing dimensions. Pick an emotion and see how it refracts through Structure, Target, Action, Resources. Future: Journey page.',
    Visual: LosangeDemo,
  },
  {
    id: 'facing',
    title: 'FACING / PEACE',
    subtitle: 'Name it or release it',
    color: '#C85050',
    desc: "Six organic cell-shaped blobs. FACING names what's hard. PEACE walks you through releasing it. Swipe between them. Lives in Box 1 of the Caring tab.",
    Visual: FacingDemo,
  },
];

/* ─── Main ─── */
export default function WorkshopPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
      <div className="mb-6 text-center">
        <h1
          className="text-xl font-semibold uppercase tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-serif)', color: '#5C3018' }}
        >
          Workshop
        </h1>
        <p
          className="mt-1 text-sm text-muted-foreground"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          Visual tools — tap to explore.
        </p>
      </div>

      {WORKSHOPS.map((w) => {
        const isOpen = openId === w.id;
        return (
          <div key={w.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : w.id)}
              className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200"
              style={{
                background: isOpen
                  ? 'linear-gradient(180deg, rgba(248,238,220,0.97), rgba(242,230,210,0.95))'
                  : 'transparent',
                border: `1.5px solid ${isOpen ? '#8A6A4A50' : '#8A6A4A20'}`,
              }}
            >
              <div className="text-left">
                <span
                  className="block text-base font-bold"
                  style={{ color: w.color, fontFamily: 'var(--font-serif)' }}
                >
                  {w.title}
                </span>
                <span
                  className="block text-xs text-muted-foreground/60"
                  style={{ fontFamily: 'var(--font-handwritten)' }}
                >
                  {w.subtitle}
                </span>
              </div>
              <span className="text-sm text-muted-foreground/30">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div
                className="animate-in fade-in duration-200 space-y-4 rounded-b-2xl border border-t-0 px-5 py-5"
                style={{
                  borderColor: '#8A6A4A30',
                  background:
                    'linear-gradient(180deg, rgba(248,238,220,0.97), rgba(242,230,210,0.95))',
                }}
              >
                {/* Live visual */}
                <div className="flex justify-center py-2">
                  <w.Visual />
                </div>
                {/* Description */}
                <p
                  className="text-center text-sm leading-relaxed"
                  style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
                >
                  {w.desc}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
