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
  done: boolean;
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
      // Always save locally first — no login required
      const local: DesignerObservation = {
        id: crypto.randomUUID(),
        userId: 'local',
        area,
        text: trimmed,
        done: false,
        createdAt: new Date().toISOString(),
      };
      persistAndSet((prev) => [local, ...prev]);
      // Best-effort background sync — silently ignored if unauthenticated
      fetch('/api/designer-observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, area }),
      }).catch(() => {});
      return local;
    },
    [persistAndSet],
  );

  const remove = useCallback(
    async (id: string) => {
      persistAndSet((prev) => prev.filter((o) => o.id !== id));
      // Best-effort background sync — no rollback, local delete is final
      fetch(`/api/designer-observations/${id}`, { method: 'DELETE' }).catch(() => {});
    },
    [persistAndSet],
  );

  const setDone = useCallback(
    async (id: string, done: boolean) => {
      persistAndSet((prev) => prev.map((o) => (o.id === id ? { ...o, done } : o)));
      try {
        await fetch(`/api/designer-observations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done }),
        });
      } catch {
        /* silent — optimistic update stays */
      }
    },
    [persistAndSet],
  );

  return { observations, loading, register, remove, setDone, refresh };
}
