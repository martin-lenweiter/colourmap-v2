# Learn GitHub — for Colourmap

A living reference tailored to what you actually do on this project. Not a generic Git tutorial. Starts with "what the hell is a PR" and builds up to "how do I unblock a stuck merge."

This is a markdown source file so it can be updated over time. To get a PDF copy when you want one:

- **VS Code**: install the extension *Markdown PDF* → right-click the file → *Markdown PDF: Export (pdf)*
- **Browser**: open this file in a markdown viewer (or paste it into [dillinger.io](https://dillinger.io)) → print → Save as PDF
- **Command line** (if you install pandoc): `pandoc docs/learn-github-for-colourmap.md -o learn-github.pdf`

Re-generate whenever this doc gets updated. The source of truth is the `.md` file — the PDF is just a snapshot.

---

## 1. The mental model

Four concepts to internalize. Once these click, the rest of Git makes sense.

### Repo
A folder of code, tracked over time. The "folder" is `colourmap-v2`. The "tracked over time" is the magic — every change is recorded, every change is reversible, every version is recoverable.

The repo has two homes:
- **Local**: on your laptop, at `C:\Users\victor\colourmap-v2\`
- **Remote**: on GitHub, at https://github.com/martin-lenweiter/colourmap-v2

They're connected. `git push` sends local changes to GitHub. `git pull` pulls GitHub changes back to local.

### Commit
A labeled snapshot of the code at one moment. Each commit has:
- A **hash** — a 7-character ID like `99e8c03` (short form)
- A **message** — what changed and why
- An **author** — who made it
- A **date** — when
- A **parent** — the commit before it (so commits form a chain)

You create commits with `git commit -m "message"`. They're checkpoints.

### Branch
A named line of commits, diverging from `main`. Used for "working on this feature without disturbing the live code." Every feature, fix, or experiment gets its own branch.

When you open a PR from a branch, you're saying *"please merge this line of commits back into main."*

Our branches look like:
- `feature/atom-visualizer`
- `docs/final-reflection-and-stability-audit`
- `fix/localstorage-test-leak`

The prefix (`feature/`, `docs/`, `fix/`, `chore/`, `guardrails/`) tells readers the *kind* of change at a glance.

### Pull Request (PR)
A proposal to merge a branch into another branch (usually into `main`). PRs exist so humans can review code, CI can run checks, and merges happen deliberately.

A PR has:
- **A head branch** (the source of changes)
- **A base branch** (where the changes go — almost always `main`)
- **A diff** (the exact lines that would change)
- **A description** (why the change matters)
- **Checks** (CI running lint, typecheck, tests, etc.)
- **Reviews** (humans saying yes or requesting changes)

Nothing lands in `main` except through a PR.

---

## 2. How this specific project is set up

### Branch protection on `main`
`main` is protected:
- You can't push directly to it. Attempts get rejected.
- You can only update `main` through a merged PR.
- Merging requires all required CI checks to be green.
- Some paths (specs, migrations, schema, config) are "Lane B" — they require explicit human review, no auto-merge.

This is why tonight's 22 branches needed PRs — there's no shortcut.

### The required CI checks
Every PR runs a workflow that executes ~15 checks in parallel:

| Check | What it does |
|---|---|
| `lint` | `bunx @biomejs/biome check` — no formatting or lint errors |
| `typecheck` | `tsc --noEmit` — TypeScript is happy |
| `build` | Next.js full production build succeeds |
| `test` | Vitest unit tests all pass |
| `coverage-gate` | New code doesn't drop coverage below the thresholds in `config/coverage-gate.json` |
| `browser-smoke` | Playwright runs the critical user journeys in a real browser |
| `policy-architecture-boundaries` | No forbidden imports (e.g. components importing DB code) |
| `policy-test-pairs` | Every route has a paired test file |
| `policy-spec-drift` | Behavior-changing code has a matching spec update |
| `policy-test-drift` | Test changes match behavior changes |
| `policy-protected-paths` | Protected files flagged for manual review |
| `policy-pr-scope` | Warning (not blocking) at >25 files or >1000 lines |
| `policy-deps` | Package manager policy (Bun only, no `package-lock.json`) |
| `policy-agent-system` | AGENTS.md and rule files are wired up correctly |
| `deploy` | Fires on merge to main only; skipped on PRs |

All must be green before merge. That's the safety net. It's strict on purpose.

### Lane A vs Lane B merges
- **Lane A** — routine code changes (most PRs). Can auto-merge once CI is green.
- **Lane B** — changes to protected paths (`docs/specs/**`, `rules/**`, `lib/db/schema.ts`, `drizzle/migrations/**`, `package.json`, etc.). Auto-merge is disabled; you click merge manually after review.

See `rules/guardrails.md` for the full list of protected paths.

### Lefthook git hooks (local enforcement)
Lefthook installs hooks that run before commits and pushes:
- **pre-commit**: runs `biome check --staged --write` so formatting is fixed automatically
- **pre-push**: runs `lint + typecheck + test + lockfile-check`. If any fail, the push is blocked.

If you're ever in a pickle where pre-push blocks a push you really need to land, the escape is `LEFTHOOK=0 git push …` — but that bypasses validation, so use sparingly and with awareness.

---

## 3. The commands you'll use daily

A short command reference. Keep this open in a second tab until it's muscle memory.

### Setup (one-time)
```bash
git clone https://github.com/martin-lenweiter/colourmap-v2.git
cd colourmap-v2
bun install                       # install deps
bun run collab:setup              # install lefthook hooks + verify setup
```

### Sync with remote
```bash
git pull                          # get latest main
git fetch                         # fetch remote branches without changing anything
```

### Start new work
```bash
git switch main                   # make sure you're on main
git pull                          # sync to latest
git switch -c feature/my-idea     # create + switch to a new branch
```

### Save work
```bash
git status                        # see what changed
git diff                          # see the actual changes
git add path/to/file              # stage specific file
git add .                         # stage everything (careful!)
git commit -m "feat: my idea"     # commit with message
```

### Share work
```bash
git push                          # push current branch to remote
git push -u origin my-branch      # first push on a new branch (sets upstream)
```

### Switch context
```bash
git switch main                   # go back to main
git switch other-branch           # switch to an existing branch
git stash                         # temporarily hide uncommitted changes
git stash pop                     # bring them back
```

### Inspect
```bash
git log --oneline -10             # last 10 commits (compact)
git log main..my-branch           # commits on my-branch not yet in main
git diff main...my-branch         # all changes my branch introduces
git branch -a                     # list all branches (local + remote)
```

### Undo (with care)
```bash
git checkout -- file.txt          # discard uncommitted changes to one file
git reset --hard HEAD             # discard ALL uncommitted changes (DANGEROUS)
git reset HEAD~1                  # undo last commit, keep the changes staged
git revert <sha>                  # create a new commit that undoes <sha>
```

The destructive ones (`--hard`, `reset`, `clean -f`) are the ones to be most careful with. They can lose work permanently.

---

## 4. Walking through the daily loop

How a typical feature ships, start to finish. This is the rhythm.

```
1. Sync                         git switch main && git pull
2. Branch                       git switch -c feature/my-thing
3. Code                         (edit files in VS Code)
4. Check                        bun run dev  → visit localhost
5. Save small wins              git add . && git commit -m "..."
6. Push                         git push -u origin feature/my-thing
7. Open PR on GitHub            click green banner "Compare & pull request"
8. Wait for CI                  ~5 minutes, all 15 checks should go green
9. Review                       read your own diff as a stranger would
10. Merge                       click green "Merge pull request" button
11. Delete branch               click "Delete branch" in the merged-PR view
12. Sync local                  git switch main && git pull
13. Delete local branch         git branch -d feature/my-thing
```

Steps 1, 2, 12, 13 are the hygiene — do them religiously and the repo stays clean.

Steps 5–6 are iterative. You'll commit and push many times during the feature build. Each push updates the PR automatically.

---

## 5. How to review a PR (yours or someone else's)

Even on solo projects, reviewing your own PR before merging catches ~30% of bugs. It's worth the 3 minutes.

The review flow:

1. **Read the title.** Does it accurately describe the change?
2. **Read the body.** Does the "why" make sense? Are follow-ups flagged?
3. **Check CI status.** All green? If red, what failed?
4. **Click "Files changed" tab.** Look at every changed line.
5. For each file, ask:
   - Is this the simplest way to do it?
   - Does it introduce any `TODO`s without tracking tickets?
   - Are there tests? If not, why not?
   - Would a stranger understand this in 6 months?
6. **Check protected-path warnings.** If the PR touches `docs/specs/**` or `lib/db/schema.ts` etc., the PR body should explain why.
7. **Leave line-level comments** where something needs to change.
8. **Approve or request changes.**

For a good review checklist, see the `review` slash command's prompt in `.claude/commands/review.md`.

---

## 6. Common situations and how to handle them

### "My PR shows CI failures I don't understand"
1. Click the failing check's "Details" link. It opens the GitHub Actions log.
2. Scroll to the bottom — the actual error is usually in the last 20 lines.
3. Common failures:
   - **coverage-gate** — you added code without tests. Either add tests, or adjust the threshold in `config/coverage-gate.json` (and explain why in the PR body).
   - **browser-smoke** — Playwright couldn't complete a user journey. Probably a real UI regression — worth reproducing locally.
   - **policy-test-pairs** — you added a route without a test file. Add a minimal test.
   - **policy-spec-drift** — you changed behavior but didn't update a spec. Either update `docs/specs/<feature>.md`, or add the `no-spec-impact` tag to the PR description if it's truly internal.

### "The merge button is gray / says checks are expected"
Branch protection requires specific named checks. If a workflow was renamed, the required-check list gets out of sync. Options:
- Wait — sometimes GitHub takes a minute to re-evaluate.
- Go to **Settings → Branches → main rule → Edit**, and update the required-check list to match the current workflow job names.
- Use admin override if you have it (only repo owners).

### "I need to update my PR with new changes"
Just push more commits to the same branch:
```bash
git add .
git commit -m "address review feedback"
git push
```
The PR updates automatically. CI re-runs.

### "I need to pull latest main into my branch"
```bash
git switch my-branch
git fetch origin
git merge origin/main           # or: git rebase origin/main
git push
```
Merge creates a merge commit. Rebase rewrites your commits on top of main — cleaner history but more advanced. Start with merge; learn rebase later.

### "I committed to the wrong branch"
If you haven't pushed yet:
```bash
git log --oneline -3                # find the commits
git switch correct-branch
git cherry-pick <sha>               # apply one commit to this branch
git switch wrong-branch
git reset HEAD~1                    # remove it from the wrong branch
```

If you've pushed, it's more involved. Ask before trying.

### "I want to undo the last commit but keep the changes"
```bash
git reset HEAD~1
```
Your changes are now unstaged and editable. Commit them again, correctly, to the right branch.

### "I pushed a secret by accident"
Stop everything. Secrets (API keys, passwords, tokens) live forever in Git history once pushed. Options:
- **Rotate the secret immediately** (change the password / regenerate the key).
- If urgent, contact GitHub support for commit deletion.
- Don't just delete the file in a new commit — the secret is still in history.

`.gitignore` + `rules/guardrails.md` both warn about this. When in doubt, keep secrets in `.env.local` (gitignored) and never commit them.

---

## 7. The GitHub web UI — what's where

Key pages to bookmark:

- **Code**: https://github.com/martin-lenweiter/colourmap-v2 — the repo root
- **Pull requests**: https://github.com/martin-lenweiter/colourmap-v2/pulls — all PRs, filterable
- **Issues**: https://github.com/martin-lenweiter/colourmap-v2/issues — bug reports and feature tracking
- **Actions**: https://github.com/martin-lenweiter/colourmap-v2/actions — CI run history and logs
- **Settings → Branches**: where `main`'s protection rules live
- **Settings → Secrets and variables → Actions**: where CI environment variables go (not local dev — those live in `.env.local`)
- **Insights → Code frequency**: pretty graph of activity over time

When I'm helping via API, I mostly use the PRs page — filter by open/closed, sort by recency, click into a PR to read diff and CI state.

---

## 8. Glossary

Quick definitions for the terms that show up constantly.

| Term | Meaning |
|---|---|
| **Commit** | A saved snapshot of code with a message |
| **Branch** | A named line of commits diverging from main |
| **Push** | Send local commits to GitHub |
| **Pull** | Get GitHub's latest down to your laptop |
| **Fetch** | Like pull but doesn't touch your working files — just downloads remote state |
| **Merge** | Combine two branches; creates a "merge commit" |
| **Rebase** | Move your commits on top of a different base; rewrites history |
| **Cherry-pick** | Copy one specific commit from another branch |
| **PR** | Pull request — a proposal to merge |
| **CI** | Continuous Integration — the automated checks that run on each PR |
| **Head** | The source branch of a PR (the one with your changes) |
| **Base** | The target branch of a PR (usually main) |
| **Conflict** | When two branches changed the same line differently — Git asks you to resolve |
| **Upstream** | The remote branch your local branch tracks |
| **Origin** | The default remote (usually the GitHub copy of the repo) |
| **Fast-forward** | A merge where no new merge-commit is needed — target branch just "catches up" |
| **Force-push** | Overwrite the remote branch with your local version; DANGEROUS — can lose coworkers' commits |
| **.gitignore** | Lists files Git should NEVER track (`.env`, `node_modules/`, etc.) |
| **HEAD** | The commit your working directory currently matches |
| **SHA** | The unique ID of a commit (e.g. `99e8c03b4...`) |
| **Tag** | A label on a specific commit, used for releases (e.g. `v1.0.0`) |
| **Blame** | `git blame` — shows who last changed each line |
| **Hook** | A script Git runs automatically at a lifecycle event (pre-commit, pre-push, etc.) |
| **Squash** | Merge multiple commits into one during merge |
| **Stash** | Temporary pocket for uncommitted changes |

---

## 9. Things worth learning next

Ordered by leverage for the kind of work we're doing.

### Near-term (worth learning in the next week)
1. **Reading a diff fluently** — "+" lines are added, "–" lines are removed. Hunks (the @@ markers) show line numbers.
2. **Resolving merge conflicts in VS Code** — when Git finds two branches changed the same line, you get conflict markers. VS Code has a built-in resolver.
3. **Using `git log --graph --all --oneline`** — the whole branch topology on one screen.
4. **Creating a PR from the GitHub web UI** (not just CLI) — faster when you're already in a browser.

### Medium-term (next 1–3 months)
1. **Interactive rebase** — `git rebase -i HEAD~5` lets you reorder, squash, or rewrite the last 5 commits before pushing.
2. **Branch protection rules** — how to configure them via GitHub Settings so you can make the repo as strict or relaxed as the moment requires.
3. **GitHub Actions workflow syntax** — so you can adjust CI yourself. `.github/workflows/ci.yml` is where it lives.
4. **Signed commits** — a GPG key proves a commit is genuinely from you. Not required, but good practice for published repos.

### Long-term (as the project grows)
1. **Submodules / monorepos** — if Colourmap splits into multiple packages.
2. **Automated release workflows** — tagging, changelogs, npm publishing if you ever ship an SDK.
3. **Self-hosted runners** — running CI on your own hardware instead of GitHub's (relevant only if the free-tier compute minutes run out).

---

## 10. Recommended external resources

When you want to learn more deeply:

### The basics
- **[git-scm.com/doc](https://git-scm.com/doc)** — official docs, dense but authoritative
- **[Pro Git book](https://git-scm.com/book/en/v2)** — free, comprehensive, exceptionally well-written
- **[Oh Shit, Git!?!](https://ohshitgit.com/)** — how to recover from common mistakes, profanely

### Interactive learning
- **[Learn Git Branching](https://learngitbranching.js.org/)** — a visual, in-browser exercise sequence. Best hour you can spend on Git.
- **[GitHub Skills](https://skills.github.com/)** — GitHub's own tutorials for their platform features.

### When you're stuck
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/git)** — almost every Git question has been answered there
- **`man git-<command>`** — built-in help for any Git command (e.g. `man git-rebase`)

---

## 11. Changelog of this document

Keep track of updates to this file so you can see how your understanding has grown.

- **2026-04-24** — Initial version. Written during the overnight session to answer Martin's question "what should I learn about GitHub for this project."

---

*Source: `docs/learn-github-for-colourmap.md`. Edit this file directly; regenerate PDF from it whenever you want a printable copy.*
