# Video Loops in Harmony with the Mood

A future-facing spec captured 2026-04-24 from Martin:

> "for the future imagine loops where u add elements to the video. video loop with the mood u are creating with the machine noise and sound. in harmony"

This is the natural extension of the geometric visualizer family (13 modes today) — but instead of pure abstract canvas math, the user layers *real* video elements on top of their evolving soundscape, and the elements respond to the mood they're building.

---

## 1. The vision in one line

> **As you shape the sound, the image shapes itself — a mood painted in light and motion that only exists for this session.**

Not a video player. Not a YouTube background. A composable video canvas where each element you add (a flame, a field of grass moving in wind, an underwater scene, a silhouette of a walking figure, stars drifting) joins the mix the way a sound layer does — and reacts to the audio you've already built.

## 2. How it differs from what we have today

Today (the Atom Visualizer family):
- Pure mathematical shapes on Canvas 2D
- Abstract beauty (Fibonacci, helix, galaxy)
- Audio-reactive dot/line/curve modulation

Tomorrow (video loops):
- Real visual material — short video loops of nature, textures, silhouettes
- Compositional — stack multiple elements (a sky + rain + a silhouette + subtle particles)
- Audio-harmonic — each element has a mood-fingerprint and pulses / dims / brightens with the sound's actual energy curve, not just amplitude

The geometric visualizers become the **structure layer**. Video loops become the **atmosphere layer**. Both can run at once — dots floating in front of a rain-on-glass loop, for instance.

## 3. The mood-to-visual contract

Each video element is tagged with "mood fingerprints" so the app can suggest which elements harmonize with the current sound. Fingerprints include:

- **Energy**: calm / flowing / rising / intense (0-1 axis)
- **Temperature**: cool / neutral / warm (-1 to 1)
- **Density**: empty / sparse / dense / overwhelming
- **Movement**: still / drifting / flowing / chaotic
- **Time of day feel**: dawn / morning / afternoon / dusk / night / deep-night

The current soundscape's fingerprint is derived from:
- Active Calming Sounds layers (each has a pre-tagged fingerprint)
- Binaural beat rate (low = calm, high = energetic)
- Magic Maker cruise speed
- Chosen melody scale (major/pentatonic = warm; minor/whole-tone = cool)
- Engine-breathing toggle (adds "organic drift" tag)

A simple dot-product between the soundscape fingerprint and each element's fingerprint produces a compatibility score. The picker UI sorts elements by score; highest-scoring ones float to the top.

## 4. Element taxonomy — what kinds of loops

Draft categories for the initial library (~50 loops to launch):

- **Water** — rain on window, stream, ocean waves, rising mist
- **Fire** — candle flame, fireplace, distant embers, forest fire in the distance
- **Sky** — dusk gradient, clouds drifting, northern lights, starfield, moon through branches
- **Earth** — grass in wind, leaves falling, forest floor, snow on pine, desert dunes
- **Human** — silhouette walking, hands in prayer, dancing shadow, crowd from far away
- **Architectural** — cathedral interior, japanese shoji, rain on cobblestone, train window view
- **Cosmic** — slow galaxy rotation, earth from space, nebula, void
- **Textural** — ink in water, oil on canvas, melting wax, dust in sunbeam
- **Abstract** — handmade animations, risograph patterns, blurred neon, light painting

Each loop is ~5–15 seconds, seamlessly looping (carefully-crafted loop points), ~200-400px tall, sub-2 MB compressed. Served as `.mp4` or `.webm` from a CDN / Supabase Storage.

## 5. Composition model

The user composes a **video stack** like they compose a sound mix:

- 1–4 elements stacked vertically in the z-axis (back = background, front = foreground)
- Each element has its own blend mode (normal / screen / multiply / overlay)
- Each element has its own opacity slider
- Each element has its own intensity response to audio (0 = static, 1 = breathes strongly with loudness)
- Optional: each element has a "latch point" — activates only when a specific sound layer is on

Example composition: "Dusk Grief"
- Background: dusk gradient sky (90% opacity, static)
- Mid: cathedral interior (60% opacity, screen-blend)
- Foreground: rain on window (40% opacity, overlay)
- Particles (atom visualizer): 30% opacity, overlaid on top

All four layers compose into a single video that breathes with the current sound.

## 6. Harmony rules (the hard part)

Without these, it becomes a chaotic collage. With them, it feels like a painting.

- **Warmth coherence**: all elements in a composition should sit within ±0.4 on the temperature axis. No polar-cold underwater + warm fireplace simultaneously.
- **Energy coherence**: same rule for the energy axis — no calm rain + chaotic fire together.
- **Movement complementarity**: if one element has chaotic movement, paired elements should be still or drifting, not also chaotic. The ear tunes out noise; so does the eye.
- **Auto-warn when incoherent**: if the user tries to add an incompatible element, show a gentle "this element has a different mood than your current mix — combine anyway?" prompt.
- **"Soft dissolve" transitions**: when an element is added or removed, crossfade its opacity over 3–5 seconds. No hard pops.

## 7. UI model

In the Calming Sounds section, add a fourth collapsible block (alongside Layers / Harmony / Sacred / Atom): **"Video"**.

Inside the block:
- **Stack view**: current stack of video elements, tap to adjust opacity/blend/remove
- **Library picker**: searchable grid of loops, grouped by category, sorted by compatibility with current mood
- **Mood preview**: tiny 3-second preview on hover/long-press
- **Compose button**: AI-suggested composition based on current soundscape fingerprint (one-tap "just make it beautiful")

## 8. Technical implementation

- **Storage**: CDN + Supabase Storage for the video files. Each ~1-2 MB. Never bundled in the app itself — always lazy-loaded on user selection.
- **Rendering**: HTML `<video>` elements stacked in a container with `mix-blend-mode` CSS for compositing, or single `<canvas>` doing the blending if performance demands.
- **Sync with audio**: an AnalyserNode fed from the master gain, read each frame, used to modulate element opacity / scale via CSS transforms. Already have the AnalyserNode pattern from the visualizer PR.
- **Performance budget**: max 4 simultaneous video elements at 720p × 30fps on modern mobile. Auto-downgrade to 480p on older devices detected via `navigator.hardwareConcurrency < 4` or `navigator.deviceMemory < 4`.
- **Battery safety**: pause all videos when `document.hidden` (already doing this for visualizer and audio).
- **Preload**: aggressive prefetch of the top 3 compatibility-scored elements when a sound layer is activated — so the library feels instant.

## 9. iOS / mobile considerations

- `<video playsinline muted autoplay loop>` is required on iOS Safari for inline-autoplay. No separate loop-handling JS needed — browser does it.
- iOS will pause videos on lock-screen — same visibility pattern we already use.
- 4-video-stack on iPhone 11+ is feasible; below that drop to 2-video stack.
- Bandwidth-conscious mode: at `navigator.connection?.effectiveType === 'slow-2g' || '2g'`, use static images instead of video loops. Progressive enhancement.

## 10. Content sourcing

Licensing rules from `public/sounds/ATTRIBUTIONS.md` apply: **Public Domain / CC0 / CC-BY** only. Never BY-SA (viral licensing), never NC (non-commercial), never custom EULAs that forbid redistribution.

Candidate sources:
- **Pexels** / **Pixabay** — both have free-for-commercial video libraries with no attribution required
- **Videvo** — mixed licenses; filter carefully
- **Mixkit** — free stock, attribution-free
- **Coverr** — curated free stock videos
- **NASA image library** — CC0 for cosmic content
- Custom footage — Martin or hired videographers recording specific moods (e.g. for "Dusk" or "Dissolution" journeys)

Each element gets an entry in `public/videos/ATTRIBUTIONS.md` — same format as the audio attributions.

## 11. Phased build plan

**Phase 0 — spike (1 week)**
- Hardcoded 4 loops, 1 category
- Proof-of-concept video stack with blend modes
- AnalyserNode hooked into opacity modulation
- Verify iOS Safari performance at 2-video stack

**Phase 1 — MVP (2–3 weeks)**
- 20 curated loops across 5 categories
- Basic library picker (no AI-suggest yet)
- Manual composition (pick 1–4 elements, adjust opacity, done)
- `public/videos/` + ATTRIBUTIONS.md
- Ship behind feature flag

**Phase 2 — harmony intelligence (2 weeks)**
- Compatibility scoring
- "Compose for me" one-tap button
- Warn-on-incoherent
- Soft-dissolve transitions

**Phase 3 — expand and monetize (ongoing)**
- 50+ loops launch library
- Premium tier: access to larger catalog + user-uploaded loops
- Community-curated composition presets (save + share your "Dusk Grief" mix)

## 12. Integration with existing features

- **Journey mode** (specced in `docs/specs/final-reflection-and-super-colourmap.md`): each stage of a journey can now define a video stack in addition to sound + visualizer. Journeys become 3-layer experiences (sound + geometric visuals + video atmosphere).
- **Circles**: later, circle members could drop a composed video-mix into the circle's shared space. "Here's the mood I'm in."
- **Check-in**: after a check-in, the app could auto-compose a soundscape + video stack that matches the Hawkins level the user recorded. "Today you're at Willingness — here's what Willingness looks and sounds like."

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Bundle/bandwidth bloat | Never bundle videos — lazy-load from CDN. Hard budget: 4 MB per session. |
| Licensing time-bomb | Rigorous per-file attribution. Audit quarterly. Reject any ambiguous source. |
| iOS performance degradation | Progressive fallback to 2-video stack or static images based on device signals. |
| Mood-fingerprint tagging subjectivity | Martin + a curator tag the launch library. User feedback surfaces miscalibrations; retag. |
| Visual overload → anti-meditative | Defaults lean minimal (1–2 elements, moderate opacity). "Empty stack" is a valid state. |

## 14. The test

When the feature works, a user finishes a 10-minute session and can't quite articulate what they watched — only that the room felt different afterward. Not "I watched a video." More "I was somewhere."

Which is the same test the sound engine aims at, and the visualizer aims at, and the journey mode aims at. Different mediums, same felt quality.

---

*Owned by: Martin + Vikash*  
*Written: 2026-04-24 (overnight)*  
*Status: future — Phase 0 starts after the core is stable (Supabase live, mobile pass done, 100 beta users)*
