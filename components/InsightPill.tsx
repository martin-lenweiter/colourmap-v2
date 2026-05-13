'use client';

import { useState } from 'react';

const SERIF = 'var(--font-serif)';
const PT = 'var(--palette-panel-text, rgba(196,160,96,0.88))';
const PM = 'var(--palette-panel-muted, rgba(196,160,96,0.55))';
const PB = 'var(--panel-border, rgba(196,160,96,0.18))';

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
        border: `1px solid ${PB}`,
        background: 'transparent',
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
            background: PM,
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: PT,
            flex: 1,
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          {insight.hook}
        </span>
        {!open && (
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 10,
              color: PM,
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
              color: PM,
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
        <div style={{ padding: '0 12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insight.body.split('\n\n').map((para, i) => (
              <p
                key={i}
                style={{ fontFamily: SERIF, fontSize: 14, color: PT, lineHeight: 1.8, margin: 0 }}
              >
                {para}
              </p>
            ))}
          </div>

          {insight.deeper && !showDeeper && (
            <button
              type="button"
              onClick={() => setShowDeeper(true)}
              style={{
                alignSelf: 'center',
                background: 'none',
                border: `1px solid ${PB}`,
                borderRadius: 999,
                padding: '4px 18px',
                fontFamily: SERIF,
                fontSize: 11,
                color: PM,
                cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >
              go deeper ◆
            </button>
          )}

          {showDeeper && insight.deeper && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                borderTop: `1px solid ${PB}`,
                paddingTop: 12,
              }}
            >
              {insight.deeper.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  style={{ fontFamily: SERIF, fontSize: 13, color: PT, lineHeight: 1.8, margin: 0 }}
                >
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
