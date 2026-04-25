# Overview — Progression, Pattern-Spotting, Beauty, Gamification

> Asked by Martin (2026-04-25): "write here how u would imagine
> the whole overview part. progression across your tracks
> gamification visual beauty etcetera pattern spotting. all that
> stuff. tell me here how you would see it"

The full vision for what the **Overview** tab on `/day` becomes.
Less a spec, more a north star — a single page where the user
lands and feels *seen*. They've been checking in, picking
soundscapes, jotting notes, setting objectives. Overview is where
all of it gathers into something they can look at without
unfolding it themselves.

## The feeling we're after

Open the app on a Sunday morning. Before you even tap anything,
you see what your week was. Not as numbers — as a **shape**.
The shape is recognizable: it looks like *your* week, not
anyone else's. You feel a small *yes, that was me*. Maybe also a
small *huh, I didn't realise I drifted on Wednesday*.

Three feelings to evoke:
1. **Recognition** — *that's me*.
2. **Beauty** — *I want to keep looking at this*.
3. **Insight** — *I learned something I didn't know*.

Avoid: dashboards, bar charts, points, badges, "5 minutes left
to your goal". Anything that smells of productivity-app or fitbit
gamification.

## The seven layers I'd put on the Overview page

Each is a horizontal section, breathing-room between them. Top to
bottom = most-immediate to most-reflective.

### Layer 1 — The Now Bar (top, always visible)

A single sentence that summarizes the present moment. Generated
locally from the most recent check-in + last music session +
current objective:

> *Quiet morning. You opened with 528Hz waters; your objective
> is the chapter draft. Last 3 days felt steady.*

One sentence. No metrics. Updates in real time as the user does
things. This is the calmest possible header.

### Layer 2 — The Week Shape (heat-river)

A horizontal **river** running left → right across the past 7
days. Two rivers actually, stacked:
- Top river: **Feeling** — colour-coded. Each day's average
  feeling-tone painted along the river, with the wave height
  matching intensity. Calm sage at the bottom; fire-orange at
  the top. The transitions between days flow, no hard cuts.
- Bottom river: **Doing** — same river shape, but coloured by
  what the user *did* (focus minutes, music time, notebook
  entries, social).

Tap any day → a small popover with that day's check-ins +
sound sessions + notes. No drilldown deeper than that.

This *is* the gamification, done right — the user sees the
**shape** of their week and naturally wants to keep the river
flowing. No explicit streak counter; the visual *is* the streak.

### Layer 3 — The Compass (where am I drifting?)

A 4-axis radial chart (more like a flower than a radar):
- **Inner** (feeling check-ins)
- **Doing** (objective work, focus minutes)
- **Care** (social, family, health entries)
- **Play** (music, art, notebook ideas)

The flower's petals **bloom or wilt** based on the past 14 days
— a balanced life is a round flower; a drift is a lopsided one.
One sentence underneath:

> *Your Doing petal is full this week. Your Care petal could
> use water.*

This is **pattern-spotting** done by the system, given to the
user as gentle observation. Not "you should do more X" — just
*here is what is*.

### Layer 4 — The Track Lines (progression across pursuits)

The user has projects, habits, songs-in-progress, books they're
reading, conversations they're tending. Today these are scattered
across Notebook + Projects + Objectives.

Overview shows them as **horizontal lines**, one per track, each
gently animated:

```
✦ Chapter 3 draft         ───●───●───●───────●───────●─── 5 sessions
✦ "Honey Comes Down" song ───────●───●───●─────────●───── 4 sessions
✦ Daily walk              ●─●─●─●─●─●─●─●─●─●─●─●─●─●─── 14 of 14
✦ Italian study           ───●─────────────────────────── 1 session
```

Each ● is a session/touch. Faded-out trailing dots = momentum
that's slipping. Bright leading dot = active. The tracks that are
healthy *look* healthy. The ones being neglected look thin.

This is a beautiful, honest view of attention. No judgement — just
visibility.

### Layer 5 — The Soundscape Garden

A small **sound-map** of the music the user has touched. Each
soundscape (Tropical, Boom Bap, Chill-Waters, etc. — see
`groove-machine-7-soundscapes.md` and `chill-as-atmosphere-for-
groove.md`) is a tiny dot in a constellation. Dots the user has
played pulse with the time spent in them. Dots they haven't
touched stay dim.

Tap any constellation dot → re-enters that sound. Long-press →
tells the user when they last played it.

This is **pattern-spotting through music** — *I always end up in
Lofi on Sunday evenings, huh.* The constellation grows over
months into a personal map of the user's sonic preferences.

### Layer 6 — The Quiet Notes (reflective fragments)

A randomly-rotated fragment from the user's notebook + check-in
notes — surfacing forgotten thoughts. Just 1–2 sentences,
attribued by date:

> *"the rain is loud today and i don't mind"*
> *— 3 weeks ago*

Tap → opens that note. This is the **Memory** layer — small
proof that you are tending a rich inner life across time.

### Layer 7 — The Slow Wins (gentle progression markers)

At the bottom, a quiet line of *unannounced milestones*. Not
badges. Not points. Just observations that surface when they
quietly cross a threshold:

- *You've checked in 30 days in a row.*
- *Your evening sessions are getting longer.*
- *You returned to Chill Machine after two weeks away.*
- *You've written 100 notebook entries this season.*

One at a time. Replaced when there's something new to say.
**Never** a popup or an interruption — just there if you scroll
to the bottom.

## Pattern-spotting — the engine

Most of the above relies on lightweight pattern detection over the
user's local data. **All client-side, no AI required for v1**.
Heuristics are enough:

| Pattern | Heuristic |
| --- | --- |
| Day-of-week mood | Group last 8 weeks by weekday, average tone |
| Time-of-day energy | Bin check-ins by hour, find peaks |
| Soundscape-mood link | When user listens to X, next check-in tone tends to be Y |
| Drifting tracks | Touches per week, slope going down |
| Resurgence | Returning to a track after 14+ days dormant |
| Streaks | Consecutive days with ≥1 check-in |

A `lib/insights.ts` module computes these on page load (cheap —
the user's data is small). The Now Bar / Compass / Slow Wins
all read from it.

Phase 2 (after we have months of data) — *real* AI insights via
the existing OpenAI plumbing, but only for non-obvious patterns
("your most creative writing happens within 2 hours of a long
walk"). Same gentle voice, same once-at-a-time delivery.

## Visual beauty — design notes

- **No grid lines.** No axes. No numbers anywhere except dates
  and counts. The page reads like a watercolour, not a report.
- **Soft transitions.** Days flow into each other, tracks bend
  through their dots, the compass petals breathe. Animation on
  every state change at 600ms ease-in-out.
- **Warm paper-feel background** matching the rest of the
  cockpit (per Martin's recent feedback). Beige/gold / soft
  paper, not white.
- **Type hierarchy**: the *handwritten* font for the Now Bar
  and Slow Wins (intimate); serif for sub-headings; tiny mono
  for the date stamps under fragments.
- **Touch-first**. Every layer is tappable, but there's nothing
  the user *must* tap. Pure scroll-to-look mode is valid.

## Gamification — the *ethical* version

What we DON'T do:
- ❌ Points, levels, leaderboards
- ❌ Streak warnings ("you'll lose your streak in 3 hours!")
- ❌ Badges, achievements, "unlock the gold meditation"
- ❌ Notifications-to-engagement loops

What we DO:
- ✓ The week-shape river as visible progression
- ✓ The flower as visible balance
- ✓ Slow Wins surfacing milestones quietly *after* the fact
- ✓ The constellation growing — tactile sense of "my map"
- ✓ Track lines showing momentum as it builds *or fades*

The bet: people are intrinsically motivated by **seeing
themselves**, not by points. Especially this user (Martin) and
the artist/creator audience the app serves. Slot-machine
gamification would actively repel them.

## How to ship this

The vision is large. Slice into 7 PRs (one per layer, top-down):

1. **Now Bar** — easy. One sentence from existing data.
2. **Week Shape** — heat-river. Needs a small SVG component.
3. **Compass flower** — 4-axis radial. Static for now (just last
   14 days).
4. **Track Lines** — the dots-on-line viz. Needs grouping logic
   in `lib/insights.ts`.
5. **Soundscape Garden** — needs the soundscape catalogue
   (waiting on `groove-machine-7-soundscapes.md` to land).
6. **Quiet Notes** — easy. Pull a random fragment from notes.
7. **Slow Wins** — needs the heuristics in insights.ts. Most of
   the engineering work for the page concentrates here.

Most can be built without the others. Each is a quietly beautiful
artifact in its own right, even alone.

## Connections

- `cockpit.md` — Overview lives in the cockpit
- `check-in.md` — feeds the Now Bar + Week Shape
- `groove-machine-7-soundscapes.md` — feeds the Soundscape
  Garden
- `chill-as-atmosphere-for-groove.md` — same garden grows
- `design-system-and-adaptive-strategy.md` — the design system
  is what makes the visual coherence possible
- `notebook.md` — feeds the Quiet Notes layer

## Closing

This is the layer that turns Colourmap from a *tool* into a
*home*. Every other surface (Chill, Groove, Notebook, Circles)
is something the user *does*. Overview is what they *come back
to* — to see what they've been doing, who they've been being.
That's where loyalty forms. That's where the app becomes
something the user feels affection for.

Worth taking the time on.
