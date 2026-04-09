'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARING DEPTH — The Mirror
   Box 3: Two overlapping circles showing Challenge/Flow patterns.
   Reads from CareCompass writing column data.
   ═══════════════════════════════════════════════════════════ */

const CHALLENGE_KEY = 'colourmap:care-challenge';
const FLOW_KEY = 'colourmap:care-flow';

function loadList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export default function CaringDepth() {
  const [challenges, setChallenges] = useState<string[]>([]);
  const [flows, setFlows] = useState<string[]>([]);

  useEffect(() => {
    setChallenges(loadList(CHALLENGE_KEY));
    setFlows(loadList(FLOW_KEY));
    const poll = () => {
      setChallenges(loadList(CHALLENGE_KEY));
      setFlows(loadList(FLOW_KEY));
    };
    window.addEventListener('focus', poll);
    return () => window.removeEventListener('focus', poll);
  }, []);

  const total = challenges.length + flows.length;
  const balance = total > 0 ? Math.round((flows.length / total) * 100) : 50;
  const challengeSize = 40 + Math.min(challenges.length * 6, 30);
  const flowSize = 40 + Math.min(flows.length * 6, 30);

  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div
      className="space-y-4 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(242,232,210,0.97), rgba(236,224,204,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      <p
        className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: '#C4A060' }}
      >
        Mirror
      </p>

      {/* SVG Visual */}
      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            <radialGradient id="depth-chg" cx="35%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C87050" stopOpacity={0.15 + challenges.length * 0.04} />
              <stop offset="100%" stopColor="#C87050" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="depth-flow" cx="65%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C4A060" stopOpacity={0.15 + flows.length * 0.04} />
              <stop offset="100%" stopColor="#C4A060" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="depth-overlap" cx="50%" cy="50%" r="30%">
              <stop offset="0%" stopColor="#B8905A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B8905A" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle
            cx={cx - 25}
            cy={cy}
            r={challengeSize}
            fill="url(#depth-chg)"
            className="transition-all duration-700"
          />
          <circle
            cx={cx + 25}
            cy={cy}
            r={flowSize}
            fill="url(#depth-flow)"
            className="transition-all duration-700"
          />
          <circle cx={cx} cy={cy} r={25} fill="url(#depth-overlap)" />

          <text
            x={cx - 45}
            y={cy - 10}
            textAnchor="middle"
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              fill: '#C87050',
              opacity: 0.7,
            }}
          >
            Challenge
          </text>
          <text
            x={cx + 45}
            y={cy - 10}
            textAnchor="middle"
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              fill: '#C4A060',
              opacity: 0.7,
            }}
          >
            Flow
          </text>

          <text
            x={cx - 45}
            y={cy + 8}
            textAnchor="middle"
            style={{
              fontSize: '16px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#C87050',
              opacity: 0.5,
            }}
          >
            {challenges.length}
          </text>
          <text
            x={cx + 45}
            y={cy + 8}
            textAnchor="middle"
            style={{
              fontSize: '16px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#C4A060',
              opacity: 0.5,
            }}
          >
            {flows.length}
          </text>

          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            style={{
              fontSize: '14px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#B8905A',
              opacity: 0.6,
            }}
          >
            {balance}%
          </text>
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            style={{
              fontSize: '7px',
              fontFamily: 'var(--font-handwritten)',
              fill: '#B8905A',
              opacity: 0.4,
            }}
          >
            balance
          </text>
        </svg>
      </div>

      {/* Recent entries */}
      {total > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            {challenges
              .slice(-3)
              .reverse()
              .map((c, i) => (
                <p
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{
                    color: '#C87050',
                    opacity: 0.7 - i * 0.2,
                    fontFamily: 'var(--font-handwritten)',
                  }}
                >
                  {c}
                </p>
              ))}
          </div>
          <div className="space-y-1">
            {flows
              .slice(-3)
              .reverse()
              .map((f, i) => (
                <p
                  key={i}
                  className="text-xs leading-relaxed text-right"
                  style={{
                    color: '#C4A060',
                    opacity: 0.7 - i * 0.2,
                    fontFamily: 'var(--font-handwritten)',
                  }}
                >
                  {f}
                </p>
              ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <p
          className="text-center text-xs"
          style={{ color: '#B8905A', opacity: 0.4, fontFamily: 'var(--font-handwritten)' }}
        >
          Write in Challenge &amp; Flow above to see your mirror.
        </p>
      )}
    </div>
  );
}
