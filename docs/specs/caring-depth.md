# Caring Depth

> The deep layer of the Caring tab. Four sub-tabs that progressively help the user name, work on, decompose, and track their inner patterns over time.

## Context

The main check-in (Box 1) captures today's state quickly. The compass (Box 2) measures the four CARE dimensions. Caring Depth (Box 3) is the slower, deeper layer — where recurring patterns get named, worked on, decomposed into components, and tracked across time.

It has four tabs: **Map · Work · Reflect · River**.

## Tabs

### Map — Strength & Weakness Pills

Big, simple, readable. Two columns: **Flow** (strengths) and **Challenge** (weaknesses).

- Tap the column header (Flow / Challenge) to add a new pill
- Each pill shows as a large card with a colour dot, the name in handwritten 18px ink, and a remove button
- Tap the pill name to rename inline (clear edit box with "Enter to save · Esc to cancel" hint)
- Suggestion pills appear when adding (Courage, Empathy, Discipline... / Overthinking, Avoidance, Self-doubt...)
- Custom names allowed via free text input
- All data in localStorage under `colourmap:pattern-pills`

### Work — Focus on One Pattern

Choose one pattern at a time to work with.

- All pills shown as selectable chips
- Selected pill becomes the focus
- Daily rotating prompt from a question bank specific to the pattern type
- Free-form journal textarea for daily reflection
- Past reflections shown as dated cards (last 5)
- "Change focus" button to release the current focus
- Storage: `colourmap:pattern-focus`

### Reflect — Emotion Decomposition (Perfume Expert Approach)

The deepest layer. Decompose an emotion into its sub-components, like a perfume expert breaks fragrance into top, heart, and base notes.

**Vertical Hawkins Rainbow Slider**:
- 17 levels from Shame (20) at the bottom to Enlightenment (700) at the top
- Each level is a colour band, labeled with the emotion name
- Tap any level to start a new decomposition

**Decomposition Flow**:
1. Pick an emotion → header shows level + name in big serif
2. Add sub-components (suggestions per emotion + custom)
3. Each component has a 0-100% weight slider
4. Three reflection fields:
   - **Where it impacts your life** (work, sleep, relationships...)
   - **Where it comes from** (childhood, recent event, fear...)
   - **What you need** (rest, support, courage...)
5. Linked to your Map pills shown for context
6. Past decompositions saved as a chip list at the bottom

Storage: `colourmap:emotion-decompositions`

### River — Evolution Over Time

Horizontal line graph showing how strengths and challenges flow over time.

**Controls**:
- Timeframe selector: week / month / year
- "Show all" toggle or select specific pills to overlay
- Today's check-in: rate each pill 1-5 with sliders, save snapshot

**Visualization**:
- Multi-line graph, one stream per pill, colour-coded
- Smooth lines with dots at each data point
- Y-axis: low → high (1-5)
- X-axis: time, with first and last date labels
- Empty state prompts to start by rating today

Storage: `colourmap:river-snapshots`

## Process Flow

1. **Day 1** — Open Map, add 2-3 strengths and 2-3 weaknesses, rename until they feel right
2. **Week 1** — Use Work tab to focus on one pattern at a time, write daily reflections
3. **Week 2** — Use Reflect tab when something feels strong or stuck, decompose the emotion, see what's inside
4. **Week 3+** — Use River tab to rate patterns daily and watch them evolve over time

## Future Variations

The Map tab will support multiple visual designs (currently flat columns):
- **Triangle Wheel** — radial spokes, one per pill, length=intensity
- **Constellation** — dots in space, distance=intensity
- **Mandala / Flower** — petal shapes per pack
- **Life Timeline style** — horizontal track with events placed by year (using `LifeTimeline` component aesthetic)

The Reflect connection system (linking pills) will be redesigned with **big simple left/right blocks** instead of the previous arc-based approach. We'll define if "Strength/Weakness" or "Flow/Challenge" naming is the canonical one as the system matures.

The River and Reflect tabs may eventually merge into a single combined view, or River may become a layer inside Map.

## Cross-System Integration

- **CARE compass** ← Strength categories map to compass dimensions (Care, Attitude, Rest, Emotions)
- **FACING tracker** ← Weakness categories map to FACING dimensions (Fear, Avoidance, Confusion, etc.)
- **Inner Weather** ← Decomposition output produces emotional climate (storm, rain, fog, breeze, sun)
- **Day check-in** ← Active Work focus shows in the morning prompt

## Data Model

```typescript
interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  createdAt: string;
}

interface WorkFocus {
  pillId: string;
  startDate: string;
  reflections: { date: string; text: string }[];
}

interface EmotionDecomposition {
  id: string;
  emotion: string;
  hawkinsLevel: number;
  color: string;
  components: { id: string; name: string; weight: number }[]; // 0-100
  impact: string;
  source: string;
  needs: string;
  createdAt: string;
}

interface RiverSnapshot {
  date: string; // YYYY-MM-DD
  values: { pillId: string; intensity: number }[]; // 1-5
}
```

## Done When

- All four tabs render and persist correctly
- Pill rename works inline with Enter/Escape support
- Decomposition flow works end-to-end (pick emotion → add components → rate → reflect)
- River graph shows all pills as overlaid streams over the chosen timeframe
- Today's check-in saves to River and updates the graph immediately
- Empty states are warm and explain what to do next
- All text is readable (minimum 12px for interactive, 11px for SVG labels)
