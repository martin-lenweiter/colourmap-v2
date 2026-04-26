'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { setActiveCategoryId } from '@/lib/active-category';

/* ═══════════════════════════════════════════════════════════
   LIFE CATEGORIES — Track what matters over time
   Name your areas. Challenge + Flow in each. See last entry.
   Update what changed. Skip what hasn't. 60 seconds.
   ═══════════════════════════════════════════════════════════ */

const CATS_KEY = 'colourmap:life-categories';
const TARGETS_KEY = 'colourmap:life-targets';
const LOG_KEY = 'colourmap:life-log';
// VIEW_KEY removed when polygon mode was locked (2026-04-26).
const POS_KEY = 'colourmap:life-positions';
const RIVER_KEY = 'colourmap:life-river';

/* ─── Objective & Emotion spectrums ─── */
const _MIND = [
  { level: 'Stuck', color: '#E0908A' },
  { level: 'Overwhelmed', color: '#E8A090' },
  { level: 'Confused', color: '#C8A8C8' },
  { level: 'Restless', color: '#E0B898' },
  { level: 'Loaded', color: '#D8C088' },
  { level: 'Neutral', color: '#D0C8B0' },
  { level: 'Focused', color: '#A8CCA0' },
  { level: 'Efficient', color: '#B0D8D0' },
  { level: 'Relaxed', color: '#B0D0E8' },
  { level: 'Flowing', color: '#B0A0D0' },
  { level: 'Light', color: '#C8A8C0' },
];

const _MODE = [
  { level: 'Resting', color: '#A8B8D0' },
  { level: 'Passive', color: '#B0C8A8' },
  { level: 'Drifting', color: '#D0C8B0' },
  { level: 'Preparing', color: '#D8C088' },
  { level: 'Working', color: '#E0B898' },
  { level: 'Pushing', color: '#E0908A' },
  { level: 'Active', color: '#A8CCA0' },
  { level: 'Building', color: '#90C8B8' },
  { level: 'Creating', color: '#90B8D8' },
  { level: 'On Fire', color: '#B0A0D0' },
];

const CAT_COLORS = [
  '#D4805A',
  '#C4A060',
  '#9B6BA0',
  '#6890B0',
  '#7A9A7A',
  '#C87050',
  '#5A7A8A',
  '#B07070',
];

/* ─── Types ─── */
export type CategoryState = 'stuck' | 'flowing' | null;

export interface LifeCategory {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  state?: CategoryState;
}

interface Target {
  id: string;
  categoryId: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface LogEntry {
  id: string;
  categoryId: string;
  text: string;
  createdAt: string;
  /** Optional — Overview writes with a LifeCategory tag mark entries with flowing/stuck kind. */
  kind?: 'flowing' | 'stuck';
}

interface RiverSnapshot {
  date: string; // YYYY-MM-DD
  values: { categoryId: string; rating: number }[]; // 1-5
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/* ─── Helpers ─── */
function ls<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function ss(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage full — silent */
  }
}

/* ─── Drag Slider (shared pattern) ─── */
function _DragSlider({
  items,
  selectedIdx,
  onSelect,
  size = 20,
}: {
  items: readonly { level: string; color: string }[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gap = 2;

  const idxFromX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return selectedIdx;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const step = size + gap;
    return Math.max(0, Math.min(items.length - 1, Math.floor(x / step)));
  };

  return (
    <div
      ref={containerRef}
      className="flex cursor-pointer justify-center"
      style={{ gap: `${gap}px`, touchAction: 'none' }}
      onMouseDown={(e) => onSelect(idxFromX(e.clientX))}
      onMouseMove={(e) => {
        if (e.buttons > 0) onSelect(idxFromX(e.clientX));
      }}
      onTouchStart={(e) => onSelect(idxFromX(e.touches[0].clientX))}
      onTouchMove={(e) => {
        e.preventDefault();
        onSelect(idxFromX(e.touches[0].clientX));
      }}
    >
      {items.map((h, i) => {
        const isSelected = i === selectedIdx;
        const dist = Math.abs(i - selectedIdx);
        return (
          <div
            key={h.level}
            style={{
              width: size,
              height: size,
              background: h.color,
              opacity: isSelected ? 1 : dist === 1 ? 0.55 : 0.2,
              borderRadius: 3,
              transition: 'opacity 0.15s',
            }}
          />
        );
      })}
    </div>
  );
}

function loadNum(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

/* ─── Component ─── */
export default function LifeCategories() {
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [targetInput, setTargetInput] = useState<Record<string, string>>({});

  // Objective & Emotion state — syncs with FeelingCheckInCard via same localStorage keys
  const [_objective, setObjective] = useState('');
  const [_mindIdx, setMindIdx] = useState(5);
  const [_modeIdx, setModeIdx] = useState(4);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logInput, setLogInput] = useState<Record<string, string>>({});

  // View mode: list (dots+titles), polygon (geometry), cells (organic), river (time + ratings)
  const [sectionOpen, setSectionOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('colourmap:life-categories-open') !== 'false';
  });
  // Locked to polygon per Martin (2026-04-26): "keep life categories
  // in polygon mode." The other view modes (list, cells, river) are
  // dead code paths kept for now in case we re-introduce them as a
  // designer-mode toggle later — typed as the wide union so the
  // existing equality checks still compile.
  type ViewMode = 'list' | 'polygon' | 'cells' | 'river';
  const viewMode = 'polygon' as ViewMode;
  const [riverSnapshots, setRiverSnapshots] = useState<RiverSnapshot[]>([]);
  const [cellPositions, setCellPositions] = useState<Record<string, { x: number; y: number }>>({});
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  /* ─── Load from localStorage ─── */
  useEffect(() => {
    const cats = ls<LifeCategory[]>(CATS_KEY, []);
    setCategories(cats);
    setTargets(ls<Target[]>(TARGETS_KEY, []));
    setLogs(ls<LogEntry[]>(LOG_KEY, []));

    // Load objective & emotion state
    setObjective(
      (() => {
        try {
          return localStorage.getItem('colourmap:current-objective') || '';
        } catch {
          return '';
        }
      })(),
    );
    setMindIdx(loadNum('colourmap:presence-idx', 5));
    setModeIdx(loadNum('colourmap:engagement-idx', 4));

    // View mode is locked to polygon — the localStorage restore was
    // removed when Martin asked to "keep life categories in polygon
    // mode" on 2026-04-26.
    setCellPositions(ls<Record<string, { x: number; y: number }>>(POS_KEY, {}));
    setRiverSnapshots(ls<RiverSnapshot[]>(RIVER_KEY, []));

    // Load categories from backend
    fetch('/api/life-categories')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((data: LifeCategory[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          ss(CATS_KEY, data);
        }
      })
      .catch(() => {});
  }, []);

  // cycleView removed when Martin locked Life Categories to polygon
  // mode on 2026-04-26. View toggle button below was hidden at the
  // same time. Re-introduce as a designer-mode toggle if needed.

  /* ─── River: save today's rating for a category ─── */
  const setRiverRating = useCallback((categoryId: string, rating: number) => {
    setRiverSnapshots((prev) => {
      const today = todayStr();
      const idx = prev.findIndex((s) => s.date === today);
      let next: RiverSnapshot[];
      if (idx >= 0) {
        const snap = prev[idx];
        const vi = snap.values.findIndex((v) => v.categoryId === categoryId);
        const newValues =
          vi >= 0
            ? snap.values.map((v) => (v.categoryId === categoryId ? { ...v, rating } : v))
            : [...snap.values, { categoryId, rating }];
        next = prev.map((s, i) => (i === idx ? { ...s, values: newValues } : s));
      } else {
        // Prepend newest-first
        next = [{ date: today, values: [{ categoryId, rating }] }, ...prev].slice(0, 365);
      }
      ss(RIVER_KEY, next);
      return next;
    });
  }, []);

  const getTodayRating = useCallback(
    (categoryId: string): number | null => {
      const today = todayStr();
      const snap = riverSnapshots.find((s) => s.date === today);
      if (!snap) return null;
      const v = snap.values.find((v) => v.categoryId === categoryId);
      return v ? v.rating : null;
    },
    [riverSnapshots],
  );

  const _saveCellPositions = useCallback((next: Record<string, { x: number; y: number }>) => {
    setCellPositions(next);
    ss(POS_KEY, next);
  }, []);

  /* ─── Target actions ─── */
  const addTarget = useCallback(
    (categoryId: string) => {
      const text = (targetInput[categoryId] || '').trim();
      if (!text) return;
      const t: Target = {
        id: crypto.randomUUID(),
        categoryId,
        text,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      setTargets((prev) => {
        const next = [...prev, t];
        ss(TARGETS_KEY, next);
        return next;
      });
      setTargetInput((prev) => ({ ...prev, [categoryId]: '' }));
    },
    [targetInput],
  );

  const toggleTarget = useCallback((id: string) => {
    setTargets((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null }
          : t,
      );
      ss(TARGETS_KEY, next);
      return next;
    });
  }, []);

  const deleteTarget = useCallback((id: string) => {
    setTargets((prev) => {
      const next = prev.filter((t) => t.id !== id);
      ss(TARGETS_KEY, next);
      return next;
    });
  }, []);

  /* ─── Log actions ─── */
  const addLog = useCallback(
    (categoryId: string) => {
      const text = (logInput[categoryId] || '').trim();
      if (!text) return;
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        categoryId,
        text,
        createdAt: new Date().toISOString(),
      };
      setLogs((prev) => {
        const next = [entry, ...prev].slice(0, 1000);
        ss(LOG_KEY, next);
        return next;
      });
      setLogInput((prev) => ({ ...prev, [categoryId]: '' }));
    },
    [logInput],
  );

  const deleteLog = useCallback((logId: string) => {
    setLogs((prev) => {
      const next = prev.filter((l) => l.id !== logId);
      ss(LOG_KEY, next);
      return next;
    });
  }, []);

  /* ─── Category actions ─── */
  const addCategory = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    const cat: LifeCategory = {
      id: crypto.randomUUID(),
      name,
      color: CAT_COLORS[categories.length % CAT_COLORS.length],
      createdAt: new Date().toISOString(),
    };
    const next = [...categories, cat];
    setCategories(next);
    ss(CATS_KEY, next);
    setNewName('');
    setShowAdd(false);
    setExpandedId(cat.id);
    fetch('/api/life-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cat.name, color: cat.color }),
    }).catch(() => {});
  }, [newName, categories]);

  const cycleCategoryState = useCallback(
    (id: string) => {
      const next = categories.map((c) => {
        if (c.id !== id) return c;
        const order: CategoryState[] = [null, 'flowing', 'stuck'];
        const currentIdx = order.indexOf(c.state ?? null);
        const nextState = order[(currentIdx + 1) % order.length];
        return { ...c, state: nextState };
      });
      setCategories(next);
      ss(CATS_KEY, next);
      const updated = next.find((c) => c.id === id);
      if (updated) {
        fetch(`/api/life-categories/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: updated.state || null }),
        }).catch(() => {});
      }
    },
    [categories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      const next = categories.filter((c) => c.id !== id);
      setCategories(next);
      ss(CATS_KEY, next);
      fetch(`/api/life-categories/${id}`, { method: 'DELETE' }).catch(() => {});
      setTargets((prev) => {
        const cleaned = prev.filter((t) => t.categoryId !== id);
        ss(TARGETS_KEY, cleaned);
        return cleaned;
      });
      setLogs((prev) => {
        const cleaned = prev.filter((l) => l.categoryId !== id);
        ss(LOG_KEY, cleaned);
        return cleaned;
      });
      if (expandedId === id) setExpandedId(null);
    },
    [categories, expandedId],
  );

  /* ─── Objective & Emotion persistence ─── */
  const _updateObjective = useCallback((val: string) => {
    setObjective(val);
    try {
      localStorage.setItem('colourmap:current-objective', val);
    } catch {
      /* silent */
    }
  }, []);

  const _updateMind = useCallback((idx: number) => {
    setMindIdx(idx);
    try {
      localStorage.setItem('colourmap:presence-idx', String(idx));
    } catch {
      /* silent */
    }
  }, []);

  const _updateMode = useCallback((idx: number) => {
    setModeIdx(idx);
    try {
      localStorage.setItem('colourmap:engagement-idx', String(idx));
    } catch {
      /* silent */
    }
  }, []);

  /* ─── Helpers for rendering ─── */
  function catTargets(categoryId: string) {
    return targets.filter((t) => t.categoryId === categoryId);
  }

  function catProgress(categoryId: string): { total: number; done: number } {
    const ct = catTargets(categoryId);
    return { total: ct.length, done: ct.filter((t) => t.done).length };
  }

  return (
    <div
      className="space-y-3 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#8A6A4A50',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Header */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setSectionOpen((prev) => {
              const next = !prev;
              try {
                localStorage.setItem('colourmap:life-categories-open', String(next));
              } catch {}
              return next;
            });
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-2"
          style={{ background: 'none', border: 'none' }}
        >
          <p
            className="text-center text-xs font-semibold uppercase tracking-[0.24em]"
            style={{ color: '#C4A060' }}
          >
            Life Categories
          </p>
          <span
            className="text-sm transition-transform duration-200"
            style={{
              color: '#C4A06080',
              transform: sectionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▾
          </span>
        </button>
        {/* View toggle removed — Life Categories is locked to polygon
            mode (2026-04-26). */}
      </div>

      {sectionOpen && (
        <>
          {/* Category list */}
          {categories.length === 0 && !showAdd && (
            <p
              className="py-6 text-center text-sm"
              style={{ color: '#8A6A4A', fontFamily: 'var(--font-handwritten)', opacity: 0.6 }}
            >
              Name the areas of your life you want to watch.
              <br />
              Shoulder. Organisation. Music. Social. Work.
              <br />
              Whatever matters to you right now.
            </p>
          )}

          {/* Polygon view — categories as vertices of a regular polygon */}
          {viewMode === 'polygon' && categories.length > 0 && (
            <div
              className="relative overflow-hidden rounded-2xl border"
              style={{
                borderColor: '#8A6A4A25',
                background: 'rgba(245,236,220,0.55)',
                height: 340,
              }}
            >
              {(() => {
                const W = 320;
                const H = 340;
                const cx = W / 2;
                const cy = H / 2;
                const n = categories.length;
                const radius = Math.min(W, H) * 0.32;

                // Polygon vertices — starting at top (−π/2)
                const vertices = categories.map((_, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
                  return {
                    x: cx + radius * Math.cos(angle),
                    y: cy + radius * Math.sin(angle),
                  };
                });

                return (
                  <svg
                    width="100%"
                    height={H}
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ display: 'block' }}
                  >
                    {/* Polygon outline connecting vertices */}
                    {n >= 2 && (
                      <polygon
                        points={vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                        fill="rgba(196,160,96,0.06)"
                        stroke="#C4A06050"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                      />
                    )}

                    {/* Lines from center to each vertex */}
                    {vertices.map((v, i) => (
                      <line
                        key={`spoke-${categories[i].id}`}
                        x1={cx}
                        y1={cy}
                        x2={v.x}
                        y2={v.y}
                        stroke="#C4A06030"
                        strokeWidth="0.5"
                      />
                    ))}

                    {/* Center losange */}
                    <rect
                      x={cx - 4}
                      y={cy - 4}
                      width="8"
                      height="8"
                      fill="#C4A060"
                      opacity="0.4"
                      transform={`rotate(45 ${cx} ${cy})`}
                    />

                    {/* Vertices — category dots + labels */}
                    {vertices.map((v, i) => {
                      const cat = categories[i];
                      const _ct = catTargets(cat.id);
                      const progress = catProgress(cat.id);
                      const _totalDone = progress.total > 0 ? progress.done / progress.total : 0;
                      // Uniform vertex size — every category reads as equal weight.
                      // The shape itself communicates "all of these matter the same."
                      const r = 22;
                      return (
                        <g
                          key={cat.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            // Polygon-locked: just set the expanded id
                            // and broadcast the active category so the
                            // compass row scopes to it.
                            setExpandedId(cat.id);
                            setActiveCategoryId(cat.id);
                          }}
                        >
                          {/* Main vertex circle — no outer progress ring */}
                          <circle
                            cx={v.x}
                            cy={v.y}
                            r={r}
                            fill={cat.color}
                            fillOpacity={0.25}
                            stroke={cat.color}
                            strokeOpacity={0.7}
                            strokeWidth={1.2}
                          />
                          {/* Progress done/total inside the circle */}
                          {progress.total > 0 && (
                            <text
                              x={v.x}
                              y={v.y + 4}
                              textAnchor="middle"
                              style={{
                                fontSize: '11px',
                                fontFamily: 'var(--font-serif)',
                                fontWeight: 700,
                                fill: '#5C3018',
                                pointerEvents: 'none',
                              }}
                            >
                              {progress.done}/{progress.total}
                            </text>
                          )}
                          {/* Full category name — wrapped below the circle */}
                          <foreignObject
                            x={v.x - 55}
                            y={v.y + r + 2}
                            width={110}
                            height={40}
                            style={{ pointerEvents: 'none' }}
                          >
                            <div
                              style={{
                                color: '#5C3018',
                                fontFamily: 'var(--font-serif)',
                                fontSize: '11px',
                                fontWeight: 700,
                                textAlign: 'center',
                                lineHeight: 1.15,
                                wordBreak: 'break-word',
                              }}
                            >
                              {cat.name}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
              <p
                className="absolute bottom-2 left-0 right-0 text-center text-[10px]"
                style={{ color: '#8A6A4A50' }}
              >
                tap a vertex to open · {categories.length}-gon
              </p>
            </div>
          )}

          {/* Blobs view — organic draggable shapes, hand-drawn feel */}
          {viewMode === 'cells' && categories.length > 0 && (
            <div
              className="relative overflow-hidden rounded-2xl border"
              style={{
                borderColor: '#8A6A4A25',
                background: 'rgba(245,236,220,0.55)',
                height: 340,
                touchAction: 'none',
              }}
              onMouseMove={(e) => {
                if (!dragRef.current) return;
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;
                setCellPositions((prev) => ({
                  ...prev,
                  [dragRef.current!.id]: {
                    x: dragRef.current!.origX + dx,
                    y: dragRef.current!.origY + dy,
                  },
                }));
              }}
              onMouseUp={() => {
                if (dragRef.current) {
                  ss(POS_KEY, cellPositions);
                  dragRef.current = null;
                }
              }}
              onMouseLeave={() => {
                if (dragRef.current) {
                  ss(POS_KEY, cellPositions);
                  dragRef.current = null;
                }
              }}
              onTouchMove={(e) => {
                if (!dragRef.current) return;
                const t = e.touches[0];
                const dx = t.clientX - dragRef.current.startX;
                const dy = t.clientY - dragRef.current.startY;
                setCellPositions((prev) => ({
                  ...prev,
                  [dragRef.current!.id]: {
                    x: dragRef.current!.origX + dx,
                    y: dragRef.current!.origY + dy,
                  },
                }));
              }}
              onTouchEnd={() => {
                if (dragRef.current) {
                  ss(POS_KEY, cellPositions);
                  dragRef.current = null;
                }
              }}
            >
              {categories.map((cat, i) => {
                const ct = catTargets(cat.id);
                // Size grows with name length AND target count, so full name always fits
                const baseSize = Math.max(88, 60 + cat.name.length * 5);
                const size = Math.min(130, baseSize + Math.min(24, ct.length * 4));
                // Layout: 2-3 columns based on available width (assumes ~320px canvas)
                const perRow = 3;
                const col = i % perRow;
                const row = Math.floor(i / perRow);
                const defaultPos = { x: 12 + col * 104, y: 12 + row * 104 };
                const pos = cellPositions[cat.id] || defaultPos;
                // Deterministic organic border-radius per category
                const seed = (cat.id.charCodeAt(0) + cat.id.charCodeAt(cat.id.length - 1)) % 100;
                const br = (n: number) => 40 + ((seed * (n + 1)) % 25);
                const borderRadius = `${br(1)}% ${br(2)}% ${br(3)}% ${br(4)}% / ${br(5)}% ${br(6)}% ${br(7)}% ${br(8)}%`;

                return (
                  <div
                    key={cat.id}
                    className="absolute flex cursor-move flex-col items-center justify-center border select-none"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: size,
                      height: size,
                      background: `${cat.color}20`,
                      borderColor: `${cat.color}60`,
                      borderRadius,
                      touchAction: 'none',
                    }}
                    onMouseDown={(e) => {
                      dragRef.current = {
                        id: cat.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        origX: pos.x,
                        origY: pos.y,
                      };
                    }}
                    onTouchStart={(e) => {
                      const t = e.touches[0];
                      dragRef.current = {
                        id: cat.id,
                        startX: t.clientX,
                        startY: t.clientY,
                        origX: pos.x,
                        origY: pos.y,
                      };
                    }}
                    onDoubleClick={() => {
                      // Polygon-locked: no mode switch. Also broadcast
                      // the active category so the compass row scopes.
                      setExpandedId(cat.id);
                      setActiveCategoryId(cat.id);
                    }}
                  >
                    <span className="mb-1 h-2 w-2 rounded-full" style={{ background: cat.color }} />
                    <span
                      className="px-2 text-center text-xs font-semibold leading-tight"
                      style={{
                        color: '#5C3018',
                        fontFamily: 'var(--font-serif)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {cat.name}
                    </span>
                  </div>
                );
              })}
              <p
                className="absolute bottom-2 left-0 right-0 text-center text-[10px]"
                style={{ color: '#8A6A4A50' }}
              >
                drag to arrange · double-tap to open
              </p>
            </div>
          )}

          {/* River view — category ratings over time + today's rating inputs */}
          {viewMode === 'river' && categories.length > 0 && (
            <div className="space-y-3">
              {/* Graph: last 14 days */}
              <div
                className="relative overflow-hidden rounded-2xl border"
                style={{
                  borderColor: '#8A6A4A25',
                  background: 'rgba(245,236,220,0.55)',
                  height: 220,
                }}
              >
                {(() => {
                  const W = 320;
                  const H = 220;
                  const padL = 24;
                  const padR = 16;
                  const padT = 16;
                  const padB = 20;
                  const innerW = W - padL - padR;
                  const innerH = H - padT - padB;
                  const DAYS: number = 14;
                  // Build last-14-days date list (oldest → newest)
                  const days: string[] = [];
                  const todayDate = new Date();
                  for (let i = DAYS - 1; i >= 0; i--) {
                    const d = new Date(todayDate);
                    d.setDate(todayDate.getDate() - i);
                    days.push(d.toISOString().split('T')[0]);
                  }
                  const xFor = (i: number) =>
                    padL + (DAYS === 1 ? innerW / 2 : (i * innerW) / (DAYS - 1));
                  const yFor = (r: number) => padT + innerH - ((r - 1) / 4) * innerH;

                  return (
                    <svg
                      width="100%"
                      height={H}
                      viewBox={`0 0 ${W} ${H}`}
                      style={{ display: 'block' }}
                    >
                      {/* Y-axis reference lines */}
                      {[1, 2, 3, 4, 5].map((r) => (
                        <line
                          key={r}
                          x1={padL}
                          y1={yFor(r)}
                          x2={W - padR}
                          y2={yFor(r)}
                          stroke="#C4A06020"
                          strokeWidth="0.5"
                        />
                      ))}
                      {/* Y-axis labels */}
                      {[1, 3, 5].map((r) => (
                        <text
                          key={r}
                          x={padL - 6}
                          y={yFor(r) + 3}
                          textAnchor="end"
                          style={{ fontSize: '9px', fill: '#8A6A4A60' }}
                        >
                          {r}
                        </text>
                      ))}

                      {/* One polyline per category */}
                      {categories.map((cat) => {
                        const points: { x: number; y: number }[] = [];
                        days.forEach((d, i) => {
                          const snap = riverSnapshots.find((s) => s.date === d);
                          const v = snap?.values.find((v) => v.categoryId === cat.id);
                          if (v) points.push({ x: xFor(i), y: yFor(v.rating) });
                        });
                        if (points.length === 0) return null;
                        return (
                          <g key={cat.id}>
                            <polyline
                              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                              fill="none"
                              stroke={cat.color}
                              strokeWidth="1.5"
                              strokeOpacity="0.7"
                            />
                            {points.map((p, i) => (
                              <circle
                                key={`${cat.id}-${i}`}
                                cx={p.x}
                                cy={p.y}
                                r="2.5"
                                fill={cat.color}
                                fillOpacity="0.85"
                              />
                            ))}
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
                <p
                  className="absolute bottom-1 left-0 right-0 text-center text-[10px]"
                  style={{ color: '#8A6A4A50' }}
                >
                  last 14 days
                </p>
              </div>

              {/* Today's rating — 1-5 per category */}
              <div className="space-y-2">
                <p
                  className="text-center text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#C4A06080' }}
                >
                  Today's Rating
                </p>
                {categories.map((cat) => {
                  const todayR = getTodayRating(cat.id);
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: cat.color }}
                      />
                      <span
                        className="flex-1 truncate text-sm font-semibold"
                        style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
                      >
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRiverRating(cat.id, n)}
                            className="h-5 w-5 rounded-md border transition-all duration-150"
                            style={{
                              borderColor: todayR === n ? cat.color : '#8A6A4A20',
                              background:
                                todayR !== null && n <= todayR
                                  ? `${cat.color}${todayR === n ? '60' : '25'}`
                                  : 'transparent',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* List view */}
          {viewMode === 'list' &&
            categories.map((cat) => {
              const isExpanded = expandedId === cat.id;
              const ct = catTargets(cat.id);
              const progress = catProgress(cat.id);
              const catLogs = logs.filter((l) => l.categoryId === cat.id);
              const activeTargets = ct.filter((t) => !t.done);
              const doneTargets = ct.filter((t) => t.done);

              return (
                <div
                  key={cat.id}
                  className="overflow-hidden rounded-2xl border transition-all duration-200"
                  style={{
                    borderColor: ct.length > 0 ? `${cat.color}30` : '#8A6A4A20',
                    background: ct.length > 0 ? `${cat.color}06` : 'rgba(138,106,74,0.02)',
                  }}
                >
                  {/* Collapsed row */}
                  <div className="relative flex w-full items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                      className="absolute inset-0 cursor-pointer"
                      style={{ background: 'transparent', border: 'none' }}
                      aria-label={`Expand ${cat.name}`}
                    />
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: cat.color, position: 'relative', zIndex: 1 }}
                    />
                    <span
                      className="flex-1 font-semibold"
                      style={{
                        color: '#5C3018',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '15px',
                        position: 'relative',
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      {cat.name}
                    </span>
                    {/* Stuck / flowing state pill — click cycles null → flowing → stuck */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cycleCategoryState(cat.id);
                      }}
                      className="relative shrink-0 rounded-full px-2.5 py-0.5 uppercase"
                      style={{
                        zIndex: 2,
                        fontSize: '10px',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        background:
                          cat.state === 'flowing'
                            ? '#7AAA5818'
                            : cat.state === 'stuck'
                              ? '#A05A4018'
                              : 'transparent',
                        border:
                          cat.state === 'flowing'
                            ? '1px solid #7AAA5860'
                            : cat.state === 'stuck'
                              ? '1px solid #A05A4060'
                              : '1px dashed #8A6A4A40',
                        color:
                          cat.state === 'flowing'
                            ? '#5A8048'
                            : cat.state === 'stuck'
                              ? '#A05A40'
                              : '#8A6A4A80',
                        cursor: 'pointer',
                      }}
                      title="Tap to cycle: flowing → stuck → —"
                    >
                      {cat.state === 'flowing' ? 'flowing' : cat.state === 'stuck' ? 'stuck' : '—'}
                    </button>
                    {progress.total > 0 && (
                      <span
                        className="relative text-xs"
                        style={{ color: '#8A6A4A60', zIndex: 1, pointerEvents: 'none' }}
                      >
                        {progress.done}/{progress.total}
                      </span>
                    )}
                    <span
                      className="relative text-xs transition-transform duration-200"
                      style={{
                        color: '#8A6A4A60',
                        zIndex: 1,
                        pointerEvents: 'none',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="space-y-3 px-4 pb-4">
                      {/* Targets */}
                      <div>
                        <p
                          className="mb-2 font-semibold uppercase tracking-wider"
                          style={{ color: cat.color, fontSize: '12px' }}
                        >
                          Targets
                        </p>

                        {/* Active targets */}
                        {activeTargets.map((t) => (
                          <div key={t.id} className="group flex items-center gap-2 py-1">
                            <button
                              type="button"
                              onClick={() => toggleTarget(t.id)}
                              className="h-4 w-4 shrink-0 rounded border transition-colors"
                              style={{ borderColor: `${cat.color}50` }}
                            />
                            <span
                              className="flex-1 text-sm"
                              style={{
                                color: '#5C3018',
                                fontFamily: 'var(--font-handwritten)',
                                fontSize: '15px',
                              }}
                            >
                              {t.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteTarget(t.id)}
                              className="shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-40"
                              style={{ color: '#8A6A4A' }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {/* Done targets — readable, no strike, lighter ochre to signal done */}
                        {doneTargets.map((t) => (
                          <div key={t.id} className="group flex items-center gap-2 py-1">
                            <button
                              type="button"
                              onClick={() => toggleTarget(t.id)}
                              className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                              style={{
                                borderColor: `${cat.color}40`,
                                background: `${cat.color}20`,
                              }}
                            >
                              <span className="text-xs" style={{ color: cat.color }}>
                                ✓
                              </span>
                            </button>
                            <span
                              className="flex-1"
                              style={{
                                color: '#C4A060',
                                fontFamily: 'var(--font-handwritten)',
                                fontSize: '15px',
                                opacity: 0.85,
                              }}
                            >
                              {t.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteTarget(t.id)}
                              className="shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-40"
                              style={{ color: '#8A6A4A' }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {/* Add target input */}
                        <input
                          type="text"
                          value={targetInput[cat.id] || ''}
                          onChange={(e) =>
                            setTargetInput((prev) => ({ ...prev, [cat.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addTarget(cat.id);
                          }}
                          placeholder="+ add target..."
                          className="mt-1 w-full border-b bg-transparent pb-1 outline-none placeholder:opacity-50"
                          style={{
                            borderColor: `${cat.color}15`,
                            color: '#5C3018',
                            fontFamily: 'var(--font-handwritten)',
                            fontSize: '15px',
                          }}
                        />
                      </div>

                      {/* Losange divider */}
                      <div className="flex justify-center">
                        <span
                          className="block h-1.5 w-1.5 rotate-45 rounded-[1px]"
                          style={{ background: '#C4A060', opacity: 0.2 }}
                        />
                      </div>

                      {/* Logbook */}
                      <div>
                        <p
                          className="mb-2 font-semibold uppercase tracking-wider"
                          style={{ color: cat.color, fontSize: '12px' }}
                        >
                          Logbook
                        </p>

                        <input
                          type="text"
                          value={logInput[cat.id] || ''}
                          onChange={(e) =>
                            setLogInput((prev) => ({ ...prev, [cat.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addLog(cat.id);
                          }}
                          placeholder="How's it going..."
                          className="mb-2 w-full border-b bg-transparent pb-1.5 outline-none placeholder:opacity-50"
                          style={{
                            borderColor: '#8A6A4A15',
                            color: '#5C3018',
                            fontFamily: 'var(--font-handwritten)',
                            fontSize: '15px',
                          }}
                        />

                        {catLogs.length > 0 &&
                          (() => {
                            // Split entries into three compartments when any of
                            // the logs came from an Overview write (they carry a
                            // 'kind' field). Untagged entries keep the legacy
                            // "all logs" compartment so nothing gets lost.
                            const flowingLogs = catLogs.filter((l) => l.kind === 'flowing');
                            const stuckLogs = catLogs.filter((l) => l.kind === 'stuck');
                            const otherLogs = catLogs.filter((l) => !l.kind);
                            const hasKindedEntries = flowingLogs.length > 0 || stuckLogs.length > 0;

                            const renderEntry = (log: LogEntry, kindColor?: string) => {
                              const d = new Date(log.createdAt);
                              const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                              return (
                                <div
                                  key={log.id}
                                  className="group flex items-center gap-2"
                                  style={{ minHeight: 28 }}
                                >
                                  <span
                                    className="shrink-0"
                                    style={{
                                      color: '#8A6A4A',
                                      fontSize: '12px',
                                      opacity: 0.75,
                                      lineHeight: '28px',
                                    }}
                                  >
                                    {dateStr}
                                  </span>
                                  {kindColor && (
                                    <span
                                      className="h-2 w-2 shrink-0 rounded-full"
                                      style={{ background: kindColor }}
                                    />
                                  )}
                                  <span
                                    className="flex-1"
                                    style={{
                                      color: '#5C3018',
                                      fontFamily: 'var(--font-handwritten)',
                                      fontSize: '16px',
                                      lineHeight: '28px',
                                    }}
                                  >
                                    {log.text}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => deleteLog(log.id)}
                                    className="shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-40"
                                    style={{ color: '#8A6A4A' }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            };

                            if (!hasKindedEntries) {
                              return (
                                <div className="space-y-1.5">
                                  {otherLogs.slice(0, 10).map((log) => renderEntry(log))}
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-3">
                                {flowingLogs.length > 0 && (
                                  <div>
                                    <p
                                      className="mb-1 font-semibold uppercase tracking-[0.18em]"
                                      style={{ color: '#7AAA58', fontSize: '11px' }}
                                    >
                                      Flowing
                                    </p>
                                    <div className="space-y-1.5">
                                      {flowingLogs
                                        .slice(0, 10)
                                        .map((log) => renderEntry(log, '#7AAA58'))}
                                    </div>
                                  </div>
                                )}
                                {stuckLogs.length > 0 && (
                                  <div>
                                    <p
                                      className="mb-1 font-semibold uppercase tracking-[0.18em]"
                                      style={{ color: '#A05A40', fontSize: '11px' }}
                                    >
                                      Stuck
                                    </p>
                                    <div className="space-y-1.5">
                                      {stuckLogs
                                        .slice(0, 10)
                                        .map((log) => renderEntry(log, '#A05A40'))}
                                    </div>
                                  </div>
                                )}
                                {otherLogs.length > 0 && (
                                  <div>
                                    <p
                                      className="mb-1 font-semibold uppercase tracking-[0.18em]"
                                      style={{ color: '#8A6A4A', fontSize: '11px' }}
                                    >
                                      Notes
                                    </p>
                                    <div className="space-y-1.5">
                                      {otherLogs.slice(0, 10).map((log) => renderEntry(log))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                      </div>

                      {/* Delete category */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
                          style={{ color: '#8A6A4A', fontSize: '12px', opacity: 0.7 }}
                        >
                          remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Add category */}
          {showAdd ? (
            <div className="flex items-center gap-2 px-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCategory();
                  if (e.key === 'Escape') {
                    setShowAdd(false);
                    setNewName('');
                  }
                }}
                onBlur={() => {
                  if (newName.trim()) addCategory();
                  else {
                    setShowAdd(false);
                    setNewName('');
                  }
                }}
                placeholder="Name this area of your life..."
                className="flex-1 border-b bg-transparent pb-1 text-sm outline-none"
                style={{
                  borderColor: '#C4A06060',
                  color: '#5C3018',
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: '15px',
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="mx-auto flex items-center justify-center"
            >
              <span
                className="flex h-6 w-6 rotate-45 items-center justify-center rounded-[3px] border"
                style={{ borderColor: '#C4A06040', background: '#C4A06010' }}
              >
                <span
                  className="-rotate-45 text-sm font-light"
                  style={{ color: '#C4A060', lineHeight: 1 }}
                >
                  +
                </span>
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
