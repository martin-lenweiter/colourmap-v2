'use client';

import ActiveCategoryBanner from '@/components/ActiveCategoryBanner';
import CategoryCompass from '@/components/CategoryCompass';
import CheckInPing from '@/components/CheckInPing';
import CompassCarousel from '@/components/CompassCarousel';
import CompassFlower from '@/components/CompassFlower';
import DayRail from '@/components/DayRail';
import DayTabs from '@/components/DayTabs';
import DoingPanel from '@/components/DoingPanel';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import FirstRunOnboarding from '@/components/FirstRunOnboarding';
import LifeCategories from '@/components/LifeCategories';
import LifeCategoriesEmptyState from '@/components/LifeCategoriesEmptyState';
import LifeCategoriesStrip from '@/components/LifeCategoriesStrip';
import MoodSuggestion from '@/components/MoodSuggestion';
import OverviewSections from '@/components/OverviewSections';
import OverviewVisualDemos from '@/components/OverviewVisualDemos';
import QuietNotes from '@/components/QuietNotes';
import ReflectThreeDots from '@/components/ReflectThreeDots';
import SharingCheckIn from '@/components/SharingCheckIn';
import SlowWins from '@/components/SlowWins';
import { StyleProvider } from '@/components/StyleContext';
import TodaysField from '@/components/TodaysField';
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
        <TodaysField />
        <CheckInPing />
        <DayTabs
          dateLabel={dateStr}
          // FEELING — emotion register: where am I, what's around me.
          feelingContent={
            <div className="space-y-4">
              <MoodSuggestion />
              <FeelingCheckInCard segment="feeling" />
            </div>
          }
          // DOING — three-layer panel: NowBar + MissionTracker + DoingInbox + DailyAgenda.
          doingContent={<DoingPanel />}
          // SHARING — personal social axis. Big dot Lonely → Connected.
          sharingContent={
            <div className="space-y-4">
              <SharingCheckIn />
            </div>
          }
          // ROAD — wide-angle life map. The compasses, categories, and
          // long-arc surfaces live here so they don't compete with the
          // daily-pulse trio for the same band of space. The
          // <ActiveCategoryBanner /> surfaces which life category the
          // compass cluster is currently scoped to (set from the
          // strip dots or the polygon vertices).
          roadContent={
            <div className="space-y-4">
              <OverviewSections />
              <ReflectThreeDots />
              <LifeCategoriesEmptyState />
              <WeekShape />
              <LifeCategoriesStrip />
              <ActiveCategoryBanner />
              <CompassFlower />
              <TrackLines />
              <QuietNotes />
              <SlowWins />
              <CompassCarousel />
              <CategoryCompass />
              <LifeCategories />
              <OverviewVisualDemos />
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
