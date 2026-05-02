'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ViewMode = 'desktop' | 'phone';
export type NavPosition = 'top' | 'bottom';

const ViewModeContext = createContext<{
  mode: ViewMode;
  mounted: boolean;
  setMode: (m: ViewMode) => void;
  navPosition: NavPosition;
  setNavPosition: (p: NavPosition) => void;
}>({
  mode: 'desktop',
  mounted: false,
  setMode: () => {},
  navPosition: 'top',
  setNavPosition: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('desktop');
  const [mounted, setMounted] = useState(false);
  const [navPosition, setNavPositionState] = useState<NavPosition>('top');

  useEffect(() => {
    const saved = localStorage.getItem('colourmap-view') as ViewMode | null;
    if (saved === 'phone' || saved === 'desktop') setMode(saved);
    const savedNav = localStorage.getItem('colourmap:nav-position') as NavPosition | null;
    if (savedNav === 'top' || savedNav === 'bottom') setNavPositionState(savedNav);
    setMounted(true);
  }, []);

  function handleSet(m: ViewMode) {
    setMode(m);
    localStorage.setItem('colourmap-view', m);
  }

  function handleSetNavPosition(p: NavPosition) {
    setNavPositionState(p);
    localStorage.setItem('colourmap:nav-position', p);
  }

  return (
    <ViewModeContext.Provider
      value={{
        mode,
        mounted,
        setMode: handleSet,
        navPosition,
        setNavPosition: handleSetNavPosition,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
