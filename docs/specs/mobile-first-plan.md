# Mobile-First Plan — Making Colourmap Work on a Phone

A strategy document written 2026-04-23 in response to Martin's question:
> "prepare the whole app to work with phone design. think how it would work. reduce what is unnecessary so it works. maybe take off the boxes if u think it frees space for what is inside them etc... write down a deep plan"

Colourmap is the rare app where a phone is the primary device — users check in while walking, listen to sounds with earbuds, read poetry and write letters on the go. The current build is desktop-shaped: wide grids, hoverable affordances, tightly-packed controls. This plan is how we move it.

## 1. The real constraint: 375 × 812

The smallest modern-iPhone portrait viewport is 375×812 CSS pixels (iPhone SE through 12 mini). Every page has to be usable there without horizontal scroll, without pinching, without accidental taps. Anything that doesn't fit here doesn't exist.

Vertical room is precious. A minimum 56px bottom safe-area inset for iOS home-indicator plus a ~44px top status bar leaves ~712px of actual content space. Minus whatever we use for navigation, tabs, or headers.

Budget:
- **Header**: 44–56px max
- **Bottom tab bar (if we have one)**: 56px + safe-area inset
- **Usable content area**: ~600px vertical
- **Usable content width**: 343px (375 minus 16×2 side padding)

Every feature gets this much room or less. If it needs more, we cut or redesign.

## 2. What to KEEP, what to CUT, what to RE-SHAPE

Starting from the current app and thinking about each surface:

### Calming Sounds (BinauralTuner.tsx, ~3700 lines)

**Keep:**
- Simple mode one-tap genres (works great on mobile already)
- Play/pause button (make it bigger, center-docked)
- Volume slider
- Binaural toggle + slider
- Base tone toggle + slider

**Cut or defer:**
- Per-layer numeric readouts — the user doesn't care about `73%`, they care about "a little louder"
- Dense 5-column "real/nature/tones/texture/ambient" grid — collapses to horizontal scroll or bottom-sheet
- Small caret dropdowns (e.g. "▾ genres") — replace with a sticky "more" chevron that expands in place
- The side-by-side reverb-dots + volume-slider layout — stack these
- The cruise-speed + recording-indicator density in Magic Maker — split onto stacked cards

**Re-shape:**
- Harmonics / Sacred Frequencies row — currently 6+3 buttons wide; on phone, show 4 at a time with horizontal scroll-snap
- Layers section — instead of a 5-column grid, use a vertical list with group-color dots left of each layer name
- Wave visualization — bigger, full width, edge-to-edge

### The "do we need boxes" question

Martin's instinct: maybe remove boxes to free space.

The right answer: **lose the borders, keep the visual grouping.** The boxes (card borders + rounded corners + background tint) are currently doing two jobs at once:
1. *Separating concerns* (this is feeling, this is doing, this is music)
2. *Container aesthetic* (it looks like a page of paper with panels)

On a phone, #1 matters (users need mental parsing). #2 is cost (padding + border = 20+ wasted px per card). 

What to do:
- **Remove visible card borders on mobile.** Lose the `border-border` / `rounded-[22px]` / shadow.
- **Keep the padding where content needs to breathe** — not because the box demands it, but because paragraphs below headings need air.
- **Use color/typography/sparse dividers** for grouping instead of enclosure. A 1px hairline separator does the same grouping work as a 22px-radius border box for ~5% of the space.

Desktop keeps the panelled look. Mobile goes "newspaper column" — headings stack vertically, hairlines separate sections, content fills edge-to-edge.

Implementation pattern:
```tsx
// Mobile: no box, just content
// Desktop: card with border + padding
<div className="md:rounded-[22px] md:border md:border-border md:bg-card md:p-4">
  ...
</div>
```

### Day page (current cockpit)

**Keep:**
- The 3-tab feeling/doing/sharing switcher (native mental model)
- The check-in form (core loop)

**Cut:**
- The FrequencyBox on the Day page by default — it takes premium vertical space. Move to Sounds tab, or behind a "bring to day" toggle.
- Agenda + DailyObjectives double-column layout — stack vertically, always.

**Re-shape:**
- Make the feeling/doing tabs a sticky top bar so the user doesn't lose them while scrolling content
- The FACING row (Fear/Avoidance/Confusion/Intention/Need/Gratitude) currently 6 across — scroll-snap horizontal instead, with visible active+neighbors

### Circles

**Keep:**
- The concept. It's load-bearing.
- Join/leave flow

**Re-shape:**
- Intro copy needs to **explicitly say "coworking with other people"** (Martin's ask tonight). Current copy is abstract.
- Swim-lane missions need mobile-friendly layout — either horizontal scroll per circle, or a summary view with a "see full board" drilldown.

### Notebook

**Keep:**
- List + entry views
- Writing interface

**Cut:**
- Music-panel in notebook (if still present) — redundant with Sounds tab

### Navigation

Currently the nav is V1-stripped to: Day (Check in + Sounds), Circles, Notebook. On mobile:

**Option A — Bottom tab bar.** iOS-native feel. 3 tabs, 56px bar. Martin's user is on a phone with earbuds; bottom reach is easier than top.

**Option B — Hamburger.** Space-efficient but adds a tap for every navigation action. Meditation-app users won't love it.

**Recommendation:** Bottom tab bar with 3 icons + labels. The most thumb-friendly, most-expected pattern on phones.

### Tap targets

Minimum 44×44 per Apple HIG, 48×48 per Material. Currently many controls in BinauralTuner.tsx are 8px × 8px dots — uncatchable on fingers. Every interactive element needs an invisible hit-area expansion.

Pattern:
```tsx
<button
  className="relative p-3"  // visual p-1, hit-area p-3
  style={{ ... }}
>
  <span className="block h-3 w-3 rounded-full" style={{ background: ... }} />
</button>
```

### Typography

Mobile reading distance (~10 inches) vs desktop (~20 inches) means:
- Body text can drop from 16→14px but not lower
- Headings can drop ~2px
- **Letter-spacing needs reducing on mobile.** Current uppercase labels at `tracking-[0.18em]` look spacey and slow on a phone. Try `tracking-[0.08em]`.

### The "everything is a button" problem

Many BinauralTuner sections are rendered with `<div onClick>` instead of `<button>`. On desktop that's bad accessibility; on mobile it breaks touch feedback (no press highlight). Sweep: every clickable region becomes a proper `<button>` with `aria-pressed` where stateful.

## 3. The real build order

Doing "the whole app mobile" in one pass is a 3-5 day project (tracked as RM-D1). In the night I have left, here's a prioritized cut:

### Phase A — this session (what I can realistically do)
1. **This spec** (you're reading it)
2. **Circles coworking copy** — small, explicit user ask, 20 minutes
3. **Global mobile-first CSS baseline** — one PR that adds:
   - `@media (max-width: 768px)` overrides to strip card borders
   - Bigger body text on mobile where it's currently tiny (10-11px → 13-14px)
   - Tighter letter-spacing for uppercase labels on mobile
   - Tap-target minimum enforcement

### Phase B — next session (longer)
4. **Calming Sounds mobile pass** — the biggest, most complex screen. 4-6 hours.
5. **Day page mobile pass** — tabs sticky, cockpit stacked, FACING scroll-snap. 2-3 hours.
6. **Navigation bottom bar** — extract from top nav, wire icons. 2 hours.

### Phase C — post-launch polish
7. **Circles board mobile layout** — swim lanes rethought for phone
8. **Magic Maker mobile** — scrolling loop timeline, thumb-sized buttons
9. **Deep haptics** — `navigator.vibrate` on key interactions
10. **iOS-specific audio gotchas** — AudioContext-on-gesture fix, background audio, interruption handling (covered in app-store-strategy.md)

## 4. Principles underlying the whole pass

A few design rules to apply consistently:

### 4a. Content-first, chrome-second
Every pixel the UI chrome steals (borders, padding, titles, affordances) is a pixel the actual content loses. When in doubt, remove chrome.

### 4b. One vertical scroll only
Never nested scroll regions on mobile. The user should be able to thumb-flick from top of the screen to bottom without hitting a "this region scrolls inside the page scrolls inside the nav" trap.

### 4c. Thumbs go bottom
The most-tapped surface — play/pause, save, submit — should be in the bottom half of the screen, ideally bottom 1/3. Reaching with the thumb is the primary motion.

### 4d. Prefer scroll-snap to cramming
When too many items for a single row, use horizontal scroll-snap. Users swipe — far better than shrinking 6 items to 40px each.

### 4e. Hover is not a thing
Every affordance must be discoverable without hovering. No tooltips that appear on hover. No color shifts that indicate interactivity only on mouseover. Everything must "look clickable" when idle.

### 4f. Loading and empty states matter more
On a phone, users quit faster when they see nothing happening. Every surface needs a clear "loading…" state (skeleton) and a welcoming empty state (first-time experience).

## 5. What I'll tackle right now (tonight's scope)

Given the time left and the number of active branches already pending review, my concrete plan:

1. ✅ **Write this spec** (branch: `docs/mobile-first-plan`) — done
2. **Circles coworking copy** (branch: `feature/circles-coworking-copy`) — tiny PR, 20 min, high-value
3. **Mobile-first CSS baseline** (branch: `feature/mobile-first-baseline`) — a single globals.css addition + some component sweeps for the top three offenders:
   - Remove hard card borders on mobile breakpoint
   - Bump tiny labels (10-11px → 13-14px)
   - Tighten uppercase tracking
   - 44px minimum tap-target on the common button patterns
4. **Summary back to Martin** — what's done, what's in the queue, what needs his call

Remaining phases (Calming Sounds deep pass, Day page pass, bottom nav) are explicitly held for a next session when we can verify in a real phone viewport. Doing them without visual verification is how we'd ship something looking wrong.

## 6. What to never do on mobile

- Don't rely on hover states for discoverability
- Don't nest scrolling regions
- Don't crunch 6 items into a 300px row (use scroll-snap)
- Don't auto-play audio on page load (iOS requires user gesture; also a terrible UX anyway)
- Don't use `fixed` positioned elements without accounting for iOS safe-area insets
- Don't use 10px text anywhere users are supposed to read and tap
- Don't assume the virtual keyboard size is predictable — use `100svh` not `100vh` for full-height layouts
- Don't ship tap-debounce shorter than ~250ms — finger double-taps are common

## 7. Measurement after launch

Once the mobile-first pass has landed and real users are on phones, track:
- Touch error rate (taps that miss their intended target — Google Analytics touch heat-mapping or similar)
- Time to first meaningful interaction (how long between app-open and first tap)
- Drop-off point on the signup flow (which step loses the most users)

These numbers tell us whether the mobile experience is actually working or whether we're shipping desktop-in-phone-clothing.

## 8. The one-line mobile test

If a user on the subway, one-handed, in a dim train car, opens Colourmap on their iPhone 12 mini, they should be able to complete a check-in, pick a mood, and start Calming Sounds within 60 seconds without a single misplaced tap.

Every mobile decision tests against that scenario.

---

*Owned by: Martin*  
*Updated: 2026-04-23 (initial)*  
*Next update: after the first mobile-first CSS baseline ships*
