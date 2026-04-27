# Doing Context Bar

> A one-to-two sentence brief at the top of the Doing tab that anchors the user in their identity and current chapter before they see any tasks.

## Purpose

The brief is a mindset primer, not a status report. It answers: *who are you right now, and what chapter of your life is this?* It should make you feel grounded before you open a list.

It does NOT summarise what you did (no music, no last task, no streak count). Those belong on Overview or History. The Doing tab opens with identity, not activity.

## Data Sources (priority order)

| Signal | Source | Key |
|---|---|---|
| Time of day | `new Date()` | — |
| Chapter title | `/api/life-scan-answers` | `answers.chapter_title` |
| Archetype | `localStorage` | `colourmap-journey-archetype` (id string) |
| Last check-in tone | `localStorage` | `colourmap:check-ins` → last entry `.feelingTone` |

All reads are read-only. No writes from this component.

## Composition Rules (rule-based, not AI)

Build the sentence in parts:

1. **Time phrase** — always present: "Quiet morning", "Midday", "Afternoon", "Evening", "Late hour"
2. **Chapter** — if set, appended as italic: *"Building the Foundation"*
3. **Archetype** — if set, a one-line identity phrase keyed to the archetype:
   - Artist → "You feel everything — that is the instrument."
   - Architect → "You build order from the raw material."
   - Psychologist → "You understand the pattern beneath."
   - Warrior → "You face what others avoid."
   - Alchemist → "You turn this into something."
4. **Fallback** — if no chapter and no archetype: show last check-in tone ("Last check-in: Courage.") or just the time phrase.

### Example outputs

- "Afternoon. *Building the Foundation.* You build order from the raw material."
- "Morning. You feel everything — that is the instrument."
- "Evening. Last check-in: Courage."
- "Quiet morning."

## Design

- Same card as NowBar: ochre tinted background, 1px border, rounded-lg
- Text: center-aligned, italic serif, `brownDeep` color
- Max 2 lines. Chapter title in italic. Archetype phrase in normal weight.
- No music reference, no objective reference, no streak reference.

## States

- **No data at all**: shows time phrase only. Never empty, never loading.
- **Chapter only**: "Afternoon. *[Chapter]*."
- **Archetype only**: "Afternoon. [Archetype phrase]."
- **Both**: "Afternoon. *[Chapter].* [Archetype phrase]."

## Category Dot Rail (updated)

The category filter rail below the context bar uses the user's real **life categories** from `colourmap:life-categories` localStorage (same data as the Overview compass). Falls back to four generic dots if no life categories are set up yet.

- **Visual**: dots only — no text labels. Color from the category. Tooltip on hover shows the name.
- **Size**: 12px diameter, 2px border when inactive, filled when active.
- **Behavior**: tap to filter, same as before. All active = no filter.
- **Filter type**: `string[]` (life category ids, not hardcoded enum).

## Objective Text — Wrapping Rule

The current-objective input must **never truncate**. It must wrap to a second line rather than hiding text.

- Use `<textarea>` with `resize: none` and auto-height on input.
- Remove the large `paddingLeft/paddingRight` that was eating visible width.
- `paddingLeft: 8px`, `paddingRight: 48px` (just enough room for the tag dot on the right).
- Auto-height: on every keystroke, `el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'`.
- Font: same as before — 26px handwritten bold.

## Push for Tomorrow — Category Dot

Each item in the "Push for tomorrow" list must show a small category dot so it can be placed in context.

- Small dot (10px) to the left of the text, same position as the status dot.
- Tapping the dot opens an inline mini-picker of life categories (dots in a row, same pattern as DoingInbox CategoryDot).
- On selection, stores the category as the item's `tag` field: `{ name, color, categoryId }`.
- This makes push-for-tomorrow items filterable by the category rail when they roll over to today.

## Quick Tasks Design

Quick Tasks (DoingInbox) should feel the same weight as daily objectives:
- Task text: `fontSize: '20px'`, `fontFamily: var(--font-handwritten)`, not truncated.
- Input placeholder: same font and size.
- Done state: opacity 0.4, no line-through (matches objectives style).

## Done When

- [ ] DoingContextBar renders at top of Doing tab with correct sentence.
- [ ] No music reference anywhere in the brief.
- [ ] Category rail shows life categories as dots only (no pill text).
- [ ] Objective input wraps without cutting text.
- [ ] Each push-for-tomorrow item has a tappable category dot.
- [ ] Quick task text matches daily objectives font size.
- [ ] MissionTracker removed from DoingPanel; breathing space before agenda.
