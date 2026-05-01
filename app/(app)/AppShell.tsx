'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import GuitarStudio from '@/components/GuitarStudio';
import SoundLab from '@/components/SoundLab';
import { useViewMode } from '@/components/ViewModeContext';

const SOCIAL_ROUTES = [
  { href: '/circles', label: 'Team' },
  { href: '/sparks', label: 'Sparks' },
  { href: '/chat', label: 'Chat' },
];

type MusicSection = 'makers' | 'guitar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode } = useViewMode();
  const pathname = usePathname();
  const onMusic = pathname === '/music';
  const onSocial = SOCIAL_ROUTES.some((r) => r.href === pathname);
  const [musicSection, setMusicSection] = useState<MusicSection>('makers');

  const containerClass =
    mode === 'phone' ? 'mx-auto w-full max-w-sm px-4 py-6' : 'mx-auto w-full max-w-7xl px-6 py-10';

  return (
    <ErrorBoundary>
      <div className={containerClass}>
        {/* Always mounted so Web Audio keeps running on navigation.
            display:none hides it but never unmounts — audio survives
            route changes. Only visible when on /music. */}
        <div style={{ display: onMusic ? 'block' : 'none' }}>
          {/* Music top-nav: Music Makers · Guitar Studio */}
          <div className="flex items-center gap-3 pb-1 mb-3">
            <div style={{ flex: 1, height: 1, background: '#C4A06020' }} />
            <button
              type="button"
              onClick={() => setMusicSection('makers')}
              className="shrink-0 cursor-pointer bg-transparent border-none transition-opacity"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: musicSection === 'makers' ? 700 : 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: musicSection === 'makers' ? '#C4A060' : '#A0907A',
                opacity: musicSection === 'makers' ? 1 : 0.55,
                padding: 0,
              }}
            >
              Music Makers
            </button>
            <span style={{ color: '#C4A06030', fontSize: 11 }}>·</span>
            <button
              type="button"
              onClick={() => setMusicSection('guitar')}
              className="shrink-0 cursor-pointer bg-transparent border-none transition-opacity"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: musicSection === 'guitar' ? 700 : 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: musicSection === 'guitar' ? '#C4A060' : '#A0907A',
                opacity: musicSection === 'guitar' ? 1 : 0.55,
                padding: 0,
              }}
            >
              Guitar Studio
            </button>
            <div style={{ flex: 1, height: 1, background: '#C4A06020' }} />
          </div>

          {/* SoundLab: always mounted so audio keeps running */}
          <div style={{ display: musicSection === 'makers' ? 'block' : 'none' }}>
            <SoundLab />
          </div>
          {/* GuitarStudio: shown when selected */}
          {musicSection === 'guitar' && <GuitarStudio />}
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
    </ErrorBoundary>
  );
}
