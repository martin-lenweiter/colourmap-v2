# Next Steps + Phone UI Strategy

Written 2026-04-24 to answer:
1. "How would you imagine next steps"
2. "Phone UI — when we write on a phone it reduces screen size by half"

Two halves of one document. The next-steps half is the what-to-do-in-what-order. The phone-UI half is the how-to-handle-specific-platform-gotchas, especially the virtual keyboard cutting usable space in half.

---

# Part A — Next steps, prioritized

Given where we are tonight (25 open PRs, core running on localhost from a feature branch, Supabase not yet live for real), here's the leverage-ordered sequence for the next 14 days.

## Wave 1 — this week (unblocks everything)

**1. Get the 25 PRs merged.** The merge blocker is "branch behind main." Fastest fix: Martin in the GitHub web UI clicks "Update branch" then "Merge" on each. About 10–15 minutes of clicking. Or disable "Require branches to be up to date" in Settings → Branches → main rule → edit, merge the backlog, re-enable. I can do that programmatically but it takes 25 × 3 min = ~75 min.

**2. Supabase project alive + RLS on every user table.** Not "exists" — actually has row-level security policies on `check_ins`, `missions`, `circles`, etc. Without RLS any authenticated user can read anyone else's data. The #1 security blocker.

**3. Remove `DEV_BYPASS_AUTH` from Vercel production env.** Check the Vercel dashboard. Add a guard in `lib/supabase/server.ts` that throws if set in prod (so it never silently slips through again).

**4. `/` route redirect or rebuild.** Right now visiting `localhost:5000/` shows the old cockpit. Either redirect `/` → `/day` (2-line fix) or rebuild the root as a proper dashboard. I'd do the redirect now and rebuild later.

**5. Phone keyboard handling** (see Part B). Users typing on mobile lose half their screen. Fix before anyone demos on a phone.

## Wave 2 — week 2 (audibility + visibility)

**6. Wire piano + drums into the audio engine.** Files landed in PR #32 but no code consumes them. Without wiring, the samples are just dead bytes in `public/sounds/`. Need a `Tone.Sampler` factory + UI toggle to add piano/drums as layers in Calming Sounds.

**7. Circles → Supabase sync.** Currently localStorage-only. Swap `CircleBoard.tsx`'s localStorage reads for API calls to `/api/circles/**` (routes already exist per migrations). Multi-device Circles is the #1 user-visible Supabase win.

**8. Bring back the Life Dynamics page.** The compasses, overview, self-growth surfaces that Martin said went invisible. Route: `/dynamics`. Shows trend arrows, last 30 days of check-ins, dominant patterns. 1 day of work once Supabase data is real.

**9. Landing page at `/` for unauthenticated users.** Currently unauthed hits `/login`. A proper welcoming landing with "what is Colourmap" + "start with email" is the conversion lever for new visitors.

## Wave 3 — week 3-4 (delight + trust)

**10. Journey mode player.** Specced in `docs/specs/final-reflection-and-super-colourmap.md` — 4 curated journeys (Dawn / Depth / Dissolution / Rising) each 5–15 min. Takes control of visualizer + sound. Very high retention value once shipped.

**11. Personal jingle for mission success.** Mini Magic Maker mode where user composes a 4-note jingle, saved per user, plays when missions complete. Identity-forming feature.

**12. Video loops in harmony** (specced in PR #52). Phase-0 spike only — 4 hardcoded loops proving the concept, behind a feature flag.

**13. Azure Neural TTS integration.** Replaces the robotic browser speech. Spec already in `docs/specs/voice-and-tts-strategy.md`. One API key + one server route + caching pattern.

**14. Calendar view for check-ins.** Martin asked earlier: a calendar surface showing check-in history per day, color-coded by Hawkins level. Clickable dates open that day's entry.

## Wave 4 — week 5-8 (ship-to-phone)

**15. Capacitor integration for iOS.** Follow `docs/specs/app-store-strategy.md`. 2-3 weeks to first simulator build. Enables background audio (the big native-only feature).

**16. Sign in with Apple** (App Store requires it).

**17. TestFlight beta** with 20 hand-picked testers. One week minimum.

**18. App Store submission.** 1-3 day review. Then live.

## Wave 5 — when traction is real (months 3+)

**19. Android (Play Store).** Same Capacitor codebase, add Android target. ~1 week extra.

**20. RevenueCat subscriptions** — unifies iOS IAP, Android Billing, Stripe.

**21. Weekly journey drops** — one new curated journey every Monday, builds habit.

**22. Premium voices / instruments** — expanded library behind paid tier.

**23. Community Discord + blog** — social scaffolding, not algorithmic.

## What I'd drop from the current wishlist

Be honest — some ideas are weaker than others:
- **"Games library" (chess, cards, etc.)** — interesting but off-concept. Colourmap is self-reflection + regulation. Games pull us toward "fun app" territory. Defer to a sister product.
- **Ear-training module** — worthy, but it's a standalone app that would eat Colourmap development time. Spin off later if we want.
- **Collective consciousness / anonymous trails** — beautiful spec, but privacy + moderation complexity is significant. Year 2.

Focus is the rarest product skill. What to ship IS what to cut.

---

# Part B — Phone UI, especially the keyboard problem

Martin's observation: "when we write on a phone it reduces screen size by half." This is real, universal, and handled poorly by most web apps.

## Why it happens

On every phone browser, tapping a text input opens the virtual keyboard. The keyboard typically occupies 40–50% of the viewport height. iOS and Android both:
- Fire a `resize` event (sometimes, inconsistently)
- Adjust `window.innerHeight` (sometimes)
- Shift the viewport (sometimes — iOS Safari particularly inconsistent)

The result: an input at the bottom of the page disappears behind the keyboard, a submit button gets hidden, a form becomes unusable. Users think the app broke.

## The modern solution — `100svh` + `visualViewport`

CSS first:

```css
/* 100vh is the OLD viewport height — doesn't account for keyboard */
/* 100svh is the SMALL viewport height — stable, excludes keyboard */
/* 100dvh is the DYNAMIC viewport height — updates live as keyboard opens */

.full-height-page {
  min-height: 100svh;      /* use svh by default */
  min-height: 100dvh;      /* fall back to dvh where supported */
}
```

Hard rule: **never use `100vh` in the app again.** Always `100svh` or `100dvh`.

JavaScript for inputs specifically:

```ts
// On focus, scroll the input into view with enough margin for visibility
input.addEventListener('focus', () => {
  // wait a frame for keyboard to start appearing
  requestAnimationFrame(() => {
    input.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
});
```

For full precision, use the `visualViewport` API:

```ts
if ('visualViewport' in window) {
  window.visualViewport.addEventListener('resize', () => {
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    document.documentElement.style.setProperty(
      '--keyboard-height',
      `${keyboardHeight}px`
    );
  });
}
```

Then in CSS:
```css
.form-submit {
  position: sticky;
  bottom: calc(16px + var(--keyboard-height, 0px));
}
```

Result: the submit button stays visible above the keyboard no matter how tall the keyboard is.

## Specific surfaces in Colourmap that need this treatment

Each of these has a text input that a user will tap. Each needs the keyboard-aware pattern.

1. **Check-in notes + challenge + flow** — the main daily form. High-impact.
2. **Circles — circle name input** (creating a circle).
3. **Circles — join code input**.
4. **Circles — mission input** (inside a circle board).
5. **Circles — note input** (inside a circle board).
6. **Circles — member name setup** (first-time).
7. **Login — email input** (once email auth is added).
8. **Notebook — entry title + body** (when entries exist).
9. **Magic Maker — save mix name** (save dialog).

Nine places. A single new utility component `<KeyboardAwareInput>` or a hook `useKeyboardAwareInput()` handles all of them.

## The full strategy — beyond just keyboards

The keyboard is one of five phone-specific UI pains. The full strategy:

### 1. Safe-area insets
iPhones have notches, rounded corners, home indicators. Pages must respect these:

```css
.page-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Ship this in `app/globals.css` as a base rule for the app container.

### 2. Touch target sizes
Apple HIG: 44×44 px minimum. Material Design: 48×48 px. Colourmap has lots of ~8 px decorative dots that are also interactive — those all need invisible hit-area expansion. The `tap-44` utility shipped in PR #43 handles this. Apply it systematically.

### 3. Scroll hijacking (don't)
Never `overflow: hidden` on body when a modal opens without a fallback. Users need to scroll. Don't prevent pull-to-refresh. Don't use `body { overscroll-behavior: none }` globally.

### 4. Haptic feedback
`navigator.vibrate(10)` on key interactions (mission-complete, save, check-in submitted) adds physical presence. Trivial code, meaningful feel.

### 5. Loading states matter more
On a phone, a blank 300ms is a bug. Every async action needs an immediate visual (skeleton, spinner, optimistic UI). Users on mobile abandon faster.

## The keyboard-aware input hook (implementation sketch)

```tsx
// components/hooks/useKeyboardAware.ts
import { useEffect, useRef } from 'react';

export function useKeyboardAware<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onFocus() {
      requestAnimationFrame(() => {
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    }

    el.addEventListener('focus', onFocus);
    return () => el.removeEventListener('focus', onFocus);
  }, []);

  return ref;
}

// Usage:
const inputRef = useKeyboardAware<HTMLInputElement>();
return <input ref={inputRef} ... />;
```

Plus a global CSS rule in `globals.css`:

```css
@media (max-width: 768px) {
  :root {
    --keyboard-height: 0px;
  }

  /* Form pages respect the virtual keyboard */
  form {
    padding-bottom: max(24px, var(--keyboard-height, 0px));
  }
}
```

Plus a tiny module-level JS that sets the `--keyboard-height` CSS var:

```ts
// lib/keyboardHeight.ts
if (typeof window !== 'undefined' && 'visualViewport' in window) {
  const update = () => {
    const kh = window.innerHeight - window.visualViewport!.height;
    document.documentElement.style.setProperty('--keyboard-height', `${kh}px`);
  };
  window.visualViewport!.addEventListener('resize', update);
  window.visualViewport!.addEventListener('scroll', update);
}
```

Import this file once in `app/(app)/layout.tsx` (or a client component within it) so it runs on app load.

## The 5-minute test

Before shipping ANY form change to production, open the page on a real phone, tap the input, confirm:
1. The input scrolls into view (not hidden behind keyboard)
2. The submit button is visible (not hidden behind keyboard)
3. Dismissing the keyboard (tap outside) restores the original layout
4. No horizontal scroll appears
5. No janky "jump" when the keyboard opens/closes

If any of those fail, the keyboard-aware pattern isn't set up right.

## Priority ranking for phone UI work

High-value, fix first:
1. **Keyboard-aware check-in form** — the most-used form
2. **`100vh` → `100svh` sweep** across all full-height containers
3. **Safe-area insets** in `app/globals.css`
4. **Circle inputs** (create / join / mission / note)

Medium:
5. Haptic feedback on key interactions
6. Better loading skeletons
7. Visualizer fullscreen tested on phone

Low (post-launch):
8. Native-app-style gestures (swipe between tabs, pull-to-refresh patterns)
9. Pinch-zoom on the compass/chart surfaces

## What "shipping phone UI" looks like as a PR

Not one giant refactor. A series of small, verifiable PRs:

- `feature/phone-safe-area-insets` — one CSS change + container class
- `feature/keyboard-aware-inputs` — hook + global CSS var + apply to CheckInForm
- `feature/100svh-sweep` — find/replace `100vh` → `100svh` across codebase
- `feature/haptic-feedback-core-actions` — small JS wrapper + 4-5 call sites
- `feature/loading-skeletons-check-in` — skeleton while check-in history loads

Each is ~1-2 hours. Each testable in isolation on a phone. Each merges independently.

---

## Summary

Next steps: focus on merging the backlog → making Supabase safe → making audibility real (piano wiring) → bringing back Life Dynamics → curated journeys → iOS via Capacitor.

Phone UI: the keyboard problem is solvable with `100svh` + `visualViewport` + a keyboard-aware hook. Ship it as one small PR that covers the highest-impact forms first.

Two axes, one product, one direction — every decision judged against "does this help someone know themselves a little better today."

---

*Owned by: Martin + Vikash*  
*Written: 2026-04-24 (overnight)*  
*Next update: after Wave 1 is complete*
