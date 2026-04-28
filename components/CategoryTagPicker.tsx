'use client';

/* ═══════════════════════════════════════════════════════════
   CATEGORY TAG PICKER — 3-dot compass entry point.
   Three coloured dots (Feeling / Doing / Sharing). Tap one
   to tag directly, or expand to see your life categories.
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';

export interface TagValue {
  name: string;
  color: string;
  /** Set when the tag came from a LifeCategory (not a compass). */
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

// Compass dot palette per Martin 2026-04-24:
//   feeling → warm orange · doing → ochre · sharing → warm olive/army.
const COMPASSES = [
  { id: 'caring', label: 'Feeling', color: '#E07840' },
  { id: 'doing', label: 'Doing', color: '#C4A060' },
  { id: 'sharing', label: 'Sharing', color: '#7B8C4A' },
];

interface Props {
  value: TagValue | null;
  onChange: (value: TagValue | null) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  lifeCategories: LifeCategoryLike[];
  /** @deprecated No longer used — kept for backwards compat */
  compassAxes?: CompassAxis[];
}

export default function CategoryTagPicker({
  value,
  onChange,
  open,
  onToggle,
  onClose,
  lifeCategories,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  function selectTag(tag: TagValue) {
    onChange(tag);
    onClose();
  }

  return (
    <div ref={ref} className="relative shrink-0" style={{ zIndex: open ? 50 : 'auto' }}>
      {/* Three decorative dots — tap anywhere to open the picker.
          When a tag is selected the active dot lights up in its color. */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={value ? `Tag: ${value.name} (tap to change)` : 'Tag with a category'}
        className="flex cursor-pointer items-center gap-[5px] py-1 px-1 transition-opacity hover:opacity-70"
        style={{ background: 'none', border: 'none' }}
      >
        {COMPASSES.map((c) => {
          const isActive = value?.name === c.label;
          return (
            <span
              key={c.id}
              className="block rounded-full transition-all"
              style={{
                width: isActive ? 9 : 7,
                height: isActive ? 9 : 7,
                background: isActive ? c.color : '#C4A060',
                opacity: isActive ? 1 : 0.28,
                flexShrink: 0,
              }}
            />
          );
        })}
      </button>

      {/* Dropdown — 3 compass dots + user categories */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-1 animate-in fade-in duration-150 overflow-hidden rounded-xl"
          style={{
            background: '#F5ECDC',
            border: '1px solid #8A6A4A30',
            boxShadow: '0 10px 28px rgba(92, 48, 24, 0.18)',
            minWidth: 180,
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

          {/* Three compass dots — the primary picker. Bigger than before
              (22/26px) with the label right under each dot so it reads
              at a glance on phone. */}
          <div className="flex items-center justify-center gap-7 px-4 py-4">
            {COMPASSES.map((c) => {
              const isActive = value?.name === c.label;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectTag({ name: c.label, color: c.color })}
                  className="flex cursor-pointer flex-col items-center gap-2 transition-all"
                  style={{ background: 'none', border: 'none' }}
                >
                  <span
                    className="block rounded-full transition-all"
                    style={{
                      width: isActive ? 26 : 22,
                      height: isActive ? 26 : 22,
                      background: c.color,
                      opacity: isActive ? 1 : 0.75,
                      boxShadow: isActive ? `0 4px 12px -3px ${c.color}` : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: c.color,
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User life categories */}
          {lifeCategories.length > 0 && (
            <>
              <Divider />
              <GroupHeader label="Your categories" />
              {lifeCategories.map((cat) => (
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

          {/* Hint when no categories */}
          {lifeCategories.length === 0 && !value && (
            <p
              className="px-3 py-2 text-center italic"
              style={{
                color: '#8A6A4A',
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                opacity: 0.5,
              }}
            >
              tap a dot to tag
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
