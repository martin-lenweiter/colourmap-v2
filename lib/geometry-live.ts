export type GeometryLiveCfg = {
  preset: string;
  symmetry: number;
  complexity: number;
  glow: number;
  breathSpeed: number;
  intensity: number;
  particles: number;
  luminous: number;
  stars: number;
  mode: string;
  danceMove?: string;
  danceBpm?: number;
  danceAmount?: number;
};

export type GeometryLiveState = {
  presetName: string;
  cfg: GeometryLiveCfg;
  updatedAt: number;
  sourceId?: string;
};

const DEFAULT_STATE: GeometryLiveState = {
  presetName: 'Calm Field',
  cfg: {
    preset: 'Calm Field',
    symmetry: 6,
    complexity: 4,
    glow: 3,
    breathSpeed: 0.35,
    intensity: 5,
    particles: 4,
    luminous: 0.8,
    stars: 4,
    mode: 'sacred',
  },
  updatedAt: 0,
};

const NUMBER_KEYS = [
  'symmetry',
  'complexity',
  'glow',
  'breathSpeed',
  'intensity',
  'particles',
  'luminous',
  'stars',
  'danceBpm',
  'danceAmount',
] as const;

type GeometryLiveGlobal = typeof globalThis & {
  __colourmapGeometryLiveState?: GeometryLiveState;
};

function store() {
  const g = globalThis as GeometryLiveGlobal;
  if (!g.__colourmapGeometryLiveState) g.__colourmapGeometryLiveState = DEFAULT_STATE;
  return g;
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 80) : fallback;
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCfg(input: unknown, fallback: GeometryLiveCfg): GeometryLiveCfg {
  const source =
    typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const next: GeometryLiveCfg = {
    preset: text(source.preset, fallback.preset),
    symmetry: num(source.symmetry, fallback.symmetry),
    complexity: num(source.complexity, fallback.complexity),
    glow: num(source.glow, fallback.glow),
    breathSpeed: num(source.breathSpeed, fallback.breathSpeed),
    intensity: num(source.intensity, fallback.intensity),
    particles: num(source.particles, fallback.particles),
    luminous: num(source.luminous, fallback.luminous),
    stars: num(source.stars, fallback.stars),
    mode: text(source.mode, fallback.mode),
  };

  for (const key of NUMBER_KEYS) {
    if (key in source && key !== 'danceBpm' && key !== 'danceAmount') {
      next[key] = num(source[key], next[key]);
    }
  }
  if ('danceMove' in source) next.danceMove = text(source.danceMove, fallback.danceMove ?? 'still');
  if ('danceBpm' in source) next.danceBpm = num(source.danceBpm, fallback.danceBpm ?? 96);
  if ('danceAmount' in source)
    next.danceAmount = num(source.danceAmount, fallback.danceAmount ?? 0.6);

  return next;
}

export function readGeometryLiveState(): GeometryLiveState {
  return store().__colourmapGeometryLiveState ?? DEFAULT_STATE;
}

export function writeGeometryLiveState(input: unknown): GeometryLiveState {
  const current = readGeometryLiveState();
  const source =
    typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
  const next: GeometryLiveState = {
    presetName: text(source.presetName, current.presetName),
    cfg: normalizeCfg(source.cfg, current.cfg),
    updatedAt: Date.now(),
    sourceId: typeof source.sourceId === 'string' ? source.sourceId.slice(0, 80) : undefined,
  };
  store().__colourmapGeometryLiveState = next;
  return next;
}

export function resetGeometryLiveStateForTest() {
  store().__colourmapGeometryLiveState = DEFAULT_STATE;
}
