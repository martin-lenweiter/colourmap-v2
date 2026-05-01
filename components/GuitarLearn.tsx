'use client';

const CHAPTERS = [
  {
    n: 1,
    title: 'Your First 5 Chords',
    desc: 'Am, E, G, C, D — the five CAGED shapes that unlock hundreds of songs. Learn the fingering, practise the transitions.',
    ready: true,
  },
  {
    n: 2,
    title: 'The Pentatonic Box',
    desc: 'Minor pentatonic in the first position. Your first scale for soloing and improvisation over any blues or rock track.',
    ready: true,
  },
  {
    n: 3,
    title: 'The Major Scale Across the Neck',
    desc: 'Five CAGED positions mapped out — see how the same notes connect across the whole fretboard.',
    ready: false,
  },
  {
    n: 4,
    title: 'Chord Families',
    desc: 'Major, minor, 7th, sus2, sus4 — how to build any chord from intervals and why they feel the way they do.',
    ready: false,
  },
  {
    n: 5,
    title: 'Modes — The Emotional Colours',
    desc: 'Dorian, Phrygian, Lydian … each mode gives a different emotional flavour to the same set of notes.',
    ready: false,
  },
  {
    n: 6,
    title: 'The Andalusian World',
    desc: 'Phrygian Dominant, the flamenco cadence, and how Spanish music creates tension and longing with a single four-chord descent.',
    ready: false,
  },
  {
    n: 7,
    title: 'Soul Harmony',
    desc: 'Extended chords — 7ths, 9ths, maj7s — the ii-V-I progression, and how soul and jazz guitar creates depth with voicing.',
    ready: false,
  },
];

export default function GuitarLearn() {
  return (
    <div className="space-y-3">
      {CHAPTERS.map((ch) => (
        <div
          key={ch.n}
          className="rounded-xl px-5 py-4"
          style={{
            background: ch.ready ? '#C4A06010' : '#C4A06006',
            border: `1px solid ${ch.ready ? '#C4A06030' : '#C4A06015'}`,
            opacity: ch.ready ? 1 : 0.7,
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold"
              style={{
                background: ch.ready ? '#C4A060' : '#C4A06020',
                color: ch.ready ? '#fff' : '#C4A060',
              }}
            >
              {ch.n}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
                  {ch.title}
                </span>
                {!ch.ready && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]"
                    style={{
                      background: '#C4A06015',
                      color: '#C4A060',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                    }}
                  >
                    coming soon
                  </span>
                )}
              </div>
              <p
                className="mt-1 text-[12px] leading-relaxed"
                style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
              >
                {ch.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
