# Geopolitics Platform

**Status:** V0 spec — pre-build
**Lives in:** Education layer, **World mode**. Education layer has two modes — *Self* (the eight self-development domains already specced) and *World* (this platform). A persistent switcher at the top of the Education entry surface flips between them. Routes: Education entry `/education`; Geopolitics root `/education/world` (or shorthand `/geopolitics`).
**Audience:** Curious adults and B2B operators (insurers, shipping ops, traders, policy staff) who need to *understand interrelations*, not memorise facts. Specifically: a young French student / professional who wants the depth of a CIA daily brief without the time cost.

## Purpose

Most geopolitics media gives users a flood: 30-paragraph articles, a hundred headlines a day, no scaffolding. The reader can summarise a story but cannot draw the graph of who-affects-whom.

Geopolitics Platform inverts that:

> **The aim is not coverage. It is interrelation comprehension.**

Every unit of content is one atomic claim. Every claim is a node in a graph. The user builds understanding by walking the graph — short page after short page — like reading a CIA daily briefing rendered as a flippable comic. A live world map and a daily-evolving briefing surface keep the picture current.

Categories ship one at a time. **V1 categories:**

1. **Shipping Industry** — players, alliances, lanes, money flows.
2. **Hormuz Crisis** — Iran/US/Israel/Gulf dynamics in the Strait of Hormuz and Red Sea, and what they do to shipping.

Later categories (energy, semis, AI export control, African mineral wars, etc.) follow the same template.

## IA, nesting, and the Self ↔ World switch

The Education layer already hosts **Self mode** — the eight self-development domains (emotional intelligence, wellbeing, organisational intelligence, creativity, agency, self-talk, relational intelligence, AI). Geopolitics introduces **World mode** as a sibling. One physical surface, two reading worlds.

```
/education                ← entry surface, big Self ↔ World toggle
├── /education/self       ← existing Self mode (8 domains)
└── /education/world      ← Geopolitics (this spec)
    ├── /world/program/   ← educational programs (Shipping Industry, Hormuz Crisis…)
    ├── /world/brief      ← daily brief
    ├── /world/weekly     ← weekly brief
    ├── /world/map        ← interactive world map (V2)
    ├── /world/intel      ← Shipping Intel — live dashboard (see below)
    └── /world/entity/:id ← entity profiles
```

The switch itself is a persistent segmented control at the top of every Education-layer page, with two pills (`Self` / `World`). Switching:

- Remembers the user's last route inside each mode, so flipping Self → World → Self lands them back where they left off in Self.
- Animates the colour palette (warm parchment everywhere; Self is warm-amber accents, World is intel-cold navy/amber/red accents).
- Survives reload via localStorage, syncs to account once accounts arrive.

Why nest under Education rather than ship as a separate app: the user's mental model is "places I go to learn." Geopolitics is one of those places. Keeping it under Education keeps the streak/progress system unified and gives every cross-link (e.g. a Self chapter on "agency under uncertainty" linking to a World page on "how Russia uses uncertainty as a weapon") a natural home.

## Design principles

- **One claim per page.** Title is the claim. Body is the evidence. Body ≤ 200 words, ideal 80–120.
- **BLUF (Bottom Line Up Front).** First line is the takeaway. Always.
- **Show confidence, not authority.** Each page tagged `HIGH / MED / LOW` confidence, sourced, dated.
- **Graph over feed.** No infinite scroll. Pages link to dependencies and downstream consequences explicitly. Reader walks the graph.
- **Intel-brief tone.** Direct, numeric, no marketing copy, no headline-bait. Monospace accents and tight cards, not glossy cover photos.
- **Gamify the walk, not the content.** Progress badges, streaks, briefing levels — never quizzes that turn understanding into trivia.
- **Updates are visible.** When a page's underlying facts have moved, the page is timestamped *and* surfaced in the daily brief.

## Architecture

### Content units (smallest → largest)

| Unit | What it is | Size |
|---|---|---|
| **Page** | One atomic claim. Title = claim. Body = evidence. | ≤ 200 words |
| **Chapter** | 5–12 ordered pages forming one mental model (e.g. "What is the Strait of Hormuz?"). | ~10 min total |
| **Program** | 3–8 chapters covering one topic end-to-end (e.g. "Hormuz Crisis Briefing"). | ~1 hour total |
| **Category** | Collection of programs sharing a domain (e.g. "Shipping Industry"). | open-ended |

### The page graph

Every page declares:

```yaml
slug: hormuz-oil-share
title: 20% of global oil moves through Hormuz
confidence: HIGH
last_verified: 2026-06-04
category: hormuz
chapter: what-is-hormuz
program: hormuz-briefing
depends_on: [strait-geography, global-oil-flows]   # read these first
feeds_into: [iran-leverage, gulf-naval-presence]    # this enables understanding of these
related: [bab-el-mandeb-share, suez-share]          # peer pages
entities: [iran, saudi-arabia, uae, china]          # nodes referenced
sources:
  - { ref: 1, title: "EIA Strait of Hormuz fact sheet", url: ..., date: 2025-12 }
```

`depends_on`, `feeds_into`, `related`, and `entities` are the connective tissue. Together they form a directed graph. The UI surfaces this graph as:

- **inline chips** at the bottom of each page ("Read first: [...]" / "Next: [...]")
- **a hoverable "why this matters" link** that highlights `feeds_into` paths
- **the interactive world map** (see below)
- **a knowledge-graph view** (later) showing the user their walked subgraph

### Entities

Entities are nodes that pages reference. Each entity has a profile page of its own.

- **Organisations:** CMA CGM, MSC, Maersk, COSCO, IRGC Navy, US 5th Fleet, OPEC+
- **People:** Rodolphe Saadé, Khamenei, Trump, Netanyahu, MBS
- **Places:** Strait of Hormuz, Bab el-Mandeb, Port of Marseille, Bandar Abbas, Fujairah
- **Vessels/Assets:** USS Gerald R. Ford, IRINS Makran, MSC Irina
- **Concepts:** war-risk premium, JCPOA, LNG order book, EU ETS

Pages reference entities; the map references entities; daily briefs are tagged by entity. One unified ID space.

## Reading surfaces

### 1. Page reader

Single page in focus. Big margins. Monospace badges. Vertical stack:

```
┌────────────────────────────────────────┐
│  CHAPTER · WHAT IS HORMUZ        2 / 9 │   ← progress chip + gamification hook
├────────────────────────────────────────┤
│  ┃ HIGH CONFIDENCE · UPDATED 2026-06-04│
│                                        │
│  20% of global oil moves                │
│  through Hormuz                         │
│                                        │
│  About 20 million barrels per day        │
│  transit the Strait — roughly one in    │
│  five barrels consumed globally. ...    │
│                                        │
│  ─── Read first ──────────────────────  │
│  · Where Hormuz sits geographically     │
│  · How global oil flows are mapped      │
│                                        │
│  ─── Then go ─────────────────────────  │
│  · Why this gives Iran leverage         │
│  · Why the US 5th Fleet sits in Bahrain │
│                                        │
│  ─── Sources ─────────────────────────  │
│  [1] EIA · Strait of Hormuz fact sheet  │
│  [2] Vortexa · Hormuz throughput 2025   │
└────────────────────────────────────────┘
```

Footer always: `Prev page` / `Mark read` / `Next page`. Swipe gestures on phone.

### 2. Daily brief

Generated every morning. A 5–7 card stack, swipeable.

```
Card 1 — TOP MOVEMENT
   "Iran seized a UAE-flagged tanker near
    Larak Island this morning."
   number: +$0.40 war-risk premium on VLCC
   linked entities: IRGC Navy · UAE · Larak

Card 2 — STATUS
   Hormuz: OPEN · throttled
   Red Sea: CLOSED to most container
   Panama: NORMAL · 36 transits/day

Card 3 — ONE CONNECTION
   "This is the third tanker seized this
    month → insurance market re-pricing →
    CMA CGM and MSC quietly hedging fuel."
   walks the graph for one step

Card 4 — DEEPER
   "→ Want the why? Read: Iran's tanker-
    seizure playbook (4 min)"

Card 5 — WATCHLIST
   In the next 48h, watch for:
    · US 5th Fleet posture change
    · Brent above $92
    · COSCO route note
```

Cards are timestamped. Hitting "open page" jumps into the page reader at the relevant claim. Streak counter increments only if the user opens at least one card.

### 3. Weekly brief

Sundays. Narrative, longer-form. Three sections:

1. **The week in one paragraph** — 80 words, hand-written voice.
2. **Threads** — 3–5 stories that ran multiple days, each as 3–4 cards summarising the arc.
3. **Map of the week** — snapshot of the interactive map showing all this week's movements.
4. **Next week to watch** — 3 testable predictions with confidence.

### 4. Interactive map (V2)

A live world map. Two layers always on: oceans/ports + national borders. Toggleable layers:

| Layer | What it shows |
|---|---|
| Military | Carrier groups, IRGC fast-attack boats, Houthi missile range arcs |
| Commercial | Container lanes (Maersk, MSC, CMA CGM), tanker flows, port congestion |
| Energy | Crude exports, LNG terminals, pipeline alternatives to Hormuz |
| Sanctions | Sanctioned tankers, shadow fleet tracks |
| Diplomatic | State visits, sanction announcements, treaty events |

**Movements** drawn as arrows. **Relationships** drawn as connections. Each arrow / connection is clickable → opens the page that explains it.

**Time slider** along the bottom. Scrubbing rewinds movements (e.g., "show me the situation on 2026-05-01"). Default position: today.

**Entity-first navigation**: click any entity (port, ship, person) → its profile slides up, listing its recent movements + linked pages.

V2 implementation can lean on existing maritime AIS data sources (MarineTraffic, AIS Hub) for ships and editorial overlays for everything else.

### 5. Knowledge graph view (V3)

A personal-progress graph. Shows the user *the subgraph they have walked*. Encourages closing knowledge gaps ("you understand A and C — read B to connect them").

### 6. Shipping Intel (live dashboard)

Sibling to the educational programs. Where Programs / Brief / Map teach you *why*, Shipping Intel shows you *now*. Closer to a Bloomberg-Terminal-for-shipping than a magazine.

Route: `/education/world/intel` (shorthand `/intel`).

One-page dashboard, six tiles, designed to be scanned in under 30 seconds. Each tile clickable → drills into a page that explains today's number.

```
┌─────────────────────────┬─────────────────────────┐
│  CHOKEPOINT STATUS      │  WAR-RISK PREMIUM       │
│  HORMUZ   ▲ OPEN-throttled│  VLCC Gulf  +$0.42/100  │
│  RED SEA  ✕ CLOSED      │  Δ7d   ▲ 18 bps         │
│  PANAMA   ▲ NORMAL      │  Δ30d  ▲ 64 bps         │
│  SUEZ     ◑ DEGRADED    │  source: JLT, IUMI [n]  │
│  USEC     ▲ NORMAL      │                         │
├─────────────────────────┼─────────────────────────┤
│  FREIGHT RATES (SCFI)   │  CONTAINER INCIDENTS    │
│  Shanghai→Rotterdam     │  Last 48h: 4            │
│   1,820 USD ▼ 6.1%      │  Red Sea drone strikes  │
│  Shanghai→US West       │  Hormuz seizure attempts│
│   2,140 USD ▲ 2.0%      │  → see incident feed    │
├─────────────────────────┼─────────────────────────┤
│  CMA CGM WATCH          │  WHAT CHANGED TODAY     │
│  Share price            │  3 cards summarising    │
│  Fleet capacity (TEU)   │  today's headline shifts│
│  Latest filings         │  → open daily brief     │
└─────────────────────────┴─────────────────────────┘
```

**Data sources** (V1, kept honest about what's real-time vs editorial):

| Tile | V1 source | V2 source |
|---|---|---|
| Chokepoint status | Editorial — updated 2x/day by author | AIS-derived throughput vs baseline |
| War-risk premium | Editorial citation of JLT/IUMI weekly | Lloyd's List Intelligence licensed feed |
| Freight rates | Editorial pull from Drewry / SCFI weekly | Drewry API / Xeneta licensed feed |
| Incidents | Editorial feed (Lloyd's List + UKMTO bulletins) | UKMTO API + MarineTraffic event data |
| CMA CGM watch | Editorial; public Euronext data when listed | Direct CFO-letter / press webhook |
| Today's change | AI-assembled, human-reviewed | Same — AI in loop is fine here |

The discipline: **never fake real-time**. If a tile is updated daily, the timestamp says so. If a number is editorial estimation, the page behind it explains the basis.

**Intel ↔ Programs link.** Every tile has a "Learn this" link to the chapter that teaches the concept (e.g. "what is the war-risk premium?"). The two modes feed each other.

**CMA CGM Watch** is a customisable tile. In V1, hard-coded to CMA CGM (the product hook). In V2, the user can pin any company entity here.

## Programs and chapters — V1 content plan

### Category: Shipping Industry

**Program 1 — How container shipping actually works** (~1 hr)
- Chapter: The ship · the box · the terminal
- Chapter: Lanes (Asia–Europe, Trans-Pacific, intra-Asia)
- Chapter: The Big 9 carriers, ranked
- Chapter: The three alliances (Gemini, Premier, Ocean) and why they matter
- Chapter: How carriers actually make money (or lose it)

**Program 2 — The CMA CGM Group** (~45 min)
- Chapter: From Lebanon to Marseille — the Saadé story
- Chapter: The container fleet
- Chapter: CEVA Logistics — why CMA CGM bought a 3PL
- Chapter: Traxens, Kyutai, Air Cargo — the diversification bet
- Chapter: Media holdings (BFM, La Tribune, Brut, La Provence) — why
- Chapter: Decarbonisation order book (LNG · methanol · ammonia)
- Chapter: Africa strategy
- Chapter: Who works at CMA CGM and how they hire

**Program 3 — Shipping bottlenecks in 2026** (~30 min)
- Chapter: Hormuz · Bab el-Mandeb · Suez · Panama · US ports
- Chapter: EU ETS · IMO net-zero · FuelEU Maritime
- Chapter: Newbuild overcapacity vs scrapping

### Category: Hormuz Crisis

**Program 4 — What is the Strait of Hormuz?** (~30 min)
- Chapter: Geography · the 21-mile pinch
- Chapter: What flows through it (and what doesn't)
- Chapter: Why Iran can throttle it but not close it for long
- Chapter: Alternatives (East–West pipeline, Habshan–Fujairah)

**Program 5 — The Iran/US/Israel triangle** (~1 hr)
- Chapter: A 30-year compressed timeline (1979 → 2026)
- Chapter: The current alignment map (US/Israel/UK/EU ↔ Iran/Russia/China/proxies)
- Chapter: Who funds whom · with what · how do we know
- Chapter: The role of Saudi, UAE, Qatar, Turkey, Egypt
- Chapter: China's exposure (oil imports, Belt and Road, COSCO)
- Chapter: Russia's exposure (sanctions evasion, Northern Sea Route)

**Program 6 — How the 2025–2026 escalation actually unfolded** (~45 min)
- Chapter: Israeli strikes · timeline
- Chapter: US involvement · timeline
- Chapter: Iranian retaliation · timeline
- Chapter: Tanker seizures, mine incidents, attribution disputes
- Chapter: War-risk premiums and what they cost CMA CGM, MSC, Maersk

**Program 7 — What it does to global shipping** (~30 min)
- Chapter: Tanker reroutings around Hormuz
- Chapter: Container reroutings around Bab el-Mandeb
- Chapter: Oil price · freight rate · insurance cost feedback loop
- Chapter: Who's winning, who's losing

## Gamification

Three light, non-trivia mechanics — designed to reinforce *the walk*, not test recall.

1. **Page count + chapter badges.** Reading a page increments a counter. Finishing a chapter unlocks a small badge. Visible on profile and in the daily brief footer.
2. **Briefing streak.** Reading at least one daily-brief card per day keeps the streak. Breaks reset. Streaks of 7, 30, 90 unlock cosmetic "briefing officer" titles.
3. **Connection of the day.** Each daily brief offers one explicit connection (a graph edge). Tapping "I see it" logs the edge in the user's personal graph view (V3). Cumulative — the user literally watches their understanding network grow.

No multiple-choice quizzes. No leaderboards. No streaks that feel like Duolingo guilt.

## Data model (rough)

```ts
type Page = {
  slug: string
  title: string           // the claim
  body: string            // ≤ 200 words
  bluf: string            // 1-line takeaway, often same as title
  confidence: 'HIGH' | 'MED' | 'LOW'
  last_verified: string   // ISO date
  category: string
  chapter: string
  program: string
  depends_on: string[]    // page slugs
  feeds_into: string[]    // page slugs
  related: string[]       // page slugs
  entities: string[]      // entity slugs
  sources: { ref: number; title: string; url: string; date: string }[]
}

type Entity = {
  slug: string
  kind: 'org' | 'person' | 'place' | 'asset' | 'concept'
  display_name: string
  short_blurb: string
  pages: string[]         // pages where it appears
  movements: Movement[]   // for assets/places
}

type Movement = {
  entity: string
  from: { lat: number; lng: number; label?: string }
  to:   { lat: number; lng: number; label?: string }
  at: string              // ISO datetime
  page: string            // page that explains it
  layer: 'military' | 'commercial' | 'energy' | 'sanctions' | 'diplomatic'
}

type DailyBrief = {
  date: string
  cards: BriefCard[]
}
```

Pages, entities, briefs all live in the repo as MDX/JSON during V1. Authoring is editorial. Move to a CMS only once daily volume justifies it.

## Content sourcing and update model

Pages are not generated. They are **authored, AI-assisted, and editorially gated**.

| Step | Who | What |
|---|---|---|
| Draft | AI (in-app tooling) | Given a claim, a few primary sources, and the page template, produce a 120-word draft + confidence rating + source attributions. |
| Review | Author (you, then a small team) | Edit for voice, kill weasel words, downgrade confidence if sources thin, add `depends_on` / `feeds_into`. |
| Source-check | Author + an adversarial AI pass | Each citation re-fetched, each claim must trace to a source. Disagreements flagged. |
| Publish | Author | Page goes live. Daily brief schedules a card if change is material. |
| Re-verify | Cron | Every page re-checked every N days (N = 7 for HIGH-volatility pages, 30 for slow ones). If a source 404s or a number is stale, the page is auto-marked `STALE` until re-reviewed. |

**Versioning.** Every page edit creates a new version. The page reader shows "updated X days ago" and a tiny diff button revealing what changed. This is what makes the brief feel trustworthy.

**The deep-research workflow already in this repo** (the one that produced the shipping/Hormuz report) is the seed of the AI-draft step. It fans out searches, fetches sources, adversarially verifies claims. The output of that workflow is *input* to authoring, not the published page.

## Identity, accounts, and pricing

**Anonymous tier.** No account needed. Local progress, streak, knowledge graph all in localStorage. All Self-mode content remains free here (already the case). World mode: 1 free program, daily brief read-only (no streak), no map V2.

**Account tier (free).** Email or Google. Cross-device sync of progress, streak, knowledge graph. Full access to all programs. Daily brief streak counts. Map V2 access. This is the default tier — same as a Substack free reader.

**Pro tier (paid, B2C — ~€8/month).** Personalised briefings by role (insurer / trader / shipping ops / policy). Weekly brief sent via email. Push alerts on watched entities ("CMA CGM share fell more than 3%", "tanker seizure in your watched chokepoint"). Export pages to PDF. Early access to new categories.

**B2B tier (per-seat, ~€40/seat/month or contract).** White-label briefings tied to one company's interests. Custom entities (e.g. CMA CGM's own ships, terminals, customers). Admin dashboard for the briefing officer at that company. SSO. Procurement-friendly invoicing. The CMA CGM product (see [`cma-cgm-product.md`](./cma-cgm-product.md), pending) is the canonical B2B case.

**Why this matters for the spec right now:** every page has to be writeable without identity (so authoring can happen offline), but every page render has to ask the identity layer "what tier is this reader?" and gate accordingly. Both surfaces — read and write — are identity-aware from day one, even if the only tier in V1 is anonymous.

## Colourmap × shipping crossover

The wellness/emotion platform (`colourmap-v2`) and Geopolitics are different products but share a builder, an aesthetic system, and an AI pipeline. There is a real crossover opportunity in shipping:

| Colourmap capability | Shipping pain it could touch |
|---|---|
| Mood/coherence tracking, journaling, reframe cycles | **Crew mental health at sea** — months-long contracts, isolation, suicide rates higher than land averages. A licensed crew-wellbeing module would land. |
| Personal arc & life scan | **Captain / chief-officer career coaching** — narrative-arc tooling for senior crew transitions to shore-side. |
| Education layer / CoachNote | **Onboard learning** — short, comic-style training units that survive low-bandwidth ship internet. |
| AI-assisted note-taking + voice journaling | **Bridge-watch logbook augmentation** — voice notes during watch get structured into incident logs. |
| Ritual + connection system | **Crew rotation rituals** — anchoring practices for handovers and first-week-aboard. |

This is **not** a Geopolitics V1 feature. It is a strategic asset: the same builder, the same design system, two complementary products under one studio. When pitching CMA CGM, the colourmap side becomes a credible second product — *"here is the geopolitics intel surface, and here is the wellness surface for your seafarers"* — which is significantly harder for a competitor to copy than either alone.

Memory and crossover dependencies tracked in [[project_colourmap_shipping_crossover]].

## Visual language and storytelling hooks

V1 voice is locked (warm parchment + intel-cold accents, monospace badges, BLUF-first). V2 lifts the storytelling layer toward proper editorial-grade infographics. The slots:

- **Page-level visual:** every page may carry a small embedded graphic (sparkline, stacked bar, two-state diagram, choropleth slice). Authoring tool will offer these as primitives, not a chart-anything sandbox.
- **Chapter-level visual:** every chapter may have a single "hero graphic" — usually a small custom diagram (think Tim Urban / Wait But Why). Optional in V1, expected by V2.
- **Brief-level visual:** the daily brief carries one "headline graphic" (sparkline of war-risk premium, or arrow-on-map for a movement).
- **Map-level visual:** the interactive map's aesthetic is military stencil layered onto warm parchment basemap. Movement arrows are time-encoded (fading tail = older). Static map exports become the weekly brief's hero.

### The five design rules (baked from the visual-storytelling research)

The infographic-styles workflow returned a coherent design playbook. Bake these into every page, brief, and map. Full cited research at [`docs/research/visual-storytelling-2026.md`](../research/visual-storytelling-2026.md).

1. **Truth first, beauty as service.** Inherit Tufte's chartjunk anti-pattern: every drop of non-data ink must justify itself. Sparklines, small multiples, slopegraphs are the canonical primitives — not the exception.
2. **Pick the chart family by intent.** Use the FT Visual Vocabulary's nine families (deviation, correlation, ranking, distribution, change over time, part-to-whole, magnitude, spatial, flow) as a decision tree. For geopolitics, **Flow** (Sankey, chord, network) does most of the work — trade routes, troop movements, money laundering, migration.
3. **Maps are gated, not default.** FT verbatim rule: spatial only when geography itself carries the meaning. A war is not always a map story. Force every map placement to answer: "would a slopegraph or a flow chart say this better?"
4. **Scroll is a trigger, not decoration.** Editorial scrollytelling has a peer-reviewed five-technique taxonomy (Oeschger et al., 2022 — graphic sequences, animated transitions, panning/zooming, scrolling through movies, autoplaying animation). Build with **CSS `position: sticky` + Scrollama**, not bespoke scroll listeners. Each scroll step earns exactly one reveal.
5. **Comics earn their place.** Where humans and motivations matter more than numbers — Saadé's strategy meetings, Khamenei's last day, a captain's first month at sea — switch to illustration. Comics-form non-fiction is a legitimate primary medium (The Nib). Use sparingly so it stays signal.

### Recommended Next.js stack (cited in the research doc)

| Slot | Library | Why |
|---|---|---|
| Static charts | **Observable Plot** (or **Visx** for full-control React) | Concise, ergonomic, builds on D3. Use D3 raw only when Plot/Visx can't reach. |
| Sparklines & small multiples | **Observable Plot** | First-class small-multiple facets. |
| Richer dashboards (Shipping Intel tiles) | **ECharts** | Production-grade, broad chart set. |
| Editorial scrollytelling | **Scrollama** + CSS `position: sticky` | Peer-reviewed pattern; Pudding engineering posts as primary source. |
| Maps (base) | **Mapbox GL JS** | Storytelling template (JSON chapters, flyTo/easeTo/jumpTo, declarative `onChapterEnter`/`onChapterExit` layer arrays). |
| Maps (data layer) | **deck.gl** | GPU-accelerated; proven at 3.6M points (Speed Tests Map). Required for AIS/movement scale. |
| Movement flows | **Flowmap.blue** (deck.gl + flowmap.gl + Mapbox) | Off-the-shelf for migration, marine traffic, trade flows. |
| 3D globe (V3) | **Three.js / react-three-fiber** | When the world map needs to *be* the graphic, not a tile. |
| Editorial motion | **Framer Motion** | Purposeful, not decorative — no Lottie unless a graphic is genuinely illustration-grade. |
| Typography | Existing serif (warm-parchment system) + monospace badges + **tabular-nums** for every number | Per Datawrapper's typography-for-dataviz guide. |
| Colour | **ColorBrewer2** palettes — sequential for choropleths, diverging for "before/after", qualitative for categorical layers | Don't invent palettes. |

### Reference benchmarks (teardowns to study before building)

- **Periscopic — *U.S. Gun Deaths*.** Reframes incident counts as "stolen years" (premature mortality). Directly transferable: reframe Hormuz tanker counts as "barrels not delivered" or "ship-days lost." This is the Periscopic move.
- **The Pudding — sticky-graphic scrollytelling.** Read both engineering posts ([how-to-implement-scrollytelling](https://pudding.cool/process/how-to-implement-scrollytelling/), [scrollytelling-sticky](https://pudding.cool/process/scrollytelling-sticky/)) before writing your first scroll-driven page.
- **FT Visual Vocabulary** ([github.com/Financial-Times/chart-doctor](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)). The decision tree. Bookmark.
- **Mapbox Storytelling** ([github.com/mapbox/storytelling](https://github.com/mapbox/storytelling)). Clone, run, then build on top.
- **deck.gl showcase** ([deck.gl/showcase](https://deck.gl/showcase)). For the moment when AIS density breaks SVG.

### Three things explicitly *not* to do (anti-patterns from the research)

- **Don't invent military-style symbology from screenshots.** ISW, Janes, BBC Verify have real conventions; reverse-engineering from images leads to inconsistency. Either find a primary style guide or commission one.
- **Don't sprinkle Lottie animations as decoration.** Motion principle: purposeful, not ambient. Every animation must reveal a relationship, not signal liveliness.
- **Don't quote "comprehension improves by X%" effect sizes.** No verified claim in the research carries a comprehension-percentage. If a stakeholder asks for one, refuse — and explain why.

## People to reach (verified roster)

The Geneva/people deep-research has landed. The verified list separates **strategic decision-makers** (final approvers) from **approach-window contacts** (who actually engage with student-stage builders). Cold approaches should target the approach-window layer first.

Full report at [`docs/research/geneva-and-people-2026.md`](../research/geneva-and-people-2026.md).

### CMA CGM — strategic layer (Marseille)

| Name | Role | Notes |
|---|---|---|
| Rodolphe Saadé | Chairman & CEO (since Nov 2017) | Final decision-maker on strategic bets. Don't lead here. |
| Tanya Saadé Zeenny | Director and Executive Officer | Family principal; diversification driver. |
| Christine Cabau Woehrel | EVP Assets and Operations (since 2019) | Owns fleet, terminals, energy, operations. Public on LinkedIn. Sokhna/Jeddah/Mombasa terminal projects sit under her remit. |
| Mathieu Friedberg | CEO of CEVA Logistics | Confirmed via DST News appointment piece. |

### CMA CGM — **approach windows** (where to actually start)

| Name / Mechanism | Role | Why this is the entry point |
|---|---|---|
| **Jean Fauquembergue** | Head of AI, CMA CGM (ex-BNP Paribas / Société Générale, ENSAE Paris) | Personally judged the HEC AI challenge Sept 2025. Publicly identifiable. Demonstrably engages with student-stage builders. |
| **Agnès Mossina** | Head of Marketing & Studies | Co-judged the same. Public. |
| **ZEBOX (Ignite + Accelerate)** | CMA CGM's two-track startup accelerator | Verbatim: "the gateway to collaboration with the CMA CGM Group." Initiated by Rodolphe Saadé personally. Open call. |
| **CMA CGM Startup Awards** | Yearly, tied to AIM Marseille forum (Nov) | Up to €150 k pilot funding, one year ZEBOX support, "privileged access to CMA CGM's decision-makers." |
| **Tangram (Marseille)** | Innovation/training hub — 8,500 sqm, 3,000+ employees/year | Hosts joint research chairs with HEC. The physical space where builders embed. |
| **Mistral AI × CMA CGM** | 5-year, €100 M / $110 M partnership (April 2025) | Dedicated Mistral teams embedded at Marseille HQ. The French-AI-scene channel. |

### MSC — Geneva HQ

| Name | Role | Confidence |
|---|---|---|
| Søren Toft | CEO (since 2020, ex-Maersk COO) | High |
| Diego Aponte | Group President; family principal | High (handover from Gianluigi documented) |
| Innovation / digital / AI head | **Unverified — open** | Needs another sourcing pass |

### Geneva commodity traders (SUISSENÉGOCE board, 2025-2027)

For the trader-side outreach. The board itself is the addressable network.

| Name | Company | Role |
|---|---|---|
| Nicolas Matter | Walter Matter SA | SUISSENÉGOCE President |
| Rob Abbott | Vitol SA | SUISSENÉGOCE Vice-President |
| Stephan Jansma | Trafigura | Board |
| Dominique Le Doeuil | Cargill International | Board |
| Sebastien Landerretche | Louis Dreyfus Company Suisse | Board |
| Jerome Daven | ADM International | Board |
| Marcelo Martins | COFCO International | Board |
| Jeff Webster | Gunvor | Board |

### Trader CEOs (operating layer)

| Trader | CEO | Note |
|---|---|---|
| Trafigura | **Richard Holtum** (since 1 January 2025) | Jeremy Weir is now Chairman. Any pre-2025 source naming Weir as CEO is stale. |
| Vitol | Russell Hardy | Stable. |
| Gunvor | Torbjörn Törnqvist | Founder. |
| Mercuria | Marco Dunand | Founder. |
| Glencore | Gary Nagle | Listed; Baar HQ. |

### Events to mark on the calendar

| Event | Date | Venue |
|---|---|---|
| **Posidonia 2026** | 1-5 June 2026 | Metropolitan Expo, Athens |
| **CMA CGM Startup Awards (next edition)** | TBC | Marseille, watch ZEBOX |
| **SITL Paris** | 23-25 March 2027 | Porte de Versailles |
| **SUISSENÉGOCE Academy Master in Commodity Trading** | Rolling | University of Geneva |

### Approach strategy in three rules (from the research)

1. **Pitch the product, not the CV.** The "6-month internships open to all disciplines" claim was *refuted* by the workflow — CMA CGM does not use generic-CV channels for digital/AI/product talent. They want a thing built.
2. **Use HEC's demonstrated case as the template.** September 2025 HEC × CMA CGM AI Challenge: 32 students, 6 teams, 1 week, AI-powered business intelligence for logistics. Judged by Fauquembergue and Mossina personally. The channel exists; the question is how to enter it. Either cold-mail the judges with a real artifact, or get Albert School to mirror the HEC arrangement.
3. **Go through ZEBOX with a working product.** Ignite track accepts MVP/prototype stage. The realistic pitch for a young builder: the Geopolitics Intel V1 page reader + a CMA-CGM-skinned daily brief + a SeafarerNote phone demo + a 6-week pilot proposal.

### 2024 Startup Award winners — tonal study

Track these to read what CMA CGM picks. The selection is broad — decarb, ops AI, cybersec, media — not narrowly maritime. **Implication:** an intel/wellbeing twin-product fits the pattern.

- **Aerleum** — direct air carbon capture.
- **Elonroad** — inductive road charging.
- **GBMS** — quantum-resistant cybersecurity.
- **ZERO44** — vessel emissions software for carriers (closest cousin to Geopolitics Intel).
- **Okular Logistics** — computer vision for warehouse/port.
- **Optioryx** — AI cargo loading optimisation.
- **Argil** — generative AI for content.

### Refuted — do not rely on

- "CMA CGM offers 6-month internships at Marseille HQ open to students across all disciplines." **Refuted 0-3.**
- Specific media-partner attribution "BFM Business + La Tribune for Startup Awards." **Refuted 0-3** on the specific list — Awards mention "CMA Media coverage" generically; verify partner list before quoting.

## V1 build phases

| Phase | What ships | Why |
|---|---|---|
| **P0 · page reader** | One program, ~30 pages, hardcoded. Page reader + graph chips at bottom. | Prove the atomic-claim format and the BLUF voice work. |
| **P1 · daily brief** | 5–7 card daily brief, manually authored. Streak counter. | Prove the habit loop without the cost of generation. |
| **P2 · weekly brief + entities** | Sunday brief. Entity pages. Cross-linking entities ↔ pages. | The connective tissue starts paying off. |
| **P3 · interactive map** | Static map first (PNG snapshots from weekly brief). Then interactive map with layers and time slider. | The signature feature — but earn the audience first. |
| **P4 · personal knowledge graph** | "Your subgraph" view. Suggested next pages. Connection-of-the-day logging. | Compound retention. |

P0 and P1 ship in this repo, share the existing nav/auth shell, and reuse the design tokens from the colourmap-v2 codebase.

## Interaction

- Each page reachable by direct URL: `/geopolitics/<category>/<program>/<chapter>/<slug>`.
- Daily brief at `/geopolitics/brief` — auto-redirects to today's stack.
- Weekly brief at `/geopolitics/weekly/<iso-week>`.
- Entity profiles at `/geopolitics/entity/<slug>`.
- Map at `/geopolitics/map` — entity-clickable, time-sliderable.
- Reading any page or card increments local progress; syncs to Supabase once accounts arrive.

## Tone and visual language

- **Typography:** existing serif for body, monospace for badges, all-caps labels for confidence/layer chips.
- **Palette:** warm parchment background (consistent with Proportion Buddy / Art tracks), but accents are intel-cold (deep navy, alert amber, classified red) — visually distinct from the wellness tracks.
- **Iconography:** flat, military stencil for layers; no emoji.
- **Charts:** small, embedded sparklines and bar deltas, not full dashboards on every page.

## Done When

- A user can read all of "What is the Strait of Hormuz?" in 10 minutes and explain, unprompted, *why* Iran's seizure power matters to oil prices.
- A returning user finds today's brief in one tap, swipes through it in 90 seconds, and knows what changed.
- Every page has a `depends_on` and a `feeds_into`. No orphans.
- Every claim above LOW confidence has at least one cited source.
- The streak counter survives a reload and a device change (Supabase-backed).
- The platform reads as a *briefing*, not a *blog*.

## Later

- Personalised briefings by professional role (insurer / shipping ops / trader / policy staff).
- AI-assisted daily brief drafting with editorial review — never raw model output.
- B2B tier: white-label briefings for one company (this is the CMA CGM hook — see [`cma-cgm-product.md`](./cma-cgm-product.md), coming after deep-research lands).
- Multi-language: French first, then Arabic and Mandarin.

## Reflection — what to improve next

Reading the V0 spec back, the platform is well-shaped for *reading* but underspecified for *trust* and *adoption*. Concrete gaps to close before any code goes in:

1. **Trust must be visible, not just claimed.** Confidence tags exist. Versioned page history exists. Now make them *legible*: a "trust badge" on every page that opens a popover showing the source chain (who wrote it, what sources back it, when re-verified, what changed). Without this, the platform is indistinguishable from a fancy blog.
2. **The interrelation aim needs a measurable signal.** "Did the user understand the graph?" is currently faith. Add a lightweight signal: after every chapter, one optional "connect the dots" prompt (e.g. "drag a line from `Hormuz oil share` to the page it most affects"). No scoring, no quiz vibe — just a graph-edge confirmation that compounds in the user's personal knowledge graph.
3. **Live Shipping Intel needs a kill-switch for stale data.** A tile that hasn't been updated in N hours must visibly degrade (greyscale + "stale" badge), not silently mislead. Define N per tile (e.g. chokepoint = 12h, war-risk = 24h, freight rates = 7d). Pages stay legible offline; tiles don't.
4. **The daily brief needs a "thread" model, not just a card stack.** A real intelligence brief tracks running stories ("Hormuz throughput restoration — day 14"). Each thread is a long-lived series of cards across days, summarised on demand. Without threads the brief reads like Twitter; with threads it reads like the *Economist* Espresso.
5. **The interactive map needs an entity baseline before it ships.** Drop the V3 framing for the map and instead ship a *static-with-arrows* V2 first — a hand-curated weekly snapshot map with all this week's movements drawn. Real-time can come later. The static map alone makes the weekly brief 3x more sharable.
6. **AI-in-the-loop must be specced, not assumed.** Today the spec hand-waves "AI drafts pages." Tomorrow that means defining: (a) which model, (b) what system prompt holds the BLUF voice, (c) what tools it has at draft time (search? source-fetch?), (d) what the editor is shown to make accept/reject fast. Treat this as the same kind of spec as the page format. A `docs/specs/geopolitics-authoring-loop.md` companion doc.
7. **The colourmap × shipping crossover needs one concrete first product, not a matrix.** The matrix above is generative but soft. Pick *one*: "**SeafarerNote** — a 6-week onboard wellbeing program packaged as offline-capable comic-style daily prompts, in colourmap's existing CoachNote system, sellable to shipping HR teams." That is the wedge. Track in a sibling spec.
8. **The CMA CGM ask needs a one-pager, not a product spec.** Before any product is built for them, the deliverable is a short, beautiful one-pager: "Here is the brief, here is the intel dashboard, here is the colourmap module, here is what a 6-week pilot looks like." Treat that one-pager as a P0 build *in itself*, with a designed landing page (`/proposal/cma-cgm`). The product is downstream of the pitch — the pitch is the actual artifact a young builder ships to a CEO.
9. **Editorial volume must be honest from day one.** A daily brief, weekly brief, and 7 educational programs is a real authoring workload. Either staff up, accept a lower cadence (weekly brief only at first), or accept that AI-drafted-with-editor-review is the operating model. The spec should pick. Recommendation: **weekly brief launches first, daily brief launches when the AI-in-the-loop spec ships.** Anything else burns the founder.
10. **Accessibility and i18n cannot be V3.** This product is for working professionals, many on phones, some on intermittent connections, some non-anglophone. Bake screen-reader patterns, keyboard nav, low-bandwidth image strategies (LQIP, skeleton states), and French-first copy *into V1* rather than retrofitting.

The next concrete edits to this spec (already queued):

- Add a `Trust badge` data field to the page model and the rendering contract.
- Add a `Thread` content unit to the data model (alongside Page / Chapter / Program).
- Reframe map V2 as `weekly static map` and V3 as `live interactive map`.
- Spin off `geopolitics-authoring-loop.md` and `seafarer-note.md` companion specs.
- Spin off a `/proposal/cma-cgm` one-pager spec.

Once the two parallel research workflows land — infographic visual storytelling, and Geneva ecosystem + people-to-reach — re-open this spec and integrate:

- The recommended chart-library stack and the 5 design rules into `Visual language and storytelling hooks`.
- The verified executives list + entry-point events into `People to reach (V1 draft)`.
- The Geneva structural context into a new short chapter in the Shipping Industry program ("Why Geneva ended up running the freight desks").

## Appendix · Verified shipping & geopolitics snapshot (2026-06)

Sourced from the deep-research workflow that accompanies this spec; the full report is saved at [`docs/research/shipping-hormuz-2026.md`](../research/shipping-hormuz-2026.md). Numbers below are the verified anchors V1 content should be calibrated to.

- **Concentration:** Top 10 container carriers control ~84% of global capacity (~28.35M TEU combined). [Alphaliner, Jan 2026]
- **MSC #1:** 7.136M TEU, +13.2% YoY in 2025 (alone responsible for 39% of top-12 growth). Lead over Maersk widened to 2.524M TEU.
- **Maersk #2:** 4.612M TEU.
- **CMA CGM #3:** 4.140M TEU, with an aggressive 45.5% orderbook-to-fleet ratio — vs ~33.5% industry average. Signals continued capex-led expansion. Group consolidates APL, ANL, CNC, CoMaNav, Containerships, MacAndrews, Mercosul Line, SoFrana.
- **COSCO #4:** 3.586M TEU. **Hapag-Lloyd:** 2.390M TEU.
- **Hormuz trigger:** 28 February 2026, US-Israeli **Operation Epic Fury** — ~900 strikes in ~12 hours, killed Supreme Leader Khamenei. (Belfer Center, Howden Re, Wikipedia, multiple corroborators.)
- **Hormuz closure:** Iran declared the Strait closed on 4 March 2026.
- **War-risk repricing:** ~12x — from a pre-war baseline of 0.10-0.25% of hull value to 2-3% in March 2026; 3% specifically on US/UK/Israeli-linked vessels. (Howden Re.)
- **Oil:** Brent peaked at **$119/bbl on 19 March 2026** (+46% from ~$71 pre-war). US gasoline briefly hit ~$3.94/gallon. IEA released a record **400M barrels** — covering only ~20 days of typical Hormuz flow.
- **Proxy collapse:** Iran's "Axis of Resistance" structurally collapsed in the June 2025 12-day war. Hezbollah, Iraqi PMFs, and largely the Houthis took no significant action to defend Iran. Implication: future Iranian retaliation against shipping concentrates on Iran-direct (IRGC, Hormuz) rather than distributed proxy harassment. Caveat: Houthi Red Sea / Bab el-Mandeb activity remains the dominant *container* disruption vector — separate from the Hormuz/tanker dimension.
- **Russia-Iran alignment:** Formalised — December 2023 sanctions-cooperation declaration; January 2025 **20-year Comprehensive Strategic Partnership Treaty** (defense, cyber, energy, security). Russia and Iran share an explicit framing of the US as principal threat.
- **China posture:** Alignment with Russia/Iran is strategic but **not urgent** for Beijing (CSIS verbatim). China maintained declared neutrality through the March 2026 crisis despite a ~25% drop in Gulf crude imports and a 1-1.4 mb/d Iranian oil shortfall. Treat Hormuz as a logistics/price problem, not existential.
- **INSTC:** Russia-Iran-India 7,200 km road-rail-naval corridor, initiated 2000, accelerated post-2022 Ukraine invasion as sanctions-bypass infrastructure. Russia committing **€1.3bn+** to the €1.6bn Rasht-Astara railway segment (target completion Q3 2027).
- **Open gaps the research did not close:** (a) CMA CGM's direct Hormuz container exposure vs MSC/Maersk/COSCO; (b) the structural war-risk "new normal" after the March ceasefire; (c) verified COSCO transit decisions through 2026; (d) most of the CMA CGM diversification claim set (CEVA revenue, Kyutai investments, Air Cargo fleet, African terminal capacity, hiring) — Section 2 of the report flagged as needing fresh sourcing. The Geneva-and-people workflow (running) is expected to backfill executive names and approachability signals; the CMA CGM number set will require a dedicated follow-up pass.

## Appendix · Verified CMA CGM strategic snapshot (2026-06)

Sourced from the fourth deep-research workflow. Full report at [`docs/research/cma-cgm-2024-2026.md`](../research/cma-cgm-2024-2026.md). **25 confirmed, 0 refuted** in this pass.

### Group financials
- **FY2024:** Revenue **$55.5 bn** (+18% YoY), EBITDA **$13.4 bn** (24.2% margin).
- **FY2025:** Revenue **$54.4 bn** (-2%), EBITDA **$10.6 bn** (19.4% margin).

### Logistics (CEVA)
- **2025 revenue:** **$18.3 bn**. **Top-4 logistics operator globally** (DSV → DHL → Kuehne+Nagel → CEVA).
- **Bolloré Logistics acquisition** closed **29 Feb 2024** — largest acquisition in CMA CGM group history.

### Media (CMA Media — self-described 3rd-largest private French media group)
- **Altice Media (€1.55 bn).** BFM TV, BFM Business TV, RMC Découverte, RMC Story, 10 local channels. Cleared by Autorité de la concurrence **28 June 2024**, closed July 2024.
- Pre-existing print: La Provence, Corse Matin, La Tribune, La Tribune Dimanche.
- **Brut** (Sept 2025), **Cherie 25** (Oct 2025).

### Terminals
- **$2.5 bn deployed in 2025.** **66 terminals across 40 countries.**
- Cabau Woehrel's portfolio: Sokhna (1.7 M TEU), Jeddah Terminal 4 ($450 M JV with RSGT), Mombasa (~$800 M, France-Kenya cooperation).

### Decarbonisation
- **~$20 bn fleet decarbonisation envelope.**
- 12 LNG deliveries 2024, 27 LNG+methanol deliveries 2025.
- **Target: 153 low-carbon-capable vessels by 2029; 200+ by 2030.**
- Caveat: "low-carbon" labelling contested by environmental campaigners on methane-slip grounds; numerical commitments are not disputed.

### AI ecosystem — **€500 m total committed**
- **Kyutai** (co-founded 17 Nov 2023, Station F — Iliad/Niel + CMA CGM + Schmidt Futures; **€100 m from CMA CGM** of ~€300 m total).
- **Google Cloud strategic partnership** (18 July 2024) — across shipping/logistics/media.
- **Mistral AI strategic partnership** (6 April 2025, **€100 m / 5-year**) — Mistral AI Factory at Marseille HQ + AI Media Lab at Grand Central; **~20 Mistral engineers embedded**; Tangram trains up to 3,000 employees/year.
- Other AI bets: AMI Labs (LeCun, March 2026 $1.03 bn round), Poolside, Dataiku, Perplexity.
- **MAIA (Powered by Mistral) — agentic AI platform, rolling out 1 June 2026 to ~80,000 employees.** **55+ AI projects, 200+ use cases** as of late May 2026.

### Two verbatim Saadé quotes (use in the pitch)
- *"I would like the younger generation to benefit from all the opportunities that this technology has to offer."*
- *"place France and the rest of Europe at the forefront of artificial intelligence research."*

### Verified entry channel: **42 Marseille × CMA CGM partnership**
Documented named-case study via [42network.org](https://www.42network.org/blog/cma-cgm-42-marseille-partnership-angelo-gabriel-mikael/). The single most actionable verified template for "young French builder into CMA CGM with a built thing."
