'use client';

import CareCompass from '@/components/CareCompass';
import CaringDepth from '@/components/CaringDepth';
import DayTabs from '@/components/DayTabs';
import DoingCheckInCard from '@/components/DoingCheckInCard';
import DoingDepth from '@/components/DoingDepth';
import FeelingCheckInCard from '@/components/FeelingCheckInCard';
import ShareCompass from '@/components/ShareCompass';
import SharingCheckInCard from '@/components/SharingCheckInCard';
import SharingDepth from '@/components/SharingDepth';
import StarCompass from '@/components/StarCompass';
import { STYLE_PRESETS, StyleProvider, useStyle } from '@/components/StyleContext';

function StyleToggle() {
  const { style, setPreset } = useStyle();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" style={{ zIndex: 20 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all"
        style={{
          color: open ? '#C4A060' : '#C4A06060',
          background: open ? '#C4A06010' : 'transparent',
          border: `1px solid ${open ? '#C4A06030' : 'transparent'}`,
          fontFamily: style.font,
        }}
      >
        style
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 animate-in fade-in duration-150 rounded-xl overflow-hidden w-[150px]"
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border) / 0.3)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setPreset(s.id);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-all hover:bg-muted/30"
              style={{
                border: 'none',
                background: style.id === s.id ? `${s.color}10` : 'transparent',
              }}
            >
              <span
                style={{
                  fontFamily: s.font,
                  fontSize: '14px',
                  fontWeight: style.id === s.id ? 700 : 400,
                  color: style.id === s.id ? s.color : 'hsl(var(--muted-foreground))',
                }}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

function DayContent() {
  const { style } = useStyle();

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="flex-1" />
        <div className="text-center">
          <h1
            className="text-xl font-semibold uppercase tracking-[0.15em]"
            style={{ fontFamily: 'var(--font-serif)', color: '#5C3018' }}
          >
            Today
          </h1>
        </div>
        <div className="flex flex-1 justify-end">
          <StyleToggle />
        </div>
      </div>

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
            <DoingDepth />
          </div>
        }
        sharingContent={
          <div className="space-y-4">
            <SharingCheckInCard />
            <ShareCompass />
            <SharingDepth />
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
