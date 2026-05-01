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
const font = 'var(--font-serif)';

interface ReflectEntry {
  id: string;
  axis: Axis;
  level: string;
  text: string;
  createdAt: string;
}

const AXES: Record<
  Axis,
  {
    label: string;
    color: string;
    items: { name: string; color: string }[];
    levels: { name: string; color: string }[];
    Compass: React.ComponentType<{ initialSlice?: string }>;
  }
> = {
  feeling: {
    label: 'F',
    color: '#D4805A',
    items: [
      { name: 'Care', color: '#D4B088' },
      { name: 'Attitude', color: '#D09060' },
      { name: 'Rest', color: '#C47850' },
      { name: 'Emotions', color: '#B85A30' },
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
      { name: 'Structure', color: '#9AABB8' },
      { name: 'Target', color: '#7A98B0' },
      { name: 'Action', color: '#5A88A8' },
      { name: 'Resources', color: '#4878A8' },
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
      { name: 'Social Life', color: '#9AAF80' },
      { name: 'Authentic', color: '#7A9860' },
      { name: 'Roots', color: '#5A8840' },
      { name: 'Express', color: '#4A6A2A' },
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

/* ── 4 losange dots — horizontal ── */
function DotsHorizontal({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="flex justify-center gap-7">
      {items.map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2.5">
          <span
            style={{
              width: 14,
              height: 14,
              background: item.color,
              display: 'block',
              transform: 'rotate(45deg)',
              borderRadius: 2,
            }}
          />
          <span
            style={{
              fontFamily: font,
              fontSize: 11,
              fontWeight: 500,
              color: item.color,
              letterSpacing: '0.06em',
              textAlign: 'center',
            }}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── 4 losange dots — vertical ── */
function DotsVertical({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span
            style={{
              width: 12,
              height: 12,
              background: item.color,
              display: 'block',
              transform: 'rotate(45deg)',
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: font,
              fontSize: 14,
              fontWeight: 500,
              color: item.color,
              letterSpacing: '0.06em',
            }}
          >
            {item.name}
          </span>
        </div>
      ))}
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

export default function FdsPanel() {
  const [active, setActive] = useState<Axis | null>(null);
  const [layout, setLayout] = useState<Layout>('h');

  const isSuper = layout === 'super';
  const axisDef = active && !isSuper ? AXES[active] : null;

  return (
    <div className="space-y-4">
      {/* F / D / S big dots + ⊚ super */}
      <div className="flex items-center justify-center gap-6">
        {ORDER.map((id) => {
          const a = AXES[id];
          const isOn = active === id && !isSuper;
          const dimmed = (active !== null && !isOn && !isSuper) || isSuper;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActive(isOn ? null : id);
                setLayout('h');
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                opacity: dimmed ? 0.3 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isOn ? `${a.color}22` : `${a.color}0C`,
                  border: `2px solid ${isOn ? a.color : `${a.color}40`}`,
                  boxShadow: isOn ? `0 0 0 4px ${a.color}18` : 'none',
                  transition: 'all 0.18s',
                  fontFamily: font,
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: isOn ? a.color : `${a.color}80`,
                }}
              >
                {a.label}
              </span>
            </button>
          );
        })}
        {/* Divider */}
        <span
          style={{
            width: 1,
            height: 20,
            background: '#C4A06030',
            display: 'block',
            alignSelf: 'center',
          }}
        />
        {/* ⊚ SuperCompass toggle */}
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
            width: 40,
            height: 40,
            borderRadius: '50%',
            fontFamily: font,
            fontSize: 18,
            color: isSuper ? '#C4A060' : '#8A6A4A',
            background: isSuper ? '#C4A06018' : 'transparent',
            border: `1.5px solid ${isSuper ? '#C4A06055' : '#C4A06028'}`,
            cursor: 'pointer',
            opacity: isSuper ? 1 : 0.5,
            transition: 'all 0.15s',
            alignSelf: 'center',
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
                onClick={() => setLayout(id)}
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
          {layout === 'h' && <DotsHorizontal items={axisDef.items} />}
          {layout === 'v' && <DotsVertical items={axisDef.items} />}
          {layout === 'compass' && (
            <div className="animate-in fade-in duration-200">
              <axisDef.Compass />
            </div>
          )}

          {/* Reflect losange */}
          <ReflectSection axis={axisDef} axisId={active} />
        </div>
      )}

      {/* Idle hint */}
      {!active && (
        <p
          className="text-center italic"
          style={{
            fontFamily: font,
            fontSize: 13,
            color: 'var(--muted-foreground)',
            opacity: 0.55,
            lineHeight: 1.5,
          }}
        >
          tap F · D · S
        </p>
      )}
    </div>
  );
}
