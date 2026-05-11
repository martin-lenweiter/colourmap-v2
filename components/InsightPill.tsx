'use client';

import { useState } from 'react';

const SERIF = 'var(--font-serif)';
const brn = (a: number) => `rgba(60,30,8,${a})`;
const brn2 = (a: number) => `rgba(92,48,24,${a})`;

export type Insight = {
  hook: string;
  body: string;
  deeper?: string;
};

type Props = {
  insights: Insight[];
  storageKey: string;
};

function todayIndex(len: number) {
  const day = Math.floor(Date.now() / 86400000);
  return day % len;
}

export default function InsightPill({ insights, storageKey: _storageKey }: Props) {
  const idx = todayIndex(insights.length);
  const insight = insights[idx];

  const [open, setOpen] = useState(false);
  const [showDeeper, setShowDeeper] = useState(false);

  if (!insight) return null;

  return (
    <div
      style={{
        borderRadius: open ? 12 : 999,
        border: `1px solid ${brn2(open ? 0.22 : 0.18)}`,
        background: open ? brn(0.04) : 'transparent',
        overflow: 'hidden',
        transition: 'border-radius 0.22s, background 0.22s',
        cursor: open ? 'default' : 'pointer',
      }}
      onClick={!open ? () => setOpen(true) : undefined}
    >
      {/* ── Pill row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: open ? '10px 12px 8px' : '5px 12px 5px 10px',
          transition: 'padding 0.18s',
        }}
      >
        {/* diamond */}
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            background: brn2(open ? 0.55 : 0.4),
            transform: 'rotate(45deg)',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        />
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: brn(open ? 0.82 : 0.68),
            flex: 1,
            lineHeight: 1.4,
            fontStyle: 'italic',
            transition: 'color 0.2s',
          }}
        >
          {insight.hook}
        </span>
        {!open && (
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 10,
              color: brn2(0.35),
              letterSpacing: '0.1em',
              flexShrink: 0,
            }}
          >
            ···
          </span>
        )}
        {open && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              setShowDeeper(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: brn2(0.35),
              fontSize: 16,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Expanded body ── */}
      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              color: brn(0.78),
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {insight.body}
          </p>

          {insight.deeper && !showDeeper && (
            <button
              type="button"
              onClick={() => setShowDeeper(true)}
              style={{
                alignSelf: 'center',
                background: 'none',
                border: `1px solid ${brn2(0.25)}`,
                borderRadius: 999,
                padding: '4px 18px',
                fontFamily: SERIF,
                fontSize: 11,
                color: brn2(0.55),
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              go deeper ◆
            </button>
          )}

          {showDeeper && insight.deeper && (
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 13,
                color: brn(0.65),
                lineHeight: 1.8,
                margin: 0,
                borderTop: `1px solid ${brn2(0.12)}`,
                paddingTop: 10,
              }}
            >
              {insight.deeper}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
