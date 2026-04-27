'use client';

import { useEffect, useState } from 'react';

import { colours, fontSize, letterSpacing, radii, space } from '@/lib/design-tokens';

const LS_CHECKINS = 'colourmap:check-ins';
const LS_ARCHETYPE = 'colourmap-journey-archetype';

interface CheckIn {
  date: string;
  feelingTone?: string;
}

const ARCHETYPE_PHRASES: Record<string, string> = {
  artist: 'You feel everything — that is the instrument.',
  architect: 'You build order from the raw material.',
  psychologist: 'You understand the pattern beneath.',
  warrior: 'You face what others avoid.',
  alchemist: 'You turn this into something.',
};

function timeOfDay(): 'morning' | 'midday' | 'afternoon' | 'evening' | 'late' {
  const h = new Date().getHours();
  if (h < 6) return 'late';
  if (h < 11) return 'morning';
  if (h < 14) return 'midday';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'late';
}

function timePhrase(t: ReturnType<typeof timeOfDay>): string {
  switch (t) {
    case 'morning':
      return 'Quiet morning';
    case 'midday':
      return 'Midday';
    case 'afternoon':
      return 'Afternoon';
    case 'evening':
      return 'Evening';
    case 'late':
      return 'Late hour';
  }
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

interface ContextShape {
  chapter: string;
  archetypeId: string;
  feelingTone: string;
}

function composeBrief(ctx: ContextShape): string {
  const time = timePhrase(timeOfDay());
  const parts: string[] = [time + '.'];

  if (ctx.chapter) {
    parts.push(`${ctx.chapter}.`);
  }

  if (ctx.archetypeId && ARCHETYPE_PHRASES[ctx.archetypeId]) {
    parts.push(ARCHETYPE_PHRASES[ctx.archetypeId]);
  } else if (!ctx.chapter && ctx.feelingTone) {
    parts.push(`Last check-in: ${ctx.feelingTone}.`);
  }

  return parts.join(' ');
}

export default function DoingContextBar() {
  const [brief, setBrief] = useState('');

  useEffect(() => {
    const checkins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
    const lastTone = checkins[checkins.length - 1]?.feelingTone ?? '';
    const archetypeId =
      (typeof window !== 'undefined' ? localStorage.getItem(LS_ARCHETYPE) : null) ?? '';

    // Chapter comes from API — fire-and-forget, graceful fallback
    const buildWithChapter = (chapter: string) => {
      setBrief(composeBrief({ chapter, archetypeId, feelingTone: lastTone }));
    };

    // Render immediately with what we have from localStorage
    buildWithChapter('');

    fetch('/api/life-scan-answers')
      .then((r) => (r.ok ? r.json() : { answers: {} }))
      .then((data: { answers?: { chapter_title?: string } }) => {
        buildWithChapter(data.answers?.chapter_title?.trim() ?? '');
      })
      .catch(() => {});

    const timer = setInterval(() => {
      const freshCheckins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
      const freshTone = freshCheckins[freshCheckins.length - 1]?.feelingTone ?? '';
      const freshArchetypeId =
        (typeof window !== 'undefined' ? localStorage.getItem(LS_ARCHETYPE) : null) ?? '';
      setBrief(
        composeBrief({ chapter: '', archetypeId: freshArchetypeId, feelingTone: freshTone }),
      );
    }, 60_000);

    return () => clearInterval(timer);
  }, []);

  if (!brief) return null;

  return (
    <div
      style={{
        background: `${colours.ochre}10`,
        border: `1px solid ${colours.ochre}28`,
        borderRadius: radii.lg,
        padding: `${space.md}px ${space.lg}px`,
      }}
    >
      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: fontSize.base,
          color: colours.brownDeep,
          lineHeight: 1.55,
          letterSpacing: letterSpacing.body,
        }}
      >
        {brief}
      </p>
    </div>
  );
}
