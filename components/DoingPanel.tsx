'use client';

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

      {/* Daily objectives + push for tomorrow */}
      <DailyObjectives />

      {/* Breathing space before agenda */}
      <div style={{ height: 16 }} />

      {/* Agenda — Supabase backed */}
      <DailyAgenda />
    </div>
  );
}
