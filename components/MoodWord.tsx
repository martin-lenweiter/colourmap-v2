'use client';

import { useEffect, useRef, useState } from 'react';

const SERIF = 'var(--font-serif)';
const LS_KEY = 'colourmap:mood-word';

export default function MoodWord() {
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setValue(saved);
  }, []);

  function save(v: string) {
    const trimmed = v.trim();
    setValue(trimmed);
    if (trimmed) localStorage.setItem(LS_KEY, trimmed);
    else localStorage.removeItem(LS_KEY);
    window.dispatchEvent(new CustomEvent('colourmap:mood-changed', { detail: trimmed }));
    setEditing(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Enforce max 3 words
    const raw = e.target.value;
    const words = raw.trimStart().split(/\s+/);
    if (words.length <= 3) setValue(raw);
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 2 }}>
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={handleChange}
          onBlur={(e) => save(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save(value);
            if (e.key === 'Escape') {
              setValue(localStorage.getItem(LS_KEY) ?? '');
              setEditing(false);
            }
          }}
          placeholder="one word…"
          style={{
            fontFamily: SERIF,
            fontSize: 15,
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            color: 'rgba(92,48,24,0.85)',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(196,160,96,0.4)',
            outline: 'none',
            textAlign: 'center',
            width: 140,
            padding: '2px 4px',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 2 }}>
      <button
        type="button"
        onClick={() => setEditing(true)}
        style={{
          fontFamily: SERIF,
          fontSize: value ? 15 : 12,
          fontStyle: 'italic',
          letterSpacing: value ? '0.04em' : '0.06em',
          color: value ? 'rgba(92,48,24,0.8)' : 'rgba(122,84,56,0.3)',
          background: 'transparent',
          border: 'none',
          cursor: 'text',
          padding: '2px 8px',
          lineHeight: 1.4,
        }}
      >
        {value || 'mood…'}
      </button>
    </div>
  );
}
