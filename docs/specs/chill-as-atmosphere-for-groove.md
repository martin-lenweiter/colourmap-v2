# Chill Machine as Atmosphere for Groove Machine

> Idea (Martin, 2026-04-25): "give me a system for moving the groove
> and chill machine into unity. i see chill machine as one thing.
> and groove machine can incorporate soundscapes saved landscapes
> from chill machine."

A focused system for unifying the two music tools without melting
them into one super-app. **Chill Machine stays Chill Machine** —
the atmosphere/landscape creator. **Groove Machine consumes Chill
Machine's saved landscapes as backgrounds**, so a groove always
plays on top of an atmosphere the user already built.

## The model

Three concepts:

1. **Soundscape** — what Chill Machine produces. A named, saved
   combination of `(baseFreq, layers[], harmonics[], sacred[],
   melodies[], reverb, effects)`. Already partially exists as the
   "tuner-mixes" localStorage entry; needs a little extension to
   carry harmonics/sacred/melodies/effects too.

2. **Groove** — what Groove Machine produces. A
   `(bpm, mode, activeTracks[])` snapshot, plus (later) the
   curated catalogue from `groove-machine-songs-and-moods.md`.

3. **Set** — a Groove + an optional Soundscape playing
   simultaneously. The Soundscape is the bed; the Groove is the
   rhythm + melodic motion. They're sample-rate independent and
   share only the master output bus.

```
            ┌─────────────────────────────┐
   user ─→  │  Chill Machine              │  ──→ saves Soundscape
            │  (layers / harmonics /      │       to library
            │   melodies / effects)       │
            └─────────────────────────────┘
                          │
                          ▼  pick from library
            ┌─────────────────────────────┐
   user ─→  │  Groove Machine             │  ──→ plays Set
            │  + Soundscape picker        │       (groove on
            │  + Groove picker            │        atmosphere)
            └─────────────────────────────┘
```

## What changes in each tool

### Chill Machine

- The current "Save Mix" button extends to capture the **full
  state** (today only saves base/beat/vol/layers). Add: harmonics,
  sacred freqs, active melodies, melody scale, reverb amounts,
  effect on/off + amounts, voice volume.
- The saved-sounds drawer becomes the canonical Soundscape
  library — same shape Groove Machine will consume.
- No new UI surface. Chill Machine stays exactly as it is for
  the user; the change is *what* gets saved.

### Groove Machine

- New section above the Mode/Dynamics card: **"Atmosphere"**.
  - A horizontal scroll strip of saved soundscapes (read from
    the same `colourmap:tuner-mixes` localStorage key Chill
    writes).
  - Tap one → it loads + starts playing. Tap again → mute it.
  - First entry is "—" (no atmosphere) for pure groove mode.
- Groove + Atmosphere share the master output bus
  (compressor + limiter), so the atmosphere doesn't clip when
  the kick hits.
- The atmosphere is bar-aligned to the Groove tempo: when you
  press Drop, the atmosphere ducks 6 dB through the riser and
  comes back at the slam.

### A new shared lib: `lib/sound-library.ts`

```ts
export interface Soundscape {
  id: string;            // uuid
  name: string;          // user-given
  createdAt: string;
  base: number;
  beat: number;
  vol: number;
  binaural: boolean;
  layers: Record<string, number>;
  harmonics: string[];
  sacred: string[];
  melodies: string[];
  melodyScale: string;
  layerReverb: number;
  effects: { wahOn: boolean; wahSpeed: number;
             echoOn: boolean; echoAmount: number };
}

export function listSoundscapes(): Soundscape[] { /* localStorage */ }
export function saveSoundscape(s: Soundscape): void { ... }
export function getSoundscape(id: string): Soundscape | null { ... }
```

Both tools import from this — Chill writes, Groove reads.

The previously-merged "Save this moment → Notebook" stays as the
*human-readable* archive; this library is the *machine-readable*
one (re-loadable in either tool).

## Why this is the right shape

- **Doesn't merge them.** Two tools, two surfaces, two mental
  models. The "unity" is plumbing, not UI.
- **Lets the user keep building Chill atmospheres.** Every saved
  soundscape becomes a new Atmosphere option in Groove. The
  Groove Machine library *grows for free* as the user uses Chill
  more.
- **Simplest possible engineering.** Two tools share a JSON shape
  via localStorage. No provider needed today (could move to one
  later — see `global-mini-player.md`).
- **Matches the mental model of "one engine, two faces."** Chill
  is the calm face; Groove is the active face; both share the
  atmosphere underneath.

## Extension paths

Once this lands, three natural follow-ons fit cleanly:

1. **Soundscape library on its own page.** A dedicated `/sounds/
   library` view that shows every saved Soundscape as a card.
   Tap → preview. Long-press → "play in Chill" / "play in
   Groove". Becomes the user's personal sound bank.
2. **Soundscape sharing.** Each Soundscape is just JSON — easy to
   export as a URL for a Circle. Friend imports → it appears in
   their library.
3. **Mood arc → Atmosphere automation.** The blend arcs spec
   (`chill-groove-blend-and-collective-control.md`) can reference
   Soundscapes by id — "calm minute 0–3 = my Sunset soundscape;
   minute 3 onwards = Groove with my Sunset still under it."

## Open questions

- **AudioContext sharing.** Today each tool spins its own
  AudioContext. For Set mode, they should share one — otherwise
  the master bus / clipping picture is muddy. Probably handled by
  the future `SoundSessionProvider`.
- **Tempo lock.** Should the atmosphere try to "swing" with the
  groove's bpm? Probably not — atmospheres are timeless by
  design. But a slow LFO on layer volumes could subtly pump with
  the kick. Try, then decide.
- **What happens when the user edits the atmosphere from inside
  Groove?** v1: read-only — they have to switch to Chill to
  change. v2: a slim "atmosphere editor" panel in Groove for
  layer toggles only.

## Implementation order (small PRs)

1. Extract `lib/sound-library.ts` from Chill Machine — same
   localStorage key, typed shape.
2. Extend Chill's `saveMix` to include the missing fields
   (harmonics, sacred, etc.).
3. Add the Atmosphere strip to Groove Machine — read-only, just
   plays the chosen soundscape via the existing layer/melody
   helpers.
4. Wire Groove + Atmosphere through a shared compressor/limiter
   so the mix is glued.
5. (Later) Atmosphere ducks during Drop riser.

## Related specs

- `groove-machine-songs-and-moods.md` — Groove side of unity
- `chill-groove-blend-and-collective-control.md` — the larger
  blend story this fits inside
- `global-mini-player.md` — the cross-page layer above both
- `chill-machine-deep-bass-shamanic.md` — new Chill layers that
  also flow into Groove via Atmosphere
