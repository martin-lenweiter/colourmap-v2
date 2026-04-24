'use client';

import { useEffect, useState } from 'react';

/*
 * CheckInPing — soft banner nudging the user to check in if the last
 * entry was more than a day or two ago. Dismissable for the day; will
 * reappear the next day if still no check-in.
 *
 * Appears at the top of the Day page only when:
 *   1. No check-ins stored at all, OR
 *   2. Most recent check-in was > PING_THRESHOLD_DAYS days ago
 *
 * Does not appear when:
 *   - User dismissed it today (colourmap:checkin-ping-dismissed)
 *   - User checked in today
 *
 * Retention feature, not a blocker — the X dismisses it, and it's
 * styled as gentle muted text, not a red alert.
 */

const PING_THRESHOLD_DAYS = 2;
const LS_CHECKINS = 'colourmap:check-ins';
const LS_DISMISSED = 'colourmap:checkin-ping-dismissed';

interface CheckInEntry {
  date: string;
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function shouldShowPing(): {
  show: boolean;
  message: string;
} {
  let checkIns: CheckInEntry[] = [];
  try {
    checkIns = JSON.parse(localStorage.getItem(LS_CHECKINS) ?? '[]');
  } catch {
    return { show: false, message: '' };
  }

  if (!Array.isArray(checkIns) || checkIns.length === 0) {
    return { show: true, message: 'New here? Try a one-minute check-in to start your map.' };
  }

  const mostRecent = checkIns[0];
  if (!mostRecent?.date) return { show: false, message: '' };

  const d = daysSince(mostRecent.date);
  if (d < 1) return { show: false, message: '' };
  if (d >= PING_THRESHOLD_DAYS) {
    const days = Math.floor(d);
    return {
      show: true,
      message: `Last check-in was ${days} day${days === 1 ? '' : 's'} ago. Two minutes?`,
    };
  }
  return { show: false, message: '' };
}

export default function CheckInPing() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_DISMISSED) === today()) return;
    } catch {
      return;
    }
    const { show, message: msg } = shouldShowPing();
    if (show) {
      setVisible(true);
      setMessage(msg);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(LS_DISMISSED, today());
    } catch {
      /* silent */
    }
  }

  if (!visible) return null;

  return (
    <div
      role="note"
      className="mx-auto max-w-md rounded-2xl border border-border bg-muted/50 px-4 py-3 text-center"
      style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 14,
        color: '#7A5438',
        lineHeight: 1.45,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'space-between',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss check-in reminder"
        className="cursor-pointer transition-opacity hover:opacity-100"
        style={{
          background: 'none',
          border: 'none',
          color: '#8A6A4A',
          opacity: 0.55,
          fontSize: 18,
          lineHeight: 1,
          padding: '2px 6px',
        }}
      >
        ×
      </button>
    </div>
  );
}
