'use client';

import { Loader2, Maximize2, Mic, MicOff, Send, Sparkles, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useSpeechToText } from '@/lib/hooks/use-speech-to-text';

type PresenceStatus = 'idle' | 'thinking' | 'error';
type PresencePreset = 'cell' | 'sun' | 'dotwalker' | 'orbit' | 'nebula';
type PresenceTurn = {
  id: string;
  surface: string;
  message: string;
  response: string;
  createdAt: string;
};

const OPEN_AI_PRESENCE_EVENT = 'colourmap:open-ai-presence';
const PRESENCE_HISTORY_LS = 'colourmap:ai-presence-discussion';

const CELL_DOTS = Array.from({ length: 72 }, (_, index) => {
  const ring = index % 4;
  const angle = index * 137.5;
  const radius =
    ring === 0
      ? 7 + (index % 6) * 1.8
      : ring === 1
        ? 15 + (index % 8) * 1.7
        : ring === 2
          ? 24 + (index % 7) * 1.45
          : 32;
  return {
    id: index,
    x: 50 + Math.cos((angle * Math.PI) / 180) * radius,
    y: 50 + Math.sin((angle * Math.PI) / 180) * radius * 0.84,
    size: ring === 0 ? 2.25 : ring === 1 ? 1.9 : ring === 2 ? 1.55 : 1.2,
    delay: `${(index % 12) * -0.18}s`,
    drift: ring + 1,
  };
});

const SUN_DOTS = Array.from({ length: 92 }, (_, index) => {
  const angle = index * 137.5;
  const ray = index % 5 === 0 ? 18 : 0;
  const radius = 16 + (index % 13) * 2.8 + ray;
  return {
    id: index,
    x: 50 + Math.cos((angle * Math.PI) / 180) * radius,
    y: 50 + Math.sin((angle * Math.PI) / 180) * radius,
    size: index % 5 === 0 ? 1.4 : 2,
    delay: `${(index % 14) * -0.13}s`,
  };
});

const WALKER_DOTS = Array.from({ length: 84 }, (_, index) => {
  const section = index % 7;
  const row = Math.floor(index / 7);
  const bodyY = row < 6 ? 24 + row * 7 : 60 + (row - 6) * 8;
  const spread = row < 6 ? 10 + row * 1.2 : 18 - (row - 6) * 2.4;
  const xOffset = (section - 3) * (spread / 3);
  const armSwing = row > 5 ? Math.sin(index) * 10 : 0;
  return {
    id: index,
    x: 50 + xOffset + armSwing,
    y: bodyY,
    size: row < 2 ? 1.6 : 1.25,
    delay: `${(index % 10) * -0.16}s`,
  };
});

const ORBIT_DOTS = Array.from({ length: 78 }, (_, index) => {
  const ring = index % 3;
  const angle = index * 51;
  const radius = ring === 0 ? 16 : ring === 1 ? 30 : 43;
  return {
    id: index,
    x: 50 + Math.cos((angle * Math.PI) / 180) * radius,
    y: 50 + Math.sin((angle * Math.PI) / 180) * radius * (ring === 2 ? 0.42 : 0.68),
    size: ring === 0 ? 2 : 1.5,
    delay: `${(index % 15) * -0.11}s`,
  };
});

const NEBULA_DOTS = Array.from({ length: 86 }, (_, index) => {
  const angle = index * 99;
  const radius = 8 + (index % 21) * 2;
  const swirl = angle + radius * 2.4;
  return {
    id: index,
    x: 50 + Math.cos((swirl * Math.PI) / 180) * radius * 0.9,
    y: 50 + Math.sin((swirl * Math.PI) / 180) * radius * 0.55,
    size: index % 9 === 0 ? 2.3 : 1.35,
    delay: `${(index % 18) * -0.1}s`,
  };
});

function getSurfaceLabel(pathname: string) {
  if (pathname.includes('build-lab')) return 'Creator Space';
  if (pathname.includes('geometry')) return 'Geometry';
  if (pathname.includes('notebook')) return 'Notebook';
  if (pathname.includes('missions')) return 'Missions';
  if (pathname.includes('journey')) return 'Journey';
  if (pathname.includes('day')) return 'Day Map';
  return 'Colourmap';
}

function PresenceCell({
  active,
  listening,
  compact = false,
  preset = 'cell',
}: {
  active: boolean;
  listening: boolean;
  compact?: boolean;
  preset?: PresencePreset;
}) {
  const dots =
    preset === 'sun'
      ? SUN_DOTS
      : preset === 'dotwalker'
        ? WALKER_DOTS
        : preset === 'orbit'
          ? ORBIT_DOTS
          : preset === 'nebula'
            ? NEBULA_DOTS
            : CELL_DOTS;
  const isWalker = preset === 'dotwalker';
  const isSun = preset === 'sun';
  const isOrbit = preset === 'orbit';
  const isNebula = preset === 'nebula';

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border"
      data-active={active}
      data-listening={listening}
      style={{
        width: compact ? 42 : 128,
        height: compact ? 42 : 128,
        borderColor: listening
          ? 'color-mix(in srgb, var(--foreground) 70%, var(--primary))'
          : 'color-mix(in srgb, var(--foreground) 34%, transparent)',
        background: isSun
          ? 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 62%, var(--foreground)), color-mix(in srgb, var(--primary) 42%, var(--card)) 31%, color-mix(in srgb, var(--card) 92%, black) 68%, var(--card))'
          : isWalker
            ? 'radial-gradient(circle at 50% 46%, color-mix(in srgb, var(--primary) 24%, transparent), color-mix(in srgb, var(--card) 92%, black) 62%, var(--card))'
            : isOrbit
              ? 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--card) 88%, var(--muted)) 58%, var(--card))'
              : isNebula
                ? 'radial-gradient(circle at 44% 48%, color-mix(in srgb, var(--foreground) 24%, transparent), color-mix(in srgb, var(--primary) 28%, transparent) 34%, var(--card) 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(196,160,96,0.24), color-mix(in srgb, var(--card) 86%, #c4a060) 48%, color-mix(in srgb, var(--card) 96%, black) 76%)',
        boxShadow: listening
          ? '0 0 42px color-mix(in srgb, var(--primary) 46%, transparent), inset 0 0 34px color-mix(in srgb, var(--foreground) 18%, transparent)'
          : '0 0 24px color-mix(in srgb, var(--primary) 24%, transparent), inset 0 0 24px color-mix(in srgb, var(--foreground) 10%, transparent)',
      }}
    >
      <div
        className="absolute rounded-full border"
        style={{
          inset: isWalker ? '18% 27% 14%' : '18%',
          borderColor: listening
            ? 'color-mix(in srgb, var(--foreground) 38%, transparent)'
            : 'color-mix(in srgb, var(--foreground) 18%, transparent)',
          boxShadow: active
            ? 'inset 0 0 28px color-mix(in srgb, var(--primary) 20%, transparent)'
            : undefined,
        }}
      />
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="absolute rounded-full"
          style={
            {
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: compact ? dot.size * 0.72 : dot.size,
              height: compact ? dot.size * 0.72 : dot.size,
              background: isNebula
                ? dot.id % 7 === 0
                  ? 'var(--foreground)'
                  : 'var(--primary)'
                : isSun
                  ? dot.id % 5 === 0
                    ? 'var(--foreground)'
                    : 'var(--primary)'
                  : dot.id % 6 === 0
                    ? '#f5d98f'
                    : dot.id % 4 === 0
                      ? '#d8b65d'
                      : '#c4a060',
              boxShadow: '0 0 12px rgba(216,182,93,0.72)',
              opacity: listening ? 0.96 : 0.76,
              transform: 'translate(-50%, -50%)',
              animation: `${
                isWalker ? 'presenceWalker' : isOrbit ? 'presenceOrbit' : 'presenceCellDrift'
              }${'drift' in dot ? dot.drift : 1} ${
                listening ? (isSun ? 0.92 : 1.8) : isSun ? 3.2 : 4.8
              }s ease-in-out infinite`,
              animationDelay: dot.delay,
            } as React.CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes presenceCellDrift1 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          50% { transform: translate(-50%, -50%) translate(4px, -3px) scale(1.35); }
        }
        @keyframes presenceCellDrift2 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          50% { transform: translate(-50%, -50%) translate(-3px, 5px) scale(1.2); }
        }
        @keyframes presenceCellDrift3 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          50% { transform: translate(-50%, -50%) translate(5px, 4px) scale(1.1); }
        }
        @keyframes presenceWalker1 {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
          50% { transform: translate(-50%, -50%) translate(3px, -2px) scale(1.28); }
        }
        @keyframes presenceOrbit1 {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translate(0, 0) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(16deg) translate(4px, 0) scale(1.18); }
        }
      `}</style>
    </div>
  );
}

export default function GlobalAIPresence() {
  const pathname = usePathname();
  const surface = useMemo(() => getSurfaceLabel(pathname), [pathname]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<PresenceStatus>('idle');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<PresenceTurn[]>([]);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speech = useSpeechToText({ lang: 'en-US', autoRestart: true });

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(PRESENCE_HISTORY_LS);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    function handleOpenPresence() {
      setOpen(true);
    }

    window.addEventListener(OPEN_AI_PRESENCE_EVENT, handleOpenPresence);
    return () => window.removeEventListener(OPEN_AI_PRESENCE_EVENT, handleOpenPresence);
  }, []);

  useEffect(() => {
    if (!responseRef.current) return;
    responseRef.current.scrollTop = responseRef.current.scrollHeight;
  });

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  async function runPresenceReflection() {
    const trimmed = message.trim();
    if (!trimmed || status === 'thinking') return;

    setStatus('thinking');
    setResponse('');
    setError('');

    try {
      const res = await fetch('/api/ai/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, surface }),
      });

      if (!res.ok) {
        throw new Error((await res.text().catch(() => '')) || 'AI Presence could not answer.');
      }

      if (!res.body) {
        setResponse(await res.text());
        setStatus('idle');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamed = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const next = decoder.decode(value, { stream: true });
        streamed += next;
        setResponse((current) => current + next);
      }
      const finalChunk = decoder.decode();
      streamed += finalChunk;
      setResponse((current) => current + finalChunk);
      saveTurn(trimmed, streamed);
      setStatus('idle');
    } catch (requestError) {
      setStatus('error');
      setError(requestError instanceof Error ? requestError.message : 'AI Presence failed.');
    }
  }

  function saveTurn(prompt: string, answer: string) {
    const turn: PresenceTurn = {
      id: crypto.randomUUID(),
      surface,
      message: prompt,
      response: answer,
      createdAt: new Date().toISOString(),
    };
    setHistory((existing) => {
      const next = [turn, ...existing].slice(0, 30);
      try {
        localStorage.setItem(PRESENCE_HISTORY_LS, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function toggleSpeech() {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.start(message, setMessage);
  }

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Open AI Presence"
        onClick={() => setOpen(true)}
        title="AI Presence"
        className="fixed bottom-4 right-4 z-[130] flex h-14 w-14 items-center justify-center rounded-full border p-1 shadow-lg transition hover:scale-[1.03]"
        style={{
          borderColor: 'color-mix(in srgb, var(--foreground) 28%, transparent)',
          background: 'color-mix(in srgb, var(--card) 92%, black)',
          color: 'var(--foreground)',
          boxShadow: '0 14px 44px color-mix(in srgb, var(--background) 55%, black)',
        }}
      >
        <PresenceCell
          active={status === 'thinking' || speech.listening}
          listening={speech.listening}
          compact
          preset="cell"
        />
      </button>

      {open && (
        <section
          aria-label="AI Presence panel"
          className="fixed z-[140] overflow-hidden border shadow-2xl"
          style={{
            right: expanded ? 18 : 18,
            bottom: expanded ? 18 : 82,
            width: expanded ? 'min(920px, calc(100vw - 36px))' : 'min(430px, calc(100vw - 24px))',
            maxHeight: expanded ? 'calc(100svh - 36px)' : 'min(680px, calc(100svh - 104px))',
            borderRadius: 26,
            borderColor: 'var(--ai-surface-border, rgba(214, 160, 78, 0.52))',
            background: 'var(--ai-surface-bg, rgb(42, 24, 14))',
            color: 'var(--ai-surface-text, #f7e5c2)',
            boxShadow: 'var(--ai-surface-shadow, 0 22px 74px rgba(19, 10, 7, 0.48))',
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--ai-surface-accent, rgba(238, 185, 96, 0.14))' }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <PresenceCell
                active={status === 'thinking' || speech.listening}
                listening={speech.listening}
                compact
                preset="cell"
              />
              <div className="min-w-0">
                <p
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: 'var(--ai-surface-muted, rgba(246, 217, 155, 0.6))' }}
                >
                  {surface}
                </p>
                <h2
                  className="truncate font-serif text-lg"
                  style={{ color: 'var(--ai-surface-text, #ffecbf)' }}
                >
                  AI Presence
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={expanded ? 'Shrink AI Presence' : 'Expand AI Presence'}
                onClick={() => setExpanded((value) => !value)}
                className="rounded-full border p-2 transition hover:opacity-80"
                style={{
                  borderColor: 'var(--ai-surface-accent, rgba(238, 185, 96, 0.18))',
                  color: 'var(--ai-surface-text, rgba(255, 236, 191, 0.85))',
                }}
              >
                <Maximize2 size={15} />
              </button>
              <button
                type="button"
                aria-label="Close AI Presence"
                onClick={() => setOpen(false)}
                className="rounded-full border p-2 transition hover:opacity-80"
                style={{
                  borderColor: 'var(--ai-surface-accent, rgba(238, 185, 96, 0.18))',
                  color: 'var(--ai-surface-text, rgba(255, 236, 191, 0.85))',
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div
            className={`grid gap-4 p-4 ${expanded ? 'md:grid-cols-[180px_1fr]' : ''}`}
            style={{ maxHeight: expanded ? 'calc(100svh - 116px)' : 'calc(100svh - 184px)' }}
          >
            <div className="flex justify-center">
              <PresenceCell
                active={status === 'thinking' || speech.listening}
                listening={speech.listening}
                preset="cell"
              />
            </div>

            <div className="min-w-0 space-y-3">
              <p
                className="rounded-2xl border px-3 py-2 text-xs leading-relaxed"
                style={{
                  borderColor: 'var(--ai-surface-border, rgba(238, 185, 96, 0.2))',
                  background: 'var(--ai-surface-raised, rgb(54, 31, 18))',
                  color: 'var(--ai-surface-muted, rgba(255, 230, 184, 0.72))',
                }}
              >
                Ask about your current state, the Colourmap specs, strategy, Build Lab, education,
                or Billy. This discussion is saved on this device.
              </p>

              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Drop the fragment here. What is happening?"
                className="h-32 w-full resize-none rounded-2xl border p-3 text-sm leading-relaxed outline-none transition"
                style={{
                  background: 'var(--ai-surface-input, rgba(255,255,255,0.04))',
                  borderColor: 'var(--ai-surface-border, rgba(238, 185, 96, 0.22))',
                  color: 'var(--ai-surface-text, #f9e5bb)',
                }}
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={runPresenceReflection}
                  disabled={!message.trim() || status === 'thinking'}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                  style={{
                    borderColor: 'var(--ai-surface-accent, rgba(251, 190, 87, 0.42))',
                    background: 'var(--ai-surface-input, rgba(241, 167, 57, 0.14))',
                    color: 'var(--ai-surface-text, #ffd98e)',
                  }}
                >
                  {status === 'thinking' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Reflect
                </button>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  disabled={!speech.supported}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-45"
                  style={{
                    borderColor: speech.listening
                      ? 'var(--ai-surface-accent, rgba(255, 188, 77, 0.72))'
                      : 'var(--ai-surface-border, rgba(251, 190, 87, 0.28))',
                    background: speech.listening
                      ? 'var(--ai-surface-input, rgba(241, 132, 45, 0.24))'
                      : 'var(--ai-surface-raised, rgba(255,255,255,0.04))',
                    color: 'var(--ai-surface-text, #f6d99b)',
                  }}
                >
                  {speech.listening ? <MicOff size={14} /> : <Mic size={14} />}
                  {speech.listening ? 'Listening' : 'Voice'}
                </button>
                {speech.error && (
                  <span
                    className="text-xs"
                    style={{ color: 'var(--ai-surface-muted, rgba(255, 236, 191, 0.62))' }}
                  >
                    {speech.error}
                  </span>
                )}
              </div>

              {(response || status === 'thinking' || error) && (
                <div
                  ref={responseRef}
                  className="max-h-52 overflow-y-auto rounded-2xl border p-3 text-sm leading-relaxed"
                  style={{
                    background: 'var(--ai-surface-input, rgba(255,255,255,0.04))',
                    borderColor: 'var(--ai-surface-border, rgba(238, 185, 96, 0.18))',
                    color: 'var(--ai-surface-text, #f8e0ad)',
                  }}
                >
                  {response && <p className="whitespace-pre-wrap">{response}</p>}
                  {status === 'thinking' && !response && (
                    <p className="inline-flex items-center gap-2 text-amber-100/65">
                      <Sparkles size={14} />
                      Reading the fragment...
                    </p>
                  )}
                  {error && <p className="text-amber-100">{error}</p>}
                </div>
              )}

              {history.length > 0 && (
                <div
                  className="max-h-44 overflow-y-auto rounded-2xl border p-3"
                  style={{
                    background: 'var(--ai-surface-raised, rgb(54, 31, 18))',
                    borderColor: 'var(--ai-surface-border, rgba(238, 185, 96, 0.18))',
                  }}
                >
                  <div
                    className="mb-2 text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: 'var(--ai-surface-muted, rgba(246, 217, 155, 0.56))' }}
                  >
                    Saved discussion
                  </div>
                  <div className="space-y-3">
                    {history.slice(0, 5).map((turn) => (
                      <button
                        key={turn.id}
                        type="button"
                        onClick={() => {
                          setMessage(turn.message);
                          setResponse(turn.response);
                        }}
                        className="block w-full text-left text-xs leading-relaxed"
                        style={{ color: 'var(--ai-surface-text, #f8e0ad)' }}
                      >
                        <strong>{turn.surface}</strong>: {turn.message.slice(0, 92)}
                        {turn.message.length > 92 ? '...' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
