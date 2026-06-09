# Visual Storytelling & Infographic Design — Research Brief

**Compiled:** 2026-06-09
**Audience:** Builder of the Geopolitics Platform — specifically informing the *Visual language and storytelling hooks* section of [`../specs/geopolitics-platform.md`](../specs/geopolitics-platform.md).
**Method:** Multi-agent fan-out web research. 25 claims adversarially verified, 22 confirmed, 3 refuted.
**Status:** V1 — the design playbook is locked. Implementation details (NYT R&D blog teardowns, ISW symbology primary sources) flagged as open questions.

---

## 1 · Infographic design traditions

### Tufte — the foundational grammar

Edward Tufte's canonical vocabulary is the grammar to inherit, full stop:

- **Sparklines** — "intense, simple, word-sized graphics" embedded in text. The unit of the Shipping Intel tile and the page-level inline number.
- **Small multiples** — repeated chart frames varied along one dimension (time, country, vessel). The canonical comparative form for any intelligence-brief comparative claim.
- **Slopegraphs** — for comparing rankings between two states (carrier capacity 2024 vs 2026, war-risk premium pre/post-Hormuz).
- **Data-ink ratio + chartjunk** — every drop of non-data ink must justify itself. Reject decorative gradients, drop shadows, 3D bars.

Tufte's own notebook entries on [sparklines](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/), [slopegraphs](https://www.edwardtufte.com/notebook/slopegraphs-for-comparing-gradients-slopegraph-theory-and-practice/), and [chartjunk](https://www.edwardtufte.com/notebook/chartjunk/) are the primary sources. These are stable canonical techniques — not fast-moving trends. [confirmed 3-0]

### Information is Beautiful — the editorial north star

David McCandless's framing:

> "Truth and beauty. The story beneath the story."

The verbatim Information is Beautiful philosophy is that an infographic distils data into beautiful, useful graphics, and that what makes data meaningful is **the relationships between facts** — context, connections, contrasts — not facts in isolation.

This *is* the editorial frame for a geopolitics intelligence brief. The user understands Hormuz not by memorising a number but by seeing how `Hormuz oil share → war-risk premium → bunker cost → CMA CGM exposure` chains. The platform's "page graph" is McCandless's editorial principle made structural.

Primary sources: [informationisbeautiful.net/about](https://informationisbeautiful.net/about/), [davidmccandless.com](https://www.davidmccandless.com/), McCandless's 2010 TED talk *The Beauty of Data Visualization*. [confirmed 3-0]

### Periscopic — the moral reframe

Periscopic's [*U.S. Gun Deaths*](https://guns.periscopic.com/) reframes incident counts as **"stolen years"** — projected life expectancy minus age at death. Orange (life lived) vs grey (years stolen) along projected life arcs. WHO life-expectancy data + 2010 FBI Unified Crime Report.

**Why this matters for geopolitics:** the Periscopic move is to take a raw number that the reader has been numbed to and find the moral reframe that makes it land. For Hormuz, candidates include:

- **"barrels not delivered"** instead of tanker counts attacked.
- **"ship-days lost"** instead of vessels rerouted.
- **"crew rotations cancelled"** instead of incidents reported.
- **"seafarer-months of contract extension forced by Cape rerouting"** — the colourmap × shipping crossover wedge.

Steal the technique. Build at least one Periscopic-style page in every Program. [confirmed 3-0]

### Nicholas Felton, Stamen, the broader tradition

Felton's *Feltron Reports* legitimised personal data as editorial content. Stamen Design (Watercolor maps, [stamen.com](https://stamen.com)) carried the aesthetic-and-data fusion into web cartography. Both are stylistic references for the *World mode* tone — data that feels handmade, not corporate-default.

These traditions were not separately verified in this workflow pass; treat as design references, not anchor claims.

---

## 2 · Interactive editorial benchmarks

### The scrollytelling taxonomy (peer-reviewed)

Oeschger, Renner, and Roth (NZZ graphics team), *Scrollytelling — an analysis of visual storytelling in online journalism*, **Information Design Journal vol 27 no 1, 2022**. The paper:

- Defines scrollytelling as *"a method to animate content as a reader scrolls through an article"*.
- Groups 50 examples into **five standard techniques**:
  1. Graphic sequences
  2. Animated transitions
  3. Panning and zooming
  4. Scrolling through movies
  5. Showing/auto-playing animated content

Use this taxonomy as the explicit menu when planning a chapter's visuals. Don't invent a sixth. [confirmed 3-0]

Primary: [jbe-platform.com IDJ paper](https://www.jbe-platform.com/content/journals/10.1075/idj.22005.oes). Corroborated by the EU's data visualisation guide mirroring the five categories.

### The two implementation patterns that matter

The Pudding's engineering posts ([how-to-implement-scrollytelling](https://pudding.cool/process/how-to-implement-scrollytelling/), [scrollytelling-sticky](https://pudding.cool/process/scrollytelling-sticky/)) document the two patterns that account for ~90% of editorial scrollytelling:

- **Scroll-to-trigger chart state changes.** A chart updates as the reader scrolls past annotation steps.
- **Sticky graphic + scrolling text.** One graphic stays fixed in viewport; the text scrolls past, each step triggering a layer change.

Implementation rule (Pudding verbatim): the *layout* is CSS `position: sticky`; the *triggers* are a lightweight step library. Russell Goldenberg's **Scrollama** has become the de facto standard. Bespoke scroll listeners are an anti-pattern.

Six historical libraries listed in the Pudding post (Waypoints, ScrollStory, ScrollMagic, graph-scroll.js, in-view.js, roll-your-own) predate IntersectionObserver. Don't pick from this list; pick **Scrollama**.

[confirmed 3-0 across both Pudding posts]

### FT Visual Vocabulary — the chart picker

[github.com/Financial-Times/chart-doctor/visual-vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) is the FT graphics team's open-sourced chart-picker decision tree. **Nine families** keyed by communicative intent:

| Family | When to use | Geopolitics example |
|---|---|---|
| Deviation | Variation from a fixed reference (zero, target) | War-risk premium vs pre-war floor |
| Correlation | Relationship between two variables | Brent vs Hormuz throughput |
| Ranking | Ordered positions | Top 10 carriers by TEU |
| Distribution | Frequency / spread | Vessel age in the world fleet |
| Change over time | Time series | Containership orderbook 2010-2026 |
| Part-to-whole | Composition | Alliance shares of Asia-Europe lane |
| Magnitude | Absolute sizes | Fleet size dot grids |
| **Spatial** | When *geography itself* carries meaning | Hormuz vessel transit map |
| **Flow** | Volumes between states | Migration, trade routes, money flow |

For geopolitics the two heaviest-used families are **Flow** (Sankey, chord, network — money, troops, migrants, oil) and **Spatial**. Spatial is **explicitly gated** by FT's verbatim rule: use only when precise locations or geographical patterns matter more to the reader than anything else. This rule should sit at the top of the platform's authoring playbook. [confirmed 3-0]

### Pattern catalogue (cross-publication)

The peer-reviewed taxonomy and Pudding patterns combine into a working catalogue:

| Pattern | When | Implementation hint |
|---|---|---|
| Sticky graphic + scrolling annotations | A complex graphic needs guided reveal | CSS sticky + Scrollama, 4-7 steps max |
| Step-by-step reveal | A relationship has 3+ moving parts | Same as above, with each step toggling a Mapbox/D3 layer |
| Before / after slider | Two states of one thing | A small library or custom — drag-handle clip path |
| Small multiples grid | Comparing the same chart across N items | Observable Plot facets |
| Choropleth slice | Geographic distribution of one variable | D3 or deck.gl; gate by Rule 3 |
| Sankey / chord | Flows between named entities | D3-sankey or Plot's flow primitives |
| Sparkline-in-table | Inline trends in a tabular layout | Plot or hand-rolled SVG |
| Hover-graph annotations | Discoverable detail without clutter | Tooltips with measured restraint |

---

## 3 · Interactive maps and geo-visual storytelling

### Mapbox Storytelling — the canonical scaffold

[github.com/mapbox/storytelling](https://github.com/mapbox/storytelling) is Mapbox's open-source no-code scrollytelling map. Mechanism:

- **JSON-configured chapters.**
- Three transition modes per chapter: `flyTo` (default), `easeTo`, `jumpTo`.
- **`onChapterEnter` / `onChapterExit`** — declarative arrays of `{layer, opacity}` pairs fired on scroll-driven step events. (Note: precise terminology — these are declarative config arrays, *not* JS callbacks; a separate `callback` string property is the actual JS hook.)

Used by Washington Post, Al Jazeera, Conservation Land Federation, plus the eight case studies on the [Mapbox blog](https://www.mapbox.com/blog/8-compelling-stories-told-with-the-storytelling-solution).

For the Geopolitics platform's V2 *weekly static map* and V3 *interactive map*, this template is the start. Fork it, theme it warm-parchment + intel-cold, layer Houthi missile arcs and tanker tracks on top. [confirmed 3-0]

### deck.gl — when SVG breaks

[deck.gl](https://deck.gl/) is the GPU-accelerated layer library. Proven at **3.6 million points** in the Internet Speed Tests Map showcase (Measurement Lab BigQuery, June 2023). When AIS density, Houthi attack incidents over 6 months, or oil-tanker plot points break SVG / D3, switch to deck.gl. [confirmed 3-0]

### Flowmap.blue — movement flows off the shelf

[flowmap.blue](https://www.flowmap.blue/) (deck.gl + flowmap.gl + Mapbox) is the off-the-shelf solution for aggregated movement flows. Documented use cases verbatim: *"human or bird migration, refugee flows, marine traffic, freight transportation, trade between countries, supply chains."* Directly relevant to the intelligence-brief movement visualisation. [confirmed 3-0]

### Military-style cartography (open question)

ISW, Janes, BBC Verify, and CSIS have distinct conventions — line weights, arrow heads, contested-area hatching, choropleth confidence bands. **None surfaced as primary style guides in this workflow pass.** Don't reverse-engineer from screenshots: the inconsistency will show. Either:

- find a primary military symbology guide (NATO APP-6 / MIL-STD-2525 are real and downloadable — that's the canonical symbology system), or
- commission an in-house style guide before the V2 map ships.

### Refuted claim to ignore

The first-pass workflow asserted that **CSIS Ukraine war map is built on Shorthand**. That claim was **refuted 0-3**. The map is custom Mapbox/deck.gl. Treat CSIS as a teardown reference, not a Shorthand case study.

---

## 4 · Comic and illustration infographics

### The legitimisation

[The Nib](https://thenib.com/) (founded 2013 by Pulitzer-finalist Matt Bors) explicitly self-positions:

> "Political satire, journalism and non-fiction... All in comics form, the best medium."

This is the editorial cover for fusing illustration with a CIA-brief tone. Comics-form non-fiction is a recognised journalism medium. Use it. [confirmed 3-0, with caveat: this is The Nib's self-positioning, not an objective claim.]

### Where comics beat charts

Comics earn their place specifically when:

- **People's motivations matter more than numbers.** Rodolphe Saadé in a strategy meeting. A captain on the bridge. Khamenei's last day. A Trafigura desk re-pricing Iran crude.
- **The story is a sequence of decisions.** "Then he did X because Y" reads cleaner as panels than as a chart.
- **The story is about *the absence* of data.** A blank panel works where a chart can't say "we don't know."
- **The reader needs slowing down.** Comics gate eye-speed in a way a dashboard doesn't.

References: XKCD's info-comics, Tim Urban / [Wait But Why](https://waitbutwhy.com/), Maki Naro's science comics ([The Open Notebook 2017](https://www.theopennotebook.com/2017/01/31/pow-zap-bam-using-comics-to-tell-compelling-science-stories/) — secondary source), Box Brown's non-fiction graphic novels.

### Refuted claim to ignore

"The Nib's editorial approach prioritises visual narrative and accessibility over traditional written journalism formats, validating illustration-first treatments for audiences who would otherwise skim text briefs." **Refuted 0-3.** Use The Nib as a *legitimisation reference*, not an empirical claim about reader behaviour.

---

## 5 · Implementation stack + design system advice

### The recommended Next.js stack

Already incorporated into [`../specs/geopolitics-platform.md`](../specs/geopolitics-platform.md) — see "Recommended Next.js stack" table there. Summary: **Observable Plot + Visx** for charts, **ECharts** for richer dashboards, **Scrollama + CSS sticky** for scrollytelling, **Mapbox GL JS + deck.gl + Flowmap.blue** for maps, **Three.js / r3f** for 3D globes, **Framer Motion** for editorial motion, **tabular-nums** typography, **ColorBrewer2** palettes.

### Five design rules (already in the spec)

1. Truth first, beauty as service.
2. Pick chart family by intent (FT Visual Vocabulary).
3. Maps are gated.
4. Scroll is a trigger, not decoration.
5. Comics earn their place.

### Open questions for the next research pass

These survived the workflow as unresolved:

1. **NYT / Bloomberg / Reuters / FT / Le Monde / ProPublica documented pattern catalogues** — beyond the general scrollytelling taxonomy, do their methodology blogs publish their specific repeatable patterns (before/after slider, step reveal, small-multiples grid) as 2020-2026 primary sources?
2. **Military map symbology primary style guides** — beyond NATO APP-6 / MIL-STD-2525, what do ISW, Janes, BBC Verify actually publish about their conventions in 2024-2026?
3. **Stack tradeoffs documented in primary maintainer docs** — D3 vs Observable Plot vs Visx vs ECharts vs Recharts; Three.js vs r3f for 3D globes; Lottie vs Framer Motion vs GSAP for editorial motion — primary docs and battle-tested combinations in Next.js App Router specifically.
4. **Editorial typography + colour primary sources** — FT typography style guide, NYT colour token system, Mapbox sequential/diverging palette docs.

---

## Verification ledger

- **Angles searched:** 5 (design traditions, editorial scrollytelling benchmarks, interactive maps and military geo-visualisation, comic and illustration journalism, implementation stack and design systems).
- **Sources fetched:** ~30 (full ledger in the workflow output at `tasks/w2m36tf8p.output`).
- **Claims extracted:** ~120.
- **Verified adversarially:** 25.
- **Confirmed:** 22.
- **Refuted:** 3 (logged above — CSIS Ukraine map on Shorthand, Nib editorial-priority claim, broad "no-backend" overstatement on Mapbox Storytelling).
- **Sourcing bias:** Strong primary on Tufte, McCandless, Periscopic, Pudding, FT, Mapbox, deck.gl, The Nib. Weak primary on NYT R&D blog, Bloomberg Hyperdrive case studies, Le Monde Les Décodeurs methodology. Pattern catalogues from the latter group are inferred from outputs rather than cited from their engineering posts.

## Anchor sources

- Edward Tufte — [sparklines](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/), [slopegraphs](https://www.edwardtufte.com/notebook/slopegraphs-for-comparing-gradients-slopegraph-theory-and-practice/), [chartjunk](https://www.edwardtufte.com/notebook/chartjunk/).
- Information is Beautiful — [about](https://informationisbeautiful.net/about/) ; David McCandless — [davidmccandless.com](https://www.davidmccandless.com/).
- Periscopic — [U.S. Gun Deaths](https://guns.periscopic.com/).
- Oeschger, Renner, Roth (2022) — [Scrollytelling — IDJ vol 27 no 1](https://www.jbe-platform.com/content/journals/10.1075/idj.22005.oes).
- The Pudding — [how-to-implement-scrollytelling](https://pudding.cool/process/how-to-implement-scrollytelling/), [scrollytelling-sticky](https://pudding.cool/process/scrollytelling-sticky/).
- FT Visual Vocabulary — [github.com/Financial-Times/chart-doctor/visual-vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md).
- Mapbox Storytelling — [github.com/mapbox/storytelling](https://github.com/mapbox/storytelling), [Mapbox blog: 8 stories told with Storytelling](https://www.mapbox.com/blog/8-compelling-stories-told-with-the-storytelling-solution).
- deck.gl — [showcase](https://deck.gl/showcase) ; Flowmap.blue — [credits page](https://www.flowmap.blue/credits).
- The Nib — [thenib.com](https://thenib.com/).
- Datawrapper — [fonts for data visualization](https://www.datawrapper.de/blog/fonts-for-data-visualization).
- ColorBrewer2 — [colorbrewer2.org](https://colorbrewer2.org/learnmore/schemes_full.html).
