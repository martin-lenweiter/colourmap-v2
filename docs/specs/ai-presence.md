# AI Presence

> A small shared AI surface that can appear from anywhere in Colourmap and reflect through the brown/gold living-cell visual language.

## Purpose

AI Presence is the first phone-friendly AI layer in Colourmap. It is not a coding agent and it does not run local terminal commands. It is a reflective interface connected to the backend AI routes so the user can capture a thought from desktop or phone and receive a concise mirror back.

This surface is the practical first step toward the larger AI Evolution spec: an optional box that reads fragments, helps find the simple core challenge, and reflects what the fragment seems to be telling the user.

## First Milestone

- A floating ochre/brown button is available inside the authenticated app shell.
- Opening it reveals a calm brown panel with a living-cell dot visual.
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
