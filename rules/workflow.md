# Workflow

## Plan Before Build

Enter plan mode for any non-trivial task (3+ steps or architectural decisions). Get confirmation before implementing.

If something goes sideways mid-implementation: STOP. Don't push through. Re-plan from current state.

For simple, obvious fixes: just do them. Don't over-process.

## Delegation And Parallelism

Use delegated workers, subagents, or focused parallel investigation only when the runtime supports it and the problem benefits from it. Keep ownership clear: one task per worker and one clear deliverable per parallel track. If the runtime does not support delegation, do the work locally and keep the plan simple.

## Branch Discipline

Always work on a branch. Never commit or push directly to `main`.
Merge to `main` only through a pull request. There is no routine direct-to-`main` path.

Use one of these branch names:
- `feature/<slug>`
- `fix/<slug>`
- `guardrails/<slug>`
- `chore/<slug>`

Keep each branch scoped to one feature or one fix. Do not batch unrelated changes together.

Never force-push to `main` or any other protected branch.

The default merge path is:

1. branch
2. pull request
3. required CI checks green
4. GitHub auto-merge for Lane A, or explicit human approval for Lane B

## Autonomous Bug Fixing

When given a bug: just fix it. Read logs, errors, failing tests, then resolve. Zero context switching from the user.

## Verification Pipeline

Never commit without completing ALL steps. Stop on first failure.

1. `biome check` — zero diagnostics
2. Build succeeds
3. All tests pass (unit, integration, e2e). New behavior must have tests.
4. **Live browser verification via Chrome DevTools MCP** — mandatory for any UI work. Start the dev server, navigate to the affected pages, take screenshots, and confirm the behavior visually. This is not optional and cannot be skipped or substituted with build-only checks.
5. Review your diff as if reviewing someone else's PR
6. Check for secrets/credentials — if found, remove and alert the user
7. Commit

If a test fails, fix it. Do not skip, disable, or weaken tests.

## If Chrome DevTools MCP Is Unavailable

Do not commit UI work without live verification. If Chrome DevTools MCP is not available, ask the user to verify the behavior in a browser before committing. Never substitute build success or test passes for visual confirmation of UI changes.

## Protected Path Escalation

There are two merge lanes:

- Lane A: standard changes that may auto-merge after all required checks are green
- Lane B: protected-path changes that require explicit human review or approval before merge

Lane B includes protected paths such as `AGENTS.md`, `rules/**`, `skills/**`, `docs/product.md`, `docs/specs/**`, and `docs/guardrails-plan.md`.

Lane B pull requests must not be auto-merged. Leave them open, clearly note that they touch a protected path, and route them for human review.

Do not self-approve, do not bypass branch protection, and do not invent an alternate merge path around the pull request flow.

## Push Discipline

Before pushing, run the full build locally (`bun run build`) and confirm it passes. CI failures from untested pushes waste time.

Push to a branch, not `main`. Open a pull request. Never push directly to `main`.

## No-Spec-Impact Declaration

Use `no-spec-impact` only when a change is purely internal: refactor-only work, test cleanup, or other non-behavioral maintenance with no user-visible effect.

Declare it by including the exact text `no-spec-impact` in the PR body or a commit message.

It is wrong to use `no-spec-impact` when the change:

- changes user-visible behavior
- changes API responses
- adds or removes features

Misuse will still be caught in code review. The policy script only gates CI; it does not replace correctness review.

## UI PR Evidence

Any PR that touches `app/**` or `components/**` is incomplete unless the PR body includes UI verification evidence, regardless of CI status.

Required evidence:

- Routes verified: list every affected route you opened in a browser
- Console status: `clean` or the exceptions you observed
- Network status: `clean` or the failed requests you observed
- Screenshot: attach one if the UI changed visually, or state `no visual change` if styling was untouched

## Commit Discipline

- Write commit messages that describe what changed AND why
- One logical change per commit
- If the project has a custom commit alias, use it
