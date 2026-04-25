'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/*
 * MoodSuggestion — small recommendation chip that reads today's
 * latest check-in and suggests a music tool / preset that fits.
 *
 * Per Martin (task #22 — "Mood → cross-tool recommendation").
 *
 * Heuristic, not AI. The mapping below picks the right
 * surface for the moment:
 *
 *   Heavy / stuck moods       → Chill Machine (528Hz · slow)
 *   Anxious / overwhelmed     → Chill Machine (174Hz · grounding)
 *   Mid-energy / focused      → Lo-fi Looper (warm palette)
 *   Restless / playful        → Magic Maker
 *   Active / pushing / fire   → Groove Machine (Sun-up Funk)
 *   Late night / quiet        → Groove Machine (Lofi Rooftop)
 *
 * Tap the chip → navigates to the relevant tool. If the user has
 * no check-in today, returns null.
 *
 * Lives at the top of the Day cockpit's check-in surface, just
 * above NowBar — a soft hand pointing toward what music to put
 * on right now.
 */

const LS_CHECKINS = 'colourmap:check-ins';

interface CheckIn {
  date?: string;
  mind?: string;
  hawkinsIdx?: number;
  mode?: string;
}

interface Suggestion {
  toolLabel: string;
  toolHref: string;
  reason: string;
  presetHint?: string;
  colour: string;
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function suggestFor(checkin: CheckIn): Suggestion | null {
  const mind = (checkin.mind || '').toLowerCase();
  const mode = (checkin.mode || '').toLowerCase();
  const energy = checkin.hawkinsIdx ?? 5;

  // Heavy / low-energy moods — Chill grounding
  if (
    mind.includes('stuck') ||
    mind.includes('overwhelm') ||
    mind.includes('confus') ||
    energy <= 2
  ) {
    return {
      toolLabel: 'Chill Machine',
      toolHref: '/sounds#tuner',
      reason: 'a slow ground beneath all that',
      presetHint: 'try 174 Hz · waters layer',
      colour: '#9B6BA0',
    };
  }

  // Restless / loaded — Maker for tactile play
  if (mind.includes('restless') || mind.includes('loaded')) {
    return {
      toolLabel: 'Magic Maker',
      toolHref: '/sounds#maker',
      reason: 'channel the restlessness into colour',
      colour: '#7AAA58',
    };
  }

  // Focused / efficient — Lo-fi study beats
  if (mind.includes('focus') || mind.includes('efficient') || mode.includes('working')) {
    return {
      toolLabel: 'Lo-fi Looper',
      toolHref: '/sounds#looper',
      reason: "beats that don't pull your attention",
      colour: '#7A3850',
    };
  }

  // Active / pushing / on fire — Groove with energy
  if (
    mind.includes('flow') ||
    mind.includes('light') ||
    mode.includes('on fire') ||
    mode.includes('creating') ||
    mode.includes('pushing') ||
    energy >= 8
  ) {
    return {
      toolLabel: 'Groove Machine',
      toolHref: '/sounds#groove',
      reason: 'ride the wave',
      presetHint: 'try Sun-up Funk',
      colour: '#C4A060',
    };
  }

  // Relaxed / drifting — Lofi Rooftop
  if (mind.includes('relax') || mode.includes('rest') || mode.includes('drift')) {
    return {
      toolLabel: 'Groove Machine',
      toolHref: '/sounds#groove',
      reason: 'gentle rhythm to drift with',
      presetHint: 'try Lofi Rooftop',
      colour: '#6A4A7A',
    };
  }

  // Default — Chill Machine
  return {
    toolLabel: 'Chill Machine',
    toolHref: '/sounds#tuner',
    reason: 'a soft place to start',
    colour: '#C4A060',
  };
}

export default function MoodSuggestion() {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    const checkins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
    const today = new Date().toISOString().slice(0, 10);
    const latestToday = checkins.find(
      (c) => c.date && new Date(c.date).toISOString().slice(0, 10) === today,
    );
    if (!latestToday) return;
    setSuggestion(suggestFor(latestToday));
  }, []);

  if (!suggestion) return null;

  return (
    <Link
      href={suggestion.toolHref}
      className="block transition-all hover:scale-[1.01]"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="rounded-xl"
        style={{
          background: `${suggestion.colour}10`,
          border: `1px solid ${suggestion.colour}30`,
          padding: '12px 16px',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="block rounded-full"
            style={{
              width: 14,
              height: 14,
              background: suggestion.colour,
              flexShrink: 0,
            }}
          />
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: '#5C3018',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 700, color: suggestion.colour }}>
                {suggestion.toolLabel}
              </span>{' '}
              <span style={{ color: '#7A5438', fontStyle: 'italic' }}>— {suggestion.reason}</span>
            </p>
            {suggestion.presetHint && (
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  color: '#8A6A4A',
                  opacity: 0.7,
                  marginTop: 2,
                }}
              >
                {suggestion.presetHint}
              </p>
            )}
          </div>
          <span
            className="shrink-0"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: 600,
              color: suggestion.colour,
              opacity: 0.7,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            tap →
          </span>
        </div>
      </div>
    </Link>
  );
}
