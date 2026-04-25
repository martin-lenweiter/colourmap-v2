'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * SecretCatalog — a 3×3 rainbow-tone passcode pad inside the
 * About modal that unlocks a tiny library of PDF deliverables.
 *
 * Per Martin (2026-04-25): "i also get catalog. with all the pdfs
 * but to unlock it there is a passcode slider. with passcode. and
 * a box of 9 squares. 3x3 and the passcode is top right top right
 * 2 times and bottom left one time. ... rainbow padbox password
 * with music."
 *
 * The pad cells are laid out:
 *
 *     0   1   2          ← top row (top-right = 2)
 *     3   4   5          ← middle
 *     6   7   8          ← bottom row (bottom-left = 6)
 *
 * Passcode = [2, 2, 6] (top-right, top-right, bottom-left).
 *
 * Each cell plays one note from an A-major-pentatonic spread when
 * tapped — so any random tap sequence sounds musical, not chaotic.
 * Correct entry plays a triumphant 4-note chord on top of an
 * already-unlocked state and reveals the catalog. Unlock state is
 * remembered in localStorage so the user doesn't have to re-tap on
 * every visit.
 *
 * "Future use" intent: this primitive can hide other surfaces
 * later — dev pages, beta features, secret studio mode. The
 * passcode is editable in one place (PASSCODE constant).
 */

// 3×3 rainbow palette — warm-to-cool-to-warm wheel that matches
// the rest of the app's earth tones.
const CELL_COLOURS = [
  '#D4805A', // 0 top-left — terracotta
  '#E0A040', // 1 top — saffron
  '#C4A060', // 2 top-right — ochre (target)
  '#7AAA58', // 3 mid-left — sage
  '#5AA8B0', // 4 centre — teal
  '#6890B0', // 5 mid-right — sky
  '#9B6BA0', // 6 bottom-left — lavender (target)
  '#7A3850', // 7 bottom — wine
  '#B33A2B', // 8 bottom-right — brand red
];

// A-major-pentatonic (A C# E F# A C# E F# A) — every cell sounds
// pleasant on its own and any tap sequence harmonises.
const CELL_FREQS = [
  220.0, // A3
  277.18, // C#4
  329.63, // E4
  369.99, // F#4
  440.0, // A4
  554.37, // C#5
  659.25, // E5
  739.99, // F#5
  880.0, // A5
];

const PASSCODE: ReadonlyArray<number> = [2, 2, 6];
const LS_UNLOCK_KEY = 'colourmap:secret-catalog-unlocked';

// Curated documents that the secret catalog reveals. PDF URLs are
// served from public/pdfs/ — Next.js exposes that folder as /pdfs.
interface CatalogEntry {
  title: string;
  description: string;
  href: string;
  size: string;
  colour: string;
}

const CATALOG: CatalogEntry[] = [
  {
    title: 'Vision · April 2026',
    description: 'Master vision document — 9-section consolidation of the whole roadmap.',
    href: '/pdfs/colourmap-vision-2026-04.pdf',
    size: '290 KB',
    colour: '#B33A2B',
  },
  {
    title: 'Social media that doesn’t cost us money',
    description: 'Salons → Underground Nights → Experiments → Festivals. 90-day plan.',
    href: '/pdfs/free-social-media-strategy.pdf',
    size: '180 KB',
    colour: '#7AAA58',
  },
  {
    title: 'Skills curriculum v1',
    description:
      '10-module learning map — what to learn, when, why. For an artist-vibecoder shipping Colourmap (and maybe heading to Politecnico Milano).',
    href: '/pdfs/colourmap-skills-curriculum.pdf',
    size: '290 KB',
    colour: '#9B6BA0',
  },
];

export default function SecretCatalog() {
  const [pressed, setPressed] = useState<number[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [glowIdx, setGlowIdx] = useState<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // Restore unlock state from localStorage on mount.
  useEffect(() => {
    try {
      if (localStorage.getItem(LS_UNLOCK_KEY) === '1') setUnlocked(true);
    } catch {
      /* silent */
    }
    return () => {
      try {
        ctxRef.current?.close();
      } catch {
        /* silent */
      }
    };
  }, []);

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      // biome-ignore lint/suspicious/noExplicitAny: webkit AudioContext
      const Ctor: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }

  /** Play a single soft sine note with a gentle pluck envelope. */
  function playTone(freq: number, when = 0, duration = 0.5, gain = 0.18) {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(gain, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(env);
      env.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch {
      /* silent — page may not have audio yet */
    }
  }

  /** Triumphant 4-note arpeggio for a successful unlock. */
  function playUnlockChord() {
    [440, 554.37, 659.25, 880].forEach((f, i) => playTone(f, i * 0.1, 0.9, 0.16));
  }

  function handleCellTap(idx: number) {
    if (unlocked) return;
    playTone(CELL_FREQS[idx]);
    setGlowIdx(idx);
    setTimeout(() => setGlowIdx(null), 220);

    setPressed((prev) => {
      const next = [...prev, idx];
      // Compare against the passcode.
      if (next.length >= PASSCODE.length) {
        const tail = next.slice(next.length - PASSCODE.length);
        if (tail.every((v, i) => v === PASSCODE[i])) {
          // Unlocked.
          setUnlocked(true);
          try {
            localStorage.setItem(LS_UNLOCK_KEY, '1');
          } catch {
            /* silent */
          }
          setTimeout(playUnlockChord, 60);
          return [];
        }
      }
      // Cap at PASSCODE length — keeps memory minimal and gives
      // a quick "slot machine" feel as the last few taps roll.
      if (next.length > PASSCODE.length) {
        // Wrong sequence — soft shake + reset.
        setShake(true);
        setTimeout(() => setShake(false), 320);
        return [];
      }
      return next;
    });
  }

  function relock() {
    setUnlocked(false);
    setPressed([]);
    try {
      localStorage.removeItem(LS_UNLOCK_KEY);
    } catch {
      /* silent */
    }
  }

  return (
    <div
      className="rounded-lg animate-in fade-in duration-150"
      style={{
        background: '#F5E8C812',
        border: '1px solid #9B6BA033',
        padding: '14px 16px',
      }}
    >
      <p
        className="mb-3 text-center uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#7A3850',
          opacity: 0.85,
        }}
      >
        {unlocked ? 'catalog · unlocked' : 'catalog · unlock'}
      </p>

      {!unlocked && (
        <>
          {/* 3×3 rainbow pad */}
          <div
            className="mx-auto"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              maxWidth: 220,
              animation: shake ? 'sc-shake 0.32s ease-in-out' : undefined,
            }}
          >
            {CELL_COLOURS.map((c, i) => {
              const isGlowing = glowIdx === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCellTap(i)}
                  className="cursor-pointer rounded-lg transition-all"
                  style={{
                    aspectRatio: '1',
                    background: c,
                    border: 'none',
                    opacity: isGlowing ? 1 : 0.78,
                    transform: isGlowing ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: isGlowing ? `0 6px 18px -4px ${c}` : 'none',
                    padding: 0,
                  }}
                  aria-label={`Pad cell ${i + 1}`}
                />
              );
            })}
          </div>
          {/* Tap counter dots — shows how many in the current
              attempt; resets on success or wrong sequence. */}
          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: PASSCODE.length }, (_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all"
                style={{
                  width: 8,
                  height: 8,
                  background: i < pressed.length ? '#9B6BA0' : '#9B6BA025',
                  opacity: i < pressed.length ? 1 : 0.55,
                }}
              />
            ))}
          </div>
          <p
            className="mt-3 text-center italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              color: '#8A6A4A',
              opacity: 0.6,
            }}
          >
            tap a sequence · each cell sings a note
          </p>
        </>
      )}

      {unlocked && (
        <>
          <ul className="space-y-3">
            {CATALOG.map((entry) => (
              <li
                key={entry.href}
                className="rounded-lg"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${entry.colour}30`,
                  padding: '10px 12px',
                }}
              >
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    textDecoration: 'none',
                  }}
                >
                  <div className="mb-1 flex items-baseline gap-2">
                    <span
                      style={{
                        display: 'inline-block',
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: entry.colour,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: entry.colour,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {entry.title}
                    </span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        color: '#8A6A4A',
                        opacity: 0.6,
                      }}
                    >
                      {entry.size} · PDF
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11.5,
                      color: 'var(--muted-foreground)',
                      lineHeight: 1.45,
                      paddingLeft: 17,
                    }}
                  >
                    {entry.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={relock}
            className="mt-4 cursor-pointer block mx-auto"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: '#8A6A4A',
              opacity: 0.5,
              letterSpacing: '0.08em',
              background: 'none',
              border: 'none',
              padding: 4,
            }}
            title="Lock the catalog again"
          >
            re-lock
          </button>
        </>
      )}

      <style>{`
        @keyframes sc-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
