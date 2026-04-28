# Colourmap — Technical Primer

A plain-language guide to the vocabulary and concepts behind the codebase.  
Built for someone who understands the product deeply and is learning the technical layer.

---

## Part 1 — Git & GitHub

**Git** is the system that tracks every change ever made to the code. It lives on your machine and keeps a full history.

**GitHub** is the online home for that history — a shared server where the team can see, review, and merge each other's work.

**Repository (repo)** — the project folder under Git's control. Colourmap's is `martin-lenweiter/colourmap-v2` on GitHub.

**Commit** — a saved snapshot of changes. Like pressing Save, but permanent and labelled. Every commit has a short ID (e.g. `5b38b43`) and a message explaining what changed.

**Branch** — a parallel version of the code where you can build something without touching the main codebase. You branch off `main`, do your work, then merge back in. Branch names in this repo follow a pattern: `feature/sparks`, `fix/phone-polish`, etc.

**Main (branch)** — the official, live version of the code. Everything merged into main is what gets deployed.

**Push** — sending your local commits up to GitHub so others (and CI) can see them.

**Pull / Pull request (PR)** — a proposal to merge a branch into main. GitHub shows the diff (what changed), runs automated checks, and lets someone review before it merges.

**Merge** — combining a branch back into main. Once merged, the changes are permanent.

**Cherry-pick** — taking a single commit from one branch and applying it onto another, without merging the whole branch. Used when a branch has gone stale but the individual commits are still good.

**Merge conflict** — when two branches changed the same line of code differently and Git can't decide which to keep. You resolve it manually by choosing one version or combining them.

**Origin** — the name Git uses for the GitHub remote. `git push origin main` means "push to the main branch on GitHub."

**Branch protection** — a GitHub setting that blocks anyone from pushing directly to main. All changes must go through a PR. Colourmap uses this.

---

## Part 2 — CI/CD (Automated Checks)

**CI (Continuous Integration)** — every time you open a PR, GitHub automatically runs a set of checks on your code. If any check fails, the PR is blocked from merging.

**CD (Continuous Deployment)** — after a PR merges, the app can automatically deploy to production. (Colourmap uses Vercel for this.)

**Check / pipeline** — one automated job in CI. Colourmap runs 14 checks: lint, typecheck, build, unit tests, coverage gate, architecture policy, test pairs, etc.

**Pre-push hook** — a script that runs on your machine before your code reaches GitHub. Colourmap uses Lefthook to run lint, tests, and typecheck locally first, so you catch problems before CI does.

**Coverage gate** — a minimum threshold for how much of the code must be covered by tests. If you add code without tests and the percentage drops below the threshold, CI fails.

---

## Part 3 — The Tech Stack

**TypeScript** — the language the whole codebase is written in. It's JavaScript with types, meaning you declare what kind of data a variable holds and the compiler catches mismatches before the code runs.

**React** — the library for building UI. You write components (self-contained pieces of UI like `<FeelingCheckInCard />`) that React assembles into pages.

**Next.js** — the framework built on top of React. It handles routing (which URL maps to which page), server-side logic, and the build process. The `app/` folder is Next.js's file-based router — a file at `app/(app)/day/page.tsx` becomes the `/day` URL.

**Node / Bun** — the runtime that executes JavaScript/TypeScript on the server. This project uses Bun instead of Node for speed. `bun run dev` starts the local development server.

**Supabase** — the backend-as-a-service powering the database and authentication. It runs PostgreSQL and gives you a dashboard, REST API, and real-time subscriptions without managing a server yourself.

**PostgreSQL** — the database. Relational: data lives in tables with rows and columns. SQL is the language used to query it (`SELECT`, `INSERT`, `UPDATE`, etc.).

**PostGIS** — a PostgreSQL extension that adds geographic data types. Used for the Sparks map feature — finding sparks "within 10km of you" is a PostGIS query.

**Drizzle ORM** — the layer between TypeScript code and the database. Instead of writing raw SQL everywhere, you write TypeScript and Drizzle translates it. It also manages migrations.

**Migration** — a SQL file that describes a change to the database schema (new table, new column, new index). You run migrations in order; they are permanent and cumulative. Colourmap's live in `drizzle/migrations/`.

**API route** — a server-side endpoint. In Next.js, files at `app/api/*/route.ts` become HTTP endpoints the frontend calls. For example, `app/api/field/route.ts` → `GET /api/field`.

**Environment variable** — a secret or config value stored outside the code (in `.env.local`). Things like database passwords and API keys. They are never committed to Git.

**Tailwind CSS** — a utility-first CSS system. Instead of writing CSS files, you add class names directly to HTML elements (`className="text-sm font-semibold text-muted-foreground"`). The design tokens (colours, spacing) live in `tailwind.config.ts`.

---

## Part 4 — Testing

**Unit test** — a test that checks one function or component in isolation. Colourmap's service-layer tests (`lib/services/sparks.test.ts`) are unit tests.

**Vitest** — the testing framework. You run `bun run test` and it executes all files ending in `.test.ts`.

**Mock** — a fake version of a dependency used in tests. Instead of hitting a real database, the test swaps in a mock that returns controlled fake data. This keeps tests fast and predictable.

**`vi.hoisted()`** — a Vitest pattern for creating mocks that are set up before any imports run. Needed because modules are imported at the top of the file before test setup code.

**Test pair** — a repo policy: every service file and API route must have a matching `.test.ts` file. The CI check `policy:test-pairs` enforces this.

---

## Part 5 — Code Quality

**Biome** — the linter and formatter for this repo. It enforces consistent code style and catches common mistakes. `bun run lint` runs it. Pre-push hooks run it automatically.

**Linting** — static analysis: reading code without running it to find style issues and potential bugs.

**TypeScript error** — a type mismatch the compiler catches at build time, before anything runs. For example, passing a prop to a component that doesn't accept it.

**`tsconfig.json`** — the TypeScript configuration file. Sets strictness level, paths, and which files to include.

---

## Part 6 — Architecture Concepts

**Service layer** — `lib/services/` — the business logic layer. Each domain (sparks, check-ins, circles) has a service file that owns all the rules: validation, ownership checks, what's allowed. API routes call the service; they never touch the database directly.

**DB queries layer** — `lib/db/queries/` — the pure database access layer. Only reads and writes; no business logic. The service calls the query layer.

**Component** — a reusable piece of UI in `components/`. Each file exports one React component. They are composed together in page files.

**`app/` vs `components/`** — `app/` contains pages (routes), `components/` contains UI pieces. Pages assemble components.

**Architecture policy** — a machine-enforced rule in `config/repo-policy.json`. Example: API routes for the sparks domain must only import from `lib/services/sparks.ts`, never directly from `lib/db/schema.ts`.

---

## Part 7 — Vibe Coding

**Vibe coding** — building software by describing what you want in natural language and letting an AI (like Claude) write the code. You steer with intention and judgment; the AI handles syntax and implementation detail.

**The role split** — you hold the product vision, user empathy, and final decisions. The AI holds the implementation knowledge, catches edge cases, and does the repetitive work. Neither works as well without the other.

**Prompt** — the instruction you give the AI. Specificity matters: "make the nav swipeable on phone with a fade mask and auto-scroll the active tab to centre" produces much better output than "improve the nav."

**Diff** — the visual representation of what changed in a file: green lines added, red lines removed. Reading diffs is the core skill for reviewing AI output — you confirm what actually changed before it goes into the codebase.

**Hallucination** — when an AI states something confidently but incorrectly. In code: inventing a function that doesn't exist, or referencing a prop a component doesn't accept. This is why the build, type check, and tests all run — they catch hallucinations mechanically.

**Context window** — the AI's short-term memory for a conversation. Once a conversation gets long enough, earlier messages fall out of context and the AI loses access to them. This is why important decisions get written to files (specs, CLAUDE.md) instead of just said in chat.

---

## Part 2 — What to Learn Next (Priority Order)

### 1. Reading a diff (this week)
Before anything else, get comfortable reading what changed in a PR. GitHub shows green/red lines — green is added, red is removed. You don't need to understand every line; you need to sense-check that what changed matches what was intended.

### 2. Git branching model (this week)
Understand: branch → commit → push → PR → merge. Know why main is protected and why every change goes through a PR. You already use this workflow; just make the mental model explicit.

### 3. TypeScript basics (next 2 weeks)
You don't need to write TypeScript from scratch, but you should be able to read it. The key concepts: types, interfaces, `string | null`, function signatures, `async/await`. Enough to understand what an error message is complaining about.

### 4. SQL fundamentals (next month)
SELECT, INSERT, WHERE, JOIN, COUNT. Colourmap's value is in its data — knowing how to query it directly (via Supabase's SQL editor) is very powerful. You can answer product questions yourself without needing an engineer.

### 5. How Next.js routing works (when you need it)
The file-based router: `app/(app)/day/page.tsx` = `/day`. `app/api/field/route.ts` = `GET /api/field`. Understanding this makes the project structure legible.

### 6. Environment variables and deployment (when you need it)
What `.env.local` is, why secrets are never in Git, how Vercel gets its config. Enough to deploy a change without accidentally exposing a key.

---

*Last updated: April 2026. Generated from live codebase context.*
