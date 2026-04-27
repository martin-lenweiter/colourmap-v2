'use client';

import { useEffect, useState } from 'react';
import DailyAgenda from '@/components/DailyAgenda';
import DoingCategoryRail, {
  DOING_CATEGORIES,
  type DoingCategory,
} from '@/components/DoingCategoryRail';
import DoingInbox from '@/components/DoingInbox';
import MissionTracker from '@/components/MissionTracker';
import NowBar from '@/components/NowBar';

const FILTER_KEY = 'colourmap:doing-category-filter';

function loadFilter(): DoingCategory[] {
  try {
    const raw = localStorage.getItem(FILTER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const validIds = DOING_CATEGORIES.map((c) => c.id);
    return (parsed as string[]).filter((id): id is DoingCategory =>
      validIds.includes(id as DoingCategory),
    );
  } catch {
    return [];
  }
}

export default function DoingPanel() {
  const [filter, setFilter] = useState<DoingCategory[]>([]);

  useEffect(() => {
    setFilter(loadFilter());
  }, []);

  function toggleCategory(cat: DoingCategory) {
    setFilter((prev) => {
      let next: DoingCategory[];
      if (prev.includes(cat)) {
        next = prev.filter((c) => c !== cat);
      } else {
        next = [...prev, cat];
      }
      // All selected == same as no filter — normalise to empty
      if (next.length === DOING_CATEGORIES.length) next = [];
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
      <NowBar />

      {/* Category filter rail */}
      <DoingCategoryRail selected={filter} onToggle={toggleCategory} />

      {/* Missions — Supabase backed */}
      <MissionTracker categoryFilter={filter} />

      {/* Quick tasks + Tomorrow shelf — localStorage */}
      <DoingInbox categoryFilter={filter} />

      {/* Agenda — Supabase backed, manual scheduling target */}
      <DailyAgenda />
    </div>
  );
}
