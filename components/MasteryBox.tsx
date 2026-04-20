'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   MASTERY — progressive self-development journey.
   Five sequential stages + parallel brain-domain tracks.
   ═══════════════════════════════════════════════════════════ */

const MASTERY_KEY = 'colourmap:mastery';

interface Stage {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  tasks: { id: string; text: string; done: boolean }[];
}

interface Track {
  id: string;
  title: string;
  color: string;
  notes: string;
  level: number; // 0-5
}

const DEFAULT_STAGES: Stage[] = [
  {
    id: 'clarity',
    title: 'Clarity',
    subtitle: 'See what is on your plate',
    color: '#6890B0',
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
    subtitle: 'Organize your space and environment',
    color: '#7AAA58',
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
    subtitle: 'Connect to your body and attention',
    color: '#D4805A',
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
    subtitle: 'Channel and direct your momentum',
    color: '#C4A060',
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
    subtitle: 'Grounded confidence from within',
    color: '#9B6BA0',
    tasks: [
      { id: 's1', text: 'Reflect on one thing you handled well this week', done: false },
      { id: 's2', text: 'Hold a boundary you normally let slide', done: false },
      { id: 's3', text: 'Spend time alone without filling the silence', done: false },
      { id: 's4', text: 'Write down what you stand for — in one sentence', done: false },
    ],
  },
];

const DEFAULT_TRACKS: Track[] = [
  { id: 'creative', title: 'Creative', color: '#D4805A', notes: '', level: 0 },
  { id: 'logical', title: 'Logical', color: '#6890B0', notes: '', level: 0 },
  { id: 'organisation', title: 'Organisation', color: '#7AAA58', notes: '', level: 0 },
  { id: 'social', title: 'Social', color: '#6B7F4E', notes: '', level: 0 },
  { id: 'emotional', title: 'Emotional', color: '#9B6BA0', notes: '', level: 0 },
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

export default function MasteryBox() {
  const [state, setState] = useState<MasteryState>(loadMastery);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

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
      {/* ═══ THE PATH — sequential stages ═══ */}
      <div
        className="space-y-5 rounded-3xl border border-[#7a543833] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
          boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
        }}
      >
        <p
          className="text-center font-semibold uppercase tracking-[0.22em]"
          style={{ color: '#C4A060', fontSize: '15px' }}
        >
          The Path
        </p>

        {/* Stage progression — vertical */}
        <div className="space-y-0">
          {stages.map((stage, idx) => {
            const progress = stageProgress(stage);
            const isActive = idx === state.activeStageIdx;
            const isCompleted = progress === 1;
            const isLocked = idx > state.activeStageIdx + 1;
            const isExpanded = expandedStage === stage.id;

            return (
              <div key={stage.id}>
                {/* Connector line */}
                {idx > 0 && (
                  <div className="flex justify-center py-1">
                    <div
                      style={{
                        width: 2,
                        height: 16,
                        background: idx <= state.activeStageIdx ? stage.color : '#C4A06025',
                      }}
                    />
                  </div>
                )}

                {/* Stage row */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isLocked) setExpandedStage(isExpanded ? null : stage.id);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                  style={{
                    background: isActive ? `${stage.color}10` : 'transparent',
                    border: isActive ? `1px solid ${stage.color}30` : '1px solid transparent',
                    opacity: isLocked ? 0.3 : 1,
                  }}
                >
                  {/* Progress circle */}
                  <div
                    className="relative flex shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: 36,
                      height: 36,
                      background: isCompleted ? stage.color : `${stage.color}15`,
                      border: `2px solid ${isCompleted ? stage.color : `${stage.color}40`}`,
                    }}
                  >
                    {isCompleted ? (
                      <span style={{ color: '#F5ECDC', fontSize: '14px', fontWeight: 700 }}>✓</span>
                    ) : (
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: stage.color,
                        }}
                      >
                        {Math.round(progress * 100)}
                      </span>
                    )}
                  </div>

                  {/* Title + subtitle */}
                  <div className="flex-1 text-left">
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isActive ? stage.color : '#5C3018',
                      }}
                    >
                      {stage.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '12px',
                        color: '#8A6A4A',
                        opacity: 0.6,
                      }}
                    >
                      {stage.subtitle}
                    </p>
                  </div>

                  {/* Expand arrow */}
                  {!isLocked && (
                    <span
                      className="text-[10px] transition-transform duration-200"
                      style={{
                        color: `${stage.color}80`,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  )}
                </button>

                {/* Expanded tasks */}
                {isExpanded && !isLocked && (
                  <div className="animate-in fade-in duration-150 space-y-1 px-3 pt-2 pb-1">
                    {stage.tasks.map((task) => (
                      <div key={task.id} className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleTask(stage.id, task.id)}
                          className="mt-[2px] flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all hover:scale-110"
                          style={{
                            borderColor: task.done ? `${stage.color}60` : '#C4A06060',
                            background: task.done ? `${stage.color}10` : 'transparent',
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
                            fontSize: '18px',
                            color: task.done ? stage.color : '#5C3018',
                            opacity: task.done ? 0.5 : 1,
                            textDecoration: task.done ? 'line-through' : 'none',
                          }}
                        >
                          {task.text}
                        </span>
                      </div>
                    ))}

                    {/* Unlock next stage when all done */}
                    {isActive && progress === 1 && idx < stages.length - 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            activeStageIdx: Math.min(prev.activeStageIdx + 1, stages.length - 1),
                          }))
                        }
                        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2 transition-all"
                        style={{
                          background: `${stages[idx + 1].color}15`,
                          border: `1px solid ${stages[idx + 1].color}40`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: stages[idx + 1].color,
                          }}
                        >
                          Unlock {stages[idx + 1].title} →
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ BRAIN DOMAINS — parallel tracks ═══ */}
      <div
        className="space-y-4 rounded-3xl border border-[#7a543833] px-5 py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(251,244,232,0.95), rgba(246,236,221,0.92))',
          boxShadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
        }}
      >
        <p
          className="text-center font-semibold uppercase tracking-[0.22em]"
          style={{ color: '#C4A060', fontSize: '15px' }}
        >
          Domains
        </p>

        <div className="space-y-2">
          {tracks.map((track) => {
            const isExpanded = expandedTrack === track.id;
            return (
              <div key={track.id}>
                <button
                  type="button"
                  onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                  style={{
                    background: isExpanded ? `${track.color}10` : 'transparent',
                    border: `1px solid ${isExpanded ? `${track.color}30` : 'transparent'}`,
                  }}
                >
                  {/* Color dot */}
                  <span
                    className="block shrink-0 rounded-full"
                    style={{ width: 12, height: 12, background: track.color }}
                  />

                  {/* Title */}
                  <span
                    className="flex-1 text-left"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: isExpanded ? track.color : '#5C3018',
                    }}
                  >
                    {track.title}
                  </span>

                  {/* Level bar */}
                  <div className="flex gap-[2px]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="block rounded-sm"
                        style={{
                          width: 12,
                          height: 6,
                          background: track.color,
                          opacity: track.level >= n ? 0.85 : 0.15,
                        }}
                      />
                    ))}
                  </div>

                  <span
                    className="text-[10px] transition-transform duration-200"
                    style={{
                      color: `${track.color}80`,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded track */}
                {isExpanded && (
                  <div className="animate-in fade-in duration-150 space-y-3 px-3 pt-2 pb-1">
                    {/* Level selector */}
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '11px',
                          color: '#8A6A4A',
                          opacity: 0.6,
                        }}
                      >
                        where are you?
                      </span>
                      <div className="flex gap-[3px]">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateTrackLevel(track.id, track.level === n ? 0 : n)}
                            className="cursor-pointer rounded-sm transition-all"
                            style={{
                              width: 24,
                              height: 12,
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
                      className="w-full resize-none border-b bg-transparent pb-1 outline-none placeholder:text-[#8A6A4A] placeholder:opacity-40"
                      style={{
                        color: '#7a5438',
                        borderColor: `${track.color}20`,
                        fontFamily: 'var(--font-handwritten)',
                        fontSize: '18px',
                        lineHeight: 1.4,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
