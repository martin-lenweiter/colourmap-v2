/*
 * Feeling/Doing landing-dot palettes — 10 hand-tuned colour pairs
 * the user can pick between for the two big dots on the check-in
 * landing surface. Each pair is named so the picker reads as a
 * curated set, not a colour wheel.
 *
 * Per Martin (2026-04-25): "give a design dot on the feeling and
 * doing two big dots so we can choose colour combinations of the
 * two give me 10 combinations that work well ochre and orange.
 * green and ochre stuff like that" + "blue and green".
 *
 * `id` is the localStorage key (stable across UI changes).
 * `feeling` is the inner/warmer side; `doing` is the outer/fresher
 * side. The pairs are deliberately complementary, not random.
 */

export interface FeelingDoingPalette {
  id: string;
  name: string;
  feeling: string;
  doing: string;
}

export const FEELING_DOING_PALETTES: readonly FeelingDoingPalette[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    feeling: '#D4805A', // warm terracotta
    doing: '#7AAA58', // sage green
  },
  {
    id: 'ochre-orange',
    name: 'Ochre + Orange',
    feeling: '#C4A060', // gold ochre
    doing: '#D4805A', // terracotta
  },
  {
    id: 'green-ochre',
    name: 'Green + Ochre',
    feeling: '#7AAA58', // fresh sage
    doing: '#C4A060', // gold ochre
  },
  {
    id: 'blue-green',
    name: 'Blue + Green',
    feeling: '#6890B0', // sky blue
    doing: '#7AAA58', // sage green
  },
  {
    id: 'earth-water',
    name: 'Earth + Water',
    feeling: '#D4805A', // terracotta
    doing: '#5AA8B0', // teal
  },
  {
    id: 'rose-olive',
    name: 'Rose + Olive',
    feeling: '#E0908A', // soft rose
    doing: '#7A8A50', // olive
  },
  {
    id: 'wine-forest',
    name: 'Wine + Forest',
    feeling: '#7A3850', // wine
    doing: '#5F7447', // forest
  },
  {
    id: 'saffron-indigo',
    name: 'Saffron + Indigo',
    feeling: '#E0A040', // saffron
    doing: '#4A5D7A', // indigo
  },
  {
    id: 'coral-mint',
    name: 'Coral + Mint',
    feeling: '#E08858', // coral
    doing: '#88C8A8', // mint
  },
  {
    id: 'burgundy-mustard',
    name: 'Burgundy + Mustard',
    feeling: '#7A2828', // burgundy
    doing: '#C8A040', // mustard
  },
];

export const DEFAULT_FEELING_DOING_PALETTE_ID: string = FEELING_DOING_PALETTES[0].id;
export const FEELING_DOING_PALETTE_LS_KEY = 'colourmap:feeling-doing-palette';

export function getPalette(id: string | null | undefined): FeelingDoingPalette {
  if (!id) return FEELING_DOING_PALETTES[0];
  return FEELING_DOING_PALETTES.find((p) => p.id === id) ?? FEELING_DOING_PALETTES[0];
}
