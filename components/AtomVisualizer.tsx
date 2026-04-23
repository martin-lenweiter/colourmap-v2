'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Atom Visualizer — a family of soft, peaceful dot visualizations
 * ---------------------------------------------------------------
 *
 * Four selectable modes:
 *   - atom        : dots in a golden-spiral cloud, spring-tied to home,
 *                   drag to push. Audio-reactive brightness + size.
 *   - fibonacci   : a slowly-rotating Fibonacci spiral that grows
 *                   organically as it turns. Each dot traces an orbit.
 *   - phyllotaxis : sunflower-seed arrangement, continuously shifting
 *                   phase so the pattern appears to breathe outward.
 *   - wave        : concentric radial ripples emanating from the
 *                   center, phase-shifted by music loudness.
 *
 * All modes:
 *   - Canvas 2D (iOS Safari friendly, low battery)
 *   - pause when `document.hidden`
 *   - respond to pointer (touch/mouse drag)
 *   - optionally react to an AnalyserNode for loudness modulation
 */

export type VisualizerMode = 'atom' | 'fibonacci' | 'phyllotaxis' | 'wave';

interface AtomVisualizerProps {
  /** Optional AnalyserNode for audio-reactive dot modulation */
  analyser?: AnalyserNode | null;
  /** Width in px; defaults to 320 */
  width?: number;
  /** Height in px; defaults to 200 */
  height?: number;
  /** Visual intensity 0-1: how wildly dots react to touch/sound */
  intensity?: number;
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
  /** For Fibonacci/phyllotaxis modes: the dot's index in the spiral */
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
    const homeX = cx + r * Math.cos(a);
    const homeY = cy + r * Math.sin(a);
    dots.push({
      x: homeX,
      y: homeY,
      homeX,
      homeY,
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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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

    dotsRef.current = buildDots(200, width, height, WARM_PALETTE);

    const analyserData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    function loop(tMs: number) {
      if (hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Current audio loudness (0-1)
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
      const p = pointerRef.current;
      const currentMode = modeRef.current;
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.42;
      const timeS = tMs / 1000;

      if (currentMode === 'atom') {
        // Spring-to-home + pointer-push interactive cloud
        const pushRadius = 60 * intensity;
        const pushStrength = 1.5 * intensity;
        for (const d of dots) {
          const dx = d.homeX - d.x;
          const dy = d.homeY - d.y;
          d.vx += dx * 0.02;
          d.vy += dy * 0.02;
          if (p.active) {
            const pdx = d.x - p.x;
            const pdy = d.y - p.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < pushRadius && pdist > 0.01) {
              const force = (1 - pdist / pushRadius) * pushStrength;
              d.vx += (pdx / pdist) * force;
              d.vy += (pdy / pdist) * force;
            }
          }
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x += d.vx;
          d.y += d.vy;
          const bob = 1 + Math.sin(timeS + d.phase) * 0.15;
          const audioBob = 1 + loudness * 1.2;
          const size = d.baseSize * bob * audioBob;
          ctx.globalAlpha = 0.4 + loudness * 0.6;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'fibonacci') {
        // Slowly rotating Fibonacci spiral. Each dot rides an orbit
        // that expands/contracts with the music.
        const rotation = timeS * 0.15;
        for (const d of dots) {
          const t = d.idx / dots.length;
          const r = maxR * Math.sqrt(t) * (1 + loudness * 0.25);
          const a = d.idx * GOLDEN_ANGLE + rotation;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          d.x = x;
          d.y = y;
          const size = d.baseSize * (1 + Math.sin(timeS * 1.5 + d.phase) * 0.2);
          ctx.globalAlpha = 0.35 + t * 0.4 + loudness * 0.25;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'phyllotaxis') {
        // Sunflower-seed expansion, phase-shifted outward over time.
        // Creates an illusion of infinite outward growth.
        const drift = (timeS * 15) % dots.length;
        for (const d of dots) {
          const shifted = (d.idx + drift) % dots.length;
          const t = shifted / dots.length;
          const r = maxR * Math.sqrt(t);
          const a = shifted * GOLDEN_ANGLE;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          d.x = x;
          d.y = y;
          // Fade in from center, fade out at edge
          const centerFade = Math.min(1, t * 4);
          const edgeFade = 1 - Math.max(0, (t - 0.85) / 0.15);
          ctx.globalAlpha = (0.4 + loudness * 0.5) * centerFade * edgeFade;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(x, y, d.baseSize + loudness * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentMode === 'wave') {
        // Concentric radial waves — dots arranged on rings, phase-
        // shifted by time and loudness, pulsing outward.
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
            const x = cx + radius * Math.cos(a);
            const y = cy + radius * Math.sin(a);
            d.x = x;
            d.y = y;
            ctx.globalAlpha = 0.3 + loudness * 0.5;
            ctx.fillStyle = d.color;
            ctx.beginPath();
            ctx.arc(x, y, d.baseSize * (0.8 + Math.sin(wavePhase) * 0.3), 0, Math.PI * 2);
            ctx.fill();
          }
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
  }, [analyser, width, height, intensity, hidden]);

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
      aria-label={`Interactive ${mode} visualizer`}
    />
  );
}
