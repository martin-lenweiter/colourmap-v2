'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useViewMode } from './ViewModeContext';

// Plain text labels — no glyphs (user: 'no smileys').
const PRIMARY_LINKS: { href: string; label: string }[] = [
  { href: '/day', label: 'Focus' },
  { href: '/notebook', label: 'Notebook' },
  { href: '/music', label: 'Music' },
  { href: '/circles', label: 'Social' },
];

// Routes that belong under the Social nav item
const SOCIAL_ROUTES = ['/circles', '/sparks', '/chat'];

const PHONE_PRIMARY_LINKS = PRIMARY_LINKS;

// V2 features — hidden for now, restore by moving back to PRIMARY_LINKS
const MORE_LINKS = [
  { href: '/geometry-field', label: 'Geometry Field' },
  { href: '/journey', label: 'Journey' },
  { href: '/life-scan', label: 'Life Scan' },
  { href: '/programs', label: 'Programs' },
  { href: '/research', label: 'Research' },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { mode } = useViewMode();
  const isPhone = mode === 'phone';
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);

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

  // Auto-scroll the active tab into view on route change so the user
  // never loses orientation. Especially matters on phone where only
  // 2–3 tabs are visible at once — without this, navigating to
  // /notebook scrolls Day off-screen and you feel 'lost'.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the real trigger; refs are stable
  useEffect(() => {
    const el = activeLinkRef.current;
    const nav = navRef.current;
    if (!el || !nav) return;
    const linkRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    // Center the active link in the visible nav strip when possible.
    const target = el.offsetLeft - navRect.width / 2 + linkRect.width / 2;
    nav.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [pathname]);

  // On phone, the nav scrolls horizontally with scroll-snap + fade
  // edges so the user feels like they're flipping through tabs.
  return (
    <div className="relative flex items-center w-full" style={{ background: 'var(--secondary)' }}>
      <nav
        ref={(el) => {
          navRef.current = el;
        }}
        className="mx-auto flex flex-1 items-center gap-7 overflow-x-auto justify-start scrollbar-none relative px-4 pb-3 pt-2"
        style={{
          scrollbarWidth: 'none',
          scrollSnapType: 'x proximity',
          WebkitMaskImage:
            'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)',
          maskImage:
            'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)',
          maxWidth: isPhone ? undefined : '100%',
        }}
      >
        {primary.map((link) => {
          const isSocial = link.href === '/circles';
          const isActive = link.href.startsWith('/#')
            ? pathname === '/' &&
              typeof window !== 'undefined' &&
              window.location.hash === link.href.slice(1)
            : isSocial
              ? SOCIAL_ROUTES.includes(pathname)
              : pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              ref={
                isActive
                  ? (el) => {
                      activeLinkRef.current = el;
                    }
                  : undefined
              }
              className={`shrink-0 whitespace-nowrap transition-colors tracking-[0.04em] ${
                isActive
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{
                scrollSnapAlign: 'center',
                fontSize: 16,
              }}
            >
              {link.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="block mx-auto"
                  style={{
                    height: 2,
                    width: '100%',
                    background: '#C4A060',
                    borderRadius: 2,
                    marginTop: 2,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* More menu — outside overflow-x:auto so dropdown is never clipped */}
      <div className="relative shrink-0 pr-3 pb-1 pt-1" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex h-6 w-6 items-center justify-center rotate-45 transition-all hover:scale-110"
          style={{
            background: isMoreActive ? '#C4A060' : '#C4A06040',
            borderRadius: 3,
          }}
          aria-label="More navigation"
          aria-expanded={moreOpen}
        >
          <span
            className="text-[13px] leading-none -rotate-45 font-bold"
            style={{ color: isMoreActive ? '#fff' : '#C4A060' }}
          >
            +
          </span>
        </button>

        {moreOpen && (
          <div className="absolute top-full mt-1 right-0 z-[200] min-w-[160px] rounded-xl border border-border bg-card shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {MORE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMoreOpen(false)}
                className={`block px-4 py-2.5 text-sm transition-colors ${
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
    </div>
  );
}
