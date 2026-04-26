'use client';

import { useEffect, useState } from 'react';

/*
 * CircleEvents — sync-session / rehearsal scheduler. Each event
 * has a title + when + optional location, and members can RSVP
 * (yes / maybe / no). Past events become a log.
 *
 * V1 storage: localStorage keyed by circle id. Supabase wire-up
 * tracked in docs/specs/supabase-sync-status.md as a follow-up.
 *
 * Per Martin (2026-04-26): item 2 from Circles evolution list.
 */

const LS = 'colourmap:circle-events';

interface RSVP {
  memberId: string;
  memberName: string;
  status: 'yes' | 'maybe' | 'no';
}

interface CircleEvent {
  id: string;
  title: string;
  whenISO: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  rsvps: RSVP[];
}

type Store = Record<string, CircleEvent[]>;

function load(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function persist(store: Store) {
  try {
    localStorage.setItem(LS, JSON.stringify(store));
  } catch {
    /* silent */
  }
}

function whenLabel(iso: string): { text: string; tone: 'soon' | 'past' | 'far' } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);
  const formatted = d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (diffDays < 0) return { text: formatted, tone: 'past' };
  if (diffDays <= 7) return { text: formatted, tone: 'soon' };
  return { text: formatted, tone: 'far' };
}

export default function CircleEvents({
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
  const [whenInput, setWhenInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    setStore(load());
  }, []);

  const events = (store[circleId] ?? [])
    .slice()
    .sort((a, b) => new Date(a.whenISO).getTime() - new Date(b.whenISO).getTime());

  function update(next: Store) {
    setStore(next);
    persist(next);
  }

  function addEvent() {
    const title = titleInput.trim();
    if (!title || !whenInput) return;
    const event: CircleEvent = {
      id: crypto.randomUUID(),
      title,
      whenISO: whenInput,
      location: locationInput.trim() || undefined,
      createdBy: meId,
      createdAt: new Date().toISOString(),
      rsvps: [{ memberId: meId, memberName: meName, status: 'yes' }],
    };
    update({ ...store, [circleId]: [...events, event] });
    setTitleInput('');
    setWhenInput('');
    setLocationInput('');
  }

  function setRsvp(eventId: string, status: 'yes' | 'maybe' | 'no') {
    const next = events.map((e) => {
      if (e.id !== eventId) return e;
      const rest = e.rsvps.filter((r) => r.memberId !== meId);
      return { ...e, rsvps: [...rest, { memberId: meId, memberName: meName, status }] };
    });
    update({ ...store, [circleId]: next });
  }

  function removeEvent(id: string) {
    update({ ...store, [circleId]: events.filter((e) => e.id !== id) });
  }

  return (
    <div
      className="rounded-2xl border"
      style={{ borderColor: '#5AA8B030', background: '#5AA8B008' }}
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
            color: '#5AA8B0',
          }}
        >
          sync sessions · {events.length}
        </span>
        <span style={{ fontSize: 11, color: '#5AA8B080' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 animate-in fade-in duration-150">
          {/* Add new */}
          <div className="space-y-2 rounded-lg border border-[#5AA8B025] bg-white/30 p-3">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="gathering · trip · session · dinner…"
              className="w-full border-b bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                color: '#5C3018',
                borderColor: '#5AA8B025',
              }}
            />
            <div className="flex flex-wrap gap-2">
              <input
                type="datetime-local"
                value={whenInput}
                onChange={(e) => setWhenInput(e.target.value)}
                className="rounded-full bg-transparent px-2 py-0.5 outline-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  color: '#5C3018',
                  border: '1px solid #5AA8B040',
                }}
              />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="where?"
                className="flex-1 rounded-full bg-transparent px-3 py-0.5 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  color: '#5C3018',
                  border: '1px solid #5AA8B025',
                  minWidth: 120,
                }}
              />
              {titleInput.trim() && whenInput && (
                <button
                  type="button"
                  onClick={addEvent}
                  className="cursor-pointer rounded-full px-3 py-1"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#5AA8B0',
                    background: '#5AA8B015',
                    border: '1px solid #5AA8B050',
                  }}
                >
                  add
                </button>
              )}
            </div>
          </div>

          {/* Event list */}
          {events.length === 0 ? (
            <p
              className="text-center italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                color: '#8A6A4A',
                opacity: 0.55,
              }}
            >
              no sync sessions yet
            </p>
          ) : (
            events.map((e) => {
              const when = whenLabel(e.whenISO);
              const myRsvp = e.rsvps.find((r) => r.memberId === meId)?.status;
              const yesCount = e.rsvps.filter((r) => r.status === 'yes').length;
              const maybeCount = e.rsvps.filter((r) => r.status === 'maybe').length;
              return (
                <div
                  key={e.id}
                  className="rounded-lg"
                  style={{
                    background: when.tone === 'past' ? '#C4A06010' : '#5AA8B010',
                    border: `1px solid ${when.tone === 'past' ? '#C4A06022' : '#5AA8B025'}`,
                    padding: '10px 12px',
                    opacity: when.tone === 'past' ? 0.6 : 1,
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
                        {e.title}
                      </p>
                      <p
                        className="mt-1"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 11,
                          color: when.tone === 'past' ? '#8A6A4A' : '#5AA8B0',
                          opacity: 0.85,
                        }}
                      >
                        {when.text}
                        {e.location && (
                          <span style={{ color: '#8A6A4A', opacity: 0.7, marginLeft: 6 }}>
                            · {e.location}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvent(e.id)}
                      className="cursor-pointer text-[10px]"
                      style={{
                        color: '#8A6A4A',
                        opacity: 0.2,
                        background: 'none',
                        border: 'none',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {/* RSVP buttons */}
                  {when.tone !== 'past' && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {(['yes', 'maybe', 'no'] as const).map((status) => {
                        const isMine = myRsvp === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setRsvp(e.id, status)}
                            className="cursor-pointer rounded-full px-2 py-0.5 transition-all"
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              background: isMine ? '#5AA8B025' : 'transparent',
                              border: `1px solid ${isMine ? '#5AA8B0' : '#5AA8B030'}`,
                              color: isMine ? '#5AA8B0' : '#8A6A4A',
                            }}
                          >
                            {status}
                          </button>
                        );
                      })}
                      <span
                        className="ml-2"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 11,
                          color: '#8A6A4A',
                          opacity: 0.7,
                        }}
                      >
                        {yesCount} yes · {maybeCount} maybe
                      </span>
                    </div>
                  )}
                  {/* Member chips for RSVPs */}
                  {e.rsvps.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.rsvps
                        .filter((r) => r.status !== 'no')
                        .map((r) => {
                          const member = members.find((m) => m.id === r.memberId);
                          return (
                            <span
                              key={r.memberId}
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 11,
                                fontWeight: 600,
                                color: member?.color || '#8A6A4A',
                                opacity: r.status === 'maybe' ? 0.55 : 1,
                              }}
                            >
                              {r.memberName}
                              {r.status === 'maybe' && '?'}
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
