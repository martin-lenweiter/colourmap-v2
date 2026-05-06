# List 2 — Mission Cards + Progress Evolution

_Spec authored 2026-05-06. Answers from Martin confirmed in conversation._

---

## 1. Tab structure

Top scope strip becomes: **List · List 2 · Overview**

- **List** — original Doing tab, unchanged for now
- **List 2** — card-based mission view (this spec)
- **Overview** — long-term progress view (evolves from current Road tab, see §5)

---

## 2. List 2 layout (inspired by Alyn Boxes)

Card color matches the colourmap warm palette — beige/ochre background (`#F8F0E4`), brown borders, not dark like the Alyn reference. Same visual family as the sticky note and feedback overlay.

```
┌─ CURRENT MISSION ─────────────────────────────┐
│  MISSION                          [axis tag]  │
│                                               │
│  Write the chapter                            │  ← handwritten large
│                                               │
│  ◇ challenge · flow              (expandable) │  ← ObjectiveDepth
└───────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  STUCK       │  │  FLOWING     │  │  HEAVY       │
│  2 missions  │  │  1 mission   │  │  1 mission   │
└──────────────┘  └──────────────┘  └──────────────┘
  ↑ emotional state summary row — not task counts

┌─ MISSION CARD ─────────────────────────────────┐  ← collapsed default
│  Write report          [Clarity]  [●]  [done]  │
│  "feels heavy but clear"                        │  ← fragment preview
├─────────────────────────────────────────────────┤  ← tap to expand
│  How it feels   _______________________________ │
│  Blocking       _______________________________ │
│  Flowing        _______________________________ │
│  ○ ○ ○ ○ ○  ease · weight · urgency (dots)     │
└─────────────────────────────────────────────────┘

┌─ MISSION CARD ─────────────────────────────────┐  ← collapsed
│  Call doctor           [Care]     [○]           │
└─────────────────────────────────────────────────┘

     [ + add mission ──────────────────────────── ]
```

---

## 3. Mission card data model

New fields added to the existing `TodoItem` shape (same localStorage key `colourmap:today-objectives`, backward compatible):

```ts
type TodoItem = {
  // existing
  id: string;
  text: string;
  done: boolean;
  notes?: string;
  ease?: number;
  weight?: number;
  urgency?: number;
  status?: 'active' | 'waiting';
  tag?: { name: string; color: string; categoryId?: string };

  // new for List 2
  feels?: string;        // "how it feels" — short fragment
  blocking?: string;     // what's blocking this mission
  flowing?: string;      // what's flowing on this mission
  emotionalState?: 'stuck' | 'flowing' | 'heavy' | null;
  compassAxis?: string;  // e.g. "Clarity", "Care", "Voice" — from COMPASS_AXES
  createdAt?: string;    // ISO timestamp (set on creation, used for progress history)
};
```

---

## 4. Stat row — emotional state summary

**Not task counts.** Shows the emotional texture of today's mission load:

| Box | Logic |
|-----|-------|
| **STUCK** | missions where `emotionalState === 'stuck'` or `blocking` is non-empty |
| **FLOWING** | missions where `emotionalState === 'flowing'` or `flowing` is non-empty |
| **HEAVY** | missions where `emotionalState === 'heavy'` or `weight >= 4` |

User can tag each mission card's emotional state directly (one-tap: stuck / flowing / heavy), or it's inferred from the blocking/flowing text and weight slider.

---

## 5. Two channels for blocking/flowing

As Martin confirmed: **two parallel channels**, both valid:

1. **Per-mission** — blocking/flowing fields live on each mission card (the `feels`, `blocking`, `flowing` fields above). Granular. E.g. "Write report — blocking: can't find the right angle."

2. **External / daily** — the existing `ObjectiveDepth` component (the ◇ diamond under Current Objective in the Doing tab). Broader daily state. E.g. "Today's flow: music is working, org is scattered."

Both feed the Progress page. Per-mission fragments are tagged with a compass axis. Daily fragments are untagged (they appear as general day-level reflections).

---

## 6. Compass axis connection

Each mission card can be tagged with a **compass axis**. This is the bridge between daily work and the Progress page.

### Axis map (initial)

| Compass Axis | Group | Life category examples |
|---|---|---|
| Care | Feeling | Health, Boxing, Sleep, Food |
| Attitude | Feeling | Mindset, Morning ritual |
| Rest | Feeling | Recovery, Nature |
| Emotions | Feeling | Journaling, Therapy |
| Clarity | Doing | Planning, Focus, Deep work |
| Target | Doing | Goals, Projects |
| Resources | Doing | Money, Tools, Systems |
| Action | Doing | Execution, Discipline |
| Voice | Sharing | Band, Public speaking, Writing |
| Listen | Sharing | Learning, Reading, Feedback |
| Bond | Sharing | Relationships, Friendship |
| Boundary | Sharing | Personal space, Saying no |

**Later**: life categories (Boxing, Band, Sleep…) will be manually linked to their axis. E.g. Boxing → Care → Body+Energy. Band → Voice+Bond → Organisation+Connection.

---

## 7. Progress page evolution (Overview tab)

The Overview/Road tab will eventually become a **Progress view** — not built yet, but the data model above prepares it.

### What it shows

For each compass axis, over time:

```
VOICE  ──────────────────────────────────→ time
  ● Unstable · Unorganised · Unreliable     ← band fragment, March
  ● Scattered but present                   ← band fragment, April
  ○ → Trustable · Solid · Organised         ← target state
```

The user's real example: *"In the band I still feel unorganised and we all see me as unstable. I want to get to the point where I become trustable and solid for organisation missions."* This maps to:
- Axis: **Voice** (band as sharing/performing self) + **Action** (organisation/discipline)
- Current state fragments: "unorganised", "unstable"
- Target state: "trustable", "solid"

The progress page reads the `feels`/`blocking`/`flowing` fragments by axis over time and shows a timeline of emotional evolution. No chart required — even a simple chronological list of fragments per axis, grouped by week, is already powerful.

### Progress dimensions (from Martin)

Discipline · Organisation · Emotions · Social Connection · Stability · Health · Focus

These map onto compass axes. Example:
- Discipline → Action + Clarity
- Organisation → Target + Resources
- Social Connection → Bond + Voice
- Stability → Care + Attitude + Boundary
- Health → Care + Rest
- Focus → Clarity + Emotions

---

## 8. Circle 2.0 — Ring Circle / Feeling 2 tab

_Confirmed 2026-05-06: Circle 2.0 is its own **Feeling 2** tab, not a replacement of the current Feeling tab. Both coexist. All four state circles get the ring treatment._

### What "four circles" means
Body · Mind · Emotions · Social/Connection (the Sharing circle, currently in SharingCheckIn)

### What changes vs current solid circles
- Current: solid 90px ball, single color, label below
- Circle 2.0: **thick ring**, text inside (title + state label + fragment), **color changes with state** (no arc fill for now)
- Experimental option for later: clockwise arc fill — ring fills proportionally as you move through the spectrum

```
        ╭──────────────────────╮
     ╭──╯                      ╰──╮
    │        EMOTIONS              │
    │                              │  ← ring color = current state color
    │          Courage             │  ← state label (large, handwritten)
    │    "feeling tight today"     │  ← tiny editable fragment (optional)
     ╰──╮                      ╭──╯
        ╰──────────────────────╯
           drag ring = change state
```

### Ring behavior
- **Color**: whole ring color = state color (same palette as current circles)
- **Drag**: same ew-resize gesture as current — drag left/right to change state
- **Inside text**: title label (BODY etc) + state name + one-line editable fragment
- **Fragment**: single tap inside circle (when not dragging) opens inline edit. Auto-saved to localStorage. Timestamped. Feeds Progress page.

### Arc fill experiment (later)
Optionally the ring fills clockwise as you go up the spectrum. Level 0 = ~10% filled (thin arc), max level = ~95% filled. Can be toggled per-user or per-tab.

### Lives in
A new **Feeling 2** tab in the Feeling section — same position as the List 2 tab in Doing. The current Feeling tab (solid circles) stays untouched alongside it.

---

## 9. Answers — confirmed 2026-05-06

**List 2 / Mission cards:**
- [x] **Stuck/Flowing/Heavy tagging**: **manual** — user taps to tag each card
- [x] **Compass axis on card**: **yes, visible colored pill** (e.g. `[Clarity]`)
- [x] **Original List**: stays untouched

**Circle 2.0 / Feeling 2:**
- [x] **Tab name**: "Feelings 2.0" — a new tab/page, does NOT replace current Feeling tab
- [x] **Arc**: color changes only for now; clockwise fill as later experiment

---

## 10. Answers — confirmed 2026-05-06

- [x] **Fourth circle**: **Focus** — alongside Body · Mind · Emotions
- [x] **Fragment**: **one short line** inside the ring, no expand
- [x] **Compass axis routing**: **automatic** — each circle pre-routes its fragments:

| Circle   | Auto-routes to axis |
|----------|---------------------|
| Body     | Care                |
| Mind     | Attitude            |
| Emotions | Emotions            |
| Focus    | Clarity             |

These are the default routes. Life categories (Boxing → Care, Band → Voice…) add on top.

---

## 11. Feelings 2.0 + List 2 — companion 2.0 vision

These two tabs belong together. They are the **2.0 layer** of the app:

| Current (1.0) | 2.0 evolution |
|---|---|
| Feeling tab — solid circles | **Feelings 2.0** tab — ring circles, fragments, auto-routed |
| Doing tab — list view | **List 2** tab — mission cards, stuck/flowing/heavy, axis pills |
| Overview/Road | **Progress** — fragments from both tabs unite into axis timelines |

Build order: List 2 first (mission cards), then Feelings 2.0 (ring circles), then Progress aggregation.

---

## 12. Full spec — complete, ready to build

**List 2**: warm beige cards, manual stuck/flowing/heavy tag, compass axis colored pill visible, per-card blocking/flowing + global ◇ diamond channel, original List untouched.

**Feelings 2.0**: four ring circles (Body · Mind · Emotions · Focus), color-only for now (no arc fill yet), one-line fragment inside each ring, auto-routed to compass axis (Care · Attitude · Emotions · Clarity).

**Progress**: reads all fragments by axis over time — timeline view per axis showing emotional evolution (e.g. Voice axis: "unstable/unorganised" → "trustable/solid").
