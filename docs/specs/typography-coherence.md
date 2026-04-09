# Typography & Coherence Plan

## The Five Fonts

| Font | CSS Variable | Role | Voice |
|------|-------------|------|-------|
| Playfair Display | --font-serif | Titles, headers, tab labels | "This is considered" |
| Caveat | --font-handwritten | Compass labels, inputs, entries | "This is yours" |
| Courier Prime | --font-cowboy | Alt style: typewriter | "This is a logbook" |
| Righteous | --font-groovy | Alt style: bold display | "This celebrates you" |
| Kalam | --font-sketch | Alt style: hand-drawn | "This is a sketchbook" |

## The Two-Font Rule

Within one screen, use maximum 2 fonts:
1. **Structure font** (titles, section labels, navigation) — serif or alt
2. **Soul font** (inputs, entries, prompts, compass text) — handwritten or alt

The global style toggle switches the PAIR, not individual elements.

## Where Each Font Appears

### Default Pair: Playfair + Caveat

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Page title ("TODAY") | Playfair | 600 | 20px |
| Tab labels (CARING/DOING/SHARING) | Playfair | 600 | 13px |
| Section titles (Challenge, To-do) | Playfair | 700 | 20px |
| Compass SVG labels | Playfair | 700 | 17px |
| Compass title (Caring/Doing/Sharing) | Playfair | 600 | 11px |
| CARE/STAR/SHARE blob letters | Caveat | 900 | 16px |
| FACING blob letters | Caveat | 900 | 16px |
| Emotion name (Courage, Fear...) | Playfair | 600 | 18px |
| Input text | Caveat | 400 | 14px |
| To-do pill text | Caveat | 600 | 14px |
| Writing column entries | Caveat | 400 | 12px |
| Design button label | System | 400 | 9px |

### Cowboy Pair: Courier Prime + Courier Prime
All elements use monospace. Tracked spacing. Uppercase where appropriate.

### Groovy Pair: Righteous + Caveat
Titles use bold display. Soul text stays handwritten.

### Sketch Pair: Kalam + Kalam
Everything hand-drawn feel. Slightly larger base sizes to compensate for Kalam's smaller x-height.

## What Needs Fixing

1. Some elements still use Tailwind default fonts (no fontFamily specified)
2. The emotion name should use serif, not handwritten (done)
3. Writing column entries should be handwritten (done)
4. Design button should match the current style pair
5. Tracker day labels (M/T/W...) are too small — should be at least 10px
6. Sub-cell pill text should be consistent (currently mixed)

## Coherence Checklist

- [ ] Every text element has an explicit fontFamily
- [ ] No system/default fonts visible
- [ ] Title hierarchy: page > section > label > body > meta
- [ ] Sizes decrease consistently: 20 > 17 > 14 > 12 > 10 > 8
- [ ] Weights are intentional: 700 for titles, 600 for labels, 400 for body
- [ ] Colours follow brown palette: #5C3018 > #6B4830 > #8A6A4A > #C4A060
