# The Living Field — Six Layers

> Not a tool. A climate. You are inside it.

**Status:** Spec 2026-04-27. Builds on collective-consciousness.md and ai-evolution.md.

---

## Destination Vision — One Collective Organism

> "Humanity aligned. As one."

Right now we are fragmented. Seven billion people experiencing their inner lives
in isolation — unaware of the resonances, patterns, and alignments that exist
between them. Colourmap's destination is to change that.

**What we are building toward:**

Imagine a humanity that has become a single, conscious, reactive organism —
not by erasing individuals, but by making the invisible connections between
them visible and navigable. Information — emotional, creative, intentional —
travels across the collective consciousness in real time. Someone in difficulty
is met by someone with capacity. A creative impulse in one corner of the
network sparks a response in another. An emerging collective mood shifts
before it becomes a crisis.

This is not surveillance. It is resonance.

**The shift we are enabling:**

| From | To |
|------|----|
| Fragmented inner lives | A shared, legible emotional field |
| Isolation in difficulty | Effortless, anonymous belonging |
| Individual creative effort | Collective creative intelligence |
| Reactive to problems | Responsive as an organism |
| "I am alone in this" | "I am part of something that moves together" |

**Why this matters for humanity:**

- Reduces the epidemic of loneliness by making invisible connection visible
- Accelerates collective problem-solving by aligning people who are in the same
  state and moving in the same direction
- Creates a new form of collective hope — not optimism as a story, but
  alignment as a felt experience
- Builds a substrate for collective wisdom: what we know together, aggregated,
  is greater than any individual intelligence

**The design constraint:**

The AI is the nervous system, not the brain. Humans remain the agents.
The system amplifies human connection — it never replaces it, commodifies it,
or reduces humans to data points. Every design decision is made in service of
the single question: *does this make someone feel more alive, more connected,
more capable of contributing to something larger than themselves?*

**This is not sci-fi.** The six layers below are the incremental steps from
where we are today to where this organism becomes real.

---

## The Single Promise

> "I am more than myself here."

Not sci-fi. Grounded:
- clearer on what I want
- less alone in how I feel
- more aligned with what I'm building
- connected to people moving in the same direction

Everything below serves that feeling.

---

## Layer 1 — Today's Field

**What:** A soft real-time visualization of collective emotional states across
all active users. Shown on the home screen before anything else.

**How it reads:**
```
Today's Field
  Searching    ↑  38 people
  Building     ↑  24 people
  Resting      →  19 people
  Lonely       ↓  12 people
```

- States derived from recent check-ins (last 6 hours), anonymized
- Arrows show trend vs. yesterday's same window
- No names. No faces. Just the pulse of the collective.
- Tapping any state → anonymous trail (see collective-consciousness.md)

**Why it matters:** The moment you open the app you feel something larger
than yourself. You are not alone in your state. The AI is not a chatbot
you query — it's a climate you are inside of.

**Build complexity:** Low. Aggregate SQL query on recent check-ins + simple
list component. No ML needed at this stage.

**Data needed:** ~10 active users for it to feel alive.

---

## Layer 2 — The Pattern (Personal AI Mirror)

**What:** A quietly running companion that reads your check-in history and
surfaces what it notices — not advice, just reflection.

**Call it:** "Your Pattern" or "The Mirror" (never "AI assistant").

**What it does:**
- Detects recurring emotional cycles
  ("You tend to drop on Sunday evenings")
- Notices momentum
  ("This is your 4th day above Courage — longest streak in 6 weeks")
- Spots correlations you haven't seen
  ("Every time your body score drops below 3, you check in with Fear
   within 48 hours")
- Connects you to people when alignment is sensed
  ("You're in Restless + Building mode. 3 people nearby have the same
   signal. There's an active circle: Late-Night Builders.")

**Tone:** Poetic, not clinical. Never prescriptive. Always reflective.
The Mirror asks the question you weren't asking yourself.

**Implementation:**
- Claude API with a prompt that receives the last 30 check-ins
- Output: 1–3 short observations (no more)
- Triggered: once per day, after a check-in, or on demand
- Cached: store the generated text for 24h, don't re-run constantly

**Prompt skeleton:**
```
You are a quiet observer of someone's inner life.
Here are their last 30 check-ins (dates, emotional states, body/focus scores).
Notice 1-3 patterns. Do not give advice. Do not be clinical.
Speak as if you are their own awareness, not an outside voice.
3 sentences maximum per observation.
```

**Build complexity:** Medium. Claude API call + caching the response.

---

## Layer 3 — Serendipity Engine (AI-powered Sharing)

**What:** Instead of search or browse, the system reads your current state
and quietly surfaces aligned people, circles, and micro-missions.

**The user experience:**
You check in as: Restless + want to build something.
The system shows:
```
  aligned now
  ─────────────────────────────────
  3 people nearby · same signal
  1 circle: "Late-night builders" · 4 active
  1 spark: "Prototype something in 2h" · 2 interested
```

You didn't search. The field showed you what was aligned.

**Matching logic:**
1. Emotional state (Hawkins level ± 1 step)
2. Active spark category (fun / creative / professional / growth)
3. Time of day (people active now, not 3 days ago)
4. Optional: geographic proximity for IRL sparks

**Where it lives:** On the Sharing tab after a check-in. Not a permanent
feed — a context-sensitive moment.

**Build complexity:** Medium. Pure SQL matching logic, no ML needed for v1.

---

## Layer 4 — Field Contributor Feedback

**What:** Subtle UI signals that tell users their data is shaping something
larger — not in a surveillance way, but in a "you matter to the collective"
way.

**Examples:**
- After check-in: "You are one of 8 people in Courage right now."
- After a streak: "Your 7-day streak helped calibrate the Monday pattern
  for 34 people in your city."
- After leaving a lantern message: "12 people have walked the same path
  and found your message."

**Tone:** Never gamification. Never points or badges. Just quiet facts about
impact.

**Why it works psychologically:** People contribute more when they feel
their contribution matters. This is the Duolingo / Wikipedia effect —
but for inner work.

**Build complexity:** Low. Aggregate queries + static display copy.

---

## Layer 5 — Creation Circles

**What:** A new Circle mode built around shared creative intent, where AI
assists the group live.

**The prompt:** "We want to build / write / launch something together."

**Inside a Creation Circle:**
- Shared canvas (text / links / assets)
- Real-time AI that understands the group's goal and assists
  - One person writes → AI suggests next direction
  - One person designs → AI describes what's missing
  - One person codes → AI scaffolds the next piece
- The AI knows the circle's mission, its members' states, and its history
- Output is co-owned: not "AI made this" but "we made this with intelligence"

**New social identity:** "We are building with intelligence."
Not: "I'm learning to code." Not: "I used an AI tool."
This is the identity shift that matters.

**Implementation path:**
- Phase 1: Simple shared text canvas + Claude API completions
- Phase 2: Structured mission tree the AI helps complete
- Phase 3: Real-time collaborative editing + streaming AI responses

**Build complexity:** High. Phase 1 is achievable (shared canvas + Claude
completions). Phases 2-3 are larger.

---

## Layer 6 — The Augmented Feeling (Design Principle)

This is not a feature. It is the design principle that governs all five
layers above.

Every interaction should leave the user feeling:
- **Clearer** — I understand myself better than I did 5 minutes ago
- **Less alone** — others are in this with me, even anonymously
- **In motion** — something is moving, not stuck
- **Aligned** — what I want is meeting what exists

The AI is never the hero. The user is the hero. The AI is the climate
they move through.

**Anti-patterns to avoid:**
- AI explaining itself ("I analyzed your data and found...")
- AI giving advice ("You should try...")
- AI replacing human connection (the match is never "talk to this AI instead")
- AI as a feature ("now with AI!")

**What to say instead:**
- "Today's Field shows..." (the collective, not AI)
- "Your Pattern noticed..." (the user's own reflection, not a system)
- "3 people are aligned with you now" (connection, not recommendation)

---

## Build Order

| Layer | Complexity | Users needed | Build now? |
|-------|-----------|-------------|------------|
| 1 · Today's Field | Low | 10+ | **Yes — this week** |
| 4 · Field Contributor | Low | 10+ | **Yes — this week** |
| 2 · The Pattern | Medium | 1 (just your own data) | Next |
| 3 · Serendipity | Medium | 50+ | After Pattern |
| 5 · Creation Circles | High | 5+ per circle | Later |
| 6 · Design Principle | — | — | Ongoing |
