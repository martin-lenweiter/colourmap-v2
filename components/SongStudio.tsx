'use client';

import { useEffect, useState } from 'react';

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

function statusColor(s: SongStatus) {
  return s === 'ready' ? '#7AAA58' : s === 'rehearsed' ? '#C4A060' : '#A0907A';
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
          ← Back
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
            className="w-full bg-transparent text-[18px] font-semibold outline-none"
            style={{ color: 'var(--foreground)', borderBottom: '1px solid #C4A06030' }}
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
                  color: 'var(--foreground)',
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
                rows={3}
                className="w-full resize-none bg-transparent text-[13px] outline-none leading-relaxed"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}
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

export default function SongStudio() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
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
    setOpenId(song.id);
  }

  function saveSong(updated: Song) {
    persist(songs.map((s) => (s.id === updated.id ? updated : s)));
    setOpenId(null);
  }

  function deleteSong(id: string) {
    persist(songs.filter((s) => s.id !== id));
    if (openId === id) setOpenId(null);
  }

  const openSong = songs.find((s) => s.id === openId);

  if (openSong) {
    return <SongEditor song={openSong} onSave={saveSong} onBack={() => setOpenId(null)} />;
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
              className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80"
              style={{ background: '#C4A06010', border: '1px solid #C4A06020' }}
              onClick={() => setOpenId(song.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[14px] font-semibold truncate"
                    style={{ color: 'var(--foreground)' }}
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
                </div>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
                >
                  {[song.key, song.genre, song.tempo ? `${song.tempo} bpm` : '']
                    .filter(Boolean)
                    .join(' · ')}
                  {song.segments.length > 0 &&
                    ` · ${song.segments.length} segment${song.segments.length > 1 ? 's' : ''}`}
                </p>
              </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
