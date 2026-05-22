# Visual Design Guardrails

Opinionated defaults. Follow unless explicitly overridden.

For the full visual identity — the three voices, the palette, the zen principles, the forbidden list — see [`docs/specs/visual-identity.md`](../docs/specs/visual-identity.md). The spine is **1949 American typewriter × handwritten letter × Japanese zen**, with existing voices (pirate logbook, Leonardo notebook, cowboy display) as moods within it.

This file is the operational layer: hard rules that apply to every piece of UI regardless of mood.

## Typography Principle

**No sans-serif.** The app uses three voices only — typewriter serif (structure), handwritten ink (humanity), refined serif (ceremony). Never mix modern sans-serif fonts into UI. See visual-identity spec for when each voice applies.

## Color Principle

**No pure black, no pure white.** Paper never is. Use sepia ink (`#5C3018`) as the darkest, cream (`#F5ECDC`) as the lightest. Accent with warm ochre (`#C4A060`) as the primary. One secondary accent at most per view.

Light/pale pills and paper chips must use sepia ink (`#5C3018`, exposed as `--light-pill-text`) for typography. Keep ochre and category colors for dots, fills, borders, and dark-panel lettering; never put ochre text on beige/gold paper.

## Spacing

8px grid. All spacing values must be multiples of 4: 4, 8, 12, 16, 24, 32, 48, 64. No magic numbers.

## Typography

One font family per project. Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48. Line-height 1.5 for body, 1.2 for headings. Max line length 65ch.

**Readable by default.** Critical UI labels, controls, area names, tab names, and action labels must be clear and readable in both light and dark themes. Do not use tiny typography for important navigation or organisation controls. Area/category labels should use at least 13px, with stronger weight and dark/light theme-aware foreground text. Dots and colors can support recognition, but text must carry the meaning.

**Compressed image assets by default.** Any raster image added to the app must be compressed before commit, preferably as WebP or AVIF. Keep decorative/background images lightweight enough for weak mobile connections, and layer them behind readable text with theme-aware overlays.

**No baked-in image frames.** Generated raster assets must not include white frames, white gutters, fake paper mats, rounded white borders, page borders, or edge outlines unless the user explicitly asks for an image of a framed object. The app owns framing and border radius; generated artwork should reach the image edges so it can crop cleanly inside cards, pills, comic readers, and phone-width backdrops.

## Color

60-30-10 rule: 60% neutral background, 30% secondary, 10% accent. Max 3 brand colors + neutrals. Contrast ratio ≥ 4.5:1 for all text.

## Hierarchy

Size > weight > color for importance. One primary action per screen. Visual weight guides the eye top-left → primary action.

## Whitespace

When in doubt, add more. Sections separated by ≥ 32px. Related elements grouped tightly (8–16px). Unrelated elements spaced apart (24–48px).

## Consistency

Same element = same style everywhere. Don't invent new button variants. Use shadcn/ui defaults before customizing.
