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
    <div className="flex items-center gap-3">
      {cats.map(({ id, name, color }) => {
        const active = allActive || selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            title={name}
            className="shrink-0 rounded-full transition-all hover:scale-125"
            style={{
              width: 12,
              height: 12,
              background: active ? color : 'transparent',
              border: `2px solid ${active ? color : `${color}55`}`,
              opacity: active ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}
