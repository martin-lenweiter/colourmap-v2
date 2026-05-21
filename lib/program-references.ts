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
};

export function getProgramReferences(programKey: string): string[] {
  return PROGRAM_REFERENCES[programKey] ?? DEFAULT_REFERENCES;
}
