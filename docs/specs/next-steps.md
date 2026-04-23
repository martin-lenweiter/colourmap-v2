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
