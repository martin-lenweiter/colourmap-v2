# Chill Machine — Deep Bass / Shamanic Layer

> Idea (Martin, 2026-04-25): "think about deep bass options for
> chill sounds that could work. almost like dubstep meets profound
> relaxation. how would u imagine. i imagine something almost
> shamanic. maybe didgeridoo."

A new family of **deep, slow, body-felt low-frequency layers** for
Chill Machine — sitting in the same world as the existing
Drones/Voices category but pushed lower (sub-100Hz centre) and
slower (3–10 second pulses, not steady drones). Aim: dubstep's
chest-pressure low end, but at a tempo and timbre that *settles*
the body instead of activating it.

## What "shamanic dubstep" means here

Dubstep gets its body-feel from:
- A LFO-modulated sub-bass that pulses at 1–4 Hz ("wobble")
- Low-pass-filtered sustained sub at 30–80 Hz
- A clean kick on the downbeat that the body picks up before the
  ears do

Shamanic / ritual music gets its trance-feel from:
- A breathing low drone (didgeridoo, throat singing, large gong)
- Slow circular pulse — heart-rate territory (50–80 bpm)
- Overtone-rich timbres so the *single* note becomes a chord
- Lots of space — long inhales and exhales between moves

The blend: **slow** dubstep wobble (1 cycle every 4–8 seconds, not 4
per beat), centred at 30–60 Hz, with overtone-rich timbres on top
that read as didgeridoo / gong / throat. No drum kit. No tempo
grid. Just pulse + breath.

## Concrete layer ideas

A new "Deep" category (or extending the existing Drones category)
with these 5–7 layers:

1. **Sub Pulse** — pure 40 Hz sine, 1 LFO cycle every 4 sec, faded
   at the edges so it never *thumps*, only *swells*. The body feels
   it; the ears barely hear it.
2. **Didgeridoo Drone** — sample-based (real didge recording). Loop
   point in the steady drone section. Pitch-shift to match the
   user's `baseFreq` so it harmonizes.
3. **Throat Singing** — Tuvan / Mongolian-style sample. Rich in
   harmonics; sounds like a chord even though it's one voice.
4. **Tibetan Gong** — long low gong strike, 30+ second decay. One
   strike every 30–60 seconds, randomized.
5. **Earth Wobble** — slow LFO on a low-pass filter at 80 Hz cutoff,
   sweeping between 30 and 80 Hz over 6 seconds. The "shamanic
   dubstep" core.
6. **Whale Low** — humpback / blue-whale recording, pitch-shifted
   into the 40–80 Hz range. Already evocative of body-tide.
7. **Heartbeat** — synthesized 60 bpm kick at -12 dB, only audible
   when nothing else is playing. Anchors the user's pulse.

## Technical fit

- Most of these are **sample-based** — real recordings, not
  synthesis. Add a `public/sounds/deep/` folder. CC0 sources:
  Freesound, Internet Archive, public-domain field recordings.
- Add a new category constant to the existing `getLayerCategory`
  function — `'deep'` — and a colour family in deep red-brown /
  obsidian (e.g. `#3A1818` background, `#7A2818` accent).
- The Earth Wobble / Sub Pulse can stay synthesized — Web Audio is
  already strong here.
- Volume warning: these layers can damage cheap speakers if set
  too high. Cap their max gain at 0.6 (vs. 1.0 for normal layers).

## Why this matters

- Massive contrast with the high-airy existing palette — gives
  Chill Machine real *range*. The user can sit in birds-and-water
  for one session and chest-pressure-low-shamanic for the next,
  same tool.
- Connects to the Sleep / Reset / Body-scan use cases that are
  currently underserved by the high-pretty layer set.
- Unique sound. Most meditation apps are bright; almost none go
  *low* in this way. Differentiator.

## Implementation order

1. Curate samples (didgeridoo, throat, gong, whale) — a few
   hours of listening + clipping
2. Add `'deep'` category to layer constants + colours
3. Add the 7 layers to `LAYERS` / `REAL_LAYERS`, wired through the
   existing layer toggle
4. Add the volume cap + a soft "low-frequency content" hint card
   on first use
5. Add to the saved-mixes preset list (a "shamanic" preset)

## Related specs

- `groove-machine-songs-and-moods.md` — the catalogue model these
  layers fit into
- `chill-groove-blend-and-collective-control.md` — the calm-side
  vocabulary for blend arcs
- `bird-collection` (memory) — same "click-into-a-sub-collection"
  pattern could work for Deep
