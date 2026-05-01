'use client';

import { useEffect, useRef, useState } from 'react';

const LS_KEY = 'colourmap:guitar-practice';

interface PracticeSession {
  id: string;
  what: string;
  minutes: number;
  date: string; // ISO date yyyy-mm-dd
}

const PRACTICE_SUGGESTIONS = [
  'Chord transitions: Am → G → F → E',
  'Pentatonic scale box 1, ascending + descending',
  'Barre chord F shape — clean 6-string ring',
  'Andalusian cadence: slow strumming',
  'Finger-picking pattern on Em',
  'Blues shuffle in E',
  'Sight-reading tab for 10 minutes',
  'Improvise over Am backing track',
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): PracticeSession[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(sessions: PracticeSession[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  } catch {
    /* quota */
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ─── Practice timer ─────────────────────────────────────── */
function PracticeTimer({ onLog }: { onLog: (minutes: number, what: string) => void }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [focus, setFocus] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleStop() {
    setRunning(false);
    if (elapsed >= 30 && focus.trim()) {
      onLog(Math.max(1, Math.round(elapsed / 60)), focus.trim());
    }
    setElapsed(0);
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: '#C4A06010', border: '1px solid #C4A06025' }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.12em]"
        style={{ color: '#C4A060', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
      >
        Practice Timer
      </p>

      {!running ? (
        <div className="space-y-2">
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="What are you practising?"
            className="w-full bg-transparent text-[13px] outline-none"
            style={{
              color: 'var(--foreground)',
              borderBottom: '1px solid #C4A06025',
              paddingBottom: 4,
              fontFamily: 'var(--font-serif)',
            }}
          />
          {!focus && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRACTICE_SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFocus(s)}
                  className="cursor-pointer rounded-full px-2 py-0.5 text-[10px] transition-all hover:opacity-80"
                  style={{
                    background: '#C4A06010',
                    color: '#C4A060',
                    border: '1px solid #C4A06020',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => focus.trim() && setRunning(true)}
            disabled={!focus.trim()}
            className="cursor-pointer rounded-full px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-80 disabled:opacity-30"
            style={{ background: '#C4A060', color: '#fff' }}
          >
            Start
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p
              className="font-mono text-[32px] font-bold"
              style={{ color: '#C4A060', letterSpacing: '0.04em' }}
            >
              {formatTime(elapsed)}
            </p>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
            >
              {focus}
            </p>
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-80"
            style={{ background: '#C4A06015', color: '#C4A060', border: '1px solid #C4A06040' }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function GuitarPractice() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [what, setWhat] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    setSessions(load());
  }, []);

  function addSession(mins?: number, text?: string) {
    const w = (text ?? what).trim();
    const m = mins ?? minutes;
    if (!w) return;
    const s: PracticeSession = { id: uid(), what: w, minutes: m, date: today() };
    const next = [s, ...sessions];
    setSessions(next);
    save(next);
    setWhat('');
    setMinutes(30);
    setShowLog(false);
  }

  const days = last7Days();
  const byDate = Object.fromEntries(
    days.map((d) => [
      d,
      sessions.filter((s) => s.date === d).reduce((acc, s) => acc + s.minutes, 0),
    ]),
  );

  const maxMinutes = Math.max(...Object.values(byDate), 1);
  const totalThisWeek = Object.values(byDate).reduce((a, b) => a + b, 0);
  const recent = sessions.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Timer */}
      <PracticeTimer onLog={(m, w) => addSession(m, w)} />

      {/* Manual log */}
      <div>
        <button
          type="button"
          onClick={() => setShowLog((s) => !s)}
          className="flex cursor-pointer items-center gap-1.5 mb-2"
          style={{ background: 'none', border: 'none' }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Log manually
          </span>
          <span
            className="text-[10px]"
            style={{
              color: '#C4A06060',
              transform: showLog ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
              transition: 'transform 0.2s',
            }}
          >
            ▾
          </span>
        </button>

        {showLog && (
          <div
            className="rounded-xl p-4 space-y-3 animate-in fade-in duration-150"
            style={{ background: '#C4A06010', border: '1px solid #C4A06025' }}
          >
            <textarea
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              placeholder="What did you work on? Pentatonic scale, chord transitions…"
              rows={2}
              className="w-full resize-none bg-transparent text-[13px] outline-none leading-relaxed"
              style={{
                color: 'var(--foreground)',
                borderBottom: '1px solid #C4A06025',
                fontFamily: 'var(--font-serif)',
              }}
            />
            <div className="flex items-center gap-3">
              <label
                htmlFor="practice-minutes"
                className="text-[11px] uppercase tracking-[0.08em]"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                Duration
              </label>
              <input
                id="practice-minutes"
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
                min={1}
                max={480}
                className="w-20 rounded-lg px-3 py-1 text-[13px] outline-none"
                style={{
                  background: '#C4A06015',
                  color: 'var(--foreground)',
                  border: '1px solid #C4A06025',
                }}
              />
              <span
                className="text-[12px]"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                min
              </span>
              <button
                type="button"
                onClick={() => addSession()}
                className="ml-auto cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-80"
                style={{ background: '#C4A060', color: '#fff' }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7-day strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Last 7 days
          </p>
          {totalThisWeek > 0 && (
            <span
              className="text-[11px] font-semibold"
              style={{ color: '#C4A060', fontFamily: 'var(--font-serif)' }}
            >
              {totalThisWeek} min total
            </span>
          )}
        </div>
        <div className="flex items-end gap-2">
          {days.map((d) => {
            const mins = byDate[d] ?? 0;
            const barH = mins === 0 ? 4 : Math.max(12, Math.round((mins / maxMinutes) * 64));
            const isToday = d === today();
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: barH,
                    background: isToday ? '#C4A060' : mins > 0 ? '#C4A06060' : '#C4A06015',
                  }}
                />
                <span
                  className="text-[9px] text-center"
                  style={{
                    color: isToday ? '#C4A060' : 'var(--muted-foreground)',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                {mins > 0 && (
                  <span
                    className="text-[9px]"
                    style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                  >
                    {mins}m
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent log */}
      {recent.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Recent sessions
          </p>
          {recent.map((s) => (
            <div
              key={s.id}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: '#C4A06008', border: '1px solid #C4A06018' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px]" style={{ color: 'var(--foreground)' }}>
                  {s.what}
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                >
                  {formatDate(s.date)} · {s.minutes} min
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
