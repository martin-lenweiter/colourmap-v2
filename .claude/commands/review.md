Review the current changes (staged and unstaged) against the repo guardrails and quality bar.

Steps:
1. Run git diff HEAD to see all current changes.
2. Check against rules/guardrails.md: does anything violate the active guardrails?
3. Check for protected-path changes (AGENTS.md, rules/**, skills/**, docs/product.md, docs/specs/**, package.json, bun.lock, etc.) — if yes, flag as Lane B.
4. Check scope: are there more than 25 changed files or 1000 changed lines? Flag if so.
5. Check for spec drift: did behavior change without a docs/specs/ update?
6. Check for test drift: did tests change without a spec update?
7. Check for secrets or credentials.
8. Report: a concise list of findings and whether the change is safe to merge.
