'use client';

import CareCompass from '@/components/CareCompass';
import CaringDepth from '@/components/CaringDepth';
import DayTabs from '@/components/DayTabs';
import DoingCheckInCard from '@/components/DoingCheckInCard';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import ShareCompass from '@/components/ShareCompass';
import SharingCheckInCard from '@/components/SharingCheckInCard';
import StarCompass from '@/components/StarCompass';
import { StyleProvider } from '@/components/StyleContext';

function DayContent() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <DayTabs
        feelingContent={
          <div className="space-y-4">
            <FeelingCheckInCard />
            <CareCompass />
            <CaringDepth />
          </div>
        }
        doingContent={
          <div className="space-y-4">
            <DoingCheckInCard />
            <StarCompass />
          </div>
        }
        sharingContent={
          <div className="space-y-4">
            <SharingCheckInCard />
            <ShareCompass />
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
