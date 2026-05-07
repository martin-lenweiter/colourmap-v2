'use client';

import CheckInPing from '@/components/CheckInPing';
import DailyRituals from '@/components/DailyRituals';
import DayTabs from '@/components/DayTabs';
import DoingCardsPanel from '@/components/DoingCardsPanel';
import FeelingCircles2 from '@/components/FeelingCircles2';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import Overview2 from '@/components/Overview2';
import { StyleProvider } from '@/components/StyleContext';
import TodaysField from '@/components/TodaysField';

function DayContent() {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-3">
      <FirstRunOnboarding />
      <TodaysField />
      <CheckInPing />
      <DayTabs
        dateLabel={dateStr}
        emotionContent={<FeelingCircles2 />}
        missionContent={
          <div className="space-y-3">
            <DoingCardsPanel />
            <DailyRituals />
          </div>
        }
        progressContent={<Overview2 />}
      />
    </div>
  );
}

export default function DayPage() {
  return (
    <StyleProvider>
      <DayContent />
    </StyleProvider>
  );
}
