# Supabase Sync Status — What's wired, what's left

Snapshot of the persistence layer as of 2026-04-26, after the
Circles wire-up. Tracks which surfaces save to Supabase (multi-
device, multi-user) vs. which are localStorage-only (device-local).

Per Martin (2026-04-26): "all cicles needs supabase wire up" +
"make sure supabase is up to date for the other parts as well."

## Surfaces that sync to Supabase ✓

These have proper schema → service → API route → UI integration.
Multi-device + multi-user works.

| Surface | Tables | Service | UI |
| --- | --- | --- | --- |
| **Circles** (incl. members + missions + notes + pulse + sessions) | `circles`, `circle_members`, `circle_missions`, `circle_notes`, `circle_sessions` | `lib/services/circles.ts` | `CircleBoard.tsx` via `lib/use-circles.ts` |
| **Check-ins** | `check_ins` | `lib/services/check-ins.ts` | `FeelingCheckInCard.tsx` (writes both LS + API) |
| **Life Scans** | `life_scans`, `life_scan_answers`, `scan_reflections` | `lib/services/life-scans.ts` | `/life-scan` |
| **Life Categories** | `life_categories` | (queries) | `LifeCategories.tsx`, `LifeCategoriesEmptyState.tsx` (newly wired) |
| **Daily Objectives** | `daily_objectives` | (queries) | `FeelingCheckInCard.tsx` |
| **Agenda Blocks** | `agenda_blocks` | (queries) | `DailyAgenda.tsx` |
| **Notebook entries** | `notebook_entries` | `lib/services/notebook.ts` | `/notebook` |
| **Missions** (personal, distinct from circle_missions) | `missions` | `lib/services/missions.ts` | various |
| **Backlog** | `backlog` | (queries) | various |
| **Cockpit Sections** | `cockpit_sections`, `section_trackers` | (queries) | cockpit |
| **Outings** | `outings` | (queries) | various |
| **Daily Tracker Entries** | `daily_tracker_entries` | (queries) | trackers |

## Surfaces still localStorage-only ⚠

These only persist on the user's current device. Acceptable in some
cases (device-local prefs); a future-PR target in others.

### Acceptable as device-local

These should *stay* localStorage because they're per-device prefs:

- **Wave style / beat volume / visualizer settings** (BinauralTuner)
- **Theme / palette / font size** (FeedbackOverlay, theme switchers)
- **Care theme** (CareCompass)
- **Section labels per device** (FeelingCheckInCard)
- **Section open/closed states** (every collapsible)
- **Day tab last-used** (DayTabs)
- **Sound session tracking** (`colourmap:sound-session` — for the
  MiniPlayer pill, only meaningful per-device)
- **Onboarding flags** (FirstRunOnboarding, CheckInPing)
- **Recent presets** (Groove, Chill — stay local for instant load)

### Should sync — follow-up PRs

Each ~half-day of backend work + half-day of UI wire-up.

| Surface | Local key | What's needed |
| --- | --- | --- |
| **Profile** | `colourmap:profile` | New `profiles` table + service + `/api/profile` GET/PATCH + Profile.tsx update |
| **Saved Chill mixes** | `colourmap:tuner-mixes` | New `chill_mixes` table + service + routes + BinauralTuner save/load |
| **ColourStudios loops** | `colourmap:colourstudios-loops` | Storage decision: blob in DB vs. Supabase Storage bucket. Then `studio_loops` table referencing the blob URL |
| **Circle mission notes thread** | `colourmap:circle-annotations` | New `circle_mission_notes` table + service + endpoints under `/api/circles/[id]/missions/[missionId]/notes` |
| **Circle chapter / chapterMeanings** | `colourmap:circle-annotations` | Add `chapter` + `chapter_meanings` columns/json to `circles` + endpoint |
| **Saved Magic Maker / Lo-fi Looper patterns** | various | Tables + services if patterns are worth preserving across devices |

### Local cache for synced data

These are localStorage-mirrors of Supabase data — **not** independent
sources. They exist for offline-friendly first paint:

- `colourmap:circles` (mirror of /api/circles)
- `colourmap:check-ins` (mirror of /api/check-ins)
- `colourmap:notebook-entries` (mirror of /api/notebook)
- `colourmap:life-categories` (mirror of /api/life-categories)
- `colourmap:life-log` (mirror, not yet API'd — see below)
- `colourmap:today-objectives` (mirror of /api/daily-objectives)

### Mirrored locally but no API yet

- **Life log** (`colourmap:life-log`) — entries logged against a life
  category. The categories sync, but the *log entries* don't yet.
  Important for the band test if members want to see "what each person
  has been working on per category." Add `life_log_entries` table
  + service + routes.

## Priority for the band-test

For the upcoming 2-week band test (per `circles-music-band-first-test.md`),
what *must* sync vs. what's optional:

**Must** (already done after this PR):
- Circles + members + missions + notes + pulse ✓
- Check-ins (compass colour visible to band) ✓
- Life categories (so the band can see what each person is tending) ✓
- Notebook entries (so songs / lyrics can be shared via Circle later) ✓

**Optional** (defer):
- Profile (each member has a personal profile page; not group-visible
  yet anyway)
- Mission notes thread (nice-to-have; band can use Circle log notes
  for now)
- Chapter (rarely used; `Mission` and `Note` cover the band's needs)

## Closing

The Circles wire-up + LifeCategoriesEmptyState fix in this PR closes
the last critical gap for the band test. The follow-up items above
are bonus-quality-of-life — none of them block running our first
two-week test.

Before any of those next syncs, *use Circles for two weeks*. The
test will tell us which sync gap is actually felt vs. which is
theoretical.
