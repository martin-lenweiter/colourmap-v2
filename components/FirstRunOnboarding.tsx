'use client';

import { useEffect, useState } from 'react';

/*
 * First-run onboarding — a three-step welcome overlay that explains
 * what Colourmap is for a lay user landing on the app the first time.
 *
 * Appears only once per device (stored in localStorage as
 * `colourmap:onboarded`). Dismissable at any step via × or Skip.
 *
 * Design intent (pleasant-redesign aligned):
 *   - Full-bleed card per step, not a tiny modal
 *   - Warm ochre gradient, italic serif heading
 *   - One big image/illustration per step (emoji for v1)
 *   - Clear "Next" button that's thumb-sized
 *   - "Skip" is muted but always visible
 *
 * Steps:
 *   1. Welcome — "A living self-portrait you paint every day"
 *   2. The rhythm — "Feel → Listen → Reflect"
 *   3. The map — "Check in every day and your map builds itself"
 */

const LS_KEY = 'colourmap:onboarded';

interface Step {
  icon: string;
  title: string;
  body: string;
  accent: string;
}

const STEPS: Step[] = [
  {
    icon: '✦',
    title: 'Welcome',
    body: 'Colourmap is here to help you organize all your missions and feel good while you do it.',
    accent: '#C4A060',
  },
];

function markOnboarded(): void {
  try {
    localStorage.setItem(LS_KEY, 'true');
  } catch {
    /* silent */
  }
}

function isOnboarded(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === 'true';
  } catch {
    return true;
  }
}

export default function FirstRunOnboarding() {
  const [visible, setVisible] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isOnboarded()) setVisible(true);
  }, []);

  function close() {
    setVisible(false);
    markOnboarded();
  }

  function next() {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      close();
    }
  }

  if (!visible) return null;
  const step = STEPS[stepIdx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Colourmap"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(26, 13, 4, 0.6)',
        backdropFilter: 'blur(6px)',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') close();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border p-8"
        style={{
          // Fully opaque — no gradient. User asked for a clean solid card.
          background: '#FFF8E6',
          borderColor: `${step.accent}55`,
          borderWidth: 2,
          boxShadow: `0 30px 80px -40px ${step.accent}99, 0 8px 20px -12px ${step.accent}40`,
        }}
      >
        {/* Close × */}
        <button
          type="button"
          onClick={close}
          aria-label="Skip welcome"
          className="absolute right-5 top-5 cursor-pointer transition-opacity hover:opacity-90"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted-foreground)',
            opacity: 0.55,
            fontSize: 22,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>

        {/* Step icon */}
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex items-center justify-center rounded-full"
          style={{
            width: 72,
            height: 72,
            background: `${step.accent}18`,
            border: `1px solid ${step.accent}40`,
            fontSize: 36,
            color: step.accent,
            fontFamily: 'var(--font-serif)',
          }}
        >
          {step.icon}
        </div>

        {/* Title */}
        <h2
          className="text-center italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 26,
            fontWeight: 600,
            color: step.accent,
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          {step.title}
        </h2>

        {/* Body */}
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            lineHeight: 1.55,
            color: 'var(--foreground)',
            marginBottom: 28,
            opacity: 0.9,
          }}
        >
          {step.body}
        </p>

        {/* Step dots */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              aria-hidden="true"
              style={{
                width: i === stepIdx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === stepIdx ? step.accent : `${step.accent}30`,
                transition: 'all 200ms ease',
              }}
            />
          ))}
        </div>

        {/* Next / Done button */}
        <button
          type="button"
          onClick={next}
          className="w-full cursor-pointer rounded-2xl transition-opacity hover:opacity-90"
          style={{
            background: step.accent,
            color: '#F5E8C8',
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.04em',
            border: 'none',
            padding: '14px 20px',
            minHeight: 52,
          }}
        >
          {stepIdx === STEPS.length - 1 ? 'Start my map' : 'Next'}
        </button>

        {/* Skip (muted, secondary) */}
        {stepIdx < STEPS.length - 1 && (
          <button
            type="button"
            onClick={close}
            className="mx-auto mt-3 block cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted-foreground)',
              opacity: 0.55,
              fontSize: 12,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.08em',
              padding: 6,
            }}
          >
            skip
          </button>
        )}
      </div>
    </div>
  );
}
