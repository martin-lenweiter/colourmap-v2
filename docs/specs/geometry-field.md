# Geometry Field

**Status:** Active creative-lab surface
**Date:** 2026-05-14

Geometry Field is the immersive visual-program surface for sacred geometry, particle currents, self-map forms, and future music-reactive play. It belongs to the Creative Lab visual layer described in `three-app-architecture.md`.

## Current Flow Textures

The Current family uses dot fields to reveal hidden motion patterns before and during touch. Touch should deform the particles directly; it should not add unrelated large center rings that visually compete with the field.

Accepted presets in this family:

- **Ocean Drift**: base current field.
- **Current Scales**: overlapping scale/petal cells with local vortex motion. In Music Visuals, it should behave like the main deep musical immersion machine: drums brighten and pulse dots, bass expands cell movement, pads/keys deepen flow swirl, lead/drum energy can shift colour slightly inside the selected palette, cell geometry can deform on the beat, wing-like lateral expansion can open from the scale field, and ripple finger distortion is available directly from the music panel without adding large centre rings.

Current Scales should expose a few meaningful response scenes rather than dozens of decorative presets:

- **Soft Tide**: quieter pulse and low geometry deformation.
- **Bass Wings**: strong bass movement and lateral wing opening.
- **Liquid Hands**: high flow response with ripple touch as the default.
- **Spark Geometry**: sharper dot pulse, colour accent, and geometric deformation.

Each scene is only a starting point; sliders remain available so the user can hand-shape dot pulse, movement, flow, colour, geometry, and wings.

Current Scales also has a shape morph layer. The same scale field can bend toward:

- **Scales**: original scale/current field.
- **Rings**: three nested donut-like rings.
- **Brain**: folded oval, like a brain or nut seen from above.
- **Heart**: heart-shaped field.
- **Losange**: diamond/losange field.

These shapes must remain driven by the same music response sliders and touch distortion rather than becoming disconnected static presets.
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
- **Starflow Galaxy**: second deep music-visual base after Current Scales. It maps drums to impact, bass to gravity, pads/keys to haze, leads to sparks, and supports galaxy/vortex/eye/tunnel/double shapes with touch distortion.

The strongest music-visual candidates should also be promoted in Geometry Builder's **Good Ones** list so the improvements are not isolated to the Music Visuals tab:

- Current Scales
- Sacred Sin Morph
- Sin Morph
- Chaos Sin Morph
- Drift Field
- Starflow Galaxy

When selected from Music Visuals, these candidates should actually react to music:

- **Sin Morph / Sacred Sin Morph / Chaos Sin Morph**: BPM breathing, bass pressure, drum impact, pad/key depth, and lead sparkle affect the 3D morph surface.
- **Drift Field**: bass spreads the node field, pads/keys thicken connections, drums/lead sharpen node pulses, and the field rotation responds subtly to impact.

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

Music Entropy and Music Nebula should not be purely flat canvas effects. They carry a lightweight 3D dot volume behind the canvas layer so their music response has depth: bass expands the volume, pads/keys lift the z-depth haze, and leads/drums sharpen the dots.

Groove Machine dispatches a `colourmap:groove-visual-step` browser event with per-group energy (`drums`, `bass`, `keys`, `lead`, `pads`). Geometry listens to that event and lets the music presets react when both surfaces are open. If no Groove event is present, the presets use a restrained internal pulse so they still work as standalone visuals.

Future inputs should use the same visual-energy contract: microphone analyser, uploaded recordings, voice notes, concert stems, and eventually external player metadata where platform policy allows it.
