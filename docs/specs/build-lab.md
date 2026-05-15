# Build Lab

**Status:** MVP
**Date:** 2026-05-15

Build Lab is Colourmap's creator-only AI coding mission control. Colourmap is the mission layer; Codex, Claude Code, and future tools are worker engines behind adapters.

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

## Done When

- `/build-lab` renders a calm creator-space interface.
- Agent availability is visible.
- A mission streams terminal output without waiting for process completion.
- Changed files and Git diff can be refreshed after a run.
- The code is modular enough to add another adapter without changing the UI contract.
