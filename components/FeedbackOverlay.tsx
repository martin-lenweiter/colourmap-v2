'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * FeedbackOverlay — developer mode with drawing + text notes, opened
 * by triple-tapping anywhere on the app.
 *
 * Purpose: let the user annotate a live UI screenshot directly, so
 * when they screenshot the phone I get the UI state + their
 * scribbles + their written feedback in a single image.
 *
 * Modes when dev-mode is active:
 *   - `note`  → a draggable sticky-note textarea. Type feedback.
 *   - `draw`  → finger/mouse strokes are captured as SVG paths laid
 *               over the page. Red pen by default.
 *
 * Toggle between the two with the mode pill at the top. Close with
 * the × or by triple-tapping again (only outside the note/draw
 * controls).
 *
 * Persistence: the last note text is saved to localStorage so an
 * accidental close doesn't lose the user's work. Drawings are NOT
 * persisted — they're ephemeral annotations for a single screenshot.
 *
 * Discoverability: a tiny purple dot in the top-right corner; single-
 * tap also opens.
 */

const LS_LAST_NOTE = 'colourmap:feedback-overlay-last';
const TRIPLE_TAP_WINDOW_MS = 700;

type Mode = 'note' | 'draw';

interface Stroke {
  id: number;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export default function FeedbackOverlay() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('note');
  const [text, setText] = useState('');
  const [notePos, setNotePos] = useState<{ x: number; y: number }>({ x: 16, y: 60 });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [drawColor, setDrawColor] = useState('#B33A2B');

  const tapTimestampsRef = useRef<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const noteDragStateRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Restore last note on first mount
  useEffect(() => {
    try {
      const last = localStorage.getItem(LS_LAST_NOTE);
      if (last) setText(last);
    } catch {
      /* silent */
    }
  }, []);

  const openOverlay = useCallback(() => {
    setOpen(true);
    setTimeout(() => {
      if (mode === 'note') textareaRef.current?.focus();
    }, 30);
  }, [mode]);

  const close = useCallback(() => {
    setOpen(false);
    try {
      if (text.trim()) localStorage.setItem(LS_LAST_NOTE, text);
      else localStorage.removeItem(LS_LAST_NOTE);
    } catch {
      /* silent */
    }
  }, [text]);

  // Triple-tap detection. Ignores taps on interactive elements so normal
  // UI gestures aren't hijacked. Also ignores taps inside the overlay
  // itself when it's open (close via × or Escape).
  useEffect(() => {
    function isInteractive(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName.toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'LABEL'].includes(tag)) return true;
      if (t.isContentEditable) return true;
      let el: HTMLElement | null = t.parentElement;
      let depth = 0;
      while (el && depth < 3) {
        const up = el.tagName.toUpperCase();
        if (['BUTTON', 'A', 'LABEL'].includes(up)) return true;
        el = el.parentElement;
        depth++;
      }
      return false;
    }
    function onTap(ev: Event) {
      if (open) return;
      if (isInteractive(ev.target)) return;
      const now = performance.now();
      const cutoff = now - TRIPLE_TAP_WINDOW_MS;
      tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => t >= cutoff);
      tapTimestampsRef.current.push(now);
      if (tapTimestampsRef.current.length >= 3) {
        tapTimestampsRef.current = [];
        openOverlay();
      }
    }
    window.addEventListener('pointerup', onTap);
    return () => window.removeEventListener('pointerup', onTap);
  }, [open, openOverlay]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Focus textarea when switching back to note mode
  useEffect(() => {
    if (open && mode === 'note') {
      setTimeout(() => textareaRef.current?.focus(), 30);
    }
  }, [mode, open]);

  // Draw handlers — capture pointer strokes on the canvas layer
  function onDrawPointerDown(ev: React.PointerEvent<SVGSVGElement>) {
    if (mode !== 'draw') return;
    const svg = ev.currentTarget;
    svg.setPointerCapture(ev.pointerId);
    const rect = svg.getBoundingClientRect();
    const s: Stroke = {
      id: Date.now() + Math.random(),
      color: drawColor,
      width: 3,
      points: [{ x: ev.clientX - rect.left, y: ev.clientY - rect.top }],
    };
    currentStrokeRef.current = s;
    setStrokes((prev) => [...prev, s]);
  }
  function onDrawPointerMove(ev: React.PointerEvent<SVGSVGElement>) {
    if (mode !== 'draw') return;
    const s = currentStrokeRef.current;
    if (!s) return;
    const rect = ev.currentTarget.getBoundingClientRect();
    s.points.push({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
    // Force re-render; strokes is a shallow array of the same refs so
    // we need to create a new array reference.
    setStrokes((prev) => [...prev]);
  }
  function onDrawPointerUp() {
    currentStrokeRef.current = null;
  }

  function clearStrokes() {
    setStrokes([]);
  }
  function undoStroke() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  // Note drag handlers — let the user move the sticky note anywhere
  function onNoteDragStart(ev: React.PointerEvent<HTMLDivElement>) {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    noteDragStateRef.current = {
      startX: ev.clientX,
      startY: ev.clientY,
      origX: notePos.x,
      origY: notePos.y,
    };
  }
  function onNoteDragMove(ev: React.PointerEvent<HTMLDivElement>) {
    const s = noteDragStateRef.current;
    if (!s) return;
    const dx = ev.clientX - s.startX;
    const dy = ev.clientY - s.startY;
    setNotePos({ x: s.origX + dx, y: s.origY + dy });
  }
  function onNoteDragEnd() {
    noteDragStateRef.current = null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openOverlay}
        aria-label="Open developer feedback mode (or triple-tap anywhere)"
        title="Developer feedback — triple-tap anywhere"
        className="fixed z-40 cursor-pointer transition-opacity hover:opacity-90"
        style={{
          top: 'calc(6px + env(safe-area-inset-top, 0px))',
          right: 6,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#9B6BA0',
          border: '1px solid rgba(0,0,0,0.2)',
          opacity: 0.4,
          padding: 0,
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 9998,
        pointerEvents: 'none', // children opt in individually
      }}
    >
      {/* Draw layer — receives strokes only in draw mode */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: drawing surface is intentionally not focusable */}
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: mode === 'draw' ? 'auto' : 'none',
          touchAction: mode === 'draw' ? 'none' : 'auto',
          cursor: mode === 'draw' ? 'crosshair' : 'auto',
        }}
        onPointerDown={onDrawPointerDown}
        onPointerMove={onDrawPointerMove}
        onPointerUp={onDrawPointerUp}
        onPointerCancel={onDrawPointerUp}
      >
        {strokes.map((s) => (
          <polyline
            key={s.id}
            points={s.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Control bar — top center, always clickable */}
      <div
        className="fixed left-1/2 -translate-x-1/2"
        style={{
          top: 'calc(10px + env(safe-area-inset-top, 0px))',
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="flex items-center gap-1 rounded-full border-2 p-1 shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
          style={{ background: '#FFFFFF', borderColor: '#9B6BA0' }}
        >
          <ModeButton active={mode === 'note'} onClick={() => setMode('note')} label="note" />
          <ModeButton active={mode === 'draw'} onClick={() => setMode('draw')} label="draw" />
          {mode === 'draw' && (
            <>
              <ColorSwatch
                color="#B33A2B"
                active={drawColor === '#B33A2B'}
                onClick={() => setDrawColor('#B33A2B')}
              />
              <ColorSwatch
                color="#3A8AC4"
                active={drawColor === '#3A8AC4'}
                onClick={() => setDrawColor('#3A8AC4')}
              />
              <ColorSwatch
                color="#7AAA58"
                active={drawColor === '#7AAA58'}
                onClick={() => setDrawColor('#7AAA58')}
              />
              <IconButton onClick={undoStroke} title="Undo last stroke">
                ↶
              </IconButton>
              <IconButton onClick={clearStrokes} title="Clear all strokes">
                ⌫
              </IconButton>
            </>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Close developer mode"
            style={{
              background: '#9B6BA0',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: 28,
              height: 28,
              fontSize: 18,
              lineHeight: 1,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Draggable sticky note — only in note mode */}
      {mode === 'note' && (
        <div
          className="fixed rounded-xl border-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)]"
          style={{
            top: notePos.y,
            left: notePos.x,
            width: 280,
            maxWidth: 'calc(100vw - 32px)',
            background: '#FFF8E6',
            borderColor: '#9B6BA0',
            padding: 10,
            pointerEvents: 'auto',
            zIndex: 9999,
          }}
        >
          {/** biome-ignore lint/a11y/noStaticElementInteractions: drag handle */}
          <div
            onPointerDown={onNoteDragStart}
            onPointerMove={onNoteDragMove}
            onPointerUp={onNoteDragEnd}
            onPointerCancel={onNoteDragEnd}
            style={{
              cursor: 'grab',
              padding: '2px 4px 8px',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9B6BA0',
              fontWeight: 700,
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            feedback · drag me
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type here. Take a screenshot — this note is visible in the image."
            rows={5}
            style={{
              width: '100%',
              background: 'transparent',
              color: '#1f1208',
              border: 'none',
              resize: 'none',
              fontSize: 15,
              lineHeight: 1.45,
              fontFamily: 'var(--font-serif)',
              outline: 'none',
              padding: 4,
              minHeight: 90,
            }}
            aria-label="Feedback note"
          />
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? '#9B6BA0' : 'transparent',
        color: active ? '#FFFFFF' : '#5C3018',
        border: 'none',
        borderRadius: 999,
        padding: '6px 12px',
        fontSize: 12,
        fontFamily: 'var(--font-serif)',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function ColorSwatch({
  color,
  active,
  onClick,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Draw color ${color}`}
      style={{
        background: color,
        border: active ? '2px solid #1f1208' : '2px solid rgba(0,0,0,0.15)',
        borderRadius: '50%',
        width: 22,
        height: 22,
        cursor: 'pointer',
        padding: 0,
      }}
    />
  );
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#5C3018',
        borderRadius: '50%',
        width: 26,
        height: 26,
        fontSize: 14,
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'var(--font-serif)',
      }}
    >
      {children}
    </button>
  );
}
