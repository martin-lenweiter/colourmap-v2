'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * CircleAudio — drop-zone for audio recordings shared with the
 * circle. Members can drop voice memos, jam recordings, mic
 * captures from their phone, or any audio file. Each clip can
 * have a reflection (description / what to listen for).
 *
 * V1 storage: localStorage keyed by circle id, with audio files
 * encoded as base64 data URLs. Works fully offline; small files
 * only (browser localStorage caps at ~5–10 MB total).
 *
 * Per Martin (2026-04-26): "place where we can put our recordings
 * so where we can drop files. from our phone recordings during
 * jams. for other users non musicians it means they can register
 * audios and let them in a folder. audios with reflections."
 *
 * V2 (Supabase wire-up): swap to Supabase Storage bucket per
 * circle, persist metadata in `circle_audio_clips` table.
 */

const LS = 'colourmap:circle-audio';

interface AudioClip {
  id: string;
  name: string;
  /** Reflection / description from the uploader. */
  reflection: string;
  /** Base64 data URL — the audio itself. */
  data: string;
  /** Bytes — for showing size. */
  size: number;
  /** Mime type. */
  mime: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedByColour: string;
  uploadedAt: string;
}

type Store = Record<string, AudioClip[]>;

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB per clip — keeps localStorage healthy.

function load(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function persist(s: Store) {
  try {
    localStorage.setItem(LS, JSON.stringify(s));
  } catch {
    /* silent — quota likely exceeded */
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CircleAudio({
  circleId,
  meId,
  meName,
  meColour,
}: {
  circleId: string;
  meId: string;
  meName: string;
  meColour: string;
}) {
  const [store, setStore] = useState<Store>({});
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [reflectionInput, setReflectionInput] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setStore(load());
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const clips = (store[circleId] ?? [])
    .slice()
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  function pickFile(file: File) {
    setError('');
    if (!file.type.startsWith('audio/')) {
      setError("that doesn't look like an audio file");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`too big · max ${formatSize(MAX_BYTES)}`);
      return;
    }
    setPendingFile(file);
  }

  async function commit() {
    if (!pendingFile) return;
    try {
      const data = await fileToBase64(pendingFile);
      const clip: AudioClip = {
        id: crypto.randomUUID(),
        name: pendingFile.name.replace(/\.[^.]+$/, ''),
        reflection: reflectionInput.trim(),
        data,
        size: pendingFile.size,
        mime: pendingFile.type,
        uploadedById: meId,
        uploadedByName: meName,
        uploadedByColour: meColour,
        uploadedAt: new Date().toISOString(),
      };
      const next = { ...store, [circleId]: [clip, ...clips] };
      setStore(next);
      persist(next);
      setPendingFile(null);
      setReflectionInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError('could not encode that file');
    }
  }

  function play(clip: AudioClip) {
    audioRef.current?.pause();
    if (playingId === clip.id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(clip.data);
    audio.addEventListener('ended', () => setPlayingId(null));
    void audio.play().catch(() => setError('could not play that clip'));
    audioRef.current = audio;
    setPlayingId(clip.id);
  }

  function remove(id: string) {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    const next = { ...store, [circleId]: clips.filter((c) => c.id !== id) };
    setStore(next);
    persist(next);
  }

  return (
    <div
      className="rounded-2xl border"
      style={{ borderColor: '#3A689030', background: '#3A689008' }}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3"
        style={{ background: 'none', border: 'none' }}
      >
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#3A6890',
          }}
        >
          recordings · {clips.length}
        </span>
        <span style={{ fontSize: 11, color: '#3A689080' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 animate-in fade-in duration-150">
          {/* Drop zone / file picker */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) pickFile(file);
            }}
            className="rounded-lg text-center transition-all"
            style={{
              background: dragOver ? '#3A689018' : 'rgba(255,255,255,0.3)',
              border: `1.5px dashed ${dragOver ? '#3A6890' : '#3A689040'}`,
              padding: '14px 12px',
            }}
          >
            <p
              className="italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                color: '#5C3018',
                opacity: 0.85,
                lineHeight: 1.45,
              }}
            >
              drop an audio file here · or
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 cursor-pointer rounded-full px-3 py-1"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#3A6890',
                background: '#3A689015',
                border: '1px solid #3A689050',
              }}
            >
              pick from phone
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pickFile(file);
              }}
            />
            <p
              className="mt-1.5"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                color: '#8A6A4A',
                opacity: 0.55,
              }}
            >
              voice memos · jam recordings · audio reflections · max {formatSize(MAX_BYTES)}
            </p>
          </div>

          {error && (
            <p
              className="text-center"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: '#B33A2B',
                opacity: 0.85,
              }}
            >
              {error}
            </p>
          )}

          {/* Pending: prompt for reflection then commit */}
          {pendingFile && (
            <div
              className="space-y-2 rounded-lg"
              style={{
                background: '#3A689015',
                border: '1px solid #3A689040',
                padding: '10px 12px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#3A6890',
                }}
              >
                {pendingFile.name} · {formatSize(pendingFile.size)}
              </p>
              <textarea
                value={reflectionInput}
                onChange={(e) => setReflectionInput(e.target.value)}
                placeholder="reflection · what to listen for · what this captures (optional)"
                rows={2}
                className="w-full resize-none rounded-md bg-white/60 px-2 py-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  color: '#5C3018',
                  border: '1px solid #3A689025',
                  lineHeight: 1.4,
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={commit}
                  className="cursor-pointer rounded-full px-3 py-1"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#3A6890',
                    background: '#3A689025',
                    border: '1px solid #3A689060',
                  }}
                >
                  upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingFile(null);
                    setReflectionInput('');
                  }}
                  className="cursor-pointer rounded-full px-3 py-1"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#8A6A4A',
                    background: 'transparent',
                    border: '1px solid #C4A06030',
                  }}
                >
                  cancel
                </button>
              </div>
            </div>
          )}

          {/* Clip list */}
          {clips.length === 0 && !pendingFile && (
            <p
              className="text-center italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.5,
              }}
            >
              no recordings yet
            </p>
          )}
          {clips.map((clip) => {
            const isPlaying = playingId === clip.id;
            return (
              <div
                key={clip.id}
                className="rounded-lg"
                style={{
                  background: '#3A68900C',
                  border: '1px solid #3A689025',
                  padding: '10px 12px',
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => play(clip)}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
                    style={{
                      background: '#3A6890',
                      border: 'none',
                    }}
                    aria-label={isPlaying ? 'Stop' : 'Play'}
                  >
                    {isPlaying ? (
                      <span className="block h-3 w-3 rounded-sm bg-[#F3E8D2]" />
                    ) : (
                      <span
                        className="block"
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid #F3E8D2',
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          marginLeft: 2,
                        }}
                      />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#3A6890',
                      }}
                    >
                      {clip.name}
                    </p>
                    {clip.reflection && (
                      <p
                        className="mt-0.5 italic"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 12,
                          color: '#5C3018',
                          opacity: 0.85,
                          lineHeight: 1.4,
                        }}
                      >
                        “{clip.reflection}”
                      </p>
                    )}
                    <p
                      className="mt-1"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 10,
                        color: '#8A6A4A',
                        opacity: 0.65,
                      }}
                    >
                      <span style={{ color: clip.uploadedByColour, fontWeight: 600 }}>
                        {clip.uploadedByName}
                      </span>{' '}
                      · {formatSize(clip.size)} ·{' '}
                      {new Date(clip.uploadedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {clip.uploadedById === meId && (
                    <button
                      type="button"
                      onClick={() => remove(clip.id)}
                      className="cursor-pointer text-[10px]"
                      style={{
                        color: '#8A6A4A',
                        opacity: 0.3,
                        background: 'none',
                        border: 'none',
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
