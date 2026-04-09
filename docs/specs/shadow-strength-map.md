# Shadow & Strength Map

## Purpose

A third block in each Day tab that helps users map their inner landscape — shadows (where they feel stuck, their worst patterns) and strengths (their best qualities) — then discover how these connect, track evolution over time, and build a simple check-in program.

## Philosophy

Shadows are not enemies. They are the soil from which strengths grow.

- The person who controls too much → learned discipline
- The person who fears abandonment → built deep loyalty
- The perfectionist → developed excellence
- The people-pleaser → cultivated empathy

The system helps users see this connection — not as therapy, but as self-knowledge. Fun, visual, liberating.

## Four Layers

### 1. Learn — "Name your cast"

The user names their shadows and strengths in a free-form, playful way.

**Shadows** (where you feel stuck):
- Free text input: "I overthink everything", "I avoid conflict", "I procrastinate when scared"
- Or pick from a library: The Perfectionist, The Avoider, The Controller, The People-Pleaser, The Self-Saboteur, The Critic, The Comparer, The Isolator, The Overthinker, The Victim
- Each shadow gets a colour (dark/muted tones) and an icon or initial

**Strengths** (your best qualities):
- Free text: "I'm resilient", "I listen deeply", "I create beauty from nothing"
- Or pick from library: Resilience, Empathy, Discipline, Creativity, Loyalty, Courage, Adaptability, Vision, Honesty, Generosity
- Each strength gets a colour (warm/bright tones)

**Connection prompts** (after naming both):
- "Could your overthinking be the shadow of your vision?"
- "Could your people-pleasing be the shadow of your empathy?"
- The system suggests connections. The user confirms, rejects, or creates their own.
- Connected pairs are linked visually (shadow ←→ strength)

### 2. Map — "See your landscape"

Visual representation of the user's inner landscape.

**Option A: Constellation map**
- Shadows as dim stars on the left, strengths as bright stars on the right
- Connected pairs linked by a line
- The constellation shape IS the user's unique pattern
- Over time, shadows can migrate toward the center (integration)

**Option B: Terrain map**
- Shadows as valleys/caves (low terrain, dark colours)
- Strengths as peaks/plateaus (high terrain, warm colours)
- Connected pairs share a ridge line
- The landscape shifts as the user evolves

**Option C: Mirror map**
- Two columns, shadow on left, strength on right
- Connected pairs at the same height
- Simple, clear, mobile-friendly
- Each pair is a card you can tap to expand

Recommendation: Start with **Option C (Mirror map)** — simplest to build, clearest to read on phone, easiest to track over time.

### 3. Track — "Watch it move"

Weekly or daily micro-check on each shadow and strength.

**Shadow check (1-5):**
- 1 = "It's running the show"
- 2 = "It's loud today"
- 3 = "It's there, I see it"
- 4 = "I'm managing it"
- 5 = "It's quiet"

**Strength check (1-5):**
- 1 = "Can't access it"
- 2 = "Faint"
- 3 = "Present"
- 4 = "Strong"
- 5 = "Leading"

**Over time:**
- Line chart per shadow/strength showing trajectory
- Or a heatmap grid (days × items, colour intensity = score)
- The mirror map updates: shadows that score high (quiet) drift toward center, strengths that score high (leading) glow brighter

### 4. Program — "Work with it"

Structured reflection program for each shadow-strength pair.

**Weekly cycle (one pair per week):**
- Monday: Name the shadow. Write how it showed up this weekend.
- Tuesday: Name the strength. Write where you used it recently.
- Wednesday: Reflect on the connection. How does the shadow feed the strength?
- Thursday: Set an intention. "This week I'll notice when [shadow] appears and use [strength] instead."
- Friday: Check in. Did the intention hold? Rate shadow (1-5) and strength (1-5).
- Weekend: Rest. No prompts.

**Or simpler — daily one-question:**
Each day, one prompt appears related to a random shadow or strength:
- "Your shadow 'Perfectionist' — did it show up today? (yes/no/not sure)"
- "Your strength 'Resilience' — did you use it today? (yes/no/not sure)"
- Over time this builds a frequency map without feeling like homework.

## UI Structure

### Block 3 in each Day tab

Below the compass card, a third card appears:

```
┌─────────────────────────────┐
│  Shadows & Strengths        │
│                             │
│  ┌──────┐  ←→  ┌──────┐   │
│  │Critic│      │Vision │   │
│  │  2   │      │  4    │   │
│  └──────┘      └──────┘   │
│                             │
│  ┌──────┐  ←→  ┌──────┐   │
│  │Avoid │      │Loyal  │   │
│  │  3   │      │  5    │   │
│  └──────┘      └──────┘   │
│                             │
│  Today's prompt:            │
│  "Did the Critic visit?"    │
│  ○ yes  ○ no  ○ not sure   │
│                             │
│  + add shadow  + add strength│
└─────────────────────────────┘
```

### Per-tab adaptation

- **Caring tab**: shadows/strengths related to inner life (emotions, body, attitude, rest)
- **Doing tab**: shadows/strengths related to outer life (action, structure, target, resources)
- **Sharing tab**: shadows/strengths related to relational life (connection, honesty, belonging, expression)

Or: one unified shadow/strength map that appears in all 3 tabs (same data, shown once).

Recommendation: **One unified map**, shown as Block 3 in the Caring tab only (since it's the most introspective). Doing and Sharing tabs keep their current 2-block structure.

## Data Model

### shadows_strengths table
```
id: uuid
userId: uuid
type: 'shadow' | 'strength'
label: text (user-written or from library)
category: text (optional: 'caring' | 'doing' | 'sharing')
connectedTo: uuid (nullable — links to another shadow/strength)
createdAt: timestamp
```

### shadow_strength_checks table
```
id: uuid
userId: uuid
itemId: uuid (references shadows_strengths)
date: date
score: integer (1-5)
note: text (optional)
createdAt: timestamp
```

## Connection to Existing Systems

- **Mandala Council archetypes** (CPC): shadows map to Shadow family archetypes (The Critic, The Saboteur, etc.), strengths map to Warrior/Creator/Anchor families
- **FACING trackers**: Fear/Avoidance/Confusion are shadow expressions; Intention/Need/Gratitude are strength expressions
- **PEACE trackers**: the calming cycle (Pause → Express → Accept → Calm → Emerge) IS the process of integrating a shadow
- **Echo Workshop**: the depth layers (Core Pain → Defence → Story → Behaviour → Social Face) describe a shadow's anatomy

## Build Order

1. **Phase 1**: Mirror map UI with free-text input (shadows on left, strengths on right) + connection prompts. localStorage only.
2. **Phase 2**: Daily one-question prompt ("Did [shadow/strength] show up?"). localStorage.
3. **Phase 3**: Backend persistence (new tables, API routes, hooks). Supabase.
4. **Phase 4**: Evolution tracking (line chart or heatmap over time).
5. **Phase 5**: Weekly program (structured reflection cycle).

## Design Rules

- Same paper-feel card as other blocks
- Shadow colours: muted/dark (#8A7A7A, #7A6A6A, #6A5A5A)
- Strength colours: warm/bright (#C4A070, #D4A060, #E8B040)
- Connection line: thin dotted line between paired items
- Font: follows global style toggle
- Tap target: minimum 48px for all interactive elements
- Mirror layout: shadows left, strengths right, equal weight
