export type AtlasNodeKind =
  | 'reality'
  | 'tool'
  | 'progress'
  | 'wound'
  | 'ai'
  | 'emotional'
  | 'future';

export type AtlasStep =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'stat';
      value: string;
      label: string;
      source: string;
    }
  | {
      type: 'action';
      text: string;
    };

export type AtlasNode = {
  id: string;
  kind: AtlasNodeKind;
  title: string;
  short: string;
  x: number;
  y: number;
  color: string;
  steps: AtlasStep[];
  links: string[];
};

export const HUMAN_PROGRESS_ATLAS = {
  title: 'The Human Progress Atlas',
  subtitle: 'One warm road from survival pressure toward a more human future.',
  opening:
    'Human life has already changed many times. This is one road: from survival pressure, through tools and progress, toward emotional intelligence and a more peaceful future.',
  nodes: [
    {
      id: 'harder',
      kind: 'reality',
      title: 'Life Was Harder',
      short: 'For most of history, survival was the main project.',
      x: 12,
      y: 64,
      color: '#B88A58',
      links: ['tools'],
      steps: [
        {
          type: 'text',
          text: 'For much of history, ordinary life was shaped by hunger, disease, isolation, violence, and short life expectancy.',
        },
        {
          type: 'action',
          text: 'A useful act: when the world feels broken, remember that conditions can change because they already have.',
        },
      ],
    },
    {
      id: 'tools',
      kind: 'tool',
      title: 'Tools Changed Life',
      short:
        'Sanitation, medicine, energy, education, rights, and communication changed the baseline.',
      x: 26,
      y: 48,
      color: '#C8A05E',
      links: ['progress'],
      steps: [
        {
          type: 'text',
          text: 'Human progress often begins when a tool makes a basic burden lighter.',
        },
        {
          type: 'text',
          text: 'Clean water, electricity, vaccines, schools, and communication networks changed what a normal life could contain.',
        },
        {
          type: 'action',
          text: 'A useful act: ask which burden one tool, habit, or system could make lighter today.',
        },
      ],
    },
    {
      id: 'progress',
      kind: 'progress',
      title: 'Quality Of Life Improved',
      short: 'The data is imperfect, but the direction of many human basics is real.',
      x: 41,
      y: 34,
      color: '#A8B870',
      links: ['wounds'],
      steps: [
        {
          type: 'stat',
          value: '2x+',
          label: 'Global life expectancy has more than doubled since the pre-modern era.',
          source: 'Our World in Data / UN historical estimates',
        },
        {
          type: 'stat',
          value: '80%+',
          label: 'Most adults in the world can now read and write, a radical historical shift.',
          source: 'UNESCO / World Bank literacy data',
        },
        {
          type: 'text',
          text: 'This does not mean the world is fine. It means large-scale improvement is possible.',
        },
      ],
    },
    {
      id: 'wounds',
      kind: 'wound',
      title: 'What Still Hurts',
      short:
        'Loneliness, anxiety, inequality, burnout, conflict, and ecological pressure remain real.',
      x: 56,
      y: 45,
      color: '#A07888',
      links: ['ai'],
      steps: [
        {
          type: 'text',
          text: 'Progress did not automatically teach us how to belong, regulate, trust, forgive, or live with meaning.',
        },
        {
          type: 'action',
          text: 'A useful act: name one pressure clearly, then choose one support instead of trying to solve everything.',
        },
      ],
    },
    {
      id: 'ai',
      kind: 'ai',
      title: 'AI As A New Tool',
      short: 'AI can amplify access, creativity, pattern recognition, and learning.',
      x: 70,
      y: 60,
      color: '#78A8A8',
      links: ['emotional'],
      steps: [
        {
          type: 'text',
          text: 'AI is not the meaning of the future. It is a new tool that can amplify what humans choose to build.',
        },
        {
          type: 'text',
          text: 'Used well, it can help people learn faster, create more freely, notice hidden patterns, and coordinate care.',
        },
        {
          type: 'action',
          text: 'A useful act: use AI to clarify one question, not to replace your own judgement.',
        },
      ],
    },
    {
      id: 'emotional',
      kind: 'emotional',
      title: 'The Missing Technology',
      short: 'The next frontier may be emotional intelligence, belonging, and collective trust.',
      x: 82,
      y: 42,
      color: '#D0A068',
      links: ['future'],
      steps: [
        {
          type: 'text',
          text: 'Material tools improved life. The missing technology may be emotional: how we understand states, repair connection, and build peaceful systems.',
        },
        {
          type: 'action',
          text: 'A useful act: one honest sentence, one repair attempt, or one moment of regulation can change the social field around you.',
        },
      ],
    },
    {
      id: 'future',
      kind: 'future',
      title: 'A Beautiful World Is Buildable',
      short: 'Better tools plus better inner life could unlock enormous human happiness.',
      x: 91,
      y: 23,
      color: '#D8C878',
      links: [],
      steps: [
        {
          type: 'text',
          text: 'Our potential for happiness is enormous. A more human, emotionally smart, peaceful, united world is not guaranteed, but it is buildable.',
        },
        {
          type: 'action',
          text: 'A useful act: keep one part of the future open, then make one small move that belongs to that future.',
        },
      ],
    },
  ] satisfies AtlasNode[],
};
