# Groove Machine — Songs, Moods, and Unified Transitions

> Long-term idea (Martin, 2026-04-25): the Groove Machine should grow
> beyond a single pattern. Different grooves — each its own infinite
> loop or its own *song* — but the transitions between them feel like
> a single thing breathing. As if all of it is, deep down, one piece.

## Today

`components/GrooveMachine.tsx` currently runs **one** 16-step pattern
across 15 voices. The user can:

- Toggle individual tracks (kick, bass, pads, etc.)
- Switch dynamics modes (Full / Breakdown / Drop / Silence)
- Randomize the active set
- Drop button → riser → slam-back kick (one-off effect)

Everything plays from a single grid. There is no concept of distinct
*grooves* or *songs*, and no notion of evolving a piece over time.

## The vision

Think of the Groove Machine as a small hand-tuned **catalogue of
moods** — each one a complete groove (rhythm, bass, chord feel,
texture) — with the user able to wander between them, the way you'd
wander between rooms of the same house. The lights dim and shift; the
floor doesn't.

### Three ideas, layered

1. **Each groove = its own infinite loop.**
   A "groove" is a named bundle: pattern + bass line + chord set +
   synth sounds + tempo range. It loops forever once selected.
   Examples — *Sunset Tropical · Lofi Rooftop · Dub Garage · Desert
   Trance · Sun-up Funk · Late Night Tech.* Curated, not generated.

2. **Each groove can be a song.**
   A "song" is a groove with a structure: intro → verse → drop →
   breakdown → verse → outro, each section a slight variation of the
   same groove (more space, more density, different sub-bass, key
   change). The user starts a song and it evolves on its own. They
   can also pin themselves to a section ("just stay in the breakdown
   for 5 minutes").

3. **Transitions are the secret.**
   Switching from one groove to another should never sound like a
   skip. Always a bar-aligned cross-fade with at least 2 bars of
   overlap, key-matched (transpose the destination on the fly to
   share at least the root with the origin), and tempo-glued
   (interpolate BPM over 4 bars). The bass is the last thing to
   leave; the pad is the first thing to arrive. The user feels they
   never left.

   When done well, the result feels like **one continuous deep
   piece** — even though it's actually a wander through many.

## Why this matters

The single-groove version is a toy. The multi-groove version is a
companion — something the user can leave on for an hour while they
work, and have it carry them through different moods without ever
needing to be touched. That's the path to it being something people
*live with*, not just play with.

It also unlocks the social-bar / party angle (see
`parties-social-art-connector.md` and
`social-media-future-and-circles.md`): if friends each hold "one
switch", the whole room can wander through the catalogue together
without anyone needing to DJ.

## Open questions

- **Curated or generative?** First version curated — 6–10 hand-built
  grooves so the quality bar is high. Generative variation can come
  later as a layer *on top* of a curated groove (e.g. random fills,
  shifted chord voicings).
- **Where does the catalogue live?** Probably a `GROOVES` constant
  in `components/GrooveMachine.tsx` for v1, then promoted to its own
  data file when it grows past ~15 entries. Eventually maybe
  user-saved grooves (from "Save this moment → Notebook"; see #21).
- **How does the user navigate?** Phone-friendly: a horizontal scroll
  of "groove cards" above the play button. Tap a card → 4-bar
  transition begins. Long-press → preview without committing.
- **Songs vs. loops — do we need both?** Probably yes: loops for
  background companion mode, songs for "I want a journey for the
  next 6 minutes." A single toggle on each groove ("loop / song")
  would be enough.

## Related specs

- `pleasant-redesign-direction.md` — overall aesthetic direction
- `parties-social-art-connector.md` — social-modulation layer
- `musical-journeys-ai-narrations.md` — long-form narrated journeys
- `social-media-future-and-circles.md` — collective groove control
