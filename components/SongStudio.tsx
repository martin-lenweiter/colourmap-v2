'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ─── Data model ─────────────────────────────────────────── */

const LS_KEY = 'colourmap:songs';

type SongStatus = 'wip' | 'rehearsed' | 'ready';
type SegmentType =
  | 'intro'
  | 'verse'
  | 'pre-chorus'
  | 'chorus'
  | 'bridge'
  | 'solo'
  | 'outro'
  | 'note';

interface SongSegment {
  id: string;
  type: SegmentType;
  chords: string;
  text: string;
}

interface Song {
  id: string;
  title: string;
  key: string;
  tempo: number;
  genre: string;
  status: SongStatus;
  segments: SongSegment[];
  createdAt: string;
}

const SEGMENT_TYPES: { id: SegmentType; label: string; color: string }[] = [
  { id: 'intro', label: 'Intro', color: '#7AAA58' },
  { id: 'verse', label: 'Verse', color: '#6890B0' },
  { id: 'pre-chorus', label: 'Pre-chorus', color: '#C4A060' },
  { id: 'chorus', label: 'Chorus', color: '#B33A2B' },
  { id: 'bridge', label: 'Bridge', color: '#9B6BA0' },
  { id: 'solo', label: 'Solo', color: '#C08030' },
  { id: 'outro', label: 'Outro', color: '#8A6A4A' },
  { id: 'note', label: 'Note', color: '#A0907A' },
];

const STATUS_OPTS: { id: SongStatus; label: string }[] = [
  { id: 'wip', label: 'WIP' },
  { id: 'rehearsed', label: 'Rehearsed' },
  { id: 'ready', label: 'Ready' },
];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadSongs(): Song[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSongs(songs: Song[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(songs));
  } catch {
    /* quota */
  }
}

function segColor(type: SegmentType) {
  return SEGMENT_TYPES.find((t) => t.id === type)?.color ?? '#A0907A';
}

function segLabel(type: SegmentType) {
  return SEGMENT_TYPES.find((t) => t.id === type)?.label ?? type;
}

function statusColor(s: SongStatus) {
  return s === 'ready' ? '#7AAA58' : s === 'rehearsed' ? '#C4A060' : '#A0907A';
}

/* ─── Song flow strip ────────────────────────────────────── */
function SongFlowStrip({ segments }: { segments: SongSegment[] }) {
  if (segments.length === 0) return null;
  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto mt-2 pb-0.5"
      style={{ scrollbarWidth: 'none' }}
    >
      {segments.map((seg) => {
        const color = segColor(seg.type);
        const label = segLabel(seg.type);
        return (
          <span
            key={seg.id}
            className="shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.06em]"
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Song recordings panel ──────────────────────────────── */

const BUCKET = 'recordings';

interface SongRec {
  id: string;
  title: string;
  storagePath: string;
  durationSecs: number | null;
  category: string;
  createdAt: string;
}

function formatDur(secs: number | null) {
  if (!secs) return '';
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
}

function SongRecordingsPanel({
  songId,
  songTitle,
  onShowAll,
}: {
  songId: string;
  songTitle: string;
  onShowAll: () => void;
}) {
  const [recs, setRecs] = useState<SongRec[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const all: SongRec[] = await res.json();
        setRecs(all.filter((r: SongRec & { songId?: string | null }) => r.songId === songId));
      }
    } catch {}
    setLoaded(true);
  }, [songId]);

  useEffect(() => {
    load();
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener('ended', () => {
      setPlayingId(null);
    });
    return () => {
      audio.pause();
    };
  }, [load]);

  async function play(rec: SongRec) {
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(rec.storagePath, 3600);
    if (!data?.signedUrl || !audioRef.current) return;
    audioRef.current.src = data.signedUrl;
    audioRef.current.play().catch(() => {});
    setPlayingId(rec.id);
  }

  async function saveRec(blob: Blob, name: string, durSecs: number | null) {
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
      const path = `${user.id}/${Date.now()}-${name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.${ext}`;
      await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: blob.type || 'audio/webm' });
      const res = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          storagePath: path,
          publicUrl: path,
          durationSecs: durSecs,
          songId,
          category: 'solo',
          notes: null,
        }),
      });
      if (res.ok) {
        const row = await res.json();
        setRecs((prev) => [row, ...prev]);
      }
    } catch {}
    setUploading(false);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const name = `${songTitle} — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
        void saveRec(blob, name, recSecs);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
      setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
    } catch {}
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mrRef.current?.stop();
    setRecording(false);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      void saveRec(file, file.name.replace(/\.[^.]+$/, ''), Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    });
    audio.addEventListener('error', () => {
      void saveRec(file, file.name.replace(/\.[^.]+$/, ''), null);
    });
  }

  async function rename(rec: SongRec) {
    const trimmed = renameVal.trim();
    if (!trimmed) {
      setRenamingId(null);
      return;
    }
    const res = await fetch(`/api/recordings/${rec.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecs((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, title: updated.title } : r)),
      );
    }
    setRenamingId(null);
  }

  async function deleteRec(rec: SongRec) {
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([rec.storagePath]);
    await fetch(`/api/recordings/${rec.id}`, { method: 'DELETE' });
    setRecs((prev) => prev.filter((r) => r.id !== rec.id));
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div style={{ flex: 1, height: 1, background: '#D4605A20' }} />
        <span
          className="shrink-0 text-[10px] uppercase tracking-[0.16em]"
          style={{ color: '#D4605A', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
        >
          Recordings {recs.length > 0 && `· ${recs.length}`}
        </span>
        <div style={{ flex: 1, height: 1, background: '#D4605A20' }} />
      </div>

      {/* Actions — two big circles stacked vertically */}
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Record / Stop circle */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            className="flex items-center justify-center rounded-full cursor-pointer transition-all disabled:opacity-40"
            style={{
              width: 100,
              height: 100,
              background: recording ? '#D4605A' : '#D4605A12',
              border: `3px solid ${recording ? '#D4605A' : '#D4605A60'}`,
              boxShadow: recording ? '0 0 28px -6px #D4605Acc' : 'none',
            }}
          >
            {recording ? (
              <div className="flex flex-col items-center gap-1">
                <span
                  className="inline-block rounded-sm"
                  style={{ width: 22, height: 22, background: 'white' }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: 'white',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                  }}
                >
                  {formatDur(recSecs)}
                </span>
              </div>
            ) : (
              <span
                className="rounded-full"
                style={{ width: 36, height: 36, background: '#D4605A', display: 'block' }}
              />
            )}
          </button>
          <span
            className="text-[12px] uppercase tracking-[0.14em]"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#D4605A' }}
          >
            {recording ? 'Stop' : 'Record'}
          </span>
        </div>

        {/* Upload circle */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={recording || uploading}
            className="flex items-center justify-center rounded-full cursor-pointer transition-all disabled:opacity-40"
            style={{
              width: 100,
              height: 100,
              background: uploading ? '#C4A06025' : '#C4A06012',
              border: '3px solid #C4A06055',
              boxShadow: uploading ? '0 0 28px -6px #C4A060aa' : 'none',
            }}
          >
            <span style={{ fontSize: '32px', color: '#C4A060', lineHeight: 1 }}>↑</span>
          </button>
          <span
            className="text-[12px] uppercase tracking-[0.14em]"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: '#C4A060' }}
          >
            {uploading ? 'Saving…' : 'Upload'}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={onFile}
        />

        {recs.length > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="text-[11px] uppercase tracking-[0.08em]"
            style={{
              color: '#D4605A',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
            }}
          >
            All recordings →
          </button>
        )}
      </div>

      {/* List */}
      {loaded && recs.length === 0 && !uploading && (
        <p
          className="text-[12px] italic"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          No recordings yet for this song
        </p>
      )}
      {recs.map((rec) => {
        const isPlaying = playingId === rec.id;
        return (
          <div
            key={rec.id}
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: isPlaying ? '#D4605A0C' : '#C4A0600A',
              border: `1px solid ${isPlaying ? '#D4605A30' : '#C4A06018'}`,
            }}
          >
            <button
              type="button"
              onClick={() => play(rec)}
              className="shrink-0 flex items-center justify-center rounded-full text-[13px]"
              style={{ width: 32, height: 32, background: '#D4605A20', color: '#D4605A' }}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              {renamingId === rec.id ? (
                <input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={() => rename(rec)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') rename(rec);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="w-full rounded bg-background/50 px-1 py-0.5 text-[13px] outline-none"
                  style={{ border: '1px solid #C4A06030' }}
                />
              ) : (
                <p
                  className="truncate text-[13px] font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  {rec.title}
                </p>
              )}
              <p
                className="text-[10px]"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                {formatDur(rec.durationSecs)}
                {rec.durationSecs ? ' · ' : ''}
                {new Date(rec.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRenamingId(rec.id);
                setRenameVal(rec.title);
              }}
              className="shrink-0 text-[10px] uppercase tracking-[0.06em]"
              style={{
                color: 'var(--muted-foreground)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
              }}
            >
              rename
            </button>
            <button
              type="button"
              onClick={() => deleteRec(rec)}
              className="shrink-0 text-[10px] uppercase tracking-[0.06em]"
              style={{
                color: '#C06040',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
              }}
            >
              del
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Song view (read/play mode) ─────────────────────────── */
function SongView({
  song,
  onEdit,
  onBack,
  onShowRecordings,
}: {
  song: Song;
  onEdit: () => void;
  onBack: () => void;
  onShowRecordings: (songId: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-[12px] uppercase tracking-[0.1em] transition-all hover:opacity-70"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          ← Songs
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-80"
          style={{ background: '#C4A06018', color: '#C4A060', border: '1px solid #C4A06040' }}
        >
          Edit
        </button>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start gap-3 flex-wrap">
          <h2
            className="text-[26px] font-bold flex-1 min-w-0"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.02em',
            }}
          >
            {song.title}
          </h2>
          <span
            className="mt-1 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-[0.1em] shrink-0"
            style={{
              background: `${statusColor(song.status)}20`,
              color: statusColor(song.status),
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
            }}
          >
            {song.status}
          </span>
        </div>
        <p
          className="mt-1 text-[12px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          {[song.key && `Key: ${song.key}`, song.genre, song.tempo ? `${song.tempo} bpm` : '']
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {/* Flow strip */}
      {song.segments.length > 0 && (
        <div>
          <p
            className="mb-2 text-[10px] uppercase tracking-[0.1em]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Structure
          </p>
          <SongFlowStrip segments={song.segments} />
        </div>
      )}

      {/* Segments */}
      <div className="space-y-4">
        {song.segments.map((seg) => {
          const color = segColor(seg.type);
          return (
            <div key={seg.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-sm shrink-0"
                  style={{ background: color, transform: 'rotate(45deg)' }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color, fontFamily: 'var(--font-serif)' }}
                >
                  {segLabel(seg.type)}
                </span>
                {seg.chords && (
                  <span
                    className="ml-2 font-mono text-[12px]"
                    style={{ color: '#7A5438', letterSpacing: '0.06em' }}
                  >
                    {seg.chords}
                  </span>
                )}
              </div>
              {seg.text && (
                <p
                  className="pl-5 text-[14px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-serif)',
                    opacity: 0.9,
                  }}
                >
                  {seg.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {song.segments.length === 0 && (
        <p
          className="text-center italic text-[13px] py-6"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          No segments yet — tap Edit to add them
        </p>
      )}

      {/* Recordings for this song */}
      <SongRecordingsPanel
        songId={song.id}
        songTitle={song.title}
        onShowAll={() => onShowRecordings(song.id)}
      />
    </div>
  );
}

/* ─── Song editor ────────────────────────────────────────── */

function SongEditor({
  song,
  onSave,
  onBack,
}: {
  song: Song;
  onSave: (s: Song) => void;
  onBack: () => void;
}) {
  const [s, setS] = useState<Song>(song);

  function field<K extends keyof Song>(key: K, val: Song[K]) {
    setS((prev) => ({ ...prev, [key]: val }));
  }

  function addSegment() {
    const seg: SongSegment = { id: uid(), type: 'verse', chords: '', text: '' };
    setS((prev) => ({ ...prev, segments: [...prev.segments, seg] }));
  }

  function updateSeg(id: string, patch: Partial<SongSegment>) {
    setS((prev) => ({
      ...prev,
      segments: prev.segments.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)),
    }));
  }

  function deleteSeg(id: string) {
    setS((prev) => ({ ...prev, segments: prev.segments.filter((seg) => seg.id !== id) }));
  }

  function moveSeg(id: string, dir: -1 | 1) {
    setS((prev) => {
      const segs = [...prev.segments];
      const i = segs.findIndex((seg) => seg.id === id);
      const j = i + dir;
      if (j < 0 || j >= segs.length) return prev;
      [segs[i], segs[j]] = [segs[j], segs[i]];
      return { ...prev, segments: segs };
    });
  }

  function dupSeg(id: string) {
    setS((prev) => {
      const i = prev.segments.findIndex((seg) => seg.id === id);
      if (i === -1) return prev;
      const copy = { ...prev.segments[i], id: uid() };
      const segs = [...prev.segments];
      segs.splice(i + 1, 0, copy);
      return { ...prev, segments: segs };
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-[12px] uppercase tracking-[0.1em] transition-all hover:opacity-70"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          ← Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(s)}
          className="ml-auto cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-80"
          style={{ background: '#C4A060', color: '#fff' }}
        >
          Save
        </button>
      </div>

      {/* Song metadata */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-4">
          <input
            value={s.title}
            onChange={(e) => field('title', e.target.value)}
            placeholder="Song title…"
            className="w-full bg-transparent text-[20px] font-bold outline-none"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-serif)',
              borderBottom: '1px solid #C4A06030',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="song-key"
            className="block text-[10px] uppercase tracking-[0.1em] mb-1"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Key
          </label>
          <input
            id="song-key"
            value={s.key}
            onChange={(e) => field('key', e.target.value)}
            placeholder="Am"
            className="w-full rounded-lg px-3 py-1.5 text-[13px] outline-none"
            style={{
              background: '#C4A06010',
              color: 'var(--foreground)',
              border: '1px solid #C4A06025',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="song-tempo"
            className="block text-[10px] uppercase tracking-[0.1em] mb-1"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            BPM
          </label>
          <input
            id="song-tempo"
            type="number"
            value={s.tempo}
            onChange={(e) => field('tempo', Number(e.target.value))}
            min={40}
            max={240}
            className="w-full rounded-lg px-3 py-1.5 text-[13px] outline-none"
            style={{
              background: '#C4A06010',
              color: 'var(--foreground)',
              border: '1px solid #C4A06025',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="song-genre"
            className="block text-[10px] uppercase tracking-[0.1em] mb-1"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Genre
          </label>
          <input
            id="song-genre"
            value={s.genre}
            onChange={(e) => field('genre', e.target.value)}
            placeholder="Flamenco…"
            className="w-full rounded-lg px-3 py-1.5 text-[13px] outline-none"
            style={{
              background: '#C4A06010',
              color: 'var(--foreground)',
              border: '1px solid #C4A06025',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="song-status"
            className="block text-[10px] uppercase tracking-[0.1em] mb-1"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            Status
          </label>
          <select
            id="song-status"
            value={s.status}
            onChange={(e) => field('status', e.target.value as SongStatus)}
            className="w-full rounded-lg px-3 py-1.5 text-[13px] outline-none"
            style={{
              background: '#C4A06010',
              color: 'var(--foreground)',
              border: '1px solid #C4A06025',
            }}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flow preview */}
      {s.segments.length > 0 && <SongFlowStrip segments={s.segments} />}

      {/* Segments */}
      <div className="space-y-3">
        {s.segments.map((seg, i) => {
          const color = segColor(seg.type);
          return (
            <div
              key={seg.id}
              className="rounded-xl p-3 space-y-2"
              style={{ background: `${color}10`, border: `1px solid ${color}28` }}
            >
              {/* Segment header */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={seg.type}
                  onChange={(e) => updateSeg(seg.id, { type: e.target.value as SegmentType })}
                  className="rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] cursor-pointer outline-none"
                  style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                >
                  {SEGMENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSeg(seg.id, -1)}
                    disabled={i === 0}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-[11px] transition-all hover:opacity-70 disabled:opacity-20"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSeg(seg.id, 1)}
                    disabled={i === s.segments.length - 1}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-[11px] transition-all hover:opacity-70 disabled:opacity-20"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => dupSeg(seg.id)}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] transition-all hover:opacity-70"
                    style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                    title="Duplicate"
                  >
                    copy
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSeg(seg.id)}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] transition-all hover:opacity-70"
                    style={{ color: '#C06040', fontFamily: 'var(--font-serif)' }}
                    title="Delete"
                  >
                    del
                  </button>
                </div>
              </div>

              {/* Chord field */}
              <input
                value={seg.chords}
                onChange={(e) => updateSeg(seg.id, { chords: e.target.value })}
                placeholder="Chord progression — Am G F E…"
                className="w-full bg-transparent text-[12px] outline-none"
                style={{
                  color: '#7A5438',
                  borderBottom: `1px solid ${color}25`,
                  fontFamily: 'var(--font-serif)',
                  paddingBottom: 3,
                }}
              />

              {/* Lyrics / notes */}
              <textarea
                value={seg.text}
                onChange={(e) => updateSeg(seg.id, { text: e.target.value })}
                placeholder="Lyrics or playing notes…"
                rows={4}
                className="w-full resize-y bg-transparent text-[13px] outline-none leading-relaxed"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-serif)',
                  minHeight: 72,
                }}
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={addSegment}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[12px] uppercase tracking-[0.1em] transition-all hover:opacity-80"
          style={{
            background: '#C4A06010',
            border: '1px dashed #C4A06040',
            color: '#C4A060',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
          }}
        >
          + Add Segment
        </button>
      </div>
    </div>
  );
}

/* ─── Song list ──────────────────────────────────────────── */

type SongMode = { kind: 'list' } | { kind: 'view'; id: string } | { kind: 'edit'; id: string };

export default function SongStudio({
  onShowRecordings,
}: {
  onShowRecordings?: (songId: string) => void;
}) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [mode, setMode] = useState<SongMode>({ kind: 'list' });
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    setSongs(loadSongs());
  }, []);

  function persist(next: Song[]) {
    setSongs(next);
    saveSongs(next);
  }

  function createSong() {
    const title = newTitle.trim() || 'Untitled';
    const song: Song = {
      id: uid(),
      title,
      key: '',
      tempo: 120,
      genre: '',
      status: 'wip',
      segments: [],
      createdAt: new Date().toISOString(),
    };
    const next = [song, ...songs];
    persist(next);
    setNewTitle('');
    setMode({ kind: 'edit', id: song.id });
  }

  function saveSong(updated: Song) {
    persist(songs.map((s) => (s.id === updated.id ? updated : s)));
    setMode({ kind: 'view', id: updated.id });
  }

  function deleteSong(id: string) {
    persist(songs.filter((s) => s.id !== id));
    setMode({ kind: 'list' });
  }

  if (mode.kind === 'view') {
    const song = songs.find((s) => s.id === mode.id);
    if (song) {
      return (
        <SongView
          song={song}
          onEdit={() => setMode({ kind: 'edit', id: song.id })}
          onBack={() => setMode({ kind: 'list' })}
          onShowRecordings={(songId) => onShowRecordings?.(songId)}
        />
      );
    }
  }

  if (mode.kind === 'edit') {
    const song = songs.find((s) => s.id === mode.id);
    if (song) {
      return (
        <SongEditor
          song={song}
          onSave={saveSong}
          onBack={() => setMode({ kind: 'view', id: song.id })}
        />
      );
    }
  }

  return (
    <div className="space-y-5">
      {/* New song input */}
      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createSong()}
          placeholder="New song title…"
          className="flex-1 rounded-xl bg-transparent px-4 py-2 text-[14px] outline-none"
          style={{ border: '1px solid #C4A06030', color: 'var(--foreground)' }}
        />
        <button
          type="button"
          onClick={createSong}
          className="cursor-pointer rounded-xl px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-80"
          style={{ background: '#C4A060', color: '#fff' }}
        >
          Add
        </button>
      </div>

      {/* Song list */}
      {songs.length === 0 ? (
        <p
          className="py-8 text-center text-[13px]"
          style={{
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
          }}
        >
          No songs yet — add your first one above
        </p>
      ) : (
        <div className="space-y-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className="flex cursor-pointer flex-col gap-1 rounded-xl px-4 py-3 transition-all hover:opacity-80"
              style={{ background: '#C4A06010', border: '1px solid #C4A06020' }}
              onClick={() => setMode({ kind: 'view', id: song.id })}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[17px] font-bold flex-1 min-w-0 truncate"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}
                >
                  {song.title}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] shrink-0"
                  style={{
                    background: `${statusColor(song.status)}20`,
                    color: statusColor(song.status),
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                  }}
                >
                  {song.status}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSong(song.id);
                  }}
                  className="shrink-0 cursor-pointer text-[11px] uppercase tracking-[0.08em] transition-all hover:opacity-70"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                >
                  del
                </button>
              </div>
              <p
                className="text-[11px]"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                {[song.key && `Key: ${song.key}`, song.genre, song.tempo ? `${song.tempo} bpm` : '']
                  .filter(Boolean)
                  .join(' · ')}
                {song.segments.length > 0 &&
                  ` · ${song.segments.length} segment${song.segments.length > 1 ? 's' : ''}`}
              </p>
              {/* Flow strip */}
              <SongFlowStrip segments={song.segments} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
