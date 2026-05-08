'use client';

import { useEffect, useState } from 'react';

const COLOR_THEMES = [
  { id: 'paper', label: 'Paper', className: '', color: '#F2E8D0' },
  { id: 'golden', label: 'Golden', className: 'golden', color: '#E8C97A' },
  { id: 'night', label: 'Night', className: 'dark', color: '#150C04' },
  {
    id: 'night-brown',
    label: 'Night Brown',
    className: 'dark night-brown',
    color: '#2A1608',
  },
  { id: 'night-blue', label: 'Night Blue', className: 'dark night-blue', color: '#0A1A2E' },
  {
    id: 'night-purple',
    label: 'Night Purple',
    className: 'dark night-purple',
    color: '#1E0E34',
  },
  { id: 'comic-blue', label: 'Comic Blue', className: 'dark comic-blue', color: '#0d1a2e' },
  { id: 'comic-green', label: 'Comic Green', className: 'dark comic-green', color: '#111a0a' },
] as const;

const HEADER_THEMES = [
  {
    id: 'beige',
    label: 'Soft Beige',
    bg: 'rgba(242,232,208,0.97)',
    border: 'rgba(196,160,96,0.18)',
    text: '#5C3018',
    textInactive: 'rgba(92,48,24,0.55)',
    swatch: '#EDE4CC',
  },
  {
    id: 'brown',
    label: 'Brown',
    bg: 'rgba(30,16,8,0.92)',
    border: 'rgba(196,160,96,0.22)',
    text: '#C8A858',
    textInactive: 'rgba(200,168,88,0.55)',
    swatch: '#1E1008',
  },
  {
    id: 'olive',
    label: 'Olive Green',
    bg: 'rgba(18,26,8,0.92)',
    border: 'rgba(140,168,80,0.22)',
    text: '#C8A858',
    textInactive: 'rgba(200,168,88,0.55)',
    swatch: '#121A08',
  },
  {
    id: 'navy',
    label: 'Deep Navy',
    bg: 'rgba(4,12,30,0.92)',
    border: 'rgba(80,120,200,0.22)',
    text: '#C8A858',
    textInactive: 'rgba(200,168,88,0.55)',
    swatch: '#040C1E',
  },
  {
    id: 'burgundy',
    label: 'Burgundy',
    bg: 'rgba(30,8,18,0.92)',
    border: 'rgba(180,80,100,0.22)',
    text: '#C8A858',
    textInactive: 'rgba(200,168,88,0.55)',
    swatch: '#1E0812',
  },
] as const;

type ColorId = (typeof COLOR_THEMES)[number]['id'];
type HeaderId = (typeof HEADER_THEMES)[number]['id'];

function applyColorTheme(id: ColorId) {
  const theme = COLOR_THEMES.find((t) => t.id === id);
  if (!theme) return;
  const html = document.documentElement;
  for (const t of COLOR_THEMES) {
    for (const cls of t.className.split(' ').filter(Boolean)) {
      html.classList.remove(cls);
    }
  }
  for (const cls of theme.className.split(' ').filter(Boolean)) {
    html.classList.add(cls);
  }
  localStorage.setItem('colourmap-theme', id);
  document.documentElement.style.setProperty('--theme-dot-color', theme.color);
}

function applyHeaderTheme(id: HeaderId) {
  const theme = HEADER_THEMES.find((t) => t.id === id);
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty('--header-bg', theme.bg);
  root.style.setProperty('--header-border', theme.border);
  root.style.setProperty('--header-text', theme.text);
  localStorage.setItem('colourmap-header', id);
}

function applyFullHeader(on: boolean) {
  document.documentElement.style.setProperty('--nav-bg', on ? 'var(--header-bg)' : '#d4b896');
  localStorage.setItem('colourmap-full-header', on ? '1' : '0');
}

export default function ThemeSwitcher() {
  const [colorActive, setColorActive] = useState<ColorId>('paper');
  const [headerActive, setHeaderActive] = useState<HeaderId>('brown');
  const [fullHeader, setFullHeader] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'color' | 'header'>('color');

  useEffect(() => {
    const savedColor = localStorage.getItem('colourmap-theme') as ColorId | null;
    if (savedColor && COLOR_THEMES.some((t) => t.id === savedColor)) {
      setColorActive(savedColor);
      applyColorTheme(savedColor);
    }
    const savedHeaderId = (localStorage.getItem('colourmap-header') ?? 'brown') as HeaderId;
    const resolvedId = HEADER_THEMES.some((t) => t.id === savedHeaderId) ? savedHeaderId : 'brown';
    setHeaderActive(resolvedId);
    applyHeaderTheme(resolvedId);
    const fh = localStorage.getItem('colourmap-full-header') === '1';
    setFullHeader(fh);
    applyFullHeader(fh);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const _activeColor = COLOR_THEMES.find((t) => t.id === colorActive) ?? COLOR_THEMES[0];

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center transition-colors hover:opacity-70"
        aria-label="Design settings"
      >
        <div
          className="h-5 w-5 rounded-full border border-border"
          style={{ backgroundColor: '#C4A060' }}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-8 z-50 rounded-xl p-2 shadow-lg animate-in fade-in duration-150 min-w-[180px]"
          style={{ background: '#fbf3d8', border: '1px solid rgba(160,110,40,0.18)' }}
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={() => setTab('color')}
              className={`flex-1 text-xs py-1 rounded-lg transition-colors ${tab === 'color' ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/50'}`}
            >
              Color
            </button>
            <button
              type="button"
              onClick={() => setTab('header')}
              className={`flex-1 text-xs py-1 rounded-lg transition-colors ${tab === 'header' ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/50'}`}
            >
              Header
            </button>
          </div>

          {/* Color options */}
          {tab === 'color' && (
            <div className="flex flex-col gap-1">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    colorActive === theme.id ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    setColorActive(theme.id);
                    applyColorTheme(theme.id);
                  }}
                >
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-border"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Header options */}
          {tab === 'header' && (
            <div className="flex flex-col gap-1">
              {HEADER_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    headerActive === theme.id ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    setHeaderActive(theme.id);
                    applyHeaderTheme(theme.id);
                  }}
                >
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-border flex items-center justify-center"
                    style={{ backgroundColor: theme.swatch }}
                  >
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: theme.text }}
                    />
                  </div>
                  <span>{theme.label}</span>
                </button>
              ))}
              <div className="mt-1 pt-1" style={{ borderTop: '1px solid rgba(160,110,40,0.14)' }}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    fullHeader
                      ? 'bg-accent font-medium'
                      : 'hover:bg-accent/50 text-muted-foreground'
                  }`}
                  onClick={() => {
                    const next = !fullHeader;
                    setFullHeader(next);
                    applyFullHeader(next);
                  }}
                >
                  <span className="flex-1 text-left">Full Header</span>
                  <span style={{ opacity: fullHeader ? 1 : 0.45 }}>
                    {fullHeader ? 'on' : 'off'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
