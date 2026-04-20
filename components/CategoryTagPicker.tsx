'use client';

/* ═══════════════════════════════════════════════════════════
   CATEGORY TAG PICKER — 3-dot compass entry point.
   Three coloured dots (Caring / Doing / Sharing). Click one
   to expand its axes + user categories assigned to it.
   Used everywhere: Challenge/Flow, Agenda, Overview, etc.
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';

export interface TagValue {
  name: string;
  color: string;
  /** Set when the tag came from a LifeCategory (not a compass axis). */
  categoryId?: string;
}

export interface LifeCategoryLike {
  id: string;
  name: string;
  color: string;
  compass?: 'caring' | 'doing' | 'sharing';
}

export interface CompassAxis {
  name: string;
  color: string;
  group: string;
}

const COMPASSES = [
  { id: 'caring', label: 'Caring', color: '#D4805A' },
  { id: 'doing', label: 'Doing', color: '#6890B0' },
  { id: 'sharing', label: 'Sharing', color: '#6B7F4E' },
];

interface Props {
  value: TagValue | null;
  onChange: (value: TagValue | null) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  lifeCategories: LifeCategoryLike[];
  compassAxes: CompassAxis[];
}

export default function CategoryTagPicker({
  value,
  onChange,
  open,
  onToggle,
  onClose,
  lifeCategories,
  compassAxes,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [expandedCompass, setExpandedCompass] = useState<string | null>(null);
  const [showThree, setShowThree] = useState(false);

  useEffect(() => {
    if (!open) {
      setExpandedCompass(null);
      setShowThree(false);
      return;
    }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Group compass axes by compass
  const axesByGroup: Record<string, CompassAxis[]> = {};
  for (const ax of compassAxes) {
    if (!axesByGroup[ax.group]) axesByGroup[ax.group] = [];
    axesByGroup[ax.group].push(ax);
  }

  // Group user categories by compass assignment
  const catsByCompass: Record<string, LifeCategoryLike[]> = {};
  const unassigned: LifeCategoryLike[] = [];
  for (const cat of lifeCategories) {
    if (cat.compass) {
      if (!catsByCompass[cat.compass]) catsByCompass[cat.compass] = [];
      catsByCompass[cat.compass].push(cat);
    } else {
      unassigned.push(cat);
    }
  }

  function selectTag(tag: TagValue) {
    onChange(tag);
    onClose();
  }

  return (
    <div ref={ref} className="relative shrink-0" style={{ zIndex: open ? 50 : 'auto' }}>
      {/* Trigger — single losange → three losanges → dropdown */}
      <div className="flex items-center gap-1.5">
        {!showThree && !open && (
          <button
            type="button"
            onClick={() => {
              if (value) {
                onToggle();
              } else {
                setShowThree(true);
              }
            }}
            aria-label={value ? `Tag: ${value.name} (tap to change)` : 'Tag with a category'}
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-all"
            style={{
              background: value ? `${value.color}15` : 'transparent',
              border: value ? `1px solid ${value.color}60` : 'none',
            }}
          >
            {value ? (
              <>
                <span
                  className="rotate-45 rounded-[2px]"
                  style={{
                    display: 'block',
                    width: 8,
                    height: 8,
                    background: value.color,
                  }}
                />
                <span
                  style={{
                    color: value.color,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    lineHeight: 1,
                    maxWidth: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {value.name}
                </span>
              </>
            ) : (
              <span
                className="rotate-45 rounded-[2px] transition-all"
                style={{
                  display: 'block',
                  width: 11,
                  height: 11,
                  background: '#C4A060',
                  opacity: 0.5,
                }}
              />
            )}
          </button>
        )}

        {/* Three compass losanges — intermediate step */}
        {showThree && !open && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            {COMPASSES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setShowThree(false);
                  setExpandedCompass(c.id);
                  onToggle();
                }}
                className="cursor-pointer transition-all hover:scale-125"
                style={{ background: 'none', border: 'none', padding: 2 }}
                title={c.label}
              >
                <span
                  className="rotate-45 rounded-[2px] block transition-all"
                  style={{
                    width: 12,
                    height: 12,
                    background: c.color,
                    opacity: 0.85,
                  }}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowThree(false)}
              className="cursor-pointer text-xs transition-all"
              style={{ background: 'none', border: 'none', color: '#8A6A4A', opacity: 0.4 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* When dropdown is open, show selected compass losange */}
        {open && (
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 2 }}
          >
            <span
              className="rotate-45 rounded-[2px] block"
              style={{
                width: 11,
                height: 11,
                background: expandedCompass
                  ? COMPASSES.find((c) => c.id === expandedCompass)?.color || '#C4A060'
                  : '#C4A060',
                opacity: 0.85,
              }}
            />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-1 animate-in fade-in duration-150 overflow-hidden rounded-xl"
          style={{
            background: '#F5ECDC',
            border: '1px solid #8A6A4A30',
            boxShadow: '0 10px 28px rgba(92, 48, 24, 0.18)',
            minWidth: 200,
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {/* Remove tag */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                onClose();
              }}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left italic transition-all hover:bg-muted/30"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#8A6A4A',
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
              }}
            >
              × remove tag
            </button>
          )}

          {/* Three compass losanges — beautiful full panel */}
          <div className="flex items-center justify-center gap-6 py-4">
            {COMPASSES.map((c) => {
              const isActive = expandedCompass === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setExpandedCompass(isActive ? null : c.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span
                    className="rotate-45 rounded-[2px] block transition-all"
                    style={{
                      width: isActive ? 20 : 16,
                      height: isActive ? 20 : 16,
                      background: c.color,
                      opacity: isActive ? 1 : 0.6,
                      boxShadow: isActive ? `0 3px 10px -3px ${c.color}` : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: c.color,
                      opacity: isActive ? 1 : 0.5,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded compass content */}
          {expandedCompass && (
            <div className="animate-in fade-in duration-150 pb-2">
              {/* Compass axes */}
              {(
                axesByGroup[expandedCompass.charAt(0).toUpperCase() + expandedCompass.slice(1)] ||
                []
              ).map((ax) => (
                <OptionRow
                  key={`ax-${ax.name}`}
                  active={value?.name === ax.name}
                  onClick={() => selectTag({ name: ax.name, color: ax.color })}
                  color={ax.color}
                  label={ax.name}
                />
              ))}

              {/* User categories assigned to this compass */}
              {(catsByCompass[expandedCompass] || []).length > 0 && (
                <>
                  <Divider />
                  {(catsByCompass[expandedCompass] || []).map((cat) => (
                    <OptionRow
                      key={cat.id}
                      active={value?.categoryId === cat.id}
                      onClick={() =>
                        selectTag({ name: cat.name, color: cat.color, categoryId: cat.id })
                      }
                      color={cat.color}
                      label={cat.name}
                    />
                  ))}
                </>
              )}

              {/* Unassigned user categories show under any expanded compass */}
              {unassigned.length > 0 && (
                <>
                  <Divider />
                  <GroupHeader label="Your categories" />
                  {unassigned.map((cat) => (
                    <OptionRow
                      key={cat.id}
                      active={value?.categoryId === cat.id}
                      onClick={() =>
                        selectTag({ name: cat.name, color: cat.color, categoryId: cat.id })
                      }
                      color={cat.color}
                      label={cat.name}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* If nothing expanded and no value, show hint */}
          {!expandedCompass && !value && lifeCategories.length === 0 && (
            <p
              className="px-3 py-3 text-center italic"
              style={{
                color: '#8A6A4A',
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                opacity: 0.7,
              }}
            >
              Tap a compass to tag your note.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="mx-3 my-1 h-px" style={{ background: '#8A6A4A15' }} />;
}

function GroupHeader({ label }: { label: string }) {
  return (
    <p
      className="uppercase"
      style={{
        padding: '6px 12px 2px',
        color: '#8A6A4A',
        fontFamily: 'var(--font-serif)',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.16em',
        opacity: 0.65,
      }}
    >
      {label}
    </p>
  );
}

function OptionRow({
  active,
  onClick,
  color,
  label,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-muted/30"
      style={{
        border: 'none',
        background: active ? `${color}15` : 'transparent',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          opacity: active ? 1 : 0.85,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          fontWeight: active ? 700 : 500,
          color: active ? color : '#5C3018',
        }}
      >
        {label}
      </span>
    </button>
  );
}
