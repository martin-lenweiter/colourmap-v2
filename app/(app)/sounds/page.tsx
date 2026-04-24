'use client';

import SoundLab from '@/components/SoundLab';

/*
 * Sounds page — the full Sound Lab (Calming Sounds + Magic Maker +
 * Lo-fi Looper) extracted from the Day tabs so the Day surface stays
 * about feeling/doing and sound lives as its own destination.
 */
export default function SoundsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <SoundLab />
    </div>
  );
}
