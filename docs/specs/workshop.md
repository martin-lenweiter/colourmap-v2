# Workshop

> A quiet reflection surface for learning the tools, reviewing the design language, and comparing alternate visual directions without changing daily cockpit data.

## Context

Workshop is the meta layer of the product. Day is for rhythm, Journey is for depth, Notebook is for expression, and Workshop is where the user understands how the system fits together.

## Behavior

- The page title is `Workshop` with the subtitle `Think. See. Refine.`
- The surface is split into three tabs: `Reflection`, `Visual Tools`, and `Design Lab`.
- Switching tabs clears any open accordion so content from one section does not remain expanded in another.
- Reflection contains long-form product notes such as architecture, user journey, and visual language.
- Visual Tools previews the interactive artefacts used elsewhere in the app, including the compass, mandala, echo layers, life wheel, inner weather, and constellation.
- Design Lab compares typography pairs, colour palettes, and paper-depth treatments.

## States & Edge Cases

- Reflection is the default tab on first load.
- Only one accordion item is open at a time.
- Re-clicking an open item collapses it.

## Done When

- The three tabs are navigable without a page reload.
- Each tab exposes its own workshop content and resets stale open state when the user switches sections.
- The page stays informational only; it does not mutate cockpit or journey data.
