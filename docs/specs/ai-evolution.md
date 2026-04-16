# AI Evolution — Living Reflection Map

> The AI reads all your reflections, discovers what matters, and speaks it back to you through the visual language that fits the moment.

## Philosophical Foundation

At the core, all we do as humans is try to please our subconscious and our body — or try to. Every ambition, every avoidance, every routine, every story we tell ourselves is a mechanism feeding that system. We are not rational agents executing plans. We are organisms negotiating with our own nervous system, moment by moment.

Colourmap's purpose is to help work with that system and bring clarity to it. Not to fix it, not to optimize it — to **see it more clearly**. Reflection to be developed, not prescribed.

### Moving Forward vs. Feeling You're Moving Forward

Two things matter, not one:

1. **Actual movement** — the targets you check off, the patterns that shift, the challenges that ease over time
2. **The perception of moving forward** — the felt sense that life is in motion, that you are in motion, that something is happening

These are not the same. A person can be genuinely progressing and feel stuck. A person can be stagnant and feel alive. The subconscious and the body respond to the **felt sense**, not the objective truth.

Colourmap serves both. The target system, the logbook, the accumulating check-ins — these produce real movement. The visual languages, the geometry reshaping as you add a category, the river of your evolution rendered on a page — these produce the **feeling** of moving forward. One without the other is incomplete.

This is why the visual layer matters so much. It is not decoration. It is how the app speaks to the subconscious. A beautiful rendered shape of your inner life reassures the body in a way a spreadsheet never will. The form is the message: *you are in motion, things have shape, there is a way.*

## Emotional Promise

The aim is to appeal to the humanity of users. Every visual, every interaction, every AI-generated artifact exists to produce one feeling: **you can relax. Things are moving forward. You are in progress. There is a way.**

Not productivity. Not optimization. Not self-improvement as performance. The opposite: the deep reassurance that comes from seeing your own life laid out with care — and recognizing that the mess has shape, the shape is changing, and the change is yours.

The AI's job is not to fix you. It's to show you that you're already moving.

## The Right Questions

The AI's primary tool is not answers — it's questions.

For every challenge, every block, every category: the AI asks the question that unlocks the next step of thinking. Not generic prompts. The right question at the right time, informed by everything the user has already shared.

### The River Metaphor

The user's life is a river. Challenges are not enemies — they are **blocks in the river**. Each block is there for a reason. Each block is a tool to think better, to understand something about yourself. The app doesn't remove the blocks. It helps you work your attitude around them, so you can come back stronger to lift them — and the river flows again.

### The Cycle

The app helps the user find **presence, relaxation, and flow** — so they can be efficient in their missions. And completing missions feeds back into presence, relaxation, and flow. The two sides (feeling and doing) are not separate tracks. They are one cycle:

1. **Notice** — what's blocking? Where is the river stuck?
2. **Understand** — why is this block here? What is it teaching?
3. **Shift attitude** — not force, not fight. Work around it. Come back stronger.
4. **Act** — move on missions with the clarity that presence gives.
5. **Feel the movement** — efficiency feeds relaxation, relaxation feeds presence, presence feeds flow.

The AI's questions guide this cycle. It doesn't push the user through it — it helps them find their own pace through it.

---

## The Backbone — Categories

### The Core Insight

The aim of all the tracking features — Challenge/Flow, Caring Depth, River, Programs — is one thing: **help the user map what they want to keep track of over time.**

The current design fragments this across too many systems. Challenge and Flow mix big life areas with small frustrations in one flat list. Caring Depth asks you to dump patterns and organize them into packs. The River asks you to rate them daily. Programs track habits separately. Missions track tasks separately. They all circle the same need but none of them own it.

**Categories replace all of this as the single backbone.**

### What a Category Is

A category is an area of your life you want to watch. That's it.

- **Shoulder** — your body, your rehab, your physical state
- **Organisation** — your systems, your admin, your order
- **Social** — your relationships, your connections
- **Music** — your creative practice
- **Work** — your professional life
- **Confidence** — your inner state around self-belief

Categories are not challenges. They are not flows. They are not patterns or pills or programs. They are **the named territories of your life.** Some are going well. Some aren't. That changes over time.

### Challenge and Flow Live Inside Each Category

Within each category, you have two lenses:

- **Challenge** — what's hard right now in this area. What blocks the river.
- **Flow** — what's working right now in this area. What carries you forward.

So Shoulder isn't a challenge. It's a category. Within it: challenge = "stiffness in the morning, skipping exercises." Flow = "physio is helping, range of motion improving." Both live together because they're both about the shoulder.

This solves the problems with the current Challenge/Flow design:
- **Big and small don't mix** — categories are the stable areas, challenge/flow are the texture within each
- **No manual categorization** — you already placed it when you named the category
- **Connected to doing** — a mission like "do physio exercises" naturally lives under the Shoulder category
- **The AI gets structured data** — it knows the area, knows what's hard, knows what's flowing, knows the trajectory

### The Daily Review

The daily ritual is simple: scan your categories, see your last comment on each, update what changed.

Each category shows your **last comment** — challenge and flow — right there. You see what you wrote yesterday or last week. You either leave it (nothing changed) or update it. You're not filling a blank field. You're **continuing a conversation with yourself.**

The evolution is visible in the act of editing. "Shoulder — started physio exercises, still stiff in the morning" becomes, three days later, "morning stiffness reduced, can raise arm above head now." Progress is felt through your own words.

The daily review takes 60 seconds. Optional comments on any category that needs attention. Skip the ones that haven't changed. The app remembers.

### What Categories Absorb

Categories as the backbone simplifies the feature map:

- **Challenge / Flow** → become the lenses within each category, not standalone lists
- **Caring Depth pattern pills** → become categories (strengths and weaknesses are just flow and challenge)
- **Caring Depth packs** → become category groups (optional, if the user wants to cluster related categories)
- **River snapshots** → become the trail of daily comments and ratings within each category
- **Programs** → become structured routines attached to a category (e.g., "Body Reset" lives under Shoulder)
- **Missions** → can optionally link to a category, connecting doing to the area of life it serves

### Data Model

```typescript
interface Category {
  id: string;
  name: string;             // "Shoulder", "Organisation", "Music"
  color: string;            // visual identity
  createdAt: string;
  order: number;            // user-defined sort order
}

interface CategoryEntry {
  id: string;
  categoryId: string;
  date: string;             // YYYY-MM-DD
  challenge: string | null; // what's hard right now
  flow: string | null;      // what's working right now
  rating: number | null;    // optional 1-5 quick pulse
  updatedAt: string;
}
```

The `CategoryEntry` is append-only by date. Each day can have one entry per category. Updating today's entry overwrites; yesterday's is history. The trail of entries IS the river — no separate snapshot system needed.

---

## The AI Layer

### Vision

Colourmap starts as a cockpit you fill manually. The AI evolution is the moment the cockpit starts reading back to you — not with words, but with visual shape.

The AI accumulates understanding across every data source in the product: check-ins, categories (challenge/flow/comments over time), missions, day map entries, notes, life scan assessments. From that accumulated picture, it does two things:

1. **Organize** — cluster related categories, surface recurrence across comments, name themes the user hasn't named yet.
2. **Orient** — only when asked, suggest where to focus next, what's shifting, what deserves attention.

The organizing comes first. The orienting is earned.

### Suggested Themes (product-proposed + explained)

> Decided 2026-04-16 on the Overview thread. Target design for the AI phase.

The user names the areas of their life they want to watch (`LifeCategories`). That naming stays the user's — never overwritten. In parallel, the product surfaces **suggested themes**: patterns the AI discovers across categories, check-ins, and logbook entries that the user has not explicitly named.

A suggested theme always comes with a **reason**. Not just "confidence" as a pill — rather "confidence — because 'not enough' shows up in 4 of your categories over the last 3 weeks." The explanation is first-class, not a hover. Without the reason, it reads as a magic label; with it, it reads as a mirror.

Acceptance behaviour:

- The user can accept a suggested theme (it promotes into a real category they can track), dismiss it (it disappears and the AI deprioritises similar clusters), or leave it as a read-only observation.
- Accepted themes become first-class categories and can be renamed. The user always gets to rename.
- Dismissed themes don't vanish forever — the AI can re-surface them if the evidence gets stronger, but with a delay so the user isn't nagged.

Why this shape:

- Users often can't see the meta-pattern across their own language (five categories all about "control" look like five different categories to them). The product surfacing the cluster + the reason is the specific job the user can't do for themselves.
- Explanation prevents the "magic label" failure mode — a word without evidence reads as opinion, not observation, and erodes trust.
- Product suggests, user confirms. Matches the product principle "the AI proposes, the user confirms."

**Status: unsolved for now.** Needs: (a) a semantic layer that clusters categories and entries; (b) a data-source signal strong enough to justify an explanation; (c) a UI surface on Overview that shows the suggestion without stealing focus from the user-named categories. Come back to this when the AI phase starts (Phase 2+ in The Road below).

### What the AI Replaces

The living map absorbs three current features into one adaptive view:

- **Soul Map** (broad life territories) — the AI discovers territories from your categories and data instead of offering predefined ones.
- **Personality Map** (named inner parts) — inner parts become clusters the AI identifies from recurring patterns across check-ins and category comments.
- **Cell View** (draggable pattern pills) — spatial arrangement becomes AI-driven, with the user free to override and rearrange.

These features served as manual scaffolding. The AI evolution is the scaffolding becoming alive.

### Mirror First, Coach When Asked

The AI's default mode is reflection: "here's what I see in your data, organized visually." It names patterns, shows clusters, reveals recurrence. It does not prescribe action unless the user explicitly asks ("what should I work on next?", "where am I stuck?").

This is an evolution of "cockpit, not coach." The base layer remains a cockpit. The AI layer earns the right to guide because it's built on the user's own data, not generic advice. It starts as a mirror. It coaches only when invited.

---

## Multiple Visual Languages

The constellation is not one fixed visualization. The AI chooses the visual form that best communicates the current insight and emotional need:

- **Geometric Polygon** — the signature view. Each category becomes a vertex. Three categories: triangle. Four: square. Five: pentagon. Always regular, always symmetric, always equidistant. The shape itself says "all of these matter equally." When you add or remove a category, the entire structure transforms — that transformation is felt, not just seen. Intensity shows through color saturation, node size, glow, or pulse — never by distorting the symmetry. A node glows green when flow dominates in that category, amber when challenge dominates. Best for **presence and balance**.
- **Cells / Spatial Canvas** — each category is a cell on an open canvas. Different sizes, freely placed, dragged up/down/around. Size reflects how much space that area takes in your life right now. Position reflects priority, urgency, or relatedness — cells near each other feel connected. The arrangement is messy, asymmetric, honest. This is the user doing the AI's job manually: sense-making through spatial arrangement. When the AI arrives, it can suggest layouts based on the data, but the user always overrides. Best for **raw, honest mapping** — what your life actually looks like before symmetry smooths it out.
- **Constellation** — dots in space, clusters visible by proximity. Freeform, asymmetric, organic. The AI places related categories and reflections near each other. Best for seeing **relationships and themes**.
- **River / Flow** — streams moving through time. Each category is a stream. Best for seeing **trajectory, growth, and drift**.
- **Terrain / Topography** — elevation, valleys, peaks. Best for seeing **intensity and depth**.
- **Mandala / Flower** — radial symmetry, petals per category. Best for feeling **wholeness and harmony**.
- **Wheel / Compass** — directional, oriented. Best for seeing **where energy is concentrated**.

The AI picks the representation based on what it's trying to communicate and what the user needs to feel: **presence** (you are here), **relaxation** (it's okay, look at the whole picture), **movement** (you're going somewhere), **agency** (here's what you can act on).

The visual variety is not decoration. It's a communication device. The same data, rendered differently, produces different emotional responses and different insights.

### Emergent Clusters with Optional Scaffolding

The AI discovers clusters freely from the data. If comments in "Shoulder" and "Sleep" keep mentioning the same triggers, the AI surfaces that connection — even if the user never grouped them.

Optionally, the user can overlay the CARE/FACING compass framework onto the visual. This maps categories and clusters onto the life dimensions the product already defines (Care, Attitude, Rest, Emotions / Fear, Avoidance, Confusion, etc.), giving familiar orientation without forcing the data into predefined boxes.

---

## How It Builds Understanding

The AI's picture of you deepens over time:

**Week 1** — Sparse. The AI has a few check-ins and a handful of category comments. It can show the polygon — your named areas, held equally. Basic clustering: "these categories seem related based on your comments."

**Month 1** — Richer. The trail of daily comments reveals recurrence. The AI can say: "challenge in Organisation has appeared in 20 of 30 entries" and show it as a persistent amber glow. Temporal patterns emerge: "your Social flow peaks on weekends" or "Shoulder challenge eases when you've been consistent with physio."

**Month 3+** — Deep. The AI has enough history to project trajectories. It can show which categories are shifting from challenge-dominant to flow-dominant. When asked, it can suggest: "you've been circling the same Organisation challenge for weeks — here's a question that might help."

---

## AI-Generated Artifacts

The AI doesn't just show you visuals in the app. It **makes things** for you.

### Hierarchy of Output

1. **Beautiful and mine** — the artifact feels personal, crafted, worth keeping. Like a page from your own codex, not a notification.
2. **I understand myself better** — the visual cuts through noise and shows something text couldn't. The insight IS the image.
3. **Shareable as a working tool** — designed to be brought into a therapy session, coaching conversation, or any context where someone is helping you grow.

### Live Visuals (In-App)

Beyond the polygon and constellation, the AI can compose **personal cockpit panels** unique to you. Not templated dashboards — designed spreads that reflect your data: a star chart of your categories, wind patterns of your flows, a weather map of your emotional month. Each one generated, each one yours.

### Period Reports (Exportable)

The signature shareable artifact. A beautifully typeset document covering a time range you choose — a week, a month, a quarter.

How it works:

- **User-curated** — you select which categories, clusters, and time range to include. The act of choosing what to share is itself a reflection exercise: "what do I want to work on with my therapist this month?"
- **AI-composed** — the AI arranges your selections into a coherent multi-page document with visual and written elements. It doesn't just dump data — it tells the story of your period.
- **Multi-view** — includes the relevant visual languages: polygon showing shape changes, trajectory rivers, recurrence maps, cluster constellations. The views that matter for what you selected.
- **Notebook aesthetic** — typeset in the Colourmap visual language. Parchment warmth, mixed typography, hand-drawn feel. Something that looks like it came from a personal codex, not a clinical assessment tool.
- **Privacy by design** — you choose exactly what's included. Nothing is shared by default. The report is generated locally and exported as a PDF or shared link with your explicit action.

The therapist use case: instead of spending 20 minutes saying "I don't know, this week was hard," you walk in with a document that shows your polygon shifted shape, your Shoulder category moved from challenge-dominant to flow-dominant, and Organisation has been stuck for three weeks. That's a working document that starts the conversation where it matters.

### Generative Surprises (Future)

The AI makes things you didn't ask for. Milestone moments: 30 days of daily reviews earns a personal constellation poster. A category that shifts from challenge to flow becomes a completed star chart. A new chapter generates a title page. These feel like gifts from the app — acknowledgments that you showed up and did the work.

---

## Relationship to Current AI Features

Current AI touches in Colourmap are reactive and ephemeral:

- After-check-in insight (2 sentences, auto-dismisses)
- Cat companion (tone-matched reflection)
- Logbook support (compassionate response)
- Music generation (creative tool)

The living map is the first AI feature that **accumulates**. It remembers. It builds a picture over weeks and months. The ephemeral features stay as they are — quick mirrors in the moment. The living map is the long-term memory that ties them all together.

---

## The Road

### Phase 1 — Categories (pre-AI)

Build the category backbone. Name your areas, enter challenge/flow within each, see your last comment, update daily. The polygon renders with one vertex per category. No AI yet — just the structure that everything else builds on.

### Phase 2 — Semantic Layer (AI reads)

The AI reads all category entries + check-ins + notes and produces structured output: clusters, recurrence, connections. JSON behind the scenes. No new UI yet — just the brain.

### Phase 3 — Living Map (AI shows)

The AI's understanding renders as the constellation. Single view first (polygon + constellation). Prove the concept: does seeing AI-organized clusters feel meaningful?

### Phase 4 — Multiple Visual Languages (AI speaks)

Add terrain, river, mandala, wheel. Let the user switch. Start experimenting with AI-suggested views. The right visual for the right moment.

### Phase 5 — Coach on Request (AI guides)

The "what should I work on?" prompt. The right questions. By now the AI has enough accumulated context to give meaningful, specific guidance — not generic advice.

### Phase 6 — Artifacts (AI creates)

Period reports. Personal cockpit panels. Generative surprises. The AI makes things for you.

---

## Open Questions

- How much compute per map refresh? Real-time on every check-in, or periodic (daily digest)?
- Where does the AI state live? Derived on-the-fly from raw data, or cached as a semantic layer?
- How to handle the cold start gracefully — what does the polygon look like with 2 categories and no history?
- Should the user be able to "seed" categories from existing Challenge/Flow data?
- Visual language selection: fully AI-driven, user-picked, or AI-suggested with user override?
- Privacy: all processing local/on-device, or server-side with explicit consent?
- How do missions link to categories? Optional tag, or first-class association?

## Not In Scope

- Real-time voice interaction
- Therapeutic advice or clinical language — the app creates working documents, not diagnoses
- Social sharing or public profiles — sharing is intentional, private, and directed (e.g., to a therapist)
- Replacing the emotional check-in — the constellation reads from it, doesn't replace it
