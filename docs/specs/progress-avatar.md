# Progress Avatar — Personal Character System

## Concept
A visual character at the top of the Progress page that represents the user.  
Starts as a clean 2D illustration. Evolves toward a 3D video-game-style character over time.  
The character is a living reflection of your stats — not decorative, functional.

## Progression tiers

### Tier 1 — 2D silhouette (build now)
- Simple SVG figure, gender-neutral humanoid outline
- Colour fills driven by live data:
  - Body fill = mastery stage colour (Clarity: terracotta → Presence: sage → etc.)
  - Aura/glow = current mood slider from today's check-in
  - Accessory dots = active program colours orbiting the figure
- Vision text floats above the character as a speech-bubble or arc
- Fully CSS/SVG, no external dependency

### Tier 2 — 2D illustrated avatar (medium term)
- Upload a photo → generate a stylised illustrated portrait (flat design, warm palette)
- Face becomes the character head
- Stats rendered as RPG-style stat bars beside the character:
  - Mastery level (XP bar)
  - Program streaks (domain bars: Body, Mind, Creative, etc.)
  - Mood average (energy ring)
- Could use a canvas overlay or CSS clip-path for the face

### Tier 3 — 3D character (long term)
- Three.js / React Three Fiber lightweight scene
- Low-poly character with the user's face texture-mapped onto the head
- Idle animation loop — character breathes, reacts to mood data
- Level-up animations when a mastery stage completes or program streak milestone hit
- Environment reflects current life chapter (calm field, busy city, dark cave for tough periods)

## Stat mapping (all existing localStorage keys)

| Visual element | Data source | Key |
|---|---|---|
| Body colour / aura | Mastery stage | `colourmap:mastery` |
| Floating vision text | Vision statement | `colourmap:vision` |
| Orbiting dots | Active program colours | `colourmap:cockpit-sections` |
| Energy ring | Today's mood slider avg | `colourmap:check-ins` |
| Level badge | Mastery stage index (0–N) | `colourmap:mastery` |
| Domain bars | Program completion % | `colourmap:cockpit-sections` |

## What the character communicates at a glance
- *"This is who I am right now"* — mastery stage + mood → colour/expression
- *"This is what I'm building"* — vision text hovers above
- *"This is what I'm training"* — active program dots/bars surround
- *"This is how far I've come"* — level/XP fills up as stages complete

## Implementation notes
- Tier 1 is pure SVG — zero new deps, ships in one component `AvatarCharacter.tsx`
- Tier 2 face upload: store image in Supabase Storage, reference URL in user profile
- Tier 3: lazily import `@react-three/fiber` — only loads on Progress tab, ~80KB gzipped
- Keep all tiers behind the same `<AvatarCharacter />` component — swap internal implementation as tier advances, API stays stable

## First build (Tier 1)
```
┌────────────────────────────────┐
│    "build a music business"    │  ← vision arc text
│                                │
│          ◉ ·  · ◉             │  ← program dots orbiting
│        ┌───────┐               │
│        │  [☻]  │               │  ← 2D SVG figure, colour = mastery
│        └───┬───┘               │
│            │                   │
│        ────┴────               │
│                                │
│  Clarity ▓▓▓▓░░  lv 2         │  ← mastery bar
└────────────────────────────────┘
```
