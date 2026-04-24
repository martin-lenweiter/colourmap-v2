'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  initials: string;
  email: string;
}

export default function UserInitialsMenu({ initials, email }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Account menu"
        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] transition-all hover:scale-105"
        style={{
          color: '#5C3018',
          background: open ? '#C4A06028' : '#C4A06012',
          border: `1px solid ${open ? '#C4A06060' : '#C4A06030'}`,
        }}
      >
        {initials || '—'}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 min-w-[180px] rounded-lg border border-border bg-card py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          <p className="px-3 pb-1 pt-0.5 text-[11px] text-muted-foreground/60 truncate">{email}</p>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="block w-full px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
