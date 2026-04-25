# Projects — Calendar-Aware Planning

> Idea (Martin, 2026-04-25): "spec that for projects idea is that
> it works with calendar and helps you plan them. check boxes on
> progress to accomplish. and what is needed to accomplish ... so
> for me it would be colour map. and solo album. and a
> sophisticated elegant process to see and organise how i can get
> there."

A small, calm planner inside Colourmap. Not Asana, not Trello —
**a sophisticated elegant process** for the 2–6 long-arc Projects
each user is actively building. For Martin: *Colourmap* and *Solo
Album*. For our band: *the EP*. For another user: *the renovation*
+ *the move to Lisbon* + *the children's book*.

The aim is sub-Notion: gentle structure, not a grind. The aim is
super-Trello: connected to the rest of Colourmap so the calendar,
check-ins, music sessions, and Notebook all feed into one map of
where you actually are on each project.

## Where it lives

A new top-level surface: `/projects` (eventually). For now,
discoverable from the Notebook's existing `Projects` notebook
category (which already exists). Each project = a card. Tap a
card → it opens the **planner view**.

## What a Project holds

```ts
interface Project {
  id: string;
  name: string;            // "Colourmap", "Solo Album"
  colour: string;          // single hex; defines the project's
                            // visual identity across the app
  intent: string;          // 1–2 sentence "why" — what success
                            // looks like
  startedAt: string;       // ISO date
  targetAt?: string;       // optional soft due date
  archivedAt?: string;     // moves to "past projects" when set
  
  milestones: Milestone[];
  needs: Need[];
  // future:
  // notebookEntries: string[];  // ids of linked notebook entries
  // sessions: Session[];        // music / focus sessions logged
  // people: string[];           // co-conspirators (Circles)
}

interface Milestone {
  id: string;
  title: string;           // "Ship EP demo"
  description?: string;
  status: 'open' | 'doing' | 'done' | 'parked';
  dueAt?: string;          // calendar-anchored
  doneAt?: string;
  subTasks: SubTask[];     // checkboxes — concrete things to do
}

interface SubTask {
  id: string;
  text: string;            // "Mix vocals on track 3"
  done: boolean;
  doneAt?: string;
}

interface Need {
  id: string;
  text: string;            // what's required to accomplish
  // examples: "studio booking 2026-05-15", "€800 for mastering",
  // "feedback from Anya on the lyrics", "free Saturday for the
  // photoshoot"
  type: 'time' | 'money' | 'people' | 'tool' | 'decision' | 'other';
  resolved: boolean;
}
```

## The planner view — three layers, top-to-bottom

### 1. The intent

A single editable italic line at the top:

> *"A wellness + creative app for working artists. Year 1 = 5,000
> paying users running their bands and salons inside it."*

That's the **why**. Used to sanity-check every milestone — *does
this milestone serve that intent?* If not, park it.

### 2. The road — milestones on a calendar strip

A **horizontal calendar strip** showing the next 12 weeks, with
milestones placed on their due dates. Each milestone is a small
coloured pill:

```
   May            Jun             Jul             Aug
   ─────────────────────────────────────────────────────
   ●Ship             ●Mastering              ●EP release
   demo                                       (target)
```

Drag a pill left/right to reschedule. Tap it to expand the
sub-tasks. Past-due milestones drift to a **soft red glow** but
don't shout — gentle nudge, not anxiety bait.

Below the strip, a small *"this week"* section shows just the
milestones falling in the next 7 days, with their sub-task
checklists inline so you can tap-tick as you work.

### 3. The needs — what's required to accomplish

Below the road, a small list of **what's missing**. These are the
unblockers. Examples for an album:

- ☐ Studio booking for May 15 *(time)*
- ☐ €800 for mastering *(money)*
- ☐ Feedback from Anya on track 3 lyrics *(people)*
- ☐ Decision on album cover concept *(decision)*
- ✓ Mic preamp returned from repair *(tool)*

Each need is checkbox + tag (time/money/people/tool/decision).
Resolved needs fade out after 7 days. The visible list is
*always small* — only what's still blocking.

This is the **sophisticated elegant** part: the user doesn't have
to plan everything. They just have to keep this short list of
"what's still in the way" honest.

## How it ties to the rest of Colourmap

The planner only earns its keep if it doesn't sit alone. Five
quiet integrations:

1. **Calendar strip ↔ system calendar.** Milestone due dates can
   sync (read-only first; write later) to iCal / Google Calendar.
   Nothing else from Colourmap shows up there — just project
   milestones, so the user sees them next to their other
   commitments.
2. **Daily check-in ↔ project colour.** When the user logs an
   objective on `/day`, they can tag it to a project. The
   project's colour shows on the objective. The streak / Track
   Lines layer of Overview reads from these tags.
3. **Music sessions ↔ project log.** A "Save this moment" from
   Chill or Groove can be tagged with a project. The project's
   timeline shows "12 sessions across April" alongside the
   milestones. Useful for an album in progress.
4. **Notebook ↔ project.** Notes can be linked to a project.
   Lyrics for an album track. Spec sketches for Colourmap. Ideas
   live in Notebook; the project view *aggregates* them.
5. **Circles ↔ project.** A project can be shared with a Circle
   (the band Circle, for the EP). Members see milestones +
   needs + sub-tasks. Mission-completion fires gentle
   notifications in the Circle.

## For Martin specifically — Colourmap + Solo Album

Worked example to make this concrete.

### Project: Colourmap

- **Intent:** *Patagonia of social, not Meta. 5,000 paying users
  by year 1, all hosting Circles + Salons.*
- **Colour:** `#B33A2B` (brand red)
- **Milestones (next 12 weeks):**
  - *Circle Missions schema + UI* — May 5 (open)
  - *Run our band on Circles for 2 weeks* — May 6–20 (open)
  - *Salon #1 in our living room with 8 friends* — May 25 (open)
  - *Underground Night #1 venue booked* — June 15 (parked,
    needs venue)
  - *App store submission* — July 30 (open, needs Apple dev cert)
- **Needs:**
  - ☐ Apple developer cert *(decision + €100)*
  - ☐ Friend to host Salon #1 with us *(people)*
  - ☐ Venue scout for Night #1 *(time + decision)*
  - ☐ Decide on payment processor *(decision)*

### Project: Solo Album

- **Intent:** *6-song debut, recorded mostly at home, mixed
  professionally. Released as an EP first, full LP at year-end.*
- **Colour:** `#7A3850` (wine — different enough from Colourmap)
- **Milestones (next 12 weeks):**
  - *Demo all 6 tracks* — May 1 (doing)
  - *Mix tracks 1+2 with [name]* — May 18 (open)
  - *Photoshoot for cover* — June 7 (open)
  - *Master tracks 1+2* — June 25 (open)
  - *Single release on streaming* — July 15 (open)
- **Needs:**
  - ☐ Studio time for vocals on track 3 *(time + money)*
  - ☐ Cover photographer confirmation *(people + decision)*
  - ☐ €800 mastering budget *(money)*
  - ✓ Mixing engineer secured *(people)* — done last week

This is the **sophisticated elegant process to see and organise
how I can get there** — at a glance, on one screen, both projects
visible, you know exactly what's blocking each one this week.

## Design rules

1. **One screen per project.** The whole project fits on a
   phone screen + a short scroll. No tab labyrinth.
2. **Calendar strip is horizontal-scroll only.** No grids, no
   month-view. Just a 12-week ribbon.
3. **Sub-tasks are checkboxes with handwritten font.** Crossing
   them off feels like crossing them off a real list.
4. **Needs > tasks.** Make the *blocking* list small and visible;
   the *to-do* list lives inside milestones (not as a flat
   eternal backlog).
5. **No prioritization fields.** The calendar already orders
   things. Don't add "P0 / P1 / P2" labels.
6. **Archiving is celebration.** When a project is done, it
   doesn't disappear — it moves to a *Past Projects* shelf below
   the active ones, with a small one-line memorial of when it
   shipped + what it was.

## Implementation order (small PRs, after Circle Missions ships)

1. **Schema + service** — `projects` + `project_milestones` +
   `project_needs` tables; basic CRUD service.
2. **`<ProjectsList />` page** at `/projects` — cards in a
   3-column grid (1-column phone). Each card shows colour +
   name + this-week milestone count + 1 line of intent.
3. **`<ProjectPlanner />` page** for an individual project —
   intent, calendar strip, this-week section, needs list.
4. **Sub-task checkboxes inline** when a milestone is expanded.
5. **Tag-to-project** on Day check-in objectives + Notebook
   entries + saved sound moments.
6. **iCal export feed** — read-only, one URL per project, paste
   into the user's calendar app.
7. **Circle ↔ project link** — share a project with a Circle so
   members see milestones + needs.

## Modular dashboard per project + AI-aware layout

> Idea (Martin, 2026-04-25): "could be amazing long term to have
> AI help u think what could be best and have a modulable
> dashboard depending on the project. so code would need
> different components for mission tracking and moods etc... and
> when AI is in the app u can activate or deactivate and customise
> it. could also be without AI with a design menu that asks you
> what tools to activate."

A solo album's planner needs different tools from a Colourmap
sprint, which needs different tools from a renovation, which
needs different tools from a 3-month research dive. Each project
should be **a dashboard the user composes** from a small library
of building-block components.

### Component library — choose 3–6 per project

A small palette of dashboard widgets, each a self-contained
component that reads from project data:

| Widget | What it shows | Best for |
| --- | --- | --- |
| **Calendar strip** | 12-week milestone ribbon | Any project with deadlines |
| **Sub-task checklist** | Inline checkboxes per milestone | Habit / build / craft |
| **Needs board** | Time / money / people / decisions | Album, renovation, launch |
| **Mood track** | Daily check-in colour over time, scoped to this project | Inner-life-heavy projects (album, novel) |
| **Session log** | Music / focus sessions tagged to this project | Albums, study, deep-work |
| **Notebook drawer** | Linked notebook entries (lyrics, sketches, decisions) | Creative projects |
| **People panel** | Collaborators + their compass colour today | Band project, co-built things |
| **Budget tracker** | Optional spend log | Anything with €€ |
| **Reference shelf** | Pinned links / images / audio refs | Music, design, research |
| **Reflection prompt** | Weekly "what's working / what's stuck" question | Long-arc projects |

A new project starts with a default 3-widget layout (Calendar +
Sub-tasks + Needs). The user can add or hide widgets at any time
from a small `+ widgets` menu beneath the project page. The
chosen layout persists per project — the album dashboard can be
different from the app dashboard.

### Two paths to a custom layout

**Path A — manual (always available).** A simple design menu that
asks *what's this project about?* with suggested starter shapes:

- *Mostly making something* → Calendar + Sub-tasks + Notebook
  drawer + Reference shelf
- *Mostly coordinating with people* → People panel + Calendar +
  Needs + Reflection prompt
- *Mostly an inner journey* → Mood track + Session log +
  Reflection prompt + Notebook drawer
- *Mostly building a system* → Calendar + Sub-tasks + Needs +
  Budget
- *Custom* → tick what you want from the full list

No AI required. The user composes what they need.

**Path B — AI-assisted (when user has AI on).** A toggle in
settings: *"Let AI shape my project dashboards."* When on, AI
watches the project's first 1–2 weeks of activity and suggests
widget additions one at a time, each with a one-tap yes/no.
Examples:

- *"Three of your last five sessions tagged this project. The
  Session log might be useful here."*
- *"Your check-ins around this project have been heavy — want a
  Mood track widget so you can see the shape over time?"*

The same toggle controls AI throughout the app. **Default = off**.
The app must work beautifully with no AI ever activated.

### Why modularity matters

- A planner that fits the project. A novel doesn't need a budget
  tracker; a kitchen reno doesn't need a mood track.
- Discoverability of tools. Users learn what exists by browsing
  the widget library, not by memorising features.
- Progressive complexity. First-time users see 3 widgets and feel
  competent. Power users add 8 and feel served.
- Future-proof. New widgets (ColourStudios loop slot,
  Salon-attendee tracker) just appear in the library.

### Implementation order — modular layer

After the base planner ships:

1. **Widget registry** — internal list of available widgets with
   id + label + default props + which project types it suits.
2. **Layout state per project** — `widgets: WidgetId[]` on the
   Project record. Default = `['calendar', 'subtasks', 'needs']`.
3. **`<ProjectPlanner />` reads the layout** and renders widgets
   in order. Each widget self-contained.
4. **Reorder / add / remove UI** — long-press to grab; tap
   `+ widgets` to open the library.
5. **Path A — design menu** with the 5 starter shapes.
6. **Path B — AI suggestions** ships later, once the app-wide AI
   plumbing is in (separate spec).

## Future-future

- **AI-suggested needs.** "You've slipped 2 milestones in a row —
  what's blocking? Pick from likely candidates: time, money,
  decision, missing person."
- **Project arcs visualised in Overview.** The Track Lines layer
  of the Overview vision pulls per-project momentum from this
  data.
- **Salon Mode for projects.** Lock yourself in a 90-minute
  focused session with a single milestone selected. Music
  picks up the project's colour for the duration.
- **Public project pages.** Opt-in. A clean read-only view of
  one project for a portfolio site or label pitch. The user
  decides exactly what to share — the public sees intent +
  finished milestones, not the messy needs list.

## Risks & honest tradeoffs

- **Could become work-tracker bloat.** Mitigation: the design
  rules above are about restraint. If the planner ever feels
  like Asana, we've failed.
- **Calendar sync is hard.** iCal / Google / Outlook all have
  edge cases. Start read-only (one-way: us → their calendar)
  before attempting two-way.
- **Two long-arc projects is realistic; ten is anti-pattern.**
  After 5 projects, gently nudge: *"these all matter — which 2
  are you actively working on this month?"*

## Connections

- `circles-music-band-first-test.md` — Circle Missions are the
  multi-player version of Project Milestones; the same shape
- `overview-vision-progression-patterns-beauty.md` — Track Lines
  layer pulls from project sub-task completion
- `notebook.md` — projects are linked-from but not stored-in
  the Notebook
- `cockpit.md` — Day-page objectives can tag a project for
  colour-coding
- `passcode-pads-and-game-unlocks.md` — finishing a milestone
  could play a tiny celebratory phrase on a fresh pad

## Closing

For an artist building a band project, an album, and a small app
all at once — and having a normal life — this is the spine.
Every other surface in Colourmap is about *being*. Projects is
about *moving*. Together they're a complete picture of an
intentional life.
