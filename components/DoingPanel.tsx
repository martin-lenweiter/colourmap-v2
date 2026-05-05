'use client';

import CurrentObjective from '@/components/CurrentObjective';
import DailyAgenda from '@/components/DailyAgenda';
import DailyObjectives from '@/components/DailyObjectives';
import DoingStateCircle from '@/components/DoingStateCircle';

export default function DoingPanel() {
  return (
    <div className="space-y-5">
      <CurrentObjective />
      <DoingStateCircle />
      <DailyObjectives />
      <div style={{ height: 16 }} />
      <DailyAgenda />
    </div>
  );
}
