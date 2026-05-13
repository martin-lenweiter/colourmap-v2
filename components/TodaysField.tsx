'use client';

import { useEffect, useState } from 'react';
import { colours, radii, space } from '@/lib/design-tokens';

type FieldEntry = {
  emotionName: string;
  emotionColor: string;
  count: number;
  trend: 'up' | 'down' | 'flat';
};

const TREND_ARROW: Record<FieldEntry['trend'], string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export default function TodaysField() {
  const [entries, setEntries] = useState<FieldEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/field')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: FieldEntry[]) => {
        setEntries(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || entries.length === 0) return null;

  const font = 'var(--font-handwritten)';
  const total = entries.reduce((s, e) => s + e.count, 0);

  return (
    <div
      style={{
        background: `${colours.paperWarm}80`,
        border: `1px solid ${colours.ochre}18`,
        borderRadius: radii.xl,
        padding: `${space.md}px ${space.lg}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: space.sm,
      }}
    >
      <p
        style={{
          fontFamily: font,
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--palette-panel-muted, #C4A060)',
          opacity: 0.55,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        today's field · {total} {total === 1 ? 'person' : 'people'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {entries.map((e) => (
          <div
            key={e.emotionName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: space.md,
            }}
          >
            {/* Colour dot */}
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: e.emotionColor,
                flexShrink: 0,
                opacity: 0.85,
              }}
            />
            {/* Emotion name */}
            <span
              style={{
                fontFamily: font,
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--palette-panel-text, #5C3018)',
                flex: 1,
                opacity: 0.85,
              }}
            >
              {e.emotionName}
            </span>
            {/* Trend arrow */}
            <span
              style={{
                fontFamily: font,
                fontSize: '13px',
                color:
                  e.trend === 'up'
                    ? '#7AAA58'
                    : e.trend === 'down'
                      ? '#D4605A'
                      : 'var(--palette-panel-muted, #8A6A4A)',
                opacity: 0.7,
                minWidth: 14,
                textAlign: 'center',
              }}
            >
              {TREND_ARROW[e.trend]}
            </span>
            {/* Count */}
            <span
              style={{
                fontFamily: font,
                fontSize: '12px',
                color: 'var(--palette-panel-muted, #8A6A4A)',
                opacity: 0.55,
                minWidth: 36,
                textAlign: 'right',
              }}
            >
              {e.count} {e.count === 1 ? 'person' : 'people'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
