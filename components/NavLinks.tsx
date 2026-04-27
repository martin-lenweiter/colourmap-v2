'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useViewMode } from './ViewModeContext';

// Plain text labels — no glyphs (user: 'no smileys').
// 4 categories per Martin 2026-04-24: Focus / Teamwork / Notebook / Music.
// /day → Focus (inner check-in). /circles → Teamwork. /sounds → Music
// (Relaxing Sounds + Magic Maker + Lo-fi Looper + Visuals + Songs).
const PRIMARY_LINKS: { href: string; label: string }[] = [
  { href: '/day', label: 'Focus' },
  { href: '/circles', label: 'Teamwork' },
  { href: '/sparks', label: 'Sparks' },
  { href: '/notebook', label: 'Notebook' },
  { href: '/sounds', label: 'Music' },
];

const PHONE_PRIMARY_LINKS = PRIMARY_LINKS;

// V2 features — hidden for now, restore by moving back to PRIMARY_LINKS
const MORE_LINKS = [
  { href: '/profile', label: 'Profile' },
  { href: '/studios', label: 'Studios' },
  { href: '/journey', label: 'Journey' },
  { href: '/life-scan', label: 'Life Scan' },
  { href: '/programs', label: 'Programs' },
  { href: '/research', label: 'Research' },
  { href: '/music', label: 'Music Setlist' },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { mode } = useViewMode();
  const isPhone = mode === 'phone';
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const primary = isPhone ? PHONE_PRIMARY_LINKS : PRIMARY_LINKS;
  const isMoreActive = MORE_LINKS.some((l) => l.href === pathname);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [moreOpen]);

  // Phone nav: horizontal scroll so labels never get clipped at the
  // edge — Martin saw "Focus" cropped to "ocus" on his iPhone with
  // the previous centered + flex-wrap layout. Now the row is flex +
  // overflow-x-auto with start-justify, so every label is reachable
  // by swiping the strip left/right, and nothing falls off-screen.
  return (
    <nav
      className={`mx-auto flex w-full items-center pb-3 ${
        isPhone
          ? 'gap-4 overflow-x-auto pl-1 pr-3 text-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'max-w-5xl justify-center gap-8 px-4 text-base'
      }`}
    >
      {primary.map((link) => {
        const isActive = link.href.startsWith('/#')
          ? pathname === '/' &&
            typeof window !== 'undefined' &&
            window.location.hash === link.href.slice(1)
          : pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap transition-colors tracking-[0.04em] ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {link.label}
          </Link>
        );
      })}

      {/* More menu */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex h-5 w-5 items-center justify-center rotate-45 transition-all hover:scale-110"
          style={{
            background: isMoreActive ? '#C4A060' : '#C4A06040',
            borderRadius: 2,
          }}
        >
          <span
            className="text-[11px] leading-none -rotate-45 font-bold"
            style={{ color: isMoreActive ? '#fff' : '#C4A060' }}
          >
            +
          </span>
        </button>

        {moreOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 min-w-[140px] rounded-lg border border-border bg-card shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMoreOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
