'use client';

/* ═══════════════════════════════════════════════════════════
   CATEGORY TAG PICKER — small losange button that opens a
   vertical list of taggable categories (user's LifeCategories
   plus the compass axes from Caring / Doing / Sharing).
   Used on Challenge and Flow inputs in the Logbook & Emotions
   pillbox so each note can be connected to a category.
   ═══════════════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react';

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
}

export interface CompassAxis {
  name: string;
  color: string;
  group: string;
}

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

  // Click-outside closes the dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Group compass axes by compass for the dropdown
  const axesByGroup: Record<string, CompassAxis[]> = {};
  for (const ax of compassAxes) {
    if (!axesByGroup[ax.group]) axesByGroup[ax.group] = [];
    axesByGroup[ax.group].push(ax);
  }

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger — tiny losange (warm brown) */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={value ? `Tag: ${value.name} (tap to change)` : 'Tag with a category'}
        className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 transition-all"
        style={{
          background: value ? `${value.color}15` : 'transparent',
          border: value ? `1px solid ${value.color}60` : '1px dashed #8A6A4A60',
        }}
      >
        <span
          className="rotate-45"
          style={{
            display: 'block',
            width: 8,
            height: 8,
            background: value ? value.color : '#8A6A4A',
            borderRadius: 1,
          }}
        />
        {value && (
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
        )}
      </button>

      {/* Dropdown — vertical list grouped by source. Opaque so it cleanly
          sits above whatever text lives underneath. */}
      {open && (
        <div
          className="absolute right-0 z-30 mt-1 animate-in fade-in duration-150 overflow-hidden rounded-xl"
          style={{
            background: '#F5ECDC',
            border: '1px solid #8A6A4A30',
            boxShadow: '0 10px 28px rgba(92, 48, 24, 0.18)',
            minWidth: 180,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
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

          {lifeCategories.length > 0 && <GroupHeader label="Your categories" />}
          {lifeCategories.map((cat) => (
            <OptionRow
              key={cat.id}
              active={value?.categoryId === cat.id}
              onClick={() => {
                onChange({ name: cat.name, color: cat.color, categoryId: cat.id });
                onClose();
              }}
              color={cat.color}
              label={cat.name}
            />
          ))}

          {Object.entries(axesByGroup).map(([group, axes]) => (
            <div key={group}>
              <GroupHeader label={group} />
              {axes.map((ax) => (
                <OptionRow
                  key={`${group}-${ax.name}`}
                  active={value?.name === ax.name}
                  onClick={() => {
                    onChange({ name: ax.name, color: ax.color });
                    onClose();
                  }}
                  color={ax.color}
                  label={ax.name}
                />
              ))}
            </div>
          ))}

          {lifeCategories.length === 0 && compassAxes.length === 0 && (
            <p
              className="px-3 py-3 text-center italic"
              style={{
                color: '#8A6A4A',
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                opacity: 0.7,
              }}
            >
              Name a life category to tag your notes.
            </p>
          )}
        </div>
      )}
    </div>
  );
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
