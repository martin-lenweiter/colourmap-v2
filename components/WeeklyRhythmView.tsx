'use client';

import { useEffect, useState } from 'react';

export const LS_FDS_PULSE = 'colourmap:fds-pulse';
export const LS_FDS_HISTORY = 'colourmap:fds-history';

export type AxisKey = 'feeling' | 'doing' | 'sharing';
export type EodChoice = 'landed' | 'partly' | 'missed';

export interface EodClose {
  feeling: EodChoice;
  doing: EodChoice;
  sharing: EodChoice;
  note?: string;
  closedAt: string;
}

export interface DaySnapshot {
  pulse?: Record<AxisKey, Record<string, number>>;
  eod?: EodClose;
}

export type HistoryStore = Record<string, DaySnapshot>;

const AXIS_COLORS: Record<AxisKey, string> = {
  feeling: '#D4805A',
  doing: '#6890B0',
  sharing: '#6B7F4E',
};

const AXES: AxisKey[] = ['feeling', 'doing', 'sharing'];

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getHistory(): HistoryStore {
  try {
    const raw = localStorage.getItem(LS_FDS_HISTORY);
    return raw ? (JSON.parse(raw) as HistoryStore) : {};
  } catch {
    return {};
  }
}

export function saveHistory(h: HistoryStore) {
  try {
    localStorage.setItem(LS_FDS_HISTORY, JSON.stringify(h));
  } catch {}
}

export function getTodayPulse(): Record<AxisKey, Record<string, number>> | null {
  try {
    const raw = localStorage.getItem(LS_FDS_PULSE);
    return raw ? (JSON.parse(raw) as Record<AxisKey, Record<string, number>>) : null;
  } catch {
    return null;
  }
}

function avgPulse(dims: Record<string, number>): number {
  const vals = Object.values(dims);
  if (!vals.length) return 2;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function dayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
}

const EOD_OPACITY: Record<EodChoice, number> = { landed: 1, partly: 0.5, missed: 0.18 };

interface Props {
  refreshKey?: number;
}

export default function WeeklyRhythmView({ refreshKey = 0 }: Props) {
  const [history, setHistory] = useState<HistoryStore>({});
  const [todayPulse, setTodayPulse] = useState<Record<AxisKey, Record<string, number>> | null>(
    null,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is an intentional external trigger
  useEffect(() => {
    setHistory(getHistory());
    setTodayPulse(getTodayPulse());
  }, [refreshKey]);

  const days = getLast7Days();
  const todayStr = todayKey();

  return (
    <div className="space-y-3">
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
        7-day rhythm
      </p>

      {/* Grid: 7 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((date) => {
          const isToday = date === todayStr;
          const snapshot = history[date];
          const pulse = isToday ? todayPulse : (snapshot?.pulse ?? null);
          const eod = snapshot?.eod ?? null;

          return (
            <div
              key={date}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
            >
              {/* Day label */}
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 9,
                  color: '#7A5438',
                  opacity: isToday ? 1 : 0.45,
                  fontWeight: isToday ? 700 : 500,
                  letterSpacing: '0.06em',
                }}
              >
                {dayLabel(date)}
              </span>

              {/* F / D / S dots */}
              {AXES.map((axis) => {
                const dims = pulse?.[axis];
                const avg = dims ? avgPulse(dims) : null;
                const opacity = avg !== null ? 0.15 + (avg / 4) * 0.82 : 0.07;
                const eodChoice = eod?.[axis];
                const eodO = eodChoice ? EOD_OPACITY[eodChoice] : null;
                return (
                  <div
                    key={axis}
                    title={`${axis}: ${avg !== null ? avg.toFixed(1) : '—'}`}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: AXIS_COLORS[axis],
                      opacity: eodO !== null ? eodO * 0.9 : opacity,
                      transition: 'opacity 0.3s',
                      outline: isToday ? `1.5px solid ${AXIS_COLORS[axis]}40` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                );
              })}

              {/* EOD close tick */}
              <span
                style={{
                  fontSize: 9,
                  color: '#7A5438',
                  opacity: eod ? 0.7 : 0.1,
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingTop: 2 }}>
        {AXES.map((axis) => (
          <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: AXIS_COLORS[axis],
                opacity: 0.8,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 9,
                color: '#8A6A4A',
                textTransform: 'capitalize',
                letterSpacing: '0.06em',
                opacity: 0.7,
              }}
            >
              {axis}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
