'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   FREQUENCY BOX — "Are you in tune?"
   A vibrating string that synthesizes body/focus/clarity/emotion
   into one visual. Speaks to the body, not the mind.
   ═══════════════════════════════════════════════════════════ */

const HAWKINS_COLORS = [
  '#B8D0E8',
  '#A0B0D0',
  '#C8B0D0',
  '#D4605A',
  '#E0844A',
  '#F0E060',
  '#C8E880',
  '#88C8E8',
  '#A0D0A0',
  '#F0F0E0',
];

function loadNum(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? Number(v) : fallback;
  } catch {
    return fallback;
  }
}

function getDirection(
  body: number,
  focus: number,
  clarity: number,
): { word: string; color: string } {
  // body: 0=relaxed, 4=tense
  // focus: 0=productive, 4=disconnected
  // clarity: 0=clear, 4=blocking

  const tense = body >= 3;
  const relaxed = body <= 1;
  const focused = focus <= 1;
  const drifting = focus >= 3;
  const clear = clarity <= 1;
  const foggy = clarity >= 3;

  // In tune — relaxed, focused, clear
  if (relaxed && focused && clear) return { word: 'in tune', color: '#7AAA58' };
  if (body === 2 && focus === 2 && clarity === 2)
    return { word: 'finding balance', color: '#C4A060' };

  // Too tight
  if (tense && foggy) return { word: 'breathe', color: '#D4805A' };
  if (tense && focused) return { word: 'channel this', color: '#6890B0' };
  if (tense && drifting) return { word: 'pause', color: '#9B6BA0' };

  // Too loose
  if (relaxed && drifting) return { word: 'engage', color: '#C4A060' };
  if (relaxed && foggy) return { word: 'wake up gently', color: '#C8906A' };

  // Clarity issues
  if (foggy && focused) return { word: 'ground yourself', color: '#B8A080' };
  if (foggy) return { word: 'simplify', color: '#A0907A' };

  // Mild states
  if (tense) return { word: 'soften', color: '#D4805A' };
  if (drifting) return { word: 'come back', color: '#C4A060' };
  if (clear && focused) return { word: 'ride this wave', color: '#7AAA58' };

  return { word: 'present', color: '#8A6A4A' };
}

export default function FrequencyBox() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('colourmap:frequency-open') !== 'false';
  });
  const [bodyIdx, setBodyIdx] = useState(2);
  const [focusIdx, setFocusIdx] = useState(2);
  const [clarityIdx, setClarityIdx] = useState(2);
  const [hawkinsIdx, setHawkinsIdx] = useState(4);

  useEffect(() => {
    setBodyIdx(loadNum('colourmap:body-idx', 2));
    setFocusIdx(loadNum('colourmap:focus-idx', 2));
    setClarityIdx(loadNum('colourmap:clarity-idx', 2));
    setHawkinsIdx(loadNum('colourmap:process-idx', 4));

    // Poll for changes from the check-in card
    const iv = setInterval(() => {
      setBodyIdx(loadNum('colourmap:body-idx', 2));
      setFocusIdx(loadNum('colourmap:focus-idx', 2));
      setClarityIdx(loadNum('colourmap:clarity-idx', 2));
      setHawkinsIdx(loadNum('colourmap:process-idx', 4));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const W = 320;
  const H = 100;
  const cy = H / 2;

  // Derive wave properties from state
  // body: 0=relaxed (long wave), 4=tense (short wave)
  const wavelength = 80 - bodyIdx * 12; // 80 → 32
  // focus: 0=productive (tall), 4=disconnected (flat)
  const amplitude = 30 - focusIdx * 5; // 30 → 10
  // clarity: 0=clear (smooth), 4=foggy (jagged)
  const noiseFactor = clarityIdx * 0.3; // 0 → 1.2
  // emotion color
  const color = HAWKINS_COLORS[Math.min(hawkinsIdx, HAWKINS_COLORS.length - 1)];

  // Generate the sine wave path with noise
  const points: string[] = [];
  const seed = hawkinsIdx * 7 + bodyIdx * 3; // deterministic "noise"
  for (let x = 0; x <= W; x += 2) {
    const phase = (x / wavelength) * Math.PI * 2;
    let y = cy + Math.sin(phase) * amplitude;
    // Add jaggedness based on clarity
    if (noiseFactor > 0) {
      const noise =
        Math.sin(x * 0.7 + seed) * noiseFactor * 8 + Math.sin(x * 1.3 + seed * 2) * noiseFactor * 4;
      y += noise;
    }
    points.push(`${x},${y.toFixed(1)}`);
  }
  const pathD = `M ${points.join(' L ')}`;

  const direction = getDirection(bodyIdx, focusIdx, clarityIdx);

  return (
    <div
      className="space-y-3 rounded-3xl border border-[#7a543833] px-5 py-5"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      {/* Title — tap to toggle */}
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          localStorage.setItem('colourmap:frequency-open', String(next));
        }}
        className="flex w-full cursor-pointer items-center justify-center gap-2"
        style={{ background: 'none', border: 'none' }}
      >
        <p
          className="italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            color: '#8A6A4A',
            opacity: 0.95,
          }}
        >
          your frequency
        </p>
        <span
          className="text-[10px] transition-transform duration-200"
          style={{ color: '#8A6A4A80', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* The string */}
          <div className="flex justify-center">
            <svg width={W} height={H} style={{ overflow: 'visible' }}>
              {/* Resting line */}
              <line x1={0} y1={cy} x2={W} y2={cy} stroke="#C4A06015" strokeWidth={1} />
              {/* The wave */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'all 0.5s ease-out' }}
              />
              {/* Glow */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.15}
                style={{ transition: 'all 0.5s ease-out' }}
              />
              {/* Anchor dots at edges */}
              <circle cx={4} cy={cy} r={3} fill={color} opacity={0.6} />
              <circle cx={W - 4} cy={cy} r={3} fill={color} opacity={0.6} />
            </svg>
          </div>

          {/* Direction word */}
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 700,
              color: direction.color,
              letterSpacing: '0.06em',
              transition: 'color 0.5s',
            }}
          >
            {direction.word}
          </p>
        </>
      )}
    </div>
  );
}
