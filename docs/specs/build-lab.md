# Creator Space / Build Lab

**Status:** MVP
**Date:** 2026-05-15

Creator Space is the creator-only platform inside Colourmap. **Build Lab** is its first room: AI coding mission control. Colourmap is the mission layer; Codex, Claude Code, and future tools are worker engines behind adapters.

## Creator Space Aim

The aim is to develop Creator Space as the place where the user builds a beautiful world with AI help, while Colourmap keeps emotional context, practical constraints, creative direction, and safety visible.

Creator Space should eventually contain:

- **Build Lab**: code, product, diffs, checkpoints, coding agents
- **Music Lab**: songs, groove machines, recordings, concert tools
- **Geometry Lab**: visual worlds, mode suns, music-reactive fields
- **Reflection Atlas**: product philosophy, life patterns, digestible specs
- **Mission Memory**: what was attempted, what worked, what changed, how it felt

The platform should not become a generic developer dashboard. It should feel like a creative studio operating system: calm, contextual, beautiful, and grounded in the user's actual life.

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

The long-term goal is to write and organize Build Lab prompts from the phone, then execute them on the home computer when it is open and authenticated.

Milestone 1:

- phone can save mission drafts to the backend
- desktop Build Lab can see queued drafts
- user manually clicks Run on the desktop

Milestone 2:

- phone can send a mission to the desktop runner when the desktop is online
- desktop owns all CLI execution, filesystem access, checkpoints, and diffs
- phone streams readable status and mission reflection

The phone should not directly run Codex or Claude Code. It should act as a clear prompt, review, and control layer over the trusted computer runner.

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
