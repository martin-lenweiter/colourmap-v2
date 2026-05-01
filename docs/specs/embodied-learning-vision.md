# Embodied Learning — Long-Term Vision

> Status: Vision / Pre-spec. Captures the full long-term direction for the Body Engine,
> adaptive movement programs, body map interface, and the AI layer that connects
> physical movement to the FDS life-tracking core.

---

## One-Line Vision

A Body and Life Operating System where structured environments and adaptive intelligence
help users understand, regulate, and evolve themselves.

---

## What This Actually Is

Not a fitness app. Not a meditation app. Not a training tracker.

It is a **self-navigation system**. The user does not just follow programs. They learn to read
their own body, adapt their actions to their real state, and understand their own patterns over
time. In its final form, Colourmap is a system for self-navigation — physical, emotional, and
behavioural — unified through one interface.

The movement layer is one branch of the tree. The root system is FDS (Feeling / Doing / Sharing)
and life tracking. Every branch reads from the root. Every session is shaped by who the user is
today, not just what program they're on.

---

## The Platform Tree

```
                         COLOURMAP
                             │
         ┌───────────────────┼────────────────────┐
    FDS / Check-in        Learn               Track
     (root system)       Branch              Branch
          │                  │                   │
    ┌─────┴──────┐   ┌───────┴────────┐   ┌──────┴────────┐
  Body Map   Emotional  Guitar Studio  Movement  Progress  Notebook
  Layer      Tracking   Harmony        Programs  Avatar    Journal
                        Fretboard      Body Map
                        Practice       Pose Library
                        Chords         Muscle View
                                       Adaptive AI
```

Every branch reads context from the root. A guitarist with wrist tension gets routed to ear
training. A boxer in Fear mode gets a lighter session. The tree grows as users grow into it.

---

## 1. The Body Map — Cyberpunk Dashboard Layer

### Vision

A neutral human figure — front and back, clean anatomical silhouette — rendered in Colourmap's
visual language (warm, parchment base, coloured overlays). The reference aesthetic is the
Cyberpunk 2077 cyberware menu: a standing figure with labelled arrows, coloured zones, and
HUD-style annotations pointing to body parts. But warm, not cold. Personal, not clinical.

Each region of the body is **tappable**. Multiple layers of information live on the figure:

**Layer 1 — Physical state**
User logs "tight shoulders" or "left knee stiff". The region lights in the state-colour.
History stacks over days to reveal patterns.

**Layer 2 — Muscle activation**
When doing a yoga pose, boxing drill, or guitar stretch, the relevant muscle groups highlight
on the figure in real time (or after the session). The body becomes readable through practice.

**Layer 3 — Practice heatmap**
Over time, the figure builds a heatmap of where attention and effort have gone. Which areas
have been worked, which neglected. A living record of the body's history through movement.

**Layer 4 — Meridian / acupuncture overlay (optional)**
Traditional meridian lines and acupuncture points as a toggle overlay. Each point carries its
organ/emotional correspondence (liver = anger/clarity, heart = joy/grief). Connects the FDS
emotional map to physical location on the body.

### Connection to FDS

The body map and the FDS axes reflect each other. This is intentional:
- "Fear" on the Feeling axis → throat/chest tension on the body map
- "Resisting" on the Doing axis → tight shoulders, jaw clenching
- "Withdrawn" on the Sharing axis → collapsed posture, shallow breath

Over time the system begins to see: this user always tightens in the lower back when avoiding.
That is no longer a statistic — it is a signal.

---

## 2. Adaptive Movement Programs

### Phase 1 — Fixed Programs (buildable now)

Pre-installed, curated programs for core disciplines:

- **Yoga** — sequences of poses with illustrated figure, muscle highlights, breath cue
- **Boxing** — combinations, footwork drills, shadow patterns
- **Injury rehab** — targeted flows per body region (shoulder, knee, lower back)
- **Morning mobility** — 10-minute daily sequence
- **Guitar body care** — wrist, shoulder, forearm stretches (tied directly to Guitar Studio)
- **Breathwork** — breath-pattern sequences with body map awareness

Each program: structured sequence (warm-up → main → cool-down). Progress tracked with the
same 7-day bar chart used in Guitar Practice. Sessions are 5, 10, or 30 minutes.

### Phase 2 — Adaptive Programs (AI integration)

The system reads context, not just tracks it.

**Input signals:**
- FDS check-in: Feeling / Doing / Sharing state today
- Body map: any regions flagged as sore, injured, or tight?
- Practice history: what was done this week? What's overdue?
- Time available: 5 / 10 / 30 minutes?
- Archetype mode: Warrior (activate) / Healer (restore) / Explorer (discover) / Builder (build)

**What the adaptive engine does:**
- Selects and sequences exercises appropriate to that exact combination
- Routes around flagged injury regions
- If "Avoiding/Resisting" → small, achievable, familiar
- If "Flow/Working" → stretch target, progression
- Explains the reasoning in plain language: "Your shoulder is flagged and you're in
  recovery mode. Today is mobility and breath, not load."

This is the bridge between:
- **Rigid pre-built programs** — consistent but not responsive
- **Generic AI text advice** — responsive but no structure or visual coherence

The goal: a system that knows your history, your state, your body — and generates a real,
illustrated, sequenced session for you. Every time.

---

## 3. The Living Figure — Visual Character System

### The Core Problem

Current AI image generation cannot produce hundreds of yoga poses, boxing stances, and
rehabilitation exercises in a coherent, unified visual style. Each generation looks different.
There is no "same character, same world." This breaks the experience.

### Solution: Parameterised SVG Character

A single stylised human figure, rendered entirely in code, whose limbs and joints are controlled
by parameters — like a jointed paper doll in SVG positioned by angle data.

```typescript
interface PoseData {
  leftShoulder: number;   // degrees
  leftElbow: number;
  rightShoulder: number;
  rightElbow: number;
  leftHip: number;
  leftKnee: number;
  rightHip: number;
  rightKnee: number;
  torsoLean: number;
  headTilt: number;
}

interface Pose {
  id: string;
  name: string;
  joints: PoseData;
  muscles: string[];       // highlighted muscle groups
  breath: string;          // "inhale as you extend" etc.
  cue: string;             // one-line instruction
  duration: number;        // seconds
  difficulty: 1 | 2 | 3;
}
```

**Why this works:**
- Hundreds of poses = hundreds of data entries, zero image assets
- The renderer draws any pose from the data — always the same character, always the same style
- Muscle group overlays are coloured SVG layers — no separate illustrations needed
- Instantly themeable, animatable (transitions between poses), annotatable
- Works on all devices, zero image hosting cost

**Visual style:**
- Colourmap design language: warm parchment base, coloured overlays for muscle activation
- Video-game HUD feel: clean outlines, anatomical annotations, status indicators
- Same character used across yoga, boxing, guitar stretches, rehab — one universe

### Alternative: AI-Generated Images (Controlled Style)

If SVG character proves too limited expressively, use AI generation with a **locked style**:
- Same human model reference in every prompt
- Full body, centered, parchment/beige background, soft neutral lighting
- Every image post-processed: scale aligned, background normalised, contrast matched
- Optional warm colour highlight on active body area (amber glow on shoulder, etc.)

This requires a curation and processing pipeline. It is more expressive but harder to maintain.
The SVG approach is recommended for V1–V2.

---

## 4. Identity Through Archetypes

A future interface layer that connects movement to personal expression:

| Archetype | Movement Style | Guidance Tone | Session Flavour |
|---|---|---|---|
| **Warrior** | Activation, strength, intensity | Direct, challenging | Boxing, power flows |
| **Healer** | Restoration, gentle release | Soft, patient | Rehab, yoga, breathwork |
| **Explorer** | Discovery, range of motion | Curious, open | Novel poses, mobility |
| **Builder** | Consistency, progressive load | Structured, clear | Progressive programs |

Archetypes do not change the underlying exercise library — they change the selection logic,
the guidance language, and the visual tone. A Warrior session and a Healer session on the same
muscle group look and feel completely different.

Archetypes connect naturally to FDS: a "Courage" state on the Feeling axis points toward
Warrior. A "Peace" state points toward Healer. The system can suggest the archetype — the user
confirms.

---

## 5. The Social / Connection Layer (Phase 3)

Not a traditional social feed. A **structured alignment system**:

- Share a session type or movement intention — invite others to join the same flow
- "I'm doing a shoulder reset tonight at 9pm" — friends can join synchronously or async
- Post-session reflections: how did it feel, what shifted?
- Group body map: see where tension is clustering across a team (Circles use case)

This connects to the existing Circles and Sparks social layer. Movement becomes something
you can share without it becoming a performance or a metric comparison.

---

## 6. Future Input Signals (Phase 3+)

As devices evolve, the system can accept richer inputs:

- **Device sensors**: heart rate, HRV, sleep quality from wearables
- **Posture tracking**: camera-based analysis of exercise form (opt-in, private)
- **Voice tone analysis**: stress markers in speech during check-in
- **Environmental**: time of day, weather, context tags already in the app

Each additional signal makes the adaptive engine smarter without the user needing to input
more consciously. The system reads the body; the user just shows up.

---

## 7. Scale and Complexity by Phase

| Layer | Complexity | Phase |
|---|---|---|
| Body map — tappable regions, state logging | Medium | Phase 1 |
| Fixed programs (yoga / boxing / rehab) with static poses | Medium | Phase 1 |
| SVG parameterised character + 50 poses | High | Phase 2 |
| Muscle group overlays on SVG character | Medium | Phase 2 |
| Adaptive engine (rules-based, reads FDS + body state) | High | Phase 2 |
| Archetypes as session modifier layer | Medium | Phase 2 |
| Acupuncture / meridian overlay | Low–Medium | Phase 3 |
| Full AI-generated adaptive programs | Very High | Phase 3 |
| Social movement layer (Circles integration) | High | Phase 3 |
| Camera-based posture / form tracking | Very High | Phase 3+ |
| Full 3D body representation | Very High | Phase 3+ |

**Phase 1 target (V1):** 4–8 weeks. Defined in `body-engine-v1.md`.
**Phase 2:** 3–6 months of focused development after V1 validation.
**Phase 3:** Platform-scale — requires validated user base and dedicated engineering.

---

## 8. The Core Proposition (Unchanged Through All Phases)

The user does not just follow programs.

They **learn to read their body**, adapt their actions to their actual state, and understand
their own patterns. Movement becomes awareness. Awareness becomes navigation.

In every phase — from a 5-minute shoulder reset in V1 to a full AI-adaptive session in Phase 3
— the underlying truth is the same:

> The body is the interface. Learn to read it.

---

## 9. Reference Visual — Cyberpunk Body Dashboard

> The founder shared a reference image showing a cyberpunk-style anatomical dashboard:
> a human figure with labelled body regions, coloured HUD zones, and annotated arrows
> pointing to muscles and areas of attention. This represents the target aesthetic direction
> for the Body Map layer: warm enough to feel human, technical enough to feel like a real
> tool, video-game enough to make you want to use it daily.
>
> **Reference image to be stored at:** `docs/assets/body-map-reference.png`
>
> When available, this image should anchor all design decisions for the Body Map UI.
