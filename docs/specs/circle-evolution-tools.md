# Circle Evolution Tools — Agenda · Sync Sessions · Decisions · Money · Audio · Rainbow

> Martin (2026-04-26): list of evolutions for Circles, picked items 1
> (collective agenda), 2 (sync sessions), 4 (decision log),
> 5 (vertical Hawkins rainbow with reflections that track over
> time), 8 (money tracker) — plus a recordings drop area for jam
> takes and audio reflections. "do all this for this morning."

A small constellation of tools that grow Circles from "shared mission
list" into a living band-brain. Each is a lightweight section inside
the active circle view — collapsible, themed by its own colour, sat
between the existing missions block and the log.

## The six new sections

| # | Section            | What it is                                                                 | Component              | Brand colour |
|---|--------------------|----------------------------------------------------------------------------|------------------------|--------------|
| 1 | Agenda             | 14-day strip of mission due-dates, coloured by owner                       | `CircleAgenda`         | `#C4A060`    |
| 2 | Sync sessions      | Rehearsals / mix nights / photoshoots, with RSVP per member                | `CircleEvents`         | `#5AA8B0`    |
| 4 | Decisions          | Proposals → vote (yes/no/unsure) → decided log → archive                   | `CircleDecisions`      | `#9B6BA0`    |
| 5 | Rainbow            | Vertical Hawkins band; tap any stage to leave a reflection that threads    | `CircleRainbow`        | warm full-spectrum |
| 8 | Money              | Shared expenses, currency picker, computed per-member balance              | `CircleMoney`          | `#7AAA58`    |
| — | Audio              | Drop jam recordings + voice memos; each clip carries an optional reflection | `CircleAudio`         | `#6890B0`    |

### 1. Agenda — `components/CircleAgenda.tsx`
Pure-UI on top of existing missions. No new storage. Shows a
horizontally-scrollable 14-day strip starting today. Each mission
appears as a coloured pill in its due-date column, tinted by its
owner. An **overdue** bucket sits above the strip with a red glow.
Tapping a pill bubbles up `onTapMission(id)` — wired to the existing
expanded-mission state in `CircleBoard`, so the band can jump from
calendar view → mission detail in one tap.

### 2. Sync sessions — `components/CircleEvents.tsx`
Rehearsals, mix nights, photoshoots. Each event has a title, a
`datetime-local`, an optional location, and per-member RSVP
(yes/maybe/no). Past events grey out automatically. The RSVP chip
row also shows a quick "yes / maybe" running tally so you can see
who's actually committed without reading individual chips.

### 4. Decisions — `components/CircleDecisions.tsx`
Three-state lifecycle:
- **proposed** — anyone can vote yes / no / unsure
- **decided** — proposer (or any member) can lock the call
- **archived** — past decisions, count shown but list hidden

The decided log is what makes this load-bearing: the band gets a
written record of "we said yes to X on date Y" so the brain doesn't
re-litigate the same questions.

### 5. Rainbow — `components/CircleRainbow.tsx`
Vertical Hawkins band, **Peace at the top, Shame at the bottom**
(matches the existing `Hawkins` ladder used in check-in). Each of
the 10 stages is its own row with a coloured chip, a label, and a
note count.

Tap a stage → opens a textarea + a thread of all reflections at
that stage (most recent first). Each reflection is dated and tagged
with its author's name in their member colour. Over weeks and
months, the band gets a record of *how their relationship to fear /
grief / love / peace evolves over time* — the original brief.

### 8. Money — `components/CircleMoney.tsx`
Each expense: amount, description, paid-by (always = me), currency
(€ / $ / £), and split-among (default = all members). The component
runs a per-member balance: paying member gets +amount; everyone the
expense is split among gets −share. Net positive = circle owes you;
net negative = you owe the circle.

V1 simplification: the split is always "all members." Per-mission
splits and settlement transactions are tracked as v2 ideas in
`docs/specs/next-steps.md`.

### Audio drop — `components/CircleAudio.tsx`
Drag-and-drop OR file picker for `audio/*`. Each clip persists as a
base64 data URL with a short reflection field. Hard-capped at 4 MB
per clip because localStorage gives us roughly 5–10 MB total before
the browser blows up — bigger files prompt the user to encode
smaller. Per Martin's brief: "for non-musicians it means they can
register audios and let them in a folder. audios with reflections."

## Storage

V1 ships **localStorage-only**, keyed per circle:

| Section    | LocalStorage key              |
|------------|-------------------------------|
| Events     | `colourmap:circle-events`     |
| Decisions  | `colourmap:circle-decisions`  |
| Money      | `colourmap:circle-money`      |
| Audio      | `colourmap:circle-audio`      |
| Rainbow    | `colourmap:circle-rainbow`    |

Shape is `Record<circleId, T[]>` for all of them. Agenda is
derived from the existing missions list, no new key needed.

This is a deliberate scope cut so the band can use these features
**this morning**. Supabase wire-up is a follow-up — see below.

## Supabase migration plan (follow-up)

Each section gets a Drizzle table, an API route, and a hook that
mirrors the `useCircles` pattern (optimistic updates +
localStorage cache fallback). Order of attack, lowest-friction
first:

1. **Decisions** + **Events** — closest in shape to existing missions
   (single-record per row, simple voting/RSVP arrays). Reuse the
   `withAuthenticatedUser` route helper. ~1 PR each.
2. **Money** — needs row-level integrity (the balance has to
   sum to zero) but otherwise straightforward. 1 PR.
3. **Rainbow** — `circle_rainbow_reflections` table with
   `(circle_id, stage, author_id, text, created_at)`. The UI already
   sorts on the client; the API just needs to scope by `circle_id`.
   1 PR.
4. **Audio** — non-trivial. Base64 in a row works for tiny clips but
   real jam takes need Supabase Storage with signed URLs. This is the
   one to **not rush** — better localStorage-only than half-broken.
   2 PRs: storage bucket + metadata table.
5. **Agenda** — no migration needed; it's pure UI over missions.

Tracked in `docs/specs/supabase-sync-status.md` as a follow-up
after the band-first-test PR lands and the band actually starts
using these surfaces.

## How it shows up

In `components/CircleBoard.tsx`, inside the active-circle view, the
order is:

1. Header (back · circle name · code)
2. Chapter (named season + meanings)
3. Member cards (who's here + pulse)
4. **Agenda strip**
5. **Missions** (existing, grouped by owner)
6. **Sync sessions**
7. **Decisions**
8. **Money**
9. **Audio**
10. **Rainbow**
11. Log (existing notes feed)

Reading top-to-bottom: *when's everything happening · what we're
doing · when we meet · what we've decided · what we owe each other ·
what we recorded · what we feel · the running notebook.*

## Out of scope for this PR

- Cross-device sync (localStorage-only, see migration plan above)
- Per-mission expense splits
- Settling-up flow (Splitwise-style "Martin owes Sarah €12")
- Audio waveform / playback scrubber
- Rainbow over-time graph (the thread is enough for v1)
- Per-event reminders / calendar export

These are all v2 candidates and live in `docs/specs/next-steps.md`.
