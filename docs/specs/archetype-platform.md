# Mode / Archetype Platform

**Status:** In progress / long-term product layer
**Date:** 2026-05-15

The Mode / Archetype Platform helps the user understand which inner operating mode is active, which mode is being avoided, and how to move between modes deliberately.

User-facing language should be **modes**. Archetypes remain the deeper theory underneath, but the app should feel practical: Creation Mode, Organisation Mode, Admin Mode, Body/Sport Mode, Build Mode, Reflection Mode, and Play Mode.

## Core Problem

The user often gets stuck because one mode becomes overactive while another is neglected.

Examples:

- Creation wants visions, beauty, music, Colourmap, future worlds.
- Organisation wants sorting, priorities, folders, and clear next steps.
- Admin wants bills, documents, stability, and risk reduction.
- Builder wants implementation and shipping.
- Body/Sport wants sleep, food, movement, breath, and strength.
- Reflection wants meaning and identity.
- Play wants curiosity, freedom, and experiments.

The challenge is rarely "do more tasks." The challenge is learning the art of moving energy between modes.

Example:

> Move from Creation Mode to Admin Mode without feeling like the creative self is being killed.

## Current App Version

For now, the Focus page should show a small **Mode Bridge** under the Progress tab behind a pill.

It should help the user answer:

- Which mode is active?
- Which mode am I avoiding?
- Why might I be stuck?
- What is one bridge action that moves energy to the needed mode?

This version is manual and lightweight. It does not need AI yet.

## Initial Modes

### Creation

Seeks ideas, beauty, art, music, product vision, and future worlds.

Gets stuck when creation becomes escape from practical pressure.

Bridge:

> Give the future one clear container, then return to the practical bridge.

### Organisation

Seeks sorting, folders, priorities, rhythm, and clean next steps.

Gets stuck when everything remains mental and nothing is placed.

Bridge:

> Sort the problem into three visible boxes.

### Admin

Seeks stability, paperwork, money, basic order, and safety.

Gets stuck when practical tasks feel like identity death or creative imprisonment.

Bridge:

> Map the practical problem before solving it.

### Builder

Seeks implementation, tools, commits, tests, and shipped progress.

Gets stuck when execution becomes too narrow and loses contact with meaning.

Bridge:

> Define the smallest shippable cut.

### Body / Sport

Seeks sleep, movement, food, breath, training, and nervous-system regulation.

Gets stuck when ignored until it becomes a crisis.

Bridge:

> Restore enough body signal to make the next decision clean.

### Reflection

Seeks meaning, context, identity, and worldview.

Gets stuck when meaning expands into endless reflection without a bridge to action.

Bridge:

> Turn one insight into one field note or one action.

### Play

Seeks freedom, curiosity, delight, games, and experimentation.

Gets stuck when dismissed as unserious or allowed to avoid all structure.

Bridge:

> Give play a small container, then harvest one useful spark.

## Long-Term Interface Direction

Each mode can eventually have a distinct interface language:

- Creation: visual, spacious, generative, music/geometry connected
- Organisation: sorting surfaces, buckets, priorities, next-step maps
- Admin: document map, low-friction checklist, reassuring and concrete
- Builder: code/workflow oriented, diffs, checkpoints, missions
- Body/Sport: quiet, sensory, breath, movement, time-of-day, physical rhythm
- Reflection: concepts, maps, meaning links, pattern interpretation
- Play: quick experiments, small games, curiosity prompts

The user should be able to see how the interface changes when a different mode is needed, without fragmenting the app into unrelated products.

## Mode Sun Visual

The first visual bridge between modes and Geometry is **Mode Sun**.

It is inspired by compass visuals and should feel like a pulsing radiating sun:

- center = current self / attention
- seven rays = Creation, Organisation, Admin, Builder, Body/Sport, Reflection, Play
- strong ray = active mode
- dimmer or shorter ray = avoided or underfed mode
- rings = overall coherence / field pressure
- pulsing = energy moving through the system

This visual should answer:

- What is flowing?
- What is underfed?
- Which channel wants a bridge?
- Is the field coherent or scattered?

For now, the Mode Bridge can open Geometry Field directly into Mode Sun and pass the selected active/avoided modes through local browser state. Later this should come from real Colourmap pattern data.

Long-term, the sun can become a live compass where channels brighten based on check-ins, missions, notes, movement, admin completion, Build Lab missions, and AI-detected patterns.

## With AI Later

When AI is properly integrated, it should:

- infer likely active mode from check-in, notes, missions, and behavior
- notice neglected modes
- identify stuck loops
- propose small bridges between modes
- explain why a practical action may reduce emotional pressure
- connect mode movement to patterns over time

Example AI reflection:

> Creation is carrying the day, but Admin is generating background pressure. The bridge is not "solve money." The bridge is "map the Monday document problem for 15 minutes."

The AI should not over-identify the user with a mode. It should say:

> This mode is active.

Not:

> This is who you are.

## Done When

- The Focus page has a visible in-progress Mode Bridge under the Progress tab.
- The user can select an active and avoided mode.
- The UI proposes a simple stuck-pattern explanation.
- The UI proposes one bridge action.
- Mode Bridge can open Mode Sun in Geometry Field.
- The spec preserves the long-term idea of different interfaces per mode.
