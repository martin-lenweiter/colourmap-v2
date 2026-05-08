'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Types ──────────────────────────────────────────────────────── */
type BubbleKind = 'emotion' | 'mission' | 'focus' | 'idea' | 'body' | 'mind';
type BubbleDesign = 'circle' | 'pill' | 'diamond' | 'hex' | 'star' | 'ring' | 'square' | 'capsule';

const DESIGNS: { id: BubbleDesign; label: string }[] = [
  { id: 'circle', label: '○' },
  { id: 'pill', label: '▭' },
  { id: 'diamond', label: '◇' },
  { id: 'hex', label: '⬡' },
  { id: 'star', label: '✦' },
  { id: 'ring', label: '◎' },
  { id: 'square', label: '□' },
  { id: 'capsule', label: '⬜' },
];

interface Bubble {
  id: string;
  kind: BubbleKind;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  r: number;
}

interface Edge {
  from: string;
  to: string;
}

/* ── Color map ──────────────────────────────────────────────────── */
const KIND_COLOR: Record<BubbleKind, { fill: string; border: string; text: string }> = {
  emotion: { fill: 'rgba(196,160,96,0.12)', border: '#C4A060', text: '#8A6010' },
  mission: { fill: 'rgba(120,192,168,0.12)', border: '#78C0A8', text: '#2A7060' },
  focus: { fill: 'rgba(136,208,152,0.12)', border: '#88D098', text: '#287840' },
  idea: { fill: 'rgba(184,152,208,0.12)', border: '#B898D0', text: '#604880' },
  body: { fill: 'rgba(196,160,96,0.08)', border: '#C4A878', text: '#7A5828' },
  mind: { fill: 'rgba(160,152,192,0.1)', border: '#A098C0', text: '#483870' },
};

/* ── Layout helpers ─────────────────────────────────────────────── */
function layoutBubbles(raw: Omit<Bubble, 'x' | 'y'>[]): Bubble[] {
  const W = 340;
  const H = 420;
  const placed: Bubble[] = [];
  const kindGroups: Partial<Record<BubbleKind, Omit<Bubble, 'x' | 'y'>[]>> = {};
  for (const b of raw) {
    if (!kindGroups[b.kind]) kindGroups[b.kind] = [];
    kindGroups[b.kind]!.push(b);
  }
  const kinds = Object.keys(kindGroups) as BubbleKind[];
  const sectorAngle = (Math.PI * 2) / kinds.length;
  kinds.forEach((kind, ki) => {
    const group = kindGroups[kind]!;
    const centerAngle = sectorAngle * ki - Math.PI / 2;
    const cx = W / 2 + Math.cos(centerAngle) * W * 0.28;
    const cy = H / 2 + Math.sin(centerAngle) * H * 0.28;
    group.forEach((b, bi) => {
      const spread = group.length > 1 ? (bi / (group.length - 1) - 0.5) * 70 : 0;
      const perpAngle = centerAngle + Math.PI / 2;
      placed.push({
        ...b,
        x: Math.max(b.r + 8, Math.min(W - b.r - 8, cx + Math.cos(perpAngle) * spread)),
        y: Math.max(b.r + 8, Math.min(H - b.r - 8, cy + Math.sin(perpAngle) * spread)),
      });
    });
  });
  return placed;
}

/* ── Data loader ────────────────────────────────────────────────── */
function loadBubbles(): { bubbles: Bubble[]; edges: Edge[] } {
  const raw: Omit<Bubble, 'x' | 'y'>[] = [];
  const edges: Edge[] = [];

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
  const MIND_LABELS = ['Absent', 'Scattered', 'Confused', 'Drifting', 'Present', 'Flowing'];
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

  function getIdx(key: string, max: number, def: number) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? Math.min(max, Math.max(0, Number(v))) : def;
    } catch {
      return def;
    }
  }

  const eIdx = getIdx('colourmap:process-idx', 9, 4);
  const mIdx = getIdx('colourmap:presence-idx', 5, 3);
  const bIdx = getIdx('colourmap:body-idx', 7, 3);
  const fIdx = getIdx('colourmap:focus-idx', 7, 3);

  const eId = 'emotion-0';
  const mId = 'mind-0';
  const bId = 'body-0';
  const fId = 'focus-0';

  raw.push({ id: eId, kind: 'emotion', label: EMOTION_LABELS[eIdx], sublabel: 'Emotion', r: 38 });
  raw.push({ id: mId, kind: 'mind', label: MIND_LABELS[mIdx], sublabel: 'Mind', r: 30 });
  raw.push({ id: bId, kind: 'body', label: BODY_LABELS[bIdx], sublabel: 'Body', r: 30 });
  raw.push({ id: fId, kind: 'focus', label: FOCUS_LABELS[fIdx], sublabel: 'Focus', r: 32 });

  // Central hub
  const hubId = 'hub';
  raw.push({ id: hubId, kind: 'emotion', label: 'Now', r: 20 });
  edges.push({ from: hubId, to: eId });
  edges.push({ from: hubId, to: mId });
  edges.push({ from: hubId, to: bId });
  edges.push({ from: hubId, to: fId });

  try {
    const ctxRaw = JSON.parse(localStorage.getItem('colourmap:open-contexts') ?? '[]') as string[];
    ctxRaw.forEach((label, i) => {
      const id = `ctx-${i}`;
      const kind: BubbleKind =
        label.toLowerCase() === 'focus'
          ? 'focus'
          : label.toLowerCase() === 'idea'
            ? 'idea'
            : 'mission';
      raw.push({ id, kind, label, sublabel: 'Context', r: 26 });
      edges.push({ from: hubId, to: id });
    });
  } catch {}

  try {
    const missions = JSON.parse(localStorage.getItem('colourmap:doing-cards') ?? '[]') as {
      title?: string;
      timeFrame?: string;
    }[];
    missions.slice(0, 4).forEach((m, i) => {
      if (!m.title) return;
      const id = `mission-${i}`;
      raw.push({
        id,
        kind: 'mission',
        label: m.title.slice(0, 18),
        sublabel: m.timeFrame ? `by ${m.timeFrame}` : undefined,
        r: 28,
      });
      edges.push({ from: fId, to: id });
    });
  } catch {}

  return { bubbles: layoutBubbles(raw), edges };
}

/* ── Bubble shape renderer ──────────────────────────────────────── */
function BubbleShape({
  r,
  fill,
  border,
  design,
}: {
  r: number;
  fill: string;
  border: string;
  design: BubbleDesign;
}) {
  switch (design) {
    case 'pill': {
      const w = r * 1.9;
      const h = r * 1.1;
      return (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={h / 2}
          fill={fill}
          stroke={border}
          strokeWidth={1}
        />
      );
    }
    case 'diamond': {
      const p = r * 1.15;
      return (
        <polygon
          points={`0,${-p} ${p},0 0,${p} ${-p},0`}
          fill={fill}
          stroke={border}
          strokeWidth={1}
        />
      );
    }
    case 'hex': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 - 30) * Math.PI) / 180;
        return `${Math.cos(a) * r},${Math.sin(a) * r}`;
      }).join(' ');
      return <polygon points={pts} fill={fill} stroke={border} strokeWidth={1} />;
    }
    case 'star': {
      const outer = r;
      const inner = r * 0.44;
      const pts = Array.from({ length: 10 }, (_, i) => {
        const rad = i % 2 === 0 ? outer : inner;
        const a = ((i * 36 - 90) * Math.PI) / 180;
        return `${Math.cos(a) * rad},${Math.sin(a) * rad}`;
      }).join(' ');
      return <polygon points={pts} fill={fill} stroke={border} strokeWidth={1} />;
    }
    case 'ring':
      return (
        <>
          <circle r={r} fill="transparent" stroke={border} strokeWidth={2} opacity={0.25} />
          <circle r={r * 0.62} fill={fill} stroke={border} strokeWidth={1} />
        </>
      );
    case 'square': {
      const s = r * 1.55;
      return (
        <rect
          x={-s / 2}
          y={-s / 2}
          width={s}
          height={s}
          rx={4}
          fill={fill}
          stroke={border}
          strokeWidth={1}
        />
      );
    }
    case 'capsule': {
      const w = r * 1.3;
      const h = r * 1.75;
      return (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={w / 2}
          fill={fill}
          stroke={border}
          strokeWidth={1}
        />
      );
    }
    default:
      return <circle r={r} fill={fill} stroke={border} strokeWidth={1} />;
  }
}

/* ── SVG bubble node ────────────────────────────────────────────── */
function BubbleNode({
  b,
  dragging,
  design,
  onDragStart,
}: {
  b: Bubble;
  dragging: boolean;
  design: BubbleDesign;
  onDragStart: (e: React.PointerEvent) => void;
}) {
  const c = KIND_COLOR[b.kind];
  const isHub = b.id === 'hub';
  return (
    <g
      transform={`translate(${b.x},${b.y})`}
      style={{ cursor: 'grab' }}
      onPointerDown={onDragStart}
    >
      <circle r={b.r + 4} fill={c.border} opacity={0.07} />
      <BubbleShape r={b.r} fill={c.fill} border={c.border} design={isHub ? 'circle' : design} />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        y={b.sublabel ? -5 : 0}
        fill={c.text}
        fontSize={isHub ? 9 : b.r > 32 ? 10 : 9}
        fontWeight={700}
        fontFamily="var(--font-serif)"
        letterSpacing="0.04em"
        style={{ pointerEvents: 'none' }}
      >
        {b.label}
      </text>
      {b.sublabel && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={7}
          fill={c.border}
          fontSize={7}
          fontWeight={600}
          fontFamily="var(--font-serif)"
          letterSpacing="0.1em"
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        >
          {b.sublabel}
        </text>
      )}
      {dragging && (
        <circle r={b.r + 2} fill="none" stroke={c.border} strokeWidth={1.5} opacity={0.5} />
      )}
    </g>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function InfographicsView({ onClose }: { onClose?: () => void }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showLines, setShowLines] = useState(true);
  const [design, setDesign] = useState<BubbleDesign>('circle');
  const [designOpen, setDesignOpen] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
  }, []);

  function onDragStart(id: string, e: React.PointerEvent) {
    const b = bubbles.find((x) => x.id === id);
    if (!b) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const scale = 340 / rect.width;
    dragOffset.current = {
      dx: b.x - (e.clientX - rect.left) * scale,
      dy: b.y - (e.clientY - rect.top) * scale,
    };
    setDraggingId(id);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const scale = 340 / rect.width;
    const nx = (e.clientX - rect.left) * scale + dragOffset.current.dx;
    const ny = (e.clientY - rect.top) * scale + dragOffset.current.dy;
    setBubbles((prev) =>
      prev.map((b) =>
        b.id === draggingId
          ? {
              ...b,
              x: Math.max(b.r, Math.min(340 - b.r, nx)),
              y: Math.max(b.r, Math.min(420 - b.r, ny)),
            }
          : b,
      ),
    );
  }

  const W = 340;
  const H = 420;

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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />

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
        <div style={{ padding: '2px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
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
            Infographics
          </span>

          {/* Lines toggle */}
          <button
            type="button"
            onClick={() => setShowLines((v) => !v)}
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              border: `1px solid rgba(196,160,96,${showLines ? '0.45' : '0.2'})`,
              background: showLines ? 'rgba(196,160,96,0.12)' : 'transparent',
              color: showLines ? '#C4A060' : 'rgba(196,160,96,0.4)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-serif)',
            }}
          >
            Lines
          </button>

          {/* Design dot picker */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDesignOpen((v) => !v)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: `1px solid rgba(196,160,96,${designOpen ? '0.7' : '0.35'})`,
                background: designOpen ? 'rgba(196,160,96,0.2)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#C4A060',
              }}
              title="Bubble design"
            >
              {DESIGNS.find((d) => d.id === design)?.label ?? '○'}
            </button>
            {designOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  zIndex: 10,
                  background: '#1a120a',
                  border: '1px solid rgba(196,160,96,0.22)',
                  borderRadius: 10,
                  padding: 6,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 36px)',
                  gap: 4,
                }}
              >
                {DESIGNS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDesign(d.id);
                      setDesignOpen(false);
                    }}
                    title={d.id}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid rgba(196,160,96,${design === d.id ? '0.6' : '0.2'})`,
                      background: design === d.id ? 'rgba(196,160,96,0.15)' : 'transparent',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#C4A060',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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

        {/* SVG canvas */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: 'block' }}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDraggingId(null)}
        >
          {/* Background grid */}
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={((i + 1) * H) / 9}
              x2={W}
              y2={((i + 1) * H) / 9}
              stroke="rgba(196,160,96,0.04)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={((i + 1) * W) / 7}
              y1={0}
              x2={((i + 1) * W) / 7}
              y2={H}
              stroke="rgba(196,160,96,0.04)"
              strokeWidth={0.5}
            />
          ))}

          {/* Edge gradients */}
          <defs>
            {edges.map((edge) => {
              const a = bubbles.find((b) => b.id === edge.from);
              const bub = bubbles.find((b) => b.id === edge.to);
              if (!a || !bub) return null;
              const ca = KIND_COLOR[a.kind];
              const cb2 = KIND_COLOR[bub.kind];
              return (
                <linearGradient
                  key={`eg-${edge.from}-${edge.to}`}
                  id={`eg-${edge.from}-${edge.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={bub.x}
                  y2={bub.y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={ca.border} />
                  <stop offset="100%" stopColor={cb2.border} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Edges — straight lines, togglable */}
          {showLines &&
            edges.map((edge) => {
              const a = bubbles.find((b) => b.id === edge.from);
              const bub = bubbles.find((b) => b.id === edge.to);
              if (!a || !bub) return null;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={bub.x}
                  y2={bub.y}
                  stroke={`url(#eg-${edge.from}-${edge.to})`}
                  strokeWidth={1}
                  opacity={0.35}
                  strokeDasharray="3,4"
                />
              );
            })}

          {/* Bubbles */}
          {bubbles.map((b) => (
            <BubbleNode
              key={b.id}
              b={b}
              dragging={draggingId === b.id}
              design={design}
              onDragStart={(e) => {
                e.stopPropagation();
                onDragStart(b.id, e);
              }}
            />
          ))}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            padding: '8px 16px 18px',
            flexWrap: 'wrap',
          }}
        >
          {(Object.entries(KIND_COLOR) as [BubbleKind, (typeof KIND_COLOR)[BubbleKind]][]).map(
            ([kind, c]) => (
              <span
                key={kind}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: c.border,
                  opacity: 0.6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: c.border,
                    display: 'inline-block',
                  }}
                />
                {kind}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
