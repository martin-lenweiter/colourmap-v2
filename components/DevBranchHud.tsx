'use client';

import { useEffect, useState } from 'react';

/*
 * Dev-only HUD showing the current branch + commit SHA.
 * Fixes the recurring "wait, which version am I looking at?" problem
 * that hit during rapid branch-switching sessions.
 *
 * - Only renders when NEXT_PUBLIC_BUILD_REF is set (it always is in
 *   dev via next.config.ts, and in Vercel Preview deploys).
 * - Hidden on production main deploys (branch === 'main') to avoid
 *   clutter for real users.
 * - Dismissable with a tap so power users who don't want to see it
 *   can turn it off for a session. Persists dismissal in sessionStorage.
 *
 * Bottom-right corner, tiny, theme-adaptive.
 */
export default function DevBranchHud() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('colourmap:hud-dismissed');
      setDismissed(stored === 'true');
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem('colourmap:hud-dismissed', 'true');
    } catch {}
  }

  const ref = process.env.NEXT_PUBLIC_BUILD_REF ?? '';
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? '';

  // Hide on production main — only show on dev servers + preview deploys
  if (!ref || ref === 'main') return null;
  if (dismissed) return null;

  return (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Dismiss build indicator"
      className="fixed z-50 cursor-pointer rounded-full border px-2.5 py-1 text-[10px] font-mono transition-opacity hover:opacity-70"
      style={{
        right: 10,
        bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(26, 13, 4, 0.7)',
        color: '#F2DCBC',
        borderColor: 'rgba(196, 160, 96, 0.3)',
        backdropFilter: 'blur(4px)',
        letterSpacing: '0.04em',
      }}
      title="Current branch and commit. Tap to dismiss."
    >
      {ref} @ {sha}
    </button>
  );
}
