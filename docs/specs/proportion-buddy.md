# Proportion Buddy

**Status:** V1
**Lives in:** Art / Colourmap title menu

Proportion Buddy is a practical sculptor's reference tool. It helps the user compare a sculpture in
progress against a reference image by overlaying a centimeter grid, named guide lines, and a simple
crop system.

## Purpose

The user is sculpting a bust/figure and needs to see where key body landmarks should land in real
measurements. The tool should make proportions visible quickly without becoming a 3D modelling app.

Current sculpture reference:

- Base = `0cm`
- Bottom of arms = `18cm` from base
- Head/top zone = `82-84cm` from base
- The provided cropped bust image should work immediately without requiring more crop cleanup.
- The workbench can hold multiple references for the same sculpture proportion map. The current set is
  `Image 1`, `Image 2`, and `Image 3`.
- `Image 2` and `Image 3` are bundled reference photos. `Image 1` can be uploaded/replaced by the user.

## V1 Behavior

- Route: `/proportion-buddy`.
- The Colourmap title menu includes a `Proportion Buddy` shortcut.
- User can upload an image from the browser.
- User can switch between `Image 1`, `Image 2`, and `Image 3`.
- Each image keeps its own crop and base-lower adjustment.
- Uploaded image is stored locally so a reload keeps the current workbench.
- Crop controls adjust top and bottom crop percentages.
- The image surface shows:
  - horizontal centimeter grid
  - centerline and vertical thirds
  - base line
  - bottom-of-arms line
  - elbow-center line
  - shirt-opening line
  - head-base line
  - head low/high band
  - editable total height and guide measurements
  - user-written custom landmarks that can be named, measured, toggled, edited, and removed
  - optional guide-shape modes: plain lines, X diagonals, or a triangle/centerline scaffold
- The side panel calculates reusable comparative proportions:
  - each landmark as a percentage of total sculpture height
  - each landmark as a `1:x` ratio against total height
  - useful segment lengths such as head size, arms-to-shirt, and shirt-to-head-base
  - user-written landmarks alongside the fixed defaults
- AI suggestions mode is a clickable helper mode. In V1 it calculates structured proportion-deciphering
  guidance from the active image profile, the project measurements, the base-lower offset, and the named
  landmark sequence. It should not pretend to detect anatomy or run computer vision until a real
  image-analysis pipeline exists.
- AI suggestions differ by active image. Image 2 and Image 3 can reuse the same intelligence because they
  are visually close; Image 1 gets its own working-reference guidance.
- Defaults are set for the current sculpture project:
  - total height `84`
  - arms bottom `17`
  - elbow center `27`
  - shirt opening V `48`
  - visible armpits `41`
  - arms crossing top `34`
  - arms crossing bottom `24`
  - bottom chin `60`
  - head base `62`
  - head low `82`
  - head high `84`
  - top crop `0`
  - bottom crop `100`
  - `Image 2` and `Image 3` use a small base-lower nudge because their photographed plinth/base may sit
    slightly above the imagined sculpture base.

## Interaction

- Controls must stay compact and legible on phone.
- The reference stage should be the first visual signal.
- Sliders and number inputs update the overlay immediately.
- Writing a landmark name and centimeter value adds it to the overlay and persists it locally.
- Landmark checkboxes hide/show individual guides without deleting their measurements.
- Image tabs switch the displayed reference while preserving the shared proportion map.
- Base-lower lets the user imagine the measurement base slightly below the visible photo when the crop is
  not perfectly proportional to the sculpture base.
- AI suggestions mode calculates which anchors to compare across all images: bottom of arms, head zone,
  chin, shirt opening V, visible armpits, arms crossing top, arms crossing bottom, and elbow center.
- Shape mode helps compare large silhouette proportions without replacing the centimeter lines:
  - `Lines` keeps only grid and horizontal landmark guides.
  - `X` adds diagonal comparison lines across the reference.
  - `Triangle` adds a broad base-to-head triangular scaffold and centerline.
- Reset restores the sculpture defaults, not empty generic defaults.
- Clear removes the current image only.

## Done When

- A user can upload the provided cropped image and immediately see the figure with proportional
  guides.
- The `17cm` arm-bottom guide and `82-84cm` head zone are visible over the cropped reference.
- The user can switch between Image 1, Image 2, and Image 3.
- The user can add a custom landmark such as `shirt split`, reload, and keep the saved line.
- The user can toggle default and custom landmarks independently.
- The user can switch to X or triangle guide mode for broader proportion checking.
- The tool works on phone and desktop without horizontal overflow.
- The title menu links to `/proportion-buddy`.

## Later: Proportion Board

The provided multi-panel proportion graphic is a strong direction for a later output mode. It should
not replace the live workbench. Instead, once measurements are tuned, Proportion Buddy can generate a
readable board with:

- a large front-view reference with labelled landmark lines
- a vertical-proportions table
- a head-proportions panel using chin-to-skull as one head unit
- side-view proportions when side images are available
- key comparisons such as shoulder width, chest width, base width, and head depth
- quick checks and a compact summary

This board is useful for printing, sharing, or keeping beside the sculpture. The live V1 stays simpler:
upload, crop, grid, landmarks, and reusable ratios.
