'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Clickable "Colourmap" brand in the top header.
 * Opens an About modal with a short tagline, credits, and a losange
 * that expands a rolling changelog of recent PRs so the user knows
 * where we are in the build.
 */

// Rolling changelog — keep this updated as PRs ship. The losange in
// the modal expands to show this list. Newest first.
const RECENT_PRS: { num: number; title: string }[] = [
  { num: 86, title: 'Dev mode stays pinned on scroll (portal) + bottom-right trigger' },
  { num: 85, title: 'Onboarding opaque, 1-card with new copy + FrequencyBox deleted' },
  {
    num: 84,
    title:
      'Overview restored, compass pills (Feeling/Doing/Sharing), Sounds moved to /sounds, wake-up time wheel, no-rainbow wave, no-glyph nav',
  },
  { num: 83, title: 'Feedback overlay: resizable note + collapsible toolbar' },
  { num: 82, title: 'Feedback overlay: triple-tap dev mode with note + draw' },
  {
    num: 81,
    title: 'Phone check-in: no outer boxes, bigger text, auto-grow, opaque design popover',
  },
  { num: 80, title: 'Desktop Day rail (streak · last check-in · last tuned)' },
  { num: 79, title: 'Nav glyphs (later removed per feedback)' },
  { num: 78, title: 'Haptic feedback wired into play + tab switches' },
  { num: 77, title: 'Keyboard shortcuts primitive' },
  { num: 76, title: 'First-run onboarding' },
  { num: 74, title: 'Music setlist + Projects/habits design spec' },
  { num: 73, title: 'Real piano/violin/flute/harp in Calming Sounds melodies' },
  { num: 72, title: 'Check-in ping banner' },
  { num: 71, title: 'Jargon pass — brain-wave rate' },
  { num: 70, title: 'Haptics wrapper' },
  { num: 68, title: 'Pleasant phase 1 — type scale + spacing' },
  { num: 66, title: 'Soft-beat bed + fix shaman-drum sample' },
];
const LATEST_PR = RECENT_PRS[0].num;

export default function ColourmapBrandButton() {
  const [open, setOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-85"
        style={{ background: 'none', border: 'none', padding: 0 }}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="About Colourmap"
      >
        <p
          className="text-[18px] font-normal tracking-[0.1em] font-serif text-center"
          style={{ color: '#B33A2B' }}
        >
          Colourmap
        </p>
        <svg width={16} height={16} viewBox="0 0 20 20" style={{ marginTop: 3 }} aria-hidden="true">
          {(() => {
            const cx = 10;
            const cy = 10;
            const r1 = 9;
            const r2 = 3.5;
            const pts: string[] = [];
            for (let i = 0; i < 8; i++) {
              const a = -Math.PI / 2 + (i * Math.PI) / 4;
              const r = i % 2 === 0 ? r1 : r2;
              pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
            }
            return <polygon points={pts.join(' ')} fill="#B33A2B" opacity={0.85} />;
          })()}
        </svg>
      </button>

      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="About Colourmap"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(26, 13, 4, 0.55)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-md rounded-[24px] border border-border bg-card p-6 shadow-[0_24px_80px_rgba(94,58,20,0.25)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 cursor-pointer text-xl leading-none transition-opacity hover:opacity-70"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted-foreground)',
                padding: 4,
              }}
            >
              ×
            </button>

            {/* Heading — centered */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <p
                className="font-normal tracking-[0.1em]"
                style={{ fontSize: 26, color: '#B33A2B', fontStyle: 'italic' }}
              >
                Colourmap
              </p>
              <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden="true">
                {(() => {
                  const cx = 10;
                  const cy = 10;
                  const r1 = 9;
                  const r2 = 3.5;
                  const pts: string[] = [];
                  for (let i = 0; i < 8; i++) {
                    const a = -Math.PI / 2 + (i * Math.PI) / 4;
                    const r = i % 2 === 0 ? r1 : r2;
                    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
                  }
                  return <polygon points={pts.join(' ')} fill="#B33A2B" opacity={0.85} />;
                })()}
              </svg>
            </div>

            {/* Tagline — short, single line */}
            <p
              className="mb-5 italic text-center"
              style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--muted-foreground)' }}
            >
              From organization to clarity.
            </p>

            {/* Divider */}
            <div
              aria-hidden="true"
              className="mb-5"
              style={{ height: 1, background: 'var(--border)' }}
            />

            {/* Credits — simplified to just the two names */}
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: 'var(--muted-foreground)',
                letterSpacing: '0.04em',
                lineHeight: 1.6,
              }}
            >
              <span
                className="uppercase"
                style={{ opacity: 0.55, fontSize: 11, letterSpacing: '0.22em' }}
              >
                Created by
              </span>
              <br />
              <strong style={{ fontWeight: 600, color: '#5C3018', fontStyle: 'italic' }}>
                Vikash and Martin
              </strong>
            </p>

            {/* Divider before build footer */}
            <div
              aria-hidden="true"
              className="mt-6 mb-4"
              style={{ height: 1, background: 'var(--border)' }}
            />

            {/* Changelog losange — tap to expand a rolling list of
                recent PRs so the user can see what just shipped. */}
            <div className="flex items-center justify-between gap-3">
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.8,
                  letterSpacing: '0.06em',
                }}
              >
                latest:{' '}
                <strong style={{ color: '#B33A2B', fontWeight: 700 }}>PR #{LATEST_PR}</strong>
              </p>
              <button
                type="button"
                onClick={() => setChangelogOpen((s) => !s)}
                aria-label={changelogOpen ? 'Hide recent PR list' : 'Show recent PR list'}
                aria-expanded={changelogOpen}
                title="Recent shipped PRs"
                className="flex cursor-pointer items-center justify-center transition-all hover:opacity-80"
                style={{
                  width: 28,
                  height: 28,
                  background: changelogOpen ? '#C4A06018' : 'transparent',
                  border: '1px solid #C4A06055',
                  borderRadius: 6,
                  transform: 'rotate(45deg)',
                  padding: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    transform: 'rotate(-45deg)',
                    color: '#C4A060',
                    fontWeight: 700,
                    fontSize: 13,
                    lineHeight: 1,
                  }}
                >
                  {changelogOpen ? '−' : '+'}
                </span>
              </button>
            </div>

            {changelogOpen && (
              <div
                className="mt-3 rounded-lg animate-in fade-in duration-150"
                style={{
                  background: '#F5E8C812',
                  border: '1px solid #C4A06025',
                  padding: '10px 12px',
                  maxHeight: 260,
                  overflowY: 'auto',
                }}
              >
                <ul className="space-y-2">
                  {RECENT_PRS.map((pr) => (
                    <li
                      key={pr.num}
                      className="flex items-start gap-2"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#B33A2B',
                          flexShrink: 0,
                          marginTop: 2,
                          minWidth: 30,
                          letterSpacing: '0.04em',
                        }}
                      >
                        #{pr.num}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--muted-foreground)',
                          lineHeight: 1.4,
                          opacity: 0.9,
                        }}
                      >
                        {pr.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tap-through hint */}
            <p
              className="mt-5 text-center"
              style={{
                fontSize: 11,
                color: 'var(--muted-foreground)',
                opacity: 0.5,
                letterSpacing: '0.08em',
              }}
            >
              tap anywhere to return
            </p>
          </div>
        </div>
      )}
    </>
  );
}
