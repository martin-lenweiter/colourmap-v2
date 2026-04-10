# Back of My Mind

> A quick checklist for everything that's not a mission but still taking up mental space.

## Context

Before you can check in honestly, you need to dump what's cluttering your head. Back of My Mind is the release valve — organisational tasks, reminders, "don't forget to..." items. Getting them out of your head and into a list clears space for real reflection.

## Behavior

- Lives below Current Mission on the right column.
- Card titled "Back of my mind" with a + button to add items.
- Clicking + reveals an input field with placeholder "What's lingering?" Input hides after adding.
- Each item is a single line with a checkbox and a ✕ delete button.
- Checking an item moves it to a "Cleared" section at the bottom with strikethrough.
- Cleared items can be unchecked to reactivate.
- Items are simple text — no description, no sub-fields. Intentionally flat.

## States & Edge Cases

- Zero items: show "Mind is clear."
- Rapid adding: each item appears immediately at the top.
- Long text: single line, no truncation — text wraps naturally.
- Fetch failure: keep showing the last loaded list instead of blanking the card.
- Toggle is optimistic. If the save fails, the checkbox snaps back to its previous state.
- Delete is optimistic. If the delete fails, the list refreshes from the API.

## Done When

- Items persist across page loads (Supabase).
- Items load from `/api/backlog` for the signed-in user rather than browser-only storage.
- Adding an item takes one click + typing.
- The list feels like scrap paper, not a project management tool.

## Dependencies

- Supabase auth and database.
- Backlog table with: id, userId, title, done, createdAt.
