# Groove Machine — Where to Move Next

> Martin (2026-04-26): "do a mega analysis on Groove Maker on where to
> move next for growth. and develop it. do that 5 times in a row."
> Iters 1–4 already shipped per-preset voice distinctness (drums, pad,
> bass, rhodes). This is iter 5 — the *next-five-moves* analysis.

## Where Groove is right now

After the Sunday-session work:
- 7 distinct presets (Sun-up Funk · Tech House · Tropical · Slow Roll
  · Boom Bap · Epic Electro · Lofi Rooftop), each with its own BPM,
  swing, active-track set, pattern overrides, and now its own *voice
  timbre* — kick, snare, hihat, pad, bass, rhodes shaped per preset.
- 80-bar arc (intro → verse → lift → chorus → breakdown → verse2 →
  outro → reprise) with per-bar variation pools so the same preset
  doesn't loop a flat 16-bar pattern forever.
- 100% Web Audio synthesis. Zero samples. App-Store-clean licensing.
- Single shared compressor on the master bus. Single global swing.
  Single pad voice across active tracks.

What works: presets sound sonically distinct now (audit-confirmed).
The 80-bar arc keeps things alive past the 1-minute mark. The synth
engine is portable — every preset works offline, no preload.

What's still thin: it's a *solo* music tool. There's no
collaboration, no "pin a preset to a Circle," no atmospheric layering
with Chill, no way for users to save what they made, no way to teach
the machine new patterns. The 7 presets are a first wave — beyond
them, the path narrows fast.

## Comparison to successful music apps

| App | What it does well | What we can borrow |
|-----|-------------------|---------------------|
| **Endel** | Adaptive ambient that responds to time-of-day, weather, heart rate, location. Personalized soundscape, no user input needed. | Time-of-day mode for Groove: morning = Sun-up Funk auto-suggested, evening = Slow Roll, etc. Already partially in MoodSuggestion — extend to Groove. |
| **Brain.fm** | Functional music for focus / sleep / relax. Hard scientific framing. | Less interesting for us — too clinical. But the *pattern of pinning music to a state* is borrow-worthy. |
| **Spitfire LABS** | One-tap orchestral instruments. Each instrument is a distinct download. The catalogue is the product. | We could ship "preset packs" — same idea: 7 → 21 presets, each pack a small theme (jazz pack, electronic pack, world pack). |
| **Suno / Udio** | Generative AI music from text prompts. | Too far from our scope; but a *pattern-suggestion model* (not generation, just ranking variation pools) is doable. |
| **Koreless / Korg Gadget** | Mobile DAWs with intuitive touch UIs. | Confirmation that touch-first music tools work — we're on the right track with the big-dot picker. |
| **Splice / Soundtrack** | Sample marketplace + collaborative timelines. | Their *collective* feature (multi-user editing) is what Circles enables. Groove + Circles together is the moat. |

## The five next moves (ranked by impact / effort)

### 1. Chill → Groove atmosphere passthrough  ★★★★★
**Move**: Let a saved Chill mix play *underneath* a Groove preset as
a continuous bed. The Groove drums + bass + rhodes sit on top; the
Chill landscape (waters, drones, sacred frequencies, ceremonial
percussion) provides the atmosphere.

**Why it matters**: Closes the most-discussed-but-unbuilt loop — the
"chill-as-atmosphere-for-groove.md" spec has been around for months.
Once shipped, each Groove preset suddenly has *infinite* atmospheric
variations because the user picks the chill bed. A 7×N matrix
instead of just 7 presets.

**Effort**: Medium. Needs `lib/sound-library.ts` extracted from
`BinauralTuner.tsx` so the chill audio engine can run independently
of the chill UI. ~2-3 days.

**First step**: Refactor `BinauralTuner.tsx` to expose its layer
catalogue + `startLayer/stopLayer` functions via a hook. Then add an
"atmosphere from chill" button to Groove that picks a saved mix and
runs those layers in parallel with the Groove engine on the same
AudioContext.

### 2. Time-of-day auto-suggest  ★★★★
**Move**: When the user opens Groove without a preset selected,
suggest one based on the time of day:
- 6–11h: Sun-up Funk
- 11–14h: Tech House (Mon–Fri) / Tropical (weekends)
- 14–18h: Sun-up Funk / Boom Bap
- 18–22h: Slow Roll / Lofi Rooftop
- 22h+: Epic Electro / Slow Roll

**Why**: The user shouldn't have to think about which of the 7 fits
their state. The app already does this for Chill (MoodSuggestion).
Bringing it to Groove makes the tool feel like it knows you.

**Effort**: Small. ~half a day. Add a `timeBucket` field per preset
+ a small suggester UI ("It's morning — try Sun-up Funk →").

### 3. Preset packs — ship 7 more  ★★★★
**Move**: A second wave of 7 presets, themed as a pack. Candidate:
**Globe Pack** — Reggaeton, Afrobeat, Bossa Nova, Tabla / Indo-jazz,
Klezmer, Gnawa, Cumbia. Different cultural rhythms; same engine
+ per-preset voice tweaks pattern.

Why this pack first: the original 7 are all Western/electronic. A
globe pack shows the engine's range and gives non-Western users a
preset that feels like home.

**Effort**: Small-medium. The voice-tweak system already does most
of the work. ~1 day per preset, ~1 week total. Half a week if we
batch-design them.

### 4. Save the groove — ship "Saved Mixes" for Groove  ★★★
**Move**: Just like Chill has saved mixes (`colourmap:tuner-mixes`),
Groove gets `colourmap:groove-mixes` — the user can save their
preset + active-track-toggles + bpm + swing as a named mix. Reload
later, hand to a friend (Circles), pin to a daily check-in.

**Why**: Saved Chill mixes are one of the stickiest features in the
app. Groove without saves is a one-shot tool. With saves, it
becomes a personal library.

**Effort**: Small. ~half a day. The pattern is fully proven in
BinauralTuner; copy and adapt.

### 5. Circle Groove sessions  ★★★★★ (long horizon)
**Move**: Collective groove control. A circle starts a "session," all
members join via the circle code, and the music played in the
session is shared — host plays, others see the same bars + can
contribute. Three sub-modes per the existing collective-control
spec:
- **Vote axis** — every X bars, members vote on a track to add/drop
- **Solo rotation** — each member gets the lead for 4 bars
- **Team-of-3** — each member controls one of drums/bass/keys

**Why**: This is the moat. Music tools are everywhere; *collective*
music tools are not. The band-first-test is exactly the use case —
4 friends in a room, one phone is the host, everyone shapes the
groove. From there it generalizes to remote sessions, salons, etc.

**Effort**: Large. Needs Supabase real-time channels (or WebRTC)
for sub-second sync; needs the host-select UX; needs the per-member
control surface. ~3–4 weeks first version. But it's the feature that
moves Groove from "personal tool" to "social tool" — i.e. the
Patagonia-of-social thesis applied to music.

**First step**: Build "Circle Groove Lobby" — circle members can
SEE which preset the host is playing in real-time, even before
they can contribute. That alone is novel and uses the existing
Supabase auth + circle membership.

## How this connects to band-first-test

The band test (`circles-music-band-first-test.md`) is the testbed.
Groove's role:
- **Day-to-day rehearsal warmup**: open Groove, pick Slow Roll, jam
  bass over it for 10 min before practice. The drums + bass +
  rhodes are good enough to play *to*.
- **Reference tracks**: a band member shares "this is the feel I
  want" by saving a Groove mix and dropping it in the Circle's
  audio area (already shipped).
- **Songwriting starter**: pick Boom Bap, hit play, freestyle vocal
  ideas → record into the Circle audio drop → revisit later.

Each of the 5 moves above earns its keep in the band test:
1. **Chill atmosphere** — dreamy band warmups
2. **Time-of-day** — opens at the time the band practices, suggests
   right preset
3. **Globe pack** — band experiments outside the comfortable
   Western-electronic zone
4. **Saved mixes** — band's favourite jam beds become a library
5. **Circle Groove** — band rehearses *together* through the app,
   even when one member is travelling

## What I would NOT build next

- **Sample marketplace** — not the moat. CC0 web search is enough.
- **MIDI export** — niche, distracts from core users.
- **AI generative tracks** — adds licensing risk and dilutes the
  "honest synth, no AI" identity that makes Groove portable.
- **More fancy filters / effects** — the engine is good enough; UX
  is the limiting factor, not synthesis.
- **Polishing the visualizer** — visuals don't grow the user base.
  Audio + collaboration do.

## Recommended order

1. **Saved Mixes** (½ day) — fastest leverage, immediate user value.
2. **Time-of-day suggester** (½ day) — closes the gap with Chill.
3. **Chill → Groove atmosphere** (2-3 days) — unlocks combinatorics.
4. **Globe pack** (1 week) — extends the catalogue, low risk.
5. **Circle Groove** (3-4 weeks) — the moat. Defer until
   band-first-test gives us real usage signal.

Total: ~5-6 weeks of focused work to take Groove from "7 demo
presets" to "personal music tool with cultural range, contextual
suggestions, atmospheric depth, and collective sessions."

The first three are the high-leverage ones. The last is the
identity move.
