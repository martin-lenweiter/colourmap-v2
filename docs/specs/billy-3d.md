# Billy in 3D — pipeline options

**Status:** v1 procedural shipped + spec for production paths
**Date:** 2026-05-23
**Lives in:** Entertainment (Pineapple Planet) + Education tie-ins

Billy is the protagonist of the Pineapple Planet comic — an anthropomorphic golden pineapple with a leafy crown, big cartoon eyes, a wide smile, and white sneakers. Bringing him into 3D unlocks: a 3D Billy appearing on the entertainment hub, animated transitions between comic pages, an interactive Billy companion in the app, and eventually a Billy avatar that walks through the procedurally generated environments.

This doc documents the four realistic paths from cheap-and-fast to production-quality.

## What's already shipped

**Procedural Billy v1** — `components/Billy3D.tsx`. Built from Three.js primitives:
- Ellipsoid body with a CanvasTexture procedurally drawing the diamond pineapple pattern
- Crown of 7 leaf-shaped curled cones in mixed greens
- White spherical eyes with dark pupils, slightly tilted outward
- Worried-tilt eyebrow capsules
- Big arc-of-torus smile with a small teeth strip
- Capsule arms with sphere hands, idle waving animation
- Capsule legs with shoe shapes (white top + dark sole)
- Idle bob + crown sway + arm wave + drag-to-rotate

Visible at `/figures` → Billy tab. Loads instantly (no asset to download — entirely procedural in code).

This is not photoreal, but it is genuinely **recognizable as Billy** and ready to live in the app today. It's the right placeholder until a higher-fidelity version exists.

## Path 1 — Upgrade the procedural version (free, fast)

The current v1 procedural Billy can be improved a lot without leaving Three.js:

- **Add a normal map** to the body for more pineapple bump depth
- **Tilt and curl the leaves more naturally** by displacing vertices along a noise field
- **Better eyes:** add a faint blue iris ring around the pupil, a tiny white highlight dot
- **Mouth animations:** open/close the smile as a morph between two torus arcs
- **Walk cycle:** keyframe arm and leg rotations into a Three.js AnimationClip we author in code
- **Hat / accessories:** add Billy's snack bag, his cup, his backpack as additional primitive groups
- **Multiple expressions:** worried, excited, sleeping, tired — each is just a different set of eyebrow / mouth rotations
- **Costume variants:** desert outfit (scarf, goggles), spice town outfit, etc., matching comic chapters

Effort: 4–8 hours per significant upgrade. Each one is contained.

## Path 2 — AI image-to-3D (cheap-ish, decent quality)

Multiple services turn a single character image into a 3D mesh. Quality is "indie game" or "good cartoon" — not photoreal but recognizable and rigged.

### Meshy AI ([meshy.ai](https://www.meshy.ai))

- **Cost:** $20/month for ~200 generations, $5 for ~30 on the basic tier
- **Workflow:** upload a comic panel of Billy (front-facing, clean background works best), choose "cartoon" style, pick GLB export
- **Output:** GLB with PBR textures, often pre-rigged for Mixamo
- **Time:** ~2 minutes per generation; iterate 5–10 times to get a Billy you like
- **Quality:** very good for stylized characters like Billy. Mid for complex faces.

### Tripo3D ([tripo3d.ai](https://www.tripo3d.ai))

- **Cost:** free tier exists, ~$10/month for higher quality
- **Similar workflow.** Quality often comparable to Meshy. Different aesthetic.

### Tencent Hunyuan3D-2.0 (open source, runs locally if you have a GPU)

- **Cost:** free
- **Requirements:** NVIDIA GPU with ≥12 GB VRAM, Python environment
- **Quality:** comparable to Meshy for cartoon characters
- **Best if:** you have a gaming PC and want unlimited iterations

### Stability AI's Stable Fast 3D (open source)

- **Cost:** free
- **Workflow:** single-image to 3D mesh, very fast (~5s on a modest GPU)
- **Quality:** lower than Meshy but fast iteration

### Recommended Path 2 workflow

1. Take a clean front-facing image of Billy from a comic panel (panel-0.webp works)
2. Crop tight to Billy, plain background, full body visible
3. Upload to **Meshy** (best quality for cartoon style)
4. Generate 5 candidates, pick the best
5. Download as GLB
6. Optional: pass through Mixamo for auto-rigging (free), then animations work
7. Drop into `public/models/billy.glb`
8. The existing `AnimatedFigure` component renders it immediately

Total user time: ~30 minutes including iteration.

## Path 3 — Hand-modeling (best quality)

A skilled 3D artist can model Billy from reference in Blender. Workflow:

1. Gather reference: 3–4 comic panels showing Billy from different angles, plus a turnaround sketch if possible
2. Block out the body, head, leaves with simple primitives in Blender
3. Refine with sculpting + retopology (or just box-model if cartoon style is fine)
4. UV unwrap
5. Paint textures (pineapple pattern, eye details, mouth, shoes)
6. Rig the skeleton (or run through Mixamo auto-rigger)
7. Export as GLB

**Effort:** 4–12 hours for a skilled artist, depending on detail
**Cost if commissioned:** $50–300 on Fiverr/Upwork for a stylized character like Billy
**Pros:** highest quality, exact match to your style, fully customizable
**Cons:** real time investment, can't be done in an afternoon

## Path 4 — Hybrid: AI body, hand-tuned details

The most practical path for a great-looking Billy without huge cost:

1. Use **Meshy** or **Tripo** to generate the base body shape from a comic panel — this gets you the proportions, the pineapple texture mapped to the body, the leaf crown, and a clean topology
2. Open in Blender, **tune the details by hand:** sharpen the eyes, fix the smile, adjust the leaf curl, replace materials with hand-painted textures
3. Rig with Mixamo for animations
4. Export GLB

Total time: 2–4 hours, end-to-end. This is what most indie game studios actually do.

## Costume / expression variants

Whichever path you take, Billy's wardrobe lives as **morph targets** (blend shapes) or **swappable accessory meshes**:

- **Expressions** as morph targets: happy / worried / asleep / excited / determined
- **Costumes** as swappable accessory groups (parented to the body bone):
  - Desert: scarf, goggles, dust mask
  - Spice town: a small turban
  - Home: pajamas
  - Quest: backpack, walking stick
- **Props** held in hands: cup, snack bag, map, juice bottle

This pattern lets one base Billy mesh power a whole library of looks.

## Integration with the comic

A 3D Billy can enhance the existing Pineapple Planet comic reader several ways:

1. **Page transitions:** between panels, a 3D Billy walks across the screen briefly
2. **Companion icon:** small Billy in the corner of the reader, blinks, looks toward the current panel direction
3. **Chapter intros:** 3D Billy poses in his costume for that chapter on the chapter-select menu (already shipped in PR #189)
4. **Choices interface:** when a comic page offers a choice (`BillyChoice` type already exists in `lib/billy-comic.ts`), 3D Billy mimes considering each option
5. **End-of-chapter rewards:** 3D Billy does a small celebration animation

## Billy in the FigureStars builder

The procedural Billy is exposed inside `/figure-stars` alongside the OBJ-backed figures.
`lib/billy-geometry.ts` builds a single merged `BufferGeometry` from the same primitives
the Billy3D component uses (body + crown + eyes + brows + mouth + arms + legs + shoes),
centred and unit-scaled. `FigureStarsBuilder` picks this up via the `procedural: 'billy'`
marker on the figure entry, skips the `OBJLoader` path, and feeds the merged geometry
straight into `MeshSurfaceSampler`. So Billy renders as stars / dots in every palette,
density, and pulse mode the other figures support — no asset download needed.

## Effort summary

| Path | Quality | Cost | User time |
|---|---|---|---|
| Procedural v1 (shipped) | recognizable | free | 0 |
| Procedural v2 (more polish) | better | free | a few hours each upgrade |
| AI image-to-3D (Meshy) | very good | $5–20 once | 30 min |
| AI image-to-3D (open source) | very good | free if GPU | 1–2 hours setup |
| Hand-modeling | best | $0 (you) or $50–300 (commissioned) | 4–12 hours |
| Hybrid AI + hand-tune | very good | $5 + your time | 2–4 hours |

## My recommendation

**Live with v1 procedural for a few weeks** while you decide if Billy 3D actually adds value in real use. If it does:

1. Try **Meshy** with one Billy panel (~30 minutes of your time)
2. If the result is great, replace the procedural component with the AI mesh and use Mixamo to rig animations
3. If the AI result is "almost right but off," go hybrid (Meshy base + Blender retouching)

Don't commission hand-modeling until you've validated Billy 3D earns its keep in the product.

## What I'll need from you

For the AI path:
- A clean Billy reference image (existing comic panels work — panel-0 is great)
- Adobe account for Mixamo (free)
- Meshy.ai account (~$5–20)

For the hybrid / hand-modeling path:
- Blender 4.5 LTS installed (only needed if going beyond AI generation)
- A weekend of focused art time, or a freelancer budget

For the procedural-upgrade path:
- Nothing. I can keep iterating on Billy3D.tsx whenever you want a new feature, expression, or costume.

## Open creative questions

- Does Billy stay strictly faithful to the 2D comic look, or does the 3D version evolve into its own style (closer to a Pixar/Disney cartoon character)?
- Should Billy speak (voice lines tied to chapter beats)? Adds significant work but unlocks a lot of personality.
- Should the comic remain the canonical Billy and 3D be supplemental, or should 3D become the primary identity going forward?
