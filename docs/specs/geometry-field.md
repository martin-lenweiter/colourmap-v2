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

Music-reactive variants should be added as explicit future presets or modes, not hidden behavior inside every preset. The first likely music-reactive families are Current Flow Textures, Nebula/Galaxy, and Constellation Fluid.
