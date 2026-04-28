'use client';

import CheckInPing from '@/components/CheckInPing';
import DayRail from '@/components/DayRail';
import DayTabs from '@/components/DayTabs';
import DoingPanel from '@/components/DoingPanel';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import MoodSuggestion from '@/components/MoodSuggestion';
import RoadView from '@/components/RoadView';
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
    // Wider outer wrapper on md+ so the Feeling + Doing side-by-side
    // grid has room for the Hawkins slider / compass dots without
    // overflow. Inner column lifts from max-w-2xl (672px) to max-w-4xl
    // (896px) on md, giving each of the two columns ~430px instead of
    // ~320px. Phone stays max-w-2xl (read-column width).
    <div className="mx-auto w-full max-w-7xl px-4 py-3 lg:flex lg:gap-6 lg:px-6 lg:py-6">
      <div className="mx-auto w-full max-w-2xl space-y-4 md:max-w-4xl lg:mx-0 lg:flex-1">
        <FirstRunOnboarding />
        <TodaysField />
        <CheckInPing />
        <DayTabs
          dateLabel={dateStr}
          // FEELING — emotion register: where am I, what's around me.
          feelingContent={
            <div className="space-y-4">
              <MoodSuggestion />
            </div>
          }
          // DOING — objectives + tasks + agenda.
          doingContent={<DoingPanel />}
          // SHARING — personal social axis. Big dot Lonely → Connected.
          sharingContent={
            <div className="space-y-4">
              <SharingCheckIn />
            </div>
          }
          roadContent={<RoadView />}
        />
      </div>
      <DayRail />
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
