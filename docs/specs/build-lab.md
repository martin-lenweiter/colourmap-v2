# Creator Space / Build Lab

**Status:** MVP
**Date:** 2026-05-15

Creator Space is the creator-only platform inside Colourmap. **Build Lab** is its first room: AI coding mission control. Colourmap is the mission layer; Codex, Claude Code, and future tools are worker engines behind adapters.

## Creator Space Aim

The aim is to develop Creator Space as the place where the user builds a beautiful world with AI help, while Colourmap keeps emotional context, practical constraints, creative direction, and safety visible.

Creator Space should eventually contain:

- **Build Lab**: code, product, diffs, checkpoints, coding agents
- **Garden of Ideas**: product ideas, reflections, decisions, relationships, and future directions
- **Project Map**: a visual intelligence board for understanding the whole Colourmap system
- **Music Lab**: songs, groove machines, recordings, concert tools
- **Geometry Lab**: visual worlds, mode suns, music-reactive fields
- **Reflection Atlas**: product philosophy, life patterns, digestible specs
- **Mission Memory**: what was attempted, what worked, what changed, how it felt

The platform should not become a generic developer dashboard. It should feel like a creative studio operating system: calm, contextual, beautiful, and grounded in the user's actual life.

## Garden of Ideas

Creator Space needs a non-terminal layer for understanding the evolution of the work.

The user should be able to keep spaces for:

- product ideas
- design reflections
- future directions
- open questions
- decisions made
- related missions and diffs
- screenshots and visual evidence

This should not feel like a normal notes app. It should feel like a product garden: ideas can branch, connect, mature, be paused, and reappear later. The user should be able to ask: "where did this idea come from?", "what did we decide?", "what is connected to this?", and "what is the next practical cut?"

Long term, Build Lab missions should feed these spaces automatically. A completed mission can create or update an idea block with: original prompt, reflection, changed files, screenshots, decision, remaining next steps, and relationships to other ideas.

## Project Map / Visual Intelligence

Creator Space also needs a high-level map of what Colourmap is becoming.

The aim is not documentation for documentation's sake. The aim is visual clarity: helping the user understand a complex living project at a glance, then zoom into the part that matters.

The interface direction can borrow from a detective board:

- postcards for features
- written notes for reflections
- screenshots for visual evidence
- red thread lines for relationships
- clusters for product areas
- pins for decisions
- highlighted paths for current missions
- faded areas for future directions

The map should let the user activate an element and see what follows from it:

- related specs
- related missions
- screenshots
- open questions
- decisions already made
- next practical cuts
- risks or dependencies

This is one of Colourmap's essential long-term aims: to become a visual intelligence system for organizing complexity. It should help people turn scattered information into an understandable visual field, then act from that clarity.

Visual Intelligence should support several levels of representation:

- simple text blocks and clear boxes for first understanding
- interactive cards and reactive components for comparison and filtering
- connected idea maps for relationships and evolution over time
- infographic surfaces for explaining product systems and personal patterns
- 3D maps for navigating complex structures spatially
- game-like explanation worlds where the user moves through information
- golden-dot systems that form shapes, characters, paths, and living diagrams

The important principle is that the same information can become more visual when useful. Text remains available, but Colourmap should learn how to transform ideas into interactive visual forms that make complexity easier to feel, compare, and act on.

## V1 Scope

The first version proves the loop:

- choose or confirm a local project path
- see agent availability
- choose Codex or Claude Code
- write a mission prompt
- run the mission through the selected CLI
- stream stdout/stderr into the UI
- show changed files
- show the current Git diff
- keep the default workspace simpler than the terminal: project, agent, prompt, console, diff
- separate readable mission reflection from raw technical agent output

## Product Direction

Build Lab is the first external-action engine inside Colourmap. It is not only a terminal wrapper. It should become the place where the user's inner context, life pressure, creative direction, and AI workers meet.

The long-term principle:

```text
inner state -> tension -> mission brief -> agent work -> diff -> checkpoint -> pattern
```

Colourmap remains the map. Codex, Claude Code, and future tools are worker engines. The user should be able to speak naturally, and Build Lab should translate that into clean missions without losing emotional or strategic context.

## Mission Prompt

The default composer should stay deliberately small:

- one project path
- one agent selector
- one spoken/written prompt
- one run button

Earlier structured fields such as mission title, current tension, world focus, mode, constraints, and success criteria are deferred. They may return later as an optional advanced drawer or as AI-generated structure after the user speaks naturally. They should not be visible by default because the first version must feel easier than working directly in the terminal.

## Voice Input

Voice input is core, not a bonus. The user often thinks in fast, layered, emotional missions. Build Lab should let that happen, then gradually structure it.

MVP voice behavior:

- browser speech-to-text appends into the raw mission brief
- the user can edit before sending
- no audio is stored

Future voice behavior:

- transform spoken notes into optional title/context/constraints/success criteria
- detect if the mission is too broad and suggest a smaller cut
- preserve the original transcript as mission memory
- let the user dictate follow-up instructions while the agent is running

## Phone Control Surface

The long-term goal is to run Build Lab from the phone while the home computer stays open as the trusted runner. The phone should feel like the control surface: create the mission, attach context, start the agent, watch the stream, and review the result.

Milestone 1:

- phone can save mission drafts to the backend
- desktop Build Lab can see queued drafts
- desktop can still require manual Run while the runner protocol is being proven

Milestone 2:

- phone can send a mission to the desktop runner when the desktop is online
- phone can start the agent without touching the desktop
- desktop owns all CLI execution, filesystem access, checkpoints, and diffs
- phone streams readable status and mission reflection
- phone shows whether the runner is online, busy, failed, or waiting for permission
- destructive or risky actions still require explicit approval from the phone or desktop

Milestone 3:

- phone can attach screenshots to a mission
- screenshots are stored as mission context and shown to the agent when useful
- phone can add screenshot notes such as "this button overlaps" or "make this section calmer"
- desktop run history links prompt, screenshot context, diff, and readable reflection

The phone should not directly run Codex or Claude Code. It should act as a clear prompt, screenshot, review, approval, and control layer over the trusted computer runner.

## Mission Workspace

Build Lab should make terminal work feel like a creator cockpit.

The user should be able to:

- load a recent project without retyping the path
- reuse previous missions from local mission memory
- keep raw terminal output available without making it the only interface

### Mission Memory

MVP mission memory is local browser storage. It saves recent completed or failed missions with:

- title
- agent
- mode
- project path
- prompt
- readable reflection
- changed files
- status
- timestamp

Mission memory is not a technical log. It should read like clear work blocks:

- what the user asked
- what happened
- what changed
- what to check next

This protects the discussion/reflection layer from being buried by streaming build output. Later, mission memory should move to the backend and connect to patterns: which mission shapes work, which agents perform best, and how the user's state affects mission quality.

### Agent Console

The agent console is the live technical stream. It should behave like the current terminal experience: command starts, stdout/stderr, errors, completion events. It is useful while the agent is working, but it should not be the only record of the mission.

## Access

Build Lab is a creator space, not a public user feature. In production it is available only when the authenticated user's email is included in `BUILD_LAB_ALLOWED_EMAILS` or `BUILDLAB_ALLOWED_EMAILS`. Local dev auth may access it for development.

## Agent Adapter Contract

Adapters expose a shared shape:

```ts
interface CodingAgentAdapter {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  runMission(input: {
    projectPath: string;
    prompt: string;
    mode?: 'plan' | 'build' | 'fix' | 'review';
  }): AsyncGenerator<AgentEvent>;
}
```

Event types:

- `output`
- `error`
- `file_changed`
- `command_started`
- `command_finished`
- `permission_request`
- `mission_complete`

## Safety

- The selected path must exist and must resolve to a directory.
- Build Lab does not store API keys. Codex and Claude Code are assumed to be authenticated separately on the local machine.
- Server-spawned commands run with the selected project as `cwd`.
- Before an agent starts, Build Lab creates a lightweight checkpoint under `.git/colourmap-build-lab/` when the folder is a Git repo.
- The MVP does not auto-delete or auto-revert files. Rejection/rollback is a later milestone.

## Platform Direction

Build Lab should grow into one part of a broader creator platform:

- Build Lab: code and product work
- Music Lab: sounds, grooves, recordings, concert tools
- Geometry Lab: visual presets, music-reactive visuals, touch worlds
- Notebook: writing, lyrics, ideas, research
- Field/Tensions: emotional and strategic context

The platform should understand how the user functions over time. Not to optimize them mechanically, but to help them build a beautiful world without losing survival, body, or coherence.

Future pattern examples:

- You produce better Build Lab missions after naming the current tension.
- Expansion missions become risky when Survival has been ignored for several days.
- Voice-first missions work better for ideation; written missions work better for bug fixes.
- Codex performs better on scoped code changes; Claude performs better on product reflection or review.

## Done When

- `/build-lab` renders a calm creator-space interface.
- Agent availability is visible.
- A mission streams terminal output without waiting for process completion.
- Changed files and Git diff can be refreshed after a run.
- The user can dictate a mission.
- The default composer stays minimal: project, agent, prompt, run.
- The UI supports recent projects and local mission memory.
- Mission memory is readable in human blocks, separate from the agent console.
- The code is modular enough to add another adapter without changing the UI contract.
