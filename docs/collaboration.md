# Collaboration Guide

Plain-language guide for working safely with agents in this repo.

This is for collaborators who want to focus on creating, not on repo mechanics.

## First-Time Setup

Run these once after cloning or after a fresh pull on a new machine:

```sh
bun install
bun run collab:setup
```

Then check that the machine is protected:

```sh
bun run collab:doctor
```

If `collab:doctor` reports a failure, stop and fix that first.

## The Safe Way To Work

Follow this flow every time:

1. Ask the agent to create a branch for the work.
2. Ask the agent to make the change on that branch.
3. Ask the agent to open a pull request.
4. Wait for all checks to pass.
5. If the PR touches protected paths, do not merge it yourself.
6. If the UI changed, verify it in the browser before merge.
7. Merge only after the checks are green and the PR is safe to merge.

## Never Do These Things

- Do not work directly on `main`.
- Do not merge a PR with failing checks.
- Do not auto-merge or manually merge protected-path changes yourself.
- Do not approve “just update the tests” if behavior changed by accident.
- Do not treat build success as proof that UI changes are correct.

## Protected Changes

Some changes are more sensitive and require explicit human review.

Examples:

- `AGENTS.md`
- `rules/**`
- `skills/**`
- `docs/product.md`
- `docs/specs/**`
- workflow, lockfile, schema, and other protected config files

If the agent says the work is Lane B or protected-path work, stop and route it for review.

## When You Must Check The Browser

If the agent changed anything visible in the app:

1. open the changed page
2. confirm it looks right
3. confirm the main flow works
4. tell the agent whether you saw visual problems, console errors, or failed requests

If you did not verify the UI, do not merge UI work.

## Safe Prompts To Use

Use prompts like these:

- `Create a branch for this work before changing anything.`
- `Do not work on main.`
- `Open a PR when finished.`
- `Tell me if this touches protected paths or guardrails.`
- `Tell me if I need to verify this in the browser.`
- `Do not merge anything with failing checks.`
- `If behavior changed, update the spec instead of only updating tests.`

## Daily Checklist

Before merge, make sure all of these are true:

- The work is on a branch, not `main`.
- A PR exists.
- All checks are green.
- The PR is not a protected-path change you should escalate.
- UI work was verified in the browser.
- The agent did not ask for a spec or guardrail update that was skipped.

## If You Are Unsure

Use this prompt:

`Before doing anything, tell me whether this is safe normal work or protected-path work, whether I will need browser verification, and whether a spec update is required.`
