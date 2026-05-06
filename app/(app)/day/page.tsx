'use client';

import CheckInPing from '@/components/CheckInPing';
import DayTabs from '@/components/DayTabs';
import DoingCardsPanel from '@/components/DoingCardsPanel';
import DoingPanel from '@/components/DoingPanel';
import FeelingCircles from '@/components/FeelingCircles';
import FeelingCircles2 from '@/components/FeelingCircles2';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import MoodSuggestion from '@/components/MoodSuggestion';
import Overview2 from '@/components/Overview2';
import SharingCheckIn from '@/components/SharingCheckIn';
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
        feelingContent={
          <div className="space-y-4">
            <FeelingCircles />
            <MoodSuggestion />
          </div>
        }
        ringContent={<FeelingCircles2 />}
        doingContent={<DoingPanel />}
        list2Content={<DoingCardsPanel />}
        sharingContent={
          <div className="space-y-4">
            <SharingCheckIn />
          </div>
        }
        roadContent={<Overview2 />}
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
