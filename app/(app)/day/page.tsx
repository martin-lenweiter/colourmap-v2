'use client';

import { useState } from 'react';
import CategoryCompass from '@/components/CategoryCompass';
import CheckInPing from '@/components/CheckInPing';
import CompassCarousel from '@/components/CompassCarousel';
import DailyAgenda from '@/components/DailyAgenda';
import DayRail from '@/components/DayRail';
import DayTabs from '@/components/DayTabs';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import FrequencyBox from '@/components/FrequencyBox';
import LifeCategories from '@/components/LifeCategories';
import MasteryBox from '@/components/MasteryBox';
import ReflectBox from '@/components/ReflectBox';
import SoundLab from '@/components/SoundLab';
import { StyleProvider } from '@/components/StyleContext';

function DayContent() {
  const [showFreqBox, setShowFreqBox] = useState(true);
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-8 lg:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-6 lg:mx-0 lg:flex-1">
        <CheckInPing />
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '17px',
            fontStyle: 'italic',
            color: '#7A5438',
            opacity: 0.85,
            letterSpacing: '0.06em',
          }}
        >
          {dateStr}
        </p>
        <DayTabs
          checkinContent={
            <div className="space-y-4">
              {/* Box A — emotions + expression */}
              <div className="space-y-3">
                <FeelingCheckInCard />
                {showFreqBox ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowFreqBox(false)}
                      className="absolute right-2 top-2 z-10 cursor-pointer rounded-full px-1.5 py-0.5 text-[10px] transition-all"
                      style={{
                        color: '#8A6A4A',
                        opacity: 0.3,
                        background: '#F5ECDC80',
                        border: 'none',
                      }}
                    >
                      hide
                    </button>
                    <FrequencyBox />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFreqBox(true)}
                    className="w-full cursor-pointer rounded-xl py-1.5 text-center transition-all"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '11px',
                      color: '#8A6A4A',
                      opacity: 0.35,
                      background: '#C4A06006',
                      border: '1px solid #C4A06010',
                    }}
                  >
                    show frequency
                  </button>
                )}
              </div>
              {/* Box B — missions */}
              <DailyAgenda />
            </div>
          }
          overviewContent={
            <div className="space-y-4">
              <CompassCarousel />
              <CategoryCompass />
              <LifeCategories />
              <ReflectBox />
            </div>
          }
          masteryContent={<MasteryBox />}
          tunerContent={<SoundLab />}
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
