'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Constants ───────────────────────────────────────────────── */
const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const LS_RITUALS = 'colourmap:rituals';
const LS_DONE = `colourmap:rituals-done-${TODAY}`;

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
  time: 'morning' | 'evening';
  streakCount: number;
  lastDone: string | null;
};

/* ── Helpers ─────────────────────────────────────────────────── */
function save(rituals: Ritual[]) {
  try {
    localStorage.setItem(LS_RITUALS, JSON.stringify(rituals));
  } catch {}
}
function saveDone(done: Set<string>) {
  try {
    localStorage.setItem(LS_DONE, JSON.stringify([...done]));
  } catch {}
}
function isStreakAlive(r: Ritual) {
  return r.lastDone === TODAY || r.lastDone === YESTERDAY;
}

/* ── Ritual row ──────────────────────────────────────────────── */
function RitualRow({
  ritual,
  checked,
  onToggle,
  onDelete,
}: {
  ritual: Ritual;
  checked: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const alive = isStreakAlive(ritual);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        marginBottom: 6,
        cursor: 'pointer',
        background: checked ? 'rgba(196,160,96,0.13)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${checked ? 'rgba(196,160,96,0.45)' : 'rgba(196,160,96,0.1)'}`,
        boxShadow: checked ? '0 0 14px rgba(196,160,96,0.1) inset' : 'none',
        transition: 'background 0.25s, border 0.25s, box-shadow 0.25s',
        position: 'relative',
      }}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          border: `1.5px solid ${checked ? '#C8A858' : 'rgba(196,160,96,0.22)'}`,
          background: checked ? '#C4A060' : 'transparent',
          flexShrink: 0,
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
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          fontWeight: checked ? 700 : 500,
          color: checked ? '#F0D898' : 'rgba(240,216,152,0.45)',
          flex: 1,
          letterSpacing: '0.03em',
          transition: 'color 0.2s',
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

      {/* Delete (subtle ×) */}
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
  );
}

/* ── Add ritual row ──────────────────────────────────────────── */
function AddRitual({
  time,
  onAdd,
}: {
  time: 'morning' | 'evening';
  onAdd: (name: string) => void;
}) {
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
          fontSize: 11,
          color: 'rgba(196,160,96,0.35)',
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

/* ── Time section ────────────────────────────────────────────── */
function TimeSection({
  label,
  icon,
  rituals,
  checkedIds,
  onToggle,
  onDelete,
  onAdd,
}: {
  label: string;
  icon: string;
  rituals: Ritual[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string) => void;
}) {
  if (rituals.length === 0 && label === 'EVENING') {
    return (
      <div style={{ padding: '0 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0 6px' }}>
          <span
            style={{
              fontSize: 10,
              color: 'rgba(196,160,96,0.35)',
              fontFamily: 'var(--font-serif)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            {icon} {label}
          </span>
        </div>
        <AddRitual time="evening" onAdd={onAdd} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0 8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'rgba(196,160,96,0.4)',
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
        />
      ))}
      <AddRitual time={label === 'MORNING' ? 'morning' : 'evening'} onAdd={onAdd} />
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function DailyRituals() {
  const [rituals, setRituals] = useState<Ritual[]>(DEFAULT_RITUALS);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  /* load */
  useEffect(() => {
    try {
      const r = localStorage.getItem(LS_RITUALS);
      if (r) setRituals(JSON.parse(r));
      const d = localStorage.getItem(LS_DONE);
      if (d) setDoneIds(new Set(JSON.parse(d)));
    } catch {}
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  /* rotate quote every 8s */
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  function toggle(id: string) {
    const nowDone = new Set(doneIds);
    const ritual = rituals.find((r) => r.id === id);
    if (!ritual) return;

    if (nowDone.has(id)) {
      nowDone.delete(id);
    } else {
      nowDone.add(id);
      /* update streak */
      setRituals((prev) => {
        const next = prev.map((r) => {
          if (r.id !== id) return r;
          const wasYesterday = r.lastDone === YESTERDAY;
          const wasToday = r.lastDone === TODAY;
          if (wasToday) return r;
          return {
            ...r,
            streakCount: wasYesterday ? r.streakCount + 1 : 1,
            lastDone: TODAY,
          };
        });
        save(next);
        return next;
      });
    }
    setDoneIds(nowDone);
    saveDone(nowDone);
  }

  function addRitual(name: string, time: 'morning' | 'evening') {
    const r: Ritual = { id: `r${Date.now()}`, name, time, streakCount: 0, lastDone: null };
    const next = [...rituals, r];
    setRituals(next);
    save(next);
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

  const morning = rituals.filter((r) => r.time === 'morning');
  const evening = rituals.filter((r) => r.time === 'evening');
  const total = rituals.length;
  const done = doneIds.size;
  const score = total > 0 ? Math.round((done / total) * 100) : 0;
  const peaked = score === 100 && total > 0;

  return (
    <div
      style={{
        border: `1.5px solid ${peaked ? 'rgba(200,168,88,0.6)' : 'rgba(196,160,96,0.22)'}`,
        borderRadius: 16,
        background: 'rgba(30,16,8,0.55)',
        overflow: 'hidden',
        transition: 'border-color 0.4s',
      }}
    >
      {/* ── Header (comic title card) ── */}
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
              fontSize: 13,
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
              fontSize: 8,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'rgba(196,160,96,0.4)',
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
          {/* ── Alignment bar ── */}
          <div
            style={{
              padding: '12px 16px 10px',
              borderBottom: '1px solid rgba(196,160,96,0.08)',
            }}
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
                  fontSize: 8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'rgba(196,160,96,0.4)',
                }}
              >
                Today's Alignment
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 800,
                  color: peaked ? '#F0D090' : '#C8A858',
                  transition: 'color 0.3s',
                }}
              >
                {score}%
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

          {/* ── Morning rituals ── */}
          {morning.length > 0 && (
            <TimeSection
              label="MORNING"
              icon="○"
              rituals={morning}
              checkedIds={doneIds}
              onToggle={toggle}
              onDelete={deleteRitual}
              onAdd={(name) => addRitual(name, 'morning')}
            />
          )}
          {morning.length === 0 && (
            <div style={{ padding: '0 16px 4px' }}>
              <div style={{ padding: '10px 0 6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.22em',
                    color: 'rgba(196,160,96,0.35)',
                  }}
                >
                  ○ MORNING
                </span>
              </div>
              <AddRitual time="morning" onAdd={(name) => addRitual(name, 'morning')} />
            </div>
          )}

          {/* Divider */}
          <div style={{ margin: '2px 16px', height: 1, background: 'rgba(196,160,96,0.08)' }} />

          {/* ── Evening rituals ── */}
          <TimeSection
            label="EVENING"
            icon="◑"
            rituals={evening}
            checkedIds={doneIds}
            onToggle={toggle}
            onDelete={deleteRitual}
            onAdd={(name) => addRitual(name, 'evening')}
          />

          {/* ── Quote ── */}
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
                fontSize: 10,
                fontStyle: 'italic',
                color: 'rgba(196,160,96,0.35)',
                letterSpacing: '0.04em',
                lineHeight: 1.55,
                margin: 0,
                transition: 'opacity 0.5s',
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
