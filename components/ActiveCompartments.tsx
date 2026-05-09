'use client';

import { useEffect, useState } from 'react';
import { syncPref } from '@/lib/sync';

/* ── Tokens ──────────────────────────────────────────────────── */
const BROWN = '#5C3018';
const LABEL = '#8A6A4A';

/* ── Types (must match ColourMapPanel) ───────────────────────── */
type Step = { id: string; text: string; done: boolean };
type Compartment = { id: string; title: string; steps: Step[]; linkedToDay?: boolean };
type Channel = {
  id: string;
  title: string;
  color: string;
  open: boolean;
  compartments: Compartment[];
};
interface CMapData {
  title: string;
  channels: Channel[];
  ideas: never[];
}

const LS_KEY = 'colourmap:cmap-data';

function readData(): CMapData | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeData(next: CMapData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
  syncPref(LS_KEY, next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('colourmap:cmap-updated'));
  }
}

/* Patch a single compartment's steps in the full data tree */
function patchSteps(data: CMapData, channelId: string, compId: string, steps: Step[]): CMapData {
  return {
    ...data,
    channels: data.channels.map((ch) =>
      ch.id !== channelId
        ? ch
        : {
            ...ch,
            compartments: ch.compartments.map((c) => (c.id !== compId ? c : { ...c, steps })),
          },
    ),
  };
}

/* Deactivate a compartment (remove from today) */
function patchLinked(data: CMapData, channelId: string, compId: string, linked: boolean): CMapData {
  return {
    ...data,
    channels: data.channels.map((ch) =>
      ch.id !== channelId
        ? ch
        : {
            ...ch,
            compartments: ch.compartments.map((c) =>
              c.id !== compId ? c : { ...c, linkedToDay: linked },
            ),
          },
    ),
  };
}

/* ── Step row ────────────────────────────────────────────────── */
function StepRow({
  step,
  color,
  onToggle,
  isLast,
}: {
  step: Step;
  color: string;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0,
        marginBottom: isLast ? 0 : 5,
      }}
    >
      {/* dot on line */}
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
          onClick={onToggle}
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            border: `1.5px solid ${step.done ? color : `${color}55`}`,
            background: step.done ? color : 'transparent',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.15s',
          }}
        />
      </div>
      {/* box */}
      <div
        style={{
          flex: 1,
          background: step.done ? `${color}0a` : `${color}07`,
          border: `1px solid ${step.done ? `${color}38` : `${color}16`}`,
          borderRadius: 8,
          padding: '7px 10px',
          transition: 'all 0.15s',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: step.done ? LABEL : BROWN,
            textDecoration: step.done ? 'line-through' : 'none',
            opacity: step.done ? 0.5 : 1,
            lineHeight: 1.4,
          }}
        >
          {step.text}
        </span>
      </div>
    </div>
  );
}

/* ── Active compartment card ─────────────────────────────────── */
function ActiveCard({
  channel,
  comp,
  onToggleStep,
  onDeactivate,
}: {
  channel: Channel;
  comp: Compartment;
  onToggleStep: (stepId: string) => void;
  onDeactivate: () => void;
}) {
  const [open, setOpen] = useState(true);
  const done = comp.steps.filter((s) => s.done).length;
  const total = comp.steps.length;
  const allDone = total > 0 && done === total;

  return (
    <div
      style={{
        border: `1px solid ${channel.color}${allDone ? '55' : '30'}`,
        borderRadius: 12,
        overflow: 'hidden',
        background: `${channel.color}06`,
        transition: 'border-color 0.3s',
      }}
    >
      {/* header */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          background: `${channel.color}0e`,
          borderBottom: open ? `1px solid ${channel.color}1a` : 'none',
        }}
      >
        {/* channel color dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: channel.color,
            flexShrink: 0,
            opacity: 0.7,
          }}
        />
        {/* channel name */}
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: channel.color,
            opacity: 0.65,
            flexShrink: 0,
          }}
        >
          {channel.title || 'Channel'}
        </span>
        {/* divider */}
        <span style={{ color: channel.color, opacity: 0.25, fontSize: 10, flexShrink: 0 }}>·</span>
        {/* compartment name */}
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 600,
            color: allDone ? channel.color : BROWN,
            textDecoration: allDone ? 'line-through' : 'none',
            opacity: allDone ? 0.6 : 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {comp.title || 'Compartment'}
        </span>
        {/* progress */}
        {total > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: LABEL,
              opacity: 0.45,
              flexShrink: 0,
            }}
          >
            {done}/{total}
          </span>
        )}
        {/* remove from today */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeactivate();
          }}
          title="Remove from today"
          style={{
            background: 'none',
            border: 'none',
            color: LABEL,
            opacity: 0.3,
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
            color: channel.color,
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

      {/* step list */}
      {open && total > 0 && (
        <div style={{ padding: '10px 12px', position: 'relative' }}>
          {/* connector line */}
          {total > 1 && (
            <div
              style={{
                position: 'absolute',
                left: 22,
                top: 16,
                bottom: 16,
                width: 1,
                background: `${channel.color}28`,
                pointerEvents: 'none',
              }}
            />
          )}
          {comp.steps.map((s, i) => (
            <StepRow
              key={s.id}
              step={s}
              color={channel.color}
              onToggle={() => onToggleStep(s.id)}
              isLast={i === comp.steps.length - 1}
            />
          ))}
        </div>
      )}

      {open && total === 0 && (
        <div
          style={{
            padding: '10px 14px',
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            fontStyle: 'italic',
            color: LABEL,
            opacity: 0.4,
          }}
        >
          no steps yet — add them in ColourMap
        </div>
      )}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function ActiveCompartments() {
  const [data, setData] = useState<CMapData | null>(null);

  useEffect(() => {
    function load() {
      const d = readData();
      setData(d);
    }
    load();
    window.addEventListener('colourmap:cmap-updated', load);
    return () => window.removeEventListener('colourmap:cmap-updated', load);
  }, []);

  if (!data) return null;

  /* collect all linked compartments with their channel context */
  const active: { channel: Channel; comp: Compartment }[] = [];
  for (const ch of data.channels) {
    for (const comp of ch.compartments) {
      if (comp.linkedToDay) active.push({ channel: ch, comp });
    }
  }

  if (active.length === 0) return null;

  function toggleStep(channelId: string, compId: string, stepId: string) {
    if (!data) return;
    const ch = data.channels.find((c) => c.id === channelId);
    const comp = ch?.compartments.find((c) => c.id === compId);
    if (!comp) return;
    const steps = comp.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
    const next = patchSteps(data, channelId, compId, steps);
    setData(next);
    writeData(next);
  }

  function deactivate(channelId: string, compId: string) {
    if (!data) return;
    const next = patchLinked(data, channelId, compId, false);
    setData(next);
    writeData(next);
  }

  return (
    <div
      style={{
        border: `1px solid rgba(196,160,96,0.2)`,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(196,160,96,0.1)',
          borderBottom: `1px solid rgba(196,160,96,0.13)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#5C3018',
          }}
        >
          Active Today
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            color: LABEL,
            opacity: 0.45,
          }}
        >
          {active.length} {active.length === 1 ? 'compartment' : 'compartments'}
        </span>
      </div>

      {/* cards */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.map(({ channel, comp }) => (
          <ActiveCard
            key={comp.id}
            channel={channel}
            comp={comp}
            onToggleStep={(stepId) => toggleStep(channel.id, comp.id, stepId)}
            onDeactivate={() => deactivate(channel.id, comp.id)}
          />
        ))}
      </div>
    </div>
  );
}
