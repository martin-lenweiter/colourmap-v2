# Festival Visuals — Backlog (Reconnect, Gstaad)

**Status:** Living backlog from the live design session (2026-06). Captures every
idea so none are lost; build in priority order. Surfaces involved:
- **Geometry builder** — `components/GeometryField.tsx`, route `/geometry-field`
- **Figures viewer** — `app/(app)/figures/page.tsx`, GLB models in `/public/models/`

---

## 0. DONE — in PR #213 (`feature/festival-journeys`)
- Three 20-minute looping journeys: **Cathedral of Light**, **Cosmos Drift**,
  **Desert Temple**. Spec: `festival-visual-journeys.md`.
- **Journey tab made reachable** — it had no tab button; added a "Journeys" pill.
- **Journey picker wraps** instead of hidden horizontal scroll (only the first
  pill was visible before). *(both UI fixes pending commit until visually confirmed)*

---

## 1. Rotation on/off toggle — CONCRETE, ready to build
3D modes auto-spin in the render loop (`GeometryField.tsx:16824`,
`l3dRotRef.current.y += 0.003`, gated only by drag + motion mode). Add an
independent **rotate on/off** toggle so the figure can sit still while still
breathing/animating (distinct from the existing Animate/Static motion mode,
which freezes *all* time).
- New `rotate3d` state + ref; gate the auto-spin on it; toggle pill in builder.
- Default: **on** (keep current behaviour) unless STATIC Series overrides it.

## 2. Appearance defaults + colour control — NEEDS DECISION
Requested defaults: **glow 0.5**, **light 35**, **saturation 70**, "that **orange**
colour next to the white and blue".
- `glow` exists (0–10 slider; it drives colour saturation/rainbow per
  `GeometryField.tsx:8494`). glow 0.5 = nearly monochrome palette colour. ✅ maps.
- **No** global Hue / Saturation / Lightness / colour-swatch control exists.
  "light 35 / saturation 70 / orange-near-white-and-blue" implies one.
- **Open decision:** either (a) **build Hue + Saturation + Lightness sliders**
  (a global colour override on top of the palette), defaulting to orange hue /
  sat 70 / light 35 / glow 0.5; or (b) the user is pointing at an existing
  **palette swatch** (screenshot needed). (a) is a sizeable, cross-cutting change
  because 137 modes compute their own colours today.

## 3. STATIC Series — NEEDS DECISION
A meditative counterpart to Desert Temple: figures (**Buddha Boy**,
**Golden God**) **enter into the starfield / 3D geometry**, in **still mode** —
**no rotation, no BPM/sound vibration** — on the calm palette from §2.
- Existing hooks: `buddhaboycurrents` mode; `walkingfigure`; the dance system
  (`danceMove`, `danceBpm`, `danceAmount`) — set `danceMove: 'still'` and don't
  feed audio to remove BPM vibration; rotation off from §1; high `stars`.
- **Open decisions:**
  - **"Golden God"** — is it an existing builder mode, or the **Golden God OBJ
    asset** the user owns (with Kid Lotus / Spirit) that needs importing into the
    geometry field? (Import is a much bigger job than a preset.)
  - Ship as new **Journeys** (timed programs) or new **Presets** (single looks)?
  - Confirm the figure roster and entry behaviour ("enter into stars").

## 4. Animated soldier — dance "one way or the other" — NEEDS DECISION
The soldier is a GLB on the **Figures** page (`ANIMATED_FIGURES`,
`/models/soldier.glb`), separate from the geometry builder.
- "Dance one way or the other" → play/select among the model's baked animation
  clips, and/or mirror it left/right.
- **Open decisions:** which clips does `soldier.glb` contain? Is "dance" a clip
  that exists, or does the model need new animation? Should the figure also
  appear *inside* the geometry starfield (ties to §3), or stay on the Figures page?

## 5. Phone-mic sound input — DIRECTION CHOSEN (single-device)
Use one device's microphone for sound-reactivity (simplest; removes the
two-machine control→projection journey sync entirely — that change is on hold).
- **Gotcha:** `getUserMedia` only works on **HTTPS or `localhost`**. A phone
  hitting the laptop's `http://<LAN-ip>:3000` will be denied the mic. Phone-mic
  therefore requires the **deployed HTTPS** build, or running on the phone's own
  localhost. Laptop-into-projector works locally right now.

---

## Suggested build order
1. Commit the §0 journey-visibility fixes (festival-critical). ← do first
2. §1 rotation toggle (small, unblocks STATIC Series).
3. Decide §2 colour approach → implement.
4. §3 STATIC Series presets/journeys on top of §1+§2.
5. §4 soldier dance.

---

## Builder curation log

Festival prep trimmed the builder's preset/mode surface and made it more
readable:

- **Enlarged index numbers** across the builder — preset (9→13px), mode
  (8→11px), and journey-phase (9→12px) numbers, at higher opacity.
- **Removed from the builder tab row:** Arena and Figure Stars pills.
- **Removed from FEATURED_PRESETS:** Mode Sun (registry kept — used by
  ArchetypeBridge / BuildLab), Deep Gaze (fully removed), Line Tunnel 3D,
  Walking Figure (#40), presets 4–8 (Buddha Boy Currents, Scriptures,
  Vertical Scriptures, Eclipse, Yin Yang), and Brain Topography.
- **Atomic Explosion toned down** — glow 8.2→5, luminous 4.2→2.8, intensity
  9.4→7, so it reads as fine points rather than big blown-out dots, matching
  the other presets' light. Kept in the featured list.
- **Trip Number 4** (journey id 15) — a ~8-minute looping trip combining
  Prism Bloom, Prism3D Core, Ocean Drift, Cyclone Tiles and Dot Heart, enriched
  with kaleidoscope blends, a storm-attractor surge and a crazy burst, looping
  seamlessly back to the opening prism.

- **No lines below the dot walkers** — removed the walker trail lines from
  `buildDotWalker` (for the base walker they rendered as a ground line under
  the feet).
- **Trip Number 5** (journey id 16) — the dot-walker loop. All `dotwalker`,
  sweeping `symmetry` (1–5 = the five walker shapes) and toggling `stars`
  (1↔3 = solo/trio): each walker enters solo, blends to three, then morphs to
  the next shape; ~7.5-minute seamless loop. (Walker shape = `cfg.symmetry`,
  count = `cfg.stars`, so the existing journey engine drives it directly.)
- **Trip Number 1** (journey id 17) — the golden trip developed into a smooth
  ~9.5-minute loop: `tripnumber1` spine with new elements between (swirl-dot
  tunnel, Fibonacci drift, golden mandala, alchemical sun, orbital calm), long
  stages for gentle transitions, looping back to the opening trip.
- **Trip Number 3** (journey id 18) — the triangle trip with more
  transformations: `tripnumber3` gates evolving through yantra-3D, hypercube,
  prism core, chaos triangles, a line temple and kaleido-yantra; ~7.5-minute
  seamless loop.
- **Long Trip** (journey id 19) — the whole set woven into one ~15-minute loop:
  golden trip → swirl → Fibonacci → prism → ocean → triangle/yantra/hypercube/
  line-temple → dot-walkers (solo + trio) → dot heart → crazy burst → desert
  drop → dust vortex → home. Kept *in addition* to the individual trips.

### Trip fixes
- **`linetunnel3d` removed from all journeys** (it wasn't rendering): "Desert
  Cut" → `swirldottunnel`, "Line Temple" → `tknot3d` (renamed "Knot Temple").
  Still present as a registry preset + mode-picker button.
- **Violet-Portal "Crazy Burst" removed** from Trip 4 and Long Trip.
- **Trip Number 2 (drop pulse) slowed** — preset default `breathSpeed` 1.18 →
  0.20, and a dedicated `tripnumber2` speed slider capped to **0.10–0.30**
  (the default 0.05–1.5 ran far too fast).
- **Finger distortion now affects the pulse rings** (`updatePulse`) for both
  `pulse` and `tripnumber2`.

### Curation + new trips (session 2)
- **Removed from FEATURED_PRESETS:** Chrysalis Rings, and featured #57–63
  (Music Entropy, Music Nebula, Groove Lattice, Nebula Veil, Nebula Bloom,
  Dot Galaxy, Emotion Field).
- **Cathedral Glass + Prism Seed** moved up next to the Prism family.
- **Yantra Colour** toned down (glow 7→4, intensity 9→6) — too bright on open.
- **Swirl Dot Tunnel** vanish point pushed planet-size: "Vanish Point" slider
  max 10→20, preset glow→20, forward speed default 0.68→0.13.
- **New journeys:** Trip Number 6 (id 20, 4D-crystal evolution), Trip Number 7
  (id 21, orbital/torus/rose/helix line weave), Mega Trip (id 22, sacred
  psychedelia: dots→orbits→cells→prism→glass→mandala), Magnetic Sands (id 23,
  continuous current-texture trip — scales, cyclones, eddies, gravity,
  revolutions). All slow, continuous, seamlessly looping.

### Deep work (mode-level)
- **Atomic Explosion dots — DONE.** It's a canvas-2D mode; the dots were flat
  1px discs. Now drawn as a soft radial-gradient sprite with additive
  (`lighter`) blending, sized by `luminous` — luminous like the Three.js point
  modes.
- **Swirl Dot Tunnel transformative pass — DONE (first pass).** `swirldottunnel`
  now has magnetic-sand scale banding (a drifting radial pattern) and a gravity
  element orbiting on an ellipse that nearby dots swirl around — so it evolves
  and loops. Vanish point already pushed planet-size (glow→20).
- **`flowfield` continuous-transformation mode — NEXT (the big build).** A new
  mode with persistent velocity-carrying particles, elliptical revolutions
  around moving gravity wells, scale patterns, and an internal slow phase that
  drifts through movements (calm → vortex → scales → bloom → return) so a single
  preset transforms continuously for 10+ min. Mic-reactive. ~200–400 lines.

### Pending clarification
- **Random Pulse → bottom** — no "Random Pulse" featured entry exists; confirm
  whether this means "Random Burst" or "Chaos Pulse".
