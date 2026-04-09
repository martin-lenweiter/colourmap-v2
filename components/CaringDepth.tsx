'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   CARING DEPTH — The Mirror
   Simple, useful: write what's hard, write what's good.
   See the balance. See your entries fade over time.
   ═══════════════════════════════════════════════════════════ */

const MIRROR_KEY = 'colourmap:mirror-entries';

interface MirrorEntry {
  id: string;
  text: string;
  side: 'challenge' | 'flow';
  createdAt: string;
}

function loadEntries(): MirrorEntry[] {
  try {
    return JSON.parse(localStorage.getItem(MIRROR_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEntries(entries: MirrorEntry[]) {
  localStorage.setItem(MIRROR_KEY, JSON.stringify(entries.slice(0, 50)));
}

export default function CaringDepth() {
  const [entries, setEntries] = useState<MirrorEntry[]>([]);
  const [challengeInput, setChallengeInput] = useState('');
  const [flowInput, setFlowInput] = useState('');

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = (text: string, side: 'challenge' | 'flow') => {
    if (!text.trim()) return;
    const next = [
      { id: crypto.randomUUID(), text: text.trim(), side, createdAt: new Date().toISOString() },
      ...entries,
    ];
    setEntries(next);
    saveEntries(next);
    if (side === 'challenge') setChallengeInput('');
    else setFlowInput('');
  };

  const removeEntry = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next);
  };

  const challenges = entries.filter((e) => e.side === 'challenge');
  const flows = entries.filter((e) => e.side === 'flow');
  const total = entries.length;
  const balance = total > 0 ? Math.round((flows.length / total) * 100) : 50;

  // Visual sizing
  const challengeWeight = Math.min(challenges.length * 8, 35);
  const flowWeight = Math.min(flows.length * 8, 35);

  const sz = 160;
  const cx = sz / 2;
  const cy = sz / 2;

  return (
    <div
      className="space-y-5 rounded-3xl border border-[#8A6A4A50] px-5 py-6"
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

      {/* Visual — overlapping circles */}
      <div className="flex justify-center">
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <defs>
            <radialGradient id="m-chg" cx="40%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C87050" stopOpacity={0.12 + challengeWeight * 0.01} />
              <stop offset="100%" stopColor="#C87050" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="m-flow" cx="60%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C4A060" stopOpacity={0.12 + flowWeight * 0.01} />
              <stop offset="100%" stopColor="#C4A060" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle
            cx={cx - 18}
            cy={cy}
            r={38 + challengeWeight}
            fill="url(#m-chg)"
            className="transition-all duration-700"
          />
          <circle
            cx={cx + 18}
            cy={cy}
            r={38 + flowWeight}
            fill="url(#m-flow)"
            className="transition-all duration-700"
          />

          {/* Balance number */}
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '20px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 700,
              fill: '#B8905A',
              opacity: 0.5,
            }}
          >
            {balance}%
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fill: '#B8905A',
              opacity: 0.35,
            }}
          >
            flow
          </text>
        </svg>
      </div>

      {/* Two columns: write + see */}
      <div className="grid grid-cols-2 gap-4">
        {/* Challenge side */}
        <div className="space-y-2">
          <p
            className="text-center text-base font-bold"
            style={{ color: '#C87050', fontFamily: 'var(--font-serif)' }}
          >
            Challenge
          </p>
          <input
            type="text"
            value={challengeInput}
            onChange={(e) => setChallengeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addEntry(challengeInput, 'challenge');
            }}
            placeholder="What's hard?..."
            className="w-full border-b bg-transparent pb-2 text-sm outline-none"
            style={{
              color: '#C87050',
              borderColor: '#C8705030',
              fontFamily: 'var(--font-handwritten)',
            }}
          />
          {/* Entries stacking below */}
          <div className="space-y-1.5">
            {challenges.slice(0, 5).map((e, i) => (
              <p
                key={e.id}
                className="cursor-pointer text-xs leading-relaxed hover:line-through"
                style={{
                  color: '#C87050',
                  opacity: 0.7 - i * 0.12,
                  fontFamily: 'var(--font-handwritten)',
                }}
                onClick={() => removeEntry(e.id)}
              >
                {e.text}
              </p>
            ))}
          </div>
        </div>

        {/* Flow side */}
        <div className="space-y-2">
          <p
            className="text-center text-base font-bold"
            style={{ color: '#C4A060', fontFamily: 'var(--font-serif)' }}
          >
            Flow
          </p>
          <input
            type="text"
            value={flowInput}
            onChange={(e) => setFlowInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addEntry(flowInput, 'flow');
            }}
            placeholder="What's working?..."
            className="w-full border-b bg-transparent pb-2 text-sm outline-none text-right"
            style={{
              color: '#C4A060',
              borderColor: '#C4A06030',
              fontFamily: 'var(--font-handwritten)',
            }}
          />
          <div className="space-y-1.5">
            {flows.slice(0, 5).map((e, i) => (
              <p
                key={e.id}
                className="cursor-pointer text-right text-xs leading-relaxed hover:line-through"
                style={{
                  color: '#C4A060',
                  opacity: 0.7 - i * 0.12,
                  fontFamily: 'var(--font-handwritten)',
                }}
                onClick={() => removeEntry(e.id)}
              >
                {e.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {total === 0 && (
        <p
          className="text-center text-xs"
          style={{ color: '#B8905A', opacity: 0.35, fontFamily: 'var(--font-handwritten)' }}
        >
          Write what&apos;s hard on the left. What&apos;s working on the right. Watch the mirror
          shift.
        </p>
      )}
    </div>
  );
}
