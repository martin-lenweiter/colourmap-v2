# Doing Tab

> Three-layer system that separates life missions from today's tasks from tomorrow's parking lot — with category filtering and direct agenda scheduling.

## Problem

A flat doing list overwhelms. Big life missions sit next to "buy milk". This week's priorities are invisible. The agenda is a disconnected silo. The result: nothing feels in order and the user disengages.

## Three Layers

### Layer 1 — Missions (the horizon)
Active life vectors: "launch colourmap", "fix shoulder", "deepen social life". No deadline — a direction. Each mission contains objectives. This is the slow, meaningful layer.

### Layer 2 — Quick Tasks (the inbox)
Everything that doesn't belong to a mission but needs doing today. "Call dentist", "reply to Marco", "pay invoice". Fast to add, fast to clear. Each task has a category dot.

### Layer 3 — Tomorrow Shelf
A parking lot for things intentionally deferred. Items here roll over to today at midnight. No guilt, no re-sorting — just "aware of this, not today."

## Category Dot Filter Rail

Four categories shown as colored dots above both Missions and Quick Tasks:

| Category     | Color    | Meaning                        |
|-------------|----------|-------------------------------|
| People      | #D4805A  | Contacts, relationships        |
| Organisation| #6890B0  | Admin, logistics, order        |
| Creative    | #9B6BA0  | Work that produces something   |
| Body        | #7A9A7A  | Health, movement, energy       |

- All dots active by default (no filter).
- Tap a dot to filter — show only items in that category.
- Tap again to deactivate. Tap active single filter again → resets to All.
- Category assignment: per mission (stored in localStorage), per quick task (stored with the task).

## Schedule-from-Objectives

Each objective inside a mission has a small schedule icon (◷) visible on hover.
- Clicking opens an inline hour picker (6am–10pm, 1-hour steps).
- Selecting a time POSTs to `/api/agenda-blocks` and creates a block for today.
- The objective gets a small "× hr" indicator showing it has been scheduled.
- This is a manual pull — nothing is auto-scheduled.

## Tomorrow Shelf

- Below quick tasks, collapsed by default.
- "→ Tomorrow" button on each quick task defers it.
- At midnight (detected on component mount via a stored date key), tomorrow items promote to today.
- Tomorrow shelf shows count in the toggle label when items exist.

## Behavior

- Category filter persists in localStorage `colourmap:doing-category-filter`.
- Quick tasks persist in localStorage `colourmap:doing-inbox` as `QuickTask[]`.
- Each task: `{ id, text, done, category, when: 'today'|'tomorrow', createdAt }`.
- Mission category stored in localStorage `mission_category_${id}`.
- Midnight promotion: on mount, if `colourmap:inbox-date` !== today, all `when: 'tomorrow'` → `when: 'today'` and the date key updates.

## Done When

- Category filter rail renders above missions and quick tasks.
- Tapping a dot filters both missions (by mission category) and quick tasks (by task category).
- Quick tasks can be added, checked off, categorised, deferred to tomorrow.
- Tomorrow items roll over at midnight.
- Objectives inside missions show a schedule button; tapping it creates an agenda block.
- Scheduled objectives show a time indicator.
- No data is auto-pushed to the agenda — user always initiates scheduling.

## Tab Ownership Boundary

The following items live **exclusively in the Doing tab** and must never appear in the Feeling tab:

| Item | Component | Notes |
|------|-----------|-------|
| Daily Objectives (today) | `DailyObjectives` | add / check-off / reorder for the current day |
| Push for Tomorrow shelf | `DailyObjectives` | deferred items, midnight roll-over |
| Quick Tasks inbox | `DoingInbox` | fast in-day tasks with category dot |
| Category dot filter rail | `DoingCategoryRail` | filters objectives + tasks |
| Daily Agenda schedule | `DailyAgenda` | time-blocked view of today |

The following items live **exclusively in the Feeling tab** and must never appear in the Doing tab:

| Item | Component | Notes |
|------|-----------|-------|
| Check-in slider (Lonely → Connected) | `FeelingCheckInCard` | mood/energy capture |
| Emotion wheel / colour pick | `FeelingCheckInCard` | emotional vocabulary |
| Facing questions (FDS) | `FeelingCheckInCard` | structured self-reflection prompts |
| Pulses (body / attitude / structure) | `FeelingCheckInCard` | inner state sensors |
| Feeling Compass | `FeelingCheckInCard` | four-quadrant attitude map |

If a new feature needs to touch both doing and feeling data, it must use a shared service layer (e.g. `/api/daily-objectives`) — **never** by importing one tab's component into the other.

## Dependencies

- `MissionTracker` (Supabase missions).
- `/api/agenda-blocks` POST endpoint.
- DailyAgenda reads `agenda_blocks` table — schedule action feeds it directly.
