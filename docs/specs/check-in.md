# Check-in

> A fast emotional register that combines the Hawkins slider with the current CPC check-in pattern: `FACING`, a four-axis feeling compass, and inline `Challenge / Flow`.

## Context

No fast way to capture emotional state without friction. Journaling is slow and unstructured. Meditation apps do not capture anything. The current CPC check-in has a clearer shape than the older archive prototypes: a visible `FACING` row, a dedicated feeling compass, supporting chips, and inline `Challenge / Flow`. V2 should absorb that product behavior without porting the old code or the old app shell.

The live CPC check-in also carries a very specific visual grammar that matters to the product behavior: two-part emotional flow, framed cells instead of generic cards, mixed typography, warm notebook paper, and selective color. The spec must preserve that identity, not just the data fields.

## Behavior

- One screen. No navigation to reach it.
- Hawkins-inspired emotional slider: spectrum from heavy/contracted to light/expansive. Not the formal Map of Consciousness — a simplified feeling scale.
- User must intentionally move the slider before submitting. Neutral by default is display-only, not a valid accidental submission.
- Optional free-text note field. Can be skipped entirely.
- The note prompt should feel alive, not generic. Its placeholder line may shift with time and should echo the current minute in a poetic or lightly rhyming way, similar to the live CPC behavior where the sentence changes minute by minute.
- The check-in is structurally in two emotional parts:
  - Part 1: the immediate register, centered on the Hawkins bar and optional note.
  - Part 2: the guided reflective field, centered on `FACING`, the feeling compass, stage, support chips, and inline `Challenge / Flow`.
- These two parts must feel distinct but continuous on one screen. The user should sense a fast top layer and a deeper optional lower layer, not a pile of unrelated controls.
- `FACING` appears as a visible row of letter-buttons in the check-in, not as a hidden advanced toggle.
- Selecting a `FACING` letter opens one reflective prompt family at a time.
- Each `FACING` family uses a short progressive 3-question chain. The user can answer one, some, or all prompts.
- The `FACING` system must support the current CPC-style reflective families, including `Fear`, `Avoidance`, and `Confusion`. Additional families may be supported, but the row remains compact.
- The feeling section includes a compact four-axis compass with these dimensions: `Attitude`, `Emotions`, `Presence`, and `Body`.
- Below the compass, the user can select a discrete feeling stage on a short stepped scale.
- Below the stage selector, the user can optionally pick supporting chips such as `Confidence`, `Openness`, and `Gratitude`.
- The check-in also includes two optional inline expansions below the main feeling section: `Challenge` and `Flow`.
- `Challenge` captures what feels blocking or difficult right now.
- `Flow` captures what feels open, moving, or supportive right now.
- Supporting pulse-like signals should be expressed through the feeling compass and related structured fields, not through a second heavy form.
- Single submit action. No multi-step flow.
- On-demand. No scheduled cadence, no streaks, no reminders.
- Fast path remains under 30 seconds.
- Full optional path should still feel lightweight and stay under 60 seconds.
- CPC parity is behavioral, not literal. Do not port the old repo's extra cockpit cards, energy wheel, questionnaire mode, or local-storage-heavy layout into this feature.
- Persist structured data for the core slider, note, `FACING`, feeling compass, stage selector, support chips, `Challenge`, and `Flow` so history, AI reflection, and later analysis can use them cleanly.

## Visual And Interaction Language

- The check-in should read like a drafted notebook plate or cockpit spread, not a generic app form.
- Use a cell system: bordered regions, ruled separations, compartment-like zones, and deliberate spacing. Avoid interchangeable SaaS cards.
- The feeling side should have a central compositional anchor, like the CPC compass area, with supporting controls radiating around it.
- The visual tone should combine two ingredients at once:
  - a pirate log / Leonardo notebook / parchment-paper base
  - a colorful, playful emotional layer that can feel almost childlike in its dots, chips, letters, and active accents
- Typography must intentionally mix roles:
  - serif or editorial structure for stable labels and section anchors
  - cowboy or western-style display accents, or old printing-machine display faces, for key titles or emphasized markers
  - handwritten, ink-like script for human prompts, reflective cues, or intimate phrases
- This mix should feel studied and coherent, like a field journal assembled over time, not like a novelty theme pack.
- Microcopy should participate in the atmosphere. Time-based prompt lines such as the note placeholder should feel written, playful, and alive rather than system-generated.
- Color must be restrained and strategic: emotional letters, active chips, and feeling states may carry color, while the paper base remains calm and warm.
- On light/pale pill surfaces, labels such as `FACING`, `Body`, `Attitude`, `Structure`, `Challenge`, `Flow`, and the emotions reflection prompts use deep sepia ink (`#5C3018` via `--light-pill-text`), not ochre-on-beige. The emotional color stays in dots, fills, bars, borders, and active selected states.
- The design should preserve the Leonardo notebook / captain's log / pirate-ink recipe the CPC app already established, while also keeping the playful color notes that make the interface feel alive rather than antique.
- The check-in should visually support scanning by cells:
  - top emotional register
  - `FACING` prompt cell
  - feeling compass cell
  - support and stage cell
  - `Challenge / Flow` lower cells
- Mobile may stack these cells vertically, but the hierarchy must remain obvious.

## States & Edge Cases

- Empty state: slider defaults to center position. User must move it intentionally before submitting.
- Note field empty: valid submission. Note is always optional.
- `FACING` untouched: valid submission. Check-in still works as slider plus optional note.
- One `FACING` family partially filled: valid submission. Save only answered prompts.
- User switches from one `FACING` family to another in the same session: previously entered answers remain in-session until submit or page exit.
- Feeling compass untouched: valid submission.
- Feeling compass filled without note or `FACING`: valid submission.
- `Challenge` empty and `Flow` empty: valid submission.
- User fills `Challenge` without `Flow`, or `Flow` without `Challenge`: valid submission.
- User submits several check-ins in a row with different depth across slider, `FACING`, compass, and `Challenge / Flow`: valid. No attempt to normalize or force parity between entries.
- Rapid successive check-ins: all persisted. No throttling — if the user wants to check in 5 times in a row, let them.
- Offline: not handled in V1. Requires network.

## Done When

- User can open the app, move a slider, optionally type a note, and submit in one fluid interaction without touching advanced fields.
- User can use the visible `FACING` row to answer one reflective prompt family and submit in the same screen.
- User can fill the four-axis feeling compass, select a feeling stage, optionally choose support chips, and submit in the same screen.
- User can optionally add `Challenge` and `Flow` reflections inline below the feeling section.
- The screen clearly reads as a two-part check-in: immediate register first, deeper guided reflection second.
- The note placeholder feels dynamic and time-aware, changing through the day with handwritten-feeling microcopy rather than repeating one static sentence.
- The interface uses a cell-based notebook composition rather than generic stacked cards.
- Typography visibly carries the Colourmap mix: structured serif, selective cowboy or old-print-display accents, and handwritten ink moments where appropriate.
- The visual result clearly holds both halves of the Colourmap recipe together: old-world notebook paper underneath, playful emotional color on top.
- The visual result stays close to the live CPC reference in mood and composition, while still fitting V2's architecture.
- Check-in data is persisted to Supabase as structured fields, not an opaque legacy blob.
- The feature captures the current CPC check-in behavior without importing legacy repo layout or implementation structure.
- The entire flow completes on a single screen with no navigation.

## Design Direction: Zen Circle

The long-term vision for the feeling register is radical simplicity — a single filled circle that holds the current emotion's color, with the emotion name below it. No slider, no bars, no controls visible by default.

**The reference image:** a soft wheat/sand-gold circle on warm parchment with "Courage" written below in serif. That screenshot captures the target aesthetic — deep zen, one shape, one word, total stillness.

### Principles

- The circle IS the emotional state. Its color communicates everything the slider used to.
- The emotion name appears below the circle in serif, not italic — confident and quiet.
- To change the emotion, the user swipes or gestures on the circle area. The interaction is physical and fluid, not a discrete tap-on-segments UI.
- All other check-in elements (FACING, note, Challenge/Flow) remain available but recede. The circle is the gravitational center.
- The design should feel like opening a meditation app that also happens to capture data — not like filling out a form.

### Why

The Hawkins slider works functionally but introduces visual noise. The circle achieves the same emotional register with zero cognitive load. The product's north star is clarity through stillness, and the check-in should embody that from the first pixel.

### Status

Aspiration. The current implementation still uses the rainbow square slider as an intermediate step. The circle exists as the top element. Migration to swipe-only interaction is a future iteration.

## Current Implementation Direction (April 2026)

The check-in has settled into a **single-anchor + collapsible-pillbox** structure inside box 1 of the Caring tab. This supersedes the multi-variant exploration of dots, columns, polygons, and grids — all of which were design experiments while looking for the right axis. The settled choices:

### Top — Balance Arc

A single horizontal arc with seven stops from `Deep Rest → Tunnel Vision`. Centre is `Balance` (equilibrium). **Both extremes are valid deep states** — `Deep Rest` is restorative, `Tunnel Vision` is intense focus. Neither is failure. The arc curve is a smooth cosine bow with the apex visibly higher than its neighbors, dots evenly spaced across the width.

This replaces the earlier Hawkins-style emotional spectrum (Shame → Enlightenment) for the in-app representation. Hawkins data may still be referenced internally but the user-facing scale is the balance arc.

### Three Collapsible Pillboxes

Below the arc, three soft cream-coloured rounded containers stack vertically. Each holds an ochre-pill header that opens/closes the contents.

1. **Current Objective** — single input for the active mission, with life-category tag picker on the right and a green ✓ to mark done. Completing the current promotes the first Next objective (if any) into its slot.

2. **Other Missions** — holds two sub-sections plus a clarity slider:
   - **Daily Objectives**: list of items planned for today. Each item is a checkable row whose text is clickable to expand a discrete handwritten note area (`advancements, next steps...`). Notes auto-save per item.
   - **To-do**: shorter checkable tasks.
   - **`are you clear on next missions?`** clarity slider at the bottom — a short check on whether the user knows what to do next.

3. **Logbook & Emotions** — two writing inputs side by side semantically (stacked physically):
   - **Challenge** (deeper warm brown) — `what is your main tension right now?`
   - **Flow** (warm ochre) — `what is working well?`
   Entries appear behind a transparent `notes · N` pill that opens/closes the list. A `mixed / grouped` sub-toggle switches between chronological and stacked-by-tag views. Colors stay in the warm-brown palette throughout — no red/green semantics.

### Emotional-Register Variants (collapsed behind one toggle)

The balance arc is the default, but six renderings of the same emotional level are available behind a single `◇ designs` toggle at the top of box 1. The row of variant pills only appears when the user opens the toggle — box 1 stays quiet by default. Selecting a variant closes the picker and persists the choice to localStorage (`colourmap:design-variant`).

All six variants read from the same underlying level index so switching is free — no data reshape:

1. **Arc** — the cosine bow described above (default).
2. **Circle** — a single large colour disc. Drag horizontally or tap left/right halves to shift level.
3. **Rings** — 7 concentric Hawkins-style rings stacked from small to large; current ring thickens and fully saturates, others fade. Tap any ring to select.
4. **Mountain** — 7 vertical bars forming a bell-curve terrain profile across the width; current bar at full saturation, others faded.
5. **Slider** — a horizontal gradient track (all 7 colours blended) with a draggable ochre-bordered handle that snaps to the 7 discrete positions.
6. **Boxes** — a central colour circle flanked by two groups of vertical drawer-bars: five "stuck" states on the left (`Frozen → Overwhelmed`) and five "freedom" states on the right (`Searching → Liberation`). Uses the 10-level Hawkins process spectrum rather than the 7-level balance scale; picked level is reflected in the central circle. Negative space between drawers makes the grouping legible.

The variants are kept as exploration scaffolding — "for now" — so the design language for the emotional anchor can keep evolving without re-rewriting box 1 each time.

### Readability Rules (box 1 + box 2)

- Minimum 12px for any visible text, always. No ultra-low opacity (<0.5) on text.
- When a mission / objective / target is marked done (the V check), **no strike-through bar**. Readability is preserved — the text shifts to a lighter warm-ochre colour (`#C4A060`, opacity ~0.85) to signal "done" without burying the words.
- `LifeCategories` targets and logbook entries match box 1's typography and sizing so the two boxes feel like one voice.

### Removed From Box 1 (superseded by the settled direction)

- "Ready to push?" energy slider
- Standalone Next Objective `+` button and Done history pill (consolidated into Other Missions)
- Old engagement scales (Avoiding → In Flow) and old 11-level mind/mode pastel sliders

### Why This Settled

Iteration through many variants for the same axis revealed there is no single perfect axis for "how am I." The product ships with **balance** as the default frame because the centre is the answer (equilibrium), not just a midpoint, and both extremes are valid contexts (rest is not failure, focus is not failure). The variants stay available behind one toggle so the visual language can keep evolving without collapsing back into a flat form. The pillbox layout makes the check-in feel like distinct cards rather than a long form, and the click-to-expand notes on each daily objective preserve the "clarity-not-clutter" rule.

## Day Page Shell — Emotions / Body / Behaviours

The top-level tabs on `/day` are `Emotions`, `Body`, and `Behaviours`, not the old `Caring / Doing / Sharing`.

- **Emotions** — daily pulse and inner weather. Holds the emotional register, inner work, circles, and emotional insight. It should not carry a generic `Education` pill; education remains reachable from the global navigation and contextual learning surfaces.
- **Emotions** should not show a `Focus` pill/tracker. Focus can return later in a better lane, but it should not compete with the emotional register.
- **Body** — active daily body/missions lane. Holds practical daily movement, rituals, and embodied mission surfaces. It should not carry a generic `Education` pill.
- **Behaviours** — wide-angle pattern lane. Holds overview, modes, and behaviour-pattern surfaces.
- The `Chapter` panel label in Behaviours can be renamed by the user without changing the underlying chapter text fields.

### OverviewSections — compressed three-answer surface (pre-AI)

Sits at the top of Overview. Compresses the user's LifeCategories into three sections, answering the guiding questions of the Overview directly:

1. **What is flowing** — categories the user has tagged `flowing` via the state pill in LifeCategories. Each row: colour dot, name, "n days ago" since last logbook entry, the most recent logbook entry truncated to ~120 chars.
2. **What is stuck** — same, for categories tagged `stuck`.
3. **Attention check** — categories whose latest logbook entry (if any) is 14+ days old, regardless of state. Flags avoidance without requiring manual classification.

State is user-authored in this first version. A new optional `state: 'stuck' | 'flowing' | null` field on `LifeCategory` persists to `colourmap:life-categories`. Each category row in `LifeCategories` gets a small pill next to its name that cycles `— → flowing → stuck → —` on tap. The state pill uses dashed border when unset, saturated border + soft tint when set (green-tinted for flowing, brown-red for stuck).

Rationale: the AI version of Overview (Synthesis Surface in `ai-evolution.md`) requires the semantic layer that doesn't exist yet. This pre-AI surface delivers the same three-section answer without AI by asking the user to do the classification themselves. Same base, AI overlay later — the surface structure and data contract stay identical when the AI phase lands.

### OverviewVisualDemos — design exploration for the river/flow view

A temporary exploration surface that renders five candidate visualisations of flow-and-stuck over time using synthetic data:

1. **Radiating rivers** — rivers flow outward from a centre (you). Colour saturation = flow vs stuck, width = activity.
2. **Horizontal trajectories** — left-to-right = time, up = flowing, down = stuck. Reads like a vital-signs line.
3. **Mountain terrain** — stacked areas, each category's height tracks its flow. Landscape metaphor.
4. **Braided river** — a main river with tributaries (categories) branching off; pebbles along each = events.
5. **Dot stream** — one row per category, twelve dots = twelve weeks, colour intensity = flow. Simplest, most honest.

No persistence, no interaction beyond the static SVG. Intentionally placed below the active Overview content so it doesn't compete with real data. Meant as a side-by-side picker to decide which metaphor to build into the settled Overview. Will be removed once the metaphor is committed.

Tab choice persists to localStorage under `colourmap:day-tab`. Legacy values (`cockpit`) are remapped to `checkin` on read, so existing users aren't bounced to Overview after the rename. Check-in is the default on first visit. `DoingCheckInCard` and `SharingCheckInCard` are no longer rendered on `/day` — their surface is covered by the compass carousel inside Overview.

## Labels & Descriptions — Reference

Kept here as the source of truth for the wording, ordering, and colour intent behind every scale in box 1 and the compass layer. Implementations must read from these lists — don't drift the labels in code without updating this reference.

### Balance scale (7 levels) — box 1 variants `arc`, `circle`, `rings`, `mountain`, `slider`

Index | Label | Colour
--- | --- | ---
0 | Deep Rest | `#88C8E8` (far left — restorative)
1 | Soft | `#B8D8E8`
2 | Easing | `#C8E880`
3 | Balance | `#7AAA58` (centre — equilibrium, default)
4 | Engaged | `#F8C040`
5 | Focused | `#F0A088`
6 | Tunnel Vision | `#E08030` (far right — deep focus)

Both extremes are valid deep states (`Deep Rest` = restorative, `Tunnel Vision` = intense focus). The centre (`Balance`) is the answer, not merely the midpoint.

### Hawkins emotional spectrum (10 levels) — box 1 variant `boxes` + bottom hawkins slider

A 10-level distillation of David Hawkins' Map of Consciousness, from contracted (Shame) toward expanded (Peace). Numbers in the `Hawkins` column are the canonical Map calibrations.

Index | Label | Colour | Hawkins | Side
--- | --- | --- | --- | ---
0 | Shame | `#B8D0E8` | 20 | contracted (left)
1 | Apathy | `#D8B0C8` | 50 | contracted
2 | Grief | `#E8A0C4` | 75 | contracted
3 | Fear | `#F080B8` | 100 | contracted
4 | Anger | `#F0A088` | 150 | contracted (5th left bar)
5 | Courage | `#F8C040` | 200 | expanded (right)
6 | Acceptance | `#F0E060` | 350 | expanded
7 | Reason | `#A8E090` | 400 | expanded
8 | Love | `#88D8B0` | 500 | expanded
9 | Peace | `#88C8E8` | 600 | expanded (5th right bar)

Two surfaces consume this spectrum:

- The **Boxes** variant renders indices 0–4 as left drawer bars and 5–9 as right drawer bars on either side of the central colour circle.
- The **bottom hawkins slider** at the foot of box 1 (above the save star) renders all 10 as a long row of narrow drawer blocks. Selected block grows taller and goes full saturation; the current label appears in serif beneath ("where am I in the process" eyebrow above).

Both surfaces share the same `hawkinsIdx` state (`localStorage:colourmap:process-idx`) so switching variants or moving the bottom slider stays in sync.

### Compass rhymes — subtitle phrases under each axis

Displayed in the 3-step program area of each compass at the user's current 0–8 rating. Index 0 is the empty/default state.

**Care** (`0 → 8`): `'' · Neglecting yourself · Barely holding on · Getting by · Starting to notice · Taking small steps · Caring for yourself · Nourishing deeply · Fully tended to`

**Attitude**: `'' · Closed and heavy · Resistant · Guarded · Cautiously open · Willing to try · Genuinely open · Embracing it all · Radically present`

**Rest**: `'' · Running on empty · Depleted · Tired but pushing · Need a pause · Catching up · Rested enough · Deeply recharged · Completely restored`

**Emotions**: `'' · Shut down · Overwhelmed · Turbulent · Unsettled · Processing · Finding balance · Calm and clear · At peace`

Typography: handwritten ink face, sepia (`#5C3018`), opacity 0.95, ~17px. Readability rule applies — never drop below opacity 0.9 for the rhyme.

### Sub-pills per axis (Care compass)

Each CARE axis opens a set of sub-pill "lenses" except `Emotions`. Picking a sub-pill opens a 3-step program (reflect · rate · commit).

- **Care** → `Health · Sport · Energy`
- **Attitude** → `Confidence · Openness · Gratitude`
- **Rest** → `Relaxation · Awareness · Grounding`
- **Emotions** → **no sub-pills**. Clicking this axis opens a direct reflective card with two open questions designed to help the user understand themselves:
  1. *What are your heaviest emotions right now?*
  2. *Where do they come from?*

  This replaces an earlier Joy / Weight / Peace pill picker, which forced the user to label the emotion before exploring it. The questions let the user name what's heavy and trace the source in their own words — truer to the "AI-evolution → understand the user" direction of the product.

  Answers persist to localStorage (`colourmap:care-emotions-heavy`, `colourmap:care-emotions-source`). Both questions are optional — empty is a valid state.

### 0–100 slider words (see [`emotional-vocabulary.md`](./emotional-vocabulary.md))

The 8-word poetic scale (`Crushed → Expansive`) mapped across 0–100 is specified separately. Used wherever a 0–100 check-in value is surfaced — cockpit summary, check-in history, post-submit reflection. Not used by the box-1 variants (which run on the 7-level balance scale) or the boxes variant (10-level Hawkins scale).

## Sharing Tab — Vision (2026-04-27)

The Sharing axis is about how you are showing up in the world outside yourself. It has two distinct dimensions that must never be collapsed into one:

### Personal dimension — Lonely → Connected
How alive are your personal relationships right now? Friends, family, intimate connections, community. A single big dot on a 7-level scale from Lonely to Connected is the entry point. Both extremes are valid states — deep solitude can be chosen and restorative; overwhelming social presence can be draining.

Scale (7 levels):
```
Lonely · Withdrawn · Distant · Present · Warm · Close · Connected
```

### Professional dimension — Isolated → Networked
Separate from personal life: how alive is your professional network? Collaborators, peers, career relationships, creative partners. Same 7-level dot format, different color and language.

Scale (7 levels):
```
Isolated · Quiet · Peripheral · Engaged · Active · Wired · Networked
```

### Long-term: your actual people
Beyond the two dots, the Sharing tab will surface real connections — a short list of people in your life, with last-contact log, relationship quality note, and a nudge to reach out. Not a social feed. Not followers. A quiet list of the people who matter, split across personal and professional.

The professional / individual split is the key design decision: work relationships and personal relationships live in different emotional registers. Mixing them (as LinkedIn and Instagram both do in different directions) is the root of the hollow feeling both platforms create. Colourmap keeps them separate so the user can be honest about both without performing either.

### Current implementation (placeholder)
One big dot, personal dimension only, Lonely → Connected. No sub-sections, no network list yet. The professional dimension and the people list land in a follow-up pass.

### Relationship to Circles
Circles is the *group* layer — shared sessions, band rooms, co-working. The Sharing check-in is the *personal reflection* layer — how do I feel about my connections right now. They are complementary, not redundant.

## Segment Landing — Two-Dot Entry (Future: Roadlights)

When `FeelingCheckInCard` is used standalone (not embedded inside a named tab), it shows a two-dot landing: Feeling dot + Doing dot. The user taps a dot to open that segment full-width.

**Future direction — "Roadlights":** The landing will grow to three dots (Feeling / Doing / Sharing), possibly named *Roadlights*. The component already supports a `segment` prop to bypass the landing entirely (used by the DayTabs Feeling tab). The landing dots and their color palette picker should remain available for any context where the component is used standalone.

## Dependencies

- Supabase auth and database (Key Decision: real persistence from day one).
- Cockpit reads check-in data to display current emotional state.
- Post-submit reflection and check-in history consume advanced fields when present.
