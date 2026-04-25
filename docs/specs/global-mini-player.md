# Global Mini-Player

> Long-term idea (Martin, 2026-04-25): "or whatever music we are
> doing groove machine etc... a small player appears below. if we
> move to the focus part."

When the user starts a sound in any of the music tools (Chill Machine,
Groove Machine, Magic Maker, Lo-fi Looper) and then navigates away
(e.g. to `/day` Focus), a **small persistent player** should appear
along the bottom edge — keeping the audio alive and giving them a
single play/pause + volume + tool-name pill that links back.

## Today

- Each tool owns its own AudioContext and lifecycle (`startAudio` /
  `stopAudio`).
- Navigating away unmounts the tool component → AudioContext closes
  → audio stops.
- Within `/sounds`, switching tabs in `SoundLab` ALSO unmounts the
  previous tool. (Partially fixed in this PR by keeping all four
  tools mounted with `display: none` toggling.)

## Target shape

A **`SoundSessionProvider`** at the app root (above the page outlet)
holds:

- `currentTool: 'chill' | 'groove' | 'maker' | 'looper' | null`
- `playing: boolean`
- `metadata: { title, subtitle, color }` — what to show in the pill
- `controls: { play, pause, stop, setVolume }` — refs the active tool
  hands to the provider when it starts

The four music components register/unregister themselves with the
provider when they mount play. The mini-player UI sits in the global
layout (just below the header or above the bottom nav on phone) and
shows up whenever `currentTool !== null`.

### UI

A 48px-tall pill on the bottom (mobile) or below the header
(desktop):

```
┌──────────────────────────────────────────────────┐
│ ● Chill Machine · 528Hz       ▶  ──○────  ↗ tool│
└──────────────────────────────────────────────────┘
```

- Left: status dot (animated when playing) + tool name + key state
- Center: play/pause + volume slider
- Right: "↗ tool" — link back to `/sounds` with the right tab
  pre-selected

Tap the pill anywhere except controls → return to the tool.

## Why this matters

- Lets the user keep music going while they check in on `/day`,
  jot ideas in `/notebook`, or browse `/circles`. No "did the music
  stop because I left the page?" anxiety.
- Establishes the foundation for the **collective experience** spec
  (see `chill-groove-blend-and-collective-control.md`) — a shared
  player is the most natural place to surface the "vote for fire /
  calm" UI when in a Circle session.

## Implementation sketch

1. `lib/sound-session.tsx` — context + provider with the shape
   above. Holds the AudioContext lifecycle so it survives unmounts.
2. Refactor each music tool to:
   - Lift its AudioContext out into the provider (or accept one as
     a prop)
   - Register `metadata` + `controls` on mount/play
   - Stop calling `ctx.close()` on unmount
3. `components/MiniPlayer.tsx` — renders the pill, reads from the
   provider.
4. Mount `<MiniPlayer />` in `app/(app)/layout.tsx`.

### Open questions

- Does the AudioContext belong in the provider, or do we just keep
  the tool mounted off-screen via portal? Portal is simpler but
  costs render time; provider is cleaner but bigger refactor.
- Per-tool state preservation: does Chill Machine remember the user
  was on the *Layers* sub-section when they come back? Probably yes
  — keep `localStorage` snapshot per tool.
- Multiple sounds at once: can Chill + Groove play together? V1: no
  (one tool at a time, switching stops the previous). V2: yes
  (becomes a mini DAW).

## Related specs

- `groove-machine-songs-and-moods.md` — what the player will play
- `chill-groove-blend-and-collective-control.md` — collective UI on
  top of the player
- `cockpit.md` — where the pill lives on `/day`
