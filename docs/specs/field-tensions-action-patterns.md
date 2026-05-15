# Field, Tensions, Action, Patterns

**Status:** Product reflection / organizing architecture
**Date:** 2026-05-15

This spec captures a deeper direction for Colourmap: not a productivity app, and not only a mood tracker, but a life laboratory for negotiating competing internal worlds under pressure.

## Core Sentence

Colourmap helps me turn inner conflict into a clear field, small bridges, and patterns I can trust.

## Product Shift

The hidden purpose of Colourmap is not productivity. Productivity apps assume the user already knows what matters and simply needs to execute.

Colourmap assumes something more human:

The user contains multiple internal worlds with different needs, fears, and timelines.

Examples:

- The Builder wants the future.
- The Survivor wants stability.
- The Artist wants beauty.
- The Body wants sleep.
- The Child wants freedom.
- The Philosopher wants meaning.

When these worlds pull in different directions, the problem is not only unfinished tasks. The problem is unresolved tension.

## Proposed Architecture

Instead of organizing the app primarily around:

- Emotions
- Missions
- Progress

Organize the deeper model around:

```text
FIELD -> TENSIONS -> ACTION -> PATTERNS
```

## Field

Life begins as a field: the felt landscape of the day before it becomes language or tasks.

The field can include:

- fog
- panic
- inspiration
- exhaustion
- excitement
- pressure
- openness

This is the user's inner weather system.

Current Colourmap features that belong here:

- Check-in
- emotional vocabulary
- body/presence signals
- geometry and visual field language
- music/chill states when used as regulation

## Tensions

Tensions are the main unit of meaning.

They are not tasks. They are forces pulling against each other.

Examples:

- I want to create, but I need money.
- I want peace, but I avoid paperwork.
- I want success, but I fear slowing down.
- I want freedom, but I need structure.
- I want to build the future, but I need to survive today.

Tensions are important because they are engines. They explain why a simple task can feel impossible and why a small practical action can suddenly clear emotional fog.

## Three Worlds

V1 can simplify tensions into three worlds:

### Survival

Bills, admin, housing, food, social help, stability, basic obligations.

### Expansion

Colourmap, art, music, future projects, creative work, career growth, vision.

### Regeneration

Sleep, body, walking, breathing, food, rest, nervous-system repair.

The app can show the user's position between these worlds.

Example pattern:

> Victor tends to ignore Survival while in Expansion mode.

Example discovery:

> After 30 minutes of paperwork, emotional tension drops sharply.

This is more valuable than generic advice because it is discovered from the user's own life.

## Action

Action should be small and bridge-like.

Not twenty missions.

One current-world bridge per world:

- Survival: upload Monday social help documents.
- Expansion: give Codex one Colourmap mission.
- Regeneration: take a 10 minute walk.

The action layer should feel like small bridges across tension, not a war plan.

## Patterns

Progress should become pattern discovery, not task-score display.

Instead of:

> You completed 73 tasks.

Colourmap should surface:

- You create when anxious.
- You rush under uncertainty.
- You avoid practical tasks when Expansion is high.
- You relax after structure.
- You thrive after music and movement.
- Survival actions often reduce creative frustration.

This turns life into a constellation or behavioral astronomy: a map of recurring forces, not a productivity scoreboard.

## V1 Product Shape

Keep the existing Feeling / Doing / Sharing structure, but place one higher-level object above it:

## Current Tension

Example:

> Building the future while surviving the present.

Below that, show the three worlds:

- Survival
- Expansion
- Regeneration

Each world gets one small action.

Then:

- AI reflection
- pattern discovery
- optional education/comic layer

## Education Direction

Education should become Structure of Thought: interactive psychology and self-organization stories.

Possible programs:

- Why humans avoid paperwork
- Fear loops
- Attention landscapes
- Creative personalities under uncertainty
- Survival mode vs creation mode
- How structure can reduce emotional pressure

The style can be artistic and comic-like, but it should serve clarity first.

## Layer Separation

Colourmap has two layers:

### Layer 1: Daily Survival Tool

This is the MVP foundation:

- missions
- emotions
- current tension
- three worlds
- AI reflection
- pattern discovery

### Layer 2: Dream Atmosphere

This is the future cathedral:

- golden dots
- large visual presences
- music-reactive fields
- sacred geometry
- festival/concert visuals
- AI presence
- immersive consciousness cloud

The dream layer is important, but it should grow from the daily survival foundation. Visual cathedrals need a stable floor.

## Done When

This architecture is useful when:

- The app can name one current tension better than a task app can.
- The user can choose one small action in Survival, Expansion, and Regeneration.
- The app can notice when one world is being ignored.
- Progress shows recurring patterns rather than only completion.
- AI reflections mirror the tension without becoming preachy.

## Non-Goals

- Replace therapy.
- Turn the user into a productivity machine.
- Add more dashboards.
- Make all visual dream layers part of V1.
- Treat tasks as more important than the forces underneath them.
