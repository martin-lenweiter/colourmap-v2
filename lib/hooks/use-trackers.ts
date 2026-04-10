'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   useTrackers — client hook for /api/sections (tracker programs)
   Replaces localStorage with Supabase-backed persistence.

   Maps to: cockpitSections + sectionTrackers + dailyTrackerEntries
   ═══════════════════════════════════════════════════════════ */

interface TrackerEntry {
  id: string;
  label: string;
  value: number;
}

export interface TrackerSection {
  id: string;
  name: string;
  trackers: TrackerEntry[];
}

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function useTrackers() {
  const [sections, setSections] = useState<TrackerSection[]>([]);
  const [loading, setLoading] = useState(true);
  const weekDates = getWeekDates();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/sections');
      if (res.ok) {
        const data = await res.json();
        setSections(data);
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

  const addSection = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      try {
        const res = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            trackers: weekDates.map((date) => ({ label: date, type: 'boolean' })),
          }),
        });
        if (res.ok) {
          await refresh();
        }
      } catch {
        /* silent */
      }
    },
    [weekDates, refresh],
  );

  const removeSection = useCallback(
    async (id: string) => {
      setSections((prev) => prev.filter((s) => s.id !== id));
      try {
        await fetch(`/api/sections/${id}`, { method: 'DELETE' });
      } catch {
        refresh();
      }
    },
    [refresh],
  );

  const toggleDay = useCallback(
    async (sectionId: string, trackerId: string, currentValue: number) => {
      const newValue = currentValue > 0 ? 0 : 1;
      // Optimistic update
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                trackers: s.trackers.map((t) =>
                  t.id === trackerId ? { ...t, value: newValue } : t,
                ),
              }
            : s,
        ),
      );
      try {
        await fetch(`/api/sections/${sectionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackerId, value: newValue }),
        });
      } catch {
        refresh();
      }
    },
    [refresh],
  );

  return { sections, loading, addSection, removeSection, toggleDay, refresh, weekDates };
}
