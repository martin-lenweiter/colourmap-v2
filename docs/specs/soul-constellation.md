# Soul Constellation

> A shared map for inner aspects and important people, where closeness to the center reflects importance and intensity.

## Context

The regular soul map is territory-based. Soul Constellation is point-based: instead of asking which zone is active, it asks which named forces or people are currently closest to the user’s center.

## Behavior

- Users add points by category: fear, emotion, need, strength, shadow, or person.
- Category buttons open an inline composer with free text and category-specific suggestion chips when available.
- Added points are placed on the constellation with a default mid intensity.
- Selecting a point opens a detail view with intensity controls and a delete action.
- Higher intensity moves a point closer to the center and increases its visual weight.
- All point changes persist to localStorage.

## States & Edge Cases

- Empty state explains the purpose of the map instead of rendering a blank interface.
- Categories with existing points show count badges so the user can see clustering at a glance.
- Removing the focused point clears the detail view and updates persistence immediately.

## Done When

- Users can add a named point, reopen it, change its intensity, and remove it.
- The constellation persists across reloads and returns to the empty guidance once all points are removed.
