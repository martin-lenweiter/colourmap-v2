'use client';

import { useState } from 'react';
import { PROGRAMS, type Program } from '@/lib/programs';
import LearningProgram from './LearningProgram';

const SERIF = 'var(--font-serif)';
const cream = (a: number) => `rgba(240,216,152,${a})`;
const och = (a: number) => `rgba(196,160,96,${a})`;

function col(color: string, a: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const GROUPS: { label: string; keys: string[] }[] = [
  {
    label: 'Inner Life',
    keys: ['emotional-intelligence', 'self-talk', 'wellbeing', 'hope-energy'],
  },
  { label: 'Growth', keys: ['agency', 'creativity', 'relational-intelligence'] },
  { label: 'Systems', keys: ['organisational-intelligence', 'collective-evolution'] },
  { label: 'Intelligence', keys: ['artificial-intelligence', 'ai-future'] },
];

function getProgress(program: Program): number {
  try {
    const saved = localStorage.getItem(`colourmap:program:${program.key}`);
    if (saved !== null) return Math.min(Number(saved) + 1, program.segments.length);
  } catch {}
  return 0;
}

function ProgramCard({ program, onOpen }: { program: Program; onOpen: () => void }) {
  const progress = getProgress(program);
  const total = program.segments.length;
  const pct = total > 0 ? progress / total : 0;
  const started = progress > 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        background: col(program.color, 0.05),
        border: `1px solid ${col(program.color, started ? 0.25 : 0.15)}`,
        borderRadius: 10,
        padding: '11px 14px',
        cursor: 'pointer',
        marginBottom: 7,
      }}
    >
      {/* color dot / progress ring */}
      <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
        <svg
          width="28"
          height="28"
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="14"
            cy="14"
            r="11"
            fill="none"
            stroke={col(program.color, 0.15)}
            strokeWidth="2"
          />
          {started && (
            <circle
              cx="14"
              cy="14"
              r="11"
              fill="none"
              stroke={col(program.color, 0.7)}
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 11}`}
              strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct)}`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: program.color,
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 14,
            fontWeight: 600,
            color: cream(0.82),
            lineHeight: 1.3,
          }}
        >
          {program.domain}
        </div>
        <div
          style={{ fontFamily: SERIF, fontSize: 11, color: col(program.color, 0.5), marginTop: 2 }}
        >
          {started ? `${progress} / ${total} pages` : `${total} pages`}
        </div>
      </div>

      <span
        style={{ fontFamily: SERIF, fontSize: 12, color: col(program.color, 0.35), flexShrink: 0 }}
      >
        →
      </span>
    </button>
  );
}

export default function LearningHub({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<Program | null>(null);

  const byKey = Object.fromEntries(PROGRAMS.map((p) => [p.key, p]));

  if (active) {
    return (
      <LearningProgram
        program={active}
        onClose={() => setActive(null)}
        onBack={() => setActive(null)}
      />
    );
  }

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
          background: 'rgba(8,5,2,0.98)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
            borderBottom: `1px solid ${och(0.12)}`,
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: och(0.45),
                marginBottom: 3,
              }}
            >
              Colourmap
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 700,
                color: cream(0.88),
                letterSpacing: '-0.01em',
              }}
            >
              Learn
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${och(0.22)}`,
              borderRadius: 999,
              color: och(0.45),
              fontFamily: SERIF,
              fontSize: 11,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '5px 14px',
            }}
          >
            close
          </button>
        </div>

        {/* Opening statement */}
        <div style={{ padding: '18px 20px 4px', flexShrink: 0 }}>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              color: cream(0.82),
              lineHeight: 1.75,
              margin: '0 0 8px',
              fontWeight: 600,
            }}
          >
            What you can do right now — and where to start.
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 13,
              color: cream(0.5),
              lineHeight: 1.7,
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            Every state — including feeling low — is information. This is where you learn to read
            it, use it, and move through it. Pick any program. Open one page. That is enough.
          </p>
        </div>

        {/* Programs */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
          {GROUPS.map((group) => {
            const programs = group.keys.map((k) => byKey[k]).filter(Boolean);
            if (!programs.length) return null;
            return (
              <div key={group.label} style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: och(0.35),
                    marginBottom: 10,
                  }}
                >
                  {group.label}
                </div>
                {programs.map((p) => (
                  <ProgramCard key={p.key} program={p} onOpen={() => setActive(p)} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
