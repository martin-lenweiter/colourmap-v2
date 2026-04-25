# Circles — Music Band Coworking, First Real Test

> Asked by Martin (2026-04-25): "tell me what we need to start using
> circles for coworking on our music band project as the first
> test." Plus: "aim is to have accountability on who does what for
> when. and how he feels in the process. and what else he is
> working on."

A focused plan to make Circles **actually useful right now** for
running our music band project — as the first real-world test of
the social layer. Concrete, runnable in days, not the broad social
vision. The band is the wedge.

## What this Circle does

Three things, no more:

1. **Hold the missions.** Each band member sees what they own and
   when it's due. Shared list. Drag a mission to mark progress.
2. **Show how each person feels in the process.** Daily check-in
   colour bleeds into the Circle so we can see who's flowing,
   who's stuck — without anyone having to say so.
3. **Surface what else each person is working on.** Side-projects,
   life context, current obsessions. So nobody asks "what are you
   into these days" — it's already on the wall.

That's it. No video calls, no replacement for Notion or
Google Drive. The Circle is the *low-frequency awareness layer*
that sits underneath the actual work.

## The minimum we need to ship

Looking at what already exists in the app vs. what's missing:

### Already exists (no work)

- ✅ Circle creation flow (`/circles` → `CircleBoard`)
- ✅ Daily check-in with mood/colour (`FeelingCheckInCard`)
- ✅ Notebook entries
- ✅ Saved sound moments tagged with category
- ✅ Streak / "last check-in" plumbing

### Needs to ship for the band test (4 small PRs)

#### PR 1 — Missions in a Circle

A **missions list** inside a Circle, shape:

```ts
interface CircleMission {
  id: string;
  circleId: string;
  ownerId: string;            // who's accountable
  title: string;              // "ship the demo of Lullaby"
  due: string | null;         // ISO date, optional
  status: 'open' | 'in-progress' | 'done';
  feelingTone?: string;       // pulled from owner's last check-in
  createdAt: string;
  updatedAt: string;
}
```

UI: a single column of missions, each row shows owner avatar +
title + due date + status pill. Tap → expand for notes /
sub-tasks. Owner can move it through the 3 statuses with a tap.

This *is* the accountability surface. Who owns what, when by.

#### PR 2 — "How I feel today" badge

Every member's avatar in the Circle shows their **current
compass colour** (driven by today's check-in). When you look at a
mission, the owner's badge tells you whether they're flowing or
stuck **without them having to say so**.

Reads from the existing daily check-in store. No new data — just
surfacing what the user already submitted to the Circle's view.

UI: a tiny coloured ring around each avatar, fades out gently
through the day so by tomorrow morning everyone is back to neutral
and ready for the new check-in.

#### PR 3 — "What else I'm working on"

Each member's tile in the Circle shows up to **3 lines**:

- 1 current Mission they own in this Circle
- 1 thing they're working on outside this Circle (pulled from
  Notebook entries tagged with `now`)
- 1 thing they're listening to / reading (last saved sound moment,
  last book they noted)

These auto-populate from existing data. The user doesn't fill in
yet another form. The Circle becomes a quiet dashboard of "who is
in what right now."

#### PR 4 — Mission notes + reactions

Below each mission, a tiny thread (max 5 messages, oldest decays
after 14 days). Lets the band leave a quick note: "did the mix
last night, sounds bigger" — without going to Slack. The reaction
emojis are limited to a tiny set so it doesn't become a chat:
`✦ ⌛ ↗ ✓` (good, waiting, blocked, done).

## The Circle for our band

Concretely, the test Circle:

- **Name**: our band's name
- **Members**: us (3–5 people)
- **Initial missions**:
  - Finish demo of [Song A] · owner: M · due [date]
  - Mix [Song B] · owner: V · due [date]
  - Write lyrics for [Song C] · owner: J · due [date]
  - Book rehearsal · owner: rotating · weekly
  - Send EP to [3 labels] · owner: M · due [date]
- **Cadence**: each member checks in once a day. The Circle
  digest at 9pm sends a soft summary in-app: "M moved 'mix' to
  in-progress. V's compass is stuck today. J added a new note on
  lyrics."

After 2 weeks of running it, we evaluate:

- Did anyone actually use it? (If not — what blocked them?)
- Did it replace any text-thread chatter or did it sit on top?
- Did seeing each other's compass colour change anything?
- Did missions actually move forward faster?

## The data model (already mostly there)

Reuse the existing `circles` + `circle_members` tables. Add one
new table:

```sql
CREATE TABLE circle_missions (
  id UUID PRIMARY KEY,
  circle_id UUID REFERENCES circles(id),
  owner_user_id UUID,
  title TEXT NOT NULL,
  due TIMESTAMP NULL,
  status TEXT CHECK (status IN ('open','in-progress','done')),
  notes JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

That's the whole new schema. Everything else uses what's already
in the database (check-ins, notebook entries, saved sounds).

## Why this is the right first test

- **Small group, real users, real stakes.** A band has weekly
  deliverables and existing motivation. Unlike a generic
  "productivity Circle" we'd have to fake.
- **Tests the social mechanics without needing the whole social
  vision.** Vote axes, party Circles, venue partnerships — all of
  that comes later. The band tests the core: missions + presence
  + accountability.
- **Fastest path to "did this actually help anyone?"** We'll know
  in 14 days whether a real group of 4 musicians stuck with it.
- **Builds the missions primitive that everything else needs.**
  Coworking Circles, retreat Circles, Salon planning — they all
  need this same Mission + Owner + Status shape.

## What this Circle is NOT

- Not Slack. No real-time chat. The notes thread on each mission
  is the limit.
- Not a replacement for Notion / Drive. We keep stems in Drive,
  lyrics in Notion. The Circle holds *the wall* of who-owns-what,
  not the artifacts.
- Not a calendar. Due dates are optional and gentle, not push
  notifications.
- Not a public profile system. The "what else I'm working on"
  surface is Circle-private — a band-mate sees mine, the public
  doesn't.

## Implementation order (concrete)

Each PR ~half a day:

1. **Schema + API for `circle_missions`.** Drizzle migration,
   service file, route handlers (`/api/circles/[id]/missions`).
2. **`<CircleMissions />` component.** List + add + status +
   tiny notes.
3. **Compass-colour avatar ring.** Read today's check-in, pass
   into the avatar.
4. **"What else" tile.** Read tagged Notebook entries + last
   saved sound moment per member.
5. **Daily 9pm digest.** Server-side cron (or just a "today's
   movement" line at the top of the Circle on next visit). v1 =
   the next-visit option, simpler.

Total: ~3 working days to have something real to test with the
band.

## Connections

- `social-media-future-and-circles.md` — the broader social vision
  this nests inside
- `free-social-media-strategy.md` — Salons / Nights / Expos
  growth model
- `chill-groove-blend-and-collective-control.md` — once Circles
  work for accountability, layer collective music on top
- `overview-vision-progression-patterns-beauty.md` — the
  "Track Lines" layer of Overview will eventually pull from
  Circle missions too

## Closing

The cheapest, fastest, most honest test of whether Circles are a
real product: try them on our own band for two weeks. If they
help us ship the EP faster, they'll help anyone else's band do
the same. If they don't help us, no one else will use them either.

The first user is us.
