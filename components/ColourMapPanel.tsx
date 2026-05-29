'use client';

import { useEffect, useState } from 'react';
import { syncPref } from '@/lib/sync';

/* ── Tokens ──────────────────────────────────────────────────── */
const OCHRE = 'var(--palette-panel-text, #C4A060)';
const BROWN = 'var(--palette-panel-text, rgba(240,216,152,0.88))';
const LABEL = 'var(--palette-panel-muted, rgba(196,160,96,0.55))';
const CARD_BG = 'rgba(196,160,96,0.05)';

/* ── Types ───────────────────────────────────────────────────── */
type Step = { id: string; text: string; done: boolean };
type Compartment = { id: string; title: string; steps: Step[]; linkedToDay?: boolean };
type Channel = {
  id: string;
  title: string;
  color: string;
  open: boolean;
  compartments: Compartment[];
  fixed?: boolean;
};
type Idea = { id: string; title: string; steps: Step[] };
type AreaMission = {
  id: string;
  text: string;
  done: boolean;
  createdAt?: string;
  tag?: { name: string; color: string; categoryId?: string };
};
interface CMapData {
  title: string;
  channels: Channel[];
  ideas: Idea[];
}

const LS_KEY = 'colourmap:cmap-data';
const MISSIONS_KEY = 'colourmap:today-objectives';

const CHANNEL_COLORS = [
  '#C07040', // terracotta
  '#4A8870', // teal-sage
  '#4870A8', // steel blue
  '#9858A0', // muted violet
  '#A87038', // amber
  '#3A8890', // deep teal
  '#A85870', // dusty rose
  '#7A8A48', // olive
];

const AREA_PALETTE = [
  '#C07040',
  '#D08A48',
  '#C4A060',
  '#A8A058',
  '#7A8A48',
  '#4A8870',
  '#3A8890',
  '#4870A8',
  '#5265B0',
  '#7258A8',
  '#9858A0',
  '#A85870',
  '#B85C52',
  '#8A6A4A',
  '#CFC0A0',
  '#F0D898',
];

function uid() {
  return crypto.randomUUID();
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persistAreaMissions(next: AreaMission[]) {
  try {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(next));
  } catch {}
  syncPref(MISSIONS_KEY, next);
  window.dispatchEvent(new Event('colourmap:missions-updated'));
}

function syncAreaMissionTag(channel: Channel) {
  const all = readJson<AreaMission[]>(MISSIONS_KEY, []);
  const next = all.map((mission) =>
    mission.tag?.categoryId === channel.id
      ? {
          ...mission,
          tag: {
            ...mission.tag,
            name: channel.title || 'Area',
            color: channel.color,
            categoryId: channel.id,
          },
        }
      : mission,
  );
  persistAreaMissions(next);
}

function uniqueMissions(items: AreaMission[]) {
  const seen = new Set<string>();
  return items.filter((mission) => {
    const key = [mission.tag?.categoryId ?? 'none', mission.text.trim().toLocaleLowerCase()].join(
      '::',
    );
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function defaultData(): CMapData {
  return { title: 'Areas', channels: [], ideas: [] };
}

/* ── Step list — boxes connected by vertical line ────────────── */
function StepList({
  steps,
  onToggle,
  onDelete,
  onAdd,
  color = OCHRE,
}: {
  steps: Step[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string) => void;
  color?: string;
}) {
  const [val, setVal] = useState('');

  function submit() {
    const t = val.trim();
    if (!t) return;
    onAdd(t);
    setVal('');
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Connector line */}
      {steps.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 6,
            bottom: 28,
            width: 1,
            background: `${color}28`,
            pointerEvents: 'none',
          }}
        />
      )}

      {steps.map((s) => (
        <div
          key={s.id}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 5 }}
        >
          {/* Node dot */}
          <div
            style={{
              width: 22,
              paddingTop: 9,
              display: 'flex',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => onToggle(s.id)}
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                border: `1.5px solid ${s.done ? color : `${color}55`}`,
                background: s.done ? color : 'transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s',
              }}
            />
          </div>

          {/* Step box */}
          <div
            style={{
              flex: 1,
              background: s.done ? `${color}0a` : `${color}07`,
              border: `1px solid ${s.done ? `${color}38` : `${color}16`}`,
              borderRadius: 8,
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                flex: 1,
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: s.done ? `${LABEL}` : BROWN,
                textDecoration: s.done ? 'line-through' : 'none',
                opacity: s.done ? 0.5 : 1,
                lineHeight: 1.4,
              }}
            >
              {s.text}
            </span>
            <button
              type="button"
              onClick={() => onDelete(s.id)}
              style={{
                background: 'none',
                border: 'none',
                color: LABEL,
                opacity: 0.25,
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}

      {/* Add step — centered */}
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 22, gap: 4 }}>
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="add step…"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            flex: 1,
            textAlign: 'center',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${color}1e`,
            outline: 'none',
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            color: LABEL,
            opacity: 0.7,
            padding: '4px 0',
            letterSpacing: '0.04em',
          }}
        />
        {val.trim() && (
          <button
            type="button"
            onClick={submit}
            style={{
              background: 'none',
              border: 'none',
              color,
              fontSize: 16,
              cursor: 'pointer',
              padding: '0 2px',
              flexShrink: 0,
              opacity: 0.75,
            }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Compartment card ────────────────────────────────────────── */
function CompartmentCard({
  comp,
  channelColor,
  onUpdate,
  onDelete,
}: {
  comp: Compartment;
  channelColor: string;
  onUpdate: (c: Compartment) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(comp.title);

  function updateSteps(steps: Step[]) {
    onUpdate({ ...comp, steps });
  }

  function addStep(text: string) {
    updateSteps([...comp.steps, { id: uid(), text, done: false }]);
  }

  function toggleStep(id: string) {
    updateSteps(comp.steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  function deleteStep(id: string) {
    updateSteps(comp.steps.filter((s) => s.id !== id));
  }

  const done = comp.steps.filter((s) => s.done).length;

  return (
    <div
      style={{
        background: `${channelColor}07`,
        borderRadius: 10,
        border: `1px solid ${channelColor}1e`,
        marginBottom: 6,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <input
          type="text"
          value={editTitle}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            setEditTitle(e.target.value);
            onUpdate({ ...comp, title: e.target.value });
          }}
          placeholder="compartment…"
          spellCheck={false}
          autoCorrect="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: channelColor,
            opacity: 0.85,
            cursor: 'text',
          }}
        />
        {comp.steps.length > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: LABEL,
              opacity: 0.45,
              flexShrink: 0,
            }}
          >
            {done}/{comp.steps.length}
          </span>
        )}
        {/* Activate for today */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ ...comp, linkedToDay: !comp.linkedToDay });
          }}
          title={comp.linkedToDay ? 'Remove from today' : 'Work on this today'}
          style={{
            background: comp.linkedToDay ? `${channelColor}22` : 'none',
            border: `1px solid ${comp.linkedToDay ? `${channelColor}88` : `${channelColor}30`}`,
            borderRadius: 999,
            padding: '2px 8px',
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            letterSpacing: '0.1em',
            color: comp.linkedToDay ? channelColor : `${channelColor}88`,
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {comp.linkedToDay ? '● today' : '→ today'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: LABEL,
            opacity: 0.25,
            cursor: 'pointer',
            fontSize: 13,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
        >
          ×
        </button>
        <span
          style={{
            color: channelColor,
            opacity: 0.4,
            fontSize: 10,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 10px' }}>
          <StepList
            steps={comp.steps}
            onToggle={toggleStep}
            onDelete={deleteStep}
            onAdd={addStep}
            color={channelColor}
          />
        </div>
      )}
    </div>
  );
}

/* ── Channel card ────────────────────────────────────────────── */
function ChannelCard({
  channel,
  onUpdate,
  onDelete,
}: {
  channel: Channel;
  onUpdate: (c: Channel) => void;
  onDelete: () => void;
}) {
  const [missionText, setMissionText] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [areaMissions, setAreaMissions] = useState<AreaMission[]>(() =>
    uniqueMissions(readJson<AreaMission[]>(MISSIONS_KEY, [])).filter(
      (mission) => mission.tag?.categoryId === channel.id,
    ),
  );

  useEffect(() => {
    function refreshAreaMissions() {
      setAreaMissions(
        uniqueMissions(readJson<AreaMission[]>(MISSIONS_KEY, [])).filter(
          (mission) => mission.tag?.categoryId === channel.id,
        ),
      );
    }
    refreshAreaMissions();
    window.addEventListener('colourmap:missions-updated', refreshAreaMissions);
    return () => window.removeEventListener('colourmap:missions-updated', refreshAreaMissions);
  }, [channel.id]);

  function toggle() {
    onUpdate({ ...channel, open: !channel.open });
  }

  function addAreaMission() {
    const text = missionText.trim();
    if (!text) return;
    const all = uniqueMissions(readJson<AreaMission[]>(MISSIONS_KEY, []));
    const alreadyExists = all.some(
      (mission) =>
        mission.tag?.categoryId === channel.id &&
        mission.text.trim().toLocaleLowerCase() === text.toLocaleLowerCase(),
    );
    if (alreadyExists) {
      setMissionText('');
      setAreaMissions(all.filter((mission) => mission.tag?.categoryId === channel.id));
      persistAreaMissions(all);
      return;
    }
    const next: AreaMission[] = [
      ...all,
      {
        id: uid(),
        text,
        done: false,
        createdAt: new Date().toISOString(),
        tag: {
          name: channel.title || 'Area',
          color: channel.color,
          categoryId: channel.id,
        },
      },
    ];
    persistAreaMissions(next);
    setMissionText('');
    setAreaMissions(next.filter((mission) => mission.tag?.categoryId === channel.id));
  }

  function toggleAreaMission(missionId: string) {
    const all = uniqueMissions(readJson<AreaMission[]>(MISSIONS_KEY, []));
    const next = all.map((mission) =>
      mission.id === missionId ? { ...mission, done: !mission.done } : mission,
    );
    persistAreaMissions(next);
    setAreaMissions(next.filter((mission) => mission.tag?.categoryId === channel.id));
  }

  function addCompartment() {
    const comp: Compartment = { id: uid(), title: '', steps: [] };
    onUpdate({ ...channel, compartments: [...channel.compartments, comp] });
  }

  function updateComp(cid: string, c: Compartment) {
    onUpdate({
      ...channel,
      compartments: channel.compartments.map((x) => (x.id === cid ? c : x)),
    });
  }

  function deleteComp(cid: string) {
    onUpdate({
      ...channel,
      compartments: channel.compartments.filter((x) => x.id !== cid),
    });
  }

  const totalSteps = channel.compartments.reduce((acc, c) => acc + c.steps.length, 0);
  const doneSteps = channel.compartments.reduce(
    (acc, c) => acc + c.steps.filter((s) => s.done).length,
    0,
  );

  return (
    <div
      style={{
        border: `1px solid ${channel.color}35`,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        background: `${channel.color}05`,
      }}
    >
      {/* Channel header */}
      <div
        onClick={toggle}
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          background: `${channel.color}0f`,
          borderBottom: channel.open ? `1px solid ${channel.color}1e` : 'none',
        }}
      >
        <button
          type="button"
          aria-label={`Change ${channel.title || 'area'} color`}
          onClick={(e) => {
            e.stopPropagation();
            setPaletteOpen((value) => !value);
          }}
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `1.5px solid color-mix(in srgb, ${channel.color} 72%, white)`,
            background: channel.color,
            flexShrink: 0,
            cursor: 'pointer',
            padding: 0,
            boxShadow: `0 0 0 4px ${channel.color}18`,
          }}
        />

        {channel.fixed ? (
          <span
            style={{
              flex: 1,
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: channel.color,
            }}
          >
            {channel.title}
          </span>
        ) : (
          <input
            type="text"
            value={channel.title}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ ...channel, title: e.target.value })}
            placeholder="channel…"
            spellCheck={false}
            autoCorrect="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: channel.color,
              cursor: 'text',
            }}
          />
        )}

        {totalSteps > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: LABEL,
              opacity: 0.4,
              flexShrink: 0,
            }}
          >
            {doneSteps}/{totalSteps}
          </span>
        )}

        {!channel.fixed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: LABEL,
              opacity: 0.22,
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}

        <span
          style={{
            color: channel.color,
            opacity: 0.45,
            fontSize: 11,
            transform: channel.open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </div>

      {/* Compartments */}
      {channel.open && (
        <div style={{ padding: '10px 12px' }}>
          {paletteOpen && (
            <div
              style={{
                border: `1px solid ${channel.color}30`,
                borderRadius: 12,
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--card) 84%, transparent), color-mix(in srgb, var(--background) 72%, transparent))',
                padding: 10,
                marginBottom: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {AREA_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use area color ${color}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpdate({ ...channel, color });
                    setPaletteOpen(false);
                  }}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    minHeight: 28,
                    borderRadius: 9,
                    border:
                      color === channel.color
                        ? '2px solid var(--foreground)'
                        : '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)',
                    background: color,
                    boxShadow:
                      color === channel.color ? `0 0 18px ${color}70` : `0 4px 12px ${color}22`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
          <div
            style={{
              border: `1px solid ${channel.color}24`,
              borderRadius: 10,
              background: `${channel.color}08`,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                fontWeight: 900,
                color: BROWN,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Missions in this area
            </div>
            {areaMissions.length > 0 && (
              <div style={{ display: 'grid', gap: 6, marginBottom: 9 }}>
                {areaMissions.slice(0, 5).map((mission) => (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => toggleAreaMission(mission.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      border: `1px solid ${channel.color}26`,
                      borderRadius: 8,
                      background: mission.done ? `${channel.color}0a` : 'rgba(255,255,255,0.035)',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: `1.5px solid ${channel.color}`,
                        background: mission.done ? channel.color : 'transparent',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.25,
                        color: BROWN,
                        textDecoration: mission.done ? 'line-through' : 'none',
                        opacity: mission.done ? 0.55 : 1,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {mission.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                addAreaMission();
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                value={missionText}
                onChange={(event) => setMissionText(event.target.value)}
                placeholder="Add mission in this area..."
                spellCheck={false}
                autoCorrect="off"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: `1px solid ${channel.color}24`,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  color: BROWN,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  padding: '9px 10px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!missionText.trim()}
                style={{
                  border: `1px solid ${channel.color}44`,
                  borderRadius: 8,
                  background: missionText.trim() ? `${channel.color}18` : 'transparent',
                  color: BROWN,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  fontWeight: 900,
                  padding: '0 12px',
                  cursor: missionText.trim() ? 'pointer' : 'default',
                  opacity: missionText.trim() ? 1 : 0.45,
                }}
              >
                Add
              </button>
            </form>
          </div>

          {channel.compartments.map((comp) => (
            <CompartmentCard
              key={comp.id}
              comp={comp}
              channelColor={channel.color}
              onUpdate={(c) => updateComp(comp.id, c)}
              onDelete={() => deleteComp(comp.id)}
            />
          ))}

          <button
            type="button"
            onClick={addCompartment}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              background: 'none',
              border: `1px dashed ${channel.color}28`,
              borderRadius: 8,
              padding: '6px 0',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: channel.color,
              opacity: 0.5,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            + compartment
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Idea card (unchanneled) ─────────────────────────────────── */
function IdeaCard({
  idea,
  onUpdate,
  onDelete,
}: {
  idea: Idea;
  onUpdate: (i: Idea) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  function addStep(text: string) {
    onUpdate({ ...idea, steps: [...idea.steps, { id: uid(), text, done: false }] });
  }

  function toggleStep(id: string) {
    onUpdate({
      ...idea,
      steps: idea.steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    });
  }

  function deleteStep(id: string) {
    onUpdate({ ...idea, steps: idea.steps.filter((s) => s.id !== id) });
  }

  return (
    <div
      style={{
        border: `1px solid rgba(196,160,96,0.18)`,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 6,
        background: CARD_BG,
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <span style={{ color: OCHRE, opacity: 0.35, fontSize: 14, flexShrink: 0 }}>·</span>

        <input
          type="text"
          value={idea.title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ ...idea, title: e.target.value })}
          placeholder="idea…"
          spellCheck={false}
          autoCorrect="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: BROWN,
            cursor: 'text',
          }}
        />

        {idea.steps.length > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: LABEL,
              opacity: 0.4,
              flexShrink: 0,
            }}
          >
            {idea.steps.filter((s) => s.done).length}/{idea.steps.length}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: LABEL,
            opacity: 0.25,
            cursor: 'pointer',
            fontSize: 13,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
        >
          ×
        </button>

        <span
          style={{
            color: OCHRE,
            opacity: 0.35,
            fontSize: 10,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 12px 10px' }}>
          <StepList
            steps={idea.steps}
            onToggle={toggleStep}
            onDelete={deleteStep}
            onAdd={addStep}
          />
        </div>
      )}
    </div>
  );
}

/* ── Section label ───────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: LABEL,
        opacity: 0.45,
        marginBottom: 8,
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
}

/* ── Main panel ──────────────────────────────────────────────── */
export default function ColourMapPanel({
  surfaceMode = 'sober',
}: {
  surfaceMode?: 'sober' | 'image';
}) {
  const [data, setData] = useState<CMapData>(defaultData());
  const imageMode = surfaceMode === 'image';
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'dots'>('list');
  const [selectedDot, setSelectedDot] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (['ColourMap', 'Branches', 'Channels'].includes(parsed.title)) {
            parsed.title = 'Areas';
          }
          parsed.channels = (parsed.channels ?? []).filter((c: Channel) => !c.fixed);
          localStorage.setItem(LS_KEY, JSON.stringify(parsed));
          setData(parsed);
        }
      } catch {}
    }
    load();
    window.addEventListener('colourmap:cmap-updated', load);
    return () => window.removeEventListener('colourmap:cmap-updated', load);
  }, []);

  function persist(next: CMapData) {
    setData(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}
    syncPref(LS_KEY, next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('colourmap:cmap-updated'));
    }
  }

  function addChannel() {
    const colorIdx = data.channels.length % CHANNEL_COLORS.length;
    const ch: Channel = {
      id: uid(),
      title: 'new channel',
      color: CHANNEL_COLORS[colorIdx],
      open: true,
      compartments: [],
    };
    persist({ ...data, channels: [...data.channels, ch] });
  }

  function updateChannel(id: string, ch: Channel) {
    syncAreaMissionTag(ch);
    persist({ ...data, channels: data.channels.map((x) => (x.id === id ? ch : x)) });
  }

  function deleteChannel(id: string) {
    persist({ ...data, channels: data.channels.filter((x) => x.id !== id && !x.fixed) });
  }

  function addIdea() {
    const idea: Idea = { id: uid(), title: '', steps: [] };
    persist({ ...data, ideas: [...data.ideas, idea] });
  }

  function updateIdea(id: string, idea: Idea) {
    persist({ ...data, ideas: data.ideas.map((x) => (x.id === id ? idea : x)) });
  }

  function deleteIdea(id: string) {
    persist({ ...data, ideas: data.ideas.filter((x) => x.id !== id) });
  }

  const totalChannelSteps = data.channels.reduce(
    (a, ch) => a + ch.compartments.reduce((b, c) => b + c.steps.length, 0),
    0,
  );
  const doneChannelSteps = data.channels.reduce(
    (a, ch) => a + ch.compartments.reduce((b, c) => b + c.steps.filter((s) => s.done).length, 0),
    0,
  );

  return (
    <div
      style={{
        border: imageMode
          ? '1px solid rgba(240,216,152,0.18)'
          : `1px solid var(--panel-border, rgba(196,160,96,0.18))`,
        borderRadius: imageMode ? 0 : 14,
        background: imageMode
          ? 'rgba(255,244,204,0.06)'
          : 'var(--collapsible-shell-bg, var(--palette-l3-bg, rgba(10,6,3,0.6)))',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      {
        <div
          onClick={() => setOpen((v) => !v)}
          style={{
            padding: '14px 18px',
            backgroundColor: imageMode
              ? 'rgba(255,244,204,0.06)'
              : 'var(--palette-l3-bg, rgba(30,16,8,0.55))',
            backgroundImage: imageMode
              ? undefined
              : 'linear-gradient(90deg, color-mix(in srgb, var(--palette-l3-bg, rgba(30,16,8,0.55)) 94%, transparent), color-mix(in srgb, var(--palette-l3-bg, rgba(30,16,8,0.55)) 58%, transparent)), url("/emotions/pills/areas.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 48%',
            borderBottom: open ? `1px solid rgba(196,160,96,0.15)` : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* view toggle — left side as dots */}
          <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 2 }}>
            {open &&
              (
                [
                  ['list', 'V'],
                  ['dots', 'H'],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setView(v);
                  }}
                  style={{
                    minHeight: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      view === v
                        ? 'color-mix(in srgb, var(--card) 78%, transparent)'
                        : 'transparent',
                    border:
                      view === v
                        ? '1px solid color-mix(in srgb, var(--foreground) 22%, transparent)'
                        : '1px solid transparent',
                    borderRadius: 999,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    minWidth: 34,
                    color: view === v ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {label}
                </button>
              ))}
          </span>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 15,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--palette-panel-text, rgba(196,160,96,0.82))',
              }}
            >
              Areas
            </div>
            {totalChannelSteps > 0 && (
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 10,
                  color: LABEL,
                  opacity: 0.45,
                  marginTop: 1,
                  letterSpacing: '0.06em',
                }}
              >
                {doneChannelSteps}/{totalChannelSteps} steps
              </div>
            )}
          </div>
          <span
            style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
          >
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
      }

      {open && view === 'list' && (
        <div
          style={{
            padding: '14px 14px 10px',
            background: 'var(--collapsible-open-bg, transparent)',
          }}
        >
          {data.channels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onUpdate={(c) => updateChannel(ch.id, c)}
              onDelete={() => deleteChannel(ch.id)}
            />
          ))}

          <button
            type="button"
            onClick={addChannel}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              background: 'none',
              border: `1px dashed rgba(196,160,96,0.22)`,
              borderRadius: 10,
              padding: '10px 0',
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              fontWeight: 900,
              color: OCHRE,
              opacity: 0.8,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              marginBottom: 18,
            }}
          >
            Add area
          </button>

          <SectionLabel label="Ideas" />

          {data.ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdate={(i) => updateIdea(idea.id, i)}
              onDelete={() => deleteIdea(idea.id)}
            />
          ))}

          <button
            type="button"
            onClick={addIdea}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              background: 'none',
              border: 'none',
              padding: '5px 0',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: OCHRE,
              opacity: 0.4,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            + idea
          </button>
        </div>
      )}

      {open && view === 'dots' && (
        <div
          style={{
            padding: '18px 14px 12px',
            background: 'var(--collapsible-open-bg, transparent)',
          }}
        >
          {/* ── Horizontal orbit row ── */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            {/* dots */}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {data.channels.map((ch) => {
                const isSel = selectedDot === ch.id;
                const done = ch.compartments.reduce(
                  (a, c) => a + c.steps.filter((s) => s.done).length,
                  0,
                );
                const total = ch.compartments.reduce((a, c) => a + c.steps.length, 0);
                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedDot(isSel ? null : ch.id)}
                    style={{
                      flex: '0 0 92px',
                      width: 92,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 9,
                      cursor: 'pointer',
                      paddingTop: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: '50%',
                        background: isSel ? `${ch.color}28` : `${ch.color}12`,
                        border: `2px solid ${isSel ? ch.color : `${ch.color}50`}`,
                        boxShadow: isSel ? `0 0 16px ${ch.color}40` : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {total > 0 && (
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 12,
                            color: 'var(--foreground)',
                            opacity: 0.9,
                            fontWeight: 900,
                          }}
                        >
                          {done}/{total}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 14,
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        color: 'var(--foreground)',
                        opacity: isSel ? 1 : 0.78,
                        textAlign: 'center',
                        maxWidth: 92,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        lineHeight: 1.1,
                      }}
                    >
                      {ch.title || '—'}
                    </span>
                  </div>
                );
              })}

              {/* add dot */}
              <div
                onClick={addChannel}
                style={{
                  flex: '0 0 92px',
                  width: 92,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 9,
                  cursor: 'pointer',
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    border: '1.5px dashed rgba(196,160,96,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: OCHRE, opacity: 0.58, fontSize: 26, lineHeight: 1 }}>
                    +
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 14,
                    fontWeight: 900,
                    color: OCHRE,
                    opacity: 0.72,
                    letterSpacing: '0.02em',
                    textAlign: 'center',
                    width: 92,
                    lineHeight: 1.1,
                  }}
                >
                  Add area
                </span>
              </div>
            </div>
          </div>

          {/* selected channel detail */}
          {selectedDot &&
            (() => {
              const ch = data.channels.find((c) => c.id === selectedDot);
              if (!ch) return null;
              return (
                <ChannelCard
                  key={ch.id}
                  channel={{ ...ch, open: true }}
                  onUpdate={(c) => updateChannel(ch.id, c)}
                  onDelete={() => {
                    deleteChannel(ch.id);
                    setSelectedDot(null);
                  }}
                />
              );
            })()}

          {/* Ideas */}
          <SectionLabel label="Ideas" />

          {data.ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpdate={(i) => updateIdea(idea.id, i)}
              onDelete={() => deleteIdea(idea.id)}
            />
          ))}

          <button
            type="button"
            onClick={addIdea}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              background: 'none',
              border: 'none',
              padding: '5px 0',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: OCHRE,
              opacity: 0.4,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            + idea
          </button>
        </div>
      )}
    </div>
  );
}
