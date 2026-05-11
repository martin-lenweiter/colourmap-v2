'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useDesignerObservations } from '@/lib/hooks/use-designer-observations';

/*
 * FeedbackOverlay — developer mode with drawing + text notes, opened
 * by triple-tapping anywhere on the app.
 *
 * Purpose: let the user annotate a live UI screenshot directly, so
 * when they screenshot the phone I get the UI state + their
 * scribbles + their written feedback in a single image. Plus —
 * register block-by-block observations with an "area" pill (Day,
 * Music, Circles, etc.) into a persistent Supabase-backed log so
 * the running list of "what doesn't work" travels with the user
 * across devices.
 *
 * Modes when dev-mode is active:
 *   - `note`  → a draggable sticky-note textarea + observation log.
 *   - `draw`  → finger/mouse strokes are captured as SVG paths laid
 *               over the page. Red pen by default.
 *
 * Toggle between the two with the mode pill at the top. Close with
 * the × or by triple-tapping again (only outside the note/draw
 * controls).
 *
 * Persistence: each observation is saved as its own row in
 * `designer_observations` (Supabase) when the user hits Register.
 * The textarea's working text is also cached in localStorage so an
 * accidental close doesn't lose mid-typing thoughts. Drawings are
 * NOT persisted — they're ephemeral annotations for screenshots.
 *
 * Discoverability: a tiny tan dot in the bottom-right corner; single-
 * tap also opens.
 */

const LS_LAST_NOTE = 'colourmap:feedback-overlay-last';
const LS_LAST_AREA = 'colourmap:feedback-overlay-last-area';
const LS_CORRECTIONS = 'colourmap:notebook-corrections';
const LS_REFLECTIONS = 'colourmap:notebook-reflections';
const LS_HINT_DISMISSED = 'colourmap:feedback-hint-dismissed';
const TRIPLE_TAP_WINDOW_MS = 700;

type Mode = 'note' | 'draw' | 'books';
type BookTab = 'corrections' | 'reflections';

interface AreaOption {
  id: string;
  label: string;
  color: string;
}

/** The parts of the app an observation can be tagged with. Adjust
 *  freely as the surface area grows — the area is stored as a free
 *  text column in the database, so adding/removing options here
 *  doesn't require a migration. */
const AREA_OPTIONS: AreaOption[] = [
  { id: 'day', label: 'Day', color: '#C4A060' },
  { id: 'music', label: 'Music', color: '#6890B0' },
  { id: 'circles', label: 'Circles', color: '#7AAA58' },
  { id: 'overview', label: 'Overview', color: '#9B6BA0' },
  { id: 'profile', label: 'Profile', color: '#8E6B3A' },
  { id: 'studios', label: 'Studios', color: '#5AA8B0' },
  { id: 'other', label: 'Other', color: '#8A6A4A' },
];

function relativeWhen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface Stroke {
  id: number;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

// Web Speech API types — they're still vendor-prefixed so we declare
// the shape ourselves rather than depending on lib.dom updates.
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
  resultIndex: number;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function FeedbackOverlay() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('note');
  const [text, setText] = useState('');
  const [notePos, setNotePos] = useState<{ x: number; y: number }>({ x: 16, y: 60 });
  const [noteSize, setNoteSize] = useState<{ w: number; h: number }>({ w: 280, h: 180 });
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [drawColor, setDrawColor] = useState('#B33A2B');
  // Portal mount — defer until after hydration so createPortal has
  // document.body available. Rendering into body escapes any ancestor
  // `transform` / `filter` / `overflow` that would otherwise break
  // `position: fixed` on iOS Safari (the reason the dev-mode toolbar
  // could disappear when scrolling).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const tapTimestampsRef = useRef<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const noteDragStateRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const noteResizeStateRef = useRef<{
    startX: number;
    startY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);
  const textBeforeListenRef = useRef<string>('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  // Observation log — Supabase-backed list of past feedback blocks.
  const {
    observations,
    register,
    remove: removeObservation,
    setDone: setObsDone,
  } = useDesignerObservations();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [bookTab, setBookTab] = useState<BookTab>('corrections');
  const [correctionsText, setCorrectionsText] = useState('');
  const [reflectionsText, setReflectionsText] = useState('');
  const [bookPos, setBookPos] = useState<{ x: number; y: number }>({ x: 16, y: 60 });
  const [bookSize, setBookSize] = useState<{ w: number; h: number }>({ w: 320, h: 320 });
  const bookDragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const bookResizeRef = useRef<{
    startX: number;
    startY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [addStatus, setAddStatus] = useState<'idle' | 'saved'>('idle');
  const [hintDismissed, setHintDismissed] = useState(true);

  // Check if hint has been dismissed
  useEffect(() => {
    try {
      setHintDismissed(localStorage.getItem(LS_HINT_DISMISSED) === '1');
    } catch {}
  }, []);

  function dismissHint() {
    setHintDismissed(true);
    try {
      localStorage.setItem(LS_HINT_DISMISSED, '1');
    } catch {}
  }

  // Font size for the note textarea. Persisted in localStorage so the
  // user's preference carries between sessions. 9px to 22px range —
  // small enough for tight screenshots, large enough for comfortable
  // writing.
  const [fontSize, setFontSize] = useState<number>(15);
  useEffect(() => {
    setVoiceSupported(getSpeechRecognition() !== null);
    try {
      const raw = localStorage.getItem('colourmap:feedback-overlay-font-size');
      if (raw) {
        const n = Number.parseFloat(raw);
        if (Number.isFinite(n) && n >= 9 && n <= 22) setFontSize(n);
      }
    } catch {
      /* silent */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('colourmap:feedback-overlay-font-size', String(fontSize));
    } catch {
      /* silent */
    }
  }, [fontSize]);

  function startListening() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    textBeforeListenRef.current = text;
    rec.onresult = (ev) => {
      let transcript = '';
      for (let i = 0; i < ev.results.length; i++) {
        transcript += ev.results[i][0].transcript;
      }
      const base = textBeforeListenRef.current;
      setText(
        base
          ? `${base}${base.endsWith('\n') || base.endsWith(' ') ? '' : ' '}${transcript}`
          : transcript,
      );
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
    };
    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    } catch {
      /* already started or blocked */
    }
  }

  function stopListening() {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* silent */
      }
    }
    setListening(false);
  }

  // Restore last note + last area on first mount
  useEffect(() => {
    try {
      const last = localStorage.getItem(LS_LAST_NOTE);
      if (last) setText(last);
      const lastArea = localStorage.getItem(LS_LAST_AREA);
      if (lastArea && AREA_OPTIONS.some((o) => o.id === lastArea)) setSelectedAreaId(lastArea);
      // Notebooks — corrections falls back to existing feedback text so
      // content written before notebooks existed isn't lost.
      const corr = localStorage.getItem(LS_CORRECTIONS);
      setCorrectionsText(corr ?? last ?? '');
      const refl = localStorage.getItem(LS_REFLECTIONS);
      if (refl) setReflectionsText(refl);
    } catch {
      /* silent */
    }
  }, []);

  // Persist the selected area between sessions (working draft of "what
  // is this feedback about" should survive an accidental close).
  useEffect(() => {
    try {
      if (selectedAreaId) localStorage.setItem(LS_LAST_AREA, selectedAreaId);
      else localStorage.removeItem(LS_LAST_AREA);
    } catch {
      /* silent */
    }
  }, [selectedAreaId]);

  // Reset the saved-status pulse a moment after a successful save.
  useEffect(() => {
    if (addStatus !== 'saved') return;
    const t = setTimeout(() => setAddStatus('idle'), 1400);
    return () => clearTimeout(t);
  }, [addStatus]);

  const onAdd = useCallback(async () => {
    if (!text.trim()) return;
    const areaLabel = selectedAreaId
      ? (AREA_OPTIONS.find((o) => o.id === selectedAreaId)?.label ?? null)
      : null;
    await register(text, areaLabel);
    setText('');
    try {
      localStorage.removeItem(LS_LAST_NOTE);
    } catch {}
    setAddStatus('saved');
    setLogOpen(true);
  }, [text, selectedAreaId, register]);

  function copyAll() {
    if (observations.length === 0) return;
    const lines = observations.map((o) => {
      const area = o.area ? `[${o.area}]  ` : '';
      const when = relativeWhen(o.createdAt);
      return `${area}${when}\n${o.text}`;
    });
    const header = `FEEDBACK — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    navigator.clipboard.writeText(`${header}\n\n${lines.join('\n\n─────\n\n')}`).catch(() => {});
  }

  function renderObsText(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const numbered = line.match(/^(\d+)\.\s(.+)/);
      const bullet = line.match(/^[-*]\s(.+)/);
      const checkedDone = line.match(/^[-*]\s\[x\]\s(.+)/i);
      const checkedOpen = line.match(/^[-*]\s\[\s\]\s(.+)/i);
      if (checkedDone) {
        return (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 1 }}
          >
            <span style={{ marginTop: 1, color: '#7A9860', fontWeight: 700 }}>✓</span>
            <span style={{ textDecoration: 'line-through', opacity: 0.55 }}>{checkedDone[1]}</span>
          </div>
        );
      }
      if (checkedOpen) {
        return (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 1 }}
          >
            <span
              style={{
                marginTop: 1,
                width: 11,
                height: 11,
                border: '1.5px solid #A87A40',
                borderRadius: 2,
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            <span>{checkedOpen[1]}</span>
          </div>
        );
      }
      if (numbered) {
        return (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 1 }}
          >
            <span style={{ color: '#A87A40', fontWeight: 700, minWidth: 14, textAlign: 'right' }}>
              {numbered[1]}.
            </span>
            <span>{numbered[2]}</span>
          </div>
        );
      }
      if (bullet) {
        return (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 1 }}
          >
            <span style={{ color: '#A87A40', marginTop: 1 }}>·</span>
            <span>{bullet[1]}</span>
          </div>
        );
      }
      return (
        <div key={i} style={{ marginBottom: line === '' ? 4 : 1 }}>
          {line || ' '}
        </div>
      );
    });
  }

  const openOverlay = useCallback(() => {
    setOpen(true);
    setTimeout(() => {
      if (mode === 'note') textareaRef.current?.focus();
    }, 30);
  }, [mode]);

  const close = useCallback(() => {
    setOpen(false);
    // Stop any active speech recognition when the overlay closes.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* silent */
      }
    }
    setListening(false);
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

  // Note resize handlers — drag the corner handle to set any size.
  function onNoteResizeStart(ev: React.PointerEvent<HTMLElement>) {
    ev.stopPropagation();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    noteResizeStateRef.current = {
      startX: ev.clientX,
      startY: ev.clientY,
      origW: noteSize.w,
      origH: noteSize.h,
    };
  }
  function onNoteResizeMove(ev: React.PointerEvent<HTMLElement>) {
    const s = noteResizeStateRef.current;
    if (!s) return;
    ev.stopPropagation();
    const dx = ev.clientX - s.startX;
    const dy = ev.clientY - s.startY;
    // Clamp: min 120×80 (still readable), max 420×520 (won't steal screen).
    const w = Math.max(120, Math.min(420, s.origW + dx));
    const h = Math.max(80, Math.min(520, s.origH + dy));
    setNoteSize({ w, h });
  }
  function onNoteResizeEnd() {
    noteResizeStateRef.current = null;
  }

  if (!mounted) return null;

  if (!open) {
    // Small trigger dot at bottom-right — thumb-reachable on phone.
    // Rendered via portal into body so iOS doesn't strip fixed
    // positioning when an ancestor has transform/filter.
    return createPortal(
      <button
        type="button"
        onClick={openOverlay}
        aria-label="Open developer feedback mode (or triple-tap anywhere)"
        title="Developer feedback — triple-tap anywhere"
        style={{
          position: 'fixed',
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          right: 'calc(14px + env(safe-area-inset-right, 0px))',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#A87A40',
          border: '1px solid rgba(0,0,0,0.2)',
          opacity: 0.55,
          padding: 0,
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
          zIndex: 9997,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      />,
      document.body,
    );
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        pointerEvents: 'none', // children opt in individually
      }}
    >
      {/* Draw layer — receives strokes only in draw mode */}
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

      {/* Control bar — top center, always clickable.
          Collapsible: tap the chevron to shrink to a tiny pill that
          doesn't obscure the app while screenshotting. */}
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
          style={{ background: '#F3E0B8', borderColor: '#A87A40' }}
        >
          {!toolbarCollapsed && (
            <>
              <ModeButton active={mode === 'note'} onClick={() => setMode('note')} label="note" />
              <ModeButton active={mode === 'draw'} onClick={() => setMode('draw')} label="draw" />
              <ModeButton
                active={mode === 'books'}
                onClick={() => setMode('books')}
                label="books"
              />
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
            </>
          )}
          <button
            type="button"
            onClick={() => setToolbarCollapsed((c) => !c)}
            aria-label={toolbarCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
            title={toolbarCollapsed ? 'Expand' : 'Collapse'}
            style={{
              background: 'transparent',
              border: '1px solid #A87A4055',
              color: '#A87A40',
              borderRadius: '50%',
              width: 26,
              height: 26,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              padding: 0,
            }}
          >
            {toolbarCollapsed ? '›' : '‹'}
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close developer mode"
            style={{
              background: '#A87A40',
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

      {/* Draggable + resizable sticky note — only in note mode.
          Drag handle at the top to move, corner handle at the bottom-right
          to resize. Keep it small while screenshotting, expand while writing. */}
      {mode === 'note' && (
        <div
          className="fixed rounded-xl border-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)]"
          style={{
            top: notePos.y,
            left: notePos.x,
            width: noteSize.w,
            height: noteSize.h,
            maxWidth: 'calc(100vw - 16px)',
            maxHeight: 'calc(100vh - 80px)',
            background: '#F3E0B8',
            borderColor: '#A87A40',
            padding: 10,
            pointerEvents: 'auto',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {/* Dismissible intro hint */}
          {!hintDismissed && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(168,122,64,0.12)',
                border: '1px solid #A87A4040',
                borderRadius: 8,
                padding: '7px 10px',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  lineHeight: 1.45,
                  color: '#6B4820',
                  flex: 1,
                }}
              >
                This is where you give me feedback. Write what&apos;s on your mind, tag the area,
                tap Add. Build up a list — when you have a batch, hit <strong>Copy All</strong> and
                paste it to me.
              </span>
              <button
                type="button"
                onClick={dismissHint}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A87A40',
                  fontSize: 15,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  opacity: 0.5,
                }}
              >
                ×
              </button>
            </div>
          )}

          <div
            onPointerDown={onNoteDragStart}
            onPointerMove={onNoteDragMove}
            onPointerUp={onNoteDragEnd}
            onPointerCancel={onNoteDragEnd}
            style={{
              cursor: 'grab',
              padding: '2px 4px 6px',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#A87A40',
              fontWeight: 700,
              touchAction: 'none',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
            }}
          >
            <span>feedback · drag</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {voiceSupported && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => (listening ? stopListening() : startListening())}
                  aria-label={listening ? 'Stop recording' : 'Start voice input'}
                  title={listening ? 'Stop (tap to finish)' : 'Voice input'}
                  style={{
                    background: listening ? '#B33A2B' : 'transparent',
                    border: `1px solid ${listening ? '#B33A2B' : '#A87A4055'}`,
                    color: listening ? '#FFF' : '#A87A40',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontFamily: 'var(--font-serif)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: listening ? '#FFF' : '#B33A2B',
                      animation: listening ? 'pulse 1s ease-in-out infinite' : 'none',
                    }}
                  />
                  {listening ? 'stop' : 'mic'}
                </button>
              )}
            </div>
          </div>
          {/* Text-size slider — drag to shrink or grow the note text.
              Box dimensions live on the corner handle below; this is
              just for the typed text. Persisted between sessions. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 4px 4px',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              color: '#A87A40',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              text
            </span>
            <span
              aria-hidden="true"
              style={{
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              A
            </span>
            <input
              type="range"
              min={9}
              max={22}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number.parseInt(e.target.value, 10))}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Text size"
              className="feedback-slider"
              style={{ flex: 1, accentColor: '#A87A40', minHeight: 20 }}
            />
            <span
              aria-hidden="true"
              style={{
                fontSize: 14,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              A
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#A87A40',
                opacity: 0.85,
                minWidth: 22,
                textAlign: 'right',
              }}
              aria-hidden="true"
            >
              {fontSize}
            </span>
          </div>
          {/* Area pill row — tag the observation with the part of the
              app it's about. Selection persists between sessions and
              is sent to Supabase when the user hits Register. */}
          <div
            className="flex flex-wrap gap-1"
            style={{ padding: '0 4px 4px', rowGap: 4 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {AREA_OPTIONS.map((opt) => {
              const isActive = selectedAreaId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAreaId(isActive ? null : opt.id)}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isActive ? '#FFFFFF' : opt.color,
                    background: isActive ? opt.color : `${opt.color}18`,
                    border: `1px solid ${opt.color}${isActive ? 'FF' : '50'}`,
                    borderRadius: 999,
                    padding: '2px 8px',
                    cursor: 'pointer',
                  }}
                  aria-pressed={isActive}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a block of feedback. Tag the area, then Register."
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              color: '#1f1208',
              border: 'none',
              resize: 'none',
              // Smaller notes get smaller text so more fits in the frame;
              // larger notes read comfortably while writing.
              fontSize,
              lineHeight: 1.4,
              fontFamily: 'var(--font-serif)',
              outline: 'none',
              padding: 4,
              minHeight: 0,
              overflow: 'auto',
            }}
            aria-label="Feedback note"
          />
          {/* Add + log + copy buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 4px 0',
              flexWrap: 'wrap',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onAdd}
              disabled={!text.trim()}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: addStatus === 'saved' ? '#FFFFFF' : !text.trim() ? '#A87A4040' : '#A87A40',
                background:
                  addStatus === 'saved' ? '#7AAA58' : !text.trim() ? '#A87A4008' : '#A87A4018',
                border: `1px solid ${addStatus === 'saved' ? '#7AAA58' : '#A87A4070'}`,
                borderRadius: 999,
                padding: '4px 14px',
                cursor: !text.trim() ? 'default' : 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {addStatus === 'saved' ? '✓ added' : 'add'}
            </button>
            {observations.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setLogOpen((s) => !s)}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    color: '#A87A40',
                    background: 'transparent',
                    border: '1px solid #A87A4040',
                    borderRadius: 999,
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  log · {observations.length} {logOpen ? '▾' : '▸'}
                </button>
                <button
                  type="button"
                  onClick={copyAll}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    color: '#A87A40',
                    background: 'transparent',
                    border: '1px solid #A87A4040',
                    borderRadius: 999,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                >
                  copy all
                </button>
              </>
            )}
          </div>
          {/* Log — active and done sections */}
          {logOpen &&
            observations.length > 0 &&
            (() => {
              const active = observations.filter((o) => !o.done);
              const done = observations.filter((o) => o.done);
              const obsCard = (obs: (typeof observations)[0], isDone: boolean) => {
                const opt = AREA_OPTIONS.find((o) => o.label === obs.area);
                const color = opt?.color ?? '#8A6A4A';
                return (
                  <div
                    key={obs.id}
                    style={{
                      borderRadius: 8,
                      padding: '6px 8px',
                      background: isDone ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)',
                      border: `1px solid ${color}30`,
                      opacity: isDone ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {obs.area && (
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#FFFFFF',
                            background: color,
                            borderRadius: 999,
                            padding: '1px 7px',
                          }}
                        >
                          {obs.area}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 11,
                          color: '#8A6A4A',
                          opacity: 0.75,
                        }}
                      >
                        {relativeWhen(obs.createdAt)}
                      </span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                        <button
                          type="button"
                          onClick={() => setObsDone(obs.id, !isDone)}
                          aria-label={isDone ? 'Restore observation' : 'Mark done'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isDone ? '#7A9860' : '#A87A4060',
                            fontSize: 13,
                            cursor: 'pointer',
                            padding: '0 3px',
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeObservation(obs.id)}
                          aria-label="Delete observation"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#A87A4080',
                            fontSize: 14,
                            cursor: 'pointer',
                            padding: '0 3px',
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 12.5,
                        color: '#1f1208',
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {renderObsText(obs.text)}
                    </div>
                  </div>
                );
              };
              return (
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: '1px dashed #A87A4035',
                    overflowY: 'auto',
                    maxHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {active.map((obs) => obsCard(obs, false))}
                  {done.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDoneOpen((p) => !p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          color: '#A87A40',
                          opacity: 0.6,
                          cursor: 'pointer',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          textAlign: 'left',
                          padding: '2px 0',
                        }}
                      >
                        done · {done.length} {doneOpen ? '▾' : '▸'}
                      </button>
                      {doneOpen && done.map((obs) => obsCard(obs, true))}
                    </>
                  )}
                </div>
              );
            })()}
          {/* Bottom-right resize handle — drag to any custom size.
              Uses a <button> so aria-label is valid and the element
              is naturally interactive. type=button keeps it out of
              form submissions. Pointer handlers drive the resize. */}
          <button
            type="button"
            onPointerDown={onNoteResizeStart}
            onPointerMove={onNoteResizeMove}
            onPointerUp={onNoteResizeEnd}
            onPointerCancel={onNoteResizeEnd}
            aria-label="Resize note"
            title="Drag to resize"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 20,
              height: 20,
              cursor: 'nwse-resize',
              touchAction: 'none',
              padding: 0,
              border: 'none',
              // Visual cue — a small diagonal stripe
              background:
                'linear-gradient(135deg, transparent 35%, #A87A40 35%, #A87A40 45%, transparent 45%, transparent 60%, #A87A40 60%, #A87A40 70%, transparent 70%)',
              borderBottomRightRadius: 10,
            }}
          />
        </div>
      )}

      {/* ── Books mode — two notebooks: Corrections + Reflections ── */}
      {mode === 'books' && (
        <div
          className="fixed rounded-xl border-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)]"
          style={{
            top: bookPos.y,
            left: bookPos.x,
            width: bookSize.w,
            height: bookSize.h,
            maxWidth: 'calc(100vw - 16px)',
            maxHeight: 'calc(100vh - 80px)',
            background: '#F3E0B8',
            borderColor: '#A87A40',
            padding: 10,
            pointerEvents: 'auto',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {/* Drag handle */}
          <div
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              bookDragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origX: bookPos.x,
                origY: bookPos.y,
              };
            }}
            onPointerMove={(e) => {
              const s = bookDragRef.current;
              if (!s) return;
              setBookPos({ x: s.origX + e.clientX - s.startX, y: s.origY + e.clientY - s.startY });
            }}
            onPointerUp={() => {
              bookDragRef.current = null;
            }}
            onPointerCancel={() => {
              bookDragRef.current = null;
            }}
            style={{
              cursor: 'grab',
              padding: '2px 4px 6px',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#A87A40',
              fontWeight: 700,
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            notebooks · drag
          </div>

          {/* Tab switcher */}
          <div
            style={{ display: 'flex', gap: 6, padding: '0 4px 8px' }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {(['corrections', 'reflections'] as BookTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBookTab(t)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: bookTab === t ? '#A87A40' : 'transparent',
                  color: bookTab === t ? '#FFFFFF' : '#A87A40',
                  border: `1px solid #A87A4060`,
                  borderRadius: 999,
                  padding: '3px 12px',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={bookTab === 'corrections' ? correctionsText : reflectionsText}
            onChange={(e) => {
              const val = e.target.value;
              if (bookTab === 'corrections') {
                setCorrectionsText(val);
                try {
                  localStorage.setItem(LS_CORRECTIONS, val);
                } catch {}
              } else {
                setReflectionsText(val);
                try {
                  localStorage.setItem(LS_REFLECTIONS, val);
                } catch {}
              }
            }}
            placeholder={
              bookTab === 'corrections'
                ? 'Small corrections, quick fixes, things to tweak…'
                : 'Big reflections, deeper thoughts, longer ideas…'
            }
            style={{
              flex: 1,
              width: '100%',
              background: 'transparent',
              color: '#1f1208',
              border: 'none',
              resize: 'none',
              fontSize: bookTab === 'reflections' ? 16 : 13,
              lineHeight: 1.5,
              fontFamily: 'var(--font-serif)',
              outline: 'none',
              padding: 4,
              minHeight: 0,
              overflow: 'auto',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />

          {/* Resize handle */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              bookResizeRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origW: bookSize.w,
                origH: bookSize.h,
              };
            }}
            onPointerMove={(e) => {
              const s = bookResizeRef.current;
              if (!s) return;
              e.stopPropagation();
              setBookSize({
                w: Math.max(200, Math.min(480, s.origW + e.clientX - s.startX)),
                h: Math.max(160, Math.min(600, s.origH + e.clientY - s.startY)),
              });
            }}
            onPointerUp={() => {
              bookResizeRef.current = null;
            }}
            onPointerCancel={() => {
              bookResizeRef.current = null;
            }}
            aria-label="Resize notebook"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 20,
              height: 20,
              cursor: 'nwse-resize',
              touchAction: 'none',
              padding: 0,
              border: 'none',
              background:
                'linear-gradient(135deg, transparent 35%, #A87A40 35%, #A87A40 45%, transparent 45%, transparent 60%, #A87A40 60%, #A87A40 70%, transparent 70%)',
              borderBottomRightRadius: 10,
            }}
          />
        </div>
      )}
    </div>,
    document.body,
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
        background: active ? '#A87A40' : 'transparent',
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
