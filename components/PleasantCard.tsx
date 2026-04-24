'use client';

import type { CSSProperties, ReactNode } from 'react';

/*
 * PleasantCard — full-bleed surface shell for the pleasant redesign.
 *
 * Wraps a section of the app so it feels like a distinct "place" rather
 * than a row in a dashboard. Gives it:
 *   - big inner padding (24px mobile, 32px desktop via default)
 *   - 24px rounded corners
 *   - a soft gradient background keyed off the `accent` color
 *   - a subtle shadow
 *   - an optional italic serif title at 22-26px
 *
 * One primary color per card (the section's meaning):
 *   - Check-in: warm ochre      (#C4A060)
 *   - Calming Sounds: ocean     (#6890B0)
 *   - Mastery: deep purple      (#9B6BA0)
 *   - Circles: forest green     (#7AAA58)
 *   - Notebook: brown ink       (#7A5438)
 *
 * Title slot is optional — when present, renders at the top in italic
 * serif. Subtitle is an optional small muted line below it.
 */
export interface PleasantCardProps {
  children: ReactNode;
  accent?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_ACCENT = '#C4A060';

export default function PleasantCard({
  children,
  accent = DEFAULT_ACCENT,
  title,
  subtitle,
  className = '',
  style,
}: PleasantCardProps) {
  return (
    <section
      className={`relative rounded-3xl p-6 md:p-8 ${className}`}
      style={{
        background: `linear-gradient(180deg, ${accent}12 0%, var(--card) 42%, var(--card) 100%)`,
        border: `1px solid ${accent}20`,
        boxShadow: `0 24px 60px -40px ${accent}55, 0 4px 14px -10px ${accent}30`,
        ...style,
      }}
    >
      {title && (
        <header className="mb-5">
          <h2
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              lineHeight: 1.15,
              fontWeight: 500,
              color: accent,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-1.5"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                opacity: 0.85,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
