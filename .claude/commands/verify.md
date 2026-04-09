Run the full verification pipeline on the current state of the working tree.

Steps:
1. Run biome check — report any diagnostics.
2. Run bun run build — report any failures.
3. Run bun run test — report any test failures.
4. Run bun run typecheck — report any type errors.
5. Show a summary: PASS or FAIL for each step.
6. If all steps pass, report READY TO COMMIT.
7. If any step fails, list what needs fixing before committing.

Do not commit anything. This command only checks.
