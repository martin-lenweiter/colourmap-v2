/*
 * Design tokens — the minimal shared vocabulary the codebase
 * reaches into for spacing, type, colour, radii, and touch
 * targets. Adopted *per touch*, not via a big rewrite — when a
 * component is edited, swap inline values for tokens.
 *
 * Spec: docs/specs/design-system-and-adaptive-strategy.md
 *
 * Convention: values are numbers in pixels (or unitless ratios)
 * so callers can `style={{ padding: space.md }}` without dealing
 * with strings. The Tailwind class equivalents are noted in the
 * comments for cross-reference.
 */

/* ─── Spacing scale ─── */
export const space = {
  xs: 4, // tight gap (Tailwind gap-1 ≈ 4px)
  sm: 8, // small padding (gap-2)
  md: 12, // default body gap (gap-3)
  lg: 16, // section padding (gap-4)
  xl: 24, // section break (gap-6)
  '2xl': 32, // large section (gap-8)
  '3xl': 48, // hero break (gap-12)
} as const;

/* ─── Type scale (px) ─── */
// Phone-readable defaults. Per Martin's "default to 14–16px+"
// feedback memory, base = 15. Don't reach for 11/12 by reflex.
export const fontSize = {
  micro: 11, // labels, tiny meta (use sparingly)
  small: 13, // body small (captions, chip text)
  base: 15, // body default — phone-readable
  lg: 17, // emphasized body, sub-headings
  xl: 22, // section headings
  '2xl': 28, // page titles
  '3xl': 34, // hero
} as const;

/* ─── Letter spacing ─── */
export const letterSpacing = {
  tight: '0.02em',
  body: '0.04em',
  caps: '0.12em', // for ALL CAPS labels
  capsWide: '0.18em', // pill labels, section headers in caps
} as const;

/* ─── Radii ─── */
export const radii = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/* ─── Touch target minimum (Apple HIG) ─── */
export const touch = {
  min: 44,
} as const;

/* ─── Colour palette ─── *
 * The warm-earth Colourmap voice. Hex values; suffix the colour
 * with an alpha (e.g. `${colours.ochre}15`) for soft tints.
 * Semantic helpers below avoid the eye-blink of 4-similar-hexes.
 */
export const colours = {
  // Warm browns
  brownDeep: '#5C3018', // strongest text, headings
  brownMid: '#7A5438', // mid-weight text
  warmTan: '#8A6A4A', // muted text
  // Ochres / golds
  ochre: '#C4A060',
  ochreDeep: '#A87A40',
  // Reds / terracotta
  red: '#B33A2B', // brand red
  terracotta: '#D4805A', // feeling / orange-warm
  rose: '#E0908A',
  // Greens
  sage: '#7AAA58', // doing / fresh
  olive: '#7A8A50',
  forestSoft: '#6B7F4E',
  // Blues
  sky: '#6890B0',
  deepBlue: '#3A6890',
  // Purples
  lavender: '#9B6BA0',
  wine: '#5A2848',
  // Teals
  teal: '#5AA8B0',
  // Papers (background tones)
  paperWarm: '#F0DFB6',
  paperSoft: '#F5E8C8',
  paperPale: '#FBF3D8',
  cream: '#FFFBF0',
} as const;

/* ─── Per-slider colour progressions ─── *
 * 20-step palettes for inline dot-sliders, going from a soft tint
 * at the low end to the slider's identity colour at the high end.
 * Mirrors the inline SLIDER_PROGRESSIONS pattern in
 * components/BinauralTuner.tsx — exposed here so future tools
 * (Groove Machine, future ColourStudios) can reuse them.
 */
export const sliderProgressions = {
  volume: [
    '#F2E4C0',
    '#EEDDB0',
    '#EAD6A0',
    '#E6CF90',
    '#E2C880',
    '#DEC174',
    '#D8B868',
    '#D2AF5C',
    '#CCA650',
    '#C49C48',
    '#BC9240',
    '#B48838',
    '#AC7E30',
    '#A4742A',
    '#9A6A24',
    '#90601E',
    '#86561A',
    '#7C4C16',
    '#724212',
    '#683810',
  ],
  wah: [
    '#F0D8E4',
    '#ECCCDC',
    '#E8C0D4',
    '#E4B4CC',
    '#E0A8C4',
    '#DC9CBC',
    '#D490B4',
    '#CC84AC',
    '#C478A4',
    '#BC6C9C',
    '#B46094',
    '#AC548C',
    '#A44884',
    '#9C3C7C',
    '#943074',
    '#88286C',
    '#7C2064',
    '#70185C',
    '#641054',
    '#58084C',
  ],
  echo: [
    '#D8EEEC',
    '#C8E6E2',
    '#B8DED8',
    '#A8D6CE',
    '#98CEC4',
    '#88C6BA',
    '#78BCB0',
    '#68B2A6',
    '#5CA89C',
    '#509E92',
    '#449488',
    '#388A7E',
    '#308074',
    '#28766A',
    '#206C60',
    '#186258',
    '#125850',
    '#0E4E48',
    '#0A4440',
    '#083A38',
  ],
  softness: [
    '#EBDFEC',
    '#E2D2E4',
    '#D9C5DC',
    '#D0B8D4',
    '#C7ABCC',
    '#BE9EC4',
    '#B591BC',
    '#AC84B4',
    '#A37CAC',
    '#9A74A4',
    '#916C9C',
    '#886494',
    '#7F5C8C',
    '#765484',
    '#6D4C7C',
    '#644474',
    '#5C3C6C',
    '#543464',
    '#4C2C5C',
    '#442454',
  ],
} as const;

export type SliderProgressionId = keyof typeof sliderProgressions;

/**
 * Pick a colour from a progression by ratio (0..1).
 * Useful when you don't have a fixed-length array of dots.
 */
export function progressionAt(id: SliderProgressionId, ratio: number): string {
  const palette = sliderProgressions[id];
  const idx = Math.max(0, Math.min(palette.length - 1, Math.round(ratio * (palette.length - 1))));
  return palette[idx];
}
