# Mixamo → GLB → App Pipeline for Yoga Characters

**Status:** Workflow guide for adding yoga / stretch / pose animations
**Date:** 2026-05-23
**Lives in:** Education and Body Engine domains

Mixamo (Adobe) is the fastest, free way to add animated humanoid characters to Colourmap. 2500+ animations, every common stretch and yoga pose included. This doc walks through the full pipeline from "no character yet" to "playing in the app."

## What Mixamo gives you free

- ~80 fully-rigged humanoid characters (free, royalty-free for any use including commercial)
- 2500+ pre-made animations, all auto-retargetable to any character
- Auto-rigging service: upload any T-pose OBJ/FBX, Mixamo rigs it for free
- Outputs FBX with skeleton + animation baked in

**Free tier limits:** none in practice — Adobe acquired Mixamo and decided to give it away. Just need a free Adobe ID.

## Step 1 — Sign in

1. Go to `https://www.mixamo.com`
2. Sign in with a free Adobe account (any email works)
3. You'll land on the Character browser

## Step 2 — Pick a character

Three good options for Colourmap:

- **Y Bot** — the default abstract humanoid. Best for yoga because it has no clothing/distractions and looks neutral. Recommended starting point.
- **Maw J. Laygo, Erika** — slightly more human-looking, still neutral.
- **Upload your own** — drop an OBJ/FBX, Mixamo auto-rigs it. Works on any humanoid with arms+legs+head.

Click a character → it loads in the 3D preview on the right.

## Step 3 — Pick an animation

In the animation library (left panel):

For a yoga library, search for:
- "yoga" — gets you Cobra, Warrior I/II, Tree, Mountain, Lotus prep, Sun Salutation parts
- "stretch" — neck, shoulder, back, hamstring stretches, side bends, forward folds
- "meditation" — sitting, breathing poses
- "balance" — single-leg, tree, warrior balance variations
- "tai chi" — slow flowing motions, great for calm pages

Each animation has options on the right:
- **In Place** — pose without character drifting forward (almost always what you want)
- **Mirror** — left vs right side
- **Trim** — start/end clipping for long animations
- **Overdrive** — speed up / slow down at export

## Step 4 — Download

1. Click **Download** (top right, blue button)
2. **Format:** FBX Binary (.fbx)
3. **Skin:** With Skin (so the mesh travels with the bones)
4. **Frames per second:** 30 fps is fine (60 fps doubles file size for no visible benefit on a phone)
5. **Keyframe Reduction:** none
6. Hit Download

You get e.g. `Y Bot.fbx` for the character with that single animation embedded.

## Step 5 — Convert FBX → GLB

The app uses GLB (binary glTF), not FBX. Two paths:

### Option A — Blender (any version 3.0+)

1. Open Blender (4.5 LTS recommended — it reads FBX cleanly)
2. **File → Import → FBX (.fbx)** → select the Mixamo file
3. The character appears with bones (orange octahedra) visible
4. **File → Export → glTF 2.0 (.glb/.gltf)**
5. Settings:
   - Format: glTF Binary (.glb)
   - Include: Selected Objects
   - Transform: +Y Up
   - **Animation: ✅ enabled** (this is critical)
   - Geometry: Apply Modifiers ON, UVs ON, Normals ON
6. Save as `yoga-cobra.glb` (or whichever pose name)
7. Drop the file into `public/models/`

### Option B — online converter

If Blender is not available, `https://glb.babylonjs.com/` and `https://anyconv.com/fbx-to-glb-converter/` both convert in-browser. Slower, sometimes loses animations on complex rigs, but works in a pinch.

### Option C — gltf-transform CLI (advanced, scriptable)

```bash
npm install -g @gltf-transform/cli
gltf-transform fbx2glb input.fbx output.glb
gltf-transform optimize output.glb output-small.glb
```

Run `optimize` to shrink with Draco compression — often 5–10× smaller for the same visual quality.

## Step 6 — Pose library naming

Conventions for the app:

| Mixamo animation | Save as |
|---|---|
| Yoga - Cobra Pose | `pose-cobra.glb` |
| Yoga - Mountain Pose | `pose-mountain.glb` |
| Yoga - Tree Pose | `pose-tree.glb` |
| Yoga - Warrior I | `pose-warrior1.glb` |
| Yoga - Lotus Pose | `pose-lotus.glb` |
| Stretching - Forward Fold | `pose-forward-fold.glb` |
| Sitting Idle (Meditation) | `pose-meditation.glb` |
| Breathing | `pose-breath.glb` |

The app's pose registry (a JS array) maps each filename to a display label, a category (yoga / stretch / meditation), and a `relatedRitual` key tying into the existing notebook ritual system.

## Step 7 — Wire it into the app

Once a GLB is in `public/models/`, add it to the pose registry:

```typescript
// lib/yoga-poses.ts
export const YOGA_POSES = [
  {
    key: 'cobra',
    label: 'Cobra Pose',
    url: '/models/pose-cobra.glb',
    category: 'backbend',
    duration: 30, // seconds suggested hold
    benefits: 'Opens chest, strengthens lower back, energizes.',
  },
  // ... more poses
];
```

The `AnimatedFigure` component already loads any GLB and plays its embedded animation. Adding a new pose is one entry in this array.

## Step 8 — Combining multiple poses in one file (optional, advanced)

Mixamo lets you build a **sequence** — pick multiple animations and download them as one FBX with each as a separate clip. The app's `AnimatedFigure` component already supports a pose selector when a GLB has multiple animations.

To combine:
1. On the Mixamo animation page, click **"Get more characters"** → no, that's wrong — actually use the **Animation Pack** mode
2. Or: download separately, then in Blender, combine via Action Editor → multiple actions, all exported into one GLB

The advantage: one file load, instant switching between poses.

## Performance budget

Each Mixamo animation in GLB form is typically:
- **300–800 KB uncompressed** (~5k–8k triangles for Y Bot)
- **40–120 KB with Draco compression** via `gltf-transform optimize`

Phone-friendly load times even on 3G. A yoga library of 20 poses, all in separate GLBs, totals roughly **2–4 MB optimised** — small enough to ship as part of the app bundle if needed.

## Suggested first batch (in priority order)

Build the yoga library by downloading these 8 animations first. They cover the highest-value pages in Colourmap:

1. **Meditation sit** — for journaling, reframe, calm
2. **Mountain pose** — neutral standing, default avatar
3. **Cobra pose** — energy, awakening
4. **Forward fold** — release, sleep prep
5. **Tree pose** — focus, balance
6. **Warrior I** — strength, agency
7. **Lotus pose** — Kid Lotus parallel
8. **Twist** — release / let-go ritual

Total time to source all 8 from Mixamo: about 30 minutes including conversion via Blender.

## Where each pose surfaces in the app

- Calm/reframe pages → meditation, forward fold, lotus
- Sleep ritual → forward fold, twist, breath
- Energy/agency programs → warrior, cobra, mountain
- Focus → tree, lotus
- Progress page hero → mountain (default), changes by daily state

## Open questions

- Should we use the same character mesh across all poses (consistency) or vary the character per category (variety)?
- Should poses morph smoothly into each other (sequence mode) or snap (selector mode)?
- Do we eventually rig the user's own meshes (Kid Lotus, Golden God) and add Mixamo animations to *them*? Mixamo's auto-rigger needs a clean T-pose mesh — your existing assets would need to be retopologised first, which is real Blender work.
