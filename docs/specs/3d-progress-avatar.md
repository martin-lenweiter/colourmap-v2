# 3D Progress Avatar — Golden God & Kid Lotus

**Status:** Spec + partial scaffold
**Date:** 2026-05-23
**Lives in:** Progress page (eventually) + GeometryField (geometry presets)

The Progress page deserves a personal 3D centerpiece. Two assets the user already owns become the seed for this:

- **Golden God** — a four-armed digital deity standing on a reflective gold sphere with cloud reflections, plus two disembodied reaching arms. Symbolically perfect for the platform vision ([[project_platform_vision]]): the four arms map onto Share / Connect / Elevate / + one, the sphere echoes the collective layer, the pixelated face says "digital world."
- **Kid Lotus** — a small child in lotus pose. Meant as a meditation/stillness avatar. Ships already exported as OBJ, ready to drop in.

## Long-term vision

The 3D figure on the Progress page is not decoration. It is a living character whose form responds to your data:

- Default render is solid metallic gold, slow rotation, slight breathing animation.
- A toggle / preset switcher offers other materials: holographic transmission, dot-of-stars surface, full glass, all-shadow silhouette.
- A *Kid Lotus* mode for meditation/wellbeing moments — calmer color, slower breath.
- A *Golden God* mode for high-energy / vision moments — bright, sharp, multi-armed.
- The same meshes power **GeometryField presets** ("Golden God", "Kid Lotus") where the body's surface is sampled as ~30k particles — stars that form the figure.

The Progress avatar and the geometry preset are the same character seen two ways: solid metal vs. living constellation.

## Asset paths

The .obj/.glb files live in `public/models/`. Web-accessible, no auth.

- `public/models/kid-lotus.obj` — the meditation child (source: `OneDrive/.../BLENDER/PROJECTS/OBJECTS/kidlotus.smooth_OBJ.obj`)
- `public/models/golden-god.glb` — the four-armed figure. Not yet present; pending Blender export (see Blocker below).

## Blender blocker for Golden God

The user's `.blend` files for the Golden God series (`GOLDEN TWEAK 1`–`5`, `GOLDENMAN`, `2 arms simplified`) were saved in 2021 with **Blender 3.x or 4.x**. Two Blender versions are installed on the machine but neither can open these files:

- **Blender 5.1** (2026): refuses the file format. Blender 5.x dropped support for `.blend` files older than ~Blender 3.0.
- **Blender 2.93** (2021): also refuses. The files were saved with a version *newer* than 2.93.

**To unblock:** install **Blender 4.5 LTS** from `blender.org/download/lts/4-5/`. 4.5 LTS reads 2021 files cleanly and exports glTF 2.0 fine. After install:

1. File → Open → select e.g. `GOLDEN TWEAK 4   DOUBLE  .blend`
2. Confirm the file renders the figure you expect
3. File → Export → glTF 2.0
4. Save as `C:\Users\victor\colourmap-v2\public\models\golden-god.glb`
5. Settings: `Format: glTF Binary (.glb)`, `Include: Selected Objects` (after selecting the mesh in the viewport), `Transform: +Y up`, `Geometry: Apply Modifiers ON`

The code path in `components/GoldenGod.tsx` already expects this file; once present, the app picks it up on next refresh.

## OneDrive note

The `.obj` and `.blend` files live in OneDrive and are currently cloud-only placeholders ("the cloud file provider is not running"). To make them accessible locally, in File Explorer right-click each file → **Always keep on this device**. Then the file becomes a real local file and the build can copy it.

## Visual treatments

Three materials worth exposing:

1. **Metallic Gold** (default for Progress avatar). Three.js `MeshStandardMaterial` with `metalness: 1.0, roughness: 0.18, color: 0xE0A040, envMap: <studio-hdr-or-procedural>`.
2. **Hologram**. `MeshPhysicalMaterial` with `transmission: 1.0, thickness: 0.5, ior: 1.4, roughness: 0.1`, plus a low-volume bloom pass.
3. **Dot-of-Stars** (geometry preset mode). Sample the mesh surface using `THREE.MeshSurfaceSampler` to produce ~30000 points. Render with `THREE.Points` and a `PointsMaterial` (small soft white circles with a gentle additive blend). Particles can drift slowly along normals to feel alive.

## Two surfaces, two roles

| Surface | What it does | Asset |
|---|---|---|
| Progress page hero | Solid 3D character, slow rotation, breathing pulse, material switch | `golden-god.glb` or `kid-lotus.obj` |
| GeometryField preset | Particles forming the same shape, drifting & pulsing with music/touch | Same meshes, sampled as points |

Both surfaces share the same loader so a single GLB/OBJ swap updates the whole system.

## GeometryField preset plan

Two new presets added under a "Form" category (or similar):

- **Kid Lotus** — meditation, calm. Particles arranged on the lotus-pose mesh's surface. Breathing pulse tied to slow sinusoid. White / soft cream palette.
- **Golden God** — high energy. Same machinery, sampled from the 4-armed mesh. Warm gold palette. Particles drift outward then return — a digital deity breathing.

Both leverage the existing `dotmode`-style particle infrastructure in `components/GeometryField.tsx`. The new code is just: load mesh → sample surface → feed points into a `THREE.Points` cloud that GeometryField already knows how to animate.

## Effort estimate (refined)

| Piece | Effort | Status |
|---|---|---|
| Kid Lotus OBJ → public/models | 10 min | blocked by OneDrive cloud placeholder; user action needed |
| Kid Lotus loader + Progress avatar component | 2–3 hours | code ready when asset lands |
| Kid Lotus dot-of-stars preset in GeometryField | 4–6 hours | mesh sampler logic + integration with existing dotmode |
| Golden God .blend → GLB | 30 min | blocked by Blender 4.5 LTS install |
| Golden God loader + Progress avatar variant | 1 hour | same loader as Kid Lotus once GLB exists |
| Golden God dot-of-stars preset | 2 hours | reuse sampler from Kid Lotus |
| Texture/material switcher UI | 3 hours | metallic / hologram / dots |

Total once unblocked: roughly **1.5–2 days** of focused work to ship both characters across both surfaces.

## What is built right now

- `public/models/` directory created
- Loader infrastructure (when added): `lib/three-asset-loader.ts` handles `.obj` and `.glb` cleanly with caching
- Spec captured here so the work resumes cleanly after the assets land

## Open questions for the user

1. Which of the GOLDEN TWEAK / GOLDENMAN files is the canonical Golden God from the reference image? Likely `GOLDEN TWEAK 4   DOUBLE` or `GOLDEN TWEAK 5   BACK TO BACK` based on the image's multi-arm structure, but only the user can confirm.
2. Should the Progress page avatar default to Kid Lotus (calm) or Golden God (high energy), or react to recent emotional check-ins?
3. Should the texture switcher live on Progress, in a settings panel, or only inside the geometry preset?
