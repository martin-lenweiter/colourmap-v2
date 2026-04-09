'use client';

import { createContext, type ReactNode, useContext, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   STYLE CONTEXT — Global typography & visual style system
   One toggle changes everything across the entire Day page.
   ═══════════════════════════════════════════════════════════ */

export type StylePreset = 'handwritten' | 'cowboy' | 'oldschool' | 'groovy' | 'sketch';

export interface StyleConfig {
  id: StylePreset;
  name: string;
  font: string;
  headingFont: string;
  titleSize: string;
  labelSize: string;
  bodySize: string;
  inputSize: string;
  weight: {
    title: number;
    label: number;
    body: number;
  };
  letterSpacing: string;
  color: string;
}

export const STYLE_PRESETS: StyleConfig[] = [
  {
    id: 'handwritten',
    name: 'Handwritten',
    font: 'var(--font-handwritten)',
    headingFont: 'var(--font-serif)',
    titleSize: '13px',
    labelSize: '17px',
    bodySize: '14px',
    inputSize: '14px',
    weight: { title: 600, label: 700, body: 400 },
    letterSpacing: 'normal',
    color: '#C4A060',
  },
  {
    id: 'cowboy',
    name: 'Cowboy',
    font: 'var(--font-cowboy)',
    headingFont: 'var(--font-cowboy)',
    titleSize: '13px',
    labelSize: '16px',
    bodySize: '13px',
    inputSize: '13px',
    weight: { title: 700, label: 700, body: 400 },
    letterSpacing: '0.04em',
    color: '#8A7050',
  },
  {
    id: 'oldschool',
    name: 'Old School',
    font: 'var(--font-serif)',
    headingFont: 'var(--font-serif)',
    titleSize: '14px',
    labelSize: '17px',
    bodySize: '14px',
    inputSize: '14px',
    weight: { title: 600, label: 600, body: 400 },
    letterSpacing: '0.02em',
    color: '#6B4830',
  },
  {
    id: 'groovy',
    name: 'Groovy',
    font: 'var(--font-groovy)',
    headingFont: 'var(--font-groovy)',
    titleSize: '14px',
    labelSize: '18px',
    bodySize: '14px',
    inputSize: '14px',
    weight: { title: 400, label: 400, body: 400 },
    letterSpacing: '0.01em',
    color: '#C4A060',
  },
  {
    id: 'sketch',
    name: 'Sketch',
    font: 'var(--font-sketch)',
    headingFont: 'var(--font-sketch)',
    titleSize: '14px',
    labelSize: '17px',
    bodySize: '14px',
    inputSize: '14px',
    weight: { title: 700, label: 700, body: 400 },
    letterSpacing: 'normal',
    color: '#7A5A3A',
  },
];

interface StyleContextValue {
  style: StyleConfig;
  setPreset: (id: StylePreset) => void;
}

const StyleContext = createContext<StyleContextValue>({
  style: STYLE_PRESETS[0],
  setPreset: () => {},
});

export function StyleProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<StylePreset>(() => {
    if (typeof window === 'undefined') return 'handwritten';
    try {
      return (localStorage.getItem('colourmap:style-preset') as StylePreset) || 'handwritten';
    } catch {
      return 'handwritten';
    }
  });

  const style = STYLE_PRESETS.find((s) => s.id === preset) || STYLE_PRESETS[0];

  function setPreset(id: StylePreset) {
    setPresetState(id);
    localStorage.setItem('colourmap:style-preset', id);
  }

  return <StyleContext.Provider value={{ style, setPreset }}>{children}</StyleContext.Provider>;
}

export function useStyle() {
  return useContext(StyleContext);
}
