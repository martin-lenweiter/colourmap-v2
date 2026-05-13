'use client';

import { useEffect, useRef, useState } from 'react';
import { syncEvent } from '@/lib/sync';

const SERIF = 'var(--font-serif)';
const LS_KEY = 'colourmap:emotions-log';
const LS_LIST_KEY = 'colourmap:emotions-list';

const RAINBOW_STOPS = [
  '#80B0C8',
  '#80B898',
  '#90B880',
  '#C4C068',
  '#C8A858',
  '#C49080',
  '#C07898',
  '#C098B0',
  '#C0A0B8',
  '#A8C0D0',
];

const SUGGESTIONS = {
  positive: [
    'Clarity',
    'Wonder',
    'Gratitude',
    'Inspired',
    'Alive',
    'Connected',
    'Hopeful',
    'Serene',
    'Excited',
  ],
  negative: [
    'Lonely',
    'Confused',
    'Chaotic',
    'Numb',
    'Restless',
    'Overwhelmed',
    'Bitter',
    'Lost',
    'Anxious',
  ],
};

const DEFAULT_IDS = new Set([
  'peace',
  'love',
  'reason',
  'acceptance',
  'courage',
  'anger',
  'fear',
  'grief',
  'apathy',
  'shame',
]);

type EmotionItem = { id: string; label: string };

const DEFAULT_ITEMS: EmotionItem[] = [
  { id: 'peace', label: 'Peace' },
  { id: 'love', label: 'Love' },
  { id: 'reason', label: 'Reason' },
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'courage', label: 'Courage' },
  { id: 'anger', label: 'Anger' },
  { id: 'fear', label: 'Fear' },
  { id: 'grief', label: 'Grief' },
  { id: 'apathy', label: 'Apathy' },
  { id: 'shame', label: 'Shame' },
];

function spectrumColor(t: number): string {
  const n = RAINBOW_STOPS.length - 1;
  const scaled = Math.max(0, Math.min(n, t * n));
  const i = Math.floor(scaled);
  const f = scaled - i;
  if (i >= n) return RAINBOW_STOPS[n];
  const px = (h: string, o: number) => parseInt(h.slice(o, o + 2), 16);
  const lp = (a: number, b: number) => Math.round(a + f * (b - a));
  const r = lp(px(RAINBOW_STOPS[i], 1), px(RAINBOW_STOPS[i + 1], 1));
  const g = lp(px(RAINBOW_STOPS[i], 3), px(RAINBOW_STOPS[i + 1], 3));
  const b = lp(px(RAINBOW_STOPS[i], 5), px(RAINBOW_STOPS[i + 1], 5));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getColor(pos: number, total: number): string {
  if (total <= 1) return RAINBOW_STOPS[4];
  return spectrumColor(pos / (total - 1));
}

export type EmotionEntry = { label: string; color: string; idx: number; note: string };

export default function EmotionMultiSelect() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [emotions, setEmotions] = useState<EmotionItem[]>(DEFAULT_ITEMS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [pillTitle, setPillTitle] = useState('Emotion Rainbow');
  const [_renamingPill, setRenamingPill] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const _pillInputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const emotionsRef = useRef(emotions);
  emotionsRef.current = emotions;
  const draggingIdRef = useRef<string | null>(null);
  const dropIndexRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_LIST_KEY);
      if (stored) setEmotions(JSON.parse(stored));
      const t = localStorage.getItem('colourmap:rainbow-pill-title');
      if (t) setPillTitle(t);
      else setPillTitle('Emotion Rainbow');
    } catch {}
  }, []);

  function _savePillTitle(v: string) {
    const val = v.trim() || 'Rainbow';
    setPillTitle(val);
    setRenamingPill(false);
    try {
      localStorage.setItem('colourmap:rainbow-pill-title', val);
    } catch {}
  }

  function saveList(next: EmotionItem[]) {
    setEmotions(next);
    try {
      localStorage.setItem(LS_LIST_KEY, JSON.stringify(next));
    } catch {}
  }

  /* ── Drag helpers ───────────────────────────────────────────── */
  function calcDropIndex(clientY: number): number {
    const list = emotionsRef.current;
    for (let i = 0; i < list.length; i++) {
      const ref = rowRefs.current.get(list[i].id);
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return list.length;
  }

  function applyReorder(fromId: string, targetDrop: number) {
    const list = emotionsRef.current;
    const fromIdx = list.findIndex((e) => e.id === fromId);
    if (fromIdx === -1) return;
    const next = [...list];
    const [item] = next.splice(fromIdx, 1);
    const insertAt = targetDrop > fromIdx ? targetDrop - 1 : targetDrop;
    next.splice(Math.max(0, Math.min(next.length, insertAt)), 0, item);
    saveList(next);
  }

  /* ── Selection / log ────────────────────────────────────────── */
  function toggle(id: string) {
    if (editMode) return;
    if (!selected[id]) {
      // first click — activate colour only
      setSelected((prev) => ({ ...prev, [id]: true }));
      setNotesOpen((prev) => ({ ...prev, [id]: false }));
    } else if (!notesOpen[id]) {
      // second click — open write area
      setNotesOpen((prev) => ({ ...prev, [id]: true }));
    } else {
      // third click — collapse notes but keep emotion active
      setNotesOpen((prev) => ({ ...prev, [id]: false }));
    }
  }

  function removeEmotion(id: string) {
    saveList(emotions.filter((e) => e.id !== id));
    setSelected((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setNotesOpen((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setNotes((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  }

  function addEmotion() {
    const label = newLabel.trim();
    if (!label) return;
    const mid = Math.floor(emotions.length / 2);
    const next = [...emotions];
    next.splice(mid, 0, { id: `custom-${Date.now()}`, label });
    saveList(next);
    setNewLabel('');
    setAdding(false);
  }

  function handleLog() {
    const entries = emotions
      .map((e, i) => ({ ...e, pos: i, color: getColor(i, emotions.length) }))
      .filter((e) => selected[e.id]);
    if (entries.length === 0) return;
    const ts = new Date().toISOString();
    try {
      const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      localStorage.setItem(
        LS_KEY,
        JSON.stringify(
          [
            ...entries.map((e) => ({
              ts,
              idx: e.pos,
              note: notes[e.id]?.trim() || '',
              label: e.label,
            })),
            ...existing,
          ].slice(0, 200),
        ),
      );
    } catch {}
    for (const e of entries) {
      syncEvent('circle_note', { circle: 'emotions', idx: e.pos, note: notes[e.id]?.trim() || '' });
    }
    window.dispatchEvent(new CustomEvent('colourmap:emotions-updated'));
    setSelected({});
    setNotesOpen({});
    setNotes({});
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1400);
  }

  const hasSelection = emotions.some((e) => selected[e.id]);
  const listed = emotions;

  // ── Pill ────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 14px',
          borderRadius: 10,
          border: '1px solid var(--panel-border, rgba(196,160,96,0.18))',
          background: 'transparent',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--palette-panel-muted, rgba(196,160,96,0.55))',
          }}
        >
          {pillTitle}
        </span>
      </button>
    );
  }

  // ── Open ────────────────────────────────────────────────────
  return (
    <div
      style={{
        border: '1px solid var(--panel-border, rgba(196,160,96,0.18))',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
      }}
    >
      {/* Header — click anywhere to close */}
      <div
        onClick={() => {
          setOpen(false);
          setEditMode(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px 9px',
          borderBottom: '1px solid rgba(196,160,96,0.12)',
          background: 'rgba(196,160,96,0.07)',
          cursor: 'pointer',
        }}
      >
        <span
          onClick={() => {
            setOpen(false);
            setEditMode(false);
          }}
          style={{
            fontFamily: SERIF,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(92,48,24,0.55)',
            cursor: 'pointer',
          }}
        >
          {pillTitle}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            setEditMode(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: 'rgba(92,48,24,0.3)',
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Emotion rows */}
      {listed.map((em, i) => {
        const color = getColor(i, listed.length);
        const on = !!selected[em.id];
        const isCustom = !DEFAULT_IDS.has(em.id);
        const isDragging = draggingId === em.id;

        return (
          <div
            key={em.id}
            ref={(el) => {
              if (el) rowRefs.current.set(em.id, el);
              else rowRefs.current.delete(em.id);
            }}
            style={{
              borderBottom: '1px solid rgba(196,160,96,0.07)',
              opacity: isDragging ? 0.35 : 1,
              boxShadow:
                draggingId !== null && dropIndex === i && !isDragging
                  ? 'inset 0 3px 0 0 rgba(196,160,96,0.7)'
                  : 'none',
              transition: 'opacity 0.12s, box-shadow 0.06s',
            }}
          >
            <div
              role={editMode ? undefined : 'button'}
              tabIndex={editMode ? undefined : 0}
              onClick={() => toggle(em.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                justifyContent: editMode ? 'flex-start' : 'center',
                cursor: editMode ? 'default' : 'pointer',
                background: on ? `${color}C0` : `${color}70`,
                transition: 'background 0.15s',
                userSelect: 'none',
              }}
            >
              {/* Drag handle — custom only, edit mode only */}
              {editMode && isCustom && (
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    draggingIdRef.current = em.id;
                    dropIndexRef.current = i;
                    setDraggingId(em.id);
                    setDropIndex(i);
                  }}
                  onPointerMove={(e) => {
                    if (draggingIdRef.current !== em.id) return;
                    const di = calcDropIndex(e.clientY);
                    dropIndexRef.current = di;
                    setDropIndex(di);
                  }}
                  onPointerUp={() => {
                    if (draggingIdRef.current === em.id && dropIndexRef.current !== null) {
                      applyReorder(em.id, dropIndexRef.current);
                    }
                    draggingIdRef.current = null;
                    dropIndexRef.current = null;
                    setDraggingId(null);
                    setDropIndex(null);
                  }}
                  style={{
                    cursor: 'grab',
                    flexShrink: 0,
                    padding: '2px 4px',
                    color: 'rgba(20,8,2,0.35)',
                    fontSize: 13,
                    lineHeight: 1,
                    touchAction: 'none',
                  }}
                >
                  ⠿
                </div>
              )}

              {/* Spacer to keep alignment for non-draggable rows in edit mode */}
              {editMode && !isCustom && <div style={{ width: 21, flexShrink: 0 }} />}

              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 11,
                  fontWeight: on ? 700 : 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: on ? 'rgba(20,8,2,0.92)' : 'rgba(20,8,2,0.72)',
                  flex: editMode ? 1 : undefined,
                  transition: 'all 0.15s',
                }}
              >
                {em.label}
              </span>

              {!editMode && on && (
                <span style={{ fontSize: 10, color: 'rgba(20,8,2,0.7)' }}>✓</span>
              )}

              {/* Delete — custom only */}
              {editMode && isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEmotion(em.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'rgba(20,8,2,0.4)',
                    padding: '0 2px',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Note input — opens on second click */}
            {!editMode && notesOpen[em.id] && (
              <div style={{ padding: '0 14px 10px 14px', background: `${color}28` }}>
                <style>{`.ems-note-${em.id}::placeholder { color: rgba(46,18,6,0.45); }`}</style>
                <textarea
                  value={notes[em.id] || ''}
                  onChange={(ev) => setNotes((prev) => ({ ...prev, [em.id]: ev.target.value }))}
                  placeholder="what does it feel like…"
                  rows={2}
                  spellCheck={false}
                  autoCorrect="off"
                  className={`ems-note-${em.id}`}
                  style={{
                    width: '100%',
                    background: `${color}18`,
                    border: `1px solid ${color}55`,
                    borderRadius: 8,
                    outline: 'none',
                    resize: 'none',
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: '#1A0802',
                    padding: '7px 10px',
                    lineHeight: 1.5,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Drop line at end of list */}
      {draggingId !== null && dropIndex === emotions.length && (
        <div style={{ height: 3, background: 'rgba(196,160,96,0.7)', margin: '0' }} />
      )}

      {/* Add emotion — neutral row, no colour */}
      {adding ? (
        <div
          style={{
            padding: '8px 14px 10px',
            borderBottom: '1px solid rgba(196,160,96,0.07)',
            background: 'rgba(196,160,96,0.04)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <input
                ref={addInputRef}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addEmotion();
                  if (e.key === 'Escape') {
                    setAdding(false);
                    setNewLabel('');
                  }
                }}
                placeholder="name this feeling…"
                spellCheck={false}
                autoCorrect="off"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(196,160,96,0.3)',
                  outline: 'none',
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: 'rgba(46,18,6,0.8)',
                  padding: '3px 0',
                }}
              />
              <button
                type="button"
                onClick={addEmotion}
                style={{
                  background: 'rgba(196,160,96,0.18)',
                  border: '1px solid rgba(196,160,96,0.35)',
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontFamily: SERIF,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: 'rgba(92,48,24,0.7)',
                  cursor: 'pointer',
                }}
              >
                add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewLabel('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'rgba(92,48,24,0.25)',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            {/* Suggestion pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(['positive', 'negative'] as const).map((group) => (
                <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color:
                        group === 'positive' ? 'rgba(128,184,152,0.7)' : 'rgba(192,120,152,0.7)',
                    }}
                  >
                    {group}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {SUGGESTIONS[group].map((label) => {
                      const exists = emotions.some(
                        (e) => e.label.toLowerCase() === label.toLowerCase(),
                      );
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={exists}
                          onClick={() => {
                            setNewLabel(label);
                            setTimeout(() => addInputRef.current?.focus(), 0);
                          }}
                          style={{
                            padding: '3px 10px',
                            borderRadius: 99,
                            border: `1px solid ${group === 'positive' ? 'rgba(128,184,152,0.35)' : 'rgba(192,120,152,0.35)'}`,
                            background: exists
                              ? 'transparent'
                              : group === 'positive'
                                ? 'rgba(128,184,152,0.1)'
                                : 'rgba(192,120,152,0.1)',
                            fontFamily: SERIF,
                            fontSize: 10,
                            letterSpacing: '0.08em',
                            color: exists
                              ? 'rgba(92,48,24,0.18)'
                              : group === 'positive'
                                ? 'rgba(80,140,100,0.8)'
                                : 'rgba(150,80,100,0.8)',
                            cursor: exists ? 'default' : 'pointer',
                            textDecoration: exists ? 'line-through' : 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setTimeout(() => addInputRef.current?.focus(), 0);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left',
            padding: '10px 14px',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(196,160,96,0.07)',
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(92,48,24,0.28)',
              flex: 1,
            }}
          >
            + add emotion
          </span>
        </button>
      )}

      {/* Footer — Log + edit toggle, hidden while adding */}
      {!adding && (
        <div
          style={{
            padding: '10px 14px 12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            minHeight: 44,
          }}
        >
          {saved ? (
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(196,160,96,0.7)',
              }}
            >
              ✓ logged
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLog}
                disabled={!hasSelection}
                style={{
                  padding: '6px 28px',
                  borderRadius: 99,
                  border: `1px solid rgba(196,160,96,${hasSelection ? '0.4' : '0.15'})`,
                  background: hasSelection ? 'rgba(196,160,96,0.12)' : 'transparent',
                  fontFamily: SERIF,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: hasSelection ? 'rgba(92,48,24,0.8)' : 'rgba(92,48,24,0.2)',
                  cursor: hasSelection ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                Log
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode((v) => !v);
                  setAdding(false);
                  setNewLabel('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: SERIF,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: editMode ? 'rgba(92,48,24,0.65)' : 'rgba(92,48,24,0.22)',
                  padding: '2px 4px',
                  transition: 'color 0.15s',
                }}
              >
                {editMode ? 'done' : 'edit'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
