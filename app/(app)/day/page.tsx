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
import NowBar from '@/components/NowBar';
import QuietNotes from '@/components/QuietNotes';
import ReflectBox from '@/components/ReflectBox';
import SlowWins from '@/components/SlowWins';
import SoundscapeGarden from '@/components/SoundscapeGarden';
import { StyleProvider } from '@/components/StyleContext';
import TrackLines from '@/components/TrackLines';

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
          checkinContent={
            <div className="space-y-4">
              <FeelingCheckInCard />
              <DailyAgenda />
            </div>
          }
          overviewContent={
            <div className="space-y-4">
              <LifeCategoriesEmptyState />
              <NowBar />
              <LifeCategoriesStrip />
              <CompassFlower />
              <TrackLines />
              <SoundscapeGarden />
              <QuietNotes />
              <SlowWins />
              <CompassCarousel />
              <CategoryCompass />
              <LifeCategories />
              <ReflectBox />
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
