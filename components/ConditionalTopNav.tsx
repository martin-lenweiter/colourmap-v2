'use client';

import NavLinks from '@/components/NavLinks';
import { useViewMode } from '@/components/ViewModeContext';

export default function ConditionalTopNav() {
  const { navPosition } = useViewMode();
  if (navPosition === 'bottom') return null;
  return <NavLinks />;
}
