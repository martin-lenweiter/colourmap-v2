'use client';

import { useEffect, useState } from 'react';
import DailyAgenda from '@/components/DailyAgenda';
import DoingCategoryRail from '@/components/DoingCategoryRail';
import DoingContextBar from '@/components/DoingContextBar';
import DoingInbox from '@/components/DoingInbox';

const FILTER_KEY = 'colourmap:doing-category-filter';

function loadFilter(): string[] {
  try {
    const raw = localStorage.getItem(FILTER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export default function DoingPanel() {
  const [filter, setFilter] = useState<string[]>([]);

  useEffect(() => {
    setFilter(loadFilter());
  }, []);

  function toggleCategory(id: string) {
    setFilter((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      try {
        localStorage.setItem(FILTER_KEY, JSON.stringify(next));
      } catch {
        /* silent */
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <DoingContextBar />

      {/* Life category dot filter */}
      <DoingCategoryRail selected={filter} onToggle={toggleCategory} />

      {/* Quick tasks inbox */}
      <DoingInbox categoryFilter={filter} />

      {/* Breathing space before agenda */}
      <div style={{ height: 16 }} />

      {/* Agenda — Supabase backed */}
      <DailyAgenda />
    </div>
  );
}
