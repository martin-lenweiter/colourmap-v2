# Passcode Pads and Game-Unlocks

> Idea (Martin, 2026-04-25): "spec that idea for the future. people
> could use these cool passcode tools. but also imagine cool
> functionalities as they pass tests where they have to copy a
> music on the pad like memory. kind of a game to unlock more
> levels of the app."

A small playful primitive — a **3×3 rainbow-tone passcode pad** —
becomes the in-app vocabulary for unlocking secret features,
hidden surfaces, and beta tools. Beyond a static passcode, evolve
it into a **memory game** where the user has to repeat a played
melody to unlock the next level. The whole thing reads as a
delightful affordance, not a security gate.

The first instance ships with the Vision losange in PR #18: a
static-passcode pad that unlocks a small PDF catalog. The doc
below sketches where it can grow.

## The primitive

`<PasscodePad />` — a 3×3 grid of coloured cells, each tied to a
note from a pleasant scale (A-major-pentatonic by default). Tap
any cell → it plays its note. The user enters a sequence; if it
matches a target, an `onUnlock()` callback fires.

Three modes the same component can serve:

| Mode | What the user does |
| --- | --- |
| **Static** | Tap the same fixed sequence we know. (e.g. top-right × 2 + bottom-left for the PDF catalog.) |
| **Echo** | The pad plays a sequence; the user repeats it. Length grows with each level. Memory game à la Simon Says. |
| **Free** | No target — the pad is just a tiny instrument the user can play. Surfaced as a calm fidget. |

All three reuse the same component and audio engine. The
difference is just in `target` / `onCheck` props.

## The game — Memory + Music as unlock

The flow:

1. The user opens a "locked" feature — say, ColourStudios beta, or
   a deep-bass Chill layer family, or a hidden visualiser preset.
2. The pad plays a 3-note pentatonic phrase. The user has 5
   seconds to tap it back.
3. Pass → next level (4-note phrase). Pass again → 5-note. Up to
   8 notes for the full unlock.
4. Each successful level plays a small triumphant arpeggio + a
   visual ripple. The user *feels* progress.
5. Final unlock triggers the gated feature — e.g. the
   ColourStudios beta drawer slides open with a victory chord.

Each level's phrase comes from the same pentatonic scale, so even
a wrong tap sounds nice. No frustration. No timer pressure beyond
a soft dimming of the cell colours after 5 seconds.

### Why this works for Colourmap specifically

- **It's an instrument first, a gate second.** Even if the user
  fails to unlock, they've made small music. They walk away
  pleased.
- **It mirrors the Chill / Groove vocabulary.** The audio is
  pentatonic and warm, the colours are the same earth-tones
  palette. The pad belongs in the same world as the music tools.
- **Reward, not gate.** Most apps gate features behind paywalls or
  level-grinding. Colourmap gates them behind a *moment of music*.
  The "ticket" is *paying attention* for 30 seconds.

## Where to apply it

A non-exhaustive list of surfaces that could live behind a pad:

- **PDF catalog** (shipping in PR #18 — the simplest static case).
- **ColourStudios beta** — 4-level memory game, unlocks the loop
  composer.
- **Deep-bass / shamanic Chill family** — 3-level pad unlocks the
  whole layer category.
- **Salon Mode** — host-only feature; entered via a pad whose
  passcode you receive when you RSVP to a partner Salon.
- **Birds collection** (per the existing memory) — sub-pickers for
  named species hide behind tiny pads, one per category.
- **Dev tools / experiments** — a dev-only pad sequence opens a
  hidden settings tray.
- **Easter-egg seasonal moments** — a pad that lights up
  differently at solstices and unlocks a special soundscape for
  that day only.

## Design rules

To keep the system from becoming a chore:

1. **Pentatonic scale on every pad.** Wrong taps still sound nice.
2. **No timeout failure for static passcodes.** The user can take
   all day. Echo mode has a soft 5-second window per phrase.
3. **No "locked out" state.** Three wrong attempts = soft shake +
   reset. Never "wait 30 seconds." Never "you're banned."
4. **One sequence per surface.** The user never has to remember
   which pad uses which passcode — each gate is for a unique
   feature.
5. **Persist unlocks in localStorage.** Once you've solved a pad,
   you never see it again unless you explicitly tap "re-lock."
6. **Solveable passcodes get hints over time.** If a pad is locked
   for 7 days, fade in a small "the answer is two corners + a
   diagonal" italic line beneath it.

## Implementation sketch

```ts
interface PasscodePadProps {
  // Static mode: pre-set sequence (e.g. [2, 2, 6])
  target?: number[];
  // Echo mode: a phrase generator (called per level)
  echoPhrase?: (level: number) => number[];
  // How many levels to clear in echo mode
  echoLevels?: number;
  // Called when the gate is satisfied
  onUnlock: () => void;
  // Optional ID — used for persisting unlock state
  storageKey?: string;
  // Optional hint shown after N days locked
  delayedHint?: { afterDays: number; text: string };
  // Override the default 9-cell rainbow palette
  palette?: string[];
  // Override the default A-major-pentatonic frequencies
  frequencies?: number[];
}
```

The shipping `<SecretCatalog />` (PR #18) uses a thin specialisation
of this — `target = [2, 2, 6]`, hard-coded palette + freqs. The
generalisation can come later when the second gate appears.

## Music memory game — phrase library

For echo mode, pre-curated phrases for each level keep the
sequences musical (not random):

```
Level 1 (3 notes): [4, 6, 8]    (centre → mid-right → bottom-right)
Level 2 (4 notes): [0, 4, 8, 4] (diagonal in + middle)
Level 3 (5 notes): [2, 5, 8, 6, 7] (descending S-curve)
Level 4 (6 notes): [0, 1, 2, 5, 4, 3] (top-row sweep + middle)
Level 5 (7 notes): [4, 1, 4, 7, 4, 3, 5] (centre + cross)
Level 6 (8 notes): [0, 2, 6, 8, 4, 1, 7, 4] (corners + axes)
```

Each is a hand-picked melodic phrase, not just random taps —
because the user is going to *learn* it, repeat it, and the
phrase should be worth remembering.

## Future-future

- **Multi-player pads in a Circle.** Two phones, one pad each.
  Both must complete the same phrase synchronously to unlock a
  shared feature (e.g. a duet recording session).
- **Pads as greeting cards.** A user can compose a 4-note phrase
  and send it; the receiver opens an in-app gate that unlocks a
  custom message + a song the sender chose. The phrase is the key.
- **Pads inside the music tools.** Tap the pad in Chill Machine to
  add a 4-bar layered melody using exactly those notes. The pad
  becomes an instrument inside the instrument.
- **Sound-key onboarding.** First-run onboarding ends with a tiny
  pad that plays a phrase, then has the user repeat it. Their
  successful first echo is also their first interaction with the
  audio engine. Personalised greeting.

## Risks & honest tradeoffs

- **Could feel arbitrary.** If the user doesn't realise a feature
  is gated, the pad is a stranger. Mitigation: only gate things
  that are clearly secret/experimental — never core surfaces.
- **Accessibility.** A music + colour pad isn't usable for
  colour-blind or hearing-impaired users without alternative
  affordances. Need text labels on cells + a "show sequence as
  numbers" toggle.
- **Frustration on echo mode.** Some users will fail repeatedly.
  Mitigation: never lock out, always allow re-try, and the
  delayed-hint after 7 days catches the genuinely stuck.
- **Phone speakers may be muted.** The pad fails silently on a
  muted phone. Add a haptic pulse per tap so feel-feedback
  survives.

## Status

- **PR #18 ships** the static `<SecretCatalog />` instance with
  passcode `[2, 2, 6]`.
- **Future PR**: extract `<PasscodePad />` as the shared
  primitive once a second gate appears.
- **Future PR**: echo mode (memory game) for the first
  feature-unlock case (probably ColourStudios beta).
- **Future PR**: phrase library + level system.

## Connections

- `chill-machine-deep-bass-shamanic.md` — likely a candidate for
  the first non-static gate
- `colourstudios-loop-001.md` (when written) — beta access
  surface
- `parties-social-art-connector.md` — multi-player pad fits
  party Circles
- `overview-vision-progression-patterns-beauty.md` — the
  passcode-pad is an "ethical gamification" primitive consistent
  with that doc's stance (no points / leaderboards, but
  *moments* the user earns through attention)
