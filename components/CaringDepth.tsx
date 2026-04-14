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
export default function CaringDepth({
  forcedTab,
}: {
  forcedTab?: 'map' | 'work' | 'reflect' | 'river';
} = {}) {
  const [tab, setTab] = useState<'map' | 'work' | 'reflect' | 'river'>(forcedTab ?? 'map');
  const [showTabs, setShowTabs] = useState(false);
  // If forcedTab is set, lock the tab
  useEffect(() => {
    if (forcedTab) setTab(forcedTab);
  }, [forcedTab]);
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

  // When forcedTab is set: render ONLY that tab bare, no outer card, no tab switcher
  if (forcedTab) {
    return (
      <div className="space-y-4">
        {forcedTab === 'map' && (
          <MapTab
            pills={pills}
            setPills={(v) => up(PILLS_KEY, v, setPills)}
            packs={packs}
            setPacks={(v) => up(PACKS_KEY, v, setPacks)}
            work={work}
          />
        )}
        {forcedTab === 'work' && (
          <WorkTab
            pills={pills}
            focus={focus}
            setFocus={(v) => up(FOCUS_KEY, v, setFocus)}
            work={work}
            setWork={(v) => up(WORK_KEY, v, setWork)}
          />
        )}
        {forcedTab === 'reflect' && (
          <ReflectTab
            pills={pills}
            decompositions={decompositions}
            setDecompositions={(v) => up(REFLECT_KEY, v, setDecompositions)}
          />
        )}
        {forcedTab === 'river' && (
          <RiverTab pills={pills} river={river} setRiver={(v) => up(RIVER_KEY, v, setRiver)} />
        )}
      </div>
    );
  }

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-5"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Map — always the default view */}
      {tab === 'map' && (
        <MapTab
          pills={pills}
          setPills={(v) => up(PILLS_KEY, v, setPills)}
          packs={packs}
          setPacks={(v) => up(PACKS_KEY, v, setPacks)}
          work={work}
        />
      )}

      {/* Losange gateway to deeper tabs */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (showTabs) {
              setShowTabs(false);
              setTab('map');
            } else {
              setShowTabs(true);
            }
          }}
          className="h-5 w-5 rotate-45 cursor-pointer transition-all duration-300 hover:scale-125"
          style={{
            background: showTabs ? '#9B6BA040' : '#9B6BA018',
            borderRadius: 2,
            border: 'none',
          }}
        />
      </div>

      {/* Tab row — only when losange is open */}
      {showTabs && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-center gap-3">
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
                className="cursor-pointer rounded-full px-3 py-1 text-xs uppercase tracking-[0.15em] transition-all duration-200"
                style={{
                  background: tab === t.id ? `${t.color}18` : 'transparent',
                  border: `1px solid ${tab === t.id ? `${t.color}40` : 'transparent'}`,
                  color: t.color,
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

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
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAP TAB — Big readable strength/weakness blocks
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   CELL VIEWS — 3 modes for visual personality mapping
   ═══════════════════════════════════════════════════════════ */
type CellViewMode = 'vertical' | 'freeform' | 'rings';

const CARE_ZONES = [
  { key: 'care', label: 'Care', color: '#D4805A' },
  { key: 'attitude', label: 'Attitude', color: '#C4A070' },
  { key: 'rest', label: 'Rest', color: '#C4906A' },
  { key: 'emotions', label: 'Emotions', color: '#B07A5A' },
];

/* ─── Shared drag + edit logic for all cell views ─── */
function useCellDrag(storageKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  });
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const save = (next: Record<string, { x: number; y: number }>) => {
    setPositions(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(rect.width - 90, dragRef.current.origX + (e.clientX - dragRef.current.startX)),
      );
      const y = Math.max(
        0,
        Math.min(rect.height - 36, dragRef.current.origY + (e.clientY - dragRef.current.startY)),
      );
      setPositions((prev) => ({ ...prev, [dragRef.current!.id]: { x, y } }));
    };
    const onUp = () => {
      if (dragRef.current) {
        save({ ...positions });
        dragRef.current = null;
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  });

  return { containerRef, positions, dragRef, editingId, setEditingId, editName, setEditName, save };
}

/* ─── Shared cell element ─── */
function DraggableCell({
  pill,
  x,
  y,
  editingId,
  editName,
  setEditingId,
  setEditName,
  dragRef,
  containerRef,
  onRename,
  onRemove,
  positions,
  savePositions,
}: {
  pill: PatternPill;
  x: number;
  y: number;
  editingId: string | null;
  editName: string;
  setEditingId: (id: string | null) => void;
  setEditName: (n: string) => void;
  dragRef: React.MutableRefObject<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  positions: Record<string, { x: number; y: number }>;
  savePositions: (p: Record<string, { x: number; y: number }>) => void;
}) {
  const isEditing = editingId === pill.id;
  return (
    <div
      className="absolute group cursor-grab rounded-lg px-3 py-2 transition-shadow duration-200 hover:shadow-md active:cursor-grabbing"
      style={{
        left: x,
        top: y,
        background: '#f7eddc',
        border: `1.5px solid ${pill.color}40`,
        boxShadow: `0 2px 8px ${pill.color}15`,
        minWidth: 70,
        maxWidth: 140,
        touchAction: 'none',
      }}
      onMouseDown={(e) => {
        if (isEditing) return;
        dragRef.current = { id: pill.id, startX: e.clientX, startY: e.clientY, origX: x, origY: y };
      }}
      onTouchStart={(e) => {
        if (isEditing) return;
        const t = e.touches[0];
        dragRef.current = { id: pill.id, startX: t.clientX, startY: t.clientY, origX: x, origY: y };
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        if (!dragRef.current || !containerRef.current) return;
        const t = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const nx = Math.max(
          0,
          Math.min(rect.width - 90, dragRef.current.origX + (t.clientX - dragRef.current.startX)),
        );
        const ny = Math.max(
          0,
          Math.min(rect.height - 36, dragRef.current.origY + (t.clientY - dragRef.current.startY)),
        );
        positions[dragRef.current.id] = { x: nx, y: ny };
      }}
      onTouchEnd={() => {
        if (dragRef.current) {
          savePositions({ ...positions });
          dragRef.current = null;
        }
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => {
            onRename(pill.id, editName);
            setEditingId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onRename(pill.id, editName);
              setEditingId(null);
            }
            if (e.key === 'Escape') setEditingId(null);
          }}
          autoFocus
          className="bg-transparent outline-none"
          style={{
            color: '#7a5438',
            fontFamily: 'var(--font-handwritten)',
            fontWeight: 700,
            fontSize: '14px',
            width: '100%',
            border: 'none',
          }}
        />
      ) : (
        <div className="flex items-center gap-1.5">
          <span
            onClick={() => {
              setEditingId(pill.id);
              setEditName(pill.name);
            }}
            className="cursor-text"
            style={{
              color: '#7a5438',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {pill.name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(pill.id);
            }}
            className="cursor-pointer text-xs opacity-0 transition-opacity group-hover:opacity-40"
            style={{ color: '#7a5438', background: 'none', border: 'none' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── View 1: Vertical CARE bands ─── */
function VerticalCellView({
  pills,
  onRename,
  onRemove,
}: {
  pills: PatternPill[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const { containerRef, positions, dragRef, editingId, setEditingId, editName, setEditName, save } =
    useCellDrag('colourmap:cell-vertical');
  const bandH = 80;
  const totalH = CARE_ZONES.length * bandH;

  const getPos = (pill: PatternPill, idx: number) => {
    if (positions[pill.id]) return positions[pill.id];
    const bandIdx = idx % CARE_ZONES.length;
    return { x: 60 + (idx % 3) * 90, y: bandIdx * bandH + 24 };
  };

  const allPills = pills.filter((p) => !p.parentId);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden"
      style={{ height: totalH, background: '#f7eddc30', border: '1.5px solid #8A6A4A12' }}
    >
      {CARE_ZONES.map((zone, i) => (
        <div key={zone.key}>
          <div
            className="absolute left-0 right-0"
            style={{
              top: i * bandH,
              height: bandH,
              background: i % 2 === 0 ? '#f7eddc20' : 'transparent',
              borderBottom: '1px solid #8A6A4A10',
            }}
          >
            <span
              className="absolute left-3 top-1 text-xs font-bold uppercase tracking-wider"
              style={{ color: zone.color, opacity: 0.5, fontFamily: 'var(--font-serif)' }}
            >
              {zone.label}
            </span>
          </div>
        </div>
      ))}
      {allPills.map((pill, i) => {
        const pos = getPos(pill, i);
        return (
          <DraggableCell
            key={pill.id}
            pill={pill}
            x={pos.x}
            y={pos.y}
            editingId={editingId}
            editName={editName}
            setEditingId={setEditingId}
            setEditName={setEditName}
            dragRef={dragRef}
            containerRef={containerRef}
            onRename={onRename}
            onRemove={onRemove}
            positions={positions}
            savePositions={save}
          />
        );
      })}
    </div>
  );
}

/* ─── View 2: Freeform with soft zone hints ─── */
function FreeformCellView({
  pills,
  onRename,
  onRemove,
}: {
  pills: PatternPill[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const { containerRef, positions, dragRef, editingId, setEditingId, editName, setEditName, save } =
    useCellDrag('colourmap:cell-freeform');

  const getPos = (pill: PatternPill, idx: number) => {
    if (positions[pill.id]) return positions[pill.id];
    const isFlow = pill.type === 'strength';
    return {
      x: isFlow ? 20 + (idx % 2) * 110 : 150 + (idx % 2) * 110,
      y: 30 + Math.floor(idx / 2) * 60,
    };
  };

  const allPills = pills.filter((p) => !p.parentId);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl"
      style={{ height: 340, background: '#f7eddc30', border: '1.5px solid #8A6A4A12' }}
    >
      {/* Soft zone labels in corners */}
      <span
        className="absolute top-2 left-3 text-xs uppercase tracking-wider"
        style={{ color: '#D4805A', opacity: 0.3, fontFamily: 'var(--font-serif)', fontWeight: 700 }}
      >
        Care
      </span>
      <span
        className="absolute top-2 right-3 text-xs uppercase tracking-wider"
        style={{ color: '#C4A070', opacity: 0.3, fontFamily: 'var(--font-serif)', fontWeight: 700 }}
      >
        Attitude
      </span>
      <span
        className="absolute bottom-2 left-3 text-xs uppercase tracking-wider"
        style={{ color: '#C4906A', opacity: 0.3, fontFamily: 'var(--font-serif)', fontWeight: 700 }}
      >
        Rest
      </span>
      <span
        className="absolute bottom-2 right-3 text-xs uppercase tracking-wider"
        style={{ color: '#B07A5A', opacity: 0.3, fontFamily: 'var(--font-serif)', fontWeight: 700 }}
      >
        Emotions
      </span>
      {allPills.map((pill, i) => {
        const pos = getPos(pill, i);
        return (
          <DraggableCell
            key={pill.id}
            pill={pill}
            x={pos.x}
            y={pos.y}
            editingId={editingId}
            editName={editName}
            setEditingId={setEditingId}
            setEditName={setEditName}
            dragRef={dragRef}
            containerRef={containerRef}
            onRename={onRename}
            onRemove={onRemove}
            positions={positions}
            savePositions={save}
          />
        );
      })}
    </div>
  );
}

/* ─── View 3: Concentric rings ─── */
function RingsCellView({
  pills,
  onRename,
  onRemove,
}: {
  pills: PatternPill[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const { containerRef, positions, dragRef, editingId, setEditingId, editName, setEditName, save } =
    useCellDrag('colourmap:cell-rings');
  const sz = 340;
  const cx = sz / 2;
  const cy = sz / 2;

  const getPos = (pill: PatternPill, idx: number) => {
    if (positions[pill.id]) return positions[pill.id];
    const angle =
      (idx / Math.max(1, pills.filter((p) => !p.parentId).length)) * Math.PI * 2 - Math.PI / 2;
    const r = 80 + (idx % 3) * 30;
    return { x: cx + r * Math.cos(angle) - 40, y: cy + r * Math.sin(angle) - 16 };
  };

  const allPills = pills.filter((p) => !p.parentId);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl"
      style={{ height: sz, background: '#f7eddc30', border: '1.5px solid #8A6A4A12' }}
    >
      {/* Concentric ring guides */}
      <svg className="absolute inset-0" width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
        <circle
          cx={cx}
          cy={cy}
          r={60}
          fill="none"
          stroke="#8A6A4A"
          strokeWidth="0.5"
          opacity={0.1}
        />
        <circle
          cx={cx}
          cy={cy}
          r={110}
          fill="none"
          stroke="#8A6A4A"
          strokeWidth="0.5"
          opacity={0.08}
        />
        <circle
          cx={cx}
          cy={cy}
          r={155}
          fill="none"
          stroke="#8A6A4A"
          strokeWidth="0.5"
          opacity={0.06}
        />
        {/* CARE labels at compass points */}
        <text
          x={cx}
          y={30}
          textAnchor="middle"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fill: '#C4A070',
            opacity: 0.35,
          }}
        >
          Attitude
        </text>
        <text
          x={sz - 12}
          y={cy + 4}
          textAnchor="end"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fill: '#C4906A',
            opacity: 0.35,
          }}
        >
          Rest
        </text>
        <text
          x={cx}
          y={sz - 16}
          textAnchor="middle"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fill: '#B07A5A',
            opacity: 0.35,
          }}
        >
          Emotions
        </text>
        <text
          x={12}
          y={cy + 4}
          textAnchor="start"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fill: '#D4805A',
            opacity: 0.35,
          }}
        >
          Care
        </text>
        {/* Center star */}
        {(() => {
          const r1 = 10;
          const r2 = 3.5;
          const pts: string[] = [];
          for (let i = 0; i < 8; i++) {
            const a = -Math.PI / 2 + (i * Math.PI) / 4;
            const r = i % 2 === 0 ? r1 : r2;
            pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
          }
          return <polygon points={pts.join(' ')} fill="#C4A060" opacity={0.2} />;
        })()}
      </svg>
      {allPills.map((pill, i) => {
        const pos = getPos(pill, i);
        return (
          <DraggableCell
            key={pill.id}
            pill={pill}
            x={pos.x}
            y={pos.y}
            editingId={editingId}
            editName={editName}
            setEditingId={setEditingId}
            setEditName={setEditName}
            dragRef={dragRef}
            containerRef={containerRef}
            onRename={onRename}
            onRemove={onRemove}
            positions={positions}
            savePositions={save}
          />
        );
      })}
    </div>
  );
}

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
  const [organizing, setOrganizing] = useState(false);
  const [pickingParentFor, setPickingParentFor] = useState<string | null>(null);
  const [creatingPack, setCreatingPack] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | CellViewMode>('list');
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
    if (pickingParentFor === id) setPickingParentFor(null);
  };

  const promoteToMain = (id: string) => {
    setPills(pills.map((p) => (p.id === id ? { ...p, parentId: undefined } : p)));
  };

  const makeSubOf = (childId: string, parentId: string) => {
    const child = pills.find((p) => p.id === childId);
    const parent = pills.find((p) => p.id === parentId);
    if (!child || !parent || child.id === parent.id) return;
    if (child.type !== parent.type) return;
    // Don't allow making something a sub of one of its own children
    if (parent.parentId === childId) return;
    setPills(pills.map((p) => (p.id === childId ? { ...p, parentId, color: parent.color } : p)));
    setPickingParentFor(null);
  };

  return (
    <div className="space-y-4">
      {viewMode === 'list' ? (
        <>
          {/* LIST VIEW — Challenge / Flow titles + inputs + pills */}
          <div className="grid grid-cols-2 gap-4">
            <p
              className="text-center text-xl font-bold"
              style={{ color: '#C4A060', fontFamily: 'var(--font-serif)' }}
            >
              Flow
            </p>
            <p
              className="text-center text-xl font-bold"
              style={{ color: '#C4A060', fontFamily: 'var(--font-serif)' }}
            >
              Challenge
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColumnBlock
              label="Flow"
              accent="#c79a42"
              empty="What's strong?"
              placeholder="What's flowing?..."
              pills={strengths}
              allPills={pills}
              work={work}
              getSubs={getSubs}
              editingId={editingId}
              editName={editName}
              addingSubFor={addingSubFor}
              subInput={subInput}
              setSubInput={setSubInput}
              organizing={organizing}
              pickingParentFor={pickingParentFor}
              onPickParent={(childId) =>
                setPickingParentFor(pickingParentFor === childId ? null : childId)
              }
              onMakeSubOf={makeSubOf}
              onPromoteToMain={promoteToMain}
              onStartAddSub={(id) => {
                setAddingSubFor(addingSubFor === id ? null : id);
                setSubInput('');
              }}
              onCommitAddSub={(id) => addSubPill(id, subInput)}
              onCancelAddSub={() => setAddingSubFor(null)}
              onAddDirect={(name) => addPill(name, 'strength')}
              onStartEdit={(id, name) => {
                setEditingId(id);
                setEditName(name);
              }}
              onChangeEdit={setEditName}
              onCommitEdit={(id) => renamePill(id, editName)}
              onCancelEdit={() => setEditingId(null)}
              onRemove={removePill}
            />
            <ColumnBlock
              label="Challenge"
              accent="#c79a42"
              empty="What's heavy?"
              placeholder="What's challenging?..."
              pills={weaknesses}
              allPills={pills}
              work={work}
              getSubs={getSubs}
              editingId={editingId}
              editName={editName}
              addingSubFor={addingSubFor}
              subInput={subInput}
              setSubInput={setSubInput}
              organizing={organizing}
              pickingParentFor={pickingParentFor}
              onPickParent={(childId) =>
                setPickingParentFor(pickingParentFor === childId ? null : childId)
              }
              onMakeSubOf={makeSubOf}
              onPromoteToMain={promoteToMain}
              onStartAddSub={(id) => {
                setAddingSubFor(addingSubFor === id ? null : id);
                setSubInput('');
              }}
              onCommitAddSub={(id) => addSubPill(id, subInput)}
              onCancelAddSub={() => setAddingSubFor(null)}
              onAddDirect={(name) => addPill(name, 'weakness')}
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
        </>
      ) : (
        /* CELL VIEWS — visual map, replaces list */
        <div className="animate-in fade-in duration-200">
          {viewMode === 'vertical' && (
            <VerticalCellView pills={pills} onRename={renamePill} onRemove={removePill} />
          )}
          {viewMode === 'freeform' && (
            <FreeformCellView pills={pills} onRename={renamePill} onRemove={removePill} />
          )}
          {viewMode === 'rings' && (
            <RingsCellView pills={pills} onRename={renamePill} onRemove={removePill} />
          )}
        </div>
      )}

      {/* Losange — cycles: list → vertical → freeform → rings → list */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => {
            const modes: ('list' | CellViewMode)[] = ['list', 'vertical', 'freeform', 'rings'];
            const next = modes[(modes.indexOf(viewMode) + 1) % modes.length];
            setViewMode(next);
          }}
          className="h-4 w-4 rotate-45 cursor-pointer transition-all duration-300 hover:scale-125"
          style={{
            background: viewMode !== 'list' ? '#C4A06040' : '#C4A06018',
            borderRadius: 2,
            border: 'none',
          }}
        />
        {viewMode !== 'list' && (
          <span
            className="text-xs"
            style={{ color: '#C4A060', opacity: 0.4, fontFamily: 'var(--font-serif)' }}
          >
            {viewMode}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Inline input for adding pills ─── */
function ColumnInput({
  label,
  accent,
  placeholder,
  onAdd,
}: {
  label: string;
  accent: string;
  placeholder: string;
  onAdd: (name: string) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div className="text-center">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onAdd(value.trim());
            setValue('');
          }
        }}
        placeholder={placeholder}
        className="w-full border-b bg-transparent pb-1 text-center text-base outline-none"
        style={{
          color: '#C4A060',
          borderColor: '#C4A06030',
          fontFamily: 'var(--font-serif)',
        }}
      />
    </div>
  );
}

/* ─── Column block (Flow or Challenge) ─── */
function ColumnBlock({
  label,
  accent,
  empty,
  placeholder,
  pills,
  allPills,
  work,
  getSubs,
  editingId,
  editName,
  addingSubFor,
  subInput,
  setSubInput,
  organizing,
  pickingParentFor,
  onPickParent,
  onMakeSubOf,
  onPromoteToMain,
  onStartAddSub,
  onCommitAddSub,
  onCancelAddSub,
  onAddDirect,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
}: {
  label: string;
  accent: string;
  empty: string;
  placeholder: string;
  pills: PatternPill[];
  allPills: PatternPill[];
  work: PatternWork[];
  getSubs: (parentId: string) => PatternPill[];
  editingId: string | null;
  editName: string;
  addingSubFor: string | null;
  subInput: string;
  setSubInput: (v: string) => void;
  organizing: boolean;
  pickingParentFor: string | null;
  onPickParent: (childId: string) => void;
  onMakeSubOf: (childId: string, parentId: string) => void;
  onPromoteToMain: (id: string) => void;
  onStartAddSub: (id: string) => void;
  onCommitAddSub: (id: string) => void;
  onCancelAddSub: () => void;
  onAddDirect: (name: string) => void;
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
        canAddSub={!isSub && !organizing}
        organizing={organizing}
        onStartEdit={() => onStartEdit(p.id, p.name)}
        onChangeEdit={onChangeEdit}
        onCommitEdit={() => onCommitEdit(p.id)}
        onCancelEdit={onCancelEdit}
        onRemove={() => onRemove(p.id)}
        onStartAddSub={() => onStartAddSub(p.id)}
        onPickParent={() => onPickParent(p.id)}
        onPromote={() => onPromoteToMain(p.id)}
      />
    );
  };

  // For parent picker: valid parents are top-level pills of same type, excluding self and own descendants
  const getValidParents = (childId: string): PatternPill[] => {
    const child = allPills.find((p) => p.id === childId);
    if (!child) return [];
    return allPills.filter(
      (p) => !p.parentId && p.type === child.type && p.id !== childId && p.parentId !== childId,
    );
  };

  return (
    <div className="space-y-3">
      {/* Input at top */}
      <ColumnInput label={label} accent={accent} placeholder={placeholder} onAdd={onAddDirect} />
      <div className="space-y-2">
        {pills.map((p) => {
          return <div key={p.id}>{renderPill(p, false)}</div>;
        })}
      </div>
    </div>
  );
}

/* ─── Pill row with rename + sub + organize support ─── */
function PillRow({
  pill,
  isSub = false,
  workCount,
  isEditing,
  editName,
  canAddSub = true,
  organizing = false,
  onStartEdit,
  onChangeEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
  onStartAddSub,
  onPickParent,
  onPromote,
}: {
  pill: PatternPill;
  isSub?: boolean;
  workCount: number;
  isEditing: boolean;
  editName: string;
  canAddSub?: boolean;
  organizing?: boolean;
  onStartEdit: () => void;
  onChangeEdit: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onRemove: () => void;
  onStartAddSub?: () => void;
  onPickParent?: () => void;
  onPromote?: () => void;
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
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded px-1.5 py-0.5 text-sm opacity-50 hover:opacity-80"
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

/* ─── Parent picker strip ─── */
function ParentPickerStrip({
  childPill,
  candidates,
  onPick,
  onCancel,
}: {
  childPill: PatternPill;
  candidates: PatternPill[];
  onPick: (parentId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="rounded-xl px-3 py-2.5 animate-in fade-in duration-200"
      style={{
        background: '#9B6BA010',
        border: '1.5px solid #9B6BA040',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p
          className="uppercase tracking-wider"
          style={{
            color: '#9B6BA0',
            opacity: 0.7,
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          Make <span style={{ color: childPill.color }}>{childPill.name}</span> a sub of...
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer text-sm"
          style={{ color: '#9B6BA0', opacity: 0.5, background: 'none', border: 'none' }}
        >
          ✕
        </button>
      </div>
      {candidates.length === 0 ? (
        <p
          className="text-center py-1"
          style={{
            color: '#9B6BA0',
            opacity: 0.5,
            fontFamily: 'var(--font-handwritten)',
            fontSize: '14px',
            fontStyle: 'italic',
          }}
        >
          No other patterns to nest under
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="cursor-pointer rounded-full transition-all hover:scale-105 flex items-center gap-1.5"
              style={{
                background: `${c.color}15`,
                border: `1.5px solid ${c.color}40`,
                color: '#7a5438',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 700,
                fontSize: '14px',
                padding: '5px 10px',
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      )}
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
              fontSize: '14px',
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
/* ─── Collapsible question list for Work tab ─── */
function WorkQuestionList({
  fields,
  currentWork,
  pillColor,
  onUpdate,
}: {
  fields: typeof WORK_FIELDS;
  currentWork: PatternWork;
  pillColor: string;
  onUpdate: (key: keyof Omit<PatternWork, 'pillId' | 'updatedAt'>, value: string) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-1">
      {fields.map((field, i) => {
        const value = currentWork[field.key] || '';
        const filled = value.trim().length > 0;
        const isOpen = openIdx === i;

        return (
          <div key={field.key}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all"
              style={{
                background: isOpen ? `${pillColor}08` : 'transparent',
                border: 'none',
              }}
            >
              <span
                className="text-base font-semibold flex-1"
                style={{
                  color: pillColor,
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {field.question}
              </span>
              {filled && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: pillColor, opacity: 0.6 }}
                />
              )}
              <span className="text-xs shrink-0" style={{ color: pillColor, opacity: 0.4 }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 animate-in fade-in duration-150">
                <textarea
                  value={value}
                  onChange={(e) => onUpdate(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  autoFocus
                  className="w-full resize-none bg-transparent outline-none"
                  style={{
                    color: '#7a5438',
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '18px',
                    border: 'none',
                    minHeight: 50,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      {!focusPill && (
        <div className="space-y-3">
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
            </div>
          </div>

          {/* 6 questions — collapsible to-do list */}
          <WorkQuestionList
            fields={WORK_FIELDS}
            currentWork={currentWork}
            pillColor={focusPill.color}
            onUpdate={updateField}
          />

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
const DOING_SPECTRUM = [
  { level: 'Still', color: '#8098B0', desc: 'Not moving. Sometimes that is exactly right.' },
  {
    level: 'Drifting',
    color: '#90A080',
    desc: 'Moving without direction. Notice where the current takes you.',
  },
  {
    level: 'Resisting',
    color: '#C85050',
    desc: 'Pushing back against what is. Name what you are fighting.',
  },
  {
    level: 'Pushing',
    color: '#D87048',
    desc: 'Forcing through. Check if the wall is real or imagined.',
  },
  { level: 'Moving', color: '#C88820', desc: 'In motion with intent. Keep the pace sustainable.' },
  {
    level: 'Building',
    color: '#7AAA58',
    desc: 'Creating something that accumulates. Protect this energy.',
  },
  { level: 'Creating', color: '#3AA8A0', desc: 'Making something new. Let it be imperfect.' },
  {
    level: 'Flowing',
    color: '#3A8AC4',
    desc: 'Action without friction. You and the work are one.',
  },
];

function ReflectTab({
  pills,
  decompositions,
  setDecompositions,
}: {
  pills: PatternPill[];
  decompositions: EmotionDecomposition[];
  setDecompositions: (d: EmotionDecomposition[]) => void;
}) {
  const [pickedHawkins, setPickedHawkins] = useState<number | null>(null);
  const [pickedDoing, setPickedDoing] = useState<number | null>(null);

  const hawkinsLevel = pickedHawkins !== null ? HAWKINS_LEVELS[pickedHawkins] : null;
  const doingLevel = pickedDoing !== null ? DOING_SPECTRUM[pickedDoing] : null;

  return (
    <div className="space-y-4">
      {/* Two vertical columns: Hawkins (left) | Doing (right) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: Hawkins feeling column */}
        <div className="space-y-2">
          <p
            className="text-center text-lg font-bold"
            style={{ color: '#9B6BA0', fontFamily: 'var(--font-serif)' }}
          >
            Feeling
          </p>
          <div
            className="flex flex-col rounded-xl overflow-hidden"
            style={{ border: '1.5px solid #9B6BA030' }}
          >
            {HAWKINS_LEVELS.map((lvl, i) => {
              const isPicked = pickedHawkins === i;
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => setPickedHawkins(isPicked ? null : i)}
                  className="cursor-pointer transition-all"
                  style={{
                    background: lvl.color,
                    height: isPicked ? 36 : 26,
                    border: 'none',
                    padding: '0 8px',
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="font-bold"
                    style={{
                      color: lvl.text,
                      fontFamily: 'var(--font-serif)',
                      fontSize: isPicked ? '14px' : '11px',
                      lineHeight: 1.1,
                    }}
                  >
                    {lvl.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Doing spectrum column */}
        <div className="space-y-2">
          <p
            className="text-center text-lg font-bold"
            style={{ color: '#3A8AC4', fontFamily: 'var(--font-serif)' }}
          >
            Doing
          </p>
          <div
            className="flex flex-col rounded-xl overflow-hidden"
            style={{ border: '1.5px solid #3A8AC430' }}
          >
            {DOING_SPECTRUM.map((lvl, i) => {
              const isPicked = pickedDoing === i;
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => setPickedDoing(isPicked ? null : i)}
                  className="cursor-pointer transition-all"
                  style={{
                    background: lvl.color,
                    height: isPicked ? 42 : 32,
                    border: 'none',
                    padding: '0 8px',
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="font-bold text-white"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: isPicked ? '15px' : '13px',
                      lineHeight: 1.1,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    {lvl.level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected states */}
      {(hawkinsLevel || doingLevel) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            {hawkinsLevel && (
              <p
                className="text-lg font-bold"
                style={{ color: hawkinsLevel.text, fontFamily: 'var(--font-serif)' }}
              >
                {hawkinsLevel.name}
              </p>
            )}
          </div>
          <div className="text-center">
            {doingLevel && (
              <>
                <p
                  className="text-lg font-bold"
                  style={{ color: doingLevel.color, fontFamily: 'var(--font-serif)' }}
                >
                  {doingLevel.level}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: doingLevel.color, opacity: 0.7, fontFamily: 'var(--font-serif)' }}
                >
                  {doingLevel.desc}
                </p>
              </>
            )}
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
        style={{ color: '#6890B0', fontSize: '14px' }}
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
              fontSize: '14px',
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
                  fontSize: '14px',
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
                  fontSize: '14px',
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
                    fontSize: '14px',
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
                      fontSize: '14px',
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
                      fontSize: '14px',
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
                  fontSize: '14px',
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
                  fontSize: '14px',
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
                        fontSize: '14px',
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
                  fontSize: '14px',
                }}
              >
                Today's check-in
              </p>
              <span
                style={{
                  color: '#8A6A4A',
                  opacity: 0.5,
                  fontFamily: 'var(--font-handwritten)',
                  fontSize: '14px',
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
                        fontSize: '14px',
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
                fontSize: '14px',
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
