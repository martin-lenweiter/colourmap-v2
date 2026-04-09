# Missions & Doing — Development Plan

## Current State

The Doing tab has:
- To-do list (pill format, localStorage)
- Missions (pill with progress %, localStorage)
- Trackers (weekly day-dots, localStorage)
- STAR compass (4 dimensions)
- Blocked/Moving writing columns
- Life Wheel (Box 3, radar chart from trackers)

## What's Working

- Tracker day-dots are satisfying and simple
- Pill format for to-do is clean and mobile-friendly
- The compass gives a high-level pulse
- Life Wheel connects trackers to a visual shape

## What's Missing

### 1. Mission Depth
A mission like "Launch the project" should break down into sub-steps.
- Tap a mission pill → see its children
- Each child is a smaller pill
- Progress = children completed / total children
- No manual progress slider needed

### 2. Daily Intention
One sentence at the top of the Doing tab: "Today I focus on ___."
- Not a to-do. A compass heading.
- Persists for the day, resets tomorrow
- Shown in the STAR compass center

### 3. Weekly Review
Every Sunday, the Life Wheel shows two overlapping shapes.
- This week (solid fill) vs last week (faint outline)
- One question: "What will you do differently?"
- Answer saved as a weekly reflection

### 4. Done Archive
Completed to-dos and missions shouldn't disappear.
- Move to a collapsed "Done" section
- Shows count: "12 done this week"
- Expandable to see history
- Gives a sense of accomplishment

### 5. Time Awareness
The Doing tab should know what time it is.
- Morning: "What will you do today?"
- Afternoon: "How's the day going?"
- Evening: "What got done?"
- The Life Wheel could show today's progress vs the week

## Design Direction

The Doing tab should feel like a captain's desk:
- To-do pills = stamps in a logbook
- Missions = routes on a map
- Trackers = ship's instruments
- Life Wheel = the compass on the wall

Warm wood tones. Precision. Warmth. Order without rigidity.

## Backend Integration

When `feature/wire-doing-backend` merges:
- To-do → `/api/backlog` (useBacklog hook)
- Missions → `/api/missions` (useMissions hook)
- Trackers → `/api/sections` (useTrackers hook)

All data survives across devices and sessions.

## Build Order

1. Mission sub-steps (localStorage first)
2. Done archive with count
3. Daily intention input
4. Weekly review overlay on Life Wheel
5. Time-aware placeholders
6. Backend wiring (after PR #13 merges)
