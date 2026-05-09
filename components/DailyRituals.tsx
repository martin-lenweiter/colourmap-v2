'use client';

import { useEffect, useRef, useState } from 'react';
import { syncEvent, syncPref } from '@/lib/sync';

/* ── Constants ───────────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const LS_RITUALS = 'colourmap:rituals';
const LS_DONE = `colourmap:rituals-done-${TODAY}`;
const LS_SESSIONS = 'colourmap:rituals-sessions';

const QUOTES = [
  'Discipline is hard. Rituals are easy. Systems set you free.',
  'Small actions. Big transformations.',
  'The person you become is built one ritual at a time.',
  'Your rituals are the bridge to your peak state.',
  'Consistency is the only shortcut that actually works.',
];

const DEFAULT_RITUALS: Ritual[] = [
  { id: 'r1', name: 'Morning pages', time: 'morning', streakCount: 0, lastDone: null },
  { id: 'r2', name: 'Move your body', time: 'morning', streakCount: 0, lastDone: null },
  { id: 'r3', name: 'Set one intention', time: 'morning', streakCount: 0, lastDone: null },
  { id: 'r4', name: 'Reflect on the day', time: 'evening', streakCount: 0, lastDone: null },
  { id: 'r5', name: 'Wind down — no screens', time: 'evening', streakCount: 0, lastDone: null },
];

/* ── Types ───────────────────────────────────────────────────── */
type Ritual = {
  id: string;
  name: string;
  time: string;
  streakCount: number;
  lastDone: string | null;
};

type DropTarget = { id: string; pos: 'before' | 'after' } | null;

/* ── Helpers ─────────────────────────────────────────────────── */
function save(rituals: Ritual[]) {
  try {
    localStorage.setItem(LS_RITUALS, JSON.stringify(rituals));
  } catch {}
  syncPref(LS_RITUALS, rituals);
}
function saveDone(done: Set<string>) {
  try {
    localStorage.setItem(LS_DONE, JSON.stringify([...done]));
  } catch {}
  syncPref(LS_DONE, [...done]);
}
function isStreakAlive(r: Ritual) {
  return r.lastDone === TODAY || r.lastDone === YESTERDAY;
}

/* ── Insertion line ──────────────────────────────────────────── */
function DropLine() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        borderRadius: 2,
        background: 'rgba(196,160,96,0.95)',
        boxShadow: '0 0 8px rgba(196,160,96,0.7)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Left dot */}
      <div
        style={{
          position: 'absolute',
          left: -1,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#C4A060',
          boxShadow: '0 0 5px rgba(196,160,96,0.9)',
        }}
      />
    </div>
  );
}

/* ── Ritual row ──────────────────────────────────────────────── */
function RitualRow({
  ritual,
  checked,
  onToggle,
  onDelete,
  onDragStart,
  isDragging,
  dropEdge,
}: {
  ritual: Ritual;
  checked: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDragStart: (id: string) => void;
  isDragging: boolean;
  dropEdge: 'before' | 'after' | null;
}) {
  const alive = isStreakAlive(ritual);
  return (
    <div
      data-ritual-id={ritual.id}
      style={{
        position: 'relative',
        marginBottom: 6,
        // Push rows apart slightly when a drop line is showing
        paddingTop: dropEdge === 'before' ? 10 : 2,
        paddingBottom: dropEdge === 'after' ? 10 : 2,
        transition: 'padding 0.12s',
      }}
    >
      {/* Drop line — ABOVE */}
      {dropEdge === 'before' && (
        <div style={{ position: 'absolute', top: 3, left: 0, right: 0 }}>
          <DropLine />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 10px 10px 4px',
          borderRadius: 10,
          background: isDragging
            ? 'rgba(196,160,96,0.18)'
            : checked
              ? 'rgba(196,160,96,0.13)'
              : 'rgba(255,255,255,0.025)',
          border: `1px solid ${isDragging ? 'rgba(196,160,96,0.55)' : checked ? 'rgba(196,160,96,0.45)' : 'rgba(196,160,96,0.1)'}`,
          opacity: isDragging ? 0.45 : 1,
          transition: 'background 0.15s, border 0.15s, opacity 0.15s',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Drag handle */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDragStart(ritual.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'grab',
            padding: '2px 6px',
            color: 'rgba(196,160,96,0.35)',
            flexShrink: 0,
            touchAction: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: 14, borderTop: '1.5px solid currentColor' }} />
          <span style={{ display: 'block', width: 14, borderTop: '1.5px solid currentColor' }} />
          <span style={{ display: 'block', width: 14, borderTop: '1.5px solid currentColor' }} />
        </button>

        {/* Checkbox */}
        <div
          onClick={onToggle}
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            flexShrink: 0,
            cursor: 'pointer',
            border: `1.5px solid ${checked ? '#C8A858' : 'rgba(196,160,96,0.22)'}`,
            background: checked ? '#C4A060' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {checked && (
            <span
              style={{
                color: '#3A1E08',
                fontSize: 12,
                fontWeight: 900,
                lineHeight: 1,
                marginTop: -1,
              }}
            >
              ✓
            </span>
          )}
        </div>

        {/* Name */}
        <span
          onClick={onToggle}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            fontWeight: checked ? 700 : 400,
            color: checked ? '#F0D898' : 'rgba(240,216,152,0.72)',
            flex: 1,
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
            cursor: 'pointer',
          }}
        >
          {ritual.name}
        </span>

        {/* Streak */}
        {ritual.streakCount > 1 && alive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>🔥</span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 700,
                color: '#C8A858',
                opacity: 0.8,
              }}
            >
              {ritual.streakCount}
            </span>
          </div>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
            color: 'rgba(196,160,96,0.2)',
            fontSize: 13,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Drop line — BELOW */}
      {dropEdge === 'after' && (
        <div style={{ position: 'absolute', bottom: 3, left: 0, right: 0 }}>
          <DropLine />
        </div>
      )}
    </div>
  );
}

/* ── Add ritual row ──────────────────────────────────────────── */
function AddRitual({ time, onAdd }: { time: string; onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    setOpen(false);
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 4px 10px',
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          color: 'rgba(196,160,96,0.55)',
          letterSpacing: '0.06em',
          display: 'block',
        }}
      >
        + add ritual
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10, padding: '0 2px' }}>
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder={`New ${time} ritual…`}
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(196,160,96,0.25)',
          borderRadius: 8,
          padding: '7px 10px',
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          color: '#F0D898',
          outline: 'none',
        }}
      />
      <button
        type="button"
        onClick={submit}
        style={{
          background: 'rgba(196,160,96,0.18)',
          border: '1px solid rgba(196,160,96,0.35)',
          borderRadius: 8,
          padding: '0 12px',
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          color: '#C8A858',
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        ADD
      </button>
    </div>
  );
}

/* ── Add session row ─────────────────────────────────────────── */
function AddSession({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    setOpen(false);
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 4px 10px',
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          color: 'rgba(196,160,96,0.55)',
          letterSpacing: '0.06em',
          display: 'block',
        }}
      >
        + add session
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10, padding: '0 2px', flex: 1 }}>
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Session name (e.g. Midday)…"
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(196,160,96,0.25)',
          borderRadius: 8,
          padding: '7px 10px',
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          color: '#F0D898',
          outline: 'none',
        }}
      />
      <button
        type="button"
        onClick={submit}
        style={{
          background: 'rgba(196,160,96,0.18)',
          border: '1px solid rgba(196,160,96,0.35)',
          borderRadius: 8,
          padding: '0 12px',
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          color: '#C8A858',
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        ADD
      </button>
    </div>
  );
}

/* ── Time section ────────────────────────────────────────────── */
function TimeSection({
  label,
  icon,
  rituals,
  checkedIds,
  onToggle,
  onDelete,
  onAdd,
  onAddSession,
  onDragStart,
  dragId,
  dropTarget,
}: {
  label: string;
  icon: string;
  rituals: Ritual[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => void;
  onAddSession: (name: string) => void;
  onDragStart: (id: string) => void;
  dragId: string | null;
  dropTarget: DropTarget;
}) {
  const emptyLabel = rituals.length === 0;

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: emptyLabel ? '8px 0 6px' : '10px 0 8px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: emptyLabel ? 10 : 11,
            fontWeight: emptyLabel ? 400 : 700,
            textTransform: 'uppercase',
            letterSpacing: emptyLabel ? '0.2em' : '0.18em',
            color: emptyLabel ? 'rgba(196,160,96,0.35)' : 'rgba(196,160,96,0.65)',
          }}
        >
          {icon} {label}
        </span>
      </div>
      {rituals.map((r) => (
        <RitualRow
          key={r.id}
          ritual={r}
          checked={checkedIds.has(r.id)}
          onToggle={() => onToggle(r.id)}
          onDelete={() => onDelete(r.id)}
          onDragStart={onDragStart}
          isDragging={dragId === r.id}
          dropEdge={dropTarget?.id === r.id && dragId !== r.id ? dropTarget.pos : null}
        />
      ))}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <AddRitual time={label.toLowerCase()} onAdd={onAdd} />
        </div>
        <AddSession onAdd={onAddSession} />
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function DailyRituals() {
  const [rituals, setRituals] = useState<Ritual[]>(DEFAULT_RITUALS);
  const [sessions, setSessions] = useState<string[]>(['morning', 'evening']);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const dragIdRef = useRef<string | null>(null);
  const dropTargetRef = useRef<DropTarget>(null);

  /* load */
  useEffect(() => {
    try {
      const r = localStorage.getItem(LS_RITUALS);
      if (r) setRituals(JSON.parse(r));
      const d = localStorage.getItem(LS_DONE);
      if (d) setDoneIds(new Set(JSON.parse(d)));
      const s = localStorage.getItem(LS_SESSIONS);
      if (s) setSessions(JSON.parse(s));
    } catch {}
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  /* rotate quote every 8s */
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  /* ── Drag logic ── */
  function startDrag(id: string) {
    dragIdRef.current = id;
    dropTargetRef.current = null;
    setDragId(id);
    setDropTarget(null);

    function onMove(e: PointerEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const row = el?.closest('[data-ritual-id]') as HTMLElement | null;
      const overId = row?.dataset.ritualId ?? null;

      if (!overId || overId === dragIdRef.current) {
        if (dropTargetRef.current !== null) {
          dropTargetRef.current = null;
          setDropTarget(null);
        }
        return;
      }

      const rect = row!.getBoundingClientRect();
      const pos: 'before' | 'after' = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

      if (dropTargetRef.current?.id !== overId || dropTargetRef.current?.pos !== pos) {
        const next: DropTarget = { id: overId, pos };
        dropTargetRef.current = next;
        setDropTarget(next);
      }
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      const fromId = dragIdRef.current;
      const target = dropTargetRef.current;

      dragIdRef.current = null;
      dropTargetRef.current = null;
      setDragId(null);
      setDropTarget(null);

      if (!fromId || !target) return;

      setRituals((prev) => {
        const next = [...prev];
        const fromIdx = next.findIndex((r) => r.id === fromId);
        const toIdx = next.findIndex((r) => r.id === target.id);
        if (fromIdx < 0 || toIdx < 0) return prev;
        const [item] = next.splice(fromIdx, 1);
        // Recompute toIdx after splice
        const newToIdx = next.findIndex((r) => r.id === target.id);
        const insertAt = target.pos === 'before' ? newToIdx : newToIdx + 1;
        next.splice(insertAt, 0, item);
        save(next);
        return next;
      });
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function toggle(id: string) {
    const nowDone = new Set(doneIds);
    const ritual = rituals.find((r) => r.id === id);
    if (!ritual) return;
    if (nowDone.has(id)) {
      nowDone.delete(id);
    } else {
      nowDone.add(id);
      syncEvent('ritual_done', { ritualId: id, ritualName: ritual.name, session: ritual.time });
      setRituals((prev) => {
        const next = prev.map((r) => {
          if (r.id !== id) return r;
          const wasYesterday = r.lastDone === YESTERDAY;
          const wasToday = r.lastDone === TODAY;
          if (wasToday) return r;
          return { ...r, streakCount: wasYesterday ? r.streakCount + 1 : 1, lastDone: TODAY };
        });
        save(next);
        return next;
      });
    }
    setDoneIds(nowDone);
    saveDone(nowDone);
  }

  function addRitual(name: string, time: string) {
    const r: Ritual = { id: `r${Date.now()}`, name, time, streakCount: 0, lastDone: null };
    const next = [...rituals, r];
    setRituals(next);
    save(next);
  }

  function addSession(name: string) {
    const key = name.toLowerCase().trim();
    if (!key || sessions.includes(key)) return;
    const next = [...sessions, key];
    setSessions(next);
    try {
      localStorage.setItem(LS_SESSIONS, JSON.stringify(next));
    } catch {}
    syncPref(LS_SESSIONS, next);
  }

  function deleteRitual(id: string) {
    const next = rituals.filter((r) => r.id !== id);
    setRituals(next);
    save(next);
    const nowDone = new Set(doneIds);
    nowDone.delete(id);
    setDoneIds(nowDone);
    saveDone(nowDone);
  }

  const total = rituals.length;
  const done = doneIds.size;
  const score = total > 0 ? Math.round((done / total) * 100) : 0;
  const peaked = score === 100 && total > 0;

  function scoreLabel(s: number): string {
    if (s === 0) return 'Starting…';
    if (s <= 20) return 'Waking up';
    if (s <= 40) return 'Building';
    if (s <= 60) return 'Flowing';
    if (s <= 80) return 'Rising';
    if (s < 100) return 'Almost there';
    return 'Peak ✦';
  }

  const sectionProps = { onDragStart: startDrag, dragId, dropTarget };

  return (
    <div
      style={{
        border: `1.5px solid ${peaked ? 'rgba(200,168,88,0.6)' : 'var(--header-border, rgba(196,160,96,0.22))'}`,
        borderRadius: 16,
        background: 'var(--header-bg, rgba(30,16,8,0.55))',
        overflow: 'hidden',
        transition: 'border-color 0.4s',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '12px 16px',
          background: peaked ? 'rgba(196,160,96,0.2)' : 'rgba(196,160,96,0.08)',
          borderBottom: open ? '1px solid rgba(196,160,96,0.18)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.3s',
        }}
      >
        <span style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: peaked ? '#F0D090' : '#C8A858',
              transition: 'color 0.3s',
            }}
          >
            Daily Rituals
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'rgba(196,160,96,0.60)',
              marginTop: 2,
            }}
          >
            {peaked ? '✦ Peak Alignment ✦' : 'Build Your Peak'}
          </div>
        </div>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: '#C4A060',
              opacity: 0.4,
              fontSize: 11,
              transform: `rotate(${open ? 180 : 0}deg)`,
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </span>
      </div>

      {open && (
        <>
          {/* Alignment bar */}
          <div
            style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(196,160,96,0.08)' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'rgba(196,160,96,0.65)',
                }}
              >
                Today's Alignment
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 700,
                  fontStyle: 'italic',
                  color: peaked ? '#F0D090' : '#C8A858',
                  transition: 'color 0.3s',
                  letterSpacing: '0.04em',
                }}
              >
                {scoreLabel(score)}
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: 'rgba(196,160,96,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${score}%`,
                  background: peaked
                    ? 'linear-gradient(90deg,#C4A060,#E0C870,#C4A060)'
                    : 'linear-gradient(90deg,#C4A060,#C8B858)',
                  boxShadow: peaked ? '0 0 10px #C4A06088' : '0 0 5px #C4A06044',
                  transition: 'width 0.5s ease, box-shadow 0.3s',
                }}
              />
            </div>
          </div>

          {sessions.map((session, si) => (
            <div key={session}>
              {si > 0 && (
                <div
                  style={{ margin: '2px 16px', height: 1, background: 'rgba(196,160,96,0.08)' }}
                />
              )}
              <TimeSection
                label={session.toUpperCase()}
                icon="·"
                rituals={rituals.filter((r) => r.time === session)}
                checkedIds={doneIds}
                onToggle={toggle}
                onDelete={deleteRitual}
                onAdd={(n) => addRitual(n, session)}
                onAddSession={addSession}
                {...sectionProps}
              />
            </div>
          ))}

          {/* Quote */}
          <div
            style={{
              padding: '10px 20px 16px',
              textAlign: 'center',
              borderTop: '1px solid rgba(196,160,96,0.07)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                fontStyle: 'italic',
                color: 'rgba(196,160,96,0.62)',
                letterSpacing: '0.03em',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {QUOTES[quoteIdx]}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
