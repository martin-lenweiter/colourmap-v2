# Groove Machine — Infinite Tracks with Real Structure

> Idea (Martin, 2026-04-25): "do the work on groove machine go
> super deep work super hard. give me a deep evolution of the
> product so it doesnt sound repetitive. and creates 7 proper
> infinite tracks with ups downs chill and growth even funny
> elements if can be."

The 7 soundscape presets that just shipped (PR #18) are the
shape — 16-step looping patterns that reconfigure the engine.
After 90 seconds they reveal their loop. This spec is the path
from *those loops* to **7 actual songs that play forever** with
ups, downs, chill, growth, surprise, humour. Tracks the user
could leave on for an hour without hearing the same bar twice.

## What "infinite track" actually means

Not random. Not generative-noise. **Composed forever-music** —
each preset is a *structured arc that recombines* across long
stretches without ever playing the same bar twice. Borrowing
from how Brian Eno's *Music for Airports* loops infinitely or
how Boards of Canada track endings drift back to beginnings.

Concretely, each preset has:

1. A small **library of variations** for every track — 4–8
   alternative patterns per voice instead of 1.
2. A **chord progression** that moves over 16 / 32 / 64 bars,
   not 1.
3. A **phrase scheduler** that picks variations + transitions
   based on a soft narrative arc (intro → verse → chorus →
   bridge → reprise → outro → loop back to intro with variation).
4. **Modulation curves** — filter sweeps, volume envelopes,
   reverb amount — moving slowly across minutes, not bars.
5. **Surprise events** — once every 30–90 bars, a single
   unexpected element fires (a single bell, a vinyl pop, a
   filter flip, a 1-bar silence, a 1-bar pitched-up vocal
   chop). The user notices, smiles, settles.

## The arc — universal structure

Every preset is built as **8 phases** that loop:

```
   intro ── verse ── lift ── chorus ── breakdown ── verse' ── outro ── reprise ──┐
     ↑                                                                            │
     └────────────────────────────────────────────────────────────────────────────┘
```

| Phase | Bars | What happens |
| --- | --- | --- |
| **intro** | 8 | Sparse — pad + bass + sparse hat. Inviting. |
| **verse** | 16 | Add kick + snare base. Stable. The "main groove." |
| **lift** | 4 | Filter opens, drums tighten, riser tail. |
| **chorus** | 16 | Full mix — kick + snare + hat + lead + chord stab. |
| **breakdown** | 8 | Drop the drums; bass + pad + one melodic element only. Breath. |
| **verse'** | 16 | Verse again with a *small variation* — different lead phrase, an alt-bass, etc. |
| **outro** | 8 | Soften the kick, lengthen reverb, fade percussion. |
| **reprise** | 4 | One bar of silence + intro ghost. Loop back. |

Total per cycle = 80 bars. At 120 bpm, that's 80 × 4 / 120 ×
60 ≈ 160 seconds = **2:40 per arc**. Cycle through 6 arcs before
the user has heard a "full song" (~16 minutes). Even at the
*end* of a 16-minute session, no two bars are identical thanks
to the variation pool.

## Variation pool — concrete shape

Per voice, 4–8 alternative patterns the scheduler picks from.
For example, the **kick** in Sun-up Funk:

```ts
const KICK_VARIATIONS = [
  // A — main funk kick (on 1, ghost on &a3)
  [1, 0, 0, 0, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 0, 0.4, 0],
  // B — busier (extra hits on the 2 and 4)
  [1, 0, 0, 0, 1, 0, 0.5, 0, 1, 0, 0, 0, 1, 0, 0.4, 0],
  // C — half-time (only 1 and 9)
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  // D — disco (every beat)
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  // E — funky pickup (hit on the &-of-4 leading to next bar)
  [1, 0, 0, 0, 0, 0, 0.5, 0, 1, 0, 0, 0, 0, 0, 1, 0],
];
```

The phrase scheduler picks one per bar using soft rules:
- Verse phase prefers A or B
- Chorus prefers B or D (busier)
- Breakdown picks C (half-time) or skips kick entirely
- Outro picks A then E (the pickup leads back to intro)
- 5% chance of any phase to sub-pick a different variation
  ("humanization at the bar level")

Same shape applies to snare, hat, perc, bass, chords, melody.
The variation pool is curated, not random — every alternative
is musical.

## Chord progression — 4 voicings minimum

Each preset has a 4-or-8-bar chord cycle (root note + voicing).
Bass + chord track + melody all transpose to follow it. Examples:

- **Sun-up Funk**: i — VI — III — VII (Am — F — C — G)
- **Tech House**: i — i — VI — V (Am — Am — F — E)
- **Tropical**: I — V — vi — IV (C — G — Am — F)
- **Slow Roll**: i9 — IV9 — VImaj7 — VImin7 (Am9 — Dm9 — Fmaj7 — Fm7)
- **Boom Bap**: ii — V — i — i (Bm7♭5 — E7 — Am — Am)
- **Epic Electro**: i — VI — III — VII (Am — F — C — G) — same as Funk but with octave-stack synths
- **Lofi Rooftop**: vi — ii — V — I (Am — Dm — G — C) — jazzy turnaround

Bass walks the chord. Lead motif transposes. The sense of
"motion" doubles even at the same bpm.

## Modulation curves — slow change over minutes

A few scalar parameters slowly moving:

- **Master filter cutoff** — sine wave from 4 kHz to 12 kHz over
  ~2 min. Adds a breathing quality.
- **Reverb wet level** — ramps up during chorus, down during
  verse. Distance dynamics.
- **Pad volume** — present in intro/outro, lower in chorus.
- **Bass octave** — drops one octave during breakdown, rises
  back during chorus build.
- **Stereo width** — narrows in breakdown ("intimate"), widens
  in chorus ("expansive").

These never reset — they cross arc boundaries. So even hearing
the "same" verse twice at minute 2 and minute 8, the *space*
around it is different.

## Surprise events — the human moment

Every 30–90 bars, the scheduler fires **one** unexpected element
from a per-preset library:

| Preset | Surprise candidates |
| --- | --- |
| **Sun-up Funk** | Quick guitar lick · sax stab · "uh!" vocal chop · cowbell hit · disco whistle |
| **Tech House** | Bleep ascending · rim-shot fill · tape stop · acid 303 squiggle |
| **Tropical** | Wave splash · bird call · steel-pan run · whistle line · gull cry |
| **Slow Roll** | Lone breath · finger snap roll · vinyl hiss swell · whispered "ooh" |
| **Boom Bap** | Vinyl rewind · soul vocal chop · scratch · "yo!" tag · jazz piano flourish |
| **Epic Electro** | Crash + reverse cymbal · vocoded "go!" · synth riser stinger · 1-bar drop-out |
| **Lofi Rooftop** | Rain pulse · cassette wow · field-recording fragment · cat purr · old-radio ham snippet |

Some are funny on purpose — a cat purr in Lofi Rooftop, a "yo!"
tag in Boom Bap, a disco whistle in Sun-up Funk. The user smiles,
recognises the personality of the room. **Humour is a feature.**

## How "ups, downs, chill, growth" map onto this

- **Up** = chorus phase. Filter opens, drums tighten, lead riff
  lands.
- **Down** = breakdown phase. Drums drop, bass + pad only, room
  feels close.
- **Chill** = intro / verse / outro phases. Steady, low-energy.
- **Growth** = the *long* curve — modulation over 5+ minutes
  showing slow change in filter cutoff, reverb size, stereo
  width. The track *feels* like it's expanding even when no
  individual element changed.

Each session naturally moves up and down without the user
controlling it. The arc shape is the song.

## "Funny" elements — concrete catalogue

Per Martin: *"even funny elements if can be."* Yes. A small
catalogue of moments that aren't trying to be cool:

- A solitary cat purr in Lofi Rooftop after 2 minutes of nothing.
- A James Brown-style "AH-HUH!" in Sun-up Funk during the lift.
- A reversed cymbal crashing *up* into the chorus in Epic Electro.
- A "tape eaten" stop in Tech House (1-bar tape-warble) before
  the drop returns.
- The first 1 second of a French children's TV theme buried 18 dB
  down in Boom Bap. (Pure weirdness — barely audible, the user
  half-recognises something but can't name it.)
- A wave-cresh + seagull pair in Tropical that fires at random.
- In Slow Roll, every ~3 minutes: a long sigh ("haaa") on the
  downbeat.
- Boom Bap once an hour: a single warp-style scratch sequence
  that lasts 1 bar.

These are tasteful — never loud, never breaking the bpm, always
in key. The user feels the *room has personality*. Different from
algorithmic radio.

## Implementation — what changes in code

This is multi-day work. Concrete order:

1. **Extract scheduler from GrooveMachine.tsx** into
   `lib/groove/scheduler.ts` — pure 16-step + chord-progression +
   variation-pool engine. Component just renders + dispatches
   start/stop/preset.
2. **Variation pool** — add `variationsPerTrack` to each preset
   in `lib/groove-presets.ts`. Each track has 4–8 alternative
   pattern arrays. Scheduler picks one per bar based on phase.
3. **Phase state machine** — 8-phase cycle (intro → verse → lift
   → chorus → breakdown → verse' → outro → reprise). Tracks
   `currentPhase` + `barInPhase`. Drives which variation pool to
   pick from.
4. **Chord progression** — `chordCycle: [{root, quality, bars}]`
   in each preset. Bass + lead + chord track transpose every
   cycle.
5. **Modulation curves** — `lib/groove/modulation.ts` exposes a
   few slow LFOs (filter, reverb, octave). Scheduler reads
   their current value at every bar and applies.
6. **Surprise event scheduler** — every 30–90 bars (random),
   pick from the preset's surprise pool, schedule one event.
   Each event is just a one-shot voice trigger with a specific
   voice + freq + time offset.
7. **Tune each preset** — about half a day per preset for
   variation pool + chord cycle + surprise pool + modulation
   profile. 7 presets × ~half a day = ~3.5 days of focused
   craft work.

Total estimate: **~1 week of focused work** to take the 7 presets
from "looping pattern" to "infinite track with personality."

## Manual override — keep the user in charge

Even with the auto-arc playing, the user keeps these controls:

- **Track toggles** still work — mute the snare any time.
- **Mode buttons** (Full / Breakdown / Drop / Silence) **override
  the auto-phase**. If the user hits Drop, the engine pauses the
  arc, runs the riser, slams back into the auto-arc at the next
  natural chorus point.
- **Tap-pad surface** for manual lead/keys (per Martin's earlier
  ask) plays *over* the auto-arc — the user always has a voice.
- **Hold mode** — long-press a preset's big dot → "stay in this
  phase." Useful for "I want to *just* sit in chill" or "I want
  to ride the chorus." Releases on tap; rejoins the arc at the
  next phase boundary.

## What this connects to

- `groove-machine-songs-and-moods.md` — the songs concept the
  arc model is the concrete realisation of
- `groove-machine-7-soundscapes.md` — the 7 presets to deepen
- `chill-groove-blend-and-collective-control.md` — the calm↔fire
  arcs are essentially this same arc model exposed at the macro
  level
- `chill-as-atmosphere-for-groove.md` — atmospheres still play
  underneath the auto-arc; they don't conflict
- `passcode-pads-and-game-unlocks.md` — surprise events could
  occasionally include a passcode-pad-style 4-note riff, the
  user echoes it on their phone, unlocks something

## Risks & honest tradeoffs

- **Engine complexity creep.** The current scheduler is ~100
  lines. The arc-aware scheduler will be ~400. Mitigation:
  extract into its own file with clear pure-function sub-modules
  (variation picker, chord cycler, modulation reader, surprise
  picker).
- **Sample-quality dependency.** Surprise events need real
  recordings (vinyl pops, cat purrs, "uh!"). CC0 sourcing is the
  bottleneck — same as the 7-soundscapes deepening work.
- **CPU load.** Pad + bass + 5 drums + lead + chord stab + 1
  surprise event per bar = ~10 voices live. Modern Web Audio
  handles 50+ comfortably; phones from 2018 might cough. Need a
  voice-stealing primitive (limit to 12 simultaneous voices).
- **Arc fatigue.** If the 80-bar cycle is too short, the user
  hears the structure. Fix: bar lengths randomized within ±20%
  per phase (verse becomes 14–18 bars, not always 16).
- **Surprise events as noise.** If they fire too often, they
  become annoying. 30–90 bar gap means roughly 1 every 1–3
  minutes. Tune ratios per preset.

## Closing

The current 7 presets are the *seed*. This spec is the *plant* —
each preset becomes an actual song that lives forever. The user
puts on Tropical at the start of dinner, lets it play through the
meal, and three hours later it still feels like the same room
breathing — but they've also been quietly delighted by 200 small
musical moments they never noticed they were noticing.

That's the point.
