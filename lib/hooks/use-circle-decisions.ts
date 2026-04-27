'use client';

import { useCallback, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   useCircleDecisions — Supabase-backed proposals + voting log.

   Hydrates instantly from a localStorage cache (so the band's
   prior decisions show up offline / on first paint), then
   reconciles with the server on mount and after every mutation.

   Mutations are optimistic: state updates immediately, the API
   call goes out in the background, and we refresh from the server
   on failure.
   ═══════════════════════════════════════════════════════════ */

export interface DecisionVote {
  id: string;
  decisionId: string;
  memberId: string;
  memberName: string;
  value: 'yes' | 'no' | 'unsure';
  createdAt: string;
}

export interface Decision {
  id: string;
  circleId: string;
  title: string;
  description: string | null;
  status: 'proposed' | 'decided' | 'archived';
  decision: 'yes' | 'no' | null;
  decidedAt: string | null;
  createdBy: string;
  createdAt: string;
  votes: DecisionVote[];
}

const cacheKey = (circleId: string) => `colourmap:circle-decisions:${circleId}`;

function loadCache(circleId: string): Decision[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(cacheKey(circleId));
    return raw ? (JSON.parse(raw) as Decision[]) : [];
  } catch {
    return [];
  }
}

function saveCache(circleId: string, decisions: Decision[]) {
  try {
    localStorage.setItem(cacheKey(circleId), JSON.stringify(decisions));
  } catch {
    /* silent */
  }
}

export function useCircleDecisions(circleId: string, meName: string) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  const persistAndSet = useCallback(
    (next: Decision[] | ((prev: Decision[]) => Decision[])) => {
      setDecisions((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        saveCache(circleId, value);
        return value;
      });
    },
    [circleId],
  );

  const refresh = useCallback(async () => {
    if (!circleId) return;
    try {
      const res = await fetch(`/api/circles/${circleId}/decisions`);
      if (res.ok) {
        const data = (await res.json()) as Decision[];
        persistAndSet(data);
      }
    } catch {
      /* silent — keep cache */
    } finally {
      setLoading(false);
    }
  }, [circleId, persistAndSet]);

  useEffect(() => {
    if (!circleId) {
      setLoading(false);
      return;
    }
    setDecisions(loadCache(circleId));
    refresh();
  }, [circleId, refresh]);

  const propose = useCallback(
    async (title: string, description?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      try {
        const res = await fetch(`/api/circles/${circleId}/decisions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmed, description: description?.trim() }),
        });
        if (res.ok) {
          const created = (await res.json()) as Decision;
          persistAndSet((prev) => [created, ...prev]);
        }
      } catch {
        /* silent */
      }
    },
    [circleId, persistAndSet],
  );

  const castVote = useCallback(
    async (decisionId: string, value: 'yes' | 'no' | 'unsure', meId: string) => {
      // Optimistic: replace any prior vote from this member
      const previous = decisions;
      persistAndSet((prev) =>
        prev.map((d) => {
          if (d.id !== decisionId) return d;
          const others = d.votes.filter((v) => v.memberId !== meId);
          const optimistic: DecisionVote = {
            id: `optimistic-${meId}-${decisionId}`,
            decisionId,
            memberId: meId,
            memberName: meName,
            value,
            createdAt: new Date().toISOString(),
          };
          return { ...d, votes: [...others, optimistic] };
        }),
      );
      try {
        const res = await fetch(`/api/circles/${circleId}/decisions/${decisionId}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value, memberName: meName }),
        });
        if (!res.ok) throw new Error('vote failed');
        await refresh();
      } catch {
        persistAndSet(previous);
      }
    },
    [circleId, decisions, meName, persistAndSet, refresh],
  );

  const decide = useCallback(
    async (decisionId: string, value: 'yes' | 'no') => {
      const previous = decisions;
      const decidedAt = new Date().toISOString();
      persistAndSet((prev) =>
        prev.map((d) =>
          d.id === decisionId ? { ...d, status: 'decided', decision: value, decidedAt } : d,
        ),
      );
      try {
        const res = await fetch(`/api/circles/${circleId}/decisions/${decisionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'decide', decision: value }),
        });
        if (!res.ok) throw new Error('decide failed');
      } catch {
        persistAndSet(previous);
      }
    },
    [circleId, decisions, persistAndSet],
  );

  const archive = useCallback(
    async (decisionId: string) => {
      const previous = decisions;
      persistAndSet((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, status: 'archived' } : d)),
      );
      try {
        const res = await fetch(`/api/circles/${circleId}/decisions/${decisionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'archive' }),
        });
        if (!res.ok) throw new Error('archive failed');
      } catch {
        persistAndSet(previous);
      }
    },
    [circleId, decisions, persistAndSet],
  );

  const remove = useCallback(
    async (decisionId: string) => {
      const previous = decisions;
      persistAndSet((prev) => prev.filter((d) => d.id !== decisionId));
      try {
        const res = await fetch(`/api/circles/${circleId}/decisions/${decisionId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('remove failed');
      } catch {
        persistAndSet(previous);
      }
    },
    [circleId, decisions, persistAndSet],
  );

  return { decisions, loading, propose, castVote, decide, archive, remove, refresh };
}
