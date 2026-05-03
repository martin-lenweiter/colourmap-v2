'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────── */

interface Pal {
  bg0: string;
  bg1: string;
  line: string;
  fill: string;
  glow: string;
  dots: string;
  rgb: [number, number, number];
}

interface Cfg {
  preset: string;
  symmetry: number;
  complexity: number;
  glow: number;
  breathSpeed: number;
  intensity: number;
  particles: number;
}

interface Dot {
  a: number;
  r: number;
  s: number;
  sz: number;
  op: number;
  jt: number;
}

/* ── Palettes ───────────────────────────────────────────────── */

const PAL: Record<string, Pal> = {
  'Calm Field': {
    bg0: '#120a04',
    bg1: '#080401',
    line: 'rgba(196,160,96,0.55)',
    fill: 'rgba(196,160,96,0.06)',
    glow: 'rgba(196,155,80,0.38)',
    dots: 'rgba(225,200,155,0.65)',
    rgb: [196, 160, 96],
  },
  'Golden Source': {
    bg0: '#130900',
    bg1: '#070300',
    line: 'rgba(255,195,35,0.65)',
    fill: 'rgba(255,180,20,0.07)',
    glow: 'rgba(240,165,15,0.45)',
    dots: 'rgba(255,215,85,0.7)',
    rgb: [255, 195, 35],
  },
  'Blue Astral': {
    bg0: '#030a14',
    bg1: '#010407',
    line: 'rgba(105,170,255,0.6)',
    fill: 'rgba(80,140,235,0.06)',
    glow: 'rgba(65,135,255,0.36)',
    dots: 'rgba(150,200,255,0.7)',
    rgb: [105, 170, 255],
  },
  'Violet Portal': {
    bg0: '#0a0412',
    bg1: '#050208',
    line: 'rgba(175,90,255,0.65)',
    fill: 'rgba(165,75,255,0.07)',
    glow: 'rgba(150,60,255,0.42)',
    dots: 'rgba(200,140,255,0.7)',
    rgb: [175, 90, 255],
  },
  'Forest Ceremony': {
    bg0: '#021008',
    bg1: '#010703',
    line: 'rgba(65,195,140,0.6)',
    fill: 'rgba(50,175,120,0.06)',
    glow: 'rgba(40,170,115,0.35)',
    dots: 'rgba(110,215,160,0.7)',
    rgb: [65, 195, 140],
  },
  'Minimal Light': {
    bg0: '#0e0c0a',
    bg1: '#070604',
    line: 'rgba(238,230,215,0.5)',
    fill: 'rgba(230,220,200,0.04)',
    glow: 'rgba(215,205,188,0.24)',
    dots: 'rgba(245,238,225,0.6)',
    rgb: [238, 230, 215],
  },
};

/* ── Preset configs ─────────────────────────────────────────── */

const PRESETS: Record<string, Cfg> = {
  'Calm Field': {
    preset: 'Calm Field',
    symmetry: 8,
    complexity: 4,
    glow: 5,
    breathSpeed: 0.8,
    intensity: 6.5,
    particles: 4,
  },
  'Golden Source': {
    preset: 'Golden Source',
    symmetry: 12,
    complexity: 6,
    glow: 8,
    breathSpeed: 1.2,
    intensity: 9,
    particles: 5,
  },
  'Blue Astral': {
    preset: 'Blue Astral',
    symmetry: 10,
    complexity: 7,
    glow: 7,
    breathSpeed: 1.0,
    intensity: 7,
    particles: 6,
  },
  'Violet Portal': {
    preset: 'Violet Portal',
    symmetry: 16,
    complexity: 8,
    glow: 9,
    breathSpeed: 1.4,
    intensity: 8,
    particles: 7,
  },
  'Forest Ceremony': {
    preset: 'Forest Ceremony',
    symmetry: 6,
    complexity: 5,
    glow: 6,
    breathSpeed: 0.9,
    intensity: 7,
    particles: 5,
  },
  'Minimal Light': {
    preset: 'Minimal Light',
    symmetry: 4,
    complexity: 3,
    glow: 3,
    breathSpeed: 0.6,
    intensity: 4,
    particles: 2,
  },
};

/* ── Intention resolver ─────────────────────────────────────── */

function resolveIntention(w: string): string {
  const t = w.toLowerCase();
  if (/clear|focus|vision|clarif/.test(t)) return 'Blue Astral';
  if (/release|let.?go|flow|open|surrender/.test(t)) return 'Calm Field';
  if (/energy|power|fire|strong|courage|bold|activ/.test(t)) return 'Golden Source';
  if (/peace|calm|still|quiet|rest|breath|soft/.test(t)) return 'Minimal Light';
  if (/spirit|portal|cosmos|divine|mystic|dream/.test(t)) return 'Violet Portal';
  if (/nature|earth|ground|grow|forest|root|green/.test(t)) return 'Forest Ceremony';
  const keys = Object.keys(PRESETS);
  return keys[Math.floor(Math.random() * keys.length)];
}

/* ── Particle helpers ───────────────────────────────────────── */

function makeDots(n: number): Dot[] {
  return Array.from({ length: n }, () => ({
    a: Math.random() * Math.PI * 2,
    r: Math.random() * 0.65,
    s: 0.0007 + Math.random() * 0.0013,
    sz: 0.7 + Math.random() * 1.5,
    op: 0.3 + Math.random() * 0.55,
    jt: (Math.random() - 0.5) * 0.0008,
  }));
}

/* ── Draw engine ────────────────────────────────────────────── */

function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cfg: Cfg,
  dots: Dot[],
  t: number,
) {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const cx = W / 2,
    cy = H / 2;
  const R = Math.min(W, H) * 0.42;
  const TAU = Math.PI * 2;
  const gF = cfg.glow / 10;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.9 + breath * 0.1;
  const [rr, gg, bb] = pal.rgb;

  // Background
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.82);
  bg.addColorStop(0, pal.bg0);
  bg.addColorStop(1, pal.bg1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Central bloom
  const bloomR = R * 0.55 * bs * (0.55 + gF * 0.45);
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
  bloom.addColorStop(0, `rgba(${rr},${gg},${bb},${0.22 * iF})`);
  bloom.addColorStop(0.45, `rgba(${rr},${gg},${bb},${0.07 * iF})`);
  bloom.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(cx, cy, bloomR, 0, TAU);
  ctx.fill();

  // Concentric rings
  for (let i = 1; i <= layers + 3; i++) {
    const rr2 = R * (i / (layers + 3)) * bs;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rr2, 0, TAU);
    ctx.strokeStyle = pal.line;
    ctx.globalAlpha = (0.055 + (i / (layers + 3)) * 0.07) * iF;
    ctx.lineWidth = i % 3 === 0 ? 1.0 : 0.5;
    if (gF > 0.35) {
      ctx.shadowBlur = 8 * gF;
      ctx.shadowColor = pal.glow;
    }
    ctx.stroke();
    ctx.restore();
  }

  // Radial guide lines
  ctx.save();
  ctx.translate(cx, cy);
  for (let s = 0; s < sym; s++) {
    ctx.save();
    ctx.rotate((s / sym) * TAU);
    ctx.beginPath();
    ctx.moveTo(0, R * 0.08);
    ctx.lineTo(0, R * bs);
    ctx.strokeStyle = pal.line;
    ctx.globalAlpha = 0.065 * iF;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Petals
  ctx.save();
  ctx.translate(cx, cy);
  const petalLayers = Math.max(1, Math.round(layers * 0.7));
  if (gF > 0.4) {
    ctx.shadowBlur = 10 * gF;
    ctx.shadowColor = pal.glow;
  }
  for (let layer = 1; layer <= petalLayers; layer++) {
    const outerR = R * (layer / (petalLayers + 1)) * bs;
    const innerR = outerR * 0.3;
    const pw = (TAU / sym) * 0.35;
    const dir = layer % 2 === 0 ? 1 : -1;
    for (let s = 0; s < sym; s++) {
      const ang = (s / sym) * TAU + t * 0.00018 * dir;
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, innerR);
      ctx.bezierCurveTo(
        outerR * Math.sin(pw),
        outerR * 0.55,
        outerR * Math.sin(pw),
        outerR * 0.88,
        0,
        outerR,
      );
      ctx.bezierCurveTo(
        -outerR * Math.sin(pw),
        outerR * 0.88,
        -outerR * Math.sin(pw),
        outerR * 0.55,
        0,
        innerR,
      );
      ctx.closePath();
      ctx.fillStyle = pal.fill;
      ctx.globalAlpha = (0.5 + layer * 0.1) * iF;
      ctx.fill();
      ctx.strokeStyle = pal.line;
      ctx.globalAlpha = (0.1 + (layer / petalLayers) * 0.12) * iF;
      ctx.lineWidth = 0.65;
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();

  // Orbital dots
  ctx.save();
  ctx.translate(cx, cy);
  const orbLayers = Math.min(layers, 7);
  const scale = Math.min(W, H) / 450;
  for (let layer = 1; layer <= orbLayers; layer++) {
    const orbitR = R * (layer / (orbLayers + 1)) * bs;
    const rot = t * 0.00025 * (layer % 2 === 0 ? 1 : -1) * cfg.breathSpeed;
    const dotSz = (1.2 + (layer / orbLayers) * 1.8) * scale;
    if (gF > 0.5) {
      ctx.shadowBlur = 12 * gF;
      ctx.shadowColor = pal.glow;
    }
    for (let d = 0; d < sym; d++) {
      const ang = (d / sym) * TAU + rot;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * orbitR, Math.sin(ang) * orbitR, dotSz, 0, TAU);
      ctx.fillStyle = pal.dots;
      ctx.globalAlpha = (0.45 + breath * 0.35) * iF;
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();

  // Spiral arms at high complexity
  if (layers >= 7) {
    ctx.save();
    ctx.translate(cx, cy);
    const armCount = Math.min(sym, 6);
    const sAlpha = ((layers - 6) / 4) * 0.14 * iF;
    const tOff = t * 0.0001;
    for (let arm = 0; arm < armCount; arm++) {
      const baseAng = (arm / armCount) * TAU + tOff;
      ctx.beginPath();
      for (let step = 0; step <= 90; step++) {
        const f = step / 90;
        const r2 = f * R * bs;
        const ang = baseAng + f * Math.PI * 3;
        if (step === 0) ctx.moveTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
        else ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
      }
      ctx.strokeStyle = pal.line;
      ctx.globalAlpha = sAlpha;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Central point
  ctx.save();
  ctx.shadowBlur = 22 * gF;
  ctx.shadowColor = pal.glow;
  ctx.beginPath();
  ctx.arc(cx, cy, (1.8 + breath * 2.8) * scale, 0, TAU);
  ctx.fillStyle = pal.dots;
  ctx.globalAlpha = 0.85 * iF;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();

  // Particles
  if (cfg.particles > 0) {
    ctx.save();
    for (const d of dots) {
      d.r += d.s * (0.25 + cfg.breathSpeed * 0.15);
      d.a += d.jt;
      if (d.r > 1.08) {
        d.r = Math.random() * 0.18;
        d.a = Math.random() * TAU;
      }
      const x = cx + Math.cos(d.a) * d.r * R;
      const y = cy + Math.sin(d.a) * d.r * R;
      const fade = Math.max(0, 1 - d.r * 0.85);
      ctx.beginPath();
      ctx.arc(x, y, d.sz * (Math.min(W, H) / 520), 0, TAU);
      ctx.fillStyle = pal.dots;
      ctx.globalAlpha = d.op * fade * iF * 0.75;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

/* ── Slider definitions ─────────────────────────────────────── */

const SLIDERS = [
  { key: 'symmetry', label: 'Symmetry', min: 4, max: 24, step: 1 },
  { key: 'complexity', label: 'Complexity', min: 1, max: 10, step: 0.5 },
  { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
  { key: 'breathSpeed', label: 'Breath', min: 0.2, max: 3, step: 0.1 },
  { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
  { key: 'particles', label: 'Particles', min: 0, max: 10, step: 1 },
] as const;

/* ── Component ──────────────────────────────────────────────── */

export default function GeometryField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const dprRef = useRef<number>(1);
  const cfgRef = useRef<Cfg>(PRESETS['Calm Field']);
  const dotsRef = useRef<Dot[]>(makeDots(160));

  const [cfg, setCfg] = useState<Cfg>(PRESETS['Calm Field']);
  const [open, setOpen] = useState(true);
  const [intention, setIntention] = useState('');
  const [tuned, setTuned] = useState(false);

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  useEffect(() => {
    dotsRef.current = makeDots(Math.round(cfg.particles * 40 + 20));
  }, [cfg.particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d')!;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      // canvas and wrapper are const and guarded above; assert non-null for TS closure narrowing
      canvas!.width = wrapper!.offsetWidth * dpr;
      canvas!.height = wrapper!.offsetHeight * dpr;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    function tick(t: number) {
      const dpr = dprRef.current;
      const W = canvas!.width / dpr;
      const H = canvas!.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(ctx, W, H, cfgRef.current, dotsRef.current, t);
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  function applyPreset(name: string) {
    setCfg(PRESETS[name] ?? PRESETS['Calm Field']);
  }

  function handleIntention(e: React.FormEvent) {
    e.preventDefault();
    if (!intention.trim()) return;
    applyPreset(resolveIntention(intention));
    setTuned(true);
    setTimeout(() => setTuned(false), 1800);
  }

  function handleRandomize() {
    const keys = Object.keys(PRESETS);
    const base = PRESETS[keys[Math.floor(Math.random() * keys.length)]];
    setCfg({
      ...base,
      symmetry: 4 + Math.floor(Math.random() * 20),
      complexity: 2 + Math.random() * 8,
      glow: 1 + Math.random() * 9,
      breathSpeed: 0.3 + Math.random() * 2.5,
      intensity: 4 + Math.random() * 6,
      particles: Math.floor(Math.random() * 10),
    });
  }

  function handleSave() {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = `geometry-field-${Date.now()}.png`;
    a.href = c.toDataURL('image/png');
    a.click();
  }

  function handleFullscreen() {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function update(key: keyof Cfg, val: number | string) {
    setCfg((prev) => ({ ...prev, [key]: val }));
  }

  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [pr, pg, pb] = pal.rgb;
  const accent = `rgb(${pr},${pg},${pb})`;
  const accentFaint = `rgba(${pr},${pg},${pb},0.12)`;
  const accentMid = `rgba(${pr},${pg},${pb},0.35)`;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100svh - 110px)',
        minHeight: 420,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#080604',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Page title — floats above canvas */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            letterSpacing: '0.24em',
            color: `rgba(${pr},${pg},${pb},0.45)`,
            textTransform: 'uppercase',
          }}
        >
          Geometry Field
        </p>
      </div>

      {/* Show-controls button when panel closed */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,6,4,0.72)',
            border: `1px solid ${accentMid}`,
            borderRadius: 99,
            padding: '6px 22px',
            color: accent,
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            zIndex: 20,
          }}
        >
          ▲ Controls
        </button>
      )}

      {/* Control panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(8,5,3,0.86)',
            backdropFilter: 'blur(18px)',
            borderTop: `1px solid ${accentMid}`,
            padding: '10px 16px 20px',
            zIndex: 10,
            maxHeight: '56%',
            overflowY: 'auto',
          }}
        >
          {/* Collapse handle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: accentFaint,
                border: `1px solid ${accentMid}`,
                borderRadius: 99,
                padding: '3px 22px',
                color: accent,
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              ▼
            </button>
          </div>

          {/* Preset pills */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 10,
              scrollbarWidth: 'none',
            }}
          >
            {Object.keys(PRESETS).map((name) => {
              const active = cfg.preset === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => applyPreset(name)}
                  style={{
                    flexShrink: 0,
                    background: active ? accent : accentFaint,
                    border: `1px solid ${active ? accent : accentMid}`,
                    borderRadius: 99,
                    padding: '5px 13px',
                    color: active ? '#fff' : accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: active ? 700 : 400,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Intention input */}
          <form
            onSubmit={handleIntention}
            style={{ display: 'flex', gap: 8, marginTop: 2, marginBottom: 12 }}
          >
            <input
              type="text"
              placeholder="Type an intention — clarity, release, courage…"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              style={{
                flex: 1,
                background: accentFaint,
                border: `1px solid ${accentMid}`,
                borderRadius: 99,
                padding: '7px 14px',
                color: 'rgba(255,255,255,0.82)',
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: tuned ? accent : accentFaint,
                border: `1px solid ${accent}`,
                borderRadius: 99,
                padding: '7px 16px',
                color: tuned ? '#fff' : accent,
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {tuned ? '✦ Tuned' : 'Tune'}
            </button>
          </form>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
            {SLIDERS.map(({ key, label, min, max, step }) => {
              const val = cfg[key as keyof Cfg] as number;
              return (
                <div key={key}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 10,
                        color: `rgba(${pr},${pg},${pb},0.6)`,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 10, color: accent }}>
                      {step < 1 ? val.toFixed(1) : Math.round(val)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => update(key as keyof Cfg, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: accent, cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {(
              [
                ['Randomize', handleRandomize],
                ['Save Image', handleSave],
                ['Reset', () => applyPreset('Calm Field')],
                ['Fullscreen', handleFullscreen],
              ] as [string, () => void][]
            ).map(([label, fn]) => (
              <button
                key={label}
                type="button"
                onClick={fn}
                style={{
                  background: accentFaint,
                  border: `1px solid ${accentMid}`,
                  borderRadius: 99,
                  padding: '6px 16px',
                  color: accent,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  letterSpacing: '0.07em',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
