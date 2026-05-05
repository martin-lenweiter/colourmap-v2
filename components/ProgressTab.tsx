'use client';

import { useEffect, useState } from 'react';
import CockpitSections from '@/components/CockpitSection';
import LifeCategories from '@/components/LifeCategories';
import MasteryBox from '@/components/MasteryBox';
import { useStyle } from '@/components/StyleContext';
import WeekShape from '@/components/WeekShape';

const VISION_KEY = 'colourmap:vision';

export default function ProgressTab() {
  const { style } = useStyle();
  const [vision, setVision] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setVision(localStorage.getItem(VISION_KEY) ?? '');
    } catch {
      /* silent */
    }
    setLoaded(true);
  }, []);

  function handleVisionChange(val: string) {
    setVision(val);
    try {
      localStorage.setItem(VISION_KEY, val);
    } catch {
      /* silent */
    }
  }

  if (!loaded) return null;

  return (
    <div className="space-y-10">
      {/* ── Vision anchor ─────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <p
          className="uppercase tracking-[0.22em]"
          style={{
            fontFamily: style.headingFont,
            fontSize: '11px',
            color: '#C4A060',
            opacity: 0.7,
          }}
        >
          what I am building toward
        </p>
        <textarea
          value={vision}
          onChange={(e) => handleVisionChange(e.target.value)}
          placeholder="write your vision here..."
          rows={2}
          className="w-full resize-none border-b bg-transparent pb-2 text-center outline-none placeholder:opacity-30"
          style={{
            fontFamily: 'var(--font-handwritten)',
            fontSize: '26px',
            lineHeight: 1.35,
            color: '#5C3018',
            borderColor: '#C4A06025',
            caretColor: '#C4A060',
          }}
        />
      </div>

      {/* ── Life categories ──────────────────────────────── */}
      <div>
        <p
          className="mb-3 uppercase tracking-[0.22em]"
          style={{
            fontFamily: style.headingFont,
            fontSize: '11px',
            color: '#C4A060',
            opacity: 0.7,
          }}
        >
          my life areas
        </p>
        <LifeCategories />
      </div>

      {/* ── Mastery domains ───────────────────────────────── */}
      <div>
        <p
          className="mb-3 uppercase tracking-[0.22em]"
          style={{
            fontFamily: style.headingFont,
            fontSize: '11px',
            color: '#C4A060',
            opacity: 0.7,
          }}
        >
          how I want to grow
        </p>
        <MasteryBox />
      </div>

      {/* ── Active programs ───────────────────────────────── */}
      <div>
        <p
          className="mb-3 uppercase tracking-[0.22em]"
          style={{
            fontFamily: style.headingFont,
            fontSize: '11px',
            color: '#C4A060',
            opacity: 0.7,
          }}
        >
          what I do daily
        </p>
        <CockpitSections />
      </div>

      {/* ── Test ideas ────────────────────────────────────── */}
      <div>
        <p
          className="mb-3 uppercase tracking-[0.22em]"
          style={{
            fontFamily: style.headingFont,
            fontSize: '11px',
            color: '#C4A060',
            opacity: 0.7,
          }}
        >
          test ideas
        </p>
        <WeekShape />
      </div>
    </div>
  );
}
