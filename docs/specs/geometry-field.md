# Geometry Field

**Status:** Active creative-lab surface
**Date:** 2026-05-14

Geometry Field is the immersive visual-program surface for sacred geometry, particle currents, self-map forms, and future music-reactive play. It belongs to the Creative Lab visual layer described in `three-app-architecture.md`.

## Current Flow Textures

The Current family uses dot fields to reveal hidden motion patterns before and during touch. Touch should deform the particles directly; it should not add unrelated large center rings that visually compete with the field.

Accepted presets in this family:

- **Ocean Drift**: base current field.
- **Current Scales**: overlapping scale/petal cells with local vortex motion.
- **Cyclone Tiles**: square cells containing alternating cyclones.
- **Eddy Lace**: connected whirlpools and lace-like flow trails.
- **Magnetic Sand**: particles aligning around invisible field poles.

Touch modes supported by this family:

- `ripple`: liquid distortion through the dots.
- `push`: pushes and bends the field.
- `pull`: draws the field inward.
- `light`: highlights local density without changing palette.

## Nebula And Galaxy Presets

Nebula presets are particle-first cosmic fields, not photo backgrounds. They should remain palette-consistent: a selected colour family controls the dust and star glow, without automatic rainbow cycling.

Accepted presets:

- **Nebula Veil**: soft spiral haze with high-star background.
- **Nebula Bloom**: denser bloom-like nebula based on current-field motion.
- **Dot Galaxy**: spiral galaxy made from dots, with dense star support.

## Star Field Behavior

The `Stars` slider is structural, not just additive. Low values create sparse background stars. Higher values should shape a soft diagonal Milky Way band behind the active form.

Rules:

- The Milky Way band uses the active palette colour; it must not introduce multicolour variety by default.
- The band is background atmosphere only and must not overpower the foreground preset.
- Star density changes should feel gradual and continuous as the slider increases.

## Future Direction

Music-reactive variants should be added as explicit presets or modes, not hidden behavior inside every preset. The first shipped seed lives behind the Geometry **Music Visuals** tab, replacing the visible Journey entry for now.

Accepted starter presets:

- **Music Entropy**: a dot-cloud concert surface where drums create local flashes, bass expands the field, and pads thicken the glow.
- **Music Nebula**: a soft nebula and galaxy haze for pads, voice recordings, and ambient layers.
- **Groove Lattice**: tiled currents with small cyclones, intended for sequencer, drum, and bass patterns.

Groove Machine dispatches a `colourmap:groove-visual-step` browser event with per-group energy (`drums`, `bass`, `keys`, `lead`, `pads`). Geometry listens to that event and lets the music presets react when both surfaces are open. If no Groove event is present, the presets use a restrained internal pulse so they still work as standalone visuals.

Future inputs should use the same visual-energy contract: microphone analyser, uploaded recordings, voice notes, concert stems, and eventually external player metadata where platform policy allows it.
