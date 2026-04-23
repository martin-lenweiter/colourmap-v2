'use client';

import { useEffect } from 'react';

import { ensureMobileViewport } from '@/lib/mobile-viewport';

/*
 * Invisible boot component. Renders nothing, just ensures the
 * mobile viewport listener is installed once on the client so
 * --keyboard-height is available to the rest of the app's CSS.
 *
 * Drop into app/(app)/layout.tsx once and forget.
 */
export default function MobileViewportBoot() {
  useEffect(() => {
    ensureMobileViewport();
  }, []);
  return null;
}
