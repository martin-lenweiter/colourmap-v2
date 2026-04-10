'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARING DEPTH — Three tabs: MAP · WORK · REFLECT
   MAP    : strength/weakness pills, big readable blocks
   WORK   : focus on one pattern, daily prompts, journal
   REFLECT: vertical rainbow emotion slider + decomposition
   ═══════════════════════════════════════════════════════════ */

/* ─── Storage keys ─── */
const PILLS_KEY = 'colourmap:pattern-pills';
const FOCUS_KEY = 'colourmap:pattern-focus';
const REFLECT_KEY = 'colourmap:emotion-decompositions';

/* ─── Types ─── */
interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  createdAt: string;
}

interface WorkFocus {
  pillId: string;
  startDate: string;
  reflections: { date: string; text: string }[];
}

interface EmotionComponent {
  id: string;
  name: string;
  weight: number; // 0-100
}

interface EmotionDecomposition {
  id: string;
  emotion: string;
  hawkinsLevel: number;
  color: string;
  components: EmotionComponent[];
  impact: string; // where it impacts your life
  source: string; // where does it come from
  needs: string; // what do you need to overcome / work with it
  createdAt: string;
}

/* ─── Palettes ─── */
const S_COLORS = ['#D4805A', '#C4A060', '#C49030', '#D06848', '#B89040'];
const W_COLORS = ['#6890B0', '#9B6BA0', '#8B5E3C', '#7A7A9A', '#5A7A8A'];

const S_SUGGEST = [
  'Courage',
  'Empathy',
  'Discipline',
  'Creativity',
  'Honesty',
  'Patience',
  'Focus',
  'Resilience',
];
const W_SUGGEST = [
  'Overthinking',
  'Avoidance',
  'Self-doubt',
  'Control',
  'People-pleasing',
  'Perfectionism',
  'Procrastination',
  'Impatience',
];

/* ─── Hawkins Rainbow (vertical, top = highest) ─── */
const HAWKINS_LEVELS = [
  { level: 700, name: 'Enlightenment', color: '#E8DBFF', text: '#5A4878' },
  { level: 600, name: 'Peace', color: '#B8D8FF', text: '#3A5878' },
  { level: 540, name: 'Joy', color: '#88C8E8', text: '#2A6888' },
  { level: 500, name: 'Love', color: '#88D8B0', text: '#2A7858' },
  { level: 400, name: 'Reason', color: '#A8E090', text: '#386838' },
  { level: 350, name: 'Acceptance', color: '#D8E880', text: '#587818' },
  { level: 310, name: 'Willingness', color: '#F0E060', text: '#785818' },
  { level: 250, name: 'Neutrality', color: '#F8C040', text: '#783818' },
  { level: 200, name: 'Courage', color: '#F89030', text: '#682808' },
  { level: 175, name: 'Pride', color: '#E86040', text: '#681818' },
  { level: 150, name: 'Anger', color: '#D44040', text: '#580808' },
  { level: 125, name: 'Desire', color: '#A8408A', text: '#580848' },
  { level: 100, name: 'Fear', color: '#7A4888', text: '#380838' },
  { level: 75, name: 'Grief', color: '#5A5898', text: '#181838' },
  { level: 50, name: 'Apathy', color: '#5A5878', text: '#181828' },
  { level: 30, name: 'Guilt', color: '#48485A', text: '#080818' },
  { level: 20, name: 'Shame', color: '#383848', text: '#080808' },
];

const COMPONENT_SUGGESTIONS: Record<string, string[]> = {
  Courage: ['Determination', 'Trust', 'Vulnerability', 'Awareness'],
  Anger: ['Hurt', 'Injustice', 'Powerlessness', 'Fear'],
  Fear: ['Uncertainty', 'Loss', 'Shame', 'Loneliness'],
  Joy: ['Gratitude', 'Wonder', 'Connection', 'Freedom'],
  Love: ['Tenderness', 'Devotion', 'Acceptance', 'Presence'],
  Grief: ['Loss', 'Longing', 'Tenderness', 'Memory'],
  Pride: ['Recognition', 'Self-worth', 'Accomplishment', 'Comparison'],
  Acceptance: ['Surrender', 'Peace', 'Wisdom', 'Patience'],
};

/* ─── Storage helpers ─── */
function ls<T>(k: string, d: T): T {
  try {
    return JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
  } catch {
    return d;
  }
}
function ss<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
}

/* ═══════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════ */
export default function CaringDepth() {
  const [tab, setTab] = useState<'map' | 'work' | 'reflect'>('map');
  const [pills, setPills] = useState<PatternPill[]>([]);
  const [focus, setFocus] = useState<WorkFocus | null>(null);
  const [decompositions, setDecompositions] = useState<EmotionDecomposition[]>([]);

  useEffect(() => {
    setPills(ls(PILLS_KEY, []));
    setFocus(ls(FOCUS_KEY, null));
    setDecompositions(ls(REFLECT_KEY, []));
  }, []);

  const up = useCallback(<T,>(key: string, val: T, setter: (v: T) => void) => {
    setter(val);
    ss(key, val);
  }, []);

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-5"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Tabs — bigger, more readable */}
      <div className="flex gap-1.5">
        {[
          { id: 'map' as const, label: 'Map', color: '#C4A060' },
          { id: 'work' as const, label: 'Work', color: '#D4805A' },
          { id: 'reflect' as const, label: 'Reflect', color: '#9B6BA0' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 cursor-pointer rounded-lg py-2 text-center uppercase tracking-[0.18em] transition-all duration-200"
            style={{
              background: tab === t.id ? `${t.color}15` : 'transparent',
              border: `1.5px solid ${tab === t.id ? `${t.color}45` : `${t.color}18`}`,
              color: t.color,
              fontFamily: 'var(--font-serif)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'map' && <MapTab pills={pills} setPills={(v) => up(PILLS_KEY, v, setPills)} />}
      {tab === 'work' && (
        <WorkTab pills={pills} focus={focus} setFocus={(v) => up(FOCUS_KEY, v, setFocus)} />
      )}
      {tab === 'reflect' && (
        <ReflectTab
          pills={pills}
          decompositions={decompositions}
          setDecompositions={(v) => up(REFLECT_KEY, v, setDecompositions)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAP TAB — Big readable strength/weakness blocks
   ═══════════════════════════════════════════════════════════ */
function MapTab({
  pills,
  setPills,
}: {
  pills: PatternPill[];
  setPills: (p: PatternPill[]) => void;
}) {
  const [addingType, setAddingType] = useState<'strength' | 'weakness' | null>(null);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const strengths = pills.filter((p) => p.type === 'strength');
  const weaknesses = pills.filter((p) => p.type === 'weakness');

  const addPill = (name: string, type: 'strength' | 'weakness') => {
    if (!name.trim() || pills.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const colors = type === 'strength' ? S_COLORS : W_COLORS;
    const existing = pills.filter((p) => p.type === type);
    setPills([
      ...pills,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        color: colors[existing.length % colors.length],
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput('');
    setAddingType(null);
  };

  const renamePill = (id: string, name: string) => {
    if (!name.trim()) {
      setEditingId(null);
      return;
    }
    setPills(pills.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
    setEditingId(null);
  };

  const removePill = (id: string) => {
    setPills(pills.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <p
        className="text-center font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#C4A060', fontSize: '12px' }}
      >
        Strength · Weakness Map
      </p>

      {/* Two big blocks: Flow | Challenge */}
      <div className="grid grid-cols-2 gap-4">
        {/* FLOW (strengths) */}
        <ColumnBlock
          label="Flow"
          accent="#c79a42"
          empty="What's strong?"
          pills={strengths}
          editingId={editingId}
          editName={editName}
          onAdd={() => setAddingType(addingType === 'strength' ? null : 'strength')}
          onStartEdit={(id, name) => {
            setEditingId(id);
            setEditName(name);
          }}
          onChangeEdit={setEditName}
          onCommitEdit={(id) => renamePill(id, editName)}
          onCancelEdit={() => setEditingId(null)}
          onRemove={removePill}
        />
        {/* CHALLENGE (weaknesses) */}
        <ColumnBlock
          label="Challenge"
          accent="#c79a42"
          empty="What's heavy?"
          pills={weaknesses}
          editingId={editingId}
          editName={editName}
          onAdd={() => setAddingType(addingType === 'weakness' ? null : 'weakness')}
          onStartEdit={(id, name) => {
            setEditingId(id);
            setEditName(name);
          }}
          onChangeEdit={setEditName}
          onCommitEdit={(id) => renamePill(id, editName)}
          onCancelEdit={() => setEditingId(null)}
          onRemove={removePill}
        />
      </div>

      {/* Add input — opens below the columns */}
      {addingType && (
        <AddPillInput
          type={addingType}
          input={input}
          setInput={setInput}
          onAdd={() => addPill(input, addingType)}
          onAddSuggestion={(s) => addPill(s, addingType)}
          existing={pills.map((p) => p.name)}
          onCancel={() => setAddingType(null)}
        />
      )}

      {pills.length === 0 && !addingType && (
        <p
          className="text-center"
          style={{
            color: '#B8905A',
            opacity: 0.5,
            fontFamily: 'var(--font-handwritten)',
            fontSize: '14px',
          }}
        >
          Name what you carry — strengths and challenges.
        </p>
      )}
    </div>
  );
}

/* ─── Column block (Flow or Challenge) ─── */
function ColumnBlock({
  label,
  accent,
  empty,
  pills,
  editingId,
  editName,
  onAdd,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
}: {
  label: string;
  accent: string;
  empty: string;
  pills: PatternPill[];
  editingId: string | null;
  editName: string;
  onAdd: () => void;
  onStartEdit: (id: string, name: string) => void;
  onChangeEdit: (v: string) => void;
  onCommitEdit: (id: string) => void;
  onCancelEdit: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onAdd}
        className="block w-full cursor-pointer text-center transition-all"
        style={{
          color: accent,
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
      >
        {label}
      </button>
      <div className="space-y-2">
        {pills.map((p) => (
          <PillRow
            key={p.id}
            pill={p}
            isEditing={editingId === p.id}
            editName={editName}
            onStartEdit={() => onStartEdit(p.id, p.name)}
            onChangeEdit={onChangeEdit}
            onCommitEdit={() => onCommitEdit(p.id)}
            onCancelEdit={onCancelEdit}
            onRemove={() => onRemove(p.id)}
          />
        ))}
        {pills.length === 0 && (
          <p
            className="text-center"
            style={{
              color: accent,
              opacity: 0.4,
              fontFamily: 'var(--font-handwritten)',
              fontSize: '14px',
              fontStyle: 'italic',
            }}
          >
            {empty}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Pill row with double-click rename ─── */
function PillRow({
  pill,
  isEditing,
  editName,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
}: {
  pill: PatternPill;
  isEditing: boolean;
  editName: string;
  onStartEdit: () => void;
  onChangeEdit: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
}) {
  if (isEditing) {
    return (
      <div
        className="rounded-xl px-3 py-2.5"
        style={{
          background: '#f7eddc',
          border: `2px solid ${pill.color}55`,
        }}
      >
        <input
          type="text"
          value={editName}
          onChange={(e) => onChangeEdit(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          autoFocus
          className="w-full bg-transparent outline-none"
          style={{
            color: '#7a5438',
            fontFamily: 'var(--font-handwritten)',
            fontWeight: 700,
            fontSize: '18px',
            border: 'none',
          }}
        />
        <p
          className="mt-1"
          style={{
            color: pill.color,
            opacity: 0.5,
            fontFamily: 'var(--font-handwritten)',
            fontSize: '11px',
          }}
        >
          Enter to save · Esc to cancel
        </p>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200"
      style={{
        background: '#f7eddc9c',
        border: '1px solid #d2b47b4a',
      }}
    >
      <div
        className="h-3 w-3 rounded-full flex-shrink-0"
        style={{ background: pill.color, opacity: 0.9 }}
      />
      <button
        type="button"
        onClick={onStartEdit}
        className="flex-1 cursor-pointer text-left"
        style={{
          color: '#7a5438',
          fontFamily: 'var(--font-handwritten)',
          fontWeight: 700,
          fontSize: '18px',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        title="Tap to rename"
      >
        {pill.name}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded px-2 py-1 text-sm opacity-30 hover:opacity-80"
        style={{
          color: pill.color,
          background: 'none',
          border: 'none',
        }}
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

/* ─── Add pill input + suggestions ─── */
function AddPillInput({
  type,
  input,
  setInput,
  onAdd,
  onAddSuggestion,
  existing,
  onCancel,
}: {
  type: 'strength' | 'weakness';
  input: string;
  setInput: (v: string) => void;
  onAdd: () => void;
  onAddSuggestion: (s: string) => void;
  existing: string[];
  onCancel: () => void;
}) {
  const accent = type === 'strength' ? '#D4805A' : '#6890B0';
  const sugg = type === 'strength' ? S_SUGGEST : W_SUGGEST;
  const label = type === 'strength' ? 'Name a strength' : 'Name a weakness';

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: '#f7eddc', border: `2px solid ${accent}40` }}
      >
        <div className="flex items-center justify-between mb-2">
          <p
            className="uppercase tracking-wider"
            style={{
              color: accent,
              opacity: 0.6,
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            {label}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-sm"
            style={{
              color: accent,
              opacity: 0.4,
              background: 'none',
              border: 'none',
            }}
          >
            ✕
          </button>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="type here..."
          className="w-full bg-transparent outline-none"
          style={{
            color: '#7a5438',
            fontFamily: 'var(--font-handwritten)',
            fontWeight: 700,
            fontSize: '20px',
            border: 'none',
            borderBottom: `1.5px solid ${accent}40`,
            padding: '4px 0',
          }}
          autoFocus
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {sugg
          .filter((s) => !existing.includes(s))
          .slice(0, 6)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onAddSuggestion(s)}
              className="cursor-pointer rounded-full px-3.5 py-2 transition-all hover:scale-105"
              style={{
                background: `${accent}10`,
                border: `1.5px solid ${accent}30`,
                color: '#7a5438',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              {s}
            </button>
          ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WORK TAB
   ═══════════════════════════════════════════════════════════ */
function WorkTab({
  pills,
  focus,
  setFocus,
}: {
  pills: PatternPill[];
  focus: WorkFocus | null;
  setFocus: (f: WorkFocus | null) => void;
}) {
  const [reflection, setReflection] = useState('');
  const focusPill = focus ? pills.find((p) => p.id === focus.pillId) : null;

  const selectFocus = (pillId: string) => {
    setFocus({
      pillId,
      startDate: new Date().toISOString(),
      reflections: focus?.reflections || [],
    });
  };

  const addReflection = () => {
    if (!reflection.trim() || !focus) return;
    const today = new Date().toISOString().split('T')[0];
    setFocus({
      ...focus,
      reflections: [...focus.reflections, { date: today, text: reflection.trim() }],
    });
    setReflection('');
  };

  const PROMPTS_S: Record<string, string[]> = {
    Courage: ['Where did courage show up today?', "What would you do if you weren't afraid?"],
    _default: ['Where did this strength show up today?', 'How could you use it more?'],
  };
  const PROMPTS_W: Record<string, string[]> = {
    Avoidance: ['What did you avoid today?', 'What would happen if you faced it?'],
    _default: ['When does this pattern show up most?', 'What would it look like to manage this?'],
  };

  const getPrompt = () => {
    if (!focusPill) return '';
    const bank =
      focusPill.type === 'strength'
        ? PROMPTS_S[focusPill.name] || PROMPTS_S._default
        : PROMPTS_W[focusPill.name] || PROMPTS_W._default;
    const dayIndex = Math.floor(Date.now() / 86400000) % bank.length;
    return bank[dayIndex];
  };

  return (
    <div className="space-y-4">
      <p
        className="text-center font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#D4805A', fontSize: '12px' }}
      >
        {focusPill ? `Working on: ${focusPill.name}` : 'Choose a pattern'}
      </p>

      {!focusPill && (
        <div className="space-y-3">
          {pills.length === 0 && (
            <p
              className="text-center"
              style={{
                color: '#B8905A',
                opacity: 0.5,
                fontFamily: 'var(--font-handwritten)',
                fontSize: '14px',
              }}
            >
              Add patterns in the Map tab first.
            </p>
          )}
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pills.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectFocus(p.id)}
                  className="cursor-pointer rounded-full px-4 py-2 transition-all hover:scale-105"
                  style={{
                    background: `${p.color}12`,
                    border: `1.5px solid ${p.color}30`,
                    color: '#7a5438',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {focusPill && (
        <div className="space-y-3">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: `${focusPill.color}10`,
              border: `1.5px solid ${focusPill.color}25`,
            }}
          >
            <p
              className="uppercase tracking-wider mb-1"
              style={{
                color: focusPill.color,
                opacity: 0.5,
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '11px',
              }}
            >
              Today's prompt
            </p>
            <p
              style={{
                color: '#7a5438',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: 1.4,
              }}
            >
              {getPrompt()}
            </p>
          </div>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your reflection..."
            className="w-full resize-none rounded-xl px-3 py-2.5 outline-none"
            style={{
              color: '#7a5438',
              background: '#f7eddc9c',
              fontFamily: 'var(--font-handwritten)',
              fontSize: '15px',
              border: `1.5px solid ${focusPill.color}25`,
              minHeight: 80,
            }}
            rows={3}
          />
          {reflection.trim() && (
            <button
              type="button"
              onClick={addReflection}
              className="w-full cursor-pointer rounded-lg py-2.5 uppercase tracking-wider transition-all"
              style={{
                background: `${focusPill.color}15`,
                border: `1.5px solid ${focusPill.color}35`,
                color: focusPill.color,
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              Save reflection
            </button>
          )}

          {focus && focus.reflections.length > 0 && (
            <div className="space-y-2 pt-2">
              <p
                className="uppercase tracking-wider"
                style={{
                  color: focusPill.color,
                  opacity: 0.5,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                Past reflections
              </p>
              {focus.reflections
                .slice(-5)
                .reverse()
                .map((r, i) => (
                  <div
                    key={`${r.date}-${i}`}
                    className="rounded-lg px-3 py-2"
                    style={{
                      background: `${focusPill.color}06`,
                      border: `1px solid ${focusPill.color}15`,
                    }}
                  >
                    <span
                      style={{
                        color: focusPill.color,
                        opacity: 0.4,
                        fontSize: '11px',
                      }}
                    >
                      {r.date}
                    </span>
                    <p
                      className="mt-1"
                      style={{
                        color: '#7a5438',
                        fontFamily: 'var(--font-handwritten)',
                        fontSize: '14px',
                      }}
                    >
                      {r.text}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setFocus(null)}
            className="w-full cursor-pointer text-center py-1"
            style={{
              color: '#8A6A4A',
              opacity: 0.4,
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-handwritten)',
              fontSize: '12px',
            }}
          >
            change focus
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REFLECT TAB — Vertical Rainbow + Emotion Decomposition
   ═══════════════════════════════════════════════════════════ */
function ReflectTab({
  pills,
  decompositions,
  setDecompositions,
}: {
  pills: PatternPill[];
  decompositions: EmotionDecomposition[];
  setDecompositions: (d: EmotionDecomposition[]) => void;
}) {
  const [activeDecomp, setActiveDecomp] = useState<string | null>(null);
  const [pickedLevel, setPickedLevel] = useState<number | null>(null);
  const [customComponent, setCustomComponent] = useState('');

  const startDecomposition = (level: (typeof HAWKINS_LEVELS)[number]) => {
    const newDecomp: EmotionDecomposition = {
      id: crypto.randomUUID(),
      emotion: level.name,
      hawkinsLevel: level.level,
      color: level.color,
      components: [],
      impact: '',
      source: '',
      needs: '',
      createdAt: new Date().toISOString(),
    };
    setDecompositions([...decompositions, newDecomp]);
    setActiveDecomp(newDecomp.id);
    setPickedLevel(level.level);
  };

  const addComponent = (decompId: string, name: string) => {
    if (!name.trim()) return;
    setDecompositions(
      decompositions.map((d) =>
        d.id === decompId
          ? {
              ...d,
              components: [
                ...d.components,
                { id: crypto.randomUUID(), name: name.trim(), weight: 50 },
              ],
            }
          : d,
      ),
    );
    setCustomComponent('');
  };

  const updateComponentWeight = (decompId: string, compId: string, weight: number) => {
    setDecompositions(
      decompositions.map((d) =>
        d.id === decompId
          ? {
              ...d,
              components: d.components.map((c) => (c.id === compId ? { ...c, weight } : c)),
            }
          : d,
      ),
    );
  };

  const removeComponent = (decompId: string, compId: string) => {
    setDecompositions(
      decompositions.map((d) =>
        d.id === decompId ? { ...d, components: d.components.filter((c) => c.id !== compId) } : d,
      ),
    );
  };

  const updateField = (decompId: string, field: 'impact' | 'source' | 'needs', value: string) => {
    setDecompositions(
      decompositions.map((d) => (d.id === decompId ? { ...d, [field]: value } : d)),
    );
  };

  const removeDecomposition = (id: string) => {
    setDecompositions(decompositions.filter((d) => d.id !== id));
    if (activeDecomp === id) {
      setActiveDecomp(null);
      setPickedLevel(null);
    }
  };

  const active = decompositions.find((d) => d.id === activeDecomp);

  return (
    <div className="space-y-4">
      <p
        className="text-center font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#9B6BA0', fontSize: '12px' }}
      >
        Emotion Decomposition
      </p>

      <p
        className="text-center"
        style={{
          color: '#8A6A4A',
          opacity: 0.6,
          fontFamily: 'var(--font-handwritten)',
          fontSize: '14px',
        }}
      >
        Pick an emotion. Decompose it like a perfume.
      </p>

      {/* Vertical Rainbow Slider */}
      <div className="flex gap-3">
        {/* Rainbow column */}
        <div
          className="flex flex-col rounded-xl overflow-hidden"
          style={{
            width: 70,
            border: '1.5px solid #8A6A4A40',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
          }}
        >
          {HAWKINS_LEVELS.map((lvl) => {
            const isPicked = pickedLevel === lvl.level;
            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => startDecomposition(lvl)}
                className="cursor-pointer transition-all hover:scale-x-105"
                style={{
                  background: lvl.color,
                  height: isPicked ? 32 : 22,
                  border: 'none',
                  padding: '0 6px',
                  textAlign: 'left',
                  borderTop: isPicked ? `2px solid ${lvl.text}` : 'none',
                  borderBottom: isPicked ? `2px solid ${lvl.text}` : 'none',
                }}
                title={`${lvl.name} (${lvl.level})`}
              >
                <span
                  className="font-bold uppercase truncate block"
                  style={{
                    color: lvl.text,
                    fontFamily: 'var(--font-serif)',
                    fontSize: isPicked ? '11px' : '9px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {lvl.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Decomposition area */}
        <div className="flex-1 space-y-3">
          {!active && (
            <div
              className="rounded-xl px-4 py-6 text-center"
              style={{ background: '#f7eddc9c', border: '1.5px dashed #8A6A4A30' }}
            >
              <p
                style={{
                  color: '#8A6A4A',
                  opacity: 0.5,
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: '15px',
                }}
              >
                Tap an emotion on the rainbow
              </p>
            </div>
          )}

          {active && (
            <div className="space-y-3">
              {/* Header */}
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: active.color,
                  border: `1.5px solid ${active.color}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="uppercase tracking-wider"
                      style={{
                        color: '#5C3018',
                        opacity: 0.6,
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        fontSize: '10px',
                      }}
                    >
                      {active.hawkinsLevel}
                    </p>
                    <p
                      style={{
                        color: '#5C3018',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        fontSize: '24px',
                        lineHeight: 1,
                      }}
                    >
                      {active.emotion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDecomposition(active.id)}
                    className="cursor-pointer text-base"
                    style={{ color: '#5C3018', opacity: 0.4, background: 'none', border: 'none' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Components */}
              <div className="space-y-2">
                <p
                  className="uppercase tracking-wider"
                  style={{
                    color: '#9B6BA0',
                    opacity: 0.6,
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                >
                  Inside this emotion
                </p>
                {active.components.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg px-3 py-2"
                    style={{ background: '#f7eddc9c', border: '1px solid #d2b47b4a' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        style={{
                          color: '#7a5438',
                          fontFamily: 'var(--font-handwritten)',
                          fontWeight: 700,
                          fontSize: '15px',
                        }}
                      >
                        {c.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            color: '#9B6BA0',
                            opacity: 0.6,
                            fontFamily: 'var(--font-handwritten)',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {c.weight}%
                        </span>
                        <button
                          type="button"
                          onClick={() => removeComponent(active.id, c.id)}
                          className="cursor-pointer text-xs"
                          style={{
                            color: '#9B6BA0',
                            opacity: 0.3,
                            background: 'none',
                            border: 'none',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={c.weight}
                      onChange={(e) =>
                        updateComponentWeight(active.id, c.id, Number(e.target.value))
                      }
                      className="w-full"
                      style={{ accentColor: '#9B6BA0' }}
                    />
                  </div>
                ))}

                {/* Suggestion pills */}
                {COMPONENT_SUGGESTIONS[active.emotion] && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {COMPONENT_SUGGESTIONS[active.emotion]
                      .filter((s) => !active.components.some((c) => c.name === s))
                      .map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addComponent(active.id, s)}
                          className="cursor-pointer rounded-full px-3 py-1.5 transition-all hover:scale-105"
                          style={{
                            background: '#9B6BA010',
                            border: '1.5px solid #9B6BA030',
                            color: '#7a5438',
                            fontFamily: 'var(--font-handwritten)',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          + {s}
                        </button>
                      ))}
                  </div>
                )}

                {/* Custom component input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customComponent}
                    onChange={(e) => setCustomComponent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addComponent(active.id, customComponent);
                    }}
                    placeholder="add another..."
                    className="flex-1 rounded-lg px-3 py-2 outline-none"
                    style={{
                      background: '#f7eddc',
                      border: '1px solid #9B6BA025',
                      color: '#7a5438',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* Reflection fields */}
              <div className="space-y-2">
                <ReflectField
                  label="Where it impacts your life"
                  value={active.impact}
                  onChange={(v) => updateField(active.id, 'impact', v)}
                  placeholder="work, sleep, relationships..."
                />
                <ReflectField
                  label="Where it comes from"
                  value={active.source}
                  onChange={(v) => updateField(active.id, 'source', v)}
                  placeholder="childhood, recent event, fear..."
                />
                <ReflectField
                  label="What you need"
                  value={active.needs}
                  onChange={(v) => updateField(active.id, 'needs', v)}
                  placeholder="rest, support, courage..."
                />
              </div>

              {/* Connect to existing pills */}
              {pills.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p
                    className="uppercase tracking-wider"
                    style={{
                      color: '#9B6BA0',
                      opacity: 0.5,
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                      fontSize: '11px',
                    }}
                  >
                    Linked to your map
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pills.map((p) => (
                      <span
                        key={p.id}
                        className="rounded-full px-3 py-1"
                        style={{
                          background: `${p.color}12`,
                          border: `1px solid ${p.color}25`,
                          color: '#7a5438',
                          fontFamily: 'var(--font-handwritten)',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History list */}
      {decompositions.length > 0 && (
        <div className="space-y-2 pt-2">
          <p
            className="uppercase tracking-wider"
            style={{
              color: '#9B6BA0',
              opacity: 0.6,
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            Your decompositions
          </p>
          <div className="flex flex-wrap gap-2">
            {decompositions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveDecomp(d.id);
                  setPickedLevel(d.hawkinsLevel);
                }}
                className="cursor-pointer rounded-full px-3 py-1.5 transition-all"
                style={{
                  background: activeDecomp === d.id ? d.color : `${d.color}aa`,
                  border: activeDecomp === d.id ? '2px solid #5C3018' : '1.5px solid transparent',
                  color: '#5C3018',
                  fontFamily: 'var(--font-handwritten)',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {d.emotion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reflect field (label + textarea) ─── */
function ReflectField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: '#f7eddc9c', border: '1px solid #d2b47b4a' }}
    >
      <p
        className="uppercase tracking-wider mb-1"
        style={{
          color: '#9B6BA0',
          opacity: 0.6,
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: '10px',
        }}
      >
        {label}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none bg-transparent outline-none"
        style={{
          color: '#7a5438',
          fontFamily: 'var(--font-handwritten)',
          fontSize: '14px',
          border: 'none',
        }}
      />
    </div>
  );
}
