'use client';

import { useEffect, useState } from 'react';
import SquareSlider from '@/components/SquareSlider';

const FLOW_LEVELS = [
  { label: 'Resistant', color: '#C09080' },
  { label: 'Struggling', color: '#C8A878' },
  { label: 'Neutral', color: '#C4B870' },
  { label: 'Engaged', color: '#90B890' },
  { label: 'In Flow', color: '#70A8C0' },
];

const LS_CHALLENGE = 'colourmap:objective-challenge';
const LS_FLOW = 'colourmap:objective-flow-idx';

export default function ObjectiveDepth() {
  const [open, setOpen] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [flowIdx, setFlowIdx] = useState(2);

  useEffect(() => {
    try {
      setChallenge(localStorage.getItem(LS_CHALLENGE) ?? '');
      const v = localStorage.getItem(LS_FLOW);
      if (v !== null) setFlowIdx(Math.max(0, Math.min(FLOW_LEVELS.length - 1, Number(v))));
    } catch {}
  }, []);

  function saveChallenge(val: string) {
    setChallenge(val);
    try {
      localStorage.setItem(LS_CHALLENGE, val);
    } catch {}
  }

  function pickFlow(i: number) {
    setFlowIdx(i);
    try {
      localStorage.setItem(LS_FLOW, String(i));
    } catch {}
  }

  const flow = FLOW_LEVELS[flowIdx];
  const hasContent = challenge.trim() || flowIdx !== 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Ochre diamond trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '2px 0',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 7,
            height: 7,
            background: hasContent ? '#C4A060' : '#C4A06050',
            transform: 'rotate(45deg)',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            color: '#8A6A4A',
            opacity: open ? 0.9 : 0.45,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            transition: 'opacity 0.2s',
          }}
        >
          {!open && hasContent
            ? [challenge.trim(), flowIdx !== 2 && flow.label].filter(Boolean).join(' · ')
            : 'challenge · flow'}
        </span>
      </button>

      {/* Expandable */}
      <div
        style={{
          maxHeight: open ? 130 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.2s ease, opacity 0.18s ease',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <input
          type="text"
          value={challenge}
          onChange={(e) => saveChallenge(e.target.value)}
          placeholder="challenge..."
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(90,60,30,0.12)',
            fontFamily: 'var(--font-handwritten)',
            fontStyle: 'italic',
            fontSize: 17,
            color: '#5C3018',
            padding: '2px 0',
            outline: 'none',
            textAlign: 'center',
            opacity: 0.8,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: 700,
              color: flow.color,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
          >
            {flow.label}
          </span>
          <SquareSlider
            colors={FLOW_LEVELS.map((l) => l.color)}
            value={flowIdx}
            onChange={pickFlow}
            size={14}
            gap={4}
          />
        </div>
      </div>
    </div>
  );
}
