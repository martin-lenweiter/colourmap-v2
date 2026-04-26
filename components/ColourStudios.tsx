'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * ColourStudios v0 — first prototype of the music platform that
 * sits alongside the rest of Colourmap. The thesis: musicians
 * record short loops (stems) on their phones, stack them in a
 * library, eventually share them in Circles.
 *
 * V0 scope (this PR):
 *   - Loop list with name + duration + palette colour
 *   - "New loop" button — records ~8 seconds from microphone
 *     using MediaRecorder, stores as a Blob URL + saves base64 in
 *     localStorage so it survives reload
 *   - Tap a loop → plays back at 100% volume; tap again → stops
 *   - "Loop #001" suggested name, auto-incrementing
 *   - Delete a loop (long-press / × button)
 *
 * What this is NOT yet:
 *   - No multi-track stacking (each loop plays solo)
 *   - No effects, no quantize, no BPM detection
 *   - No sharing to Circles
 *   - No cloud sync — purely local
 *
 * It's the seed. The architecture matches the bigger vision
 * laid out in docs/pdfs/colourmap-vision-2026-04.pdf.
 *
 * Per Martin's master roadmap (task #24).
 */

const LS_LOOPS = 'colourmap:colourstudios-loops';

const PALETTE = [
  '#D4805A',
  '#7AAA58',
  '#6890B0',
  '#9B6BA0',
  '#C4A060',
  '#5AA8B0',
  '#B07070',
  '#7A8A50',
];

interface SavedLoop {
  id: string;
  name: string;
  /** Hex colour for the loop tile. */
  colour: string;
  /** Duration in seconds. */
  duration: number;
  /** Base64-encoded audio data (data: URL). */
  data: string;
  /** ISO created date. */
  createdAt: string;
}

const RECORD_SECONDS = 8;

function loadLoops(): SavedLoop[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_LOOPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLoops(loops: SavedLoop[]) {
  try {
    localStorage.setItem(LS_LOOPS, JSON.stringify(loops));
  } catch {
    /* silent — quota exceeded ⇒ user is told via UI */
  }
}

function pickNextName(loops: SavedLoop[]): string {
  const num = loops.length + 1;
  return `Loop #${String(num).padStart(3, '0')}`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ColourStudios() {
  const [loops, setLoops] = useState<SavedLoop[]>([]);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLoops(loadLoops());
    return () => {
      try {
        recorderRef.current?.stop();
      } catch {
        /* silent */
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioElRef.current?.pause();
    };
  }, []);

  async function startRecording() {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('your browser does not support recording');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || 'audio/webm',
        });
        try {
          const data = await blobToBase64(blob);
          const next: SavedLoop = {
            id: crypto.randomUUID(),
            name: pickNextName(loops),
            colour: PALETTE[loops.length % PALETTE.length],
            duration: RECORD_SECONDS,
            data,
            createdAt: new Date().toISOString(),
          };
          const updated = [next, ...loops];
          setLoops(updated);
          saveLoops(updated);
        } catch {
          setError('could not encode the recording');
        }
        // Tear down the mic stream.
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecording(false);
        setCountdown(0);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setCountdown(RECORD_SECONDS);
      const startedAt = Date.now();
      const tick = setInterval(() => {
        const remaining = Math.max(0, RECORD_SECONDS - Math.floor((Date.now() - startedAt) / 1000));
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(tick);
          try {
            recorder.stop();
          } catch {
            /* silent */
          }
        }
      }, 250);
    } catch {
      setError('microphone permission was denied');
      setRecording(false);
    }
  }

  function stopRecording() {
    try {
      recorderRef.current?.stop();
    } catch {
      /* silent */
    }
  }

  function playLoop(loop: SavedLoop) {
    audioElRef.current?.pause();
    if (playingId === loop.id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(loop.data);
    audio.loop = true;
    audio.play().catch(() => setError('could not play that loop'));
    audio.addEventListener('ended', () => setPlayingId(null));
    audioElRef.current = audio;
    setPlayingId(loop.id);
  }

  function deleteLoop(id: string) {
    if (playingId === id) {
      audioElRef.current?.pause();
      setPlayingId(null);
    }
    const updated = loops.filter((l) => l.id !== id);
    setLoops(updated);
    saveLoops(updated);
  }

  function renameLoop(id: string, name: string) {
    const updated = loops.map((l) => (l.id === id ? { ...l, name } : l));
    setLoops(updated);
    saveLoops(updated);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 26,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5C3018',
            letterSpacing: '0.04em',
          }}
        >
          ColourStudios
        </p>
        <p
          className="mt-1 italic"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: '#8A6A4A',
            opacity: 0.85,
          }}
        >
          v0 · capture loops · stack them later · share with your Circle one day
        </p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-105"
          style={{
            background: recording ? '#B33A2B' : '#C4A060',
            border: 'none',
            boxShadow: recording ? '0 0 32px -4px #B33A2B' : '0 8px 24px -8px rgba(196,160,96,0.5)',
          }}
          aria-label={recording ? 'Stop recording' : 'Record a loop'}
        >
          {recording ? (
            <span className="block h-7 w-7 rounded-sm bg-[#F3E8D2]" />
          ) : (
            <span className="block h-6 w-6 rounded-full bg-[#F3E8D2]" />
          )}
        </button>
        <p
          className="text-center"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: '#7A5438',
            letterSpacing: '0.04em',
          }}
        >
          {recording ? (
            <>
              recording · <strong style={{ color: '#B33A2B' }}>{countdown}s</strong> left
            </>
          ) : (
            <>tap to record an {RECORD_SECONDS}-second loop</>
          )}
        </p>
        {error && (
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 12,
              color: '#B33A2B',
              opacity: 0.85,
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Loop library */}
      {loops.length === 0 ? (
        <div
          className="rounded-2xl text-center"
          style={{
            background: '#C4A06010',
            border: '1px dashed #C4A06040',
            padding: '32px 20px',
          }}
        >
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: '#8A6A4A',
              opacity: 0.7,
            }}
          >
            no loops yet — tap the circle to capture your first one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p
            className="px-1 uppercase"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#7A5438',
              opacity: 0.7,
            }}
          >
            your loops · {loops.length}
          </p>
          {loops.map((loop) => {
            const isPlaying = playingId === loop.id;
            return (
              <div
                key={loop.id}
                className="flex items-center gap-3 rounded-2xl"
                style={{
                  background: `${loop.colour}10`,
                  border: `1px solid ${loop.colour}30`,
                  padding: '12px 14px',
                }}
              >
                <button
                  type="button"
                  onClick={() => playLoop(loop)}
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-105"
                  style={{
                    background: loop.colour,
                    border: 'none',
                  }}
                  aria-label={isPlaying ? `Stop ${loop.name}` : `Play ${loop.name}`}
                >
                  {isPlaying ? (
                    <span className="block h-4 w-4 rounded-sm bg-[#F3E8D2]" />
                  ) : (
                    <span
                      className="block"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '12px solid #F3E8D2',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        marginLeft: 3,
                      }}
                    />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={loop.name}
                    onChange={(e) => renameLoop(loop.id, e.target.value)}
                    className="w-full bg-transparent outline-none"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 15,
                      fontWeight: 700,
                      color: loop.colour,
                      letterSpacing: '0.04em',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 11,
                      color: '#8A6A4A',
                      opacity: 0.7,
                    }}
                  >
                    {loop.duration}s ·{' '}
                    {new Date(loop.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteLoop(loop.id)}
                  className="shrink-0 cursor-pointer text-[12px]"
                  style={{
                    color: '#8A6A4A',
                    opacity: 0.3,
                    background: 'none',
                    border: 'none',
                  }}
                  aria-label={`Delete ${loop.name}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Closing line */}
      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          color: '#8A6A4A',
          opacity: 0.55,
          letterSpacing: '0.06em',
        }}
      >
        v0 — solo loops only · stacking + circles + cloud sync are coming
      </p>
    </main>
  );
}
