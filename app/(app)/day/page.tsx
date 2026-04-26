'use client';

import CategoryCompass from '@/components/CategoryCompass';
import CheckInPing from '@/components/CheckInPing';
import CompassCarousel from '@/components/CompassCarousel';
import CompassFlower from '@/components/CompassFlower';
import DailyAgenda from '@/components/DailyAgenda';
import DayRail from '@/components/DayRail';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import LifeCategories from '@/components/LifeCategories';
import LifeCategoriesEmptyState from '@/components/LifeCategoriesEmptyState';
import LifeCategoriesStrip from '@/components/LifeCategoriesStrip';
import MoodSuggestion from '@/components/MoodSuggestion';
import NowBar from '@/components/NowBar';
import QuietNotes from '@/components/QuietNotes';
import ReflectThreeDots from '@/components/ReflectThreeDots';
import SlowWins from '@/components/SlowWins';
import { StyleProvider } from '@/components/StyleContext';
import TrackLines from '@/components/TrackLines';
import WeekShape from '@/components/WeekShape';

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
        <CheckInPing />
        <DayTabs
          dateLabel={dateStr}
          // FEELING — emotion register: where am I, what's around me.
          feelingContent={
            <div className="space-y-4">
              <MoodSuggestion />
              <FeelingCheckInCard />
            </div>
          }
          // DOING — agenda + missions: what's the day for.
          doingContent={
            <div className="space-y-4">
              <NowBar />
              <DailyAgenda />
            </div>
          }
          // SHARING — three-dot reflect surface. The Sharing axis
          // (Lonely → Connected) lives here alongside Feeling and
          // Doing so the user can journal at any level of any axis;
          // each entry is timestamped and threads under its level
          // over time.
          sharingContent={
            <div className="space-y-4">
              <ReflectThreeDots />
            </div>
          }
          // ROAD — wide-angle life map. The compasses, categories, and
          // long-arc surfaces live here so they don't compete with the
          // daily-pulse trio for the same band of space.
          roadContent={
            <div className="space-y-4">
              <LifeCategoriesEmptyState />
              <WeekShape />
              <LifeCategoriesStrip />
              <CompassFlower />
              <TrackLines />
              <QuietNotes />
              <SlowWins />
              <CompassCarousel />
              <CategoryCompass />
              <LifeCategories />
            </div>
          }
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
