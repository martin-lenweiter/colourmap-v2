'use client';

import { useEffect, useState } from 'react';
import GuitarStudio from '@/components/GuitarStudio';
import SoundLab from '@/components/SoundLab';
import { useStyle } from '@/components/StyleContext';

const SECTIONS = [
  { id: 'studio', label: 'Music Studio' },
  { id: 'guitar', label: 'Guitar Studio' },
] as const;

type Section = (typeof SECTIONS)[number]['id'];

const LS_KEY = 'colourmap:music-section';

export default function MusicPage() {
  const { style } = useStyle();
  const [section, setSection] = useState<Section>('studio');

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY) === 'guitar') setSection('guitar');
    } catch {}
  }, []);

  function pick(id: Section) {
    setSection(id);
    try {
      localStorage.setItem(LS_KEY, id);
    } catch {}
  }

  return (
    <div className="space-y-5 px-4 pb-10 pt-4">
      {/* Page title */}
      <h1
        style={{
          fontFamily: style.headingFont,
          fontSize: 26,
          fontWeight: 700,
          color: '#5C3018',
          letterSpacing: '0.04em',
        }}
      >
        Music
      </h1>

      {/* Section toggle */}
      <div className="flex gap-2">
        {SECTIONS.map((s) => {
          const isActive = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s.id)}
              className="flex-1 cursor-pointer rounded-2xl py-2.5 uppercase tracking-[0.14em] transition-all duration-200"
              style={{
                background: isActive ? '#C4A06018' : 'transparent',
                border: `1.5px solid ${isActive ? '#C4A060' : 'hsl(var(--border) / 0.25)'}`,
                color: isActive ? '#5C3018' : 'hsl(var(--foreground))',
                fontFamily: style.headingFont,
                fontSize: '16px',
                fontWeight: 700,
                minHeight: 48,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-200">
        {section === 'studio' && <SoundLab />}
        {section === 'guitar' && <GuitarStudio />}
      </div>
    </div>
  );
}
