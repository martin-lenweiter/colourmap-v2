'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useViewMode } from './ViewModeContext';

const PRIMARY_LINKS: { href: string; label: string }[] = [
  { href: '/day', label: 'Focus' },
  { href: '/notebook', label: 'Notebook' },
  { href: '/music', label: 'Music' },
  { href: '/geometry-field', label: 'Art' },
];

// Routes that belong under the Social nav item (used in AppShell too)
const SOCIAL_ROUTES = ['/circles', '/sparks', '/chat'];

const PHONE_PRIMARY_LINKS = PRIMARY_LINKS;

const MORE_LINKS = [
  { href: '/circles', label: 'Social' },
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
  const _isMoreActive = MORE_LINKS.some((l) => l.href === pathname);

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
    <div
      className="relative flex items-center w-full"
      style={{ background: 'var(--nav-bg, #d4b896)' }}
    >
      {/* Nav centered in full width — More button is absolutely positioned so it doesn't shift the center */}
      <nav
        ref={(el) => {
          navRef.current = el;
        }}
        className="flex w-full items-center gap-7 justify-center scrollbar-none px-4 pb-3 pt-2"
        style={{ scrollbarWidth: 'none' }}
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
              ref={
                isActive
                  ? (el) => {
                      activeLinkRef.current = el;
                    }
                  : undefined
              }
              className="shrink-0 whitespace-nowrap transition-colors tracking-[0.04em]"
              style={{
                fontSize: 16,
                color: isActive ? '#5C3018' : '#7A5438',
                fontWeight: isActive ? 600 : 400,
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

      {/* More menu — absolute, right-aligned to match ThemeSwitcher dot above */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMoreOpen(!moreOpen)}
          aria-label="More navigation"
          aria-expanded={moreOpen}
          className="h-5 w-5 rounded-full border border-border transition-all"
          style={{
            background: '#C4A060',
            boxShadow: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            display: 'block',
          }}
        />

        {moreOpen && (
          <div
            className="absolute top-full mt-1 right-0 z-[200] min-w-[160px] rounded-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150"
            style={{
              background: '#fbf3d8',
              border: '1px solid rgba(160,110,40,0.18)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            }}
          >
            {MORE_LINKS.map((link) => {
              const isSocialLink = link.href === '/circles';
              const isActive = isSocialLink
                ? SOCIAL_ROUTES.includes(pathname)
                : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    fontSize: 13,
                    color: isActive ? '#5C3018' : '#7A5438',
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
