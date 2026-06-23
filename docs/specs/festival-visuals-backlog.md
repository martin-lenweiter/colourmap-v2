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
