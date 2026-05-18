# AI Presence

> A small shared AI surface that can appear from anywhere in Colourmap and reflect through the brown/gold living-cell visual language.

## Purpose

AI Presence is the first phone-friendly AI layer in Colourmap. It is not a coding agent and it does not run local terminal commands. It is a reflective interface connected to the backend AI routes so the user can capture a thought from desktop or phone and receive a concise mirror back.

This surface is the practical first step toward the larger AI Evolution spec: an optional box that reads fragments, helps find the simple core challenge, and reflects what the fragment seems to be telling the user.

## First Milestone

- A floating ochre/brown button is available inside the authenticated app shell.
- Opening it reveals a calm brown panel with a living-cell dot visual.
- The visual has five switchable presets: Cell, Mission Sun, Dot Walker, Orbit, and Nebula.
- Mission Sun is the first talking-interface prototype: golden dots stay gathered inside the circular field and pulse faster while the user is speaking, so voice input has a visible body.
- The user can type a reflection or dictate into the text area when browser speech recognition is available.
- Submit streams a backend AI response into the panel.
- The panel is usable on phone without Codex, Claude Code, or a desktop runner.
- The response stays mirror-first: it names what it sees, asks one useful question, and avoids pretending to be therapy.

## Backend

Route: `POST /api/ai/presence`

Input:

```ts
{
  message: string;
  surface?: string;
}
```

Rules:

- Requires authenticated user.
- Rejects empty or oversized messages.
- Uses the server-side AI provider only; no client API keys.
- Streams text back to the client.
- Does not store messages in this milestone.

## Future

- Save selected reflections into the user's memory.
- Let the AI read recent check-ins, missions, day-map entries, and notes.
- Add scope controls: Today, Mission, Body, Business, App, Letting Go.
- Let the cell visual become a richer interaction mode: voice vibration, spoken answer, generated visual map, and deeper dive into related fragments.
- The durable home for long-term reflection is `/ai`, specified in [`ai-reflection-menu.md`](./ai-reflection-menu.md). AI Presence remains the quick summon surface; the AI menu owns saved memory, freemium quotas, and deeper pattern reading.
- The summoned AI panel uses the same theme-relative raised surface variables as `/ai`: a slightly clearer block on top of the current theme, not a fixed paper/beige panel.

## Geometry Companion Notes

- The three sine-morph presets (`Sin Morph`, `Sacred Sin Morph`, `Chaos Sin Morph`) default to slow breathing speeds so they open calmly instead of as fast pulses.
- `Eclipse` is a top-level geometry preset derived from the static Magnetic Sand look: a hollow center with particles/rays radiating from the empty core.
- `Gravity` is a top-level geometry preset derived from Magnetic Sand: two hollow circular vortex centers, with particles orbiting each core like two bodies pulling on each other.
- `Scriptures` and `Vertical Scriptures` are top-level sacred-writing presets. Golden sand particles fill fixed letter patterns: a horizontal mantra-like line and a vertical Japanese-symbol column.
- Long run: geometry presets become concert journeys, not isolated buttons. Presets should be grouped into mergeable families so a visual set can transition smoothly from one compatible preset to another during music, performance, or projection use.
