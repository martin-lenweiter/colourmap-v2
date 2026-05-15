'use client';

import { useEffect, useMemo, useState } from 'react';

type ArenaMode = 'fight' | 'dance';
type FighterAction =
  | 'idle'
  | 'step'
  | 'retreat'
  | 'strike'
  | 'block'
  | 'pulse'
  | 'halo'
  | 'comet'
  | 'lotus';

type TextBurst = {
  id: number;
  text: string;
  x: number;
  y: number;
};

type EnemyKind = {
  id: string;
  name: string;
  weapon: 'none' | 'stick' | 'sword' | 'shield' | 'swirl';
  description: string;
  color: string;
  speed: number;
  range: number;
};

const ENEMY_KINDS: EnemyKind[] = [
  {
    id: 'rusher',
    name: 'Rusher',
    weapon: 'none',
    description: 'Fast pressure. Low health. Closes the gap.',
    color: '#f6b64a',
    speed: 1.3,
    range: 38,
  },
  {
    id: 'guardian',
    name: 'Guardian',
    weapon: 'shield',
    description: 'Slow shield body. Blocks often.',
    color: '#d9c07a',
    speed: 0.62,
    range: 34,
  },
  {
    id: 'lancer',
    name: 'Lancer',
    weapon: 'stick',
    description: 'Long golden staff. Hits from farther away.',
    color: '#ffce6a',
    speed: 0.82,
    range: 68,
  },
  {
    id: 'blade',
    name: 'Blade Dancer',
    weapon: 'sword',
    description: 'Diagonal sword arcs and fast side steps.',
    color: '#ffad45',
    speed: 1,
    range: 52,
  },
  {
    id: 'echo',
    name: 'Echo Ghost',
    weapon: 'swirl',
    description: 'Tornado legs. Phases in curves.',
    color: '#ffd36c',
    speed: 1.12,
    range: 44,
  },
];

const WALKER_DOTS = Array.from({ length: 118 }, (_, index) => {
  const q = index / 118;
  const zone = q < 0.18 ? 0 : q < 0.43 ? 1 : q < 0.64 ? 2 : q < 0.84 ? 3 : 4;
  const angle = index * 2.399963229728653;
  const spread = Math.sqrt((index * 0.61803398875) % 1 || 0.01);
  return {
    id: index,
    zone,
    sx: Math.cos(angle) * spread,
    sy: Math.sin(angle) * spread,
    drift: (index % 19) / 19,
  };
});

const stageDust = Array.from({ length: 70 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 37) % 84)}%`,
  top: `${10 + ((index * 53) % 76)}%`,
  size: `${1 + (index % 3)}px`,
  opacity: `${(0.14 + (index % 5) * 0.035).toFixed(3)}`,
}));

const HIT_WORDS = ['Pow', 'Bam', 'Take this', 'Pop', 'Pulse'];
const QUOTES = [
  'Rhythm turns pressure into movement.',
  'The clean strike begins as attention.',
  'Do not chase the wave. Read it.',
  'Power rests when it knows the timing.',
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function describeAction(action: FighterAction) {
  if (action === 'strike') return 'Sword Halo';
  if (action === 'pulse') return 'Sun Pulse';
  if (action === 'comet') return 'Comet Step';
  if (action === 'lotus') return 'Lotus Guard';
  if (action === 'block') return 'Guard';
  if (action === 'retreat') return 'Back Step';
  if (action === 'step') return 'Step';
  return 'Waiting';
}

function calcCenterOffset(value: number) {
  const amount = Math.abs(value).toFixed(3);
  return `calc(50% ${value < 0 ? '-' : '+'} ${amount}px)`;
}

function dotPoint(
  zone: number,
  sx: number,
  sy: number,
  side: 'player' | 'enemy',
  action: FighterAction,
  beat: number,
  ghost = false,
) {
  const mirror = side === 'player' ? 1 : -1;
  const walk = Math.sin(beat * Math.PI * 2);
  const guard = action === 'block' || action === 'lotus';
  const strike = action === 'strike' || action === 'halo';
  const pulse = action === 'pulse';
  const retreat = action === 'retreat';
  const comet = action === 'comet' || action === 'step' || retreat;
  const actionPulse = Math.sin(beat * Math.PI * 6);
  const lean = strike
    ? mirror * 9
    : pulse
      ? Math.sin(beat * Math.PI * 4) * 4
      : comet
        ? mirror * (retreat ? -7 : 7)
        : 0;
  const crouch = guard ? 8 : retreat ? 5 : strike ? -3 : 0;
  let x = 0;
  let y = 0;
  let scale = 1;

  if (zone === 0) {
    x = sx * 7 + (comet ? mirror * (retreat ? -5 : 5) : 0) + lean * 0.34;
    y = -58 + sy * 8 + Math.sin(beat * Math.PI * 4) * 2 + crouch * 0.35;
    scale = 1.12 + (pulse ? 0.18 : 0);
  } else if (zone === 1) {
    x = sx * (guard ? 14 : 18) + lean * 0.7;
    y = -26 + sy * 22 + crouch;
    scale = guard ? 1.25 : pulse ? 1.72 : 1.5;
  } else if (zone === 2) {
    const sideSign = sx < 0 ? -1 : 1;
    const attackReach = strike ? mirror * (sideSign > 0 ? 30 : 9) : 0;
    const blockTuck = guard ? -sideSign * 9 : 0;
    x = sideSign * (24 + Math.abs(sx) * 18) + attackReach + blockTuck + lean;
    y = -20 + sy * 16 - Math.abs(walk) * 5 + crouch + (strike ? actionPulse * 4 : 0);
    scale = pulse ? 1.22 : 1.08;
  } else if (zone === 3) {
    const sideSign = sx < 0 ? -1 : 1;
    const stride = comet ? (sideSign > 0 ? walk * 18 : -walk * 14) : walk * 8;
    x = sideSign * (13 + Math.abs(sx) * 13 + stride) + lean * 0.28;
    y = 28 + Math.abs(sy) * 25 + crouch + (comet ? Math.abs(walk) * 6 : 0);
    scale = comet ? 1.16 : 1.05;
  } else {
    x = sx * 18 + Math.sin(beat * 5 + sy * 5) * (ghost ? 12 : 2) + lean * 0.18;
    y = (ghost ? 52 + Math.abs(sy) * 26 : 62 + sy * 4) + crouch;
    scale = ghost ? 0.82 : 0.75;
  }

  if (ghost && zone >= 3) {
    x += Math.sin(beat * Math.PI * 4 + Math.abs(sy) * 8) * 18;
    y += Math.abs(sy) * 22;
  }
  if (pulse) scale *= 1.16;
  return { x, y, scale };
}

function WalkerFigure({
  side,
  action,
  beat,
  kind,
  health,
  x,
}: {
  side: 'player' | 'enemy';
  action: FighterAction;
  beat: number;
  kind?: EnemyKind;
  health: number;
  x: number;
}) {
  const ghost = kind?.weapon === 'swirl';
  const color = kind?.color ?? '#ffd36c';
  const facing = side === 'player' ? 1 : -1;
  return (
    <div
      className="absolute top-[54%] h-48 w-40 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${x}%`,
        opacity: health <= 0 ? 0.25 : 1,
        transform: `translate(-50%, -50%) scale(${side === 'enemy' && health > 130 ? 1.22 : 1})`,
      }}
    >
      {WALKER_DOTS.map((dot) => {
        const point = dotPoint(
          dot.zone,
          dot.sx,
          dot.sy,
          side,
          action,
          beat + dot.drift * 0.08,
          ghost,
        );
        const dotSize = (2.4 * point.scale).toFixed(3);
        const dotOpacity = (action === 'block' ? 0.76 : 0.64 + dot.zone * 0.045).toFixed(3);
        return (
          <span
            key={dot.id}
            className="absolute rounded-full"
            style={{
              left: calcCenterOffset(point.x),
              top: calcCenterOffset(point.y),
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              background: color,
              opacity: dotOpacity,
              boxShadow: `0 0 ${action === 'pulse' ? 18 : 9}px ${color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
      {kind?.weapon === 'stick' && (
        <span
          className="absolute top-[40%] h-[3px] w-28 rounded-full bg-[#ffe0a0] shadow-[0_0_18px_rgba(255,211,108,0.8)]"
          style={{
            left: facing > 0 ? '55%' : '-24%',
            transform: `rotate(${facing > 0 ? -12 : 12}deg)`,
          }}
        />
      )}
      {(kind?.weapon === 'sword' || action === 'strike' || action === 'halo') && (
        <span className="absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-t-2 border-[#ffd36c] shadow-[0_0_24px_rgba(255,211,108,0.45)]" />
      )}
      {(kind?.weapon === 'shield' || action === 'block' || action === 'lotus') && (
        <span className="absolute left-1/2 top-[48%] h-28 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#ffe0a0]/70 bg-[#ffd36c]/8 shadow-[0_0_28px_rgba(255,211,108,0.32)]" />
      )}
      {action === 'comet' && (
        <span className="absolute left-2 top-1/2 h-[2px] w-32 rounded-full bg-[#ffd36c]/75 shadow-[0_0_18px_rgba(255,211,108,0.85)]" />
      )}
    </div>
  );
}

export default function DotWalkerArena() {
  const [mode, setMode] = useState<ArenaMode>('fight');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(70);
  const [energy, setEnergy] = useState(54);
  const [wave, setWave] = useState(1);
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [playerAction, setPlayerAction] = useState<FighterAction>('idle');
  const [enemyAction, setEnemyAction] = useState<FighterAction>('idle');
  const [playerX, setPlayerX] = useState(32);
  const [enemyX, setEnemyX] = useState(68);
  const [beat, setBeat] = useState(0);
  const [bursts, setBursts] = useState<TextBurst[]>([]);
  const enemy = useMemo(() => {
    if (wave % 5 === 0) {
      return {
        ...ENEMY_KINDS[3],
        id: 'boss',
        name: 'Boss: Golden Blade',
        description: 'Large phase boss. Warning glow, sword sweep, recovery.',
        color: '#ffcc5c',
        speed: 0.72,
        range: 74,
      };
    }
    return ENEMY_KINDS[enemyIndex % ENEMY_KINDS.length];
  }, [enemyIndex, wave]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBeat((value) => (value + 0.035) % 1);
      setEnergy((value) => clamp(value + 0.7, 0, 100));
      if (mode === 'dance') {
        setPlayerX((value) => 32 + Math.sin(Date.now() / 420) * 5);
        setEnemyX((value) => 68 + Math.cos(Date.now() / 460) * 5);
        setPlayerAction(Math.sin(Date.now() / 360) > 0 ? 'pulse' : 'step');
        setEnemyAction(Math.cos(Date.now() / 380) > 0 ? 'halo' : 'step');
        return;
      }
      if (enemyHealth <= 0) return;
      setEnemyX((value) => {
        const direction = value > playerX ? -1 : 1;
        return clamp(value + direction * enemy.speed * 0.16, 48, 82);
      });
      const distance = Math.abs(enemyX - playerX) * 4;
      if (distance < enemy.range) {
        setEnemyAction(
          enemy.weapon === 'shield' ? 'block' : enemy.weapon === 'sword' ? 'halo' : 'strike',
        );
        setPlayerHealth((value) => clamp(value - (playerAction === 'block' ? 0.15 : 0.55), 0, 100));
      } else {
        setEnemyAction(enemy.weapon === 'swirl' ? 'comet' : 'step');
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [enemy.speed, enemy.range, enemy.weapon, enemyHealth, enemyX, mode, playerAction, playerX]);

  function nextWave() {
    setWave((value) => value + 1);
    setEnemyIndex((value) => value + 1);
    setEnemyHealth(wave % 4 === 0 ? 150 : 64 + wave * 8);
    setPlayerHealth((value) => clamp(value + 18, 0, 100));
    setEnergy(70);
    setEnemyX(70);
    setPlayerAction('pulse');
    setEnemyAction('idle');
  }

  function addBurst(action: FighterAction, x: number, y: number) {
    const text =
      action === 'pulse'
        ? 'Pulse'
        : action === 'comet'
          ? 'Pop'
          : HIT_WORDS[(wave + Math.round(energy) + bursts.length) % HIT_WORDS.length];
    const burst = { id: Date.now() + bursts.length, text, x, y };
    setBursts((prev) => [...prev.slice(-3), burst]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((item) => item.id !== burst.id));
    }, 850);
  }

  function runAction(action: FighterAction) {
    setPlayerAction(action);
    window.setTimeout(() => setPlayerAction('idle'), 520);
    if (action === 'step' || action === 'comet') {
      setPlayerX((value) => clamp(value + (action === 'comet' ? 7 : 4), 20, 46));
      if (action === 'comet') setEnergy((value) => clamp(value - 18, 0, 100));
    }
    const distance = Math.abs(enemyX - playerX) * 4;
    if (action === 'strike' || action === 'halo') {
      setEnergy((value) => clamp(value - 10, 0, 100));
      if (distance < 62) {
        addBurst(action, enemyX, 42);
        setEnemyHealth((value) => clamp(value - (enemy.weapon === 'shield' ? 9 : 18), 0, 180));
      }
    }
    if (action === 'pulse') {
      setEnergy((value) => clamp(value - 24, 0, 100));
      setEnemyX((value) => clamp(value + 5, 54, 84));
      if (distance < 92) {
        addBurst(action, 50, 38);
        setEnemyHealth((value) => clamp(value - 14, 0, 180));
      }
    }
    if (action === 'lotus') {
      setEnergy((value) => clamp(value - 16, 0, 100));
      setPlayerHealth((value) => clamp(value + 5, 0, 100));
    }
  }

  const cleared = enemyHealth <= 0;
  const specialReady = energy >= 24;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <section className="overflow-hidden rounded-[28px] border border-[#8f6232]/20 bg-[#f7e7c2] shadow-[0_22px_70px_rgba(62,38,17,0.16)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#8f6232]/18 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8d653d]">Geometry Game</p>
            <h1 className="mt-1 font-serif text-4xl text-[#3f2817]">Dot Walker Arena</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#775638]">
              A first phone-friendly game surface for golden dot walkers: symbolic fight, wave
              pressure, boss preview, and dance mode for future music reaction.
            </p>
          </div>
          <div className="flex rounded-full border border-[#8f6232]/20 bg-[#fff8e8]/82 p-1">
            {(['fight', 'dance'] as ArenaMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className="rounded-full px-4 py-2 text-sm capitalize"
                style={{
                  background: mode === item ? '#704923' : 'transparent',
                  color: mode === item ? '#fff8e8' : '#704923',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
          <div className="relative min-h-[620px] overflow-hidden bg-[#201006]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,177,56,0.18),transparent_42%)]" />
            {stageDust.map((dot) => (
              <span
                key={dot.id}
                className="absolute rounded-full bg-[#ffd36c]"
                style={{
                  left: dot.left,
                  top: dot.top,
                  width: dot.size,
                  height: dot.size,
                  opacity: dot.opacity,
                  boxShadow: '0 0 10px rgba(255,211,108,0.7)',
                }}
              />
            ))}
            <div className="absolute left-8 right-8 bottom-[18%] h-px bg-[#ffd36c]/22" />
            <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-[#ffd36c]/20 bg-[#130905]/72 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#ffdca0]">
              Wave {wave} · {cleared ? 'clear' : enemy.name}
            </div>

            <WalkerFigure
              side="player"
              action={playerAction}
              beat={beat}
              health={playerHealth}
              x={playerX}
            />
            <WalkerFigure
              side="enemy"
              action={enemyAction}
              beat={beat + 0.18}
              health={enemyHealth}
              x={enemyX}
              kind={enemy}
            />

            {(playerAction === 'pulse' || enemyAction === 'pulse') && (
              <div className="absolute left-1/2 top-[54%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd36c]/50 shadow-[0_0_60px_rgba(255,211,108,0.36)]" />
            )}
            {bursts.map((burst) => (
              <div
                key={burst.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd36c]/35 bg-[#130905]/82 px-4 py-2 font-serif text-2xl text-[#ffe0a0] shadow-[0_0_30px_rgba(255,211,108,0.3)]"
                style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
              >
                {burst.text}
              </div>
            ))}
            {cleared && (
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-3xl border border-[#ffd36c]/24 bg-[#130905]/82 p-5 text-center">
                <p className="font-serif text-3xl text-[#ffe0a0]">Wave cleared</p>
                <p className="mt-2 text-sm text-[#ffdca0]/78">
                  {QUOTES[(wave - 1) % QUOTES.length]}
                </p>
                <button
                  type="button"
                  onClick={nextWave}
                  className="mt-4 rounded-full bg-[#ffd36c] px-5 py-3 text-sm text-[#3f2817]"
                >
                  Next wave
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4 border-t border-[#8f6232]/18 bg-[#fff8e8]/82 p-4 lg:border-t-0 lg:border-l">
            <div className="rounded-2xl border border-[#8f6232]/18 bg-[#fffdf2]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Status</p>
              <div className="mt-3 space-y-3">
                {[
                  ['You', playerHealth, '#ffd36c'],
                  [enemy.name, enemyHealth, enemy.id === 'boss' ? '#ffad45' : enemy.color],
                  ['Energy', energy, '#c4a060'],
                ].map(([label, value, color]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs text-[#704923]">
                      <span>{label as string}</span>
                      <span>{Math.round(Number(value))}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#d9b879]/22">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${clamp(Number(value), 0, 100)}%`,
                          background: color as string,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#8f6232]/18 bg-[#fffdf2]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Enemy</p>
              <h2 className="mt-1 font-serif text-2xl text-[#3f2817]">{enemy.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[#775638]">{enemy.description}</p>
              <p className="mt-3 text-xs text-[#8d653d]">Weapon: {enemy.weapon}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                ['Step', 'step'],
                ['Back', 'retreat'],
                ['Strike', 'strike'],
                ['Block', 'block'],
                ['Pulse', 'pulse'],
                ['Comet', 'comet'],
                ['Lotus', 'lotus'],
              ].map(([label, action]) => {
                const special = action === 'pulse' || action === 'comet' || action === 'lotus';
                return (
                  <button
                    key={action}
                    type="button"
                    disabled={mode === 'dance' || (special && !specialReady) || playerHealth <= 0}
                    onClick={() => runAction(action as FighterAction)}
                    className="min-h-14 rounded-2xl border border-[#8f6232]/20 bg-[#704923] px-3 text-sm text-[#fff8e8] disabled:bg-[#d9b879]/42 disabled:text-[#8d653d]"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#8f6232]/18 bg-[#fffdf2]/75 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Current form</p>
              <p className="mt-2 font-serif text-xl text-[#3f2817]">
                {describeAction(playerAction)}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#775638]">
                Special attacks should read as golden geometry: anticipation, clean shape, impact,
                then silence.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
