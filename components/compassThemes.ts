/* ═══════════════════════════════════════════════════════════
   COMPASS COLOR THEMES — shared across CARE, STAR, SHARE compasses
   ═══════════════════════════════════════════════════════════ */

export type CompassColorTheme = 'golden' | 'vivid' | 'earth' | 'warm' | 'cool';

export interface CompassTheme {
  id: CompassColorTheme;
  name: string;
  dot: string;
}

// CARE compass themes
export const CARE_THEMES: (CompassTheme & { colors: Record<string, string> })[] = [
  {
    id: 'golden',
    name: 'Golden',
    dot: '#C4A070',
    colors: { care: '#C4A070', attitude: '#C4A070', rest: '#C4A070', emotions: '#C4A070' },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    dot: '#D45050',
    colors: { care: '#D45050', attitude: '#C8A040', rest: '#6890B0', emotions: '#88A858' },
  },
  {
    id: 'warm',
    name: 'Warm',
    dot: '#D4805A',
    colors: { care: '#D4805A', attitude: '#C4A070', rest: '#C4906A', emotions: '#B07A5A' },
  },
  {
    id: 'earth',
    name: 'Earth',
    dot: '#A08860',
    colors: { care: '#B89868', attitude: '#C4A070', rest: '#A89060', emotions: '#988050' },
  },
];

// STAR compass themes
export const STAR_THEMES: (CompassTheme & { colors: Record<string, string> })[] = [
  {
    id: 'golden',
    name: 'Golden',
    dot: '#7A9A7A',
    colors: { structure: '#7A9A7A', target: '#7A9A7A', action: '#7A9A7A', resources: '#7A9A7A' },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    dot: '#7AAA58',
    colors: { structure: '#3A8AC4', target: '#7AAA58', action: '#E8A030', resources: '#D45050' },
  },
  {
    id: 'cool',
    name: 'Cool',
    dot: '#6A8A9A',
    colors: { structure: '#6A8A9A', target: '#7A9A7A', action: '#8A8A6A', resources: '#5A7A9A' },
  },
  {
    id: 'earth',
    name: 'Earth',
    dot: '#4A7A4A',
    colors: { structure: '#5A8A5A', target: '#4A7A4A', action: '#6A9A6A', resources: '#3A6A3A' },
  },
];

// SHARE compass themes
export const SHARE_THEMES: (CompassTheme & { colors: Record<string, string> })[] = [
  {
    id: 'golden',
    name: 'Golden',
    dot: '#6B7F4E',
    colors: { share: '#6B7F4E', authentic: '#6B7F4E', roots: '#6B7F4E', express: '#6B7F4E' },
  },
  {
    id: 'vivid',
    name: 'Vivid',
    dot: '#7AAA58',
    colors: { share: '#7AAA58', authentic: '#E8A030', roots: '#3A8AC4', express: '#9B6BA0' },
  },
  {
    id: 'earth',
    name: 'Earth',
    dot: '#6B7F4E',
    colors: { share: '#7A9A5A', authentic: '#8A9A6A', roots: '#6B8F4E', express: '#5A8A4A' },
  },
  {
    id: 'warm',
    name: 'Warm',
    dot: '#5A7A3A',
    colors: { share: '#6A8A4A', authentic: '#7A9A5A', roots: '#5A7A3A', express: '#4A6A2A' },
  },
];
