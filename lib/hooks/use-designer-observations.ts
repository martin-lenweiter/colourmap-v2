'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   useDesignerObservations — Supabase-backed feedback log

   Each observation is one block of typed feedback plus an
   optional "area" pill (Day, Music, Circles, Profile, etc.).
   Hydrates from a localStorage cache for instant first-paint
   then reconciles with the server. Optimistic add + delete
   with rollback on error.
   ═══════════════════════════════════════════════════════════ */

export interface DesignerObservation {
  id: string;
  userId: string;
  area: string | null;
  text: string;
  createdAt: string;
}

const CACHE_KEY = 'colourmap:designer-observations:cache';

function loadCache(): DesignerObservation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as DesignerObservation[]) : [];
  } catch {
    return [];
  }
}

function saveCache(items: DesignerObservation[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    /* silent */
  }
}

export function useDesignerObservations() {
  const [observations, setObservations] = useState<DesignerObservation[]>([]);
  const [loading, setLoading] = useState(true);

  const persistAndSet = useCallback(
    (next: DesignerObservation[] | ((prev: DesignerObservation[]) => DesignerObservation[])) => {
      setObservations((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        saveCache(value);
        return value;
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/designer-observations');
      if (res.ok) {
        const data = (await res.json()) as DesignerObservation[];
        persistAndSet(data);
      }
    } catch {
      /* silent — keep cache */
    } finally {
      setLoading(false);
    }
  }, [persistAndSet]);

  useEffect(() => {
    setObservations(loadCache());
    refresh();
  }, [refresh]);

  const register = useCallback(
    async (text: string, area: string | null): Promise<DesignerObservation | null> => {
      const trimmed = text.trim();
      if (!trimmed) return null;
      try {
        const res = await fetch('/api/designer-observations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmed, area }),
        });
        if (res.ok) {
          const created = (await res.json()) as DesignerObservation;
          persistAndSet((prev) => [created, ...prev]);
          return created;
        }
      } catch {
        /* silent */
      }
      return null;
    },
    [persistAndSet],
  );

  const remove = useCallback(
    async (id: string) => {
      const previous = observations;
      persistAndSet((prev) => prev.filter((o) => o.id !== id));
      try {
        const res = await fetch(`/api/designer-observations/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('delete failed');
      } catch {
        persistAndSet(previous);
      }
    },
    [observations, persistAndSet],
  );

  return { observations, loading, register, remove, refresh };
}
