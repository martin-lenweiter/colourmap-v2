'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  getToolColour,
  getToolLabel,
  getToolSoundLabTab,
  useSoundSession,
} from '@/lib/sound-session';

/*
 * MiniPlayer — a small persistent pill that surfaces the user's
 * current music session when they're not on /sounds. Tapping it
 * navigates back to /sounds with the right SoundLab tab pre-
 * selected (via the URL hash, which SoundLab can read on mount —
 * see follow-up).
 *
 * V1 behaviour:
 *  - Hidden on /sounds (the tool itself is visible there).
 *  - Hidden when activeTool is null (no session ever started).
 *  - Shows tool name + meta + a status dot (sage if playing
 *    earlier, ochre if paused / left).
 *  - Tap → navigates to /sounds#<tab>.
 *  - Tap × on the pill → clear the session (hides the pill).
 *
 * Spec: docs/specs/global-mini-player.md
 */

export default function MiniPlayer() {
  const session = useSoundSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Only render after mount to avoid SSR hydration mismatch on
  // the initial empty state vs. localStorage-rehydrated state.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!session.activeTool) return null;
  // Hide on /sounds — the actual tool UI is shown there.
  if (pathname === '/sounds') return null;

  const colour = getToolColour(session.activeTool);
  const label = getToolLabel(session.activeTool);
  const tab = getToolSoundLabTab(session.activeTool);

  return (
    <div
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{
        bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div
        className="flex items-center gap-3 rounded-full transition-all"
        style={{
          background: 'var(--card)',
          border: `1px solid ${colour}55`,
          padding: '8px 8px 8px 14px',
          boxShadow: '0 12px 32px -10px rgba(94,58,20,0.18)',
        }}
      >
        <span
          className="block rounded-full transition-all"
          style={{
            width: 10,
            height: 10,
            background: colour,
            opacity: session.isPlaying ? 1 : 0.45,
            animation: session.isPlaying ? 'mp-pulse 1.6s ease-in-out infinite' : undefined,
          }}
          title={session.isPlaying ? 'Playing' : 'Paused'}
        />
        <Link
          href={`/sounds#${tab}`}
          className="flex items-center gap-2 transition-all hover:opacity-85"
          style={{ textDecoration: 'none' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 13,
              fontWeight: 700,
              color: colour,
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </span>
          {session.meta && (
            <span
              className="hidden sm:inline"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.7,
              }}
            >
              · {session.meta}
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: '#8A6A4A',
              opacity: 0.55,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginLeft: 4,
            }}
          >
            {session.isPlaying ? 'tap to view' : 'tap to resume'}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => session.clear()}
          aria-label="Close mini-player"
          className="ml-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: '#8A6A4A',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
          title="Clear session"
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes mp-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
