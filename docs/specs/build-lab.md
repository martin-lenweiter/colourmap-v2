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
- structure a natural spoken/written mission into a cleaner agent brief
- track the mission across visible stages

## Product Direction

Build Lab is the first external-action engine inside Colourmap. It is not only a terminal wrapper. It should become the place where the user's inner context, life pressure, creative direction, and AI workers meet.

The long-term principle:

```text
inner state -> tension -> mission brief -> agent work -> diff -> checkpoint -> pattern
```

Colourmap remains the map. Codex, Claude Code, and future tools are worker engines. The user should be able to speak naturally, and Build Lab should translate that into clean missions without losing emotional or strategic context.

## Mission Brief

The mission composer should support both raw voice/thought and structured fields:

- mission title
- current tension
- world focus: Survival, Expansion, or Regeneration
- constraints
- success criteria
- raw spoken/written brief

The agent prompt is composed from those fields. This lets the user speak in a human way while the worker receives a practical brief.

### World Focus

Build Lab borrows the deeper Colourmap architecture from `field-tensions-action-patterns.md`:

- **Survival**: stability, paperwork, risk, money, basic order
- **Expansion**: creative future, product, art, code, momentum
- **Regeneration**: body, breath, sleep, pacing, nervous system

This does not mean the agent becomes a therapist. It means the mission knows what kind of life-force it serves.

Examples:

- Survival mission: fix deployment, billing, data safety, backup, admin flow.
- Expansion mission: build a new creative surface, music visual, geometry idea, product feature.
- Regeneration mission: simplify UI, reduce cognitive load, create calmer flows, remove friction.

## Voice Input

Voice input is core, not a bonus. The user often thinks in fast, layered, emotional missions. Build Lab should let that happen, then gradually structure it.

MVP voice behavior:

- browser speech-to-text appends into the raw mission brief
- the user can edit before sending
- no audio is stored

Future voice behavior:

- transform spoken notes into title/context/constraints/success criteria
- detect if the mission is too broad and suggest a smaller cut
- preserve the original transcript as mission memory
- let the user dictate follow-up instructions while the agent is running

## Mission Timeline

Build Lab should show a calm timeline, not only terminal output:

- Draft
- Project
- Checkpoint
- Agent
- Diff
- Complete
- Failed

The timeline helps the user feel oriented and in control while the agent works.

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
- The mission brief includes current tension, world focus, constraints, and success criteria.
- The UI shows a visible timeline and checkpoint state.
- The code is modular enough to add another adapter without changing the UI contract.
