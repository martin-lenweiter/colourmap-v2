'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   MASTERY — progressive self-development journey.
   Inspired by spectrum dot design — tap a dot, write what lives there.
   ═══════════════════════════════════════════════════════════ */

const MASTERY_KEY = 'colourmap:mastery';

interface Stage {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  tasks: { id: string; text: string; done: boolean }[];
  journal: string;
}

interface Track {
  id: string;
  title: string;
  color: string;
  notes: string;
  level: number;
}

// Warm palette inspired by the reference — peach/terracotta/sand spectrum
const DEFAULT_STAGES: Stage[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    subtitle: 'see what is on your plate',
    color: '#D4805A',
    journal: '',
    tasks: [
      { id: 'c1', text: 'Write down all current tasks and missions', done: false },
      { id: 'c2', text: 'Identify what is urgent vs what can wait', done: false },
      { id: 'c3', text: 'Name your top 3 priorities this week', done: false },
      { id: 'c4', text: 'Clear your inbox to zero open loops', done: false },
    ],
  },
  {
    id: 'order',
    title: 'Order',
    subtitle: 'organize your space and environment',
    color: '#C8906A',
    journal: '',
    tasks: [
      { id: 'o1', text: 'Clean and organize your desk', done: false },
      { id: 'o2', text: 'Sort digital files — close unused tabs', done: false },
      { id: 'o3', text: 'Create a simple daily routine', done: false },
      { id: 'o4', text: 'Remove one source of visual clutter', done: false },
    ],
  },
  {
    id: 'presence',
    title: 'Presence',
    subtitle: 'connect to your body and attention',
    color: '#C4A060',
    journal: '',
    tasks: [
      { id: 'p1', text: '5 minutes of stillness — just breathe', done: false },
      { id: 'p2', text: 'Notice your posture three times today', done: false },
      { id: 'p3', text: 'Eat one meal without screens', done: false },
      { id: 'p4', text: 'Walk outside for 10 minutes with no phone', done: false },
    ],
  },
  {
    id: 'energy',
    title: 'Energy',
    subtitle: 'channel and direct your momentum',
    color: '#B8A080',
    journal: '',
    tasks: [
      { id: 'e1', text: 'Identify what drains you vs what fuels you', done: false },
      { id: 'e2', text: 'Do your hardest task in your peak hour', done: false },
      { id: 'e3', text: 'Say no to one low-value commitment', done: false },
      { id: 'e4', text: 'End the day with a clear stop — not a fade', done: false },
    ],
  },
  {
    id: 'solidity',
    title: 'Solidity',
    subtitle: 'grounded confidence from within',
    color: '#A0907A',
    journal: '',
    tasks: [
      { id: 's1', text: 'Reflect on one thing you handled well this week', done: false },
      { id: 's2', text: 'Hold a boundary you normally let slide', done: false },
      { id: 's3', text: 'Spend time alone without filling the silence', done: false },
      { id: 's4', text: 'Write down what you stand for — in one sentence', done: false },
    ],
  },
];

// Paired groupings for horizontal view
const PAIRS = [
  { label: 'Clarity & Order', ids: ['clarity', 'order'] },
  { label: 'Presence & Energy', ids: ['presence', 'energy'] },
  { label: 'Solidity', ids: ['solidity'] },
];

const DEFAULT_TRACKS: Track[] = [
  { id: 'creative', title: 'Creative', color: '#D4805A', notes: '', level: 0 },
  { id: 'logical', title: 'Logical', color: '#C8906A', notes: '', level: 0 },
  { id: 'organisation', title: 'Organisation', color: '#C4A060', notes: '', level: 0 },
  { id: 'social', title: 'Social', color: '#B8A080', notes: '', level: 0 },
  { id: 'emotional', title: 'Emotional', color: '#A0907A', notes: '', level: 0 },
];

interface MasteryState {
  stages: Stage[];
  tracks: Track[];
  activeStageIdx: number;
}

function loadMastery(): MasteryState {
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { stages: DEFAULT_STAGES, tracks: DEFAULT_TRACKS, activeStageIdx: 0 };
}

function saveMastery(state: MasteryState) {
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(state));
  } catch {}
}

type View = 'vertical' | 'horizontal';

export default function MasteryBox() {
  const [state, setState] = useState<MasteryState>(loadMastery);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [view, setView] = useState<View>('vertical');

  useEffect(() => {
    saveMastery(state);
  }, [state]);

  const { stages, tracks } = state;

  const toggleTask = (stageId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      stages: prev.stages.map((s) =>
        s.id === stageId
          ? { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : s,
      ),
    }));
  };

  const updateJournal = (stageId: string, journal: string) => {
    setState((prev) => ({
      ...prev,
      stages: prev.stages.map((s) => (s.id === stageId ? { ...s, journal } : s)),
    }));
  };

  const updateTrackNotes = (trackId: string, notes: string) => {
    setState((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, notes } : t)),
    }));
  };

  const updateTrackLevel = (trackId: string, level: number) => {
    setState((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, level } : t)),
    }));
  };

  const stageProgress = (stage: Stage) => {
    if (stage.tasks.length === 0) return 0;
    return stage.tasks.filter((t) => t.done).length / stage.tasks.length;
  };

  return (
    <div className="space-y-6">
      {/* ═══ THE PATH ═══ */}
      <div
        className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
          boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
        }}
      >
        {/* Title */}
        <div className="text-center space-y-1">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#5C3018',
            }}
          >
            Your path
          </p>
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
              color: '#8A6A4A',
              opacity: 0.95,
            }}
          >
            tap a dot to write what lives there
          </p>
        </div>

        {/* View toggle */}
        <div className="flex justify-center gap-2">
          {(['vertical', 'horizontal'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all"
              style={{
                color: '#5C3018',
                background: view === v ? '#5C301812' : 'transparent',
                border: `1px solid ${view === v ? '#5C301830' : '#5C301810'}`,
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* VERTICAL VIEW — dots on the left, titles + subtitles */}
        {view === 'vertical' && (
          <div className="space-y-5 pt-2">
            {stages.map((stage) => {
              const isExpanded = expandedStage === stage.id;
              const progress = stageProgress(stage);
              return (
                <div key={stage.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                    className="flex w-full cursor-pointer items-start gap-4 text-left transition-all"
                    style={{ background: 'none', border: 'none' }}
                  >
                    {/* Colored dot */}
                    <span
                      className="mt-[2px] block shrink-0 rounded-full transition-all"
                      style={{
                        width: isExpanded ? 20 : 16,
                        height: isExpanded ? 20 : 16,
                        background: stage.color,
                        opacity: isExpanded ? 1 : 0.85,
                        boxShadow: isExpanded ? `0 3px 12px -3px ${stage.color}` : 'none',
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="uppercase tracking-[0.2em]"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#5C3018',
                        }}
                      >
                        {stage.title}
                        {progress > 0 && progress < 1 && (
                          <span
                            className="ml-2"
                            style={{ color: stage.color, fontSize: '12px', fontWeight: 400 }}
                          >
                            {Math.round(progress * 100)}%
                          </span>
                        )}
                        {progress === 1 && (
                          <span className="ml-2" style={{ color: stage.color, fontSize: '12px' }}>
                            ✓
                          </span>
                        )}
                      </p>
                      <p
                        className="italic"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '14px',
                          color: '#8A6A4A',
                          opacity: 0.95,
                        }}
                      >
                        {stage.subtitle}
                      </p>
                    </div>
                  </button>

                  {/* Expanded — journal + tasks */}
                  {isExpanded && (
                    <div className="ml-9 animate-in fade-in duration-150 space-y-3 pt-3 pb-1">
                      {/* Journal — write what lives here */}
                      <textarea
                        value={stage.journal}
                        onChange={(e) => updateJournal(stage.id, e.target.value)}
                        placeholder="write what lives here..."
                        rows={2}
                        className="w-full resize-none border-b bg-transparent pb-1 outline-none placeholder:text-[#7A5438] placeholder:opacity-50"
                        style={{
                          color: '#5C3018',
                          borderColor: `${stage.color}25`,
                          fontFamily: 'var(--font-handwritten)',
                          fontSize: '18px',
                          lineHeight: 1.5,
                        }}
                      />

                      {/* Tasks */}
                      <div className="space-y-1.5">
                        {stage.tasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleTask(stage.id, task.id)}
                              className="mt-[3px] flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-110"
                              style={{
                                borderColor: task.done ? `${stage.color}60` : '#C4A06050',
                                background: task.done ? `${stage.color}15` : 'transparent',
                              }}
                            >
                              {task.done && (
                                <span className="text-xs" style={{ color: stage.color }}>
                                  ✓
                                </span>
                              )}
                            </button>
                            <span
                              style={{
                                fontFamily: 'var(--font-handwritten)',
                                fontSize: '17px',
                                color: task.done ? stage.color : '#5C3018',
                                opacity: task.done ? 0.45 : 0.85,
                                textDecoration: task.done ? 'line-through' : 'none',
                              }}
                            >
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Unlock next */}
                      {progress === 1 && stages.indexOf(stage) < stages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const idx = stages.indexOf(stage);
                            setState((prev) => ({
                              ...prev,
                              activeStageIdx: Math.max(prev.activeStageIdx, idx + 1),
                            }));
                          }}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2 transition-all"
                          style={{
                            background: `${stages[stages.indexOf(stage) + 1].color}12`,
                            border: `1px solid ${stages[stages.indexOf(stage) + 1].color}30`,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: stages[stages.indexOf(stage) + 1].color,
                            }}
                          >
                            unlock {stages[stages.indexOf(stage) + 1].title} →
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* HORIZONTAL VIEW — dots in a row, paired groupings below */}
        {view === 'horizontal' && (
          <div className="space-y-5 pt-2">
            {/* Dot spectrum */}
            <div className="flex items-center justify-center gap-3">
              {stages.map((stage) => (
                <div key={stage.id} className="flex flex-col items-center gap-1">
                  <p
                    className="uppercase tracking-[0.14em]"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '9px',
                      fontWeight: 600,
                      color: '#5C3018',
                      opacity: 0.5,
                    }}
                  >
                    {stage.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                    className="cursor-pointer rounded-full transition-all hover:scale-110"
                    style={{
                      width: expandedStage === stage.id ? 22 : 18,
                      height: expandedStage === stage.id ? 22 : 18,
                      background: stage.color,
                      opacity: expandedStage === stage.id ? 1 : 0.75,
                      border: 'none',
                      boxShadow:
                        expandedStage === stage.id ? `0 3px 10px -3px ${stage.color}` : 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Paired groupings */}
            <div className="flex flex-col items-center gap-2">
              {PAIRS.map((pair) => {
                const pairStages = pair.ids.map((id) => stages.find((s) => s.id === id)!);
                return (
                  <button
                    key={pair.label}
                    type="button"
                    onClick={() => {
                      const first = pair.ids[0];
                      setExpandedStage(expandedStage === first ? null : first);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 transition-all"
                    style={{
                      background: '#5C301808',
                      border: '1px solid #5C301812',
                    }}
                  >
                    <div className="flex gap-1">
                      {pairStages.map((s) => (
                        <span
                          key={s.id}
                          className="block rounded-full"
                          style={{ width: 10, height: 10, background: s.color, opacity: 0.8 }}
                        />
                      ))}
                    </div>
                    <span
                      className="uppercase tracking-[0.16em]"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#5C3018',
                      }}
                    >
                      {pair.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expanded stage detail (same as vertical) */}
            {expandedStage &&
              (() => {
                const stage = stages.find((s) => s.id === expandedStage);
                if (!stage) return null;
                const progress = stageProgress(stage);
                return (
                  <div className="animate-in fade-in duration-150 space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="block shrink-0 rounded-full"
                        style={{ width: 14, height: 14, background: stage.color }}
                      />
                      <p
                        className="uppercase tracking-[0.2em]"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#5C3018',
                        }}
                      >
                        {stage.title}
                        {progress > 0 && (
                          <span
                            className="ml-2"
                            style={{ color: stage.color, fontSize: '12px', fontWeight: 400 }}
                          >
                            {progress === 1 ? '✓' : `${Math.round(progress * 100)}%`}
                          </span>
                        )}
                      </p>
                    </div>
                    <textarea
                      value={stage.journal}
                      onChange={(e) => updateJournal(stage.id, e.target.value)}
                      placeholder="write what lives here..."
                      rows={2}
                      className="w-full resize-none border-b bg-transparent pb-1 outline-none placeholder:text-[#7A5438] placeholder:opacity-50"
                      style={{
                        color: '#5C3018',
                        borderColor: `${stage.color}25`,
                        fontFamily: 'var(--font-handwritten)',
                        fontSize: '18px',
                        lineHeight: 1.5,
                      }}
                    />
                    <div className="space-y-1.5">
                      {stage.tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleTask(stage.id, task.id)}
                            className="mt-[3px] flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-110"
                            style={{
                              borderColor: task.done ? `${stage.color}60` : '#C4A06050',
                              background: task.done ? `${stage.color}15` : 'transparent',
                            }}
                          >
                            {task.done && (
                              <span className="text-xs" style={{ color: stage.color }}>
                                ✓
                              </span>
                            )}
                          </button>
                          <span
                            style={{
                              fontFamily: 'var(--font-handwritten)',
                              fontSize: '17px',
                              color: task.done ? stage.color : '#5C3018',
                              opacity: task.done ? 0.45 : 0.85,
                              textDecoration: task.done ? 'line-through' : 'none',
                            }}
                          >
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
          </div>
        )}
      </div>

      {/* ═══ DOMAINS — brain tracks ═══ */}
      <div
        className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
          boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
        }}
      >
        <div className="text-center space-y-1">
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#5C3018',
            }}
          >
            Your domains
          </p>
          <p
            className="italic"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
              color: '#8A6A4A',
              opacity: 0.95,
            }}
          >
            where are you growing
          </p>
        </div>

        {/* Domain dots — horizontal row */}
        <div className="flex items-center justify-center gap-4">
          {tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
              className="flex flex-col items-center gap-1.5 cursor-pointer transition-all"
              style={{ background: 'none', border: 'none' }}
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: expandedTrack === track.id ? 20 : 16,
                  height: expandedTrack === track.id ? 20 : 16,
                  background: track.color,
                  opacity: expandedTrack === track.id ? 1 : 0.7,
                  boxShadow: expandedTrack === track.id ? `0 3px 10px -3px ${track.color}` : 'none',
                }}
              />
              <span
                className="uppercase tracking-[0.12em]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: expandedTrack === track.id ? '#5C3018' : '#8A6A4A',
                  opacity: expandedTrack === track.id ? 1 : 0.5,
                }}
              >
                {track.title}
              </span>
            </button>
          ))}
        </div>

        {/* Expanded domain */}
        {expandedTrack &&
          (() => {
            const track = tracks.find((t) => t.id === expandedTrack);
            if (!track) return null;
            return (
              <div className="animate-in fade-in duration-150 space-y-4 pt-1">
                <div className="flex items-center gap-3">
                  <span
                    className="block shrink-0 rounded-full"
                    style={{ width: 12, height: 12, background: track.color }}
                  />
                  <p
                    className="uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#5C3018',
                    }}
                  >
                    {track.title}
                  </p>
                </div>

                {/* Level — where are you */}
                <div className="space-y-1.5">
                  <p
                    className="italic"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px',
                      color: '#8A6A4A',
                      opacity: 0.95,
                    }}
                  >
                    where are you?
                  </p>
                  <div className="flex gap-[4px]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateTrackLevel(track.id, track.level === n ? 0 : n)}
                        className="flex-1 cursor-pointer rounded-full transition-all"
                        style={{
                          height: 14,
                          background: track.color,
                          opacity: track.level >= n ? 0.85 : 0.15,
                          border: 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <textarea
                  value={track.notes}
                  onChange={(e) => updateTrackNotes(track.id, e.target.value)}
                  placeholder={`what are you working on in ${track.title.toLowerCase()}?`}
                  rows={2}
                  className="w-full resize-none border-b bg-transparent pb-1 outline-none placeholder:text-[#7A5438] placeholder:opacity-50"
                  style={{
                    color: '#5C3018',
                    borderColor: `${track.color}25`,
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '18px',
                    lineHeight: 1.5,
                  }}
                />
              </div>
            );
          })()}
      </div>
    </div>
  );
}
