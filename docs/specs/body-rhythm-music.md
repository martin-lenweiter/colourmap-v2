# Body-Rhythm Music — Movement as Musical Signal

**Status:** Concept Spec  
**Date:** 2026-04-28

---

## The Vision

Music that *listens to your body* and tunes itself to the rhythm you are already living.

Not a playlist that matches your energy. Not an AI that guesses your mood. Something more direct: your footstrike, your stride, your pulse, your gesture — translated in real time into the tempo, density, and texture of the sound you're hearing.

You are the metronome. The groove follows.

---

## Stage 1: Walking & Running Sync (Doable Now)

### How It Works

Modern phones carry a step counter and accelerometer. The phone already knows how fast you're walking. The Groove Machine already has a tempo.

The link is simple: **BPM = steps per minute**.

| Movement | Typical Cadence | Musical Tempo |
|----------|----------------|---------------|
| Slow walk | 80–90 spm | 80–90 BPM — deep house, ambient groove |
| Brisk walk | 100–110 spm | 100–110 BPM — funk, mid-tempo |
| Run (easy) | 150–160 spm | 75–80 BPM (half-time) — feels powerful |
| Run (fast) | 170–180 spm | 85–90 BPM (half-time) or 170 BPM — techno |
| Sprint | 190+ spm | 95+ BPM (half-time) or full-time 190+ — peak energy |

Half-time mapping is important for running: a 170 spm cadence at full tempo sounds chaotic; at half-time it becomes a driving, locked groove that *amplifies* the run without overwhelming it.

### What Adapts

The Groove Machine receives a `motionBPM` value and adapts:

- **Tempo** — primary signal, follows cadence with a small smoothing window (prevents micro-jitter from uneven steps)
- **Preset selection** — slow walk → calm focus preset; brisk walk → groove preset; run → drive/techno preset. Auto-suggestion, not auto-switch (user confirms)
- **Layer density** — as cadence increases, the kick gets tighter, hi-hats open up, bass becomes more aggressive. Cadence drops → layers thin, reverb increases, the groove softens
- **Binaural frequency** — if the Binaural Tuner is active, the beat frequency can sync to a target brain state for the movement: alpha for walking (calm, present), beta for running (focused, driven)

### Implementation Path

1. **Web**: `window.DeviceMotionEvent` — available on iOS (requires permission) and Android. Can extract step interval from accelerometer peaks.
2. **Native (later)**: a PWA with `Accelerometer` API or a proper native shell with CoreMotion/Sensor Manager gives better accuracy.
3. **Fallback**: manual BPM tap — the user taps their phone in rhythm and the groove locks to it. No sensor needed.

The smoothing algorithm matters. Raw step detection jitters. A rolling 8-step average gives a stable BPM signal that still responds quickly to pace changes.

### UX

The motion sync is opt-in and sits inside the Groove Machine transport:

```
[▶ Play]  [tempo: 108 BPM ↕]  [〜 sync to steps]
                                 ↑
                         tap to enable motion sync
                         cadence: 108 spm · walking
```

When active, a small indicator shows the live cadence vs. the groove BPM. They converge visually — a satisfaction moment when the music locks to your body.

---

## Stage 2: Run-Specific Experience

Running deserves its own mode. The Groove Machine in run mode:

- **Auto-selects high-energy presets** — drum and bass, techno, afrobeats at high cadence
- **Locks the sequencer** — no editing while running, pure playback
- **Scales pattern density** with effort level (calculated from cadence stability and variance — higher variance = harder running)
- **Breathing guide** (optional) — the binaural engine can add a subtle 4/4 count breath guide to help maintain breathing rhythm: inhale on 1 and 2, exhale on 3 and 4

A separate "Run" mode entry point in the app — not buried in settings. Open, tap run, pace starts, music starts.

---

## Stage 3: Full Body Movement via Camera (Long-Term Vision)

This is the most expansive idea. The phone camera (or a room-mounted camera / AR headset) reads your body in motion and maps it to musical parameters in real time.

### What Gets Tracked

| Body Signal | Musical Mapping |
|-------------|----------------|
| Step cadence | Tempo (primary) |
| Arm swing amplitude | Reverb / space — big swings = more room |
| Head tilt / movement | Pitch shift ±1 semitone, or detuning |
| Jump height | Drop/build trigger — big jump triggers a breakdown |
| Stillness | Fade to ambient — body stops, music breathes |
| Dance gesture (isolated) | Trigger a specific layer or harmonic stab |
| Proximity to others | When two people's bodies overlap in frame, their frequencies blend |

### The Ceremony Moment

At a festival or immersive event, a camera reads a group of people moving together. The collective body — the aggregate movement of 20 people — shapes the groove. When the crowd syncs (all moving in the same rhythm), the music "locks in." When the crowd disperses into individual patterns, the music fragments. The room is literally making the music with its bodies.

This is not a metaphor. This is a feedback loop: the crowd hears the groove → moves to it → the groove shifts to follow them → they move differently. A self-reinforcing cycle of collective rhythm.

### Technical Path (Long-Term)

- **MediaPipe Pose** — runs in the browser on WebGL, extracts 33 body landmarks at 30fps. No server needed.
- **TensorFlow.js** — gesture classification on-device (jump, swing, still, wave)
- **Multi-person tracking** — multiple pose estimation in a shared camera view. Collective cadence = mean stride frequency of detected people.
- **WebRTC** — multiple phones, each sending their motion signal to a shared session. The session blends them into a collective body-rhythm score.

This requires computational work but the primitives exist today. The question is product will — whether we want to build an experience that asks people to be seen moving.

---

## Why This Matters

Most music apps treat the body as a passive listener. You sit still, music plays at you.

This inverts it. The body becomes the instrument. Movement is composition. The act of walking somewhere — to work, to the gym, through a city — becomes a musical act. You are not consuming music; you are generating it.

For the colourmap user, this connects directly to the FDS axis:
- **Feeling** — the rhythm of your body reveals your felt state more honestly than a dropdown
- **Doing** — you are literally doing something (walking, running, moving) and the music honours that doing
- **Sharing** — at scale, when bodies move together and the music responds, sharing becomes physical, not just emotional

The most beautiful version of this is the simplest: a person walks alone through a city at dawn, their footstep cadence quietly shaping the groove in their ears, and for a few minutes the music is theirs alone — made by the specific rhythm of the specific body on the specific morning.

---

## Phasing

| Stage | When | What |
|-------|------|------|
| Tap-to-sync manual BPM | Now | User taps rhythm, Groove Machine locks to it |
| Accelerometer step detection | Phase 2 | Phone detects walking/running cadence, tempo follows |
| Motion-responsive presets | Phase 2 | Pace maps to preset family automatically |
| Run mode | Phase 2 | Dedicated high-energy mode, locked playback |
| Camera pose detection (single user) | Phase 3 | MediaPipe body landmarks → musical parameters |
| Collective body-rhythm session | Phase 3 | Multi-person camera feed → shared groove |
