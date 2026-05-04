'use client';

import { useEffect, useState } from 'react';
import CareCompass from '@/components/CareCompass';
import MicDot from '@/components/MicDot';
import ShareCompass from '@/components/ShareCompass';
import StarCompass from '@/components/StarCompass';

/*
 * FdsPanel — unified F / D / S surface.
 *
 * Three modes per axis: horizontal dots, vertical dots, compass wheel.
 * Reflect section lives inside each axis as a collapsible losange
 * element — same rainbow levels as the old ReflectThreeDots but
 * scoped to the selected axis, always reachable without a separate
 * component below.
 *
 * Long-term: entry point + compass are the same surface. SuperCompass
 * (all three rings together) can slot in as a 4th mode once the
 * individual axis experience is settled.
 */

type Axis = 'feeling' | 'doing' | 'sharing';
type Layout = 'h' | 'v' | 'compass' | 'super';

const LS_ENTRIES = 'colourmap:reflect-entries';
const LS_ITEM_DATA = 'colourmap:fds-item-data';
const LS_AXIS_LEVELS = 'colourmap:fds-axis-levels';
const LS_SLIDER_STYLE = 'colourmap:fds-slider-style';
const LS_SHARING_LOG = 'colourmap:sharing-logbook';
const LS_SHARING_CONN = 'colourmap:sharing-connections';
const LS_SHARING_EXPR = 'colourmap:sharing-expression';
const font = 'var(--font-serif)';
const S_COLOR = '#6B7F4E';

type SliderStyle = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SLogEntry {
  id: string;
  prompt: string;
  text: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  days: boolean[];
}

interface ItemData {
  level: number;
  tasks: Record<string, boolean>;
}

interface ReflectEntry {
  id: string;
  axis: Axis;
  level: string;
  text: string;
  createdAt: string;
}

interface AxisItem {
  name: string;
  color: string;
  subtitle: string;
  program: { id: string; text: string }[];
}

const AXES: Record<
  Axis,
  {
    label: string;
    color: string;
    items: AxisItem[];
    levels: { name: string; color: string }[];
    Compass: React.ComponentType<{ initialSlice?: string }>;
  }
> = {
  feeling: {
    label: 'F',
    color: '#D4805A',
    items: [
      {
        name: 'Care',
        color: '#D4B088',
        subtitle: 'how you hold yourself and others',
        program: [
          { id: 'f-care-1', text: 'Check in: am I giving from fullness or from depletion' },
          { id: 'f-care-2', text: 'Do one act of care for yourself today' },
          { id: 'f-care-3', text: 'Notice a moment when you felt genuinely cared for' },
          { id: 'f-care-4', text: 'Offer warmth to someone with no expectation back' },
        ],
      },
      {
        name: 'Attitude',
        color: '#D09060',
        subtitle: 'the lens you bring to each moment',
        program: [
          { id: 'f-att-1', text: 'Name the story you are telling yourself right now' },
          { id: 'f-att-2', text: 'Identify one rigid belief that is making life harder' },
          { id: 'f-att-3', text: 'Find something to be genuinely grateful for today' },
          { id: 'f-att-4', text: 'Respond to one frustration with curiosity, not reaction' },
        ],
      },
      {
        name: 'Rest',
        color: '#C47850',
        subtitle: 'restoration and recovery',
        program: [
          { id: 'f-rest-1', text: 'Sleep before midnight — three nights in a row' },
          { id: 'f-rest-2', text: 'Take one hour with nothing to accomplish' },
          { id: 'f-rest-3', text: 'Do a body scan — notice where tension lives' },
          { id: 'f-rest-4', text: 'Build a transition ritual between work and rest' },
        ],
      },
      {
        name: 'Emotions',
        color: '#B85A30',
        subtitle: 'what moves through you',
        program: [
          { id: 'f-emo-1', text: 'Name the feeling most present right now, without judging it' },
          { id: 'f-emo-2', text: 'Let an emotion pass without acting on it' },
          { id: 'f-emo-3', text: 'Write 10 lines about what you are actually feeling' },
          { id: 'f-emo-4', text: 'Find the need underneath a strong emotional reaction' },
        ],
      },
    ],
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
    Compass: CareCompass,
  },
  doing: {
    label: 'D',
    color: '#6890B0',
    items: [
      {
        name: 'Structure',
        color: '#9AABB8',
        subtitle: 'the frame that holds your work',
        program: [
          { id: 'd-str-1', text: 'Write out your ideal weekly schedule' },
          { id: 'd-str-2', text: 'Block time for your top three priorities' },
          { id: 'd-str-3', text: 'Identify a recurring disruption and design around it' },
          { id: 'd-str-4', text: 'Create a simple closing ritual for your day' },
        ],
      },
      {
        name: 'Target',
        color: '#7A98B0',
        subtitle: 'what you are actually aiming at',
        program: [
          { id: 'd-tgt-1', text: 'State your main goal in one clear sentence' },
          { id: 'd-tgt-2', text: 'Name three milestones between now and the goal' },
          { id: 'd-tgt-3', text: "Ask: is this goal mine or someone else's expectation" },
          { id: 'd-tgt-4', text: 'Review your progress every Sunday' },
        ],
      },
      {
        name: 'Action',
        color: '#5A88A8',
        subtitle: 'doing the thing',
        program: [
          { id: 'd-act-1', text: 'Start before you feel ready' },
          { id: 'd-act-2', text: 'Work 25 minutes on your most avoided task' },
          { id: 'd-act-3', text: 'Remove one friction point that slows you down' },
          { id: 'd-act-4', text: 'Ship something small today' },
        ],
      },
      {
        name: 'Resources',
        color: '#4878A8',
        subtitle: 'what you have to work with',
        program: [
          { id: 'd-res-1', text: 'List your available time, energy, money and skills' },
          { id: 'd-res-2', text: 'Find the constraint limiting you most right now' },
          { id: 'd-res-3', text: 'Ask for help in the area where you are most stuck' },
          { id: 'd-res-4', text: 'Invest in one tool or skill that multiplies your output' },
        ],
      },
    ],
    levels: [
      { name: 'In Flow', color: '#90B8D8' },
      { name: 'Working', color: '#A8CCA0' },
      { name: 'Trying', color: '#D8C088' },
      { name: 'Resisting', color: '#E8B898' },
      { name: 'Avoiding', color: '#E0908A' },
    ],
    Compass: StarCompass,
  },
  sharing: {
    label: 'S',
    color: '#6B7F4E',
    items: [
      {
        name: 'Social Life',
        color: '#9AAF80',
        subtitle: 'your connections and presence',
        program: [
          { id: 's-soc-1', text: 'Reach out to someone you have been meaning to contact' },
          { id: 's-soc-2', text: 'Be fully present in your next conversation — no phone' },
          { id: 's-soc-3', text: 'Plan one meaningful interaction this week' },
          { id: 's-soc-4', text: 'Notice when you are performing vs genuinely connecting' },
        ],
      },
      {
        name: 'Authentic',
        color: '#7A9860',
        subtitle: 'showing up as yourself',
        program: [
          { id: 's-aut-1', text: 'Say what you actually think in one conversation today' },
          { id: 's-aut-2', text: 'Drop one mask you wear in a specific context' },
          { id: 's-aut-3', text: 'Share something real with someone you trust' },
          { id: 's-aut-4', text: 'Notice the gap between who you are and who you perform' },
        ],
      },
      {
        name: 'Roots',
        color: '#5A8840',
        subtitle: 'where you come from',
        program: [
          { id: 's-roo-1', text: 'Spend time with family or with your origins' },
          { id: 's-roo-2', text: 'Honour one tradition that matters to you' },
          { id: 's-roo-3', text: 'Reflect on what shaped your deepest values' },
          { id: 's-roo-4', text: 'Write about a memory from your past with gratitude' },
        ],
      },
      {
        name: 'Express',
        color: '#4A6A2A',
        subtitle: 'putting something of yourself out there',
        program: [
          { id: 's-exp-1', text: 'Make something today, no matter how small' },
          { id: 's-exp-2', text: 'Share your perspective where it matters' },
          { id: 's-exp-3', text: 'Create without worrying if it is good' },
          { id: 's-exp-4', text: 'Say something that needed to be said' },
        ],
      },
    ],
    levels: [
      { name: 'Connected', color: '#88D8B0' },
      { name: 'Held', color: '#A8E0C8' },
      { name: 'Open', color: '#C8E0E8' },
      { name: 'Quiet', color: '#D0C0DA' },
      { name: 'Withdrawn', color: '#B0A0C8' },
      { name: 'Lonely', color: '#9080B0' },
    ],
    Compass: ShareCompass,
  },
};

const ORDER: Axis[] = ['feeling', 'doing', 'sharing'];

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

/* ── Reflect section — collapsible rainbow levels ── */
function ReflectSection({ axis, axisId }: { axis: (typeof AXES)[Axis]; axisId: Axis }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ReflectEntry[]>([]);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [input, setInput] = useState('');

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload entries when axis changes
  useEffect(() => {
    setEntries(loadEntries());
  }, [axisId]);

  function persist(next: ReflectEntry[]) {
    setEntries(next);
    saveEntries(next);
  }

  function addEntry(level: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    persist([
      {
        id: crypto.randomUUID(),
        axis: axisId,
        level,
        text: trimmed,
        createdAt: new Date().toISOString(),
      },
      ...entries,
    ]);
    setInput('');
  }

  function removeEntry(id: string) {
    persist(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="mt-4">
      {/* Losange divider opener */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setActiveLevel(null);
          setInput('');
        }}
        className="flex w-full cursor-pointer items-center gap-3"
        style={{ background: 'none', border: 'none', padding: '4px 0' }}
      >
        <div style={{ flex: 1, height: 1, background: `${axis.color}20` }} />
        <span
          style={{
            width: 10,
            height: 10,
            background: open ? axis.color : 'transparent',
            border: `1.5px solid ${axis.color}`,
            display: 'block',
            transform: 'rotate(45deg)',
            borderRadius: 2,
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        />
        <span
          style={{
            fontFamily: font,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: axis.color,
            opacity: open ? 1 : 0.6,
          }}
        >
          Reflect
        </span>
        <div style={{ flex: 1, height: 1, background: `${axis.color}20` }} />
      </button>

      {/* Rainbow levels column */}
      {open && (
        <div className="mt-3 space-y-1.5 animate-in fade-in duration-150">
          {axis.levels.map((level) => {
            const levelEntries = entries
              .filter((e) => e.axis === axisId && e.level === level.name)
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
                    style={{
                      width: 9,
                      height: 9,
                      background: level.color,
                      display: 'block',
                      flexShrink: 0,
                      transform: isActive ? 'rotate(45deg) scale(1.2)' : 'rotate(45deg)',
                      borderRadius: 2,
                      transition: 'transform 0.15s',
                      opacity: isActive ? 1 : 0.75,
                    }}
                  />
                  <span
                    className="flex-1 text-left"
                    style={{
                      fontFamily: font,
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
                        fontFamily: font,
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
                    <div className="relative mt-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            addEntry(level.name, input);
                          }
                        }}
                        placeholder={`what's in ${level.name.toLowerCase()} right now?`}
                        rows={2}
                        className="w-full resize-none rounded-lg px-3 py-2 outline-none placeholder:italic"
                        style={{
                          fontFamily: font,
                          fontSize: 14,
                          color: 'var(--foreground)',
                          background: 'var(--secondary)',
                          border: `1px solid ${level.color}40`,
                          lineHeight: 1.45,
                          paddingRight: input.length > 0 ? 28 : undefined,
                        }}
                      />
                      <span className="absolute right-2 bottom-2">
                        <MicDot visible={input.length > 0} value={input} onTranscript={setInput} />
                      </span>
                    </div>
                    {input.trim() && (
                      <button
                        type="button"
                        onClick={() => addEntry(level.name, input)}
                        className="cursor-pointer rounded-full px-3 py-1"
                        style={{
                          fontFamily: font,
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

                {levelEntries.length > 0 && (
                  <div className="space-y-1.5 px-3 pb-2">
                    {levelEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md"
                        style={{ background: 'var(--secondary)', padding: '6px 10px' }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily: font,
                              fontSize: 11,
                              color: 'var(--muted-foreground)',
                              opacity: 0.8,
                            }}
                          >
                            {relativeWhen(entry.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
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
                            fontFamily: font,
                            fontSize: 13,
                            color: 'var(--foreground)',
                            lineHeight: 1.45,
                            opacity: 0.9,
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
    </div>
  );
}

interface DotsProps {
  items: AxisItem[];
  axisKey: Axis;
  itemData: Record<string, ItemData>;
  openItem: string | null;
  setOpenItem: (k: string | null) => void;
  setItemLevel: (k: string, level: number) => void;
  toggleItemTask: (k: string, taskId: string) => void;
}

function ItemProgram({
  item,
  itemKey,
  data,
  setItemLevel,
  toggleItemTask,
  hideSubtitle,
}: {
  item: AxisItem;
  itemKey: string;
  data: ItemData;
  setItemLevel: (k: string, level: number) => void;
  toggleItemTask: (k: string, taskId: string) => void;
  hideSubtitle?: boolean;
}) {
  return (
    <div className="space-y-3 pt-3 pb-1 animate-in fade-in duration-150">
      {!hideSubtitle && (
        <p
          className="italic"
          style={{
            fontFamily: font,
            fontSize: 13,
            color: 'var(--muted-foreground)',
            opacity: 0.85,
            lineHeight: 1.4,
          }}
        >
          {item.subtitle}
        </p>
      )}
      {/* Level slider — domains style */}
      <div className="space-y-1.5">
        <p
          className="italic"
          style={{ fontFamily: font, fontSize: 12, color: 'var(--muted-foreground)', opacity: 0.7 }}
        >
          where are you?
        </p>
        <div className="flex gap-[5px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setItemLevel(itemKey, data.level === n ? 0 : n)}
              className="flex-1 cursor-pointer rounded-full transition-all"
              style={{
                height: 11,
                background: item.color,
                opacity: data.level >= n ? 0.85 : 0.14,
                border: 'none',
              }}
            />
          ))}
        </div>
      </div>
      {/* Program checklist */}
      <div className="space-y-2">
        {item.program.map((task) => {
          const done = !!data.tasks[task.id];
          return (
            <div key={task.id} className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => toggleItemTask(itemKey, task.id)}
                className="mt-[3px] flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all"
                style={{
                  borderColor: done ? `${item.color}60` : `${item.color}35`,
                  background: done ? `${item.color}18` : 'transparent',
                }}
              >
                {done && <span style={{ fontSize: 9, color: item.color, lineHeight: 1 }}>✓</span>}
              </button>
              <span
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  color: done ? item.color : 'var(--foreground)',
                  opacity: done ? 0.5 : 0.85,
                  textDecoration: done ? 'line-through' : 'none',
                  lineHeight: 1.45,
                }}
              >
                {task.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 4 items — horizontal: dot + label, tap → expand below ── */
function DotsHorizontal({
  items,
  axisKey,
  itemData,
  openItem,
  setOpenItem,
  setItemLevel,
  toggleItemTask,
}: DotsProps) {
  const activeItem = items.find((item) => openItem === `${axisKey}:${item.name}`);
  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-5">
        {items.map((item) => {
          const key = `${axisKey}:${item.name}`;
          const isActive = openItem === key;
          const data = itemData[key] ?? { level: 0, tasks: {} };
          const doneCount = item.program.filter((t) => data.tasks[t.id]).length;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setOpenItem(isActive ? null : key)}
              className="flex flex-col items-center gap-2 cursor-pointer transition-all"
              style={{ background: 'none', border: 'none', minWidth: 60 }}
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: isActive ? 22 : 16,
                  height: isActive ? 22 : 16,
                  background: item.color,
                  opacity: isActive ? 1 : 0.75,
                  boxShadow: isActive ? `0 3px 10px -3px ${item.color}` : 'none',
                }}
              />
              <span
                style={{
                  fontFamily: font,
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                {item.name}
                {doneCount > 0 && (
                  <span style={{ display: 'block', fontSize: 9, color: item.color, opacity: 0.9 }}>
                    {doneCount}/{item.program.length}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {activeItem && (
        <div className="px-2">
          <ItemProgram
            item={activeItem}
            itemKey={`${axisKey}:${activeItem.name}`}
            data={itemData[`${axisKey}:${activeItem.name}`] ?? { level: 0, tasks: {} }}
            setItemLevel={setItemLevel}
            toggleItemTask={toggleItemTask}
          />
        </div>
      )}
    </div>
  );
}

/* ── 4 items — vertical: dot + title + subtitle, tap → expand inline ── */
function DotsVertical({
  items,
  axisKey,
  itemData,
  openItem,
  setOpenItem,
  setItemLevel,
  toggleItemTask,
}: DotsProps) {
  return (
    <div className="space-y-4 px-1">
      {items.map((item) => {
        const key = `${axisKey}:${item.name}`;
        const isExpanded = openItem === key;
        const data = itemData[key] ?? { level: 0, tasks: {} };
        const doneCount = item.program.filter((t) => data.tasks[t.id]).length;
        return (
          <div key={item.name}>
            <button
              type="button"
              onClick={() => setOpenItem(isExpanded ? null : key)}
              className="flex w-full cursor-pointer items-start gap-4 text-left transition-all"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span
                className="mt-[3px] block shrink-0 rounded-full transition-all"
                style={{
                  width: isExpanded ? 20 : 15,
                  height: isExpanded ? 20 : 15,
                  background: item.color,
                  opacity: isExpanded ? 1 : 0.82,
                  boxShadow: isExpanded ? `0 3px 12px -3px ${item.color}` : 'none',
                }}
              />
              <div className="flex-1">
                <p
                  style={{
                    fontFamily: font,
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--foreground)',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.name}
                  {doneCount > 0 && (
                    <span
                      style={{ marginLeft: 7, color: item.color, fontSize: 12, fontWeight: 400 }}
                    >
                      {doneCount === item.program.length
                        ? '✓'
                        : `${doneCount}/${item.program.length}`}
                    </span>
                  )}
                </p>
                <p
                  className="italic"
                  style={{
                    fontFamily: font,
                    fontSize: 13,
                    color: 'var(--muted-foreground)',
                    opacity: 0.8,
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            </button>
            {isExpanded && (
              <div className="ml-9">
                <ItemProgram
                  item={item}
                  itemKey={key}
                  data={data}
                  setItemLevel={setItemLevel}
                  toggleItemTask={toggleItemTask}
                  hideSubtitle
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── SuperCompass — Feeling (inner pizza) + Doing (outer donut) ── */
function SuperCompass() {
  const W = 320;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const outerR = 145;
  const innerR = 60;

  const outerSlices = [
    { label: 'Target', color: '#7A98B0' },
    { label: 'Action', color: '#5A88A8' },
    { label: 'Resources', color: '#4878A8' },
    { label: 'Structure', color: '#9AABB8' },
  ];

  const innerSlices = [
    { label: 'Attitude', color: '#D09060' },
    { label: 'Rest', color: '#C47850' },
    { label: 'Emotions', color: '#B85A30' },
    { label: 'Care', color: '#D4B088' },
  ];

  function renderRing(
    slices: { label: string; color: string }[],
    rOuter: number,
    rInner: number,
    labelR: number,
    fontSize: number,
  ) {
    return slices.map((slice, i) => {
      const startAngle = -Math.PI / 4 + (i / 4) * Math.PI * 2;
      const endAngle = -Math.PI / 4 + ((i + 1) / 4) * Math.PI * 2;
      let d: string;
      if (rInner === 0) {
        const x1 = cx + rOuter * Math.cos(startAngle);
        const y1 = cy + rOuter * Math.sin(startAngle);
        const x2 = cx + rOuter * Math.cos(endAngle);
        const y2 = cy + rOuter * Math.sin(endAngle);
        d = `M ${cx} ${cy} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} Z`;
      } else {
        const ox1 = cx + rOuter * Math.cos(startAngle);
        const oy1 = cy + rOuter * Math.sin(startAngle);
        const ox2 = cx + rOuter * Math.cos(endAngle);
        const oy2 = cy + rOuter * Math.sin(endAngle);
        const ix2 = cx + rInner * Math.cos(endAngle);
        const iy2 = cy + rInner * Math.sin(endAngle);
        const ix1 = cx + rInner * Math.cos(startAngle);
        const iy1 = cy + rInner * Math.sin(startAngle);
        d = `M ${ox1} ${oy1} A ${rOuter} ${rOuter} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${rInner} ${rInner} 0 0 0 ${ix1} ${iy1} Z`;
      }
      const midAngle = (startAngle + endAngle) / 2;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);
      return (
        <g key={slice.label}>
          <path
            d={d}
            fill={slice.color}
            fillOpacity={0.28}
            stroke={slice.color}
            strokeWidth={0.8}
            strokeOpacity={0.5}
          />
          <text
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#5C3018"
            fontSize={fontSize}
            fontFamily={font}
            fontWeight={600}
            style={{ pointerEvents: 'none' }}
          >
            {slice.label}
          </text>
        </g>
      );
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <title>SuperCompass — Feeling inside Doing</title>
        {renderRing(outerSlices, outerR, innerR + 20, (outerR + innerR + 20) / 2, 13)}
        {renderRing(innerSlices, innerR, 0, innerR * 0.48, 11)}
        <circle cx={cx} cy={cy} r={3} fill="#C4A060" opacity={0.6} />
      </svg>
      <div className="flex justify-center gap-6 pb-1">
        <span
          style={{
            fontFamily: font,
            fontSize: 11,
            color: '#D4805A',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}
        >
          ◎ Feeling
        </span>
        <span
          style={{
            fontFamily: font,
            fontSize: 11,
            color: '#6890B0',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}
        >
          ◉ Doing
        </span>
      </div>
    </div>
  );
}

/* ── AxisSlider — 5 visual styles for the D / S level picker ── */
function AxisSlider({
  levels,
  selectedIdx,
  onSelect,
  axisColor,
  style,
}: {
  levels: { name: string; color: string }[];
  selectedIdx: number;
  onSelect: (i: number) => void;
  axisColor: string;
  style: SliderStyle;
}) {
  const n = levels.length;
  const cur = levels[selectedIdx];

  /* style 3 — gradient line with thumb */
  if (style === 3) {
    const pct = n > 1 ? (selectedIdx / (n - 1)) * 100 : 0;
    const allColors = levels.map((l) => l.color).join(', ');
    return (
      <div className="relative flex items-center" style={{ flex: 1, height: 28 }}>
        <div
          style={{
            position: 'absolute',
            left: 8,
            right: 8,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(to right,${allColors})`,
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 8,
            right: `calc(${100 - pct}% * ((100% - 16px) / 100%))`,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(to right,${allColors})`,
            opacity: 0.75,
            width: `calc((100% - 16px) * ${pct / 100})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(8px + (100% - 16px) * ${pct / 100} - 7px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: cur.color,
            boxShadow: `0 2px 8px -2px ${cur.color}`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <div className="absolute inset-0 flex">
          {levels.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              style={{
                flex: 1,
                height: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* style 4 — bowed arc */
  if (style === 4) {
    const H = 44;
    const dotSize = 15;
    return (
      <div className="relative" style={{ flex: 1, height: H }}>
        {levels.map((level, i) => {
          const pct = n > 1 ? i / (n - 1) : 0;
          const angle = (pct - 0.5) * Math.PI;
          const ry = H * 0.45;
          const cy = H * 0.72;
          const y = cy - ry * Math.cos(angle) - dotSize / 2;
          const selected = selectedIdx === i;
          return (
            <button
              key={level.name}
              type="button"
              onClick={() => onSelect(i)}
              className="absolute cursor-pointer rounded-full transition-all"
              style={{
                left: `calc(${pct * 100}% - ${dotSize / 2}px)`,
                top: y,
                width: dotSize,
                height: dotSize,
                background: level.color,
                opacity: selected ? 1 : 0.22,
                border: 'none',
                boxShadow: selected ? `0 3px 10px -3px ${level.color}` : 'none',
                transform: selected ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          );
        })}
      </div>
    );
  }

  /* style 5 — vertical bars (EQ) */
  if (style === 5) {
    return (
      <div className="flex items-end gap-[3px]" style={{ flex: 1, height: 32, paddingBottom: 2 }}>
        {levels.map((level, i) => {
          const heightPct = 20 + (i / Math.max(n - 1, 1)) * 80;
          const selected = selectedIdx === i;
          return (
            <button
              key={level.name}
              type="button"
              onClick={() => onSelect(i)}
              className="flex-1 cursor-pointer transition-all"
              style={{
                height: `${heightPct}%`,
                background: level.color,
                opacity: selected ? 1 : i <= selectedIdx ? 0.45 : 0.15,
                border: 'none',
                borderRadius: '2px 2px 0 0',
              }}
            />
          );
        })}
      </div>
    );
  }

  /* style 6 — pill / segment blocks */
  if (style === 6) {
    return (
      <div className="flex items-center gap-1" style={{ flex: 1, height: 28 }}>
        {levels.map((level, i) => {
          const selected = selectedIdx === i;
          return (
            <button
              key={level.name}
              type="button"
              onClick={() => onSelect(i)}
              className="flex-1 cursor-pointer transition-all"
              style={{
                height: selected ? 16 : 10,
                borderRadius: 6,
                background: style === 6 ? level.color : axisColor,
                opacity: selected ? 0.95 : i <= selectedIdx ? 0.45 : 0.14,
                border: 'none',
                boxShadow: selected ? `0 2px 8px -2px ${level.color}` : 'none',
              }}
            />
          );
        })}
      </div>
    );
  }

  /* style 7 — graduated dots (grow in size left → right) */
  if (style === 7) {
    return (
      <div className="relative flex items-center" style={{ flex: 1, height: 32 }}>
        {levels.map((level, i) => {
          const pct = n > 1 ? (i / (n - 1)) * 100 : 50;
          const base = 7 + (i / Math.max(n - 1, 1)) * 11;
          const selected = selectedIdx === i;
          return (
            <button
              key={level.name}
              type="button"
              onClick={() => onSelect(i)}
              className="absolute cursor-pointer rounded-full transition-all"
              style={{
                left: `${pct}%`,
                top: '50%',
                transform: 'translate(-50%,-50%)',
                width: selected ? base + 4 : base,
                height: selected ? base + 4 : base,
                background: level.color,
                opacity: selected ? 1 : i <= selectedIdx ? 0.55 : 0.2,
                border: 'none',
                boxShadow: selected ? `0 2px 10px -2px ${level.color}` : 'none',
                zIndex: selected ? 2 : 1,
              }}
            />
          );
        })}
      </div>
    );
  }

  /* styles 1 (rainbow dots) and 2 (colour dots) — track + dots */
  const selPct = n > 1 ? (selectedIdx / (n - 1)) * 100 : 0;
  return (
    <div className="relative flex items-center" style={{ flex: 1, height: 28 }}>
      {/* Full track */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          borderRadius: 1,
          background: axisColor,
          opacity: 0.15,
        }}
      />
      {/* Filled track up to selected */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: `${selPct}%`,
          height: 2,
          borderRadius: 1,
          background:
            style === 1
              ? `linear-gradient(to right,${levels
                  .slice(0, selectedIdx + 1)
                  .map((l) => l.color)
                  .join(',')})`
              : axisColor,
          opacity: 0.6,
        }}
      />
      {/* Dots */}
      {levels.map((level, i) => {
        const selected = selectedIdx === i;
        const pct = n > 1 ? (i / (n - 1)) * 100 : 50;
        const bg = style === 1 ? level.color : axisColor;
        return (
          <button
            key={level.name}
            type="button"
            onClick={() => onSelect(i)}
            className="absolute cursor-pointer rounded-full transition-all"
            style={{
              left: `${pct}%`,
              top: '50%',
              transform: 'translate(-50%,-50%)',
              width: selected ? 18 : 12,
              height: selected ? 18 : 12,
              background: bg,
              opacity: selected ? 1 : i <= selectedIdx ? 0.55 : 0.28,
              border: 'none',
              boxShadow: selected ? `0 2px 8px -2px ${bg}` : 'none',
              zIndex: selected ? 2 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Shared losange divider ── */
function LosingeDivider({
  label,
  open,
  onToggle,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-3"
      style={{ background: 'none', border: 'none', padding: '4px 0' }}
    >
      <div style={{ flex: 1, height: 1, background: `${S_COLOR}20` }} />
      <span
        style={{
          width: 10,
          height: 10,
          background: open ? S_COLOR : 'transparent',
          border: `1.5px solid ${S_COLOR}`,
          display: 'block',
          transform: 'rotate(45deg)',
          borderRadius: 2,
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
      />
      <span
        style={{
          fontFamily: font,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: S_COLOR,
          opacity: open ? 1 : 0.6,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `${S_COLOR}20` }} />
    </button>
  );
}

/* ── Sharing logbook — 3 prompts, saved entries ── */
function SharingLogbook() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<SLogEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_SHARING_LOG) || '[]') as SLogEntry[];
    } catch {
      return [];
    }
  });

  const PROMPTS = [
    { key: 'reached', label: 'who did you reach out to?' },
    { key: 'hard', label: 'what felt hard to share?' },
    { key: 'expressed', label: 'what did you make or express?' },
  ];

  function persist(next: SLogEntry[]) {
    setEntries(next);
    localStorage.setItem(LS_SHARING_LOG, JSON.stringify(next));
  }

  function saveAll() {
    const now = new Date().toISOString();
    const newEntries = PROMPTS.filter((p) => answers[p.key]?.trim()).map((p) => ({
      id: crypto.randomUUID(),
      prompt: p.label,
      text: answers[p.key].trim(),
      createdAt: now,
    }));
    if (newEntries.length === 0) return;
    persist([...newEntries, ...entries]);
    setAnswers({});
  }

  const hasFilled = PROMPTS.some((p) => answers[p.key]?.trim());

  return (
    <div className="mt-2">
      <LosingeDivider label="Journal" open={open} onToggle={() => setOpen((o) => !o)} />
      {open && (
        <div className="mt-3 space-y-2 animate-in fade-in duration-150">
          {PROMPTS.map((p) => (
            <input
              key={p.key}
              type="text"
              value={answers[p.key] || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [p.key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveAll();
              }}
              placeholder={p.label}
              className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic"
              style={{
                fontFamily: font,
                fontSize: 14,
                color: 'var(--foreground)',
                borderColor: `${S_COLOR}30`,
              }}
            />
          ))}
          {hasFilled && (
            <button
              type="button"
              onClick={saveAll}
              className="cursor-pointer rounded-full px-3 py-1"
              style={{
                fontFamily: font,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: S_COLOR,
                background: `${S_COLOR}22`,
                border: `1px solid ${S_COLOR}70`,
              }}
            >
              log
            </button>
          )}
          {entries.length > 0 && (
            <div className="space-y-2 pt-2" style={{ borderTop: `1px dashed ${S_COLOR}20` }}>
              {entries.slice(0, 10).map((e) => (
                <div key={e.id} className="flex items-start gap-2">
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: S_COLOR,
                      opacity: 0.4,
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: font,
                        fontSize: 10,
                        color: S_COLOR,
                        opacity: 0.55,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {e.prompt}
                    </p>
                    <p
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        color: 'var(--foreground)',
                        opacity: 0.85,
                        lineHeight: 1.4,
                      }}
                    >
                      {e.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => persist(entries.filter((x) => x.id !== e.id))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: S_COLOR,
                      opacity: 0.3,
                      cursor: 'pointer',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Connection map — named contacts + 7-day dot history ── */
function ConnectionMap() {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_SHARING_CONN) || '[]') as Contact[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const today = new Date().getDay();
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  function save(next: Contact[]) {
    setContacts(next);
    localStorage.setItem(LS_SHARING_CONN, JSON.stringify(next));
  }

  function addContact(name: string) {
    if (!name.trim()) return;
    save([
      ...contacts,
      { id: crypto.randomUUID(), name: name.trim(), days: Array(7).fill(false) as boolean[] },
    ]);
    setInput('');
  }

  function toggleDay(id: string, di: number) {
    save(
      contacts.map((c) =>
        c.id !== id ? c : { ...c, days: c.days.map((d, j) => (j === di ? !d : d)) },
      ),
    );
  }

  return (
    <div className="mt-1">
      <LosingeDivider label="Connections" open={open} onToggle={() => setOpen((o) => !o)} />
      {open && (
        <div className="mt-3 space-y-2 animate-in fade-in duration-150">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="group rounded-xl px-3 py-2.5"
              style={{ background: `${S_COLOR}07`, border: `1px solid ${S_COLOR}18` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 13,
                    fontWeight: 700,
                    color: S_COLOR,
                    flex: 1,
                  }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 11,
                    color: S_COLOR,
                    opacity: 0.4,
                  }}
                >
                  {c.days.filter(Boolean).length}/7
                </span>
                <button
                  type="button"
                  onClick={() => save(contacts.filter((x) => x.id !== c.id))}
                  className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-40"
                  style={{ background: 'none', border: 'none', color: S_COLOR, fontSize: 12 }}
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {c.days.map((done, di) => (
                  <button
                    key={di}
                    type="button"
                    onClick={() => toggleDay(c.id, di)}
                    className="flex cursor-pointer flex-col items-center gap-0.5"
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    <div
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: 22,
                        height: 22,
                        background: done ? S_COLOR : `${S_COLOR}14`,
                        opacity: done ? 0.75 : 0.4,
                        border: di === today ? `2px solid ${S_COLOR}` : 'none',
                      }}
                    />
                    <span style={{ fontSize: 9, color: S_COLOR, opacity: 0.4, fontFamily: font }}>
                      {labels[di]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addContact(input);
            }}
            placeholder="+ add person..."
            className="w-full border-b bg-transparent pb-2 text-sm outline-none"
            style={{ color: `${S_COLOR}cc`, borderColor: `${S_COLOR}25`, fontFamily: font }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Expression streak — 7-day "made something" tracker ── */
function ExpressionStreak() {
  const [days, setDays] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(LS_SHARING_EXPR);
      const parsed = raw ? (JSON.parse(raw) as boolean[]) : null;
      return Array.isArray(parsed) && parsed.length === 7 ? parsed : Array(7).fill(false);
    } catch {
      return Array(7).fill(false);
    }
  });

  const today = new Date().getDay();
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  function toggle(i: number) {
    const next = days.map((d, j) => (j === i ? !d : d));
    setDays(next);
    localStorage.setItem(LS_SHARING_EXPR, JSON.stringify(next));
  }

  return (
    <div
      className="mt-1 rounded-2xl px-4 py-3"
      style={{ background: `${S_COLOR}07`, border: `1px solid ${S_COLOR}15` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          style={{
            fontFamily: font,
            fontSize: 12,
            fontWeight: 700,
            color: S_COLOR,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Created
        </span>
        <span style={{ fontFamily: font, fontSize: 11, color: S_COLOR, opacity: 0.4 }}>
          {days.filter(Boolean).length}/7
        </span>
      </div>
      <div className="flex items-center gap-2">
        {days.map((done, di) => (
          <button
            key={di}
            type="button"
            onClick={() => toggle(di)}
            className="flex cursor-pointer flex-col items-center gap-1"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <div
              className="rounded-full transition-all duration-200"
              style={{
                width: 28,
                height: 28,
                background: done ? S_COLOR : `${S_COLOR}12`,
                opacity: done ? 0.7 : 0.4,
                border: di === today ? `2px solid ${S_COLOR}` : 'none',
              }}
            />
            <span style={{ fontSize: 10, color: S_COLOR, opacity: 0.5, fontFamily: font }}>
              {labels[di]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── All sharing extras — rendered only when S is active ── */
function SharingExtras() {
  return (
    <div className="space-y-3">
      <SharingLogbook />
      <ConnectionMap />
      <ExpressionStreak />
    </div>
  );
}

export default function FdsPanel() {
  const [active, setActive] = useState<Axis | null>(null);
  const [layout, setLayout] = useState<Layout>('v');
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [itemData, setItemData] = useState<Record<string, ItemData>>({});
  const [axisLevels, setAxisLevels] = useState<Record<Axis, number>>(() => {
    try {
      const raw = localStorage.getItem(LS_AXIS_LEVELS);
      return raw ? JSON.parse(raw) : { feeling: 0, doing: 0, sharing: 0 };
    } catch {
      return { feeling: 0, doing: 0, sharing: 0 };
    }
  });
  const [sliderStyle, setSliderStyle] = useState<SliderStyle>(() => {
    try {
      const v = Number(localStorage.getItem(LS_SLIDER_STYLE));
      return (v >= 1 && v <= 7 ? v : 1) as SliderStyle;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ITEM_DATA);
      if (raw) setItemData(JSON.parse(raw));
    } catch {}
  }, []);

  function setItemLevel(key: string, level: number) {
    setItemData((prev) => {
      const next = { ...prev, [key]: { ...(prev[key] ?? { tasks: {} }), level } };
      localStorage.setItem(LS_ITEM_DATA, JSON.stringify(next));
      return next;
    });
  }

  function toggleItemTask(key: string, taskId: string) {
    setItemData((prev) => {
      const cur = prev[key] ?? { level: 0, tasks: {} };
      const next = {
        ...prev,
        [key]: { ...cur, tasks: { ...cur.tasks, [taskId]: !cur.tasks[taskId] } },
      };
      localStorage.setItem(LS_ITEM_DATA, JSON.stringify(next));
      return next;
    });
  }

  function setAxisLevel(axis: Axis, level: number) {
    setAxisLevels((prev) => {
      const next = { ...prev, [axis]: level };
      localStorage.setItem(LS_AXIS_LEVELS, JSON.stringify(next));
      return next;
    });
  }

  function cycleSliderStyle() {
    setSliderStyle((s) => {
      const next = (s >= 7 ? 1 : s + 1) as SliderStyle;
      localStorage.setItem(LS_SLIDER_STYLE, String(next));
      return next;
    });
  }

  const isSuper = layout === 'super';
  const axisDef = active && !isSuper ? AXES[active] : null;

  return (
    <div className="space-y-3">
      {/* F / D / S — each axis as its own row: circle + slider */}
      <div className="space-y-3">
        {ORDER.map((id) => {
          const a = AXES[id];
          const isOn = active === id && !isSuper;
          const level = axisLevels[id];
          const curLevel = a.levels[level];
          return (
            <div key={id} className="flex items-center gap-3">
              {/* Circle — tap to expand */}
              <button
                type="button"
                onClick={() => {
                  setActive(isOn ? null : id);
                  setLayout('v');
                  setOpenItem(null);
                }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isOn ? `${a.color}22` : `${a.color}0C`,
                  border: `2px solid ${isOn ? a.color : `${a.color}38`}`,
                  boxShadow: isOn ? `0 0 0 4px ${a.color}18` : 'none',
                  transition: 'all 0.18s',
                  fontFamily: font,
                  fontSize: 20,
                  fontWeight: 800,
                  color: isOn ? a.color : `${a.color}80`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {a.label}
              </button>

              {/* Slider — all axes use chosen style */}
              <AxisSlider
                levels={a.levels}
                selectedIdx={level}
                onSelect={(i) => setAxisLevel(id, i)}
                axisColor={a.color}
                style={sliderStyle}
              />

              {/* Level name */}
              <span
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: 600,
                  color: curLevel.color,
                  width: 62,
                  textAlign: 'right',
                  letterSpacing: '0.05em',
                  flexShrink: 0,
                  lineHeight: 1.2,
                }}
              >
                {curLevel.name}
              </span>
            </div>
          );
        })}

        {/* Ochre dot — style picker, right-aligned below rows */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <span
            style={{
              fontFamily: font,
              fontSize: 10,
              color: '#C4A060',
              opacity: 0.5,
              letterSpacing: '0.1em',
            }}
          >
            {sliderStyle}/7
          </span>
          <button
            type="button"
            onClick={cycleSliderStyle}
            title={`Slider style ${sliderStyle} of 7 — click to change`}
            className="cursor-pointer transition-all hover:scale-110"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span
              style={{
                display: 'block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#C4A060',
                opacity: 0.7,
                boxShadow: '0 1px 6px -1px #C4A06080',
              }}
            />
          </button>
        </div>
      </div>

      {/* ⊚ SuperCompass toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (isSuper) {
              setLayout('h');
            } else {
              setActive(null);
              setLayout('super');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            fontFamily: font,
            fontSize: 15,
            color: isSuper ? '#C4A060' : '#8A6A4A',
            background: isSuper ? '#C4A06018' : 'transparent',
            border: `1.5px solid ${isSuper ? '#C4A06055' : '#C4A06020'}`,
            cursor: 'pointer',
            opacity: isSuper ? 1 : 0.45,
            transition: 'all 0.15s',
          }}
          title="SuperCompass — Feeling + Doing"
        >
          ⊚
        </button>
      </div>

      {/* SuperCompass view */}
      {isSuper && (
        <div className="animate-in fade-in duration-200">
          <SuperCompass />
        </div>
      )}

      {/* Expanded axis panel */}
      {axisDef && active && (
        <div className="animate-in fade-in duration-150 space-y-4">
          {/* H / V / ◎ mode toggle */}
          <div className="flex justify-center gap-1.5">
            {(
              [
                { id: 'h', icon: '—' },
                { id: 'v', icon: '|' },
                { id: 'compass', icon: '◎' },
              ] as { id: Layout; icon: string }[]
            ).map(({ id, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setLayout(id);
                  setOpenItem(null);
                }}
                style={{
                  background: layout === id ? `${axisDef.color}18` : 'transparent',
                  border: `1px solid ${layout === id ? `${axisDef.color}40` : `${axisDef.color}18`}`,
                  borderRadius: 20,
                  padding: '2px 12px',
                  cursor: 'pointer',
                  fontSize: id === 'compass' ? 13 : 11,
                  fontFamily: font,
                  fontWeight: 600,
                  color: axisDef.color,
                  opacity: layout === id ? 1 : 0.45,
                  letterSpacing: id === 'h' || id === 'v' ? '0.1em' : undefined,
                  textTransform: 'uppercase',
                  transition: 'all 0.15s',
                }}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Content */}
          {layout === 'h' && (
            <DotsHorizontal
              items={axisDef.items}
              axisKey={active}
              itemData={itemData}
              openItem={openItem}
              setOpenItem={setOpenItem}
              setItemLevel={setItemLevel}
              toggleItemTask={toggleItemTask}
            />
          )}
          {layout === 'v' && (
            <DotsVertical
              items={axisDef.items}
              axisKey={active}
              itemData={itemData}
              openItem={openItem}
              setOpenItem={setOpenItem}
              setItemLevel={setItemLevel}
              toggleItemTask={toggleItemTask}
            />
          )}
          {layout === 'compass' && (
            <div className="animate-in fade-in duration-200">
              <axisDef.Compass />
            </div>
          )}

          {/* Reflect losange */}
          <ReflectSection axis={axisDef} axisId={active} />

          {/* Sharing-specific extras */}
          {active === 'sharing' && <SharingExtras />}
        </div>
      )}
    </div>
  );
}
