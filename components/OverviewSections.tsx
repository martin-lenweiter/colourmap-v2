'use client';

import { useEffect, useState } from 'react';
import CategoryTagPicker from '@/components/CategoryTagPicker';
import type { LifeCategory, LogEntry } from '@/components/LifeCategories';

/* ═══════════════════════════════════════════════════════════
   OVERVIEW SECTIONS — write-surface + attention audit.

   Two textareas at the top (one flowing, one stuck) — user writes
   a cross-category reflection, optionally tags it with a life
   category or a compass axis via CategoryTagPicker. Entries
   accumulate in a scrolling list below each write area.

   At the bottom: the attention check — categories whose latest
   logbook entry is 14+ days old (or never written). Read-only
   — it's signalling avoidance, not inviting capture.

   Pre-AI. The AI version will later summarise these freeform
   writings + categories into the synthesis described in
   docs/specs/ai-evolution.md.
   ═══════════════════════════════════════════════════════════ */

const CATS_KEY = 'colourmap:life-categories';
const LOG_KEY = 'colourmap:life-logs';
const OVERVIEW_NOTES_KEY = 'colourmap:overview-notes';
const ATTENTION_THRESHOLD_DAYS = 14;

// Static compass axes offered as tag options alongside user's LifeCategories
const COMPASS_AXES = [
  { name: 'Care', color: '#D4805A', group: 'Caring' },
  { name: 'Attitude', color: '#C4A070', group: 'Caring' },
  { name: 'Rest', color: '#C4906A', group: 'Caring' },
  { name: 'Emotions', color: '#B07A5A', group: 'Caring' },
  { name: 'Clarity', color: '#7AAA58', group: 'Doing' },
  { name: 'Target', color: '#7A9A7A', group: 'Doing' },
  { name: 'Resources', color: '#8AB0A0', group: 'Doing' },
  { name: 'Action', color: '#9AB090', group: 'Doing' },
  { name: 'Voice', color: '#6B7F4E', group: 'Sharing' },
  { name: 'Listen', color: '#8CA46E', group: 'Sharing' },
  { name: 'Bond', color: '#7B9560', group: 'Sharing' },
  { name: 'Boundary', color: '#5F7447', group: 'Sharing' },
];

interface OverviewNote {
  id: string;
  kind: 'flowing' | 'stuck';
  text: string;
  tag?: { name: string; color: string; categoryId?: string };
  createdAt: string;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function loadArr<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function OverviewSections() {
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notes, setNotes] = useState<OverviewNote[]>([]);

  // Drafts + per-draft tag pick
  const [flowingDraft, setFlowingDraft] = useState('');
  const [stuckDraft, setStuckDraft] = useState('');
  const [flowingTag, setFlowingTag] = useState<{
    name: string;
    color: string;
    categoryId?: string;
  } | null>(null);
  const [stuckTag, setStuckTag] = useState<{
    name: string;
    color: string;
    categoryId?: string;
  } | null>(null);
  const [showFlowingPicker, setShowFlowingPicker] = useState(false);
  const [showStuckPicker, setShowStuckPicker] = useState(false);

  useEffect(() => {
    const reload = () => {
      setCategories(loadArr<LifeCategory>(CATS_KEY));
      setLogs(loadArr<LogEntry>(LOG_KEY));
      setNotes(loadArr<OverviewNote>(OVERVIEW_NOTES_KEY));
    };
    reload();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CATS_KEY || e.key === LOG_KEY || e.key === OVERVIEW_NOTES_KEY) reload();
    };
    window.addEventListener('storage', onStorage);
    const interval = window.setInterval(reload, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, []);

  const saveNote = (kind: 'flowing' | 'stuck') => {
    const draft = kind === 'flowing' ? flowingDraft.trim() : stuckDraft.trim();
    if (!draft) return;
    const tag = kind === 'flowing' ? flowingTag : stuckTag;
    const createdAt = new Date().toISOString();

    const entry: OverviewNote = {
      id: crypto.randomUUID(),
      kind,
      text: draft,
      ...(tag && {
        tag: tag.categoryId
          ? { name: tag.name, color: tag.color, categoryId: tag.categoryId }
          : { name: tag.name, color: tag.color },
      }),
      createdAt,
    };
    const nextNotes = [entry, ...notes];
    setNotes(nextNotes);
    try {
      localStorage.setItem(OVERVIEW_NOTES_KEY, JSON.stringify(nextNotes));
    } catch {
      /* silent */
    }

    // If tagged with a LifeCategory, mirror into that category's logbook
    // so the entry shows up inside LifeCategories as a Challenge / Flow
    // compartment entry. Compass-axis tags don't mirror (no categoryId).
    if (tag?.categoryId) {
      const mirroredLog: LogEntry = {
        id: crypto.randomUUID(),
        categoryId: tag.categoryId,
        text: draft,
        createdAt,
        kind,
      };
      const nextLogs = [mirroredLog, ...logs];
      setLogs(nextLogs);
      try {
        localStorage.setItem(LOG_KEY, JSON.stringify(nextLogs));
      } catch {
        /* silent */
      }
    }

    if (kind === 'flowing') {
      setFlowingDraft('');
      setFlowingTag(null);
    } else {
      setStuckDraft('');
      setStuckTag(null);
    }
  };

  const deleteNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    try {
      localStorage.setItem(OVERVIEW_NOTES_KEY, JSON.stringify(next));
    } catch {
      /* silent */
    }
  };

  // Attention check: categories with no log in 14+ days (or never)
  const now = new Date();
  const neglected = categories
    .map((cat) => {
      const catLogs = logs
        .filter((l) => l.categoryId === cat.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const lastLog = catLogs[0] ?? null;
      const daysSince = lastLog ? daysBetween(now, new Date(lastLog.createdAt)) : Infinity;
      return { cat, daysSince };
    })
    .filter((m) => m.daysSince >= ATTENTION_THRESHOLD_DAYS);

  const flowingNotes = notes.filter((n) => n.kind === 'flowing');
  const stuckNotes = notes.filter((n) => n.kind === 'stuck');

  return (
    <div
      className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
        boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <p
          className="text-center font-semibold uppercase"
          style={{ color: '#C4A060', fontSize: '12px', letterSpacing: '0.22em' }}
        >
          Overview
        </p>
        <p
          className="text-center italic"
          style={{
            color: '#8A6A4A',
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            opacity: 0.85,
          }}
        >
          what is flowing, what is stuck, what has gone quiet
        </p>
      </div>

      {/* Flowing write area */}
      <WriteSection
        title="What is flowing"
        accent="#7AAA58"
        placeholder="what is moving, nourishing you, working..."
        draft={flowingDraft}
        setDraft={setFlowingDraft}
        onSave={() => saveNote('flowing')}
        tag={flowingTag}
        setTag={setFlowingTag}
        pickerOpen={showFlowingPicker}
        togglePicker={() => setShowFlowingPicker((o) => !o)}
        closePicker={() => setShowFlowingPicker(false)}
        categories={categories}
        compassAxes={COMPASS_AXES}
        entries={flowingNotes}
        onDelete={deleteNote}
      />

      {/* Stuck write area */}
      <WriteSection
        title="What is stuck"
        accent="#A05A40"
        placeholder="what is blocking you, heavy, not moving..."
        draft={stuckDraft}
        setDraft={setStuckDraft}
        onSave={() => saveNote('stuck')}
        tag={stuckTag}
        setTag={setStuckTag}
        pickerOpen={showStuckPicker}
        togglePicker={() => setShowStuckPicker((o) => !o)}
        closePicker={() => setShowStuckPicker(false)}
        categories={categories}
        compassAxes={COMPASS_AXES}
        entries={stuckNotes}
        onDelete={deleteNote}
      />

      {/* Attention check */}
      {neglected.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <p
              className="font-semibold uppercase"
              style={{
                color: '#8A6A4A',
                fontSize: '13px',
                letterSpacing: '0.18em',
                opacity: 0.8,
              }}
            >
              Attention check
            </p>
            <span
              className="italic"
              style={{
                color: '#8A6A4A',
                fontSize: '12px',
                fontFamily: 'var(--font-serif)',
                opacity: 0.7,
              }}
            >
              · no entry for {ATTENTION_THRESHOLD_DAYS}+ days
            </span>
          </div>
          <ul className="space-y-1.5">
            {neglected.map(({ cat, daysSince }) => (
              <li key={cat.id} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: cat.color, opacity: 0.55 }}
                />
                <span
                  className="flex-1"
                  style={{
                    color: '#5C3018',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '13px',
                    fontWeight: 600,
                    opacity: 0.85,
                  }}
                >
                  {cat.name}
                </span>
                <span
                  className="italic"
                  style={{
                    color: '#8A6A4A',
                    fontSize: '12px',
                    fontFamily: 'var(--font-serif)',
                    opacity: 0.7,
                  }}
                >
                  {daysSince === Infinity ? 'no entries' : `${daysSince}d ago`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface WriteSectionProps {
  title: string;
  accent: string;
  placeholder: string;
  draft: string;
  setDraft: (v: string) => void;
  onSave: () => void;
  tag: { name: string; color: string; categoryId?: string } | null;
  setTag: (v: { name: string; color: string; categoryId?: string } | null) => void;
  pickerOpen: boolean;
  togglePicker: () => void;
  closePicker: () => void;
  categories: LifeCategory[];
  compassAxes: { name: string; color: string; group: string }[];
  entries: OverviewNote[];
  onDelete: (id: string) => void;
}

function WriteSection({
  title,
  accent,
  placeholder,
  draft,
  setDraft,
  onSave,
  tag,
  setTag,
  pickerOpen,
  togglePicker,
  closePicker,
  categories,
  compassAxes,
  entries,
  onDelete,
}: WriteSectionProps) {
  return (
    <div>
      <p
        className="mb-2 font-semibold uppercase"
        style={{
          color: accent,
          fontSize: '13px',
          letterSpacing: '0.18em',
        }}
      >
        {title}
      </p>
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSave();
            }
          }}
          placeholder={placeholder}
          rows={2}
          className="flex-1 resize-none border-b bg-transparent pb-1 outline-none placeholder:opacity-50"
          style={{
            color: '#5C3018',
            borderColor: `${accent}30`,
            fontFamily: 'var(--font-handwritten)',
            fontSize: '16px',
            lineHeight: 1.5,
          }}
        />
        <CategoryTagPicker
          value={tag}
          onChange={setTag}
          open={pickerOpen}
          onToggle={togglePicker}
          onClose={closePicker}
          lifeCategories={categories}
          compassAxes={compassAxes}
        />
      </div>

      {entries.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {entries.slice(0, 20).map((note) => {
            const d = new Date(note.createdAt);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            return (
              <li key={note.id} className="group flex items-start gap-2.5">
                <span
                  className="shrink-0"
                  style={{
                    color: '#8A6A4A',
                    opacity: 0.75,
                    fontSize: '12px',
                    lineHeight: '1.5',
                    paddingTop: '4px',
                  }}
                >
                  {dateStr}
                </span>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: accent, opacity: 0.7, marginTop: '8px' }}
                />
                <div className="flex-1">
                  <span
                    style={{
                      color: '#5C3018',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '16px',
                      lineHeight: 1.5,
                    }}
                  >
                    {note.text}
                  </span>
                  {note.tag && (
                    <span
                      className="ml-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 align-baseline"
                      style={{
                        background: `${note.tag.color}15`,
                        border: `1px solid ${note.tag.color}40`,
                        fontSize: '10px',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 600,
                        color: note.tag.color,
                        letterSpacing: '0.02em',
                      }}
                    >
                      <span
                        className="rotate-45"
                        style={{
                          display: 'block',
                          width: 5,
                          height: 5,
                          background: note.tag.color,
                          borderRadius: 1,
                        }}
                      />
                      {note.tag.name}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="cursor-pointer shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
                  style={{
                    color: '#8A6A4A',
                    fontSize: '12px',
                    background: 'none',
                    border: 'none',
                    paddingTop: '4px',
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
