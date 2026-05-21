'use client';

import { useEffect, useState } from 'react';

// Fallback categories used when the user hasn't set up life categories yet
export const DOING_CATEGORIES = [
  { id: 'people', label: 'People', color: '#D4805A' },
  { id: 'org', label: 'Organisation', color: '#6890B0' },
  { id: 'creative', label: 'Creative', color: '#9B6BA0' },
  { id: 'body', label: 'Body', color: '#7A9A7A' },
] as const;

export type DoingCategory = (typeof DOING_CATEGORIES)[number]['id'];

const CATS_KEY = 'colourmap:life-categories';

interface LifeCat {
  id: string;
  name: string;
  color: string;
}

function loadLifeCategories(): LifeCat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface DoingCategoryRailProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function DoingCategoryRail({ selected, onToggle }: DoingCategoryRailProps) {
  const [lifeCats, setLifeCats] = useState<LifeCat[]>([]);

  useEffect(() => {
    setLifeCats(loadLifeCategories());
    function onStorage(e: StorageEvent) {
      if (e.key === CATS_KEY) setLifeCats(loadLifeCategories());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const cats: LifeCat[] =
    lifeCats.length > 0
      ? lifeCats
      : DOING_CATEGORIES.map((c) => ({ id: c.id, name: c.label, color: c.color }));

  const allActive = selected.length === 0 || selected.length === cats.length;

  return (
    <div className="flex items-stretch gap-2 overflow-x-auto py-1">
      {cats.map(({ id, name, color }) => {
        const active = allActive || selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            title={name}
            className="shrink-0 rounded-full transition-all"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 54,
              minWidth: 86,
              maxWidth: 132,
              padding: '7px 9px',
              background: active
                ? `color-mix(in srgb, ${color} 18%, var(--card))`
                : 'color-mix(in srgb, var(--card) 70%, transparent)',
              border: active
                ? `1.5px solid ${color}`
                : '1px solid color-mix(in srgb, var(--foreground) 18%, transparent)',
              color: 'var(--foreground)',
              opacity: active ? 1 : 0.78,
              fontFamily: 'var(--font-serif)',
              fontSize: 13.5,
              fontWeight: 900,
              lineHeight: 1.08,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
                boxShadow: active
                  ? `0 0 0 4px color-mix(in srgb, ${color} 18%, transparent)`
                  : 'none',
              }}
            />
            <span
              style={{
                minWidth: 0,
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                textAlign: 'center',
              }}
            >
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
