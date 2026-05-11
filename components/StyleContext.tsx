'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

/* ── Typography presets (unchanged from before) ── */
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
  weight: { title: number; label: number; body: number };
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

/* ── Tab style ── */
export type TabStyle = 'classic' | 'filled';
export type AppTheme = 'paper' | 'night';

export const TAB_FILL_COLORS = [
  { label: 'Brown', value: '#5C3018' },
  { label: 'Gold', value: '#A07828' },
  { label: 'Slate', value: '#3A5A7A' },
  { label: 'Forest', value: '#3A6A4A' },
  { label: 'Burgundy', value: '#6A2A3A' },
  { label: 'Charcoal', value: '#3A3A3A' },
];

interface StyleContextValue {
  style: StyleConfig;
  setPreset: (id: StylePreset) => void;
  tabStyle: TabStyle;
  setTabStyle: (s: TabStyle) => void;
  tabFillColor: string;
  setTabFillColor: (c: string) => void;
  appTheme: AppTheme;
  setAppTheme: (t: AppTheme) => void;
}

const StyleContext = createContext<StyleContextValue>({
  style: STYLE_PRESETS[0],
  setPreset: () => {},
  tabStyle: 'classic',
  setTabStyle: () => {},
  tabFillColor: '#5C3018',
  setTabFillColor: () => {},
  appTheme: 'paper',
  setAppTheme: () => {},
});

function ls(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function StyleProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<StylePreset>(
    () => ls('colourmap:style-preset', 'handwritten') as StylePreset,
  );
  const [tabStyle, setTabStyleState] = useState<TabStyle>(
    () => ls('colourmap:tab-style', 'classic') as TabStyle,
  );
  const [tabFillColor, setTabFillColorState] = useState(() =>
    ls('colourmap:tab-fill-color', '#5C3018'),
  );
  const [appTheme, setAppThemeState] = useState<AppTheme>(
    () => ls('colourmap:app-theme', 'paper') as AppTheme,
  );

  /* Apply night mode class to <html> */
  useEffect(() => {
    const root = document.documentElement;
    if (appTheme === 'night') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [appTheme]);

  const style = STYLE_PRESETS.find((s) => s.id === preset) ?? STYLE_PRESETS[0];

  function setPreset(id: StylePreset) {
    setPresetState(id);
    try {
      localStorage.setItem('colourmap:style-preset', id);
    } catch {}
  }
  function setTabStyle(s: TabStyle) {
    setTabStyleState(s);
    try {
      localStorage.setItem('colourmap:tab-style', s);
    } catch {}
  }
  function setTabFillColor(c: string) {
    setTabFillColorState(c);
    try {
      localStorage.setItem('colourmap:tab-fill-color', c);
    } catch {}
  }
  function setAppTheme(t: AppTheme) {
    setAppThemeState(t);
    try {
      localStorage.setItem('colourmap:app-theme', t);
    } catch {}
  }

  return (
    <StyleContext.Provider
      value={{
        style,
        setPreset,
        tabStyle,
        setTabStyle,
        tabFillColor,
        setTabFillColor,
        appTheme,
        setAppTheme,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  return useContext(StyleContext);
}
