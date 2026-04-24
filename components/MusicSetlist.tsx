'use client';

import { useEffect, useState } from 'react';

/*
 * Music Setlist — a project notebook for a songwriter.
 *
 * Two categories: Work in progress, Finished. Tap a song to open its
 * editor. Each song has a list of named blocks (Verse 1, Chorus, Bridge,
 * ...) that stack vertically as independent text areas so the shape of
 * the song is legible at a glance.
 *
 * Persistence is localStorage-only for v1 — `colourmap:music-setlist`.
 * Server sync can come later when the broader Projects system lands.
 */

const LS_KEY = 'colourmap:music-setlist';

type Status = 'wip' | 'finished';

type BlockType = 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'outro' | 'intro' | 'note';
const BLOCK_TYPES: { id: BlockType; label: string; color: string }[] = [
  { id: 'verse', label: 'Verse', color: '#6890B0' },
  { id: 'chorus', label: 'Chorus', color: '#B33A2B' },
  { id: 'pre-chorus', label: 'Pre-chorus', color: '#C4A060' },
  { id: 'bridge', label: 'Bridge', color: '#9B6BA0' },
  { id: 'intro', label: 'Intro', color: '#7AAA58' },
  { id: 'outro', label: 'Outro', color: '#8A6A4A' },
  { id: 'note', label: 'Note', color: '#A0907A' },
];

interface SongBlock {
  id: string;
  type: BlockType;
  text: string;
}

interface Song {
  id: string;
  title: string;
  status: Status;
  blocks: SongBlock[];
  updatedAt: string;
  createdAt: string;
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

function saveSongs(songs: Song[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(songs));
  } catch {
    /* quota or unavailable — silent */
  }
}

export default function MusicSetlist() {
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
    const title = newTitle.trim();
    if (!title) return;
    const song: Song = {
      id: crypto.randomUUID(),
      title,
      status: 'wip',
      blocks: [
        { id: crypto.randomUUID(), type: 'verse', text: '' },
        { id: crypto.randomUUID(), type: 'chorus', text: '' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persist([song, ...songs]);
    setNewTitle('');
    setOpenId(song.id);
  }

  function updateSong(id: string, updater: (s: Song) => Song) {
    persist(
      songs.map((s) => (s.id === id ? { ...updater(s), updatedAt: new Date().toISOString() } : s)),
    );
  }

  function deleteSong(id: string) {
    persist(songs.filter((s) => s.id !== id));
    if (openId === id) setOpenId(null);
  }

  function toggleStatus(id: string) {
    updateSong(id, (s) => ({ ...s, status: s.status === 'wip' ? 'finished' : 'wip' }));
  }

  function addBlock(id: string, type: BlockType) {
    updateSong(id, (s) => ({
      ...s,
      blocks: [...s.blocks, { id: crypto.randomUUID(), type, text: '' }],
    }));
  }

  function updateBlock(songId: string, blockId: string, text: string) {
    updateSong(songId, (s) => ({
      ...s,
      blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)),
    }));
  }

  function deleteBlock(songId: string, blockId: string) {
    updateSong(songId, (s) => ({
      ...s,
      blocks: s.blocks.filter((b) => b.id !== blockId),
    }));
  }

  function renameSong(id: string, title: string) {
    updateSong(id, (s) => ({ ...s, title }));
  }

  const openSong = openId ? songs.find((s) => s.id === openId) : null;
  const wip = songs.filter((s) => s.status === 'wip');
  const finished = songs.filter((s) => s.status === 'finished');

  if (openSong) {
    return (
      <SongEditor
        song={openSong}
        blockTypes={BLOCK_TYPES}
        onClose={() => setOpenId(null)}
        onRename={(t) => renameSong(openSong.id, t)}
        onToggleStatus={() => toggleStatus(openSong.id)}
        onAddBlock={(t) => addBlock(openSong.id, t)}
        onUpdateBlock={(bid, t) => updateBlock(openSong.id, bid, t)}
        onDeleteBlock={(bid) => deleteBlock(openSong.id, bid)}
        onDelete={() => deleteSong(openSong.id)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <header className="text-center">
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 24,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5C3018',
          }}
        >
          Songs
        </p>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            color: '#8A6A4A',
            opacity: 0.75,
            marginTop: 4,
          }}
        >
          your setlist — verses, choruses, and what's moving forward
        </p>
      </header>

      {/* New song input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') createSong();
          }}
          placeholder="New song title…"
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 16, minHeight: 48 }}
          aria-label="New song title"
        />
        <button
          type="button"
          onClick={createSong}
          disabled={!newTitle.trim()}
          className="cursor-pointer rounded-xl px-5 transition-opacity disabled:opacity-40"
          style={{
            background: '#B33A2B',
            color: '#F5E8C8',
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            fontWeight: 600,
            minHeight: 48,
            border: 'none',
          }}
        >
          add
        </button>
      </div>

      {songs.length === 0 && (
        <p
          className="text-center italic"
          style={{ color: '#8A6A4A', opacity: 0.65, fontSize: 15, fontFamily: 'var(--font-serif)' }}
        >
          No songs yet. Type a title above to start your first one.
        </p>
      )}

      <SongList
        title="Work in progress"
        songs={wip}
        onOpen={(id) => setOpenId(id)}
        onToggle={toggleStatus}
        accent="#B33A2B"
      />
      <SongList
        title="Finished"
        songs={finished}
        onOpen={(id) => setOpenId(id)}
        onToggle={toggleStatus}
        accent="#7AAA58"
      />
    </div>
  );
}

interface SongListProps {
  title: string;
  songs: Song[];
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  accent: string;
}

function SongList({ title, songs, onOpen, onToggle, accent }: SongListProps) {
  if (songs.length === 0) return null;
  return (
    <section>
      <h3
        className="uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 12,
          letterSpacing: '0.2em',
          color: accent,
          opacity: 0.8,
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      <ul className="space-y-2">
        {songs.map((s) => (
          <li key={s.id}>
            <div
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
              style={{ minHeight: 54 }}
            >
              <button
                type="button"
                onClick={() => onOpen(s.id)}
                className="flex-1 cursor-pointer text-left transition-opacity hover:opacity-80"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 17,
                  color: '#5C3018',
                }}
              >
                {s.title}
                <span style={{ color: '#8A6A4A', opacity: 0.55, marginLeft: 10, fontSize: 12 }}>
                  {s.blocks.length} block{s.blocks.length === 1 ? '' : 's'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggle(s.id)}
                className="cursor-pointer transition-opacity hover:opacity-70"
                style={{
                  background: 'none',
                  border: `1px solid ${accent}55`,
                  color: accent,
                  borderRadius: 10,
                  padding: '6px 10px',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-serif)',
                }}
                aria-label={
                  s.status === 'finished' ? 'Move back to work in progress' : 'Mark as finished'
                }
              >
                {s.status === 'finished' ? '↺ reopen' : '✓ done'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface SongEditorProps {
  song: Song;
  blockTypes: typeof BLOCK_TYPES;
  onClose: () => void;
  onRename: (title: string) => void;
  onToggleStatus: () => void;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockId: string, text: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDelete: () => void;
}

function SongEditor({
  song,
  blockTypes,
  onClose,
  onRename,
  onToggleStatus,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDelete,
}: SongEditorProps) {
  const [title, setTitle] = useState(song.title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer transition-opacity hover:opacity-70"
          style={{
            background: 'none',
            border: 'none',
            color: '#8A6A4A',
            fontSize: 14,
            fontFamily: 'var(--font-serif)',
          }}
        >
          ‹ setlist
        </button>
        <button
          type="button"
          onClick={onToggleStatus}
          className="ml-auto cursor-pointer transition-opacity hover:opacity-85"
          style={{
            background: song.status === 'finished' ? '#7AAA5820' : '#B33A2B20',
            border: `1px solid ${song.status === 'finished' ? '#7AAA5855' : '#B33A2B55'}`,
            color: song.status === 'finished' ? '#5A8A4A' : '#B33A2B',
            borderRadius: 12,
            padding: '6px 12px',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
          }}
        >
          {song.status === 'finished' ? 'finished' : 'work in progress'}
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          const t = title.trim();
          if (t && t !== song.title) onRename(t);
        }}
        className="w-full bg-transparent"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          fontWeight: 700,
          fontStyle: 'italic',
          color: '#5C3018',
          border: 'none',
          outline: 'none',
          padding: 0,
        }}
        aria-label="Song title"
      />

      {/* Blocks */}
      <div className="space-y-4">
        {song.blocks.map((b) => {
          const bt = blockTypes.find((t) => t.id === b.type) ?? blockTypes[0];
          return (
            <div
              key={b.id}
              className="rounded-2xl border bg-card p-4"
              style={{ borderColor: `${bt.color}40`, background: `${bt.color}08` }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span
                  className="uppercase"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: bt.color,
                    fontWeight: 700,
                  }}
                >
                  {bt.label}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteBlock(b.id)}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8A6A4A',
                    opacity: 0.5,
                    fontSize: 14,
                    padding: 4,
                  }}
                  aria-label={`Delete ${bt.label} block`}
                >
                  ×
                </button>
              </div>
              <textarea
                value={b.text}
                onChange={(e) => onUpdateBlock(b.id, e.target.value)}
                placeholder={`write your ${bt.label.toLowerCase()}…`}
                className="w-full bg-transparent resize-none"
                rows={Math.max(3, b.text.split('\n').length + 1)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: '#3a2418',
                  border: 'none',
                  outline: 'none',
                  padding: 0,
                }}
                aria-label={`${bt.label} lyrics`}
              />
            </div>
          );
        })}
      </div>

      {/* Add block */}
      <div>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            color: '#8A6A4A',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          add a block
        </p>
        <div className="flex flex-wrap gap-2">
          {blockTypes.map((bt) => (
            <button
              key={bt.id}
              type="button"
              onClick={() => onAddBlock(bt.id)}
              className="cursor-pointer rounded-full transition-opacity hover:opacity-85"
              style={{
                background: `${bt.color}12`,
                border: `1px solid ${bt.color}50`,
                color: bt.color,
                padding: '6px 12px',
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
              }}
            >
              + {bt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delete — double-tap confirmation */}
      <div className="pt-4">
        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, color: '#8A6A4A', fontFamily: 'var(--font-serif)' }}>
              really delete?
            </span>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setConfirmingDelete(false);
              }}
              className="cursor-pointer"
              style={{
                background: '#B33A2B',
                color: '#F5E8C8',
                border: 'none',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-serif)',
              }}
            >
              yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="cursor-pointer"
              style={{
                background: 'transparent',
                color: '#8A6A4A',
                border: '1px solid #8A6A4A30',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-serif)',
              }}
            >
              cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="cursor-pointer"
            style={{
              background: 'transparent',
              color: '#8A6A4A',
              opacity: 0.6,
              border: 'none',
              fontSize: 12,
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
            }}
          >
            delete song
          </button>
        )}
      </div>
    </div>
  );
}
