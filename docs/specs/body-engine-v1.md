# Body Engine — V1 Spec

> Status: Vision / Design-ready. Defines the first buildable version of the movement/body reset
> system. Intentionally constrained — no AI coaching, no 3D, no social layer yet.

---

## One-Line Vision

An aesthetic body operating system combining a fixed visual world with adaptive daily movement
flows.

---

## What This Is (and What It Is Not)

**It is:** a daily body reset ritual. 5–10 minutes. Calm, consistent, game-like.

**It is not:** a fitness app, a workout tracker, a replacement for a trainer, or a health platform.
The goal is not performance. It is awareness, habit, and regulation.

---

## User Entry Point

Three inputs, chosen in under 10 seconds:

| Input | Options |
|---|---|
| Body area | Shoulder · Back · Full body |
| Energy level | Low · Medium · High |
| Time | 5 min · 10 min · 15 min |

The system generates a session from these three signals. No account, no onboarding form, no goals
wizard. Just: where are you, how much do you have?

---

## Core Interaction — The Rotative Wheel

The main UI is a **circular rotative interface**. Exercises are arranged as segments on a wheel.
The user rotates through them. A central button starts the session.

Design principles:
- Calm, ritual feeling — not a typical app flow
- Game-like without being gamified (no points, no streaks, no badges in V1)
- The rotation creates a sense of entering a space, not launching a feature

---

## Session Structure

Each session: 3–5 exercises, structured as:

```
Warm-up → Main movement → Support exercise → Recovery
```

Each exercise displayed as a card:
- Consistent illustration (see Visual System below)
- Short name (2–3 words max)
- One-line instruction
- Timer: 30–60 seconds per exercise
- Optional: active body area highlighted as a soft colour overlay

---

## After the Session — Minimal Feedback

Two questions only:

1. **Pain area:** Better / Same / Worse
2. **Energy:** Low / Medium / High

This feedback drives the adaptive logic. No long surveys. No mood wheels. Fast, honest, done.

---

## Adaptive Logic (Rule-Based, Phase 1)

No ML. No heavy AI. Pure rules:

| Signal | Response |
|---|---|
| Pain worsened | Next session: easier, shorter, more recovery |
| Pain improved | Next session: same level or slightly progressed |
| Energy low | Shorter session, gentler exercises |
| Energy high | Full duration, add challenge variation |
| Consistent completion 3+ days | Offer slightly harder variation |

The system should feel intelligent without being unpredictable. Safety > cleverness.

---

## Exercise Data Model

```typescript
interface Exercise {
  id: string;
  name: string;           // "Shoulder Roll", "Hip Circle", "Low Lunge"
  image: string;          // path to illustration
  duration: number;       // seconds (30 | 45 | 60)
  instruction: string;    // one line: "Slowly roll both shoulders backward 5 times"
  tags: {
    area: ('shoulder' | 'back' | 'hip' | 'neck' | 'wrist' | 'full')[];
    goal: ('mobility' | 'strength' | 'recovery' | 'energy' | 'release')[];
    difficulty: 1 | 2 | 3;  // 1=gentle, 3=challenging
  };
  easier?: string;        // id of easier variation
  harder?: string;        // id of harder variation
}
```

---

## Content Scope (V1)

**Maximum 30–50 exercises.** Not more. Quality and coherence over volume.

Organised into **4–5 flows**:

1. **Shoulder Reset** — tension release, mobility, posture
2. **Back Reset** — lower back, spine, hip flexor
3. **Full Body Mobility** — general daily movement quality
4. **Light Energy Release** — boxing-inspired movement, breath, activation (for high energy / frustration)
5. **Wrist & Hand** — guitar-specific, desk work, rehabilitation (ties to Guitar Studio)

Each flow has 8–12 exercises. Sessions pull from the relevant flow + difficulty level.

---

## Visual System — Strictly Controlled

This is the most critical constraint. All exercise illustrations must feel like they belong to
the same world.

### Approach: AI-Generated with Locked Style

Generate all poses using a single master style definition:
- Same human figure reference (consistent proportions, posture baseline)
- Full body, centered composition
- Neutral warm beige / parchment background
- Soft natural lighting, no dramatic shadows
- Minimal clothing — clean, not athletic branding
- Consistent line weight and rendering quality

### Post-Processing (Required)

AI generation alone is not sufficient. Every image needs:
- Scale alignment (same figure height across all images)
- Background tone normalisation (consistent warmth, no cool greys)
- Contrast normalisation
- Optional: soft colour highlight on the active body area (gentle amber/warm glow on the
  shoulder region, for example) — V1 this is subtle, not illustrated anatomy

### What NOT to do

- Do not mix photographic and illustrated styles
- Do not use stock fitness photography
- Do not use different models or body types across the library (inconsistency kills immersion)
- Do not use harsh studio lighting or white backgrounds

### Fallback: SVG Character

If AI generation cannot maintain consistency, fall back to a **parameterised SVG figure** — a
stylised character whose joint angles are defined by data. Hundreds of poses from one codebase.
Always the same visual language. See `embodied-learning-vision.md` for full SVG approach spec.

---

## Technical Architecture (V1)

Intentionally simple:

- Mobile-first web (same stack as current Colourmap — Next.js)
- Static image assets (no video in V1)
- Rule-based session engine (pure TypeScript, no ML)
- localStorage for session history and feedback (Supabase sync as optional follow-up)
- No new backend routes required for V1

Estimated complexity: **Medium**. 2–3 weeks focused build once visual assets are ready.
The asset creation (30–50 illustrations) is the long pole, not the code.

---

## What Is Explicitly Out of Scope (V1)

Do not build until V1 is validated:

- Archetypes (Warrior/Healer/Explorer) — Phase 2
- Social / shared sessions — Phase 3
- Full AI coaching language — Phase 2
- 3D body representation — Phase 3
- Motion tracking / camera — Phase 3
- Large content library (200+ exercises) — Phase 2
- Acupuncture / meridian layer — Phase 3
- Muscle anatomy overlay (detailed) — Phase 2

---

## Success Metric

**Daily return rate.** Not downloads. Not session completions. The question is: does the person
come back tomorrow? A 5-minute daily ritual that sticks is worth more than a 30-minute session
done once.

---

## Placement in the App

Body Engine lives on its own tab or as a section within a future **Body** tab alongside the body
map. In the immediate term it could live under a new top-level tab: **Move** or **Body**.

It connects naturally to:
- FDS check-in (reads Feeling/Doing state to influence session selection)
- Guitar Studio → Wrist/Hand flow (first cross-module connection)
- Progress tab (body practice history alongside life category tracking)
