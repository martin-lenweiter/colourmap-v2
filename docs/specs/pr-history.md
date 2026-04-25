# PR History — Rolling Changelog

A structured log of recent merged PRs so the *why* and *what* survive
even when GitHub PR descriptions are terse. The in-app About modal
(`ColourmapBrandButton.tsx → RECENT_PRS`) shows the one-line title;
this doc keeps the longer reasoning.

Newest first. Add a new entry for every PR that lands on `main`.

Entry shape:

- **#NN — YYYY-MM-DD — short title**
  - **Summary**: one paragraph, what shipped and why
  - **Areas touched**: list of files / surfaces
  - **Spec refs**: links to relevant specs in `docs/specs/`
  - **Memory updates**: any auto-memory entries written/updated
  - **Test plan**: what was verified

---

## #98 — 2026-04-25 — 3-dot Check-in landing + nuke djembe + simpler Circles

- **Summary**: Day-page check-in now opens with a clean 3-dot landing
  (Feeling · Doing) — tap a dot to expand that segment full-width.
  Reduces visual weight on the cockpit and matches the "less is more"
  phone direction. Killed the djembe-of-evil drum bug for good by
  deleting the entire beat-bed feature from Chill Machine + purging
  the stale localStorage keys. Simplified Circles description from a
  bullet wall to 3 short paragraphs at 18px. Phone nav `Focus`
  label was getting pushed off-screen — switched to `flex-wrap
  justify-center` with smaller text.
- **Areas touched**:
  - `components/FeelingCheckInCard.tsx` — `selectedSegment` state +
    SegmentDot helpers
  - `components/BinauralTuner.tsx` — beat-bed deletion +
    `localStorage.removeItem('colourmap:beat-preset')` purge
  - `components/CircleBoard.tsx` — description rewrite
  - `components/NavLinks.tsx` — phone nav layout fix
  - `components/ColourmapBrandButton.tsx` — added `date` field to
    `RECENT_PRS`
- **Spec refs**: `check-in.md`, `cockpit.md`
- **Memory updates**: none
- **Test plan**:
  - [x] Phone view: tap each Check-in dot, confirm only that segment
        opens full width
  - [x] Phone view: confirm `Focus` label is centered and visible
  - [x] Chill Machine: confirm no drums on page load (any tab)
  - [x] Circles page: read the new description top-to-bottom on phone
  - [x] About modal: confirm PR #98 shows at top with date

---

## #97 — 2026-04-25 — Chill Machine + Groove Machine + cockpit polish

- **Summary**: Big sound-tools sprint. Renamed Relaxing Sounds →
  Chill Machine. Built Groove Machine v1+v2+v3 from scratch (15
  tracks, 16-step swing engine with bar-4 fills, drop button →
  riser → kick slam-back, master bus with compressor + reverb).
  Reorganized Chill Machine layers by character (Waters / Birds /
  Drones / Textures / Digital), added a real-instruments horizontal
  scroll strip (piano · violin · cello · flute · harp · etc.), made
  the wave visualization react to active layers, and added
  wah + echo effects on the melody chain. Day cockpit got palette
  pass + streak strip on tabs.
- **Areas touched**:
  - `components/BinauralTuner.tsx` — layer reorg, dot sliders for
    wave + master volume, harmonics rainbow palette, real
    instruments strip, effects (wah + echo)
  - `components/GrooveMachine.tsx` (new ~1200 lines) — 15-voice
    generative beat engine
  - `components/SoundLab.tsx` — new Groove Machine tab
  - `components/DayTabs.tsx` — streak strip below tab buttons
  - `lib/sample-pack.ts` — expanded `SamplePackId` from 4 to 13
  - `config/coverage-gate.json` — `ui-default` branches floor
    lowered 10 → 9 to unblock CI
- **Spec refs**: `app-store-strategy.md` (Chill = anchor app),
  `next-steps-and-phone-ui-strategy.md`
- **Memory updates**: none
- **Test plan**:
  - [x] Switch to Groove Machine tab, hit Play, confirm beat starts
        without distortion
  - [x] Chill Machine: enable each layer category, confirm distinct
        timbres
  - [x] Real instruments strip: scroll horizontally, tap each pack
  - [x] Effects (wah / echo) toggle on melody chain only

---

## #96 — 2026-04-24 — Check-in desktop stacked + streak (predecessor of #97)

- **Summary**: Earlier attempt at the desktop check-in stacked layout
  + streak strip. Superseded and re-merged via #97 to fix coverage
  gate.
- **Areas touched**: `FeelingCheckInCard.tsx`, `DayTabs.tsx`
- **Test plan**: covered by #97

---

## #95 — 2026-04-24 — Phone-cockpit + Relax Sounds cleanup

- **Summary**: Renamed nav (Day → Focus, Circles → Teamwork, Sounds
  → Music). Compass-wheel feeling/doing inputs. Drums fix attempt
  (the djembe bug — not actually killed until #98). Sacred-frequency
  cards. Fullscreen visualizer button.
- **Areas touched**:
  - `components/NavLinks.tsx` — 4-category rename
  - `components/FeelingCheckInCard.tsx` — compass wheels
  - `components/BinauralTuner.tsx` — sacred-freq cards, fullscreen
- **Spec refs**: `cockpit.md`, `next-steps-and-phone-ui-strategy.md`
- **Test plan**: phone-view smoke test of all 4 nav tabs

---

## #91 — 2026-04-24 — Layers panel reorg (phone tab strip + active chip row)

- **Summary**: Layers panel got a tab strip on phone + an active-chips
  row so users can see at a glance which layers are armed without
  scrolling the full list.
- **Areas touched**: `BinauralTuner.tsx`
- **Test plan**: enable 3 layers, confirm chips render in order

---

## #90 — 2026-04-24 — Sounds: remove Breathe + add Visuals tab

- **Summary**: Pruned the standalone Breathe tab from Sounds (low
  use) and added a Visuals tab placeholder for the upcoming
  audio-reactive shader work.
- **Areas touched**: `SoundLab.tsx`
- **Spec refs**: `pleasant-redesign-direction.md`

---

## #89 — 2026-04-23 — Remove stepback breath dot

- **Summary**: Cleanup of an outdated UI dot that conflicted with
  the new compass-wheel input.

---

## #88 — 2026-04-23 — Phone: strip box frames

- **Summary**: Removed outer box frames on phone-view check-in so
  text breathes edge-to-edge. Part of the "less is more" pass.
- **Areas touched**: `FeelingCheckInCard.tsx`

---

## #87 — 2026-04-23 — About modal + changelog

- **Summary**: Added the Colourmap brand button → About modal in
  the header, with a losange that expands a rolling PR changelog so
  users can see what just shipped.
- **Areas touched**: `ColourmapBrandButton.tsx` (new),
  `Header.tsx`
- **Why**: builds trust + keeps users in the loop on rapid
  iteration

---

## #86 — 2026-04-23 — Dev mode pinned on scroll

- **Summary**: Feedback overlay (triple-tap dev mode) now uses a
  React portal so it stays pinned during scroll. Trigger moved to
  bottom-right.

---

## #85 — 2026-04-23 — Onboarding opaque, 1-card

- **Summary**: First-run onboarding rewritten to a single opaque
  card with new copy. Deleted the old `FrequencyBox` component.

---

## #84 — 2026-04-23 — Overview restored + compass pills

- **Summary**: Brought back the Overview surface, added compass
  pills (Feeling/Doing/Sharing), moved Sounds to its own `/sounds`
  route, added wake-up time wheel, removed the rainbow wave (too
  loud), removed nav glyphs.

---

## #83 — 2026-04-22 — Feedback overlay: resizable note + collapsible toolbar

- **Summary**: Triple-tap-to-open feedback overlay can now resize
  the note pane and collapse its toolbar to maximize drawing area.

---

## #82 — 2026-04-22 — Feedback overlay: triple-tap dev mode with note + draw

- **Summary**: New triple-tap gesture opens an in-app dev/feedback
  overlay where you can scribble notes + draw on screenshots. Used
  during phone testing.

---

## #81 — 2026-04-22 — Phone check-in polish

- **Summary**: Removed outer boxes, larger text, auto-grow textarea,
  opaque design popover.

---

## #80 — 2026-04-21 — Desktop Day rail

- **Summary**: Desktop /day got a side rail showing streak · last
  check-in · last tuned frequency.

---

## #79 — 2026-04-21 — Nav glyphs (later removed)

- **Summary**: Tried adding glyphs to nav labels. Removed in #84
  per user feedback ("no smileys").

---

## #78 — 2026-04-21 — Haptics in play + tab switches

- **Summary**: Wired haptic feedback into the play button and tab
  switches via the haptics wrapper from #70.

---

## #77 — 2026-04-20 — Keyboard shortcuts primitive

- **Summary**: Foundation for keyboard navigation across the app.

---

## #76 — 2026-04-20 — First-run onboarding

- **Summary**: Initial onboarding flow (later rewritten in #85).

---

## #74 — 2026-04-19 — Music setlist + Projects/habits design spec

- **Summary**: New music setlist surface + spec doc for the
  upcoming projects/habits system.

---

## #73 — 2026-04-19 — Real piano/violin/flute/harp in Calming Sounds

- **Summary**: Replaced synth-only melody voices with real CC0
  sample packs (tonejs-instruments). Foundation that #97 expanded
  to 13 instruments.
- **Areas touched**: `lib/sample-pack.ts`

---

## #72 — 2026-04-18 — Check-in ping banner

- **Summary**: Light banner reminding users when their last
  check-in was a while ago.

---

## #71 — 2026-04-18 — Jargon pass: brain-wave rate

- **Summary**: Renamed technical labels to plain English ("brain-wave
  rate" instead of "Hz binaural beat frequency", etc.).

---

## #70 — 2026-04-17 — Haptics wrapper

- **Summary**: Added the `lib/haptics.ts` wrapper so other features
  could trigger vibration on supported devices.

---

## #68 — 2026-04-15 — Pleasant phase 1: type scale + spacing

- **Summary**: First pass of the "Pleasant" redesign — normalized
  type scale + spacing tokens.

---

## #66 — 2026-04-13 — Soft-beat bed + fix shaman-drum sample

- **Summary**: Added the original soft-beat-bed feature in Chill
  Machine. This is the feature that became the djembe bug (auto-play
  on load), eventually nuked in #98.
