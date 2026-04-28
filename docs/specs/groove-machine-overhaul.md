# GrooveMachine Overhaul — Spec

## 1. Pattern Sequencer

- 16-step grid per track, rendered in the left panel below each track row.
- Toggle button in the left panel header to show/hide the grid.
- Click a cell to toggle a step on/off; click-drag to paint multiple steps.
- Each track stores a `userPattern: boolean[]` (16 steps). Custom edits are cleared when the user switches presets.
- Displayed pattern = preset `patternOverride` merged with `userPattern` (user edits take precedence).
- Current playing step is highlighted (driven by the existing step clock).

## 2. Five New Presets (`lib/groove-presets.ts`)

| Name | BPM | Notes |
|-------------|-----|---------------------------------------|
| Afrobeats | 102 | voice tweaks, pattern overrides, variation pool |
| Deep Chill | 88 | voice tweaks, pattern overrides, variation pool |
| Drum & Bass | 170 | voice tweaks, pattern overrides, variation pool |
| Jazz Groove | 95 | voice tweaks, pattern overrides, variation pool |
| Trap Soul | 65 | voice tweaks, pattern overrides, variation pool |

Each preset follows the existing schema: `bpm`, `swing`, `voiceTweaks`, `patternOverride`, `variationPool`.

## 3. Layering / Crossfader

- User selects a second preset (B slot) via a dropdown in the right panel.
- Blend slider ranges 0 → 1 (A = 1, B = 0 at each extreme).
- When `blend > 0` the engine interpolates:
  - `bpm`: `lerp(A.bpm, B.bpm, blend)`
  - `swing`: `lerp(A.swing, B.swing, blend)`
  - `voiceTweaks`: per-key lerp
  - `patterns`: probabilistic merge — step is active if `random() < lerp(A.active ? 1 : 0, B.active ? 1 : 0, blend)`
- Crossfader UI is hidden (or disabled) when no B preset is selected.

## 4. Tempo Sync

**BinauralTuner** dispatches a `CustomEvent` on every `beatFreq` change:

```ts
window.dispatchEvent(new CustomEvent('binaural:beatfreq', { detail: { hz: beatFreq } }));
```

**GrooveMachine** — Sync toggle in the transport bar:

- When enabled, listens for `binaural:beatfreq` and sets:
  ```ts
  bpm = Math.max(80, Math.min(140, Math.round(60 + hz * 10)))
  ```
- Sync overrides manual BPM input while active.
- Toggle off restores the last manually set BPM.
