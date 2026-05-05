'use client';

import CurrentObjective from '@/components/CurrentObjective';
import DailyAgenda from '@/components/DailyAgenda';
import DailyObjectives from '@/components/DailyObjectives';
import ObjectiveDepth from '@/components/ObjectiveDepth';

export default function DoingPanel() {
  return (
    <div className="space-y-5">
      <CurrentObjective />
      <ObjectiveDepth />
      {/* <DoingStateCircle /> — hidden, bring back when needed */}
      <DailyObjectives />
      <div style={{ height: 16 }} />
      <DailyAgenda />
    </div>
  );
}
