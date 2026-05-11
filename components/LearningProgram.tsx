'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Program } from '@/lib/programs';

const SERIF = 'var(--font-serif)';
const cream = (a: number) => `rgba(240,216,152,${a})`;

function col(color: string, a: number) {
  // parse hex into rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function LearningProgram({
  program,
  onClose,
  onBack,
}: {
  program: Program;
  onClose: () => void;
  onBack?: () => void;
}) {
  const lsKey = `colourmap:program:${program.key}`;
  const [seg, setSeg] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved !== null) setSeg(Math.min(Number(saved), program.segments.length - 1));
    } catch {}
  }, [lsKey, program.segments.length]);

  const goTo = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(n, program.segments.length - 1));
      setSeg(next);
      try {
        localStorage.setItem(lsKey, String(next));
      } catch {}
    },
    [lsKey, program.segments.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goTo(seg + 1);
      if (e.key === 'ArrowLeft') goTo(seg - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goTo, seg]);

  const current = program.segments[seg];
  const total = program.segments.length;
  const isLast = seg === total - 1;

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
          background: 'rgba(10,6,3,0.98)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* ── Header ── */}
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
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: col(program.color, 0.55),
                marginBottom: 3,
              }}
            >
              {program.domain}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 12,
                color: col(program.color, 0.35),
                letterSpacing: '0.06em',
              }}
            >
              {seg + 1} of {total}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  background: 'none',
                  border: `1px solid ${col(program.color, 0.2)}`,
                  borderRadius: 999,
                  color: col(program.color, 0.45),
                  fontFamily: SERIF,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '5px 14px',
                }}
              >
                ← all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: `1px solid ${col(program.color, 0.25)}`,
                borderRadius: 999,
                color: col(program.color, 0.5),
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
        </div>

        {/* ── Page numbers ── */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 20px 0',
            flexShrink: 0,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {program.segments.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: 6,
                background: i === seg ? col(program.color, 0.18) : 'transparent',
                border: `1px solid ${col(program.color, i === seg ? 0.5 : i < seg ? 0.28 : 0.12)}`,
                color: col(program.color, i === seg ? 0.9 : i < seg ? 0.55 : 0.28),
                fontFamily: SERIF,
                fontSize: 11,
                fontWeight: i === seg ? 700 : 400,
                cursor: 'pointer',
                padding: '0 6px',
                letterSpacing: '0.04em',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(16px, 5vw, 28px) clamp(16px, 5vw, 24px) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* segment number */}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11,
              color: col(program.color, 0.38),
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            segment {seg + 1}
          </div>

          {/* title */}
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(18px, 5vw, 22px)',
              fontWeight: 600,
              color: cream(0.88),
              lineHeight: 1.3,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {current.title}
          </h2>

          {/* divider */}
          <div
            style={{
              width: 32,
              height: 2,
              background: col(program.color, 0.5),
              borderRadius: 2,
            }}
          />

          {/* body */}
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              color: cream(0.72),
              lineHeight: 1.85,
              margin: 0,
            }}
          >
            {current.body}
          </p>

          {/* Next button below text */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
            {!isLast ? (
              <button
                type="button"
                onClick={() => goTo(seg + 1)}
                style={{
                  background: col(program.color, 0.14),
                  border: `1px solid ${col(program.color, 0.5)}`,
                  borderRadius: 999,
                  padding: '10px 32px',
                  fontFamily: SERIF,
                  fontSize: 13,
                  fontWeight: 600,
                  color: col(program.color, 0.9),
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Next
              </button>
            ) : (
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: col(program.color, 0.5),
                  fontStyle: 'italic',
                }}
              >
                end of program
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div
          style={{
            padding:
              'clamp(12px, 4vw, 20px) clamp(16px, 5vw, 24px) max(24px, env(safe-area-inset-bottom, 24px))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderTop: `1px solid ${col(program.color, 0.1)}`,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => goTo(seg - 1)}
            disabled={seg === 0}
            style={{
              background: 'none',
              border: `1px solid ${col(program.color, seg === 0 ? 0.1 : 0.28)}`,
              borderRadius: 999,
              padding: '7px 20px',
              fontFamily: SERIF,
              fontSize: 12,
              color: col(program.color, seg === 0 ? 0.2 : 0.55),
              cursor: seg === 0 ? 'default' : 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            ← prev
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={() => goTo(seg + 1)}
              style={{
                background: col(program.color, 0.12),
                border: `1px solid ${col(program.color, 0.45)}`,
                borderRadius: 999,
                padding: '7px 20px',
                fontFamily: SERIF,
                fontSize: 12,
                fontWeight: 600,
                color: col(program.color, 0.88),
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              next →
            </button>
          ) : (
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 12,
                color: col(program.color, 0.45),
                fontStyle: 'italic',
                padding: '7px 20px',
              }}
            >
              complete
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
