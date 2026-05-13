# Colourmap — Design System Analysis + Adaptive Strategy

> Deep look at how the app is designed today, what's working, what's
> not, and how to make it truly adaptive across phone / tablet /
> desktop / fold / landscape — without rewriting everything.
>
> Asked by Martin (2026-04-25): "give me a deep analysis on the
> overall system of the app design. and how we can have adaptive
> design depending on our phone and screen."

## TL;DR

We have a *direction* (warm earth palette, serif/handwritten
typography, soft borders, generous whitespace) but not yet a
*system* (no shared tokens, every component reinvents spacing /
font-size / colour). That's why every cockpit polish iteration
takes another round — a tweak to one slider doesn't propagate.

For adaptive: today we use Tailwind `md:` everywhere as a single
desktop/phone divide. That works for "is this two-column?" but
fails for "does this slider have enough touch hit area on a Pixel
6a in landscape?" or "does the cockpit fit on an iPad mini?"

The fix is two threads in parallel:
1. **Lift design decisions into tokens.** A handful of typed
   constants in `lib/design-tokens.ts` that every component
   reaches into for spacing / colours / font-sizes / radii.
2. **Move from breakpoint-based to context-based adaptation.**
   Use container queries + viewport units + a real
   `useViewport()` hook so layouts respond to where they actually
   are, not just what `md:` thinks the world looks like.

## Part 1 — What we have today

### 1.1 Typography

- Three font families wired via CSS variables:
  `--font-serif` (default body), `--font-handwritten` (objectives,
  notes), `--font-cowboy` (code/mono, also used as "sketch").
- Font sizes are **inline `style={{ fontSize: '12px' }}`** on
  almost every text node. No `text-xs`/`text-sm` discipline.
- Range observed: 9px (slider labels) → 26px (modal headings).
  No clear scale; sizes are picked per-component.
- Letter-spacing similarly ad-hoc: `0.04em`, `0.06em`, `0.1em`,
  `0.12em`, `0.14em`, `0.16em`, `0.18em`, `0.22em`. No tier.

**Symptom**: Martin had to ask twice ("make text bigger", "default
to 14–16px+") because there was no shared default — every component
shipped with its own choice.

### 1.2 Colour

- Warm-earth palette in heavy use (ochre / terracotta / wine /
  sage / teal / lavender) but as **inline hex strings**:
  `'#C4A060'`, `'#5C3018'`, `'#9B6BA0'`, `'#D4805A'`, etc.
- Same hue is sometimes written 4 different ways
  (`#C4A060` / `#C4A06015` / `#C4A06030` / `#C4A06080`) for
  fill / soft-bg / border / muted-text — consistent pattern but
  uncoded.
- Tailwind's built-in colour classes are mostly **avoided** —
  except `text-foreground`, `text-muted-foreground`, `bg-card`,
  `border-border` (semantic vars from shadcn-style theme).
- Recent palette pass added per-slider colour progressions
  (`SLIDER_PROGRESSIONS` in BinauralTuner) — first hint of a
  token-style approach, but lives inside one component.

**Symptom**: Today's "make all chill sliders rainbow" required
hand-tuning four 20-step palettes inline. With tokens, it would be
`palette('volume', i)` everywhere.

### 1.3 Spacing & layout

- Tailwind scale (`p-2`, `gap-3`, `space-y-4`) used widely,
  inconsistently mixed with inline `style={{ padding: '4px 0' }}`
  and pixel values.
- Container max-widths sprawl wildly: `max-w-md` (28rem),
  `max-w-2xl` (42rem), `max-w-3xl` (48rem), `max-w-7xl` (80rem).
  Same surface (e.g. Sounds page) bumps from 3xl to 7xl on `md:`.
- Inner sections inside that container often *also* set their own
  `max-w-md mx-auto` — narrowing on desktop unintentionally. This
  is exactly the "layers don't take full width on desktop" issue
  Martin just flagged.
- Touch targets: explicitly bumped in places (recent slider
  hit-padding fix), but no shared min-target like `--touch: 44px`.

### 1.4 Components

- ~285 files, no central component library. UI primitives
  (`Button`, `Card`, `Input`) exist as one-off Tailwind
  combinations — no `components/ui/` folder of shared bases.
- Two large composite components dominate:
  `BinauralTuner.tsx` (~5000 lines) and `FeelingCheckInCard.tsx`
  (~5200 lines). Both contain duplicated "dot-slider" patterns,
  pill-button patterns, info-tooltip patterns inline.

**Symptom**: When a pattern works (e.g. "Save this moment →
Notebook"), porting it to a sibling component (Groove Machine)
means re-implementing the whole UI block.

### 1.5 Adaptive today

- Single breakpoint axis: Tailwind's `md:` (768px+) used
  almost-exclusively to switch phone vs. desktop layouts.
  `sm:` and `lg:` rarely appear; `xl:` / `2xl:` never.
- A `ViewModeContext` (`useViewMode()`) lets components ask
  `mode === 'phone'` for **JS-side** decisions — but it's bound
  to the same div-width detection, so it duplicates `md:`.
- Some safe-area-inset use (`env(safe-area-inset-bottom)`) for
  the dev-overlay trigger. Good, but only there.
- No orientation handling. Phone landscape (e.g. a Pixel rotated)
  inherits portrait layout and breaks the cockpit.
- No tablet-specific layout. iPad portrait gets the desktop
  layout; iPad landscape gets the same; both feel either too
  narrow or too sparse.
- `dvh` / `svh` (dynamic viewport units) not used → cockpit
  jumps when iOS Safari's address bar collapses.

## Part 2 — Where this hurts

A non-exhaustive list of issues that all trace back to the system
gap above:

| Symptom | Root cause |
| --- | --- |
| Repeated "make text bigger" requests | No type scale → each component picks |
| Layers panel narrow on desktop | Inner `max-w-md` overrides outer 7xl |
| Phone nav "Focus" cut off | No fluid font sizing for nav row |
| Slider dots tiny | No shared touch-target minimum |
| Cockpit jumps when address bar hides | No `100dvh` / `svh` use |
| 3 PRs to recolour 5 sliders | Colour values inlined in each |
| "Same look but different" between Chill & Groove | Patterns copied not shared |
| iPad neither phone nor desktop | Single `md:` breakpoint |

## Part 3 — Recommended direction

Two threads, both incremental — **no big rewrite**.

### Thread A — Tokens (small, immediate)

Create `lib/design-tokens.ts`:

```ts
export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48,
} as const;

export const fontSize = {
  micro: 11,    // labels
  small: 13,    // body small
  base: 15,     // body default — phone-readable
  lg: 17,       // emphasized body
  xl: 22,       // headings
  '2xl': 28,    // page titles
} as const;

export const radii = { sm: 6, md: 12, lg: 18, pill: 999 } as const;

export const colours = {
  ochre: '#C4A060',
  ochreSoft: '#C4A06015',
  brownDeep: '#5C3018',
  brownMid: '#7A5438',
  warmTan: '#8A6A4A',
  paper: '#F3E0B8',
  paperSoft: '#F5E8C8',
  // ... full palette here
  // Slider progressions live here too
} as const;

export const touch = { min: 44 } as const;  // Apple HIG minimum
```

Adopt **per file, on touch** — don't rewrite. When a component is
edited, swap its inline values for tokens. After 6 weeks of normal
work the codebase converges.

### Thread B — Adaptive primitives

Instead of one `md:` breakpoint, give the codebase **three tools**:

1. **`useViewport()`** — returns `{ width, height, orientation,
   isPhone, isTablet, isDesktop, hasTouch, dpr }`. Reads from
   matchMedia + ResizeObserver, not bound to a single CSS bp. Use
   it for JS-side branching where Tailwind isn't enough.

2. **Container queries** for component-level adaptation. Modern
   CSS (`@container`); Tailwind v4 supports it via
   `@container/foo` modifier. The Layers panel can declare itself
   as `@container` and rearrange to 5-col when it has >700px,
   regardless of the page-level `md:` breakpoint.

3. **Fluid type via `clamp()`**. Define type sizes as
   `clamp(15px, 1.5vw + 12px, 19px)` so 4 inch and 10 inch screens
   both look right *without* explicit breakpoints. Migrate the
   token scale above to a fluid version once we're ready.

### Thread C — A small UI library

A `components/ui/` folder with these shared primitives. Each is a
thin Tailwind+token wrapper, not a heavy abstraction:

- `<Slider variant="dots" colour="volume" />` — one place to
  evolve the dot-slider visual language
- `<Pill variant="active|muted" colour={...} />`
- `<InfoTooltip />`
- `<SectionTitle />`
- `<TouchButton />` — enforces `touch.min` height

Patterns currently duplicated 5–10× in BinauralTuner and
FeelingCheckInCard collapse to one render path. New tools (Groove
Machine, future ColourStudios) get the same look for free.

## Part 4 — Adaptive screens specifically

Three target classes, with concrete recommendations:

### Phone (<= 600px)

- Single column, max content width = viewport.
- Text base 15–16px, never below 13.
- Touch targets 44 × 44 minimum.
- `100dvh` for full-bleed surfaces (cockpit) so iOS Safari
  address-bar collapse doesn't reflow.
- Bottom-respect: `env(safe-area-inset-bottom)` on every fixed
  element. Today only the dev overlay does this.
- Landscape detection → switch cockpit to a 2-pane layout
  (check-in left, current-objective right) instead of stacking.

### Tablet (601–1024px)

- 2-column layouts where the desktop has 3.
- Wider sliders (the dot count can stay 20, but each dot grows).
- Drawer-style sub-panels (e.g. Layers) instead of grids — feels
  more native to the form factor.
- Treat as touch-first (still apply `touch.min`).

### Desktop (1025px+)

- Multi-column where it makes sense (Notebook left rail; Sounds
  with side controls).
- Hover affordances become first-class (today they're decorative).
- Wider canvases — let layers fill the page width (current
  symptom: doesn't).
- Keyboard shortcuts visible.

### Fold + ultrawide (edge cases)

- Test at 280–320px (closed Galaxy Z Fold) — text mustn't break.
- At 1800px+, cap content at ~1400px and centre — empty wings of
  page beat huge stretched buttons.

## Part 5 — Concrete first steps (1 PR each)

1. **Land `lib/design-tokens.ts`** with space, fontSize, colours,
   touch. No call sites yet — just the file.
2. **Migrate one component** as a worked example (proposal:
   `FeelingCheckInCard` because it touches everything). Show the
   diff, prove the model.
3. **Ship `useViewport()`** and migrate `ViewModeContext` to read
   from it. No behaviour change — it's the same `isPhone` flag,
   just better-grounded.
4. **Add `100dvh` / `100svh`** to the cockpit + Sounds full-bleed
   sections. One-line fix, fixes the iOS jumpy-address-bar issue.
5. **Ship one container-query case** (Layers panel) as a worked
   example. From here, anything that should adapt to its own
   space can.
6. **Build `<Slider variant="dots" />`** and replace the 5
   inline copies in BinauralTuner. Future tools get it free.

Each step is independent, ships in a day, and converges the system
without a rewrite.

## Part 6 — What we're NOT doing

Not adopting:

- A heavy design-system framework (Material, Chakra) — wrong
  aesthetic direction.
- A token-only mandate — we let components keep some artistic
  freedom, especially in the music tools where each surface has
  its own colour identity.
- A redesign — current visual language is Martin's voice; this
  spec is about *infrastructure* so that voice can ship faster.

## Part 7 - Expansion Without UI Chaos

Colourmap is entering an expansion phase: comics, Living Atlas,
Progress Roads, AI inquiry tools, collective pulse, creation labs,
interactive maps, and future game-like worlds can all exist in the
same product.

The design system must make that growth feel calm.

### Main Menu Rule

The main navigation should stay small even when the world becomes
large.

Recommended top-level structure:

```text
Day
Emotions
Education
Atlas
More
```

This keeps the most repeated daily flows visible and puts deeper
exploratory worlds behind one clear door.

### More Menu Rule

`More` is the place for depth, prototypes, and future worlds.

Suggested grouping:

```text
More
  Progress Roads
  Collective Pulse
  Creation Lab
  Experiments
  Settings
```

When an area becomes mature and frequently used, it can graduate to
top-level navigation. Until then, it should stay grouped.

### Content Type Clarity

The user should be able to tell what kind of experience they are
entering before they tap.

Use stable labels:

- Program: guided learning or practice
- Comic: sequential visual education
- Atlas: map, data, sociology, collective information
- Road: historical progress timeline
- Tool: practical personal utility
- Creation: user-made or collaborative project
- Experiment: prototype or research surface

This helps a large app feel understandable.

### Prototype Badge Rule

Experimental areas should say so.

Use simple labels such as:

```text
Prototype
Research
Style test
Draft
```

This gives freedom to explore without making every surface feel like
a finished promise.

### One Screen, One Main Job

Every new page should be checked against this rule:

```text
Can a tired phone user understand what to do here in five seconds?
```

If not, reduce the first screen.

Common fixes:

- move secondary information below the fold
- turn extra information into tap-to-reveal cards
- split one large page into a sequence
- make the main action visually dominant
- hide advanced tools behind a small control
- replace long explanations with one strong sentence and one choice

### Data-Driven Surfaces

New education, atlas, and road content should be stored as structured
data wherever possible.

Preferred pattern:

```text
content JSON / TypeScript object
-> reusable renderer
-> visual variants
-> interaction layer
```

Avoid building a one-off component for every new program unless the
interaction is genuinely unique.

Reusable renderers to grow:

- comic reader
- program card grid
- progress road
- atlas map page
- reveal card sequence
- interactive infographic scene
- creation gallery

### Navigation Graduation

A prototype can move closer to the main product only when it passes
these checks:

- works on phone
- has a clear entry point
- has a clear place in the menu system
- makes its relationship to other Colourmap projects understandable
- has one obvious first action
- does not duplicate another page
- uses a reusable structure
- has a clear category
- has a reason to come back
- improves clarity, hope, or agency

This is how Colourmap can stay ambitious without becoming messy.

### Navigation Clarity Quality Gate

Before any new project, prototype, program, atlas, road, lab, or tool
is treated as product-ready, it must answer these questions:

```text
Where does the user enter it?
What larger area does it belong to?
What is the difference between this and nearby projects?
Where does the user go next after using it?
Can the user return to the main daily app without feeling lost?
```

If these answers are unclear, the work can remain a prototype, but it
should not be promoted into the main experience.

This is especially important as Colourmap grows several parallel
worlds:

- daily emotional cockpit
- education programs
- comic book learning
- Living Atlas
- Progress Roads
- collective pulse
- creation projects
- future map/game worlds

The app should make those worlds feel connected, not confusing.

Navigation clarity is therefore a product quality gate, equal to visual
quality, mobile quality, and technical stability.

## Related specs

- `pleasant-redesign-direction.md` — visual aesthetic direction
- `mobile-first-plan.md` — earlier phone-prioritization pass
- `cockpit.md` — the cockpit-specific layout decisions
- `next-steps-and-phone-ui-strategy.md` — phone-specific roadmap
