'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Atom Visualizer — a family of eight soft dot visualizations
 * -----------------------------------------------------------
 *
 * Eight selectable modes, all on Canvas 2D, all touch-reactive,
 * all audio-reactive (if an AnalyserNode is provided).
 *
 *   atom         — golden-spiral cloud, spring-tied, drag-to-push
 *   fibonacci    — golden-angle spiral rotating and pulsing
 *   phyllotaxis  — sunflower-seed pattern, infinite-growth feel
 *   wave         — concentric radial ripples pulsing outward
 *   lissajous    — harmonograph-style braided curves
 *   constellation — network of lines between nearest neighbors
 *   helix        — parametric 3D-feeling double helix
 *   starfield    — warp-streak outward from center
 *
 * Tunable parameters exposed via props so a UI can let the user
 * modify the underlying math:
 *   - speed     : 0-1, how fast animations tick
 *   - density   : 0-1, how many dots (80-400 range)
 *   - scale     : 0-1, how big each dot is
 *
 * Every mode includes the same touch-push force as `atom` — drag
 * anywhere on the canvas and nearby dots are shoved outward before
 * easing back to their mode's home position.
 */

export type VisualizerMode =
  | 'atom'
  | 'fibonacci'
  | 'phyllotaxis'
  | 'wave'
  | 'lissajous'
  | 'constellation'
  | 'helix'
  | 'starfield';

interface AtomVisualizerProps {
  /** Optional AnalyserNode for audio-reactive modulation */
  analyser?: AnalyserNode | null;
  /** Width in px; defaults to 320 */
  width?: number;
  /** Height in px; defaults to 200 */
  height?: number;
  /** 0-1: how wildly dots react to touch + sound */
  intensity?: number;
  /** 0-1: animation speed multiplier */
  speed?: number;
  /** 0-1: controls dot count (~80 to ~400) */
  density?: number;
  /** 0-1: dot size multiplier */
  scale?: number;
  /** Which visualization mode to render */
  mode?: VisualizerMode;
}

interface Dot {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  color: string;
  baseSize: number;
  phase: number;
  idx: number;
}

const WARM_PALETTE = [
  '#E0908A',
  '#E8B568',
  '#C4A060',
  '#B33A2B',
  '#D4805A',
  '#9B6BA0',
  '#88C8E8',
  '#7AAA58',
];

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function buildDots(count: number, width: number, height: number, palette: string[]): Dot[] {
  const dots: Dot[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.42;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const r = maxR * Math.sqrt(t);
    const a = i * GOLDEN_ANGLE;
    dots.push({
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      homeX: cx + r * Math.cos(a),
      homeY: cy + r * Math.sin(a),
      vx: 0,
      vy: 0,
      color: palette[i % palette.length],
      baseSize: 1.4 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      idx: i,
    });
  }
  return dots;
}

export default function AtomVisualizer({
  analyser,
  width = 320,
  height = 200,
  intensity = 0.6,
  speed = 0.5,
  density = 0.5,
  scale = 0.5,
  mode = 'atom',
}: AtomVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const modeRef = useRef<VisualizerMode>(mode);
  const paramsRef = useRef({ speed, density, scale, intensity });
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    paramsRef.current = { speed, density, scale, intensity };
  }, [speed, density, scale, intensity]);

  useEffect(() => {
    function onVis() {
      setHidden(document.hidden);
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const count = Math.round(80 + density * 320);
    dotsRef.current = buildDots(count, width, height, WARM_PALETTE);

    const analyserData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    function applyPointerPush(d: Dot, pushRadius: number, pushStrength: number) {
      const p = pointerRef.current;
      if (!p.active) return;
      const pdx = d.x - p.x;
      const pdy = d.y - p.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < pushRadius && pdist > 0.01) {
        const force = (1 - pdist / pushRadius) * pushStrength;
        d.vx += (pdx / pdist) * force;
        d.vy += (pdy / pdist) * force;
      }
    }

    function loop(tMs: number) {
      if (hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const params = paramsRef.current;
      const speedMul = 0.2 + params.speed * 1.8;
      const sizeMul = 0.5 + params.scale * 1.8;
      const pushStrength = 1.2 * params.intensity;
      const pushRadius = 50 + params.intensity * 80;

      let loudness = 0;
      if (analyser && analyserData) {
        analyser.getByteTimeDomainData(analyserData);
        let sum = 0;
        for (let i = 0; i < analyserData.length; i++) {
          const v = (analyserData[i] - 128) / 128;
          sum += v * v;
        }
        loudness = Math.min(1, Math.sqrt(sum / analyserData.length) * 3);
      }

      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const dots = dotsRef.current;
      const currentMode = modeRef.current;
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.42;
      const timeS = (tMs / 1000) * speedMul;

      if (currentMode === 'atom') {
        for (const d of dots) {
          const dx = d.homeX - d.x;
          const dy = d.homeY - d.y;
          d.vx += dx * 0.02;
          d.vy += dy * 0.02;
          applyPointerPush(d, pushRadius, pushStrength);
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x += d.vx;
          d.y += d.vy;
          const bob = 1 + Math.sin(timeS + d.phase) * 0.15;
          const audioBob = 1 + loudness * 1.2;
          const size = d.baseSize * bob * audioBob * sizeMul;
          ctx.globalAlpha = 0.4 + loudness * 0.6;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'fibonacci') {
        const rotation = timeS * 0.15;
        for (const d of dots) {
          const t = d.idx / dots.length;
          const r = maxR * Math.sqrt(t) * (1 + loudness * 0.25);
          const a = d.idx * GOLDEN_ANGLE + rotation;
          d.homeX = cx + r * Math.cos(a);
          d.homeY = cy + r * Math.sin(a);
          d.vx += (d.homeX - d.x) * 0.12;
          d.vy += (d.homeY - d.y) * 0.12;
          applyPointerPush(d, pushRadius, pushStrength);
          d.vx *= 0.82;
          d.vy *= 0.82;
          d.x += d.vx;
          d.y += d.vy;
          const size = d.baseSize * sizeMul * (1 + Math.sin(timeS * 1.5 + d.phase) * 0.2);
          ctx.globalAlpha = 0.35 + t * 0.4 + loudness * 0.25;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'phyllotaxis') {
        const drift = (timeS * 15) % dots.length;
        for (const d of dots) {
          const shifted = (d.idx + drift) % dots.length;
          const t = shifted / dots.length;
          const r = maxR * Math.sqrt(t);
          const a = shifted * GOLDEN_ANGLE;
          d.homeX = cx + r * Math.cos(a);
          d.homeY = cy + r * Math.sin(a);
          d.vx += (d.homeX - d.x) * 0.2;
          d.vy += (d.homeY - d.y) * 0.2;
          applyPointerPush(d, pushRadius, pushStrength);
          d.vx *= 0.75;
          d.vy *= 0.75;
          d.x += d.vx;
          d.y += d.vy;
          const centerFade = Math.min(1, t * 4);
          const edgeFade = 1 - Math.max(0, (t - 0.85) / 0.15);
          ctx.globalAlpha = (0.4 + loudness * 0.5) * centerFade * edgeFade;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, (d.baseSize + loudness * 1.5) * sizeMul, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'wave') {
        const rings = 12;
        const per = Math.ceil(dots.length / rings);
        for (let r = 0; r < rings; r++) {
          const ringT = r / (rings - 1);
          const wavePhase = timeS * 1.2 - r * 0.6;
          const radius = maxR * (ringT + Math.sin(wavePhase) * 0.08 * (1 + loudness));
          for (let i = 0; i < per; i++) {
            const d = dots[r * per + i];
            if (!d) continue;
            const a = (i / per) * Math.PI * 2 + wavePhase * 0.3;
            d.homeX = cx + radius * Math.cos(a);
            d.homeY = cy + radius * Math.sin(a);
            d.vx += (d.homeX - d.x) * 0.18;
            d.vy += (d.homeY - d.y) * 0.18;
            applyPointerPush(d, pushRadius, pushStrength);
            d.vx *= 0.78;
            d.vy *= 0.78;
            d.x += d.vx;
            d.y += d.vy;
            ctx.globalAlpha = 0.3 + loudness * 0.5;
            ctx.fillStyle = d.color;
            ctx.beginPath();
            ctx.arc(
              d.x,
              d.y,
              d.baseSize * sizeMul * (0.8 + Math.sin(wavePhase) * 0.3),
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        }
      } else if (currentMode === 'lissajous') {
        // Two-frequency harmonograph. Each dot traces a different
        // phase offset on the Lissajous curve.
        const a = 3 + loudness * 2;
        const b = 2 + Math.sin(timeS * 0.2) * 0.5;
        const delta = timeS * 0.2;
        for (const d of dots) {
          const t = d.idx * 0.05 + timeS * 0.6;
          d.homeX = cx + maxR * Math.sin(a * t + delta);
          d.homeY = cy + maxR * Math.sin(b * t);
          d.vx += (d.homeX - d.x) * 0.15;
          d.vy += (d.homeY - d.y) * 0.15;
          applyPointerPush(d, pushRadius, pushStrength);
          d.vx *= 0.8;
          d.vy *= 0.8;
          d.x += d.vx;
          d.y += d.vy;
          ctx.globalAlpha = 0.4 + loudness * 0.4;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.baseSize * sizeMul, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'constellation') {
        // Gently drifting nebula with lines connecting nearest neighbors.
        for (const d of dots) {
          const dx = d.homeX - d.x;
          const dy = d.homeY - d.y;
          d.vx += dx * 0.01 + Math.sin(timeS + d.phase) * 0.04;
          d.vy += dy * 0.01 + Math.cos(timeS + d.phase) * 0.04;
          applyPointerPush(d, pushRadius, pushStrength);
          d.vx *= 0.93;
          d.vy *= 0.93;
          d.x += d.vx;
          d.y += d.vy;
        }
        // Draw lines first so dots sit on top
        ctx.strokeStyle = `rgba(196, 160, 96, ${0.12 + loudness * 0.15})`;
        ctx.lineWidth = 0.5;
        const maxDist = 50 + loudness * 25;
        const maxDistSq = maxDist * maxDist;
        for (let i = 0; i < dots.length; i++) {
          const a = dots[i];
          for (let j = i + 1; j < Math.min(dots.length, i + 10); j++) {
            const b = dots[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < maxDistSq) {
              ctx.globalAlpha = (1 - distSq / maxDistSq) * (0.3 + loudness * 0.3);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        // Draw dots
        for (const d of dots) {
          ctx.globalAlpha = 0.5 + loudness * 0.4;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.baseSize * sizeMul, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'helix') {
        // Double helix — two phase-offset strands rotating about a vertical axis.
        const axisSpread = maxR * 0.95;
        for (const d of dots) {
          const strand = d.idx % 2;
          const y = (d.idx / dots.length - 0.5) * height * 0.8 + cy;
          const phase = (d.idx / dots.length) * Math.PI * 4 + timeS + strand * Math.PI;
          const zx = Math.cos(phase) * (1 + loudness * 0.3);
          const depth = Math.sin(phase);
          d.homeX = cx + zx * axisSpread;
          d.homeY = y;
          d.vx += (d.homeX - d.x) * 0.2;
          d.vy += (d.homeY - d.y) * 0.2;
          applyPointerPush(d, pushRadius, pushStrength);
          d.vx *= 0.75;
          d.vy *= 0.75;
          d.x += d.vx;
          d.y += d.vy;
          // Depth affects size + alpha to simulate perspective
          const depthScale = 0.4 + ((depth + 1) / 2) * 0.8;
          ctx.globalAlpha = depthScale * (0.5 + loudness * 0.4);
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.baseSize * sizeMul * depthScale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'starfield') {
        // Streaks outward from center, wrap around when off-edge.
        for (const d of dots) {
          const vx = d.x - cx;
          const vy = d.y - cy;
          const r = Math.sqrt(vx * vx + vy * vy);
          const speed2 = (0.5 + r / maxR) * (1 + loudness * 1.5) * speedMul;
          d.x += (vx / Math.max(r, 0.1)) * speed2;
          d.y += (vy / Math.max(r, 0.1)) * speed2;
          applyPointerPush(d, pushRadius, pushStrength * 0.5);
          d.x += d.vx;
          d.y += d.vy;
          d.vx *= 0.9;
          d.vy *= 0.9;
          // Wrap to center
          if (d.x < -10 || d.x > width + 10 || d.y < -10 || d.y > height + 10 || r > maxR * 1.6) {
            const a = Math.random() * Math.PI * 2;
            const nr = Math.random() * 10 + 2;
            d.x = cx + nr * Math.cos(a);
            d.y = cy + nr * Math.sin(a);
            d.vx = 0;
            d.vy = 0;
          }
          // Trail line for streak effect
          const tailLen = 6 + r * 0.04;
          const tx = d.x - (vx / Math.max(r, 0.1)) * tailLen;
          const ty = d.y - (vy / Math.max(r, 0.1)) * tailLen;
          ctx.globalAlpha = 0.3 + (r / maxR) * 0.4 + loudness * 0.2;
          ctx.strokeStyle = d.color;
          ctx.lineWidth = d.baseSize * sizeMul * 0.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    function onPointerMove(e: PointerEvent) {
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    }
    function onPointerDown(e: PointerEvent) {
      onPointerMove(e);
      pointerRef.current.active = true;
    }
    function onPointerUp() {
      pointerRef.current.active = false;
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerUp);
    };
  }, [analyser, width, height, density, hidden]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        borderRadius: 16,
        background:
          'radial-gradient(ellipse at center, rgba(255,248,220,0.25), rgba(92,48,24,0.05))',
        touchAction: 'none',
        cursor: 'grab',
        display: 'block',
      }}
      aria-label={`Interactive ${mode} visualizer — drag to push dots`}
    />
  );
}
