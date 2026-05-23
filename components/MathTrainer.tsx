'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  checkAnswer,
  formatAnswer,
  type GeneratedProblem,
  getOperation,
  type Level,
  MATH_OPERATIONS,
  type Operation,
  type OperationConfig,
} from '@/lib/math-trainer';
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
  attempts: number;
};

const PROGRESS_KEY = 'colourmap:math-trainer:progress';
const TIMER_KEY = 'colourmap:math-trainer:timer';

function loadProgress(): Record<string, LevelProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LevelProgress>;
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

  useEffect(() => {
    setProgress(loadProgress());
    try {
      const t = localStorage.getItem(TIMER_KEY);
      if (t === 'on') setTimerOn(true);
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

  const recordScore = useCallback((op: Operation, level: number, score: number) => {
    setProgress((prev) => {
      const key = progressKey(op, level);
      const existing = prev[key] ?? { best: 0, attempts: 0 };
      const next = {
        ...prev,
        [key]: {
          best: Math.max(existing.best, score),
          attempts: existing.attempts + 1,
        },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  if (stage === 'practice' && selectedOp && selectedLevel !== null) {
    const op = getOperation(selectedOp);
    const level = op.levels[selectedLevel - 1];
    return (
      <Shell hubBg={hubBg} program={program} onClose={onClose} onBack={() => setStage('tips')}>
        <PracticeView
          op={op}
          level={level}
          timerOn={timerOn}
          onToggleTimer={toggleTimer}
          onFinish={(score) => recordScore(op.key, level.number, score)}
          onExit={() => setStage('tips')}
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
        timerOn={timerOn}
        onToggleTimer={toggleTimer}
        onSelectOp={(o) => {
          setSelectedOp(o);
          setStage('level');
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
  timerOn,
  onToggleTimer,
  onSelectOp,
}: {
  progress: Record<string, LevelProgress>;
  timerOn: boolean;
  onToggleTimer: () => void;
  onSelectOp: (op: Operation) => void;
}) {
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
          marginBottom: 20,
        }}
        aria-pressed={timerOn}
      >
        Timer: {timerOn ? 'on' : 'off'}
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {MATH_OPERATIONS.map((op) => {
          const completedLevels = op.levels.filter(
            (lv) => (progress[`${op.key}-${lv.number}`]?.best ?? 0) >= 8,
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
          const mastered = (p?.best ?? 0) >= 8;
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
                    ? `Best ${p.best}/10 · ${p.attempts} attempt${p.attempts === 1 ? '' : 's'}`
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

const PROBLEMS_PER_SESSION = 10;

function PracticeView({
  op,
  level,
  timerOn,
  onToggleTimer,
  onFinish,
  onExit,
}: {
  op: OperationConfig;
  level: Level;
  timerOn: boolean;
  onToggleTimer: () => void;
  onFinish: (score: number) => void;
  onExit: () => void;
}) {
  const rng = useMemo(() => Math.random, []);
  const [problem, setProblem] = useState<GeneratedProblem>(() => level.generate(rng));
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [score, setScore] = useState(0);
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

  const completed = questionIndex >= PROBLEMS_PER_SESSION;

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
    if (correct) setScore((s) => s + 1);
  };

  const next = () => {
    setQuestionIndex((q) => q + 1);
    if (questionIndex + 1 < PROBLEMS_PER_SESSION) {
      setProblem(level.generate(rng));
    }
    setInput('');
    setFeedback('idle');
    inputRef.current?.focus();
  };

  if (completed) {
    const passed = score >= 8;
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30 }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: col(op.color, 0.6),
            marginBottom: 14,
          }}
        >
          Session complete
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 54,
            color: col(op.color, passed ? 1 : 0.7),
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          {score}/{PROBLEMS_PER_SESSION}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            color: cream(0.65),
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {passed
            ? `Level ${level.number} mastered. Move on or sharpen further.`
            : 'Below mastery (8/10). Re-read the tips and try again.'}
        </div>
        {timerOn && (
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 13,
              color: cream(0.55),
              marginBottom: 22,
            }}
          >
            Total time: {elapsed}s
          </div>
        )}
        <button
          type="button"
          onClick={onExit}
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
          Done
        </button>
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
          fontFamily: SERIF,
          fontSize: 12,
          color: cream(0.55),
          marginBottom: 6,
        }}
      >
        <span>
          Question {questionIndex + 1}/{PROBLEMS_PER_SESSION}
        </span>
        <span>Score {score}</span>
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
              fontFamily: SERIF,
              fontSize: 14,
              color: '#E78878',
              textAlign: 'center',
              padding: '6px 10px',
            }}
          >
            Not quite. Answer: {formatAnswer(problem)}
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
