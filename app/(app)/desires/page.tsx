'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import MyDesires from '@/components/MyDesires';

// Leaflet must be loaded client-side only — it uses window/document.
const DesireMap = dynamic(() => import('@/components/DesireMap'), { ssr: false });

export default function DesiresPage() {
  const [view, setView] = useState<'mine' | 'map'>('mine');

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {view === 'map' ? (
        <div style={{ height: '80vh', borderRadius: 20, overflow: 'hidden' }}>
          <DesireMap onClose={() => setView('mine')} />
        </div>
      ) : (
        <MyDesires onOpenMap={() => setView('map')} />
      )}
    </div>
  );
}
