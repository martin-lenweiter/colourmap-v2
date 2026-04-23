'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Clickable "Colourmap" brand in the top header.
 * Opens an About modal explaining what the project is and crediting
 * its creators.
 *
 * The button itself replicates the original header glyph (italic
 * "Colourmap" + 8-point star) so the visual in the header is
 * unchanged — only the interaction is new.
 */
export default function ColourmapBrandButton() {
  const [open, setOpen] = useState(false);
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

            {/* Heading */}
            <div className="mb-4 flex items-center gap-2">
              <p
                className="font-normal tracking-[0.1em]"
                style={{ fontSize: 22, color: '#B33A2B', fontStyle: 'italic' }}
              >
                Colourmap
              </p>
              <svg width={18} height={18} viewBox="0 0 20 20" aria-hidden="true">
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

            {/* What it is */}
            <p
              className="mb-5 italic"
              style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}
            >
              A living self-portrait you paint every day. Colourmap turns self-reflection into a
              visual map of your life balance — emotional check-ins, mission tracking, a personal
              notebook, layered soundscapes to regulate your state, and shared circles for coworking
              with people you trust.
            </p>

            {/* Divider */}
            <div
              aria-hidden="true"
              className="mb-5"
              style={{ height: 1, background: 'var(--border)' }}
            />

            {/* Credits */}
            <p
              className="mb-3 uppercase tracking-[0.22em]"
              style={{ fontSize: 11, color: 'var(--muted-foreground)', opacity: 0.75 }}
            >
              Created by
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 h-2 w-2 shrink-0 rotate-45 rounded-[1px]"
                  style={{ background: '#C4A060' }}
                />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                    Vikash Morgan
                  </p>
                  <p
                    className="italic"
                    style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}
                  >
                    who wanted to help balance logic and creativity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 h-2 w-2 shrink-0 rotate-45 rounded-[1px]"
                  style={{ background: '#B33A2B' }}
                />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                    The Mysterious Martin
                  </p>
                  <p
                    className="italic"
                    style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}
                  >
                    who believes technology can create a more human world.
                  </p>
                </div>
              </div>
            </div>

            {/* Tap-through hint */}
            <p
              className="mt-6 text-center"
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
