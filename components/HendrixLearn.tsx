'use client';

import { useState } from 'react';

/* ─── Helpers ────────────────────────────────────────────── */

function SectionLabel({
  children,
  color = '#C07838',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color }}>
      {children}
    </p>
  );
}

function TabBlock({ lines, caption }: { lines: string[]; caption?: string }) {
  return (
    <div className="overflow-x-auto">
      <pre
        className="rounded-lg px-3 py-2.5 text-[11px] leading-[1.7]"
        style={{
          background: '#0D0D0D',
          border: '1px solid #C0783825',
          color: '#D4A870',
          fontFamily: 'monospace',
          whiteSpace: 'pre',
        }}
      >
        {lines.join('\n')}
      </pre>
      {caption && (
        <p
          className="mt-1 text-[10px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function InfoBox({ children, color = '#C07838' }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 text-[12px] space-y-1.5"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}20`,
        fontFamily: 'var(--font-serif)',
      }}
    >
      {children}
    </div>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold mr-1 mb-1"
      style={{ background: '#C0783818', border: '1px solid #C0783830', color: '#C07838' }}
    >
      {label}
    </span>
  );
}

/* ─── Song entries ───────────────────────────────────────── */

interface HendrixSong {
  id: string;
  title: string;
  album: string;
  year: string;
  key: string;
  style: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techniques: string[];
  desc: string;
  content: React.ReactNode;
}

const SONGS: HendrixSong[] = [
  {
    id: 'purple-haze',
    title: 'Purple Haze',
    album: 'Are You Experienced',
    year: '1967',
    key: 'E (concert Eb — tune down half step)',
    style: 'Blues-rock riff',
    difficulty: 'intermediate',
    techniques: ['E7#9 (Hendrix chord)', 'Tritone riff', 'Pentatonic lead', 'Whammy dives'],
    desc: 'Jimi\'s signature riff. The E7#9 "Hendrix chord" + tritone interval define the whole song.',
    content: (
      <div className="space-y-4">
        <InfoBox>
          <p className="font-semibold" style={{ color: '#C07838' }}>
            Tune down to Eb (all strings half step flat)
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Jimi tuned down so his heavy strings felt lighter. The tab below shows written pitch —
            all frets are the same, just the actual sound is a semitone lower.
          </p>
        </InfoBox>
        <SectionLabel>Intro riff</SectionLabel>
        <TabBlock
          lines={[
            'E|--0------0-3-3-0---------|',
            'A|--2------2-5-5-2---------|',
            'D|--2------2-5-5-2---------|',
            'G|--1------1-4-4-1---------|',
            'B|-------------------------|',
            'e|-------------------------|',
            '',
            'That is the E7#9 chord (0-2-2-1-x-x)',
            'Then the tritone riff:',
            'e|--12--11--|',
            'B|----------|',
            '    B   Bb   ← tritone above E = Bb',
          ]}
          caption="The Bb against E creates the signature dissonance. Tritone = 6 semitones above root."
        />
        <SectionLabel>Main riff (bars 1–4 loop)</SectionLabel>
        <TabBlock
          lines={[
            'e|--12--11--12--12-12--11---------|',
            'B|--------------------------------|',
            'G|--------------------12------0---|',
            'D|--------------------------------|',
            'A|--------------------------------|',
            'E|--------------------------------|',
            '',
            'Followed by E7#9 stab x3',
          ]}
          caption="High e-string melody. The tritone (fret 11 = Bb) is the purple haze — dissonant, psychedelic."
        />
        <SectionLabel>Verse chords</SectionLabel>
        <TabBlock
          lines={[
            '| E7#9  | E7#9  | E7#9  | E7#9  |',
            '| A9    |       | B9    |       |',
            '',
            'E7#9 voicing (Hendrix chord):',
            'e|--x--|',
            'B|--8--|',
            'G|--7--|',
            'D|--9--|',
            'A|--7--|',
            'E|--x--|',
          ]}
          caption="The E7#9 at fret 7: root E, b7 D, major 3rd G#, #9 G natural. Both the major 3rd and b3 at once — that's the tension."
        />
        <SectionLabel>Solo excerpt (bars 9–12)</SectionLabel>
        <TabBlock
          lines={[
            'e|--15b17~~--15--12--14b15----|',
            'B|---------------------------12|',
            'G|-----------------------------|',
            '',
            'Then down:',
            'e|--12p9---12p9--12p9----------|',
            'B|-----------9p8--------------|',
          ]}
          caption="Box 4 position (frets 12–15). Fast pull-offs cascade down — pure Hendrix fluid."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#C07838' }}>
            Key techniques to master
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            1. The E7#9 stab — hit and mute immediately (choked attack).
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            2. The Bb tritone note — it's not a "wrong note," it's the whole point. Lean into the
            tension.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            3. Whammy bar dives after chord stabs — Jimi would stab and immediately dive for a split
            second.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'hey-joe',
    title: 'Hey Joe',
    album: 'Are You Experienced',
    year: '1966',
    key: 'C (but feels like E blues at end)',
    style: 'Slow blues-rock ballad',
    difficulty: 'beginner',
    techniques: [
      'Open-position chords',
      'Thumb bass notes',
      'Simple lead fills',
      'Arpeggio texture',
    ],
    desc: "Jimi's debut single. Beautiful slow descending progression, iconic opening lead lick.",
    content: (
      <div className="space-y-4">
        <SectionLabel>Main chord progression (verse)</SectionLabel>
        <TabBlock
          lines={[
            '| C    | G    | D    | A    | E    |',
            '',
            'Cycle: C → G → D → A → E  (each 2 beats, repeat)',
          ]}
          caption="A beautiful descending progression — C major all the way down through open chords to E."
        />
        <SectionLabel>Opening lead lick (over E)</SectionLabel>
        <TabBlock
          lines={[
            'e|--0---------0-----------|',
            'B|--0----3b4~~0--3--------| ',
            'G|--1-1-------------------| ← E major chord tones',
            'D|------------------------|',
            '',
            'Or the melodic version:',
            'e|--12b14~~--12--9--------|',
            'B|------------------10----|',
          ]}
          caption="Play over open E chord ringing. Jimi's thumb covers the low E bass note throughout."
        />
        <SectionLabel>Thumb-over-neck technique</SectionLabel>
        <TabBlock
          lines={[
            'Normal grip: thumb behind neck',
            'Hendrix grip: thumb wraps over to fret low E (or A) string',
            '',
            'Example — E chord with thumb on low E fret 0:',
            'e|--0--|  ← index on high e',
            'B|--0--|',
            'G|--1--|  ← index',
            'D|--2--|  ← middle',
            'A|--2--|  ← ring',
            'E|--0--|  ← THUMB wraps over',
          ]}
          caption="The thumb frees the four fingers to add extensions and melody notes on top of chord shapes."
        />
        <SectionLabel>End section — E blues feel</SectionLabel>
        <TabBlock
          lines={[
            'After the descent, Jimi extends on E:',
            '| E7   | E7   | E7   | E7   |',
            '',
            'Lead fill over E7:',
            'e|--12p9--12p9--9-12-14b15~~--|',
            'B|------------------------------|',
          ]}
          caption="The song ends in blues mode on E. Open position E7 + box 4 lead (frets 12–15) = full range."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#C07838' }}>
            Why this song first
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Hey Joe is the most approachable Hendrix song. The chord progression uses familiar open
            shapes. The lead fills are singable. And the slow tempo (58–65 BPM) lets you hear every
            note clearly and copy the phrasing.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'little-wing',
    title: 'Little Wing',
    album: 'Axis: Bold as Love',
    year: '1967',
    key: 'E minor',
    style: 'Arpeggiated ballad / fingerstyle feel',
    difficulty: 'advanced',
    techniques: [
      'Arpeggio chords with melody',
      'Thumb bass + chord melody',
      'Open string colours',
      'Double-stop runs',
    ],
    desc: 'One of the most beautiful songs ever recorded. Chords, melody and bass all at once.',
    content: (
      <div className="space-y-4">
        <InfoBox color="#9B6BA0">
          <p className="font-semibold" style={{ color: '#9B6BA0' }}>
            The secret of Little Wing
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Jimi isn't just playing rhythm or lead — he plays both simultaneously. The thumb plays
            bass notes, middle strings form chord shapes, and the index or pinky adds a melody note
            on top. It's one guitar sounding like three.
          </p>
        </InfoBox>
        <SectionLabel color="#9B6BA0">Main progression</SectionLabel>
        <TabBlock
          lines={[
            '| Em   | G    | Am   | Em   |',
            '| Bm   | Bb   | C    | G  A |',
            '',
            'Then: | F    | C    | D    | D    |',
          ]}
          caption="Em natural → moves through Am, Bm — all in E minor family. The Bb and F are borrowed chords (dark colour)."
        />
        <SectionLabel color="#9B6BA0">Opening intro — chord-melody technique</SectionLabel>
        <TabBlock
          lines={[
            'e|--0-------0-3-0------3-0-----|',
            'B|--0---1-3-------3-1------3---|',
            'G|--0-0-----------------0------|',
            'D|--2--------------------------|',
            'A|--2--------------------------|',
            'E|--0--------------------------|',
            '',
            '↑ Em chord (thumb on E and A strings)',
            '  while fingers add melody on B and e strings',
          ]}
          caption="This is chord-melody playing. Let every note ring. Use fingers, not a pick — or a very light pick touch."
        />
        <SectionLabel color="#9B6BA0">G major chord with added melody</SectionLabel>
        <TabBlock
          lines={[
            'e|--3------3-5-3----|',
            'B|--3--3-5------5-3-|',
            'G|--4----------------|',
            'D|--5----------------|',
            'A|--5----------------|',
            'E|--3----------------|',
            '',
            '↑ G chord ringing + melody on e and B strings',
          ]}
          caption={
            'Let the open strings within G chord ring like a harp. Jimi called this "waterfall" playing.'
          }
        />
        <SectionLabel color="#9B6BA0">Am → Em chord move</SectionLabel>
        <TabBlock
          lines={[
            'Am:',
            'e|--0--|',
            'B|--1--|',
            'G|--2--|',
            'D|--2--|',
            'A|--0--|',
            '',
            'To Em:',
            'e|--0--|',
            'B|--0--|',
            'G|--0--|',
            'D|--2--|',
            'A|--2--|',
            'E|--0--|',
          ]}
          caption="Move smoothly between these — keep open E, B, and e strings ringing through both chords."
        />
        <SectionLabel color="#9B6BA0">Outro lead runs</SectionLabel>
        <TabBlock
          lines={[
            'e|--12-15b17~~--15--12-----------|',
            'B|---------------------15--12----|',
            'G|--------------------------------15--|',
            '',
            'Then double-stop run:',
            'e|--12--10--8--|',
            'B|--12--10--8--|',
          ]}
          caption="Box 4 (frets 12–15). Double-stop descent on e+B — Hendrix's signature outro move."
        />
        <InfoBox color="#9B6BA0">
          <p className="font-semibold" style={{ color: '#9B6BA0' }}>
            How to approach this song
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Start with just the chord progression: Em → G → Am → Em. Strum simply. Then add the
            melody notes on top one at a time. Speed is irrelevant — tone and feel are everything.
            Listen to the original 50 times before playing it once.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'voodoo-child',
    title: 'Voodoo Child (Slight Return)',
    album: 'Electric Ladyland',
    year: '1968',
    key: 'E minor',
    style: 'Heavy blues-rock / wah',
    difficulty: 'advanced',
    techniques: [
      'Wah-wah expression',
      'Thumb riff',
      'Box 1 lead',
      'Heavy bends + vibrato',
      'Drop E tuning feel',
    ],
    desc: 'The heaviest Hendrix track. Iconic wah riff, massive bends, and pure blues power.',
    content: (
      <div className="space-y-4">
        <SectionLabel>The legendary intro riff</SectionLabel>
        <TabBlock
          lines={[
            'Tune to Eb (all strings down half step)',
            '',
            'e|-------------------------------------|',
            'B|-------------------------------------|',
            'G|-------------------------------------|',
            'D|-------------------------------------|',
            'A|-------------------------------------|',
            'E|--0--0--3--0--0--3-2--0--0--2--0-----|',
            '',
            'Open E = root drone. Hammer-ons at frets 3 and 2.',
          ]}
          caption="The entire riff lives on the low E string. Open E drone with fret 3 (G) and fret 2 (F#) above it."
        />
        <SectionLabel>Wah-wah riff (with expression)</SectionLabel>
        <TabBlock
          lines={[
            'The rhythm riff (E string + A string):',
            'E|--0--3h0--0--3h0--0--2h0--0----------|',
            '',
            'Wah pattern: heel-down on beats 1–2, toe-down on the attack note, back to heel',
            'Wah timing:   ___TOE_____  ___TOE_____',
            '              HEEL        HEEL',
          ]}
          caption="Wah = expression pedal. Heel down = bass/woof. Toe down = treble/wah cry. Jimi synced wah to note attacks."
        />
        <SectionLabel>Main verse chord</SectionLabel>
        <TabBlock
          lines={[
            'Em7 (open):',
            'e|--0--|',
            'B|--3--|',
            'G|--0--|',
            'D|--2--|',
            'A|--2--|',
            'E|--0--|',
            '',
            '12-bar Em blues:',
            '| Em   | Em   | Em   | Em   |',
            '| Am   | Am   | Em   | Em   |',
            '| B7   | A7   | Em   | B7   |',
          ]}
          caption="Minor 12-bar in Em. The wah riff runs over all of it — harmonic movement under a continuous riff."
        />
        <SectionLabel>Solo — Box 1 in E (frets 12–15 for Em)</SectionLabel>
        <TabBlock
          lines={[
            'e|--12-15b17~~----15-12---------|',
            'B|--12-15------15-----15-12-----|',
            'G|--12---------------------12--|',
            '',
            'The explosive middle:',
            'e|--15b17--15b17--15b17~~-------|',
            '   (repeat bend 3x — Albert King style)',
          ]}
          caption="Box 1 of Em pentatonic sits at frets 12–15 in this register. Massive bends, full tone. Attack hard."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#C07838' }}>
            No wah? No problem
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Play the riff without wah first. The note shapes are powerful even without the effect.
            When you add wah, treat it as an accent — don't just sweep it randomly. Sync it to the
            rhythm: attack on the "wah" moment, leave it open on the sustain.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'castles-made-of-sand',
    title: 'Castles Made of Sand',
    album: 'Axis: Bold as Love',
    year: '1967',
    key: 'A minor',
    style: 'Fingerstyle blues ballad',
    difficulty: 'intermediate',
    techniques: [
      'Backwards solo (recorded in reverse)',
      'Open chord arpeggio',
      'Sus2 chords',
      'Descending Am runs',
    ],
    desc: "A meditative ballad with Jimi's most lyrical chord-melody playing and a famous backwards solo.",
    content: (
      <div className="space-y-4">
        <SectionLabel>Main progression</SectionLabel>
        <TabBlock
          lines={[
            '| A    | Asus2 | A    | Asus2 |',
            '| G    | Gsus2 | D    | Dsus2 |',
            '',
            'Asus2 voicing:',
            'e|--0--|',
            'B|--0--|',
            'G|--2--|',
            'D|--2--|',
            'A|--0--|',
          ]}
          caption="The sus2 chords (no 3rd, add 2nd) give this song its dreamy, open quality."
        />
        <SectionLabel>Arpeggio texture (opening bars)</SectionLabel>
        <TabBlock
          lines={[
            'A chord with arpeggiated picking:',
            'e|----0-------0-------0------|',
            'B|-------2-------2-------2---|',
            'G|--2-------2-------2--------|',
            'D|---------------------------|',
            'A|--0------------------------|',
            '',
            'Pattern: A-string bass → G → B → e (thumb-index-middle-ring)',
          ]}
          caption="Fingerpick or use a very soft pick. Let each note ring into the next — don't damp."
        />
        <SectionLabel>Am descending run (verse fill)</SectionLabel>
        <TabBlock
          lines={[
            'e|--5--3-----|',
            'B|--------5--|',
            'G|--5--4--5--|',
            'D|-----------|',
            '',
            'Then resolve to:',
            'e|--0--------|',
            'B|--1--------|  ← Am chord',
            'G|--2--------|',
          ]}
          caption="Descend from Am pentatonic fret 5, land on open Am chord. Lyrical and simple."
        />
        <SectionLabel>Backwards solo — approximation</SectionLabel>
        <TabBlock
          lines={[
            'The original is recorded in reverse — impossible to replicate exactly.',
            'Approximate the feel: slow swells, notes that start quiet and grow louder.',
            '',
            'Use volume knob technique:',
            'e|--7b9-------12b14----15b17~~--|',
            '',
            'Roll volume off, pick note, roll volume up during the bend.',
            'Sounds like a backwards note — the attack comes AFTER the body.',
          ]}
          caption="Volume swell + bend = backwards effect. Set your guitar volume to 0, pick note, bend, then roll up."
        />
        <InfoBox color="#7A9870">
          <p className="font-semibold" style={{ color: '#7A9870' }}>
            The soul of this song
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Castles Made of Sand is about transience. Play it with that feeling: nothing is held too
            tightly, every note fades. Let the sustain decay naturally. No heavy picking. The
            arpeggio should feel like water.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'foxy-lady',
    title: 'Foxy Lady',
    album: 'Are You Experienced',
    year: '1967',
    key: 'F# minor',
    style: 'Heavy riff-rock',
    difficulty: 'intermediate',
    techniques: ['F# power chord intro', 'Wah accent', 'Minor pentatonic lead', 'Rhythmic muting'],
    desc: "A heavy riff built on F#. Jimi's most aggressive rhythm guitar — grunt and attitude.",
    content: (
      <div className="space-y-4">
        <InfoBox>
          <p className="font-semibold" style={{ color: '#C07838' }}>
            Tune down to Eb for the original sound
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            In Eb tuning, the "written" F# power chord fret positions stay the same but the actual
            pitch is F natural. This gives the riff its dark, heavy character.
          </p>
        </InfoBox>
        <SectionLabel>Intro riff (the stomp)</SectionLabel>
        <TabBlock
          lines={[
            'E|--2-----2-2-2-2-2-2--0-----|',
            'A|--4-----4-4-4-4-4-4--2-----|',
            'D|--4-----4-4-4-4-4-4--2-----|',
            '',
            '↑ F#5 power chord with rhythmic palm muting + open E accent',
          ]}
          caption="F#5 power chord: E-string fret 2, A-string fret 4, D-string fret 4. The open E drop creates the stomp."
        />
        <SectionLabel>Main riff pattern</SectionLabel>
        <TabBlock
          lines={[
            'E|--2-----x-x-2--0----2--2----|',
            'A|--4-----x-x-4--2----4--4----|',
            'D|--4-----x-x-4--2----4--4----|',
            '',
            'x = muted strum (percussive scratch)',
          ]}
          caption="The x mutes create a choppy, aggressive rhythm. Alternate between F#5 and the open-E drop."
        />
        <SectionLabel>Verse chord moves</SectionLabel>
        <TabBlock
          lines={[
            '| F#m  | F#m  | A    | B    |',
            '',
            'F#m (barre chord):',
            'e|--2--|',
            'B|--2--|',
            'G|--2--|',
            'D|--4--|',
            'A|--4--|',
            'E|--2--|  ← barre at fret 2',
          ]}
          caption="The verse lifts to F#m barre. Then A and B — classic rock trio move."
        />
        <SectionLabel>Lead fill (F# minor pentatonic)</SectionLabel>
        <TabBlock
          lines={[
            'F# minor pent box 1 (fret 2-5):',
            'e|--2--5--|',
            'B|--2--5--|',
            'G|--2--4--|',
            'D|--2--4--|',
            'A|--2--4--|',
            'E|--2--5--|',
            '',
            'Fill lick:',
            'e|--5b7~~--5--2--------|',
            'B|--------------5--2---|',
          ]}
          caption="F# minor pentatonic at frets 2–5. Same shape as Am pentatonic but starting at fret 2."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#C07838' }}>
            Attitude
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Foxy Lady is all about attitude and groove. The riff should feel like a strut. Hit the
            F#5 chord with authority, let the mutes be percussive, and play the lead fills with
            swagger — short, punchy, not too many notes.
          </p>
        </InfoBox>
      </div>
    ),
  },
];

/* ─── Hendrix technique guide ────────────────────────────── */

interface Technique {
  id: string;
  title: string;
  desc: string;
  content: React.ReactNode;
}

const TECHNIQUES: Technique[] = [
  {
    id: 'hendrix-chord',
    title: 'The Hendrix Chord (E7#9)',
    desc: 'The most iconic chord in rock. Contains both the major 3rd (G#) and the b3 (G) — tension made audible.',
    content: (
      <div className="space-y-3">
        <TabBlock
          lines={[
            'E7#9 "Hendrix chord":',
            'e|--x--|',
            'B|--8--|  ← #9 = F# (G above E in octave)',
            'G|--7--|  ← b7 = D',
            'D|--9--|  ← major 3rd = G# (wait... and the #9 adds G natural)',
            'A|--7--|  ← root = E',
            'E|--x--|',
            '',
            'Or open-position version:',
            'e|--3--|  ← G natural (#9)',
            'B|--3--|  ← G again',
            'G|--1--|  ← G# (major 3rd)',
            'D|--2--|  ← B (5th)',
            'A|--2--|  ← B (5th)',
            'E|--0--|  ← E (root)',
          ]}
          caption="The genius: G# (major 3rd) and G natural (#9/b3) coexist. It's simultaneously major and minor. Pure tension."
        />
        <InfoBox>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Purple Haze, Foxy Lady, and Voodoo Child all use this chord. It defines the Hendrix
            sound more than any other single element. Practise switching from E7#9 to D9 to A7 —
            Jimi's most-used trio.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'thumb-over',
    title: 'Thumb-Over-Neck Bass Notes',
    desc: "Jimi's thumb would wrap over the top of the neck to fret the low E string — freeing the four fingers for chord extensions.",
    content: (
      <div className="space-y-3">
        <TabBlock
          lines={[
            'Standard G chord:',
            'e|--3--|  ← pinky',
            'B|--3--|  ← ring',
            'G|--0--|',
            'D|--0--|',
            'A|--2--|  ← middle',
            'E|--3--|  ← index',
            '',
            'Hendrix G chord (thumb on E string):',
            'e|--3--|  ← ring',
            'B|--3--|  ← middle',
            'G|--0--|',
            'D|--0--|',
            'A|--2--|  ← index',
            'E|--3--|  ← THUMB (wrapped over top)',
            '',
            'Now index and pinky are FREE for melody notes!',
          ]}
          caption="The freed fingers can add melody notes, slides, and embellishments while the chord rings beneath."
        />
        <InfoBox>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Works best with a thinner neck profile. In Little Wing, Hey Joe, and Bold as Love, Jimi
            uses this constantly to add notes on top of chord shapes without interrupting the bass
            movement.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'chord-melody',
    title: 'Chord-Melody Technique',
    desc: 'Playing melody, harmony and bass simultaneously — making one guitar sound like a full arrangement.',
    content: (
      <div className="space-y-3">
        <TabBlock
          lines={[
            'Example: Em chord with melody on top (Little Wing style)',
            '',
            'e|--3------5--3--0--|  ← melody on high e',
            'B|--3------3--------|  ← chord tone stays static',
            'G|--0---------------|',
            'D|--2---------------|',
            'A|--2---------------|',
            'E|--0---------------|  ← bass (thumb)',
            '',
            'The three layers:',
            'BASS:     low E (thumb)',
            'HARMONY:  D, A, G strings (chord)',
            'MELODY:   B, e strings (moving)',
          ]}
          caption="Practice each layer separately. Thumb + harmony, then add melody. Then combine slowly."
        />
      </div>
    ),
  },
  {
    id: 'whammy-bar',
    title: 'Whammy Bar (Vibrato/Tremolo)',
    desc: 'Jimi used a Fender Stratocaster synchronized tremolo. Dips, dives, flutters — all part of the language.',
    content: (
      <div className="space-y-3">
        <TabBlock
          lines={[
            'Whammy techniques:',
            '',
            'Short dive:    Pick note → push bar down 1/4 tone → release',
            '               Effect: brief pitch wobble, like a human vocal',
            '',
            'Full dive:     Pick chord → push bar to zero pitch → release',
            '               Effect: "Whoooooom" — used in Voodoo Child intro',
            '',
            'Flutter:       Rapid small pushes on bar during sustain',
            '               Effect: mechanical vibrato — fast and even',
            '',
            'Dive and return: Push down smoothly, hold, return to pitch',
            '               Effect: siren / spaceship sound',
          ]}
          caption="The bar should return to pitch perfectly — setup is critical. Jimi restrung his Strat in reverse (low E on high side) which affected bar return tension."
        />
        <InfoBox>
          <p style={{ color: 'var(--muted-foreground)' }}>
            No whammy bar? Skip it initially and focus on note accuracy. The whammy bar is a colour
            — the underlying song works without it. Don't let absence of the bar stop you from
            learning Hendrix.
          </p>
        </InfoBox>
      </div>
    ),
  },
];

/* ─── Main component ─────────────────────────────────────── */

type MainView = 'songs' | 'techniques';
type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

const DIFF_COLOR: Record<string, string> = {
  beginner: '#7A9870',
  intermediate: '#C4A060',
  advanced: '#C07838',
};

export default function HendrixLearn() {
  const [view, setView] = useState<MainView>('songs');
  const [openSong, setOpenSong] = useState<string | null>('purple-haze');
  const [openTech, setOpenTech] = useState<string | null>('hendrix-chord');
  const [diffFilter, setDiffFilter] = useState<Difficulty>('all');

  const filteredSongs =
    diffFilter === 'all' ? SONGS : SONGS.filter((s) => s.difficulty === diffFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
            Hendrix Program
          </h2>
          <span
            className="text-[11px] font-medium rounded-full px-2 py-0.5"
            style={{ background: '#C0783820', color: '#C07838' }}
          >
            6 iconic songs
          </span>
        </div>
        <p
          className="text-[12px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Songs, tabs, chord shapes, lick breakdowns, and key techniques — the complete Hendrix
          vocabulary.
        </p>
      </div>

      {/* View switcher */}
      <div className="flex gap-2">
        {(['songs', 'techniques'] as MainView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="rounded-full px-3 py-1 text-[12px] font-semibold cursor-pointer transition-colors"
            style={{
              background: view === v ? '#C07838' : '#C0783815',
              color: view === v ? '#fff' : '#C07838',
              border: `1px solid ${view === v ? '#C07838' : '#C0783830'}`,
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Songs view */}
      {view === 'songs' && (
        <div className="space-y-3">
          {/* Difficulty filter */}
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'beginner', 'intermediate', 'advanced'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiffFilter(d)}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer transition-colors"
                style={{
                  background:
                    diffFilter === d ? (d === 'all' ? '#C07838' : DIFF_COLOR[d]) : '#C0783812',
                  color: diffFilter === d ? '#fff' : '#C07838',
                  border: `1px solid ${diffFilter === d ? (d === 'all' ? '#C07838' : DIFF_COLOR[d]) : '#C0783828'}`,
                }}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          {filteredSongs.map((song) => {
            const isOpen = openSong === song.id;
            return (
              <div
                key={song.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isOpen ? '#C0783810' : '#C0783806',
                  border: `1px solid ${isOpen ? '#C0783830' : '#C0783818'}`,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenSong(isOpen ? null : song.id)}
                  className="w-full cursor-pointer text-left"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <div className="flex items-start justify-between gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[14px] font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {song.title}
                        </span>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-[0.06em] rounded-full px-2 py-0.5"
                          style={{
                            background: `${DIFF_COLOR[song.difficulty]}20`,
                            color: DIFF_COLOR[song.difficulty],
                          }}
                        >
                          {song.difficulty}
                        </span>
                      </div>
                      <p
                        className="mt-0.5 text-[11px]"
                        style={{
                          color: 'var(--muted-foreground)',
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {song.album} ({song.year}) · {song.key} · {song.style}
                      </p>
                      <p
                        className="mt-0.5 text-[11px]"
                        style={{
                          color: 'var(--muted-foreground)',
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {song.desc}
                      </p>
                      {!isOpen && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {song.techniques.map((t) => (
                            <TechBadge key={t} label={t} />
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] shrink-0 mt-1"
                      style={{
                        color: '#C0783860',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                        transition: 'transform 0.2s',
                      }}
                    >
                      ▾
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 animate-in fade-in duration-200">
                    <div className="h-px mb-4" style={{ background: '#C0783820' }} />
                    <div className="mb-3 flex flex-wrap gap-1">
                      {song.techniques.map((t) => (
                        <TechBadge key={t} label={t} />
                      ))}
                    </div>
                    {song.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Techniques view */}
      {view === 'techniques' && (
        <div className="space-y-2.5">
          {TECHNIQUES.map((tech) => {
            const isOpen = openTech === tech.id;
            return (
              <div
                key={tech.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isOpen ? '#C0783810' : '#C0783806',
                  border: `1px solid ${isOpen ? '#C0783830' : '#C0783818'}`,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenTech(isOpen ? null : tech.id)}
                  className="w-full cursor-pointer text-left"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <div className="flex items-start gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[14px] font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {tech.title}
                        </span>
                        <span
                          className="text-[10px] transition-transform duration-200 shrink-0"
                          style={{
                            color: '#C0783860',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          ▾
                        </span>
                      </div>
                      <p
                        className="mt-1 text-[12px] leading-relaxed"
                        style={{
                          color: 'var(--muted-foreground)',
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {tech.desc}
                      </p>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 animate-in fade-in duration-200">
                    <div className="h-px mb-4" style={{ background: '#C0783820' }} />
                    {tech.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
