'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ═══════════════════════════════════════════════════════════
   MUSIC RECORDINGS — upload or record audio, link to songs,
   filter by category (Band / Solo / Demo / Live / Jam).
   ═══════════════════════════════════════════════════════════ */

const BUCKET = 'recordings';

export type RecordingCategory = 'band' | 'solo' | 'demo' | 'live' | 'jam';

interface Recording {
  id: string;
  title: string;
  storagePath: string;
  publicUrl: string;
  durationSecs: number | null;
  songId: string | null;
  category: string;
  notes: string | null;
  createdAt: string;
}

interface Song {
  id: string;
  title: string;
}

const CATEGORIES: { id: RecordingCategory | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: '#C4A060' },
  { id: 'band', label: 'Band', color: '#3A8AC4' },
  { id: 'solo', label: 'Solo', color: '#9B6BA0' },
  { id: 'demo', label: 'Demo', color: '#E0844A' },
  { id: 'live', label: 'Live', color: '#D4605A' },
  { id: 'jam', label: 'Jam', color: '#7A8A50' },
];

function formatDuration(secs: number | null) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function getCategoryColor(cat: string) {
  return CATEGORIES.find((c) => c.id === cat)?.color ?? '#C4A060';
}

export default function MusicRecordings({
  songs,
  initialSongId,
}: {
  songs: Song[];
  initialSongId?: string | null;
}) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RecordingCategory | 'all'>('all');
  const [filterSongId, setFilterSongId] = useState<string | null>(initialSongId ?? null);

  // Playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Inline recording
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Per-card options
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  // New recording form (shown after file chosen / rec stopped)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingCategory, setPendingCategory] = useState<RecordingCategory>('solo');
  const [pendingSongId, setPendingSongId] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);

  // ─── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(
          (data as Recording[]).map((r) => ({
            ...r,
            category: r.category ?? 'solo',
          })),
        );
      }
    } catch {
      /* silent — show empty list */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Audio player ─────────────────────────────────────────────────────────
  async function playPause(rec: Recording) {
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      // Private bucket — generate a 1-hour signed URL each time the user plays.
      const supabase = createClient();
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(rec.storagePath, 3600);
      if (!signed?.signedUrl) return;
      audioRef.current.src = signed.signedUrl;
      audioRef.current.play().catch(() => {});
      setPlayingId(rec.id);
    }
  }

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    function onTimeUpdate() {
      if (!audio.duration) return;
      setProgress(audio.currentTime / audio.duration);
    }
    function onEnded() {
      setPlayingId(null);
      setProgress(0);
    }
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // ─── File upload ──────────────────────────────────────────────────────────
  async function uploadBlob(blob: Blob, suggestedName: string, durSecs: number | null) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
    const ts = Date.now();
    const safe = suggestedName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    // Path scoped to userId — private bucket RLS enforces per-user isolation.
    const path = `${user.id}/${ts}-${safe}.${ext}`;

    const { error: storageErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || 'audio/webm',
      upsert: false,
    });

    if (storageErr) {
      throw new Error(storageErr.message);
    }

    return { path, durSecs };
  }

  async function commitUpload() {
    if (!pendingBlob) return;
    setUploading(true);
    setUploadError('');
    try {
      const { path, durSecs } = await uploadBlob(pendingBlob, pendingName, pendingDuration);
      const res = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pendingName || 'Untitled',
          storagePath: path,
          publicUrl: path, // private bucket — storagePath is the canonical ref; signed URLs generated on play
          durationSecs: durSecs,
          songId: pendingSongId,
          category: pendingCategory,
          notes: null,
        }),
      });
      if (res.ok) {
        const row = await res.json();
        setRecordings((prev) => [row, ...prev]);
      }
      setPendingBlob(null);
      setPendingName('');
      setPendingSongId(null);
      setPendingDuration(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploading(false);
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      setPendingDuration(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    });

    setPendingBlob(file);
    setPendingName(file.name.replace(/\.[^.]+$/, ''));
    setPendingCategory('solo');
    setPendingSongId(null);
  }

  // ─── Mic recording ────────────────────────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const date = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        setPendingBlob(blob);
        setPendingName(`Recording ${date}`);
        setPendingDuration(recSeconds);
        setPendingCategory('solo');
        setPendingSongId(null);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      setUploadError('Microphone access denied');
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function deleteRec(rec: Recording) {
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([rec.storagePath]);
    await fetch(`/api/recordings/${rec.id}`, { method: 'DELETE' });
    setRecordings((prev) => prev.filter((r) => r.id !== rec.id));
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
  }

  async function saveLink(rec: Recording, songId: string | null) {
    const res = await fetch(`/api/recordings/${rec.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecordings((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
    setLinkingId(null);
  }

  async function saveRename(rec: Recording) {
    if (!renameVal.trim()) {
      setRenamingId(null);
      return;
    }
    const res = await fetch(`/api/recordings/${rec.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: renameVal }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecordings((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
    setRenamingId(null);
  }

  // ─── Filtered list ────────────────────────────────────────────────────────
  const visible = recordings.filter((r) => {
    if (filter !== 'all' && r.category !== filter) return false;
    if (filterSongId && r.songId !== filterSongId) return false;
    return true;
  });

  const songMap = Object.fromEntries(songs.map((s) => [s.id, s.title]));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 px-1">
      {/* ── Top actions ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Record button */}
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-all"
            style={{ background: '#D4605A', minHeight: 40 }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: 8,
                height: 8,
                background: 'white',
                animation: 'pulse 1s infinite',
              }}
            />
            {formatDuration(recSeconds)} · stop
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={!!pendingBlob}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all disabled:opacity-40"
            style={{
              background: 'transparent',
              border: '1px solid #D4605A',
              color: '#D4605A',
              minHeight: 40,
            }}
          >
            ● Record
          </button>
        )}

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={recording || !!pendingBlob}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all disabled:opacity-40"
          style={{
            background: 'transparent',
            border: '1px solid rgba(160,110,40,0.3)',
            color: 'var(--muted-foreground)',
            minHeight: 40,
          }}
        >
          ↑ Upload file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={onFileChosen}
        />
      </div>

      {/* ── Pending upload form ── */}
      {pendingBlob && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            border: '1px solid rgba(160,110,40,0.2)',
            background: 'rgba(196,160,96,0.06)',
          }}
        >
          <p
            className="text-[11px] uppercase tracking-widest font-semibold"
            style={{ color: '#C4A060' }}
          >
            New recording
          </p>

          <input
            type="text"
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            placeholder="Title…"
            className="w-full rounded-xl border border-border/30 bg-background/50 px-3 py-2 text-[14px] outline-none"
          />

          {/* Category */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPendingCategory(c.id as RecordingCategory)}
                className="rounded-full px-3 py-1 text-[12px] font-medium transition-all"
                style={{
                  background: pendingCategory === c.id ? `${c.color}22` : 'transparent',
                  border: `1px solid ${pendingCategory === c.id ? c.color : `${c.color}40`}`,
                  color: c.color,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Link to song */}
          <select
            value={pendingSongId ?? ''}
            onChange={(e) => setPendingSongId(e.target.value || null)}
            className="w-full rounded-xl border border-border/30 bg-background/50 px-3 py-2 text-[13px] outline-none"
            style={{ color: 'var(--foreground)' }}
          >
            <option value="">No song linked</option>
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          {uploadError && (
            <p className="text-[12px]" style={{ color: '#D4605A' }}>
              {uploadError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={commitUpload}
              disabled={uploading}
              className="flex-1 rounded-xl py-2 text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: '#C4A060' }}
            >
              {uploading ? 'Uploading…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingBlob(null);
                setPendingName('');
                setUploadError('');
              }}
              className="rounded-xl px-4 py-2 text-[13px] transition-all"
              style={{ border: '1px solid rgba(160,110,40,0.2)', color: 'var(--muted-foreground)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Category filter ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id as RecordingCategory | 'all')}
              className="shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-all"
              style={{
                background: active ? `${c.color}18` : 'transparent',
                border: `1px solid ${active ? c.color : `${c.color}30`}`,
                color: active ? c.color : 'var(--muted-foreground)',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* ── Song filter ── */}
      {songs.length > 0 && (
        <select
          value={filterSongId ?? ''}
          onChange={(e) => setFilterSongId(e.target.value || null)}
          className="rounded-xl border border-border/30 bg-background/50 px-3 py-2 text-[12px] outline-none"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <option value="">All songs</option>
          {songs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      )}

      {/* ── Recordings list ── */}
      {loading ? (
        <p className="py-8 text-center text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
          Loading…
        </p>
      ) : visible.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-[28px]">🎙️</p>
          <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
            {recordings.length === 0 ? 'No recordings yet' : 'Nothing matches this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((rec) => {
            const isPlaying = playingId === rec.id;
            const color = getCategoryColor(rec.category);
            const songTitle = rec.songId ? songMap[rec.songId] : null;

            return (
              <div
                key={rec.id}
                className="rounded-2xl"
                style={{
                  border: `1px solid ${isPlaying ? color : 'rgba(160,110,40,0.15)'}`,
                  background: isPlaying ? `${color}08` : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Play button */}
                  <button
                    type="button"
                    onClick={() => playPause(rec)}
                    className="shrink-0 flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: 40,
                      height: 40,
                      background: `${color}22`,
                      color,
                      fontSize: 16,
                    }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '❚❚' : '▶'}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {renamingId === rec.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={() => saveRename(rec)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(rec);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="w-full rounded-lg border border-border/30 bg-background/50 px-2 py-0.5 text-[14px] font-medium outline-none"
                      />
                    ) : (
                      <p
                        className="truncate text-[14px] font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {rec.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="rounded-full px-2 py-0 text-[10px] font-semibold"
                        style={{ background: `${color}18`, color }}
                      >
                        {rec.category}
                      </span>
                      {songTitle && (
                        <span
                          className="truncate text-[11px]"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          ♪ {songTitle}
                        </span>
                      )}
                      <span
                        className="ml-auto shrink-0 text-[11px]"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {formatDuration(rec.durationSecs)}
                        {rec.durationSecs ? ' · ' : ''}
                        {formatDate(rec.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Options menu */}
                  <div className="shrink-0 relative">
                    <button
                      type="button"
                      onClick={() => setLinkingId((prev) => (prev === rec.id ? null : rec.id))}
                      className="rounded-full p-2 transition-all"
                      style={{ color: 'var(--muted-foreground)' }}
                      aria-label="Options"
                    >
                      ···
                    </button>
                    {linkingId === rec.id && (
                      <div
                        className="absolute right-0 top-full z-20 rounded-2xl p-3 space-y-2 shadow-lg min-w-[180px]"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid rgba(160,110,40,0.2)',
                        }}
                      >
                        {/* Link to song */}
                        <div className="space-y-1">
                          <p
                            className="text-[10px] uppercase tracking-widest font-semibold"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            Link to song
                          </p>
                          <select
                            defaultValue={rec.songId ?? ''}
                            onChange={(e) => saveLink(rec, e.target.value || null)}
                            className="w-full rounded-lg border border-border/30 bg-background/50 px-2 py-1.5 text-[12px] outline-none"
                          >
                            <option value="">None</option>
                            {songs.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rename */}
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(rec.id);
                            setRenameVal(rec.title);
                            setLinkingId(null);
                          }}
                          className="w-full text-left rounded-lg px-2 py-1.5 text-[12px] transition-all hover:bg-accent/30"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Rename
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            setLinkingId(null);
                            deleteRec(rec);
                          }}
                          className="w-full text-left rounded-lg px-2 py-1.5 text-[12px] transition-all hover:bg-accent/30"
                          style={{ color: '#D4605A' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar when playing */}
                {isPlaying && (
                  <div
                    className="mx-4 mb-3 rounded-full overflow-hidden cursor-pointer"
                    style={{ height: 3, background: `${color}20` }}
                    onClick={() => {
                      const audio = audioRef.current;
                      if (!audio) return;
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progress * 100}%`, background: color }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
