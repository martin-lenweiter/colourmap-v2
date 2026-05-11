'use client';

import { useEffect, useRef, useState } from 'react';
import MapOfSelf from './MapOfSelf';
import { useViewMode } from './ViewModeContext';

// ── Palette ──────────────────────────────────────────────────────────
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'var(--panel-border, rgba(196,160,96,0.18))';
const OCHRE_HEX = '#C4A060'; // use only inside template literals (e.g. `${OCHRE_HEX}22`)
const OCHRE = 'var(--palette-panel-text, #C4A060)';
const BROWN = 'var(--palette-panel-text, rgba(196,160,96,0.88))';
const LABEL_COLOR = 'var(--palette-panel-muted, rgba(196,160,96,0.5))';

// ── LS keys ──────────────────────────────────────────────────────────
const LS_CHAPTER = 'colourmap:life-chapter';
const LS_CHAPTER_SUB = 'colourmap:life-chapter-sub';
const LS_FOCUS = 'colourmap:week-focus';
const LS_ARENAS = 'colourmap:life-arenas';

// ── Types ─────────────────────────────────────────────────────────────
interface FocusItem {
  id: string;
  text: string;
  done: boolean;
}

interface Arena {
  id: string;
  name: string;
  color: string;
  level: number;
  days: boolean[];
}

// ── Defaults ──────────────────────────────────────────────────────────
const DEFAULT_FOCUS: FocusItem[] = [
  { id: 'f1', text: '', done: false },
  { id: 'f2', text: '', done: false },
  { id: 'f3', text: '', done: false },
];
const DEFAULT_ARENAS: Arena[] = [
  { id: 'a1', name: 'Health', color: '#D4805A', level: 0, days: Array(7).fill(false) as boolean[] },
  { id: 'a2', name: 'Band', color: '#6890B0', level: 0, days: Array(7).fill(false) as boolean[] },
  { id: 'a3', name: 'Boxing', color: '#6B7F4E', level: 0, days: Array(7).fill(false) as boolean[] },
];
const ARENA_COLORS = [
  '#D4805A',
  '#6890B0',
  '#6B7F4E',
  '#C4A060',
  '#A080C0',
  '#80B8A0',
  '#C49080',
  '#90A0C0',
];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ── Shared helpers ────────────────────────────────────────────────────
function loadArenas(): Arena[] {
  try {
    const raw = localStorage.getItem(LS_ARENAS);
    return raw ? (JSON.parse(raw) as Arena[]) : DEFAULT_ARENAS;
  } catch {
    return DEFAULT_ARENAS;
  }
}
function saveArenasToLS(a: Arena[]) {
  try {
    localStorage.setItem(LS_ARENAS, JSON.stringify(a));
  } catch {}
}

// ── Shared Section shell (light-mode card wrapper) ────────────────────
function Card({
  title,
  badge,
  onClick,
  bg,
  borderColor,
  children,
}: {
  title: string;
  badge?: string;
  onClick?: () => void;
  bg?: string;
  borderColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${borderColor ?? CARD_BORDER}`,
        borderRadius: 14,
        background: bg ?? CARD_BG,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Header — hidden when title is empty */}
      {title && (
        <div
          style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${CARD_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#7A5438',
            }}
          >
            {title}
          </span>
          {badge && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                color: OCHRE,
                opacity: 0.65,
                letterSpacing: '0.06em',
              }}
            >
              {badge}
            </span>
          )}
          {onClick && (
            <span
              style={{ position: 'absolute', right: 14, fontSize: 10, color: OCHRE, opacity: 0.35 }}
            >
              ›
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  LIGHT-MODE SUMMARIES
// ══════════════════════════════════════════════════════════════════════

function ChapterSummary() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid var(--panel-border, rgba(196,160,96,0.18))`,
        background: 'var(--palette-l3-bg, rgba(10,6,3,0.6))',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 18px',
        }}
      >
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--palette-panel-text, rgba(196,160,96,0.82))',
          }}
        >
          Chapter
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 8,
              color: 'var(--palette-panel-muted, rgba(196,160,96,0.42))',
              opacity: 0.35,
            }}
          >
            {open ? '▲' : '▼'}
          </span>
        </span>
      </button>
      {open && <LifeChapter />}
    </div>
  );
}

function MapOfSelfSummary({ onTap }: { onTap: () => void }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid var(--panel-border, rgba(196,160,96,0.18))`,
        background: 'var(--palette-l3-bg, rgba(10,6,3,0.6))',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onTap}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 18px',
        }}
      >
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--palette-panel-text, rgba(196,160,96,0.82))',
          }}
        >
          Map of Self
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: 'var(--palette-panel-muted, rgba(196,160,96,0.42))',
            }}
          >
            ···
          </span>
        </span>
      </button>
    </div>
  );
}

function FocusSummary() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FocusItem[]>(DEFAULT_FOCUS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_FOCUS);
      if (raw) setItems(JSON.parse(raw) as FocusItem[]);
    } catch {}
  }, []);

  function save(next: FocusItem[]) {
    setItems(next);
    try {
      localStorage.setItem(LS_FOCUS, JSON.stringify(next));
    } catch {}
  }

  function update(id: string, patch: Partial<FocusItem>) {
    save(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  const filled = items.filter((it) => it.text.trim());
  const doneCount = filled.filter((it) => it.done).length;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${CARD_BORDER}`,
        background: 'var(--palette-l3-bg, rgba(10,6,3,0.6))',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 18px',
        }}
      >
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: OCHRE,
          }}
        >
          Week Focus
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{ fontFamily: 'var(--font-serif)', fontSize: 8, color: OCHRE, opacity: 0.35 }}
          >
            {open ? '▲' : '▼'}
          </span>
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 0',
                borderBottom: i < items.length - 1 ? `1px solid ${CARD_BORDER}` : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: OCHRE,
                  opacity: 0.4,
                  minWidth: 18,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                {i + 1}
              </span>
              <textarea
                value={item.text}
                onChange={(e) => {
                  update(item.id, { text: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="weekly intention…"
                rows={1}
                spellCheck={false}
                autoCorrect="off"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: item.done ? LABEL_COLOR : BROWN,
                  opacity: item.done ? 0.4 : 1,
                  textDecoration: item.done ? 'line-through' : 'none',
                  lineHeight: 1.45,
                }}
              />
              <button
                type="button"
                onClick={() => update(item.id, { done: !item.done })}
                style={{
                  background: item.done ? `${OCHRE_HEX}22` : 'transparent',
                  border: `1.5px solid ${item.done ? OCHRE : `${OCHRE_HEX}28`}`,
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginTop: 2,
                  color: OCHRE,
                  fontSize: 11,
                }}
              >
                {item.done ? '✓' : ''}
              </button>
            </div>
          ))}
          {filled.length > 0 && (
            <div
              style={{ marginTop: 10, height: 2, borderRadius: 99, background: `${OCHRE_HEX}15` }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 99,
                  background: OCHRE,
                  width: `${(doneCount / filled.length) * 100}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function _arenasSentence(arenas: Arena[]): string {
  if (arenas.length === 0) return 'No arenas yet. Tap to add one.';
  const scored = arenas.map((a) => ({ ...a, active: a.days.filter(Boolean).length }));
  const flowing = scored.filter((a) => a.active >= 5);
  const building = scored.filter((a) => a.active >= 2 && a.active < 5);
  const quiet = scored.filter((a) => a.active < 2);

  function join(names: string[]): string {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  }

  if (flowing.length === arenas.length) return 'All arenas flowing this week.';
  if (quiet.length === arenas.length) return 'Quiet week across the board. Room to show up.';

  const parts: string[] = [];
  if (flowing.length > 0) parts.push(`${join(flowing.map((a) => a.name))} flowing`);
  if (building.length > 0) parts.push(`${join(building.map((a) => a.name))} building`);
  if (quiet.length > 0) parts.push(`${join(quiet.map((a) => a.name))} still quiet`);
  return `${parts.join('. ')}.`;
}

function ArenasSummary({
  onTapArena,
  onTapAdd,
}: {
  onTapArena: (id: string) => void;
  onTapAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [arenas, setArenas] = useState<Arena[]>(DEFAULT_ARENAS);
  const todayIdx = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    setArenas(loadArenas());
  }, []);

  let streak = 0;
  if (arenas.length > 0) {
    const threshold = Math.max(1, Math.ceil(arenas.length / 2));
    for (let di = todayIdx; di >= 0; di--) {
      if (arenas.filter((a) => a.days[di]).length >= threshold) streak++;
      else break;
    }
  }

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${CARD_BORDER}`,
        background: 'var(--palette-l3-bg, rgba(10,6,3,0.6))',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 18px',
        }}
      >
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: OCHRE,
          }}
        >
          Life Areas
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{ fontFamily: 'var(--font-serif)', fontSize: 8, color: OCHRE, opacity: 0.35 }}
          >
            {open ? '▲' : '▼'}
          </span>
        </span>
      </button>
      {open && (
        <div>
          {arenas.map((arena, i) => {
            const active = arena.days.filter(Boolean).length;
            const status = active >= 5 ? 'flowing' : active >= 2 ? 'building' : 'quiet';
            const statusColor =
              active >= 5 ? arena.color : active >= 2 ? `${arena.color}90` : `${arena.color}50`;
            return (
              <div
                key={arena.id}
                onClick={() => onTapArena(arena.id)}
                style={{
                  padding: '10px 18px',
                  borderTop: `1px solid ${CARD_BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: active >= 2 ? arena.color : `${arena.color}35`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: BROWN,
                    flex: 1,
                  }}
                >
                  {arena.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 12,
                    color: statusColor,
                    letterSpacing: '0.02em',
                  }}
                >
                  {status}
                </span>
                <span style={{ fontSize: 11, color: OCHRE, opacity: 0.3 }}>›</span>
              </div>
            );
          })}
          <div
            onClick={onTapAdd}
            style={{
              padding: '8px 18px 12px',
              borderTop: `1px solid ${CARD_BORDER}`,
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 11,
                color: LABEL_COLOR,
                opacity: 0.35,
              }}
            >
              + add arena
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  DEEP-DIVE FULL EDITORS
// ══════════════════════════════════════════════════════════════════════

function LifeChapter() {
  const [chapter, setChapter] = useState('');
  const [sub, setSub] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      setChapter(localStorage.getItem(LS_CHAPTER) || '');
      setSub(localStorage.getItem(LS_CHAPTER_SUB) || '');
    } catch {}
    setTimeout(() => {
      if (taRef.current) {
        taRef.current.style.height = 'auto';
        taRef.current.style.height = `${taRef.current.scrollHeight}px`;
      }
    }, 0);
  }, []);

  function saveChapter(v: string) {
    setChapter(v);
    try {
      localStorage.setItem(LS_CHAPTER, v);
    } catch {}
    window.dispatchEvent(new CustomEvent('colourmap:chapter-changed', { detail: v }));
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = `${taRef.current.scrollHeight}px`;
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '8px 0 24px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: LABEL_COLOR,
          opacity: 0.5,
        }}
      >
        What chapter are you in?
      </span>
      <textarea
        ref={taRef}
        value={chapter}
        onChange={(e) => saveChapter(e.target.value)}
        placeholder="Name your chapter…"
        rows={1}
        spellCheck={false}
        autoCorrect="off"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          fontFamily: 'var(--font-handwritten)',
          fontSize: 26,
          fontWeight: 700,
          color: BROWN,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      />
      <input
        type="text"
        value={sub}
        onChange={(e) => {
          setSub(e.target.value);
          try {
            localStorage.setItem(LS_CHAPTER_SUB, e.target.value);
          } catch {}
        }}
        placeholder="what this chapter is about…"
        spellCheck={false}
        autoCorrect="off"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          borderBottom: `1px solid ${OCHRE_HEX}28`,
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 14,
          color: LABEL_COLOR,
          textAlign: 'center',
          width: '80%',
          padding: '2px 0',
        }}
      />
    </div>
  );
}

function WeekFocus() {
  const [items, setItems] = useState<FocusItem[]>(DEFAULT_FOCUS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_FOCUS);
      if (raw) setItems(JSON.parse(raw) as FocusItem[]);
    } catch {}
  }, []);

  function save(next: FocusItem[]) {
    setItems(next);
    try {
      localStorage.setItem(LS_FOCUS, JSON.stringify(next));
    } catch {}
  }

  function update(id: string, patch: Partial<FocusItem>) {
    save(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  const filled = items.filter((it) => it.text.trim()).length;
  const doneCount = items.filter((it) => it.done && it.text.trim()).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${CARD_BORDER}` : 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: 700,
              color: OCHRE,
              opacity: 0.4,
              minWidth: 18,
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {i + 1}
          </span>
          <textarea
            value={item.text}
            onChange={(e) => {
              update(item.id, { text: e.target.value });
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="weekly intention…"
            rows={1}
            spellCheck={false}
            autoCorrect="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              color: item.done ? OCHRE : 'var(--foreground)',
              opacity: item.done ? 0.4 : 0.9,
              textDecoration: item.done ? 'line-through' : 'none',
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          />
          <button
            type="button"
            onClick={() => update(item.id, { done: !item.done })}
            style={{
              background: item.done ? `${OCHRE_HEX}22` : 'transparent',
              border: `1.5px solid ${item.done ? OCHRE : `${OCHRE_HEX}28`}`,
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: 2,
              color: OCHRE,
              fontSize: 11,
            }}
          >
            {item.done ? '✓' : ''}
          </button>
        </div>
      ))}
      {filled > 0 && (
        <div style={{ paddingTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 99, background: `${OCHRE_HEX}15` }}>
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                background: OCHRE,
                width: `${(doneCount / filled) * 100}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: LABEL_COLOR,
              opacity: 0.55,
            }}
          >
            {doneCount}/{filled}
          </span>
        </div>
      )}
    </div>
  );
}

function ArenaEditor({ arenaId }: { arenaId: string }) {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const todayIdx = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    setArenas(loadArenas());
  }, []);

  const arena = arenas.find((a) => a.id === arenaId);

  function patchArena(patch: Partial<Arena>) {
    const next = arenas.map((a) => (a.id !== arenaId ? a : { ...a, ...patch }));
    setArenas(next);
    saveArenasToLS(next);
  }

  if (!arena) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Name + color dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: arena.color }} />
        <input
          type="text"
          value={arena.name}
          onChange={(e) => patchArena({ name: e.target.value })}
          spellCheck={false}
          autoCorrect="off"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            borderBottom: `1px solid ${OCHRE_HEX}28`,
            fontFamily: 'var(--font-handwritten)',
            fontSize: 22,
            fontWeight: 700,
            color: BROWN,
            textAlign: 'center',
            padding: '2px 0',
          }}
        />
      </div>

      {/* Level */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: LABEL_COLOR,
            opacity: 0.5,
          }}
        >
          Level
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2, 3, 4].map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => patchArena({ level: arena.level === j ? j - 1 : j })}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: j <= arena.level ? arena.color : `${arena.color}20`,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s',
                boxShadow: j <= arena.level ? `0 2px 6px -2px ${arena.color}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* 7-day tracker — full size */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: LABEL_COLOR,
            opacity: 0.5,
          }}
        >
          This Week
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {arena.days.map((done, di) => (
            <button
              key={di}
              type="button"
              onClick={() =>
                patchArena({
                  days: arena.days.map((d, j) => (j === di ? !d : d)) as boolean[],
                })
              }
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: done ? arena.color : `${arena.color}15`,
                  border: `1.5px solid ${di === todayIdx ? arena.color : 'transparent'}`,
                  transition: 'all 0.15s',
                  boxShadow: done ? `0 3px 10px -3px ${arena.color}` : 'none',
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: arena.color,
                  opacity: di === todayIdx ? 0.8 : 0.4,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: di === todayIdx ? 700 : 400,
                }}
              >
                {DAY_LABELS[di]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: CARD_BORDER }} />

      {/* Journal — notebook portal */}
      <ArenaJournal arenaId={arenaId} color={arena.color} name={arena.name} />
    </div>
  );
}

// ── Shared notebook entry type (mirrors notebook/page.tsx) ───────────

interface NbEntry {
  id: string;
  category: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  createdAt: string;
}

const NB_LS_KEY = 'colourmap:notebook-entries';

function loadNbEntries(): NbEntry[] {
  try {
    const raw = localStorage.getItem(NB_LS_KEY);
    return raw ? (JSON.parse(raw) as NbEntry[]) : [];
  } catch {
    return [];
  }
}
function saveNbEntries(entries: NbEntry[]) {
  try {
    localStorage.setItem(NB_LS_KEY, JSON.stringify(entries));
  } catch {}
}

function relativeWhen(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Full-screen deep journal editor ────────────────────────────────────

function _DeepJournalView({
  entry,
  color,
  onChange,
  onClose,
}: {
  entry: NbEntry;
  color: string;
  onChange: (fields: Partial<NbEntry>) => void;
  onClose: () => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: `1px solid ${color}20`,
        }}
      >
        <div
          style={{
            width: 4,
            height: 32,
            borderRadius: 4,
            background: color,
            opacity: 0.5,
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={entry.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title…"
          spellCheck={false}
          autoCorrect="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-serif)',
            fontSize: 20,
            fontWeight: 700,
            color: BROWN,
          }}
        />
        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: `${color}10`,
            border: `1px solid ${color}25`,
            borderRadius: 20,
            padding: '5px 14px',
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color,
            cursor: 'pointer',
            opacity: 0.8,
          }}
        >
          ✕ close
        </button>
      </div>

      {/* Writing area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 80px' }}>
        <textarea
          ref={taRef}
          value={entry.content ?? ''}
          onChange={(e) => onChange({ content: e.target.value || null })}
          placeholder="Write…"
          style={{
            width: '100%',
            maxWidth: 600,
            display: 'block',
            margin: '0 auto',
            minHeight: 'calc(100vh - 180px)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            lineHeight: 1.7,
            color: BROWN,
          }}
          spellCheck
        />
      </div>
    </div>
  );
}

// ── Arena Notebook — full-screen portal to actual notebook entries ────

function ArenaNotebook({
  arenaId,
  arenaName,
  color,
  initialMode,
  onClose,
}: {
  arenaId: string;
  arenaName: string;
  color: string;
  initialMode: 'quick' | 'deep';
  onClose: () => void;
}) {
  const category = `arena:${arenaId}`;
  const [entries, setEntries] = useState<NbEntry[]>([]);
  const [mode, setMode] = useState<'quick' | 'deep'>(initialMode);
  const [quickText, setQuickText] = useState('');
  const [deepTitle, setDeepTitle] = useState('');
  const [deepContent, setDeepContent] = useState('');
  const quickRef = useRef<HTMLInputElement>(null);
  const deepRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const all = loadNbEntries();
    setEntries(all.filter((e) => e.category === category));
    setTimeout(() => (initialMode === 'quick' ? quickRef : deepRef).current?.focus(), 80);
  }, [category, initialMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function saveQuick() {
    if (!quickText.trim()) return;
    const entry: NbEntry = {
      id: crypto.randomUUID(),
      category,
      title: quickText.trim(),
      content: null,
      tags: ['quick'],
      createdAt: new Date().toISOString(),
    };
    const all = loadNbEntries();
    const next = [entry, ...all];
    saveNbEntries(next);
    setEntries(next.filter((e) => e.category === category));
    setQuickText('');
  }

  function saveDeep() {
    if (!deepTitle.trim() && !deepContent.trim()) return;
    const entry: NbEntry = {
      id: crypto.randomUUID(),
      category,
      title: deepTitle.trim() || deepContent.trim().split('\n')[0].slice(0, 80) || 'Note',
      content: deepContent.trim() || null,
      tags: ['deep'],
      createdAt: new Date().toISOString(),
    };
    const all = loadNbEntries();
    const next = [entry, ...all];
    saveNbEntries(next);
    setEntries(next.filter((e) => e.category === category));
    setDeepTitle('');
    setDeepContent('');
  }

  function deleteEntry(id: string) {
    const all = loadNbEntries();
    const next = all.filter((e) => e.id !== id);
    saveNbEntries(next);
    setEntries(next.filter((e) => e.category === category));
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: `1px solid ${color}20`,
        }}
      >
        <div
          style={{
            width: 4,
            height: 32,
            borderRadius: 4,
            background: color,
            opacity: 0.5,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-handwritten)',
            fontSize: 22,
            fontWeight: 700,
            color: BROWN,
          }}
        >
          {arenaName}
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: `${color}10`,
            border: `1px solid ${color}25`,
            borderRadius: 20,
            padding: '5px 14px',
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color,
            cursor: 'pointer',
            opacity: 0.8,
          }}
        >
          ✕ close
        </button>
      </div>

      {/* Input area */}
      <div
        style={{ flexShrink: 0, padding: '14px 20px 12px', borderBottom: `1px solid ${color}15` }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['quick', 'deep'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setTimeout(() => (m === 'quick' ? quickRef : deepRef).current?.focus(), 50);
              }}
              style={{
                background: mode === m ? `${color}22` : 'transparent',
                border: `1px solid ${mode === m ? color : `${color}28`}`,
                borderRadius: 20,
                padding: '2px 12px',
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: mode === m ? color : LABEL_COLOR,
                opacity: mode === m ? 1 : 0.5,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {m === 'quick' ? 'Quick' : 'Deep'}
            </button>
          ))}
        </div>

        {mode === 'quick' && (
          <input
            ref={quickRef}
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveQuick();
            }}
            placeholder="Quick note… (Enter to save)"
            spellCheck={false}
            autoCorrect="off"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              borderBottom: `1px solid ${color}28`,
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              color: BROWN,
              padding: '4px 0',
            }}
          />
        )}

        {mode === 'deep' && (
          <div
            style={{
              border: `1px solid ${color}28`,
              borderRadius: 12,
              background: `${color}07`,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <input
              type="text"
              value={deepTitle}
              onChange={(e) => setDeepTitle(e.target.value)}
              placeholder="Title…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                borderBottom: `1px solid ${color}20`,
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                fontWeight: 700,
                color: BROWN,
                padding: '2px 0',
              }}
            />
            <textarea
              ref={deepRef}
              value={deepContent}
              onChange={(e) => {
                setDeepContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  saveDeep();
                }
              }}
              placeholder="Write… (⌘+Enter to save)"
              rows={3}
              spellCheck={false}
              autoCorrect="off"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                color: BROWN,
                lineHeight: 1.6,
              }}
            />
            {(deepTitle.trim() || deepContent.trim()) && (
              <button
                type="button"
                onClick={saveDeep}
                style={{
                  alignSelf: 'flex-end',
                  background: `${color}22`,
                  border: `1px solid ${color}50`,
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color,
                  cursor: 'pointer',
                }}
              >
                save
              </button>
            )}
          </div>
        )}
      </div>

      {/* Entry list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 60px' }}>
        {entries.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: LABEL_COLOR,
              opacity: 0.28,
              textAlign: 'center',
              paddingTop: 24,
            }}
          >
            No entries yet
          </p>
        )}
        {entries.map((entry) => {
          const isDeep = entry.tags?.includes('deep');
          return (
            <div key={entry.id} style={{ padding: '12px 0', borderBottom: `1px solid ${color}12` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color,
                    opacity: isDeep ? 0.7 : 0.4,
                  }}
                >
                  {isDeep ? 'deep' : 'quick'}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 10,
                    color: LABEL_COLOR,
                    opacity: 0.4,
                  }}
                >
                  {relativeWhen(entry.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: LABEL_COLOR,
                    opacity: 0.22,
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              {isDeep && entry.title && (
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: BROWN,
                    lineHeight: 1.3,
                    margin: '0 0 4px',
                  }}
                >
                  {entry.title}
                </p>
              )}
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  color: 'var(--foreground)',
                  opacity: 0.85,
                  lineHeight: 1.55,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {isDeep ? (entry.content ?? '') : entry.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Arena journal — summary strip + portal buttons ─────────────────────

function ArenaJournal({ arenaId, color, name }: { arenaId: string; color: string; name: string }) {
  const category = `arena:${arenaId}`;
  const [entries, setEntries] = useState<NbEntry[]>([]);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [notebookMode, setNotebookMode] = useState<'quick' | 'deep'>('quick');

  useEffect(() => {
    const all = loadNbEntries();
    setEntries(all.filter((e) => e.category === category));
  }, [category]);

  function refreshEntries() {
    const all = loadNbEntries();
    setEntries(all.filter((e) => e.category === category));
  }

  function openNotebook(mode: 'quick' | 'deep') {
    setNotebookMode(mode);
    setNotebookOpen(true);
  }

  return (
    <>
      {notebookOpen && (
        <ArenaNotebook
          arenaId={arenaId}
          arenaName={name}
          color={color}
          initialMode={notebookMode}
          onClose={() => {
            setNotebookOpen(false);
            refreshEntries();
          }}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: LABEL_COLOR,
              opacity: 0.5,
            }}
          >
            Journal
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['quick', 'deep'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => openNotebook(m)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${color}28`,
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: LABEL_COLOR,
                  opacity: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'quick' ? 'Quick' : 'Deep'}
              </button>
            ))}
          </div>
        </div>

        {entries.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: LABEL_COLOR,
              opacity: 0.28,
              textAlign: 'center',
            }}
          >
            tap Quick or Deep to open the notebook
          </p>
        )}
        {entries.slice(0, 3).map((entry) => {
          const isDeep = entry.tags?.includes('deep');
          return (
            <div
              key={entry.id}
              onClick={() => openNotebook(isDeep ? 'deep' : 'quick')}
              style={{
                padding: '8px 10px',
                border: `1px solid ${isDeep ? `${color}28` : `${color}15`}`,
                borderRadius: 8,
                background: isDeep ? `${color}06` : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color,
                    opacity: isDeep ? 0.7 : 0.4,
                  }}
                >
                  {isDeep ? 'deep' : 'quick'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 10,
                    color: LABEL_COLOR,
                    opacity: 0.4,
                  }}
                >
                  {relativeWhen(entry.createdAt)}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  color: 'var(--foreground)',
                  opacity: 0.8,
                  lineHeight: 1.45,
                  margin: 0,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                }}
              >
                {isDeep ? (entry.content ?? entry.title) : entry.title}
              </p>
            </div>
          );
        })}
        {entries.length > 3 && (
          <button
            type="button"
            onClick={() => openNotebook('quick')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 12,
              color: LABEL_COLOR,
              opacity: 0.35,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {entries.length - 3} more…
          </button>
        )}
      </div>
    </>
  );
}

function ArenasEditor() {
  const [arenas, setArenas] = useState<Arena[]>(DEFAULT_ARENAS);
  const [newName, setNewName] = useState('');
  const todayIdx = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    setArenas(loadArenas());
  }, []);

  function save(next: Arena[]) {
    setArenas(next);
    saveArenasToLS(next);
  }

  const toggleDay = (id: string, di: number) =>
    save(
      arenas.map((a) =>
        a.id !== id
          ? a
          : {
              ...a,
              days: a.days.map((d, j) => (j === di ? !d : d)) as boolean[],
            },
      ),
    );

  const setLevel = (id: string, lvl: number) =>
    save(arenas.map((a) => (a.id !== id ? a : { ...a, level: lvl })));

  const rename = (id: string, name: string) =>
    save(arenas.map((a) => (a.id !== id ? a : { ...a, name })));

  function addArena(name: string) {
    if (!name.trim()) return;
    save([
      ...arenas,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        color: ARENA_COLORS[arenas.length % ARENA_COLORS.length],
        level: 0,
        days: Array(7).fill(false) as boolean[],
      },
    ]);
    setNewName('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {arenas.map((arena) => (
        <div
          key={arena.id}
          style={{
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 14,
            background: CARD_BG,
            overflow: 'hidden',
          }}
        >
          {/* Name row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderBottom: `1px solid ${CARD_BORDER}`,
              background: 'rgba(196,160,96,0.06)',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: arena.color }} />
            <input
              type="text"
              value={arena.name}
              onChange={(e) => rename(arena.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              spellCheck={false}
              autoCorrect="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 700,
                color: BROWN,
                letterSpacing: '0.06em',
              }}
            />
            <div style={{ display: 'flex', gap: 3 }}>
              {[0, 1, 2, 3, 4].map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setLevel(arena.id, arena.level === j ? j - 1 : j)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: j <= arena.level ? arena.color : `${arena.color}25`,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>
          {/* 7-day row */}
          <div style={{ padding: '12px 14px', display: 'flex', gap: 4, justifyContent: 'center' }}>
            {arena.days.map((done, di) => (
              <button
                key={di}
                type="button"
                onClick={() => toggleDay(arena.id, di)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: done ? arena.color : `${arena.color}15`,
                    border: `1.5px solid ${di === todayIdx ? arena.color : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    color: arena.color,
                    opacity: di === todayIdx ? 0.75 : 0.35,
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {DAY_LABELS[di]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {/* Add arena */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 28, flexShrink: 0 }} />
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addArena(newName);
          }}
          placeholder="add an arena…"
          spellCheck={false}
          autoCorrect="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            borderBottom: `1px solid ${OCHRE_HEX}25`,
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontStyle: 'italic',
            color: LABEL_COLOR,
            textAlign: 'center',
            padding: '2px 0',
          }}
        />
        <button
          type="button"
          onClick={() => addArena(newName)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: `${OCHRE_HEX}18`,
            border: `1.5px solid ${OCHRE_HEX}40`,
            color: OCHRE,
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  LIFE CHAPTER — FULL SCREEN VIEW
// ══════════════════════════════════════════════════════════════════════

function _ChapterFullScreen({ onClose }: { onClose: () => void }) {
  const { mode } = useViewMode();
  const isPhone = mode === 'phone';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: isPhone ? '#0C0905' : 'var(--background)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isPhone ? 430 : '100%',
          background: 'var(--background)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${CARD_BORDER}`,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: LABEL_COLOR,
              opacity: 0.45,
            }}
          >
            Life Chapter
          </span>
          {/* box-view pill — closes back to the card */}
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: `${OCHRE_HEX}10`,
              border: `1px solid ${OCHRE_HEX}28`,
              borderRadius: 20,
              padding: '4px 12px',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: OCHRE,
              cursor: 'pointer',
              opacity: 0.75,
            }}
          >
            <span style={{ fontSize: 8 }}>▣</span> box view
          </button>
        </div>

        {/* Centered content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px 80px',
          }}
        >
          <div style={{ width: '100%', maxWidth: 480 }}>
            <LifeChapter />
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  CENTER CARD — floating modal for Chapter + Focus
// ══════════════════════════════════════════════════════════════════════

function CenterCard({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(12,9,5,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          maxHeight: '66vh',
          background: 'var(--background)',
          borderRadius: 24,
          border: `1px solid ${CARD_BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px 12px',
            borderBottom: `1px solid ${CARD_BORDER}`,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: LABEL_COLOR,
              opacity: 0.55,
            }}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: LABEL_COLOR,
              opacity: 0.4,
              fontSize: 20,
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>{children}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  BOTTOM SHEET — arenas only
// ══════════════════════════════════════════════════════════════════════

function _BottomSheet({ panel, onClose }: { panel: string; onClose: () => void }) {
  const isArena = panel.startsWith('arena:');
  const arenaId = isArena ? panel.slice(6) : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          maxHeight: '88vh',
          background: 'var(--background)',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '12px 16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 36,
              height: 4,
              borderRadius: 99,
              background: `${OCHRE_HEX}30`,
            }}
          />
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: LABEL_COLOR,
              opacity: 0.45,
              fontSize: 18,
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 40px' }}>
          {panel === 'arenas' && <ArenasEditor />}
          {isArena && arenaId && <ArenaEditor arenaId={arenaId} />}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ROOT — light-mode dashboard + deep-dive sheet
// ══════════════════════════════════════════════════════════════════════

export default function Overview2() {
  const [panel, setPanel] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function open(p: string) {
    setPanel(p);
  }
  function close() {
    setPanel(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <>
      <div
        key={refreshKey}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}
      >
        <ChapterSummary />
        <FocusSummary />
        <ArenasSummary onTapArena={(id) => open(`arena:${id}`)} onTapAdd={() => open('arenas')} />
        <div style={{ paddingTop: 16 }}>
          <MapOfSelfSummary onTap={() => open('mapofself')} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 999,
              border: `1px solid ${CARD_BORDER}`,
              background: 'var(--palette-l3-bg, rgba(10,6,3,0.4))',
            }}
          >
            <span style={{ fontSize: 11, opacity: 0.4, lineHeight: 1 }}>ℹ</span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: LABEL_COLOR,
                fontStyle: 'italic',
                letterSpacing: '0.03em',
              }}
            >
              This section is still growing — work in progress.
            </span>
          </div>
        </div>
      </div>

      {panel === 'arenas' && (
        <CenterCard title="Life Arenas" onClose={close}>
          <ArenasEditor />
        </CenterCard>
      )}
      {panel === 'mapofself' && (
        <CenterCard title="Map of Self" onClose={close}>
          <MapOfSelf />
        </CenterCard>
      )}
      {panel?.startsWith('arena:') && (
        <CenterCard title="" onClose={close}>
          <ArenaEditor arenaId={panel.slice(6)} />
        </CenterCard>
      )}
    </>
  );
}
