'use client';

import { useEffect, useRef, useState } from 'react';
import GuitarChords from '@/components/GuitarChords';
import GuitarFretboard from '@/components/GuitarFretboard';
import GuitarLearn from '@/components/GuitarLearn';
import GuitarPractice from '@/components/GuitarPractice';
import HarmonyMap from '@/components/HarmonyMap';
import MusicRecordings from '@/components/MusicRecordings';
import SongStudio from '@/components/SongStudio';

const LS_SONGS = 'colourmap:songs';

type Tab = 'songs' | 'fretboard' | 'chords' | 'harmony' | 'learn' | 'practice' | 'recordings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'songs', label: 'Songs' },
  { id: 'recordings', label: 'Recordings' },
  { id: 'fretboard', label: 'Fretboard' },
  { id: 'chords', label: 'Chords' },
  { id: 'harmony', label: 'Harmony' },
  { id: 'learn', label: 'Learn' },
  { id: 'practice', label: 'Practice' },
];

interface SongRef {
  id: string;
  title: string;
}

function loadSongRefs(): SongRef[] {
  try {
    const raw = localStorage.getItem(LS_SONGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title }));
  } catch {
    return [];
  }
}

export default function GuitarStudio() {
  const [tab, setTab] = useState<Tab>('songs');
  const [recordingsFilterSongId, setRecordingsFilterSongId] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongRef[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setSongs(loadSongRefs());
  }, []);

  // Reload song list when switching to Recordings tab so the filter dropdown is fresh
  function switchTab(id: Tab) {
    if (id === 'recordings') setSongs(loadSongRefs());
    setTab(id);
  }

  function handleShowRecordings(songId: string) {
    setRecordingsFilterSongId(songId);
    setSongs(loadSongRefs());
    setTab('recordings');
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
      {tab === 'recordings' && (
        <MusicRecordings
          songs={songs}
          initialSongId={recordingsFilterSongId}
          key={recordingsFilterSongId ?? 'all'}
        />
      )}
      {tab === 'fretboard' && <GuitarFretboard />}
      {tab === 'chords' && <GuitarChords />}
      {tab === 'harmony' && <HarmonyMap />}
      {tab === 'learn' && <GuitarLearn />}
      {tab === 'practice' && <GuitarPractice />}
    </div>
  );
}
