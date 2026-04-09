# Design Principles

## The Five Questions

Every new feature must pass these five questions before being built:

1. **Simplicity** — Can a first-time user understand it in 5 seconds without explanation?
2. **Clarity** — Is the purpose of every element immediately obvious? No ambiguity.
3. **Beauty** — Does it feel warm, considered, and crafted? Would you want to look at it?
4. **Readability** — Can you read every label, every title, every input on a phone at arm's length?
5. **Fluidity** — Can you complete the interaction with your thumb, without thinking about where to tap next?

If any answer is no, simplify until all five are yes.

## Coherence Rules

- Every card uses the same paper gradient, the same border weight, the same rounded corners
- Every section title uses font-serif (Playfair Display), bold, uppercase where needed
- Every interactive text uses font-handwritten (Caveat) or font-serif — never system fonts
- Warm brown (#5C3018 to #C4A060) is the colour spine — everything else orbits it
- Depth increases downward: Box 1 lightest, Box 2 medium, Box 3 deepest paper tone
- One visual per box — not two charts, not a chart and a list. One image that tells the story.
- Text entries stack as handwritten lines, not chips or pills (except to-do/mission items which are action-oriented)

## The Day Page Structure

Three tabs (Caring / Doing / Sharing), each with three boxes:

### Box 1 — Check-in (what's happening now)
Lightest paper. Cat + primary input tools.
- Caring: Hawkins slider + FACING/PEACE + note
- Doing: To-do pills + Missions + Trackers
- Sharing: People + Gratitude + Reach Out

### Box 2 — Compass (rate your dimensions)
Medium paper. Ring compass + writing columns.
- Caring: CARE compass + Challenge/Flow
- Doing: STAR compass + Blocked/Moving
- Sharing: SHARE compass + Distant/Connected

### Box 3 — Depth (see your patterns)
Deepest paper. One visual that reflects your data.
- Caring: The Mirror (Challenge/Flow patterns over time)
- Doing: The Wheel (tracker rhythm as radar shape)
- Sharing: The Constellation (connection warmth map)

## Writing Columns (Challenge/Flow, Blocked/Moving, Distant/Connected)

- Two words as titles: serif, bold, warm colour
- One text input per side: clean line, handwritten font
- Entries appear BELOW the input as stacking text lines (most recent first)
- Entries fade with age (opacity decreases for older entries)
- No chips, no pills, no floating tags — just text lines like a journal
- Entries feed the depth visual in Box 3

## Visual Consistency

- Cards: rounded-3xl, border border-[#8A6A4A50], paper gradient background
- Card depth tones:
  - Box 1: rgba(248,238,220,0.97) → rgba(242,230,210,0.95)
  - Box 2: rgba(245,235,215,0.97) → rgba(240,228,208,0.95)
  - Box 3: rgba(242,232,210,0.97) → rgba(236,224,204,0.95)
- Shadows: warm, soft, deep (rgba(92,48,24,0.35))
- No hard edges inside cards — visuals should feel organic
- Colour as meaning: warm = flowing/strong, cool = stuck/challenging
