# Depth Boxes — Box 3 for Caring, Doing, Sharing

## Purpose

The third box in each Day tab provides a visual mirror of the user's patterns. It reads data from Box 1 (check-in) and Box 2 (compass + writing columns) and renders one clear visual that answers: "What pattern am I in right now?"

No new input required. The visual updates from data already entered above.

## Caring — The Mirror

### What it shows
Two overlapping organic circles (like watercolour stains). Left circle represents Challenge entries. Right circle represents Flow entries. Where they overlap: integration.

### How it works
- Left circle pulses warmer/larger when more Challenge entries exist
- Right circle pulses brighter when more Flow entries accumulate
- Over time, recurring words get subtly highlighted within each circle
- A single number in the center: balance ratio (flow entries ÷ total entries × 100)

### Data source
- Challenge text entries from Box 2 (CareCompass writing column)
- Flow text entries from Box 2 (CareCompass writing column)
- Historical entries from localStorage

### Visual rules
- Deepest paper tone
- Circles use SVG with radial gradients, soft edges
- Challenge circle: muted warm red/brown
- Flow circle: muted warm gold
- Overlap zone: soft bronze glow
- No hard borders — watercolour feel

---

## Doing — The Wheel

### What it shows
A radar/spider chart where the spokes ARE the trackers from Box 1.

### How it works
- Trackers chosen in DoingCheckInCard (sport, reading, eat clean...) automatically become spokes
- Each spoke's length = days completed this week (0-7)
- The filled polygon shows this week's shape
- Behind it, last week's shape shows as a fainter outline
- Blocked text entries appear as thin markers on the weak spokes
- Moving text entries appear as thin markers on the strong spokes
- Center number: rhythm score (average completion % across all trackers)

### Data source
- Tracker names + day completions from Box 1 (DoingCheckInCard)
- Blocked/Moving text entries from Box 2 (StarCompass writing column)

### Visual rules
- Deepest paper tone for Doing (slightly cooler than Caring)
- Radar uses SVG polygon with smooth transitions
- This week: translucent green fill
- Last week: translucent grey outline
- Spokes: thin lines with tracker name at the tip
- Grid rings at 25%, 50%, 75%, 100% — very faint

---

## Sharing — The Constellation

### What it shows
People as stars arranged in a loose circle. Brightness = connection recency.

### How it works
- People named in SharingCheckInCard become stars
- Star brightness = how recently you interacted (today = bright, 3+ days = dim)
- Distant entries: those stars drift outward
- Connected entries: those stars pull inward
- Subtle pulse on stars you haven't reached out to recently
- Center number: connection warmth (% of people contacted in last 3 days)

### Data source
- People list from Box 1 (SharingCheckInCard)
- Distant/Connected text entries from Box 2 (ShareCompass writing column)
- Gratitude entries (if they mention a person name)

### Visual rules
- Deepest, warmest paper tone
- Stars: small SVG circles with glow filter
- Bright star: full opacity, warm colour, subtle glow
- Dim star: low opacity, no glow
- Lines between grouped stars: very thin, dotted
- Night sky feel without being literally dark — warm twilight on parchment

---

## Build Order

1. **Doing Wheel** — trackers already exist, radar chart pattern from CPC ready to adapt
2. **Caring Mirror** — Challenge/Flow entries already exist, SVG circles straightforward
3. **Sharing Constellation** — needs most new data logic (people → stars, recency tracking)

## Connection to Writing Columns

Writing columns in Box 2 now work as text inputs with stacking entries below:
- Input at top (clean line, placeholder text)
- Entries stack below, most recent first
- Older entries fade (opacity 0.7 → 0.4 → 0.2 over days)
- Entries are the raw data that feeds the Box 3 visual
- No chips, no pills — just handwritten-style text lines
