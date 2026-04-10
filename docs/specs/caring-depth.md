# Caring Depth

> A map-first surface for naming strengths and weaknesses, adjusting their intensity, and making the relationships between them explicit.

## Context

The main caring flow captures today’s state quickly. Caring Depth is the slower layer where recurring inner patterns get named, balanced, and connected so the user can see structure instead of a flat list.

## Behavior

- Strengths and weaknesses are stored separately but rendered as one shared map.
- New pills can be added from the inline suggestions or from free text input.
- Until at least 3 pills exist, the UI stays in list mode and shows how many more are needed before the wheel appears.
- Once 3 or more pills exist, the map renders and the user can inspect pills either from the list or from the visualization.
- Active pill detail shows intensity, lock state, existing connections, and any saved pack memberships.
- Linking is a two-step flow: choose the source pill, choose the target pill, then choose the connection kind.
- Duplicate connections are ignored and linking mode exits cleanly.
- All data persists in localStorage.

## States & Edge Cases

- Empty state: prompt the user to name strengths and weaknesses.
- Fewer than 3 pills: show the “add more to see your wheel” guidance instead of the visualization.
- Removing a pill also removes any connections attached to it.
- Saved packs can exist even if the current UI does not create them; the detail panel still renders them.

## Done When

- Users can add, inspect, connect, and remove pills.
- The wheel only appears once the user has enough data to make it meaningful.
- Saved local state restores pills, connections, and pack memberships on reload.
