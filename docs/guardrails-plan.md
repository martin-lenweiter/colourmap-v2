# Guardrails Plan

Historical implementation plan only.

The canonical source of truth for active guardrails is `rules/guardrails.md`.

This document is the canonical autonomy plan for Colourmap V2.

It exists because the repo already demonstrated the failure mode of open-ended agent autonomy:
- too many direct commits to `main`
- giant multi-feature changes with large blast radius
- tests updated after behavior drift instead of protecting the intended behavior
- specs updated after implementation to match reality
- browser verification required in prose but not enforced in practice
- app health drifted until `main` was broken

The goal is not to remove autonomy. The goal is to make autonomy safe enough to run without manual PR review.

## Operating Principle

Autonomous implementation, automatic merge on green, bounded by hard guardrails.

That means:
- the agent can implement changes and prepare merges
- the agent should not push directly to `main`
- the repo should auto-merge only when all required checks are green
- some paths are too sensitive for blind auto-merge and must be escalated

## Runtime Position

The primary autonomous runtime for this repo is **Codex**.

Rules should stay as runtime-agnostic as possible so the same policy can be adapted to Claude Code later with minimal changes.

## Non-Negotiable Boundaries

These are the core boundaries the system must enforce.

1. No direct pushes to `main`
2. No force pushes to protected branches
3. No auto-merge without green CI
4. No UI merge without live browser verification in a real browser
5. No silent edits to protected paths
6. No spec drift justified after implementation
7. No rewriting tests to match accidental behavior drift
8. No giant cross-cutting changes in a single PR

These boundaries must be enforced by a mix of:
- GitHub branch protection and required checks
- repository policy checks in CI
- local runtime instructions
- explicit escalation paths for blocked changes

Prose alone is not a guardrail.

## Required Browser Verification

Browser verification means two things, not one:

1. **Automated browser smoke / e2e coverage in CI** for critical journeys
2. **Live browser verification via Chrome DevTools MCP** before merge for any UI-affecting change

For UI work, the agent must:
- start the app locally
- open the affected routes in a real browser
- inspect console errors
- inspect failed network requests
- verify the user-visible behavior directly
- capture screenshots when useful for evidence

Build success and unit tests are not substitutes for this.

If Chrome DevTools MCP is unavailable, UI work must stop before merge until browser verification is restored or explicitly delegated to the user.

## Safe Merge Model

The target model is:

1. agent creates a branch
2. agent implements a small scoped change
3. agent opens or updates a PR
4. CI runs all required checks
5. GitHub auto-merges if checks are green and the PR does not touch blocked paths
6. blocked-path changes remain unmerged until explicitly handled

This preserves zero-review operation without allowing uncontrolled direct writes to `main`.

## Required GitHub Settings

The repo settings must match the policy. At minimum:

- require pull requests for `main`
- require all named required checks to pass before merge
- require branches to be up to date before merge
- include administrators in branch protection
- disable force pushes to protected branches
- restrict direct push access to `main`
- enable auto-merge only for PRs that satisfy the required checks
- keep deployment tied to post-merge `main`, not pre-merge bypasses

If these settings are not active, the plan is not active.

## Two Lanes

### Lane A — Safe Auto-Merge
These changes may auto-merge after all required checks pass.

Examples:
- isolated UI fixes
- copy changes
- non-canonical docs
- non-critical component improvements
- test additions
- small behavior fixes in low-risk surfaces

### Lane B — Escalation Required
These changes must not auto-merge blindly.

Examples:
- `.github/workflows/**`
- package manager / lockfile changes
- `AGENTS.md`
- `rules/**`
- `skills/**`
- `docs/product.md`
- `docs/specs/**`
- `docs/guardrails-plan.md`
- `biome.json`
- `lefthook.yml`
- `vitest.config.ts`
- `next.config.ts`
- database schema and migrations
- auth flows
- billing or payments
- deployment config
- env / secrets handling
- core AI routes and model-cost-sensitive logic
- security-sensitive configuration

## Phased Implementation Plan

We will implement this in phases.

### Phase 0 — Containment
Goal: stop further uncontrolled drift.

Tasks:
- restore branch protection on `main`
- disable direct pushes to `main`
- choose one package manager and enforce it
- return `main` to a healthy baseline: lint green, typecheck green, tests green, build green

Exit condition:
- `main` is healthy and protected

### Phase 1 — Merge Model Shift
Goal: move from direct-commit autonomy to bounded auto-merge autonomy.

Tasks:
- require PRs for `main`
- enable auto-merge
- require all checks before merge
- update agent instructions so Codex works branch-first, not main-first

Exit condition:
- agent can merge without human review, but only through green PR checks

### Phase 2 — Hard CI Gates
Goal: make quality and safety machine-enforced.

Required checks to add or strengthen:
- lint
- typecheck
- unit/integration tests
- build
- coverage thresholds
- browser smoke tests
- dependency policy checks
- protected-path policy checks
- PR size / scope checks
- behavior/spec coupling checks
- test-policy checks

Exit condition:
- green CI means something materially stronger than “it compiled once”

### Phase 3 — Local Agent Guardrails
Goal: reduce bad local actions before CI catches them.

Tasks:
- add Codex-oriented local instructions and adapter wiring
- add `.claude/` / `.codex/`-style settings or equivalent runtime config where useful
- block dangerous shell commands
- block edits to protected files unless explicitly escalated
- prevent package-manager drift
- auto-format after edits where practical

Notes:
- local shell blocking is a secondary safeguard, not the primary control
- branch protection and CI policy must carry the real enforcement load

Exit condition:
- the agent is fenced locally as well as in CI

### Phase 4 — Browser Reality Checks
Goal: prevent “green CI, broken app” merges.

Tasks:
- add Playwright configuration
- add smoke tests for the critical user journeys
- require Chrome DevTools MCP live verification for UI changes
- standardize what “browser verified” means in instructions and PR output

Evidence required for UI-affecting PRs:
- the affected routes that were checked
- screenshot evidence when the UI changed materially
- note whether console and network were clean or list the accepted exceptions

Playwright smoke is the machine-enforced gate. MCP verification is the human-visible evidence layer.

Critical journeys to start with:
- login/auth gate
- app shell render
- cockpit main route loads without console errors
- missions route loads and core interactions function
- one primary create/edit flow

Exit condition:
- obvious UI breakage is much harder to merge

### Phase 5 — Scope Discipline
Goal: reduce blast radius per change.

Tasks:
- add a PR size / scope policy check
- reject very large cross-cutting PRs by default
- prefer one feature or one fix per branch
- encourage vertical slices over full-product rebuilds
- consider file-size warnings for giant components/pages

Exit condition:
- autonomous changes are small enough that automatic checks remain meaningful

## Required CI Policy

These checks should become required before merge.

### Always required
- lint
- typecheck
- unit/integration tests
- build
- dependency / lockfile policy check
- protected-path policy check
- PR size / scope policy check
- behavior/spec coupling policy check
- test-policy check

### Required for UI-affecting changes
- browser smoke tests

### Required for critical flow changes
- stronger e2e coverage for core journeys

## Coverage Policy

Coverage should support confidence, not vanity.

This repo should move away from using a repo-wide 100% target as the primary rule.

Preferred policy:
- enforce explicit thresholds in CI
- keep higher thresholds on critical logic than presentation-only files
- avoid coverage regression on protected paths
- require bugfix tests when feasible
- never update tests merely to rubber-stamp accidental drift

## Spec And Test Drift Policy

For any PR that changes intended product behavior:

- the relevant spec must already exist or be added in the same PR
- canonical product or feature-spec changes must not auto-merge blindly
- test updates must be justified by the spec, not by current implementation drift
- if behavior intentionally changes without a spec update, the PR must fail

Allowed exception:
- a PR may declare `no-spec-impact` only when the change is purely internal, refactor-only, or non-behavioral

## Protected Paths

The exact path list can evolve, but the default protected set should include:
- `.github/workflows/**`
- `AGENTS.md`
- `rules/**`
- `skills/**`
- `docs/product.md`
- `docs/specs/**`
- `docs/guardrails-plan.md`
- `package.json`
- `bun.lock`
- `package-lock.json`
- `biome.json`
- `lefthook.yml`
- `vitest.config.ts`
- `next.config.ts`
- `drizzle/migrations/**`
- `lib/db/schema.ts`
- auth-related routes and utilities
- Supabase configuration and client/server wiring
- deployment config
- env / secrets-related files

Changes to these paths should either:
- fail the safe auto-merge lane, or
- require an explicit override path later

Protected-path changes are not forbidden. They are forbidden from silent auto-merge.

## Emergency Brake

The system needs a defined failure mode for when a bad change still lands.

At minimum:
- disable auto-merge quickly
- pause agent merges while the repo is red
- revert or hotfix through a tracked PR, not an unreviewed direct push
- restore `main` to green before resuming normal autonomous merges

## Implementation Blueprint

This section translates the policy into concrete implementation work for agents.

Implementation rule:
- implement phases in order
- do not start the next phase until the current phase exit condition is met
- prefer one PR per numbered task below
- if a task touches protected paths, it must use the escalation lane

### Phase 0 Deliverables

#### 0.1 Repair Baseline Health

Objective:
- make the current default branch pass the full baseline locally and in CI

Repo targets:
- application code causing current lint, typecheck, and test failures
- `.github/workflows/ci.yml`
- `package.json`
- `bun.lock`
- remove `package-lock.json`

Concrete tasks:
- fix current lint failures
- add an explicit `typecheck` script if missing
- fix current typecheck failures
- fix current failing tests
- keep `build` green
- remove package-manager drift by standardizing on bun only

Done means:
- `bun run lint` passes
- `bun run typecheck` passes
- `bun run test` passes
- `bun run build` passes
- CI runs the same commands
- only `bun.lock` remains as the lockfile

#### 0.2 Protect `main`

Objective:
- stop direct drift immediately

GitHub settings:
- branch protection on `main`
- require pull requests
- require named checks
- require up-to-date branches
- include admins
- disallow force pushes
- restrict direct pushes

Done means:
- direct push to `main` is blocked for normal contributors and agents
- merges must go through PRs

### Phase 1 Deliverables

#### 1.1 Shift to PR-Only Auto-Merge

Objective:
- make auto-merge the default path instead of direct commits

Repo targets:
- `AGENTS.md`
- `rules/workflow.md`
- runtime adapter files only if needed

Concrete tasks:
- update instructions to require branch-first work
- forbid merge to `main` outside PR flow
- describe the blocked-path escalation path
- make auto-merge permissible only after green required checks

Done means:
- runtime instructions match the actual GitHub merge model
- there is no written path that allows routine direct commits to `main`

### Phase 2 Deliverables

#### 2.1 Expand Required CI

Objective:
- make repository health machine-enforced

Repo targets:
- `.github/workflows/ci.yml`
- `package.json`

Required jobs:
- `lint`
- `typecheck`
- `test`
- `build`
- `policy-deps`
- `policy-protected-paths`
- `policy-pr-scope`
- `policy-spec-drift`
- `policy-test-drift`

Concrete tasks:
- add a dedicated typecheck job using `bun run typecheck`
- keep job names stable so branch protection can require them by name
- make deploy depend on the required health jobs
- ensure CI runs on pull requests and remains valid after auto-merge

Done means:
- branch protection can reference a stable required-check set
- green CI represents lint, typecheck, tests, build, and policy checks

#### 2.2 Add Policy Scripts

Objective:
- encode repo-specific guardrails as scripts instead of prose

Repo targets:
- `scripts/`
- `package.json`

Suggested scripts:
- `scripts/check-lockfile-policy.sh`
- `scripts/check-protected-paths.sh`
- `scripts/check-pr-scope.sh`
- `scripts/check-spec-drift.sh`
- `scripts/check-test-drift.sh`

Expected behavior:
- fail if both bun and npm lockfiles are present
- fail safe-lane PRs that touch protected paths
- fail oversized PRs based on file count and changed-line thresholds
- fail behavior-changing PRs with no matching spec update or `no-spec-impact` declaration
- fail PRs that only rewrite tests for changed behavior without a spec basis

Done means:
- each policy script is runnable locally and in CI
- each script exits non-zero on policy violation
- policy scripts document their assumptions and required env inputs

#### 2.3 Define Scope Thresholds

Objective:
- make “too large” measurable

Initial thresholds:
- warn above 15 changed files
- fail above 25 changed files unless explicitly escalated
- warn above 500 changed lines
- fail above 1000 changed lines unless explicitly escalated
- always fail safe-lane PRs that span unrelated product areas

Notes:
- thresholds can be tuned after real usage
- the first version should optimize for catching obvious giant rewrites

Done means:
- the policy check enforces a documented first-pass size limit

### Phase 3 Deliverables

#### 3.1 Tighten Local Runtime Rules

Objective:
- reduce avoidable local mistakes before CI runs

Repo targets:
- `AGENTS.md`
- `rules/workflow.md`
- `rules/testing.md`
- runtime adapter files only if they need sync

Concrete tasks:
- make branch-first workflow explicit
- make protected-path escalation explicit
- require local verification before push
- require MCP evidence for UI PRs in the written workflow
- document `no-spec-impact` usage and limits

Done means:
- local instructions do not contradict CI or GitHub settings
- an implementation agent can follow the local workflow without inventing missing policy

#### 3.2 Optional Local Automation

Objective:
- add convenience only after repo safety is already enforced

Possible additions:
- pre-push hook for lint, typecheck, and targeted tests
- helper script to print required verification steps for UI changes
- helper script to scaffold PR evidence templates

Done means:
- local automation improves compliance but is not the only enforcement layer

### Phase 4 Deliverables

#### 4.1 Add Browser Smoke Coverage

Objective:
- catch obvious route and interaction breakage in CI

Repo targets:
- Playwright config
- e2e test directory
- CI workflow
- package scripts

Initial smoke coverage:
- login/auth gate
- app shell render
- cockpit route renders without console errors
- missions route renders and core interactions work
- one primary create/edit flow

Done means:
- Playwright runs in CI
- browser smoke is required for UI-affecting PRs
- failing smoke blocks auto-merge

#### 4.2 Standardize MCP Verification Evidence

Objective:
- make browser verification inspectable

Repo targets:
- `rules/workflow.md`
- PR template if one is added later

Required PR evidence for UI changes:
- affected routes visited
- screenshots or explicit note that no visible UI changed
- console status
- network status

Done means:
- agents have a standard format for reporting UI verification
- MCP verification is visible to humans even though it is not a GitHub status check

### Phase 5 Deliverables

#### 5.1 Enforce Scope Discipline

Objective:
- keep changes small enough that the checks remain meaningful

Repo targets:
- policy scripts
- workflow docs

Concrete tasks:
- reject giant cross-cutting PRs by default
- document allowed escalation for intentionally broad changes
- require one logical change per PR in instructions

Done means:
- giant multi-feature bursts are blocked or explicitly escalated

## Handoff Checklist

Any agent implementing this plan should work through the following order:

1. make `main` green with lint, typecheck, test, and build all passing
2. remove package-manager drift and standardize on bun
3. update CI to expose stable required job names
4. add policy scripts and wire them into CI
5. configure GitHub branch protection to require those jobs
6. update runtime instructions to match the enforced workflow
7. add Playwright smoke coverage
8. add MCP evidence conventions for UI PRs
9. tune PR scope thresholds after observing a few real PRs

## Acceptance Checklist

The plan is implemented only when all of the following are true:

- `main` is green on lint, typecheck, tests, and build
- direct pushes to `main` are blocked
- required checks are enforced by branch protection
- protected-path changes cannot silently auto-merge
- package-manager drift is blocked
- behavior/spec drift is checked by policy
- test drift is checked by policy
- UI changes require browser smoke in CI
- UI changes require MCP verification evidence in the PR record
- oversized PRs fail or require explicit escalation

## Why This Plan Exists

The repo history already showed the failure mode we are defending against:
- giant feature bursts
- cleanup commits after breakage
- spec updates after the fact
- test rewrites after the fact
- broken app state landing on `main`

This plan is meant to reverse that operating pattern.

Target pattern:
- spec first
- small scoped implementation
- automated verification
- live browser verification
- green PR
- auto-merge

## Immediate Next Steps

Implement in this order:

1. repair `main` to green
2. protect `main`
3. switch to PR-based auto-merge
4. add explicit typecheck and policy-check CI
5. add protected-path enforcement
6. add Playwright smoke coverage
7. add local runtime guardrails for Codex

Do not skip ahead to more autonomy until the earlier phase is stable.

Phase dependency rule:
- Phase 1 must not start until Phase 0 is complete
- later phases do not weaken earlier phases
- no workflow wrapper or runtime enhancement should be added before the repo-level gates are reliable
