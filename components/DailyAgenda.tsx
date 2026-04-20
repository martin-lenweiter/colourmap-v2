'use client';

import { useEffect, useState } from 'react';
import type { CompassAxis, LifeCategoryLike, TagValue } from '@/components/CategoryTagPicker';
import CategoryTagPicker from '@/components/CategoryTagPicker';

/* ═══════════════════════════════════════════════════════════
   AGENDA — day/week/month planner with mission + emotion layers.
   Includes social/outings tracker for Sharing compass.
   ═══════════════════════════════════════════════════════════ */

const AGENDA_KEY = 'colourmap:daily-agenda';
const AGENDA_OPEN_KEY = 'colourmap:daily-agenda-open';
const OUTINGS_KEY = 'colourmap:outings';

interface AgendaBlock {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0–23
  duration: number; // in hours (0.5, 1, 1.5, 2, etc.)
  color: string;
  kind: 'mission' | 'emotion';
  tag?: { name: string; color: string; categoryId?: string };
}

const CATS_KEY = 'colourmap:life-categories';

const COMPASS_AXES: CompassAxis[] = [
  { name: 'Care', color: '#D4805A', group: 'Caring' },
  { name: 'Attitude', color: '#C4A070', group: 'Caring' },
  { name: 'Rest', color: '#C4906A', group: 'Caring' },
  { name: 'Emotions', color: '#B07A5A', group: 'Caring' },
  { name: 'Structure', color: '#6A8A9A', group: 'Doing' },
  { name: 'Target', color: '#7A9A7A', group: 'Doing' },
  { name: 'Action', color: '#8A8A6A', group: 'Doing' },
  { name: 'Resources', color: '#5A7A9A', group: 'Doing' },
  { name: 'Social Life', color: '#6B7F4E', group: 'Sharing' },
  { name: 'Authentic', color: '#8CA46E', group: 'Sharing' },
  { name: 'Roots', color: '#7B9560', group: 'Sharing' },
  { name: 'Express', color: '#5F7447', group: 'Sharing' },
];

interface Outing {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  color: string;
}

type AgendaLayer = 'mission' | 'emotion';
type AgendaView = 'day' | 'week' | 'month';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateLabel(d: string) {
  const dt = new Date(`${d}T12:00:00`);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1}`;
}

function weekDates(ref: string): string[] {
  const d = new Date(`${ref}T12:00:00`);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd.toISOString().split('T')[0];
  });
}

function monthDates(ref: string): string[] {
  const d = new Date(`${ref}T12:00:00`);
  const year = d.getFullYear();
  const month = d.getMonth();
  const last = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) => {
    const dd = new Date(year, month, i + 1);
    return dd.toISOString().split('T')[0];
  });
}

function shiftDate(ref: string, view: AgendaView, delta: number): string {
  const d = new Date(`${ref}T12:00:00`);
  if (view === 'day') d.setDate(d.getDate() + delta);
  else if (view === 'week') d.setDate(d.getDate() + delta * 7);
  else d.setMonth(d.getMonth() + delta);
  return d.toISOString().split('T')[0];
}

const BLOCK_COLORS = [
  '#D4805A', // warm terracotta
  '#C4A060', // ochre
  '#7AAA58', // green
  '#6890B0', // blue
  '#9B6BA0', // purple
  '#5A7A8A', // teal
  '#C87050', // coral
  '#8A8A6A', // olive
];

// Pastel rainbow for emotion entries
const EMOTION_COLORS = [
  '#E0908A', // soft coral — heavy
  '#E8A878', // peach — tense
  '#D8C078', // warm gold — restless
  '#C0D088', // sage — neutral
  '#A0C8A0', // mint — okay
  '#90C0C0', // teal — calm
  '#A0B0D0', // periwinkle — peaceful
  '#B0A0C8', // lavender — light
];

const WAKE_KEY = 'colourmap:wake-hour';

function getHours(wakeHour: number): number[] {
  return Array.from({ length: 22 - wakeHour }, (_, i) => i + wakeHour);
}

function loadAgenda(): AgendaBlock[] {
  try {
    const raw = localStorage.getItem(AGENDA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAgenda(blocks: AgendaBlock[]) {
  try {
    localStorage.setItem(AGENDA_KEY, JSON.stringify(blocks));
  } catch {}
}

function loadOutings(): Outing[] {
  try {
    const raw = localStorage.getItem(OUTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveOutings(outings: Outing[]) {
  try {
    localStorage.setItem(OUTINGS_KEY, JSON.stringify(outings));
  } catch {}
}

export default function DailyAgenda() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AGENDA_OPEN_KEY) === 'true';
  });
  const [agendaView, setAgendaView] = useState<AgendaView>('day');
  const [wakeHour, setWakeHour] = useState(() => {
    if (typeof window === 'undefined') return 7;
    try {
      const v = localStorage.getItem(WAKE_KEY);
      return v ? Number(v) : 7;
    } catch {
      return 7;
    }
  });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showMission, setShowMission] = useState(true);
  const [showEmotion, setShowEmotion] = useState(true);
  const [showSocial, setShowSocial] = useState(false);
  const [blocks, setBlocks] = useState<AgendaBlock[]>([]);
  const [outings, setOutings] = useState<Outing[]>([]);
  const [outingInput, setOutingInput] = useState('');
  const [showOutings, setShowOutings] = useState(false);
  const [addingAt, setAddingAt] = useState<number | null>(null);
  const [newText, setNewText] = useState('');
  const [newDuration, setNewDuration] = useState(1);
  const [newColor, setNewColor] = useState(BLOCK_COLORS[0]);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [blockTag, setBlockTag] = useState<TagValue | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [lifeCategories, setLifeCategories] = useState<LifeCategoryLike[]>([]);
  const [showObjectives, setShowObjectives] = useState(false);
  const [objectives, setObjectives] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [doneObjectives, setDoneObjectives] = useState<
    {
      id: string;
      text: string;
      completedAt: string;
      mindAtComplete?: string;
      modeAtComplete?: string;
    }[]
  >([]);

  useEffect(() => {
    setBlocks(loadAgenda());
    setOutings(loadOutings());
    try {
      const raw = localStorage.getItem('colourmap:today-objectives');
      if (raw) setObjectives(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem(CATS_KEY);
      if (raw) setLifeCategories(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem('colourmap:done-objectives');
      if (raw) setDoneObjectives(JSON.parse(raw));
    } catch {}

    // Load from backend
    fetch('/api/agenda-blocks')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then(
        (
          data: (AgendaBlock & {
            tagName?: string;
            tagColor?: string;
            tagCategoryId?: string;
            durationMinutes?: number;
          })[],
        ) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: AgendaBlock[] = data.map((b) => ({
              id: b.id,
              text: b.text,
              date: b.date,
              startHour: b.startHour,
              duration: b.durationMinutes
                ? b.durationMinutes / 60
                : typeof b.duration === 'number'
                  ? b.duration
                  : 1,
              color: b.color,
              kind: b.kind,
              tag: b.tagName
                ? {
                    name: b.tagName,
                    color: b.tagColor || '#C4A060',
                    categoryId: b.tagCategoryId || undefined,
                  }
                : b.tag,
            }));
            setBlocks(mapped);
            saveAgenda(mapped);
          }
        },
      )
      .catch(() => {});

    fetch('/api/outings')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((data: Outing[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setOutings(data);
          saveOutings(data);
        }
      })
      .catch(() => {});

    fetch('/api/life-categories')
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((data: LifeCategoryLike[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setLifeCategories(data);
          localStorage.setItem(CATS_KEY, JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  // Refresh done objectives when localStorage changes (e.g. from check-in card)
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem('colourmap:done-objectives');
        if (raw) setDoneObjectives(JSON.parse(raw));
      } catch {}
      try {
        const raw = localStorage.getItem('colourmap:today-objectives');
        if (raw) setObjectives(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener('storage', refresh);
    // Also poll every 3s for same-tab updates
    const iv = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener('storage', refresh);
      clearInterval(iv);
    };
  }, []);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AGENDA_OPEN_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const addBlock = (hour: number, kind: 'mission' | 'emotion' = 'mission') => {
    if (!newText.trim()) return;
    const block: AgendaBlock = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      date: selectedDate,
      startHour: hour,
      duration: newDuration,
      color: blockTag ? blockTag.color : newColor,
      kind,
      ...(blockTag && { tag: blockTag }),
    };
    const next = [...blocks, block].sort((a, b) => a.startHour - b.startHour);
    setBlocks(next);
    saveAgenda(next);
    setNewText('');
    setBlockTag(null);
    setAddingAt(null);
    fetch('/api/agenda-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: block.text,
        date: block.date,
        startHour: block.startHour,
        durationMinutes: Math.round(block.duration * 60),
        color: block.color,
        kind: block.kind,
        tagName: block.tag?.name,
        tagColor: block.tag?.color,
        tagCategoryId: block.tag?.categoryId,
      }),
    }).catch(() => {});
  };

  const removeBlock = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    setBlocks(next);
    saveAgenda(next);
    fetch(`/api/agenda-blocks/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const importObjective = (text: string) => {
    // Find the next free hour slot
    const usedHours = new Set(
      blocks.flatMap((b) =>
        Array.from({ length: Math.ceil(b.duration) }, (_, i) => b.startHour + i),
      ),
    );
    let startHour = 8;
    for (const h of getHours(wakeHour)) {
      if (!usedHours.has(h)) {
        startHour = h;
        break;
      }
    }
    const block: AgendaBlock = {
      id: crypto.randomUUID(),
      text,
      date: selectedDate,
      startHour,
      duration: 1,
      color: BLOCK_COLORS[blocks.length % BLOCK_COLORS.length],
      kind: 'mission',
    };
    const next = [...blocks, block].sort((a, b) => a.startHour - b.startHour);
    setBlocks(next);
    saveAgenda(next);
  };

  const resizeBlock = (id: string, delta: number) => {
    const block = blocks.find((b) => b.id === id);
    const newDuration = Math.max(0.5, (block?.duration || 1) + delta);
    const next = blocks.map((b) => (b.id === id ? { ...b, duration: newDuration } : b));
    setBlocks(next);
    saveAgenda(next);
    fetch(`/api/agenda-blocks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: Math.round(newDuration * 60) }),
    }).catch(() => {});
  };

  const moveBlock = (id: string, toHour: number) => {
    const next = blocks
      .map((b) => (b.id === id ? { ...b, startHour: toHour } : b))
      .sort((a, b) => a.startHour - b.startHour);
    setBlocks(next);
    saveAgenda(next);
    fetch(`/api/agenda-blocks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startHour: toHour }),
    }).catch(() => {});
  };

  const addOuting = () => {
    const text = outingInput.trim();
    if (!text) return;
    const entry: Outing = {
      id: crypto.randomUUID(),
      date: selectedDate,
      text,
      color: BLOCK_COLORS[(outings.length + 3) % BLOCK_COLORS.length],
    };
    const next = [entry, ...outings];
    setOutings(next);
    saveOutings(next);
    setOutingInput('');
    fetch('/api/outings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: entry.text, date: entry.date, color: entry.color }),
    }).catch(() => {});
  };

  const removeOuting = (id: string) => {
    const next = outings.filter((o) => o.id !== id);
    setOutings(next);
    saveOutings(next);
    fetch(`/api/outings/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const dayBlocks = blocks.filter((b) => b.date === selectedDate);

  return (
    <div
      className="space-y-3 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#6890B050',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Header — same pill format as Other Missions */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
          style={{
            background: '#C4A06015',
            border: '1px solid #C4A06040',
          }}
        >
          <span
            className="text-center uppercase"
            style={{
              color: '#C4A060',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.22em',
            }}
          >
            Agenda
          </span>
          <span
            className="text-sm transition-transform duration-200"
            style={{
              color: '#C4A06080',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▾
          </span>
        </button>
      </div>

      {open && (
        <div className="space-y-3">
          {/* View tabs: day / week / month */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate(shiftDate(selectedDate, agendaView, -1))}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8A6A4A',
                fontSize: '16px',
                opacity: 0.5,
              }}
            >
              ‹
            </button>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontWeight: 600,
                color: '#5C3018',
                minWidth: 100,
                textAlign: 'center',
              }}
            >
              {agendaView === 'day'
                ? selectedDate === todayStr()
                  ? `Today — ${dateLabel(selectedDate)}`
                  : selectedDate === shiftDate(todayStr(), 'day', -1)
                    ? `Yesterday — ${dateLabel(selectedDate)}`
                    : selectedDate === shiftDate(todayStr(), 'day', 1)
                      ? `Tomorrow — ${dateLabel(selectedDate)}`
                      : dateLabel(selectedDate)
                : agendaView === 'week'
                  ? `Week of ${dateLabel(weekDates(selectedDate)[0])}`
                  : new Date(`${selectedDate}T12:00:00`).toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(shiftDate(selectedDate, agendaView, 1))}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8A6A4A',
                fontSize: '16px',
                opacity: 0.5,
              }}
            >
              ›
            </button>
          </div>
          <div className="flex justify-center gap-2">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAgendaView(v)}
                className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
                style={{
                  color: '#6890B0',
                  border: `1px solid ${agendaView === v ? '#6890B040' : '#C4A06018'}`,
                  background: agendaView === v ? '#6890B010' : 'transparent',
                  opacity: agendaView === v ? 1 : 0.5,
                }}
              >
                {v}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr())}
              className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#C4A060',
                border: '1px dashed #C4A06040',
                background: 'transparent',
              }}
            >
              today
            </button>
          </div>

          {/* Daily Objectives tab */}
          {objectives.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowObjectives((s) => !s)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-1.5 transition-all"
                style={{
                  background: showObjectives ? '#C4A06012' : 'transparent',
                  border: `1px solid ${showObjectives ? '#C4A06030' : '#C4A06018'}`,
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#C4A060' }}
                >
                  Daily Objectives
                </span>
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{
                    color: '#C4A06080',
                    transform: showObjectives ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▾
                </span>
              </button>
              {showObjectives && (
                <div className="animate-in fade-in duration-150 space-y-1.5 pt-2">
                  {(() => {
                    const alreadyInAgenda = new Set(blocks.map((b) => b.text));
                    return objectives
                      .filter((o) => !o.done)
                      .map((o) => {
                        const scheduled = alreadyInAgenda.has(o.text);
                        return (
                          <div
                            key={o.id}
                            className="flex items-center gap-2 px-2"
                            style={{ minHeight: 32 }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: o.done ? '#7AAA58' : scheduled ? '#6890B0' : '#C4A060',
                                opacity: o.done ? 0.5 : 0.7,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                flex: 1,
                                fontFamily: 'var(--font-serif)',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#5C3018',
                                opacity: o.done ? 0.5 : 1,
                                textDecoration: o.done ? 'line-through' : 'none',
                              }}
                            >
                              {o.text}
                            </span>
                            {!o.done && !scheduled && (
                              <button
                                type="button"
                                onClick={() => importObjective(o.text)}
                                className="cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all hover:opacity-80"
                                style={{
                                  background: '#6890B012',
                                  border: '1px solid #6890B030',
                                  color: '#6890B0',
                                }}
                              >
                                schedule
                              </button>
                            )}
                            {scheduled && !o.done && (
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider"
                                style={{ color: '#6890B0', opacity: 0.5 }}
                              >
                                scheduled
                              </span>
                            )}
                          </div>
                        );
                      });
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Wake-up time — moved into VerticalView */}

          {/* Layer toggles — both can be active independently */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowMission((s) => !s)}
              className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#6890B0',
                border: `1px solid ${showMission ? '#6890B040' : '#C4A06018'}`,
                background: showMission ? '#6890B010' : 'transparent',
                opacity: showMission ? 1 : 0.5,
              }}
            >
              mission
            </button>
            <button
              type="button"
              onClick={() => setShowEmotion((s) => !s)}
              className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#9B6BA0',
                border: `1px solid ${showEmotion ? '#9B6BA040' : '#C4A06018'}`,
                background: showEmotion ? '#9B6BA010' : 'transparent',
                opacity: showEmotion ? 1 : 0.5,
              }}
            >
              emotion
            </button>
            <button
              type="button"
              onClick={() => setShowSocial((s) => !s)}
              className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#6B7F4E',
                border: `1px solid ${showSocial ? '#6B7F4E40' : '#C4A06018'}`,
                background: showSocial ? '#6B7F4E10' : 'transparent',
                opacity: showSocial ? 1 : 0.5,
              }}
            >
              social
            </button>
          </div>

          {/* Day view — full timeline */}
          {agendaView === 'day' &&
            (() => {
              const filtered = dayBlocks.filter(
                (b) =>
                  (showMission && b.kind === 'mission') || (showEmotion && b.kind === 'emotion'),
              );
              return (
                <VerticalView
                  blocks={filtered}
                  layer={showEmotion && !showMission ? 'emotion' : 'mission'}
                  addingAt={addingAt}
                  setAddingAt={setAddingAt}
                  newText={newText}
                  setNewText={setNewText}
                  newDuration={newDuration}
                  setNewDuration={setNewDuration}
                  newColor={newColor}
                  setNewColor={setNewColor}
                  onAdd={addBlock}
                  onRemove={removeBlock}
                  onResize={resizeBlock}
                  onMove={moveBlock}
                  wakeHour={wakeHour}
                  expandedBlock={expandedBlock}
                  setExpandedBlock={setExpandedBlock}
                  blockTag={blockTag}
                  setBlockTag={setBlockTag}
                  showBlockPicker={showBlockPicker}
                  setShowBlockPicker={setShowBlockPicker}
                  lifeCategories={lifeCategories}
                  setWakeHour={setWakeHour}
                />
              );
            })()}

          {/* Social layer — outings for current period */}
          {showSocial &&
            (() => {
              const filtered = outings.filter((o) => {
                if (agendaView === 'day') return o.date === selectedDate;
                if (agendaView === 'week') return weekDates(selectedDate).includes(o.date);
                return monthDates(selectedDate).includes(o.date);
              });
              if (filtered.length === 0 && agendaView === 'day') {
                return (
                  <div
                    className="flex items-center justify-center gap-2 rounded-lg py-3"
                    style={{ background: '#6B7F4E08', border: '1px dashed #6B7F4E20' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '12px',
                        color: '#6B7F4E',
                        opacity: 0.5,
                      }}
                    >
                      no outings today
                    </span>
                  </div>
                );
              }
              if (filtered.length === 0) return null;
              return (
                <div className="space-y-1">
                  {filtered.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                      style={{ background: '#6B7F4E08' }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rotate-45 rounded-[1px]"
                        style={{ background: o.color, opacity: 0.7 }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-handwritten)',
                          fontSize: '16px',
                          color: '#5C3018',
                          flex: 1,
                        }}
                      >
                        {o.text}
                      </span>
                      {agendaView !== 'day' && (
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '10px',
                            color: '#8A6A4A',
                            opacity: 0.5,
                          }}
                        >
                          {dateLabel(o.date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

          {/* Week view — 7 columns with block dots */}
          {agendaView === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {weekDates(selectedDate).map((date) => {
                const dayB = blocks.filter((b) => b.date === date);
                const dayO = outings.filter((o) => o.date === date);
                const isToday = date === todayStr();
                const dt = new Date(`${date}T12:00:00`);
                const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setAgendaView('day');
                    }}
                    className="cursor-pointer rounded-xl p-2 transition-all"
                    style={{
                      background: isToday ? '#6890B010' : isWeekend ? '#9B6BA008' : 'transparent',
                      border: `1px solid ${isToday ? '#6890B030' : '#C4A06010'}`,
                      minHeight: 80,
                    }}
                  >
                    <p
                      className="text-center text-[11px] font-semibold"
                      style={{ color: isToday ? '#6890B0' : '#5C3018', opacity: isToday ? 1 : 0.7 }}
                    >
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][dt.getDay()]}
                    </p>
                    <p className="text-center text-xs" style={{ color: '#8A6A4A', opacity: 0.6 }}>
                      {dt.getDate()}
                    </p>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {dayB.slice(0, 4).map((b) => (
                        <span
                          key={b.id}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: b.color,
                            opacity: 0.7,
                          }}
                        />
                      ))}
                      {dayO.map((o) => (
                        <span
                          key={o.id}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 1,
                            background: o.color,
                            opacity: 0.7,
                            transform: 'rotate(45deg)',
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Month view — calendar grid with block indicators */}
          {agendaView === 'month' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 2,
                  marginBottom: 4,
                }}
              >
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="text-center text-[10px] font-semibold"
                    style={{ color: '#8A6A4A', opacity: 0.4 }}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {(() => {
                  const dates = monthDates(selectedDate);
                  const firstDay = new Date(`${dates[0]}T12:00:00`).getDay();
                  const offset = (firstDay + 6) % 7;
                  const cells: (string | null)[] = Array.from(
                    { length: offset },
                    () => null as string | null,
                  ).concat(dates);
                  return cells.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    const dayB = blocks.filter((b) => b.date === date);
                    const dayO = outings.filter((o) => o.date === date);
                    const isToday = date === todayStr();
                    const dt = new Date(`${date}T12:00:00`);
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setAgendaView('day');
                        }}
                        className="cursor-pointer rounded-lg p-1 transition-all"
                        style={{
                          background: isToday ? '#6890B010' : 'transparent',
                          border: `1px solid ${isToday ? '#6890B030' : 'transparent'}`,
                          minHeight: 36,
                        }}
                      >
                        <p
                          className="text-center text-[11px]"
                          style={{
                            color: isToday ? '#6890B0' : '#5C3018',
                            fontWeight: isToday ? 700 : 500,
                            opacity: isToday ? 1 : 0.7,
                          }}
                        >
                          {dt.getDate()}
                        </p>
                        {(dayB.length > 0 || dayO.length > 0) && (
                          <div className="mt-0.5 flex justify-center gap-0.5">
                            {dayB.length > 0 && (
                              <span
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: dayB[0].color,
                                  opacity: 0.7,
                                }}
                              />
                            )}
                            {dayO.length > 0 && (
                              <span
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: 1,
                                  background: dayO[0].color,
                                  opacity: 0.7,
                                  transform: 'rotate(45deg)',
                                }}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Done — completed missions/objectives for this period */}
          {(() => {
            // Gather done items for the current view period
            const allDone: {
              id: string;
              text: string;
              date: string;
              time: string;
              mind?: string;
              mode?: string;
            }[] = [];
            // From done objectives archive
            for (const d of doneObjectives) {
              const dt = new Date(d.completedAt);
              const dateStr = dt.toISOString().split('T')[0];
              allDone.push({
                id: d.id,
                text: d.text,
                date: dateStr,
                time: `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`,
                mind: d.mindAtComplete,
                mode: d.modeAtComplete,
              });
            }
            // From today's checked-off objectives
            const today = todayStr();
            for (const o of objectives.filter((o) => o.done)) {
              if (!allDone.some((d) => d.text === o.text && d.date === today)) {
                allDone.push({ id: `obj-${o.id}`, text: o.text, date: today, time: '' });
              }
            }
            // Filter to selected period
            const filtered = allDone.filter((d) => {
              if (agendaView === 'day') return d.date === selectedDate;
              if (agendaView === 'week') return weekDates(selectedDate).includes(d.date);
              return monthDates(selectedDate).includes(d.date);
            });
            if (filtered.length === 0) return null;
            // Group by date
            const byDate: Record<string, typeof filtered> = {};
            for (const d of filtered) {
              if (!byDate[d.date]) byDate[d.date] = [];
              byDate[d.date].push(d);
            }
            const dates = Object.keys(byDate).sort().reverse();
            return (
              <div>
                <button
                  type="button"
                  onClick={() => setShowDone((s) => !s)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-1.5 transition-all"
                  style={{
                    background: showDone ? '#7AAA5812' : 'transparent',
                    border: `1px solid ${showDone ? '#7AAA5830' : '#C4A06018'}`,
                  }}
                >
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ color: '#7AAA58' }}
                  >
                    Done
                  </span>
                  <span
                    className="rounded-full px-1.5 text-[10px] font-semibold"
                    style={{ color: '#7AAA58', background: '#7AAA5815' }}
                  >
                    {filtered.length}
                  </span>
                  <span
                    className="text-[10px] transition-transform duration-200"
                    style={{
                      color: '#7AAA5880',
                      transform: showDone ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▾
                  </span>
                </button>
                {showDone && (
                  <div className="animate-in fade-in duration-150 space-y-3 pt-2">
                    {dates.map((date) => (
                      <div key={date}>
                        {agendaView !== 'day' && (
                          <p
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '11px',
                              color: '#8A6A4A',
                              opacity: 0.5,
                              marginBottom: 4,
                            }}
                          >
                            {dateLabel(date)}
                          </p>
                        )}
                        <div className="space-y-1">
                          {byDate[date].map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                              style={{ background: '#7AAA5808' }}
                            >
                              <span className="text-xs" style={{ color: '#7AAA58' }}>
                                ✓
                              </span>
                              <span
                                style={{
                                  fontFamily: 'var(--font-handwritten)',
                                  fontSize: '16px',
                                  color: '#5C3018',
                                  flex: 1,
                                }}
                              >
                                {d.text}
                              </span>
                              {d.time && (
                                <span
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '10px',
                                    color: '#8A6A4A',
                                    opacity: 0.5,
                                  }}
                                >
                                  {d.time}
                                </span>
                              )}
                              {d.mind && (
                                <span
                                  className="rounded-full px-1.5 py-0.5"
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '9px',
                                    color: '#6890B0',
                                    background: '#6890B010',
                                    border: '1px solid #6890B020',
                                  }}
                                >
                                  {d.mind}
                                </span>
                              )}
                              {d.mode && (
                                <span
                                  className="rounded-full px-1.5 py-0.5"
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '9px',
                                    color: '#C4A060',
                                    background: '#C4A06010',
                                    border: '1px solid #C4A06020',
                                  }}
                                >
                                  {d.mode}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Outings / Social — removed, accessed via social pill layer */}
          {false && (
            <div>
              <button
                type="button"
                onClick={() => setShowOutings((s) => !s)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-1.5 transition-all"
                style={{
                  background: showOutings ? '#9B6BA012' : 'transparent',
                  border: `1px solid ${showOutings ? '#9B6BA030' : '#C4A06018'}`,
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#9B6BA0' }}
                >
                  Outings & Social
                </span>
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{
                    color: '#9B6BA080',
                    transform: showOutings ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▾
                </span>
              </button>
              {showOutings && (
                <div className="animate-in fade-in duration-150 space-y-2 pt-2">
                  <input
                    type="text"
                    value={outingInput}
                    onChange={(e) => setOutingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addOuting();
                    }}
                    placeholder="where did you go? what happened?"
                    className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#9B6BA0] placeholder:opacity-60"
                    style={{
                      color: '#5C3018',
                      borderColor: '#9B6BA020',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '18px',
                    }}
                  />
                  {outings
                    .filter((o) => {
                      if (agendaView === 'day') return o.date === selectedDate;
                      if (agendaView === 'week') return weekDates(selectedDate).includes(o.date);
                      return monthDates(selectedDate).includes(o.date);
                    })
                    .map((o) => (
                      <div
                        key={o.id}
                        className="group flex items-center gap-2"
                        style={{ minHeight: 28 }}
                      >
                        <span
                          style={{
                            color: '#8A6A4A',
                            opacity: 0.6,
                            fontSize: '12px',
                            lineHeight: '28px',
                            flexShrink: 0,
                          }}
                        >
                          {dateLabel(o.date).split(' ')[1]}
                        </span>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 1,
                            background: o.color,
                            opacity: 0.7,
                            transform: 'rotate(45deg)',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            color: '#5C3018',
                            fontFamily: 'var(--font-handwritten)',
                            fontSize: '16px',
                            lineHeight: '28px',
                            flex: 1,
                          }}
                        >
                          {o.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            // Save to notebook as a journal entry via API
                            fetch('/api/notebook', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                category: 'journal',
                                title: `${dateLabel(o.date)} — ${o.text}`,
                                content: o.text,
                                tags: ['social', 'outing'],
                              }),
                            }).catch(() => {});
                            removeOuting(o.id);
                          }}
                          className="shrink-0 text-[9px] font-semibold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-50 cursor-pointer"
                          style={{ color: '#6B7F4E', background: 'none', border: 'none' }}
                          title="Save to journal"
                        >
                          → journal
                        </button>
                        <button
                          type="button"
                          onClick={() => removeOuting(o.id)}
                          className="shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-40 cursor-pointer"
                          style={{ color: '#8A6A4A', background: 'none', border: 'none' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Vertical timeline view ─── */
function VerticalView({
  blocks,
  layer,
  wakeHour,
  addingAt,
  setAddingAt,
  newText,
  setNewText,
  newDuration,
  setNewDuration,
  newColor,
  setNewColor,
  onAdd,
  onRemove,
  onResize,
  onMove,
  expandedBlock,
  setExpandedBlock,
  blockTag,
  setBlockTag,
  showBlockPicker,
  setShowBlockPicker,
  lifeCategories,
  setWakeHour,
}: {
  blocks: AgendaBlock[];
  layer: AgendaLayer;
  wakeHour: number;
  addingAt: number | null;
  setAddingAt: (h: number | null) => void;
  newText: string;
  setNewText: (v: string) => void;
  newDuration: number;
  setNewDuration: (v: number) => void;
  newColor: string;
  setNewColor: (v: string) => void;
  onAdd: (hour: number, kind?: 'mission' | 'emotion') => void;
  onRemove: (id: string) => void;
  onResize: (id: string, delta: number) => void;
  onMove: (id: string, toHour: number) => void;
  expandedBlock: string | null;
  setExpandedBlock: (id: string | null) => void;
  blockTag: TagValue | null;
  setBlockTag: (v: TagValue | null) => void;
  showBlockPicker: boolean;
  setShowBlockPicker: (v: boolean) => void;
  lifeCategories: LifeCategoryLike[];
  setWakeHour: (v: number) => void;
}) {
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Wake-up time — left-aligned above hours */}
      <div className="flex items-center gap-1.5 pb-1" style={{ paddingLeft: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#8A6A4A',
            opacity: 0.5,
          }}
        >
          woke up at
        </span>
        <select
          value={wakeHour}
          onChange={(e) => {
            const v = Number(e.target.value);
            setWakeHour(v);
            try {
              localStorage.setItem(WAKE_KEY, String(v));
            } catch {}
          }}
          style={{
            background: 'transparent',
            border: '1px solid #C4A06030',
            borderRadius: 4,
            padding: '1px 4px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#5C3018',
            fontFamily: 'var(--font-serif)',
          }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 4).map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      {getHours(wakeHour).map((hour) => {
        // All blocks visible in this hour slot
        const activeBlocks = blocks.filter(
          (b) => b.startHour <= hour && hour < b.startHour + b.duration,
        );
        // Blocks that START at this hour
        const startingBlocks = blocks.filter((b) => b.startHour === hour);
        const isAdding = addingAt === hour;
        const hasBlock = activeBlocks.length > 0;
        const isDragOver = dragOverHour === hour;

        return (
          <div key={hour} style={{ display: 'flex', minHeight: 36 }}>
            {/* Hour label */}
            <span
              style={{
                width: 48,
                flexShrink: 0,
                color: '#5C3018',
                opacity: 0.85,
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'var(--font-serif)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: '36px',
                textAlign: 'right',
                paddingRight: 10,
              }}
            >
              {String(hour).padStart(2, '0')}
            </span>

            {/* Slot — drop target */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverHour(hour);
              }}
              onDragLeave={() => setDragOverHour(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverHour(null);
                const blockId = e.dataTransfer.getData('text/plain');
                if (blockId) onMove(blockId, hour);
              }}
              style={{
                flex: 1,
                borderTop: `1px solid ${isDragOver ? '#6890B040' : '#C4A06015'}`,
                background: isDragOver ? '#6890B008' : 'transparent',
                position: 'relative',
                minHeight: 36,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* Blocks starting at this hour — side by side if overlapping */}
              {startingBlocks.length > 0 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {startingBlocks.map((block) => {
                    // How many blocks overlap at this block's start hour?
                    const concurrent = blocks.filter(
                      (b) =>
                        b.startHour < block.startHour + block.duration &&
                        b.startHour + b.duration > block.startHour,
                    ).length;
                    const widthPct = concurrent > 1 ? `${Math.floor(100 / concurrent)}%` : '100%';

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', block.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() =>
                          setExpandedBlock(expandedBlock === block.id ? null : block.id)
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: widthPct,
                          padding: '6px 10px',
                          background: `${block.color}18`,
                          border: `1px solid ${block.color}30`,
                          borderRadius: 10,
                          cursor: 'grab',
                          minHeight: Math.max(36, block.duration * 36),
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: block.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#5C3018',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {block.text}
                        </span>
                        {block.tag && (
                          <span
                            className="shrink-0 rounded-full px-1.5 py-0.5"
                            style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-serif)',
                              fontWeight: 600,
                              color: block.tag.color,
                              background: `${block.tag.color}15`,
                              border: `1px solid ${block.tag.color}30`,
                            }}
                          >
                            {block.tag.name}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#8A6A4A',
                            opacity: 0.6,
                            fontFamily: 'var(--font-serif)',
                            flexShrink: 0,
                          }}
                        >
                          {block.duration}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expanded block controls */}
              {startingBlocks.map((sb) =>
                expandedBlock === sb.id ? (
                  <div
                    key={`ctrl-${sb.id}`}
                    className="animate-in fade-in duration-150"
                    style={{
                      display: 'flex',
                      gap: 6,
                      padding: '4px 10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onResize(sb.id, -0.5)}
                      style={{
                        background: 'none',
                        border: '1px solid #C4A06040',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#8A6A4A',
                      }}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => onResize(sb.id, 0.5)}
                      style={{
                        background: 'none',
                        border: '1px solid #C4A06040',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#8A6A4A',
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fetch('/api/notebook', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            category: 'journal',
                            title: sb.text,
                            content: `${sb.text} (${sb.duration}h)`,
                            tags: sb.tag ? [sb.tag.name] : [],
                          }),
                        }).catch(() => {});
                        onRemove(sb.id);
                        setExpandedBlock(null);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #6B7F4E40',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#6B7F4E',
                        marginLeft: 'auto',
                      }}
                    >
                      → journal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemove(sb.id);
                        setExpandedBlock(null);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #A05A4040',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#A05A40',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : null,
              )}

              {/* Empty slot — tap to add */}
              {!hasBlock && !isAdding && (
                <button
                  type="button"
                  onClick={() => setAddingAt(hour)}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 36,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0,
                  }}
                  className="hover:opacity-30 transition-opacity"
                  title={`Add block at ${hour}:00`}
                >
                  <span style={{ fontSize: '16px', color: '#C4A060' }}>+</span>
                </button>
              )}

              {/* Add form */}
              {isAdding && (
                <div
                  className="animate-in fade-in duration-150"
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    background: '#C4A06008',
                    borderRadius: 10,
                    border: '1px dashed #C4A06040',
                  }}
                >
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        onAdd(hour, layer === 'emotion' ? 'emotion' : 'mission');
                      if (e.key === 'Escape') setAddingAt(null);
                    }}
                    placeholder={layer === 'emotion' ? 'how are you feeling?' : "what's happening?"}
                    autoFocus
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #C4A06030',
                      outline: 'none',
                      color: '#5C3018',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '18px',
                      padding: '4px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Duration */}
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      style={{
                        background: 'transparent',
                        border: '1px solid #C4A06030',
                        borderRadius: 6,
                        padding: '2px 6px',
                        fontSize: '11px',
                        color: '#8A6A4A',
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      {[0.5, 1, 1.5, 2, 2.5, 3, 4].map((d) => (
                        <option key={d} value={d}>
                          {d}h
                        </option>
                      ))}
                    </select>
                    {/* Color dots */}
                    <div style={{ display: 'flex', gap: 3 }}>
                      {(layer === 'emotion' ? EMOTION_COLORS : BLOCK_COLORS).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: c,
                            border: newColor === c ? '2px solid #5C3018' : '1px solid transparent',
                            cursor: 'pointer',
                            padding: 0,
                            opacity: newColor === c ? 1 : 0.5,
                          }}
                        />
                      ))}
                    </div>
                    <CategoryTagPicker
                      value={blockTag}
                      onChange={setBlockTag}
                      open={showBlockPicker}
                      onToggle={() => setShowBlockPicker(!showBlockPicker)}
                      onClose={() => setShowBlockPicker(false)}
                      lifeCategories={lifeCategories}
                      compassAxes={COMPASS_AXES}
                    />
                    <button
                      type="button"
                      onClick={() => setAddingAt(null)}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#8A6A4A',
                        opacity: 0.5,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
