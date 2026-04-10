# Inner Weather

> A lightweight emotional climate surface that lets the user name recurring weather patterns, tune their intensity, and clear them when the weather has passed.

## Context

This component is the fast emotional-climate layer inside the broader caring flow. It should feel lighter than a journal entry but more specific than a single slider value.

## Behavior

- The user starts from 5 weather families: storm, rain, fog, breeze, and sun.
- Selecting a family opens an inline composer with both free text and suggestion chips.
- Adding an entry creates a named weather item with default mid intensity.
- Each saved entry can be expanded to reveal the intensity bars and delete control.
- Intensity changes update the current entry in place rather than creating duplicates.

## States & Edge Cases

- Empty state shows a prompt to tap a weather and name the current feeling.
- The summary sky reacts to whichever weather family currently has the strongest weighted presence.
- Removing the active entry clears the focused detail state cleanly.

## Done When

- Users can add a named weather, reopen it, adjust intensity, and remove it.
- The empty prompt disappears once entries exist and returns when the list is cleared.
