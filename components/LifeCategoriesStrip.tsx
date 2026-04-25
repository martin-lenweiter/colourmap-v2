'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * LifeCategoriesStrip — horizontal scrollable row of big colour
 * dots, one per life category. Tap a dot to focus it (highlights +
 * shows the name + entry count below).
 *
 * Per Martin (2026-04-25): "your life map those big dots should be
 * the categories of our life. and we can slide them left right".
 *
 * Sits at the top of the Overview tab as a quick *visual map* of
 * where the user's attention has been. Detailed editing still lives
 * in <LifeCategories> below — this component is the "see it at a
 * glance + tap to focus" layer.
 *
 * Reads the same localStorage keys as LifeCategories so they stay in
 * sync without coupling the components together.
 */

const CATS_KEY = 'colourmap:life-categories';
const LOG_KEY = 'colourmap:life-log';

interface LifeCategoryLite {
  id: string;
  name: string;
  color: string;
}

interface LogEntryLite {
  id: string;
  categoryId: string;
}

const CAT_COLORS = [
  '#D4805A',
  '#C4A060',
  '#9B6BA0',
  '#6890B0',
  '#7A9A7A',
  '#C87050',
  '#5A7A8A',
  '#B07070',
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

function loadLog(): LogEntryLite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function LifeCategoriesStrip() {
  const [categories, setCategories] = useState<LifeCategoryLite[]>([]);
  const [log, setLog] = useState<LogEntryLite[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCategories(loadCategories());
    setLog(loadLog());
    function onStorage(e: StorageEvent) {
      if (e.key === CATS_KEY) setCategories(loadCategories());
      if (e.key === LOG_KEY) setLog(loadLog());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (categories.length === 0) return null;

  const focused = focusedId ? categories.find((c) => c.id === focusedId) : null;
  const focusedCount = focused ? log.filter((entry) => entry.categoryId === focused.id).length : 0;

  return (
    <div className="space-y-3">
      {/* Header pill */}
      <div className="flex justify-center">
        <span
          className="rounded-full px-4 py-1 uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#7A5438',
            background: '#C4A06012',
            border: '1px solid #C4A06028',
          }}
        >
          life map
        </span>
      </div>

      {/* Horizontal-scroll dot strip. Touch-action pan-x for smooth
          mobile flick. Snap-x mandatory so each dot rests center-
          aligned when the user lets go. */}
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory items-center gap-5 overflow-x-auto px-6 pb-3 pt-1 scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          touchAction: 'pan-x',
        }}
      >
        {categories.map((cat, i) => {
          const isFocused = focusedId === cat.id;
          const dotColor = cat.color || CAT_COLORS[i % CAT_COLORS.length];
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFocusedId(isFocused ? null : cat.id)}
              className="flex shrink-0 cursor-pointer snap-center flex-col items-center gap-2 bg-transparent transition-all"
              style={{
                border: 'none',
                padding: 0,
                opacity: focusedId === null ? 1 : isFocused ? 1 : 0.45,
              }}
              aria-pressed={isFocused}
              title={cat.name}
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: isFocused ? 72 : 60,
                  height: isFocused ? 72 : 60,
                  background: dotColor,
                  boxShadow: isFocused
                    ? `0 6px 16px -4px ${dotColor}66`
                    : '0 2px 6px rgba(94,58,20,0.08)',
                  border: `2px solid ${dotColor}`,
                  opacity: isFocused ? 1 : 0.85,
                }}
              />
              <span
                className="text-center"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '11px',
                  fontWeight: isFocused ? 700 : 600,
                  color: dotColor,
                  letterSpacing: '0.04em',
                  maxWidth: 84,
                  lineHeight: 1.2,
                }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Focus reveal — name + entry count for the tapped dot. Empty
          state is silent (no card) so the strip sits clean by
          default. */}
      {focused && (
        <p
          className="text-center italic animate-in fade-in duration-150"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            color: '#7A5438',
            opacity: 0.85,
          }}
        >
          <strong style={{ color: focused.color, fontWeight: 700 }}>{focused.name}</strong>
          {focusedCount > 0
            ? ` · ${focusedCount} entr${focusedCount === 1 ? 'y' : 'ies'}`
            : ' · no entries yet'}
        </p>
      )}

      {/* Hint */}
      {focusedId === null && (
        <p
          className="text-center italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '11px',
            color: '#8A6A4A',
            opacity: 0.5,
            letterSpacing: '0.04em',
          }}
        >
          slide left + right · tap a dot to focus
        </p>
      )}
    </div>
  );
}
