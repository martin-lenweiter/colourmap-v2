# Integration & Merge Plan — Joining Branches to Supabase + Vercel

Written 2026-04-23 in response to Martin's question:
> "bear in mind martin is setting up the vercel and supabase now from pr 26 so think how u will join the two ends. maybe merge it all before working on circles and all that stuff which depends on supabase vercel version"

Also:
> "on the landing page when we register."

This is a **convergence document.** Two workstreams are happening in parallel — Martin is wiring real Supabase + Vercel against PR #26's merged state; I've produced 14 pending branches off PR #26's HEAD. This plan is how they meet without stepping on each other.

## 1. Two workstreams, where they currently are

### Martin (backend + hosting)
- Starting from PR #26 merged to `main` (143 commits)
- Creating Supabase project (auth + Postgres + RLS policies)
- Connecting Vercel deployment (env vars from Supabase)
- Wiring real email auth flow to replace `DEV_BYPASS_AUTH=true`
- Running `drizzle-kit push` to apply the existing 8 migrations to the Supabase DB

### Claude / parallel branches (14 pending)
All on origin, waiting for PR #26 to merge so they can open PRs against a post-merge `main` cleanly:

**Feature branches (9):**
1. `feature/audio-samples-batch-1` — 143 sample files + attributions
2. `feature/calm-sounds-copy-pass` — UI text tweaks
3. `feature/night-mode-variants` — 3 new night themes
4. `feature/open-studio-pill` — pill redesign
5. `feature/calm-sounds-css-polish` — smooth reverb bar + bolder titles
6. `feature/saved-shape-markers` — 5 shape markers
7. `feature/ui-tooltip-system` — tooltip component + softness explainer
8. `feature/theme-adaptation-sweep-1` — check-in boxes adapt to night themes
9. `feature/binaural-engine-breathing` — organic LFO drift on binaural beat
10. `feature/melody-multi-octave` — melodies span multiple octaves
11. `feature/circles-coworking-copy` — Circles intro copy update

**Doc branches (5):**
12. `docs/roadmap-wishlist-2026-04-23` — full wishlist organized
13. `docs/sound-studio-reflections` — vision + voice/TTS strategy
14. `docs/app-store-strategy` — Apple App Store launch plan
15. `docs/mobile-first-plan` — phone-first design plan
16. `docs/integration-merge-plan` — this file

## 2. Dependency graph — what depends on what

Drawing the order the branches should land in:

```
PR #26 (sound-studio-polish)
    │
    ▼
main  ◄──────────────────────────────────────┐
    │                                         │
    ├── docs/roadmap-wishlist-2026-04-23  ────┤  (pure docs — land first, no risk)
    ├── docs/sound-studio-reflections     ────┤
    ├── docs/app-store-strategy           ────┤
    ├── docs/mobile-first-plan            ────┤
    ├── docs/integration-merge-plan       ────┤
    │                                         │
    ├── feature/audio-samples-batch-1     ────┤  (adds files only — land second,
    │                                         │   unblocks any sample-using PR later)
    │                                         │
    ├── feature/calm-sounds-copy-pass     ────┤
    ├── feature/open-studio-pill          ────┤  (UI-only, independent — land any order)
    ├── feature/calm-sounds-css-polish    ────┤   they touch nearby code but don't conflict
    ├── feature/saved-shape-markers       ────┤
    ├── feature/night-mode-variants       ────┤
    ├── feature/circles-coworking-copy    ────┤
    │                                         │
    ├── feature/ui-tooltip-system         ────┤
    │       │                                 │  (tooltip depends on itself only;
    │       ▼ enables                         │   its softness-explainer lands with it)
    │   [future tooltips in other PRs]        │
    │                                         │
    ├── feature/theme-adaptation-sweep-1  ────┤  (requires night-mode-variants merged
    │                                         │   for full effect — order these together)
    │                                         │
    ├── feature/melody-multi-octave       ────┤  (audio-engine, no external deps)
    └── feature/binaural-engine-breathing ────┘  (audio-engine, no external deps)
```

None of these depend on Supabase. **They can all merge before Supabase is live.** That's the main point.

What's **blocked** on Supabase:
- Real signup/registration flow (landing page)
- Circles cross-device sync
- Any feature that persists to DB instead of localStorage

## 3. Recommended merge order once PR #26 lands

Once `main` receives the 143-commit fast-forward, open these PRs in this sequence:

### Wave 1 — docs (zero risk, all Lane B but trivially approvable)
- `docs/roadmap-wishlist-2026-04-23`
- `docs/sound-studio-reflections`
- `docs/app-store-strategy`
- `docs/mobile-first-plan`
- `docs/integration-merge-plan`

Merge all five. They give Martin the full reference material he needs for the upcoming work.

### Wave 2 — foundation / low-risk code
- `feature/audio-samples-batch-1` — adds `public/sounds/**` files, no existing code touched. Safe.
- `feature/night-mode-variants` — CSS additions only. No component behavior changes.
- `feature/circles-coworking-copy` — 20 lines of copy change.

### Wave 3 — UI polish cluster (medium risk, easy to QA)
These touch `components/BinauralTuner.tsx` but in different regions. Merge one at a time and smoke-test between:
- `feature/calm-sounds-copy-pass`
- `feature/open-studio-pill`
- `feature/calm-sounds-css-polish`

### Wave 4 — new surfaces and features
- `feature/saved-shape-markers`
- `feature/ui-tooltip-system` (now nobody else has added InfoTooltip usages, so the import is clean)
- `feature/theme-adaptation-sweep-1`

### Wave 5 — audio-engine features (biggest risk; verify by ear on real device after)
- `feature/melody-multi-octave`
- `feature/binaural-engine-breathing`

### Merge-conflict watch

Some branches touch adjacent code and will need light rebase on top of each other depending on the order Martin picks:

- **`feature/calm-sounds-copy-pass`** rewrote the "layer reverb" label to "layer softness" and removed the "find your frequency" line.
- **`feature/calm-sounds-css-polish`** restyled the layer-reverb bar in the same paragraph.
- **`feature/ui-tooltip-system`** wrapped the layer-reverb label in an InfoTooltip.

If copy-pass lands first, css-polish and tooltip-system both need a 3-line rebase (their `layer reverb` text is now `layer softness`). Trivial.

If tooltip-system lands first, copy-pass needs to update its text change inside the InfoTooltip trigger. Also trivial.

Either order works. Pick whatever Martin wants to review first.

## 4. The Supabase-ready moment — what changes

Once Martin has:
1. Supabase project live with URL + publishable key
2. Drizzle migrations applied
3. RLS policies configured (critical — without these, user A can read user B's data)
4. Real env vars set in Vercel

...the app is suddenly multi-device, persistent, sign-up-able. That unlocks a different class of work that can now start:

### Landing / registration page (Martin asked about this)

The current `/login` page only has "Continue with Google." Once Supabase email auth is configured:

**What the landing page needs (first version):**
- Clear pitch in one sentence: what Colourmap is
- Two action paths:
  - *"I'm new"* → email signup form
  - *"I've been here"* → email sign-in (magic link) or "Continue with Google"
- Below the fold: 3-4 screenshots/illustrations showing what the app does
- No forced signup for browsing — let first-time visitors poke around in `DEV_BYPASS_AUTH`-style exploration mode so they see value before committing an email

**Components we'd build:**
- `app/(auth)/register/page.tsx` — new route, email + password (or magic link) signup
- Updated `app/(auth)/login/page.tsx` — add email option alongside Google
- Landing at `/` for unauthenticated users (currently the cockpit loads — it should redirect to a marketing page if no session)

**Spec items to answer before building:**
- Magic link (just email, no password) or email+password? Magic link is simpler UX and lower support burden. Recommend magic link.
- Sign in with Apple — required for App Store per `app-store-strategy.md`. Add this now or later? Later is fine if we're not submitting to App Store immediately.
- Email collection consent / privacy link — need the privacy policy URL live.

### Circles cross-device sync

Currently `localStorage` only. Once Supabase + RLS are live, Circles becomes a real multi-user feature:
- `circles` table already in schema (per the migrations)
- `CircleBoard.tsx` needs swapping `localStorage.getItem` calls for API calls to existing `/api/circles/**` routes
- RLS policy: a user can see circles they're a member of, and mutate missions/notes within those circles

**Order of work:**
1. Supabase live
2. Migrate `CircleBoard.tsx` from localStorage to API calls
3. Test multi-device (sign in on two browsers, changes sync)
4. Ship Circles as "real" collaborative

### Check-in persistence

Check-in data is already wired to `/api/check-ins/**` routes (per the migrations). This already works against Supabase once the DB is live — no code changes needed on the app side. Just needs the backend connected.

## 5. The "merge before Circles work" strategy

Martin's ask: "merge it all before working on circles and all that stuff which depends on supabase vercel version."

Concretely this means:

- **Don't start Circles-sync work** until Supabase is live AND the 14 pending branches are merged. Working on Circles on top of un-merged branches creates rebase spaghetti.
- **Do keep shipping** pure-frontend work (copy, CSS, new components that don't touch auth or DB) in parallel with Martin's backend setup. Those branches can keep piling up safely because they're independent.
- **When Supabase goes live**, the first DB-touching work should be:
  1. Test existing `/api/check-ins/**` routes actually save data
  2. Test Circles routes sync across devices
  3. THEN start adding the landing page, Circle migration from localStorage, and user-scoped features

## 6. Coordination cadence

Suggested working pattern while this convergence happens:

- **When Martin finishes a Supabase milestone** (project live, RLS configured, env vars set) → he pings me with what's working
- **When I finish a non-Supabase branch** → I push it and list it in this chat
- **After PR #26 merges** → we plan a merge-day where we walk through the 14 branches in the order above
- **Once Supabase is live** → switch to Supabase-facing work and defer any further pure-UI polish until after the first real-user smoke

## 7. What tonight's remaining work should be

Given Martin is actively working on Supabase and doesn't want parallel work on Circles-DB-dependent things, tonight's remaining scope should be:

**Safe to keep building (no Supabase dependency):**
- Mobile-first CSS baseline PR (covers multiple surfaces at once)
- More polish PRs if time remains
- Additional spec docs if useful

**Should NOT start tonight:**
- Landing page / registration (depends on Supabase email auth live)
- Circle localStorage → API migration (depends on live DB + RLS)
- Check-in DB persistence testing (depends on live DB)
- Sign in with Apple (depends on Apple Developer enrollment + Supabase Apple provider config)

## 8. The convergence check

When Martin says "Supabase + Vercel are live," these are the things to verify before building on top:

- [ ] Supabase URL and publishable key in `.env.local` and Vercel env vars
- [ ] `DEV_BYPASS_AUTH` removed from `.env.local` (or at least not in Vercel prod)
- [ ] Database has the 8 Drizzle migrations applied
- [ ] Row-Level Security policies active on all user-scoped tables (check-ins, missions, circles, etc.) — a user CANNOT query another user's data via SQL or API
- [ ] `/api/check-ins` POST and GET work for an authenticated user, return only that user's rows
- [ ] Email signup flow tested end-to-end (signup → confirm → log in → save a check-in → log out → log back in → see saved check-in)
- [ ] Vercel deployment serves the app at a live URL
- [ ] Environment variable hygiene — no `NEXT_PUBLIC_*` accidentally containing a private key

Once all 8 boxes are ticked, we can open the floodgates for Supabase-dependent work.

## 9. One-line integration test

When everything is wired, a user should be able to:

> **Sign up with email on one phone, check in, listen to sounds, close the app, open it on a laptop later, see the same check-in, and it should feel like one coherent account.**

That's the bar. Nothing ships to the App Store until this works.

---

*Owned by: Martin + Claude*  
*Updated: 2026-04-23 (initial)*  
*Next update: after PR #26 merges and Supabase goes live*
