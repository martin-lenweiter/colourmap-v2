'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   DAILY AGENDA — time-block planner for the day.
   Vertical (timeline) or horizontal (swim lanes) view.
   Blocks are coloured by mission/objective.
   Closable pillbox in check-in.
   ═══════════════════════════════════════════════════════════ */

const AGENDA_KEY = 'colourmap:daily-agenda';
const AGENDA_OPEN_KEY = 'colourmap:daily-agenda-open';

interface AgendaBlock {
  id: string;
  text: string;
  startHour: number; // 0–23
  duration: number; // in hours (0.5, 1, 1.5, 2, etc.)
  color: string;
  kind: 'mission' | 'emotion';
}

type AgendaLayer = 'mission' | 'emotion';

const BLOCK_COLORS = [
  '#D4805A', // warm terracotta
  '#C4A060', // ochre
  '#7AAA58', // green
  '#6890B0', // blue
  '#9B6BA0', // purple
  '#5A7A8A', // teal
  '#C87050', // coral
  '#8A8A6A', // olive
];

// Pastel rainbow for emotion entries
const EMOTION_COLORS = [
  '#E0908A', // soft coral — heavy
  '#E8A878', // peach — tense
  '#D8C078', // warm gold — restless
  '#C0D088', // sage — neutral
  '#A0C8A0', // mint — okay
  '#90C0C0', // teal — calm
  '#A0B0D0', // periwinkle — peaceful
  '#B0A0C8', // lavender — light
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am – 9pm

function loadAgenda(): AgendaBlock[] {
  try {
    const raw = localStorage.getItem(AGENDA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveAgenda(blocks: AgendaBlock[]) {
  try {
    localStorage.setItem(AGENDA_KEY, JSON.stringify(blocks));
  } catch {}
}

export default function DailyAgenda() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AGENDA_OPEN_KEY) === 'true';
  });
  const [showMission, setShowMission] = useState(true);
  const [showEmotion, setShowEmotion] = useState(true);
  const [blocks, setBlocks] = useState<AgendaBlock[]>([]);
  const [addingAt, setAddingAt] = useState<number | null>(null);
  const [newText, setNewText] = useState('');
  const [newDuration, setNewDuration] = useState(1);
  const [newColor, setNewColor] = useState(BLOCK_COLORS[0]);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showObjectives, setShowObjectives] = useState(false);
  const [objectives, setObjectives] = useState<{ id: string; text: string; done: boolean }[]>([]);

  useEffect(() => {
    setBlocks(loadAgenda());
    try {
      const raw = localStorage.getItem('colourmap:today-objectives');
      if (raw) setObjectives(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleOpen = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AGENDA_OPEN_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const addBlock = (hour: number, kind: 'mission' | 'emotion' = 'mission') => {
    if (!newText.trim()) return;
    const block: AgendaBlock = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      startHour: hour,
      duration: newDuration,
      color: newColor,
      kind,
    };
    const next = [...blocks, block].sort((a, b) => a.startHour - b.startHour);
    setBlocks(next);
    saveAgenda(next);
    setNewText('');
    setAddingAt(null);
  };

  const removeBlock = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    setBlocks(next);
    saveAgenda(next);
  };

  const importObjective = (text: string) => {
    // Find the next free hour slot
    const usedHours = new Set(
      blocks.flatMap((b) =>
        Array.from({ length: Math.ceil(b.duration) }, (_, i) => b.startHour + i),
      ),
    );
    let startHour = 8;
    for (const h of HOURS) {
      if (!usedHours.has(h)) {
        startHour = h;
        break;
      }
    }
    const block: AgendaBlock = {
      id: crypto.randomUUID(),
      text,
      startHour,
      duration: 1,
      color: BLOCK_COLORS[blocks.length % BLOCK_COLORS.length],
      kind: 'mission',
    };
    const next = [...blocks, block].sort((a, b) => a.startHour - b.startHour);
    setBlocks(next);
    saveAgenda(next);
  };

  const resizeBlock = (id: string, delta: number) => {
    const next = blocks.map((b) =>
      b.id === id ? { ...b, duration: Math.max(0.5, b.duration + delta) } : b,
    );
    setBlocks(next);
    saveAgenda(next);
  };

  const moveBlock = (id: string, toHour: number) => {
    const next = blocks
      .map((b) => (b.id === id ? { ...b, startHour: toHour } : b))
      .sort((a, b) => a.startHour - b.startHour);
    setBlocks(next);
    saveAgenda(next);
  };

  return (
    <div
      className="space-y-3 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#6890B050',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      {/* Header — same pill format as Other Missions */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={toggleOpen}
          className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
          style={{
            background: '#6890B015',
            border: '1px solid #6890B040',
          }}
        >
          <span
            className="text-center uppercase"
            style={{
              color: '#6890B0',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.22em',
            }}
          >
            Daily Agenda
          </span>
          <span
            className="text-sm transition-transform duration-200"
            style={{
              color: '#6890B080',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▾
          </span>
        </button>
      </div>

      {open && (
        <div className="space-y-3">
          {/* Daily Objectives tab */}
          {objectives.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowObjectives((s) => !s)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-1.5 transition-all"
                style={{
                  background: showObjectives ? '#C4A06012' : 'transparent',
                  border: `1px solid ${showObjectives ? '#C4A06030' : '#C4A06018'}`,
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: '#C4A060' }}
                >
                  Daily Objectives
                </span>
                <span
                  className="text-[10px] transition-transform duration-200"
                  style={{
                    color: '#C4A06080',
                    transform: showObjectives ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ▾
                </span>
              </button>
              {showObjectives && (
                <div className="animate-in fade-in duration-150 space-y-1.5 pt-2">
                  {(() => {
                    const alreadyInAgenda = new Set(blocks.map((b) => b.text));
                    return objectives
                      .filter((o) => !o.done)
                      .map((o) => {
                        const scheduled = alreadyInAgenda.has(o.text);
                        return (
                          <div
                            key={o.id}
                            className="flex items-center gap-2 px-2"
                            style={{ minHeight: 32 }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: o.done ? '#7AAA58' : scheduled ? '#6890B0' : '#C4A060',
                                opacity: o.done ? 0.5 : 0.7,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                flex: 1,
                                fontFamily: 'var(--font-serif)',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#5C3018',
                                opacity: o.done ? 0.5 : 1,
                                textDecoration: o.done ? 'line-through' : 'none',
                              }}
                            >
                              {o.text}
                            </span>
                            {!o.done && !scheduled && (
                              <button
                                type="button"
                                onClick={() => importObjective(o.text)}
                                className="cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all hover:opacity-80"
                                style={{
                                  background: '#6890B012',
                                  border: '1px solid #6890B030',
                                  color: '#6890B0',
                                }}
                              >
                                schedule
                              </button>
                            )}
                            {scheduled && !o.done && (
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider"
                                style={{ color: '#6890B0', opacity: 0.5 }}
                              >
                                scheduled
                              </span>
                            )}
                          </div>
                        );
                      });
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Layer toggles — both can be active independently */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowMission((s) => !s)}
              className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#6890B0',
                border: `1px solid ${showMission ? '#6890B040' : '#C4A06018'}`,
                background: showMission ? '#6890B010' : 'transparent',
                opacity: showMission ? 1 : 0.5,
              }}
            >
              mission
            </button>
            <button
              type="button"
              onClick={() => setShowEmotion((s) => !s)}
              className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                color: '#9B6BA0',
                border: `1px solid ${showEmotion ? '#9B6BA040' : '#C4A06018'}`,
                background: showEmotion ? '#9B6BA010' : 'transparent',
                opacity: showEmotion ? 1 : 0.5,
              }}
            >
              emotion
            </button>
          </div>

          {(() => {
            const filtered = blocks.filter(
              (b) => (showMission && b.kind === 'mission') || (showEmotion && b.kind === 'emotion'),
            );
            return (
              <VerticalView
                blocks={filtered}
                layer={showEmotion && !showMission ? 'emotion' : 'mission'}
                addingAt={addingAt}
                setAddingAt={setAddingAt}
                newText={newText}
                setNewText={setNewText}
                newDuration={newDuration}
                setNewDuration={setNewDuration}
                newColor={newColor}
                setNewColor={setNewColor}
                onAdd={addBlock}
                onRemove={removeBlock}
                onResize={resizeBlock}
                onMove={moveBlock}
                expandedBlock={expandedBlock}
                setExpandedBlock={setExpandedBlock}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ─── Vertical timeline view ─── */
function VerticalView({
  blocks,
  layer,
  addingAt,
  setAddingAt,
  newText,
  setNewText,
  newDuration,
  setNewDuration,
  newColor,
  setNewColor,
  onAdd,
  onRemove,
  onResize,
  onMove,
  expandedBlock,
  setExpandedBlock,
}: {
  blocks: AgendaBlock[];
  layer: AgendaLayer;
  addingAt: number | null;
  setAddingAt: (h: number | null) => void;
  newText: string;
  setNewText: (v: string) => void;
  newDuration: number;
  setNewDuration: (v: number) => void;
  newColor: string;
  setNewColor: (v: string) => void;
  onAdd: (hour: number, kind?: 'mission' | 'emotion') => void;
  onRemove: (id: string) => void;
  onResize: (id: string, delta: number) => void;
  onMove: (id: string, toHour: number) => void;
  expandedBlock: string | null;
  setExpandedBlock: (id: string | null) => void;
}) {
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {HOURS.map((hour) => {
        // All blocks visible in this hour slot
        const activeBlocks = blocks.filter(
          (b) => b.startHour <= hour && hour < b.startHour + b.duration,
        );
        // Blocks that START at this hour
        const startingBlocks = blocks.filter((b) => b.startHour === hour);
        const isAdding = addingAt === hour;
        const hasBlock = activeBlocks.length > 0;
        const isDragOver = dragOverHour === hour;

        return (
          <div key={hour} style={{ display: 'flex', minHeight: 36 }}>
            {/* Hour label */}
            <span
              style={{
                width: 48,
                flexShrink: 0,
                color: '#5C3018',
                opacity: 0.85,
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'var(--font-serif)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: '36px',
                textAlign: 'right',
                paddingRight: 10,
              }}
            >
              {String(hour).padStart(2, '0')}
            </span>

            {/* Slot — drop target */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverHour(hour);
              }}
              onDragLeave={() => setDragOverHour(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverHour(null);
                const blockId = e.dataTransfer.getData('text/plain');
                if (blockId) onMove(blockId, hour);
              }}
              style={{
                flex: 1,
                borderTop: `1px solid ${isDragOver ? '#6890B040' : '#C4A06015'}`,
                background: isDragOver ? '#6890B008' : 'transparent',
                position: 'relative',
                minHeight: 36,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* Blocks starting at this hour — side by side if overlapping */}
              {startingBlocks.length > 0 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {startingBlocks.map((block) => {
                    // How many blocks overlap at this block's start hour?
                    const concurrent = blocks.filter(
                      (b) =>
                        b.startHour < block.startHour + block.duration &&
                        b.startHour + b.duration > block.startHour,
                    ).length;
                    const widthPct = concurrent > 1 ? `${Math.floor(100 / concurrent)}%` : '100%';

                    return (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', block.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() =>
                          setExpandedBlock(expandedBlock === block.id ? null : block.id)
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: widthPct,
                          padding: '6px 10px',
                          background: `${block.color}18`,
                          border: `1px solid ${block.color}30`,
                          borderRadius: 10,
                          cursor: 'grab',
                          minHeight: Math.max(36, block.duration * 36),
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: block.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#5C3018',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {block.text}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#8A6A4A',
                            opacity: 0.6,
                            fontFamily: 'var(--font-serif)',
                            flexShrink: 0,
                          }}
                        >
                          {block.duration}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expanded block controls */}
              {startingBlocks.map((sb) =>
                expandedBlock === sb.id ? (
                  <div
                    key={`ctrl-${sb.id}`}
                    className="animate-in fade-in duration-150"
                    style={{
                      display: 'flex',
                      gap: 6,
                      padding: '4px 10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onResize(sb.id, -0.5)}
                      style={{
                        background: 'none',
                        border: '1px solid #C4A06040',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#8A6A4A',
                      }}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => onResize(sb.id, 0.5)}
                      style={{
                        background: 'none',
                        border: '1px solid #C4A06040',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#8A6A4A',
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemove(sb.id);
                        setExpandedBlock(null);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #A05A4040',
                        borderRadius: 6,
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#A05A40',
                        marginLeft: 'auto',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : null,
              )}

              {/* Empty slot — tap to add */}
              {!hasBlock && !isAdding && (
                <button
                  type="button"
                  onClick={() => setAddingAt(hour)}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 36,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0,
                  }}
                  className="hover:opacity-30 transition-opacity"
                  title={`Add block at ${hour}:00`}
                >
                  <span style={{ fontSize: '16px', color: '#C4A060' }}>+</span>
                </button>
              )}

              {/* Add form */}
              {isAdding && (
                <div
                  className="animate-in fade-in duration-150"
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    background: '#C4A06008',
                    borderRadius: 10,
                    border: '1px dashed #C4A06040',
                  }}
                >
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')
                        onAdd(hour, layer === 'emotion' ? 'emotion' : 'mission');
                      if (e.key === 'Escape') setAddingAt(null);
                    }}
                    placeholder={layer === 'emotion' ? 'how are you feeling?' : "what's happening?"}
                    autoFocus
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #C4A06030',
                      outline: 'none',
                      color: '#5C3018',
                      fontFamily: 'var(--font-handwritten)',
                      fontSize: '18px',
                      padding: '4px 0',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Duration */}
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      style={{
                        background: 'transparent',
                        border: '1px solid #C4A06030',
                        borderRadius: 6,
                        padding: '2px 6px',
                        fontSize: '11px',
                        color: '#8A6A4A',
                        fontFamily: 'var(--font-serif)',
                      }}
                    >
                      {[0.5, 1, 1.5, 2, 2.5, 3, 4].map((d) => (
                        <option key={d} value={d}>
                          {d}h
                        </option>
                      ))}
                    </select>
                    {/* Color dots */}
                    <div style={{ display: 'flex', gap: 3 }}>
                      {(layer === 'emotion' ? EMOTION_COLORS : BLOCK_COLORS).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: c,
                            border: newColor === c ? '2px solid #5C3018' : '1px solid transparent',
                            cursor: 'pointer',
                            padding: 0,
                            opacity: newColor === c ? 1 : 0.5,
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddingAt(null)}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#8A6A4A',
                        opacity: 0.5,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
