'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStyle } from '@/components/StyleContext';

const COLOR_THEMES = [
  { id: 'paper', label: 'Paper', className: '', color: '#F2E8D0' },
  { id: 'golden', label: 'Golden', className: 'golden', color: '#E8C97A' },
  { id: 'night', label: 'Night', className: 'dark', color: '#150C04' },
  { id: 'night-brown', label: 'Night Brown', className: 'dark night-brown', color: '#2A1608' },
  { id: 'night-blue', label: 'Night Blue', className: 'dark night-blue', color: '#0A1A2E' },
  { id: 'night-purple', label: 'Night Purple', className: 'dark night-purple', color: '#1E0E34' },
  { id: 'comic-blue', label: 'Comic Blue', className: 'dark comic-blue', color: '#0d1a2e' },
  { id: 'comic-green', label: 'Comic Green', className: 'dark comic-green', color: '#111a0a' },
] as const;

/* ── Palette type ──────────────────────────────────────────── */
interface PaletteEntry {
  id: string;
  label: string;
  swatch: string;
  header: { bg: string; border: string; text: string };
  tab: string;
  panelBorder: string;
  l1: string;
  l2: string;
  l3: string;
  tabActiveBg?: string;
  tabInactiveBg?: string;
  tabActiveText?: string;
  tabInactiveText?: string;
  panelText?: string;
  panelMuted?: string;
  light?: boolean;
  quickPresets?: Array<Partial<Record<'l1' | 'l2' | 'l3', string>>>;
}

const PALETTES: PaletteEntry[] = [
  /* ── 3 Browns ─────────────────────────────────────────────── */
  {
    id: 'brown',
    label: 'Brown',
    swatch: '#1E1008',
    header: { bg: 'rgba(30,16,8,0.92)', border: 'rgba(196,160,96,0.22)', text: '#C8A858' },
    tab: '#5C3018',
    panelBorder: 'rgba(196,160,96,0.18)',
    l1: 'rgba(30,16,8,0.82)',
    l2: 'rgba(30,16,8,0.62)',
    l3: 'rgba(30,16,8,0.44)',
    tabActiveBg: 'rgba(30,16,8,0.88)',
    tabInactiveBg: 'rgba(30,16,8,0.28)',
    tabActiveText: 'rgba(196,160,96,0.92)',
    tabInactiveText: 'rgba(196,160,96,0.42)',
    quickPresets: [
      { l1: 'b2', l2: 'b2', l3: 'b2' },
      { l1: 'b3', l2: 'b3', l3: 'b3' },
      { l1: 'b4', l2: 'b4', l3: 'b4' },
    ],
  },
  {
    id: 'light-brown',
    label: 'Beige',
    swatch: '#D4B896',
    header: { bg: 'rgba(212,184,150,0.96)', border: 'rgba(156,108,56,0.32)', text: '#3A1A06' },
    tab: '#8A6030',
    panelBorder: 'rgba(156,108,56,0.25)',
    l1: 'rgba(212,184,150,0.96)',
    l2: 'rgba(212,184,150,0.96)',
    l3: 'rgba(212,184,150,0.96)',
    tabActiveBg: 'rgba(212,184,150,0.96)',
    tabInactiveBg: 'rgba(212,184,150,0.52)',
    tabActiveText: '#3A1A06',
    tabInactiveText: 'rgba(30,16,8,0.88)',
    panelText: '#3A1A06',
    panelMuted: 'rgba(58,26,6,0.62)',
    light: true,
    quickPresets: [
      { l1: 'b5', l2: 'b5', l3: 'b5' },
      { l1: 'b6', l2: 'b6', l3: 'b6' },
      { l1: 'b7', l2: 'b7', l3: 'b7' },
    ],
  },
  /* ── Other palettes ─────────────────────────────────────── */
  {
    id: 'navy',
    label: 'Navy',
    swatch: '#040C1E',
    header: { bg: 'rgba(4,12,30,0.92)', border: 'rgba(80,120,200,0.22)', text: '#C8A858' },
    tab: '#3A5A7A',
    panelBorder: 'rgba(80,120,200,0.18)',
    l1: 'rgba(4,12,30,0.82)',
    l2: 'rgba(4,12,30,0.62)',
    l3: 'rgba(4,12,30,0.44)',
    quickPresets: [
      { l1: 'n1', l2: 'n1', l3: 'n1' },
      { l1: 'n2', l2: 'n2', l3: 'n2' },
      { l1: 'n3', l2: 'n3', l3: 'n3' },
    ],
  },
  {
    id: 'forest',
    label: 'Forest',
    swatch: '#081408',
    header: { bg: 'rgba(8,20,8,0.92)', border: 'rgba(100,160,100,0.22)', text: '#C8A858' },
    tab: '#3A6A4A',
    panelBorder: 'rgba(100,160,100,0.18)',
    l1: 'rgba(8,20,8,0.82)',
    l2: 'rgba(8,20,8,0.62)',
    l3: 'rgba(8,20,8,0.44)',
    quickPresets: [
      { l1: 'f2', l2: 'f2', l3: 'f2' },
      { l1: 'f3', l2: 'f3', l3: 'f3' },
      { l1: 'f4', l2: 'f4', l3: 'f4' },
    ],
  },
  {
    id: 'burgundy',
    label: 'Burgundy',
    swatch: '#1E0812',
    header: { bg: 'rgba(30,8,18,0.92)', border: 'rgba(180,80,100,0.22)', text: '#C8A858' },
    tab: '#6A2A3A',
    panelBorder: 'rgba(180,80,100,0.18)',
    l1: 'rgba(30,8,18,0.82)',
    l2: 'rgba(30,8,18,0.62)',
    l3: 'rgba(30,8,18,0.44)',
    quickPresets: [
      { l1: 'r2', l2: 'r2', l3: 'r2' },
      { l1: 'r3', l2: 'r3', l3: 'r3' },
      { l1: 'r4', l2: 'r4', l3: 'r4' },
    ],
  },
  {
    id: 'slate',
    label: 'Slate',
    swatch: '#141820',
    header: { bg: 'rgba(16,22,32,0.92)', border: 'rgba(120,140,180,0.22)', text: '#C8A858' },
    tab: '#3A4A5A',
    panelBorder: 'rgba(120,140,180,0.18)',
    l1: 'rgba(16,22,32,0.82)',
    l2: 'rgba(16,22,32,0.62)',
    l3: 'rgba(16,22,32,0.44)',
    quickPresets: [
      { l1: 's1', l2: 's1', l3: 's1' },
      { l1: 's2', l2: 's2', l3: 's2' },
      { l1: 's3', l2: 's3', l3: 's3' },
    ],
  },
  {
    id: 'beige',
    label: 'Custom',
    swatch: '#EDE4CC',
    header: { bg: 'rgba(242,232,208,0.97)', border: 'rgba(196,160,96,0.18)', text: '#5C3018' },
    tab: '#A07828',
    panelBorder: 'rgba(156,108,56,0.22)',
    l1: 'rgba(242,232,208,0.32)',
    l2: 'rgba(242,232,208,0.20)',
    l3: 'rgba(242,232,208,0.11)',
    panelText: 'rgba(58,26,6,0.88)',
    panelMuted: 'rgba(58,26,6,0.52)',
    light: true,
  },
];

/* ── Deep dive color options — per palette family ──────────── */
type DeepColor = { id: string; swatch: string; base: [number, number, number]; light?: boolean };

const DC_BROWN: DeepColor[] = [
  { id: 'b1', swatch: '#0E0804', base: [14, 8, 4] },
  { id: 'b2', swatch: '#1E1008', base: [30, 16, 8] },
  { id: 'b3', swatch: '#3E1A08', base: [62, 26, 8] },
  { id: 'b4', swatch: '#6A3818', base: [106, 56, 24] },
  { id: 'b5', swatch: '#A87040', base: [168, 112, 64] },
  { id: 'b6', swatch: '#C8A870', base: [200, 168, 112], light: true },
  { id: 'b7', swatch: '#D4B896', base: [212, 184, 150], light: true },
  { id: 'b8', swatch: '#EDE4CC', base: [237, 228, 204], light: true },
];

const DC_NAVY: DeepColor[] = [
  { id: 'n1', swatch: '#020814', base: [2, 8, 20] },
  { id: 'n2', swatch: '#040C1E', base: [4, 12, 30] },
  { id: 'n3', swatch: '#0A1830', base: [10, 24, 48] },
  { id: 'n4', swatch: '#1A2844', base: [26, 40, 68] },
  { id: 'n5', swatch: '#2A3C5A', base: [42, 60, 90] },
  { id: 'n6', swatch: '#6878A0', base: [104, 120, 160] },
  { id: 'n7', swatch: '#B0BAD0', base: [176, 186, 208], light: true },
  { id: 'n8', swatch: '#E0E4EE', base: [224, 228, 238], light: true },
];

const DC_FOREST: DeepColor[] = [
  { id: 'f1', swatch: '#020802', base: [2, 8, 2] },
  { id: 'f2', swatch: '#081408', base: [8, 20, 8] },
  { id: 'f3', swatch: '#102010', base: [16, 32, 16] },
  { id: 'f4', swatch: '#1A3420', base: [26, 52, 32] },
  { id: 'f5', swatch: '#2E5038', base: [46, 80, 56] },
  { id: 'f6', swatch: '#607858', base: [96, 120, 88] },
  { id: 'f7', swatch: '#A8C0A0', base: [168, 192, 160], light: true },
  { id: 'f8', swatch: '#DCF0D8', base: [220, 240, 216], light: true },
];

const DC_BURGUNDY: DeepColor[] = [
  { id: 'r1', swatch: '#0E0206', base: [14, 2, 6] },
  { id: 'r2', swatch: '#1E0812', base: [30, 8, 18] },
  { id: 'r3', swatch: '#300C18', base: [48, 12, 24] },
  { id: 'r4', swatch: '#501828', base: [80, 24, 40] },
  { id: 'r5', swatch: '#7A2838', base: [122, 40, 56] },
  { id: 'r6', swatch: '#A05868', base: [160, 88, 104] },
  { id: 'r7', swatch: '#C8A0A8', base: [200, 160, 168], light: true },
  { id: 'r8', swatch: '#EDD8DC', base: [237, 216, 220], light: true },
];

const DC_SLATE: DeepColor[] = [
  { id: 's1', swatch: '#080A0C', base: [8, 10, 12] },
  { id: 's2', swatch: '#141820', base: [16, 22, 32] },
  { id: 's3', swatch: '#202830', base: [32, 40, 48] },
  { id: 's4', swatch: '#303C48', base: [48, 60, 72] },
  { id: 's5', swatch: '#485668', base: [72, 86, 104] },
  { id: 's6', swatch: '#7888A0', base: [120, 136, 160] },
  { id: 's7', swatch: '#B8C4D0', base: [184, 196, 208], light: true },
  { id: 's8', swatch: '#E4E8EC', base: [228, 232, 236], light: true },
];

const PALETTE_DEEP_COLORS: Record<string, DeepColor[]> = {
  brown: DC_BROWN,
  'warm-brown': DC_BROWN,
  'light-brown': DC_BROWN,
  beige: DC_BROWN,
  navy: DC_NAVY,
  forest: DC_FOREST,
  burgundy: DC_BURGUNDY,
  slate: DC_SLATE,
};

const DEEP_LEVELS = [
  { key: 'l1', label: 'A', sets: [{ var: '--header-bg', alpha: 0.92 }] },
  {
    key: 'l2',
    label: 'B',
    sets: [
      { var: '--palette-tab-active-bg', alpha: 0.88 },
      { var: '--palette-tab-inactive-bg', alpha: 0.28 },
    ],
  },
  { key: 'l3', label: 'C', sets: [{ var: '--palette-l3-bg', alpha: 0.82 }] },
] as const;

type DeepLevelKey = 'l1' | 'l2' | 'l3';

const LS_CUSTOM = 'colourmap-titles-custom-v2';
type LevelCustomIds = Partial<Record<DeepLevelKey, string>>;
type AllCustomIds = Partial<Record<string, LevelCustomIds>>;

type ColorId = (typeof COLOR_THEMES)[number]['id'];
type PaletteId = string;
type PanelTab = 'color' | 'design';

const LIGHT_THEMES: ReadonlySet<ColorId> = new Set(['paper', 'golden']);
const LIGHT_SURFACE_TEXT = 'rgba(30,16,8,0.88)';
const LIGHT_SURFACE_MUTED = 'rgba(30,16,8,0.58)';
const LIGHT_PILL_TEXT = LIGHT_SURFACE_TEXT;
const LIGHT_PILL_MUTED = LIGHT_SURFACE_MUTED;
const DARK_SURFACE_TEXT = 'rgba(196,160,96,0.88)';
const DARK_SURFACE_MUTED = 'rgba(196,160,96,0.55)';

const DARK_AUTO_PALETTE: Partial<Record<ColorId, PaletteId>> = {
  night: 'brown',
  'night-brown': 'brown',
  'night-blue': 'navy',
  'night-purple': 'burgundy',
  'comic-blue': 'slate',
  'comic-green': 'forest',
};

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

function applyPaletteCSS(id: PaletteId) {
  const p = PALETTES.find((p) => p.id === id);
  if (!p) return;
  const root = document.documentElement;
  const set = (prop: string, val?: string) =>
    val ? root.style.setProperty(prop, val) : root.style.removeProperty(prop);
  root.style.setProperty('--light-surface-text', LIGHT_SURFACE_TEXT);
  root.style.setProperty('--light-surface-muted', LIGHT_SURFACE_MUTED);
  root.style.setProperty('--light-pill-text', LIGHT_PILL_TEXT);
  root.style.setProperty('--light-pill-muted', LIGHT_PILL_MUTED);
  root.style.setProperty('--header-bg', p.header.bg);
  root.style.setProperty('--header-border', p.header.border);
  root.style.setProperty('--header-text', p.header.text);
  root.style.setProperty('--panel-border', p.panelBorder);
  root.style.setProperty('--palette-l3-bg', p.l3);
  set('--palette-tab-active-bg', p.tabActiveBg);
  set('--palette-tab-inactive-bg', p.tabInactiveBg);
  set('--palette-tab-active-text', p.tabActiveText);
  set('--palette-tab-inactive-text', p.tabInactiveText);
  /* Panel text follows actual panel depth. Light pills use --light-pill-* instead. */
  root.style.setProperty('--palette-panel-text', p.panelText ?? DARK_SURFACE_TEXT);
  root.style.setProperty('--palette-panel-muted', p.panelMuted ?? DARK_SURFACE_MUTED);
  /* Light palettes override --foreground so typed text in inputs is dark, not golden */
  if (p.light) {
    root.style.setProperty('--foreground', '#2a1a06');
    root.style.setProperty('--card-foreground', '#2a1a06');
    root.style.setProperty('--popover-foreground', '#2a1a06');
    root.style.setProperty('--muted-foreground', '#7a4a18');
    root.style.setProperty('--palette-body-text', 'rgba(30,16,8,0.85)');
    root.style.setProperty('--palette-body-muted', 'rgba(30,16,8,0.52)');
  } else {
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--card-foreground');
    root.style.removeProperty('--popover-foreground');
    root.style.removeProperty('--muted-foreground');
    root.style.setProperty('--palette-body-text', 'rgba(240,216,152,0.85)');
    root.style.setProperty('--palette-body-muted', 'rgba(240,216,152,0.52)');
  }
  localStorage.setItem('colourmap-palette', id);
}

function findDeepColor(colorId: string): DeepColor | undefined {
  for (const set of Object.values(PALETTE_DEEP_COLORS)) {
    const found = set.find((c) => c.id === colorId);
    if (found) return found;
  }
}

function applyCustomLevel(key: DeepLevelKey, colorId: string, palette?: PaletteEntry) {
  const color = findDeepColor(colorId);
  const level = DEEP_LEVELS.find((l) => l.key === key);
  if (!color || !level) return;
  const [r, g, b] = color.base;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const lightLevel = color.light || luminance > 0.42;
  for (const s of level.sets) {
    document.documentElement.style.setProperty(s.var, `rgba(${r},${g},${b},${s.alpha})`);
  }
  if (key === 'l3') {
    const root = document.documentElement;
    if (lightLevel) {
      /* Light app/panel → dark text */
      root.style.setProperty('--palette-panel-text', LIGHT_SURFACE_TEXT);
      root.style.setProperty('--palette-panel-muted', LIGHT_SURFACE_MUTED);
      root.style.setProperty('--palette-body-text', 'rgba(30,16,8,0.85)');
      root.style.setProperty('--palette-body-muted', 'rgba(30,16,8,0.52)');
      applyLightThemeTextVars();
    } else {
      /* Dark l3 panel → golden text */
      root.style.setProperty('--palette-panel-text', DARK_SURFACE_TEXT);
      root.style.setProperty('--palette-panel-muted', DARK_SURFACE_MUTED);
      root.style.setProperty('--palette-body-text', 'rgba(240,216,152,0.85)');
      root.style.setProperty('--palette-body-muted', 'rgba(240,216,152,0.52)');
    }
  }
}

function applyLightThemeTextVars(p?: PaletteEntry) {
  /* Inactive text only — active text comes from each palette's own tabActiveText
     (Beige = dark brown, Burgundy/Navy/Forest = empty → golden fallback in DayTabs) */
  if (p) {
    const hex = p.swatch.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    /* Light swatch (Beige, Parchment) → dark brown; dark swatch → palette-tinted */
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const inactive = lum > 0.4 ? 'rgba(30,16,8,0.88)' : `rgba(${r},${g},${b},0.70)`;
    document.documentElement.style.setProperty('--palette-tab-inactive-text', inactive);
  } else {
    document.documentElement.style.setProperty('--palette-tab-inactive-text', 'rgba(30,16,8,0.88)');
  }
}

function applyFullHeader() {
  document.documentElement.style.setProperty('--nav-bg', 'var(--header-bg)');
}

export default function ThemeSwitcher() {
  const pathname = usePathname();
  const [colorActive, setColorActive] = useState<ColorId>('paper');
  const [paletteActive, setPaletteActive] = useState<PaletteId>('brown');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>('color');
  const [allCustomIds, setAllCustomIds] = useState<AllCustomIds>({});
  const [expandedPalette, setExpandedPalette] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const {
    setTabStyle,
    setTabFillColor,
    appTheme: _appTheme,
    setAppTheme: _setAppTheme,
  } = useStyle();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedColor = localStorage.getItem('colourmap-theme') as ColorId | null;
    if (savedColor && COLOR_THEMES.some((t) => t.id === savedColor)) {
      setColorActive(savedColor);
      applyColorTheme(savedColor);
    }
    const savedPalette = (localStorage.getItem('colourmap-palette') ?? 'brown') as PaletteId;
    const resolvedPalette = PALETTES.some((p) => p.id === savedPalette) ? savedPalette : 'brown';
    setPaletteActive(resolvedPalette);
    applyPaletteCSS(resolvedPalette);
    const p = PALETTES.find((p) => p.id === resolvedPalette);
    const isLight = LIGHT_THEMES.has((savedColor ?? 'paper') as ColorId);
    if (p) {
      setTabStyle('filled');
      setTabFillColor(p.tab);
    }
    if (isLight) {
      applyLightThemeTextVars(p ?? undefined);
    }
    applyFullHeader();
    /* Restore per-palette deep-dive custom levels */
    try {
      const savedCustom = localStorage.getItem(LS_CUSTOM);
      if (savedCustom) {
        const allIds = JSON.parse(savedCustom) as AllCustomIds;
        setAllCustomIds(allIds);
        /* Apply overrides for the active palette only */
        const overrides = allIds[resolvedPalette] ?? {};
        for (const [level, colorId] of Object.entries(overrides) as [DeepLevelKey, string][]) {
          applyCustomLevel(level, colorId, p);
        }
      }
    } catch {}
  }, [setTabStyle, setTabFillColor]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const inContainer = containerRef.current?.contains(e.target as Node);
      const inPanel = panelRef.current?.contains(e.target as Node);
      if (!inContainer && !inPanel) setOpen(false);
    }
    const id = setTimeout(() => document.addEventListener('mousedown', onDown), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  useEffect(() => {
    if (!pathname?.startsWith('/build-lab')) return;
    const colorId: ColorId = 'night-brown';
    const paletteId = DARK_AUTO_PALETTE[colorId] ?? 'brown';
    const palette = PALETTES.find((p) => p.id === paletteId);
    setColorActive(colorId);
    applyColorTheme(colorId);
    setPaletteActive(paletteId);
    applyPaletteCSS(paletteId);
    if (palette) {
      setTabStyle('filled');
      setTabFillColor(palette.tab);
    }
    const overrides = allCustomIds[paletteId] ?? {};
    for (const [level, customColorId] of Object.entries(overrides) as [DeepLevelKey, string][]) {
      applyCustomLevel(level, customColorId, palette);
    }
    setTab('color');
  }, [allCustomIds, pathname, setTabFillColor, setTabStyle]);

  function selectPalette(id: PaletteId, customOverrides?: AllCustomIds) {
    setPaletteActive(id);
    applyPaletteCSS(id);
    const p = PALETTES.find((p) => p.id === id);
    if (p) {
      setTabStyle('filled');
      setTabFillColor(p.tab);
    }
    if (LIGHT_THEMES.has(colorActive)) applyLightThemeTextVars(p ?? undefined);
    const overrides = (customOverrides ?? allCustomIds)[id] ?? {};
    for (const [level, colorId] of Object.entries(overrides) as [DeepLevelKey, string][]) {
      applyCustomLevel(level, colorId, p);
    }
  }

  function selectColor(id: ColorId) {
    setColorActive(id);
    applyColorTheme(id);
    if (!LIGHT_THEMES.has(id)) {
      const auto = DARK_AUTO_PALETTE[id] ?? 'brown';
      selectPalette(auto);
      setTab('color');
    } else {
      /* Re-apply current palette so dark-theme vars (e.g. golden active text) are cleared */
      applyPaletteCSS(paletteActive);
      const p = PALETTES.find((p) => p.id === paletteActive);
      applyLightThemeTextVars(p);
    }
  }

  function applyQuickPreset(paletteId: string, preset: Partial<Record<DeepLevelKey, string>>) {
    selectPalette(paletteId);
    const p = PALETTES.find((p) => p.id === paletteId);
    const paletteOverrides: LevelCustomIds = { ...(allCustomIds[paletteId] ?? {}), ...preset };
    const next: AllCustomIds = { ...allCustomIds, [paletteId]: paletteOverrides };
    for (const [level, colorId] of Object.entries(preset) as [DeepLevelKey, string][]) {
      applyCustomLevel(level, colorId, p);
    }
    setAllCustomIds(next);
    localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
  }

  function setLevelColor(paletteId: string, level: DeepLevelKey, colorId: string) {
    const p = PALETTES.find((p) => p.id === paletteId);
    applyCustomLevel(level, colorId, p);
    const paletteOverrides: LevelCustomIds = {
      ...(allCustomIds[paletteId] ?? {}),
      [level]: colorId,
    };
    const next: AllCustomIds = { ...allCustomIds, [paletteId]: paletteOverrides };
    setAllCustomIds(next);
    localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
  }

  function onDragHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startPanelX = dragPos?.x ?? rect.left;
    const startPanelY = dragPos?.y ?? rect.top;
    setDragPos({ x: startPanelX, y: startPanelY });
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    function onMouseMove(ev: MouseEvent) {
      setDragPos({
        x: startPanelX + ev.clientX - startMouseX,
        y: startPanelY + ev.clientY - startMouseY,
      });
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function resetCustomForPalette(paletteId: string) {
    const next = { ...allCustomIds };
    delete next[paletteId];
    setAllCustomIds(next);
    localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
    if (paletteId === paletteActive) {
      applyPaletteCSS(paletteId);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
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
          ref={panelRef}
          className="z-50 rounded-xl p-2 shadow-lg animate-in fade-in duration-150 min-w-[180px]"
          style={
            {
              ...(dragPos
                ? { position: 'fixed', left: dragPos.x, top: dragPos.y }
                : { position: 'absolute', right: 0, top: '2rem' }),
              background: '#fbf3d8',
              border: '1px solid rgba(160,110,40,0.18)',
              color: '#2a1a06',
              '--foreground': '#2a1a06',
              '--muted-foreground': '#7a4a18',
              '--accent': '#c4a060',
              '--accent-foreground': '#2a1a06',
              '--border': 'rgba(160,110,40,0.25)',
            } as unknown as React.CSSProperties
          }
        >
          {/* Drag handle */}
          <div
            onMouseDown={onDragHandleMouseDown}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 14,
              marginBottom: 4,
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: 28,
                height: 3,
                borderRadius: 2,
                background: 'rgba(160,110,40,0.22)',
              }}
            />
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-2">
            <button
              type="button"
              onClick={() => setTab('color')}
              className={`flex-1 text-xs py-1 rounded-lg transition-colors ${tab === 'color' ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/50'}`}
            >
              Color
            </button>
            {LIGHT_THEMES.has(colorActive) && (
              <button
                type="button"
                onClick={() => setTab('design')}
                className={`flex-1 text-xs py-1 rounded-lg transition-colors ${tab === 'design' ? 'bg-accent font-medium' : 'text-muted-foreground hover:bg-accent/50'}`}
              >
                Titles
              </button>
            )}
          </div>

          {/* Color — page background */}
          {tab === 'color' && (
            <div className="flex flex-col gap-1">
              {COLOR_THEMES.map((theme) => {
                const isActive = colorActive === theme.id;
                const isDark = !LIGHT_THEMES.has(theme.id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      isActive && !isDark
                        ? 'bg-accent font-medium'
                        : !isActive
                          ? 'hover:bg-accent/50'
                          : ''
                    }`}
                    style={{
                      background: isActive && isDark ? theme.color : undefined,
                      color: isActive && isDark ? 'rgba(196,160,96,0.92)' : '#2a1a06',
                      fontWeight: isActive ? 600 : 400,
                    }}
                    onClick={() => selectColor(theme.id)}
                  >
                    <div
                      className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span>{theme.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Titles — header + panel colour progression */}
          {tab === 'design' && (
            <div className="flex flex-col gap-0.5">
              {PALETTES.map((p) => {
                const isExpanded = expandedPalette === p.id;
                const paletteOverrides = allCustomIds[p.id] ?? {};
                const hasCustom = Object.keys(paletteOverrides).length > 0;
                const deepColors = PALETTE_DEEP_COLORS[p.id] ?? DC_BROWN;

                return (
                  <div key={p.id}>
                    {/* Palette row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <button
                        type="button"
                        className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                          paletteActive === p.id ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => selectPalette(p.id)}
                      >
                        <div
                          className="h-3.5 w-3.5 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: p.swatch }}
                        />
                        <span>{p.label}</span>
                        {hasCustom && (
                          <span
                            style={{
                              fontSize: 7,
                              color: 'rgba(92,48,24,0.4)',
                              fontFamily: 'var(--font-serif)',
                              marginLeft: 'auto',
                            }}
                          >
                            ●
                          </span>
                        )}
                      </button>
                      {p.quickPresets ? (
                        /* Quick preset buttons 1 2 3 */
                        <div style={{ display: 'flex', gap: 3, flexShrink: 0, paddingRight: 2 }}>
                          {p.quickPresets.map((preset, i) => {
                            const isActive = Object.entries(preset).every(
                              ([k, v]) => paletteOverrides[k as DeepLevelKey] === v,
                            );
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => applyQuickPreset(p.id, preset)}
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-serif)',
                                  color: isActive ? 'rgba(92,48,24,0.85)' : 'rgba(92,48,24,0.35)',
                                  background: isActive ? 'rgba(160,110,40,0.18)' : 'transparent',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '3px 6px',
                                  cursor: 'pointer',
                                  transition: 'color 0.15s, background 0.15s',
                                }}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Regular modify button */
                        <button
                          type="button"
                          onClick={() => setExpandedPalette(isExpanded ? null : p.id)}
                          style={{
                            fontSize: 9,
                            color: isExpanded ? 'rgba(92,48,24,0.75)' : 'rgba(92,48,24,0.35)',
                            padding: '3px 7px',
                            borderRadius: 7,
                            fontFamily: 'var(--font-serif)',
                            letterSpacing: '0.06em',
                            background: isExpanded ? 'rgba(160,110,40,0.14)' : 'transparent',
                            cursor: 'pointer',
                            border: 'none',
                            flexShrink: 0,
                            transition: 'color 0.15s, background 0.15s',
                          }}
                        >
                          modify
                        </button>
                      )}
                    </div>

                    {/* Inline deep dive — expands below this palette row */}
                    {isExpanded && (
                      <div
                        style={{
                          background: 'rgba(160,110,40,0.07)',
                          border: '1px solid rgba(160,110,40,0.16)',
                          borderRadius: 10,
                          padding: '9px 11px 8px',
                          margin: '3px 0 4px 2px',
                        }}
                      >
                        {/* Numbered colour reference */}
                        <div style={{ display: 'flex', gap: 5, marginBottom: 9 }}>
                          {deepColors.map((color, i) => (
                            <div
                              key={color.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <div
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: 3,
                                  background: color.swatch,
                                  border: '1px solid rgba(0,0,0,0.15)',
                                }}
                              />
                              <span
                                style={{
                                  fontSize: 7,
                                  color: 'rgba(92,48,24,0.5)',
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-serif)',
                                }}
                              >
                                {i + 1}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Level rows 1, 2, 3 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                          {DEEP_LEVELS.map(({ key, label }) => {
                            const currentId = paletteOverrides[key];
                            return (
                              <div
                                key={key}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                              >
                                <span
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: 'rgba(92,48,24,0.72)',
                                    width: 14,
                                    flexShrink: 0,
                                  }}
                                >
                                  {label}
                                </span>
                                <div style={{ display: 'flex', gap: 3 }}>
                                  {deepColors.map((color) => (
                                    <button
                                      key={color.id}
                                      type="button"
                                      onClick={() => setLevelColor(p.id, key, color.id)}
                                      style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: '50%',
                                        background: color.swatch,
                                        border:
                                          currentId === color.id
                                            ? '2px solid rgba(196,160,96,0.95)'
                                            : '1px solid rgba(0,0,0,0.18)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        flexShrink: 0,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Reset — only shown when this palette has overrides */}
                        {hasCustom && (
                          <button
                            type="button"
                            onClick={() => resetCustomForPalette(p.id)}
                            style={{
                              marginTop: 7,
                              fontSize: 9,
                              color: 'rgba(92,48,24,0.38)',
                              fontFamily: 'var(--font-serif)',
                              letterSpacing: '0.06em',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '1px 0',
                            }}
                          >
                            reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
