'use client';

import SoundLab from '@/components/SoundLab';

/*
 * Sounds page — the full Sound Lab (Calming Sounds + Magic Maker +
 * Lo-fi Looper) extracted from the Day tabs so the Day surface stays
 * about feeling/doing and sound lives as its own destination.
 */
export default function SoundsPage() {
  // Wider viewport on md+ so the Relaxing Sounds page can spread its
  // controls into a DJ-mix-table layout (left = layers, center =
  // wave + tuning, right = melody + effects + sacred). Phone stays
  // tight in the read-column width.
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:max-w-7xl md:px-8">
      <SoundLab />
    </div>
  );
}
