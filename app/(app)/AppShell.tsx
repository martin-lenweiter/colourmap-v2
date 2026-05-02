'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import GuitarStudio from '@/components/GuitarStudio';
import MusicRecordings from '@/components/MusicRecordings';
import NavLinks from '@/components/NavLinks';
import SoundLab from '@/components/SoundLab';
import { useViewMode } from '@/components/ViewModeContext';

const SOCIAL_ROUTES = [
  { href: '/circles', label: 'Team' },
  { href: '/sparks', label: 'Sparks' },
  { href: '/chat', label: 'Chat' },
];

const LS_SONGS = 'colourmap:songs';

type MusicSection = 'makers' | 'guitar' | 'recordings';

interface SongRef {
  id: string;
  title: string;
}

function loadSongRefs(): SongRef[] {
  try {
    const raw = localStorage.getItem(LS_SONGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title }))
      : [];
  } catch {
    return [];
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, navPosition } = useViewMode();
  const pathname = usePathname();
  const onMusic = pathname === '/music';
  const onSocial = SOCIAL_ROUTES.some((r) => r.href === pathname);
  const [musicSection, setMusicSection] = useState<MusicSection>('makers');
  const [songs, setSongs] = useState<SongRef[]>([]);
  const [recordingsInitialSongId, setRecordingsInitialSongId] = useState<string | null>(null);

  useEffect(() => {
    setSongs(loadSongRefs());
  }, []);

  function showRecordingsSection(songId?: string) {
    setSongs(loadSongRefs());
    setRecordingsInitialSongId(songId ?? null);
    setMusicSection('recordings');
  }

  const containerClass =
    mode === 'phone' ? 'mx-auto w-full max-w-sm px-4 py-6' : 'mx-auto w-full max-w-7xl px-6 py-10';

  return (
    <ErrorBoundary>
      <div className={containerClass}>
        {/* Always mounted so Web Audio keeps running on navigation.
            display:none hides it but never unmounts — audio survives
            route changes. Only visible when on /music. */}
        <div style={{ display: onMusic ? 'block' : 'none' }}>
          {/* Music top-nav: Music Studio | Guitar Studio | Recordings */}
          <div className="flex items-center justify-center gap-2 pb-1 mb-4">
            {(
              [
                { id: 'makers', label: 'Music Studio' },
                { id: 'guitar', label: 'Guitar Studio' },
                { id: 'recordings', label: 'Recordings' },
              ] as { id: MusicSection; label: string }[]
            ).map(({ id, label }) => {
              const active = musicSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMusicSection(id)}
                  className="shrink-0 cursor-pointer rounded-full px-4 py-1.5 transition-all"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    background: active ? '#C4A060' : 'transparent',
                    color: active ? '#fff' : '#A0907A',
                    border: `1px solid ${active ? '#C4A060' : '#C4A06035'}`,
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* SoundLab: always mounted so audio keeps running */}
          <div style={{ display: musicSection === 'makers' ? 'block' : 'none' }}>
            <SoundLab />
          </div>
          {/* GuitarStudio: shown when selected */}
          {musicSection === 'guitar' && (
            <GuitarStudio onShowRecordingsSection={showRecordingsSection} />
          )}
          {/* Recordings: top-level dedicated section */}
          {musicSection === 'recordings' && (
            <MusicRecordings
              songs={songs}
              initialSongId={recordingsInitialSongId}
              key={recordingsInitialSongId ?? 'all'}
            />
          )}
        </div>

        {/* Social sub-navigation — shown on /circles, /sparks, /chat */}
        {onSocial && (
          <div className="mb-5 space-y-3">
            <div className="flex items-center gap-4">
              <div style={{ flex: 1, height: 1, background: '#6890B020' }} />
              <span
                className="shrink-0 text-[11px] uppercase tracking-[0.18em]"
                style={{ color: '#6890B0', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
              >
                Social
              </span>
              <div style={{ flex: 1, height: 1, background: '#6890B020' }} />
            </div>
            <div className="flex gap-5">
              {SOCIAL_ROUTES.map((route) => {
                const active = pathname === route.href;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="cursor-pointer bg-transparent transition-colors"
                    style={{
                      fontSize: 15,
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                      textDecoration: 'none',
                      borderBottom: active ? '2px solid #6890B0' : '2px solid transparent',
                      paddingBottom: 2,
                    }}
                  >
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {children}
      </div>

      {/* Bottom nav — shown when navPosition='bottom' */}
      {navPosition === 'bottom' && (
        <div
          className="fixed bottom-0 left-0 right-0 border-t border-border"
          style={{ background: 'var(--secondary)', zIndex: 100 }}
        >
          <NavLinks />
        </div>
      )}
    </ErrorBoundary>
  );
}
