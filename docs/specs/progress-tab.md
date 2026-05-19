# Progress Tab — Overview Road Sub-tab

## Placement
Sub-tab inside the Road (Overview) view on the day page.  
Two pills side-by-side: **Overview** (existing) | **Progress** (new).

## Purpose
Bridge the gap between long-run vision and daily presence.  
Single screen that answers: *where am I going, how am I growing, and what am I doing daily to get there.*

## Four Blocks

### 1. Vision Anchor
- A prominent, always-visible statement: "what I am building toward"
- Single large handwritten-style input, centered, no box
- Persisted in localStorage under `colourmap:vision`
- Placeholder: *"what are you building toward..."*
- This is the north star — everything below serves it

### 2. Life Areas (LifeCategories)
- Existing `LifeCategories` component — user-defined life areas with color dots
- Answers: *how is my life structured right now*
- Persisted in localStorage `colourmap:life-categories`

### 3. Mastery Domains (MasteryBox)
- Existing component — staged growth journey (Clarity → Order → Presence → ...)
- Answers: *how do I want to grow*
- Shows current active stage + tracks

### 4. Active Programs (CockpitSections)
- Existing component — program/habit trackers (Body Reset, Discipline Builder, etc.)
- Answers: *what am I doing daily*
- Connects daily habits back up to the vision above

## Layout
```
[ Vision: "build a business that connects people" ]

[ Life Areas — my life areas ]
  ● Work  ● Health  ● Family  ● Creative  ...

[ Mastery — where am I growing ]
  Stage: Clarity → Order → Presence →...
  Tracks: Health ●●●  Creative ●●○  ...

[ Programs — what I do daily ]
  Body Reset  ●●●●○
  Discipline  ●●●○○
```

## Data
- Vision: localStorage `colourmap:vision` (plain string)
- Mastery: localStorage `colourmap:mastery` (existing MasteryBox)
- Programs: localStorage `colourmap:cockpit-sections` (existing CockpitSections)

## What stays in Journey
- PersonalityMap (inner parts — reflective/therapeutic)
- SoulMap (auto-generated emotional territory)
- LifeTimeline (deferred to later)
- Archetype + tone-based AI companion
- Dark period program

## No-spec-impact
- No Supabase changes needed
- No new data models
- All three blocks already have their own persistence

## Future: Process Maps

Progress should also become the place where the user can see personal process roads: how states,
actions, guilt, regulation, creativity, reflection, and return-to-action actually connect. This is
not a productivity score. It is a map of movement.

Example:

```text
Work pressure -> agitation -> guitar/music -> guilt -> song -> reflection -> philosophy -> work bridge
```

The same action can have different functions. Music might be avoidance, regulation, creative
transformation, culture, or a bridge back to work. The map should capture the function, not morally
judge the action.

Process Maps should appear as stacked horizontal roads:

```text
Organisation: Pressure -> Music -> Guilt -> Song -> Reflection -> Next work block
Body: Tension -> Stretch -> Resistance -> Relief -> Energy
```

Each road scrolls sideways. The page scrolls vertically across different processes.

Each dot can eventually store:

- state
- action
- function
- risk
- bridge

### Low-Data Start

The app should not infer deep patterns from almost no data. Process Maps start as activation:

```text
What happened first?
What did you do next?
What did that action give you?
Where did guilt, resistance, relief, or clarity appear?
What helped you return?
```

Only after the user creates or confirms several roads should Colourmap say a process is recurring.
Until then, AI should use cautious language:

```text
This may be a road worth mapping.
Does this sequence feel true?
What would you rename this step?
```
