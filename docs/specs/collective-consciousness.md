# Collective Consciousness — Spec

> Your pain leaves a trail. Someone else follows it home.

## Vision

Colourmap isn't a mood tracker. It's a collective consciousness tool. Every check-in adds to an anonymous shared map of human emotional experience. When you're lost in Fear, hundreds of people who stood on that exact spot light the way forward — not with advice, but with proof that the path exists.

The unique insight: **vulnerability becomes infrastructure.** Your lowest moment becomes the lantern for someone else's lowest moment.

## Core Concept

When you check in, the app shows:
- How many people have been in your exact state
- Where they went next (most common paths forward)
- How long the shift typically took
- An anonymous one-sentence message left by someone who made it through

After you break through to a new state, you're invited to leave something for the next person.

## Four Layers

### Layer 1: Your Own Path (solo, no other users needed)

A visual river of your emotional journey over time. Colored dots, one per check-in, flowing left to right. AI detects:
- Cycles: "You drop every Sunday evening. You rise every Tuesday morning."
- Breakthroughs: "This is the longest you've stayed above Courage."
- Patterns: "Every time body tension spikes, you enter Fear within 2 days."

Data: just your own check-ins. Already in the DB.

### Layer 2: Anonymous Trails (needs ~50 users)

Your journey gets anonymized and added to a collective pool. Opt-in per check-in.

Shared data (truly anonymous, no user ID):
- Emotional state sequence (last 7 Hawkins indices)
- Average body/focus/clarity
- Optional one-sentence "lantern" message
- "Days ago" (no exact timestamp)

When someone checks in at a matching starting state, they see the trails ahead.

Data model:
```
anonymous_trails {
  id
  sequence: [4, 4, 5, 5, 6, 6, 7]
  body_avg: 3
  focus_avg: 2
  message: "one sentence"
  created_at
}
```

### Layer 3: AI Guide (needs ~200 trails)

AI reads the collective trail data and generates a personalized reflection:
- Part mirror: "You've been in Fear for 3 days"
- Part map: "Most people who stayed here this long moved through Anger next"
- Part lantern: quotes an anonymous message from someone who made it

The AI never gives advice. It asks the question you weren't asking yourself.

Prompt pattern:
```
You are a consciousness mirror. The user is at [state].
Here are N anonymous journeys that started from this state.
Reflect what you see. Don't advise. Show the patterns.
Quote one anonymous message if relevant. 3 sentences max.
```

### Layer 4: Live Resonance (needs ~500 active users)

Real-time awareness of others in the same emotional state worldwide.

- After check-in: "12 people are in Courage right now"
- Tap → anonymous constellation of dots, each a shade of the same emotion
- Optional: ephemeral anonymous message room for people in the same state
- The room dissolves when you leave the state — like a campfire that only appears when enough people gather

Technical: Supabase Realtime presence, auto-expire after 1 hour.

## Build Order

| Phase | What | Effort | Users needed |
|-------|------|--------|-------------|
| 1 | Own path visualization + AI pattern detection | 3 days | 0 |
| 2 | Anonymous trails + "leave a lantern" | 1 week | 50+ |
| 3 | AI guide from collective data | 1 week | 200+ |
| 4 | Live resonance rooms | 1-2 weeks | 500+ |

Phase 1 works solo. Phases 2-4 activate as the user base grows. The app gets more powerful the more people use it.

## What Makes This Different

- **Reddit/forums:** Text. Slow. Performative.
- **Therapy apps:** Clinical. You're a patient.
- **Colourmap:** You feel. The collective feels with you. Not words — color, shape, presence. Nobody knows who you are. But you know you're not alone.

## Companion Ideas

### Emotional Fingerprint
Every user develops a unique visual identity from their check-in patterns — a generative shape that evolves daily. Spiky for volatile, smooth for steady. Shareable as a visual without exposing data. "What does your fingerprint look like?" is a viral question.

### Emotional Music Generation
AI composes a unique soundscape for your exact state. Nobody else hears the same thing. Shareable as "here's what Courage sounded like for me today."

### Circle Seasons
AI detects cyclical patterns in group energy. "Your band always peaks before gigs, crashes after, recovers in 5 days." The group sees its own rhythm.

### The Anti-Feed
Not a scrolling list. A living field of colored shapes — your connections rendered as emotional constellations. Tap to send "I see you." The only social currency is authenticity.

## Philosophy

Social media 1.0: share your life
Social media 2.0: perform your life
Social media 3.0: entertain with your life
**Colourmap: become your life.**

The feed isn't content. It's consciousness.
The metric isn't likes. It's self-knowledge.
The AI isn't a tool. It's a mirror.
The social isn't performance. It's resonance.
