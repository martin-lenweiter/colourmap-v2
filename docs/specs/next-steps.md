# Next Steps — V1 Launch & Beyond

## V1 Launch (End of Week)

### Must-do
- [ ] Mobile polish — test all screens on phone viewport
- [ ] Landing page — public page at `/` with what/why/signup
- [ ] iOS Safari audio fix — AudioContext needs user gesture
- [ ] Bug sweep — test full flow: signup → checkin → sounds → circles → notebook

### Nice-to-have for launch
- [ ] Wave design picker (5 visual options for the sinusoidal)
- [ ] More real sound recordings (rain/thunder from non-Wikimedia sources)

## Sound Engine Reflections

### What works well
- Simple mode (one-tap genre) is the right entry point
- Layer system is powerful for advanced users
- Sacred frequencies + harmonics add depth
- Generative melodies create unique experiences
- Real recordings (birds, rain, forest) sound infinitely better than synth

### What needs improvement
- Synth sounds still sound digital — real recordings are the priority
- Music Box / Boat Sounds / Soft Lasers need tuning — some are too digital
- Need more variety in rain and thunder (only 2 recordings)
- Buddhist prayer / sacred chants recordings not found on free sources
- Real instrument samples (piano, violin, flute) would transform melodies
- Voice/poetry system uses browser speech which sounds robotic — AI TTS would be better

### Future sound features
- Real instrument sample integration (when CC0 sources found)
- AI-generated soundscapes from emotional state
- Sound sharing between users ("listen to my mix")
- Sound × check-in correlation tracking
- Guided sound journeys (15-min narrative experiences)
- Breathing exercises synced to binaural beat

## Check-in Reflections

### What works
- Feeling box (emotions + Hawkins + body/focus/clarity + challenge depth)
- Doing box (objectives + todos)
- Challenge "go deeper" questions

### Future
- AI mirror reflection after check-in
- Emotional vocabulary builder
- Body map (tap where tension is)
- Morning intention / evening reflection prompts
- **Challenge of the day — persistent, visible on the Feeling/Doing first page.** A single line the user writes that stays pinned across the session so the current struggle or intention doesn't get lost when the UI shifts. Example from Martin: "I struggle to disconnect from colourmap and do other stuff cause I wanna move here." That kind of honest, personal sentence is exactly what should stay visible — not hidden in a notebook, not expiring after a check-in, but front-and-center as today's anchor. Could be rendered as a small header band or a dedicated card above the tabs. Open questions: does it reset at midnight? can the user keep the same one for days? is it linked to a mission or separate?

## Circles Reflections

### What works
- Create/join with code
- Chapter + personal meanings
- Mission swim lanes
- Pulse dots from check-in

### Needs
- Supabase sync (currently localStorage only — single device)
- Real-time updates between devices
- Session start/stop with shared log
- AI weekly retrospective

## Product Identity

### Core insight
The app understands you through: emotional state + body state + challenges + flows + sound preferences + social dynamics. Nobody else has this combination.

### The soul
Not a mood tracker. Not a project manager. Not a meditation app. A living self-portrait you paint every day, sometimes together.

### Differentiators
- Simple mode: one tap and it sounds beautiful
- Full studio: deep enough for sound designers
- Circles: emotional awareness in groups
- Future: collective consciousness (anonymous trails, resonance rooms)

## Technical Debt
- BinauralTuner.tsx is ~3600 lines — should split into sub-components
- Some layers still have synthesized sounds that could be real recordings
- Unused state variables and refs need cleanup
- Test coverage for sound components is zero

## Roadmap — 2026-04-23 Wishlist

Martin dumped a comprehensive wishlist on 2026-04-23 covering polish, features, and future specs. Captured here verbatim-in-spirit, organized easy→complex. Item numbers are stable references for future PRs (`feature/<slug>-RM-12`, etc.).

Priority order Martin set:
1. **Check-in + notebook + whole-app basics** — FIRST
2. **Music / sound studio** — SECOND (most of the volume)
3. **Sharing & multiplayer** — SPEC ONLY this stage, no code

### Phase 1 — Check-in / Notebook / Whole-app

**Tier 1 (small, ~30–90 min each)**
- RM-1. Night-mode color variants: deep brown, deep blue, deep purple (theme tokens)
- RM-2. Confusion-mapping field in check-in (*"on one hand the movie is great, on the other I'm sleeping late"*) — two-column text inputs capturing ambivalent states

**Tier 2 (modest, ~1 day each)**
- RM-3. Customization / `réglages` page — feelings-first vs doing-first, show/hide cards, personalize the cockpit
- RM-4. Click-for-explanations tooltip system — universal component, used across whole app (first use: Layer Softness explaining reverb). Foundational — other features reuse it.

**Deferred to later specs**
- Nervous-system / dopamine education content (needs research + writing, own module)
- Music theory with graphical descriptions (own learning module)
- Ear training / perfect pitch exercises (own module — possibly separate program)

### Phase 2 — Music / Sound Studio

**Tier A — Polish pass (small, group-related into shared PRs)**
- RM-A1. "Layer Reverb" → "Layer Softness" in UI. Keep `reverb` as internal name. Click the label to open the tooltip explainer (what reverb is, how it shapes sound).
- RM-A2. Remove *"find your frequency"* sentence
- RM-A3. Rename "Jungle" → "Lazer Jungle"
- RM-A4. Reverb bar long-form matching volume bar style (same shape, same style)
- RM-A5. Thicker sliders below layers
- RM-A6. Open Studio entry pill in beige style matching missions/objectives pills
- RM-A7. More accurate sliding (finer step values)
- RM-A8. Each square in square-style sliders must be meaningful (UX audit + value mapping)
- RM-A9. Layer Softness more visible (opacity/weight/size)
- RM-A10. Harmonics/frequencies section titles more visible
- RM-A11. Bring back the wave visualization responding to every control change (was working, got lost in refactors) — each click impacts wave shape smoothly
- RM-A12. Saved-shape markers: replace the single dot with a picker of 5 shapes — star, heart, losange (diamond), triangle, square — for both saved sounds and layers. Lets users visually mark favorites and categorize.
- RM-A13. Five sinusoidal wave designs + a design box to vary them

**Tier B — Modest features (~3–6 hrs each)**
- RM-B1. Shamanic drums / tambours background layer (hypnotic relaxing tools family)
- RM-B2. Space whales sound layer
- RM-B3. Lo-fi hip-hop beat layer
- RM-B4. Long notes option (hold-and-sustain mode)
- RM-B5. Detune / wawa playful effects with a dedicated slider
- RM-B6. Whole-soundscape detune effect (applies globally, not per-layer)
- RM-B7. Smart transition-hide trick at the end of rain-like recordings — use a two-layer crossfade so the loop point isn't noticeable. End-of-rain should feel like a calm followed by resumption, not a hard cut.
- RM-B8. Record-your-voice-into-loop with reverb / small-hall option
- RM-B9. Simple-mode favourite-frequencies shortcut (quick-access rail of saved frequencies)
- RM-B10. Reorganize saved frequencies by style or core frequency
- RM-B11. Redo default frequencies — curated list of meaningful starting points with labels explaining what each represents
- RM-B12. Funny-noises instrument family: reggae sharks, talking banana, funky farts, and similar playful noises

**Tier C — Bigger features (~1 day each)**
- RM-C1. Magic Maker: the single cruise-mode note becomes an editable background texture layer; users toggle it, tune it, then add other things on top
- RM-C2. Lo-fi studio: save a loop, then start a second loop — enables solo A-B-A-B song composition (foundation for future multiplayer turn-based writing)
- RM-C3. Melodies spanning multiple octaves (generator crosses octaves intelligently, not locked to one)
- RM-C4. Binaural "engine breathing" mode — organic micro-variations on beat speed and harmony, like a ship engine on ocean. Small continual augment/reduce, not dry sudden change. Toggle in binaural controls.
- RM-C5. "Deeper version" pattern — cockpit stays simple (on/off + speed), advanced parameters on a second page

**Tier D — Major UX / structural (~2–5 days each)**
- RM-D1. Mobile-first responsive pass on the whole sound studio. Rotary knobs on phones need rethinking. Calm Sounds and Magic Maker built desktop-first.
- RM-D2. Harmonics: bigger boxes, better spacing
- RM-D3. Layer visual redesign (larger on-screen footprint, clearer grouping)
- RM-D4. **Soft / intense mega-slider** — one control that remixes the whole app smartly. Needs its own spec: what does "softer" mean to every module? How does the slider mutate layer volumes, reverb depth, harmonic density, melody complexity? Architectural — build spec first, then implement.

**Tier E — Ambitious / research-spike first (~weeks)**
- RM-E1. Sacred-geometry visualizer — golden ratio math, beautiful vortexes, helixes, symmetries as live visuals responding to sound
- RM-E2. Vortex effect for whole soundscape — transforms entire mix through a tunneling / warping effect
- RM-E3. Cyberpunk city skyline visual with spaceships taking off / moving, but paired with relaxing sound. Ambitious visual + soundscape fusion.
- RM-E4. Cinematographic emotional scoring tools — help users compose relaxing-but-narrative music. Needs a design spike — what are the secrets of instrumental cinematographic scoring, and which can translate to an accessible tool?
- RM-E5. Real musical-licks integration — real composed melodic phrases the system can select from and weave into generative melody output. Source question (CC-licensed MIDI? AI-generated? hand-composed library?) must be resolved before implementation.
- RM-E6. "Crazy mode" for calm sounds — auto-improviser that tries wild mixes and keeps evolving. Opt-in party mode.

### Phase 3 — Sharing & multiplayer (SPEC ONLY this stage)

Write full specs; no code this cycle. All of these depend on Supabase + RLS being live + a working invite flow.

- RM-S1. Musical collaboration — A-B-A-B turn-based song building with friends. One user writes the A loop, friend adds B, user extends with C, etc. Minigame wrapper around the lo-fi studio.
- RM-S2. Letters & poems exchange — medieval / romantic / epic letter format between users. Generates reasons for long-form correspondence and social presence in-app.
- RM-S3. Social minigames — quick IQ puzzles, logic challenges, sendable to friends with turn-based replies.
- RM-S4. Games library — chess (vs friend or bot), jeux de dames, card games, turn-based, no time constraints. Each is a minor coding effort, collectively a feature family.
- RM-S5. Invite & social graph — why users invite others, what unlocks when friends join (shared mixes? collaborative melodies? see each other's Circle moods?). Business/product design required.

### Phase 4 — Learning modules (SPEC ONLY)

- RM-L1. Nervous-system / dopamine / chemistry-of-motivation content. Help users understand their own system — why we stay awake, why we act against reason, what dopamine loops look like in their day.
- RM-L2. Music theory with graphical explanations — what octaves look like, thirds/fifths, wave geometry. Learn-by-seeing.
- RM-L3. Ear training / perfect pitch — may warrant its own app-in-app module. Open question: inside Colourmap or separate program?

### Phase 5 — Games (SPEC ONLY, adjacent family)

- RM-G1. Chess / dames / cards — playable solo against bot or async with friends.
- RM-G2. IQ puzzles, stupid-clever-beautiful mini-games sendable to other players.

### Audio source library (commercial-safe + distributable)

The app ships to a web browser, which means every sample is distributed to users. Licensing must allow commercial use AND redistribution. Safe options identified 2026-04-23:

**Piano**
- [Salamander Grand Piano V3](https://archive.org/details/SalamanderGrandPianoV3) — Yamaha C5, CC-BY 3.0, OGG/MP3 available.

**Orchestra / multi-instrument**
- [VSCO 2 Community Edition](https://vis.versilstudios.com/vsco-community.html) — CC0, ~50 instruments including strings, brass, woodwinds, percussion. Pick per-instrument to keep app bundle size reasonable.
- [Sonatina Symphonic Orchestra](https://sso.mattiaswestlund.net/) — CC-BY 3.0, full orchestral library by Mattias Westlund.
- [FluidR3_GM SoundFont](https://member.keymusician.com/Member/FluidR3_GM/index.html) — MIT license, General MIDI instrument set as `.sf2`. Usable via JS soundfont libraries.

**Ambient / nature / sound effects**
- [Freesound](https://freesound.org) — mixed licenses; **filter by CC0 or CC-BY only** before downloading. Source for reggae sharks, talking banana, funky farts, space whales, shamanic drums, etc.
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Audio_files) — CC0 / CC-BY, already used in the repo (7 recordings cited in earlier commits).

**Do NOT use**
- Spitfire LABS — beautiful samples, but EULA forbids redistribution. OK for local DAW, not for a web app that serves samples to browsers.
- BBC Sound Effects Library — RemArc license allows personal/educational only, not commercial distribution.
- Philharmonia Orchestra samples — check current terms before committing; their permissive-looking license has had redistribution nuances in the past. Safer options exist.
- University of Iowa samples — originally academic; commercial terms are ambiguous. Contact them or skip.
- Any GPL-licensed audio library — GPL can extend to derivative works; a commercial web app built on GPL samples is a legal gray area.

**Implementation pattern**
- Drop files in `public/sounds/<instrument>/` with a JSON index
- Load via `Tone.Sampler` in the Calming Sounds layer stack and Magic Maker melody generator
- Per-instrument ~10–50 MB compressed — aim for ~30 notes across 3 octaves per instrument for balance of size vs musicality

### Decisions pending from Martin

Flag before starting each: answer unblocks build.

- RM-DEC-1. "Softer / more intense" mega-slider — what does "softer" change in every module? (volume, reverb, harmonics, tempo, complexity?). Needs a 1-pager spec.
- RM-DEC-2. Customization page — toggle in Settings, or first-run setup screen?
- RM-DEC-3. Challenge-of-the-day persistence — midnight reset or persist until user edits? (Martin's instinct: persist. To confirm.)
- RM-DEC-4. Confusion-mapping storage — localStorage first (ships fast, protected-path-free), or DB from day one (needs Drizzle migration, Lane B)?
- RM-DEC-5. Real musical licks — source question (CC MIDI library? AI? hand-composed?). Affects Tier E-5 entirely.
- RM-DEC-6. Ear training module — inside Colourmap or separate program?

### Suggested sequencing

1. **Merge PR #26** (currently open) — unblock everything downstream
2. **Supabase + Vercel minimum** (~10 focused hours) — real backend before more features
3. **Phase 1 basics** — start shipping small PRs immediately after
4. **Phase 2 Tier A+B music polish** — heavy PR cadence, Martin reviews daily
5. **Phase 2 Tier C features** — builds on A+B
6. **Phase 2 Tier D major UX** — mobile pass, mega-slider, layer redesign
7. **Phase 3/4/5 specs** — written during other work, implemented after user base forms
8. **Phase 2 Tier E** — research spikes before committing to full builds

