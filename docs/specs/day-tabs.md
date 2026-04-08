# Day Tabs — CARING / DOING / SHARING

## Purpose

The Day page provides three parallel views of the user's current state: inner (Caring), outer (Doing), and relational (Sharing). Each tab follows the same composition pattern for consistency.

## Tab Labels

- **Caring** / **Doing** / **Sharing**
- Font: font-serif (Playfair Display), font-semibold
- All labels use foreground color (black/white based on theme)
- Selected tab: ochre (#C4A060) border and tint background
- Unselected tab: transparent with subtle border

## Route

`/day`

## Composition Pattern

Every tab has exactly two blocks:

### Block 1: Check-In Card
- Cat image (CockpitCat, same size across all tabs)
- Collapsible sections specific to each door
- NO anagram blobs here (CARE/STAR/SHARE blobs only appear in Block 2)
- Emotion name always visible above slider (Feeling tab)
- Single-line note input with time prefix (not a textarea)

### Block 2: Compass Card
- Title (Feeling / Doing / Sharing)
- Ring compass SVG with 4 clickable arcs
- Anagram blobs (CARE / STAR / SHARE)
- Writing columns (two-column layout: challenge/flow, blocked/moving, distant/connected)
- Rating bar (1–8 with rhymes, appears when a slice is tapped)
- Sub-cells (3 pills per dimension, appear when a slice is tapped)
- 3-step program (reflect → rate → commit, appears when a sub-cell is tapped)

## Three Words

### CARE (Feeling)
- **C** — Care: body, health, physical state
- **A** — Attitude: mindset, openness, resistance
- **R** — Rest: calm, grounding, nervous system
- **E** — Emotions: mood, feelings, inner state

Compass positions: C left, A top, R right, E bottom.

### STAR (Doing)
- **S** — Structure: systems, routines, planning
- **T** — Target: direction, clarity, purpose
- **A** — Action: momentum, focus, discipline
- **R** — Resources: time, support, tools

Compass positions: S left, T top, A right, R bottom.

### SHARE (Sharing)
- **Sh** — Share: connection, reaching out
- **A** — Authentic: honesty, dropping masks
- **R** — Roots: belonging, feeling at home
- **E** — Express: giving, putting into the world

Compass positions: Sh left, A top, R right, E bottom.

## Block 1 Content Per Tab

### Caring
- CockpitCat (140px fixed, no resize)
- Hawkins emotion slider (14 levels, colour bar)
- Emotion name always visible above slider
- Single-line note input with time prefix
- FACING / PEACE trackers (swappable with arrow ‹ ›)
  - FACING: Fear, Avoidance, Confusion, Intention, Need, Gratitude (cell shapes)
  - PEACE: Pause, Express, Accept, Calm, Emerge (calming colours)
- Each tracker opens progressive questions with losange reveal
- NO anagram blobs in this block (CARE blobs only in compass block below)

### Doing
- CockpitCat
- To-do list (checkbox, quick add, collapsible)
- Missions (name + progress bar, collapsible)
- Trackers (weekly dots M–S, collapsible)
- STAR blobs

### Sharing
- CockpitCat
- People (who you connected with, collapsible)
- Gratitude (what you're thankful for, collapsible)
- Reach Out (who to contact, collapsible)
- SHARE blobs

## Block 2: Compass Details

### SVG Compass
- Ring design (default): inner radius 40, outer radius 90, 240×240 viewBox
- 4 arc segments, each clickable
- Opacity driven by value (0.15 base + value/100 × 0.4)
- Active slice: opacity 0.75, drop-shadow glow
- Divider lines between quadrants
- Labels: 15px idle, 17px active, font-handwritten, bold

### Rating Bar
- 8 segments (1–8 scale)
- Each segment is a square button
- Active segment: height 24px, full opacity
- Adjacent: height 12px, opacity 0.4
- Others: height 12px, opacity 0.12
- Rhyming labels: "Far from the sun" → "Feeling great"

### Sub-Cells (3 per dimension = 12 per compass)
- Rendered as rounded pills
- Each opens a 3-step program: reflect, rate, commit
- Programs save to localStorage under `colourmap:sub-programs`

### Writing Columns
- Two-column grid
- Left: negative/challenge pole
- Right: positive/flow pole
- Items rendered as removable chips
- Input at bottom for quick add

## Anagram Blobs
- 4 circles (32×32px) with single letter
- Rounded organic border-radius
- Opacity 0.5
- Font: var(--font-handwritten)

## Visual Rules
- FACING tracker circles use organic cell shapes (varied border-radius), matte desaturated colours
- PEACE tracker circles use calming muted tones
- Compass labels: bold (fontWeight 700) always, minimum 15px, font-handwritten
- Rating bars use square segments (borderRadius: 2), not rounded
- All interactive text uses var(--font-handwritten) (Caveat)
- Tab titles use var(--font-serif) (Playfair Display), font-semibold
- Warm brown strokes (#ddb97f) for compass guide circles
- Vivid colour theme is default for CARE compass
- Cat: fixed 140px, no resize feature, minimal padding (py-1)
- CARE/STAR/SHARE blobs: font-black (bolder than regular bold)
- Each door has its own colour family:
  - Feeling: warm oranges/browns (#D4805A, #C4A070, #C4906A, #B07A5A)
  - Doing: cool greens/blues (#6A8A9A, #7A9A7A, #8A8A6A, #5A7A9A)
  - Sharing: earth greens (#7A9A5A, #8A9A6A, #6B8F4E, #5A8A4A)

## Data Persistence
- Compass values: `colourmap:care-values`, `colourmap:star-values`, `colourmap:share-values`
- Writing columns: `colourmap:care-challenge`, `colourmap:care-flow`, etc.
- Sub-programs: `colourmap:sub-programs` (shared array)
- Doing lists: `colourmap:doing-todos`, `colourmap:doing-missions-list`, `colourmap:doing-trackers-list`
- Sharing lists: `colourmap:sharing-people`, `colourmap:sharing-gratitude`, `colourmap:sharing-reachout`

## Unity (Future)
The three compasses merge into a single double/triple-ring compass showing all 12 dimensions. This will be built as a separate view that reads from the same localStorage keys.
