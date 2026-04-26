'use client';

import { useEffect, useState } from 'react';

import { setActiveCategoryId, useActiveCategoryId } from '@/lib/active-category';

/* ═══════════════════════════════════════════════════════════
   ActiveCategoryBanner — small pill that surfaces which life
   category the compass row is currently scoped to. Tap × to
   clear and return to aggregate views.

   Read by the user-facing copy: when this is visible, the
   compasses below should narrow their data to the named
   category. When it's empty, compasses show the aggregate.

   The banner reads the shared `colourmap:active-life-category`
   localStorage key (via useActiveCategoryId) so any surface
   that broadcasts a focus — LifeCategoriesStrip dot, Life-
   Categories polygon vertex, future Track Lines tap — drives
   the same indicator without coupling.
   ═══════════════════════════════════════════════════════════ */

const CATS_KEY = 'colourmap:life-categories';

interface LifeCategoryLite {
  id: string;
  name: string;
  color: string;
}

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

export default function ActiveCategoryBanner() {
  const activeId = useActiveCategoryId();
  const [categories, setCategories] = useState<LifeCategoryLite[]>([]);

  useEffect(() => {
    setCategories(loadCategories());
    function onStorage(e: StorageEvent) {
      if (e.key === CATS_KEY) setCategories(loadCategories());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!activeId) return null;
  const cat = categories.find((c) => c.id === activeId);
  if (!cat) return null;

  return (
    <div className="flex justify-center">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1"
        style={{
          background: `${cat.color}18`,
          border: `1px solid ${cat.color}55`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: 4,
            background: cat.color,
          }}
        />
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: cat.color,
          }}
        >
          focused: {cat.name}
        </span>
        <button
          type="button"
          onClick={() => setActiveCategoryId(null)}
          aria-label="Clear focus"
          style={{
            background: 'transparent',
            border: 'none',
            color: cat.color,
            opacity: 0.7,
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '0 2px',
            marginLeft: 2,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
