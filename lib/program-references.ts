const DEFAULT_REFERENCES = [
  'Keep a personal notebook beside this program and write one practical sentence after reading.',
  'Use the program keywords as search terms for one good article, lecture, or book chapter.',
];

export const PROGRAM_REFERENCES: Record<string, string[]> = {
  'carl-jung': [
    'Carl Jung, Man and His Symbols.',
    'Carl Jung, Memories, Dreams, Reflections.',
    'Marie-Louise von Franz, The Way of the Dream.',
  ],
  'paulo-freire': [
    'Paulo Freire, Pedagogy of the Oppressed.',
    'Paulo Freire, Pedagogy of Hope.',
    'bell hooks, Teaching to Transgress.',
    'Teachers Institute, Paulo Freire’s Pedagogy: Education as a Practice of Freedom.',
  ],
  'thich-nhat-hanh': [
    'Thich Nhat Hanh, Peace Is Every Step.',
    'Thich Nhat Hanh, The Miracle of Mindfulness.',
    'Thich Nhat Hanh, No Mud, No Lotus.',
  ],
  gandhi: [
    'M. K. Gandhi, The Story of My Experiments with Truth.',
    'M. K. Gandhi, Hind Swaraj.',
    'Louis Fischer, The Life of Mahatma Gandhi.',
  ],
  'clear-allen': [
    'James Clear, Atomic Habits.',
    'David Allen, Getting Things Done.',
    'Cal Newport, Deep Work.',
  ],
  'money-anxiety': [
    'Brad Klontz and Ted Klontz, Mind Over Money.',
    'Sendhil Mullainathan and Eldar Shafir, Scarcity.',
    'Ramit Sethi, I Will Teach You to Be Rich.',
  ],
  'conflict-repair': [
    'John Gottman and Nan Silver, The Seven Principles for Making Marriage Work.',
    'Douglas Stone, Bruce Patton, and Sheila Heen, Difficult Conversations.',
    'Marshall Rosenberg, Nonviolent Communication.',
  ],
  'identity-becoming': [
    'Dan P. McAdams, The Stories We Live By.',
    'James Marcia on identity status and identity development.',
    'Charles Taylor, Sources of the Self.',
  ],
  'avoidance-action': [
    'Steven Pressfield, The War of Art.',
    'Piers Steel, The Procrastination Equation.',
    'David Burns, Feeling Good, especially the anti-procrastination techniques.',
  ],
  'viktor-frankl': [
    "Viktor Frankl, Man's Search for Meaning.",
    'Viktor Frankl, The Will to Meaning.',
    'Viktor Frankl, The Doctor and the Soul.',
  ],
  'bukowski-poems': [
    'Charles Bukowski, The Last Night of the Earth Poems.',
    'Charles Bukowski, Love Is a Dog from Hell.',
    'Read next: Bluebird, The Laughing Heart, Roll the Dice, Nirvana, and The Genius of the Crowd.',
  ],
  'jack-london': [
    'Jack London, The Call of the Wild.',
    'Jack London, White Fang.',
    'Jack London, To Build a Fire, Martin Eden, and The Sea-Wolf.',
  ],
  'jules-verne': [
    'Jules Verne, Journey to the Center of the Earth.',
    'Jules Verne, Twenty Thousand Leagues Under the Seas.',
    'Jules Verne, Around the World in Eighty Days.',
    'Jules Verne, From the Earth to the Moon.',
    'Jules Verne, The Mysterious Island.',
  ],
  'maya-angelou': [
    'Maya Angelou, I Know Why the Caged Bird Sings.',
    'Maya Angelou, And Still I Rise.',
    'Maya Angelou, The Heart of a Woman.',
  ],
  'plato-cave': [
    'Plato, Republic, Book VII, the Allegory of the Cave.',
    'Pierre Hadot, Philosophy as a Way of Life.',
    'Shoshana Zuboff, The Age of Surveillance Capitalism, for a modern attention-system contrast.',
  ],
  'alan-watts': [
    'Alan Watts, The Wisdom of Insecurity.',
    'Alan Watts, The Book: On the Taboo Against Knowing Who You Are.',
    'Listen to Watts talks on music, dancing, and treating life as play rather than only progress.',
  ],
  'david-hawkins': [
    'David R. Hawkins, Power vs. Force.',
    'David R. Hawkins, Letting Go.',
    'Read critically: his consciousness calibrations are disputed, but his state-pattern language can be used symbolically.',
  ],
  nietzsche: [
    'Friedrich Nietzsche, Thus Spoke Zarathustra.',
    'Friedrich Nietzsche, The Gay Science.',
    'Friedrich Nietzsche, Beyond Good and Evil.',
  ],
  'campbell-hero-quest': [
    'Joseph Campbell, The Hero with a Thousand Faces.',
    'Joseph Campbell, The Power of Myth.',
    'Christopher Vogler, The Writer’s Journey.',
  ],
  'emotional-intelligence': [
    'Daniel Goleman, Emotional Intelligence.',
    'Marc Brackett, Permission to Feel.',
    'Lisa Feldman Barrett, How Emotions Are Made.',
  ],
  'nervous-system': [
    'Deb Dana, Anchored.',
    'Bessel van der Kolk, The Body Keeps the Score.',
    'Dan Siegel, The Developing Mind.',
  ],
  grief: [
    "Megan Devine, It's OK That You're Not OK.",
    'Pauline Boss, Ambiguous Loss.',
    'Klass, Silverman, and Nickman, Continuing Bonds.',
  ],
  'deep-attention': [
    'Cal Newport, Deep Work.',
    'Jenny Odell, How to Do Nothing.',
    'Nicholas Carr, The Shallows.',
  ],
  'artificial-intelligence': [
    'Melanie Mitchell, Artificial Intelligence: A Guide for Thinking Humans.',
    'Brian Christian, The Alignment Problem.',
    'Kate Crawford, Atlas of AI.',
  ],
  'ai-future': [
    'Brian Christian, The Alignment Problem.',
    'Stuart Russell, Human Compatible.',
    'Kai-Fu Lee and Chen Qiufan, AI 2041.',
  ],
  'economic-systems': [
    'Adam Smith, The Wealth of Nations.',
    'Karl Marx, Capital and The Communist Manifesto.',
    'John Maynard Keynes, The General Theory of Employment, Interest and Money.',
    'Friedrich Hayek, The Use of Knowledge in Society.',
    'Karl Polanyi, The Great Transformation.',
    'Elinor Ostrom, Governing the Commons.',
    'Amartya Sen, Development as Freedom.',
    'Kate Raworth, Doughnut Economics.',
    'Thomas Piketty, Capital in the Twenty-First Century.',
    'Mariana Mazzucato, Mission Economy.',
  ],
  'planetary-ecology': [
    'IPCC, Sixth Assessment Report: Synthesis Report.',
    'IPBES, Global Assessment Report on Biodiversity and Ecosystem Services.',
    'UNEP, Emissions Gap Report.',
    "FAO, The State of the World's Forests.",
    'IEA, World Energy Outlook and renewables reports.',
    'Suzanne Simard, Finding the Mother Tree.',
    'Robin Wall Kimmerer, Braiding Sweetgrass.',
  ],
  'future-transitions': [
    'IMF, Artificial Intelligence and the Future of Work.',
    'ILO, Generative AI and Jobs.',
    'OECD, Artificial Intelligence and the Future of Skills.',
    'WTO, World Trade Report.',
    'World Bank, Global Economic Prospects.',
    'Stuart Russell, Human Compatible.',
    'Kai-Fu Lee and Chen Qiufan, AI 2041.',
    'Mariana Mazzucato, Mission Economy.',
  ],
};

export function getProgramReferences(programKey: string): string[] {
  return PROGRAM_REFERENCES[programKey] ?? DEFAULT_REFERENCES;
}
