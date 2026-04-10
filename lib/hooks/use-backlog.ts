'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   useBacklog — client hook for /api/backlog (to-do items)
   Replaces localStorage with Supabase-backed persistence.
   ═══════════════════════════════════════════════════════════ */

export interface BacklogItem {
  id: string;
  title: string;
  done: boolean;
  notes: string | null;
  createdAt: string;
}

export function useBacklog() {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/backlog');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      /* silent — keep stale data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (title: string) => {
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const item = await res.json();
        setItems((prev) => [...prev, item]);
      }
    } catch {
      /* silent */
    }
  }, []);

  const toggle = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      // Optimistic update
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
      try {
        await fetch(`/api/backlog/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: !item.done }),
        });
      } catch {
        // Revert on failure
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: item.done } : i)));
      }
    },
    [items],
  );

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await fetch(`/api/backlog/${id}`, { method: 'DELETE' });
      } catch {
        refresh();
      }
    },
    [refresh],
  );

  return { items, loading, add, toggle, remove, refresh };
}
