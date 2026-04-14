'use client';

import CompassCarousel from '@/components/CompassCarousel';
import DayTabs from '@/components/DayTabs';
import DoingCheckInCard from '@/components/DoingCheckInCard';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import LifeCategories from '@/components/LifeCategories';
import SharingCheckInCard from '@/components/SharingCheckInCard';
import { StyleProvider } from '@/components/StyleContext';

function DayContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <DayTabs
        feelingContent={
          <div className="space-y-4">
            <FeelingCheckInCard />
            <LifeCategories />
            <CompassCarousel />
          </div>
        }
        doingContent={
          <div className="space-y-4">
            <DoingCheckInCard />
          </div>
        }
        sharingContent={
          <div className="space-y-4">
            <SharingCheckInCard />
          </div>
        }
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
