Fix a bug end-to-end following the repo workflow.

Steps:
1. Create a branch named fix/<slug> from main.
2. Read the relevant spec in docs/specs/ if it exists.
3. Diagnose the bug: read logs, errors, and failing tests.
4. Fix it. Add a regression test when feasible.
5. Run the full verification pipeline: biome check, build, all tests.
6. If any UI changed, verify it in a real browser (Chrome DevTools MCP or --chrome). List every route you opened and confirm console is clean.
7. Review the full diff before committing.
8. Check for secrets or credentials — remove and alert if found.
9. Commit with a message that explains what was broken and how it was fixed.
10. Open a pull request.
11. If the PR touches protected paths (AGENTS.md, rules/**, skills/**, docs/product.md, docs/specs/**, package.json, bun.lock, etc.), mark it as Lane B and tell the user it requires human review before merge.

The bug to fix: $ARGUMENTS
