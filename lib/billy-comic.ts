export type BillyChoice = {
  id: string;
  label: string;
};

export type BillyPanel = {
  id: string;
  image: string;
  title: string;
  text: string[];
  choices?: BillyChoice[];
  medal?: string;
};

export const BILLY_QUEST_PANELS: BillyPanel[] = [
  {
    id: 'leaving-home',
    image: '/entertainment/billy/quest-for-juice/panel-0.png',
    title: 'Billy Leaves The Sofa Zone',
    text: [
      'Billy had a home, a sofa, and an empty cup. This was already more than many fruits could say.',
      'Still, the cup kept feeling important. So Billy stepped outside to look for The Juice.',
    ],
    medal: 'Left The Sofa Zone',
  },
  {
    id: 'too-many-directions',
    image: '/entertainment/billy/quest-for-juice/panel-1.png',
    title: 'The Arrows Disagree',
    text: [
      'Every direction looked meaningful. This was suspicious, because Billy had only packed one snack.',
      'The world offered certainty, chaos, music, danger, comfort, and one tiny hole glowing with poor judgment.',
    ],
    choices: [
      { id: 'cup', label: 'Follow the cup' },
      { id: 'hole', label: 'Inspect the suspicious hole' },
      { id: 'sun', label: 'Walk toward the warmest path' },
    ],
  },
  {
    id: 'first-river',
    image: '/entertainment/billy/quest-for-juice/panel-2.png',
    title: 'The First Crossing',
    text: [
      'The first bridge was not impressive. One plank seemed to have emotional problems.',
      'Billy crossed anyway, because sometimes courage is just continuing while questioning the furniture.',
    ],
    medal: 'Crossed The First River',
  },
  {
    id: 'hooded-stranger',
    image: '/entertainment/billy/quest-for-juice/panel-3.png',
    title: 'A Stranger With A Lantern',
    text: [
      'A hooded stranger waited where the path split. Billy could not tell if this was wisdom or a very elaborate marketing strategy.',
      'The lantern looked like a cup. That felt relevant. Too relevant.',
    ],
    choices: [
      { id: 'ask', label: 'Ask about The Juice' },
      { id: 'wait', label: 'Wait silently' },
      { id: 'frog', label: 'Trust the backpack frog' },
    ],
  },
  {
    id: 'galaxy-gummies',
    image: '/entertainment/billy/quest-for-juice/panel-4.png',
    title: 'Galaxy Gummies',
    text: [
      'The stars on the path were small, sweet, and obviously full of terrible life advice.',
      'Billy decided this was not addiction. This was research with sparkle.',
    ],
    medal: 'Galaxy Gummy Researcher',
  },
  {
    id: 'crocodile-jack',
    image: '/entertainment/billy/quest-for-juice/panel-5.png',
    title: 'Crocodile Jack Seems Helpful',
    text: [
      'Crocodile Jack smiled like a shortcut that had learned to wear perfume.',
      'He offered Billy an easier route to The Juice. The route was extremely golden. That was the first warning.',
    ],
    choices: [
      { id: 'deal', label: 'Hear the deal' },
      { id: 'map', label: 'Check Colourmap' },
      { id: 'nope', label: 'Smile and back away' },
    ],
  },
  {
    id: 'groovy-jungle',
    image: '/entertainment/billy/quest-for-juice/panel-6.png',
    title: 'Groovy Jungle Opens',
    text: [
      'The monkeys were not organized, but they were rhythmically certain.',
      "One had stolen Billy's map and was playing it like a drum. Somehow, the map sounded better this way.",
    ],
    medal: 'Groovy Jungle Visitor',
  },
  {
    id: 'ancestral-pyramid',
    image: '/entertainment/billy/quest-for-juice/panel-7.png',
    title: 'The Triangle Pineapple Prophets',
    text: [
      'At the pyramid, the old pineapples did not explain The Juice. They just looked ancient and triangular.',
      'Billy suspected this was either wisdom or very committed architecture.',
    ],
    choices: [
      { id: 'enter', label: 'Enter the pyramid' },
      { id: 'listen', label: 'Listen to the drums' },
      { id: 'snack', label: 'Check if prophets eat snacks' },
    ],
    medal: 'Prophet Threshold',
  },
];
