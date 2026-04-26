'use client';

import { useEffect, useState } from 'react';

/*
 * CircleDecisions — proposal + vote layer for the circle.
 * Each decision: title + description + per-member vote
 * (yes / no / unsure). Status = proposed → decided when a clear
 * majority emerges. Past decisions become an archived log so the
 * band's brain doesn't lose them.
 *
 * Per Martin (2026-04-26): item 4 from Circles evolution list.
 * V1 storage: localStorage keyed by circle id.
 */

const LS = 'colourmap:circle-decisions';

interface Vote {
  memberId: string;
  memberName: string;
  value: 'yes' | 'no' | 'unsure';
}

interface Decision {
  id: string;
  title: string;
  description: string;
  status: 'proposed' | 'decided' | 'archived';
  decision?: 'yes' | 'no';
  decidedAt?: string;
  createdBy: string;
  createdAt: string;
  votes: Vote[];
}

type Store = Record<string, Decision[]>;

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
    /* silent */
  }
}

export default function CircleDecisions({
  circleId,
  meId,
  meName,
  members,
}: {
  circleId: string;
  meId: string;
  meName: string;
  members: { id: string; name: string; color: string }[];
}) {
  const [store, setStore] = useState<Store>({});
  const [open, setOpen] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');

  useEffect(() => {
    setStore(load());
  }, []);

  const decisions = (store[circleId] ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function update(next: Store) {
    setStore(next);
    persist(next);
  }

  function add() {
    const t = titleInput.trim();
    if (!t) return;
    const dec: Decision = {
      id: crypto.randomUUID(),
      title: t,
      description: descInput.trim(),
      status: 'proposed',
      createdBy: meId,
      createdAt: new Date().toISOString(),
      votes: [],
    };
    update({ ...store, [circleId]: [dec, ...decisions] });
    setTitleInput('');
    setDescInput('');
  }

  function castVote(id: string, value: 'yes' | 'no' | 'unsure') {
    const next = decisions.map((d) => {
      if (d.id !== id) return d;
      const rest = d.votes.filter((v) => v.memberId !== meId);
      return { ...d, votes: [...rest, { memberId: meId, memberName: meName, value }] };
    });
    update({ ...store, [circleId]: next });
  }

  function decide(id: string, decision: 'yes' | 'no') {
    const next = decisions.map((d) =>
      d.id === id
        ? { ...d, status: 'decided' as const, decision, decidedAt: new Date().toISOString() }
        : d,
    );
    update({ ...store, [circleId]: next });
  }

  function archive(id: string) {
    const next = decisions.map((d) => (d.id === id ? { ...d, status: 'archived' as const } : d));
    update({ ...store, [circleId]: next });
  }

  function remove(id: string) {
    update({ ...store, [circleId]: decisions.filter((d) => d.id !== id) });
  }

  const proposed = decisions.filter((d) => d.status === 'proposed');
  const decided = decisions.filter((d) => d.status === 'decided');
  const archived = decisions.filter((d) => d.status === 'archived');

  return (
    <div
      className="rounded-2xl border"
      style={{ borderColor: '#9B6BA030', background: '#9B6BA008' }}
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
            color: '#9B6BA0',
          }}
        >
          decisions · {proposed.length} open · {decided.length} decided
        </span>
        <span style={{ fontSize: 11, color: '#9B6BA080' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 animate-in fade-in duration-150">
          {/* Add new */}
          <div className="space-y-2 rounded-lg border border-[#9B6BA025] bg-white/30 p-3">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="proposal title…"
              className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                color: '#5C3018',
                borderColor: '#9B6BA025',
              }}
            />
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="why · what · context (optional)"
              rows={2}
              className="w-full resize-none rounded-lg bg-transparent px-2 py-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                color: '#5C3018',
                border: '1px solid #9B6BA020',
              }}
            />
            {titleInput.trim() && (
              <button
                type="button"
                onClick={add}
                className="cursor-pointer rounded-full px-3 py-1"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#9B6BA0',
                  background: '#9B6BA015',
                  border: '1px solid #9B6BA050',
                }}
              >
                propose
              </button>
            )}
          </div>

          {/* Open proposals */}
          {proposed.map((d) => {
            const yes = d.votes.filter((v) => v.value === 'yes').length;
            const no = d.votes.filter((v) => v.value === 'no').length;
            const unsure = d.votes.filter((v) => v.value === 'unsure').length;
            const myVote = d.votes.find((v) => v.memberId === meId)?.value;
            return (
              <div
                key={d.id}
                className="rounded-lg"
                style={{
                  background: '#9B6BA010',
                  border: '1px solid #9B6BA025',
                  padding: '10px 12px',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#5C3018',
                        lineHeight: 1.2,
                      }}
                    >
                      {d.title}
                    </p>
                    {d.description && (
                      <p
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 12,
                          color: '#7A5438',
                          opacity: 0.85,
                          lineHeight: 1.4,
                        }}
                      >
                        {d.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    className="cursor-pointer text-[10px]"
                    style={{ color: '#8A6A4A', opacity: 0.2, background: 'none', border: 'none' }}
                  >
                    ×
                  </button>
                </div>
                {/* Vote chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {(['yes', 'no', 'unsure'] as const).map((v) => {
                    const isMine = myVote === v;
                    const count = v === 'yes' ? yes : v === 'no' ? no : unsure;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => castVote(d.id, v)}
                        className="cursor-pointer rounded-full px-2 py-0.5"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          background: isMine ? '#9B6BA025' : 'transparent',
                          border: `1px solid ${isMine ? '#9B6BA0' : '#9B6BA030'}`,
                          color: isMine ? '#9B6BA0' : '#8A6A4A',
                        }}
                      >
                        {v} {count > 0 ? `· ${count}` : ''}
                      </button>
                    );
                  })}
                </div>
                {/* Decide buttons */}
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => decide(d.id, 'yes')}
                    className="cursor-pointer rounded-full px-2 py-0.5"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: '#7AAA5818',
                      border: '1px solid #7AAA5840',
                      color: '#5F7447',
                    }}
                  >
                    ✓ decide yes
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(d.id, 'no')}
                    className="cursor-pointer rounded-full px-2 py-0.5"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: '#B33A2B12',
                      border: '1px solid #B33A2B30',
                      color: '#B33A2B',
                    }}
                  >
                    × decide no
                  </button>
                </div>
                {/* Voter chips */}
                {d.votes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.votes.map((v) => {
                      const member = members.find((m) => m.id === v.memberId);
                      return (
                        <span
                          key={v.memberId}
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 9.5,
                            fontWeight: 600,
                            color: member?.color || '#8A6A4A',
                            opacity: v.value === 'unsure' ? 0.55 : 1,
                          }}
                        >
                          {v.memberName}
                          {v.value === 'no' && ' ✗'}
                          {v.value === 'unsure' && ' ?'}
                          {v.value === 'yes' && ' ✓'}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Decided log */}
          {decided.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#7A5438',
                  opacity: 0.6,
                }}
              >
                decided
              </p>
              {decided.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-2 rounded-lg"
                  style={{
                    background: '#7AAA580C',
                    border: '1px solid #7AAA5828',
                    padding: '6px 10px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 12,
                      color: '#5C3018',
                      lineHeight: 1.3,
                    }}
                  >
                    <strong style={{ color: d.decision === 'yes' ? '#5F7447' : '#B33A2B' }}>
                      {d.decision === 'yes' ? '✓' : '✗'}
                    </strong>{' '}
                    {d.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => archive(d.id)}
                    className="cursor-pointer text-[9px] uppercase"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      letterSpacing: '0.1em',
                      color: '#8A6A4A',
                      opacity: 0.5,
                      background: 'none',
                      border: 'none',
                    }}
                  >
                    archive
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Archived count */}
          {archived.length > 0 && (
            <p
              className="text-center italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                color: '#8A6A4A',
                opacity: 0.4,
              }}
            >
              + {archived.length} archived
            </p>
          )}
        </div>
      )}
    </div>
  );
}
