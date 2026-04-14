# Caring Depth — Personality Map Over Time

> Box 3 of the Caring tab maps your personality visually. Name what flows and what challenges you, work on understanding each pattern, and track how they evolve. The goal is self-knowledge that compounds — not a one-time reflection, but a living map you refine over weeks and months.

## The Core Flow

**Step 1 — MAP**: Dump everything. Strengths and weaknesses. Frustrations and flows. Then group them.
**Step 2 — WORK**: Pick one pattern. Decompose it through 6 questions. Understand it.
**Step 3 — RIVER**: Watch your patterns evolve over time. See growth, see drift.

The fourth tab (**Reflect**) is a parallel deep tool for emotion decomposition — used when you want to break a feeling into its sub-components, perfume-expert style.

---

## Step 1 — MAP (Dump → Group)

**The metaphor**: emptying your pockets onto the table.

### Phase 1.A — Dump

You arrive with everything in your head: "I have organisation problems, I avoid hard conversations, I'm proud of my creativity, I get frustrated with my body, my relationship is shaky, I worry about money..."

The Map tab is the dumping ground. Two big columns:
- **Flow** (right) — strengths, things working, things you're proud of
- **Challenge** (left) — weaknesses, frustrations, what's heavy

Tap the "+ add" button below either column. Type or pick from suggestions. Add as many as you want. There is no limit. The point is to **get it all out of your head and onto the page**.

Each pill is:
- A colour dot (auto-assigned for visual variety)
- A name (rename anytime by tapping)
- A type (strength or weakness)
- A "N/6" badge if work questions have been answered

### Phase 1.B — Group (Packs)

After dumping, the natural next step is **organising the chaos**. Many of your patterns are related: organisation problems, lateness, missing keys, scattered desk — these are all one cluster. Anxiety, avoidance, procrastination — another cluster. Creativity, curiosity, playfulness — a strength cluster.

The Map tab supports **packs**: named groups of pills.

- Tap a pack icon to create a new pack
- Name it ("Body stuff", "Work stress", "Family wounds", "My creative spark")
- Drag pills into it (or tap to add)
- Each pack gets its own colour
- A pill can belong to multiple packs

Packs help you see the **shape of your inner life** — not just a flat list, but clusters of related patterns. They become the unit of focus for the Work tab.

---

## Step 2 — WORK (Decompose & Understand)

**The metaphor**: sitting down with a wise friend to interrogate one pattern.

Pick any pattern (or pack) from your Map. The Work tab gives you **6 questions**, in order:

1. **Where does it come from?** — origin, history, where you learned it
2. **What triggers it?** — moments, situations, people, stress
3. **How can we avoid it?** — practical guardrails, prevention
4. **What would be helpful?** — tools, support, environment, practices
5. **What emotions does it provoke?** — what feeling state it puts you in
6. **At its worst, what does it do?** — the dark version, the cost

These 6 questions work for ANY pattern — strength or weakness:
- For *Courage*: where it comes from, what triggers it, how to keep it alive, what helps it grow, what emotions it brings, what it does at its peak
- For *Avoidance*: same questions, opposite charge

### Visual & Behaviour

- Each question is a card with the question in 17px serif and a 16px handwritten textarea
- Auto-saves on type — no save button
- Progress bar at top: 6 dots, filled as you answer
- Pattern badge in Map shows "N/6" so you know which patterns have been worked on
- You can return any day and add more — patterns are never "done"

---

## Step 3 — RIVER (Overview Over Time)

**The metaphor**: a river of your patterns flowing left to right.

Once you've mapped and worked on patterns, you need to see how they shift over time. The River tab shows all your patterns as **lines flowing horizontally**.

- **X-axis**: time (week / month / year selector)
- **Y-axis**: intensity 1-5
- **Each line**: one pattern, colour-coded
- **Data points**: daily check-ins where you rated each pattern

### Today's check-in

Below the river graph, a panel for rating today: each pattern gets a 1-5 slider. Save updates the snapshot. You can update during the day.

### Filtering

- Show all patterns (default) — full overlay
- Or pick specific patterns to focus on
- Or filter by pack (future)

The River is the **memory** of the system. Without it, patterns are static; with it, they evolve.

---

## The Reflect Tab (parallel deep tool)

Reflect is **not part of the 3-step core**. It's a separate deep tool for the moments when you want to decompose an EMOTION (not a pattern).

- Vertical Hawkins rainbow slider (17 emotions from Shame 20 to Enlightenment 700)
- Pick an emotion → reveal its sub-components
- Rate the weight of each component (0-100%)
- Reflection fields: where it impacts your life, where it comes from, what you need

Reflect connects to the 3-step core like this: when you decompose Anger and notice it links to your Avoidance pattern, the app can suggest "want to add this to your Work session for Avoidance?"

---

## Data Model

```typescript
interface PatternPill {
  id: string;
  name: string;
  type: 'strength' | 'weakness';
  color: string;
  packIds: string[]; // membership in packs
  createdAt: string;
}

interface Pack {
  id: string;
  name: string;
  color: string;
  pillIds: string[];
  createdAt: string;
}

interface WorkFocus {
  pillId: string;
  startDate: string;
}

interface PatternWork {
  pillId: string;
  origin: string;
  triggers: string;
  avoid: string;
  helpful: string;
  emotions: string;
  worst: string;
  updatedAt: string;
}

interface RiverSnapshot {
  date: string; // YYYY-MM-DD
  values: { pillId: string; intensity: number }[]; // 1-5
}

interface EmotionDecomposition {
  id: string;
  emotion: string;
  hawkinsLevel: number;
  color: string;
  components: { id: string; name: string; weight: number }[];
  impact: string;
  source: string;
  needs: string;
  createdAt: string;
}

interface CellPosition {
  x: number;
  y: number;
}
```

---

## Cell View — Visual Personality Map

The cell view is the spatial counterpart to the list view. Same data, different lens. The losange below the list toggles between them.

### What it shows

Each pill becomes a **cell** — a framed box on a canvas. Flow cells default to the left half, Challenge cells to the right. A subtle vertical divider separates the two territories.

### Interaction

- **Drag** any cell to reposition it. Positions persist across sessions.
- **Tap** a cell name to rename it inline.
- **Hover** to reveal a delete button.
- Cells you drag close together visually communicate "these are related" without needing formal connections.

### Vision

Over time, the cell view becomes your personality map. Patterns cluster. You move "Work stress" near "Sleep problems" because you see they're connected. You drag "Music" to the center because it touches everything. The spatial arrangement IS the insight — no algorithm needed, just your own sense-making.

Future iterations:
- Draw lines between cells to mark connections
- Cells grow/shrink based on how much work you've done on them
- Ghost cells show patterns you've resolved (faded, moved to edges)
- The cell view can overlay onto the CARE compass quadrants — each pattern placed in the life area it belongs to

LocalStorage keys:
- `colourmap:pattern-pills`
- `colourmap:pattern-packs`
- `colourmap:pattern-focus`
- `colourmap:pattern-work`
- `colourmap:river-snapshots`
- `colourmap:emotion-decompositions`

---

## Process Flow Summary

1. **Day 1**: Dump everything in Map. Don't think. Just type names.
2. **Day 2-3**: Group what's related into Packs. Name the clusters.
3. **Week 1**: Pick one pattern in Work tab. Answer the 6 questions over a few days.
4. **Week 2**: Start daily River check-ins. Watch the lines.
5. **Anytime**: When a strong emotion hits, use Reflect to decompose it.

The promise: in one month, you have a portrait of yourself that's deeper and more honest than years of self-help reading.

---

## Cross-System Integration

- **CARE compass** ← Strength categories map to compass dimensions (Care, Attitude, Rest, Emotions)
- **FACING tracker** ← Weakness categories map to FACING dimensions (Fear, Avoidance, Confusion, etc.)
- **Inner Weather** ← Decomposition output produces emotional climate (storm, rain, fog, breeze, sun)
- **Day check-in** ← Active Work focus shows in the morning prompt

---

## Future Variations

The Map tab will support multiple visual designs (currently flat columns):
- **Triangle Wheel** — radial spokes, one per pill
- **Constellation** — dots in space (SoulMap style)
- **Mandala / Flower** — petal shapes per pack
- **Life Timeline style** — horizontal track with events placed by year

Pack visualisation (future): once packs exist, the Map can show them as bubbles, the River can colour streams by pack, and the Work tab can let you focus on a whole pack instead of one pill.

---

## Done When

- All four tabs render and persist correctly
- Pill rename works inline with Enter/Escape support
- Work tab shows 6 questions per pattern, auto-saves, shows progress
- Map tab pills show "N/6" badge from Work data
- Decomposition flow works end-to-end
- River graph shows all pills as overlaid streams
- All text is readable (minimum 12px for interactive, 13px for SVG labels)
- Packs (Phase 1.B) can be created and pills can be assigned to them
