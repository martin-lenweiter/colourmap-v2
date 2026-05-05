'use client';

import { useEffect, useState } from 'react';

const LS_CHALLENGE = 'colourmap:objective-challenge';
const LS_FLOW_TEXT = 'colourmap:objective-flow-text';

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(90,60,30,0.12)',
  fontFamily: 'var(--font-handwritten)',
  fontStyle: 'italic' as const,
  fontSize: 22,
  color: '#5C3018',
  padding: '2px 0',
  outline: 'none',
  opacity: 0.8,
};

const labelStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: 13,
  fontWeight: 700,
  color: '#8A6A4A',
  opacity: 0.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
};

export default function ObjectiveDepth() {
  const [open, setOpen] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [flowText, setFlowText] = useState('');

  useEffect(() => {
    try {
      setChallenge(localStorage.getItem(LS_CHALLENGE) ?? '');
      setFlowText(localStorage.getItem(LS_FLOW_TEXT) ?? '');
    } catch {}
  }, []);

  function saveChallenge(val: string) {
    setChallenge(val);
    try {
      localStorage.setItem(LS_CHALLENGE, val);
    } catch {}
  }

  function saveFlowText(val: string) {
    setFlowText(val);
    try {
      localStorage.setItem(LS_FLOW_TEXT, val);
    } catch {}
  }

  const hasContent = challenge.trim() || flowText.trim();

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
            ? [challenge.trim(), flowText.trim()].filter(Boolean).join(' · ')
            : 'challenge · flow'}
        </span>
      </button>

      {/* Expandable */}
      <div
        style={{
          maxHeight: open ? 180 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.2s ease, opacity 0.18s ease',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={labelStyle}>Challenge</span>
          <input
            type="text"
            value={challenge}
            onChange={(e) => saveChallenge(e.target.value)}
            placeholder="what's blocking you..."
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={labelStyle}>Flow</span>
          <input
            type="text"
            value={flowText}
            onChange={(e) => saveFlowText(e.target.value)}
            placeholder="what's flowing..."
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
