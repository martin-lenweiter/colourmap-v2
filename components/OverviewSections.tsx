'use client';

import { useEffect, useState } from 'react';
import type { LifeCategory, LogEntry } from '@/components/LifeCategories';

/* ═══════════════════════════════════════════════════════════
   OVERVIEW SECTIONS — the compressed three-answer surface.
   Reads categories + log entries from localStorage and sorts
   each category into one of three buckets:
     · What is flowing  → cat.state === 'flowing'
     · What is stuck    → cat.state === 'stuck'
     · Attention check  → no logbook entry in 14+ days (any state)
   Pre-AI. User classifies flowing/stuck manually via the pill
   next to each category in LifeCategories. The AI version will
   replace manual classification with inferred classification,
   with the same surface.
   ═══════════════════════════════════════════════════════════ */

const CATS_KEY = 'colourmap:life-categories';
const LOG_KEY = 'colourmap:life-logs';
const ATTENTION_THRESHOLD_DAYS = 14;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
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

  // Refresh from localStorage on mount + on storage events (so the component
  // stays in sync when the user edits categories / logs elsewhere on the page).
  useEffect(() => {
    const reload = () => {
      setCategories(loadArr<LifeCategory>(CATS_KEY));
      setLogs(loadArr<LogEntry>(LOG_KEY));
    };
    reload();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CATS_KEY || e.key === LOG_KEY) reload();
    };
    window.addEventListener('storage', onStorage);
    // Poll once per second so in-page edits to LifeCategories show up even
    // without a storage event (same tab doesn't fire the storage event).
    const interval = window.setInterval(reload, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(interval);
    };
  }, []);

  // Compute per-category "last entry" metadata.
  const now = new Date();
  const catMeta = categories.map((cat) => {
    const catLogs = logs
      .filter((l) => l.categoryId === cat.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const lastLog = catLogs[0] ?? null;
    const daysSince = lastLog ? daysBetween(now, new Date(lastLog.createdAt)) : Infinity;
    return { cat, lastLog, daysSince };
  });

  const flowing = catMeta.filter((m) => m.cat.state === 'flowing');
  const stuck = catMeta.filter((m) => m.cat.state === 'stuck');
  const neglected = catMeta.filter(
    (m) => m.daysSince >= ATTENTION_THRESHOLD_DAYS && m.cat.state !== 'flowing',
  );

  const nothingYet = categories.length === 0;

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
          what is stuck, what is flowing, what has gone quiet
        </p>
      </div>

      {nothingYet ? (
        <p
          className="text-center italic"
          style={{
            color: '#8A6A4A',
            fontFamily: 'var(--font-handwritten)',
            fontSize: '15px',
            opacity: 0.7,
          }}
        >
          Name some areas of your life below to see them mapped here.
        </p>
      ) : (
        <div className="space-y-5">
          <OverviewSection
            title="What is flowing"
            emptyText="Mark a category as flowing to see it here."
            items={flowing}
            accent="#7AAA58"
          />
          <OverviewSection
            title="What is stuck"
            emptyText="Mark a category as stuck to see it here."
            items={stuck}
            accent="#A05A40"
          />
          {neglected.length > 0 && (
            <OverviewSection
              title="Attention check"
              subtitle={`no entry for ${ATTENTION_THRESHOLD_DAYS}+ days`}
              emptyText=""
              items={neglected}
              accent="#8A6A4A"
              muted
            />
          )}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  emptyText: string;
  items: { cat: LifeCategory; lastLog: LogEntry | null; daysSince: number }[];
  accent: string;
  muted?: boolean;
}

function OverviewSection({ title, subtitle, emptyText, items, accent, muted }: SectionProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <p
          className="font-semibold uppercase"
          style={{
            color: accent,
            fontSize: '13px',
            letterSpacing: '0.18em',
            opacity: muted ? 0.75 : 1,
          }}
        >
          {title}
        </p>
        {subtitle && (
          <span
            className="italic"
            style={{
              color: '#8A6A4A',
              fontSize: '12px',
              fontFamily: 'var(--font-serif)',
              opacity: 0.7,
            }}
          >
            · {subtitle}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p
          className="italic"
          style={{
            color: '#8A6A4A',
            fontFamily: 'var(--font-serif)',
            fontSize: '13px',
            opacity: 0.55,
          }}
        >
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ cat, lastLog, daysSince }) => (
            <li key={cat.id} className="flex items-start gap-3">
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: cat.color, opacity: muted ? 0.55 : 1 }}
              />
              <div className="flex-1">
                <p
                  style={{
                    color: '#5C3018',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    opacity: muted ? 0.8 : 1,
                  }}
                >
                  {cat.name}
                  {lastLog && (
                    <span
                      className="ml-2 font-normal italic"
                      style={{
                        color: '#8A6A4A',
                        fontSize: '12px',
                        opacity: 0.65,
                      }}
                    >
                      · {daysSince === 0 ? 'today' : `${daysSince}d ago`}
                    </span>
                  )}
                </p>
                {lastLog ? (
                  <p
                    className="mt-0.5"
                    style={{
                      color: '#5C3018',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '15px',
                      lineHeight: 1.45,
                      opacity: muted ? 0.65 : 0.9,
                    }}
                  >
                    {truncate(lastLog.text, 120)}
                  </p>
                ) : (
                  <p
                    className="mt-0.5 italic"
                    style={{
                      color: '#8A6A4A',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '12px',
                      opacity: 0.55,
                    }}
                  >
                    no entries yet
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
