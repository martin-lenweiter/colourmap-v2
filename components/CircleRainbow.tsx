'use client';

import { useEffect, useState } from 'react';

/*
 * CircleRainbow — vertical Hawkins rainbow where each member can
 * leave reflections at any stage of the spectrum. Each entry is
 * dated; entries on the same stage stack as a thread, so over
 * time the band reads how each person's relationship to that
 * state has evolved.
 *
 * Per Martin (2026-04-26): item 5 from Circles evolution list,
 * with the redesign request: "vertical rainbow and people can
 * write for all the stages of the rainbow what touches them
 * there ... tracks the evolutions of that over time."
 *
 * The 10 Hawkins stages (low → high):
 *   Shame · Apathy · Grief · Fear · Anger ·
 *   Courage · Acceptance · Reason · Love · Peace
 *
 * V1 storage: localStorage keyed by circle id. Supabase wire-up
 * tracked in docs/specs/supabase-sync-status.md.
 */

const LS = 'colourmap:circle-rainbow';

const STAGES: { name: string; colour: string; soft: string }[] = [
  { name: 'Peace', colour: '#88C8E8', soft: '#88C8E815' },
  { name: 'Love', colour: '#88D8B0', soft: '#88D8B015' },
  { name: 'Reason', colour: '#A8E090', soft: '#A8E09015' },
  { name: 'Acceptance', colour: '#F0E060', soft: '#F0E06015' },
  { name: 'Courage', colour: '#F8C040', soft: '#F8C04015' },
  { name: 'Anger', colour: '#F0A088', soft: '#F0A08815' },
  { name: 'Fear', colour: '#F080B8', soft: '#F080B815' },
  { name: 'Grief', colour: '#E8A0C4', soft: '#E8A0C415' },
  { name: 'Apathy', colour: '#D8B0C8', soft: '#D8B0C815' },
  { name: 'Shame', colour: '#B8D0E8', soft: '#B8D0E815' },
];

interface RainbowReflection {
  id: string;
  stage: string;
  authorId: string;
  authorName: string;
  authorColour: string;
  text: string;
  createdAt: string;
}

type Store = Record<string, RainbowReflection[]>;

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

function relativeWhen(iso: string): string {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays < 1) return 'today';
  if (diffDays < 2) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)}w ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function CircleRainbow({
  circleId,
  meId,
  meName,
  meColour,
}: {
  circleId: string;
  meId: string;
  meName: string;
  meColour: string;
}) {
  const [store, setStore] = useState<Store>({});
  const [open, setOpen] = useState(true);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setStore(load());
  }, []);

  const reflections = (store[circleId] ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function add(stage: string) {
    const text = input.trim();
    if (!text) return;
    const r: RainbowReflection = {
      id: crypto.randomUUID(),
      stage,
      authorId: meId,
      authorName: meName,
      authorColour: meColour,
      text,
      createdAt: new Date().toISOString(),
    };
    const next = { ...store, [circleId]: [r, ...reflections] };
    setStore(next);
    persist(next);
    setInput('');
    setActiveStage(null);
  }

  function remove(id: string) {
    const next = { ...store, [circleId]: reflections.filter((r) => r.id !== id) };
    setStore(next);
    persist(next);
  }

  return (
    <div
      className="rounded-2xl border"
      style={{ borderColor: '#C4A06030', background: '#C4A06008' }}
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
            color: '#7A5438',
          }}
        >
          rainbow · what touches you where
        </span>
        <span style={{ fontSize: 11, color: '#7A543880' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 animate-in fade-in duration-150">
          <p
            className="mb-3 italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 11.5,
              color: '#8A6A4A',
              opacity: 0.7,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            tap a stage to leave a reflection · the band reads how each of us relates to that state,
            over time
          </p>
          <div className="space-y-1.5">
            {STAGES.map((stage) => {
              const stageReflections = reflections.filter((r) => r.stage === stage.name);
              const isActive = activeStage === stage.name;
              return (
                <div
                  key={stage.name}
                  className="rounded-lg transition-all"
                  style={{
                    background: stage.soft,
                    border: `1px solid ${stage.colour}30`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStage(isActive ? null : stage.name);
                      setInput('');
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <span
                      className="block rounded-full"
                      style={{
                        width: 14,
                        height: 14,
                        background: stage.colour,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="flex-1 text-left"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 13,
                        fontWeight: 700,
                        color: stage.colour,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {stage.name}
                    </span>
                    {stageReflections.length > 0 && (
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          fontWeight: 600,
                          color: stage.colour,
                          opacity: 0.7,
                        }}
                      >
                        {stageReflections.length} note
                        {stageReflections.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </button>
                  {/* Active stage: input + thread */}
                  {isActive && (
                    <div
                      className="space-y-2 px-3 pb-3 animate-in fade-in duration-150"
                      style={{ borderTop: `1px dashed ${stage.colour}30` }}
                    >
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                            e.preventDefault();
                            add(stage.name);
                          }
                        }}
                        placeholder={`what touches you in ${stage.name.toLowerCase()}…`}
                        rows={2}
                        className="mt-2 w-full resize-none rounded-lg bg-white/60 px-3 py-2 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 13,
                          color: '#5C3018',
                          border: `1px solid ${stage.colour}30`,
                          lineHeight: 1.45,
                        }}
                      />
                      {input.trim() && (
                        <button
                          type="button"
                          onClick={() => add(stage.name)}
                          className="cursor-pointer rounded-full px-3 py-1"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: stage.colour,
                            background: `${stage.colour}20`,
                            border: `1px solid ${stage.colour}60`,
                          }}
                        >
                          leave reflection
                        </button>
                      )}
                    </div>
                  )}
                  {/* Thread */}
                  {stageReflections.length > 0 && (
                    <div className="space-y-1.5 px-3 pb-2">
                      {stageReflections.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-md"
                          style={{
                            background: 'rgba(255,255,255,0.55)',
                            padding: '6px 10px',
                          }}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 11,
                                fontWeight: 700,
                                color: r.authorColour,
                              }}
                            >
                              {r.authorName}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 10,
                                color: '#8A6A4A',
                                opacity: 0.55,
                              }}
                            >
                              {relativeWhen(r.createdAt)}
                              {r.authorId === meId && (
                                <button
                                  type="button"
                                  onClick={() => remove(r.id)}
                                  className="ml-2 cursor-pointer"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#8A6A4A',
                                    opacity: 0.4,
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          </div>
                          <p
                            className="mt-0.5 italic"
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: 12.5,
                              color: '#5C3018',
                              lineHeight: 1.45,
                              opacity: 0.92,
                            }}
                          >
                            “{r.text}”
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
