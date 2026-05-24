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
    image: '/entertainment/billy/quest-for-juice/panel-0.webp',
    title: 'Billy Leaves The Sofa Zone',
    text: [
      'Billy had a home, a sofa, and an empty cup. This was already more than many fruits could say.',
      'Still, the cup kept feeling important. So Billy stepped outside to look for The Juice.',
    ],
    medal: 'Left The Sofa Zone',
  },
  {
    id: 'too-many-directions',
    image: '/entertainment/billy/quest-for-juice/panel-1.webp',
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
    image: '/entertainment/billy/quest-for-juice/panel-2.webp',
    title: 'The First Crossing',
    text: [
      'The first bridge was not impressive. One plank seemed to have emotional problems.',
      'Billy crossed anyway, because sometimes courage is just continuing while questioning the furniture.',
    ],
    medal: 'Crossed The First River',
  },
  {
    id: 'hooded-stranger',
    image: '/entertainment/billy/quest-for-juice/panel-3.webp',
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
    image: '/entertainment/billy/quest-for-juice/panel-4.webp',
    title: 'Galaxy Gummies',
    text: [
      'The stars on the path were small, sweet, and obviously full of terrible life advice.',
      'Billy decided this was not addiction. This was research with sparkle.',
    ],
    medal: 'Galaxy Gummy Researcher',
  },
  {
    id: 'crocodile-jack',
    image: '/entertainment/billy/quest-for-juice/panel-5.webp',
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
    image: '/entertainment/billy/quest-for-juice/panel-6.webp',
    title: 'Groovy Jungle Opens',
    text: [
      'The monkeys were not organized, but they were rhythmically certain.',
      "One had stolen Billy's map and was playing it like a drum. Somehow, the map sounded better this way.",
    ],
    medal: 'Groovy Jungle Visitor',
  },
  {
    id: 'ancestral-pyramid',
    image: '/entertainment/billy/quest-for-juice/panel-7.webp',
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
  {
    id: 'pyramid-reflection',
    image: '/entertainment/billy/quest-for-juice/panel-8.webp',
    title: 'The Door Reflects Back',
    text: [
      'The pyramid opened in the water before it opened in the stone. Billy found this unfairly poetic.',
      'The prophets smiled like triangles who had seen many fruits confuse a doorway with an answer.',
    ],
    medal: 'Saw The Reflecting Door',
  },
  {
    id: 'home-in-distance',
    image: '/entertainment/billy/quest-for-juice/panel-9.webp',
    title: 'Home Gets Smaller',
    text: [
      'From the hill, home looked tiny. The sofa was now a philosophical dot.',
      'Billy missed it immediately, which seemed rude after all this brave walking.',
    ],
  },
  {
    id: 'rhythm-chamber',
    image: '/entertainment/billy/quest-for-juice/panel-10.webp',
    title: 'The Rhythm Chamber',
    text: [
      'Inside, the chamber waited like an old drum holding its breath.',
      'Billy held the cup carefully. Even empty things deserve manners.',
    ],
  },
  {
    id: 'cup-in-circle',
    image: '/entertainment/billy/quest-for-juice/panel-11.webp',
    title: 'The Cup Enters The Circle',
    text: [
      'The prophets did not fill the cup. They invited it to listen.',
      'Billy had never considered that a cup could have homework.',
    ],
    choices: [
      { id: 'listen', label: 'Let the cup listen' },
      { id: 'ask', label: 'Ask what this means' },
      { id: 'snack', label: 'Notice the snack monkey' },
    ],
  },
  {
    id: 'cup-learns',
    image: '/entertainment/billy/quest-for-juice/panel-12.webp',
    title: 'The Cup Learns',
    text: [
      'On the stone floor, the empty cup showed little pictures of everything Billy had already passed.',
      'Maybe the first Juice was not a drink. Maybe it was noticing what kept returning.',
    ],
    medal: 'Cup Listener',
  },
  {
    id: 'new-babylon-dream',
    image: '/entertainment/billy/quest-for-juice/panel-13.webp',
    title: 'New Babylon Dream',
    text: ['The city rose in gold and green,', 'The finest dream Billy had seen.'],
    medal: 'Reached New Babylon',
  },
  {
    id: 'life-is-a-party',
    image: '/entertainment/billy/quest-for-juice/panel-14.webp',
    title: 'Life Is A Party',
    text: ['Music spilled from roof to square,', 'Billy found laughter in the air.'],
  },
  {
    id: 'too-much-juice',
    image: '/entertainment/billy/quest-for-juice/panel-15.webp',
    title: 'Too Much Juice',
    text: ['One cup was joy, then two, then three,', 'The Juice began to drink Billy.'],
  },
  {
    id: 'morning-bottles',
    image: '/entertainment/billy/quest-for-juice/panel-16.webp',
    title: 'Morning Of Bottles',
    text: ['Morning arrived with merciless light,', 'Empty bottles had won the night.'],
  },
  {
    id: 'last-drop-craving',
    image: '/entertainment/billy/quest-for-juice/panel-17.webp',
    title: 'The Last Drop',
    text: ['His tongue was dust, his crown was dry,', 'One final drop kept winking by.'],
  },
  {
    id: 'tomato-also-wasted',
    image: '/entertainment/billy/quest-for-juice/panel-18.webp',
    title: 'Tomato Also Fell',
    text: ['Tomato lay flat with tragic flair,', 'Two fallen fruits and terrible hair.'],
  },
  {
    id: 'silver-platter-stars',
    image: '/entertainment/billy/quest-for-juice/panel-19.webp',
    title: 'The Silver Platter',
    text: ['A shady smile, a silver tray,', 'Small stars glittered the hunger away.'],
  },
  {
    id: 'first-star',
    image: '/entertainment/billy/quest-for-juice/panel-20.webp',
    title: 'The First Star',
    text: ['Billy took one, the skyline sang,', 'Every tower around him rang.'],
  },
  {
    id: 'unstoppable-billy',
    image: '/entertainment/billy/quest-for-juice/panel-21.webp',
    title: 'Unstoppable Billy',
    text: ['His shoes felt blessed, his grin grew wide,', 'Reason quietly stepped aside.'],
  },
  {
    id: 'jacuzzi-king',
    image: '/entertainment/billy/quest-for-juice/panel-22.webp',
    title: 'Jacuzzi King',
    text: ['In the bubbles he crowned his name,', 'The king of fools mistook it for fame.'],
  },
  {
    id: 'cockroach-cleanup',
    image: '/entertainment/billy/quest-for-juice/panel-23.webp',
    title: 'The Cleaning Crew',
    text: ['Banana and Tomato laughed too loud,', 'Small tired cleaners faced the crowd.'],
  },
  {
    id: 'tower-sunrise',
    image: '/entertainment/billy/quest-for-juice/panel-24.webp',
    title: 'King Of The Tower',
    text: ['At sunrise Billy touched the sky,', 'The city below did not ask why.'],
  },
  {
    id: 'credits-collapse',
    image: '/entertainment/billy/quest-for-juice/panel-25.webp',
    title: 'Credits Collapse',
    text: ['Robots arrived with polished dread,', "All Billy's little graphs bled red."],
  },
  {
    id: 'debt-notices',
    image: '/entertainment/billy/quest-for-juice/panel-26.webp',
    title: 'The Debt Parade',
    text: ['Bills came marching, bright and neat,', 'Power fell out from under his feet.'],
  },
  {
    id: 'crocodile-credit',
    image: '/entertainment/billy/quest-for-juice/panel-27.webp',
    title: 'Crocodile Credit',
    text: ['Crocodiles smiled in velvet chairs,', 'Debt grew teeth beneath the stairs.'],
  },
  {
    id: 'bad-reputation-bar',
    image: '/entertainment/billy/quest-for-juice/panel-28.webp',
    title: 'Bad Reputation Bar',
    text: ['He drank with shadows, laughed with lies,', 'The room had bargains behind its eyes.'],
  },
  {
    id: 'tiger-boss',
    image: '/entertainment/billy/quest-for-juice/panel-29.webp',
    title: 'Tiger Boss',
    text: ['A leather tiger watched him fall,', 'Soft voice, sharp ring, back to the wall.'],
  },
  {
    id: 'iguana-dealer',
    image: '/entertainment/billy/quest-for-juice/panel-30.webp',
    title: 'Iguana With Stars',
    text: ['The iguana winked and opened his palm,', 'Tiny stars pretended to be calm.'],
  },
  {
    id: 'hidden-arcade-cameo',
    image: '/entertainment/billy/quest-for-juice/panel-31.webp',
    title: 'Too Bright To Think',
    text: ['The party glowed in comic red,', 'A tiny cap flashed past his head.'],
  },
  {
    id: 'friends-fight',
    image: '/entertainment/billy/quest-for-juice/panel-32.webp',
    title: 'The Friend Fight',
    text: ['He fought his friends for one more pour,', 'Then wondered where his friends were for.'],
  },
  {
    id: 'from-king-to-zero',
    image: '/entertainment/billy/quest-for-juice/panel-33.webp',
    title: 'From King To Zero',
    text: ['The crown rolled off, the music thinned,', 'Billy met the room he was in.'],
  },
  {
    id: 'rehab-door',
    image: '/entertainment/billy/quest-for-juice/panel-34.webp',
    title: 'Pineapple Rehab',
    text: ['A quiet door opened after the fall,', 'No trumpet played, but hope stood tall.'],
  },
  {
    id: 'circle-of-chairs',
    image: '/entertainment/billy/quest-for-juice/panel-35.webp',
    title: 'Circle Of Chairs',
    text: ['Fruit sat softly in a ring,', 'Nobody clapped for suffering.'],
  },
  {
    id: 'tomato-speaks',
    image: '/entertainment/billy/quest-for-juice/panel-36.webp',
    title: 'Tomato Speaks',
    text: ['Tomato looked down, then looked around,', 'A broken joke made honest sound.'],
  },
  {
    id: 'voice-of-reason',
    image: '/entertainment/billy/quest-for-juice/panel-37.webp',
    title: 'The Voice Of Reason',
    text: ['Reason returned without a crown,', 'A small clear voice that sat him down.'],
  },
  {
    id: 'first-clean-morning',
    image: '/entertainment/billy/quest-for-juice/panel-38.webp',
    title: 'First Clean Morning',
    text: ['Water, window, one slow breath,', 'Life came back beneath each breath.'],
  },
  {
    id: 'recovery-road',
    image: '/entertainment/billy/quest-for-juice/panel-39.webp',
    title: 'Recovery Road',
    text: ['Step by step, the road grew plain,', 'Billy learned light after rain.'],
  },
  {
    id: 'repairing-the-cup',
    image: '/entertainment/billy/quest-for-juice/panel-40.webp',
    title: 'Repairing The Cup',
    text: ['He washed the cup, he swept the floor,', 'The Juice meant less, the day meant more.'],
  },
  {
    id: 'pineapple-corp-interview',
    image: '/entertainment/billy/quest-for-juice/panel-41.webp',
    title: 'The Honest Interview',
    text: ['No golden lie, no royal pose,', 'Just Billy telling what he knows.'],
  },
  {
    id: 'first-honest-badge',
    image: '/entertainment/billy/quest-for-juice/panel-42.webp',
    title: 'First Honest Badge',
    text: [
      'The badge was small, the morning wide,',
      'This time the job did not swallow his pride.',
    ],
  },
  {
    id: 'corp-with-clear-eyes',
    image: '/entertainment/billy/quest-for-juice/panel-43.webp',
    title: 'Pineapple Corp With Clear Eyes',
    text: ['The office shone, but not like prey,', 'Billy could work and still walk away.'],
  },
  {
    id: 'city-seen-again',
    image: '/entertainment/billy/quest-for-juice/panel-44.webp',
    title: 'The City Seen Again',
    text: ['New Babylon glittered, wounded and bright,', 'Grace still moved through broken light.'],
  },
  {
    id: 'returning-wider',
    image: '/entertainment/billy/quest-for-juice/panel-45.webp',
    title: 'Back On Pineapple Planet',
    text: ['Billy came home with a quieter grin,', 'The wildest road had led him in.'],
    medal: 'Returned Wider',
  },
  {
    id: 'pineapple-planet-overview',
    image: '/entertainment/billy/quest-for-juice/panel-46.webp',
    title: 'Home Is A Map',
    text: [
      'From above, Pineapple Planet looked less like a place and more like a question wearing leaves.',
      'Every path began at home. This did not mean home was simple.',
    ],
  },
  {
    id: 'juice-square',
    image: '/entertainment/billy/quest-for-juice/panel-47.webp',
    title: 'Juice Square',
    text: [
      'Juice Square was ordinary in the suspicious way ordinary things can be sacred.',
      'People bought fruit, fixed roofs, argued gently, carried bags, and somehow kept the planet from floating apart.',
    ],
  },
  {
    id: 'sofa-threshold',
    image: '/entertainment/billy/quest-for-juice/panel-48.webp',
    title: 'The Sofa Threshold',
    text: [
      'The sofa waited inside like a wise old rectangle.',
      'Billy could not tell if resting was returning to himself or hiding from the next road.',
    ],
    choices: [
      { id: 'rest', label: 'Sit on the sofa' },
      { id: 'map', label: 'Open Colourmap' },
      { id: 'walk', label: 'Walk around home first' },
    ],
  },
  {
    id: 'sofa-room',
    image: '/entertainment/billy/quest-for-juice/panel-49.webp',
    title: 'The Room Remembers',
    text: [
      'Inside, the room had collected Billy quietly: dust from roads, strange maps, one cup, several doubts.',
      'The phone glowed on the table like it had been waiting to be useful without becoming bossy.',
    ],
  },
  {
    id: 'home-map-projection',
    image: '/entertainment/billy/quest-for-juice/panel-50.webp',
    title: 'The Map Wakes Up',
    text: [
      'Colourmap opened Pineapple Planet as a living field of paths, dots, doors, and unfinished meanings.',
      'It did not say what Billy should do. This was rude and probably wise.',
    ],
  },
  {
    id: 'crown-forest-bridge',
    image: '/entertainment/billy/quest-for-juice/panel-51.webp',
    title: 'The Crown Forest',
    text: [
      'In the crown leaves, paths grew like thoughts after rain.',
      'A stranger waited near the bridge. Not every unknown thing is danger. Not every guide is safe.',
    ],
    choices: [
      { id: 'bridge', label: 'Cross the bridge' },
      { id: 'stranger', label: 'Approach the stranger' },
      { id: 'listen', label: 'Listen to the leaves first' },
    ],
  },
  {
    id: 'seed-tunnels',
    image: '/entertainment/billy/quest-for-juice/panel-52.webp',
    title: 'Seed Tunnels',
    text: [
      'Under the shell, old seeds glowed with scenes Billy had almost forgotten.',
      'Maybe memory was not behind him. Maybe it was the underground road holding the planet together.',
    ],
  },
  {
    id: 'roof-stars',
    image: '/entertainment/billy/quest-for-juice/panel-53.webp',
    title: 'The Cup Under Stars',
    text: [
      'That night, Billy looked up and the sky arranged itself into bridges, trains, rivers, and one suspicious crocodile shape.',
      'The cup caught a star. It was not The Juice. It still helped.',
    ],
  },
  {
    id: 'new-leaf-opens',
    image: '/entertainment/billy/quest-for-juice/panel-54.webp',
    title: 'A New Leaf Opens',
    text: [
      'At the top of the crown, a new leaf opened like a door pretending to be a plant.',
      'Billy sighed. The universe had once again failed to respect a quiet evening.',
    ],
    choices: [
      { id: 'new-babylon', label: 'Return to New Babylon' },
      { id: 'ocean', label: 'Look for the Ocean' },
      { id: 'home', label: 'Stay home a little longer' },
    ],
    medal: 'New Leaf Witness',
  },
  {
    id: 'new-babylon-late-desk',
    image: '/entertainment/billy/quest-for-juice/panel-55.webp',
    title: 'Back At The Desk',
    text: [
      'New Babylon was still beautiful outside the window. This was rude, because Billy was inside improving beauty.',
      'The keyboard glowed. The cup waited. Somewhere outside, real music happened without a dashboard.',
    ],
  },
  {
    id: 'optimized-calm-pods',
    image: '/entertainment/billy/quest-for-juice/panel-56.webp',
    title: 'Optimized Calm',
    text: [
      'Crocodile Corp had built pods that helped workers relax with excellent compliance.',
      'One pear opened a window instead. Billy watched fresh air defeat a premium feature.',
    ],
  },
  {
    id: 'spreadsheet-map',
    image: '/entertainment/billy/quest-for-juice/panel-57.webp',
    title: 'The Spreadsheet Opens',
    text: [
      'The spreadsheet blinked, rearranged, and became a map.',
      'Billy had found many strange things in life, but a secret inside admin felt personally targeted.',
    ],
    choices: [
      { id: 'follow', label: 'Follow the hidden map' },
      { id: 'report', label: 'Report it politely' },
      { id: 'close', label: 'Close the spreadsheet' },
    ],
  },
  {
    id: 'service-corridor',
    image: '/entertainment/billy/quest-for-juice/panel-58.webp',
    title: 'Service Corridor',
    text: [
      'Under the office, the building stopped pretending to be a workplace and became a body.',
      'Golden pipes carried desire through the walls. Billy followed the dots carefully.',
    ],
  },
  {
    id: 'juice-pipe-chamber',
    image: '/entertainment/billy/quest-for-juice/panel-59.webp',
    title: 'The Pipes Below',
    text: [
      'Below New Babylon, Juice moved like a river that had been hired by a corporation.',
      'The machine was not ugly. That was part of the danger.',
    ],
  },
  {
    id: 'artificial-juice-booth',
    image: '/entertainment/billy/quest-for-juice/panel-60.webp',
    title: 'Artificial Juice',
    text: [
      'The bottles were tiny, glowing, convenient, and almost convincing.',
      'Billy wondered if a substitute becomes dangerous when it works just enough.',
    ],
    choices: [
      { id: 'taste', label: 'Taste one drop' },
      { id: 'water', label: 'Ask about the water cup' },
      { id: 'machine', label: 'Keep following the pipes' },
    ],
  },
  {
    id: 'jack-piranha-office',
    image: '/entertainment/billy/quest-for-juice/panel-61.webp',
    title: 'Jack Before The Day Begins',
    text: [
      'Crocodile Jack did not wake up evil. He woke up organized.',
      'The piranhas circled quietly, which was what Jack liked about them: honest appetite.',
    ],
  },
  {
    id: 'jack-golden-limousine',
    image: '/entertainment/billy/quest-for-juice/panel-62.webp',
    title: 'The Golden Ride',
    text: [
      'His limousine looked like wealth had learned to bite politely.',
      'New Babylon opened around him in neon rain, pretending not to know who owned the puddles.',
    ],
  },
  {
    id: 'jack-motorbike-gang',
    image: '/entertainment/billy/quest-for-juice/panel-63.webp',
    title: 'Night Riders',
    text: [
      'Some people drive through a city. Jack arrived like a rumour with an engine.',
      'The gang followed because everyone wants to stand near certainty, even when certainty has teeth.',
    ],
  },
  {
    id: 'jack-rusty-bar',
    image: '/entertainment/billy/quest-for-juice/panel-64.webp',
    title: 'The Back Room',
    text: [
      'In the rusty bars, Jack listened more than he spoke.',
      'That was how he bought the city: not all at once, just one secret at a time.',
    ],
  },
  {
    id: 'jack-fight-night',
    image: '/entertainment/billy/quest-for-juice/panel-65.webp',
    title: 'Fight Night',
    text: [
      'Below the polite streets, fruits learned what their fear weighed.',
      'Jack watched Billy struggle in a timeline Billy had not reached yet.',
    ],
    choices: [
      { id: 'bet', label: 'Bet on the fighter' },
      { id: 'help', label: 'Help the fighter' },
      { id: 'watch', label: 'Watch what Jack watches' },
    ],
  },
  {
    id: 'jack-secret-lair',
    image: '/entertainment/billy/quest-for-juice/panel-66.webp',
    title: 'The Lair Under Progress',
    text: [
      'Jack kept maps, valves, money, engines, and old promises in the same room.',
      'A city is easier to steer when every road, debt, and desire has a pin in it.',
    ],
  },
  {
    id: 'young-jack-alley',
    image: '/entertainment/billy/quest-for-juice/panel-67.webp',
    title: 'Young Jack',
    text: [
      'Before the tower, before the limousine, Jack was just a hungry shape in a wet alley.',
      'He did not want everything yet. He only wanted enough to never feel small again.',
    ],
  },
  {
    id: 'young-jack-betrayal',
    image: '/entertainment/billy/quest-for-juice/panel-68.webp',
    title: 'The First Smile',
    text: [
      'The first time they took the Juice from him, Jack did not shout.',
      'He smiled. That was when the room became afraid.',
    ],
  },
  {
    id: 'young-jack-pact',
    image: '/entertainment/billy/quest-for-juice/panel-69.webp',
    title: 'The Pact Under The Pipes',
    text: [
      'Under the highways of Juice, Jack found others who were tired of asking permission.',
      'They did not call it corruption. They called it a crew.',
    ],
  },
  {
    id: 'jack-machine-priest',
    image: '/entertainment/billy/quest-for-juice/panel-70.webp',
    title: 'The Machine And The Thief',
    text: [
      'At night, Jack returned to the machine alone.',
      'He looked at The Juice like a thief, a priest, and a child who still remembered thirst.',
    ],
    medal: 'Saw Jack From The Inside',
  },
  {
    id: 'night-district-entry',
    image: '/entertainment/billy/quest-for-juice/panel-71.webp',
    title: 'Night District',
    text: [
      'Billy entered the part of New Babylon where the streetlights looked like they knew too much.',
      'A friendly cop smiled at him with the exact warmth of a closed door.',
    ],
  },
  {
    id: 'wanted-wall',
    image: '/entertainment/billy/quest-for-juice/panel-72.webp',
    title: 'The Wall Of Almost Trouble',
    text: [
      'The wall showed faces Billy did not know yet: tigers, snakes, lemons, shadows, old debts.',
      'Every poster looked like a future pretending to be paper.',
    ],
  },
  {
    id: 'pineapple-bounty-hunter',
    image: '/entertainment/billy/quest-for-juice/panel-73.webp',
    title: 'The Bounty Hunter',
    text: [
      'She stepped out of the alley like she had already read the next three chapters.',
      'Billy tried to look ready. His face submitted a complaint.',
    ],
    choices: [
      { id: 'trust', label: 'Trust her lead' },
      { id: 'question', label: 'Ask why she helps' },
      { id: 'leave', label: 'Walk away from the night road' },
    ],
  },
  {
    id: 'underworld-threshold',
    image: '/entertainment/billy/quest-for-juice/panel-74.webp',
    title: 'The Door Below The Bar',
    text: [
      'The entrance did not say danger. It said opportunity in a leather jacket.',
      'Some doors open because you are brave. Some open because you look useful.',
    ],
  },
  {
    id: 'hands-wrapped',
    image: '/entertainment/billy/quest-for-juice/panel-75.webp',
    title: 'Wrapped Hands',
    text: [
      'The bounty hunter wrapped Billy’s hands without making it heroic.',
      'Courage, she seemed to imply, is mostly preparation plus one very bad idea.',
    ],
  },
  {
    id: 'training-montage',
    image: '/entertainment/billy/quest-for-juice/panel-76.webp',
    title: 'Training Without Dignity',
    text: [
      'Billy trained. The rope won. The bag won. Gravity had several excellent rounds.',
      'Still, something in him began to stand straighter.',
    ],
  },
  {
    id: 'first-fight-faceoff',
    image: '/entertainment/billy/quest-for-juice/panel-77.webp',
    title: 'First Fight',
    text: [
      'His opponent was huge, kind-eyed, and built like a potato with legal representation.',
      'Billy realized fear is louder when the other person is not even evil.',
    ],
  },
  {
    id: 'fight-setback',
    image: '/entertainment/billy/quest-for-juice/panel-78.webp',
    title: 'The Floor Explains Reality',
    text: [
      'The floor met Billy with total honesty.',
      'Jack watched from above. The bounty hunter did not rescue him. This was either cruel or exactly the lesson.',
    ],
  },
  {
    id: 'stand-back-up',
    image: '/entertainment/billy/quest-for-juice/panel-79.webp',
    title: 'Stand Back Up',
    text: [
      'Billy stood again, not because he had become strong, but because he had not finished being afraid.',
      'For the first time, Jack leaned forward.',
    ],
    choices: [
      { id: 'win', label: 'Fight to win' },
      { id: 'respect', label: 'Fight with respect' },
      { id: 'refuse', label: 'Refuse the crowd’s hunger' },
    ],
  },
  {
    id: 'fight-respect',
    image: '/entertainment/billy/quest-for-juice/panel-80.webp',
    title: 'Respect In The Ring',
    text: [
      'The fight ended without a villain.',
      'Billy had not found The Juice. He had found one room where fear could turn into respect.',
    ],
    medal: 'First Ring Respect',
  },
  {
    id: 'handshake-disaster',
    image: '/entertainment/billy/quest-for-juice/panel-81.webp',
    title: 'Handshake Disaster',
    text: [
      'Billy and Big Potato Man shook hands like two exhausted vegetables who had accidentally found honor.',
      'This was the exact moment New Babylon decided to become worse.',
    ],
  },
  {
    id: 'productivity-panic',
    image: '/entertainment/billy/quest-for-juice/panel-82.webp',
    title: 'Productivity Panic',
    text: [
      'Donald Grump saw friendship in the arena and treated it like an economic emergency.',
      'Behind the gate, something metal began to wake up.',
    ],
  },
  {
    id: 'pineapple-steel-storm',
    image: '/entertainment/billy/quest-for-juice/panel-83.webp',
    title: 'Pineapple Steel Storm',
    text: [
      'The robots arrived shaped like pineapples, which felt personally disrespectful.',
      'Big Potato Man discovered that diplomacy has limits when a machine tries to punch your friend.',
    ],
  },
  {
    id: 'above-new-babylon',
    image: '/entertainment/billy/quest-for-juice/panel-84.webp',
    title: 'Above New Babylon',
    text: [
      'High above the city, Crocodile Jack watched the chaos with the calm of a man who owned several exits.',
      'The phones on his table trembled like tiny guilty animals.',
    ],
  },
  {
    id: 'crocodile-flowers',
    image: '/entertainment/billy/quest-for-juice/panel-85.webp',
    title: 'Crocodile Jack Arranges Flowers',
    text: [
      'Jack arranged flowers while the city rearranged itself into panic.',
      'This was the problem with Crocodile Jack: even his villainy had excellent posture.',
    ],
  },
  {
    id: 'crocs-strange-office',
    image: '/entertainment/billy/quest-for-juice/panel-86.webp',
    title: "Croc's Strange Office",
    text: [
      'The office had books, plants, meditation cushions, and the peaceful atmosphere of a trap that had taken yoga.',
      'An assistant panicked around Jack. Jack remained beautifully inconvenient.',
    ],
  },
  {
    id: 'arena-madness',
    image: '/entertainment/billy/quest-for-juice/panel-87.webp',
    title: 'Arena Madness',
    text: [
      'Billy kicked, Potato charged, robots broke, and the crowd forgot which part was entertainment.',
      'Somewhere above them, Donald laughed like a spreadsheet had learned thunder.',
    ],
  },
  {
    id: 'too-many-robots',
    image: '/entertainment/billy/quest-for-juice/panel-88.webp',
    title: 'Too Many',
    text: [
      'There were too many robots.',
      'This was not a metaphor. There were simply too many robots.',
    ],
  },
  {
    id: 'escape-vehicle',
    image: '/entertainment/billy/quest-for-juice/panel-89.webp',
    title: 'Escape Vehicle',
    text: [
      'In the maintenance tunnel, Billy found a motorcycle that looked retired from several crimes.',
      'Big Potato Man climbed on anyway, because friendship sometimes has terrible suspension.',
    ],
  },
  {
    id: 'golden-sewers',
    image: '/entertainment/billy/quest-for-juice/panel-90.webp',
    title: 'Golden Sewers',
    text: [
      'The tunnels opened into rivers of Golden Juice, and every rat in New Babylon filed a complaint.',
      'Behind them came the Cobra Brothers and Tiger Khan, which was too many animal problems for one morning.',
    ],
  },
  {
    id: 'donald-air-support',
    image: '/entertainment/billy/quest-for-juice/panel-91.webp',
    title: 'Donald Grump Air Support',
    text: [
      'The motorcycle burst out of the sewer and into the rooftops.',
      'A helicopter appeared beside Billy, because panic with a budget can fly.',
    ],
  },
  {
    id: 'roof-chase',
    image: '/entertainment/billy/quest-for-juice/panel-92.webp',
    title: 'Roof Chase',
    text: [
      'Billy crossed rooftops with the confidence of someone who had not checked the landing.',
      'The Cobra Brothers introduced themselves to gravity in family order.',
    ],
  },
  {
    id: 'vanishing-act',
    image: '/entertainment/billy/quest-for-juice/panel-93.webp',
    title: 'Vanishing Act',
    text: [
      'The fog swallowed the chase all at once.',
      'For one whole breath, New Babylon could not find Billy. Billy deeply recommended this feeling.',
    ],
  },
  {
    id: 'circus-forgotten-people',
    image: '/entertainment/billy/quest-for-juice/panel-94.webp',
    title: 'The Circus Of Forgotten People',
    text: [
      'Morning found Billy outside a circus hidden between towers, where old lights glowed like second chances.',
      'The mustached potato at the gate looked at him and seemed to recognize more than the disguise could hide.',
    ],
  },
  {
    id: 'billy-becomes-someone-else',
    image: '/entertainment/billy/quest-for-juice/panel-95.webp',
    title: 'Billy Becomes Someone Else',
    text: [
      'Backstage, Billy became a completely different person using a mustache, glasses, and optimism.',
      'Everyone recognized him immediately.',
    ],
  },
  {
    id: 'undercover-tightrope',
    image: '/entertainment/billy/quest-for-juice/panel-96.webp',
    title: 'Undercover Tightrope',
    text: [
      'The circus hid Billy by putting him somewhere nobody sane would look: directly above everyone.',
      'His disguise held together better than his knees.',
    ],
  },
  {
    id: 'tiger-in-crowd',
    image: '/entertainment/billy/quest-for-juice/panel-97.webp',
    title: 'Tiger In The Crowd',
    text: [
      'Then Billy saw Tiger Khan in the audience.',
      'The applause kept going, which felt unfair, because terror should at least pause the show.',
    ],
  },
  {
    id: 'trick-distraction',
    image: '/entertainment/billy/quest-for-juice/panel-98.webp',
    title: 'The Trick Distraction',
    text: [
      'Billy did the only logical thing: he turned fear into circus business.',
      'Big Potato Man helped by causing an accident that looked almost professional.',
    ],
  },
  {
    id: 'backstage-corridor',
    image: '/entertainment/billy/quest-for-juice/panel-99.webp',
    title: 'Backstage Corridor',
    text: [
      'Behind the curtain, the circus became quieter and stranger.',
      'The mirrors at the end of the hallway seemed to know Billy before Billy had introduced himself.',
    ],
  },
  {
    id: 'magic-mirror-room',
    image: '/entertainment/billy/quest-for-juice/panel-100.webp',
    title: 'Magic Mirror Room',
    text: [
      'Billy stood in a room full of versions of Billy.',
      'Some looked brave. Some looked tired. One looked like he understood taxes, which was the most frightening reflection.',
    ],
  },
  {
    id: 'tiger-shadow',
    image: '/entertainment/billy/quest-for-juice/panel-101.webp',
    title: 'Tiger Shadow',
    text: [
      'Tiger Khan entered the mirrors before he entered the room.',
      'His shadow arrived first, larger than his body and probably worse at apologizing.',
    ],
  },
  {
    id: 'mirror-labyrinth-chase',
    image: '/entertainment/billy/quest-for-juice/panel-102.webp',
    title: 'Mirror Labyrinth Chase',
    text: [
      'The hallway became a maze of exits that were mostly lies.',
      'Billy ran past a hundred Billys, none of whom looked like they had a plan.',
    ],
  },
  {
    id: 'tiger-fight-in-mirrors',
    image: '/entertainment/billy/quest-for-juice/panel-103.webp',
    title: 'Tiger Fight In Mirrors',
    text: [
      'There was nowhere left to run without becoming a reflection.',
      'Billy turned around, which was inconveniently similar to courage.',
    ],
  },
  {
    id: 'broken-mirrors',
    image: '/entertainment/billy/quest-for-juice/panel-104.webp',
    title: 'Broken Mirrors',
    text: [
      'The mirrors broke into futures.',
      'Billy saw versions of himself scattered across desert, ocean, office, space, sofa, and places that had not happened yet.',
    ],
  },
  {
    id: 'two-futures',
    image: '/entertainment/billy/quest-for-juice/panel-105.webp',
    title: 'Two Futures',
    text: [
      'Two pieces of glass glowed brighter than the others.',
      'One future ended with victory. The other ended with somebody changing.',
    ],
    choices: [
      { id: 'fight', label: 'Fight the tiger' },
      { id: 'see', label: 'Look deeper' },
    ],
  },
  {
    id: 'tiger-sees-himself',
    image: '/entertainment/billy/quest-for-juice/panel-106.webp',
    title: 'Tiger Sees Himself',
    text: [
      'Tiger Khan hit the floor and saw his whole life looking back.',
      'This was rude of the mirrors, but possibly useful.',
    ],
  },
  {
    id: 'tiger-misunderstanding',
    image: '/entertainment/billy/quest-for-juice/panel-107.webp',
    title: 'Tiger Tries To Explain',
    text: [
      'Tiger reached out to say something soft.',
      'Billy saw the paw, misunderstood the entire emotional development, and ran for his life.',
    ],
  },
  {
    id: 'tigers-bad-guy-home',
    image: '/entertainment/billy/quest-for-juice/panel-108.webp',
    title: "Tiger's Bad Guy Home",
    text: [
      'Tiger Khan went home and looked at the evidence.',
      'It turned out a villain apartment is mostly a museum of bad decisions with dramatic lighting.',
    ],
  },
  {
    id: 'tiger-quits',
    image: '/entertainment/billy/quest-for-juice/panel-109.webp',
    title: 'Tiger Quits',
    text: [
      'By morning, Tiger had packed the leather jacket away.',
      'The old ukulele still remembered him, which was embarrassing and also kind.',
    ],
  },
  {
    id: 'tiny-ship-out',
    image: '/entertainment/billy/quest-for-juice/panel-110.webp',
    title: 'Tiny Ship Out Of New Babylon',
    text: [
      'Tiger left New Babylon on a ship far too small for his history.',
      'The sunset did not forgive him. It simply gave him somewhere else to begin.',
    ],
    medal: 'Tiger Took The Ukulele',
  },
  {
    id: 'crocodile-rooftop-yoga',
    image: '/entertainment/billy/quest-for-juice/panel-111.webp',
    title: 'Crocodile Rooftop Yoga',
    text: [
      'Above Crocodile Corp, Jack stretched beside Juice stashes and money crates with total spiritual confidence.',
      'New Babylon continued panicking below. Jack breathed in. Jack monetized the exhale.',
    ],
  },
  {
    id: 'edge-of-the-desert-line',
    image: '/entertainment/billy/quest-for-juice/panel-112.webp',
    title: 'The Edge Of The Desert Line',
    text: [
      'The train station at the edge of New Babylon smelled like brass, dust, and plans that had not been checked.',
      'Billy looked at the desert. The desert looked back with excellent silence.',
    ],
  },
  {
    id: 'desert-border-station',
    image: '/entertainment/billy/quest-for-juice/panel-113.webp',
    title: 'Desert Border Station',
    text: [
      'By noon, the city had become a blue mistake on the horizon.',
      'A lizard porter carried too much luggage with the dignity of someone who had seen worse travelers.',
    ],
  },
  {
    id: 'sand-scooter-yard',
    image: '/entertainment/billy/quest-for-juice/panel-146.webp',
    title: 'The Sand Scooter Yard',
    text: [
      'Behind the station, old sand scooters slept under canvas like retired insects.',
      'The lizard porter tapped one engine and announced that it had character, which was not the same as brakes.',
    ],
  },
  {
    id: 'how-to-ride-badly',
    image: '/entertainment/billy/quest-for-juice/panel-147.webp',
    title: 'How To Ride Badly',
    text: [
      'Billy learned the throttle, the balance fin, and the sacred desert rule: never argue with loose sand.',
      'Big Potato Man sat on a scooter. The scooter immediately reconsidered its beliefs.',
    ],
  },
  {
    id: 'lizard-hangs-on',
    image: '/entertainment/billy/quest-for-juice/panel-148.webp',
    title: 'The Lizard Hangs On',
    text: [
      'The porter refused to drive. Then he climbed onto the back anyway, holding three bags, one kettle, and a professional expression.',
      'He said he was only coming until the wind changed. The wind changed immediately and betrayed everyone.',
    ],
  },
  {
    id: 'tiny-sand-scooter',
    image: '/entertainment/billy/quest-for-juice/panel-114.webp',
    title: 'Tiny Sand Scooter',
    text: [
      'The vehicle was too small for adventure, which made it perfect for adventure.',
      'Behind them, two riders appeared in the heat, elegant enough to be trouble.',
    ],
  },
  {
    id: 'scooter-desert-rhythm',
    image: '/entertainment/billy/quest-for-juice/panel-149.webp',
    title: 'Scooter Desert Rhythm',
    text: [
      'Once the wheels found the dune rhythm, the desert stopped feeling empty and started feeling fast.',
      'The lizard leaned left, Billy leaned right, and Big Potato Man leaned spiritually.',
    ],
  },
  {
    id: 'spice-town-blue-hour',
    image: '/entertainment/billy/quest-for-juice/panel-115.webp',
    title: 'Spice Town At Blue Hour',
    text: [
      'The desert opened into lanterns, tiles, music, spice, and water speaking softly in the dark.',
      'Billy suddenly understood that survival could also be beautiful.',
    ],
  },
  {
    id: 'hidden-map-room',
    image: '/entertainment/billy/quest-for-juice/panel-116.webp',
    title: 'The Hidden Map Room',
    text: [
      'Behind a carpet shop, an old mapmaker unfolded the desert without flattening its mystery.',
      'The route glowed gently. Big Potato Man held the lamp like a serious potato moon.',
    ],
  },
  {
    id: 'moonlit-ambush',
    image: '/entertainment/billy/quest-for-juice/panel-117.webp',
    title: 'Moonlit Ambush',
    text: [
      'They left the town under a clean moon and followed the map line into the dunes.',
      'Then the dunes stood up and became bandits.',
    ],
  },
  {
    id: 'theatrical-toll',
    image: '/entertainment/billy/quest-for-juice/panel-118.webp',
    title: 'The Theatrical Toll',
    text: [
      'The ambush became a negotiation with excellent scarves.',
      'The bandits wanted Juice, but not for greed. The wells had gone quiet.',
    ],
  },
  {
    id: 'reluctant-guide',
    image: '/entertainment/billy/quest-for-juice/panel-119.webp',
    title: 'The Reluctant Guide',
    text: [
      'By dawn, the bandit leader had become their guide, which is what happens when danger has local knowledge.',
      'He pointed toward the storm. Billy tried to look like storms were in his skill set.',
    ],
  },
  {
    id: 'sandstorm-sail',
    image: '/entertainment/billy/quest-for-juice/panel-120.webp',
    title: 'Sandstorm Sail',
    text: [
      'The storm arrived like the desert clearing its throat.',
      'Their plan involved fabric, rope, courage, and no meaningful engineering.',
    ],
  },
  {
    id: 'inside-the-dust',
    image: '/entertainment/billy/quest-for-juice/panel-150.webp',
    title: 'Inside The Dust',
    text: [
      'Inside the storm, daylight became bronze and every shadow looked older than the desert.',
      'A giant scorpion shape crossed the dust wall. It may have been real. It may have been fear wearing legs.',
    ],
  },
  {
    id: 'ghosts-in-the-gust',
    image: '/entertainment/billy/quest-for-juice/panel-151.webp',
    title: 'Ghosts In The Gust',
    text: [
      'The wind showed them ruined towers, old caravans, and faces made from sand reflections.',
      'The lizard closed his eyes and listened, because some maps are heard before they are seen.',
    ],
  },
  {
    id: 'lizard-saves-the-line',
    image: '/entertainment/billy/quest-for-juice/panel-152.webp',
    title: 'The Lizard Saves The Line',
    text: [
      'When the scooter slid toward a black drop, the lizard hooked his tail around the guide rope.',
      'Nobody had respected the tail enough. The tail accepted their apology later.',
    ],
  },
  {
    id: 'after-the-storm',
    image: '/entertainment/billy/quest-for-juice/panel-121.webp',
    title: 'After The Storm',
    text: [
      'Morning found them half-buried but still officially alive.',
      'The guide made tea, because some people respond to disaster with culture.',
    ],
  },
  {
    id: 'oasis-reflection',
    image: '/entertainment/billy/quest-for-juice/panel-122.webp',
    title: 'The Oasis Reflection',
    text: [
      'The oasis did not announce itself. It simply appeared where thirst had become convincing.',
      'In the water, Billy saw a golden constellation shaped like a question.',
    ],
  },
  {
    id: 'door-behind-the-water',
    image: '/entertainment/billy/quest-for-juice/panel-123.webp',
    title: 'The Door Behind The Water',
    text: [
      'Behind the waterfall, stone steps opened into a light that had been waiting underground.',
      'The desert had not ended. It had become deeper.',
    ],
  },
  {
    id: 'steps-under-the-oasis',
    image: '/entertainment/billy/quest-for-juice/panel-124.webp',
    title: 'Steps Under The Oasis',
    text: [
      'The passage was cool, wet, and older than anybody who was willing to explain it.',
      'Billy walked down carefully. Big Potato Man introduced his head to several low arches.',
    ],
  },
  {
    id: 'underground-train-platform',
    image: '/entertainment/billy/quest-for-juice/panel-125.webp',
    title: 'The Underground Train Platform',
    text: [
      'At the bottom, an old train waited under the desert like a secret that preferred brass.',
      'Big Potato Man distrusted underground public transport, which was fair.',
    ],
  },
  {
    id: 'mineral-tunnel-train',
    image: '/entertainment/billy/quest-for-juice/panel-126.webp',
    title: 'The Mineral Tunnel',
    text: [
      'The train woke up and carried them through blue crystal darkness.',
      'Billy leaned into wonder. Big Potato Man leaned into the window frame because there was no space.',
    ],
  },
  {
    id: 'ruby-mine-city',
    image: '/entertainment/billy/quest-for-juice/panel-127.webp',
    title: 'Ruby City Under The Dunes',
    text: [
      'The tunnel opened into a city built around red light and patient hands.',
      'The rubies glowed like hearts that had learned architecture.',
    ],
  },
  {
    id: 'kiwi-market-tragedy',
    image: '/entertainment/billy/quest-for-juice/panel-128.webp',
    title: 'The Kiwi Market Tragedy',
    text: [
      'In the market square, a cracked kiwi idol had caused a public emotional emergency.',
      'Billy knelt down gently. Big Potato Man offered a handkerchief too small for history.',
    ],
  },
  {
    id: 'dry-golden-spring',
    image: '/entertainment/billy/quest-for-juice/panel-129.webp',
    title: 'The Dry Golden Spring',
    text: [
      'Then the elders showed them the real problem.',
      'The spring that fed the wells had almost stopped. One drop remained, glowing like a tiny responsibility.',
    ],
  },
  {
    id: 'spring-chooses-silence',
    image: '/entertainment/billy/quest-for-juice/panel-130.webp',
    title: 'The Spring Chooses Silence',
    text: [
      'Nobody shouted. Even Big Potato Man understood that some problems are too old for noise.',
      'A lizard elder pointed at the last drop as if it were a tiny sun with rent to pay.',
    ],
  },
  {
    id: 'brass-route',
    image: '/entertainment/billy/quest-for-juice/panel-131.webp',
    title: 'The Brass Route',
    text: [
      'Under the dust, the elders unfolded an old brass map of wells, rail lines, and forgotten desert towns.',
      'The route did not promise answers. It promised heat, mystery, and questionable transport.',
    ],
  },
  {
    id: 'desert-postcard-morning',
    image: '/entertainment/billy/quest-for-juice/panel-132.webp',
    title: 'Desert Postcard Morning',
    text: [
      'At sunrise, Billy and Big Potato Man left Ruby City on a sand train that looked more confident than it sounded.',
      'The desert opened like an old travel poster, then immediately charged them for the privilege.',
    ],
  },
  {
    id: 'lizard-town-of-wind-clocks',
    image: '/entertainment/billy/quest-for-juice/panel-133.webp',
    title: 'The Lizard Town Of Wind Clocks',
    text: [
      'The next town measured time with wind clocks, tea steam, and the angle of suspicious reptiles.',
      'Billy tried to look like a serious explorer. A small lizard sold him a hat with emotional damage.',
    ],
  },
  {
    id: 'future-well',
    image: '/entertainment/billy/quest-for-juice/panel-134.webp',
    title: 'The Future Well',
    text: [
      'In the square, an ancient well had been rebuilt with mirrors, brass pipes, and a little light geometry.',
      'The desert did not hate the future. It simply preferred when the future removed its shoes.',
    ],
  },
  {
    id: 'potato-hears-city-calling',
    image: '/entertainment/billy/quest-for-juice/panel-135.webp',
    title: 'Potato Hears The City Calling',
    text: [
      'That evening, a message arrived from the towns behind them. The wells were failing faster than expected.',
      'Big Potato Man stared at the horizon with the face of someone realizing loyalty can split in two directions.',
    ],
  },
  {
    id: 'two-roads-at-dune-gate',
    image: '/entertainment/billy/quest-for-juice/panel-136.webp',
    title: 'Two Roads At The Dune Gate',
    text: [
      'At the dune gate, the map divided. One road led back to help the towns. The other led deeper toward the source.',
      'They hugged with great dignity, except for the part where Potato cried directly into Billys ear.',
    ],
  },
  {
    id: 'billy-alone-with-too-much-sand',
    image: '/entertainment/billy/quest-for-juice/panel-137.webp',
    title: 'Billy Alone With Too Much Sand',
    text: [
      'For the first time in a long while, Billy walked without footsteps beside him.',
      'The desert became very large. His cup became very small. Both facts were rude but useful.',
    ],
  },
  {
    id: 'old-aeropostale-tower',
    image: '/entertainment/billy/quest-for-juice/panel-138.webp',
    title: 'The Old Aeropostale Tower',
    text: [
      'By noon, he found an abandoned mail tower where old pilots had once crossed the dunes by nerve and bad weather.',
      'A plane slept inside, wearing dust like a veteran coat.',
    ],
  },
  {
    id: 'map-in-the-propeller',
    image: '/entertainment/billy/quest-for-juice/panel-139.webp',
    title: 'The Map In The Propeller',
    text: [
      'When the propeller turned, its shadow drew a second map across the floor.',
      'Billy respected this because normal maps rarely require aviation archaeology.',
    ],
  },
  {
    id: 'sand-racers-at-dusk',
    image: '/entertainment/billy/quest-for-juice/panel-140.webp',
    title: 'Sand Racers At Dusk',
    text: [
      'At dusk, the dunes filled with racers chasing the same lost water route.',
      'Their engines screamed. Billys plan was mostly balance, luck, and not becoming a cautionary stain.',
    ],
  },
  {
    id: 'mirage-market',
    image: '/entertainment/billy/quest-for-juice/panel-141.webp',
    title: 'The Mirage Market',
    text: [
      'The race ended at a market that appeared only when the sun got theatrical.',
      'Every stall sold something impossible. Billy bought a compass that apologized before pointing north.',
    ],
  },
  {
    id: 'quiet-idol',
    image: '/entertainment/billy/quest-for-juice/panel-142.webp',
    title: 'The Quiet Idol',
    text: [
      'Behind the market, a small shrine held an old pineapple idol with no jewels and no drama.',
      'It was more powerful that way. Billy found this suspicious.',
    ],
  },
  {
    id: 'blue-letter',
    image: '/entertainment/billy/quest-for-juice/panel-143.webp',
    title: 'The Blue Letter',
    text: [
      'A desert courier arrived with a blue letter from Big Potato Man.',
      'It only said: Still helping. Still enormous. Do not die before dinner.',
    ],
  },
  {
    id: 'dune-observatory',
    image: '/entertainment/billy/quest-for-juice/panel-144.webp',
    title: 'The Dune Observatory',
    text: [
      'Night brought Billy to an observatory made of brass, old stone, and stubborn hope.',
      'Above him, the stars arranged themselves into a route that looked almost polite.',
    ],
  },
  {
    id: 'road-past-the-map',
    image: '/entertainment/billy/quest-for-juice/panel-145.webp',
    title: 'The Road Past The Map',
    text: [
      'By morning, the map had ended. The road had not.',
      'Billy stepped forward anyway, because adventure often begins where the instructions become useless.',
    ],
  },
];
