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
const PACKS_KEY = 'colourmap:pattern-packs';
const FOCUS_KEY = 'colourmap:pattern-focus';
const WORK_KEY = 'colourmap:pattern-work';
const REFLECT_KEY = 'colourmap:emotion-decompositions';
const RIVER_KEY = 'colourmap:river-snapshots';

const PACK_COLORS = [
  '#9B6BA0',
  '#6890B0',
  '#7A9A7A',
  '#D4805A',
  '#C4A060',
  '#C87050',
  '#5A7A8A',
  '#B07070',
];

/* ─── Types ─── */
interface RiverSnapshot {
  date: string; // YYYY-MM-DD
  values: { pillId: string; intensity: number }[]; // 1-5 per pill
}

interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  parentId?: string; // sub-pill if set
  packIds?: string[];
  createdAt: string;
}

interface Pack {
  id: string;
  name: string;
  color: string;
  pillIds: string[];
  createdAt: string;
}

interface WorkFocus {
  pillId: string;
  startDate: string;
}

interface PatternWork {
  pillId: string;
  origin: string;
  triggers: string;
  avoid: string;
  helpful: string;
  emotions: string;
  worst: string;
  updatedAt: string;
}

const WORK_FIELDS: {
  key: keyof Omit<PatternWork, 'pillId' | 'updatedAt'>;
  question: string;
  placeholder: string;
}[] = [
  {
    key: 'origin',
    question: 'Where does it come from?',
    placeholder: 'history, what taught you this, when it started...',
  },
  {
    key: 'triggers',
    question: 'What triggers it?',
    placeholder: 'situations, people, moods, time of day...',
  },
  {
    key: 'avoid',
    question: 'How can we avoid it?',
    placeholder: 'guardrails, prevention, what to step away from...',
  },
  {
    key: 'helpful',
    question: 'What would be helpful?',
    placeholder: 'tools, support, environment, practices...',
  },
  {
    key: 'emotions',
    question: 'What emotions does it provoke?',
    placeholder: 'anger, shame, relief, exhaustion...',
  },
  {
    key: 'worst',
    question: 'At its worst, what does it do?',
    placeholder: 'the darkest version, what it costs you, the consequences...',
  },
];

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
  { level: 175, name: 'Pride', color: '#F0A088', text: '#783030' },
  { level: 150, name: 'Anger', color: '#EE9090', text: '#702828' },
  { level: 125, name: 'Desire', color: '#E0A0C8', text: '#682858' },
  { level: 100, name: 'Fear', color: '#C8A8D8', text: '#583068' },
  { level: 75, name: 'Grief', color: '#B0B0D8', text: '#383868' },
  { level: 50, name: 'Apathy', color: '#B8B8C8', text: '#383850' },
  { level: 30, name: 'Guilt', color: '#C0C0CC', text: '#383848' },
  { level: 20, name: 'Shame', color: '#C8C8D0', text: '#383840' },
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
  const [tab, setTab] = useState<'map' | 'work' | 'reflect' | 'river'>('map');
  const [pills, setPills] = useState<PatternPill[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [focus, setFocus] = useState<WorkFocus | null>(null);
  const [work, setWork] = useState<PatternWork[]>([]);
  const [decompositions, setDecompositions] = useState<EmotionDecomposition[]>([]);
  const [river, setRiver] = useState<RiverSnapshot[]>([]);

  useEffect(() => {
    setPills(ls(PILLS_KEY, []));
    setPacks(ls(PACKS_KEY, []));
    setFocus(ls(FOCUS_KEY, null));
    setWork(ls(WORK_KEY, []));
    setDecompositions(ls(REFLECT_KEY, []));
    setRiver(ls(RIVER_KEY, []));
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
      {/* Tabs */}
      <div className="flex gap-1">
        {[
          { id: 'map' as const, label: 'Map', color: '#C4A060' },
          { id: 'work' as const, label: 'Work', color: '#D4805A' },
          { id: 'reflect' as const, label: 'Reflect', color: '#9B6BA0' },
          { id: 'river' as const, label: 'River', color: '#6890B0' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 cursor-pointer rounded-lg py-2 text-center uppercase tracking-[0.15em] transition-all duration-200"
            style={{
              background: tab === t.id ? `${t.color}15` : 'transparent',
              border: `1.5px solid ${tab === t.id ? `${t.color}45` : `${t.color}18`}`,
              color: t.color,
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        <MapTab
          pills={pills}
          setPills={(v) => up(PILLS_KEY, v, setPills)}
          packs={packs}
          setPacks={(v) => up(PACKS_KEY, v, setPacks)}
          work={work}
        />
      )}
      {tab === 'work' && (
        <WorkTab
          pills={pills}
          focus={focus}
          setFocus={(v) => up(FOCUS_KEY, v, setFocus)}
          work={work}
          setWork={(v) => up(WORK_KEY, v, setWork)}
        />
      )}
      {tab === 'reflect' && (
        <ReflectTab
          pills={pills}
          decompositions={decompositions}
          setDecompositions={(v) => up(REFLECT_KEY, v, setDecompositions)}
        />
      )}
      {tab === 'river' && (
        <RiverTab pills={pills} river={river} setRiver={(v) => up(RIVER_KEY, v, setRiver)} />
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
  packs,
  setPacks,
  work,
}: {
  pills: PatternPill[];
  setPills: (p: PatternPill[]) => void;
  packs: Pack[];
  setPacks: (p: Pack[]) => void;
  work: PatternWork[];
}) {
  const [addingType, setAddingType] = useState<'strength' | 'weakness' | null>(null);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [subInput, setSubInput] = useState('');
  const [creatingPack, setCreatingPack] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackPills, setNewPackPills] = useState<string[]>([]);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const createPack = () => {
    if (!newPackName.trim() || newPackPills.length === 0) return;
    const color = PACK_COLORS[packs.length % PACK_COLORS.length];
    setPacks([
      ...packs,
      {
        id: crypto.randomUUID(),
        name: newPackName.trim(),
        color,
        pillIds: newPackPills,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewPackName('');
    setNewPackPills([]);
    setCreatingPack(false);
  };

  const togglePackPill = (packId: string, pillId: string) => {
    setPacks(
      packs.map((pk) =>
        pk.id === packId
          ? {
              ...pk,
              pillIds: pk.pillIds.includes(pillId)
                ? pk.pillIds.filter((id) => id !== pillId)
                : [...pk.pillIds, pillId],
            }
          : pk,
      ),
    );
  };

  const removePack = (id: string) => {
    setPacks(packs.filter((p) => p.id !== id));
    if (expandedPack === id) setExpandedPack(null);
  };

  // Top-level pills (no parent)
  const strengths = pills.filter((p) => p.type === 'strength' && !p.parentId);
  const weaknesses = pills.filter((p) => p.type === 'weakness' && !p.parentId);
  // Helper to get sub-pills for a parent
  const getSubs = (parentId: string) => pills.filter((p) => p.parentId === parentId);

  const addPill = (name: string, type: 'strength' | 'weakness') => {
    if (!name.trim() || pills.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const colors = type === 'strength' ? S_COLORS : W_COLORS;
    const existing = pills.filter((p) => p.type === type && !p.parentId);
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

  const addSubPill = (parentId: string, name: string) => {
    const parent = pills.find((p) => p.id === parentId);
    if (!parent || !name.trim()) return;
    if (pills.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    setPills([
      ...pills,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        type: parent.type,
        color: parent.color,
        parentId,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSubInput('');
    setAddingSubFor(null);
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
    // Also remove any sub-pills with this parent
    setPills(pills.filter((p) => p.id !== id && p.parentId !== id));
    if (editingId === id) setEditingId(null);
    if (addingSubFor === id) setAddingSubFor(null);
  };

  return (
    <div className="space-y-4">
      <p
        className="text-center font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#C4A060', fontSize: '12px' }}
      >
        Strength · Weakness Map
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
        Name them here. Work on them in the{' '}
        <span style={{ color: '#D4805A', fontWeight: 700 }}>Work</span> tab.
      </p>

      {/* Two big blocks: Flow | Challenge */}
      <div className="grid grid-cols-2 gap-4">
        {/* FLOW (strengths) */}
        <ColumnBlock
          label="Flow"
          accent="#c79a42"
          empty="What's strong?"
          pills={strengths}
          work={work}
          getSubs={getSubs}
          editingId={editingId}
          editName={editName}
          addingSubFor={addingSubFor}
          subInput={subInput}
          setSubInput={setSubInput}
          onStartAddSub={(id) => {
            setAddingSubFor(addingSubFor === id ? null : id);
            setSubInput('');
          }}
          onCommitAddSub={(id) => addSubPill(id, subInput)}
          onCancelAddSub={() => setAddingSubFor(null)}
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
          work={work}
          getSubs={getSubs}
          editingId={editingId}
          editName={editName}
          addingSubFor={addingSubFor}
          subInput={subInput}
          setSubInput={setSubInput}
          onStartAddSub={(id) => {
            setAddingSubFor(addingSubFor === id ? null : id);
            setSubInput('');
          }}
          onCommitAddSub={(id) => addSubPill(id, subInput)}
          onCancelAddSub={() => setAddingSubFor(null)}
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

      {/* PACKS — group related pills */}
      {pills.length >= 2 && (
        <div className="space-y-3 pt-3 border-t" style={{ borderColor: '#8A6A4A20' }}>
          <div className="flex items-center justify-between">
            <p
              className="uppercase tracking-[0.2em]"
              style={{
                color: '#9B6BA0',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              Packs
            </p>
            <button
              type="button"
              onClick={() => {
                setCreatingPack(!creatingPack);
                setNewPackName('');
                setNewPackPills([]);
              }}
              className="cursor-pointer rounded-full px-3 py-1.5"
              style={{
                background: creatingPack ? '#9B6BA015' : 'transparent',
                border: '1.5px solid #9B6BA035',
                color: '#9B6BA0',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              {creatingPack ? 'cancel' : '+ new pack'}
            </button>
          </div>

          {/* Existing packs */}
          {packs.length === 0 && !creatingPack && (
            <p
              className="text-center"
              style={{
                color: '#9B6BA0',
                opacity: 0.5,
                fontFamily: 'var(--font-handwritten)',
                fontSize: '14px',
                fontStyle: 'italic',
              }}
            >
              Group related patterns. Tap "+ new pack" to start.
            </p>
          )}

          {packs.map((pack) => {
            const isExpanded = expandedPack === pack.id;
            const packPills = pills.filter((p) => pack.pillIds.includes(p.id));
            return (
              <div
                key={pack.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: `${pack.color}10`,
                  border: `1.5px solid ${pack.color}40`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 cursor-pointer text-left"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ background: pack.color }}
                  />
                  <span
                    className="flex-1"
                    style={{
                      color: '#7a5438',
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                      fontSize: '17px',
                    }}
                  >
                    {pack.name}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{
                      background: `${pack.color}25`,
                      color: pack.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    {pack.pillIds.length}
                  </span>
                  <span style={{ color: pack.color, fontSize: '12px', opacity: 0.5 }}>
                    {isExpanded ? '▾' : '▸'}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-3.5 pb-3 space-y-2 animate-in fade-in duration-200">
                    <p
                      className="uppercase tracking-wider pt-1"
                      style={{
                        color: pack.color,
                        opacity: 0.5,
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    >
                      Tap to add or remove
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pills.map((p) => {
                        const isIn = pack.pillIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePackPill(pack.id, p.id)}
                            className="cursor-pointer rounded-full transition-all hover:scale-105 flex items-center gap-1.5"
                            style={{
                              background: isIn ? `${p.color}28` : `${p.color}08`,
                              border: `1.5px solid ${isIn ? `${p.color}55` : `${p.color}20`}`,
                              color: '#7a5438',
                              fontFamily: 'var(--font-handwritten)',
                              fontWeight: 700,
                              fontSize: '13px',
                              padding: '6px 11px',
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: p.color }}
                            />
                            {p.name}
                            {isIn && <span style={{ opacity: 0.5 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {packPills.length > 0 && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => removePack(pack.id)}
                          className="cursor-pointer"
                          style={{
                            color: pack.color,
                            opacity: 0.4,
                            background: 'none',
                            border: 'none',
                            fontFamily: 'var(--font-handwritten)',
                            fontSize: '12px',
                          }}
                        >
                          delete pack
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Create pack form */}
          {creatingPack && (
            <div
              className="rounded-xl px-4 py-3 space-y-3 animate-in fade-in duration-200"
              style={{ background: '#f7eddc', border: '2px solid #9B6BA040' }}
            >
              <div>
                <p
                  className="uppercase tracking-wider mb-2"
                  style={{
                    color: '#9B6BA0',
                    opacity: 0.6,
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                >
                  Name your pack
                </p>
                <input
                  type="text"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  placeholder="e.g. Body stuff, Work stress, Family..."
                  className="w-full bg-transparent outline-none"
                  style={{
                    color: '#7a5438',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 700,
                    fontSize: '18px',
                    border: 'none',
                    borderBottom: '1.5px solid #9B6BA040',
                    padding: '4px 0',
                  }}
                  autoFocus
                />
              </div>
              <div>
                <p
                  className="uppercase tracking-wider mb-2"
                  style={{
                    color: '#9B6BA0',
                    opacity: 0.6,
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                >
                  Pick the patterns ({newPackPills.length} selected)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pills.map((p) => {
                    const isOn = newPackPills.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setNewPackPills(
                            isOn
                              ? newPackPills.filter((id) => id !== p.id)
                              : [...newPackPills, p.id],
                          )
                        }
                        className="cursor-pointer rounded-full transition-all hover:scale-105 flex items-center gap-1.5"
                        style={{
                          background: isOn ? `${p.color}28` : `${p.color}08`,
                          border: `1.5px solid ${isOn ? `${p.color}55` : `${p.color}20`}`,
                          color: '#7a5438',
                          fontFamily: 'var(--font-handwritten)',
                          fontWeight: 700,
                          fontSize: '13px',
                          padding: '6px 11px',
                        }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={createPack}
                disabled={!newPackName.trim() || newPackPills.length === 0}
                className="w-full cursor-pointer rounded-lg py-2.5 uppercase tracking-wider transition-all"
                style={{
                  background: '#9B6BA015',
                  border: '1.5px solid #9B6BA040',
                  color: '#9B6BA0',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '13px',
                  opacity: newPackName.trim() && newPackPills.length > 0 ? 1 : 0.4,
                }}
              >
                Create pack
              </button>
            </div>
          )}
        </div>
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
  work,
  getSubs,
  editingId,
  editName,
  addingSubFor,
  subInput,
  setSubInput,
  onStartAddSub,
  onCommitAddSub,
  onCancelAddSub,
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
  work: PatternWork[];
  getSubs: (parentId: string) => PatternPill[];
  editingId: string | null;
  editName: string;
  addingSubFor: string | null;
  subInput: string;
  setSubInput: (v: string) => void;
  onStartAddSub: (id: string) => void;
  onCommitAddSub: (id: string) => void;
  onCancelAddSub: () => void;
  onAdd: () => void;
  onStartEdit: (id: string, name: string) => void;
  onChangeEdit: (v: string) => void;
  onCommitEdit: (id: string) => void;
  onCancelEdit: () => void;
  onRemove: (id: string) => void;
}) {
  const renderPill = (p: PatternPill, isSub: boolean) => {
    const w = work.find((ww) => ww.pillId === p.id);
    const answeredCount = w
      ? WORK_FIELDS.filter((f) => (w[f.key] || '').trim().length > 0).length
      : 0;
    return (
      <PillRow
        key={p.id}
        pill={p}
        isSub={isSub}
        workCount={answeredCount}
        isEditing={editingId === p.id}
        editName={editName}
        canAddSub={!isSub}
        onStartEdit={() => onStartEdit(p.id, p.name)}
        onChangeEdit={onChangeEdit}
        onCommitEdit={() => onCommitEdit(p.id)}
        onCancelEdit={onCancelEdit}
        onRemove={() => onRemove(p.id)}
        onStartAddSub={() => onStartAddSub(p.id)}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div
        className="block w-full text-center"
        style={{
          color: accent,
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {label}
      </div>
      <div className="space-y-2">
        {pills.map((p) => {
          const subs = getSubs(p.id);
          return (
            <div key={p.id} className="space-y-1.5">
              {renderPill(p, false)}
              {/* Sub pills nested under parent */}
              {subs.length > 0 && (
                <div
                  className="ml-5 space-y-1.5 border-l-2 pl-3"
                  style={{ borderColor: `${p.color}40` }}
                >
                  {subs.map((s) => renderPill(s, true))}
                </div>
              )}
              {/* Sub-add input */}
              {addingSubFor === p.id && (
                <div
                  className="ml-5 rounded-lg px-3 py-2 animate-in fade-in duration-150"
                  style={{
                    background: `${p.color}10`,
                    border: `1.5px dashed ${p.color}45`,
                  }}
                >
                  <p
                    className="uppercase tracking-wider mb-1.5"
                    style={{
                      color: p.color,
                      opacity: 0.55,
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                      fontSize: '10px',
                    }}
                  >
                    Add sub-pattern
                  </p>
                  <input
                    type="text"
                    value={subInput}
                    onChange={(e) => setSubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onCommitAddSub(p.id);
                      if (e.key === 'Escape') onCancelAddSub();
                    }}
                    placeholder="e.g. Lateness, Lost keys..."
                    className="w-full bg-transparent outline-none"
                    style={{
                      color: '#7a5438',
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                      fontSize: '15px',
                      border: 'none',
                      borderBottom: `1px solid ${p.color}40`,
                      padding: '2px 0',
                    }}
                    autoFocus
                  />
                </div>
              )}
            </div>
          );
        })}
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
      {/* Clear add button below */}
      <button
        type="button"
        onClick={onAdd}
        className="w-full cursor-pointer rounded-xl py-2.5 transition-all hover:scale-[1.02]"
        style={{
          background: `${accent}12`,
          border: `1.5px dashed ${accent}40`,
          color: accent,
          fontFamily: 'var(--font-handwritten)',
          fontWeight: 700,
          fontSize: '15px',
        }}
      >
        + add {label.toLowerCase()}
      </button>
    </div>
  );
}

/* ─── Pill row with rename + sub support ─── */
function PillRow({
  pill,
  isSub = false,
  workCount,
  isEditing,
  editName,
  canAddSub = true,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
  onStartAddSub,
}: {
  pill: PatternPill;
  isSub?: boolean;
  workCount: number;
  isEditing: boolean;
  editName: string;
  canAddSub?: boolean;
  onStartEdit: () => void;
  onChangeEdit: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
  onStartAddSub?: () => void;
}) {
  const dotSize = isSub ? 'h-2 w-2' : 'h-3 w-3';
  const fontSize = isSub ? '15px' : '18px';
  const padding = isSub ? 'px-2.5 py-2' : 'px-3 py-2.5';

  if (isEditing) {
    return (
      <div
        className={`rounded-xl ${padding}`}
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
            fontSize,
            border: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-2 rounded-xl ${padding} transition-all duration-200`}
      style={{
        background: isSub ? `${pill.color}06` : '#f7eddc9c',
        border: `1px solid ${isSub ? `${pill.color}25` : '#d2b47b4a'}`,
      }}
    >
      <div
        className={`${dotSize} rounded-full flex-shrink-0`}
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
          fontSize,
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        title="Tap to rename"
      >
        {pill.name}
      </button>
      {workCount > 0 && (
        <span
          className="rounded-full px-2 py-0.5"
          style={{
            background: `${pill.color}20`,
            color: pill.color,
            fontFamily: 'var(--font-handwritten)',
            fontWeight: 700,
            fontSize: '11px',
          }}
          title={`${workCount} of 6 questions answered`}
        >
          {workCount}/6
        </span>
      )}
      {canAddSub && onStartAddSub && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartAddSub();
          }}
          className="cursor-pointer rounded-full px-2 py-0.5"
          style={{
            background: `${pill.color}12`,
            color: pill.color,
            border: `1px solid ${pill.color}25`,
            fontFamily: 'var(--font-handwritten)',
            fontWeight: 700,
            fontSize: '11px',
          }}
          title="Add a sub-pattern"
        >
          + sub
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded px-1.5 py-0.5 text-sm opacity-30 hover:opacity-80"
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
   WORK TAB — 6 questions per pattern
   ═══════════════════════════════════════════════════════════ */
function WorkTab({
  pills,
  focus,
  setFocus,
  work,
  setWork,
}: {
  pills: PatternPill[];
  focus: WorkFocus | null;
  setFocus: (f: WorkFocus | null) => void;
  work: PatternWork[];
  setWork: (w: PatternWork[]) => void;
}) {
  const focusPill = focus ? pills.find((p) => p.id === focus.pillId) : null;
  const currentWork = focusPill
    ? work.find((w) => w.pillId === focusPill.id) || {
        pillId: focusPill.id,
        origin: '',
        triggers: '',
        avoid: '',
        helpful: '',
        emotions: '',
        worst: '',
        updatedAt: new Date().toISOString(),
      }
    : null;

  const selectFocus = (pillId: string) => {
    setFocus({ pillId, startDate: new Date().toISOString() });
  };

  const updateField = (key: keyof Omit<PatternWork, 'pillId' | 'updatedAt'>, value: string) => {
    if (!focusPill) return;
    const existing = work.find((w) => w.pillId === focusPill.id);
    const next: PatternWork = existing
      ? { ...existing, [key]: value, updatedAt: new Date().toISOString() }
      : {
          pillId: focusPill.id,
          origin: '',
          triggers: '',
          avoid: '',
          helpful: '',
          emotions: '',
          worst: '',
          [key]: value,
          updatedAt: new Date().toISOString(),
        };
    if (existing) {
      setWork(work.map((w) => (w.pillId === focusPill.id ? next : w)));
    } else {
      setWork([...work, next]);
    }
  };

  const answeredCount = currentWork
    ? WORK_FIELDS.filter((f) => (currentWork[f.key] || '').trim().length > 0).length
    : 0;

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
          <p
            className="text-center"
            style={{
              color: '#8A6A4A',
              opacity: 0.6,
              fontFamily: 'var(--font-handwritten)',
              fontSize: '14px',
            }}
          >
            Pick a pattern from your map. Six questions to help you understand it.
          </p>
          {pills.length === 0 && (
            <p
              className="text-center pt-2"
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
              {pills.map((p) => {
                const w = work.find((ww) => ww.pillId === p.id);
                const count = w
                  ? WORK_FIELDS.filter((f) => (w[f.key] || '').trim().length > 0).length
                  : 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectFocus(p.id)}
                    className="cursor-pointer rounded-full transition-all hover:scale-105 flex items-center gap-2"
                    style={{
                      background: `${p.color}12`,
                      border: `1.5px solid ${p.color}30`,
                      color: '#7a5438',
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                      fontSize: '15px',
                      padding: '8px 14px',
                    }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                    {p.name}
                    {count > 0 && (
                      <span
                        className="rounded-full px-1.5"
                        style={{
                          background: `${p.color}28`,
                          color: p.color,
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {count}/6
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {focusPill && currentWork && (
        <div className="space-y-3">
          {/* Header with progress */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: `${focusPill.color}10`,
              border: `1.5px solid ${focusPill.color}30`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: focusPill.color }} />
                <span
                  style={{
                    color: '#7a5438',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '20px',
                  }}
                >
                  {focusPill.name}
                </span>
              </div>
              <span
                style={{
                  color: focusPill.color,
                  fontFamily: 'var(--font-handwritten)',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {answeredCount}/6
              </span>
            </div>
            {/* Progress bar */}
            <div className="flex gap-1">
              {WORK_FIELDS.map((f) => {
                const filled = (currentWork[f.key] || '').trim().length > 0;
                return (
                  <div
                    key={f.key}
                    className="flex-1 rounded-full"
                    style={{
                      height: 4,
                      background: filled ? focusPill.color : `${focusPill.color}20`,
                      opacity: filled ? 0.8 : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* 6 question cards */}
          {WORK_FIELDS.map((field, i) => {
            const value = currentWork[field.key] || '';
            const filled = value.trim().length > 0;
            return (
              <div
                key={field.key}
                className="rounded-xl px-4 py-3"
                style={{
                  background: '#f7eddc9c',
                  border: `1.5px solid ${filled ? `${focusPill.color}45` : '#d2b47b4a'}`,
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    color: filled ? focusPill.color : '#8A6A4A',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '17px',
                    lineHeight: 1.3,
                  }}
                >
                  <span
                    style={{
                      color: focusPill.color,
                      opacity: 0.5,
                      fontSize: '13px',
                      marginRight: 6,
                    }}
                  >
                    {i + 1}.
                  </span>
                  {field.question}
                </p>
                <textarea
                  value={value}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  className="w-full resize-none bg-transparent outline-none"
                  style={{
                    color: '#7a5438',
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '16px',
                    border: 'none',
                    minHeight: 50,
                  }}
                />
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setFocus(null)}
            className="w-full cursor-pointer text-center py-2"
            style={{
              color: '#8A6A4A',
              opacity: 0.5,
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-handwritten)',
              fontSize: '14px',
            }}
          >
            ← change pattern
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
        style={{ color: '#9B6BA0', fontSize: '15px' }}
      >
        Emotion Decomposition
      </p>

      <p
        className="text-center"
        style={{
          color: '#8A6A4A',
          opacity: 0.6,
          fontFamily: 'var(--font-handwritten)',
          fontSize: '16px',
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
            width: 110,
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
                  height: isPicked ? 38 : 30,
                  border: 'none',
                  padding: '0 10px',
                  textAlign: 'left',
                  borderTop: isPicked ? `2px solid ${lvl.text}` : 'none',
                  borderBottom: isPicked ? `2px solid ${lvl.text}` : 'none',
                }}
                title={`${lvl.name} (${lvl.level})`}
              >
                <span
                  className="font-bold block"
                  style={{
                    color: lvl.text,
                    fontFamily: 'var(--font-serif)',
                    fontSize: isPicked ? '15px' : '13px',
                    letterSpacing: '0.02em',
                    lineHeight: 1.1,
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
                        fontSize: '15px',
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
                    fontSize: '16px',
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
                            fontSize: '15px',
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
                            fontSize: '15px',
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
                      fontSize: '16px',
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
                      fontSize: '16px',
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
                          fontSize: '15px',
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
              fontSize: '16px',
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
                  fontSize: '15px',
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
          fontSize: '15px',
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

/* ═══════════════════════════════════════════════════════════
   RIVER TAB — Evolution graph over time
   Horizontal mountain/river of strengths and weaknesses.
   Variable timeframes (week / month / year).
   ═══════════════════════════════════════════════════════════ */
function RiverTab({
  pills,
  river,
  setRiver,
}: {
  pills: PatternPill[];
  river: RiverSnapshot[];
  setRiver: (r: RiverSnapshot[]) => void;
}) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [todayValues, setTodayValues] = useState<Record<string, number>>({});

  const today = new Date().toISOString().split('T')[0];
  const todaySnapshot = river.find((s) => s.date === today);

  // Initialize today's values from existing snapshot or defaults
  useEffect(() => {
    if (todaySnapshot) {
      const vals: Record<string, number> = {};
      todaySnapshot.values.forEach((v) => {
        vals[v.pillId] = v.intensity;
      });
      setTodayValues(vals);
    }
  }, [todaySnapshot]);

  const saveTodaySnapshot = () => {
    const values = Object.entries(todayValues).map(([pillId, intensity]) => ({
      pillId,
      intensity,
    }));
    if (values.length === 0) return;
    const filtered = river.filter((s) => s.date !== today);
    setRiver([...filtered, { date: today, values }].sort((a, b) => a.date.localeCompare(b.date)));
  };

  const setTodayValue = (pillId: string, intensity: number) => {
    setTodayValues({ ...todayValues, [pillId]: intensity });
  };

  // Filter snapshots by timeframe
  const now = new Date();
  const cutoff = new Date(now);
  if (timeframe === 'week') cutoff.setDate(now.getDate() - 7);
  if (timeframe === 'month') cutoff.setMonth(now.getMonth() - 1);
  if (timeframe === 'year') cutoff.setFullYear(now.getFullYear() - 1);

  const visibleSnapshots = river
    .filter((s) => new Date(s.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Pills to graph
  const graphPills = showAll ? pills : pills.filter((p) => selectedPills.includes(p.id));

  // SVG dimensions
  const w = 320;
  const h = 180;
  const padX = 20;
  const padY = 20;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const xForIndex = (i: number, total: number) =>
    total <= 1 ? padX + innerW / 2 : padX + (i / (total - 1)) * innerW;

  const yForIntensity = (v: number) => padY + innerH - ((v - 1) / 4) * innerH;

  const togglePill = (id: string) => {
    if (selectedPills.includes(id)) {
      setSelectedPills(selectedPills.filter((p) => p !== id));
    } else {
      setSelectedPills([...selectedPills, id]);
    }
  };

  return (
    <div className="space-y-4">
      <p
        className="text-center font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#6890B0', fontSize: '12px' }}
      >
        River of Time
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
        Watch your strengths and challenges flow over time.
      </p>

      {/* Timeframe selector */}
      <div className="flex justify-center gap-1.5">
        {(['week', 'month', 'year'] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            className="cursor-pointer rounded-full px-4 py-1.5 transition-all"
            style={{
              background: timeframe === tf ? '#6890B015' : 'transparent',
              border: `1.5px solid ${timeframe === tf ? '#6890B045' : '#6890B015'}`,
              color: '#6890B0',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'capitalize',
            }}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Graph */}
      {pills.length === 0 && (
        <p
          className="text-center py-6"
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
        <>
          <div
            className="rounded-xl px-2 py-3"
            style={{ background: '#f7eddc9c', border: '1.5px solid #6890B025' }}
          >
            <svg
              width="100%"
              height={h}
              viewBox={`0 0 ${w} ${h}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={padX}
                  y1={padY + t * innerH}
                  x2={w - padX}
                  y2={padY + t * innerH}
                  stroke="#8A6A4A"
                  strokeWidth="0.4"
                  opacity="0.1"
                  strokeDasharray="2 3"
                />
              ))}
              {/* Y axis labels */}
              <text
                x={padX - 4}
                y={padY + 4}
                textAnchor="end"
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-handwritten)',
                  fill: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                high
              </text>
              <text
                x={padX - 4}
                y={padY + innerH}
                textAnchor="end"
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-handwritten)',
                  fill: '#8A6A4A',
                  opacity: 0.5,
                }}
              >
                low
              </text>

              {/* Empty state */}
              {visibleSnapshots.length === 0 && (
                <text
                  x={w / 2}
                  y={h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-handwritten)',
                    fill: '#8A6A4A',
                    opacity: 0.4,
                  }}
                >
                  rate your patterns below to start the river
                </text>
              )}

              {/* River lines per pill */}
              {visibleSnapshots.length > 0 &&
                graphPills.map((pill) => {
                  const points = visibleSnapshots
                    .map((snap, i) => {
                      const v = snap.values.find((vv) => vv.pillId === pill.id);
                      if (!v) return null;
                      return {
                        x: xForIndex(i, visibleSnapshots.length),
                        y: yForIntensity(v.intensity),
                      };
                    })
                    .filter((p): p is { x: number; y: number } => p !== null);
                  if (points.length === 0) return null;
                  const path =
                    points.length === 1
                      ? `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`
                      : points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  return (
                    <g key={pill.id}>
                      <path
                        d={path}
                        fill="none"
                        stroke={pill.color}
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={3} fill={pill.color} opacity="0.9" />
                      ))}
                    </g>
                  );
                })}

              {/* X axis date labels (first, mid, last) */}
              {visibleSnapshots.length > 0 && (
                <>
                  <text
                    x={padX}
                    y={h - 4}
                    textAnchor="start"
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-handwritten)',
                      fill: '#8A6A4A',
                      opacity: 0.5,
                    }}
                  >
                    {visibleSnapshots[0].date.slice(5)}
                  </text>
                  <text
                    x={w - padX}
                    y={h - 4}
                    textAnchor="end"
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-handwritten)',
                      fill: '#8A6A4A',
                      opacity: 0.5,
                    }}
                  >
                    {visibleSnapshots[visibleSnapshots.length - 1].date.slice(5)}
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Pill toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p
                className="uppercase tracking-wider"
                style={{
                  color: '#6890B0',
                  opacity: 0.6,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                Show on graph
              </p>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="cursor-pointer rounded-full px-3 py-1"
                style={{
                  background: showAll ? '#6890B015' : 'transparent',
                  border: '1.5px solid #6890B030',
                  color: '#6890B0',
                  fontFamily: 'var(--font-handwritten)',
                  fontWeight: 700,
                  fontSize: '12px',
                }}
              >
                {showAll ? 'showing all' : 'select pills'}
              </button>
            </div>
            {!showAll && (
              <div className="flex flex-wrap gap-1.5">
                {pills.map((p) => {
                  const isOn = selectedPills.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePill(p.id)}
                      className="cursor-pointer rounded-full px-3 py-1.5 transition-all"
                      style={{
                        background: isOn ? `${p.color}25` : `${p.color}08`,
                        border: `1.5px solid ${isOn ? `${p.color}55` : `${p.color}20`}`,
                        color: '#7a5438',
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's check-in */}
          <div
            className="rounded-xl px-4 py-3 space-y-3"
            style={{ background: '#f7eddc', border: '1.5px solid #6890B030' }}
          >
            <div className="flex items-center justify-between">
              <p
                className="uppercase tracking-wider"
                style={{
                  color: '#6890B0',
                  opacity: 0.6,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                Today's check-in
              </p>
              <span
                style={{
                  color: '#8A6A4A',
                  opacity: 0.5,
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: '12px',
                }}
              >
                {today.slice(5)}
              </span>
            </div>
            {pills.map((p) => {
              const v = todayValues[p.id] ?? 3;
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        color: '#7a5438',
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full mr-2"
                        style={{ background: p.color }}
                      />
                      {p.name}
                    </span>
                    <span
                      style={{
                        color: p.color,
                        opacity: 0.7,
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      {v}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={v}
                    onChange={(e) => setTodayValue(p.id, Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: p.color }}
                  />
                </div>
              );
            })}
            <button
              type="button"
              onClick={saveTodaySnapshot}
              disabled={Object.keys(todayValues).length === 0}
              className="w-full cursor-pointer rounded-lg py-2 uppercase tracking-wider transition-all"
              style={{
                background: '#6890B015',
                border: '1.5px solid #6890B040',
                color: '#6890B0',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '12px',
                opacity: Object.keys(todayValues).length === 0 ? 0.4 : 1,
              }}
            >
              {todaySnapshot ? 'Update today' : 'Save today'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
