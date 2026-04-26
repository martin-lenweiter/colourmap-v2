# Code Reorganization &amp; Architecture — A Long Cleanup

> Asked by Martin (2026-04-25): "do deep research on how u would
> reorganise the entire apps code to make it safer more clean and
> stable and logic."

A practical map for taking the codebase from "shipping-fast
single-pile" to "safer, more logical, more stable" — without a
big-bang rewrite. Done as a 12-week ratchet, one PR at a time, on
a normal release schedule.

The codebase has done its job: shipped a working product. This
doc is about the next-level — making it the kind of place a
collaborator can land in cold and contribute on day one. Today
that takes weeks.

## Honest snapshot of where we are

```
~50,000 lines of React components in 100 flat files
~6,000 lines in BinauralTuner.tsx alone (single file)
~5,400 lines in FeelingCheckInCard.tsx
~2,500 lines in CaringDepth.tsx
~1,900 lines in DailyAgenda.tsx
~2,000 lines each in MagicMaker, LofiLooper, GrooveMachine

5 mega-components account for ~24,000 lines (half the UI codebase)
```

Plus:

- Inline styles + Tailwind classes mixed everywhere
- Hex colours hardcoded in ~80 files
- Data fetching, state, and rendering all in the same components
- Some tests, mostly snapshot or smoke
- API routes well-structured, services well-tested
- Two parallel state systems: `localStorage` (instant) + Supabase
  (durable). Most surfaces use both, with no consistent pattern.

The good: the *server* layer is clean. `lib/services/` has 95%+
test coverage, `app/api/` routes are thin handlers, Supabase
auth + RLS is solid.

The struggle: the *client* layer is one big pile. Every component
does its own data fetching, its own state, its own rendering, its
own styling. This worked for shipping the first version. It will
not scale to 5 contributors or 20 features.

## The five problems, ranked by pain

### 1. Mega-components

`BinauralTuner.tsx` is 6,103 lines. To change anything in it you
have to load the whole file in your head. The file does:

- Audio engine (Web Audio context, oscillators, scheduler)
- 5 layer categories with 30+ layers
- Sacred frequencies UI
- Harmonics UI
- Real-instrument samples
- Volume / wave / wah / echo controls
- Saved-mixes drawer
- Save-to-Notebook integration
- Visualizer (recently extracted to <VisualizerBox>)

A new contributor opens this file, scrolls for 10 minutes, and
gives up.

**Pain in practice**: every PR that touches this file conflicts
with every other PR that touches this file. Mid-April 2026 we had
3 PRs in flight all changing line ~3700 of BinauralTuner. None of
them could merge cleanly.

### 2. No design tokens (mostly)

The `lib/design-tokens.ts` file just shipped (NowBar uses it),
but 99% of components still inline hex codes:

```tsx
// 80+ files do this:
style={{ color: '#5C3018', background: '#C4A06012' }}

// Should be:
import { colours } from '@/lib/design-tokens';
style={{ color: colours.brownDeep, background: `${colours.ochre}12` }}
```

Every PR re-derives the same palette. When the user asks for
"warmer paper feel" we change the global background but every
inline rgba/hex stays old.

### 3. Two state systems with no coordination

Most check-in / mission / mood data is written to **both**
localStorage AND the Supabase API, with no central wrapper. Each
component:

1. Reads from localStorage on mount
2. Hits the API for fresh data
3. Writes to both on every change

This works in practice but the bugs are subtle: a stale
localStorage entry shows for one render flash before the API
updates. When the API fails silently, the user thinks their data
saved but it didn't sync.

There's no `useResource('check-ins')` hook that handles
both. Every component reinvents the pattern.

### 4. No clear feature boundaries

Components are organised by *what they are* (`SegmentDot`,
`InfoTooltip`, `FormatToolbar`) not *what they're for*. The
"Chill Machine" feature is split across:

- `components/BinauralTuner.tsx` (the main tool)
- `components/AtomVisualizer.tsx` (used by it)
- `components/SoundLab.tsx` (renders it as a tab)
- `lib/sample-pack.ts` (audio loader)
- `lib/save-to-notebook.ts` (action)
- `public/sounds/` (assets)

To delete or refactor "Chill Machine" you have to find all of
these by name. `git grep BinauralTuner` is the de-facto map.

### 5. Tests don't yet protect the UI

`lib/services/` is at 95%+. `app/api/` is at ~50%. **`components/`
is at 11% functions covered.** The coverage gate has been ratcheting
down (10/10/10/9 today) because every new UI surface ships untested.

We can ship safely *because the server is bulletproof*. But every
client-side bug requires manual testing. As the surface grows, this
is the place that quietly burns hours.

## The fix — five threads, all incremental

The goal is **continuous improvement, not a rewrite**. Each thread
is a series of small PRs that compound. Pick the one that's
hurting you most this week.

### Thread A — Slice the mega-components

The single highest-leverage move. Take BinauralTuner.tsx (6,103
lines) and split it into ~12 files of ~500 lines each, in a
feature folder:

```
components/chill-machine/
  index.tsx                  ← ~200 lines, the main composition
  ChillMachineTransport.tsx  ← play / pause / volume
  ChillMachineLayers.tsx     ← layer category panels
  ChillMachineHarmonics.tsx
  ChillMachineSacred.tsx
  ChillMachineMelodies.tsx
  ChillMachineEffects.tsx
  ChillMachineSavedMixes.tsx
  ChillMachineVisualizer.tsx
  hooks/
    useChillAudioEngine.ts   ← the AudioContext + scheduler
    useChillLayers.ts        ← layer state + persistence
    useChillSavedMixes.ts
  audio/
    layer-defs.ts            ← LAYERS / REAL_LAYERS constants
    harmonics.ts
    sacred-freqs.ts
    sliders.ts               ← SLIDER_PROGRESSIONS constant
```

Same shape for FeelingCheckInCard, GrooveMachine, MagicMaker,
LofiLooper, CaringDepth, DailyAgenda.

**Method**: do it one component at a time, over ~6 weeks.
Each split is its own PR, no behaviour change. Each split
passes existing tests. Each split unlocks ~3 future features
that were previously blocked by the file's size.

### Thread B — Lift design decisions into tokens (already started)

`lib/design-tokens.ts` exists. Now do the migration:

1. Audit all hex strings in `components/` (~600 occurrences).
2. Define every distinct value as a token (most are duplicates of
   ~30 base colours).
3. Migrate per-touch — when you edit a component, swap its hex
   strings for tokens.
4. After 8–12 weeks the codebase converges.

A simple `scripts/find-hex.mjs` counts hex strings per file as a
visible progress meter.

### Thread C — Centralise data with `useResource()`

Build one shared hook:

```ts
// lib/use-resource.ts
function useResource<T>(key: string, options: {
  fetch: () => Promise<T>;
  localKey: string;        // localStorage mirror key
  defaultValue: T;
}) {
  // Returns: { data, isLoading, error, refresh, mutate }
  // Hydrates from localStorage instantly, fetches from API in
  // background, reconciles on success, writes optimistically on
  // mutate, persists to both stores.
}
```

Then migrate, one resource at a time:

- `useResource('check-ins', ...)`
- `useResource('circles', ...)`
- `useResource('notebook', ...)`
- `useResource('life-categories', ...)`
- `useResource('saved-mixes', ...)`

After all five, every "read + display + edit" flow is the same
shape. New developers learn it once.

(For a more structured version: TanStack Query / SWR. Both work
on top of fetch and give you the same shape with caching for
free. Worth evaluating once we have ~3 resources migrated.)

### Thread D — Feature-folder layout

Move from `components/` flat to `features/` per-domain:

```
features/
  check-in/
    ui/           (FeelingCheckInCard split into ~10 files)
    state/
    storage/
  chill-machine/
    ui/
    audio/
    state/
  groove-machine/
    ui/
    audio/
    state/
  notebook/
  circles/
  overview/
  
components/ui/    (shared primitives only — Slider, Pill, Card)
lib/              (shared non-UI helpers)
```

This makes "delete Chill Machine" a `rm -rf features/
chill-machine/` away. It also makes ownership obvious — the
current PR's diff is one feature folder, not 8 random files.

### Thread E — Test where it hurts

Don't try to ratchet UI coverage to 80%. Most UI is glue.
Instead, target the parts that have *bugs that bite*:

1. **Audio engine logic** — extract scheduler, voice triggers,
   variation picker into pure functions; unit-test those. The
   render layer can stay untested. (~5 PRs.)
2. **Data hooks** — once `useResource()` exists, a single
   `useResource.test.ts` covers all 5 callers.
3. **Critical paths** — login → check-in → save → re-render with
   correct data. One end-to-end test in Playwright covers more
   than 50 unit tests.
4. **Service layer stays at 95%+** — it's already there; just
   defend the floor.

Coverage gate stays where it is until these come on board.

## What to do NOT do

| Tempting | Why not |
| --- | --- |
| Big-bang rewrite to a new framework | Months of work, ships nothing during, breaks every existing PR. |
| Adopt Redux / Zustand / Jotai globally | Premature for a 100-component app where 80% of state is local. |
| Move to a monorepo | We have one app. A monorepo is overhead with no benefit. |
| Switch from Tailwind to CSS-in-JS or vice versa | The mix works. The pain is *no tokens*, not the styling system. |
| Rewrite Chill Machine as a "proper DAW" | Out of scope. Ship the planned engine evolution first; the structure improves *with* it. |
| Add Storybook | Heavy. The 5 mega-components don't have leaf primitives that benefit. Once the slice happens (Thread A), revisit. |

## Architecture rules going forward

A short list to gate every PR:

1. **No new component over 500 lines.** Past that, split.
2. **No new inline hex.** Use tokens.
3. **No new component reads localStorage *and* hits API directly.**
   Use the resource hook (or write the hook + then use it).
4. **Every new feature lands in a feature folder.** Even if the
   folder has one file — the shape is the contract.
5. **Service-layer code adds tests with the feature.** UI tests
   are best-effort; service tests are required.
6. **Inline styles only for animation / dynamic values.** Static
   styling = Tailwind class.
7. **Specs in `docs/specs/` precede big features.** A PR that
   builds something un-spec'd has to write the spec as part of
   the PR.

These six rules turn the current pile into a maintained codebase
within one ship cycle.

## A 12-week plan

The shape of how you'd actually do this while still shipping
features:

| Weeks | Focus | Outcome |
| --- | --- | --- |
| 1–2 | Slice BinauralTuner (Thread A, first big component) | 12 small files, no behaviour change |
| 3–4 | useResource() + migrate check-ins (Thread C, first resource) | Shape proven, one resource flowing through it |
| 5 | Slice FeelingCheckInCard | Same shape; 10 files |
| 6 | Migrate notebook + life-categories to useResource | Pattern hardens |
| 7 | Slice GrooveMachine | Same shape |
| 8 | Audit hex usage; ratchet first ~150 inline hex → tokens | Real progress on Thread B |
| 9 | Slice MagicMaker + LofiLooper | All 4 music tools split |
| 10 | features/ folder migration — move chill-machine first | Pattern proves the layout |
| 11 | Move check-in + groove-machine to features/ | Major restructure half-done |
| 12 | Move remaining mega-components to features/; finalise | Pattern complete; new contributors land cleanly |

Throughout: tests added on each touch (Thread E), tokens swapped
on each touch (Thread B). No dedicated "refactor weeks" beyond
this — the work is interleaved with feature shipping.

## What success looks like, end of 12 weeks

- No file over 800 lines
- ~30% of inline hex replaced with tokens
- 5 resources flow through `useResource()`; new resources fit the
  shape automatically
- `features/` folder exists, 5 of the largest features moved
- Coverage gate ratcheted up: ui-default lines 10% → 18%, branches
  9% → 14%
- A new contributor can read one feature folder + the spec for
  it, and understand it cold

## What this connects to

- `design-system-and-adaptive-strategy.md` — the design-tokens
  + adaptive direction. Thread B is the operational side of that
  spec.
- `groove-machine-infinite-tracks.md` — recommends extracting
  the engine into `lib/groove/`. That's a worked example of
  Thread A.
- `chill-as-atmosphere-for-groove.md` — recommends
  `lib/sound-library.ts` extraction. Thread A again.
- `circles-music-band-first-test.md` — once Thread C lands,
  Circle missions through `useResource()` is trivial.

## Closing

The codebase is fine for now. It's not going to break tomorrow.
But every week the patterns above slip a little further from
where they need to be — and at some point a new feature takes 3
days when it should take half a day, and you don't know why.

The 12-week plan above turns "we should refactor someday" into
"we improve one slice every week." After 3 months of normal
shipping rhythm, the codebase is unrecognisably more pleasant —
and we've shipped just as many features as we would have without
this work.

The first slice (Chill Machine into a feature folder, Week 1) is
the proof. Once that lands, the pattern is real and everything
else follows.
