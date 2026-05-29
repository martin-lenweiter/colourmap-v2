# Sound Studio Vision — Smooth, Easy, Fun, Great

A reflection written 2026-04-23 in response to Martin's question:
> "give me deep reflexion on how u would take all the relaxing noise binaural maker. and make this whole program better smoother easier to use. fun and great"

This is strategy, not a feature list. The feature list lives in `docs/specs/next-steps.md`. This doc is the *why* and the *how* behind everything that goes in there.

## 1. What the sound studio is actually for

Before anything else: what job does someone "hire" Colourmap's sound studio to do?

Not production. There are far better DAWs (Ableton, Logic, FL Studio) if someone wants to make serious music.

Not background noise. There are simpler apps (Noisli, A Soft Murmur, myNoise.net) if someone just wants rain.

The real job is **emotional self-regulation through active mixing**. The user arrives in some state — anxious, flat, buzzing, disconnected — and uses sound-shaping as a way to move their inner state somewhere better. The act of *choosing, layering, adjusting* is the therapy, not just the resulting audio.

This reframes every design decision:
- It's not a "sound player." It's a "feeling shaper."
- The control surface matters as much as the audio engine.
- Beautiful moments during adjustment matter more than the final "preset."
- Friction in the wrong place breaks the spell. Friction in the right place *creates* the spell.

## 2. The three felt qualities the app must hit

Users don't talk in interface terms. They talk in felt qualities. A great sound studio needs all three:

### 2a. **Calm** — the app must never feel like software
Every click, hover, drag must feel slower and more deliberate than a typical SaaS interface. Animations ~300ms instead of 150. Transitions between sound states fade, not jump. When a layer turns off, it recedes — it doesn't vanish.

Concretely:
- Replace all hard on/off transitions with crossfades (partially done in existing commits)
- Slider movements should feel like wet clay, not a digital switch
- Playback controls should respond with a visible breath (small scale pulse) on click, not flash
- No loading spinners during sample load — show the layer appearing translucent, then becoming solid

### 2b. **Trust** — the user must never fear breaking something
A meditation-adjacent app cannot have error states, "are you sure?" dialogs, or unexpected jumps. Every action must be reversible, every state must be recoverable, every experiment must be safe.

Concretely:
- Undo should cover ~20 steps at minimum — any slider adjustment, any layer toggle, any preset recall
- No destructive saves. Saving a mix never overwrites by default — it creates a new version. A user who "loses" their mix because they didn't save is a user who learned not to trust the app.
- Every volume slider has a soft ceiling at ~85% before requiring deliberate effort to push higher. Hearing safety as a first-class concern.
- Autosave every ~5 seconds to a `draft` slot that survives reload. The only way to lose work is explicit action.

### 2c. **Surprise** — the app must reward exploration
The opposite of calm isn't excitement. The opposite of trust isn't danger. The opposite of surprise is *boredom.* A sound studio that only produces predictable results becomes predictable. Users stop playing.

Concretely:
- The "cruise speed" control already hints at this — randomized motion within a musical framework is magic
- Extend that: every generative system should have a "seed variance" so repeating the same preset twice sounds subtly different
- Hide easter eggs behind long-press or double-tap on key surfaces
- The "Crazy Mode" idea from the wishlist (RM-E6) is the extreme version of this — let it write itself, see what happens
- Reward discovery: unlock an extra layer after the user has kept a session running >20 minutes. Feels earned, not gated.

## 3. Progressive disclosure as the dominant organizing principle

The current studio already does this (Simple ↔ Full toggle). But it can go further. **Every level should feel complete at that level.** A user in Simple mode should never think "I'm missing something." A user in Full mode should never think "there's more I can't see."

The ladder I'd build:

- **Level 0 — Ambient autoplay.** User opens the app, something starts. They didn't choose anything. It was chosen for them based on time of day, weather (if we have the data), last check-in mood. This level is for the user who wants "just make me feel better, don't ask me to decide." The bar for presence is very low.
- **Level 1 — Simple mode (current).** One tap picks a genre. A preset loads. Maybe 2-3 knobs visible.
- **Level 2 — Layer mode (current Full).** All layers, volumes, reverb, binaural. This is where the user shapes.
- **Level 3 — Deep mode (new).** Per-layer filter cutoff, tremolo, detune, harmonics shaping. Access via a "More" chevron, stays tucked away until summoned.
- **Level 4 — Instrument mode (Magic Maker).** Scales, melodies, loop recording. Creative composition, not just adjustment.
- **Level 5 — Studio mode (future).** Multi-track, save/share/collab.

Each level has its own vocabulary and its own visual density. The user drops down a level by tapping a "deeper" button, up a level by tapping "simpler." Position in the ladder persists per user.

## 4. The "one control to rule them all" — the soft/intense mega-slider

Martin's RM-D4 idea. This is the most exciting and most dangerous feature on the list.

**Why exciting:** a single control that mutates the whole mix is the closest analogue to how feelings actually shift. We don't feel "slightly less anxious with a touch more aliveness." We feel "softer" or "more intense" as a gestalt. Matching that inner phenomenology to a single outward control is profound.

**Why dangerous:** it's easy to build wrong. If "softer" means "turn all volumes down 20%," it's a fader, not a feature. What makes it a feature is that "softer" changes 15 different parameters *in concert* — volumes, reverb depth, high-frequency rolloff, tremolo rate, melodic density, chord voicings, sample brightness.

Building it well requires per-module contribution curves:
- Base tone: vol -15%, filter cutoff -30%, warmth +20% at softness end
- Reverb layer: +25% at softness end
- Melody: tempo -15%, note-on probability -30% at softness end
- Percussion: fades out entirely below 30% softness
- Nature layers: relative mix unchanged (they're baseline calm)

Each module defines how *it* interprets the slider. The global slider just publishes a position; modules subscribe.

**Build the architecture first, then the slider.** A janky mega-slider is worse than no mega-slider.

## 5. Mobile as the primary target

Martin's stated goal: ship to phones.

The existing studio was built on desktop. Every rotary knob, every 3-column layout, every hover interaction — all of it needs to work on a 375px viewport with fingers instead of a cursor. Not as a responsive afterthought, but as the primary design mode.

Specific mobile concerns:
- **Knobs → long horizontal sliders.** Rotaries don't work with fingers; they work with mice. Tesla tried phone-rotaries; they failed.
- **Multi-touch is real.** Two-finger hold + slide should do something delightful (e.g. modulate two params at once).
- **iOS Safari AudioContext gotcha.** Already noted in next-steps. Audio cannot start without a user gesture. Every session needs an opening "tap to begin" screen.
- **Battery and heat.** Complex Web Audio graphs can spike CPU and drain battery. Budget: no more than 6 active layers + 3 harmonic oscillators + 1 melody generator running at once. Gracefully degrade beyond that.
- **Screen time as a feature.** After 20 min, dim the screen by 40% and hide all UI except play/pause. "Breathing mode" — the app gets out of the way so the user can rest.

## 6. The failure modes to prevent

A sound studio can fail in predictable ways. Naming them helps avoid them:

- **The Encyclopedia trap** — every control has 15 settings. User spends 20 minutes configuring and forgets what feeling they came in for. Fix: strict progressive disclosure, defaults chosen for 90% good-enough.
- **The Metronome trap** — loops feel tight and repeating. Kills the dreamy quality. Fix: natural variation on every repeat, two-layer crossfades at loop points (the "smart transition hide" idea, RM-B7).
- **The Robot trap** — everything sounds synthesized. Humans hear "digital" immediately. Fix: real samples over synth wherever possible. Already partially done (piano/flute/harp/violin samples landed today).
- **The Museum trap** — beautiful presets the user just consumes, never adjusts. The tool becomes a jukebox. Fix: reward mixing. Badges for "you customized 5 presets," easter eggs only visible if you modify.
- **The Loneliness trap** — nobody ever hears what the user made. Creative work in a vacuum dies. Fix: the sharing/multiplayer features (Phase 3 in roadmap). But also: in-app Circles can hear each other's active mix as a passive presence.
- **The Amnesia trap** — user makes something perfect, can't find it three days later. Fix: automatic session history, "mixes you loved" list, the new shape-marker system (RM-A12) for tagging favorites.

## 7. Sound design of the UI itself

The UI should *sound* like the app feels. Small audio feedback on key interactions:
- Pressing a layer on: warm fade-in of the actual layer (already happening)
- Opening the full studio: a single soft chime
- Saving a mix: a descending 5th (feels resolved)
- Discovering an unlock: a rising major 6th with slight reverb (feels expansive)
- Error state: never a beep. Maybe a low sub-bass pulse.

This is incredibly underdone in most apps. Doing it well would make Colourmap feel unmistakably itself.

## 8. What to build first to feel the new direction

If we had one week to move the app toward this vision, the highest-leverage work:

1. **Mobile-first pass** (RM-D1) — nothing else matters if the phone experience is broken. 3-5 days.
2. **Smart loop transitions** (RM-B7) — removes the #1 "this feels like software" friction. 1 day.
3. **Tooltip system + explanations everywhere** (RM-4, started today with PR B) — trust and reassurance scales with information available. 2-3 days to populate.
4. **Soft/intense mega-slider architecture spike** (RM-D4) — before building the slider, build the subscription pattern. 1 day spike, 3 days build.
5. **Autosave + undo** (new — not yet in roadmap) — trust. 1-2 days.

The rest of the roadmap (drums, instruments, visuals, multiplayer) adds surface area. The above five make the surface area *worth* having.

## 8b. Long Soft Loop Engine

The best Chill Machine evolution is a simple surface with a deeper slow-loop engine underneath.

The user should still pick plain moods like Relax, Focus, Sleep, Still, and Ground. Under each mood, the engine can run two or three closely related 16-second generated beds. They should not all begin at the same instant. Track 1 starts immediately, track 2 starts about 7 seconds later, and track 3 starts about 14 seconds later. That 7-second decalage means the combined sound keeps folding over itself without the brain catching the loop point.

The family should feel connected, not like three unrelated sounds. One layer can be lighter and airy, one warmer and mid-body, one deeper and grounding. The difference is depth, brightness, and motion, not melody. Strong delay and generous reverb are allowed, but the result must remain super soft and non-binaural by default.

This should sit on top of the simple system, not replace it:
- Simple mode: one tap chooses the mood and starts the 2-3 layer bed.
- Full mode: the user can open the layers and adjust each bed manually.
- Engine rule: avoid more than three long generated beds at once on phone unless performance is verified.
- Feel rule: no sudden starts, no clicks, no obvious loop seams, no beat pressure.
- Sleep/focus rule: base tone and binaural beat stay off unless the user explicitly turns them back on.

## 9. What to never build

Naming what's out of scope protects focus:

- Anything that makes sound automatically start. Consent is sacred.
- Dark patterns to drive engagement. This is explicitly an anti-addiction app — the moment it becomes "sticky" in the social-media sense, we've failed.
- Analytics dashboards for users ("you listened 47 minutes this week"). Quantifying meditation ruins it.
- Gamification with streaks or points. Again, opposite of the aim.
- Monetized sample packs. Every sample in the studio must be accessible to every user. If we want revenue, it's subscription for advanced modes or multiplayer, not pay-to-unlock-sounds.
- Ads. Never.

## 10. The one-line product identity test

If a skeptical friend asks "why would I use this instead of Spotify and a rain sounds app?", the answer should be:

> **"Because the act of mixing is itself calming — and at the end I know myself better than when I started."**

Everything in the roadmap should be tested against that line. If a feature doesn't make mixing *itself* more calming, or doesn't help the user know themselves, it probably doesn't belong.

---

*Reviewed and owned by: Martin*  
*Living document — updated when the vision shifts.*
