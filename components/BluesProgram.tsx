'use client';

import { useState } from 'react';

/* ─── Shared helpers ─────────────────────────────────────── */

function SectionLabel({
  children,
  color = '#5A7EA8',
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
          border: '1px solid #5A7EA825',
          color: '#7EB89A',
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

function InfoBox({ children, color = '#5A7EA8' }: { children: React.ReactNode; color?: string }) {
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

function Chord({ label, color = '#5A7EA8' }: { label: string; color?: string }) {
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
    >
      {label}
    </span>
  );
}

/* ─── Program lessons ────────────────────────────────────── */

interface Lesson {
  n: number;
  title: string;
  desc: string;
  content: React.ReactNode;
}

const LESSONS: Lesson[] = [
  {
    n: 1,
    title: 'The 12-Bar Blueprint',
    desc: 'The architecture of blues. Every blues song ever written lives inside this framework.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          The 12-bar blues is not a prison — it's a conversation. A structure so strong it can hold
          any emotion: grief, joy, anger, tenderness. Every blues song is a variation on this
          framework.
        </p>
        <SectionLabel>In the key of A</SectionLabel>
        <TabBlock
          lines={[
            '| A7    | A7    | A7    | A7    |',
            '| D9    | D9    | A7    | A7    |',
            '| E9    | D9    | A7    | E9    |',
          ]}
          caption="I = A7  ·  IV = D9  ·  V = E9. The turnaround bar (12) returns to V to loop back."
        />
        <SectionLabel>Quick-change variation</SectionLabel>
        <TabBlock
          lines={[
            '| A7    | D9    | A7    | A7    |',
            '| D9    | D9    | A7    | A7    |',
            '| E9    | D9    | A7    | E9    |',
          ]}
          caption="The quick-change goes to IV in bar 2 immediately — more forward energy, used in fast blues."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Practice approach
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            1. Strum each chord for 4 beats at 70 BPM — feel the 12 bars as one cycle.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            2. Increase to 90 BPM. Add shuffle rhythm (long-short, long-short).
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            3. Solo over the whole form using Am pentatonic. Trust the notes — they work over all
            three chords.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    n: 2,
    title: 'The Shuffle Rhythm',
    desc: 'The heartbeat of blues. Swing the 8th notes — long-short, long-short. Without shuffle, there is no blues.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Straight 8th notes feel mechanical. Swing them to triplet feel: the first 8th takes two
          thirds of the beat, the second takes one third. That limp — that's the blues heartbeat.
        </p>
        <SectionLabel>A shuffle pattern — low strings</SectionLabel>
        <TabBlock
          lines={[
            'E|----------------------------------------------|',
            'A|----------------------------------------------|',
            'D|----------------------------------------------|',
            'G|----------------------------------------------|',
            'B|----------------------------------------------|',
            'e|----------------------------------------------|',
            '',
            'A7 shuffle (play A-string and D-string together):',
            'A|--0-0-2-2-4-4-2-2--|  (repeat)',
            'D|--0-0-2-2-4-4-2-2--|',
          ]}
          caption="Root–5th–6th–5th on two strings together. The 6th note is the blues character note."
        />
        <SectionLabel>Full A shuffle bass line</SectionLabel>
        <TabBlock
          lines={[
            'E|------------------------------------------------------|',
            'A|--0--0-2-0--0-2-0--0-4-0--0-2----|  (A7)',
            'D|------------------------------------------------------|',
            '',
            'D|--0--0-2-0--0-2-0--0-4-0--0-2----|  (D9 — same shape, different string)',
            'A|------------------------------------------------------|',
          ]}
          caption="Root-5-6-5 bass shuffle. The 6th (fret 4 on A-string = F#) is the blues signature."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Key insight
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            The shuffle pattern is moveable. Play it with roots on the low E or A string to cover I,
            IV, and V chords without changing finger shape.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            At the IV chord (D9), move the same pattern to D and G strings. At V (E9), play it on
            the low E and A strings.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    n: 3,
    title: 'Am Pentatonic — Five Positions',
    desc: 'The Am pentatonic scale across the entire neck. Five boxes, one scale — unlimited terrain.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Most players learn box 1 (frets 5–8) and stay there. The key to fluency is connecting all
          five positions — same five notes (A C D E G), different finger shapes, different sounds.
        </p>
        <SectionLabel>All five box positions (A minor pentatonic)</SectionLabel>
        <TabBlock
          lines={[
            'Box 1  — frets 5–8    (most common — "home base")',
            'Box 2  — frets 8–10   (brighter, high energy)',
            'Box 3  — frets 10–13  (neck pickup territory)',
            'Box 4  — frets 12–15  (octave higher than box 1)',
            'Box 5  — frets 2–5    (low, earthy — leads back to box 1)',
          ]}
          caption="Same 5 notes: A C D E G. Different shapes — learn each box as its own landscape."
        />
        <SectionLabel>Box 1 — reference diagram</SectionLabel>
        <TabBlock
          lines={[
            'e|--5--8--|',
            'B|--5--8--|',
            'G|--5--7--|',
            'D|--5--7--|',
            'A|--5--7--|',
            'E|--5--8--|',
          ]}
          caption="Box 1. Gold notes (A at e-5, A-5) are the roots. Start and end phrases here."
        />
        <SectionLabel>Box 2 — the high-energy box</SectionLabel>
        <TabBlock
          lines={[
            'e|--8--10--|',
            'B|--8--10--|',
            'G|--7--9---|',
            'D|--7--9---|',
            'A|--7--10--|',
            'E|--8--10--|',
          ]}
          caption="Box 2. Reach for this when you want to climb and escalate the emotional intensity."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Practice path
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Week 1: Box 1 fluently. Licks 1–5 from Chapter 8.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Week 2: Box 2. Licks 7 and 14 (position shift).
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Week 3: Connect boxes 1 and 2 mid-solo. Use Lick 14 (slide) to cross the boundary.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    n: 4,
    title: 'Bending Technique',
    desc: 'The bend is the emotional core of blues. How to bend in tune, how to vibrato, and when to hold.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          A bend that goes sharp or flat is out of tune. A bend that's in tune but rushed is
          emotionally flat. The bend lives in the space between the two notes — the journey matters
          more than the destination.
        </p>
        <SectionLabel>Essential bends in A blues</SectionLabel>
        <TabBlock
          lines={[
            'Full tone bend (1 step):',
            'G|--7b9--|   D→E on G-string fret 7, bend up 1 full tone',
            '',
            'Half tone bend:',
            'B|--7b8--|   E→F on B-string fret 7 — half step blue note',
            '',
            'Overbend (1.5 steps):',
            'G|--7b10--|  D→F# on G fret 7 — extreme but expressive',
            '',
            'Pre-bend and release:',
            'G|--b7r5--|  Bend to pitch silently, sound the note, then release back',
          ]}
          caption="b = bend  ·  r = release  ·  number after b = target fret pitch equivalent"
        />
        <SectionLabel>Vibrato types</SectionLabel>
        <TabBlock
          lines={[
            'Classical (arm vibrato):  even oscillation from the elbow',
            'BB King:                  push DOWN toward floor repeatedly',
            'SRV:                      wide and slow — almost a half-bend oscillation',
            'Clapton:                  tight, fast, centred',
          ]}
          caption="The type of vibrato defines your voice. Find yours by slowing down and listening."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            The rule
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Use ring finger to bend, reinforced by middle and index (all three push together). Never
            bend with the index alone on lower strings.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Tune a note on another string to your target pitch and match your bend to it by ear.
            This is how BB King learned — he sang the note first, then bent to match his voice.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    n: 5,
    title: 'Blues Phrasing — Space and Silence',
    desc: "The notes you don't play are as important as the ones you do. Blues breathes.",
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Jazz musicians say "leave space." Blues musicians say "let the guitar talk." These are the
          same idea: phrasing means playing in sentences, with punctuation. A lick is a word.
          Silence is the breath between words.
        </p>
        <SectionLabel>Phrase structure in blues</SectionLabel>
        <TabBlock
          lines={[
            'Bar 1:  [LICK — 2 beats]  [REST — 2 beats]',
            'Bar 2:  [LICK — 2 beats]  [REST — 2 beats]',
            'Bar 3:  [LICK — 3 beats]  [REST — 1 beat]',
            'Bar 4:  [SUSTAINED BEND — held 4 beats]',
          ]}
          caption="A four-bar phrase. The build: short, short, longer, then hold. Classic blues storytelling shape."
        />
        <SectionLabel>Call and response (with yourself)</SectionLabel>
        <TabBlock
          lines={[
            'Bar 1:  [Call — ascending phrase with bend]  ← tension',
            'Bar 2:  [REST — let the chord breathe]',
            'Bar 3:  [Answer — descending phrase back to root]  ← resolution',
            'Bar 4:  [REST — reset before next phrase]',
          ]}
          caption="This is the internal dialogue of a blues solo. Question, pause, answer, breathe."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            The hardest thing to learn
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Most beginners fill every beat. Resist this. Put on a 12-bar backing and force yourself
            to play only one lick per four bars. Notice how powerful the silence becomes.
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Then: one lick per two bars. Then: one lick per bar. Only when the silence feels natural
            should you start filling space.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    n: 6,
    title: 'Turnarounds',
    desc: 'The last 2 bars of a 12-bar cycle. The turnaround announces the end and pulls you back to bar 1.',
    content: (
      <div className="space-y-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          Bars 11–12 of the 12-bar blues are the turnaround — the return journey. A great turnaround
          creates anticipation for the next cycle. Learn these as units; swap them freely.
        </p>
        <SectionLabel>Classic A turnaround (descending chromatic)</SectionLabel>
        <TabBlock
          lines={[
            'E|--5-4-3-2---0---------|',
            'A|-----------2-0--------|',
            '    A  Ab G  F# E  E(open)',
          ]}
          caption="Chromatic descent on low E, then land on open A and E. Bars 11–12, slow blues."
        />
        <SectionLabel>Fingerpicked turnaround (acoustic Delta style)</SectionLabel>
        <TabBlock
          lines={[
            'E|----0---------0-------|',
            'A|--0---5-4-3-2---0-----|',
            'D|----------------------|',
          ]}
          caption="Thumb alternates on E while fingers play the descending line on A-string."
        />
        <SectionLabel>The II–V turnaround (jazz blues)</SectionLabel>
        <TabBlock
          lines={['| Bm7  |  E9  |  A7  ||', '', 'Or voiced:', '| B7   |  E9  |  A13 ||']}
          caption="The jazz turnaround. Bm7 (or B7) is the II chord of A. E9 is V. Pulls powerfully back to A."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Turnaround library
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Learn one turnaround per week. Rotate between them within the same song. The rhythm
            section will follow — turnarounds signal the cycle to everyone in the band.
          </p>
        </InfoBox>
      </div>
    ),
  },
];

/* ─── Full songs with tabs ───────────────────────────────── */

interface BlueSong {
  id: string;
  title: string;
  key: string;
  style: string;
  tempo: string;
  desc: string;
  content: React.ReactNode;
}

const SONGS: BlueSong[] = [
  {
    id: 'midnight-drive',
    title: 'Midnight Drive',
    key: 'A',
    style: 'Slow 12-bar',
    tempo: '70–80 BPM',
    desc: 'A slow, emotional 12-bar in A. Wide bends, space, and the classic turnaround.',
    content: (
      <div className="space-y-4">
        <SectionLabel>Full 12-bar form</SectionLabel>
        <TabBlock
          lines={[
            '| A7    | A7    | A7    | A7    |',
            '| D9    | D9    | A7    | A7    |',
            '| E9    | D9    | A7    | E9    |',
          ]}
          caption="Slow 4/4. Each bar = 4 beats. Shuffle feel (swing the 8ths)."
        />
        <SectionLabel>Intro riff (2 bars, repeat before verse)</SectionLabel>
        <TabBlock
          lines={[
            'e|--------8b10--8--5-8--|',
            'B|--5--8----------5-----|',
            'G|----------------------|',
            'D|----------------------|',
            'A|----------------------|',
            'E|----------------------|',
          ]}
          caption="Start on B-string fret 5, climb to fret 8, bend high-e fret 8 up a tone, descend."
        />
        <SectionLabel>Main solo lick (over A7, bars 1–2)</SectionLabel>
        <TabBlock
          lines={[
            'e|------------------------|',
            'B|--5---8b10~~--8--5------|',
            'G|------------------7--5--|',
            'D|------------------------|',
          ]}
          caption="~~ = vibrato. Bend B-string fret 8 up a tone. Hold with vibrato. Then descend."
        />
        <SectionLabel>IV chord phrase (over D9, bars 5–6)</SectionLabel>
        <TabBlock
          lines={[
            'e|----------------------------|',
            'B|--8b10~~--8--5--8--5--------|',
            'G|------------------------7---|',
            'D|----------------------------|',
          ]}
          caption="Same shape as bars 1–2 but played over D9. Pentatonic follows the harmony automatically."
        />
        <SectionLabel>Turnaround (bars 11–12)</SectionLabel>
        <TabBlock
          lines={[
            'E|--5-4-3-2------0-------||',
            'A|----------2-0----------||',
            '',
            'Then back to A7 for next cycle.',
          ]}
          caption="Classic chromatic turnaround. Play slowly — let each note ring."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            How to play it
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Set a backing track to A blues at 70 BPM. Play the intro 2x. Then solo over the 12-bar
            using the phrases above. Leave 2 beats of silence after each phrase. Keep the shuffle
            feel — long-short, long-short.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'crossroads-shuffle',
    title: 'Crossroads Shuffle',
    key: 'E',
    style: 'Medium shuffle',
    tempo: '100–110 BPM',
    desc: 'An E-position medium-tempo shuffle. Walking bass, double-stops, and the classic E-blues feel.',
    content: (
      <div className="space-y-4">
        <SectionLabel>Full 12-bar form (E)</SectionLabel>
        <TabBlock
          lines={[
            '| E7    | E7    | E7    | E7    |',
            '| A9    | A9    | E7    | E7    |',
            '| B9    | A9    | E7    | B9    |',
          ]}
          caption="E7 = I  ·  A9 = IV  ·  B9 = V. Classic E-blues — Robert Johnson, Muddy Waters territory."
        />
        <SectionLabel>Shuffle bass riff (I chord — E7)</SectionLabel>
        <TabBlock
          lines={[
            'E|--0--0-2-0--0-2-0--0-4-0--0-2--|  (repeat x4)',
            'A|--------------------------------|',
          ]}
          caption="Root (E open) → 5th (fret 2) → 6th (fret 4) → 5th. The blues shuffle engine."
        />
        <SectionLabel>IV chord shuffle (A9)</SectionLabel>
        <TabBlock
          lines={[
            'E|--------------------------------|',
            'A|--0--0-2-0--0-2-0--0-4-0--0-2--|  (A-string same shape)',
          ]}
          caption="Identical shape on A-string. Root = open A."
        />
        <SectionLabel>Signature double-stop lick (E position)</SectionLabel>
        <TabBlock
          lines={[
            'e|------------------------|',
            'B|--9b10--9--7--5---------|',
            'G|--9b10--9--7--5---------|',
            'D|------------------------|',
          ]}
          caption="Bend both B and G at fret 9 (double-stop bend). Slide down 9→7→5. Maximum impact."
        />
        <SectionLabel>Turnaround (E blues, bars 11–12)</SectionLabel>
        <TabBlock
          lines={[
            'E|--0-0--4-3-2--0---------|',
            'A|-----------2-0----------|',
            '',
            'Then: E7  |  B9  → loop',
          ]}
          caption="Open E-string groove, then descend A-string to open E. Lands on V (B9) for the loop."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Feel target
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            This should feel like a rolling train. The shuffle bass is the wheels. Licks sit on top
            like steam. Keep the bass pattern going in your right hand while the left hand plays
            lead on top.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'minor-blues-lament',
    title: 'Minor Blues Lament',
    key: 'Am',
    style: 'Minor blues / slow',
    tempo: '60–75 BPM',
    desc: 'A slow Am minor blues. Dark, emotional, with extended chromaticism and deep bends.',
    content: (
      <div className="space-y-4">
        <SectionLabel>Minor blues form (Am)</SectionLabel>
        <TabBlock
          lines={[
            '| Am7   | Am7   | Am7   | Am7   |',
            '| Dm7   | Dm7   | Am7   | Am7   |',
            '| E7b9  | Dm7   | Am7   | E7b9  |',
          ]}
          caption="Minor 12-bar. Im = Am7  ·  IVm = Dm7  ·  V7 = E7b9 (the flamenco V chord — extra darkness)."
        />
        <SectionLabel>Am minor blues scale (the extra b5 note)</SectionLabel>
        <TabBlock
          lines={[
            'A minor blues scale: A · C · D · Eb · E · G',
            '                               ↑',
            '                       blue note (b5 = Eb)',
            '',
            'e|--5--8--|',
            'B|--6--8--|   ← fret 6 = Eb (blue note!) on B-string',
            'G|--5--7--|',
            'D|--5--7--|',
            'A|--5--7--|',
            'E|--5--8--|',
          ]}
          caption="The blue note (Eb, fret 6 on B-string) is the secret darkness in the minor blues scale."
        />
        <SectionLabel>Signature dark lick (over Am7)</SectionLabel>
        <TabBlock
          lines={[
            'e|----------------------------|',
            'B|--6--8b9~~--8--6--5---------|',
            'G|---------------------------5|',
            'D|----------------------------|',
          ]}
          caption="Start on the blue note (fret 6), bend fret 8 up toward 9 with vibrato. Descend. Land on G-string fret 5 (A root)."
        />
        <SectionLabel>V chord explosion (E7b9, bars 9–10)</SectionLabel>
        <TabBlock
          lines={[
            'e|--0-------5b6~~--5--3-------|',
            'B|--0-5--6----------------------|',
            'G|--1-5---------------------------| ← E7b9 chord tone (G#)',
            '',
            'Then into Dm7 phrase:',
            'e|--5--8--7--5--3--2--|',
            'B|--6-----------------|',
          ]}
          caption="Hit the E7b9 hard (open strings ring), then solo phrase. Cross to Dm7 descending run."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Emotional target
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            This song wants to sound like a late-night confession. Slow everything down. Let silence
            fill the room. The blue note (fret 6, B-string) is your primary colour — return to it
            and bend away from it like a wound that won't close.
          </p>
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'chicago-back-alley',
    title: 'Chicago Back Alley',
    key: 'G',
    style: 'Chicago blues / medium-fast',
    tempo: '115–125 BPM',
    desc: 'G-position Chicago electric blues. Punchy, driving, with the classic octave lick and Hubert Sumlin stabs.',
    content: (
      <div className="space-y-4">
        <SectionLabel>12-bar form (G)</SectionLabel>
        <TabBlock
          lines={[
            '| G7    | C9    | G7    | G7    |',
            '| C9    | C9    | G7    | G7    |',
            '| D9    | C9    | G7    | D9    |',
          ]}
          caption="G7 = I  ·  C9 = IV  ·  D9 = V. Quick-change variation — C9 in bar 2."
        />
        <SectionLabel>G shuffle bass (driving Chicago engine)</SectionLabel>
        <TabBlock
          lines={[
            'E|--3--3-5-3--3-5-3--3-7-3--3-5--|  (G7 — repeat)',
            'A|--------------------------------|',
          ]}
          caption="Root at E-string fret 3 (G). 5th = fret 5 (D). 6th = fret 7 (E). The Chicago groove."
        />
        <SectionLabel>Octave lick (Hubert Sumlin style)</SectionLabel>
        <TabBlock
          lines={[
            'e|--3--6--3--6--3-----------------|',
            'A|--3--5--3--5--3-----------------|',
            '',
            '(mute D,G,B strings with index finger)',
          ]}
          caption="G octaves on e+A strings (skip 3 strings, muted). Stab rhythm, then fill. Pure Chicago."
        />
        <SectionLabel>Main lead phrase (over G7)</SectionLabel>
        <TabBlock
          lines={[
            'e|---------------------------|',
            'B|--6--8b10~~--8--6----------|',
            'G|--5------------7--5--------|',
            'D|-------------------7--5----|',
          ]}
          caption="Gm pentatonic (box 1 at fret 3, but played at fret 5–8 area = Am pent transposed). Land on D-string fret 5 (G root)."
        />
        <InfoBox>
          <p className="font-semibold" style={{ color: '#5A7EA8' }}>
            Chicago character
          </p>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Chicago blues is punchy and aggressive compared to Delta's earthiness. Short, clipped
            stabs between the rhythm pattern. Listen to Howlin' Wolf, Buddy Guy, and early Clapton
            (John Mayall era) to absorb the attack.
          </p>
        </InfoBox>
      </div>
    ),
  },
];

/* ─── Lick library ───────────────────────────────────────── */

interface LibLick {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  desc: string;
  tab: string[];
  note: string;
}

const LICK_LIBRARY: LibLick[] = [
  {
    id: 'l1',
    title: 'Root Bend — Box 1',
    category: 'bends',
    difficulty: 'beginner',
    desc: 'Simple full-tone bend on G-string fret 7',
    tab: ['e|--------------|', 'B|--5-----------|', 'G|--7b9--7--5---|', 'D|--------------|'],
    note: 'Bend D→E on G-string. The most important single bend to master.',
  },
  {
    id: 'l2',
    title: 'Hammer–Pull Combo',
    category: 'technique',
    difficulty: 'beginner',
    desc: 'Hammer fret 5→7, pull back 7→5 on G-string',
    tab: ['e|--------------|', 'B|--------------|', 'G|--5h7p5-------|', 'D|--5-----------|'],
    note: 'h = hammer  ·  p = pull-off. Keep your 1st finger planted on fret 5.',
  },
  {
    id: 'l3',
    title: 'BB King Cry',
    category: 'vibrato',
    difficulty: 'intermediate',
    desc: 'Bend B-string fret 8 and hold with wide vibrato',
    tab: ['e|--------------|', 'B|--8b9~~~------|', 'G|--------------|'],
    note: '~~~ = slow wide vibrato. Push down toward the floor. Make it say "yeah".',
  },
  {
    id: 'l4',
    title: 'Turnaround Chromatic',
    category: 'turnaround',
    difficulty: 'beginner',
    desc: 'Descend E-string 5→4→3→2, then A-string 2→0',
    tab: ['E|--5-4-3-2-----|', 'A|--------2-0---|'],
    note: 'The classic A-blues turnaround. Every blues guitar player needs this.',
  },
  {
    id: 'l5',
    title: 'Double-Stop 6ths',
    category: 'double-stops',
    difficulty: 'intermediate',
    desc: 'Play e+G strings together, slide down from fret 9→7→5',
    tab: ['e|--9/-7/-5------|', 'G|--9/-7/-5------|'],
    note: '/ = slide. Play both strings simultaneously with ring+index finger.',
  },
  {
    id: 'l6',
    title: 'Chuck Berry Double-Stop',
    category: 'double-stops',
    difficulty: 'beginner',
    desc: 'Classic rock-and-roll riff using D+G string double-stops',
    tab: ['e|--------------|', 'B|--------------|', 'G|--5--7--5--7--|', 'D|--5--7--5--7--|'],
    note: 'The foundation of rock and roll. Fret 5 = A+D, fret 7 = B+E.',
  },
  {
    id: 'l7',
    title: 'SRV Pull-Off Cascade',
    category: 'technique',
    difficulty: 'advanced',
    desc: 'Fast pull-off run descending across three strings from fret 13',
    tab: ['e|--13p10--------|', 'B|-------12p10---|', 'G|------------9p8|'],
    note: 'Each pull-off must ring clearly. Practice very slowly — speed comes from clean technique.',
  },
  {
    id: 'l8',
    title: 'Delta Open-Position',
    category: 'style',
    difficulty: 'beginner',
    desc: 'Raw open-position lick on A and D strings',
    tab: ['D|--0h2--2b3----|', 'A|--0--2------0-|'],
    note: 'Open-string earthiness. Robert Johnson and Son House lived here.',
  },
  {
    id: 'l9',
    title: 'Chicago Stab',
    category: 'style',
    difficulty: 'intermediate',
    desc: 'Short, aggressive stab on G-string fret 5, cut short',
    tab: ['e|--------------|', 'B|--5--x--------|', 'G|--5--x--------|'],
    note: 'x = mute immediately. The stab is a word — short, clipped, percussive.',
  },
  {
    id: 'l10',
    title: 'Box Position Shift',
    category: 'technique',
    difficulty: 'intermediate',
    desc: 'Slide on B-string from fret 5 to 8, continue in box 2',
    tab: ['e|----------8-10--|', 'B|--5-8/10--------|', 'G|--5-7-----------|'],
    note: '/ = slide. The bridge between box 1 and box 2. Unlock the neck.',
  },
  {
    id: 'l11',
    title: 'Oblique Bend (Albert King)',
    category: 'bends',
    difficulty: 'advanced',
    desc: 'Bend G-string while holding B-string static — tension cluster',
    tab: ['e|-------------|', 'B|--8----8-----|', 'G|--7b9--7--5--|'],
    note: 'The G-string bends toward the B-string. They almost collide — pure tension.',
  },
  {
    id: 'l12',
    title: 'Question & Answer',
    category: 'phrasing',
    difficulty: 'intermediate',
    desc: 'Ascending phrase (Q) followed by descending resolution (A)',
    tab: [
      'B|--5--8b10----|  ← question',
      'B|--8--5------ |  ← answer (pause first!)',
      'G|------5--7---|',
    ],
    note: 'Leave 1–2 beats of silence between the question and answer.',
  },
];

type LickCategory =
  | 'all'
  | 'bends'
  | 'technique'
  | 'vibrato'
  | 'turnaround'
  | 'double-stops'
  | 'style'
  | 'phrasing';

const LICK_CATS: { id: LickCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bends', label: 'Bends' },
  { id: 'technique', label: 'Technique' },
  { id: 'vibrato', label: 'Vibrato' },
  { id: 'turnaround', label: 'Turnaround' },
  { id: 'double-stops', label: 'Double-Stops' },
  { id: 'style', label: 'Style' },
  { id: 'phrasing', label: 'Phrasing' },
];

const DIFF_COLOR: Record<string, string> = {
  beginner: '#7A9870',
  intermediate: '#C4A060',
  advanced: '#C07838',
};

function LickCard({ lick }: { lick: LibLick }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: open ? '#5A7EA810' : '#5A7EA806',
        border: `1px solid ${open ? '#5A7EA830' : '#5A7EA818'}`,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
              {lick.title}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: DIFF_COLOR[lick.difficulty] }}
            >
              {lick.difficulty}
            </span>
          </div>
          <p
            className="mt-0.5 text-[11px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            {lick.desc}
          </p>
        </div>
        <span
          className="text-[10px] shrink-0 mt-1"
          style={{
            color: '#5A7EA860',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
            transition: 'transform 0.2s',
          }}
        >
          ▾
        </span>
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          <div className="h-px" style={{ background: '#5A7EA820' }} />
          <TabBlock lines={lick.tab} />
          <p
            className="text-[11px]"
            style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
          >
            {lick.note}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

type MainView = 'program' | 'songs' | 'licks';

export default function BluesProgram() {
  const [view, setView] = useState<MainView>('program');
  const [openLesson, setOpenLesson] = useState<number | null>(1);
  const [openSong, setOpenSong] = useState<string | null>('midnight-drive');
  const [lickCat, setLickCat] = useState<LickCategory>('all');

  const filteredLicks =
    lickCat === 'all' ? LICK_LIBRARY : LICK_LIBRARY.filter((l) => l.category === lickCat);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
          Blues Program
        </h2>
        <p
          className="text-[12px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-serif)' }}
        >
          A complete self-study system — theory, songs with full tab, and a lick library organized
          by technique.
        </p>
      </div>

      {/* View switcher */}
      <div className="flex gap-2">
        {(['program', 'songs', 'licks'] as MainView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="rounded-full px-3 py-1 text-[12px] font-semibold cursor-pointer transition-colors"
            style={{
              background: view === v ? '#5A7EA8' : '#5A7EA815',
              color: view === v ? '#fff' : '#5A7EA8',
              border: `1px solid ${view === v ? '#5A7EA8' : '#5A7EA830'}`,
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Program lessons */}
      {view === 'program' && (
        <div className="space-y-2.5">
          {LESSONS.map((lesson) => {
            const isOpen = openLesson === lesson.n;
            return (
              <div
                key={lesson.n}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isOpen ? '#5A7EA810' : '#5A7EA806',
                  border: `1px solid ${isOpen ? '#5A7EA835' : '#5A7EA818'}`,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenLesson(isOpen ? null : lesson.n)}
                  className="w-full cursor-pointer text-left"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span
                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold"
                      style={{ background: '#5A7EA8', color: '#fff' }}
                    >
                      {lesson.n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-between">
                        <span
                          className="text-[14px] font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {lesson.title}
                        </span>
                        <span
                          className="text-[10px] transition-transform duration-200"
                          style={{
                            color: '#5A7EA880',
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
                        {lesson.desc}
                      </p>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 animate-in fade-in duration-200">
                    <div className="h-px mb-4" style={{ background: '#5A7EA820' }} />
                    {lesson.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Songs */}
      {view === 'songs' && (
        <div className="space-y-3">
          {SONGS.map((song) => {
            const isOpen = openSong === song.id;
            return (
              <div
                key={song.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isOpen ? '#5A7EA810' : '#5A7EA806',
                  border: `1px solid ${isOpen ? '#5A7EA835' : '#5A7EA818'}`,
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
                          className="text-[11px] font-medium rounded-full px-2 py-0.5"
                          style={{ background: '#5A7EA820', color: '#5A7EA8' }}
                        >
                          Key of {song.key}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                          {song.style}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p
                          className="text-[11px]"
                          style={{
                            color: 'var(--muted-foreground)',
                            fontFamily: 'var(--font-serif)',
                          }}
                        >
                          {song.tempo}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{
                            color: 'var(--muted-foreground)',
                            fontFamily: 'var(--font-serif)',
                          }}
                        >
                          {song.desc}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] shrink-0 mt-1"
                      style={{
                        color: '#5A7EA860',
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
                    <div className="h-px mb-4" style={{ background: '#5A7EA820' }} />
                    {song.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lick library */}
      {view === 'licks' && (
        <div className="space-y-3">
          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {LICK_CATS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setLickCat(cat.id)}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer transition-colors"
                style={{
                  background: lickCat === cat.id ? '#5A7EA8' : '#5A7EA812',
                  color: lickCat === cat.id ? '#fff' : '#5A7EA8',
                  border: `1px solid ${lickCat === cat.id ? '#5A7EA8' : '#5A7EA828'}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredLicks.map((lick) => (
              <LickCard key={lick.id} lick={lick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
