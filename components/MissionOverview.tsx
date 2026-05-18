'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Tokens ──────────────────────────────────────────────────── */
const OCHRE = '#C4A060';
const BROWN = '#5C3018';
const LABEL = '#8A6A4A';

/* ── Types (mirrors DoingCardsPanel) ────────────────────────── */
type Subtask = { id: string; text: string; done: boolean };
type MissionItem = {
  id: string;
  text: string;
  done: boolean;
  timeFrame?: string;
  subtasks?: Subtask[];
};
type AreaChannel = { id: string; title: string; color: string };

/* ── localStorage keys (same as DoingCardsPanel) ─────────────── */
const LS_OBJECTIVE = 'colourmap:current-objective';
const LS_OBJECTIVE_TF = 'colourmap:objective-timeframe';
const LS_OBJECTIVE_SUBTASKS = 'colourmap:objective-subtasks';
const LS_MISSIONS = 'colourmap:today-objectives';
const LS_PUSH = 'colourmap:checkin-todos';
const LS_CMAP = 'colourmap:cmap-data';
const LS_OBJ_AREA = 'colourmap:objective-area-id';

/* ── Road node sizes ─────────────────────────────────────────── */
const NODE_R = 9;
const ROAD_X = 18;

/* ── Station row ─────────────────────────────────────────────── */
function Station({
  item,
  variant,
  last,
  isExpanded,
  onToggleExpand,
}: {
  item: MissionItem;
  variant: 'objective' | 'daily' | 'push';
  last?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const nodeColor = item.done
    ? 'rgba(196,160,96,0.3)'
    : variant === 'objective'
      ? OCHRE
      : variant === 'push'
        ? '#B898D0'
        : OCHRE;

  const subtasks = item.subtasks ?? [];
  const doneSubs = subtasks.filter((s) => s.done).length;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {/* Road column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: ROAD_X * 2,
        }}
      >
        {/* Node circle */}
        <div
          style={{
            width: NODE_R * 2,
            height: NODE_R * 2,
            borderRadius: '50%',
            background: item.done ? 'transparent' : `${nodeColor}20`,
            border: `2px solid ${nodeColor}`,
            boxShadow: item.done ? 'none' : `0 0 8px ${nodeColor}50`,
            flexShrink: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            marginTop: 2,
          }}
        >
          {item.done && (
            <span style={{ color: nodeColor, fontSize: 9, lineHeight: 1, opacity: 0.7 }}>✓</span>
          )}
        </div>
        {/* Connector down */}
        {!last && (
          <div
            style={{
              flex: 1,
              width: 2,
              minHeight: 12,
              background: `linear-gradient(to bottom, ${nodeColor}50, rgba(196,160,96,0.12))`,
              marginTop: 2,
              marginBottom: 2,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          paddingBottom: last ? 0 : 10,
          paddingTop: 1,
          minWidth: 0,
        }}
      >
        <div
          onClick={onToggleExpand}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: subtasks.length > 0 ? 'pointer' : 'default',
            paddingLeft: 10,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--font-serif)',
              fontSize: variant === 'objective' ? 14 : 13,
              fontWeight: variant === 'objective' ? 700 : 500,
              color: item.done ? `${LABEL}` : BROWN,
              textDecoration: item.done ? 'line-through' : 'none',
              opacity: item.done ? 0.5 : 1,
              lineHeight: 1.35,
              letterSpacing: '0.02em',
            }}
          >
            {item.text || (variant === 'objective' ? 'Current mission…' : '—')}
          </span>
          {item.timeFrame && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                color: LABEL,
                opacity: 0.45,
                flexShrink: 0,
                fontStyle: 'italic',
              }}
            >
              by {item.timeFrame}
            </span>
          )}
          {subtasks.length > 0 && !item.done && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 9,
                color: LABEL,
                opacity: 0.4,
                flexShrink: 0,
              }}
            >
              {doneSubs}/{subtasks.length}
            </span>
          )}
          {subtasks.length > 0 && (
            <span
              style={{
                color: OCHRE,
                opacity: 0.3,
                fontSize: 9,
                flexShrink: 0,
                transform: isExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            >
              ▾
            </span>
          )}
        </div>

        {/* Subtask channel */}
        {isExpanded && subtasks.length > 0 && (
          <div style={{ paddingLeft: 10, marginTop: 6 }}>
            {subtasks.map((s, si) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingLeft: 8,
                  borderLeft: `1px solid ${nodeColor}30`,
                  marginBottom: si < subtasks.length - 1 ? 4 : 0,
                  paddingTop: 2,
                  paddingBottom: 2,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: s.done ? nodeColor : 'transparent',
                    border: `1px solid ${s.done ? nodeColor : `${nodeColor}55`}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12,
                    color: s.done ? LABEL : BROWN,
                    opacity: s.done ? 0.45 : 0.8,
                    textDecoration: s.done ? 'line-through' : 'none',
                    lineHeight: 1.35,
                  }}
                >
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Group label between sections ───────────────────────────── */
function RoadLabel({ label, color = OCHRE }: { label: string; color?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 2,
      }}
    >
      <div style={{ width: ROAD_X * 2, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 28,
            height: 1,
            background: `${color}28`,
          }}
        />
      </div>
      <span
        style={{
          paddingLeft: 10,
          fontFamily: 'var(--font-serif)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--light-surface-muted, #7A5438)',
          opacity: 0.86,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function MissionOverview() {
  const [open, setOpen] = useState(false);
  const [manualProgress, setManualProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [objective, setObjective] = useState<MissionItem>({
    id: 'obj',
    text: '',
    done: false,
  });
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [push, setPush] = useState<MissionItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [areaChannels, setAreaChannels] = useState<AreaChannel[]>([]);
  const [linkedAreaId, setLinkedAreaId] = useState<string | null>(null);
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  useEffect(() => {
    try {
      const text = localStorage.getItem(LS_OBJECTIVE) ?? '';
      const tf = localStorage.getItem(LS_OBJECTIVE_TF) ?? undefined;
      const subs = localStorage.getItem(LS_OBJECTIVE_SUBTASKS);
      setObjective({
        id: 'obj',
        text,
        done: localStorage.getItem('colourmap:objective-done') === 'true',
        timeFrame: tf || undefined,
        subtasks: subs ? JSON.parse(subs) : [],
      });

      const m = localStorage.getItem(LS_MISSIONS);
      if (m) setMissions(JSON.parse(m));
      const p = localStorage.getItem(LS_PUSH);
      if (p) setPush(JSON.parse(p));
      const prog = localStorage.getItem('colourmap:mission-progress');
      if (prog !== null) setManualProgress(Number(prog));
    } catch {}
  }, []);

  useEffect(() => {
    function loadCmap() {
      try {
        const raw = localStorage.getItem(LS_CMAP);
        if (raw) {
          const parsed = JSON.parse(raw);
          setAreaChannels(parsed.channels ?? []);
        }
        const aid = localStorage.getItem(LS_OBJ_AREA);
        setLinkedAreaId(aid);
      } catch {}
    }
    loadCmap();
    window.addEventListener('colourmap:cmap-updated', loadCmap);
    return () => window.removeEventListener('colourmap:cmap-updated', loadCmap);
  }, []);

  const activeMissions = missions.filter((m) => !m.done);
  const doneMissions = missions.filter((m) => m.done);
  const activePush = push.filter((p) => !p.done);

  function startBarDrag(e: React.PointerEvent<HTMLDivElement>) {
    const bar = barRef.current;
    if (!bar) return;

    function computeVal(clientX: number) {
      const rect = bar!.getBoundingClientRect();
      return Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
    }

    setDragging(true);
    setManualProgress(computeVal(e.clientX));

    function onMove(ev: PointerEvent) {
      setManualProgress(computeVal(ev.clientX));
    }
    function onUp(ev: PointerEvent) {
      setDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      const val = computeVal(ev.clientX);
      setManualProgress(val);
      try {
        localStorage.setItem('colourmap:mission-progress', String(val));
      } catch {}
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function linkArea(channelId: string | null) {
    setLinkedAreaId(channelId);
    setShowAreaPicker(false);
    try {
      if (channelId) {
        localStorage.setItem(LS_OBJ_AREA, channelId);
      } else {
        localStorage.removeItem(LS_OBJ_AREA);
      }
    } catch {}
  }

  const linkedChannel = areaChannels.find((c) => c.id === linkedAreaId) ?? null;

  const allItems = [
    ...(objective.text ? [{ ...objective, variant: 'objective' as const }] : []),
    ...activeMissions.map((m) => ({ ...m, variant: 'daily' as const })),
    ...activePush.map((p) => ({ ...p, variant: 'push' as const })),
    ...doneMissions.map((m) => ({ ...m, variant: 'daily' as const })),
  ];

  return (
    <div
      style={{
        border: `1px solid rgba(196,160,96,0.2)`,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '10px 16px',
          background: 'rgba(196,160,96,0.08)',
          borderBottom: open ? `1px solid rgba(196,160,96,0.12)` : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ flex: 1 }} />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#5C3018',
            }}
          >
            Mission Overview
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: LABEL,
              opacity: 0.4,
              marginTop: 1,
              letterSpacing: '0.04em',
            }}
          >
            {manualProgress}% clear
          </div>
        </div>
        <span style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: OCHRE,
              opacity: 0.4,
              fontSize: 11,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </span>
      </div>

      {open && (
        <div style={{ padding: '14px 14px 12px' }}>
          {/* Progress bar — manual slider */}
          <div style={{ marginBottom: 16, userSelect: 'none' }}>
            <div
              ref={barRef}
              onPointerDown={startBarDrag}
              style={{
                height: 7,
                borderRadius: 4,
                background: 'rgba(196,160,96,0.1)',
                position: 'relative',
                cursor: 'ew-resize',
                touchAction: 'none',
              }}
            >
              {/* fill */}
              <div
                style={{
                  height: '100%',
                  width: `${manualProgress}%`,
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${OCHRE}, #C8B858)`,
                  boxShadow: `0 0 6px ${OCHRE}55`,
                  transition: dragging ? 'none' : 'width 0.15s ease',
                  pointerEvents: 'none',
                }}
              />
              {/* handle */}
              {manualProgress > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${manualProgress}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 13,
                    height: 13,
                    borderRadius: '50%',
                    background: '#C8B858',
                    border: '2px solid rgba(255,255,255,0.5)',
                    boxShadow: `0 0 8px ${OCHRE}88`,
                    pointerEvents: 'none',
                    transition: dragging ? 'none' : 'left 0.15s ease',
                  }}
                />
              )}
            </div>
          </div>

          {/* Road */}
          <div>
            {/* Objective */}
            {objective.text && (
              <>
                <RoadLabel label="Current Mission" />
                <Station
                  item={objective}
                  variant="objective"
                  last={activeMissions.length === 0 && activePush.length === 0}
                  isExpanded={expanded === 'obj'}
                  onToggleExpand={() => setExpanded(expanded === 'obj' ? null : 'obj')}
                />
                {/* Area link */}
                <div
                  style={{
                    paddingLeft: ROAD_X * 2 + 10,
                    marginTop: -4,
                    marginBottom: activeMissions.length > 0 || activePush.length > 0 ? 10 : 4,
                  }}
                >
                  {showAreaPicker ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {linkedChannel && (
                        <button
                          type="button"
                          onClick={() => linkArea(null)}
                          style={{
                            background: 'none',
                            border: `1px solid rgba(196,160,96,0.2)`,
                            borderRadius: 999,
                            padding: '2px 8px',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 9,
                            color: LABEL,
                            opacity: 0.55,
                            cursor: 'pointer',
                            letterSpacing: '0.08em',
                          }}
                        >
                          ✕ unlink
                        </button>
                      )}
                      {areaChannels.map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => linkArea(ch.id)}
                          style={{
                            background: ch.id === linkedAreaId ? `${ch.color}18` : 'none',
                            border: `1px solid ${ch.id === linkedAreaId ? `${ch.color}60` : `${ch.color}30`}`,
                            borderRadius: 999,
                            padding: '2px 9px',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 9,
                            color: ch.color,
                            cursor: 'pointer',
                            letterSpacing: '0.08em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: ch.color,
                              flexShrink: 0,
                              opacity: 0.75,
                              display: 'inline-block',
                            }}
                          />
                          {ch.title || 'Unnamed'}
                        </button>
                      ))}
                      {areaChannels.length === 0 && (
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 10,
                            color: LABEL,
                            opacity: 0.35,
                            fontStyle: 'italic',
                          }}
                        >
                          no areas yet
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAreaPicker(true)}
                      style={{
                        background: linkedChannel ? `${linkedChannel.color}12` : 'none',
                        border: `1px solid ${linkedChannel ? `${linkedChannel.color}40` : 'rgba(196,160,96,0.18)'}`,
                        borderRadius: 999,
                        padding: '2px 9px',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 9,
                        color: linkedChannel ? linkedChannel.color : LABEL,
                        opacity: linkedChannel ? 0.85 : 0.4,
                        cursor: 'pointer',
                        letterSpacing: '0.08em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {linkedChannel ? (
                        <>
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: linkedChannel.color,
                              flexShrink: 0,
                              opacity: 0.75,
                              display: 'inline-block',
                            }}
                          />
                          {linkedChannel.title || 'Unnamed'}
                        </>
                      ) : (
                        '+ area'
                      )}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Daily missions */}
            {activeMissions.length > 0 && (
              <>
                <RoadLabel label="Daily" />
                {activeMissions.map((m, i) => (
                  <Station
                    key={m.id}
                    item={m}
                    variant="daily"
                    last={
                      i === activeMissions.length - 1 &&
                      activePush.length === 0 &&
                      doneMissions.length === 0
                    }
                    isExpanded={expanded === m.id}
                    onToggleExpand={() => setExpanded(expanded === m.id ? null : m.id)}
                  />
                ))}
              </>
            )}

            {/* Push for tomorrow */}
            {activePush.length > 0 && (
              <>
                <RoadLabel label="Push for Tomorrow" color="#B898D0" />
                {activePush.map((p, i) => (
                  <Station
                    key={p.id}
                    item={p}
                    variant="push"
                    last={i === activePush.length - 1 && doneMissions.length === 0}
                    isExpanded={expanded === p.id}
                    onToggleExpand={() => setExpanded(expanded === p.id ? null : p.id)}
                  />
                ))}
              </>
            )}

            {/* Done missions (collapsed at bottom) */}
            {doneMissions.length > 0 && (
              <>
                <RoadLabel label="Done" color="rgba(196,160,96,0.4)" />
                {doneMissions.map((m, i) => (
                  <Station
                    key={m.id}
                    item={m}
                    variant="daily"
                    last={i === doneMissions.length - 1}
                    isExpanded={expanded === m.id}
                    onToggleExpand={() => setExpanded(expanded === m.id ? null : m.id)}
                  />
                ))}
              </>
            )}

            {/* Empty state */}
            {allItems.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 0',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontStyle: 'italic',
                  color: LABEL,
                  opacity: 0.4,
                  letterSpacing: '0.04em',
                }}
              >
                no missions yet — add them in the missions tab
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
