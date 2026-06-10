'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  categoriesByTier,
  firstPageOf,
  locatePage,
  type Page,
  TIER_DEFINITION,
  TIER_ORDER,
} from '@/lib/geopolitics-content';
import EducationModeSwitch from './EducationModeSwitch';
import TrustBadge from './TrustBadge';

const STORAGE_KEY = 'colourmap:geopolitics-world:last-page';

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
        background:
          'linear-gradient(180deg, rgba(236,220,188,0.74), rgba(206,184,145,0.34)), radial-gradient(circle at 20% 12%, rgba(122,84,56,0.12), transparent 36%)',
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
    <section data-testid="world-hub">
      <header style={{ marginBottom: 14 }}>
        <p style={smallLabel}>education / world mode</p>
        <h1
          style={{
            margin: '4px 0 8px',
            color: '#2a1d0e',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(30px, 5vw, 48px)',
            letterSpacing: '0.01em',
          }}
        >
          Geopolitics
        </h1>
        <p
          style={{
            margin: 0,
            color: 'rgba(40,32,22,0.74)',
            fontFamily: 'var(--font-serif)',
            fontSize: 15,
            lineHeight: 1.5,
            maxWidth: 640,
          }}
        >
          Short pages. One claim each. Walk the graph until the interrelations make sense — not
          until you have memorised facts.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {onOpenIntel && (
            <button
              type="button"
              data-testid="open-intel"
              onClick={onOpenIntel}
              style={hubButtonPrimary}
            >
              Shipping Intel →
            </button>
          )}
          {onOpenMap && (
            <button
              type="button"
              data-testid="open-map"
              onClick={onOpenMap}
              style={hubButtonSecondary}
            >
              Weekly map →
            </button>
          )}
          {onOpenGraph && (
            <button
              type="button"
              data-testid="open-graph"
              onClick={onOpenGraph}
              style={hubButtonSecondary}
            >
              Knowledge graph →
            </button>
          )}
          {onOpenSources && (
            <button
              type="button"
              data-testid="open-sources"
              onClick={onOpenSources}
              style={hubButtonSecondary}
            >
              Data garden →
            </button>
          )}
          {onOpenSpace && (
            <button
              type="button"
              data-testid="open-space"
              onClick={onOpenSpace}
              style={hubButtonPrimary}
            >
              ✨ Space (3D) →
            </button>
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
              marginTop: 22,
              borderTop: '1px solid rgba(122,84,56,0.22)',
              paddingTop: 14,
            }}
          >
            <header style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    color: '#7a4b18',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22,
                    letterSpacing: '0.02em',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {TIER_DEFINITION[tier].title}
                </h2>
                <span
                  style={{
                    color: 'rgba(40,32,22,0.74)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {TIER_DEFINITION[tier].oneLiner}
                </span>
              </div>
            </header>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 14,
              }}
            >
              {categoriesInTier.map((category) => (
                <article
                  key={category.slug}
                  style={{
                    border: '1px solid rgba(122,84,56,0.22)',
                    background: 'rgba(255,248,231,0.7)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    display: 'grid',
                    gap: 12,
                  }}
                >
                  <header>
                    <p style={smallLabel}>category</p>
                    <h2
                      style={{
                        margin: '4px 0 6px',
                        color: '#2a1d0e',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 22,
                      }}
                    >
                      {category.title}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: 'rgba(40,32,22,0.74)',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 13,
                        lineHeight: 1.45,
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
                          border: '1px solid rgba(122,84,56,0.22)',
                          borderRadius: 10,
                          background: 'rgba(255,248,231,0.45)',
                          cursor: first ? 'pointer' : 'not-allowed',
                          padding: '10px 12px',
                          display: 'grid',
                          gap: 6,
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        <span
                          style={{
                            color: '#2a1d0e',
                            fontWeight: 800,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {program.title}
                        </span>
                        <span
                          style={{
                            color: 'rgba(40,32,22,0.72)',
                            fontSize: 12,
                            lineHeight: 1.45,
                          }}
                        >
                          {program.blurb}
                        </span>
                        <span
                          style={{
                            color: 'rgba(82,58,38,0.66)',
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {program.durationMinutes} min · {program.chapters.length} chapter
                          {program.chapters.length === 1 ? '' : 's'}
                        </span>
                        <ol
                          style={{
                            margin: '6px 0 0',
                            padding: '6px 0 0 0',
                            borderTop: '1px solid rgba(122,84,56,0.16)',
                            display: 'grid',
                            gap: 3,
                            listStyle: 'none',
                          }}
                        >
                          {program.chapters.map((chapter) => (
                            <li
                              key={chapter.slug}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '48px 1fr',
                                gap: 8,
                                fontFamily: 'var(--font-serif)',
                                fontSize: 12,
                                color: 'rgba(40,32,22,0.78)',
                                lineHeight: 1.35,
                              }}
                            >
                              <span
                                style={{
                                  color: '#7a4b18',
                                  fontWeight: 800,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Ch {chapter.number}
                              </span>
                              <span>{chapter.title}</span>
                            </li>
                          ))}
                        </ol>
                      </button>
                    );
                  })}
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
        <p style={smallLabel} data-testid="chapter-crumb">
          Chapter {chapterNumber} · {chapterTitle.toLowerCase()} · {pageIndex + 1} /{' '}
          {totalInChapter}
        </p>
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
