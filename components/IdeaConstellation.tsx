'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/* ── Types ───────────────────────────────────────────────────── */
type NodeShape = 'circle' | 'square' | 'octagon' | 'triangle' | 'diamond' | 'hexagon';
type INode = {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  r: number;
  groupId?: string;
  shape?: NodeShape;
};
type IEdge = { id: string; from: string; to: string };
type IGroup = { id: string; name: string; color: string; areaId: string | null };
interface StarData {
  nodes: INode[];
  edges: IEdge[];
  groups: IGroup[];
}
type AreaChannel = { id: string; title: string; color: string };

/* ── Colors ──────────────────────────────────────────────────── */
const COLORS = [
  '#C4A060', // ochre
  '#4A6882', // navy
  '#78B8A8', // teal
  '#6B7A50', // camo green
  '#C09878', // warm
  '#7090C0', // slate blue
  '#E09090', // rose
  '#A87858', // terra
];

const GROUP_COLORS = [
  '#C4A060',
  '#7A8A6A',
  '#5A6878',
  '#A87858',
  '#8A9878',
  '#A87878',
  '#7A8898',
  '#B898D0',
];

const SHAPES: { id: NodeShape; clip?: string; radius?: number | string }[] = [
  { id: 'circle', radius: '50%' },
  { id: 'square', radius: 12 },
  {
    id: 'octagon',
    clip: 'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
  },
  { id: 'diamond', clip: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
  { id: 'triangle', clip: 'polygon(50% 4%,100% 96%,0% 96%)' },
  { id: 'hexagon', clip: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' },
];

function shapeStyle(shape?: NodeShape): React.CSSProperties {
  const s = SHAPES.find((x) => x.id === shape) ?? SHAPES[0];
  return s.clip
    ? { borderRadius: 0, clipPath: s.clip }
    : { borderRadius: s.radius as string | number };
}

const LS_KEY = 'colourmap:constellation';
const LS_CMAP = 'colourmap:cmap-data';

function uid() {
  return crypto.randomUUID();
}

function midpoint(ax: number, ay: number, bx: number, by: number) {
  return { x: (ax + bx) / 2, y: (ay + by) / 2 };
}

function pillStyle(color: string): CSSProperties {
  return {
    background: `${color}18`,
    border: `1px solid ${color}55`,
    borderRadius: 999,
    padding: '3px 9px',
    fontFamily: 'var(--font-serif)',
    fontSize: 9,
    letterSpacing: '0.1em',
    color,
    cursor: 'pointer',
  };
}

/* ── Main component ──────────────────────────────────────────── */
export default function IdeaConstellation({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<StarData>({ nodes: [], edges: [], groups: [] });
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connPt, setConnPt] = useState<{ x: number; y: number } | null>(null);
  const [adding, setAdding] = useState<{ x: number; y: number } | null>(null);
  const [addText, setAddText] = useState('');
  const [addColor, setAddColor] = useState(COLORS[0]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [groupPicker, setGroupPicker] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [designPicker, setDesignPicker] = useState<string | null>(null);
  const [areaPicker, setAreaPicker] = useState<string | null>(null);
  const [areaChannels, setAreaChannels] = useState<AreaChannel[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const didDragRef = useRef(false);

  /* load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.groups) parsed.groups = [];
        setData(parsed);
      }
    } catch {}

    function loadCmap() {
      try {
        const raw = localStorage.getItem(LS_CMAP);
        if (raw) setAreaChannels(JSON.parse(raw).channels ?? []);
      } catch {}
    }
    loadCmap();
    window.addEventListener('colourmap:cmap-updated', loadCmap);
    return () => window.removeEventListener('colourmap:cmap-updated', loadCmap);
  }, []);

  const persist = useCallback((next: StarData) => {
    setData(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  /* connection line follows pointer */
  useEffect(() => {
    if (!connecting) return;
    function onMove(e: MouseEvent) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setConnPt({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [connecting]);

  /* global escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (connecting) {
        setConnecting(null);
        setConnPt(null);
        return;
      }
      if (adding) {
        setAdding(null);
        return;
      }
      if (renaming) {
        setRenaming(null);
        return;
      }
      if (groupPicker) {
        setGroupPicker(null);
        return;
      }
      if (areaPicker) {
        setAreaPicker(null);
        return;
      }
      if (selected) {
        setSelected(null);
        return;
      }
      onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [connecting, adding, renaming, groupPicker, areaPicker, selected, onClose]);

  /* canvas background tap */
  function handleCanvasTap(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).dataset.canvas !== 'bg') return;
    if (groupPicker) {
      setGroupPicker(null);
      return;
    }
    if (areaPicker) {
      setAreaPicker(null);
      return;
    }
    if (connecting) {
      setConnecting(null);
      setConnPt(null);
      return;
    }
    if (renaming) {
      setRenaming(null);
      return;
    }
    if (selected) {
      setSelected(null);
      return;
    }
    const rect = canvasRef.current!.getBoundingClientRect();
    setAdding({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setAddText('');
  }

  function commitAdd() {
    const t = addText.trim();
    if (!adding || !t) {
      setAdding(null);
      return;
    }
    const node: INode = { id: uid(), text: t, x: adding.x, y: adding.y, color: addColor, r: 42 };
    persist({ ...data, nodes: [...data.nodes, node] });
    setAdding(null);
    setAddText('');
  }

  /* rename */
  function startRename(nodeId: string) {
    const node = data.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setRenaming(nodeId);
    setRenameText(node.text);
    setSelected(null);
    setGroupPicker(null);
  }

  function commitRename() {
    const t = renameText.trim();
    if (!renaming || !t) {
      setRenaming(null);
      return;
    }
    persist({ ...data, nodes: data.nodes.map((n) => (n.id === renaming ? { ...n, text: t } : n)) });
    setRenaming(null);
  }

  /* drag */
  function startDrag(e: React.PointerEvent<HTMLDivElement>, id: string) {
    if (connecting) return;
    e.stopPropagation();
    const node = data.nodes.find((n) => n.id === id)!;
    const rect = canvasRef.current!.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    draggingRef.current = {
      id,
      ox: e.clientX - rect.left - node.x,
      oy: e.clientY - rect.top - node.y,
    };
    didDragRef.current = false;
    setAdding(null);
    setGroupPicker(null);

    function onMove(ev: PointerEvent) {
      if (!draggingRef.current) return;
      if (!didDragRef.current && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
      didDragRef.current = true;
      const r = canvasRef.current!.getBoundingClientRect();
      const x = ev.clientX - r.left - draggingRef.current.ox;
      const y = ev.clientY - r.top - draggingRef.current.oy;
      setData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
      }));
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      draggingRef.current = null;
      setData((prev) => {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(prev));
        } catch {}
        return prev;
      });
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  /* tap node */
  function tapNode(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (connecting) {
      if (connecting === id) {
        setConnecting(null);
        setConnPt(null);
        return;
      }
      const exists = data.edges.some(
        (ed) =>
          (ed.from === connecting && ed.to === id) || (ed.from === id && ed.to === connecting),
      );
      if (!exists)
        persist({ ...data, edges: [...data.edges, { id: uid(), from: connecting, to: id }] });
      setConnecting(null);
      setConnPt(null);
      return;
    }
    setGroupPicker(null);
    setDesignPicker(null);
    setAreaPicker(null);
    setSelected(id);
    setAdding(null);
  }

  function deleteNode(id: string) {
    persist({
      nodes: data.nodes.filter((n) => n.id !== id),
      edges: data.edges.filter((e) => e.from !== id && e.to !== id),
      groups: data.groups,
    });
    setSelected(null);
  }

  function deleteEdge(id: string) {
    persist({ ...data, edges: data.edges.filter((e) => e.id !== id) });
  }

  /* groups */
  function createGroup(nodeId: string) {
    const name = newGroupName.trim();
    if (!name) return;
    const group: IGroup = {
      id: uid(),
      name,
      color: GROUP_COLORS[data.groups.length % GROUP_COLORS.length],
      areaId: null,
    };
    persist({
      ...data,
      groups: [...data.groups, group],
      nodes: data.nodes.map((n) => (n.id === nodeId ? { ...n, groupId: group.id } : n)),
    });
    setGroupPicker(null);
    setNewGroupName('');
  }

  function assignGroup(nodeId: string, groupId: string) {
    persist({ ...data, nodes: data.nodes.map((n) => (n.id === nodeId ? { ...n, groupId } : n)) });
    setGroupPicker(null);
  }

  function unassignGroup(nodeId: string) {
    persist({
      ...data,
      nodes: data.nodes.map((n) => (n.id === nodeId ? { ...n, groupId: undefined } : n)),
    });
    setGroupPicker(null);
  }

  function renameGroup(groupId: string, name: string) {
    persist({ ...data, groups: data.groups.map((g) => (g.id === groupId ? { ...g, name } : g)) });
  }

  function deleteGroup(groupId: string) {
    persist({
      ...data,
      groups: data.groups.filter((g) => g.id !== groupId),
      nodes: data.nodes.map((n) => (n.groupId === groupId ? { ...n, groupId: undefined } : n)),
    });
    setAreaPicker(null);
  }

  function linkGroupToArea(groupId: string, areaId: string | null) {
    persist({ ...data, groups: data.groups.map((g) => (g.id === groupId ? { ...g, areaId } : g)) });
    setAreaPicker(null);
  }

  /* derived */
  const connFromNode = data.nodes.find((n) => n.id === connecting);
  const renamingNode = data.nodes.find((n) => n.id === renaming);

  const groupCentroids = data.groups.map((g) => {
    const members = data.nodes.filter((n) => n.groupId === g.id);
    if (members.length === 0) return { group: g, x: 0, y: 0, radius: 0, visible: false };
    const cx = members.reduce((s, n) => s + n.x, 0) / members.length;
    const cy = members.reduce((s, n) => s + n.y, 0) / members.length;
    const radius =
      members.length === 1
        ? members[0].r + 20
        : Math.max(...members.map((n) => Math.hypot(n.x - cx, n.y - cy))) + 58;
    return { group: g, x: cx, y: cy, radius, visible: true };
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,6,3,0.97)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px 10px',
          borderBottom: '1px solid rgba(196,160,96,0.1)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(196,160,96,0.45)',
          }}
        >
          Constellation
        </span>
        {connecting ? (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontStyle: 'italic',
              color: '#B898D0',
              opacity: 0.75,
            }}
          >
            tap a node to connect
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontStyle: 'italic',
              color: 'rgba(196,160,96,0.3)',
            }}
          >
            tap canvas to add
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid rgba(196,160,96,0.25)',
            borderRadius: 999,
            color: 'rgba(196,160,96,0.55)',
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '5px 14px',
          }}
        >
          close
        </button>
      </div>

      {/* ── Canvas ─────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        onClick={handleCanvasTap}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: connecting ? 'crosshair' : 'default',
        }}
      >
        <div data-canvas="bg" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

        {/* ── SVG layer ────────────────────────────────────── */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <defs>
            <filter id="cg">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* group halos */}
          {groupCentroids
            .filter((gc) => gc.visible)
            .map(({ group, x, y, radius }) => (
              <circle
                key={group.id}
                cx={x}
                cy={y}
                r={radius}
                fill={`${group.color}07`}
                stroke={group.color}
                strokeOpacity={0.22}
                strokeWidth={1.5}
                strokeDasharray="6 9"
              />
            ))}

          {/* edges */}
          {data.edges.map((edge) => {
            const a = data.nodes.find((n) => n.id === edge.from);
            const b = data.nodes.find((n) => n.id === edge.to);
            if (!a || !b) return null;
            const mp = midpoint(a.x, a.y, b.x, b.y);
            return (
              <g key={edge.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={a.color}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  strokeDasharray="5 7"
                  filter="url(#cg)"
                />
                <circle
                  cx={mp.x}
                  cy={mp.y}
                  r={8}
                  fill="rgba(255,255,255,0.02)"
                  stroke={a.color}
                  strokeOpacity={0.18}
                  strokeWidth={1}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onClick={() => deleteEdge(edge.id)}
                />
              </g>
            );
          })}

          {/* connection preview */}
          {connecting && connFromNode && connPt && (
            <line
              x1={connFromNode.x}
              y1={connFromNode.y}
              x2={connPt.x}
              y2={connPt.y}
              stroke="#B898D0"
              strokeWidth={1}
              strokeOpacity={0.55}
              strokeDasharray="5 7"
            />
          )}
        </svg>

        {/* ── Group name labels ─────────────────────────────── */}
        {groupCentroids
          .filter((gc) => gc.visible)
          .map(({ group, x, y, radius }) => {
            const linkedArea = areaChannels.find((a) => a.id === group.areaId);
            return (
              <div
                key={`lbl-${group.id}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y - radius - 4,
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: group.color,
                    opacity: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.name}
                </span>
                {linkedArea && (
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 8,
                      color: linkedArea.color,
                      opacity: 0.4,
                      letterSpacing: '0.1em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    · {linkedArea.title} ·
                  </span>
                )}
              </div>
            );
          })}

        {/* ── Nodes ───────────────────────────────────────── */}
        {data.nodes.map((node) => {
          const isSel = selected === node.id;
          const isConn = connecting === node.id;
          const isTarget = !!(connecting && connecting !== node.id);
          const group = node.groupId ? data.groups.find((g) => g.id === node.groupId) : null;
          const isShowingGroupPicker = groupPicker === node.id;
          const isShowingDesignPicker = designPicker === node.id;

          return (
            <div
              key={node.id}
              onClick={(e) => tapNode(e, node.id)}
              onPointerDown={(e) => startDrag(e, node.id)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)',
                zIndex: isSel || isConn || isShowingGroupPicker || isShowingDesignPicker ? 10 : 2,
                cursor: connecting ? 'pointer' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              {/* bubble */}
              <div
                style={{
                  width: node.r * 2,
                  height: node.r * 2,
                  ...shapeStyle(node.shape),
                  background: isConn
                    ? `${node.color}30`
                    : isSel
                      ? `${node.color}22`
                      : `${node.color}14`,
                  border: `${isSel || isConn ? 2 : 1}px solid ${node.color}${isSel ? 'cc' : isConn ? 'aa' : '55'}`,
                  boxShadow: group
                    ? `0 0 14px ${group.color}28${isSel ? `, 0 0 18px ${node.color}50` : ''}`
                    : isSel
                      ? `0 0 18px ${node.color}50`
                      : isConn
                        ? `0 0 24px ${node.color}70`
                        : isTarget
                          ? `0 0 12px ${node.color}40`
                          : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                  transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                  position: 'relative',
                }}
              >
                {group && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: group.color,
                      opacity: 0.65,
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12,
                    lineHeight: 1.3,
                    color: 'rgba(240,216,152,0.85)',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    pointerEvents: 'none',
                  }}
                >
                  {node.text}
                </span>
              </div>

              {/* controls */}
              {isSel && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 4,
                    marginTop: 6,
                    pointerEvents: 'all',
                    maxWidth: 200,
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(node.id);
                    }}
                    style={pillStyle('rgba(196,160,96,0.55)')}
                  >
                    rename
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnecting(node.id);
                    }}
                    style={pillStyle('#B898D0')}
                  >
                    link
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupPicker(groupPicker === node.id ? null : node.id);
                      setDesignPicker(null);
                      setNewGroupName('');
                    }}
                    style={pillStyle(group?.color ?? 'rgba(196,160,96,0.45)')}
                  >
                    {group ? `✦ ${group.name}` : 'group'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesignPicker(designPicker === node.id ? null : node.id);
                      setGroupPicker(null);
                    }}
                    style={pillStyle('rgba(196,160,96,0.5)')}
                  >
                    design
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    style={pillStyle('rgba(200,80,80,0.7)')}
                  >
                    del
                  </button>
                </div>
              )}

              {/* group picker */}
              {isShowingGroupPicker && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: node.r * 2 + 42,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10,6,3,0.96)',
                    border: '1px solid rgba(196,160,96,0.18)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    minWidth: 175,
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
                  }}
                >
                  {data.groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => assignGroup(node.id, g.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        background: node.groupId === g.id ? `${g.color}20` : 'none',
                        border: `1px solid ${g.color}${node.groupId === g.id ? '55' : '28'}`,
                        borderRadius: 8,
                        padding: '5px 9px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 11,
                        color: g.color,
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: g.color,
                          flexShrink: 0,
                          display: 'inline-block',
                          opacity: 0.75,
                        }}
                      />
                      {g.name}
                    </button>
                  ))}
                  {node.groupId && (
                    <button
                      type="button"
                      onClick={() => unassignGroup(node.id)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(196,160,96,0.14)',
                        borderRadius: 8,
                        padding: '4px 9px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 10,
                        color: 'rgba(196,160,96,0.38)',
                      }}
                    >
                      remove from group
                    </button>
                  )}
                  <div
                    style={{
                      borderTop: '1px solid rgba(196,160,96,0.1)',
                      paddingTop: 7,
                      display: 'flex',
                      gap: 5,
                    }}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') createGroup(node.id);
                      }}
                      placeholder="new constellation…"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(196,160,96,0.22)',
                        outline: 'none',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 11,
                        color: 'rgba(240,216,152,0.8)',
                        padding: '2px 0',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => createGroup(node.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(196,160,96,0.6)',
                        fontSize: 16,
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* design picker */}
              {isShowingDesignPicker && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: node.r * 2 + 42,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10,6,3,0.96)',
                    border: '1px solid rgba(196,160,96,0.18)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
                    minWidth: 180,
                  }}
                >
                  {/* colour row */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          persist({
                            ...data,
                            nodes: data.nodes.map((n) =>
                              n.id === node.id ? { ...n, color: c } : n,
                            ),
                          })
                        }
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: c,
                          border:
                            node.color === c
                              ? '2px solid rgba(255,255,255,0.8)'
                              : '1.5px solid transparent',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          opacity: 0.88,
                        }}
                      />
                    ))}
                  </div>
                  {/* shape row */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {SHAPES.map((s) => {
                      const active = (node.shape ?? 'circle') === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            persist({
                              ...data,
                              nodes: data.nodes.map((n) =>
                                n.id === node.id ? { ...n, shape: s.id } : n,
                              ),
                            })
                          }
                          style={{
                            width: 28,
                            height: 28,
                            background: active ? `${node.color}30` : `${node.color}10`,
                            border: `1.5px solid ${active ? `${node.color}cc` : `${node.color}30`}`,
                            cursor: 'pointer',
                            padding: 0,
                            flexShrink: 0,
                            ...(s.clip
                              ? { borderRadius: 0, clipPath: s.clip }
                              : { borderRadius: s.radius as string | number }),
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Rename overlay ────────────────────────────────── */}
        {renaming && renamingNode && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: renamingNode.x,
              top: renamingNode.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              width: renamingNode.r * 2,
              height: renamingNode.r * 2,
              borderRadius: '50%',
              background: `${renamingNode.color}22`,
              border: `2px solid ${renamingNode.color}cc`,
              boxShadow: `0 0 20px ${renamingNode.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              autoFocus
              type="text"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setRenaming(null);
              }}
              style={{
                width: '78%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                color: 'rgba(240,216,152,0.9)',
                textAlign: 'center',
              }}
            />
          </div>
        )}

        {/* ── Add node input ────────────────────────────────── */}
        {adding && (
          <div
            style={{
              position: 'absolute',
              left: adding.x,
              top: adding.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          >
            <div
              style={{
                background: 'rgba(10,6,3,0.94)',
                border: `1px solid ${addColor}55`,
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                boxShadow: `0 0 24px ${addColor}28`,
                minWidth: 170,
              }}
            >
              <input
                autoFocus
                type="text"
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitAdd();
                  if (e.key === 'Escape') setAdding(null);
                }}
                placeholder="idea…"
                spellCheck={false}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  color: 'rgba(240,216,152,0.9)',
                  textAlign: 'center',
                  width: '100%',
                }}
              />
              <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAddColor(c)}
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      background: c,
                      border:
                        addColor === c
                          ? '2px solid rgba(255,255,255,0.8)'
                          : '1.5px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: 0.85,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={commitAdd}
                style={{
                  background: `${addColor}20`,
                  border: `1px solid ${addColor}50`,
                  borderRadius: 8,
                  padding: '5px 0',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: addColor,
                  cursor: 'pointer',
                }}
              >
                add
              </button>
            </div>
          </div>
        )}

        {/* ── Empty hint ───────────────────────────────────── */}
        {data.nodes.length === 0 && !adding && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  fontStyle: 'italic',
                  color: 'rgba(196,160,96,0.28)',
                  letterSpacing: '0.04em',
                  marginBottom: 8,
                }}
              >
                tap anywhere to plant an idea
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  color: 'rgba(196,160,96,0.16)',
                  letterSpacing: '0.06em',
                }}
              >
                drag · link · group into constellations
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Constellations footer ───────────────────────────────── */}
      {data.groups.length > 0 && (
        <div
          style={{
            borderTop: '1px solid rgba(196,160,96,0.1)',
            padding: '7px 14px',
            display: 'flex',
            gap: 7,
            overflowX: 'auto',
            flexShrink: 0,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(196,160,96,0.28)',
              flexShrink: 0,
            }}
          >
            clusters
          </span>
          {data.groups.map((g) => {
            const linkedArea = areaChannels.find((a) => a.id === g.areaId);
            const isPicking = areaPicker === g.id;
            const memberCount = data.nodes.filter((n) => n.groupId === g.id).length;
            return (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: `${g.color}0c`,
                  border: `1px solid ${g.color}28`,
                  borderRadius: 20,
                  padding: '4px 8px 4px 8px',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: g.color,
                    opacity: 0.7,
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
                <input
                  type="text"
                  value={g.name}
                  onChange={(e) => renameGroup(g.id, e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 10,
                    color: g.color,
                    width: Math.max(40, g.name.length * 7),
                    opacity: 0.85,
                  }}
                />
                {memberCount > 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      color: g.color,
                      opacity: 0.38,
                      fontFamily: 'var(--font-serif)',
                    }}
                  >
                    {memberCount}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setAreaPicker(isPicking ? null : g.id)}
                  style={{
                    background: linkedArea ? `${linkedArea.color}14` : 'none',
                    border: `1px solid ${linkedArea ? `${linkedArea.color}38` : `${g.color}22`}`,
                    borderRadius: 999,
                    padding: '1px 6px',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 8,
                    color: linkedArea ? linkedArea.color : g.color,
                    opacity: linkedArea ? 0.85 : 0.4,
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {linkedArea ? (
                    <>
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: linkedArea.color,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      {linkedArea.title || 'area'}
                    </>
                  ) : (
                    '→ area'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deleteGroup(g.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: g.color,
                    opacity: 0.22,
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1,
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>

                {isPicking && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      bottom: '110%',
                      left: 0,
                      background: 'rgba(10,6,3,0.97)',
                      border: '1px solid rgba(196,160,96,0.18)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      zIndex: 30,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      minWidth: 145,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    {g.areaId && (
                      <button
                        type="button"
                        onClick={() => linkGroupToArea(g.id, null)}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(196,160,96,0.14)',
                          borderRadius: 6,
                          padding: '3px 8px',
                          fontFamily: 'var(--font-serif)',
                          fontSize: 9,
                          color: 'rgba(196,160,96,0.38)',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ unlink
                      </button>
                    )}
                    {areaChannels.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => linkGroupToArea(g.id, ch.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: g.areaId === ch.id ? `${ch.color}18` : 'none',
                          border: `1px solid ${g.areaId === ch.id ? `${ch.color}50` : `${ch.color}28`}`,
                          borderRadius: 6,
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          color: ch.color,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: ch.color,
                            flexShrink: 0,
                            display: 'inline-block',
                          }}
                        />
                        {ch.title || 'Unnamed'}
                      </button>
                    ))}
                    {areaChannels.length === 0 && (
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          color: 'rgba(196,160,96,0.3)',
                          fontStyle: 'italic',
                        }}
                      >
                        no areas yet
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
