'use client';

import { useEffect, useState } from 'react';

/*
 * LifeCategoriesEmptyState — the welcoming first-run surface for
 * the Overview tab. Shows up when the user has zero life
 * categories, replacing the empty Compass / Strip / Categories
 * blocks with one warm, big, readable input.
 *
 * Per Martin (2026-04-25): "life map and categories. directly
 * enter categories of ur life u wanna work on or missions in big
 * readable easy. then life map or life catefories displays them.
 * but al is hudden until u add first category."
 *
 * Once the user adds their first category, the rest of the
 * Overview surface (Strip + Compass + Categories grid) takes
 * over. This component returns null when categories already
 * exist.
 *
 * Writes to colourmap:life-categories — same key as
 * <LifeCategoriesStrip> and <LifeCategories>, so the new entry
 * appears in both immediately.
 */

const CATS_KEY = 'colourmap:life-categories';

interface LifeCategoryLite {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const CAT_COLORS = [
  '#D4805A', // terracotta
  '#7AAA58', // sage
  '#6890B0', // sky
  '#9B6BA0', // lavender
  '#C4A060', // ochre
  '#5AA8B0', // teal
  '#B07070', // rose
  '#7A8A50', // olive
];

const SUGGESTIONS = [
  'Music',
  'Family',
  'Body',
  'Work',
  'Wonder',
  'Friends',
  'Money',
  'Home',
  'Travel',
  'Learning',
];

function loadCategories(): LifeCategoryLite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCategories(cats: LifeCategoryLite[]): void {
  try {
    localStorage.setItem(CATS_KEY, JSON.stringify(cats));
    // Trigger storage events so siblings (Strip, full Categories) refresh.
    window.dispatchEvent(new StorageEvent('storage', { key: CATS_KEY }));
  } catch {
    /* silent */
  }
}

export default function LifeCategoriesEmptyState() {
  const [categories, setCategories] = useState<LifeCategoryLite[] | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setCategories(loadCategories());
    function onStorage(e: StorageEvent) {
      if (e.key === CATS_KEY || e.key === null) {
        setCategories(loadCategories());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Pre-mount: render nothing (avoid flicker before localStorage read).
  if (categories === null) return null;
  // User already has categories — nothing to show; let the rest of
  // the Overview render.
  if (categories.length > 0) return null;

  function add(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next: LifeCategoryLite[] = [
      ...categories!,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        color: CAT_COLORS[(categories?.length ?? 0) % CAT_COLORS.length],
        createdAt: new Date().toISOString(),
      },
    ];
    saveCategories(next);
    setCategories(next);
    setInput('');
  }

  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col items-center gap-5"
      style={{
        background: '#C4A06010',
        border: '1px solid #C4A06028',
        borderRadius: 18,
        padding: '24px 16px',
      }}
    >
      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 17,
          color: '#5C3018',
          lineHeight: 1.45,
          letterSpacing: '0.04em',
        }}
      >
        what part of your life do you want to tend to?
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(input);
        }}
        className="w-full"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Music, Family, Body, …"
          autoComplete="off"
          className="w-full border-b bg-transparent pb-2 pt-1 text-center outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
          style={{
            fontFamily: 'var(--font-handwritten)',
            fontSize: 22,
            color: '#5C3018',
            borderColor: '#C4A06040',
            lineHeight: 1.3,
          }}
        />
      </form>
      <p
        className="text-center"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          color: '#8A6A4A',
          opacity: 0.7,
          letterSpacing: '0.04em',
        }}
      >
        or pick one to start —
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="cursor-pointer rounded-full px-3.5 py-1.5 transition-all hover:scale-105"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              fontWeight: 600,
              color: CAT_COLORS[i % CAT_COLORS.length],
              background: `${CAT_COLORS[i % CAT_COLORS.length]}12`,
              border: `1px solid ${CAT_COLORS[i % CAT_COLORS.length]}40`,
              letterSpacing: '0.04em',
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          color: '#8A6A4A',
          opacity: 0.55,
        }}
      >
        your life map appears once you add the first one.
      </p>
    </div>
  );
}
