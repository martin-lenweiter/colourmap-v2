'use client';

import { useEffect, useMemo, useState } from 'react';
import DoingCardsPanel from '@/components/DoingCardsPanel';
import { DOING_CATEGORIES } from '@/components/DoingCategoryRail';
import { syncPref } from '@/lib/sync';

type MissionFormat = 'one' | 'two';
type MissionKind = 'free' | 'deep' | 'pro' | 'real';

type Subtask = { id: string; text: string; done: boolean };
type MissionTag = { name: string; color: string; categoryId?: string };
type CardItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt?: string;
  timeFrame?: string;
  blockingLog?: string[];
  flowingLog?: string[];
  subtasks?: Subtask[];
  ideas?: string[];
  tag?: MissionTag;
};
type MissionSource = 'current' | 'daily' | 'push';
type MissionViewItem = CardItem & { source: MissionSource; kind: MissionKind };
type LifeArea = { id: string; name: string; color: string };

const FORMAT_KEY = 'colourmap:mission-design-format';
const OBJECTIVE_KEY = 'colourmap:current-objective';
const OBJECTIVE_TF_KEY = 'colourmap:objective-timeframe';
const OBJECTIVE_DONE_KEY = 'colourmap:objective-done';
const OBJECTIVE_BLOCKING_KEY = 'colourmap:objective-blocking-log';
const OBJECTIVE_FLOWING_KEY = 'colourmap:objective-flowing-log';
const OBJECTIVE_SUBTASKS_KEY = 'colourmap:objective-subtasks';
const OBJECTIVE_IDEAS_KEY = 'colourmap:objective-ideas';
const OBJECTIVE_AREA_KEY = 'colourmap:objective-area-id';
const OBJECTIVE_KIND_KEY = 'colourmap:objective-kind';
const MISSIONS_KEY = 'colourmap:today-objectives';
const PUSH_KEY = 'colourmap:checkin-todos';
const LIFE_CATS_KEY = 'colourmap:life-categories';
const MISSION_KIND_PREFIX = 'colourmap:mission-kind:';

const PAPER = 'rgba(255,255,255,0.04)';
const LINE = 'rgba(196,160,96,0.2)';
const LINE_SOFT = 'rgba(196,160,96,0.12)';
const BROWN = 'var(--palette-panel-text, #5C3018)';
const MUTED = 'var(--palette-panel-muted, #8A6A4A)';
const OCHRE = '#C4A060';

const KIND_META: Record<MissionKind, { label: string; color: string; note: string }> = {
  free: {
    label: 'Free Card',
    color: '#C4A060',
    note: 'Loose captures and unsorted pressure.',
  },
  deep: {
    label: 'Deep Thought',
    color: '#9B6BA0',
    note: 'Thinking, reflection, strategy, writing.',
  },
  pro: {
    label: 'Pro Work',
    color: '#688FB0',
    note: 'Career, craft, serious execution.',
  },
  real: {
    label: 'Real Work',
    color: '#7A8A50',
    note: 'Body, home, admin, money, repairs.',
  },
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadLifeAreas(): LifeArea[] {
  const stored = readJson<Array<{ id: string; name?: string; title?: string; color?: string }>>(
    LIFE_CATS_KEY,
    [],
  );
  if (stored.length > 0) {
    return stored.map((area, index) => ({
      id: area.id,
      name: area.name ?? area.title ?? `Area ${index + 1}`,
      color: area.color ?? OCHRE,
    }));
  }
  return DOING_CATEGORIES.map((area) => ({
    id: area.id,
    name: area.label,
    color: area.color,
  }));
}

function getKind(item: Pick<CardItem, 'id' | 'tag'>, source: MissionSource): MissionKind {
  if (typeof window === 'undefined') return source === 'push' ? 'free' : 'real';
  const key = source === 'current' ? OBJECTIVE_KIND_KEY : `${MISSION_KIND_PREFIX}${item.id}`;
  const value = localStorage.getItem(key);
  if (value === 'free' || value === 'deep' || value === 'pro' || value === 'real') return value;
  const tag = item.tag?.name?.toLowerCase() ?? '';
  if (tag.includes('creative') || tag.includes('music') || tag.includes('write')) return 'deep';
  if (tag.includes('work') || tag.includes('career') || tag.includes('business')) return 'pro';
  if (source === 'push') return 'free';
  return 'real';
}

function getItemArea(item: CardItem, areas: LifeArea[], source: MissionSource): LifeArea | null {
  if (source === 'current') {
    try {
      const linked = localStorage.getItem(OBJECTIVE_AREA_KEY);
      return areas.find((area) => area.id === linked) ?? null;
    } catch {
      return null;
    }
  }
  return (
    areas.find((area) => area.id === item.tag?.categoryId) ??
    areas.find((area) => area.name === item.tag?.name) ??
    null
  );
}

function buildCurrentMission(areas: LifeArea[]): MissionViewItem | null {
  const text = typeof window === 'undefined' ? '' : (localStorage.getItem(OBJECTIVE_KEY) ?? '');
  if (!text.trim()) return null;
  const area = getItemArea({ id: 'current', text, done: false }, areas, 'current');
  return {
    id: 'current',
    text,
    done: localStorage.getItem(OBJECTIVE_DONE_KEY) === 'true',
    timeFrame: localStorage.getItem(OBJECTIVE_TF_KEY) ?? undefined,
    blockingLog: readJson<string[]>(OBJECTIVE_BLOCKING_KEY, []),
    flowingLog: readJson<string[]>(OBJECTIVE_FLOWING_KEY, []),
    subtasks: readJson<Subtask[]>(OBJECTIVE_SUBTASKS_KEY, []),
    ideas: readJson<string[]>(OBJECTIVE_IDEAS_KEY, []),
    tag: area ? { name: area.name, color: area.color, categoryId: area.id } : undefined,
    source: 'current',
    kind: getKind({ id: 'current' }, 'current'),
  };
}

function persistItems(source: 'daily' | 'push', items: CardItem[]) {
  const key = source === 'daily' ? MISSIONS_KEY : PUSH_KEY;
  localStorage.setItem(key, JSON.stringify(items));
  syncPref(key, items);
  window.dispatchEvent(new Event('colourmap:missions-updated'));
}

function setItemKind(item: MissionViewItem, kind: MissionKind) {
  if (item.source === 'current') localStorage.setItem(OBJECTIVE_KIND_KEY, kind);
  else localStorage.setItem(`${MISSION_KIND_PREFIX}${item.id}`, kind);
  window.dispatchEvent(new Event('colourmap:missions-updated'));
}

function setItemArea(item: MissionViewItem, area: LifeArea | null) {
  if (item.source === 'current') {
    if (area) localStorage.setItem(OBJECTIVE_AREA_KEY, area.id);
    else localStorage.removeItem(OBJECTIVE_AREA_KEY);
    window.dispatchEvent(new Event('colourmap:missions-updated'));
    return;
  }
  const key = item.source === 'daily' ? MISSIONS_KEY : PUSH_KEY;
  const items = readJson<CardItem[]>(key, []);
  const next = items.map((candidate) =>
    candidate.id === item.id
      ? {
          ...candidate,
          tag: area ? { name: area.name, color: area.color, categoryId: area.id } : undefined,
        }
      : candidate,
  );
  persistItems(item.source, next);
}

function setItemDone(item: MissionViewItem, done: boolean) {
  if (item.source === 'current') {
    localStorage.setItem(OBJECTIVE_DONE_KEY, String(done));
    window.dispatchEvent(new Event('colourmap:missions-updated'));
    return;
  }
  const key = item.source === 'daily' ? MISSIONS_KEY : PUSH_KEY;
  const items = readJson<CardItem[]>(key, []);
  persistItems(
    item.source,
    items.map((candidate) => (candidate.id === item.id ? { ...candidate, done } : candidate)),
  );
}

function addMission(text: string, kind: MissionKind) {
  const items = readJson<CardItem[]>(MISSIONS_KEY, []);
  const next = [
    ...items,
    {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    },
  ];
  persistItems('daily', next);
  const created = next.at(-1);
  if (created) setItemKind({ ...created, source: 'daily', kind }, kind);
}

function latest(items?: string[]) {
  return items?.findLast((item) => item.trim()) ?? '';
}

function MissionDesignPill({
  value,
  onChange,
}: {
  value: MissionFormat;
  onChange: (format: MissionFormat) => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 4px' }}>
      <div
        style={{
          display: 'inline-flex',
          border: `1px solid ${LINE}`,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.03)',
          padding: 3,
          gap: 3,
        }}
      >
        {(
          [
            ['one', 'Format 1'],
            ['two', 'Format 2'],
          ] as const
        ).map(([format, label]) => {
          const active = value === format;
          return (
            <button
              key={format}
              type="button"
              onClick={() => onChange(format)}
              style={{
                border: 0,
                borderRadius: 999,
                padding: '6px 14px',
                background: active ? 'rgba(196,160,96,0.18)' : 'transparent',
                color: active ? BROWN : MUTED,
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: active ? 800 : 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MissionCapture() {
  const [text, setText] = useState('');
  const [kind, setKind] = useState<MissionKind>('free');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    addMission(value, kind);
    setText('');
  }

  return (
    <form
      onSubmit={submit}
      style={{
        border: `1px solid ${LINE}`,
        background: PAPER,
        borderRadius: 8,
        padding: 10,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="drop a mission, worry, task, or plan..."
          style={{
            flex: 1,
            minWidth: 0,
            border: `1px solid ${LINE_SOFT}`,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            color: BROWN,
            outline: 'none',
            padding: '9px 10px',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            border: `1px solid ${KIND_META[kind].color}55`,
            borderRadius: 6,
            background: text.trim() ? `${KIND_META[kind].color}1f` : 'transparent',
            color: text.trim() ? BROWN : MUTED,
            padding: '0 14px',
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: text.trim() ? 'pointer' : 'default',
            opacity: text.trim() ? 1 : 0.45,
          }}
        >
          Add
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 1 }}>
        {(Object.keys(KIND_META) as MissionKind[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            style={{
              border: `1px solid ${KIND_META[id].color}${kind === id ? '80' : '2a'}`,
              borderRadius: 999,
              background: kind === id ? `${KIND_META[id].color}18` : 'transparent',
              color: kind === id ? BROWN : MUTED,
              padding: '4px 9px',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {KIND_META[id].label}
          </button>
        ))}
      </div>
    </form>
  );
}

function MissionRow({ item, areas }: { item: MissionViewItem; areas: LifeArea[] }) {
  const [areaOpen, setAreaOpen] = useState(false);
  const [kindOpen, setKindOpen] = useState(false);
  const area = item.tag
    ? (areas.find((candidate) => candidate.id === item.tag?.categoryId) ?? {
        id: item.tag.categoryId ?? item.tag.name,
        name: item.tag.name,
        color: item.tag.color,
      })
    : null;
  const subtasks = item.subtasks ?? [];
  const completedSubs = subtasks.filter((subtask) => subtask.done).length;
  const blocker = latest(item.blockingLog);
  const flow = latest(item.flowingLog);

  return (
    <div
      style={{
        border: `1px solid ${item.done ? 'rgba(122,84,56,0.1)' : `${KIND_META[item.kind].color}30`}`,
        borderLeft: `4px solid ${KIND_META[item.kind].color}`,
        borderRadius: 8,
        background: item.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.045)',
        padding: 10,
        opacity: item.done ? 0.55 : 1,
      }}
    >
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <button
          type="button"
          aria-label={item.done ? `Reopen ${item.text}` : `Complete ${item.text}`}
          onClick={() => setItemDone(item, !item.done)}
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `1.5px solid ${KIND_META[item.kind].color}`,
            background: item.done ? KIND_META[item.kind].color : 'transparent',
            color: '#fff',
            flexShrink: 0,
            cursor: 'pointer',
            marginTop: 1,
          }}
        >
          {item.done ? '✓' : ''}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: BROWN,
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              fontWeight: 800,
              lineHeight: 1.25,
              textDecoration: item.done ? 'line-through' : 'none',
              overflowWrap: 'anywhere',
            }}
          >
            {item.text}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              marginTop: 7,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                border: `1px solid ${KIND_META[item.kind].color}42`,
                borderRadius: 999,
                color: KIND_META[item.kind].color,
                padding: '2px 7px',
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
              }}
            >
              {item.source === 'current' ? 'Current' : item.source === 'push' ? 'Later' : 'Today'}
            </span>
            <button
              type="button"
              onClick={() => setKindOpen((open) => !open)}
              style={{
                border: `1px solid ${KIND_META[item.kind].color}30`,
                borderRadius: 999,
                background: `${KIND_META[item.kind].color}0f`,
                color: MUTED,
                padding: '2px 7px',
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              {KIND_META[item.kind].label}
            </button>
            <button
              type="button"
              onClick={() => setAreaOpen((open) => !open)}
              style={{
                border: `1px solid ${area ? `${area.color}42` : LINE_SOFT}`,
                borderRadius: 999,
                background: area ? `${area.color}10` : 'transparent',
                color: area ? area.color : MUTED,
                padding: '2px 7px',
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              {area ? area.name : '+ area'}
            </button>
            {subtasks.length > 0 && (
              <span style={{ color: MUTED, fontFamily: 'var(--font-serif)', fontSize: 10 }}>
                {completedSubs}/{subtasks.length} steps
              </span>
            )}
          </div>
          {(kindOpen || areaOpen) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
              {kindOpen &&
                (Object.keys(KIND_META) as MissionKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      setItemKind(item, kind);
                      setKindOpen(false);
                    }}
                    style={{
                      border: `1px solid ${KIND_META[kind].color}40`,
                      borderRadius: 999,
                      background: kind === item.kind ? `${KIND_META[kind].color}18` : 'transparent',
                      color: KIND_META[kind].color,
                      padding: '2px 7px',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {KIND_META[kind].label}
                  </button>
                ))}
              {areaOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setItemArea(item, null);
                    setAreaOpen(false);
                  }}
                  style={{
                    border: `1px solid ${LINE_SOFT}`,
                    borderRadius: 999,
                    background: 'transparent',
                    color: MUTED,
                    padding: '2px 7px',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                >
                  Unsorted
                </button>
              )}
              {areaOpen &&
                areas.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => {
                      setItemArea(item, candidate);
                      setAreaOpen(false);
                    }}
                    style={{
                      border: `1px solid ${candidate.color}42`,
                      borderRadius: 999,
                      background:
                        candidate.id === area?.id ? `${candidate.color}18` : 'transparent',
                      color: candidate.color,
                      padding: '2px 7px',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {candidate.name}
                  </button>
                ))}
            </div>
          )}
          {(blocker || flow) && (
            <div
              style={{
                display: 'grid',
                gap: 4,
                marginTop: 8,
                color: MUTED,
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                lineHeight: 1.35,
              }}
            >
              {blocker && <span>Blocker: {blocker}</span>}
              {flow && <span>Flow: {flow}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MissionZone({
  title,
  detail,
  color,
  items,
  areas,
}: {
  title: string;
  detail: string;
  color: string;
  items: MissionViewItem[];
  areas: LifeArea[];
}) {
  return (
    <section
      style={{
        border: `1px solid ${LINE}`,
        borderRadius: 8,
        background: PAPER,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${LINE_SOFT}`,
          padding: '9px 10px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          alignItems: 'baseline',
        }}
      >
        <div>
          <div
            style={{
              color,
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
          <div
            style={{ color: MUTED, fontFamily: 'var(--font-serif)', fontSize: 10, opacity: 0.72 }}
          >
            {detail}
          </div>
        </div>
        <span style={{ color: MUTED, fontFamily: 'var(--font-serif)', fontSize: 11 }}>
          {items.length}
        </span>
      </div>
      <div style={{ display: 'grid', gap: 8, padding: 10 }}>
        {items.length === 0 ? (
          <div
            style={{
              color: MUTED,
              opacity: 0.45,
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              fontStyle: 'italic',
              padding: '8px 2px',
            }}
          >
            empty
          </div>
        ) : (
          items.map((item) => (
            <MissionRow key={`${item.source}-${item.id}`} item={item} areas={areas} />
          ))
        )}
      </div>
    </section>
  );
}

function MissionControlFormatTwo() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    function refresh() {
      setVersion((value) => value + 1);
    }
    window.addEventListener('storage', refresh);
    window.addEventListener('colourmap:missions-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('colourmap:missions-updated', refresh);
    };
  }, []);

  const { areas, active, done, byKind, byArea } = useMemo(() => {
    void version;
    const nextAreas = loadLifeAreas();
    const current = buildCurrentMission(nextAreas);
    const daily = readJson<CardItem[]>(MISSIONS_KEY, []).map((item) => ({
      ...item,
      source: 'daily' as const,
      kind: getKind(item, 'daily'),
    }));
    const push = readJson<CardItem[]>(PUSH_KEY, []).map((item) => ({
      ...item,
      source: 'push' as const,
      kind: getKind(item, 'push'),
    }));
    const all: MissionViewItem[] = [...(current ? [current] : []), ...daily, ...push];
    const nextActive = all.filter((item) => !item.done);
    const nextDone = all.filter((item) => item.done);
    const groupedByKind = {} as Record<MissionKind, MissionViewItem[]>;
    for (const kind of Object.keys(KIND_META) as MissionKind[]) {
      groupedByKind[kind] = nextActive.filter((item) => item.kind === kind);
    }
    const groupedByArea = nextAreas.map((area) => ({
      area,
      items: nextActive.filter((item) => getItemArea(item, nextAreas, item.source)?.id === area.id),
    }));
    return {
      areas: nextAreas,
      active: nextActive,
      done: nextDone,
      byKind: groupedByKind,
      byArea: groupedByArea,
    };
  }, [version]);

  const today = active.filter((item) => item.source === 'current' || item.source === 'daily');
  const later = active.filter((item) => item.source === 'push');
  const unsorted = active.filter((item) => !getItemArea(item, areas, item.source));

  return (
    <div style={{ display: 'grid', gap: 12, paddingBottom: 32 }}>
      <section
        style={{
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(196,160,96,0.12), rgba(255,255,255,0.03))',
          padding: 12,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'start',
          }}
        >
          <div>
            <div
              style={{
                color: BROWN,
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Mission Control
            </div>
            <div
              style={{
                color: MUTED,
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                lineHeight: 1.4,
                marginTop: 3,
              }}
            >
              Capture first. Then sort by area and by work type.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {[
              ['Today', today.length],
              ['Later', later.length],
              ['Areas', byArea.filter((group) => group.items.length > 0).length],
              ['Done', done.length],
            ].map(([label, count]) => (
              <div
                key={label}
                style={{
                  border: `1px solid ${LINE_SOFT}`,
                  borderRadius: 6,
                  padding: '5px 7px',
                  minWidth: 44,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: BROWN,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    color: MUTED,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MissionCapture />

      <MissionZone
        title="Today lane"
        detail="The few items in the active operating lane."
        color={OCHRE}
        items={today}
        areas={areas}
      />

      <section
        style={{
          border: `1px solid ${LINE}`,
          borderRadius: 8,
          background: PAPER,
          padding: 10,
        }}
      >
        <div
          style={{
            color: BROWN,
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Life Areas
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {byArea.map(({ area, items }) => (
            <div
              key={area.id}
              style={{
                border: `1px solid ${items.length > 0 ? `${area.color}35` : LINE_SOFT}`,
                borderRadius: 7,
                padding: 8,
                background: items.length > 0 ? `${area.color}08` : 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span
                  style={{
                    color: area.color,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {area.name}
                </span>
                <span style={{ color: MUTED, fontFamily: 'var(--font-serif)', fontSize: 11 }}>
                  {items.length}
                </span>
              </div>
              {items.length > 0 && (
                <div style={{ display: 'grid', gap: 6, marginTop: 7 }}>
                  {items.slice(0, 3).map((item) => (
                    <MissionRow
                      key={`area-${area.id}-${item.source}-${item.id}`}
                      item={item}
                      areas={areas}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {unsorted.length > 0 && (
            <div style={{ border: `1px dashed ${LINE}`, borderRadius: 7, padding: 8 }}>
              <div
                style={{
                  color: MUTED,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                Unsorted
              </div>
              <div style={{ display: 'grid', gap: 6, marginTop: 7 }}>
                {unsorted.map((item) => (
                  <MissionRow
                    key={`unsorted-${item.source}-${item.id}`}
                    item={item}
                    areas={areas}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 10,
        }}
      >
        {(Object.keys(KIND_META) as MissionKind[]).map((kind) => (
          <MissionZone
            key={kind}
            title={KIND_META[kind].label}
            detail={KIND_META[kind].note}
            color={KIND_META[kind].color}
            items={byKind[kind]}
            areas={areas}
          />
        ))}
      </div>
    </div>
  );
}

export default function MissionDesignSwitcher() {
  const [format, setFormat] = useState<MissionFormat>('one');

  useEffect(() => {
    const stored = localStorage.getItem(FORMAT_KEY);
    if (stored === 'one' || stored === 'two') setFormat(stored);
  }, []);

  function changeFormat(next: MissionFormat) {
    setFormat(next);
    localStorage.setItem(FORMAT_KEY, next);
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <MissionDesignPill value={format} onChange={changeFormat} />
      {format === 'one' ? <DoingCardsPanel /> : <MissionControlFormatTwo />}
    </div>
  );
}
