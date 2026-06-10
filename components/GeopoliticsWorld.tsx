'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  categoriesByTier,
  firstPageOf,
  locatePage,
  type Page,
  TIER_DEFINITION,
  TIER_ORDER,
  WORLD_HERO_QUOTE,
} from '@/lib/geopolitics-content';
import EducationModeSwitch from './EducationModeSwitch';
import TrustBadge from './TrustBadge';

const STORAGE_KEY = 'colourmap:geopolitics-world:last-page';

// Warm gold palette aligned with LearningHub modal
const GOLD_STRONG = 'rgba(240,216,152,0.96)';
const GOLD = 'rgba(220,196,138,0.92)';
const GOLD_MID = 'rgba(220,196,138,0.74)';
const GOLD_FAINT = 'rgba(196,160,96,0.6)';
const GOLD_BORDER = 'rgba(180,140,80,0.32)';
const GOLD_BORDER_SOFT = 'rgba(180,140,80,0.18)';

function tierBlurb(tier: string): string {
  if (tier === 'now') return 'What broke this month. Live status, hot threads.';
  if (tier === 'decade') return 'What you need to understand the 2020s and 2030s.';
  if (tier === 'horizon') return 'The world we are walking into. 2030 → 2050.';
  return '';
}

type Props = {
  onSwitchToSelf?: () => void;
  onOpenIntel?: () => void;
  onOpenMap?: () => void;
  onOpenGraph?: () => void;
  onOpenSources?: () => void;
  onOpenSpace?: () => void;
  initialPageSlug?: string | null;
};

export default function GeopoliticsWorld({
  onSwitchToSelf,
  onOpenIntel,
  onOpenMap,
  onOpenGraph,
  onOpenSources,
  onOpenSpace,
  initialPageSlug,
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (initialPageSlug) {
      setActiveSlug(initialPageSlug);
      setHydrated(true);
      return;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setActiveSlug(saved);
    } catch {}
    setHydrated(true);
  }, [initialPageSlug]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (activeSlug) {
        window.localStorage.setItem(STORAGE_KEY, activeSlug);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [activeSlug, hydrated]);

  const located = useMemo(() => (activeSlug ? locatePage(activeSlug) : null), [activeSlug]);

  return (
    <main
      data-testid="geopolitics-world"
      style={{
        minHeight: 'calc(100svh - 120px)',
        background: located
          ? 'linear-gradient(180deg, rgba(236,220,188,0.74), rgba(206,184,145,0.34)), radial-gradient(circle at 20% 12%, rgba(122,84,56,0.12), transparent 36%)'
          : 'radial-gradient(circle at 20% 10%, rgba(58,38,18,0.96), rgba(18,10,4,1) 70%)',
        width: 'calc(100% + 48px)',
        marginInline: '-24px',
        padding: 'clamp(10px, 2vw, 22px) clamp(12px, 4vw, 28px)',
      }}
    >
      <EducationModeSwitch active="world" onSwitchToSelf={onSwitchToSelf} />

      {located ? (
        <PageReader
          page={located.page}
          chapterTitle={located.chapter.title}
          chapterNumber={located.chapter.number}
          programTitle={located.program.title}
          categoryTitle={located.category.title}
          pageIndex={located.pageIndex}
          totalInChapter={located.totalInChapter}
          prevSlug={located.prev?.slug ?? null}
          nextSlug={located.next?.slug ?? null}
          onNavigate={setActiveSlug}
          onBack={() => setActiveSlug(null)}
        />
      ) : (
        <CategoryGrid
          onOpen={(slug) => setActiveSlug(slug)}
          onOpenIntel={onOpenIntel}
          onOpenMap={onOpenMap}
          onOpenGraph={onOpenGraph}
          onOpenSources={onOpenSources}
          onOpenSpace={onOpenSpace}
        />
      )}
    </main>
  );
}

function CategoryGrid({
  onOpen,
  onOpenIntel,
  onOpenMap,
  onOpenGraph,
  onOpenSources,
  onOpenSpace,
}: {
  onOpen: (firstSlug: string) => void;
  onOpenIntel?: () => void;
  onOpenMap?: () => void;
  onOpenGraph?: () => void;
  onOpenSources?: () => void;
  onOpenSpace?: () => void;
}) {
  return (
    <section
      data-testid="world-hub"
      style={{
        color: GOLD,
        fontFamily: 'var(--font-serif)',
      }}
    >
      <header style={{ marginBottom: 22, textAlign: 'center' }}>
        <p style={{ ...smallLabel, color: GOLD_FAINT }}>education · world</p>
        <h1
          style={{
            margin: '6px 0 8px',
            color: GOLD_STRONG,
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(34px, 6vw, 56px)',
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
          }}
        >
          The World, walking
        </h1>
        <p
          style={{
            margin: '0 auto',
            color: GOLD_MID,
            fontStyle: 'italic',
            fontSize: 15,
            lineHeight: 1.5,
            maxWidth: 560,
          }}
        >
          Six worlds. Short pages. One claim each. Read three, and the news starts making sense.
        </p>
        <figure
          style={{
            margin: '14px auto 0',
            maxWidth: 560,
            display: 'grid',
            gap: 4,
          }}
        >
          <blockquote
            style={{
              margin: 0,
              color: GOLD,
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 13,
              lineHeight: 1.55,
              borderLeft: `2px solid ${GOLD_BORDER}`,
              paddingLeft: 12,
              textAlign: 'left',
            }}
          >
            &ldquo;{WORLD_HERO_QUOTE.text}&rdquo;
          </blockquote>
          <figcaption
            style={{
              color: GOLD_FAINT,
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'right',
            }}
          >
            — {WORLD_HERO_QUOTE.attribution}
          </figcaption>
        </figure>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 14,
            justifyContent: 'center',
          }}
        >
          {onOpenIntel && <ToolPill testId="open-intel" onClick={onOpenIntel} label="Intel" />}
          {onOpenMap && <ToolPill testId="open-map" onClick={onOpenMap} label="Map" />}
          {onOpenSpace && (
            <ToolPill testId="open-space" onClick={onOpenSpace} label="Space ✨" highlighted />
          )}
          {onOpenGraph && <ToolPill testId="open-graph" onClick={onOpenGraph} label="Graph" />}
          {onOpenSources && (
            <ToolPill testId="open-sources" onClick={onOpenSources} label="Sources" />
          )}
        </div>
      </header>

      {TIER_ORDER.map((tier) => {
        const categoriesInTier = categoriesByTier(tier);
        if (categoriesInTier.length === 0) return null;
        return (
          <section
            key={tier}
            data-testid={`tier-${tier}`}
            style={{
              marginTop: 26,
              paddingTop: 16,
            }}
          >
            <header style={{ marginBottom: 14, textAlign: 'center' }}>
              <h2
                style={{
                  margin: 0,
                  color: GOLD_STRONG,
                  fontSize: 14,
                  letterSpacing: '0.32em',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                — {TIER_DEFINITION[tier].title} —
              </h2>
              <p
                style={{
                  margin: '4px auto 0',
                  color: GOLD_FAINT,
                  fontStyle: 'italic',
                  fontSize: 12,
                  lineHeight: 1.4,
                  maxWidth: 520,
                }}
              >
                {tierBlurb(tier)}
              </p>
            </header>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {categoriesInTier.map((category) => (
                <article
                  key={category.slug}
                  style={{
                    border: `1px solid ${GOLD_BORDER}`,
                    background: 'linear-gradient(180deg, rgba(54,36,18,0.78), rgba(34,22,10,0.92))',
                    borderRadius: 14,
                    overflow: 'hidden',
                    display: 'grid',
                    gap: 0,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.32)',
                  }}
                >
                  <CategoryCover category={category} />
                  <div style={{ padding: '12px 18px 16px', display: 'grid', gap: 12 }}>
                    <header>
                      <h3
                        style={{
                          margin: '0 0 4px',
                          color: GOLD_STRONG,
                          fontSize: 22,
                          letterSpacing: '0.01em',
                          fontWeight: 700,
                        }}
                      >
                        {category.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: GOLD_MID,
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        {category.blurb}
                      </p>
                    </header>
                    {category.programs.map((program) => {
                      const first = firstPageOf(program.slug);
                      return (
                        <button
                          key={program.slug}
                          type="button"
                          onClick={() => first && onOpen(first.slug)}
                          data-testid={`open-program-${program.slug}`}
                          style={{
                            textAlign: 'left',
                            border: `1px solid ${GOLD_BORDER_SOFT}`,
                            borderRadius: 10,
                            background: 'rgba(255,238,200,0.06)',
                            cursor: first ? 'pointer' : 'not-allowed',
                            padding: '11px 14px',
                            display: 'grid',
                            gap: 6,
                            fontFamily: 'var(--font-serif)',
                            color: GOLD,
                          }}
                        >
                          <span
                            style={{
                              color: GOLD_STRONG,
                              fontWeight: 700,
                              fontSize: 15,
                              letterSpacing: '0.005em',
                            }}
                          >
                            {program.title}
                          </span>
                          <span
                            style={{
                              color: GOLD_MID,
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            {program.blurb}
                          </span>
                          <span
                            style={{
                              color: GOLD_FAINT,
                              fontSize: 10,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {program.durationMinutes} min · {program.chapters.length} chapter
                            {program.chapters.length === 1 ? '' : 's'}
                          </span>
                          <ol
                            style={{
                              margin: '6px 0 0',
                              padding: '8px 0 0 0',
                              borderTop: `1px solid ${GOLD_BORDER_SOFT}`,
                              display: 'grid',
                              gap: 4,
                              listStyle: 'none',
                            }}
                          >
                            {program.chapters.map((chapter, idx) => (
                              <li
                                key={chapter.slug}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '56px 1fr',
                                  gap: 10,
                                  fontFamily: 'var(--font-serif)',
                                  fontSize: 12,
                                  color: GOLD_MID,
                                  lineHeight: 1.4,
                                }}
                              >
                                <span
                                  style={{
                                    color: GOLD_STRONG,
                                    fontWeight: 700,
                                    fontSize: 11,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {chapter.number} of {program.chapters.length}
                                </span>
                                <span>{chapter.title}</span>
                              </li>
                            ))}
                          </ol>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

function PageReader({
  page,
  chapterTitle,
  chapterNumber,
  programTitle,
  categoryTitle,
  pageIndex,
  totalInChapter,
  prevSlug,
  nextSlug,
  onNavigate,
  onBack,
}: {
  page: Page;
  chapterTitle: string;
  chapterNumber: number;
  programTitle: string;
  categoryTitle: string;
  pageIndex: number;
  totalInChapter: number;
  prevSlug: string | null;
  nextSlug: string | null;
  onNavigate: (slug: string) => void;
  onBack: () => void;
}) {
  return (
    <article
      data-testid="page-reader"
      style={{
        maxWidth: 720,
        marginInline: 'auto',
        background: 'rgba(255,248,231,0.86)',
        border: '1px solid rgba(122,84,56,0.26)',
        borderRadius: 14,
        padding: 'clamp(16px, 3vw, 26px)',
        display: 'grid',
        gap: 16,
        fontFamily: 'var(--font-serif)',
      }}
    >
      <header style={{ display: 'grid', gap: 6 }}>
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-hub"
          style={{
            justifySelf: 'start',
            border: 0,
            background: 'transparent',
            color: 'rgba(82,58,38,0.78)',
            cursor: 'pointer',
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: 0,
          }}
        >
          ← {categoryTitle} · {programTitle}
        </button>
        <div
          data-testid="chapter-crumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            fontFamily: 'var(--font-serif)',
          }}
        >
          <span
            style={{
              border: '1px solid rgba(180,140,80,0.42)',
              borderRadius: 999,
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#7a4b18',
              background: 'rgba(255,243,217,0.65)',
            }}
          >
            Chapter {chapterNumber} · {chapterTitle}
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(82,58,38,0.62)',
              fontWeight: 700,
            }}
          >
            Page {pageIndex + 1} of {totalInChapter}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <TrustBadge
            confidence={page.confidence}
            lastVerified={page.lastVerified}
            sources={page.sources}
            changelog={page.changelog}
          />
          {(page.tags ?? []).map((tag) => (
            <span
              key={tag}
              data-testid={`page-tag-${tag}`}
              style={{
                border: '1px solid rgba(122,84,56,0.32)',
                borderRadius: 999,
                background: 'rgba(255,243,217,0.62)',
                color: '#5a3d18',
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                padding: '3px 9px',
                textTransform: 'uppercase',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <h1
          style={{
            margin: '4px 0 0',
            color: '#1f1408',
            fontSize: 'clamp(22px, 3.5vw, 30px)',
            lineHeight: 1.2,
          }}
        >
          {page.title}
        </h1>
      </header>

      <p
        data-testid="page-bluf"
        style={{
          margin: 0,
          color: '#2a1d0e',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.5,
          paddingLeft: 10,
          borderLeft: '3px solid rgba(36,52,82,0.6)',
        }}
      >
        {page.bluf}
      </p>

      <div
        style={{
          color: 'rgba(34,28,20,0.86)',
          fontSize: 15,
          lineHeight: 1.62,
        }}
      >
        {page.body}
      </div>

      {page.dependsOn.length > 0 && (
        <ChipRow
          label="Read first"
          slugs={page.dependsOn}
          onNavigate={onNavigate}
          testId="depends-on"
        />
      )}
      {page.feedsInto.length > 0 && (
        <ChipRow
          label="Then go"
          slugs={page.feedsInto}
          onNavigate={onNavigate}
          testId="feeds-into"
        />
      )}

      <footer style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button
            type="button"
            disabled={!prevSlug}
            onClick={() => prevSlug && onNavigate(prevSlug)}
            data-testid="prev-page"
            style={{ ...navButton, opacity: prevSlug ? 1 : 0.34 }}
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={!nextSlug}
            onClick={() => nextSlug && onNavigate(nextSlug)}
            data-testid="next-page"
            style={{ ...navButton, opacity: nextSlug ? 1 : 0.34 }}
          >
            Next →
          </button>
        </div>

        <section aria-label="Sources">
          <p style={smallLabel}>sources</p>
          <ol
            style={{
              margin: '6px 0 0 18px',
              padding: 0,
              color: 'rgba(34,28,20,0.7)',
              fontSize: 12,
            }}
          >
            {page.sources.map((source) => (
              <li key={source.ref} style={{ marginBottom: 4, lineHeight: 1.5 }}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: '#2a1d0e' }}
                >
                  {source.title}
                </a>{' '}
                · <span style={{ opacity: 0.7 }}>{source.date}</span>
              </li>
            ))}
          </ol>
        </section>
      </footer>
    </article>
  );
}

function CategoryCover({ category }: { category: ReturnType<typeof categoriesByTier>[number] }) {
  if (category.cover) {
    // Real photo cover (drop into /public/world/<slug>.webp)
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(18,10,4,0.78) 100%), url('${category.cover}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: `1px solid ${GOLD_BORDER_SOFT}`,
        }}
        aria-hidden="true"
      />
    );
  }

  // Procedural cover — warm gradient on the tint + diagonal sweep + title slug
  const tint = category.tint;
  const dark = '#1a0e05';
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        position: 'relative',
        background: `radial-gradient(circle at 70% 40%, ${tint} 0%, ${tint}aa 35%, ${dark} 95%)`,
        borderBottom: `1px solid ${GOLD_BORDER_SOFT}`,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 180"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.55 }}
      >
        <defs>
          <linearGradient id={`grad-${category.slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(255,238,200,0.5)" />
            <stop offset="1" stopColor="rgba(255,238,200,0)" />
          </linearGradient>
        </defs>
        <path
          d="M -20 130 Q 60 70 160 90 Q 260 110 340 60 L 340 220 L -20 220 Z"
          fill={`url(#grad-${category.slug})`}
        />
        <circle cx="246" cy="56" r="22" fill="rgba(255,238,200,0.32)" />
      </svg>
      <span
        style={{
          position: 'absolute',
          left: 14,
          bottom: 10,
          color: 'rgba(255,238,200,0.86)',
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {category.tier}
      </span>
    </div>
  );
}

function ToolPill({
  label,
  onClick,
  testId,
  highlighted = false,
}: {
  label: string;
  onClick: () => void;
  testId: string;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      style={{
        border: `1px solid ${GOLD_BORDER}`,
        borderRadius: 999,
        background: highlighted
          ? 'linear-gradient(180deg, rgba(180,140,80,0.45), rgba(140,100,40,0.45))'
          : 'rgba(255,238,200,0.06)',
        color: GOLD_STRONG,
        cursor: 'pointer',
        fontFamily: 'var(--font-serif)',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.16em',
        padding: '7px 16px',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );
}

function ChipRow({
  label,
  slugs,
  onNavigate,
  testId,
}: {
  label: string;
  slugs: string[];
  onNavigate: (slug: string) => void;
  testId: string;
}) {
  return (
    <div data-testid={testId} style={{ display: 'grid', gap: 6 }}>
      <p style={smallLabel}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {slugs.map((slug) => {
          const target = locatePage(slug);
          const title = target?.page.title ?? slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => target && onNavigate(slug)}
              style={{
                border: '1px solid rgba(122,84,56,0.32)',
                borderRadius: 999,
                background: target ? 'rgba(255,248,231,0.6)' : 'rgba(255,248,231,0.28)',
                color: '#2a1d0e',
                cursor: target ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                letterSpacing: '0.02em',
                padding: '5px 10px',
              }}
            >
              {title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const smallLabel = {
  margin: 0,
  color: 'rgba(82,58,38,0.66)',
  fontFamily: 'var(--font-serif)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
};

const hubButtonPrimary = {
  border: '1px solid rgba(122,84,56,0.42)',
  borderRadius: 999,
  background: 'rgba(82,58,38,0.92)',
  color: '#ffe6aa',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.1em',
  padding: '8px 16px',
  textTransform: 'uppercase' as const,
};

const hubButtonSecondary = {
  ...hubButtonPrimary,
  background: 'rgba(255,248,231,0.78)',
  color: '#2a1d0e',
};

const navButton = {
  border: '1px solid rgba(122,84,56,0.32)',
  borderRadius: 999,
  background: 'rgba(255,248,231,0.7)',
  color: '#2a1d0e',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  padding: '7px 14px',
  textTransform: 'uppercase' as const,
};
