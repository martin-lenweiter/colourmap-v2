'use client';

import { useEffect, useState } from 'react';

import {
  type AxisKey,
  type EodChoice,
  type EodClose,
  getHistory,
  getTodayPulse,
  saveHistory,
  todayKey,
} from '@/components/WeeklyRhythmView';

const AXIS_COLORS: Record<AxisKey, string> = {
  feeling: '#D4805A',
  doing: '#6890B0',
  sharing: '#6B7F4E',
};

const AXES: AxisKey[] = ['feeling', 'doing', 'sharing'];

const CHOICES: { id: EodChoice; label: string }[] = [
  { id: 'landed', label: 'Landed' },
  { id: 'partly', label: 'Partly' },
  { id: 'missed', label: 'Missed' },
];

interface Props {
  onSaved?: () => void;
}

export default function EndOfDayClose({ onSaved }: Props) {
  const [choices, setChoices] = useState<Record<AxisKey, EodChoice>>({
    feeling: 'landed',
    doing: 'landed',
    sharing: 'landed',
  });
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState<EodClose | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const h = getHistory();
    const snap = h[todayKey()];
    if (snap?.eod) {
      setExisting(snap.eod);
      setChoices({
        feeling: snap.eod.feeling,
        doing: snap.eod.doing,
        sharing: snap.eod.sharing,
      });
      setNote(snap.eod.note ?? '');
    }
  }, []);

  function handleSave() {
    const pulse = getTodayPulse();
    const h = getHistory();
    const date = todayKey();
    const eod: EodClose = {
      feeling: choices.feeling,
      doing: choices.doing,
      sharing: choices.sharing,
      note: note.trim() || undefined,
      closedAt: new Date().toISOString(),
    };
    h[date] = { ...(h[date] ?? {}), eod, ...(pulse ? { pulse } : {}) };
    saveHistory(h);
    setExisting(eod);
    setEditing(false);
    setSaved(true);
    onSaved?.();
    setTimeout(() => setSaved(false), 1800);
  }

  // Compact "closed" state
  if (existing && !editing) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderTop: '1px solid rgba(90,60,30,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: '#7A5438',
              opacity: 0.55,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            day closed
          </span>
          {AXES.map((axis) => (
            <span
              key={axis}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                color: AXIS_COLORS[axis],
                opacity: 0.85,
                letterSpacing: '0.04em',
              }}
            >
              {existing[axis]}
            </span>
          ))}
          {existing.note && (
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 10,
                color: '#8A6A4A',
                opacity: 0.55,
              }}
            >
              · {existing.note}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 9,
            color: '#8A6A4A',
            opacity: 0.4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          edit
        </button>
      </div>
    );
  }

  // Close form
  return (
    <div
      className="space-y-3"
      style={{ borderTop: '1px solid rgba(90,60,30,0.08)', paddingTop: 12 }}
    >
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#7A5438',
          opacity: 0.55,
        }}
      >
        close today
      </p>

      {/* Axis rows */}
      {AXES.map((axis) => (
        <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: AXIS_COLORS[axis],
              width: 54,
              fontWeight: 600,
              textTransform: 'capitalize',
              opacity: 0.9,
            }}
          >
            {axis}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {CHOICES.map(({ id, label }) => {
              const isOn = choices[axis] === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChoices((prev) => ({ ...prev, [axis]: id }))}
                  style={{
                    background: isOn ? `${AXIS_COLORS[axis]}14` : 'transparent',
                    border: `1px solid ${isOn ? `${AXIS_COLORS[axis]}55` : 'rgba(90,60,30,0.1)'}`,
                    borderRadius: 99,
                    padding: '3px 10px',
                    color: isOn ? AXIS_COLORS[axis] : '#8A6A4A',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 10,
                    fontWeight: isOn ? 700 : 500,
                    opacity: isOn ? 1 : 0.42,
                    cursor: 'pointer',
                    letterSpacing: '0.06em',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Note */}
      <input
        type="text"
        placeholder="one word for today — optional"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={80}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(90,60,30,0.1)',
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 12,
          color: '#5C3018',
          padding: '4px 0',
          outline: 'none',
          opacity: 0.65,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 9,
              color: '#8A6A4A',
              opacity: 0.4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          style={{
            background: saved ? '#7AAA5815' : '#C4A06012',
            border: `1px solid ${saved ? '#7AAA5840' : '#C4A06038'}`,
            borderRadius: 99,
            padding: '6px 20px',
            color: saved ? '#7AAA58' : '#7A5438',
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            transition: 'all 0.25s',
          }}
        >
          {saved ? '✓ saved' : 'close day'}
        </button>
      </div>
    </div>
  );
}
