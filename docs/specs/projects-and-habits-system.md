# Projects & habits — system design (2026-04-24)

User brief, paraphrased: "I see different projects. Colourmap is one,
my songs are another, the band is another (which would connect with
Circles). I want to track and organize separate projects in my life.
Also a notebook for bad habits — track them, write how they felt,
checklist of when last you did it."

This spec frames how the existing pieces (Day, Music, Circles, Notebook,
Check-in) become facets of a **Projects** system, and how a **Habits**
tracker fits.

---

## The insight

The app today treats the user as **one person with one continuous
life**. But a real life is parallel tracks: career, music, family, a
band, a side project. Each needs its own running log, its own goals,
its own circle of people, its own artifacts.

What we call a "project" here is **any ongoing effort the user wants to
think about as a unit** — not a to-do list. It could span years.

---

## Three primitives, not four

To keep the surface area small, three primitives cover everything the
user asked for:

1. **Project** — a container. Has a name, a color, a set of notes, an
   optional Circle (people), an optional habit log.
2. **Note** — a block-structured document inside a project (the Music
   setlist's song editor is an example — verse/chorus/bridge blocks).
   Notes have a category (e.g. "song", "meeting", "lyric sketch").
3. **Habit log** — a tracker attached to a project. Binary: did you do
   the thing today? With a feeling note per entry. Supports both
   positive habits ("wrote 30 min") and habits to reduce ("no drinking").

The existing surfaces map cleanly:
- **Day** — the user's primary (personal) project. Its "notes" are
  check-ins. Its "habits" are the Hawkins/flow/challenge entries.
- **Music** (just shipped) — a dedicated project with song notes.
- **Circles** — people, across projects. A project can *reference* a
  circle ("my band is circle X") without owning it.
- **Notebook** — free-form notes, already bucket-able by category. In
  the projects model, Notebook becomes the "uncategorized" project —
  the place stuff lands before it earns its own home.

---

## Navigation — the layout the user already wants

Current nav: `Day · Music · Circles · Notebook`.

Proposed evolution after this spec lands:
- `Day` — personal + check-in stream (unchanged)
- `Circles` — people (unchanged)
- `Projects` — replaces `Music` + `Notebook` in the bar. Clicking opens
  a top-level **list of projects**, each with its name + color chip +
  most-recent-activity line. Tap a project → its notes + habit log.

Pre-built projects:
- **Music** (already created by this PR — migrates into the projects list
  with the existing songs)
- **Notebook** (migrated: previously free-form entries become notes in
  the "Notebook" project)

The user adds more (`band`, `business`, `apartment`, `reading`, ...).

This removes the top-nav crowding — `Music` doesn't need its own bar
link once we have a `Projects` hub.

---

## The Music project

Shipped in this PR as `/music`. In the projects model, it becomes the
first concrete project with a canonical schema:

- **Project metadata:** name, color, optional associated-Circle id.
- **Notes** — each is a song. Song = blocks (verse / chorus / pre-chorus
  / bridge / intro / outro / note). Each block is an independent
  textarea stacked vertically — lets the song's SHAPE be legible.
- **Categories** on notes: `wip` / `finished`. Split the list in two.
- **No habit log** on Music specifically (songwriting isn't a daily
  habit the user needs to track as yes/no).

Future Music features the spec reserves:
- Attach recordings (audio file upload per block)
- Lyric-only view (collapse all blocks to text-only, strip UI chrome)
- Order / reorder blocks (drag handle)
- Duplicate a block (for parallel verses)
- Version history per song

---

## The Habits log — how it works

Inside any project, the user can open a **Habit tab** with two kinds of
trackable behaviors:

**"I want to do this"** (positive habit):
- Binary: did I do it today? Tap to mark yes.
- Streak count auto-derived from consecutive yes days.
- On tap-yes, a short prompt: "how did it feel?" (one-line entry,
  optional).

**"I want to do less of this"** (reducing habit):
- Primary display: "last time was N days ago" (not streak, but gap).
- On "I did it" tap: an entry form:
  - Time (auto now, editable)
  - How did I feel **before** (1-line)
  - How did I feel **after** (1-line)
  - Intensity 1-5 (optional dot slider)
- Review shows entries over time so the user can see the
  before/after pattern. The point is not shame — it's **awareness**.

A project can have multiple habits (e.g. Music project: "wrote today"
positive + "perfectionism spiral" reducing).

Storage: each habit is a row with an `entries: HabitEntry[]` array.
Entry = `{ date: ISO, kind: 'yes' | 'occurrence', before?: string,
after?: string, intensity?: 1-5 }`.

---

## Data model (for when Supabase lands)

```
Project {
  id, userId, name, color, createdAt, updatedAt
  circleId? -- links to a circle for shared projects (band, team, etc.)
}

Note {
  id, projectId, userId
  title, categoryTag  -- e.g. 'wip'/'finished' for songs
  blocks: Block[]
  createdAt, updatedAt
}

Block {
  id, type  -- 'verse'/'chorus'/'bridge'/'paragraph'/etc.
  text
  ordering  -- for drag-reorder
}

Habit {
  id, projectId, userId, name, kind  -- 'positive'|'reducing'
  target?: 'daily'|'weekly'
}

HabitEntry {
  id, habitId, at, kind  -- 'yes'|'occurrence'
  before?, after?, intensity?
}
```

For v1 (now), all of the above lives in localStorage under
`colourmap:projects`, `colourmap:notes-<projectId>`,
`colourmap:habits-<projectId>`. Server sync comes with Supabase.

---

## Where the pieces live on screen

### Phone
- Nav: `Day · Projects · Circles · [more]`
- `/projects` — a list of project cards with color + last-activity line.
  Tap a card → project detail.
- Project detail has two sub-tabs: `Notes` and `Habits`. Notes is the
  song-editor-style surface. Habits is the tracker.

### Desktop
- Same structure but projects list can be the *left rail* and selected
  project is the main column.

---

## Migration from today's state

1. **Music** project becomes the first real project when /projects
   lands. Songs created via this PR migrate unchanged (same
   `colourmap:music-setlist` data remapped).
2. **Notebook** entries become a default "Notebook" project with one
   untitled note per category.
3. **Day check-in history** stays at `/day` — it doesn't move into
   projects because check-ins are cross-project.
4. **Circles** stays as a separate top-level thing — people, not
   projects.

---

## Priority ranking for the next wave

1. **Ship the `/projects` hub** (half day) — list view of projects,
   create / rename / color-pick, wire existing Music as the seed.
2. **Port the song editor to a generic Note editor** (half day) — same
   block model, works for meeting notes, journaling inside a project,
   etc.
3. **Habits primitive** (1 day) — the tracker UI, positive + reducing
   variants, daily roll-up.
4. **Circle linkage** (2 hours) — a dropdown on each project to attach
   it to an existing circle; the circle page then shows "projects in
   this circle".
5. **Supabase migration path** (1-2 days) — schema, RLS, migration
   script from localStorage.

---

## What we're NOT building in this spec

- Collaboration inside a project (two people editing the same song in
  real-time). Out of scope for 2026.
- File attachments. Maybe later.
- Calendar integration. Separate spec.
- Mobile push notifications for habit reminders. Nice-to-have v2.

---

## Open questions

- Do Music's "songs" become generic Notes with a `song` type, or does
  Music keep a specialized editor that's a richer surface than Notes?
  Leaning toward **generic Note with block types**, and letting the
  block types differ per project template.
- Should the habit log surface in Day too (as a daily roll-up banner:
  "3 habits pending today")? Probably yes, once it exists.
- Is "Notebook" still a distinct tab after /projects lands, or does it
  fully absorb into the Notebook-as-default-project?
