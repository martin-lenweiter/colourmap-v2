# Collective Immersive Music Experience

**Status:** Concept / Creative Vision Spec  
**Date:** 2026-04-28

---

## The Vision

What if a room full of people could shape a sonic environment together — in real time, from their phones — and the music that emerged was genuinely *theirs*? Not a DJ's set. Not a playlist. A living, breathing groove built by the collective field of the people in that space.

This is the vision: **colourmap as a musical organism that a group inhabits.**

---

## Contexts

This works at wildly different scales and energies:

### Burning Man / Festival
50-200 people around a fire or on an open stage. Each person has their phone. The Groove Machine receives emotional data — check-in states, energy levels, vibe scores — and the collective mood shapes the tempo, the density, the texture of what's playing. High energy = the kick gets heavier. A wave of calm = the lead fades, a pad rises. The music tracks the field.

Someone can pick up their phone and toggle their section on or off. The drums section pulses when 30 people have drums open. The bass drops when the median "Doing" score is high. This is not metaphor — it's mapped, it's felt, it's musical.

### Ibiza / Club / Party
More controlled, more intentional. A DJ or host sets the base preset. Guests in the room get a "session link." Their collective mood influences the texture — not the control, but the colour. The DJ uses their choices as data. The floor literally shapes the sound.

Visual feedback: a projection shows the collective "wave" — the aggregate Feeling score as a colour field, the active layers as dots moving across a surface. The room sees itself.

### Private Party / Intimate Event
10-30 people. A house party, a dinner with an artistic edge, a gallery opening. The Groove Machine is the ambient sound system. The host sets a vibe. Guests can open their phone, tap into the session, toggle their section of the groove. When someone who's a musician opens the keys or lead section and makes a change, the group hears it. It's intimate, surprising, collaborative.

The magic: you're at a dinner party and the music just did something because three people all moved to the sharing tab at the same time. The room notices.

### Luxury Brand / Audemars Piguet
Ultra-premium, exclusive. 15 carefully selected guests in a venue. The colourmap experience is designed as a ceremony — a guided collective check-in followed by a co-created soundscape. Each guest has a handcrafted card with a QR code. They check in. Their emotional state maps to a specific sonic layer.

The watches are about precision in time. The colourmap experience is about presence in the moment. The brand story writes itself: *"For the people who understand that time is not managed — it is felt."*

The soundscape the group creates is recorded and gifted to each guest as a unique audio artifact tied to that moment.

---

## Technical Architecture (Sketch)

### Session Model
```
Session {
  id: string
  hostId: string
  preset: GroovePreset
  participants: Map<userId, ParticipantState>
  groupPadsOpen: Record<Group, boolean>
  sharedPatterns: Partial<Record<TrackId, number[]>>
  blendPreset?: string
}

ParticipantState {
  userId: string
  activeGroups: Group[]
  lastCheckIn?: { feeling: number, doing: number, sharing: number }
  influence: number  // 0-1, how much this user's state shapes the collective
}
```

### Collective Mood → Sound Mapping
The aggregate feeling/sharing scores of active participants influence:

| Collective State | Sound Effect |
|-----------------|--------------|
| High feeling (excited) | +tempo, +kick density |
| Low feeling (calm) | -tempo, pads rise, lead fades |
| High sharing (connected) | +layering, more harmonic complexity |
| Low sharing (isolated) | -layers, more sparse, bass focus |
| High doing (active) | +sequencer density, shorter note durations |

### Roles
- **Host/DJ**: sets the preset, controls global tempo, can override any section
- **Participant (active)**: their check-in state influences the collective field; they can open their assigned section
- **Participant (passive)**: just listening; their emotional state still feeds the aggregate

### 5-50 People Scale
- 5 people: each person controls one section (drums, bass, keys, lead, pads)
- 15 people: 3 people per section — the majority vote of that section wins
- 50 people: sections become "zones" — people in the front row control drums, back row controls pads, etc. (spatial mapping via GPS or manual zone assignment)

---

## The Gamification Layer

At scale, you need a feedback loop that makes people want to engage:

1. **Resonance score** — when your input aligns with the collective wave, you glow. Your dot brightens on the shared display. You feel the effect of your contribution.

2. **Harmony from chaos** — the room starts dissonant (everyone on different settings). The collective goal is to find resonance. When 80% of participants are in a coherent state (similar mood scores), the music "locks in" — the quantization tightens, the layers snap together. The crowd literally hears when they're unified.

3. **Ceremony moments** — the host can trigger a "ceremony moment": all individual controls freeze, the collective average becomes the state, and the music plays what the room *is*. A held note of collective being.

4. **Memory** — after the session ends, each participant gets a "session snapshot": the collective mood curve over time, the layers that were active, the moment when resonance was highest. A record of a shared experience.

---

## Why This Matters

Most technology at events is extractive — phones pull people out of the room and into their feeds. This does the opposite: it makes the phone a *portal into the room*. Your individual state feeds the collective. The collective state reaches back.

This is the platform vision: **colourmap as a resonance field.** Not just for individual self-awareness, but for collective attunement. The Burning Man use case is the most visible version of this. But the quiet version — a group of friends checking in and making music together from their living room — is just as sacred.

---

## Near-Term Next Steps

1. **Session creation** — a host creates a session, shares a code
2. **Join flow** — participants scan/enter code, see the group's groove
3. **Real-time sync** — Supabase Realtime for participant states and pattern updates
4. **Read-only view first** — participants can see and hear the collective groove before they can influence it
5. **Influence controls** — toggle sections, see your contribution in real time
6. **Collective mood display** — simple aggregate bar showing the group's current FDS state
