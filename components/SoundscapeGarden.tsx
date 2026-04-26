'use client';

import { useEffect, useState } from 'react';

/*
 * SoundscapeGarden — Layer 5 of the Overview vision. A small
 * constellation of dots, one per soundscape (preset / saved mix /
 * Lofi palette / Maker scale) the user has touched. Brighter +
 * pulsing for ones recently played.
 *
 * V1 sources:
 *   - colourmap:groove-preset       (current Groove preset)
 *   - colourmap:tuner-mixes         (saved Chill mixes)
 *   - colourmap:sound-session       (last played tool's meta)
 *
 * Returns null if the user has touched zero soundscapes.
 *
 * Spec: docs/specs/overview-vision-progression-patterns-beauty.md
 */

const LS_GROOVE_PRESET = 'colourmap:groove-preset';
const LS_TUNER_MIXES = 'colourmap:tuner-mixes';
const LS_SOUND_SESSION = 'colourmap:sound-session';

interface Mix {
  name: string;
  base?: number;
}

interface SoundSession {
  activeTool?: string;
  meta?: string;
  lastActiveAt?: string;
}

interface Star {
  id: string;
  label: string;
  /** Hex */
  colour: string;
  /** Source for grouping */
  source: 'chill' | 'groove';
  /** Whether this is the most-recently-touched */
  isLatest: boolean;
}

const PRESET_COLOURS: Record<string, { name: string; colour: string }> = {
  'sun-up-funk': { name: 'Sun-up Funk', colour: '#C4A060' },
  'tech-house': { name: 'Tech House', colour: '#3A6890' },
  tropical: { name: 'Tropical', colour: '#E08858' },
  'slow-roll': { name: 'Slow Roll', colour: '#7A3850' },
  'boom-bap': { name: 'Boom Bap', colour: '#6A4A2A' },
  'epic-electro': { name: 'Epic Electro', colour: '#3868D8' },
  'lofi-rooftop': { name: 'Lofi Rooftop', colour: '#6A4A7A' },
};

const CHILL_PALETTE = ['#5AA8B0', '#88C8A8', '#C4A060', '#9B6BA0', '#D4805A', '#7AAA58'];

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadStr(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

export default function SoundscapeGarden() {
  const [stars, setStars] = useState<Star[]>([]);
  const [latestPlaying, setLatestPlaying] = useState(false);

  useEffect(() => {
    const stars: Star[] = [];
    const session = loadJSON<SoundSession>(LS_SOUND_SESSION, {});
    const latestId = session.activeTool;

    // Groove preset — track the *current* preset only (Groove
    // doesn't keep a history yet). Even if it's the default
    // Sun-up Funk, count it once if the user has used Groove.
    const grooveId = loadStr(LS_GROOVE_PRESET);
    if (grooveId) {
      const meta = PRESET_COLOURS[grooveId];
      if (meta) {
        stars.push({
          id: `groove:${grooveId}`,
          label: meta.name,
          colour: meta.colour,
          source: 'groove',
          isLatest: latestId === 'groove-machine',
        });
      }
    }

    // Chill saved mixes — each is a distinct soundscape the user
    // built deliberately.
    const mixes = loadJSON<Mix[]>(LS_TUNER_MIXES, []);
    mixes.forEach((mix, i) => {
      stars.push({
        id: `chill:${i}:${mix.name}`,
        label: mix.name,
        colour: CHILL_PALETTE[i % CHILL_PALETTE.length],
        source: 'chill',
        isLatest: latestId === 'chill-machine' && i === 0,
      });
    });

    setStars(stars);
    setLatestPlaying(!!latestId);
  }, []);

  if (stars.length === 0) return null;

  return (
    <div
      className="rounded-xl"
      style={{
        background: '#3A68900C',
        border: '1px solid #3A689022',
        padding: '14px 16px 12px',
      }}
    >
      <p
        className="mb-3 text-center uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#3A6890',
          opacity: 0.85,
        }}
      >
        soundscape garden
      </p>
      <div className="flex flex-wrap items-end justify-center gap-3 px-2">
        {stars.map((s) => (
          <div
            key={s.id}
            className="flex flex-col items-center gap-1"
            title={`${s.source === 'chill' ? 'Chill' : 'Groove'} · ${s.label}`}
          >
            <span
              className="block rounded-full transition-all"
              style={{
                width: s.isLatest ? 22 : 14,
                height: s.isLatest ? 22 : 14,
                background: s.colour,
                opacity: s.isLatest ? 1 : 0.6,
                boxShadow: s.isLatest
                  ? `0 4px 14px -4px ${s.colour}`
                  : '0 1px 4px rgba(94,58,20,0.08)',
                animation:
                  s.isLatest && latestPlaying ? 'sg-pulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <span
              className="text-center"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                fontWeight: s.isLatest ? 700 : 500,
                color: s.colour,
                opacity: s.isLatest ? 1 : 0.7,
                letterSpacing: '0.04em',
                maxWidth: 72,
                lineHeight: 1.2,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <p
        className="mt-3 text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10.5,
          color: '#8A6A4A',
          opacity: 0.55,
          letterSpacing: '0.04em',
        }}
      >
        the bigger dots are where you've been most recently
      </p>
      <style>{`
        @keyframes sg-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}
