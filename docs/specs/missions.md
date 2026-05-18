# Current Mission

> Active objectives you're working toward today — with space to name the challenge and define the target.

## Context

Tasks without awareness become a grind. Awareness without tasks becomes navel-gazing. Missions sit on the right side of the cockpit so you see what you're doing alongside how you're feeling. The interaction between the two columns IS the product.

## Behavior

- Missions live in a card titled "Current Mission" on the right column.
- Add via a + button in the header. Clicking + reveals an input field. Input hides after adding.
- Each mission is a collapsible card showing the title.
- Clicking the title expands the card to show three collapsible fields:
  - **Objective** — single-line input. "Define the target."
  - **Challenge** — single-line input. "What's making this hard?" Red accent when filled.
  - **Notes** — multiline textarea. "Background, links..." Hidden behind toggle.
- Collapsed mission text must stay readable. User-written mission titles and previews wrap naturally
  to at least two lines, and three or more lines when needed; they must not be cut with ellipsis,
  single-line truncation, or hidden overflow.
- Only one field open at a time within a card.
- Fields auto-save with 800ms debounce.
- Circle checkbox to mark complete. Completed missions move to a "Done" section with strikethrough.
- Delete via ✕ button.

## States & Edge Cases

- Zero missions: show "No missions yet. What are you working toward?"
- New mission: auto-expands after creation so you can fill in details.
- All fields empty: valid. A mission can just be a title.
- Challenge filled: card border tints red to signal a blocker at a glance.
- Completed missions: can be unchecked to reactivate.
- Fetch failure: keep showing the current mission state instead of clearing the card.
- Completion toggle is optimistic. If the patch fails, the mission returns to its prior completed state.
- Delete is optimistic. If the delete fails, refresh missions from the API.

## Done When

- Missions persist across page loads (Supabase).
- Missions load from `/api/missions` for the authenticated user rather than local-only storage.
- All fields auto-save without a save button.
- The card is minimalist when collapsed, detailed when expanded.
- Adding a mission takes one click + typing. No friction.
- Mission text remains readable across Current Mission, Daily Missions, Push for Tomorrow, Mission
  Overview, and Mission Control. Long user-written text wraps instead of disappearing.

## Dependencies

- Supabase auth and database.
- Missions table with: id, userId, title, description, blocking, nextStep, completed, createdAt.

## Next Direction: Mission Control

The current mission card is useful for adding and editing work, but it is not yet a full life-organisation surface. The better version should become **Mission Control**: a page or mode that helps the user sort life into a few active fronts, convert vague pressure into next actions, and connect doing back to feeling.

The Focus mission tab now supports a small design-format pill:

- **Format 1** keeps the original mission card stack for direct editing.
- **Format 2** opens the Mission Control organisation view using the same stored mission data.

Format 2 is an alternative organisation surface, not a separate data model. Users can switch between
formats without duplicating missions. The second format keeps capture simple, then helps the user sort
missions by today, later, and life area. Do not add a separate work-type layer such as Free, Think,
Pro, or Real; those labels made Format 2 feel crammed and too conceptual. The organising spine is
Today / Later / Life Areas, with blocker and next-step context inside each mission.

In Paper, Golden, and light Beige design modes, all mission labels and pills must use dark ink text on
light surfaces. Ochre/gold text is reserved for dark panels where it has enough contrast.

### Product Shape

Mission Control should have five zones:

1. **Command Line** — one fast input for dumping tasks, worries, plans, or vague obligations. The user should not have to categorize before capturing.
2. **Today Lane** — the few things that matter today. This is not a giant todo list; it is the current operating lane.
3. **Life Fronts** — missions grouped by life category such as Body, Organisation, Music, Work, Social, Money, Home. These are the stable areas of life.
4. **Road View** — a visual sequence from current mission to next steps to later objectives. It should show movement, not just a list.
5. **AI Organiser** — a scoped assistant that can read the mission dump and suggest grouping, next steps, blockers, and category links. Suggestions are never applied silently.

### Mission Anatomy

A mission should eventually carry:

- **Why** — what this mission serves.
- **Next visible step** — the smallest concrete action.
- **Blocker** — what is making it hard.
- **Life category** — the area of life it belongs to.
- **Time horizon** — today, this week, later, someday.
- **Energy mode** — admin, creative, body, social, focus, recovery.
- **Evidence trail** — linked check-ins, reflections, day-map blocks, and notes.

### Better UX Principles

- Capture should be frictionless; organisation can happen later.
- The page should distinguish `mission`, `task`, `habit`, and `worry`. Mixing them creates overwhelm.
- Only a small number of missions should be active at once. The rest belong in later/someday lanes.
- Completing a mission should feed the reflection layer: what changed in mood, pressure, or clarity?
- The AI should help the user see the real structure: "these five tasks are all Organisation," or "this blocker has appeared three times this week."

### AI Mission Agent

The AI assistant can support missions through confirmable actions:

- Turn a vague note into a mission proposal.
- Break a mission into 3 next steps.
- Identify the likely blocker.
- Suggest a life category.
- Move non-urgent items out of Today.
- Create a weekly mission summary.

The assistant must ask before writing changes. It can propose: "I can turn this into three missions: Shoulder, Admin, Music. Save these?" The user confirms or edits.
