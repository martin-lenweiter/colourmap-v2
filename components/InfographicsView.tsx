'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Types ──────────────────────────────────────────────────────── */
type BubbleKind = 'emotion' | 'mission' | 'focus' | 'idea' | 'body' | 'mind';
type BubbleDesign =
  | 'circle'
  | 'pill'
  | 'diamond'
  | 'hex'
  | 'star'
  | 'ring'
  | 'square'
  | 'capsule'
  | 'arc';

const DESIGNS: { id: BubbleDesign; label: string }[] = [
  { id: 'circle', label: '○' },
  { id: 'arc', label: '◕' },
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
  accentColor?: string;
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

/* ── EMBF axis definitions ──────────────────────────────────────── */
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

const EMBF_AXES = [
  {
    axis: 'emotion',
    label: 'Emotion',
    key: 'colourmap:process-idx',
    max: 9,
    labels: EMOTION_LABELS,
    color: '#C4A060',
  },
  {
    axis: 'mind',
    label: 'Mind',
    key: 'colourmap:presence-idx',
    max: 5,
    labels: MIND_LABELS,
    color: '#A098C0',
  },
  {
    axis: 'body',
    label: 'Body',
    key: 'colourmap:body-idx',
    max: 7,
    labels: BODY_LABELS,
    color: '#C4A878',
  },
  {
    axis: 'focus',
    label: 'Focus',
    key: 'colourmap:focus-idx',
    max: 7,
    labels: FOCUS_LABELS,
    color: '#88D098',
  },
] as const;

/* ── Context types + helpers ─────────────────────────────────────── */
type ContextEntry = { date: string; idx: number; note?: string };
type ContextDef = { id: string; label: string; entries: ContextEntry[] };

const AXIS_LABELS: Record<string, string[]> = {
  emotion: EMOTION_LABELS,
  mind: MIND_LABELS,
  body: BODY_LABELS,
  focus: FOCUS_LABELS,
};

const AXIS_COLOR: Record<string, string> = {
  emotion: '#C4A060',
  mind: '#A098C0',
  body: '#C4A878',
  focus: '#88D098',
};

const DEFAULT_KIND_CONTEXTS: Record<string, ContextDef[]> = {
  emotion: [
    { id: 'band', label: 'Band', entries: [] },
    { id: 'family', label: 'Family', entries: [] },
    { id: 'work', label: 'Work', entries: [] },
    { id: 'self', label: 'Self', entries: [] },
  ],
  mind: [
    { id: 'focus-sessions', label: 'Focus sessions', entries: [] },
    { id: 'creative', label: 'Creative', entries: [] },
    { id: 'learning', label: 'Learning', entries: [] },
  ],
  body: [
    { id: 'sleep', label: 'Sleep', entries: [] },
    { id: 'exercise', label: 'Exercise', entries: [] },
    { id: 'nutrition', label: 'Nutrition', entries: [] },
  ],
  focus: [
    { id: 'deep-work', label: 'Deep work', entries: [] },
    { id: 'band-practice', label: 'Band practice', entries: [] },
    { id: 'study', label: 'Study', entries: [] },
  ],
};

function loadKindContexts(kind: string): ContextDef[] {
  try {
    const raw = JSON.parse(localStorage.getItem(`colourmap:${kind}-contexts`) ?? 'null');
    if (Array.isArray(raw)) return raw as ContextDef[];
  } catch {}
  return DEFAULT_KIND_CONTEXTS[kind] ?? [];
}

function saveKindContexts(kind: string, ctxs: ContextDef[]) {
  try {
    localStorage.setItem(`colourmap:${kind}-contexts`, JSON.stringify(ctxs));
  } catch {}
}

function stateColor(idx: number, max: number): string {
  const r = idx / max;
  if (r <= 0.15) return '#9B4444';
  if (r <= 0.35) return '#9B7A44';
  if (r <= 0.55) return '#C4A060';
  if (r <= 0.75) return '#70A870';
  return '#60A8B0';
}

/* ── Position persistence ───────────────────────────────────────── */
const POSITIONS_KEY = 'colourmap:bubble-positions';

function loadSavedPositions(): Map<string, { x: number; y: number }> {
  try {
    const raw = JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? 'null');
    if (Array.isArray(raw)) {
      return new Map(
        (raw as { id: string; x: number; y: number }[]).map(({ id, x, y }) => [id, { x, y }]),
      );
    }
  } catch {}
  return new Map();
}

function saveBubblePositions(bubbles: Bubble[]) {
  try {
    localStorage.setItem(
      POSITIONS_KEY,
      JSON.stringify(bubbles.map(({ id, x, y }) => ({ id, x, y }))),
    );
  } catch {}
}

/* ── Data loader ────────────────────────────────────────────────── */
function loadBubbles(): { bubbles: Bubble[]; edges: Edge[] } {
  const raw: Omit<Bubble, 'x' | 'y'>[] = [];
  const edges: Edge[] = [];

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

  const hubId = 'hub';
  raw.push({ id: hubId, kind: 'emotion', label: 'Now', r: 20 });
  edges.push({ from: hubId, to: eId });
  edges.push({ from: hubId, to: mId });
  edges.push({ from: hubId, to: bId });
  edges.push({ from: hubId, to: fId });

  // Context sub-bubbles
  const kindParent: Record<string, string> = { emotion: eId, mind: mId, body: bId, focus: fId };
  for (const kind of ['emotion', 'mind', 'body', 'focus']) {
    const contexts = loadKindContexts(kind);
    const kindLabels = AXIS_LABELS[kind] ?? EMOTION_LABELS;
    const labelMax = kindLabels.length - 1;
    contexts.forEach((ctx) => {
      const id = `kctx-${kind}-${ctx.id}`;
      const latest = ctx.entries[ctx.entries.length - 1];
      raw.push({
        id,
        kind: kind as BubbleKind,
        label: ctx.label,
        sublabel: latest ? kindLabels[latest.idx] : undefined,
        r: 16,
        accentColor: latest ? stateColor(latest.idx, labelMax) : undefined,
      });
      edges.push({ from: kindParent[kind], to: id });
    });
  }

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

  const savedPos = loadSavedPositions();
  const bubbles = layoutBubbles(raw).map((b) => {
    const saved = savedPos.get(b.id);
    return saved ? { ...b, x: saved.x, y: saved.y } : b;
  });
  return { bubbles, edges };
}

/* ── Visibility helper ──────────────────────────────────────────── */
function isBubbleVisible(id: string, filterKind: string): boolean {
  if (id === 'hub') return true;
  if (id === `${filterKind}-0`) return true;
  if (id.startsWith(`kctx-${filterKind}-`)) return true;
  return false;
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
    case 'arc': {
      const trackR = r * 0.82;
      const rad = (d: number) => (d * Math.PI) / 180;
      const pt = (deg: number): [number, number] => [
        Math.cos(rad(deg)) * trackR,
        Math.sin(rad(deg)) * trackR,
      ];
      const [sx, sy] = pt(-135);
      const [ex, ey] = pt(135);
      const [bx, by] = pt(30);
      return (
        <>
          {/* Faint 270° track */}
          <path
            d={`M ${sx} ${sy} A ${trackR} ${trackR} 0 1 1 ${ex} ${ey}`}
            fill="none"
            stroke={border}
            strokeWidth={2}
            opacity={0.18}
            strokeLinecap="round"
          />
          {/* Active arc: -135° → 30° clockwise (165°) */}
          <path
            d={`M ${sx} ${sy} A ${trackR} ${trackR} 0 0 1 ${bx} ${by}`}
            fill="none"
            stroke={border}
            strokeWidth={2.2}
            opacity={0.88}
            strokeLinecap="round"
          />
          {/* Ball handle */}
          <circle cx={bx} cy={by} r={r * 0.22} fill={fill} stroke={border} strokeWidth={1.5} />
          <circle cx={bx} cy={by} r={r * 0.1} fill={border} />
          {/* Center pip */}
          <circle r={r * 0.16} fill={border} opacity={0.45} />
        </>
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
  const isEmbf = ['emotion-0', 'mind-0', 'body-0', 'focus-0'].includes(b.id);
  const isCtx = b.id.startsWith('kctx-');
  const fill = b.accentColor ? `${b.accentColor}22` : c.fill;
  const border = b.accentColor ?? c.border;
  return (
    <g
      transform={`translate(${b.x},${b.y})`}
      style={{ cursor: 'grab' }}
      onPointerDown={onDragStart}
    >
      <circle r={b.r + 4} fill={border} opacity={0.07} />
      <BubbleShape r={b.r} fill={fill} border={border} design={isHub ? 'circle' : design} />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        y={b.sublabel ? -4 : 0}
        fill={b.accentColor ?? c.text}
        fontSize={isHub ? 9 : isCtx ? 7 : b.r > 32 ? 10 : 9}
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
          y={isCtx ? 5 : 7}
          fill={border}
          fontSize={isCtx ? 6 : 7}
          fontWeight={600}
          fontFamily="var(--font-serif)"
          letterSpacing="0.1em"
          opacity={0.7}
          style={{ pointerEvents: 'none' }}
        >
          {b.sublabel}
        </text>
      )}
      {isEmbf && !dragging && (
        <circle
          r={b.r + 7}
          fill="none"
          stroke={c.border}
          strokeWidth={0.8}
          opacity={0.2}
          strokeDasharray="2,3"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {dragging && (
        <circle r={b.r + 2} fill="none" stroke={border} strokeWidth={1.5} opacity={0.5} />
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
  const [_activeBox, setActiveBox] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, number>>({});
  const [view, setView] = useState<'map' | 'axis'>('map');
  const [activeKind, setActiveKind] = useState<string | null>(null);
  const [allContexts, setAllContexts] = useState<Record<string, ContextDef[]>>({});
  const [activeCtx, setActiveCtx] = useState<string | null>(null);
  const [ctxNote, setCtxNote] = useState('');
  const [ctxPickerIdx, setCtxPickerIdx] = useState<number | null>(null);
  const [addingCtx, setAddingCtx] = useState(false);
  const [newCtxLabel, setNewCtxLabel] = useState('');
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const tapCandidateRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const axissvgRef = useRef<SVGSVGElement>(null);
  const axisSliderDraggingRef = useRef(false);

  useEffect(() => {
    const loaded: Record<string, number> = {};
    for (const ax of EMBF_AXES) {
      try {
        const v = localStorage.getItem(ax.key);
        loaded[ax.axis] =
          v !== null ? Math.min(ax.max, Math.max(0, Number(v))) : Math.floor(ax.max / 2);
      } catch {
        loaded[ax.axis] = Math.floor(ax.max / 2);
      }
    }
    setVals(loaded);
    const ctxMap: Record<string, ContextDef[]> = {};
    for (const k of ['emotion', 'mind', 'body', 'focus']) ctxMap[k] = loadKindContexts(k);
    setAllContexts(ctxMap);
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
  }, []);

  function _setAxisVal(axis: string, key: string, idx: number) {
    try {
      localStorage.setItem(key, String(idx));
    } catch {}
    setVals((prev) => ({ ...prev, [axis]: idx }));
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
    setActiveBox(null);
  }

  function setAxisValLive(axis: string, key: string, idx: number) {
    try {
      localStorage.setItem(key, String(idx));
    } catch {}
    setVals((prev) => ({ ...prev, [axis]: idx }));
  }

  function refreshBubbles() {
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
  }

  function pointerToAxisVal(clientX: number, clientY: number, max: number): number {
    const el = axissvgRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const px = (clientX - rect.left) * (340 / rect.width);
    const py = (clientY - rect.top) * (210 / rect.height);
    let angle = Math.atan2(py - 105, px - 170) * (180 / Math.PI);
    if (angle > 135) angle = 135;
    if (angle < -135) angle = -135;
    return Math.round(((angle + 135) / 270) * max);
  }

  function onDragStart(id: string, e: React.PointerEvent) {
    const b = bubbles.find((x) => x.id === id);
    if (!b) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const scale = 340 / rect.width;
    dragOffset.current = {
      dx: b.x - (e.clientX - rect.left) * scale,
      dy: b.y - (e.clientY - rect.top) * scale,
    };
    tapCandidateRef.current = { id, x: e.clientX, y: e.clientY };
    setDraggingId(id);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    if (tapCandidateRef.current) {
      const dx = e.clientX - tapCandidateRef.current.x;
      const dy = e.clientY - tapCandidateRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) tapCandidateRef.current = null;
    }
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

  function onPointerUp() {
    if (tapCandidateRef.current) {
      const { id } = tapCandidateRef.current;
      tapCandidateRef.current = null;
      const b = bubbles.find((x) => x.id === id);
      if (b && b.id !== 'hub' && ['emotion', 'mind', 'body', 'focus'].includes(b.kind)) {
        if (b.id.startsWith('kctx-')) {
          const rest = b.id.slice(5);
          const kind = rest.split('-')[0];
          const ctxId = rest.slice(kind.length + 1);
          const latest = (allContexts[kind] ?? [])
            .find((c) => c.id === ctxId)
            ?.entries.slice(-1)[0];
          setView('axis');
          setActiveKind(kind);
          setActiveCtx(ctxId);
          setCtxPickerIdx(latest?.idx ?? null);
          setCtxNote('');
        } else {
          setView('axis');
          setActiveKind(b.kind);
          setActiveCtx(null);
        }
      }
    } else if (draggingId) {
      // Real drag ended — persist positions
      setBubbles((prev) => {
        saveBubblePositions(prev);
        return prev;
      });
    }
    setDraggingId(null);
  }

  function saveContextEntry(kind: string, ctxId: string, idx: number, note: string) {
    const date = new Date().toISOString().slice(0, 10);
    setAllContexts((prev) => {
      const kindCtxs = (prev[kind] ?? []).map((c) =>
        c.id === ctxId
          ? { ...c, entries: [...c.entries, { date, idx, note: note || undefined }] }
          : c,
      );
      saveKindContexts(kind, kindCtxs);
      return { ...prev, [kind]: kindCtxs };
    });
    setCtxNote('');
    setCtxPickerIdx(null);
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
  }

  function addContext(kind: string, label: string) {
    if (!label.trim()) return;
    const id = `ctx-${Date.now()}`;
    setAllContexts((prev) => {
      const kindCtxs = [...(prev[kind] ?? []), { id, label: label.trim(), entries: [] }];
      saveKindContexts(kind, kindCtxs);
      return { ...prev, [kind]: kindCtxs };
    });
    setNewCtxLabel('');
    setAddingCtx(false);
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
  }

  function removeContext(kind: string, ctxId: string) {
    setAllContexts((prev) => {
      const kindCtxs = (prev[kind] ?? []).filter((c) => c.id !== ctxId);
      saveKindContexts(kind, kindCtxs);
      return { ...prev, [kind]: kindCtxs };
    });
    if (activeCtx === ctxId) setActiveCtx(null);
    const { bubbles: b, edges: e } = loadBubbles();
    setBubbles(b);
    setEdges(e);
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
          overflow: 'visible',
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
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDesignOpen((v) => !v)}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `1px solid rgba(196,160,96,${designOpen ? '0.7' : '0.35'})`,
                background: designOpen ? 'rgba(196,160,96,0.35)' : 'rgba(196,160,96,0.18)',
                cursor: 'pointer',
                padding: 0,
              }}
            />
            {designOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  zIndex: 400,
                  background: '#1a120a',
                  border: '1px solid rgba(196,160,96,0.22)',
                  borderRadius: 10,
                  padding: 6,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 32px)',
                  gap: 4,
                }}
              >
                {DESIGNS.map((d) => {
                  const isActive = design === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDesign(d.id);
                        setDesignOpen(false);
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        padding: 0,
                        border: `1px solid rgba(196,160,96,${isActive ? '0.55' : '0.15'})`,
                        background: isActive ? 'rgba(196,160,96,0.12)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width={20} height={20} viewBox="-10 -10 20 20">
                        <BubbleShape
                          r={7}
                          fill={isActive ? 'rgba(196,160,96,0.22)' : 'rgba(196,160,96,0.07)'}
                          border={isActive ? '#C4A060' : 'rgba(196,160,96,0.4)'}
                          design={d.id}
                        />
                      </svg>
                    </button>
                  );
                })}
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

        {/* ── Axis view ── mini constellation + inline detail */}
        {view === 'axis' &&
          activeKind &&
          (() => {
            const kindColor = AXIS_COLOR[activeKind] ?? '#C4A060';
            const kindLabels = AXIS_LABELS[activeKind] ?? EMOTION_LABELS;
            const kindContexts = allContexts[activeKind] ?? [];
            const kindTitle = EMBF_AXES.find((a) => a.axis === activeKind)?.label ?? activeKind;
            const labelMax = kindLabels.length - 1;
            const ax = EMBF_AXES.find((a) => a.axis === activeKind)!;
            const curAxisVal = vals[activeKind] ?? Math.floor(ax.max / 2);

            const AW = 340;
            const AH = 210;
            const acx = AW / 2;
            const acy = AH / 2;
            const n = kindContexts.length;
            const spread = n <= 3 ? 88 : n <= 5 ? 82 : 72;

            const ctxBubbleData = kindContexts.map((ctx, i) => {
              const angle = n > 0 ? (i / n) * Math.PI * 2 - Math.PI / 2 : 0;
              const latest = ctx.entries[ctx.entries.length - 1];
              return {
                ctx,
                x: Math.max(26, Math.min(AW - 26, acx + Math.cos(angle) * spread)),
                y: Math.max(26, Math.min(AH - 26, acy + Math.sin(angle) * spread)),
                latest,
                accent: latest ? stateColor(latest.idx, labelMax) : undefined,
                isActive: ctx.id === activeCtx,
              };
            });

            const activeCtxDef = activeCtx ? kindContexts.find((c) => c.id === activeCtx) : null;
            const cur =
              ctxPickerIdx ?? activeCtxDef?.entries.slice(-1)[0]?.idx ?? Math.floor(labelMax / 2);

            return (
              <div>
                {/* Axis header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 6px' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setView('map');
                      setActiveKind(null);
                      setActiveCtx(null);
                      setAddingCtx(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: `${kindColor}99`,
                      fontSize: 18,
                      lineHeight: 1,
                      padding: '0 4px 0 0',
                    }}
                  >
                    ‹
                  </button>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: `${kindColor}88`,
                    }}
                  >
                    {kindTitle}
                  </span>
                  {!addingCtx && (
                    <button
                      type="button"
                      onClick={() => setAddingCtx(true)}
                      style={{
                        background: 'none',
                        border: `1px solid ${kindColor}4d`,
                        borderRadius: 20,
                        cursor: 'pointer',
                        color: `${kindColor}99`,
                        fontSize: 11,
                        padding: '2px 10px',
                        letterSpacing: '0.1em',
                      }}
                    >
                      + add
                    </button>
                  )}
                </div>

                {/* Add context input */}
                {addingCtx && (
                  <div style={{ display: 'flex', gap: 6, padding: '0 12px 10px' }}>
                    <input
                      autoFocus
                      value={newCtxLabel}
                      onChange={(e) => setNewCtxLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addContext(activeKind, newCtxLabel);
                        if (e.key === 'Escape') {
                          setAddingCtx(false);
                          setNewCtxLabel('');
                        }
                      }}
                      placeholder="e.g. Morning routine"
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${kindColor}40`,
                        borderRadius: 8,
                        padding: '6px 10px',
                        color: `${kindColor}e6`,
                        fontSize: 12,
                        fontFamily: 'var(--font-serif)',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addContext(activeKind, newCtxLabel)}
                      style={{
                        background: `${kindColor}26`,
                        border: `1px solid ${kindColor}59`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: kindColor,
                        fontSize: 11,
                        padding: '0 10px',
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCtx(false);
                        setNewCtxLabel('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: `${kindColor}66`,
                        fontSize: 16,
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Mini constellation */}
                <svg
                  ref={axissvgRef}
                  viewBox={`0 0 ${AW} ${AH}`}
                  width="100%"
                  style={{ display: 'block' }}
                >
                  {ctxBubbleData.map(({ ctx, x, y, isActive }) => (
                    <line
                      key={ctx.id}
                      x1={acx}
                      y1={acy}
                      x2={x}
                      y2={y}
                      stroke={isActive ? kindColor : `${kindColor}30`}
                      strokeWidth={isActive ? 1.2 : 0.7}
                      strokeDasharray={isActive ? 'none' : '3,5'}
                    />
                  ))}

                  {/* Center axis bubble — interactive arc slider */}
                  <g transform={`translate(${acx},${acy})`}>
                    {(() => {
                      const sliderR = 36;
                      const radFn = (d: number) => (d * Math.PI) / 180;
                      const sliderAngle = -135 + (curAxisVal / ax.max) * 270;
                      const sx = Math.cos(radFn(-135)) * sliderR;
                      const sy = Math.sin(radFn(-135)) * sliderR;
                      const ex = Math.cos(radFn(135)) * sliderR;
                      const ey = Math.sin(radFn(135)) * sliderR;
                      const hx = Math.cos(radFn(sliderAngle)) * sliderR;
                      const hy = Math.sin(radFn(sliderAngle)) * sliderR;
                      const activeDeg = sliderAngle + 135;
                      const largeArc = activeDeg > 180 ? 1 : 0;
                      const handleColor = stateColor(curAxisVal, ax.max);
                      return (
                        <>
                          <circle r={44} fill={`${kindColor}05`} />
                          <circle r={24} fill={`${kindColor}12`} />
                          {/* Track 270° */}
                          <path
                            d={`M ${sx} ${sy} A ${sliderR} ${sliderR} 0 1 1 ${ex} ${ey}`}
                            fill="none"
                            stroke={kindColor}
                            strokeWidth={3.5}
                            opacity={0.13}
                            strokeLinecap="round"
                          />
                          {/* Active arc */}
                          {curAxisVal > 0 && (
                            <path
                              d={`M ${sx} ${sy} A ${sliderR} ${sliderR} 0 ${largeArc} 1 ${hx} ${hy}`}
                              fill="none"
                              stroke={handleColor}
                              strokeWidth={3.5}
                              opacity={0.75}
                              strokeLinecap="round"
                            />
                          )}
                          {/* Ball handle */}
                          <circle
                            cx={hx}
                            cy={hy}
                            r={6.5}
                            fill={`${handleColor}28`}
                            stroke={handleColor}
                            strokeWidth={1.5}
                          />
                          <circle cx={hx} cy={hy} r={2.8} fill={handleColor} />
                          {/* Labels */}
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            y={-4}
                            fill={handleColor}
                            fontSize={9}
                            fontWeight={700}
                            fontFamily="var(--font-serif)"
                            letterSpacing="0.04em"
                            style={{ pointerEvents: 'none' }}
                          >
                            {kindLabels[curAxisVal]}
                          </text>
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            y={7}
                            fill={`${kindColor}55`}
                            fontSize={6}
                            fontWeight={600}
                            fontFamily="var(--font-serif)"
                            letterSpacing="0.14em"
                            style={{ pointerEvents: 'none' }}
                          >
                            {kindTitle.toUpperCase()}
                          </text>
                          {/* Drag interaction area */}
                          <circle
                            r={44}
                            fill="transparent"
                            style={{ cursor: 'grab' }}
                            onPointerDown={(e) => {
                              axisSliderDraggingRef.current = true;
                              (e.currentTarget as Element).setPointerCapture(e.pointerId);
                              const val = pointerToAxisVal(e.clientX, e.clientY, ax.max);
                              setAxisValLive(ax.axis, ax.key, val);
                            }}
                            onPointerMove={(e) => {
                              if (!axisSliderDraggingRef.current) return;
                              const val = pointerToAxisVal(e.clientX, e.clientY, ax.max);
                              setAxisValLive(ax.axis, ax.key, val);
                            }}
                            onPointerUp={() => {
                              if (axisSliderDraggingRef.current) {
                                axisSliderDraggingRef.current = false;
                                refreshBubbles();
                              }
                            }}
                          />
                        </>
                      );
                    })()}
                  </g>

                  {/* Context bubbles */}
                  {ctxBubbleData.map(({ ctx, x, y, accent, isActive, latest }) => (
                    <g
                      key={ctx.id}
                      transform={`translate(${x},${y})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (isActive) {
                          setActiveCtx(null);
                        } else {
                          setActiveCtx(ctx.id);
                          setCtxPickerIdx(latest?.idx ?? Math.floor(labelMax / 2));
                          setCtxNote('');
                        }
                      }}
                    >
                      {isActive && (
                        <circle
                          r={30}
                          fill="none"
                          stroke={kindColor}
                          strokeWidth={0.8}
                          strokeOpacity={0.35}
                          strokeDasharray="2,3"
                        />
                      )}
                      <circle
                        r={24}
                        fill={accent ? `${accent}1a` : `${kindColor}0d`}
                        stroke={isActive ? kindColor : (accent ?? `${kindColor}50`)}
                        strokeWidth={isActive ? 1.5 : 0.8}
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        y={latest ? -5 : 0}
                        fill={accent ?? kindColor}
                        fontSize={8}
                        fontWeight={700}
                        fontFamily="var(--font-serif)"
                        letterSpacing="0.03em"
                        style={{ pointerEvents: 'none' }}
                      >
                        {ctx.label}
                      </text>
                      {latest && (
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          y={6}
                          fill={accent ?? `${kindColor}80`}
                          fontSize={6}
                          fontFamily="var(--font-serif)"
                          letterSpacing="0.06em"
                          style={{ pointerEvents: 'none' }}
                        >
                          {kindLabels[Math.min(latest.idx, labelMax)]}
                        </text>
                      )}
                    </g>
                  ))}

                  {n === 0 && (
                    <text
                      x={acx}
                      y={acy + 72}
                      textAnchor="middle"
                      fill={`${kindColor}40`}
                      fontSize={10}
                      fontFamily="var(--font-serif)"
                    >
                      tap + add to create contexts
                    </text>
                  )}
                </svg>

                {/* Context detail — inline below constellation */}
                {activeCtxDef && (
                  <div style={{ borderTop: `1px solid ${kindColor}1a`, padding: '14px 12px 16px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
                    >
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 700,
                          color: `${kindColor}d9`,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {activeCtxDef.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeContext(activeKind, activeCtxDef.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: `${kindColor}40`,
                          fontSize: 11,
                        }}
                      >
                        remove
                      </button>
                    </div>

                    {/* Color squares slider */}
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: stateColor(cur, labelMax),
                          fontFamily: 'var(--font-serif)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          marginBottom: 7,
                          textAlign: 'center',
                        }}
                      >
                        {kindLabels[cur]}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 3,
                          alignItems: 'flex-end',
                          height: 26,
                          touchAction: 'none',
                          cursor: 'pointer',
                        }}
                        onPointerDown={(e) => {
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const idx = Math.max(
                            0,
                            Math.min(
                              labelMax,
                              Math.floor(
                                ((e.clientX - rect.left) / rect.width) * kindLabels.length,
                              ),
                            ),
                          );
                          setCtxPickerIdx(idx);
                          (e.currentTarget as Element).setPointerCapture(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                          if (e.buttons === 0) return;
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const idx = Math.max(
                            0,
                            Math.min(
                              labelMax,
                              Math.floor(
                                ((e.clientX - rect.left) / rect.width) * kindLabels.length,
                              ),
                            ),
                          );
                          setCtxPickerIdx(idx);
                        }}
                      >
                        {kindLabels.map((_, i) => {
                          const base = stateColor(i, labelMax);
                          const isActive = cur === i;
                          return (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: isActive ? 26 : 16,
                                borderRadius: 3,
                                background: isActive ? base : `${base}4a`,
                                border: isActive ? `1px solid ${base}cc` : 'none',
                                transition: 'height 0.1s',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <textarea
                      value={ctxNote}
                      onChange={(e) => setCtxNote(e.target.value)}
                      placeholder="Reflection… (optional)"
                      rows={2}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${kindColor}33`,
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: `${kindColor}d9`,
                        fontSize: 12,
                        fontFamily: 'var(--font-serif)',
                        resize: 'none',
                        outline: 'none',
                        marginBottom: 8,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => saveContextEntry(activeKind, activeCtxDef.id, cur, ctxNote)}
                      style={{
                        width: '100%',
                        background: `${stateColor(cur, labelMax)}22`,
                        border: `1px solid ${stateColor(cur, labelMax)}66`,
                        borderRadius: 10,
                        padding: '9px 0',
                        cursor: 'pointer',
                        color: stateColor(cur, labelMax),
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-serif)',
                        marginBottom: 12,
                      }}
                    >
                      Check in
                    </button>

                    {activeCtxDef.entries.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: `${kindColor}59`,
                            marginBottom: 8,
                          }}
                        >
                          History
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                            maxHeight: 120,
                            overflowY: 'auto',
                          }}
                        >
                          {[...activeCtxDef.entries].reverse().map((entry, i) => (
                            <div
                              key={i}
                              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                            >
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: stateColor(entry.idx, labelMax),
                                  marginTop: 4,
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {entry.note ? (
                                  <p
                                    style={{
                                      fontSize: 10,
                                      color: `${kindColor}80`,
                                      margin: 0,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {entry.note}
                                  </p>
                                ) : (
                                  <span style={{ fontSize: 9, color: `${kindColor}44` }}>—</span>
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: 9,
                                  color: `${kindColor}4d`,
                                  flexShrink: 0,
                                  marginTop: 2,
                                }}
                              >
                                {entry.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        {/* ── Map view ── */}
        {view === 'map' && (
          <>
            {/* Axis filter tabs */}
            <div
              style={{ display: 'flex', gap: 5, padding: '0 12px 10px', justifyContent: 'center' }}
            >
              {EMBF_AXES.map((ax) => {
                const active = filterKind === ax.axis;
                return (
                  <button
                    key={ax.axis}
                    type="button"
                    onClick={() => setFilterKind(active ? null : ax.axis)}
                    style={{
                      padding: '3px 12px',
                      borderRadius: 20,
                      border: `1px solid ${active ? ax.color : `${ax.color}44`}`,
                      background: active ? `${ax.color}22` : 'transparent',
                      color: active ? ax.color : `${ax.color}77`,
                      fontSize: 9,
                      fontWeight: active ? 700 : 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {ax.label}
                  </button>
                );
              })}
            </div>

            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              style={{ display: 'block' }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
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

              {showLines &&
                edges.map((edge) => {
                  const a = bubbles.find((b) => b.id === edge.from);
                  const bub = bubbles.find((b) => b.id === edge.to);
                  if (!a || !bub) return null;
                  const edgeVisible =
                    !filterKind ||
                    (isBubbleVisible(edge.from, filterKind) &&
                      isBubbleVisible(edge.to, filterKind));
                  return (
                    <line
                      key={`${edge.from}-${edge.to}`}
                      x1={a.x}
                      y1={a.y}
                      x2={bub.x}
                      y2={bub.y}
                      stroke={`url(#eg-${edge.from}-${edge.to})`}
                      strokeWidth={1}
                      opacity={edgeVisible ? 0.35 : 0.04}
                      strokeDasharray="3,4"
                    />
                  );
                })}

              {bubbles.map((b) => {
                const visible = !filterKind || isBubbleVisible(b.id, filterKind);
                return (
                  <g key={b.id} opacity={visible ? 1 : 0.08} style={{ transition: 'opacity 0.2s' }}>
                    <BubbleNode
                      b={b}
                      dragging={draggingId === b.id}
                      design={design}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        onDragStart(b.id, e);
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* EMBF boxes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: 6,
                padding: '4px 12px 12px',
              }}
            >
              {EMBF_AXES.map((ax) => {
                const idx = vals[ax.axis] ?? Math.floor(ax.max / 2);
                const currentDesignIdx = DESIGNS.findIndex((d) => d.id === design);
                const _currentDesign = DESIGNS[currentDesignIdx];
                return (
                  <div
                    key={ax.axis}
                    onClick={() => {
                      setView('axis');
                      setActiveKind(ax.axis);
                      setActiveCtx(null);
                      setActiveBox(null);
                    }}
                    style={{
                      position: 'relative',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${ax.color}44`,
                      borderRadius: 10,
                      padding: '18px 4px 7px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {/* Design cycle dot */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDesign(DESIGNS[(currentDesignIdx + 1) % DESIGNS.length].id);
                      }}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        border: `1px solid ${ax.color}66`,
                        background: `${ax.color}33`,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: `${ax.color}bb`,
                      }}
                    >
                      {ax.label}
                    </span>
                    <span style={{ fontSize: 7, letterSpacing: '0.06em', color: `${ax.color}66` }}>
                      {ax.labels[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
