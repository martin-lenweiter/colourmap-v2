# Quality Enforcement Implementation Plan

> For Hermes: implement sequentially, with one Codex instance per phase. Do not start the next phase until the previous phase has been reviewed locally.

Goal: turn the current guardrails from partial signals into real enforcement around coverage, route/service testing, architecture boundaries, and GitHub-required checks.

Architecture: keep API routes as thin orchestrators, move business validation into `lib/services/**`, and let CI/policy scripts enforce the contract. Use tiered coverage thresholds plus explicit repo-reality checks rather than a single blunt global percentage.

Tech stack: Next.js route handlers, Vitest, Playwright, Biome, shell policy scripts, GitHub Actions, GitHub branch protection.

---

## Baseline Observations

- CI currently runs `lint`, `typecheck`, `build`, `test`, `browser-smoke`, policy jobs, and `policy-agent-system`, but there is no dedicated coverage gate job.
- `vitest.config.ts` enables coverage reporting but does not enforce thresholds or protected-path regression.
- `app/api/**` has 19 route handlers but only `app/api/check-ins/route.test.ts` exists.
- `lib/services/**` currently contains `check-ins.ts` and `missions.ts`; `missions.test.ts` is present but untracked, so service coverage is still incomplete in repo reality.
- Route auth and JSON parsing are duplicated across handlers.
- Architecture rules in `rules/architecture.md` and testing rules in `rules/testing.md` are stronger than the machine enforcement.

---

## Phase 1 — Coverage gate design and CI wiring

Objective: make coverage an explicit required check, with risk-weighted thresholds and protected-path regression enforcement.

Files likely touched:
- `vitest.config.ts`
- `package.json`
- `.github/workflows/ci.yml`
- `rules/testing.md`
- `scripts/**` (new coverage helper/check scripts)
- optional baseline artifact under `docs/` or `config/`

Deliverables:
- Add a `coverage-gate` CI job with a stable job name.
- Define tiered thresholds at minimum for:
  - `lib/services/**`
  - `app/api/**`
  - auth routes/helpers
  - policy scripts
  - lower/default threshold for presentation-heavy UI code
- Add protected-path regression detection so coverage cannot fall for protected server-side files even if repo-wide totals stay flat.
- Keep `test` as the broad suite and `coverage-gate` as the enforcement job.
- Update rules/docs so the policy matches actual enforcement.

Verification:
- `bun run test`
- coverage command for the new gate
- confirm CI exposes a job named exactly `coverage-gate`

Exit condition:
- CI can fail specifically on coverage regression in protected paths.

---

## Phase 2 — Shared auth/request helpers and route normalization

Objective: centralize route auth and repeated request parsing so handlers stop re-implementing the same control flow.

Files likely touched:
- new helper(s) under `lib/api/` or similar
- `app/api/check-ins/route.ts`
- `app/api/missions/route.ts`
- remaining authenticated route handlers under `app/api/**`
- route tests updated only where behavior contracts need to be pinned

Deliverables:
- Introduce a shared helper for:
  - creating the Supabase server client
  - fetching the current user
  - returning the canonical 401 response
- Optionally add small JSON/body parsing helpers for common invalid-body failure paths.
- Refactor route handlers to use the helper without changing behavior.
- Keep business validation out of route handlers.

Verification:
- targeted route tests
- `bun run lint`
- `bun run typecheck`
- `bun run test`

Exit condition:
- authenticated routes no longer duplicate the auth boilerplate and canonical 401 behavior is shared.

---

## Phase 3 — Route/service test backfill and service contract tightening

Objective: cover the highest-risk server paths first, then make service modules the canonical home for normalization and validation.

Priority routes:
- `app/api/check-ins/analysis/route.ts`
- `app/api/check-ins/insight/route.ts`
- `app/api/day-map/insight/route.ts`
- `app/api/journey/reflect/route.ts`
- `app/api/missions/route.ts`
- `app/api/life-scan/route.ts`
- `app/api/sections/route.ts`
- `app/api/notebook/route.ts`

Also cover their related `[id]` or nested routes where business risk is meaningful.

Files likely touched:
- `app/api/**/route.test.ts`
- `lib/services/*.ts`
- `lib/services/*.test.ts`
- maybe new service modules if route logic needs extraction first

Deliverables:
- Add co-located tests for every API route under `app/api/**`.
- For each important route, cover:
  - success path
  - auth failure
  - validation failure
  - one persistence/service failure path
- Add/complete direct tests for each service module.
- Move input normalization/business validation into services where it still lives in routes.
- Replace ad hoc body casts with typed input objects/helpers.
- Remove obvious nullable/type hacks discovered during the refactor.

Verification:
- `bun run test`
- route and service tests can run in focused subsets during development
- coverage improves meaningfully on protected server paths

Exit condition:
- every route and service file has a sibling test and high-risk flows are directly exercised.

---

## Phase 4 — Boundary enforcement and repo-reality policy checks

Objective: machine-enforce the intended architecture and file/test pairing rules.

Files likely touched:
- `biome.json` if useful
- new or updated policy scripts under `scripts/`
- `.github/workflows/ci.yml`
- `rules/architecture.md`
- `rules/testing.md`

Deliverables:
- Add enforcement for:
  - components must not import DB/query modules directly
  - route handlers should not bypass services for business logic
  - cross-layer imports that violate the intended architecture
- If Biome cannot express this cleanly, add a small custom policy script.
- Add CI checks for:
  - every `route.ts` has a sibling `route.test.ts` or `route.test.tsx`
  - every `lib/services/*.ts` has a sibling test
- Make exceptions explicit, documented, and rare.

Verification:
- run new policy scripts locally
- confirm CI job names are stable and reviewable

Exit condition:
- architecture drift and missing test-pair drift fail automatically.

---

## Phase 5 — Browser-test reality, required checks, and branch protection finalization

Objective: remove false confidence around local/CI test setup and make GitHub enforce the exact intended check set.

Files likely touched:
- repo instructions / bootstrap doc
- `playwright.config.ts` or e2e docs if needed
- `.github/workflows/ci.yml`
- helper script or notes for GitHub branch protection verification

Deliverables:
- Document the local Playwright prerequisite and the easiest local smoke flow.
- Decide whether skipped authenticated smoke coverage is acceptable or whether seeded auth is required now.
- Finalize required checks set:
  - `lint`
  - `typecheck`
  - `build`
  - `test`
  - `browser-smoke`
  - all policy jobs, including `policy-agent-system`
  - `coverage-gate`
- Verify GitHub branch protection actually requires those checks, not just the workflow defining them.

Verification:
- local docs are enough for a predictable smoke run
- branch-protection settings are either updated automatically or accompanied by an exact command/runbook

Exit condition:
- required checks in GitHub match the real guardrails.

---

## Done Definition

- CI fails on coverage regression and instruction-system drift.
- Every API route and service has co-located tests.
- Route auth and canonical 401 handling are centralized.
- Layer boundaries are machine-enforced.
- Required GitHub checks match the intended guardrails.
