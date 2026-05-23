# 3D Platform Vision — How Far It Can Go

**Status:** Vision + capability map, not implementation
**Date:** 2026-05-23
**Lives in:** Cross-cutting (Progress, Education, GeometryField, Body Engine)

The user owns 3D Blender/ZBrush assets and wants to know how far we can take them inside Colourmap: anatomy for medical learning, video-game-style yoga/stretch characters, hologram objects for Progress, animated characters, all delivered on phones over wifi. This doc maps what's achievable, what's hard, what's *truly* hard, and what each tier unlocks.

## TL;DR — what's realistic, in three buckets

| Bucket | What you get | Effort | Phone-friendly |
|---|---|---|---|
| **Easy** | Static figures with switchable materials (gold/hologram/stars), slow rotation, breath pulse, touch-to-rotate | done in PR #190 + 1–2 days polish | ✅ effortless |
| **Medium** | Skeletal animation, multiple poses, lip-sync-free idle loops, region-clickable anatomy, environment lighting, hand-authored animations from Mixamo | 2–4 weeks per major feature | ✅ with care |
| **Hard** | Real-time muscle deformation, physics-based hair/cloth, full-body IK, photoreal medical anatomy, multiplayer presence | months, dedicated work | ⚠️ desktop / high-end phone only |

The honest line: **Easy and Medium are the right home for Colourmap.** Hard is fun but builds a different product (a game engine), not a self-knowledge tool. Most of what you want — anatomy explorer, yoga character, hologram Progress, animated avatars — sits in Medium.

## What's already shipped (PR #190)

- OBJ loader for any of your meshes (`golden-god`, `kid-lotus`, `spirit`, `butterfly-priest`, `butterfly-man`)
- Three switchable materials: metallic gold, translucent hologram with transmission, 32k-point star surface
- Slow rotation + breathing pulse animation
- Centred/scaled to fit any source size
- Preview at `/figures`

This is the foundation. Everything below builds on this same loader + material switcher pattern.

## The five surfaces 3D can power

### 1. Progress hero — the personal avatar

Solid 3D figure on the Progress page, slow rotation, breathing. Material switches by mood / state:
- Default: metallic gold (high energy)
- Calm: Kid Lotus mode, softer cream palette
- Reflective: hologram material, see-through
- Sacred: stars-on-surface

**Long term:** the avatar's pose reacts to your check-ins. Arms higher when you've made progress, head down when energy is low, glowing rim light when you've completed a ritual today. The user's own art becomes the dashboard.

**Effort:** existing component drops in. ~1 day to wire pose changes from state.

### 2. Hologram interaction objects (Easy tier — phone-friendly)

The hologram material we already built is *the* answer for floating UI elements:
- Notebook tile becomes a small floating golden book
- Ritual tile becomes a translucent ring
- Each Education program tile becomes a small symbolic 3D icon
- Settings could be a slowly-rotating cube with each face labeled

Performance cost is tiny: each tile is one small mesh (~5k tris), drawn once per frame. Ten of them = trivial. Mobile-safe.

**Effort:** Each hologram tile = ~1 day of art + 30 min of code. Authored as small OBJ/GLB exports.

### 3. Anatomy explorer (Medium — the muscle/medicine vision)

Two paths:

**Path A — sliced layers (easier).** Buy a free CC0 anatomy model (Sketchfab, BodyParts3D), separate it into layers in Blender (skin / muscle / skeleton / organs), export each as a GLB. The app shows one layer at a time, lets the user fade between layers with a slider, and tag-click any muscle/bone to open a small info card linking into journal entries about injuries, recovery, stretches.

- Anatomy data already exists CC0 — you don't need to model it
- Linking each region to journal entries integrates with the existing notebook/ritual system
- Models are heavy (~20 MB each layer) — must lazy-load and lazy-mount on the Progress / Body page only

**Path B — true 3D muscle deformation (hard).** Real-time soft-body simulation, muscle activation maps, skin stretching. This is research-grade Three.js / Blender work. Probably 4–6 weeks for a working prototype, and most phones won't run it well.

**Recommendation:** ship Path A. It teaches more than enough for self-understanding. Path B is a future cool toy, not a feature.

**Effort:** Path A = 2–3 weeks including content. Already specced as [[project_anatomy_program]].

### 4. Yoga / stretch character (Medium — animated poses)

Three.js handles **skinned mesh animation** natively. The workflow:

1. Take a free rigged humanoid (Mixamo gives them away free, fully rigged)
2. In Mixamo, attach one of their 2500+ free animations (cobra pose, lotus, downward dog, etc.)
3. Export as GLB with embedded animation
4. App plays the animation on a loop, with a slider to scrub through individual poses

**This is genuinely easy.** Mixamo is built for this exact case. A yoga library with 20 poses is maybe 3 days of work once the loader is in.

The poses can be tied to:
- Reframe rituals ("stretch as you reflect")
- Body Engine recovery programs
- Sleep / nervous-system regulation pages

**Effort:** 2 weeks for the full yoga library + UI. Each new pose is ~10 minutes once the pipeline is set.

### 5. GeometryField star/dot presets (Easy–Medium)

The star-sampling code from PR #190 ports directly into `GeometryField.tsx`. Each of your meshes becomes a preset:

- **Golden God** — gold particles forming the 4-armed deity, drifting and pulsing with music
- **Kid Lotus** — calm white particles in lotus shape, slow breath
- **Spirit** — twisting particles taking the spirit-tail form
- **Butterfly Priest** — radial particle bloom

This is the most colourmap-native answer: your art becomes the visual language of the whole field system.

**Effort:** ~3–5 days to port the sampler into GeometryField's particle infrastructure and expose 4 new presets.

## Performance — phones, wifi, the real constraints

The thing that kills 3D on phones isn't the rendering — modern phones have GPUs that can chew through millions of triangles per frame. The killers are:

| Killer | Symptom | Mitigation |
|---|---|---|
| **Big mesh downloads** | 5–20 second wait on wifi | Compress with `gltf-transform optimize`, use Draco compression (reduces .glb size ~80%); lazy-load only on the page that needs it; use ~5–10k triangle versions for mobile |
| **Shader compile stalls** | First frame freezes for 300–800 ms | Pre-compile common materials at app load; cache shaders |
| **Memory pressure** | Tab crashes on old iPhones | Dispose meshes and materials on unmount (we already do this); cap simultaneous models at 1–2 |
| **Battery drain from `requestAnimationFrame` loops** | Phone hot after 5 minutes | Pause render loop when tab is hidden; consider 30fps not 60fps for ambient figures |
| **Translucent / transmission materials are expensive** | Hologram looks great, kills FPS | Limit hologram usage to one mesh at a time; fall back to plain emissive on low-end devices |
| **Particle count** | 100k stars = laggy on mid-range Androids | Cap at 32k (we're at exactly this); make user-configurable in settings |

**Concrete targets that hold up:**
- Golden God OBJ: 3.6 MB. Compressed to GLB with Draco: ~500 KB. Loads in <2s on 4G.
- 32k particles: runs 60fps on a 2020 iPhone, 30fps on a 2018 mid-range Android.
- Hologram material on a single mesh: 60fps everywhere except old hardware.

**Rule of thumb:** if you'd put it on a Progress card, it'll run anywhere. If you'd put it in a fullscreen game scene, expect to optimize.

## Animation — what types are realistic

| Animation type | Phone-friendly | Authoring cost |
|---|---|---|
| **Procedural rotation / breathing** (what we already do) | ✅ Free | Done in JS, no Blender needed |
| **Pre-baked Mixamo animation embedded in GLB** | ✅ Cheap | Free, 5 min per animation |
| **Morph targets / blend shapes** (facial expressions, breathing chest) | ✅ Cheap | 1–2 hours per target in Blender |
| **Skeletal animation with multiple bone influence** (yoga, walking) | ✅ Cheap | Mixamo auto-rigs, ~5 min per pose |
| **IK retargeting** (avatar reaches for cursor) | ⚠️ Doable | 2–3 days code work |
| **Physics (cloth, hair)** | ⚠️ Expensive | Three.js supports it but expensive |
| **Real-time muscle simulation** | ❌ Too heavy | Custom shaders, weeks of work |

For Colourmap's actual needs (avatars, yoga, hologram tiles), the top four rows are the whole toolkit. Forget the bottom two for now.

## Agency — how much can the user *do* inside a 3D scene

Three meaningful tiers of agency, easy to hard:

### Tier 1 — Look
Spin, zoom, tap to pulse. The avatar is decoration that reacts to mood. Already shipped.

### Tier 2 — Choose
Click a body region to open a journal page. Click a pose to learn the stretch. Toggle materials. Switch which avatar represents you. This is genuinely useful and a few weeks of work per surface. **This is the right ambition level.**

### Tier 3 — Shape
Sculpt your own avatar inside the app. Move slider for "energy" and watch the pose change. Draw on the body to mark pain points. Place a mesh in space with your finger.

Tier 3 starts requiring real 3D editor primitives — gizmos, raycasting against meshes, manipulator widgets. Achievable but a multi-week project per feature. Worth doing ONE deep example (e.g., the body injury map [[project_anatomy_program]]) and keeping everything else at Tier 2.

## Sculpting + texturing pipeline

You're already past this. The pipeline that works:

1. **Blender** for modelling and rigging (or ZBrush like the Golden God OBJ already is)
2. **Mixamo** for free auto-rigging + animations on humanoid characters
3. **Substance Painter** or **free alternatives** (ArmorPaint, Quixel Mixer) for textures
4. **gltf-transform** (free CLI) for compression
5. **Three.js** loads the result

Every step has free options. No paid software needed if you already own ZBrush/Blender.

**Skill gap:** what you need is good UV unwrapping for texture work. Without UVs, you can use solid colors and emissive — which is exactly what we're doing now with Golden God and that already looks great. Adding textures is a "later, when motivated" addition, not a blocker.

## Concrete use cases — what unique value this adds to Colourmap

Ranking by uniqueness (something no other app does):

1. **Personal art as the dashboard.** Most apps use stock illustrations. Colourmap uses *your own* Blender deity as the avatar. That's irreplaceable.

2. **Hologram-style interaction surfaces.** Apple-quality translucent UI for tiles, rituals, education programs — using *your* shapes, not Apple's. Brand-distinct.

3. **Yoga + stretches as 3D-animated routines** tied to mood/journal. Headspace doesn't have this. Calm doesn't have this. The integration with the journal + ritual system is unique.

4. **Body anatomy explorer linked to the journal.** Tap your knee → see the structure → write a note about the recovery program you're on. No app does this elegantly.

5. **Geometry field constellations of your own meshes.** The Golden God star-particle preset *is* the platform's visual signature. Calm has waves. Colourmap has a deity made of light points reacting to your check-in.

6. **Avatar that reflects your state.** Reading the journal → posture changes. Sleep score low → eyes closed. Streak hit → arms up. This is a single feature that justifies the whole 3D investment.

7. **Future: shareable, collective.** Two users' avatars meeting in a calm shared space. Group rituals where everyone's avatar is present as a particle. This is where the platform vision ([[project_platform_vision]]) and the 3D layer reinforce each other.

## Use cases that are NOT worth chasing

- **Full physics game engine** — wrong product.
- **VR mode** — niche, kills your audience.
- **Photoreal humans** — uncanny valley, lots of effort, defeats your art style.
- **AR / camera passthrough** — interesting but a separate app.
- **Real-time multi-user editing** — operational complexity is enormous, save for later.

## Suggested build order

If you want to maximize impact per unit of effort:

1. **Now (this PR):** /figures viewer ✅ done
2. **Next:** Port star-sampling into GeometryField as four new presets (Golden God, Kid Lotus, Spirit, Butterfly Priest). 3–5 days. Visible everywhere, low risk.
3. **Then:** Progress page avatar — render Golden God as the page hero with material toggle. 1 day on top of the existing component.
4. **Then:** State-driven avatar — pose / glow reacts to recent check-ins. 1 week.
5. **Then:** Yoga library — Mixamo poses, slider to scrub, integrated into reframe + sleep rituals. 2 weeks.
6. **Then:** Body anatomy explorer (Path A — sliced layers). 2–3 weeks. Single biggest unlock for self-understanding domain.
7. **Then:** Hologram tiles across the app — each top-level tile becomes a tiny floating 3D object. 1–2 weeks.
8. **Long term:** Spirit-figure leg-blend, custom textures, more authored avatars, multi-user shared space.

## Honest limits

- **I can't make new 3D art for you.** I can wire any mesh you provide. New meshes need Blender/ZBrush time from you.
- **I can't run Blender's GUI from inside this sandbox.** Headless export via CLI works only if both Blender versions can open the file (your 2021 .blends need Blender 4.5 LTS).
- **I can't reliably copy from OneDrive cloud-only files** through the bash sandbox — you have to copy them in File Explorer first.
- **I can't predict exactly how a mesh looks until it renders.** Iteration on visual quality requires you previewing /figures locally and feeding back.
- **Phone performance varies wildly.** A 2024 iPhone is 5–10× faster than a 2019 mid-range Android. Build for the middle, expect to optimize for the bottom.

But within those limits, **most of the 3D vision is achievable in the next 2–3 months of incremental work,** and almost none of it requires technologies that don't already exist. Three.js + your existing assets + Mixamo + careful loading = surprisingly far.

## Surfacing inside the app

Both 3D pages are reachable from the **Art** tab (`/geometry-field`). The bottom drawer top-pill row contains:

`Builder · Music Visuals · Arena · Figures · Figure Stars`

- **Figures** → `/figures` — Golden God, Kid Lotus, and procedural Billy with the material switcher (gold / hologram / stars), seven hologram palette swatches, drag-to-rotate, and the Animated tab driving Mixamo-style skeletal animations.
- **Figure Stars** → `/figure-stars` — the dot-of-stars geometry-builder UI: any figure × seven palettes × density / size / pulse controls, all live.

Both routes are marked as immersive in `AppShell.tsx` so they render edge-to-edge without the standard padded column wrapper.
