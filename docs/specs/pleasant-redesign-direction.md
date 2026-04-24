# Pleasant redesign — direction spec (2026-04-24)

User feedback, verbatim: "I still feel like the app looks too serious
compared to tiktok or insta where u just have videos and scrolling feel.
u enter this app and it all looks like tiny segments. tiny text. how
can we make it a pleasant experience?"

This spec captures the direction. Implementation happens in phases.

---

## Diagnosis

**What makes the app feel serious right now:**

1. Every section is a dense row of small controls (10-12px pills, 11-13px
   text). It reads as a *dashboard* — information-dense, expert-facing.
2. No visual hero. The binaural wave is a 320×100px island in a wide
   viewport. Genres are a 3-line wrapping pill grid. No single element
   claims the screen.
3. The rhythm is uniform. Section A stacks onto section B stacks onto
   section C with 12-16px gaps. Eye has nothing to grab.
4. Colors are tasteful but muted — a lot of ochre, beige, card backgrounds
   at 0.95 alpha. No saturated moments, no gradients that pull the eye.
5. Tap targets are small on mobile. Pills are 22-26px tall against a
   recommended 44px minimum for comfortable phone use.

**What TikTok / Instagram get right that we can borrow:**

- One full-bleed card per screen fold.
- The card IS the content — the controls sit inside or below.
- Generous whitespace.
- Bold, large type (18-28px body for primary copy).
- Warm gradients + soft shadows give each card presence.
- Tap-to-advance rhythm (stories), or infinite scroll with snap-points.

---

## The grammar to adopt

For each surface (check-in, sounds, circles, notebook):

1. **One hero per fold.** First screenful has exactly *one* visual focus
   — a big image / wave / check-in dial / whatever is primary.
2. **Full-bleed cards.** Each "section" = a card that fills the content
   column's full width, with 24-32px inner padding, 24-40px outer margin
   between cards.
3. **Big primary typography.** Section titles 22-26px. Body 15-17px.
   Labels 13-14px. Metadata 11-12px (only for tertiary info).
4. **Tap targets ≥ 44px** on mobile (WCAG target). Genre pills grow.
   Play button grows. Sliders grow.
5. **Color has opinions.** Each card has its own gradient background
   (warm brown / ocean blue / forest green) that reflects its content.
   No more universal beige.
6. **Motion.** Small, tasteful animation on tap / scroll / state change.
   Cards fade-in as they enter view. Pills scale briefly when tapped.
7. **Drawer everything else.** If a section has more than 3-4 controls,
   surface the primary and put the rest behind a "more" drawer.

---

## Phase plan

### Phase 1 — Typography + hero sizing (small PR, fast win)
- Bump body text baseline from 11-13px → 15-17px
- Bump pill / button labels from 10-11px → 12-14px
- Wave viz: full container width × 160px tall (was 320×100)
- Play button: 56px diameter (was 36px)
- Volume slider: wider, thicker, bigger thumb
- Vertical spacing between sections: 16px → 28-32px

### Phase 2 — Full-bleed card shell
- Add `<PleasantCard>` wrapper: 24px padding, 24px rounded corners,
  gradient background, soft shadow, 28-40px margin between cards.
- Wrap each /day section in PleasantCard.
- Each card gets a 22-26px italic serif title.
- One primary color per card (derived from section meaning):
  - Check-in → warm ochre
  - Calming Sounds → ocean blue
  - Mastery → deep purple
  - Circles → forest green
  - Notebook → brown ink
- Background gradient from that color at 0.08 → card bg at 1.0.

### Phase 3 — Drawer the extras
- Calming Sounds initial fold: hero wave + play + 4 genre pills + single
  "add layers" button. Everything else (wave style picker, beat bed,
  layer groups, breathing / tremolo / reverb sliders) behind a "fine
  tune" drawer that slides up.
- CheckInForm: emotion picker + save is the fold. Detailed sliders +
  notes behind a "reflect" drawer.
- Circles: single "start or join" button on empty state. The member
  grid + missions only appear once a circle exists.

### Phase 4 — Motion + color variance
- Tap scale on pills (0.96 on press, 1.0 release, 180ms).
- Card fade-in as they scroll into view (IntersectionObserver, 1-line
  hook).
- Each card's gradient subtly breathes when its primary source is active
  (wave playing, check-in being edited, circle open).
- Accent glyphs appear on active state (small animated wave icon by the
  sounds card title when playing).

### Phase 5 — Scroll-forward rhythm
- Snap-point scrolling between cards on mobile (`scroll-snap-align:
  start`), so each scroll gesture lands squarely on the next card.
- Optional "stories mode" for first-run: full-screen card, tap left/right
  to advance through check-in → listen → explore.

---

## What to preserve

- The warm brown / ochre palette stays — don't go full saturated. Make it
  richer, not louder.
- The serif italic for headings ("Colourmap", section titles) is a real
  signature. Keep and amplify.
- The lay meaning of each feature (feel, listen, reflect, share). Don't
  rename in this pass; that's the separate jargon-pass work.
- Existing logic + audio + persistence. Pure presentation pass.

---

## Success signals

- First-time user's first screenful on `/day` has ≤ 3 interactive
  elements, each obvious at a glance.
- Default text on mobile is ≥ 15px. No critical label below 12px.
- Each section feels like a distinct "place" (different color, different
  hero), not a row in a spreadsheet.
- The Calming Sounds page at rest looks *inviting*, not *configurable*.
  Configurability is earned by tapping in.

---

## Out of scope for this spec

- Bottom-nav vs top-nav restructure (separate conversation).
- Onboarding overlay (separate ticket from UX audit).
- Jargon rename ("binaural → brain-wave tuning", etc.) — separate PR.
- Desktop-specific layout improvements — keep current 520px column for
  now; phone is the priority.
