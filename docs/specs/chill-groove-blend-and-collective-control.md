# Chill + Groove Blend, and Collective Music Control

> Long-term idea (Martin, 2026-04-25): "spec that long term
> chillmachine and groove machine will mix so u have moments of
> calms and moments of drop and rise. think about structure for
> that. so music isnt always intense. also think about collective
> experience how people can add votes for more fire or more calm.
> and the sum of people get their preference. or someone can get
> the power control for 3 minutes or somth like that. maybe teams
> of 3 can have music control for 3 minutes."

Two threads, deeply related: making the music breathe between calm
and intense over a long stretch (intra-session structure), and
letting a group of people *together* decide where that breath goes
(collective control).

## Part 1 — The blend: calm ↔ drop ↔ rise

Today, Chill Machine and Groove Machine are separate islands. Long
term they should be **two voices of one instrument** — the user (or
the room, see Part 2) can sit in pure calm, sit in full groove, or
ride between the two with built-in structural moves: rises, drops,
breakdowns, returns to silence.

### Structural model

Think of a session as a **sequence of moods**, each lasting a few
minutes, with seamless cross-fades between them:

```
calm (4m) → rising (1m) → groove (5m) → drop (15s) → groove (4m) →
breakdown (1m) → return to calm (3m)
```

The user picks a **mood arc**:

- *Sunrise* — calm → slow rise → bright groove → soft return
- *Workout* — short calm → fast rise → high groove for 25 min →
  drop → rest → repeat
- *Long focus* — gentle calm with one rise + drop every 15 min, no
  full groove
- *Party* — groove dominant, drops every 4 min, brief calm bridges
- *Free* — manual control, no preset arc

Each arc is a list of `(mood, durationSec, transitionMs)` tuples.
The blend engine handles the cross-fade — fading out the Chill
layers while spinning up the Groove voices, bar-aligned to the
target tempo (see `groove-machine-songs-and-moods.md` for the
transition primitives).

### Drops + rises as first-class

A *rise* is 8–32 bars of building tension: filter sweep open, kick
drop out, snare roll accelerate, bass note rise in pitch. It ends
in a *drop*: the kick + bass slam back at full force. We already
have a one-off Drop button in Groove Machine — generalize it into a
scheduled element of the arc.

A *breakdown* is the inverse: subtract everything except bass + pad,
let it breathe, build back. Good moment for a vocal sample or a
human moment in the music.

### Why arcs > free-form

For the long companion use-case (run for an hour while you work),
the user shouldn't have to babysit knobs. Pick an arc, hit play,
let it carry them. Free-form stays available for tinkerers.

## Part 2 — Collective control

The single most distinctive thing Colourmap can do that Spotify /
SoundCloud / Apple Music can't: **a room of people shaping the
music together, in real time, without anyone needing to be the DJ.**

### Three modes of collective control

#### Mode A — Vote axis ("more fire / more calm")

Every person in the Circle gets one slider on their phone:
**calmness ↔ fire** (or *low / high energy*). The system
**averages** all the votes (or weighted average — first-time guests
half-weight) and that's the target mood. The blend engine moves
toward that target over the next 1–2 bars.

- No single person can hijack — it's always a sum.
- Visible UI: every phone shows the room's current average and
  their own contribution to it.
- Friction-free: no log-in needed for guests; QR-code into the
  Circle's session.

#### Mode B — Solo control rotation ("you've got the room for 3 min")

The system passes a *talking stick* — one person at a time has full
DJ power for 3 minutes. UI on their phone shows everything (mood
arc, layers, drops, tempo). Then it rotates to the next person.

- Order can be: in-Circle order, random, "raise your hand" queue,
  or contribution-based (most-active-listener gets a turn).
- Solo person can also explicitly *pass* before their 3 min are up.
- The room always sees who's currently driving (small avatar in
  the mini-player).

#### Mode C — Team-of-3 ("a small group has 3 min")

A randomly-grouped (or self-selected) trio gets shared control for
3 minutes. They each hold one of (mood, layer pick, intensity).
Forces collaboration — no one has all the levers, the music is the
shape of their negotiation.

- Best for parties / events where social mixing is the point.
- Could surface as a "join a trio" button — first 3 to tap form a
  team.

### Connecting back to the architecture

These modes all sit on top of the **`SoundSessionProvider` + mini
player** (see `global-mini-player.md`). The provider holds the
mood/arc/voting state; the player surfaces controls that vary by
mode (one slider for Mode A, full DJ panel for Mode B holder, three
mini-controls for Mode C trio).

Real-time sync: WebSocket or Supabase realtime channel keyed by
Circle ID. Each phone publishes its vote / control inputs; everyone
subscribes to the room's aggregate state.

### Why this matters

- It's the **headline feature** that turns Colourmap from a
  personal app into a shared social ritual — parties, dinner
  tables, rooms of friends, gym sessions, focus rooms.
- The simplest mode (vote axis) is also the easiest to ship — one
  slider per phone, one average per room.
- Connects directly to:
  - `parties-social-art-connector.md` — parties as the wedge
  - `social-media-future-and-circles.md` — Circles as the room
  - `groove-machine-songs-and-moods.md` — what the room is
    wandering through together

## Open questions

- **Vote frequency**: continuous (every slider tick rebroadcasts)
  or sampled (every 4 bars the room polls)? Continuous = more
  alive; sampled = less network chatter and avoids fight-y
  oscillation.
- **What happens with disagreement?** Average is one answer.
  Weighted by recent activity is another. "Show the spread"
  visually so the room *knows* it's split is yet another. V1:
  simple unweighted average; iterate from there.
- **Permissions**: Mode B/C give one person/team the levers — what
  if they pick something the room hates? V1: any 3 votes can
  trigger a "pass the stick" override.
- **Latency**: Web Audio scheduling needs ≤ 50 ms to feel real-time
  for tempo changes. Voting via WebSocket is ~80 ms — fine for
  mood, too slow for individual notes. So: votes drive the *target*
  state, the local engine does the bar-aligned interpolation.

## Status

Idea-stage. No code yet. Implementation order:

1. Ship `SoundSessionProvider` + mini-player (foundation, no
   collective UI yet)
2. Ship Chill + Groove blend engine with hand-picked arcs (single
   user)
3. Ship Mode A (vote axis) in a Circle context (needs realtime
   sync layer)
4. Ship Mode B + C (control rotation, team-of-3)
