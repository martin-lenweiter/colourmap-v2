# Strengths & Weaknesses Mapping — Spec

## Core Idea

The Caring depth box (Box 3) is a **personal growth engine**. It helps users:
1. Name their strengths and weaknesses
2. Understand how they connect to each other
3. Track them over time
4. Work on them one by one through guided reflection

Everything flows from this: strengths/weaknesses → challenge vs flow → inner weather → FACING/CARE compass scores. The depth box is where all the data in the Caring tab converges into pattern recognition.

---

## 1. FUNCTION LAYER (What it does)

### 1.1 Discovery — Name Your Patterns

Users create **colour pills** — small labelled items, each tagged as strength or weakness.

- **Strengths**: Courage, Empathy, Discipline, Creativity, Honesty, Patience, Focus, Resilience
- **Weaknesses**: Overthinking, Avoidance, Self-doubt, Control, People-pleasing, Perfectionism, Procrastination, Impatience

Each pill gets:
- A **name** (user-typed or from suggestions)
- A **category** (strength / weakness)
- A **colour** (auto-assigned from palette, or user-picked)
- An **intensity score** (1-5: how present is this right now?)
- A **locked** state (once mapped and confirmed, it's "locked in" — part of your core profile)

### 1.2 Mapping — Understand Connections

After naming 3+ patterns, the user can **map interconnections**:

- "My **avoidance** triggers when my **self-doubt** is high"
- "My **courage** grows when I lean into **discipline**"
- "**People-pleasing** weakens my **honesty**"

Connections are simple: pill A → pill B, with a label (triggers / strengthens / weakens / balances).

### 1.3 Packs — Group Related Patterns

Patterns cluster into **packs** — themed groups:

- **Shadow Pack**: the 3-4 weaknesses that show up together (e.g., Avoidance + Self-doubt + Perfectionism)
- **Strength Pack**: the 3-4 strengths that support each other (e.g., Courage + Honesty + Resilience)
- **Growth Edge**: 1 weakness + 1 strength that are in tension (e.g., Control vs Trust)

Packs are manually created by the user. They help focus the work: "This week I'm working on my Shadow Pack."

### 1.4 Locking — Confirm Your Map

Once a user has named, scored, and connected their patterns, they can **lock** individual pills or entire packs. Locking means:

- The pill becomes part of your **core profile** (visible in compass, depth box, weekly review)
- It starts being **tracked over time** (weekly intensity snapshots)
- It can receive **guided questions** (one per day, rotated)

Unlocked pills are drafts. Locked pills are commitments.

### 1.5 Tracking — Watch Patterns Shift

Each locked pill gets a **weekly intensity check-in**:

- Quick 1-5 rating: "How present was Avoidance this week?"
- History shown as a simple sparkline (last 8 weeks)
- Trend arrow: ↑ getting stronger, ↓ fading, → stable

Over time, the user sees:
- Which weaknesses are fading (good)
- Which strengths are growing (good)
- Which patterns are stuck (needs attention)
- Which connections are active (triggers firing)

### 1.6 Working — One at a Time

The user selects **one pattern to work on** this week. That pattern gets:

- A daily question prompt (rotated from a bank of 3-5 per pattern type)
- Connection to the FACING system (weakness → which FACING dimension is involved?)
- Connection to CARE compass (does this affect Care, Attitude, Rest, or Emotions?)
- A space to journal a short reflection

**Example daily prompts for "Avoidance":**
- "What did you avoid today? What would have happened if you hadn't?"
- "Name one small thing you could face tomorrow instead of avoiding."
- "When avoidance shows up, what emotion is underneath it?"

**Example daily prompts for "Courage":**
- "Where did courage show up today, even in a small way?"
- "What would you do today if you weren't afraid?"
- "Name a moment this week when courage surprised you."

### 1.7 Questions & Reflection Space

A dedicated space for deeper thinking:

- "What's the relationship between your top strength and your top weakness?"
- "If your weakness had a voice, what would it say?"
- "What does your strength need from you to grow?"
- "Which pack is most active right now? Why?"
- "Is there a pattern you've been avoiding naming?"

These rotate weekly. Answers are saved but not scored.

---

## 2. CONNECTION TO OTHER SYSTEMS

### 2.1 Inner Weather ← Strengths/Weaknesses

Inner weather is **the emotional output** of your strengths/weaknesses balance:

- High weakness intensity + low strength → **Storm** (frustration, overwhelm)
- Moderate weakness + moderate strength → **Fog** (confusion, uncertainty)
- Low weakness + low strength → **Rain** (sadness, stagnation)
- Low weakness + moderate strength → **Breeze** (calm, acceptance)
- Low weakness + high strength → **Sun** (confidence, joy)

Inner Weather becomes a **quick visual check** — if your sky is stormy, your weakness pack might need attention.

### 2.2 FACING ← Weaknesses

Each FACING dimension maps to weakness types:

| FACING | Weakness Pattern |
|--------|-----------------|
| Fear | Self-doubt, Anxiety, Catastrophising |
| Avoidance | Procrastination, People-pleasing, Numbing |
| Confusion | Overthinking, Indecision, Analysis paralysis |
| Intention | Lack of focus, Scattered energy, No direction |
| Needs | Neglecting self, Over-giving, Boundary issues |
| Gratitude | Negativity bias, Comparison, Taking for granted |

### 2.3 CARE Compass ← Strengths

Each CARE dimension maps to strength types:

| CARE | Strength Pattern |
|------|-----------------|
| Care | Empathy, Compassion, Nurturing |
| Attitude | Courage, Optimism, Resilience |
| Rest | Patience, Acceptance, Letting go |
| Emotions | Honesty, Vulnerability, Expression |

### 2.4 Challenge/Flow ← Active Pattern

The writing columns in Box 1 connect directly:

- **Challenge** = the active weakness you're working on this week
- **Flow** = the active strength you're developing this week

### 2.5 Life Wheel ← Tracking

The Life Wheel (Doing depth) can overlay strength/weakness tracking as an extra layer:
- Strength scores → overlay as a second radar shape (warm colour)
- Weakness scores → overlay as a third radar shape (cool colour)

---

## 3. VISUAL TOOLS LAYER (How to show it)

The function layer above can be rendered with **multiple visual tools**. Users can pick their preferred view. All views show the same data.

### 3.1 Colour Pill List (Default)

Simple vertical list:
- Strength pills on the right (warm colours: gold, terracotta, sage)
- Weakness pills on the left (cool colours: blue, purple, grey-brown)
- Tap to expand → see intensity slider, connections, lock button
- Locked pills have a subtle border glow
- Active "working on" pill has a highlight ring

### 3.2 Triangle Wheel (CPC-inspired)

Radial wheel with triangular spokes shooting outward:
- Each triangle = one pill (strength or weakness)
- Triangle length = intensity (1-5)
- Triangle colour = pill colour
- Point faces inward (toward center "you")
- Base faces outward
- Strengths on the right hemisphere, weaknesses on the left
- Center shows balance score
- Connections drawn as faint arcs between triangle tips

**Geometry** (from CPC BalanceCheckIn triangle variant):
```
polygon points: center → left-inner → tip-outer → right-inner
tipR = baseRadius * (0.5 + intensity/5 * 0.45)
innerR = tipR * 0.3
```

### 3.3 Constellation (Star Map)

Adapted from SharingDepth constellation:
- Each pill = a star (strength) or organic cell (weakness)
- Intensity = distance from center (high intensity = closer)
- Colour = pill colour
- Connections = faint lines between connected pills
- Packs = clustered in the same sector

### 3.4 Losange (Diamond)

4-quadrant diamond view:
- Top: Strengths being developed
- Right: Strengths that are stable
- Bottom: Weaknesses being worked on
- Left: Weaknesses that are dormant
- Pills move between quadrants as you work on them

### 3.5 Mandala (Petal)

Each petal = one pack:
- Shadow Pack petals in darker colours
- Strength Pack petals in warmer colours
- Growth Edge as the center overlap
- Petal size = total intensity of the pack

### 3.6 Inner Weather Sky (Current)

The existing weather visualization — shows the emotional output:
- Weather orbs in the sky
- Colour bar at bottom showing weather mix
- This is the "result" view, not the "input" view

---

## 4. PROCESS FLOW

### Step 1: DISCOVER (Day 1-3)
- User sees empty depth box with prompts: "Name a strength" / "Name a weakness"
- Suggestion pills for common patterns
- Goal: name 3-5 patterns total

### Step 2: SCORE (Day 3-7)
- Each named pattern gets an intensity rating (1-5)
- Visual tool shows the shape forming
- Goal: see your balance

### Step 3: CONNECT (Week 2)
- Draw connections between patterns
- "Does this weakness trigger that one?"
- "Does this strength support that one?"
- Goal: understand the web

### Step 4: PACK (Week 2-3)
- Group related patterns into packs
- Name your Shadow Pack, Strength Pack, Growth Edge
- Goal: focus your attention

### Step 5: LOCK (Week 3)
- Confirm your core patterns
- Lock pills into your profile
- Goal: commit to tracking

### Step 6: WORK (Week 4+)
- Select one pattern to work on
- Receive daily prompts
- Journal reflections
- Goal: transform one pattern at a time

### Step 7: TRACK (Ongoing)
- Weekly intensity snapshots
- Sparkline history
- Trend arrows
- Goal: see change over time

---

## 5. DATA MODEL

```typescript
interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  intensity: number;        // 1-5
  locked: boolean;
  packId: string | null;
  createdAt: string;
  history: { date: string; intensity: number }[];
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  kind: 'triggers' | 'strengthens' | 'weakens' | 'balances';
}

interface Pack {
  id: string;
  name: string;
  type: 'shadow' | 'strength' | 'growth-edge';
  pillIds: string[];
}

interface WorkFocus {
  pillId: string;
  startDate: string;
  prompts: string[];
  reflections: { date: string; text: string }[];
}
```

**LocalStorage keys:**
- `colourmap:pattern-pills` — PatternPill[]
- `colourmap:pattern-connections` — Connection[]
- `colourmap:pattern-packs` — Pack[]
- `colourmap:pattern-focus` — WorkFocus | null

---

## 6. VISUAL TOOL PREFERENCE

User can switch between views using the existing design box pattern:
- **List** (default): colour pills in two columns
- **Wheel**: triangle spokes radiating from center
- **Stars**: constellation map
- **Diamond**: losange quadrants
- **Flower**: mandala petals by pack

The design box stores preference in `colourmap:caring-depth-view`.

---

## 7. QUESTIONS PER SEGMENT

### Discovery Questions
- "What pattern keeps showing up in your life?"
- "What do people close to you say about you — good and challenging?"
- "What do you wish you were better at?"
- "What comes naturally to you that others struggle with?"

### Connection Questions
- "When this weakness appears, what strength disappears?"
- "Does this strength ever become a weakness? (e.g., empathy → people-pleasing)"
- "Which patterns show up together? Which ones are never present at the same time?"

### Tracking Questions
- "Has this pattern changed since last week? What happened?"
- "What triggered a shift in intensity?"
- "Is this pattern seasonal? Does it change with circumstances?"

### Meta Questions
- "Are you avoiding naming a pattern? What would happen if you named it?"
- "If you could only keep 3 strengths, which would they be?"
- "If you could dissolve 1 weakness overnight, which would it be? Why that one?"
- "What would your life look like if your strongest strength led every day?"

---

## 8. IMPLEMENTATION ORDER

1. **PatternPill list with colour pills** — basic add/remove/score (Week 1)
2. **Triangle Wheel visualization** — show pills as radial spokes (Week 1)
3. **Connections UI** — draw lines between pills (Week 2)
4. **Packs grouping** — create/name packs (Week 2)
5. **Lock mechanism** — confirm and start tracking (Week 3)
6. **Daily prompts** — question bank per pattern type (Week 3)
7. **Weekly tracking** — sparkline history, trend arrows (Week 4)
8. **Alternative views** — constellation, losange, mandala (Week 4-5)
9. **Cross-system integration** — connect to FACING, CARE, Inner Weather (Week 5-6)
10. **Backend persistence** — move from localStorage to Supabase (after backend PR merges)
