# Platform Safety & Stability

> Audit completed 2026-05-01. This spec tracks the fixes needed to make
> the app safe and stable long-term as the user base grows.

## Why this matters

The app works well today with a small number of users. These fixes are
about making sure it stays that way — fast queries, no data leaks between
users, pages that fail gracefully instead of going blank, and CI that
never breaks due to a flaky network download.

---

## Items

### ✅ 1. Bun install cache in CI
**Risk:** Every CI run re-downloaded all native binary packages cold.
A transient CDN failure (happened with `@rolldown/binding-linux-x64-gnu`)
would fail the entire pipeline.

**Fix:** Added `actions/cache@v4` keyed on `bun.lockb` to every job that
runs `bun install`. On cache hit, nothing is downloaded — the flake
cannot happen. Also added a 3-attempt retry as a belt-and-suspenders
safety net for cold runs.

**Done:** commit `193c4a3`

---

### ✅ 2. Backlog query unbounded
**Risk:** `getBacklogItems()` had no `.limit()`. A power user with years
of tasks would trigger a full table dump on every page load — slow query,
high memory, growing worse over time.

**Fix:** Add `.limit(200)` to the backlog query so the app stays fast
regardless of how much data accumulates.

**Done:** — _(in progress)_

---

### ✅ 3. Missing `user_id` indexes
**Risk:** Several tables are queried by `user_id` without a dedicated
index. The database scans every row to find the right user's data. Fine
with 10 users, noticeably slow with 1 000+.

**Fix:** Drizzle migration adding indexes on the sparse tables.

**Done:** — _(in progress)_

---

### ✅ 4. No error boundaries — page crashes on any API failure
**Risk:** `journey/page.tsx` and other pages use `Promise.all()` with no
error handling. One failing API call crashes the entire page and shows
nothing. There are no React `<ErrorBoundary>` components anywhere in
the app.

**Fix:**
- Wrap `Promise.all()` calls in try/catch so one failure degrades
  gracefully instead of crashing the whole page.
- Add a reusable `<ErrorBoundary>` component.
- Place it in the app shell so every page has a safety net.

**Done:** — _(in progress)_

---

### ✅ 5. No Row-Level Security (RLS) on Supabase
**Risk:** Auth is enforced only in the API layer. If anything bypasses
the Next.js API — a Supabase dashboard query, a leaked `DATABASE_URL`,
a misconfigured edge function — it can read or write any user's data.
RLS enforces ownership at the database level: a row can only be read or
written by the user it belongs to, regardless of how the database is
accessed.

**Fix:** Drizzle migration (raw SQL) adding RLS policies on every table
that holds user data. After migration, run `bun run db:migrate` once
against Supabase.

**Done:** — _(in progress)_

---

### 6. GitHub secret scanning  _(manual — 30 seconds)_
**Risk:** If a developer accidentally commits an API key or password,
it goes to the public repo undetected.

**Fix:** Enable in GitHub: **Settings → Code security → Secret scanning
→ Enable**. Free, instant, no code change needed.

**Done:** — _(needs Martin to click enable in GitHub settings)_

---

## Out of scope for now (watch list)

- **`ai@^6` / `kokoro-js`** — early-stage packages. Review on every
  dependency update PR. No action today.
- **Bundle size gate** — add `bundlesize` or `next-bundle-analyzer`
  check to CI once the app's feature set stabilises.
- **Lighthouse CI** — add performance/accessibility regression gate
  once the UI is closer to final.
- **Unbounded `Promise.all` across the rest of the app** — journey is
  the most critical; a wider audit can follow.
