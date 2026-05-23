'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  checkAnswer,
  type Difficulty,
  formatAnswer,
  type GeneratedProblem,
  generateAdaptive,
  getOperation,
  type Level,
  MATH_OPERATIONS,
  type Operation,
  type OperationConfig,
} from '@/lib/math-trainer';
import { playCorrect, playSessionComplete, playWrong } from '@/lib/math-trainer-sound';
import type { Program } from '@/lib/programs';

const SERIF = 'var(--font-serif)';
const cream = (a: number) => `rgba(240,216,152,${a})`;

function col(color: string, a: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

type Stage = 'home' | 'level' | 'tips' | 'practice';

type LevelProgress = {
  best: number;
  bestOf: number;
  attempts: number;
};

function isMastered(p: LevelProgress | undefined): boolean {
  if (!p || p.bestOf === 0) return false;
  return p.best / p.bestOf >= 0.8;
}

const PROGRESS_KEY = 'colourmap:math-trainer:progress';
const TIMER_KEY = 'colourmap:math-trainer:timer';
const SESSION_LENGTH_KEY = 'colourmap:math-trainer:session-length';
const SOUND_KEY = 'colourmap:math-trainer:sound';
const WEAK_SPOTS_KEY = 'colourmap:math-trainer:weak-spots';
const VALID_SESSION_LENGTHS = [5, 10, 20] as const;
type SessionLength = (typeof VALID_SESSION_LENGTHS)[number];
const DEFAULT_SESSION_LENGTH: SessionLength = 10;

type WeakSpot = {
  failures: number;
  lastFailedAt: number;
};

function loadWeakSpots(): Record<string, WeakSpot> {
  try {
    const raw = localStorage.getItem(WEAK_SPOTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WeakSpot>;
  } catch {
    return {};
  }
}

function saveWeakSpots(w: Record<string, WeakSpot>) {
  try {
    localStorage.setItem(WEAK_SPOTS_KEY, JSON.stringify(w));
  } catch {}
}

function recordWeakSpot(op: Operation, level: number) {
  const all = loadWeakSpots();
  const key = `${op}-${level}`;
  all[key] = {
    failures: (all[key]?.failures ?? 0) + 1,
    lastFailedAt: Date.now(),
  };
  saveWeakSpots(all);
}

function loadProgress(): Record<string, LevelProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<LevelProgress>>;
    const migrated: Record<string, LevelProgress> = {};
    for (const [k, v] of Object.entries(parsed)) {
      migrated[k] = {
        best: v.best ?? 0,
        bestOf: v.bestOf ?? 10,
        attempts: v.attempts ?? 0,
      };
    }
    return migrated;
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, LevelProgress>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {}
}

function progressKey(op: Operation, level: number): string {
  return `${op}-${level}`;
}

export default function MathTrainer({
  program,
  onClose,
  onBack,
  hubBg,
}: {
  program: Program;
  onClose: () => void;
  onBack?: () => void;
  hubBg?: string;
}) {
  const [stage, setStage] = useState<Stage>('home');
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<string, LevelProgress>>({});
  const [timerOn, setTimerOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [weakSpots, setWeakSpots] = useState<Record<string, WeakSpot>>({});
  const [sessionLength, setSessionLength] = useState<SessionLength>(DEFAULT_SESSION_LENGTH);
  const [practiceKey, setPracticeKey] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
    setWeakSpots(loadWeakSpots());
    try {
      const t = localStorage.getItem(TIMER_KEY);
      if (t === 'on') setTimerOn(true);
      const sd = localStorage.getItem(SOUND_KEY);
      if (sd === 'off') setSoundOn(false);
      const s = Number(localStorage.getItem(SESSION_LENGTH_KEY));
      if (VALID_SESSION_LENGTHS.includes(s as SessionLength)) {
        setSessionLength(s as SessionLength);
      }
    } catch {}
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
      } catch {}
      return next;
    });
  }, []);

  const trackWrong = useCallback((op: Operation, level: number) => {
    recordWeakSpot(op, level);
    setWeakSpots(loadWeakSpots());
  }, []);

  const changeSessionLength = useCallback((len: SessionLength) => {
    setSessionLength(len);
    try {
      localStorage.setItem(SESSION_LENGTH_KEY, String(len));
    } catch {}
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(TIMER_KEY, next ? 'on' : 'off');
      } catch {}
      return next;
    });
  }, []);

  const recordScore = useCallback(
    (op: Operation, level: number, score: number, ofLength: number) => {
      setProgress((prev) => {
        const key = progressKey(op, level);
        const existing = prev[key] ?? { best: 0, bestOf: ofLength, attempts: 0 };
        const existingRatio = existing.bestOf ? existing.best / existing.bestOf : 0;
        const currentRatio = ofLength ? score / ofLength : 0;
        const useNew = currentRatio > existingRatio;
        const next = {
          ...prev,
          [key]: {
            best: useNew ? score : existing.best,
            bestOf: useNew ? ofLength : existing.bestOf,
            attempts: existing.attempts + 1,
          },
        };
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  if (stage === 'practice' && selectedOp && selectedLevel !== null) {
    const op = getOperation(selectedOp);
    const level = op.levels[selectedLevel - 1];
    return (
      <Shell hubBg={hubBg} program={program} onClose={onClose} onBack={() => setStage('tips')}>
        <PracticeView
          key={practiceKey}
          op={op}
          level={level}
          timerOn={timerOn}
          onToggleTimer={toggleTimer}
          soundOn={soundOn}
          sessionLength={sessionLength}
          onFinish={(score) => recordScore(op.key, level.number, score, sessionLength)}
          onWrong={() => trackWrong(op.key, level.number)}
          onExit={() => setStage('level')}
          onRetry={() => setPracticeKey((k) => k + 1)}
        />
      </Shell>
    );
  }

  if (stage === 'tips' && selectedOp && selectedLevel !== null) {
    const op = getOperation(selectedOp);
    const level = op.levels[selectedLevel - 1];
    return (
      <Shell hubBg={hubBg} program={program} onClose={onClose} onBack={() => setStage('level')}>
        <TipsView op={op} level={level} onStartPractice={() => setStage('practice')} />
      </Shell>
    );
  }

  if (stage === 'level' && selectedOp) {
    const op = getOperation(selectedOp);
    return (
      <Shell hubBg={hubBg} program={program} onClose={onClose} onBack={() => setStage('home')}>
        <LevelPicker
          op={op}
          progress={progress}
          onSelectLevel={(n) => {
            setSelectedLevel(n);
            setStage('tips');
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell hubBg={hubBg} program={program} onClose={onClose} onBack={onBack}>
      <HomeView
        progress={progress}
        weakSpots={weakSpots}
        timerOn={timerOn}
        onToggleTimer={toggleTimer}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        sessionLength={sessionLength}
        onChangeSessionLength={changeSessionLength}
        onSelectOp={(o) => {
          setSelectedOp(o);
          setStage('level');
        }}
        onJumpToLevel={(o, lv) => {
          setSelectedOp(o);
          setSelectedLevel(lv);
          setStage('tips');
        }}
      />
    </Shell>
  );
}

function Shell({
  program,
  hubBg,
  onClose,
  onBack,
  children,
}: {
  program: Program;
  hubBg?: string;
  onClose: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(4,2,0,0.6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 672,
          background: hubBg ?? 'rgba(10,6,3,0.98)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px 10px',
            borderBottom: `1px solid ${col(program.color, 0.14)}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: col(program.color, 0.55),
            }}
          >
            {program.domain}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onBack && (
              <button type="button" onClick={onBack} style={btnStyle(program.color, 0.2, 0.45)}>
                ← back
              </button>
            )}
            <button type="button" onClick={onClose} style={btnStyle(program.color, 0.25, 0.5)}>
              close
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 30px' }}>{children}</div>
      </div>
    </div>
  );
}

function btnStyle(color: string, borderA: number, textA: number): React.CSSProperties {
  return {
    background: 'none',
    border: `1px solid ${col(color, borderA)}`,
    borderRadius: 999,
    color: col(color, textA),
    fontFamily: SERIF,
    fontSize: 11,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    padding: '5px 14px',
  };
}

function HomeView({
  progress,
  weakSpots,
  timerOn,
  onToggleTimer,
  soundOn,
  onToggleSound,
  sessionLength,
  onChangeSessionLength,
  onSelectOp,
  onJumpToLevel,
}: {
  progress: Record<string, LevelProgress>;
  weakSpots: Record<string, WeakSpot>;
  timerOn: boolean;
  onToggleTimer: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  sessionLength: SessionLength;
  onChangeSessionLength: (len: SessionLength) => void;
  onSelectOp: (op: Operation) => void;
  onJumpToLevel: (op: Operation, level: number) => void;
}) {
  const topWeakSpots = useMemo(() => {
    return Object.entries(weakSpots)
      .map(([key, ws]) => {
        const [op, lvStr] = key.split('-');
        return { key, op: op as Operation, level: Number(lvStr), ...ws };
      })
      .sort((a, b) => b.failures - a.failures || b.lastFailedAt - a.lastFailedAt)
      .slice(0, 3);
  }, [weakSpots]);
  return (
    <div>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          color: cream(0.92),
          margin: 0,
          marginBottom: 6,
          letterSpacing: '0.02em',
        }}
      >
        Math Trainer
      </h2>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 14,
          color: cream(0.65),
          lineHeight: 1.55,
          margin: 0,
          marginBottom: 18,
        }}
      >
        Four operations. Seven levels each. Tips and worked examples first, then practice with a
        problem stream. Turn on the timer when you want speed.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <button
          type="button"
          onClick={onToggleTimer}
          style={{
            background: timerOn ? 'rgba(255,200,100,0.16)' : 'transparent',
            border: `1px solid ${timerOn ? 'rgba(255,200,100,0.5)' : cream(0.2)}`,
            borderRadius: 999,
            color: timerOn ? '#FFD080' : cream(0.6),
            fontFamily: SERIF,
            fontSize: 12,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '7px 16px',
          }}
          aria-pressed={timerOn}
        >
          Timer: {timerOn ? 'on' : 'off'}
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          style={{
            background: soundOn ? 'rgba(158,216,143,0.14)' : 'transparent',
            border: `1px solid ${soundOn ? 'rgba(158,216,143,0.4)' : cream(0.2)}`,
            borderRadius: 999,
            color: soundOn ? '#9ED88F' : cream(0.6),
            fontFamily: SERIF,
            fontSize: 12,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '7px 16px',
          }}
          aria-pressed={soundOn}
        >
          Sound: {soundOn ? 'on' : 'off'}
        </button>
        <fieldset
          aria-label="Session length"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: `1px solid ${cream(0.2)}`,
            borderRadius: 999,
            padding: '3px 6px',
            margin: 0,
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: cream(0.5),
              letterSpacing: '0.1em',
              paddingLeft: 8,
            }}
          >
            session
          </span>
          {VALID_SESSION_LENGTHS.map((len) => (
            <button
              key={len}
              type="button"
              aria-pressed={sessionLength === len}
              aria-label={`Session of ${len} questions`}
              onClick={() => onChangeSessionLength(len)}
              style={{
                background: sessionLength === len ? cream(0.18) : 'transparent',
                border: 'none',
                borderRadius: 999,
                color: sessionLength === len ? cream(0.95) : cream(0.55),
                fontFamily: SERIF,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 10px',
              }}
            >
              {len}
            </button>
          ))}
        </fieldset>
      </div>
      {topWeakSpots.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <h3
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#E78878',
              margin: 0,
              marginBottom: 8,
            }}
          >
            Weak spots — return to these
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {topWeakSpots.map((ws) => {
              const opCfg = MATH_OPERATIONS.find((o) => o.key === ws.op);
              if (!opCfg) return null;
              const lv = opCfg.levels.find((l) => l.number === ws.level);
              return (
                <button
                  key={ws.key}
                  type="button"
                  onClick={() => onJumpToLevel(ws.op, ws.level)}
                  style={{
                    background: 'rgba(231,136,120,0.08)',
                    border: '1px solid rgba(231,136,120,0.32)',
                    borderRadius: 10,
                    color: cream(0.85),
                    fontFamily: SERIF,
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 700, color: col(opCfg.color, 0.95) }}>
                    {opCfg.symbol} L{ws.level} — {lv?.title}
                  </div>
                  <div style={{ fontSize: 11, color: cream(0.55) }}>
                    {ws.failures} miss{ws.failures === 1 ? '' : 'es'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {MATH_OPERATIONS.map((op) => {
          const completedLevels = op.levels.filter((lv) =>
            isMastered(progress[`${op.key}-${lv.number}`]),
          ).length;
          return (
            <button
              key={op.key}
              type="button"
              onClick={() => onSelectOp(op.key)}
              style={{
                background: col(op.color, 0.08),
                border: `1px solid ${col(op.color, 0.3)}`,
                borderRadius: 14,
                color: col(op.color, 0.95),
                fontFamily: SERIF,
                cursor: 'pointer',
                padding: '18px 14px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 32, lineHeight: 1 }}>{op.symbol}</span>
              <span style={{ fontSize: 16, letterSpacing: '0.04em' }}>{op.label}</span>
              <span style={{ fontSize: 11, color: col(op.color, 0.55), letterSpacing: '0.08em' }}>
                {completedLevels}/7 mastered
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LevelPicker({
  op,
  progress,
  onSelectLevel,
}: {
  op: OperationConfig;
  progress: Record<string, LevelProgress>;
  onSelectLevel: (n: number) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: col(op.color, 0.6),
            marginBottom: 4,
          }}
        >
          {op.label}
        </div>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 22,
            color: col(op.color, 0.92),
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          Seven levels {op.symbol}
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {op.levels.map((lv) => {
          const p = progress[`${op.key}-${lv.number}`];
          const mastered = isMastered(p);
          return (
            <button
              key={lv.number}
              type="button"
              onClick={() => onSelectLevel(lv.number)}
              style={{
                background: col(op.color, mastered ? 0.14 : 0.06),
                border: `1px solid ${col(op.color, mastered ? 0.5 : 0.22)}`,
                borderRadius: 12,
                color: col(op.color, 0.95),
                fontFamily: SERIF,
                cursor: 'pointer',
                padding: '14px 16px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
              aria-label={`Open level ${lv.number}: ${lv.title}`}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  width: 32,
                  textAlign: 'center',
                  color: col(op.color, mastered ? 1 : 0.6),
                }}
              >
                {lv.number}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, letterSpacing: '0.02em' }}>{lv.title}</span>
                <span style={{ fontSize: 12, color: col(op.color, 0.55) }}>
                  {p
                    ? `Best ${p.best}/${p.bestOf} · ${p.attempts} attempt${p.attempts === 1 ? '' : 's'}`
                    : 'Not started'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TipsView({
  op,
  level,
  onStartPractice,
}: {
  op: OperationConfig;
  level: Level;
  onStartPractice: () => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: col(op.color, 0.6),
            marginBottom: 4,
          }}
        >
          {op.label} · Level {level.number}
        </div>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 22,
            color: col(op.color, 0.92),
            margin: 0,
            marginBottom: 8,
            letterSpacing: '0.02em',
          }}
        >
          {level.title}
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            color: cream(0.7),
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {level.summary}
        </p>
      </div>

      <Section title="Tips and tricks" color={op.color}>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {level.tips.map((tip) => (
            <li
              key={tip}
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: cream(0.82),
                lineHeight: 1.55,
                marginBottom: 8,
              }}
            >
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Worked examples" color={op.color}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {level.examples.map((ex) => (
            <div
              key={ex.problem}
              style={{
                background: col(op.color, 0.07),
                border: `1px solid ${col(op.color, 0.18)}`,
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: cream(0.95),
                  marginBottom: 4,
                  letterSpacing: '0.02em',
                }}
              >
                {ex.problem} = <span style={{ color: col(op.color, 0.95) }}>{ex.answer}</span>
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  color: cream(0.65),
                  lineHeight: 1.5,
                }}
              >
                {ex.trick}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onStartPractice}
          style={{
            background: col(op.color, 0.2),
            border: `1px solid ${col(op.color, 0.65)}`,
            borderRadius: 999,
            color: col(op.color, 1),
            fontFamily: SERIF,
            fontSize: 14,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: '10px 22px',
            marginTop: 6,
            fontWeight: 700,
          }}
        >
          Start practice →
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          style={{
            background: 'none',
            border: `1px solid ${col(op.color, 0.3)}`,
            borderRadius: 999,
            color: col(op.color, 0.7),
            fontFamily: SERIF,
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            padding: '10px 18px',
            marginTop: 6,
          }}
        >
          🖨 Print practice card
        </button>
      </div>
      <PrintCard op={op} level={level} />
    </div>
  );
}

function PrintCard({ op, level }: { op: OperationConfig; level: Level }) {
  const rng = useMemo(() => Math.random, []);
  const problems = useMemo(
    () => Array.from({ length: 10 }, () => level.generate(rng)),
    [level, rng],
  );
  return (
    <div className="math-print-card">
      <style>{`
        .math-print-card { display: none; }
        @media print {
          body * { visibility: hidden; }
          .math-print-card, .math-print-card * { visibility: visible; }
          .math-print-card {
            display: block;
            position: absolute;
            inset: 0;
            background: white;
            color: black;
            padding: 24mm 18mm;
            font-family: 'Georgia', 'Times New Roman', serif;
          }
          .math-print-card h1 { font-size: 22pt; margin: 0 0 4mm; }
          .math-print-card .meta { font-size: 10pt; color: #555; margin-bottom: 8mm; letter-spacing: 0.08em; text-transform: uppercase; }
          .math-print-card h2 { font-size: 12pt; margin: 6mm 0 2mm; letter-spacing: 0.08em; text-transform: uppercase; color: #444; }
          .math-print-card ul { margin: 0 0 4mm; padding-left: 5mm; font-size: 11pt; line-height: 1.5; }
          .math-print-card .examples { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 6mm; font-size: 11pt; margin-bottom: 6mm; }
          .math-print-card .practice { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 12mm; font-size: 14pt; margin-top: 4mm; }
          .math-print-card .practice .problem { font-family: 'Helvetica', 'Arial', sans-serif; font-variant-numeric: tabular-nums; }
        }
      `}</style>
      <h1>
        {op.label} · Level {level.number} — {level.title}
      </h1>
      <div className="meta">Math Trainer · Colourmap</div>
      <h2>Tips</h2>
      <ul>
        {level.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <h2>Worked examples</h2>
      <div className="examples">
        {level.examples.map((ex) => (
          <div key={ex.problem}>
            <strong>
              {ex.problem} = {ex.answer}
            </strong>
            <div style={{ fontSize: '10pt', color: '#444' }}>{ex.trick}</div>
          </div>
        ))}
      </div>
      <h2>Practice</h2>
      <div className="practice">
        {problems.map((p, i) => (
          <div key={`p-${i}-${p.problem}`} className="problem">
            {i + 1}. {p.problem} = ________
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: col(color, 0.6),
          margin: 0,
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

type Mistake = {
  problem: GeneratedProblem;
  userAnswer: string;
};

function PracticeView({
  op,
  level,
  timerOn,
  onToggleTimer,
  soundOn,
  sessionLength,
  onFinish,
  onWrong,
  onExit,
  onRetry,
}: {
  op: OperationConfig;
  level: Level;
  timerOn: boolean;
  onToggleTimer: () => void;
  soundOn: boolean;
  sessionLength: number;
  onFinish: (score: number) => void;
  onWrong: () => void;
  onExit: () => void;
  onRetry: () => void;
}) {
  const rng = useMemo(() => Math.random, []);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [problem, setProblem] = useState<GeneratedProblem>(() => level.generate(rng));
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!timerOn || finishedRef.current) return;
    startedAtRef.current = startedAtRef.current ?? Date.now();
    const id = setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  const completed = questionIndex >= sessionLength;

  useEffect(() => {
    if (completed && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(score);
    }
  }, [completed, onFinish, score]);

  const submit = () => {
    if (!input.trim() || feedback !== 'idle') return;
    const correct = checkAnswer(problem, input);
    setFeedback(correct ? 'right' : 'wrong');
    if (correct) {
      if (soundOn) playCorrect();
      setScore((s) => s + 1);
      setStreak((s) => {
        const nextStreak = s + 1;
        setBestStreak((b) => Math.max(b, nextStreak));
        if (nextStreak >= 3) setDifficulty('harder');
        return nextStreak;
      });
    } else {
      if (soundOn) playWrong();
      setStreak(0);
      setDifficulty((d) => (d === 'harder' ? 'normal' : 'easier'));
      setMistakes((m) => [...m, { problem, userAnswer: input }]);
      onWrong();
    }
  };

  const next = () => {
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    if (nextIndex < sessionLength) {
      setProblem(generateAdaptive(level, rng, difficulty));
    } else if (soundOn) {
      playSessionComplete();
    }
    setInput('');
    setFeedback('idle');
    inputRef.current?.focus();
  };

  if (completed) {
    const masteryThreshold = Math.ceil(sessionLength * 0.8);
    const passed = score >= masteryThreshold;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: col(op.color, 0.6),
            marginBottom: 14,
            marginTop: 8,
          }}
        >
          Session complete
        </div>
        <div
          style={{
            fontFamily: '"SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif',
            fontSize: 64,
            color: col(op.color, passed ? 1 : 0.75),
            fontWeight: 800,
            marginBottom: 4,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score}/{sessionLength}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            color: cream(0.65),
            marginBottom: 14,
            textAlign: 'center',
            maxWidth: 360,
          }}
        >
          {passed
            ? `Level ${level.number} mastered.`
            : `Below mastery (${masteryThreshold}/${sessionLength}). Read the tips below and try again.`}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginBottom: 22,
            fontFamily: SERIF,
            fontSize: 13,
            color: cream(0.6),
          }}
        >
          <span>Best streak: {bestStreak}</span>
          {timerOn && <span>Time: {elapsed}s</span>}
        </div>

        {mistakes.length > 0 && (
          <div style={{ width: '100%', marginBottom: 22 }}>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: col(op.color, 0.6),
                margin: 0,
                marginBottom: 10,
              }}
            >
              Review the {mistakes.length} you missed
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {mistakes.map((m, i) => (
                <div
                  key={`${m.problem.problem}-${i}`}
                  style={{
                    background: 'rgba(231,136,120,0.08)',
                    border: '1px solid rgba(231,136,120,0.22)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily:
                      '"SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 16,
                  }}
                >
                  <span style={{ color: '#FFF6E0' }}>{m.problem.problem}</span>
                  <span style={{ color: cream(0.55), fontSize: 13 }}>
                    you: {m.userAnswer || '—'} · correct:{' '}
                    <span style={{ color: '#9ED88F' }}>{formatAnswer(m.problem)}</span>
                  </span>
                </div>
              ))}
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: col(op.color, 0.6),
                margin: 0,
                marginBottom: 8,
              }}
            >
              Tips that would have helped
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {level.tips.map((tip) => (
                <li
                  key={tip}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    color: cream(0.78),
                    lineHeight: 1.5,
                    marginBottom: 6,
                  }}
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: col(op.color, 0.2),
              border: `1px solid ${col(op.color, 0.65)}`,
              borderRadius: 999,
              color: col(op.color, 1),
              fontFamily: SERIF,
              fontSize: 14,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '10px 22px',
              fontWeight: 700,
            }}
          >
            Try this level again
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              background: 'none',
              border: `1px solid ${col(op.color, 0.3)}`,
              borderRadius: 999,
              color: col(op.color, 0.75),
              fontFamily: SERIF,
              fontSize: 14,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '10px 22px',
            }}
          >
            Back to levels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          fontFamily: SERIF,
          fontSize: 12,
          color: col(op.color, 0.55),
          letterSpacing: '0.1em',
        }}
      >
        <span>
          {op.label} · Level {level.number}
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {timerOn && <span role="timer">⏱ {elapsed}s</span>}
          <button
            type="button"
            onClick={onToggleTimer}
            style={{
              background: 'none',
              border: 'none',
              color: col(op.color, 0.5),
              fontFamily: SERIF,
              fontSize: 11,
              cursor: 'pointer',
              padding: 0,
            }}
            aria-pressed={timerOn}
          >
            timer {timerOn ? 'on' : 'off'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: SERIF,
          fontSize: 12,
          color: cream(0.55),
          marginBottom: 6,
        }}
      >
        <span>
          Question {questionIndex + 1}/{sessionLength}
        </span>
        <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {streak >= 3 && <span style={{ color: '#FFB85C', fontWeight: 700 }}>🔥 {streak}</span>}
          <span>Score {score}</span>
        </span>
      </div>

      <div
        style={{
          background: '#0E0A06',
          border: `1px solid ${col(op.color, 0.35)}`,
          borderRadius: 14,
          padding: '42px 18px',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: '"SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif',
            fontSize: 'clamp(40px, 12vw, 68px)',
            color: '#FFF6E0',
            letterSpacing: '0.02em',
            fontWeight: 700,
            lineHeight: 1.1,
            textShadow: `0 1px 0 ${col(op.color, 0.25)}`,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {problem.problem} = <span style={{ color: col(op.color, 0.85) }}>?</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (feedback === 'idle') submit();
          else next();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={feedback !== 'idle'}
          placeholder="answer"
          aria-label="Answer"
          style={{
            background: '#0E0A06',
            border: `1px solid ${col(op.color, 0.4)}`,
            borderRadius: 10,
            color: '#FFF6E0',
            fontFamily: '"SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif',
            fontSize: 28,
            fontWeight: 600,
            padding: '14px 16px',
            textAlign: 'center',
            outline: 'none',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        {feedback === 'right' && (
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              color: '#9ED88F',
              textAlign: 'center',
              padding: '6px 10px',
            }}
          >
            Correct.
          </div>
        )}
        {feedback === 'wrong' && (
          <div
            style={{
              background: 'rgba(231,136,120,0.08)',
              border: '1px solid rgba(231,136,120,0.22)',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: '#E78878',
                textAlign: 'center',
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Not quite. Answer: {formatAnswer(problem)}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 13,
                color: cream(0.75),
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}
            >
              💡 {level.tips[0]}
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={!input.trim() && feedback === 'idle'}
          style={{
            background: col(op.color, 0.2),
            border: `1px solid ${col(op.color, 0.65)}`,
            borderRadius: 999,
            color: col(op.color, 1),
            fontFamily: SERIF,
            fontSize: 14,
            letterSpacing: '0.1em',
            cursor: input.trim() || feedback !== 'idle' ? 'pointer' : 'not-allowed',
            padding: '10px 22px',
            fontWeight: 700,
            opacity: !input.trim() && feedback === 'idle' ? 0.5 : 1,
          }}
        >
          {feedback === 'idle' ? 'Check' : 'Next →'}
        </button>
      </form>
    </div>
  );
}
