# Testing

## Goal

Confidence through enforced, risk-weighted coverage and behavior-based tests.

## Rules

- **Every change gets tests.** New code needs new tests. Changed code needs updated tests. Deleted code means deleted tests. No exceptions.
- **Coverage must not decrease.** If a change lowers coverage, it is not ready to commit.
- **CI enforces coverage thresholds in the `coverage-gate` job.** Local work should keep `bun run test` green before committing; CI is the primary coverage gate.
- **Critical logic carries higher coverage expectations than presentation-only files.**
- **Protected paths must not regress in coverage.**
- **Bug fixes need regression tests when feasible.**
- **No test drift.** Test changes must be justified by the spec, not by implementation drift. If behavior changed accidentally and you are updating tests to match, that is a spec violation. Update the spec first, then update the tests, then commit.
- **Declare `no-spec-impact` only when no behavior changed.** If tests change as part of a refactor with no user-visible effect, declare `no-spec-impact` in the PR body. Unchecked PR-template checklist items do not count.
- **Test the behavior, not the implementation.** Tests should break when behavior changes, not when internals are refactored.
- **One test file per source file.** Co-locate: `lib/foo.ts` → `lib/foo.test.ts`, `app/api/bar/route.ts` → `app/api/bar/route.test.ts`.
- **Route and service pairing is machine-enforced.** Every `app/api/**/route.ts` needs a sibling `route.test.ts` or `route.test.tsx`, and every `lib/services/*.ts` needs a sibling test unless `config/repo-policy.json` records an explicit exception.
- **No skipped tests.** No `test.skip`, no `test.todo` in committed code. If a test can't pass, fix the code or remove the test.

## Coverage Enforcement

Use explicit CI thresholds instead of a repo-wide 100% mandate.

- Keep higher thresholds on critical logic than on presentation-only files.
- Avoid coverage regression on protected server-side paths such as `app/api/**`, `lib/services/**`, auth routes, and Supabase server wiring.
- Never update tests merely to rubber-stamp accidental drift.

Locally, run `bun run test` before committing and `bun run coverage` when working on the coverage gate or protected server paths. CI enforces the weighted thresholds and protected-path baseline via the `coverage-gate` job.

## What to Test

- **Utils/libs**: Unit tests for every exported function. Cover happy path, edge cases, and error cases.
- **API routes**: Integration tests for each endpoint. Cover success, validation errors, and failure modes.
- **Components**: Test user-visible behavior (rendering, interactions, state changes). No snapshot tests.
- **Hooks**: Test with `renderHook`. Cover initial state, state transitions, and cleanup.

## What Not to Test

- Third-party library internals.
- Types (the compiler already tests those).
- Pure configuration files.
