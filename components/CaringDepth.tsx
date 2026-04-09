'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARING DEPTH — Full System
   Three tabs: MAP · WORK · WEATHER
   MAP: colour pills, connections, packs, triangle wheel +
        alternative views (constellation, losange, mandala)
   WORK: focus on one pattern, daily prompts, journal
   WEATHER: inner climate from your patterns
   ═══════════════════════════════════════════════════════════ */

/* ─── Storage keys ─── */
const PILLS_KEY = 'colourmap:pattern-pills';
const CONN_KEY = 'colourmap:pattern-connections';
const PACKS_KEY = 'colourmap:pattern-packs';
const FOCUS_KEY = 'colourmap:pattern-focus';
const VIEW_KEY = 'colourmap:caring-depth-view';
const WEATHER_KEY = 'colourmap:inner-weather';

/* ─── Types ─── */
interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  intensity: number;
  locked: boolean;
  createdAt: string;
  history: { date: string; intensity: number }[];
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  kind: 'triggers' | 'strengthens' | 'weakens' | 'balances';
}

interface Pack {
  id: string;
  name: string;
  type: 'shadow' | 'strength' | 'growth-edge';
  pillIds: string[];
}

interface WorkFocus {
  pillId: string;
  startDate: string;
  reflections: { date: string; text: string }[];
}

interface WeatherEntry {
  id: string;
  name: string;
  kind: 'storm' | 'rain' | 'fog' | 'breeze' | 'sun';
  intensity: number;
  lastSeen: string;
}

type ViewMode = 'wheel' | 'constellation' | 'losange' | 'mandala';

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
const CONN_KINDS: Connection['kind'][] = ['triggers', 'strengthens', 'weakens', 'balances'];
const CONN_COLORS: Record<string, string> = {
  triggers: '#D4605A',
  strengthens: '#7A9A7A',
  weakens: '#6890B0',
  balances: '#C4A060',
};
const PACK_TYPES: Pack['type'][] = ['shadow', 'strength', 'growth-edge'];
const PACK_COLORS: Record<string, string> = {
  shadow: '#6890B0',
  strength: '#D4805A',
  'growth-edge': '#9B6BA0',
};

/* ─── Prompts ─── */
const PROMPTS_S: Record<string, string[]> = {
  Courage: [
    'Where did courage show up today?',
    "What would you do if you weren't afraid?",
    'Name a moment courage surprised you.',
  ],
  Empathy: [
    'Who needed your understanding today?',
    'When did you feel deeply seen?',
    'How does empathy serve you?',
  ],
  Discipline: [
    'What did you follow through on today?',
    'Where does discipline feel like freedom?',
    'What habit is building your future?',
  ],
  _default: [
    'Where did this strength show up today?',
    'How could you use this strength more?',
    'What would it look like to lead with this?',
  ],
};
const PROMPTS_W: Record<string, string[]> = {
  Overthinking: [
    'What are you overthinking right now? Write it once and stop.',
    'What would you do if you trusted your gut?',
    'Name the fear behind the thinking.',
  ],
  Avoidance: [
    'What did you avoid today?',
    'What would happen if you faced it?',
    'What emotion is underneath the avoidance?',
  ],
  'Self-doubt': [
    'What evidence contradicts the doubt?',
    'What would you say to a friend with this doubt?',
    'Name one thing you did well today.',
  ],
  _default: [
    'When does this pattern show up most?',
    'What would it look like to manage this?',
    'Name one small step you could take.',
  ],
};

/* ─── Weather ─── */
const WK = ['storm', 'rain', 'fog', 'breeze', 'sun'] as const;
type WKind = (typeof WK)[number];
const WM: Record<
  string,
  { emoji: string; color: string; grad: [string, string]; skyT: string; skyB: string }
> = {
  storm: {
    emoji: '⛈',
    color: '#8B5E3C',
    grad: ['#6B4830', '#A0784C'],
    skyT: '#5A4030',
    skyB: '#9A7858',
  },
  rain: {
    emoji: '🌧',
    color: '#4A7898',
    grad: ['#3A6080', '#78B0D8'],
    skyT: '#3A5A78',
    skyB: '#88B8D8',
  },
  fog: {
    emoji: '🌫',
    color: '#8A7A60',
    grad: ['#7A6A50', '#B8A880'],
    skyT: '#9A8A70',
    skyB: '#C8B890',
  },
  breeze: {
    emoji: '🍃',
    color: '#4A8A5A',
    grad: ['#3A7A4A', '#80C880'],
    skyT: '#4A8058',
    skyB: '#A0D8A0',
  },
  sun: {
    emoji: '☀',
    color: '#C49030',
    grad: ['#D07030', '#E8C840'],
    skyT: '#D08840',
    skyB: '#F0D870',
  },
};
const WS: Record<string, string[]> = {
  storm: ['Anger', 'Overwhelm', 'Frustration', 'Panic'],
  rain: ['Sadness', 'Grief', 'Loneliness', 'Nostalgia'],
  fog: ['Confusion', 'Numbness', 'Avoidance', 'Fatigue'],
  breeze: ['Calm', 'Hope', 'Acceptance', 'Curiosity'],
  sun: ['Joy', 'Gratitude', 'Confidence', 'Love'],
};

/* ─── Storage ─── */
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

/* ═══ MAIN ═══ */
export default function CaringDepth() {
  const [tab, setTab] = useState<'map' | 'work' | 'weather'>('map');
  const [pills, setPills] = useState<PatternPill[]>([]);
  const [conns, setConns] = useState<Connection[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [focus, setFocus] = useState<WorkFocus | null>(null);
  const [weather, setWeather] = useState<WeatherEntry[]>([]);
  const [view, setView] = useState<ViewMode>('wheel');

  useEffect(() => {
    setPills(ls(PILLS_KEY, []));
    setConns(ls(CONN_KEY, []));
    setPacks(ls(PACKS_KEY, []));
    setFocus(ls(FOCUS_KEY, null));
    setWeather(ls(WEATHER_KEY, []));
    setView(ls(VIEW_KEY, 'wheel'));
  }, []);

  const up = useCallback(<T,>(key: string, val: T, setter: (v: T) => void) => {
    setter(val);
    ss(key, val);
  }, []);

  const strengths = pills.filter((p) => p.type === 'strength');
  const weaknesses = pills.filter((p) => p.type === 'weakness');
  const balance =
    pills.length > 0
      ? Math.round(
          ((strengths.reduce((s, p) => s + p.intensity, 0) -
            weaknesses.reduce((s, p) => s + p.intensity, 0) +
            pills.length * 5) /
            (pills.length * 10)) *
            100,
        )
      : 50;

  const hasFocus = focus && pills.some((p) => p.id === focus.pillId);

  return (
    <div
      className="space-y-3 rounded-3xl border border-[#8A6A4A50] px-5 py-5"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Tabs */}
      <div className="flex gap-1">
        {[
          { id: 'map' as const, label: 'Map', color: '#C4A060' },
          { id: 'work' as const, label: hasFocus ? '⚡ Work' : 'Work', color: '#D4805A' },
          { id: 'weather' as const, label: 'Weather', color: '#4A8A5A' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 cursor-pointer rounded-lg py-1.5 text-center uppercase tracking-[0.15em] transition-all duration-200"
            style={{
              background: tab === t.id ? `${t.color}12` : 'transparent',
              border: `1.5px solid ${tab === t.id ? `${t.color}40` : `${t.color}15`}`,
              color: t.color,
              fontFamily: 'var(--font-serif)',
              fontSize: '9px',
              fontWeight: 600,
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
          conns={conns}
          setConns={(v) => up(CONN_KEY, v, setConns)}
          packs={packs}
          setPacks={(v) => up(PACKS_KEY, v, setPacks)}
          strengths={strengths}
          weaknesses={weaknesses}
          balance={balance}
          view={view}
          setView={(v) => {
            setView(v);
            ss(VIEW_KEY, v);
          }}
        />
      )}
      {tab === 'work' && (
        <WorkTab pills={pills} focus={focus} setFocus={(v) => up(FOCUS_KEY, v, setFocus)} />
      )}
      {tab === 'weather' && (
        <WeatherTab weather={weather} setWeather={(v) => up(WEATHER_KEY, v, setWeather)} />
      )}
    </div>
  );
}

/* ═══ MAP TAB ═══ */
function MapTab({
  pills,
  setPills,
  conns,
  setConns,
  packs,
  setPacks,
  strengths,
  weaknesses,
  balance,
  view,
  setView,
}: {
  pills: PatternPill[];
  setPills: (p: PatternPill[]) => void;
  conns: Connection[];
  setConns: (c: Connection[]) => void;
  packs: Pack[];
  setPacks: (p: Pack[]) => void;
  strengths: PatternPill[];
  weaknesses: PatternPill[];
  balance: number;
  view: ViewMode;
  setView: (v: ViewMode) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<'strength' | 'weakness' | null>(null);
  const [input, setInput] = useState('');
  const [linking, setLinking] = useState<{ fromId: string } | null>(null);
  const [addingPack, setAddingPack] = useState(false);
  const [packName, setPackName] = useState('');
  const [packType, setPackType] = useState<Pack['type']>('shadow');
  const [packPills, setPackPills] = useState<string[]>([]);

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
        intensity: 3,
        locked: false,
        createdAt: new Date().toISOString(),
        history: [],
      },
    ]);
    setInput('');
    setAddingType(null);
  };

  const ratePill = (id: string, intensity: number) =>
    setPills(pills.map((p) => (p.id === id ? { ...p, intensity } : p)));
  const lockPill = (id: string) =>
    setPills(pills.map((p) => (p.id === id ? { ...p, locked: !p.locked } : p)));
  const removePill = (id: string) => {
    setPills(pills.filter((p) => p.id !== id));
    setConns(conns.filter((c) => c.fromId !== id && c.toId !== id));
    if (activeId === id) setActiveId(null);
  };

  const addConn = (toId: string, kind: Connection['kind']) => {
    if (!linking || linking.fromId === toId) return;
    if (
      conns.some(
        (c) =>
          (c.fromId === linking.fromId && c.toId === toId) ||
          (c.fromId === toId && c.toId === linking.fromId),
      )
    ) {
      setLinking(null);
      return;
    }
    setConns([...conns, { id: crypto.randomUUID(), fromId: linking.fromId, toId, kind }]);
    setLinking(null);
  };

  const removeConn = (id: string) => setConns(conns.filter((c) => c.id !== id));

  const createPack = () => {
    if (!packName.trim() || packPills.length < 2) return;
    setPacks([
      ...packs,
      { id: crypto.randomUUID(), name: packName.trim(), type: packType, pillIds: packPills },
    ]);
    setPackName('');
    setPackPills([]);
    setAddingPack(false);
  };

  const removePack = (id: string) => setPacks(packs.filter((p) => p.id !== id));

  const n = pills.length;
  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 85;

  // Pill angle helper
  const pillAngle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const pillPos = (pill: PatternPill) => {
    const i = pills.indexOf(pill);
    const a = pillAngle(i);
    const r = maxR * (pill.intensity / 5);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), a, r };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: '#C4A060' }}
        >
          Strengths & Weaknesses
        </p>
        {/* View switcher */}
        <div className="flex gap-0.5">
          {(['wheel', 'constellation', 'losange', 'mandala'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="cursor-pointer rounded px-1.5 py-0.5 text-[7px] uppercase tracking-wider transition-all"
              style={{
                background: view === v ? '#C4A06015' : 'transparent',
                border: `1px solid ${view === v ? '#C4A06030' : '#C4A06010'}`,
                color: '#C4A060',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: view === v ? 700 : 400,
              }}
            >
              {v === 'wheel' ? '△' : v === 'constellation' ? '✦' : v === 'losange' ? '◇' : '✿'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── VISUALIZATIONS ─── */}
      {n >= 3 && (
        <div className="flex justify-center">
          <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
            {/* Background rings */}
            {[0.33, 0.66, 1].map((r) => (
              <circle
                key={r}
                cx={cx}
                cy={cy}
                r={maxR * r}
                fill="none"
                stroke="#C4B890"
                strokeWidth="0.3"
                opacity="0.08"
              />
            ))}

            {/* Connection arcs */}
            {conns.map((c) => {
              const from = pills.find((p) => p.id === c.fromId);
              const to = pills.find((p) => p.id === c.toId);
              if (!from || !to) return null;
              const fp = pillPos(from);
              const tp = pillPos(to);
              const midX = (fp.x + tp.x) / 2 + (fp.y - tp.y) * 0.2;
              const midY = (fp.y + tp.y) / 2 + (tp.x - fp.x) * 0.2;
              return (
                <path
                  key={c.id}
                  d={`M ${fp.x} ${fp.y} Q ${midX} ${midY} ${tp.x} ${tp.y}`}
                  fill="none"
                  stroke={CONN_COLORS[c.kind]}
                  strokeWidth="1"
                  opacity="0.25"
                  strokeDasharray={c.kind === 'weakens' ? '3 2' : undefined}
                />
              );
            })}

            {view === 'wheel' &&
              pills.map((pill, i) => {
                const a = pillAngle(i);
                const tipR = maxR * (pill.intensity / 5);
                const innerR = tipR * 0.22;
                const spread = Math.min(0.35, Math.PI / n);
                const tipX = cx + tipR * Math.cos(a);
                const tipY = cy + tipR * Math.sin(a);
                const sX1 = cx + innerR * Math.cos(a - spread);
                const sY1 = cy + innerR * Math.sin(a - spread);
                const sX2 = cx + innerR * Math.cos(a + spread);
                const sY2 = cy + innerR * Math.sin(a + spread);
                const isActive = activeId === pill.id;
                const isLinkSource = linking?.fromId === pill.id;
                return (
                  <g
                    key={pill.id}
                    className="cursor-pointer"
                    onClick={() =>
                      linking
                        ? addConn(pill.id, 'triggers')
                        : setActiveId(isActive ? null : pill.id)
                    }
                  >
                    <polygon
                      points={`${cx},${cy} ${sX1},${sY1} ${tipX},${tipY} ${sX2},${sY2}`}
                      fill={pill.color}
                      opacity={
                        isActive ? 0.75 : isLinkSource ? 0.6 : 0.2 + (pill.intensity / 5) * 0.25
                      }
                      className="transition-all duration-500"
                      style={{
                        filter: isActive ? `drop-shadow(0 0 8px ${pill.color}50)` : undefined,
                      }}
                    />
                    <circle
                      cx={tipX}
                      cy={tipY}
                      r={isActive ? 5 : 3}
                      fill={pill.color}
                      opacity={isActive ? 0.9 : 0.7}
                    />
                    {pill.locked && (
                      <circle
                        cx={tipX}
                        cy={tipY}
                        r={6}
                        fill="none"
                        stroke={pill.color}
                        strokeWidth="1"
                        opacity="0.4"
                      />
                    )}
                    <text
                      x={cx + (maxR + 16) * Math.cos(a)}
                      y={cy + (maxR + 16) * Math.sin(a)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: isActive ? '10px' : '8px',
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: isActive ? 700 : 500,
                        fill: pill.color,
                        opacity: isActive ? 1 : 0.7,
                      }}
                    >
                      {pill.name}
                    </text>
                  </g>
                );
              })}

            {view === 'constellation' &&
              pills.map((pill, i) => {
                const a = pillAngle(i);
                const dist = maxR * (1 - (pill.intensity - 1) / 4);
                const x = cx + dist * Math.cos(a);
                const y = cy + dist * Math.sin(a);
                const isActive = activeId === pill.id;
                const r = 4 + pill.intensity * 2;
                return (
                  <g
                    key={pill.id}
                    className="cursor-pointer"
                    onClick={() =>
                      linking
                        ? addConn(pill.id, 'triggers')
                        : setActiveId(isActive ? null : pill.id)
                    }
                  >
                    <circle cx={x} cy={y} r={r + 6} fill={pill.color} opacity="0.06" />
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill={pill.color}
                      opacity={isActive ? 0.8 : 0.3 + pill.intensity * 0.08}
                      style={{
                        filter: isActive ? `drop-shadow(0 0 6px ${pill.color}40)` : undefined,
                      }}
                    />
                    {pill.locked && (
                      <circle
                        cx={x}
                        cy={y}
                        r={r + 3}
                        fill="none"
                        stroke={pill.color}
                        strokeWidth="0.8"
                        opacity="0.3"
                      />
                    )}
                    <text
                      x={x}
                      y={y + r + 10}
                      textAnchor="middle"
                      style={{
                        fontSize: isActive ? '9px' : '7px',
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: isActive ? 700 : 500,
                        fill: pill.color,
                        opacity: 0.7,
                      }}
                    >
                      {pill.name}
                    </text>
                  </g>
                );
              })}

            {view === 'losange' &&
              (() => {
                const corners = [
                  { dx: 0, dy: -maxR },
                  { dx: maxR, dy: 0 },
                  { dx: 0, dy: maxR },
                  { dx: -maxR, dy: 0 },
                ];
                const labels = ['Growing', 'Stable', 'Working on', 'Dormant'];
                const lColors = ['#7A9A7A', '#C4A060', '#D4805A', '#9A8A70'];
                return (
                  <>
                    {corners.map((c, i) => {
                      const next = corners[(i + 1) % 4];
                      return (
                        <g key={labels[i]}>
                          <polygon
                            points={`${cx},${cy} ${cx + c.dx},${cy + c.dy} ${cx + next.dx},${cy + next.dy}`}
                            fill={lColors[i]}
                            opacity="0.06"
                          />
                          <text
                            x={cx + c.dx * 0.55}
                            y={cy + c.dy * 0.55}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                              fontSize: '7px',
                              fontFamily: 'var(--font-handwritten)',
                              fill: lColors[i],
                              opacity: 0.4,
                              fontWeight: 600,
                            }}
                          >
                            {labels[i]}
                          </text>
                        </g>
                      );
                    })}
                    {pills.map((pill) => {
                      const quad = pill.locked
                        ? pill.type === 'strength'
                          ? 1
                          : 2
                        : pill.type === 'strength'
                          ? 0
                          : 3;
                      const corner = corners[quad];
                      const nextC = corners[(quad + 1) % 4];
                      const t = 0.3 + (pill.intensity / 5) * 0.4;
                      const x = cx + corner.dx * t + (nextC.dx - corner.dx) * t * 0.3;
                      const y = cy + corner.dy * t + (nextC.dy - corner.dy) * t * 0.3;
                      const isActive = activeId === pill.id;
                      return (
                        <g
                          key={pill.id}
                          className="cursor-pointer"
                          onClick={() =>
                            linking
                              ? addConn(pill.id, 'triggers')
                              : setActiveId(isActive ? null : pill.id)
                          }
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={isActive ? 6 : 4}
                            fill={pill.color}
                            opacity={isActive ? 0.8 : 0.5}
                          />
                          <text
                            x={x}
                            y={y + 10}
                            textAnchor="middle"
                            style={{
                              fontSize: '7px',
                              fontFamily: 'var(--font-handwritten)',
                              fill: pill.color,
                              fontWeight: isActive ? 700 : 500,
                              opacity: 0.7,
                            }}
                          >
                            {pill.name}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}

            {view === 'mandala' &&
              (() => {
                const groups =
                  packs.length > 0
                    ? packs
                    : [
                        {
                          id: 's',
                          name: 'Strengths',
                          type: 'strength' as const,
                          pillIds: strengths.map((p) => p.id),
                        },
                        {
                          id: 'w',
                          name: 'Weaknesses',
                          type: 'shadow' as const,
                          pillIds: weaknesses.map((p) => p.id),
                        },
                      ];
                const gn = groups.length;
                return groups.map((g, gi) => {
                  const gColor = PACK_COLORS[g.type] || '#C4A060';
                  const a = (gi / gn) * Math.PI * 2 - Math.PI / 2;
                  const tipR = 65;
                  const pa = a + Math.PI / 2;
                  const sp = 18;
                  const c1x = cx + 20 * Math.cos(a) + sp * Math.cos(pa);
                  const c1y = cy + 20 * Math.sin(a) + sp * Math.sin(pa);
                  const c2x = cx + 20 * Math.cos(a) - sp * Math.cos(pa);
                  const c2y = cy + 20 * Math.sin(a) - sp * Math.sin(pa);
                  const avgI =
                    g.pillIds.length > 0
                      ? pills
                          .filter((p) => g.pillIds.includes(p.id))
                          .reduce((s, p) => s + p.intensity, 0) / g.pillIds.length
                      : 3;
                  const petalR = tipR * (avgI / 5);
                  return (
                    <g key={g.id}>
                      <path
                        d={`M ${cx} ${cy} Q ${c1x} ${c1y} ${cx + petalR * Math.cos(a)} ${cy + petalR * Math.sin(a)} Q ${c2x} ${c2y} ${cx} ${cy} Z`}
                        fill={gColor}
                        opacity="0.2"
                        className="transition-all duration-500"
                      />
                      <text
                        x={cx + (petalR + 14) * Math.cos(a)}
                        y={cy + (petalR + 14) * Math.sin(a)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: '8px',
                          fontFamily: 'var(--font-handwritten)',
                          fontWeight: 600,
                          fill: gColor,
                          opacity: 0.7,
                        }}
                      >
                        {g.name}
                      </text>
                    </g>
                  );
                });
              })()}

            {/* Center */}
            <circle cx={cx} cy={cy} r={14} fill="#C4A060" opacity="0.06" />
            <text
              x={cx}
              y={cy + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '14px',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 700,
                fill: '#B8905A',
                opacity: 0.5,
              }}
            >
              {balance}
            </text>
            <text
              x={cx}
              y={cy + 13}
              textAnchor="middle"
              style={{
                fontSize: '6px',
                fontFamily: 'var(--font-handwritten)',
                fill: '#B8905A',
                opacity: 0.3,
              }}
            >
              balance
            </text>
          </svg>
        </div>
      )}

      {/* Linking mode banner */}
      {linking && (
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2"
          style={{ background: '#D4605A10', border: '1px solid #D4605A25' }}
        >
          <span
            className="text-[10px]"
            style={{ color: '#D4605A', fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
          >
            Tap another pill to connect to {pills.find((p) => p.id === linking.fromId)?.name}
          </span>
          <button
            type="button"
            onClick={() => setLinking(null)}
            className="cursor-pointer text-[9px]"
            style={{ color: '#D4605A', opacity: 0.5, background: 'none', border: 'none' }}
          >
            cancel
          </button>
        </div>
      )}

      {/* Active pill detail */}
      {activeId &&
        !linking &&
        (() => {
          const pill = pills.find((p) => p.id === activeId);
          if (!pill) return null;
          const pillConns = conns.filter((c) => c.fromId === pill.id || c.toId === pill.id);
          const pillPacks = packs.filter((pk) => pk.pillIds.includes(pill.id));
          // Sparkline
          const hist = pill.history || [];
          return (
            <div className="mx-auto max-w-[300px] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: pill.color, opacity: 0.7 }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: pill.color, fontFamily: 'var(--font-handwritten)' }}
                  >
                    {pill.name}
                  </span>
                  <span
                    className="text-[7px] uppercase tracking-wider"
                    style={{ color: pill.color, opacity: 0.35 }}
                  >
                    {pill.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLinking({ fromId: pill.id })}
                    className="cursor-pointer text-[8px] rounded px-1.5 py-0.5"
                    style={{
                      color: '#D4605A',
                      background: '#D4605A10',
                      border: '1px solid #D4605A20',
                      fontFamily: 'var(--font-handwritten)',
                    }}
                  >
                    link
                  </button>
                  <button
                    type="button"
                    onClick={() => lockPill(pill.id)}
                    className="cursor-pointer text-[10px]"
                    style={{ background: 'none', border: 'none' }}
                  >
                    {pill.locked ? '🔒' : '🔓'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removePill(pill.id)}
                    className="cursor-pointer text-[9px]"
                    style={{ color: pill.color, opacity: 0.3, background: 'none', border: 'none' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {/* Intensity */}
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[8px]"
                  style={{ color: pill.color, opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
                >
                  faint
                </span>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => ratePill(pill.id, v)}
                    className="flex-1 cursor-pointer rounded-lg transition-all duration-300"
                    style={{
                      height: v === pill.intensity ? 18 : 7,
                      background: pill.color,
                      opacity: v === pill.intensity ? 0.75 : 0.1,
                      border: 'none',
                      padding: 0,
                    }}
                  />
                ))}
                <span
                  className="text-[8px]"
                  style={{ color: pill.color, opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
                >
                  core
                </span>
              </div>
              {/* Sparkline */}
              {hist.length > 1 && (
                <svg width="100%" height="20" viewBox="0 0 120 20" preserveAspectRatio="none">
                  <path
                    d={hist
                      .map(
                        (h, i) =>
                          `${i === 0 ? 'M' : 'L'} ${(i / (hist.length - 1)) * 120} ${20 - (h.intensity / 5) * 18}`,
                      )
                      .join(' ')}
                    fill="none"
                    stroke={pill.color}
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                </svg>
              )}
              {/* Connections */}
              {pillConns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pillConns.map((c) => {
                    const other = pills.find(
                      (p) => p.id === (c.fromId === pill.id ? c.toId : c.fromId),
                    );
                    if (!other) return null;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5"
                        style={{
                          background: `${CONN_COLORS[c.kind]}10`,
                          border: `1px solid ${CONN_COLORS[c.kind]}20`,
                        }}
                      >
                        <span
                          className="text-[8px]"
                          style={{
                            color: CONN_COLORS[c.kind],
                            fontFamily: 'var(--font-handwritten)',
                            fontWeight: 600,
                          }}
                        >
                          {c.kind} {other.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeConn(c.id)}
                          className="cursor-pointer text-[7px]"
                          style={{
                            color: CONN_COLORS[c.kind],
                            opacity: 0.3,
                            background: 'none',
                            border: 'none',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Packs this pill is in */}
              {pillPacks.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pillPacks.map((pk) => (
                    <span
                      key={pk.id}
                      className="rounded-full px-2 py-0.5 text-[8px]"
                      style={{
                        background: `${PACK_COLORS[pk.type]}10`,
                        color: PACK_COLORS[pk.type],
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 600,
                      }}
                    >
                      {pk.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

      {/* Connection type chooser when linking */}
      {linking &&
        activeId &&
        (() => {
          const target = pills.find((p) => p.id === activeId);
          const source = pills.find((p) => p.id === linking.fromId);
          if (!target || !source || target.id === source.id) return null;
          return (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <p
                className="text-[10px] text-center"
                style={{ color: '#8A6A4A', fontFamily: 'var(--font-handwritten)' }}
              >
                {source.name} → {target.name}
              </p>
              <div className="flex justify-center gap-1">
                {CONN_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addConn(target.id, k)}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-[9px] transition-all hover:scale-105"
                    style={{
                      background: `${CONN_COLORS[k]}10`,
                      border: `1px solid ${CONN_COLORS[k]}25`,
                      color: CONN_COLORS[k],
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 600,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

      {/* Two columns: pills */}
      <div className="grid grid-cols-2 gap-2">
        {/* Strengths */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setAddingType(addingType === 'strength' ? null : 'strength')}
            className="w-full cursor-pointer text-center text-[9px] font-bold uppercase tracking-wider py-1 rounded-lg transition-all"
            style={{
              color: '#D4805A',
              fontFamily: 'var(--font-serif)',
              background: addingType === 'strength' ? '#D4805A10' : 'transparent',
              border: `1px solid ${addingType === 'strength' ? '#D4805A30' : '#D4805A12'}`,
            }}
          >
            + Strength
          </button>
          {strengths.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                linking ? setActiveId(p.id) : setActiveId(activeId === p.id ? null : p.id)
              }
              className="flex w-full cursor-pointer items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition-all duration-200"
              style={{
                background: activeId === p.id ? `${p.color}12` : `${p.color}04`,
                border: `1px solid ${activeId === p.id ? `${p.color}30` : `${p.color}10`}`,
              }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: p.color, opacity: 0.7 }} />
              <span
                className="flex-1 text-[10px]"
                style={{ color: p.color, fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
              >
                {p.name}
              </span>
              {p.locked && <span className="text-[6px]">🔒</span>}
            </button>
          ))}
        </div>
        {/* Weaknesses */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setAddingType(addingType === 'weakness' ? null : 'weakness')}
            className="w-full cursor-pointer text-center text-[9px] font-bold uppercase tracking-wider py-1 rounded-lg transition-all"
            style={{
              color: '#6890B0',
              fontFamily: 'var(--font-serif)',
              background: addingType === 'weakness' ? '#6890B010' : 'transparent',
              border: `1px solid ${addingType === 'weakness' ? '#6890B030' : '#6890B012'}`,
            }}
          >
            + Weakness
          </button>
          {weaknesses.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                linking ? setActiveId(p.id) : setActiveId(activeId === p.id ? null : p.id)
              }
              className="flex w-full cursor-pointer items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition-all duration-200"
              style={{
                background: activeId === p.id ? `${p.color}12` : `${p.color}04`,
                border: `1px solid ${activeId === p.id ? `${p.color}30` : `${p.color}10`}`,
              }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: p.color, opacity: 0.7 }} />
              <span
                className="flex-1 text-[10px]"
                style={{ color: p.color, fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
              >
                {p.name}
              </span>
              {p.locked && <span className="text-[6px]">🔒</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Add pill input */}
      {addingType &&
        (() => {
          const ac = addingType === 'strength' ? '#D4805A' : '#6890B0';
          const sugg = addingType === 'strength' ? S_SUGGEST : W_SUGGEST;
          return (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: `${ac}08`, border: `1px solid ${ac}20` }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: ac, opacity: 0.5 }}
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPill(input, addingType);
                  }}
                  placeholder={`Name a ${addingType}...`}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: ac, fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-1 pl-1">
                {sugg
                  .filter((s) => !pills.some((p) => p.name === s))
                  .slice(0, 4)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addPill(s, addingType)}
                      className="cursor-pointer rounded-full px-2 py-0.5 text-[9px] transition-all hover:scale-105"
                      style={{
                        background: `${ac}10`,
                        border: `1px solid ${ac}20`,
                        color: ac,
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          );
        })()}

      {/* Packs section */}
      {pills.length >= 4 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] uppercase tracking-wider"
              style={{
                color: '#8A6A4A',
                opacity: 0.5,
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
              }}
            >
              Packs
            </span>
            <button
              type="button"
              onClick={() => setAddingPack(!addingPack)}
              className="cursor-pointer text-[8px]"
              style={{
                color: '#9B6BA0',
                background: addingPack ? '#9B6BA010' : 'none',
                border: addingPack ? '1px solid #9B6BA020' : '1px solid transparent',
                borderRadius: 6,
                padding: '2px 6px',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 600,
              }}
            >
              {addingPack ? 'cancel' : '+ pack'}
            </button>
          </div>
          {packs.map((pk) => (
            <div
              key={pk.id}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{
                background: `${PACK_COLORS[pk.type]}08`,
                border: `1px solid ${PACK_COLORS[pk.type]}15`,
              }}
            >
              <span
                className="flex-1 text-[10px] font-bold"
                style={{ color: PACK_COLORS[pk.type], fontFamily: 'var(--font-handwritten)' }}
              >
                {pk.name}
              </span>
              <span className="text-[7px]" style={{ color: PACK_COLORS[pk.type], opacity: 0.4 }}>
                {pk.pillIds.length} pills
              </span>
              <button
                type="button"
                onClick={() => removePack(pk.id)}
                className="cursor-pointer text-[8px]"
                style={{
                  color: PACK_COLORS[pk.type],
                  opacity: 0.3,
                  background: 'none',
                  border: 'none',
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {addingPack && (
            <div
              className="space-y-2 rounded-xl px-3 py-2 animate-in fade-in duration-200"
              style={{ background: '#9B6BA008', border: '1px solid #9B6BA015' }}
            >
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="Pack name..."
                className="w-full bg-transparent text-xs outline-none"
                style={{ color: '#9B6BA0', fontFamily: 'var(--font-handwritten)', fontWeight: 600 }}
                autoFocus
              />
              <div className="flex gap-1">
                {PACK_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPackType(t)}
                    className="cursor-pointer rounded-full px-2 py-0.5 text-[8px] transition-all"
                    style={{
                      background: packType === t ? `${PACK_COLORS[t]}20` : 'transparent',
                      border: `1px solid ${PACK_COLORS[t]}20`,
                      color: PACK_COLORS[t],
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {pills.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setPackPills(
                        packPills.includes(p.id)
                          ? packPills.filter((id) => id !== p.id)
                          : [...packPills, p.id],
                      )
                    }
                    className="cursor-pointer rounded-full px-2 py-0.5 text-[8px] transition-all"
                    style={{
                      background: packPills.includes(p.id) ? `${p.color}25` : `${p.color}08`,
                      border: `1px solid ${packPills.includes(p.id) ? `${p.color}40` : `${p.color}15`}`,
                      color: p.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 600,
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={createPack}
                disabled={!packName.trim() || packPills.length < 2}
                className="w-full cursor-pointer rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background:
                    packName.trim() && packPills.length >= 2 ? '#9B6BA015' : 'transparent',
                  border: '1px solid #9B6BA020',
                  color: '#9B6BA0',
                  fontFamily: 'var(--font-serif)',
                  opacity: packName.trim() && packPills.length >= 2 ? 1 : 0.3,
                }}
              >
                Create Pack ({packPills.length} selected)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty + prompt states */}
      {n === 0 && !addingType && (
        <p
          className="text-center text-xs"
          style={{ color: '#B8905A', opacity: 0.35, fontFamily: 'var(--font-handwritten)' }}
        >
          Name your strengths and weaknesses.
        </p>
      )}
      {n > 0 && n < 3 && (
        <p
          className="text-center text-[9px]"
          style={{ color: '#B8905A', opacity: 0.3, fontFamily: 'var(--font-handwritten)' }}
        >
          Add {3 - n} more to see your wheel
        </p>
      )}
    </div>
  );
}

/* ═══ WORK TAB ═══ */
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

  const getPrompt = () => {
    if (!focusPill) return '';
    const bank =
      focusPill.type === 'strength'
        ? PROMPTS_S[focusPill.name] || PROMPTS_S._default
        : PROMPTS_W[focusPill.name] || PROMPTS_W._default;
    const dayIndex = Math.floor(Date.now() / 86400000) % bank.length;
    return bank[dayIndex];
  };

  const lockedPills = pills.filter((p) => p.locked);
  const allPills = pills.length > 0 ? pills : [];

  return (
    <div className="space-y-4">
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#D4805A' }}
      >
        {focusPill ? `Working on: ${focusPill.name}` : 'Choose a pattern to work on'}
      </p>

      {/* No focus — pick one */}
      {!focusPill && (
        <div className="space-y-2">
          {allPills.length === 0 && (
            <p
              className="text-center text-xs"
              style={{ color: '#B8905A', opacity: 0.35, fontFamily: 'var(--font-handwritten)' }}
            >
              Add patterns in the Map tab first.
            </p>
          )}
          {lockedPills.length > 0 && (
            <>
              <p
                className="text-[9px] uppercase tracking-wider"
                style={{ color: '#8A6A4A', opacity: 0.4, fontFamily: 'var(--font-serif)' }}
              >
                Locked patterns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lockedPills.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectFocus(p.id)}
                    className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all hover:scale-105"
                    style={{
                      background: `${p.color}12`,
                      border: `1.5px solid ${p.color}25`,
                      color: p.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {allPills.filter((p) => !p.locked).length > 0 && (
            <>
              <p
                className="text-[9px] uppercase tracking-wider"
                style={{ color: '#8A6A4A', opacity: 0.4, fontFamily: 'var(--font-serif)' }}
              >
                All patterns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allPills
                  .filter((p) => !p.locked)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectFocus(p.id)}
                      className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all hover:scale-105"
                      style={{
                        background: `${p.color}08`,
                        border: `1px solid ${p.color}18`,
                        color: p.color,
                        fontFamily: 'var(--font-handwritten)',
                        fontWeight: 600,
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Active focus */}
      {focusPill && (
        <div className="space-y-3">
          {/* Daily prompt */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: `${focusPill.color}08`, border: `1px solid ${focusPill.color}18` }}
          >
            <p
              className="text-[9px] uppercase tracking-wider mb-1"
              style={{ color: focusPill.color, opacity: 0.4, fontFamily: 'var(--font-serif)' }}
            >
              Today&apos;s prompt
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: focusPill.color, fontFamily: 'var(--font-serif)', fontWeight: 600 }}
            >
              {getPrompt()}
            </p>
          </div>

          {/* Journal input */}
          <div className="flex items-start gap-2">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your reflection..."
              className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-xs outline-none"
              style={{
                color: focusPill.color,
                fontFamily: 'var(--font-handwritten)',
                border: `1px solid ${focusPill.color}20`,
                minHeight: 60,
              }}
              rows={3}
            />
          </div>
          {reflection.trim() && (
            <button
              type="button"
              onClick={addReflection}
              className="w-full cursor-pointer rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: `${focusPill.color}12`,
                border: `1px solid ${focusPill.color}25`,
                color: focusPill.color,
                fontFamily: 'var(--font-serif)',
              }}
            >
              Save reflection
            </button>
          )}

          {/* Past reflections */}
          {focus && focus.reflections.length > 0 && (
            <div className="space-y-1.5">
              <p
                className="text-[9px] uppercase tracking-wider"
                style={{ color: focusPill.color, opacity: 0.4, fontFamily: 'var(--font-serif)' }}
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
                      background: `${focusPill.color}05`,
                      border: `1px solid ${focusPill.color}10`,
                    }}
                  >
                    <span className="text-[8px]" style={{ color: focusPill.color, opacity: 0.3 }}>
                      {r.date}
                    </span>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{
                        color: focusPill.color,
                        fontFamily: 'var(--font-handwritten)',
                        opacity: 0.7,
                      }}
                    >
                      {r.text}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Change focus */}
          <button
            type="button"
            onClick={() => setFocus(null)}
            className="w-full cursor-pointer text-center text-[9px] py-1"
            style={{
              color: '#8A6A4A',
              opacity: 0.3,
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-handwritten)',
            }}
          >
            change focus
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══ WEATHER TAB ═══ */
function WeatherTab({
  weather,
  setWeather,
}: {
  weather: WeatherEntry[];
  setWeather: (w: WeatherEntry[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingKind, setAddingKind] = useState<WKind | null>(null);
  const [input, setInput] = useState('');

  const add = (name: string, kind: WKind) => {
    if (!name.trim()) return;
    setWeather([
      ...weather,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        kind,
        intensity: 3,
        lastSeen: new Date().toISOString(),
      },
    ]);
    setInput('');
    setAddingKind(null);
  };
  const rate = (id: string, intensity: number) =>
    setWeather(
      weather.map((w) =>
        w.id === id ? { ...w, intensity, lastSeen: new Date().toISOString() } : w,
      ),
    );
  const remove = (id: string) => {
    setWeather(weather.filter((w) => w.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const kc = WK.map((k) => ({ kind: k, entries: weather.filter((w) => w.kind === k) }));
  const dom =
    weather.length > 0
      ? kc.reduce(
          (a, b) =>
            b.entries.reduce((s, e) => s + e.intensity, 0) >
            a.entries.reduce((s, e) => s + e.intensity, 0)
              ? b
              : a,
          kc[0],
        )
      : null;
  const warmth =
    weather.length > 0
      ? Math.round(
          (weather.reduce((s, e) => s + (WK.indexOf(e.kind) / 4) * (e.intensity / 5), 0) /
            weather.length) *
            100,
        )
      : 50;
  const d = dom?.entries.length ? WM[dom.kind] : null;

  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div className="space-y-3">
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors duration-700"
        style={{ color: d ? d.color : '#C4A060' }}
      >
        Inner Weather
      </p>

      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d ? d.skyT : '#B0A080'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={d ? d.skyB : '#D8C8A0'} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={sz} height={sz} rx="16" fill="url(#sg)" />
          <line
            x1="15"
            y1={cy + 15}
            x2={sz - 15}
            y2={cy + 15}
            stroke={d ? d.color : '#C4B890'}
            strokeWidth="0.5"
            opacity="0.12"
          />

          {WK.map((k, i) => {
            const m = WM[k];
            const kE = kc[i].entries;
            const has = kE.length > 0;
            const avgI = has ? kE.reduce((s, e) => s + e.intensity, 0) / kE.length : 0;
            const pos = [
              { x: 32, y: 50 },
              { x: 62, y: 36 },
              { x: 100, y: 30 },
              { x: 138, y: 36 },
              { x: 168, y: 50 },
            ][i];
            const oR = has ? 12 + avgI * 4 : 10;
            return (
              <g key={k}>
                {has && <circle cx={pos.x} cy={pos.y} r={oR + 8} fill={m.color} opacity="0.06" />}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={oR}
                  fill={m.color}
                  opacity={has ? 0.12 + avgI * 0.06 : 0.04}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: has ? `${10 + avgI * 1.5}px` : '9px', opacity: has ? 1 : 0.3 }}
                >
                  {m.emoji}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + oR + 10}
                  textAnchor="middle"
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                    fill: m.color,
                    opacity: has ? 0.7 : 0.2,
                  }}
                >
                  {k}
                </text>
              </g>
            );
          })}

          <text
            x={cx}
            y={cy + 48}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: d ? d.color : '#B8905A',
              opacity: 0.45,
            }}
          >
            {warmth}
          </text>
          <text
            x={cx}
            y={cy + 62}
            textAnchor="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fill: d ? d.color : '#B8905A',
              opacity: 0.25,
            }}
          >
            warmth
          </text>

          {weather.length === 0 && (
            <>
              <circle cx={cx} cy={cy - 5} r={24} fill="#C4A060" opacity="0.06" />
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '20px' }}
              >
                🌤
              </text>
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-center gap-1">
        {WK.map((k) => {
          const m = WM[k];
          const cnt = weather.filter((e) => e.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setAddingKind(addingKind === k ? null : k)}
              className="flex cursor-pointer flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all"
              style={{
                background: addingKind === k ? `${m.color}15` : 'transparent',
                border: `1.5px solid ${addingKind === k ? `${m.color}40` : `${m.color}10`}`,
                minWidth: 40,
              }}
            >
              <span style={{ fontSize: '14px', filter: cnt > 0 ? undefined : 'grayscale(0.6)' }}>
                {m.emoji}
              </span>
              <span
                className="text-[7px] font-bold capitalize"
                style={{
                  color: m.color,
                  fontFamily: 'var(--font-handwritten)',
                  opacity: cnt > 0 ? 1 : 0.4,
                }}
              >
                {k}
              </span>
            </button>
          );
        })}
      </div>

      {addingKind && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{
              background: `${WM[addingKind].color}08`,
              border: `1px solid ${WM[addingKind].color}18`,
            }}
          >
            <span style={{ fontSize: '12px' }}>{WM[addingKind].emoji}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add(input, addingKind);
              }}
              placeholder={`Name this ${addingKind}...`}
              className="flex-1 bg-transparent text-xs outline-none"
              style={{
                color: WM[addingKind].color,
                fontFamily: 'var(--font-handwritten)',
                fontWeight: 600,
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1 pl-1">
            {WS[addingKind]
              .filter((s) => !weather.some((w) => w.name === s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s, addingKind)}
                  className="cursor-pointer rounded-full px-2 py-0.5 text-[9px] hover:scale-105"
                  style={{
                    background: `${WM[addingKind].color}10`,
                    border: `1px solid ${WM[addingKind].color}18`,
                    color: WM[addingKind].color,
                    fontFamily: 'var(--font-handwritten)',
                    fontWeight: 600,
                  }}
                >
                  {s}
                </button>
              ))}
          </div>
        </div>
      )}

      {weather.length > 0 && (
        <div className="space-y-1">
          {weather.map((e) => {
            const m = WM[e.kind];
            const isA = activeId === e.id;
            return (
              <div key={e.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(isA ? null : e.id)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition-all"
                  style={{
                    background: isA ? `${m.color}10` : `${m.color}04`,
                    border: `1px solid ${isA ? `${m.color}30` : `${m.color}10`}`,
                  }}
                >
                  <span style={{ fontSize: '11px' }}>{m.emoji}</span>
                  <span
                    className="flex-1 text-[10px]"
                    style={{
                      color: m.color,
                      fontFamily: 'var(--font-handwritten)',
                      fontWeight: 700,
                    }}
                  >
                    {e.name}
                  </span>
                  <div className="flex gap-px">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <div
                        key={v}
                        className="rounded-full"
                        style={{
                          width: v <= e.intensity ? 5 : 3,
                          height: v <= e.intensity ? 5 : 3,
                          background: m.color,
                          opacity: v <= e.intensity ? 0.6 : 0.1,
                        }}
                      />
                    ))}
                  </div>
                </button>
                {isA && (
                  <div className="mt-1 flex items-center gap-1 px-2.5 animate-in fade-in duration-150">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => rate(e.id, v)}
                        className="flex-1 cursor-pointer rounded-md transition-all"
                        style={{
                          height: v === e.intensity ? 16 : 6,
                          background: `linear-gradient(135deg, ${m.grad[0]}, ${m.grad[1]})`,
                          opacity: v === e.intensity ? 0.8 : 0.1,
                          border: 'none',
                          padding: 0,
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      className="cursor-pointer text-[8px] ml-1"
                      style={{ color: m.color, opacity: 0.3, background: 'none', border: 'none' }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {weather.length === 0 && !addingKind && (
        <p
          className="text-center text-[10px]"
          style={{ color: '#B8905A', opacity: 0.3, fontFamily: 'var(--font-handwritten)' }}
        >
          Tap a weather to name what you&apos;re feeling.
        </p>
      )}
    </div>
  );
}
