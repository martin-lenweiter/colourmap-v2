# Groove Machine — Deep Evolution + 7 Curated Soundscapes

> Asked by Martin (2026-04-25): "do a deep analysis on how to move
> [groove] machine further better. more sounds. better UI etc....
> simple powerful graphical elements like big dots. think what
> different musical styles need. and how u can create a series of 7
> soundscapes overall from tech to groove to tropical. to sexy. to
> gangsta biggie smalls beat. to epic electro."

A focused plan to take Groove Machine from a single 16-step pattern
into a **catalogue of 7 distinct genre soundscapes** that share one
engine but feel like 7 different rooms. Plus a UI direction —
*simple powerful graphical elements like big dots* — that scales
with the catalogue.

## Where we are now (2026-04-25)

- Single 16-step pattern across 15 voices.
- Track toggles + 4 dynamics modes (Full / Breakdown / Drop /
  Silence) + Randomize.
- Web Audio synth voices only (no samples).
- 17% swing, bar-4 fills, Drop riser → kick slam.
- Just shipped: "Save groove → Notebook" + a future-vision spec.

What it lacks:
- One genre. Even with randomize, it's a *funk-tech-house
  mongrel*. Doesn't deliver tropical, doesn't deliver hip-hop,
  doesn't deliver sexy R&B.
- One tempo zone (~115 bpm centre).
- No chord progression — the bass walks A minor pentatonic but
  the melody/keys don't move with it.
- Sample-free. Some genres (90s hip-hop, tropical) need real
  samples (vocal chops, bossa guitars) to land.
- UI shows 15 tracks at once — overwhelming. Needs a way to
  *recede* the tracks not relevant to the current vibe.

## The 7 Soundscapes

Each soundscape is a complete bundle: **tempo zone + drum
pattern + bass line + chord progression + voice/instrument
choices + colour palette + 1-line poetic name**. The user picks
one; the engine reconfigures itself.

### 1. **Tech House** — *Berlin late-night, Kompakt records*
Reference: Kalkbrenner, Maceo Plex, deep Berlin techno.

- **Tempo**: 122–126 bpm
- **Drums**: 4-on-floor kick, off-beat hat (& of every beat),
  clap on 2 + 4, sparse perc shaker on offbeats.
- **Bass**: One-note-driven sub on the 1, sidechain-pumped against
  the kick (already have ducking primitive from the Drop riser).
- **Chords**: Single sustained minor chord per 4 bars; subtle
  filter sweep over 8 bars.
- **Lead**: A single vocal-stab sample every 4 bars.
- **Palette**: Steel blue (#3A6890), graphite (#3A2A2A), purple
  edge (#7A4A8A).
- **Hook**: The hat-on-offbeat is the genre's heartbeat.

### 2. **Sun-up Funk** — *Daft Punk Discovery, Jamiroquai*
Reference: "Virtual Insanity", "Get Lucky", Stevie Wonder.

- **Tempo**: 108–116 bpm
- **Drums**: Tight snare on 2 + 4 with ghost notes on the &a's,
  hi-hat 16th-notes with the 17% swing already in place. Open
  hat on the &-of-4.
- **Bass**: 16th-note funk pops — lots of ghost notes, root on
  the 1, slide to the b7 on the offbeat push. (Existing default
  is close to this.)
- **Chords**: Rhodes 7th chords moving I → vi → ii → V (jazz
  turnaround). Each chord sits 2 bars.
- **Lead**: Wah guitar on the upbeats (already wired).
- **Palette**: Gold (#C4A060), terracotta (#D4805A), warm tan
  (#8A6A4A).
- **Hook**: The bass pops + chord motion. Bright and danceable.

### 3. **Tropical** — *Kygo sunset, Bob Marley sample, Anuv Jain*
Reference: Kygo, Matoma, modern tropical house.

- **Tempo**: 100–108 bpm
- **Drums**: Soft kick on 1+3, snare on 2+4, shaker 16ths,
  a *light* clap layered on 2+4. No hard hat.
- **Bass**: Slow plucked sub, root + fifth motion only.
- **Chords**: Pan flute or marimba on a I-V-vi-IV progression
  (very pop, very sun). 8-bar loop.
- **Lead**: A slow steel-pan or marimba arpeggio.
- **Palette**: Sunset orange (#E08858), sea teal (#5AA8B0), coral
  (#D4805A).
- **Hook**: Marimba/steel-pan motif. Beach chair, drink in hand.
- **Needs sample**: marimba pack. Add to `lib/sample-pack.ts`
  alongside the existing instruments.

### 4. **Slow Roll** — *sexy R&B / soul, low-BPM bedroom*
Reference: The Weeknd, Daniel Caesar, FKA twigs, classic Sade.

- **Tempo**: 70–84 bpm (half-time vibe — feels even slower)
- **Drums**: Big slow kick on 1, snare drag on 3, no hat — just
  finger-snap on 2 + 4 (sample). Sparse ride if anything.
- **Bass**: Long sustained notes, root + minor 6 to 7. Slides.
- **Chords**: Rhodes minor 9 chords. Moves only every 4 bars.
- **Lead**: A breathy vocal "ooh" sample, every 8 bars.
- **Palette**: Wine (#5A2848), deep rose (#8A3858), midnight
  blue (#1E2840).
- **Hook**: The *space* between hits. Less is everything.
- **Needs sample**: snap, ooh vocal pad.

### 5. **Boom Bap** — *Biggie Smalls, Nas, Wu-Tang, J Dilla*
Reference: Illmatic, Ready to Die, Mos Def, Madlib.

- **Tempo**: 85–95 bpm
- **Drums**: Dusty kick on 1 + & of 2, snare on 2 + 4 (loud, dry),
  hat on 8th notes with slight humanization. Vinyl crackle layer
  underneath.
- **Bass**: Walking jazz upright bass — 4 quarter notes per bar,
  modal motion.
- **Chords**: Sample-style — a 2-bar jazzy Rhodes loop chopped.
  4-bar chord cycle.
- **Lead**: A pitched-up vocal chop on the &-of-3 every 2 bars
  (Kanye-style).
- **Palette**: Sepia (#6A4A2A), cream (#E8D8B8), burgundy
  (#7A2828).
- **Hook**: The dusty-kick + dry-snare interplay + vinyl
  background. 1995 Brooklyn.
- **Needs samples**: vinyl crackle loop, jazzy Rhodes loop.

### 6. **Epic Electro** — *Justice, Discovery-era Daft Punk, Madeon*
Reference: †, Discovery, Random Access Memories.

- **Tempo**: 124–128 bpm
- **Drums**: Compressed kick punching through everything, snare
  on 2+4 with reverb tail, claps doubled, hat 16ths driving.
- **Bass**: Distorted square sub with wobble — chunky and
  percussive.
- **Chords**: Big saw-stack power chords on the 1 of every 2
  bars. Side-chained to the kick.
- **Lead**: Octaved square-wave riff, 8-note motif repeating.
- **Palette**: Electric blue (#3868D8), magenta (#D838A8), gold
  (#E8B848). Loud.
- **Hook**: Wall-of-sound chord stabs + the lead riff. Stadium-
  filling.

### 7. **Lofi Rooftop** — *Nujabes, J Dilla, study beats, late-night*
Reference: lofi hip hop radio, Tomppabeats, Idealism.

- **Tempo**: 78–88 bpm
- **Drums**: Hip-hop pocket like Boom Bap but softer — tape-
  saturated, swung. Brushed snare. Hat on 8ths with major swing.
- **Bass**: Soft upright bass walking.
- **Chords**: Lush jazzy 9 chords on muted Rhodes, slow
  progression (vi-ii-V-I), 4-bar cycle.
- **Lead**: Rain or vinyl crackle layer + occasional muted
  trumpet sample.
- **Palette**: Dusk purple (#6A4A7A), warm gold (#D8B868), olive
  (#8A8A4A), soft pink (#D8A8B8).
- **Hook**: The *atmosphere*. This one explicitly bridges Chill
  Machine — it's a rhythm with Chill Machine's quietude.
- **Needs samples**: rain, muted trumpet (or use the existing
  flute sample at low volume).

## UI direction — "big dots"

Per Martin: *simple powerful graphical elements like big dots*.

The current UI shows 15 track buttons + per-group sections + a
transport panel + dynamics + vibe meter. That's the **producer
view** — too dense for the user's "I want to vibe" mode.

Two coexisting views:

### View A — **Soundscape view** (default)

A horizontal carousel (mobile) or grid of 7 (desktop) of **big
dots** — one per soundscape, each 96px circle in the soundscape's
palette.

```
   ●        ●        ●        ●        ●        ●        ●
 Tech    Sun-up  Tropical  Slow    Boom    Epic    Lofi
 House    Funk            Roll    Bap   Electro Rooftop
                                  ↑
                              currently
                              playing
```

- Big tap target. Tap → engine reconfigures (tempo + tracks +
  voices + chords) over a 2-bar cross-fade.
- The currently-playing dot pulses gently at the soundscape's bpm.
- Above the carousel: just play/pause, tempo, mode chips
  (Full / Breakdown / Drop / Silence). Nothing else.

This is the user's main interface. 90% of sessions never leave it.

### View B — **Producer view** (advanced, opt-in)

A small "tweak" gear/icon top-right opens the existing 15-track
panel. For users who want to mute the snare or pull out the bass.
Always a layer *on top of* the active soundscape — undoing returns
to the soundscape default.

### Why dots and not cards

- Cards have text and decisions. Dots are *icons of feeling*. The
  user's brain matches the colour to the mood without reading.
- Big circular targets work for thumb taps in motion (gym, party).
- Visual recognition over verbal recognition matches the
  meditation-tool tradition.

## Engine refactor needed

Today everything sits in `components/GrooveMachine.tsx` as
hard-coded `TRACKS` + `VOICES` + a single pattern.

Lift into:

```
lib/groove/
  presets.ts            ← the 7 soundscapes as data
  voice-library.ts      ← every synth voice + sample voice
  scheduler.ts          ← pure 16-step + chord-progression
                          scheduler, no UI
  transitions.ts        ← bar-aligned cross-fade between presets
```

Then `components/GrooveMachine.tsx` becomes thin: it's just the
big-dot UI calling `loadPreset(id)` / `play()` / `stop()`.

A `Preset` shape:

```ts
interface GroovePreset {
  id: string;
  name: string;
  tempoMin: number; tempoMax: number;
  defaultBpm: number;
  swing: number;       // 0–0.5
  palette: { dot: string; bg: string; accent: string };
  tracks: TrackPreset[];        // pattern + voice + freq cycle
  chords?: ChordCycle;           // root + quality + bars per chord
  samples?: SamplePackId[];      // packs to preload
}
```

## Implementation order

These are PR-sized:

1. **Engine refactor** (no behaviour change). Move TRACKS / VOICES /
   scheduler out of GrooveMachine.tsx into `lib/groove/`. Existing
   single pattern becomes preset #0 (default).
2. **Preset infrastructure**: `loadPreset(id)` rebinds tracks,
   chords, voices. Add a 2-bar cross-fade primitive.
3. **Big-dot UI** with 1 preset (the existing one renamed
   "Sun-up Funk"). Producer view tucked behind a gear icon.
4. **Add Tech House** preset — pure synth, no new samples needed.
5. **Add Boom Bap** — needs vinyl crackle + jazz Rhodes samples.
   Land both, then ship the preset.
6. **Add Tropical** — needs marimba/steel-pan pack.
7. **Add Slow Roll** — needs snap + ooh-vocal pad.
8. **Add Epic Electro** — pure synth, big stacks.
9. **Add Lofi Rooftop** — needs rain layer (reuse from Chill
   Machine "Waters") + muted trumpet (or use existing flute).
10. **Cross-soundscape transitions** — when switching dots,
    bar-align + tempo-glue the change instead of hard-cut.
11. **Save + share preset variants** — once a user tweaks a
    preset in producer view, "Save as my Tech House" → into the
    Notebook + soundscape library.

Each is a few hours of work. Total roadmap: ~1.5 weeks of focused
days; can be parallelized with other tracks.

## How this connects to the rest

- `groove-machine-songs-and-moods.md` — this is the concrete
  catalogue that earlier spec described in the abstract.
- `chill-as-atmosphere-for-groove.md` — Chill soundscapes layer
  *under* a Groove preset. Tropical + Chill's bird-and-water
  soundscape = a beach in your room.
- `chill-groove-blend-and-collective-control.md` — the 7
  soundscapes are what arcs and collective votes navigate
  between. Vote slider → "more fire" pulls the room toward Epic
  Electro; "more calm" toward Lofi Rooftop.
- `design-system-and-adaptive-strategy.md` — the big-dot UI is a
  good first reusable primitive (`<SoundscapeDot />`) for the
  shared UI library that doc proposes.

## What I need to actually ship

- 7 sets of curated synth/sample patches (this is craft work,
  not pure code — needs *listening* to the references).
- Marimba / vinyl-crackle / Rhodes-loop / snap / ooh-vocal /
  muted-trumpet samples (CC0). Estimated: 3–4 hours of sourcing.
- The engine refactor (~half a day).
- The big-dot UI (~half a day for v1).
- Each preset: ~1–2 hours of tuning once the engine + samples
  are ready.

Realistic delivery: first preset (Tech House) playing through the
big-dot UI in 1 day; remaining 6 over the following week.
