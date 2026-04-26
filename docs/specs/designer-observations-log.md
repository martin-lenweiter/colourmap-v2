# Designer Observations — block-by-block feedback log

> Martin (2026-04-26): "improve the designer creator triple click box so
> i can save observations block by block. add a pill where i can say
> what part that observation is for. and basically like challenge flow
> it creates a log of my feedbacks on what doesnt work with the app.
> link it to supabase. make sure each box has time where it was saved
> registered. a clear register button."

The triple-tap dev overlay (`components/FeedbackOverlay.tsx`) used to
save **one note string** to localStorage. It now captures **multiple
distinct observations**, each tagged with the area of the app it's
about, persisted to Supabase, with timestamps and an explicit
**Register** action.

## Capture flow

1. Triple-tap anywhere → dev overlay opens (unchanged).
2. Pick an **area pill**: Day · Music · Circles · Overview · Profile ·
   Studios · Other. Selection persists between sessions so consecutive
   blocks usually don't need re-tagging.
3. Type the observation in the textarea (voice input still supported).
4. Hit **Register** → the block is POSTed to `/api/designer-observations`,
   stored as one row, the textarea is cleared, the **log** below
   expands to show what was just saved.
5. Close the overlay; reopen later (any device, same account); the log
   is already there.

## Data model

```ts
// lib/db/schema.ts
designer_observations {
  id          uuid pk default gen_random_uuid()
  user_id     uuid not null
  area        text                -- nullable; free-text so adding pills doesn't need a migration
  text        text not null
  created_at  timestamptz not null default now()
}
```

Migration: `drizzle/migrations/0010_add_designer_observations.sql`,
plus an index on `user_id` for the per-user list query.

## Architecture

| Layer | File |
|-------|------|
| Schema + types | `lib/db/schema.ts`, `lib/db/queries/designer-observations.ts` |
| Service | `lib/services/designer-observations.ts` (input validation, scope-by-user delete) |
| API | `app/api/designer-observations/route.ts` (GET + POST), `[id]/route.ts` (DELETE) |
| Hook | `lib/hooks/use-designer-observations.ts` (localStorage cache + Supabase fetch + optimistic mutate) |
| UI | `components/FeedbackOverlay.tsx` (area pills, register button, log section) |

The hook follows the exact pattern set by `useCircleDecisions`:
hydrate from a localStorage cache for instant first-paint, fetch the
real list from Supabase in the background, optimistic add/delete with
rollback on error.

## UI changes inside the sticky note

Inserted between the existing font-size slider and the textarea:

- **Area pill row** — seven small pills, click to select / re-click to
  deselect. Selected pill renders filled in its area colour; the rest
  show a soft tint.

Inserted between the textarea and the resize handle:

- **Register button** — disabled while `text.trim()` is empty.
  Animates to a green "✓ saved" state for ~1.6 s after a successful
  save. Falls back to "try again" on network failure.
- **Log toggle** — appears when there's at least one past observation.
  Shows count (`log · 12 ▸`); click to expand.
- **Log panel** — scrollable list of past observations, newest first.
  Each entry: filled area pill + relative timestamp (`just now` /
  `5m ago` / `1h ago` / `Apr 26`) + the text + a delete `×` (delete is
  scoped to the caller in the service, so id-guessing across users is
  blocked).

## Why text instead of an enum for `area`

A `text` column avoids a migration every time we add or rename a part
of the app (Circles → Bands → …). The pill list in
`AREA_OPTIONS` is the source of truth for the UI; the database just
stores whatever string was sent. If a pill is removed later, old
observations still display as a generic taupe-bordered block instead
of breaking.

## Auth + scope

- Every endpoint goes through `withAuthenticatedUser`.
- `removeDesignerObservation(userId, id)` lists the user's rows first
  and only deletes if the id matches one they own. Cheap because the
  per-user list is bounded (~hundreds of rows, indexed by user_id).

## Out of scope for this PR

- **Editing** an existing observation — for now, delete + re-register.
- **Sorting / filtering** the log — newest-first only; could add area
  filter once the list is long.
- **Bulk export** — desirable later (CSV / markdown) so a designer
  review can lift the whole log into a doc. Track in
  `docs/specs/next-steps.md`.
- **Drawing-mode persistence** — strokes are still ephemeral, since
  they're tied to a specific screenshot rather than a journal entry.
