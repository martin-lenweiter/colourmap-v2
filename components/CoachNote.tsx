'use client';

import { useEffect, useState } from 'react';

const SERIF = 'var(--font-serif)';
const brn = (a: number) => `rgba(60,30,8,${a})`;
const brn2 = (a: number) => `rgba(92,48,24,${a})`;
const och = (a: number) => `rgba(196,160,96,${a})`;
const cream = (a: number) => `rgba(240,216,152,${a})`;

type CoachNoteProps = {
  id: string;
  headline: string;
  body: string;
  onDark?: boolean;
};

export default function CoachNote({ id, headline, body, onDark = false }: CoachNoteProps) {
  const lsKey = `colourmap:coachnote:${id}`;
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(lsKey) === 'dismissed') setDismissed(true);
    } catch {}
  }, [lsKey]);

  function dismiss(e: React.MouseEvent) {
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem(lsKey, 'dismissed');
    } catch {}
  }

  if (dismissed) return null;

  const borderCol = onDark ? och(open ? 0.28 : 0.2) : brn2(open ? 0.22 : 0.16);
  const bgCol = onDark ? och(open ? 0.05 : 0) : brn(open ? 0.04 : 0);
  const diamondCol = onDark ? och(open ? 0.6 : 0.45) : brn2(open ? 0.55 : 0.4);
  const hookCol = onDark ? cream(open ? 0.75 : 0.55) : brn(open ? 0.82 : 0.68);
  const dotsCol = onDark ? och(0.35) : brn2(0.35);
  const closeCol = onDark ? och(0.35) : brn2(0.35);
  const bodyCol = onDark ? cream(0.72) : brn(0.78);
  const dismissCol = onDark ? och(0.35) : brn2(0.38);

  return (
    <div
      style={{
        borderRadius: open ? 12 : 999,
        border: `1px solid ${borderCol}`,
        background: bgCol,
        overflow: 'hidden',
        transition: 'border-radius 0.22s, background 0.22s',
        cursor: open ? 'default' : 'pointer',
      }}
      onClick={!open ? () => setOpen(true) : undefined}
    >
      {/* pill row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: open ? '10px 14px 8px' : '5px 14px 5px 12px',
          transition: 'padding 0.18s',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            background: diamondCol,
            transform: 'rotate(45deg)',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        />
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: hookCol,
            flex: 1,
            lineHeight: 1.4,
            fontStyle: 'italic',
            transition: 'color 0.2s',
          }}
        >
          {headline}
        </span>
        {!open && (
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 10,
              color: dotsCol,
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
            }}
            style={{
              background: 'none',
              border: 'none',
              color: closeCol,
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

      {/* expanded body */}
      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              color: bodyCol,
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {body}
          </p>
          <button
            type="button"
            onClick={dismiss}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              fontFamily: SERIF,
              fontSize: 12,
              color: dismissCol,
              cursor: 'pointer',
              padding: 0,
              letterSpacing: '0.04em',
            }}
          >
            got it, don't show again
          </button>
        </div>
      )}
    </div>
  );
}
