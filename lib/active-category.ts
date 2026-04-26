'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   Active life category — a single shared "what am I working
   on right now" state, accessible from any surface.

   Set by tapping a category in LifeCategoriesStrip or the
   Life-Categories polygon; consumed by the compass row so the
   three compasses can scope their content to the active
   category instead of showing aggregate views.

   Persisted to localStorage so it survives reloads. A custom
   `colourmap:active-category-changed` event is dispatched on
   every set so subscribers in the same tab react immediately
   (the native `storage` event only fires across tabs).
   ═══════════════════════════════════════════════════════════ */

export const ACTIVE_CATEGORY_KEY = 'colourmap:active-life-category';
export const ACTIVE_CATEGORY_EVENT = 'colourmap:active-category-changed';

export function getActiveCategoryId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_CATEGORY_KEY) || null;
  } catch {
    return null;
  }
}

export function setActiveCategoryId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CATEGORY_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CATEGORY_KEY);
    }
    window.dispatchEvent(new CustomEvent(ACTIVE_CATEGORY_EVENT, { detail: id }));
  } catch {
    /* silent */
  }
}

export function useActiveCategoryId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(getActiveCategoryId());
    function onChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string' || detail === null) {
        setId(detail);
      } else {
        setId(getActiveCategoryId());
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key === ACTIVE_CATEGORY_KEY) setId(getActiveCategoryId());
    }
    window.addEventListener(ACTIVE_CATEGORY_EVENT, onChange as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ACTIVE_CATEGORY_EVENT, onChange as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return id;
}
