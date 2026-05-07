'use client';

import { useEffect, useRef, useState } from 'react';

const STAR_THEMES = ['comic-blue', 'comic-green'];

function getTheme(): string {
  try {
    return localStorage.getItem('colourmap-theme') ?? '';
  } catch {
    return '';
  }
}

type Star = {
  x: number;
  y: number;
  r: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
};

function makeStars(w: number, h: number, count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.4 + 0.3,
    opacity: Math.random() * 0.5 + 0.15,
    twinkleSpeed: Math.random() * 0.015 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2,
  }));
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function check() {
      const theme = getTheme();
      setVisible(STAR_THEMES.includes(theme));
    }
    check();

    /* watch localStorage changes from ThemeSwitcher */
    function onStorage(e: StorageEvent) {
      if (e.key === 'colourmap-theme') check();
    }
    /* also watch html class changes */
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const isGreen = getTheme() === 'comic-green';
    const starColor = isGreen ? '180,210,140' : '200,225,255';

    const stars = makeStars(W, H, 160);
    let t = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);
      t += 1;

      for (const s of stars) {
        const twinkle = s.opacity + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * 0.12;
        const op = Math.max(0.05, Math.min(0.75, twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${op.toFixed(2)})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}
