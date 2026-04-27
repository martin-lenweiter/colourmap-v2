'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   ReflectThreeDots — three unlabeled colored dots (Feeling /
   Doing / Sharing), each opens a vertical column of "levels"
   for that axis. Tapping a level opens a textarea so the user
   can journal what's alive for them at that level right now.
   Each entry is timestamped and listed under the level.

   Per Martin (2026-04-26): "do three dots feeling doing and
   sharing. each with its vertical box colour progression. so
   just one vertical aligner at a time. … one colour for each.
   opens each its own vertical column of levels of wellbeing.
   so add one system for the sharing. like lonely. to well
   connected. and the idea is when u click on one level. like
   acceptance. i can write what is in acceptance right now …
   so a txt box opens. and then it tracks these emotions by
   recording what day and what time they were written."

   V1 storage: localStorage. Supabase wire-up tracked as a
   follow-up — the entry shape is intentionally close to the
   designer-observations pattern so the migration is mechanical.
   ═══════════════════════════════════════════════════════════ */

const LS_ENTRIES = 'colourmap:reflect-entries';

type Axis = 'feeling' | 'doing' | 'sharing';

interface AxisDef {
  id: Axis;
  label: string;
  dotColor: string;
  /** Levels listed top-to-bottom — *highest* state first so the
   *  column reads as a ladder you climb. */
  levels: { name: string; color: string }[];
}

const AXES: AxisDef[] = [
  {
    id: 'feeling',
    label: 'Feeling',
    dotColor: '#E08A8A',
    levels: [
      { name: 'Peace', color: '#88C8E8' },
      { name: 'Love', color: '#88D8B0' },
      { name: 'Reason', color: '#A8E090' },
      { name: 'Acceptance', color: '#F0E060' },
      { name: 'Courage', color: '#F8C040' },
      { name: 'Anger', color: '#F0A088' },
      { name: 'Sadness', color: '#E8A0C4' },
      { name: 'Fear', color: '#F080B8' },
      { name: 'Apathy', color: '#D8B0C8' },
      { name: 'Shame', color: '#B8D0E8' },
    ],
  },
  {
    id: 'doing',
    label: 'Doing',
    dotColor: '#C4A060',
    levels: [
      { name: 'In Flow', color: '#90B8D8' },
      { name: 'Working', color: '#A8CCA0' },
      { name: 'Trying', color: '#D8C088' },
      { name: 'Resisting', color: '#E8B898' },
      { name: 'Avoiding', color: '#E0908A' },
    ],
  },
  {
    id: 'sharing',
    label: 'Sharing',
    dotColor: '#5AA8B0',
    levels: [
      { name: 'Connected', color: '#88D8B0' },
      { name: 'Held', color: '#A8E0C8' },
      { name: 'Open', color: '#C8E0E8' },
      { name: 'Quiet', color: '#D0C0DA' },
      { name: 'Withdrawn', color: '#B0A0C8' },
      { name: 'Lonely', color: '#9080B0' },
    ],
  },
];

interface ReflectEntry {
  id: string;
  axis: Axis;
  level: string;
  text: string;
  createdAt: string;
}

function loadEntries(): ReflectEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_ENTRIES);
    return raw ? (JSON.parse(raw) as ReflectEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: ReflectEntry[]) {
  try {
    localStorage.setItem(LS_ENTRIES, JSON.stringify(entries));
  } catch {
    /* silent */
  }
}

function relativeWhen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ReflectThreeDots() {
  const [entries, setEntries] = useState<ReflectEntry[]>([]);
  const [activeAxis, setActiveAxis] = useState<Axis | null>(null);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  function persist(next: ReflectEntry[]) {
    setEntries(next);
    saveEntries(next);
  }

  function addEntry(axis: Axis, level: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const entry: ReflectEntry = {
      id: crypto.randomUUID(),
      axis,
      level,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    persist([entry, ...entries]);
    setInput('');
  }

  function removeEntry(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  const activeAxisDef = AXES.find((a) => a.id === activeAxis) ?? null;

  return (
    <div
      className="space-y-4 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#9B6BA050',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Header */}
      <p
        className="text-center font-semibold uppercase"
        style={{ color: '#9B6BA0', fontSize: '12px', letterSpacing: '0.22em' }}
      >
        Reflect
      </p>

      {/* Three-dot row — unlabeled, just colored dots. The active one
          enlarges; siblings shrink + fade to indicate "one column at
          a time." */}
      <div className="flex items-center justify-center gap-8">
        {AXES.map((axis) => {
          const isOn = activeAxis === axis.id;
          const isOther = activeAxis !== null && !isOn;
          return (
            <button
              key={axis.id}
              type="button"
              onClick={() => {
                setActiveLevel(null);
                setInput('');
                setActiveAxis(isOn ? null : axis.id);
              }}
              className="flex cursor-pointer flex-col items-center gap-2 transition-all"
              style={{ background: 'none', border: 'none', padding: 4 }}
              aria-label={axis.label}
              aria-pressed={isOn}
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: isOn ? 32 : 22,
                  height: isOn ? 32 : 22,
                  background: axis.dotColor,
                  opacity: isOther ? 0.35 : 1,
                  boxShadow: isOn ? `0 4px 14px ${axis.dotColor}55` : 'none',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: isOn ? 700 : 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isOn ? axis.dotColor : '#8A6A4A',
                  opacity: isOn ? 1 : 0.65,
                }}
              >
                {axis.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vertical level column — one axis at a time */}
      {activeAxisDef && (
        <div className="space-y-1.5 animate-in fade-in duration-150" style={{ paddingTop: 4 }}>
          <p
            className="text-center italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              color: '#8A6A4A',
              opacity: 0.7,
              marginBottom: 8,
            }}
          >
            tap a level to write what's there for you right now
          </p>
          {activeAxisDef.levels.map((level) => {
            const levelEntries = entries
              .filter((e) => e.axis === activeAxisDef.id && e.level === level.name)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const isActive = activeLevel === level.name;
            return (
              <div
                key={level.name}
                className="rounded-lg transition-all"
                style={{
                  background: `${level.color}18`,
                  border: `1px solid ${level.color}40`,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveLevel(isActive ? null : level.name);
                    setInput('');
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span
                    className="block rounded-full"
                    style={{
                      width: 14,
                      height: 14,
                      background: level.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="flex-1 text-left"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: level.color,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {level.name}
                  </span>
                  {levelEntries.length > 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: level.color,
                        opacity: 0.7,
                      }}
                    >
                      {levelEntries.length}
                    </span>
                  )}
                </button>
                {isActive && (
                  <div
                    className="space-y-2 px-3 pb-3 animate-in fade-in duration-150"
                    style={{ borderTop: `1px dashed ${level.color}40` }}
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          addEntry(activeAxisDef.id, level.name, input);
                        }
                      }}
                      placeholder={`what's in ${level.name.toLowerCase()} for you right now?`}
                      rows={2}
                      className="mt-2 w-full resize-none rounded-lg bg-white/60 px-3 py-2 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-55"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 14,
                        color: '#5C3018',
                        border: `1px solid ${level.color}40`,
                        lineHeight: 1.45,
                      }}
                    />
                    {input.trim() && (
                      <button
                        type="button"
                        onClick={() => addEntry(activeAxisDef.id, level.name, input)}
                        className="cursor-pointer rounded-full px-3 py-1"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: level.color,
                          background: `${level.color}22`,
                          border: `1px solid ${level.color}70`,
                        }}
                      >
                        register
                      </button>
                    )}
                  </div>
                )}
                {/* History thread for this level */}
                {levelEntries.length > 0 && (
                  <div className="space-y-1.5 px-3 pb-2">
                    {levelEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md"
                        style={{
                          background: 'rgba(255,255,255,0.55)',
                          padding: '6px 10px',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: 11,
                              color: '#8A6A4A',
                              opacity: 0.65,
                            }}
                          >
                            {relativeWhen(entry.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            aria-label="Delete entry"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8A6A4A',
                              opacity: 0.4,
                              cursor: 'pointer',
                              fontSize: 12,
                              padding: '0 4px',
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <p
                          className="mt-0.5"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 13,
                            color: '#5C3018',
                            lineHeight: 1.45,
                            opacity: 0.92,
                          }}
                        >
                          {entry.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty hint when no axis selected */}
      {!activeAxis && (
        <p
          className="text-center italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: '#8A6A4A',
            opacity: 0.6,
            lineHeight: 1.5,
          }}
        >
          tap a dot to open its column · journal what's alive at each level. each entry is dated so
          the trace builds over time.
        </p>
      )}
    </div>
  );
}
