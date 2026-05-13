'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CoachNote from './CoachNote';
import LearnMorePill from './LearnMorePill';

/* ── Types ───────────────────────────────────────────────────── */
type ThoughtLoop = { id: string; loop: string; payoff: string; reframe: string };
type CrewMember = { id: string; name: string; note: string };
type CheckItem = { id: string; text: string; done: boolean };
type SavedContent = {
  id: string;
  kind: 'quote' | 'book' | 'music' | 'video' | 'other';
  title: string;
  note: string;
};

type AffirmationItem = { id: string; text: string };

type IWData = {
  affirmations: AffirmationItem[];
  loops: ThoughtLoop[];
  crew: CrewMember[];
  practices: CheckItem[];
  env: CheckItem[];
  content: SavedContent[];
};

const LS_KEY = 'colourmap:innerwork';
const EMPTY: IWData = {
  affirmations: [],
  loops: [],
  crew: [],
  practices: [],
  env: [],
  content: [],
};

const _settled = (l: ThoughtLoop) => l.payoff.trim() && l.reframe.trim();

function uid() {
  return crypto.randomUUID();
}

const SERIF = 'var(--font-serif)';
const och = (a: number) =>
  a >= 0.5
    ? `var(--palette-panel-text, rgba(196,160,96,${a}))`
    : `var(--palette-panel-muted, rgba(196,160,96,${a}))`;
const cream = (a: number) => `var(--palette-panel-text, rgba(240,216,152,${a}))`;

const KIND_LABELS: Record<SavedContent['kind'], string> = {
  quote: '❝',
  book: '◫',
  music: '♪',
  video: '▷',
  other: '·',
};

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({
  label,
  count,
  open,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid var(--panel-border, rgba(196,160,96,0.14))`,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '11px 14px 9px',
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: och(0.75),
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            color: och(0.45),
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <span style={{ fontSize: 8, opacity: 0.35 }}>{open ? '▲' : '▼'}</span>
        </span>
      </button>
      {open && <div style={{ padding: '0 14px 12px' }}>{children}</div>}
    </div>
  );
}

/* ── Inline text input ───────────────────────────────────────── */
function InlineInput({
  value,
  onChange,
  placeholder,
  multiline,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const style: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${och(0.25)}`,
    outline: 'none',
    fontFamily: SERIF,
    fontSize: 14,
    color: cream(0.88),
    lineHeight: 1.6,
    resize: 'none' as const,
    padding: '3px 0',
  };
  if (multiline) {
    return (
      <textarea
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        spellCheck={false}
        autoCorrect="off"
        style={style}
      />
    );
  }
  return (
    <input
      autoFocus={autoFocus}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      autoCorrect="off"
      style={style}
    />
  );
}

/* ── Add row button ──────────────────────────────────────────── */
function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: `1px dashed ${och(0.25)}`,
        borderRadius: 8,
        padding: '7px 0',
        width: '100%',
        fontFamily: SERIF,
        fontSize: 13,
        color: och(0.5),
        cursor: 'pointer',
        letterSpacing: '0.04em',
        marginTop: 8,
      }}
    >
      + {label}
    </button>
  );
}

/* ── Field label ─────────────────────────────────────────────── */
function FieldLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: SERIF,
        fontSize: 11,
        color: och(0.58),
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        marginBottom: 5,
      }}
    >
      {text}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function InnerWork() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [data, setData] = useState<IWData>(EMPTY);
  const [openSec, setOpenSec] = useState<string>('loops');

  const [expandedLoop, setExpandedLoop] = useState<string | null>(null);
  const [addingLoop, setAddingLoop] = useState(false);
  const [loopDraft, setLoopDraft] = useState('');
  const [loopsTab, setLoopsTab] = useState<'loops' | 'guide'>('loops');

  const [addingCrew, setAddingCrew] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewNote, setCrewNote] = useState('');

  const [addingPractice, setAddingPractice] = useState(false);
  const [practiceDraft, setPracticeDraft] = useState('');
  const [addingEnv, setAddingEnv] = useState(false);
  const [envDraft, setEnvDraft] = useState('');

  const [addingContent, setAddingContent] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentNote, setContentNote] = useState('');
  const [contentKind, setContentKind] = useState<SavedContent['kind']>('quote');

  const addLoopRef = useRef<HTMLInputElement>(null);
  const loopRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const loopDraggingIdRef = useRef<string | null>(null);
  const loopDropIndexRef = useRef<number | null>(null);
  const [loopDraggingId, setLoopDraggingId] = useState<string | null>(null);
  const [loopDropIndex, setLoopDropIndex] = useState<number | null>(null);

  const [addingAffirmation, setAddingAffirmation] = useState(false);
  const [affirmationDraft, setAffirmationDraft] = useState('');

  const affirmRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const affirmDraggingIdRef = useRef<string | null>(null);
  const affirmDropIndexRef = useRef<number | null>(null);
  const [affirmDraggingId, setAffirmDraggingId] = useState<string | null>(null);
  const [affirmDropIndex, setAffirmDropIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setData({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const persist = useCallback((next: IWData) => {
    setData(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  function toggleSec(key: string) {
    setOpenSec((prev) => (prev === key ? '' : key));
  }

  /* ── Loop drag ──────────────────────────────────────────────── */
  function calcLoopDropIndex(clientY: number): number {
    for (let i = 0; i < data.loops.length; i++) {
      const ref = loopRowRefs.current.get(data.loops[i].id);
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return data.loops.length;
  }

  function applyLoopReorder(fromId: string, targetDrop: number) {
    const fromIdx = data.loops.findIndex((l) => l.id === fromId);
    if (fromIdx === -1) return;
    const next = [...data.loops];
    const [item] = next.splice(fromIdx, 1);
    const insertAt = targetDrop > fromIdx ? targetDrop - 1 : targetDrop;
    next.splice(Math.max(0, Math.min(next.length, insertAt)), 0, item);
    persist({ ...data, loops: next });
  }

  /* ── Affirmation drag ───────────────────────────────────────── */
  function calcAffirmDropIndex(clientY: number): number {
    for (let i = 0; i < data.affirmations.length; i++) {
      const ref = affirmRowRefs.current.get(data.affirmations[i].id);
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return data.affirmations.length;
  }

  function applyAffirmReorder(fromId: string, targetDrop: number) {
    const fromIdx = data.affirmations.findIndex((a) => a.id === fromId);
    if (fromIdx === -1) return;
    const next = [...data.affirmations];
    const [item] = next.splice(fromIdx, 1);
    const insertAt = targetDrop > fromIdx ? targetDrop - 1 : targetDrop;
    next.splice(Math.max(0, Math.min(next.length, insertAt)), 0, item);
    persist({ ...data, affirmations: next });
  }

  /* ── Mind loops ─────────────────────────────────────────────── */
  function commitLoop() {
    const t = loopDraft.trim();
    if (!t) {
      setAddingLoop(false);
      return;
    }
    persist({ ...data, loops: [...data.loops, { id: uid(), loop: t, payoff: '', reframe: '' }] });
    setLoopDraft('');
    setAddingLoop(false);
  }

  function updateLoop(id: string, field: keyof ThoughtLoop, value: string) {
    persist({
      ...data,
      loops: data.loops.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    });
  }

  function deleteLoop(id: string) {
    persist({ ...data, loops: data.loops.filter((l) => l.id !== id) });
    if (expandedLoop === id) setExpandedLoop(null);
  }

  /* ── Lift crew ──────────────────────────────────────────────── */
  function commitCrew() {
    const n = crewName.trim();
    if (!n) {
      setAddingCrew(false);
      return;
    }
    persist({ ...data, crew: [...data.crew, { id: uid(), name: n, note: crewNote.trim() }] });
    setCrewName('');
    setCrewNote('');
    setAddingCrew(false);
  }

  function deleteCrew(id: string) {
    persist({ ...data, crew: data.crew.filter((c) => c.id !== id) });
  }

  /* ── Checklists ──────────────────────────────────────────────── */
  function commitCheck(field: 'practices' | 'env', text: string) {
    const t = text.trim();
    if (!t) return;
    persist({ ...data, [field]: [...data[field], { id: uid(), text: t, done: false }] });
  }

  function toggleCheck(field: 'practices' | 'env', id: string) {
    persist({
      ...data,
      [field]: data[field].map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    });
  }

  function deleteCheck(field: 'practices' | 'env', id: string) {
    persist({ ...data, [field]: data[field].filter((i) => i.id !== id) });
  }

  /* ── Content ─────────────────────────────────────────────────── */
  function commitContent() {
    const t = contentTitle.trim();
    if (!t) {
      setAddingContent(false);
      return;
    }
    persist({
      ...data,
      content: [
        ...data.content,
        { id: uid(), kind: contentKind, title: t, note: contentNote.trim() },
      ],
    });
    setContentTitle('');
    setContentNote('');
    setContentKind('quote');
    setAddingContent(false);
  }

  function deleteContent(id: string) {
    persist({ ...data, content: data.content.filter((c) => c.id !== id) });
  }

  /* ── Render helpers ──────────────────────────────────────────── */
  function renderLoops() {
    const guide = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: SERIF, fontSize: 13, color: cream(0.75), lineHeight: 1.75 }}>
          What you repeat to yourself daily shapes how you see everything. A thought loop isn't just
          a thought — it becomes your reality.
        </div>

        <div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: och(0.6),
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              marginBottom: 6,
            }}
          >
            Why they stick
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 13, color: cream(0.65), lineHeight: 1.75 }}>
            Your brain prioritises threats. Negative thoughts fire faster and feel more true. That's
            biology, not weakness.
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: och(0.6),
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              marginBottom: 6,
            }}
          >
            How to shift
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 13, color: cream(0.65), lineHeight: 1.75 }}>
            You can't silence a loop — but you can replace it. Find what it's protecting you from,
            then offer a more honest alternative.
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: och(0.6),
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              marginBottom: 8,
            }}
          >
            What works
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 12,
              color: cream(0.58),
              lineHeight: 1.75,
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            Not toxic positivity — something slightly better than the loop. True enough to believe.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['I always mess things up', 'I am learning from everything I try'],
              ['Nobody cares about me', 'I am finding my people'],
              ['I am not good enough', 'I am enough to take the next step'],
              ['Nothing ever changes', 'Small things are already shifting'],
            ].map(([loop, reframe]) => (
              <div key={loop} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 12,
                    color: cream(0.38),
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  "{loop}"
                </div>
                <div style={{ color: och(0.45), fontSize: 12, paddingTop: 2, flexShrink: 0 }}>
                  →
                </div>
                <div
                  style={{
                    flex: 1,
                    fontFamily: SERIF,
                    fontSize: 12,
                    color: och(0.72),
                    lineHeight: 1.5,
                  }}
                >
                  "{reframe}"
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${och(0.1)}`,
            paddingTop: 12,
            fontFamily: SERIF,
            fontSize: 13,
            color: cream(0.6),
            lineHeight: 1.75,
            fontStyle: 'italic',
          }}
        >
          Talk to yourself like someone you love. Repetition works both ways.
        </div>
      </div>
    );

    const loops = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.loops.map((l, i) => {
          const isExp = expandedLoop === l.id;
          const isDragging = loopDraggingId === l.id;
          return (
            <div key={l.id}>
              {loopDraggingId !== null && loopDropIndex === i && !isDragging && (
                <div
                  style={{
                    height: 2,
                    background: och(0.55),
                    borderRadius: 2,
                    margin: '2px 4px 4px',
                  }}
                />
              )}
              <div
                ref={(el) => {
                  if (el) loopRowRefs.current.set(l.id, el);
                  else loopRowRefs.current.delete(l.id);
                }}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${och(0.18)}`,
                  overflow: 'hidden',
                  opacity: isDragging ? 0.35 : 1,
                  transition: 'opacity 0.12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {/* Drag handle */}
                  <div
                    onPointerDown={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                      loopDraggingIdRef.current = l.id;
                      loopDropIndexRef.current = i;
                      setLoopDraggingId(l.id);
                      setLoopDropIndex(i);
                    }}
                    onPointerMove={(e) => {
                      if (loopDraggingIdRef.current !== l.id) return;
                      const di = calcLoopDropIndex(e.clientY);
                      loopDropIndexRef.current = di;
                      setLoopDropIndex(di);
                    }}
                    onPointerUp={() => {
                      if (loopDraggingIdRef.current === l.id && loopDropIndexRef.current !== null) {
                        applyLoopReorder(l.id, loopDropIndexRef.current);
                      }
                      loopDraggingIdRef.current = null;
                      loopDropIndexRef.current = null;
                      setLoopDraggingId(null);
                      setLoopDropIndex(null);
                    }}
                    style={{
                      cursor: 'grab',
                      color: och(0.3),
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 4px 0 12px',
                      touchAction: 'none',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    ⠿
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedLoop(isExp ? null : l.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '10px 12px 10px 6px',
                      textAlign: 'left',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: cream(0.82),
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                        flex: 1,
                      }}
                    >
                      "{l.loop}"
                    </span>
                    <span style={{ color: och(0.35), fontSize: 11, flexShrink: 0, paddingTop: 3 }}>
                      {isExp ? '▲' : '▼'}
                    </span>
                  </button>
                </div>
                {isExp && (
                  <div
                    style={{
                      padding: '0 12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div>
                      <FieldLabel text="what keeps running" />
                      <InlineInput
                        value={l.loop}
                        onChange={(v) => updateLoop(l.id, 'loop', v)}
                        placeholder="the thought that keeps repeating…"
                        autoFocus
                      />
                    </div>
                    <div>
                      <FieldLabel text="what is this protecting you from?" />
                      <InlineInput
                        value={l.payoff}
                        onChange={(v) => updateLoop(l.id, 'payoff', v)}
                        placeholder="this thought keeps me safe from…"
                        multiline
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: SERIF,
                          fontSize: 13,
                          color: och(0.72),
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        How would you reframe this?
                      </div>
                      <div
                        style={{
                          fontFamily: SERIF,
                          fontSize: 12,
                          color: cream(0.45),
                          fontStyle: 'italic',
                          marginBottom: 8,
                          lineHeight: 1.5,
                        }}
                      >
                        Speak to yourself the way you would speak to someone you love.
                      </div>
                      <InlineInput
                        value={l.reframe}
                        onChange={(v) => updateLoop(l.id, 'reframe', v)}
                        placeholder="what is a more honest, energising way to see this…"
                        multiline
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteLoop(l.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(200,80,80,0.5)',
                        fontFamily: SERIF,
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                      }}
                    >
                      remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Drop line at end of list */}
        {loopDraggingId !== null && loopDropIndex === data.loops.length && (
          <div style={{ height: 3, background: och(0.65), borderRadius: 2 }} />
        )}

        {addingLoop ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            <input
              ref={addLoopRef}
              autoFocus
              type="text"
              value={loopDraft}
              onChange={(e) => setLoopDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitLoop();
                if (e.key === 'Escape') {
                  setAddingLoop(false);
                  setLoopDraft('');
                }
              }}
              placeholder="the thought that keeps looping…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.3)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 14,
                color: cream(0.85),
                padding: '4px 0',
                fontStyle: 'italic',
              }}
            />
            <button
              type="button"
              onClick={commitLoop}
              style={{
                background: 'none',
                border: `1px solid ${och(0.35)}`,
                borderRadius: 6,
                padding: '4px 12px',
                fontFamily: SERIF,
                fontSize: 12,
                color: och(0.65),
                cursor: 'pointer',
              }}
            >
              add
            </button>
          </div>
        ) : (
          <AddRow label="name the loop" onClick={() => setAddingLoop(true)} />
        )}
      </div>
    );

    return (
      <div>
        {/* tab switcher */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['loops', 'guide'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLoopsTab(tab)}
              style={{
                padding: '4px 14px',
                borderRadius: 999,
                border: `1px solid ${loopsTab === tab ? och(0.55) : och(0.2)}`,
                background: loopsTab === tab ? och(0.12) : 'transparent',
                fontFamily: SERIF,
                fontSize: 12,
                color: loopsTab === tab ? och(0.85) : och(0.4),
                cursor: 'pointer',
              }}
            >
              {tab === 'loops' ? 'my loops' : 'how it works'}
            </button>
          ))}
        </div>
        {loopsTab === 'loops' ? loops : guide}
      </div>
    );
  }

  function renderAffirmations() {
    function commitAffirmation() {
      const t = affirmationDraft.trim();
      if (!t) {
        setAddingAffirmation(false);
        return;
      }
      persist({ ...data, affirmations: [...data.affirmations, { id: uid(), text: t }] });
      setAffirmationDraft('');
      setAddingAffirmation(false);
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {data.affirmations.map((a, i) => {
          const isDragging = affirmDraggingId === a.id;
          return (
            <div key={a.id}>
              {affirmDraggingId !== null && affirmDropIndex === i && !isDragging && (
                <div
                  style={{
                    height: 2,
                    background: och(0.55),
                    borderRadius: 2,
                    margin: '2px 4px 4px',
                  }}
                />
              )}
              <div
                ref={(el) => {
                  if (el) affirmRowRefs.current.set(a.id, el);
                  else affirmRowRefs.current.delete(a.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  border: `1px solid ${och(0.14)}`,
                  borderRadius: 10,
                  opacity: isDragging ? 0.35 : 1,
                  transition: 'opacity 0.12s',
                }}
              >
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    affirmDraggingIdRef.current = a.id;
                    affirmDropIndexRef.current = i;
                    setAffirmDraggingId(a.id);
                    setAffirmDropIndex(i);
                  }}
                  onPointerMove={(e) => {
                    if (affirmDraggingIdRef.current !== a.id) return;
                    const di = calcAffirmDropIndex(e.clientY);
                    affirmDropIndexRef.current = di;
                    setAffirmDropIndex(di);
                  }}
                  onPointerUp={() => {
                    if (
                      affirmDraggingIdRef.current === a.id &&
                      affirmDropIndexRef.current !== null
                    ) {
                      applyAffirmReorder(a.id, affirmDropIndexRef.current);
                    }
                    affirmDraggingIdRef.current = null;
                    affirmDropIndexRef.current = null;
                    setAffirmDraggingId(null);
                    setAffirmDropIndex(null);
                  }}
                  style={{
                    cursor: 'grab',
                    color: och(0.3),
                    fontSize: 14,
                    flexShrink: 0,
                    touchAction: 'none',
                    userSelect: 'none',
                    lineHeight: 1,
                  }}
                >
                  ⠿
                </div>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: cream(0.82),
                    lineHeight: 1.5,
                    flex: 1,
                    fontStyle: 'italic',
                  }}
                >
                  {a.text}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    persist({
                      ...data,
                      affirmations: data.affirmations.filter((x) => x.id !== a.id),
                    })
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    color: och(0.28),
                    fontSize: 16,
                    cursor: 'pointer',
                    padding: 0,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
        {affirmDraggingId !== null && affirmDropIndex === data.affirmations.length && (
          <div style={{ height: 2, background: och(0.55), borderRadius: 2, margin: '2px 4px' }} />
        )}
        {addingAffirmation ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            <input
              autoFocus
              type="text"
              value={affirmationDraft}
              onChange={(e) => setAffirmationDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAffirmation();
                if (e.key === 'Escape') {
                  setAddingAffirmation(false);
                  setAffirmationDraft('');
                }
              }}
              placeholder="I am…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.3)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 14,
                color: cream(0.85),
                padding: '4px 0',
                fontStyle: 'italic',
              }}
            />
            <button
              type="button"
              onClick={commitAffirmation}
              style={{
                background: 'none',
                border: `1px solid ${och(0.35)}`,
                borderRadius: 6,
                padding: '4px 12px',
                fontFamily: SERIF,
                fontSize: 12,
                color: och(0.65),
                cursor: 'pointer',
              }}
            >
              add
            </button>
          </div>
        ) : (
          <AddRow label="add affirmation" onClick={() => setAddingAffirmation(true)} />
        )}
      </div>
    );
  }

  function renderCrew() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.crew.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 12px',
              border: `1px solid ${och(0.18)}`,
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: cream(0.88), marginBottom: 3 }}>
                {c.name}
              </div>
              {c.note && (
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: och(0.58),
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  {c.note}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => deleteCrew(c.id)}
              style={{
                background: 'none',
                border: 'none',
                color: och(0.35),
                fontSize: 18,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {addingCrew ? (
          <div
            style={{
              border: `1px solid ${och(0.22)}`,
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <input
              autoFocus
              type="text"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setAddingCrew(false);
                  setCrewName('');
                  setCrewNote('');
                }
              }}
              placeholder="name…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.25)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 15,
                color: cream(0.88),
                padding: '3px 0',
              }}
            />
            <input
              type="text"
              value={crewNote}
              onChange={(e) => setCrewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitCrew();
                if (e.key === 'Escape') {
                  setAddingCrew(false);
                  setCrewName('');
                  setCrewNote('');
                }
              }}
              placeholder="why they lift you…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.18)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 13,
                color: och(0.62),
                padding: '3px 0',
                fontStyle: 'italic',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setAddingCrew(false);
                  setCrewName('');
                  setCrewNote('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: och(0.4),
                  cursor: 'pointer',
                }}
              >
                cancel
              </button>
              <button
                type="button"
                onClick={commitCrew}
                style={{
                  background: 'none',
                  border: `1px solid ${och(0.35)}`,
                  borderRadius: 6,
                  padding: '4px 14px',
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: och(0.65),
                  cursor: 'pointer',
                }}
              >
                add
              </button>
            </div>
          </div>
        ) : (
          <AddRow label="add someone" onClick={() => setAddingCrew(true)} />
        )}
      </div>
    );
  }

  function renderChecklist(
    field: 'practices' | 'env',
    adding: boolean,
    draft: string,
    setAdding: (v: boolean) => void,
    setDraft: (v: string) => void,
    placeholder: string,
  ) {
    const items = data[field];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => toggleCheck(field, item.id)}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `1.5px solid ${item.done ? och(0.7) : och(0.35)}`,
                background: item.done ? och(0.18) : 'transparent',
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {item.done && <span style={{ color: och(0.9), fontSize: 10, lineHeight: 1 }}>✓</span>}
            </button>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: cream(item.done ? 0.38 : 0.82),
                flex: 1,
                textDecoration: item.done ? 'line-through' : 'none',
                textDecorationColor: och(0.35),
                lineHeight: 1.4,
              }}
            >
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => deleteCheck(field, item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: och(0.28),
                fontSize: 16,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {adding ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 4 }}>
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitCheck(field, draft);
                  setDraft('');
                  setAdding(false);
                }
                if (e.key === 'Escape') {
                  setAdding(false);
                  setDraft('');
                }
              }}
              placeholder={placeholder}
              spellCheck={false}
              autoCorrect="off"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.28)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 14,
                color: cream(0.85),
                padding: '3px 0',
              }}
            />
            <button
              type="button"
              onClick={() => {
                commitCheck(field, draft);
                setDraft('');
                setAdding(false);
              }}
              style={{
                background: 'none',
                border: `1px solid ${och(0.32)}`,
                borderRadius: 6,
                padding: '4px 12px',
                fontFamily: SERIF,
                fontSize: 12,
                color: och(0.6),
                cursor: 'pointer',
              }}
            >
              add
            </button>
          </div>
        ) : (
          <AddRow label="add" onClick={() => setAdding(true)} />
        )}
      </div>
    );
  }

  function renderContent() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.content.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '10px 12px',
              border: `1px solid ${och(0.18)}`,
              borderRadius: 10,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                color: och(0.55),
                flexShrink: 0,
                lineHeight: 1.3,
                paddingTop: 1,
              }}
            >
              {KIND_LABELS[c.kind]}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: cream(0.85), lineHeight: 1.5 }}>
                {c.title}
              </div>
              {c.note && (
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 12,
                    color: och(0.55),
                    fontStyle: 'italic',
                    marginTop: 3,
                    lineHeight: 1.5,
                  }}
                >
                  {c.note}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => deleteContent(c.id)}
              style={{
                background: 'none',
                border: 'none',
                color: och(0.3),
                fontSize: 18,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
        {addingContent ? (
          <div
            style={{
              border: `1px solid ${och(0.22)}`,
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(Object.keys(KIND_LABELS) as SavedContent['kind'][]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setContentKind(k)}
                  style={{
                    background: contentKind === k ? och(0.18) : 'transparent',
                    border: `1px solid ${contentKind === k ? och(0.55) : och(0.22)}`,
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontFamily: SERIF,
                    fontSize: 12,
                    color: contentKind === k ? och(0.88) : och(0.45),
                    cursor: 'pointer',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
            <input
              autoFocus
              type="text"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setAddingContent(false);
                  setContentTitle('');
                  setContentNote('');
                }
              }}
              placeholder="title or quote…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.25)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 14,
                color: cream(0.88),
                padding: '3px 0',
              }}
            />
            <input
              type="text"
              value={contentNote}
              onChange={(e) => setContentNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitContent();
                if (e.key === 'Escape') {
                  setAddingContent(false);
                  setContentTitle('');
                  setContentNote('');
                }
              }}
              placeholder="note or context…"
              spellCheck={false}
              autoCorrect="off"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${och(0.18)}`,
                outline: 'none',
                fontFamily: SERIF,
                fontSize: 13,
                color: och(0.58),
                padding: '3px 0',
                fontStyle: 'italic',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setAddingContent(false);
                  setContentTitle('');
                  setContentNote('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: och(0.4),
                  cursor: 'pointer',
                }}
              >
                cancel
              </button>
              <button
                type="button"
                onClick={commitContent}
                style={{
                  background: 'none',
                  border: `1px solid ${och(0.35)}`,
                  borderRadius: 6,
                  padding: '4px 14px',
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: och(0.65),
                  cursor: 'pointer',
                }}
              >
                save
              </button>
            </div>
          </div>
        ) : (
          <AddRow label="save something" onClick={() => setAddingContent(true)} />
        )}
      </div>
    );
  }

  const _totalItems =
    data.affirmations.length +
    data.loops.length +
    data.crew.length +
    data.practices.length +
    data.env.length +
    data.content.length;

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid var(--panel-border, rgba(196,160,96,0.18))`,
        background: 'var(--palette-l3-bg, rgba(10,6,3,0.6))',
        overflow: 'hidden',
      }}
    >
      {/* ── Panel header ─── */}
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
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
            fontFamily: SERIF,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: och(0.82),
          }}
        >
          Attitude
        </span>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 8, opacity: 0.35 }}>{panelOpen ? '▲' : '▼'}</span>
        </span>
      </button>

      {/* ── Panel body ─── */}
      {panelOpen && (
        <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CoachNote
            id="innerwork-intro"
            headline="This is where the real work happens."
            body="Not the tasks or the to-do lists — the inner landscape. What you believe about yourself, what you are afraid of, what you actually want. Taking time here, regularly, is one of the most powerful things you can do for your wellbeing. People who understand their own patterns are measurably more resilient, more fulfilled, and more able to connect with others. You are not doing this alone. You are building self-knowledge that will serve every area of your life."
            onDark
          />
          <Section
            label="positive affirmations"
            count={data.affirmations.length}
            open={openSec === 'affirmations'}
            onToggle={() => toggleSec('affirmations')}
          >
            {renderAffirmations()}
          </Section>
          <Section
            label="mind loops"
            count={data.loops.length}
            open={openSec === 'loops'}
            onToggle={() => toggleSec('loops')}
          >
            {renderLoops()}
          </Section>
          <Section
            label="lift crew"
            count={data.crew.length}
            open={openSec === 'crew'}
            onToggle={() => toggleSec('crew')}
          >
            {renderCrew()}
          </Section>
          <Section
            label="what's helping"
            count={data.practices.length}
            open={openSec === 'practices'}
            onToggle={() => toggleSec('practices')}
          >
            {renderChecklist(
              'practices',
              addingPractice,
              practiceDraft,
              setAddingPractice,
              setPracticeDraft,
              'walk, journaling, cold shower…',
            )}
          </Section>
          <Section
            label="structure & surroundings"
            count={data.env.length}
            open={openSec === 'env'}
            onToggle={() => toggleSec('env')}
          >
            {renderChecklist(
              'env',
              addingEnv,
              envDraft,
              setAddingEnv,
              setEnvDraft,
              'clean desk, no phone til 9, get outside…',
            )}
          </Section>
          <Section
            label="content"
            count={data.content.length}
            open={openSec === 'content'}
            onToggle={() => toggleSec('content')}
          >
            {renderContent()}
          </Section>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
            <LearnMorePill programKey="self-talk" />
          </div>
        </div>
      )}
    </div>
  );
}
