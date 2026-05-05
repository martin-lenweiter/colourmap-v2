'use client';

import { useState } from 'react';

/* ── PulseDots — three zen circles, one tap cycles dim → half → full ──
   One set per axis: Body/Heart/Mind · Clarity/Drive/Progress · Closeness/Expression/Nourishment
   Closed by default (three whisper-thin trigger dots). */

type PulseAxis = 'feeling' | 'doing' | 'sharing';

const AXIS_COLORS: Record<PulseAxis, string> = {
  feeling: '#D4805A',
  doing: '#6890B0',
  sharing: '#6B7F4E',
};

const PULSE_DIMS: Record<PulseAxis, { key: string; label: string }[]> = {
  feeling: [
    { key: 'body', label: 'Body' },
    { key: 'heart', label: 'Heart' },
    { key: 'mind', label: 'Mind' },
  ],
  doing: [
    { key: 'clarity', label: 'Clarity' },
    { key: 'drive', label: 'Drive' },
    { key: 'progress', label: 'Progress' },
  ],
  sharing: [
    { key: 'closeness', label: 'Closeness' },
    { key: 'expression', label: 'Expression' },
    { key: 'nourishment', label: 'Nourishment' },
  ],
};

const LS_PULSE = 'colourmap:fds-pulse';
const font = 'var(--font-serif)';

export default function PulseDots({ axisKey }: { axisKey: PulseAxis }) {
  const color = AXIS_COLORS[axisKey];
  const dims = PULSE_DIMS[axisKey];

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, 0 | 1 | 2>>(() => {
    try {
      const raw = localStorage.getItem(LS_PULSE);
      const all = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
      return (all[axisKey] ?? {}) as Record<string, 0 | 1 | 2>;
    } catch {
      return {};
    }
  });

  function cycle(key: string) {
    const next = (((values[key] ?? 0) + 1) % 3) as 0 | 1 | 2;
    const updated = { ...values, [key]: next };
    setValues(updated);
    try {
      const raw = localStorage.getItem(LS_PULSE);
      const all = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
      localStorage.setItem(LS_PULSE, JSON.stringify({ ...all, [axisKey]: updated }));
    } catch {}
  }

  return (
    <div className="flex flex-col items-center py-1">
      {/* Trigger — three whisper-thin dots */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 7,
        }}
        title="Pulse"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: open ? 5 : 4,
              height: open ? 5 : 4,
              borderRadius: '50%',
              background: open ? color : `${color}88`,
              opacity: open ? 1 - i * 0.18 : 0.28,
              transition: 'all 0.22s',
            }}
          />
        ))}
      </button>

      {/* Three zen circles */}
      {open && (
        <div
          className="flex flex-col items-center gap-9 pb-6 pt-2 animate-in fade-in duration-400"
          style={{ minWidth: 80 }}
        >
          {dims.map(({ key, label }, i) => {
            const val = values[key] ?? 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => cycle(key)}
                className="flex flex-col items-center gap-2.5 cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  animationDelay: `${i * 55}ms`,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background:
                      val === 2
                        ? `radial-gradient(circle, ${color}28 0%, ${color}0A 65%, transparent 100%)`
                        : val === 1
                          ? `${color}0C`
                          : 'transparent',
                    border: `${val === 2 ? 1.5 : 1}px solid ${
                      val === 2 ? color : val === 1 ? `${color}55` : `${color}1A`
                    }`,
                    boxShadow:
                      val === 2
                        ? `0 0 36px -10px ${color}65, inset 0 0 18px -10px ${color}30`
                        : 'none',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <span
                  style={{
                    fontFamily: font,
                    fontSize: 9,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color,
                    opacity: val === 2 ? 0.75 : val === 1 ? 0.5 : 0.25,
                    transition: 'opacity 0.35s',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
