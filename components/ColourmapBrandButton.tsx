'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Clickable "Colourmap" brand in the top header.
 * Opens an About modal with a short tagline, credits, the user's
 * initials + sign-out, and a losange that expands a rolling
 * changelog of recent PRs so the user knows where we are in the
 * build.
 */

interface ColourmapBrandButtonProps {
  /** User initials shown inside the modal, e.g. "ML". Optional —
   *  when absent, the initials section is hidden (e.g. server-side
   *  render before auth is resolved). */
  initials?: string;
  /** User email surfaced under the initials in the modal. */
  email?: string;
}

// Rolling changelog — keep this updated as PRs ship. The losange in
// the modal expands to show this list. Newest first.
// Rolling changelog. `date` is the ISO date the PR landed on main —
// shown next to the PR number so the user knows which version is live.
const RECENT_PRS: { num: number; title: string; date: string }[] = [
  {
    num: 98,
    date: '2026-04-25',
    title:
      '3-dot Check-in landing (Feeling · Doing) + nuke the djembe + simpler Circles description + nav phone fix',
  },
  {
    num: 97,
    date: '2026-04-25',
    title:
      'Chill Machine + Groove Machine, day cockpit polish, palette pass — instruments, layers reorg, effects, real instruments strip, wave reactivity',
  },
  {
    num: 95,
    date: '2026-04-24',
    title:
      'Phone-cockpit + Relax Sounds cleanup — nav rename, compass wheels, drums fix, sacred-freq cards, fullscreen visualizer',
  },
  {
    num: 86,
    date: '2026-04-23',
    title: 'Dev mode stays pinned on scroll (portal) + bottom-right trigger',
  },
  {
    num: 85,
    date: '2026-04-23',
    title: 'Onboarding opaque, 1-card with new copy + FrequencyBox deleted',
  },
  {
    num: 84,
    date: '2026-04-23',
    title:
      'Overview restored, compass pills (Feeling/Doing/Sharing), Sounds moved to /sounds, wake-up time wheel, no-rainbow wave, no-glyph nav',
  },
  { num: 83, date: '2026-04-22', title: 'Feedback overlay: resizable note + collapsible toolbar' },
  { num: 82, date: '2026-04-22', title: 'Feedback overlay: triple-tap dev mode with note + draw' },
  {
    num: 81,
    date: '2026-04-22',
    title: 'Phone check-in: no outer boxes, bigger text, auto-grow, opaque design popover',
  },
  { num: 80, date: '2026-04-21', title: 'Desktop Day rail (streak · last check-in · last tuned)' },
  { num: 79, date: '2026-04-21', title: 'Nav glyphs (later removed per feedback)' },
  { num: 78, date: '2026-04-21', title: 'Haptic feedback wired into play + tab switches' },
  { num: 77, date: '2026-04-20', title: 'Keyboard shortcuts primitive' },
  { num: 76, date: '2026-04-20', title: 'First-run onboarding' },
  { num: 74, date: '2026-04-19', title: 'Music setlist + Projects/habits design spec' },
  { num: 73, date: '2026-04-19', title: 'Real piano/violin/flute/harp in Calming Sounds melodies' },
  { num: 72, date: '2026-04-18', title: 'Check-in ping banner' },
  { num: 71, date: '2026-04-18', title: 'Jargon pass — brain-wave rate' },
  { num: 70, date: '2026-04-17', title: 'Haptics wrapper' },
  { num: 68, date: '2026-04-15', title: 'Pleasant phase 1 — type scale + spacing' },
  { num: 66, date: '2026-04-13', title: 'Soft-beat bed + fix shaman-drum sample' },
];
const LATEST_PR = RECENT_PRS[0].num;
const LATEST_PR_DATE = RECENT_PRS[0].date;

// Vision sections — distilled from docs/pdfs/colourmap-vision-2026-04.pdf
// (the master vision PDF). Each entry has a one-line summary +
// what I think the *core next step* is for that surface. Updated
// as those next steps land. Shown when the user expands the second
// losange in the About modal.
const VISION_SECTIONS: { title: string; color: string; summary: string; next: string }[] = [
  {
    title: 'The thesis',
    color: '#B33A2B',
    summary:
      'Patagonia of social, not Meta. A small intentional space that holds people who already love each other — without performing for strangers.',
    next: 'Live with it. Run Salon #1 with our 8 closest friends — see if the room recognizes itself.',
  },
  {
    title: 'Day · Check-in',
    color: '#D4805A',
    summary:
      'Two big dots, Feeling and Doing, opening into 60-second guided check-ins. The base layer everything else reads from.',
    next: 'Sharing — the third dot. Add the social-context check-in once Circles have missions and presence.',
  },
  {
    title: 'Music · Chill ↔ Groove unity',
    color: '#3A6890',
    summary:
      'Chill is the atmosphere creator; Groove is the rhythm. One shared sound library so a Chill landscape becomes the bed for a Groove session.',
    next: 'Extract lib/sound-library.ts, then ship the Atmosphere strip in Groove that consumes saved Chill soundscapes.',
  },
  {
    title: 'Music · 7 soundscapes deepened',
    color: '#C4A060',
    summary:
      'Big-dot picker landed (Tech / Funk / Tropical / Slow Roll / Boom Bap / Epic Electro / Lofi). Each preset reconfigures bpm + swing + tracks.',
    next: 'Source CC0 samples (marimba, vinyl crackle, snap, ooh-vocal) and tune the per-preset sound design — make each soundscape feel singular.',
  },
  {
    title: 'Notebook',
    color: '#9B6BA0',
    summary:
      'Lightweight markdown notebook with multiple categories (Notes / Ideas / Journal / Songs / Projects / Rhymes / Practice / Lessons). Saved sound moments land here.',
    next: 'Tag-based "now" view for what you\'re actively working on — feeds the Track Lines layer of Overview.',
  },
  {
    title: 'Circles · the social primitive',
    color: '#7AAA58',
    summary:
      'A shared space to align missions and become effective in the process. 5–30 people. No follow, no feed, no public profile.',
    next: 'Circle Missions schema + UI. Use it to run our own band project for 2 weeks. Without missions, Circles are a primitive; with them, Circles are the product.',
  },
  {
    title: 'Overview · the reflective surface',
    color: '#5AA8B0',
    summary:
      'Seven layers — NowBar (live), Week Shape, Compass flower, Track Lines, Soundscape Garden, Quiet Notes, Slow Wins. Recognition + Beauty + Insight.',
    next: 'Layer 2 — Week Shape. A horizontal heat-river of feeling + doing across 7 days. Mostly SVG work, ~half a day.',
  },
  {
    title: 'Mini-player · audio across navigation',
    color: '#5C3018',
    summary:
      'When music plays in any tool and you wander to /day, a small persistent pill keeps the audio alive and offers play/pause + jump-back.',
    next: 'lib/sound-session.tsx provider + <MiniPlayer />. ~2–3 days. Foundation for collective music control later.',
  },
  {
    title: 'Design system · adaptive',
    color: '#8A6A4A',
    summary:
      'Shipped lib/design-tokens.ts (NowBar dogfoods it). The bigger move is container queries + useViewport() so layouts adapt to where they are, not just what md: thinks.',
    next: 'useViewport() hook + 100dvh on the cockpit (fixes iOS Safari address-bar jump). Migrate one component as worked example.',
  },
  {
    title: 'Growth · €0 social media',
    color: '#E0844A',
    summary:
      'Salons (8 people, living room) → Underground Nights (50, friendly venue) → Experiments + Expos → Festivals. No paid ads, no influencers, no PR firms.',
    next: 'Ship Salon Mode preset — host-flow with the right surfaces sequenced. Run our first Salon. Iterate from there.',
  },
];

export default function ColourmapBrandButton({ initials, email }: ColourmapBrandButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(false);
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
          className="text-[22px] font-bold tracking-[0.08em] font-serif text-center"
          style={{ color: '#B33A2B' }}
        >
          Colourmap
        </p>
        <svg width={18} height={18} viewBox="0 0 20 20" style={{ marginTop: 3 }} aria-hidden="true">
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

            {/* Signed-in user — initials + email + sign-out. Lives
                here (in the title's modal) instead of as a standalone
                pill in the header so the right slot can hold the
                theme palette. (Per Martin 2026-04-26.) */}
            {initials && (
              <div
                className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: '#C4A06010', border: '1px solid #C4A06028' }}
              >
                <span
                  className="flex shrink-0 items-center justify-center rounded-full text-[12px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    width: 36,
                    height: 36,
                    color: '#5C3018',
                    background: '#C4A06028',
                    border: '1px solid #C4A06055',
                  }}
                >
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  {email && (
                    <p
                      className="truncate"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 12,
                        color: 'var(--muted-foreground)',
                        opacity: 0.8,
                      }}
                    >
                      {email}
                    </p>
                  )}
                  <form action="/logout" method="post" className="mt-0.5">
                    <button
                      type="submit"
                      className="cursor-pointer transition-colors hover:opacity-70"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#B33A2B',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                      }}
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}

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

            {/* Vision losange — tap to expand the master-vision
                summary + core next step for each surface (Day,
                Music, Notebook, Circles, Overview, etc.). Sourced
                from docs/pdfs/colourmap-vision-2026-04.pdf. */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  color: '#8A6A4A',
                  opacity: 0.85,
                  letterSpacing: '0.06em',
                }}
              >
                vision ·{' '}
                <strong style={{ color: '#5C3018', fontWeight: 700 }}>core next steps</strong>
              </p>
              <button
                type="button"
                onClick={() => setVisionOpen((s) => !s)}
                aria-label={visionOpen ? 'Hide vision sections' : 'Show vision sections'}
                aria-expanded={visionOpen}
                title="What's next, by surface"
                className="flex cursor-pointer items-center justify-center transition-all hover:opacity-80"
                style={{
                  width: 28,
                  height: 28,
                  background: visionOpen ? '#B33A2B18' : 'transparent',
                  border: '1px solid #B33A2B55',
                  borderRadius: 6,
                  transform: 'rotate(45deg)',
                  padding: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    transform: 'rotate(-45deg)',
                    color: '#B33A2B',
                    fontWeight: 700,
                    fontSize: 13,
                    lineHeight: 1,
                  }}
                >
                  {visionOpen ? '−' : '+'}
                </span>
              </button>
            </div>

            {visionOpen && (
              <div
                className="mb-4 rounded-lg animate-in fade-in duration-150"
                style={{
                  background: '#F5E8C812',
                  border: '1px solid #B33A2B25',
                  padding: '12px 14px',
                  maxHeight: 360,
                  overflowY: 'auto',
                }}
              >
                <ul className="space-y-3.5">
                  {VISION_SECTIONS.map((section) => (
                    <li key={section.title} style={{ fontFamily: 'var(--font-serif)' }}>
                      <p
                        className="flex items-center gap-2"
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: section.color,
                          letterSpacing: '0.04em',
                          marginBottom: 3,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: section.color,
                          }}
                        />
                        {section.title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--muted-foreground)',
                          lineHeight: 1.5,
                          opacity: 0.95,
                          marginBottom: 4,
                        }}
                      >
                        {section.summary}
                      </p>
                      <p
                        style={{
                          fontSize: 11.5,
                          color: '#5C3018',
                          lineHeight: 1.5,
                          fontStyle: 'italic',
                          paddingLeft: 14,
                          borderLeft: `2px solid ${section.color}55`,
                          marginLeft: 0,
                        }}
                      >
                        <strong
                          style={{
                            fontWeight: 700,
                            color: section.color,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            fontSize: 10,
                            marginRight: 6,
                          }}
                        >
                          next
                        </strong>
                        {section.next}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                <span style={{ color: '#8A6A4A', opacity: 0.7, marginLeft: 6 }}>
                  · {LATEST_PR_DATE}
                </span>
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
                        className="flex flex-col items-end shrink-0"
                        style={{
                          marginTop: 2,
                          minWidth: 56,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#B33A2B',
                            letterSpacing: '0.04em',
                            lineHeight: 1.1,
                          }}
                        >
                          #{pr.num}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 500,
                            color: '#8A6A4A',
                            opacity: 0.7,
                            letterSpacing: '0.02em',
                            lineHeight: 1.1,
                            marginTop: 1,
                          }}
                        >
                          {pr.date}
                        </span>
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
