'use client';

import { useEffect, useState } from 'react';

/*
 * QuietNotes — Layer 6 of the Overview vision. Surfaces a
 * randomly-rotated fragment from the user's notebook + check-in
 * notes — quietly resurrecting forgotten thoughts. The "Memory"
 * layer.
 *
 * One short fragment, attributed by relative time. Tap → would
 * open that note in Notebook (followup wire-up). For now it just
 * shows the fragment and the date.
 *
 * Returns null until the user has at least 3 notes / check-in
 * notes (anything earlier is too small a sample to feel
 * meaningful).
 *
 * Spec: docs/specs/overview-vision-progression-patterns-beauty.md
 */

const LS_NOTEBOOK = 'colourmap:notebook-entries';
const LS_CHECKINS = 'colourmap:check-ins';

interface NotebookEntry {
  id: string;
  title?: string;
  content?: string | null;
  createdAt?: string;
}

interface CheckIn {
  id: string;
  date?: string;
  note?: string;
}

interface Fragment {
  text: string;
  source: 'notebook' | 'check-in';
  whenLabel: string;
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function relativeWhen(iso: string): string {
  if (!iso) return 'a while ago';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'a while ago';
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 1) return 'today';
  if (diffDays < 2) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
  return `${Math.round(diffDays / 365)} year${diffDays >= 730 ? 's' : ''} ago`;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickFragment(): Fragment | null {
  const notebook = loadJSON<NotebookEntry[]>(LS_NOTEBOOK, []);
  const checkins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
  const candidates: Fragment[] = [];

  for (const entry of notebook) {
    const content = entry.content ? stripHtml(entry.content) : '';
    if (content.length < 20) continue;
    candidates.push({
      text: content.length > 140 ? `${content.slice(0, 137)}…` : content,
      source: 'notebook',
      whenLabel: entry.createdAt ? relativeWhen(entry.createdAt) : 'a while ago',
    });
  }
  for (const c of checkins) {
    if (!c.note || c.note.length < 20) continue;
    candidates.push({
      text: c.note.length > 140 ? `${c.note.slice(0, 137)}…` : c.note,
      source: 'check-in',
      whenLabel: c.date ? relativeWhen(c.date) : 'a while ago',
    });
  }

  if (candidates.length < 3) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function QuietNotes() {
  const [fragment, setFragment] = useState<Fragment | null>(null);

  useEffect(() => {
    setFragment(pickFragment());
  }, []);

  if (!fragment) return null;

  return (
    <div
      className="rounded-xl"
      style={{
        background: '#9B6BA00C',
        border: '1px solid #9B6BA022',
        padding: '14px 18px',
      }}
    >
      <p
        className="mb-2 uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#9B6BA0',
          opacity: 0.75,
        }}
      >
        a quiet note
      </p>
      <p
        className="italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 14,
          color: '#5C3018',
          lineHeight: 1.5,
          letterSpacing: '0.02em',
        }}
      >
        “{fragment.text}”
      </p>
      <p
        className="mt-2 text-right"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          color: '#8A6A4A',
          opacity: 0.6,
        }}
      >
        — {fragment.source === 'notebook' ? 'a notebook entry' : 'a check-in'} ·{' '}
        <span style={{ fontStyle: 'italic' }}>{fragment.whenLabel}</span>
      </p>
    </div>
  );
}
