'use client';

import { useRef, useState } from 'react';
import BluesProgram from '@/components/BluesProgram';
import GuitarChords from '@/components/GuitarChords';
import GuitarFretboard from '@/components/GuitarFretboard';
import GuitarLearn from '@/components/GuitarLearn';
import GuitarPractice from '@/components/GuitarPractice';
import HarmonyMap from '@/components/HarmonyMap';
import HendrixLearn from '@/components/HendrixLearn';
import SongStudio from '@/components/SongStudio';

type Tab =
  | 'songs'
  | 'fretboard'
  | 'chords'
  | 'harmony'
  | 'learn'
  | 'blues'
  | 'hendrix'
  | 'practice';

const TABS: { id: Tab; label: string }[] = [
  { id: 'songs', label: 'Songs' },
  { id: 'fretboard', label: 'Fretboard' },
  { id: 'chords', label: 'Chords' },
  { id: 'harmony', label: 'Harmony' },
  { id: 'learn', label: 'Learn' },
  { id: 'blues', label: 'Blues' },
  { id: 'hendrix', label: 'Hendrix' },
  { id: 'practice', label: 'Practice' },
];

export default function GuitarStudio({
  onShowRecordingsSection,
}: {
  onShowRecordingsSection?: (songId?: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('songs');
  const navRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  function switchTab(id: Tab) {
    setTab(id);
  }

  function handleShowRecordings(songId: string) {
    onShowRecordingsSection?.(songId);
  }

  return (
    <div className="space-y-5">
      {/* Section divider */}
      <div className="flex items-center gap-4 pt-2">
        <div style={{ flex: 1, height: 1, background: '#C4A06020' }} />
        <span
          className="shrink-0 text-[11px] uppercase tracking-[0.18em]"
          style={{ color: '#C4A060', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
        >
          Guitar Studio
        </span>
        <div style={{ flex: 1, height: 1, background: '#C4A06020' }} />
      </div>

      {/* Tab strip */}
      <div
        ref={navRef}
        className="flex w-full items-center gap-7 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          scrollSnapType: 'x proximity',
          WebkitMaskImage:
            'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)',
          maskImage:
            'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)',
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              ref={
                active
                  ? (el) => {
                      activeTabRef.current = el;
                    }
                  : undefined
              }
              type="button"
              onClick={() => switchTab(t.id)}
              className="shrink-0 cursor-pointer whitespace-nowrap bg-transparent transition-colors"
              style={{
                scrollSnapAlign: 'center',
                fontSize: 16,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {t.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="mx-auto block"
                  style={{
                    height: 2,
                    width: '100%',
                    background: '#C4A060',
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'songs' && <SongStudio onShowRecordings={handleShowRecordings} />}
      {tab === 'fretboard' && <GuitarFretboard />}
      {tab === 'chords' && <GuitarChords />}
      {tab === 'harmony' && <HarmonyMap />}
      {tab === 'learn' && <GuitarLearn />}
      {tab === 'blues' && <BluesProgram />}
      {tab === 'hendrix' && <HendrixLearn />}
      {tab === 'practice' && <GuitarPractice />}
    </div>
  );
}
