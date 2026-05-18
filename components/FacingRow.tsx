'use client';

type FacingTracker = {
  id: string;
  label: string;
  color: string;
  letter: string;
};

interface FacingRowProps {
  activeId: string;
  trackers: readonly FacingTracker[];
  onSelect: (id: string) => void;
}

export default function FacingRow({ activeId, trackers, onSelect }: FacingRowProps) {
  const lightPillText = 'var(--light-pill-text, var(--light-surface-text, #5C3018))';
  const lightPillMuted = 'var(--light-pill-muted, var(--light-surface-muted, #7A5438))';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {trackers.map((tracker) => {
          const isActive = tracker.id === activeId;

          return (
            <button
              key={tracker.id}
              type="button"
              onClick={() => onSelect(tracker.id)}
              aria-pressed={isActive}
              aria-label={`Facing ${tracker.label}`}
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold italic transition-all"
              style={{
                background: isActive ? tracker.color : `${tracker.color}30`,
                color: isActive ? '#fffaf2' : lightPillText,
                boxShadow: isActive ? `0 8px 20px -12px ${tracker.color}` : 'none',
              }}
            >
              {tracker.letter}
            </button>
          );
        })}
      </div>
      <p
        className="text-center text-xs font-semibold uppercase tracking-[0.26em]"
        style={{ color: lightPillMuted }}
      >
        FACING
      </p>
    </div>
  );
}
