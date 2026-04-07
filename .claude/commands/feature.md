Build a new feature end-to-end following the repo workflow.

Steps:
1. Read docs/product.md and the relevant spec in docs/specs/ if one exists for this feature.
2. If no spec exists yet, create or update docs/specs/<feature-slug>.md before writing any code.
3. Create a branch named feature/<slug> from main.
4. Enter plan mode and confirm the plan before implementing.
5. Implement the feature.
6. Run the full verification pipeline: biome check, build, all tests.
7. If any UI changed, verify it in a real browser (Chrome DevTools MCP or --chrome). List every route you opened and confirm console is clean.
8. Review the full diff before committing.
9. Check for secrets or credentials — remove and alert if found.
10. Commit with a message that explains what changed and why.
11. Open a pull request.
12. If the PR touches protected paths (AGENTS.md, rules/**, skills/**, docs/product.md, docs/specs/**, package.json, bun.lock, etc.), mark it as Lane B and tell the user it requires human review before merge.

The feature to build: $ARGUMENTS
