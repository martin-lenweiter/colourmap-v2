'use client';

import { useEffect, useRef, useState } from 'react';

interface InfoTooltipProps {
  /** The clickable trigger — usually a label or an info icon */
  trigger: React.ReactNode;
  /** Short heading shown at the top of the popover */
  title: string;
  /** Body text — plain string or JSX */
  content: React.ReactNode;
  /** Optional width override (default 280px) */
  width?: number;
  /** Optional className forwarded to the wrapping span */
  className?: string;
}

/**
 * Click-to-explain tooltip. Used across the app to surface what a
 * control does — start with the sound-engine controls (softness,
 * harmonics, sacred frequencies), expand to other features over time.
 *
 * Click the trigger to open. Click anywhere else to close.
 */
export default function InfoTooltip({
  trigger,
  title,
  content,
  width = 280,
  className,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  return (
    <span ref={ref} className={className} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'help',
          color: 'inherit',
          font: 'inherit',
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={title}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 50,
            width,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--popover, #fffbf0)',
            color: 'var(--popover-foreground, #2a1a06)',
            border: '1px solid var(--border, rgba(160,110,40,0.2))',
            boxShadow: '0 8px 24px rgba(94, 58, 20, 0.12)',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            lineHeight: 1.55,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              opacity: 0.85,
            }}
          >
            {title}
          </div>
          <div style={{ opacity: 0.9 }}>{content}</div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
              color: 'inherit',
              opacity: 0.5,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
      )}
    </span>
  );
}
