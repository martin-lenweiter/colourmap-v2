'use client';

import CurrentObjective from '@/components/CurrentObjective';
import DailyAgenda from '@/components/DailyAgenda';
import DailyObjectives from '@/components/DailyObjectives';
import DoingContextBar from '@/components/DoingContextBar';
import DoingStateCircle from '@/components/DoingStateCircle';

export default function DoingPanel() {
  return (
    <div className="space-y-5">
      {/* Current objective — always on top */}
      <CurrentObjective />

      {/* State circle — Deep Rest → Tunnel Vision */}
      <DoingStateCircle />

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
