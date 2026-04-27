'use client';

export const DOING_CATEGORIES = [
  { id: 'people', label: 'People', color: '#D4805A' },
  { id: 'org', label: 'Organisation', color: '#6890B0' },
  { id: 'creative', label: 'Creative', color: '#9B6BA0' },
  { id: 'body', label: 'Body', color: '#7A9A7A' },
] as const;

export type DoingCategory = (typeof DOING_CATEGORIES)[number]['id'];

interface DoingCategoryRailProps {
  selected: DoingCategory[];
  onToggle: (cat: DoingCategory) => void;
}

export default function DoingCategoryRail({ selected, onToggle }: DoingCategoryRailProps) {
  const allActive = selected.length === 0 || selected.length === DOING_CATEGORIES.length;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {DOING_CATEGORIES.map(({ id, label, color }) => {
        const active = allActive || selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-all"
            style={{
              background: active ? `${color}18` : 'transparent',
              border: `1.5px solid ${active ? color : `${color}30`}`,
              opacity: active ? 1 : 0.45,
            }}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: color, opacity: active ? 1 : 0.5 }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: active ? color : `${color}90`, fontFamily: 'var(--font-serif)' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
