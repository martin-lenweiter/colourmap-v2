'use client';

import { Loader2, Maximize2, Mic, MicOff, Send, Sparkles, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useSpeechToText } from '@/lib/hooks/use-speech-to-text';

type PresenceStatus = 'idle' | 'thinking' | 'error';

const CELL_DOTS = Array.from({ length: 72 }, (_, index) => {
  const ring = index % 3;
  const angle = index * 137.5;
  const radius = ring === 0 ? 18 + (index % 7) * 2.4 : ring === 1 ? 28 + (index % 9) * 1.7 : 39;
  return {
    id: index,
    x: 50 + Math.cos((angle * Math.PI) / 180) * radius,
    y: 50 + Math.sin((angle * Math.PI) / 180) * radius,
    size: ring === 0 ? 2.2 : ring === 1 ? 1.7 : 1.2,
    delay: `${(index % 12) * -0.18}s`,
    drift: ring + 1,
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
}: {
  active: boolean;
  listening: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border"
      data-active={active}
      data-listening={listening}
      style={{
        width: compact ? 42 : 128,
        height: compact ? 42 : 128,
        borderColor: listening ? 'rgba(245, 170, 70, 0.78)' : 'rgba(214, 165, 83, 0.48)',
        background:
          'radial-gradient(circle at 50% 50%, rgba(247,185,82,0.18), rgba(64,32,18,0.96) 54%, rgba(22,13,11,0.98))',
        boxShadow: listening
          ? '0 0 42px rgba(241, 143, 45, 0.5), inset 0 0 34px rgba(246, 187, 78, 0.22)'
          : '0 0 24px rgba(174, 116, 42, 0.24), inset 0 0 24px rgba(240, 186, 90, 0.12)',
      }}
    >
      <div
        className="absolute inset-[14%] rounded-full border"
        style={{
          borderColor: listening ? 'rgba(255, 204, 104, 0.42)' : 'rgba(238, 184, 92, 0.2)',
          boxShadow: active ? 'inset 0 0 28px rgba(255, 176, 69, 0.2)' : undefined,
        }}
      />
      {CELL_DOTS.map((dot) => (
        <span
          key={dot.id}
          className="absolute rounded-full"
          style={
            {
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: compact ? dot.size * 0.72 : dot.size,
              height: compact ? dot.size * 0.72 : dot.size,
              background: dot.id % 5 === 0 ? '#fff1a8' : '#f4b84f',
              boxShadow: '0 0 10px rgba(251, 190, 73, 0.9)',
              opacity: listening ? 0.94 : 0.62,
              transform: 'translate(-50%, -50%)',
              animation: `presenceCellDrift${dot.drift} ${listening ? 1.8 : 4.8}s ease-in-out infinite`,
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
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speech = useSpeechToText({ lang: 'en-US', autoRestart: true });

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
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse((current) => current + decoder.decode(value, { stream: true }));
      }
      setResponse((current) => current + decoder.decode());
      setStatus('idle');
    } catch (requestError) {
      setStatus('error');
      setError(requestError instanceof Error ? requestError.message : 'AI Presence failed.');
    }
  }

  function toggleSpeech() {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.start(message, setMessage);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open AI Presence"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[130] flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-lg transition hover:scale-[1.02]"
        style={{
          borderColor: 'rgba(205, 148, 68, 0.52)',
          background: 'rgba(45, 24, 17, 0.94)',
          color: '#f5d28c',
          boxShadow: '0 14px 44px rgba(28, 14, 8, 0.32)',
        }}
      >
        <PresenceCell active={status === 'thinking'} listening={speech.listening} compact />
        AI Presence
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
            borderColor: 'rgba(214, 160, 78, 0.34)',
            background:
              'linear-gradient(155deg, rgba(67,38,25,0.98), rgba(37,20,15,0.98) 52%, rgba(20,14,14,0.98))',
            color: '#f7e5c2',
            boxShadow: '0 22px 74px rgba(19, 10, 7, 0.48)',
          }}
        >
          <div className="flex items-center justify-between border-b border-amber-200/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <PresenceCell active={status === 'thinking'} listening={speech.listening} compact />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/55">
                  {surface}
                </p>
                <h2 className="truncate font-serif text-lg text-amber-100">AI Presence</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={expanded ? 'Shrink AI Presence' : 'Expand AI Presence'}
                onClick={() => setExpanded((value) => !value)}
                className="rounded-full border border-amber-200/15 p-2 text-amber-100/80 transition hover:bg-amber-100/10"
              >
                <Maximize2 size={15} />
              </button>
              <button
                type="button"
                aria-label="Close AI Presence"
                onClick={() => setOpen(false)}
                className="rounded-full border border-amber-200/15 p-2 text-amber-100/80 transition hover:bg-amber-100/10"
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
              <PresenceCell active={status === 'thinking'} listening={speech.listening} />
            </div>

            <div className="min-w-0 space-y-3">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Drop the fragment here. What is happening?"
                className="h-32 w-full resize-none rounded-2xl border bg-black/20 p-3 text-sm leading-relaxed outline-none transition focus:border-amber-200/50"
                style={{
                  borderColor: 'rgba(238, 185, 96, 0.22)',
                  color: '#f9e5bb',
                }}
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={runPresenceReflection}
                  disabled={!message.trim() || status === 'thinking'}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                  style={{
                    borderColor: 'rgba(251, 190, 87, 0.42)',
                    background: 'rgba(241, 167, 57, 0.14)',
                    color: '#ffd98e',
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
                      ? 'rgba(255, 188, 77, 0.72)'
                      : 'rgba(251, 190, 87, 0.28)',
                    background: speech.listening
                      ? 'rgba(241, 132, 45, 0.24)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#f6d99b',
                  }}
                >
                  {speech.listening ? <MicOff size={14} /> : <Mic size={14} />}
                  {speech.listening ? 'Listening' : 'Voice'}
                </button>
                {speech.error && <span className="text-xs text-amber-100/60">{speech.error}</span>}
              </div>

              {(response || status === 'thinking' || error) && (
                <div
                  ref={responseRef}
                  className="max-h-52 overflow-y-auto rounded-2xl border bg-black/20 p-3 text-sm leading-relaxed"
                  style={{ borderColor: 'rgba(238, 185, 96, 0.18)', color: '#f8e0ad' }}
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
            </div>
          </div>
        </section>
      )}
    </>
  );
}
