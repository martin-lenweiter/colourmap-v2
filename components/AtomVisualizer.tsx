'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * Atom Visualizer
 * ----------------
 * A soft, peaceful cloud of 180 colored dots arranged around a center.
 * Touch or click-drag the canvas to push the nearest dots outward; they
 * spring smoothly back to their home position.
 *
 * Audio-reactive: if a Web Audio AnalyserNode is passed in via the
 * `analyser` prop, the dots breathe with the music — brightness and
 * size pulse with the current loudness.
 *
 * Rendered on Canvas 2D for iOS/Android compatibility and low battery
 * impact. Target: 60 fps with 180 dots on iPhone 11+ and modern Android.
 *
 * Pauses automatically when the page is hidden (same visibility trick
 * the audio engine uses) so it doesn't drain battery in the background.
 */

interface AtomVisualizerProps {
  /** Optional AnalyserNode for audio-reactive dot modulation */
  analyser?: AnalyserNode | null;
  /** Width in px; defaults to 320. Canvas adapts to container if set to 'auto' */
  width?: number;
  /** Height in px; defaults to 200 */
  height?: number;
  /** Visual intensity 0-1: how wildly dots react to touch and sound */
  intensity?: number;
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

function buildDots(count: number, width: number, height: number, palette: string[]): Dot[] {
  const dots: Dot[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.42;
  for (let i = 0; i < count; i++) {
    // Golden-angle spiral for even distribution — sunflower-seed pattern
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const t = i / count;
    const r = maxR * Math.sqrt(t);
    const a = i * goldenAngle;
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
    });
  }
  return dots;
}

export default function AtomVisualizer({
  analyser,
  width = 320,
  height = 200,
  intensity = 0.6,
}: AtomVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [hidden, setHidden] = useState(false);

  // Pause when document is hidden (same trick the audio engine uses)
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

    // Handle retina / hi-dpi
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    dotsRef.current = buildDots(180, width, height, WARM_PALETTE);

    const analyserData = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    function loop(tMs: number) {
      if (hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Compute current audio loudness (0-1) if analyser is connected
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
      // Fade previous frame (trail effect)
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, width, height);

      const dots = dotsRef.current;
      const p = pointerRef.current;
      const pushRadius = 60 * intensity;
      const pushStrength = 1.5 * intensity;

      for (const d of dots) {
        // Spring toward home
        const dx = d.homeX - d.x;
        const dy = d.homeY - d.y;
        d.vx += dx * 0.02;
        d.vy += dy * 0.02;

        // Pointer push
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

        // Damping
        d.vx *= 0.9;
        d.vy *= 0.9;

        // Integrate
        d.x += d.vx;
        d.y += d.vy;

        // Size breathes with audio + per-dot sinusoidal phase
        const bob = 1 + Math.sin(tMs / 1000 + d.phase) * 0.15;
        const audioBob = 1 + loudness * 1.2;
        const size = d.baseSize * bob * audioBob;

        // Brightness modulated by loudness
        const glow = 0.4 + loudness * 0.6;

        ctx.globalAlpha = glow;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
        ctx.fill();
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
      aria-label="Interactive visualizer — drag or touch to move the dots"
    />
  );
}
