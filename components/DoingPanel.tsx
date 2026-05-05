'use client';

import CurrentObjective from '@/components/CurrentObjective';
import DailyAgenda from '@/components/DailyAgenda';
import DailyObjectives from '@/components/DailyObjectives';
import DoingStateCircle from '@/components/DoingStateCircle';
import PulseDots from '@/components/PulseDots';

export default function DoingPanel() {
  return (
    <div className="space-y-5">
      <PulseDots axisKey="doing" />
      {/* State circle — Deep Rest → Tunnel Vision */}
      <DoingStateCircle />

      {/* Current objective */}
      <CurrentObjective />

      {/* Daily objectives + push for tomorrow */}
      <DailyObjectives />

      {/* Breathing space before agenda */}
      <div style={{ height: 16 }} />

      {/* Agenda — Supabase backed */}
      <DailyAgenda />
    </div>
  );
}
