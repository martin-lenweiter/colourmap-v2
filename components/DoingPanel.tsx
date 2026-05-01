'use client';

import DailyAgenda from '@/components/DailyAgenda';
import DailyObjectives from '@/components/DailyObjectives';
import DoingContextBar from '@/components/DoingContextBar';

export default function DoingPanel() {
  return (
    <div className="space-y-5">
      <DoingContextBar />

      {/* Daily objectives + push for tomorrow */}
      <DailyObjectives />

      {/* Breathing space before agenda */}
      <div style={{ height: 16 }} />

      {/* Agenda — Supabase backed */}
      <DailyAgenda />
    </div>
  );
}
