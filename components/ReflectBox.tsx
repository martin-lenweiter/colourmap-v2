'use client';

import { useState } from 'react';
import CaringDepth from '@/components/CaringDepth';

export default function ReflectBox() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('colourmap:reflect-box-open') !== 'false';
  });

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('colourmap:reflect-box-open', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div
      className="space-y-4 rounded-3xl border px-5 py-5"
      style={{
        borderColor: '#9B6BA050',
        background: 'linear-gradient(180deg, rgba(245,236,220,0.97), rgba(240,228,208,0.95))',
        boxShadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
      }}
    >
      <button
        type="button"
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-center gap-2"
      >
        <p
          className="text-center font-semibold uppercase"
          style={{ color: '#9B6BA0', fontSize: '12px', letterSpacing: '0.22em' }}
        >
          Reflect
        </p>
        <span
          className="text-sm transition-transform duration-200"
          style={{
            color: '#9B6BA080',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>
      {open && <CaringDepth forcedTab="reflect" />}
    </div>
  );
}
