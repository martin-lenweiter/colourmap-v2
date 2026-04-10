'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   useMissions — client hook for /api/missions
   Replaces localStorage with Supabase-backed persistence.
   ═══════════════════════════════════════════════════════════ */

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  blocking: string | null;
  nextStep: string | null;
  completed: boolean;
  createdAt: string;
}

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/missions');
      if (res.ok) {
        const data = await res.json();
        setMissions(data);
      }
    } catch {
      /* silent */
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
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const mission = await res.json();
        setMissions((prev) => [...prev, mission]);
      }
    } catch {
      /* silent */
    }
  }, []);

  const toggleComplete = useCallback(
    async (id: string) => {
      const mission = missions.find((m) => m.id === id);
      if (!mission) return;
      // Optimistic update
      setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));
      try {
        await fetch(`/api/missions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !mission.completed }),
        });
      } catch {
        setMissions((prev) =>
          prev.map((m) => (m.id === id ? { ...m, completed: mission.completed } : m)),
        );
      }
    },
    [missions],
  );

  const remove = useCallback(
    async (id: string) => {
      setMissions((prev) => prev.filter((m) => m.id !== id));
      try {
        await fetch(`/api/missions/${id}`, { method: 'DELETE' });
      } catch {
        refresh();
      }
    },
    [refresh],
  );

  return { missions, loading, add, toggleComplete, remove, refresh };
}
