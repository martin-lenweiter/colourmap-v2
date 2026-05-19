# Visual Organisation Intelligence

## Purpose

Colourmap should become a platform for understanding complex ideas, projects, personality patterns,
education programs, and life direction through visual organisation.

The goal is not only to write better reflections. The goal is to make the user see the structure of
what is happening before reading deeply.

Core promise:

```text
I can glimpse what is going on.
Then I can click deeper.
Then I can choose a clearer next move.
```

## Product Direction

Colourmap should develop a visual intelligence layer that can turn fragments into organised forms:

- ideas into maps
- personality into territories and bridges
- missions into roads and discipline loops
- education programs into infographics and learning paths
- emotions into weather, signals, and archetypal states
- projects into possibility spaces and decision views
- people into complementary constellations of skills, interests, and needs

This layer belongs in the Experiments / Infographics area first. It can be rough, but it should start
showing different visual languages rather than only explaining them in text.

## Core Flow Architecture

The base unit is not a task. The base unit is a flow pattern:

```text
energy -> channel -> blockage -> emotional force -> bridge action -> downstream relief
```

The simplest product loop is:

```text
Detect -> Clarify -> Unblock -> Learn -> Remember
```

- **Detect:** notice state, tension, avoidance, energy, or repeated language
- **Clarify:** name the pattern without blame
- **Unblock:** propose the smallest bridge action that could release flow
- **Learn:** observe what changed downstream
- **Remember:** save the pattern so the user can recognize the same river next time

This is deliberately different from motivation loops. Motivation is unstable weather. Pattern memory
is geology.

Core reflection sentence:

```text
You are not broken. You are repeating a river we have seen before.
```

## Implementation Core

The first buildable unit should be a small `FlowPattern` record.

```ts
type FlowPattern = {
  id: string;
  detectedAt: string;
  rawText: string;
  activeChannel: 'Creator' | 'Survivor' | 'Body' | 'Builder' | 'Social' | 'Philosopher' | 'Play';
  blockedChannel?: string;
  emotionalForce?: 'fear' | 'overwhelm' | 'avoidance' | 'confusion' | 'pressure' | 'shame';
  patternName: string;
  clarification: string;
  bridgeAction: string;
  expectedDownstreamEffect: string;
  actualEffect?: string;
  rememberedAs?: string;
};
```

MVP user flow:

1. User writes or speaks what is happening.
2. App detects possible active channel, blocked channel, and emotional force.
3. App clarifies the pattern in one humane sentence.
4. App proposes one bridge action.
5. User completes or skips the bridge.
6. App asks what changed.
7. App stores the pattern as memory.

The first version can use rule-based detection plus manual editing. AI can improve the wording and
pattern recognition later, but the product should not wait for perfect AI.

Minimal UI:

- a five-step strip: Detect, Clarify, Unblock, Learn, Remember
- one current pattern card
- one bridge action button
- one "what changed?" reflection box
- one remembered pattern list

This turns Colourmap from a task manager into a personal pattern memory system.

Individual example:

```text
Creator wants music
Survivor is blocked by admin uncertainty
emotion = anxiety / pressure
bridge = map documents for 20 minutes
downstream = relaxation, cleaner identity, more stable creative energy
```

Collective example:

```text
group wants creative connection
coordination is blocked by isolation and unclear timing
emotion = loneliness / friction
bridge = small coworking or nature circle
downstream = belonging, project momentum, shared agency
```

The individual and collective systems use the same pattern engine at different scales. The first app
milestone should prove the individual version: show the user what is blocked, why it is blocked, and
what one action could release the most energy.

## Process Maps In Progress

Process Maps are the Progress-tab expression of the pattern engine. They should map how a user's
life actually moves, not judge whether each action is "productive."

Example:

```text
work pressure
-> agitation
-> music / guitar as regulation
-> guilt about not working
-> singing about the guilt
-> reflection
-> philosophy and culture give meaning
-> return to work with more clarity
```

The app should not collapse this into "user avoided work." The more useful reading is:

```text
Pressure created agitation.
Music regulated the body.
Guilt appeared because of productivity conditioning.
Singing transformed guilt into expression.
Reflection turned expression into understanding.
Culture gave the experience a wider frame.
The user can return to work through a bridge instead of a fight.
```

This is the distinction Colourmap must protect:

```text
same action, different function

guitar as avoidance
guitar as regulation
guitar as creative transformation
guitar as culture / meaning
guitar as bridge back to work
```

The map should ask what role an action played in the flow before labeling it.

### Process Road UI

Process Maps should be shown as stacked horizontal roads inside Progress:

```text
Organisation Road
Pressure -> Agitation -> Music -> Guilt -> Song -> Reflection -> Next work block

Social Road
Loneliness -> Message friend -> Fear -> Avoid -> Walk -> Try again

Body Road
Tension -> Stretch -> Resistance -> Relief -> Energy
```

Each road scrolls sideways. The page scrolls vertically across different processes. Each dot can open
a small explanation:

- **state:** what was felt
- **action:** what happened
- **function:** avoidance, regulation, transformation, meaning, or bridge
- **risk:** where the pattern can become stuck
- **bridge:** the small move that reconnects the user to life

The visual should feel like Progress Roads but personal: one life process per line, dots connected by
a warm road, with enough empty space that it remains readable on phone.

## Low-Data Activation

Process Maps will be hard when the app has little user history. The first version must not pretend to
infer deep patterns from thin data. It should begin as a guided activation tool.

Starting modes:

```text
1. Guided prompt
   "What happened first?"
   "What did you do next?"
   "What did that action give you?"
   "Where did guilt, resistance, relief, or clarity appear?"
   "What bridge brought you back?"

2. Template road
   Pressure -> Regulation -> Guilt / Resistance -> Transformation -> Meaning -> Next move

3. Manual dot builder
   User adds dots quickly: state, action, feeling, next move.

4. AI mirror only after input
   AI can suggest a possible process name after the user gives at least a few dots.

5. Memory later
   Only after repeated maps should the app say "this pattern returns."
```

Low-data principle:

```text
At the start, Colourmap should guide the user to notice a process.
Later, after enough confirmed examples, Colourmap can recognize recurring processes.
```

The first useful AI question is not "Here is your pattern." It is:

```text
Do you want to map what just happened as a road?
```

Activation triggers can appear after:

- a check-in note with tension words such as guilt, avoidance, pressure, agitation, stuck, relief
- a mission note that mentions switching activities
- a music or notebook fragment after a difficult work state
- a repeated contrast between "I should work" and "I need music / walk / body / reflection"

The user should always confirm the map. AI proposes; the user owns the road.

## First Principles

- **Glimpse first.** The user should understand the rough shape before reading paragraphs.
- **Progressive depth.** Tap or open a segment to see the explanation, evidence, next action, or
  reflection.
- **Low attention span friendly.** One screen should not show every idea at once. Use tabs, pills,
  collapsed sections, and focused current views.
- **Visual contrast.** Different ideas should look different from far away.
- **Agency.** The visual should make the user feel that the problem is smaller, named, and movable.
- **Adaptive to personality.** Long term, Colourmap should learn whether the user thinks better with
  maps, roads, cards, constellations, comics, geometry, timelines, or quiet lists.

## Visual Languages To Prototype

### 1. Glimpse Cards

Small high-signal cards that compress an idea into:

- one title
- one symbolic shape
- three keywords
- one next action

Use for low-energy moments and phone browsing.

### 0. Flow Blockage Maps

Show the living river of a person's current situation:

- what is flowing
- what is compressed
- what emotional force sits behind the dam
- what downstream areas would change if the dam opened
- the smallest bridge action that could release movement

Use for the core Colourmap question:

```text
What should I focus on now for the maximum useful life impact?
```

### 2. Bubble And Line Maps

Nodes and relationships, similar to detective-board logic but calmer and more elegant.

Use for:

- idea relations
- project dependencies
- people and complementary skills
- emotional causes and effects
- business strategy clusters

### 3. Road Views

Sequential paths that show movement over time.

Use for:

- discipline
- learning programs
- app store launch
- personal recovery
- project milestones

### 4. Territory Maps

Regions with borders, channels, blocked zones, and bridges.

Use for:

- personality modes
- archetypes
- life categories
- creator / admin / body / relationships balance

### 5. Contrast Boards

Side-by-side alternatives:

```text
current pattern / better pattern
abstract idea / practical use
creative mode / admin mode
fast expansion / stable foundation
```

Use when the user needs to choose direction.

### 6. Infographic Education Boards

Education programs should be explainable as one visual board:

- core concept
- why it matters
- what it changes
- one practice
- related programs
- emotional state it helps with

This should become a bridge between Education, AI Presence, and the daily cockpit.

### 7. Personality Constellations

People can be mapped through visible dimensions:

- energy style
- structure style
- creativity style
- social rhythm
- risk tolerance
- body / mind / emotion balance
- complementary skill fit

Long term, this can support parties, circles, collaborations, bands, events, and creative teams:

```text
similar interests
+ complementary capacities
+ compatible energy
+ shared timing
```

The goal is not to reduce people to types. It is to make compatibility, tension, and collaboration
easier to see.

### 8. Microcosm Mode

Microcosm Mode is a long-run visual language where the user can see themselves as a living world.

Possible forms:

- self as planet
- self as city
- self as landscape
- self as weather system
- self as river network

Symbolic grammar:

- **continents** = major life territories such as Creator, Survivor, Body, Builder, Social,
  Philosopher, Play
- **rivers** = energy channels and recurring flows
- **dams** = blockages, avoided tasks, fear loops, uncertainty, shame, overwhelm
- **weather** = temporary mood and motivation
- **geology** = recurring patterns that shaped the terrain over time
- **bridges** = small actions that reconnect territories
- **fertile zones** = practices, people, rhythms, and places that reliably restore flow
- **cities** = projects, commitments, communities, or identities built through repeated action

This mode can become the beautiful symbolic heart of Colourmap: not a static compass, but a living
world that shows what is flowing, what is compressed, what has history, and what one change could
open downstream.

MVP sketch:

```text
one small planet card
-> territories named
-> one blocked river highlighted
-> one suggested bridge action
-> one remembered pattern note
```

Long term, this can connect to 3D geometry, music-reactive visuals, archetypes, AI reflection, and
collective maps of groups or communities.

### 9. Astral Mode

Astral Mode is an immersive app style where the geometry builder becomes the default visual language
of Colourmap.

Instead of the app feeling like screens made of cards, it feels like a living golden field:

- golden dots
- ochre / beige text
- flowing particle rivers
- swirling paths
- voice-reactive cells
- energy maps
- mission timers
- progress trails
- remembered patterns as glowing constellations

The reference direction is the brown/gold Mission Console language from Build Lab expanded into a
full app mode.

Possible flow:

```text
1. Check-in -> voice opens the field
2. Energy map -> particles reveal channels and blockages
3. Plan -> AI names the pattern and suggests the bridge
4. Action -> timer / ritual / focused movement
5. Progress -> completed actions become memory trails
```

Build difficulty:

- **Prototype:** medium. Reuse existing geometry/dot visuals as backgrounds for one or two screens.
- **Useful mode:** medium-high. Needs shared visual components, readable text overlays, and
  accessibility fallbacks.
- **Whole app skin:** high. Requires turning major screens into data-driven overlays on top of a
  performant particle system.

Recommended path:

```text
Astral prototype in Experiments
-> Astral check-in screen
-> Astral energy map
-> Astral mission/action timer
-> Astral progress memory trail
-> optional app-wide mode
```

Do not start by reskinning the whole app. Start with one end-to-end loop:

```text
Detect -> Clarify -> Unblock -> Learn -> Remember
```

If that loop feels powerful in Astral Mode, then expand it.

## AI Adaptation

When AI is active, it should learn:

- which visual formats the user opens and returns to
- whether the user responds better to roads, maps, comics, or simple cards
- which project areas are repeatedly avoided
- which visual explanations create action
- which archetypes or modes dominate under pressure

AI reflection should then choose a visual format:

```text
You are scattered -> glimpse card
You are deciding -> contrast board
You are building -> road map
You are emotionally tangled -> territory map
You are connecting ideas -> constellation
You are learning -> infographic board
```

## MVP In Experiments

Add an "Infographic Reflections" section below the existing experiment maps.

It should show prototype cards for:

- Visual languages
- Personality mapping
- Education as infographic
- Mission discipline
- Creativity and agency
- Social / party / collaboration constellations

Each card should include:

- a mini visual sketch using CSS/SVG
- a short reflection
- a "best for" line
- a future AI use line

This is not the final product. It is a visible thinking laboratory for how Colourmap can explain
ideas, projects, and life patterns with visual intelligence.
