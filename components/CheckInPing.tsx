'use client';

import { useEffect, useState } from 'react';

const LS_DISMISSED = 'colourmap:checkin-ping-dismissed';

const QUOTES = [
  'The only way out is through. And through is always possible.',
  'You are not behind. You are exactly where the work is.',
  'Every state you are in — even the hard ones — is information. Use it.',
  'Small actions compounded over time are the only kind that change lives.',
  'Your inner world shapes your outer world more than anything else.',
  'Clarity is not found. It is built, one honest moment at a time.',
  'You do not need to be ready. You need to begin.',
  'The version of you that exists in five years is shaped by today.',
  'Resistance is the compass. It points toward what matters most.',
  'Feeling lost is not failure. It is the beginning of orientation.',
  'You cannot think your way to a new life. You have to move.',
  'Rest is not laziness. It is part of the work.',
  'The people who change the most are the ones who stay in the room.',
  'Nothing is wasted. Even the dark years are building something.',
  'You already have enough to start. Start with that.',
  'The mind that notices its own patterns is already free of them.',
  'Energy flows where attention goes. Choose carefully.',
  'You are allowed to want more. And to build it slowly.',
  'Discipline is just love for your future self in action.',
  'Your story is not over. It is barely in the second act.',
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function dailyQuote(): string {
  const seed = today().replace(/-/g, '');
  const idx = parseInt(seed.slice(-4), 10) % QUOTES.length;
  return QUOTES[idx];
}

export default function CheckInPing() {
  const [visible, setVisible] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_DISMISSED) === today()) return;
    } catch {
      return;
    }
    setQuote(dailyQuote());
    setVisible(true);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(LS_DISMISSED, today());
    } catch {}
  }

  if (!visible) return null;

  return (
    <div
      role="note"
      className="mx-auto max-w-md rounded-2xl border border-border bg-muted/50 px-4 py-3 text-center"
      style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 14,
        color: '#7A5438',
        lineHeight: 1.55,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between',
      }}
    >
      <span style={{ flex: 1 }}>{quote}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: '#8A6A4A',
          opacity: 0.45,
          fontSize: 18,
          lineHeight: 1,
          padding: '2px 6px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
