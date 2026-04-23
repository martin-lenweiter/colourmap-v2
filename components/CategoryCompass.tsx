'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CATEGORY COMPASS — alternative overview where pizza slices
   are your life categories instead of fixed axes.
   Three compasses: Feeling / Doing / Sharing.
   Tap a slice → inline state + recent entries + quick add.
   ═══════════════════════════════════════════════════════════ */

const CATS_KEY = 'colourmap:life-categories';
const LOG_KEY = 'colourmap:life-log';
const ASSIGN_KEY = 'colourmap:category-compass-assign';

interface LifeCategory {
  id: string;
  name: string;
  color: string;
  state?: 'stuck' | 'flowing' | null;
}

interface LogEntry {
  id: string;
  categoryId: string;
  text: string;
  createdAt: string;
  kind?: 'flowing' | 'stuck';
}

type CompassId = 'feeling' | 'doing' | 'sharing';

const COMPASSES: { id: CompassId; label: string; color: string }[] = [
  { id: 'feeling', label: 'Feeling', color: '#D4805A' },
  { id: 'doing', label: 'Doing', color: '#6890B0' },
  { id: 'sharing', label: 'Sharing', color: '#6B7F4E' },
];

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
  } catch {}
}

export default function CategoryCompass() {
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [assignments, setAssignments] = useState<Record<string, CompassId>>({});
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setCategories(ls<LifeCategory[]>(CATS_KEY, []));
    setLogs(ls<LogEntry[]>(LOG_KEY, []));
    setAssignments(ls<Record<string, CompassId>>(ASSIGN_KEY, {}));
  }, []);

  function saveAssignments(next: Record<string, CompassId>) {
    setAssignments(next);
    ss(ASSIGN_KEY, next);
  }

  function assignCategory(catId: string, compass: CompassId) {
    const next = { ...assignments, [catId]: compass };
    saveAssignments(next);
  }

  function unassignCategory(catId: string) {
    const next = { ...assignments };
    delete next[catId];
    saveAssignments(next);
  }

  function toggleState(catId: string) {
    const updated = categories.map((c) => {
      if (c.id !== catId) return c;
      const next: 'stuck' | 'flowing' | null =
        c.state === 'flowing' ? 'stuck' : c.state === 'stuck' ? null : 'flowing';
      return { ...c, state: next };
    });
    setCategories(updated);
    ss(CATS_KEY, updated);
  }

  function addLog(catId: string, text: string) {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      categoryId: catId,
      text,
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...logs];
    setLogs(next);
    ss(LOG_KEY, next);
    setQuickInput('');
  }

  // Group categories by compass
  const grouped: Record<CompassId, LifeCategory[]> = { feeling: [], doing: [], sharing: [] };
  const unassigned: LifeCategory[] = [];
  for (const cat of categories) {
    const compass = assignments[cat.id];
    if (compass) {
      grouped[compass].push(cat);
    } else {
      unassigned.push(cat);
    }
  }

  const selectedCat = categories.find((c) => c.id === selectedSlice);
  const selectedLogs = selectedSlice
    ? logs.filter((l) => l.categoryId === selectedSlice).slice(0, 5)
    : [];

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5C3018',
          }}
        >
          Your Life Map
        </p>
        <button
          type="button"
          onClick={() => setAssigning((s) => !s)}
          className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
          style={{
            color: assigning ? '#D4805A' : '#8A6A4A',
            background: assigning ? '#D4805A12' : 'transparent',
            border: `1px solid ${assigning ? '#D4805A30' : '#C4A06015'}`,
            opacity: assigning ? 1 : 0.5,
          }}
        >
          {assigning ? 'done' : 'assign'}
        </button>
      </div>

      {/* Three compasses as pizza circles */}
      <div className="flex justify-center gap-6">
        {COMPASSES.map((compass) => {
          const cats = grouped[compass.id];
          const sliceCount = Math.max(cats.length, 1);
          const r = 52;
          const cx = 60;
          const cy = 60;

          return (
            <div key={compass.id} className="flex flex-col items-center gap-2">
              <svg width={120} height={120} className="cursor-pointer">
                {/* Background circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={`${compass.color}08`}
                  stroke={`${compass.color}20`}
                  strokeWidth={1}
                />

                {/* Category slices */}
                {cats.length > 0 ? (
                  cats.map((cat, i) => {
                    const startAngle = -Math.PI / 2 + (i / sliceCount) * Math.PI * 2;
                    const endAngle = -Math.PI / 2 + ((i + 1) / sliceCount) * Math.PI * 2;
                    const midAngle = (startAngle + endAngle) / 2;

                    const x1 = cx + r * Math.cos(startAngle);
                    const y1 = cy + r * Math.sin(startAngle);
                    const x2 = cx + r * Math.cos(endAngle);
                    const y2 = cy + r * Math.sin(endAngle);
                    const largeArc = sliceCount === 1 ? 1 : 0;

                    const isSelected = selectedSlice === cat.id;
                    const labelR = r * 0.6;
                    const lx = cx + labelR * Math.cos(midAngle);
                    const ly = cy + labelR * Math.sin(midAngle);

                    return (
                      <g key={cat.id} onClick={() => setSelectedSlice(isSelected ? null : cat.id)}>
                        <path
                          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={cat.color}
                          opacity={
                            isSelected
                              ? 0.5
                              : cat.state === 'stuck'
                                ? 0.2
                                : cat.state === 'flowing'
                                  ? 0.4
                                  : 0.25
                          }
                          stroke={isSelected ? cat.color : '#F5ECDC'}
                          strokeWidth={isSelected ? 2 : 1}
                          className="transition-all"
                        />
                        <text
                          x={lx}
                          y={ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: cats.length > 4 ? '8px' : '9px',
                            fontWeight: 700,
                            fill: '#5C3018',
                            opacity: isSelected ? 0.9 : 0.5,
                            pointerEvents: 'none',
                          }}
                        >
                          {cat.name.length > 6 ? `${cat.name.slice(0, 5)}…` : cat.name}
                        </text>
                        {/* State dot */}
                        {cat.state && (
                          <circle
                            cx={cx + (r - 10) * Math.cos(midAngle)}
                            cy={cy + (r - 10) * Math.sin(midAngle)}
                            r={3}
                            fill={cat.state === 'flowing' ? '#7AAA58' : '#D06040'}
                            opacity={0.8}
                          />
                        )}
                      </g>
                    );
                  })
                ) : (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '10px',
                      fill: '#8A6A4A',
                      opacity: 0.3,
                    }}
                  >
                    empty
                  </text>
                )}

                {/* Center dot */}
                <circle cx={cx} cy={cy} r={4} fill={compass.color} opacity={0.4} />
              </svg>

              {/* Compass label */}
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: compass.color,
                  opacity: 0.7,
                }}
              >
                {compass.label}
              </span>

              {/* Assign mode — drop zone */}
              {assigning && (
                <div
                  className="flex flex-wrap justify-center gap-1 rounded-lg px-2 py-1"
                  style={{
                    background: `${compass.color}08`,
                    border: `1px dashed ${compass.color}30`,
                    minHeight: 28,
                    maxWidth: 120,
                  }}
                >
                  {cats.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => unassignCategory(cat.id)}
                      className="cursor-pointer rounded-full px-1.5 py-0.5 text-[9px] font-semibold transition-all"
                      style={{
                        color: cat.color,
                        background: `${cat.color}15`,
                        border: `1px solid ${cat.color}30`,
                      }}
                      title={`Remove ${cat.name} from ${compass.label}`}
                    >
                      {cat.name} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign mode — unassigned pool */}
      {assigning && unassigned.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              color: '#8A6A4A',
              opacity: 0.5,
            }}
          >
            tap a category, then tap a compass to assign it
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {unassigned.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1">
                <span
                  className="block rounded-full"
                  style={{ width: 6, height: 6, background: cat.color, opacity: 0.7 }}
                />
                <div className="flex gap-0.5">
                  {COMPASSES.map((compass) => (
                    <button
                      key={compass.id}
                      type="button"
                      onClick={() => assignCategory(cat.id, compass.id)}
                      className="cursor-pointer rounded-full transition-all hover:scale-110"
                      style={{
                        width: 14,
                        height: 14,
                        background: compass.color,
                        opacity: 0.4,
                        border: 'none',
                      }}
                      title={`Assign ${cat.name} to ${compass.label}`}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    color: cat.color,
                    fontWeight: 600,
                  }}
                >
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign mode — hint when all assigned */}
      {assigning && unassigned.length === 0 && categories.length > 0 && (
        <p
          className="text-center italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#7AAA58',
            opacity: 0.6,
          }}
        >
          all categories assigned
        </p>
      )}

      {/* No categories hint */}
      {categories.length === 0 && (
        <p
          className="text-center italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            color: '#8A6A4A',
            opacity: 0.4,
          }}
        >
          add life categories first — they become your compass slices
        </p>
      )}

      {/* Selected slice detail */}
      {selectedCat && (
        <div
          className="space-y-3 rounded-2xl border px-4 py-3 animate-in fade-in duration-150"
          style={{
            borderColor: `${selectedCat.color}30`,
            background: `${selectedCat.color}06`,
          }}
        >
          {/* Header: name + state toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="block rounded-full"
                style={{ width: 10, height: 10, background: selectedCat.color }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: selectedCat.color,
                }}
              >
                {selectedCat.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleState(selectedCat.id)}
              className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
              style={{
                color:
                  selectedCat.state === 'flowing'
                    ? '#7AAA58'
                    : selectedCat.state === 'stuck'
                      ? '#D06040'
                      : '#8A6A4A',
                background:
                  selectedCat.state === 'flowing'
                    ? '#7AAA5812'
                    : selectedCat.state === 'stuck'
                      ? '#D0604012'
                      : '#C4A06008',
                border: `1px solid ${
                  selectedCat.state === 'flowing'
                    ? '#7AAA5830'
                    : selectedCat.state === 'stuck'
                      ? '#D0604030'
                      : '#C4A06018'
                }`,
              }}
            >
              {selectedCat.state === 'flowing'
                ? 'flowing'
                : selectedCat.state === 'stuck'
                  ? 'stuck'
                  : 'quiet'}
            </button>
          </div>

          {/* Recent entries */}
          {selectedLogs.length > 0 ? (
            <div className="space-y-1">
              {selectedLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '10px',
                      color: '#8A6A4A',
                      opacity: 0.4,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {new Date(log.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '13px',
                      color: '#5C3018',
                      opacity: 0.8,
                    }}
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                color: '#8A6A4A',
                opacity: 0.35,
              }}
            >
              no entries yet
            </p>
          )}

          {/* Quick add */}
          <div className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickInput.trim()) {
                  addLog(selectedCat.id, quickInput.trim());
                }
              }}
              placeholder="quick note..."
              className="flex-1 border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                color: '#5C3018',
                borderColor: `${selectedCat.color}25`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
