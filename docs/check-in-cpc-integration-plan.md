# Check-In CPC Integration Plan

> Implementation plan for bringing the legacy CPC/Lovable check-in concept into Colourmap V2 without porting the legacy codebase.

## Goal

Bring the strongest parts of the legacy check-in into V2's existing cockpit:

- fast emotional check-in on the main cockpit screen
- a collapsed reflective layer based on the `FACING` idea
- a pizza-compass style feeling layer
- `Challenge` and `Flow` sections that open below the check-in

Do this inside V2's existing Next.js, Drizzle, Supabase, and spec-driven architecture.

## Source Anchors

This plan is based on these legacy artifacts:

- Current CPC app running at `http://localhost:8080`
- Current CPC snapshots provided by the user:
  - `FACING` row with progressive prompts and single check-in CTA
  - feeling compass screen with `Attitude / Emotions / Presence / Body`
  - inline `Challenge` and `Flow`
- Historical design references:
  - `/Users/vikashmorgan/Desktop/COLOURMAP /DESIGN - APRIL /PORTRAIT CHECK IN /PORTRAIT CHECKIN .png`
  - `/Users/vikashmorgan/Desktop/COLOURMAP /DESIGN - APRIL /3 DOORS /PIZZA FEEL 1 .png`
  - `/Users/vikashmorgan/Desktop/COLOURMAP /DESIGN - APRIL /3 DOORS /3 DOORS - COLOURMAP .png`

The live CPC snapshots override older archive variants where they differ.

## Non-Goals

- Do not import legacy Vite components directly.
- Do not port the old design-picker approach with many alternate check-in UIs.
- Do not recreate legacy localStorage behavior.
- Do not expand this feature into the full `Feeling / Doing / Sharing` system in one PR.
- Do not bundle unrelated cockpit redesign with check-in parity work.

## Working Assumptions

- `FACING` is not just a generic advanced layer. It is a named row of letter-buttons that open reflective prompt chains.
- At minimum, the `FACING` set must support the current CPC-style prompt families such as `Fear`, `Avoidance`, and `Confusion`.
- The feeling screen is a separate but adjacent part of the check-in experience.
- The feeling compass is a daily check-in component in its own right, not merely decorative.
- The pizza compass should stay compact and four-axis in the first V2 pass.

## Product Shape To Build

The V2 check-in becomes a layered single-screen interaction:

1. Default layer
   - Hawkins slider
   - optional note
   - single submit path

2. `FACING` layer
   - visible as a lettered row
   - each letter opens a structured reflective prompt set
   - only one prompt family needs to be expanded at once

3. Feeling layer
   - compact four-axis compass
   - discrete level indicator below it
   - optional supporting chips below the scale

4. Optional lower expansions
   - `Challenge`
   - `Flow`
   - both open inline below the check-in instead of sending the user into a separate mode

5. Shared submit action
   - one clear check-in CTA
   - no fragmented save buttons per subsection

## Proposed V2 Scope

Keep the first implementation narrow enough for one feature branch:

### In Scope

- Extend the existing `CheckInForm` rather than replacing the cockpit entry point.
- Add a structured `FACING` payload for reflective prompts.
- Add `Challenge` and `Flow` free-text areas as optional inline expansions.
- Add a compact feeling compass using the current CPC four-axis layout.
- Add a discrete feeling intensity / stage selector below the compass.
- Add optional supporting chips below the scale, matching the current CPC pattern.
- Persist all new fields in the `check_ins` record.
- Surface the new structured data in history and AI reflection where useful.

### Out Of Scope For This Pass

- Full 3-door `Feeling / Doing / Sharing` navigation
- multiple alternate feeling input modes
- energy wheel
- separate questionnaire mode
- challenge/flow timeline management UI
- legacy unified sections and deeper ambitions blocks

## Data Model Plan

The current `check_ins` table is too flat. It stores:

- `slider_value`
- `note`
- `tags`
- mission/emotion metadata

That is not enough for structured `FACING`, pulse, challenge, flow, or compass data.

### Recommended Schema Direction

Add JSONB-backed columns to `check_ins` rather than exploding this into many small tables in the first pass.

Recommended additions:

- `facing jsonb`
  - stores structured answers for advanced reflective prompts
  - example shape:
    - tracker id
    - label
    - answered prompts
    - timestamps optional
- `pulses jsonb`
  - stores compact daily signal values such as `body`, `attitude`, `structure`
- `challenge text`
- `flow text`
- `feeling_compass jsonb`
  - stores the daily feeling dimensions shown by the pizza-compass
- `feeling_stage integer`
  - stores the discrete selected stage under the compass
- `feeling_support jsonb`
  - stores selected support chips such as `confidence`, `openness`, `gratitude`

### Why JSONB First

- the legacy concept is still settling
- prompt structure may change
- history and AI can consume JSONB cleanly
- avoids premature schema fragmentation

### Migration Work

1. Add a new Drizzle migration.
2. Update `lib/db/schema.ts`.
3. Update query insert/select/update shapes.
4. Keep old records valid by treating all new fields as nullable.

## API And Service Plan

Current create flow:

- `app/api/check-ins/route.ts`
- `lib/services/check-ins.ts`

### Required Changes

1. Extend `CreateCheckInInput`
   - add `facing`
   - add `pulses`
   - add `challenge`
   - add `flow`
   - add `feelingCompass`
   - add `feelingStage`
   - add `feelingSupport`

2. Tighten normalization
   - validate slider remains required
   - validate note length
   - validate JSON object shapes defensively
   - trim `challenge` and `flow`
   - reject malformed objects instead of silently accepting arbitrary blobs

3. Extend update flow
   - allow edits for the new fields in check-in history if inline editing remains supported

4. Preserve backward compatibility
   - old clients submitting only slider/note still work

## UI Architecture Plan

Build this as composition on top of `components/CheckInForm.tsx`, not as one giant replacement component.

### Proposed Component Breakdown

- `CheckInForm`
  - orchestrates state and submit
- `CheckInSlider`
  - existing Hawkins interaction, potentially extracted
- `FacingRow`
  - letter buttons for `FACING`
- `FacingTracker`
  - one prompt family at a time
- `FeelingCompass`
  - four-axis compact compass
- `FeelingStageSelector`
  - discrete center scale below the compass
- `FeelingSupportChips`
  - optional trait/support chips below the scale
- `PulseFields`
  - body, attitude, structure
- `ChallengeFlowSection`
  - inline lower expansion

### State Rules

- fast path must stay friction-light
- `FACING` answers do not block submission
- opening and closing advanced sections preserves in-session edits
- challenge/flow remain optional
- no multi-screen flow inside the cockpit check-in
- the feeling compass and `FACING` must feel like one experience, not two unrelated cards

### Visual Rules

- preserve V2's warm cockpit tone
- use the pizza-compass geometry selectively
- do not import the old app's louder orange boxed treatment wholesale
- maintain the existing left-column cockpit rhythm

## Behavior Plan

### Primary Flow

1. User lands on cockpit.
2. User moves slider.
3. User may add note.
4. User may open `FACING`.
5. User may answer some advanced prompts.
6. User may expand `Challenge` or `Flow`.
7. User submits once.

### `FACING` Layer

Build `FACING` as a compact optional system modeled on the current CPC snapshot:

- the letters are always visible
- selecting one letter reveals its prompt family
- the selected family label should be shown clearly, for example `Fear`
- each family reveals a short progressive chain, currently three prompts
- answers are saved as structured values, not encoded into note text
- partial completion is valid
- freeform note input remains available below the prompt chain

### Feeling Compass

Use the current CPC compass screenshot as the source of truth.

Recommended first-pass dimensions:

- `emotions`
- `body`
- `presence`
- `attitude`

These align with the live CPC UI and the earlier pizza artifact.

Under the compass:

- include a discrete stage selector
- include a selected stage label
- include optional support chips such as `Confidence`, `Openness`, and `Gratitude`

### Challenge And Flow

Implement as two independent expansions below the main feeling section:

- `Challenge`
  - "What is blocking you?"
- `Flow`
  - "What is flowing?"

These should be optional short reflections attached to the check-in record, not separate entities in phase 1.

## History And Reflection Plan

The current history component parses pseudo-structured text out of `note`. That should not keep growing.

### First Pass

- keep rendering old note-parsed content for backwards compatibility
- add support for structured new fields from API responses

### History Rendering Changes

- show `FACING` chips from structured data if present
- show pulse summaries from structured data if present
- show `Challenge` and `Flow` snippets when present
- fall back to note parsing for older records

### AI Reflection Changes

- update post-submit reflection input to include:
  - slider value
  - note
  - structured `FACING`
  - pulses
  - challenge
  - flow
- keep the current short, companion-style output

## Testing Plan

This feature touches protected server and UI paths, so the test bar is not optional.

### Service And Route Tests

- update `lib/services/check-ins.test.ts` if missing or add it if needed
- extend `app/api/check-ins/route.test.ts`
- cover:
  - base slider-only submission
  - slider plus note
  - partial `FACING`
  - full `FACING`
  - pulses
  - challenge/flow
  - malformed JSON payload rejection

### Component Tests

- extend `components/CheckInForm.test.tsx`
- extend `components/CheckInHistory.test.tsx`
- add tests for:
  - `FACING` row renders with one active family at a time
  - optional `FACING` submission
  - feeling compass submission
  - stage selector submission
  - support chip selection submission
  - challenge/flow expansion behavior
  - structured rendering in history

### Migration Safety

- verify old records still render cleanly
- verify new nullable fields do not break existing fetch paths

### UI Verification

When implementation starts, live browser verification is mandatory:

- cockpit route on desktop
- cockpit route on mobile
- submit fast path
- submit advanced path
- inspect console and network

## Delivery Sequence

Keep this incremental. Do not ship in one giant diff.

### Phase 1: Persistence Foundation

- add schema columns
- update queries and services
- update route validation
- add tests

### Phase 2: Main Check-In UI

- refactor `CheckInForm`
- add `FACING` row and tracker state
- add pulse fields
- keep current submit flow intact

### Phase 3: Challenge / Flow And Compass

- add inline `Challenge` and `Flow`
- add compact four-axis feeling compass
- add discrete stage selector and support chips
- verify layout on mobile and desktop

### Phase 4: History And AI Wiring

- render structured fields in history
- update reflection prompt input
- add regression tests

## Risks

### Risk 1: Scope Blow-Up

The old CPC check-in was part of a much bigger exploratory system. If implementation starts copying whole patterns, the PR will become unreviewable.

Mitigation:

- keep the feature branch limited to check-in only
- reject unrelated old concepts during implementation

### Risk 2: Too Much Form Friction

If `FACING`, compass, stage selector, support chips, pulses, challenge, and flow all compete equally on first render, the main check-in loses speed.

Mitigation:

- keep advanced UI collapsed by default
- preserve one obvious submit path

### Risk 3: Data Shape Drift

If structured fields are half-stored in JSON and half-encoded in `note`, history and AI logic will get messy.

Mitigation:

- define one canonical structured payload now
- keep note as note
- treat legacy note parsing as compatibility only

## Definition Of Ready For Implementation

Implementation should start only when these are accepted:

1. `FACING` is accepted as the advanced reflective layer label, even if exact tracker labels are still slightly adjustable.
2. The first-pass feeling compass uses the current four dimensions: `Attitude / Emotions / Presence / Body`.
3. The discrete stage row below the compass is part of phase 1 check-in parity.
4. `Challenge` and `Flow` are stored on the check-in record, not as separate models.
5. The work is delivered incrementally, not as a direct port of legacy `ColourMapV7.jsx`.

## Recommended Next Build Ticket

`feature/check-in-facing-foundation`

Scope:

- migration
- API/service support
- `CheckInForm` advanced-state scaffold
- no history rendering changes yet unless needed for tests

## Exact Build Sequence

This is the recommended implementation order in V2, with explicit file ownership.

### Slice 1: Data Foundation

Goal:

- make the backend capable of storing the CPC-shaped check-in without changing the UI yet

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/lib/db/schema.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/drizzle/migrations/*`
- `/Users/vikashmorgan/Desktop/colourmap-v2/lib/db/queries/check-ins.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/lib/services/check-ins.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/app/api/check-ins/route.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/app/api/check-ins/route.test.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/lib/services/check-ins.test.ts`

Tasks:

1. Add nullable columns for:
   - `facing`
   - `pulses`
   - `challenge`
   - `flow`
   - `feeling_compass`
   - `feeling_stage`
   - `feeling_support`
2. Extend the typed check-in insert/select/update shapes.
3. Extend `CreateCheckInInput` and normalization logic.
4. Validate JSON payloads defensively.
5. Keep old slider-only submissions working unchanged.
6. Add or update route/service tests before UI work starts.

Done when:

- backend accepts and returns the new fields
- old payloads still pass
- tests cover success and validation failures

### Slice 2: Form State Scaffold

Goal:

- prepare the current cockpit check-in form to hold the new state without introducing the full UI yet

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.test.tsx`

Tasks:

1. Refactor `CheckInForm` state so it can hold:
   - `facing`
   - `challenge`
   - `flow`
   - `feelingCompass`
   - `feelingStage`
   - `feelingSupport`
2. Keep current slider submit flow intact.
3. Introduce internal payload-building helpers rather than stitching submission data inline.
4. Add tests proving the existing fast path still works.

Done when:

- the form can build the new payload shape
- no visible regression to the existing simple check-in

### Slice 3: `FACING` UI

Goal:

- ship the visible `FACING` row and progressive prompt interaction

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FacingRow.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FacingTracker.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FacingRow.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FacingTracker.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.test.tsx`

Tasks:

1. Create a visible `FACING` row component.
2. Define the initial prompt families and prompt text in a local constant or config object.
3. Render one active family at a time.
4. Preserve unsaved answers while switching between families.
5. Submit structured `facing` data through the existing API.

Recommended initial family set:

- `Fear`
- `Avoidance`
- `Confusion`
- `Gratitude`
- one or two additional CPC-aligned families only if already stable

Done when:

- the user can complete a CPC-style reflective prompt family in one screen
- `facing` answers persist correctly

### Slice 4: Feeling Compass

Goal:

- implement the four-axis feeling layer shown in the CPC snapshot

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FeelingCompass.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FeelingStageSelector.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FeelingSupportChips.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FeelingCompass.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FeelingStageSelector.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/FeelingSupportChips.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.test.tsx`

Tasks:

1. Build a compact four-axis compass component with:
   - `Attitude`
   - `Emotions`
   - `Presence`
   - `Body`
2. Store each axis as a structured numeric value.
3. Build the discrete stage selector below the compass.
4. Build support chips below the selector.
5. Submit all three structures as part of the check-in payload.

Done when:

- the feeling layer matches the CPC interaction model
- the data persists in structured form

### Slice 5: `Challenge` And `Flow`

Goal:

- add the inline lower text areas from the CPC check-in

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/ChallengeFlowSection.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/ChallengeFlowSection.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.test.tsx`

Tasks:

1. Render `Challenge` and `Flow` below the feeling area.
2. Keep both optional.
3. Preserve values in-session until submit.
4. Submit as top-level structured fields.

Done when:

- the user can add blocking/flowing reflections inline
- no extra navigation or modal is needed

### Slice 6: History Rendering

Goal:

- make recent check-ins reflect the new structured fields

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInHistory.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInHistory.test.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/lib/db/queries/check-ins.ts`

Tasks:

1. Extend the history entry type with the new fields.
2. Prefer structured `facing` rendering over note parsing.
3. Show feeling summary derived from:
   - compass
   - stage
   - support chips
4. Show `Challenge` and `Flow` snippets when present.
5. Keep old note parsing as backward compatibility for older rows.

Done when:

- new check-ins render meaningfully in history
- old check-ins still render

### Slice 7: AI Reflection Wiring

Goal:

- use the richer structured check-in in post-submit reflection

Files:

- `/Users/vikashmorgan/Desktop/colourmap-v2/app/api/check-ins/insight/route.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/app/api/check-ins/insight/route.test.ts`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/PostCheckInInsight.tsx`
- `/Users/vikashmorgan/Desktop/colourmap-v2/components/CheckInForm.tsx`

Tasks:

1. Add structured fields to the prompt context.
2. Keep the response short and companion-like.
3. Do not let extra structure produce verbose coaching.

Done when:

- reflection can refer to `FACING`, feeling signals, `Challenge`, and `Flow` when present

## Recommended PR Split

To stay inside repo scope limits, split the work into these PRs:

1. `feature/check-in-facing-foundation`
   - schema
   - queries
   - service
   - route
   - tests

2. `feature/check-in-facing-ui`
   - `CheckInForm`
   - `FacingRow`
   - `FacingTracker`
   - tests

3. `feature/check-in-feeling-compass`
   - `FeelingCompass`
   - stage selector
   - support chips
   - `ChallengeFlowSection`
   - tests

4. `feature/check-in-history-reflection`
   - history rendering
   - insight route wiring
   - tests

## Verification Checklist Per PR

For each implementation PR:

1. `bun run test`
2. `bun run build`
3. UI browser verification on the cockpit route
4. diff review against the spec

Routes to verify during UI work:

- `/`
- any route showing check-in history if different from `/`
