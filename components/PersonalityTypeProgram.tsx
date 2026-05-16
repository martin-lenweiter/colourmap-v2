'use client';

import { useMemo, useState } from 'react';

const SERIF = 'var(--font-serif)';

type AxisId = 'openness' | 'structure' | 'socialEnergy' | 'care' | 'emotionalWeather' | 'storyLens';

type TestMode = 'colourmap' | 'tipi' | 'imageLens';
type VisualStyle = 'field' | 'symbolic';
type DepthLevel = 1 | 2 | 3;
type StyleId =
  | 'visionary-improviser'
  | 'vision-builder'
  | 'warm-connector'
  | 'sensitive-creator'
  | 'grounded-operator'
  | 'living-mix';

type Choice = {
  label: string;
  value: number;
};

type PersonalityQuestion = {
  id: string;
  axis: AxisId;
  level: DepthLevel;
  part?: string;
  text: string;
  hint: string;
  low: string;
  high: string;
};

type AxisDefinition = {
  id: AxisId;
  label: string;
  short: string;
  color: string;
  image: string;
  symbolicImage: string;
  lowName: string;
  highName: string;
  giftLow: string;
  giftHigh: string;
  frictionLow: string;
  frictionHigh: string;
  bridgeLow: string;
  bridgeHigh: string;
};

type EducationRecommendation = {
  title: string;
  program: string;
  reason: string;
  practice: string;
  color: string;
};

const CHOICES: Choice[] = [
  { label: 'not really', value: 1 },
  { label: 'sometimes', value: 2 },
  { label: 'yes, often', value: 3 },
];

const TIPI_CHOICES: Choice[] = [
  { label: 'strongly disagree', value: 1 },
  { label: 'disagree', value: 2 },
  { label: 'slightly disagree', value: 3 },
  { label: 'neutral', value: 4 },
  { label: 'slightly agree', value: 5 },
  { label: 'agree', value: 6 },
  { label: 'strongly agree', value: 7 },
];

type TipiTrait =
  | 'extraversion'
  | 'agreeableness'
  | 'conscientiousness'
  | 'emotionalStability'
  | 'openness';

type TipiQuestion = {
  id: string;
  trait: TipiTrait;
  reverse?: boolean;
  text: string;
};

type ImageLensItem = {
  id: string;
  axis: AxisId;
  block: string;
  title: string;
  prompt: string;
  symbol:
    | 'gate'
    | 'river'
    | 'tower'
    | 'fire'
    | 'seed'
    | 'mirror'
    | 'road'
    | 'storm'
    | 'sun'
    | 'room'
    | 'bridge'
    | 'mask'
    | 'garden'
    | 'mountain'
    | 'star';
  color: string;
};

const TIPI_QUESTIONS: TipiQuestion[] = [
  { id: 'tipi-1', trait: 'extraversion', text: 'Extraverted, enthusiastic' },
  { id: 'tipi-2', trait: 'agreeableness', reverse: true, text: 'Critical, quarrelsome' },
  { id: 'tipi-3', trait: 'conscientiousness', text: 'Dependable, self-disciplined' },
  { id: 'tipi-4', trait: 'emotionalStability', reverse: true, text: 'Anxious, easily upset' },
  { id: 'tipi-5', trait: 'openness', text: 'Open to new experiences, complex' },
  { id: 'tipi-6', trait: 'extraversion', reverse: true, text: 'Reserved, quiet' },
  { id: 'tipi-7', trait: 'agreeableness', text: 'Sympathetic, warm' },
  { id: 'tipi-8', trait: 'conscientiousness', reverse: true, text: 'Disorganized, careless' },
  { id: 'tipi-9', trait: 'emotionalStability', text: 'Calm, emotionally stable' },
  { id: 'tipi-10', trait: 'openness', reverse: true, text: 'Conventional, uncreative' },
];

const TIPI_TRAITS: Array<{
  id: TipiTrait;
  label: string;
  color: string;
  low: string;
  high: string;
  meaning: string;
  lowGift: string;
  highGift: string;
  lowFriction: string;
  highFriction: string;
  pressure: string;
  bridge: string;
}> = [
  {
    id: 'extraversion',
    label: 'Extraversion',
    color: '#d99e9a',
    low: 'quiet processing',
    high: 'social charge',
    meaning: 'How your energy moves through people, stimulation, voice, and shared rhythm.',
    lowGift: 'You can hear your own signal and build depth away from noise.',
    highGift: 'You create momentum through contact, expression, and shared atmosphere.',
    lowFriction: 'Isolation can make one inner story feel too absolute.',
    highFriction: 'Stimulation can replace digestion when the system needs quiet.',
    pressure:
      'Under pressure, this trait asks whether you retreat inward or seek charge from the room.',
    bridge: 'Choose the dose: one honest message, one quiet walk, or one shared rhythm.',
  },
  {
    id: 'agreeableness',
    label: 'Agreeableness',
    color: '#9fbf8a',
    low: 'firm boundaries',
    high: 'warm harmony',
    meaning:
      'How you handle care, trust, conflict, repair, and the emotional field between people.',
    lowGift: 'You can protect direction and detect unfairness quickly.',
    highGift: 'You naturally seek repair, tenderness, and belonging.',
    lowFriction: 'Protection can become distance when connection would help.',
    highFriction: 'Harmony can cost too much if your own need disappears.',
    pressure:
      'Under pressure, this trait asks whether you harden, merge, repair, or avoid conflict.',
    bridge: 'Try warmth with a boundary: one kind sentence plus one clear need.',
  },
  {
    id: 'conscientiousness',
    label: 'Conscientiousness',
    color: '#c4a060',
    low: 'flexible flow',
    high: 'steady structure',
    meaning:
      'How intention becomes order, completion, rhythm, reliability, and visible next steps.',
    lowGift: 'You adapt fast and can improvise when plans are too rigid.',
    highGift: 'You can turn a wish into repeatable progress.',
    lowFriction: 'Loose ends can gather until they become emotional weight.',
    highFriction: 'Control can make living situations feel smaller than they need to be.',
    pressure: 'Under pressure, this trait asks whether you need freedom first or structure first.',
    bridge: 'Use tiny structure: one timer, one next action, one closure ritual.',
  },
  {
    id: 'emotionalStability',
    label: 'Emotional Stability',
    color: '#8faeb5',
    low: 'sensitive weather',
    high: 'steady weather',
    meaning: 'How strongly feelings, uncertainty, and body signals move through the day.',
    lowGift: 'You notice subtle signals and meaning early.',
    highGift: 'You can stay steady when the room becomes charged.',
    lowFriction: 'A feeling can become a whole world before it has been checked.',
    highFriction: 'Quiet emotional information may be missed until it gets louder.',
    pressure:
      'Under pressure, this trait asks whether the weather becomes the world or remains weather.',
    bridge: 'Name the feeling as weather first, then pick one grounded action.',
  },
  {
    id: 'openness',
    label: 'Openness',
    color: '#d8a7c4',
    low: 'concrete realism',
    high: 'imaginative range',
    meaning: 'How you relate to ideas, art, symbols, novelty, beauty, and possible futures.',
    lowGift: 'You keep life connected to what is real and usable.',
    highGift: 'You see possible worlds before they are obvious.',
    lowFriction: 'New paths may be dismissed before they have been tested.',
    highFriction: 'Possibility can multiply faster than completion.',
    pressure: 'Under pressure, this trait asks whether imagination becomes a bridge or an escape.',
    bridge: 'Give the idea a container: one sketch, one page, one practical experiment.',
  },
];

const IMAGE_LENS_CHOICES: Choice[] = [
  { label: 'I move toward it', value: 3 },
  { label: 'I feel unsure', value: 2 },
  { label: 'I move away from it', value: 1 },
];

const IMAGE_LENS_ITEMS: ImageLensItem[] = [
  {
    id: 'img-1',
    axis: 'openness',
    block: 'Block 1 / Inner Field',
    title: 'The Open Gate',
    prompt: 'When you see this future opening, what happens in your body?',
    symbol: 'gate',
    color: '#d8a7c4',
  },
  {
    id: 'img-2',
    axis: 'emotionalWeather',
    block: 'Block 1 / Inner Field',
    title: 'The River Under Fog',
    prompt: 'Does this feel like peace, confusion, or a place you already know?',
    symbol: 'river',
    color: '#8faeb5',
  },
  {
    id: 'img-3',
    axis: 'structure',
    block: 'Block 1 / Inner Field',
    title: 'The Ordered Tower',
    prompt: 'Does the structure feel supportive, heavy, or too controlled?',
    symbol: 'tower',
    color: '#c4a060',
  },
  {
    id: 'img-4',
    axis: 'socialEnergy',
    block: 'Block 1 / Inner Field',
    title: 'The Shared Fire',
    prompt: 'Does shared energy make you warmer or make you want distance?',
    symbol: 'fire',
    color: '#d99e9a',
  },
  {
    id: 'img-5',
    axis: 'storyLens',
    block: 'Block 1 / Inner Field',
    title: 'The Small Seed',
    prompt: 'Do you trust small beginnings, or do they feel too fragile?',
    symbol: 'seed',
    color: '#9fbf8a',
  },
  {
    id: 'img-6',
    axis: 'storyLens',
    block: 'Block 2 / Time Lens',
    title: 'The Old Mirror',
    prompt: 'When the past looks back, do you see lesson, grief, or identity?',
    symbol: 'mirror',
    color: '#e0b66e',
  },
  {
    id: 'img-7',
    axis: 'structure',
    block: 'Block 2 / Time Lens',
    title: 'The Road Ahead',
    prompt: 'Does a visible path calm you or make life feel too decided?',
    symbol: 'road',
    color: '#c4a060',
  },
  {
    id: 'img-8',
    axis: 'emotionalWeather',
    block: 'Block 2 / Time Lens',
    title: 'The Weather Front',
    prompt: 'Do you meet emotional weather as information or as danger?',
    symbol: 'storm',
    color: '#8faeb5',
  },
  {
    id: 'img-9',
    axis: 'openness',
    block: 'Block 2 / Time Lens',
    title: 'The Future Sun',
    prompt: 'Does the future feel like warmth, pressure, or something calling you?',
    symbol: 'sun',
    color: '#d8a7c4',
  },
  {
    id: 'img-10',
    axis: 'care',
    block: 'Block 2 / Time Lens',
    title: 'The Quiet Room',
    prompt: 'Does this room feel like safety, loneliness, or needed recovery?',
    symbol: 'room',
    color: '#9fbf8a',
  },
  {
    id: 'img-11',
    axis: 'structure',
    block: 'Block 3 / Action Bridge',
    title: 'The Bridge',
    prompt: 'When a bridge appears between worlds, do you want to cross now or wait?',
    symbol: 'bridge',
    color: '#c4a060',
  },
  {
    id: 'img-12',
    axis: 'care',
    block: 'Block 3 / Action Bridge',
    title: 'The Mask and Face',
    prompt: 'Do you feel more protected by being useful, impressive, quiet, or real?',
    symbol: 'mask',
    color: '#9fbf8a',
  },
  {
    id: 'img-13',
    axis: 'openness',
    block: 'Block 3 / Action Bridge',
    title: 'The Night Garden',
    prompt: 'Does hidden growth make you patient, restless, or doubtful?',
    symbol: 'garden',
    color: '#d8a7c4',
  },
  {
    id: 'img-14',
    axis: 'emotionalWeather',
    block: 'Block 3 / Action Bridge',
    title: 'The Mountain',
    prompt: 'Does the challenge feel climbable, too large, or strangely beautiful?',
    symbol: 'mountain',
    color: '#8faeb5',
  },
  {
    id: 'img-15',
    axis: 'storyLens',
    block: 'Block 3 / Action Bridge',
    title: 'The Star Map',
    prompt: 'Do scattered fragments feel like chaos or like a map forming?',
    symbol: 'star',
    color: '#e0b66e',
  },
];

const DEPTH_LEVELS: Array<{
  id: DepthLevel;
  label: string;
  short: string;
}> = [
  { id: 1, label: 'Quick Dive', short: '12 questions' },
  { id: 2, label: 'Level 2', short: 'pressure map' },
  { id: 3, label: 'Level 3', short: 'story bridge' },
];

const STYLE_PROFILES: Record<
  StyleId,
  {
    title: string;
    image: string;
    essence: string;
  }
> = {
  'visionary-improviser': {
    title: 'The Visionary Improviser',
    image: '/personality/types/visionary-improviser.svg',
    essence:
      'A future-maker with fast imagination, strong atmosphere, and a need for gentle containers.',
  },
  'vision-builder': {
    title: 'The Vision Builder',
    image: '/personality/types/vision-builder.svg',
    essence:
      'A maker who wants beauty to become real through rhythm, structure, and visible progress.',
  },
  'warm-connector': {
    title: 'The Warm Connector',
    image: '/personality/types/warm-connector.svg',
    essence:
      'A relational engine whose intelligence grows through contact, repair, and shared energy.',
  },
  'sensitive-creator': {
    title: 'The Sensitive Creator',
    image: '/personality/types/sensitive-creator.svg',
    essence:
      'A perceptive artist who turns subtle weather into meaning, images, language, and movement.',
  },
  'grounded-operator': {
    title: 'The Grounded Operator',
    image: '/personality/types/grounded-operator.svg',
    essence: 'A practical stabilizer who protects reality, completion, and usable next steps.',
  },
  'living-mix': {
    title: 'The Living Mix',
    image: '/personality/types/living-mix.svg',
    essence:
      'A changing constellation of modes. The task is not to pick one identity, but to move well.',
  },
};

const AXES: AxisDefinition[] = [
  {
    id: 'openness',
    label: 'Imagination',
    short: 'ideas, beauty, possibility',
    color: '#d8a7c4',
    image: '/personality/personality-openness.svg',
    symbolicImage: '/personality/personality-symbolic-openness.svg',
    lowName: 'Grounded realist',
    highName: 'Visionary explorer',
    giftLow: 'You keep ideas connected to what can actually happen.',
    giftHigh: 'You see possible worlds before other people can name them.',
    frictionLow: 'You may dismiss new paths too quickly when life needs experimentation.',
    frictionHigh: 'You can escape into possibilities when a simple practical move is needed.',
    bridgeLow: 'Try one harmless experiment before deciding the idea is unrealistic.',
    bridgeHigh: 'Give the idea one small container: one page, one timer, one next action.',
  },
  {
    id: 'structure',
    label: 'Structure',
    short: 'order, rhythm, completion',
    color: '#c4a060',
    image: '/personality/personality-structure.svg',
    symbolicImage: '/personality/personality-symbolic-structure.svg',
    lowName: 'Fluid improviser',
    highName: 'Steady builder',
    giftLow: 'You adapt fast and do not get trapped by rigid plans.',
    giftHigh: 'You can turn intention into repeatable progress.',
    frictionLow: 'Tiny unfinished things can accumulate until they become emotional weight.',
    frictionHigh: 'You may over-control the path when the living situation needs softness.',
    bridgeLow: 'Choose a tiny closure ritual: three lines, one file, one solved admin item.',
    bridgeHigh: 'Leave one part of the plan open so life can breathe.',
  },
  {
    id: 'socialEnergy',
    label: 'Social Energy',
    short: 'people, expression, stimulation',
    color: '#d99e9a',
    image: '/personality/personality-social.svg',
    symbolicImage: '/personality/personality-symbolic-social.svg',
    lowName: 'Quiet processor',
    highName: 'Charged connector',
    giftLow: 'You can hear your own signal without needing constant outside noise.',
    giftHigh: 'You create movement through contact, rhythm, and shared energy.',
    frictionLow: 'Isolation can make the story in your head feel more absolute than it is.',
    frictionHigh: 'You may chase stimulation when the body needs digestion and quiet.',
    bridgeLow: 'Send one honest message before disappearing into the inner room.',
    bridgeHigh: 'Add a quiet landing after social fire: walk, water, notes, breath.',
  },
  {
    id: 'care',
    label: 'Care',
    short: 'trust, tenderness, repair',
    color: '#9fbf8a',
    image: '/personality/personality-field.svg',
    symbolicImage: '/personality/personality-symbolic-care.svg',
    lowName: 'Boundary keeper',
    highName: 'Warm harmonizer',
    giftLow: 'You can protect your direction and notice when something is not fair.',
    giftHigh: 'You naturally seek repair, belonging, and emotional safety.',
    frictionLow: 'You may make protection feel like distance, even when connection would help.',
    frictionHigh: 'You may abandon your own needs to keep the room peaceful.',
    bridgeLow: 'Try one sentence of warmth without giving up your boundary.',
    bridgeHigh: 'Name your own need before solving the feeling of the room.',
  },
  {
    id: 'emotionalWeather',
    label: 'Emotional Weather',
    short: 'sensitivity, pressure, recovery',
    color: '#8faeb5',
    image: '/personality/personality-emotion.svg',
    symbolicImage: '/personality/personality-symbolic-emotion.svg',
    lowName: 'Even-weather navigator',
    highName: 'Sensitive antenna',
    giftLow: 'You can stay steady when others are pulled into the storm.',
    giftHigh: 'You notice subtle signals early and feel meaning with intensity.',
    frictionLow: 'You may miss quiet emotional information until it becomes louder.',
    frictionHigh: 'A feeling can become a whole world before it has been checked.',
    bridgeLow: 'Pause to ask what the body is saying before moving on.',
    bridgeHigh: 'Name the feeling as weather first, not destiny.',
  },
  {
    id: 'storyLens',
    label: 'Story Lens',
    short: 'the meaning you give the moment',
    color: '#e0b66e',
    image: '/personality/personality-results.svg',
    symbolicImage: '/personality/personality-symbolic-results.svg',
    lowName: 'Protective story',
    highName: 'Transforming story',
    giftLow: 'Your system tries to protect you from repeating old pain.',
    giftHigh: 'You can turn difficulty into learning, dignity, and direction.',
    frictionLow: 'The story can shrink your power by making the moment feel final.',
    frictionHigh: 'You may spiritualize pain too fast before grieving it honestly.',
    bridgeLow: 'Ask: what else could this mean besides failure?',
    bridgeHigh: 'Let the lesson include the loss. Power does not require denial.',
  },
];

const QUESTIONS: PersonalityQuestion[] = [
  {
    id: 'o1',
    axis: 'openness',
    level: 1,
    text: 'When pressure rises, I generate images, ideas, or future possibilities quickly.',
    hint: 'This is asking whether stress opens your imagination or makes you more concrete. Think about the last time pressure appeared, not your ideal self.',
    low: 'I stay concrete',
    high: 'I open many worlds',
  },
  {
    id: 'o2',
    axis: 'openness',
    level: 1,
    text: 'Beauty, music, symbols, or atmosphere can change how I understand my life.',
    hint: 'This means: can a song, image, visual mood, or symbol suddenly help you understand yourself or a situation differently?',
    low: 'Not central',
    high: 'Very central',
  },
  {
    id: 's1',
    axis: 'structure',
    level: 1,
    text: 'Small unfinished practical things affect my emotional state.',
    hint: 'This is about admin, bills, messages, files, or tiny loose ends. Do they stay in the background and change your mood?',
    low: 'I can ignore them',
    high: 'They weigh on me',
  },
  {
    id: 's2',
    axis: 'structure',
    level: 1,
    text: 'I feel stronger when my next steps are visible and ordered.',
    hint: 'This asks whether clarity of sequence gives you energy. Not whether you love rigid plans, but whether visible next steps calm the system.',
    low: 'I prefer flow',
    high: 'I need order',
  },
  {
    id: 'e1',
    axis: 'socialEnergy',
    level: 1,
    text: 'Being with people, rhythm, conversation, or shared energy brings me back to life.',
    hint: 'This can include friends, music, dance, collaboration, phone calls, or collective rhythm. Does contact restore you?',
    low: 'I recharge alone',
    high: 'I recharge through contact',
  },
  {
    id: 'e2',
    axis: 'socialEnergy',
    level: 1,
    text: 'When I am stuck, speaking it out loud changes the problem.',
    hint: 'This is about voice as a thinking tool. Some people understand by writing silently; others unlock the problem by saying it.',
    low: 'Writing is enough',
    high: 'Voice changes it',
  },
  {
    id: 'a1',
    axis: 'care',
    level: 1,
    text: 'I often sense what other people need before I name what I need.',
    hint: 'This is not asking if you are kind. It asks whether your attention first scans the room, the other person, or the relationship before your own need.',
    low: 'My boundary comes first',
    high: 'The room affects me',
  },
  {
    id: 'a2',
    axis: 'care',
    level: 1,
    text: 'Conflict or distance can stay in my body even when the practical problem is small.',
    hint: 'Think about tiny tension, coldness, unanswered messages, or disagreement. Does it linger physically or emotionally?',
    low: 'I detach fast',
    high: 'I carry it',
  },
  {
    id: 'n1',
    axis: 'emotionalWeather',
    level: 1,
    text: 'A mood can become a full atmosphere around the day.',
    hint: 'This asks whether a feeling remains one feeling, or whether it starts coloring the whole room, day, future, and sense of self.',
    low: 'It passes through',
    high: 'It colors everything',
  },
  {
    id: 'n2',
    axis: 'emotionalWeather',
    level: 1,
    text: 'I notice subtle signals in my body before I know what they mean.',
    hint: 'This could be tightness, fatigue, pressure, agitation, warmth, or unease before you have a clear explanation.',
    low: 'Not usually',
    high: 'Very often',
  },
  {
    id: 'story1',
    axis: 'storyLens',
    level: 1,
    text: 'When something hurts, part of me turns it into a story about who I am.',
    hint: 'Example: a delay becomes “I am behind,” a rejection becomes “I am not wanted,” or an unfinished task becomes “I cannot handle life.”',
    low: 'Less true',
    high: 'Very true',
  },
  {
    id: 'story2',
    axis: 'storyLens',
    level: 1,
    text: 'I can reframe struggle as material for growth without pretending it did not hurt.',
    hint: 'This is about honest transformation: can pain become learning while still being allowed to hurt first?',
    low: 'Hard for me now',
    high: 'Possible for me',
  },
  {
    id: 'o3',
    axis: 'openness',
    level: 2,
    text: 'When I feel unsafe, I often move toward future visions instead of the simple practical task.',
    hint: 'This checks whether imagination becomes relief under pressure. It can be beautiful and useful, but it can also postpone the survival task.',
    low: 'I stay with the task',
    high: 'I move to vision',
  },
  {
    id: 'o4',
    axis: 'openness',
    level: 2,
    text: 'A symbolic image, metaphor, or visual map can help me understand something faster than plain explanation.',
    hint: 'This is about visual intelligence: whether symbols give you the glimpse before the full text makes sense.',
    low: 'Text is clearer',
    high: 'Symbols unlock it',
  },
  {
    id: 's3',
    axis: 'structure',
    level: 2,
    text: 'I avoid structure when it feels like it will reduce my freedom.',
    hint: 'This asks whether plans feel supportive or imprisoning. The bridge may be soft structure, not stricter discipline.',
    low: 'Structure helps',
    high: 'Structure threatens freedom',
  },
  {
    id: 's4',
    axis: 'structure',
    level: 2,
    text: 'Once a practical task is mapped into small pieces, my resistance drops.',
    hint: 'Think of paperwork, money, files, or admin. Does making the map reduce the emotional size of the problem?',
    low: 'Not much',
    high: 'A lot',
  },
  {
    id: 'e3',
    axis: 'socialEnergy',
    level: 2,
    text: 'My ideas become more alive when I explain them to someone or to an AI.',
    hint: 'This is about conversation as a creative engine. Some people think privately; others need an audience or mirror.',
    low: 'Private is enough',
    high: 'Dialogue activates me',
  },
  {
    id: 'e4',
    axis: 'socialEnergy',
    level: 2,
    text: 'When I am low, music, rhythm, or movement can shift my state faster than thinking.',
    hint: 'This asks whether your system changes through embodied rhythm before verbal analysis catches up.',
    low: 'Thinking works first',
    high: 'Rhythm shifts me',
  },
  {
    id: 'a3',
    axis: 'care',
    level: 2,
    text: 'I sometimes confuse being useful with being loved or safe.',
    hint: 'This is a tender one. It asks whether care becomes performance, rescue, or proving value.',
    low: 'Less true',
    high: 'Very true',
  },
  {
    id: 'a4',
    axis: 'care',
    level: 2,
    text: 'I can be honest about my needs without feeling I am breaking harmony.',
    hint: 'This checks whether truth and tenderness can coexist, or whether honesty feels like danger.',
    low: 'Hard for me',
    high: 'Possible for me',
  },
  {
    id: 'n3',
    axis: 'emotionalWeather',
    level: 2,
    text: 'Uncertainty can make the future feel urgent, even before anything has actually happened.',
    hint: 'This asks whether the nervous system accelerates when facts are incomplete.',
    low: 'I wait for facts',
    high: 'I accelerate',
  },
  {
    id: 'n4',
    axis: 'emotionalWeather',
    level: 2,
    text: 'After one small concrete action, my emotional weather often becomes clearer.',
    hint: 'This checks the Colourmap idea that tiny action can change the whole field.',
    low: 'Not usually',
    high: 'Often true',
  },
  {
    id: 'story3',
    axis: 'storyLens',
    level: 2,
    text: 'When I feel blocked, the hidden story is often simpler than the amount of thoughts around it.',
    hint: 'This asks whether complexity is sometimes smoke around one simple tension: safety, grief, money, love, freedom, or direction.',
    low: 'It stays complex',
    high: 'There is a core',
  },
  {
    id: 'story4',
    axis: 'storyLens',
    level: 2,
    text: 'I can feel the difference between a real obstacle and a protective story.',
    hint: 'A real obstacle needs action. A protective story needs recognition. Often both are present.',
    low: 'Hard to separate',
    high: 'I can separate them',
  },
  {
    id: 'o5',
    axis: 'openness',
    level: 3,
    part: 'Part 1 / Inner Operating System',
    text: 'My best future needs both beauty and a practical operating system.',
    hint: 'This asks whether your visionary part and builder part are starting to need each other.',
    low: 'Beauty is enough',
    high: 'Beauty needs system',
  },
  {
    id: 'o6',
    axis: 'openness',
    level: 3,
    part: 'Part 1 / Inner Operating System',
    text: 'I want my life to become an artwork, not only a list of solved problems.',
    hint: 'This is the poetic layer: does meaning, atmosphere, and aesthetic coherence matter to how you live?',
    low: 'Less important',
    high: 'Very important',
  },
  {
    id: 's5',
    axis: 'structure',
    level: 3,
    part: 'Part 2 / Mode Movement',
    text: 'The right structure feels like a bridge between modes, not a cage.',
    hint: 'This is about learning the art of moving from creation to admin, body, business, or repair without losing yourself.',
    low: 'Still feels like a cage',
    high: 'Can feel like a bridge',
  },
  {
    id: 's6',
    axis: 'structure',
    level: 3,
    part: 'Part 2 / Mode Movement',
    text: 'I trust myself more when I can see evidence of progress.',
    hint: 'This asks whether visible continuity, history, completed steps, or metrics help your nervous system believe in the path.',
    low: 'Not central',
    high: 'Very central',
  },
  {
    id: 'e5',
    axis: 'socialEnergy',
    level: 3,
    part: 'Part 3 / Relational Intelligence',
    text: 'I want an AI presence that feels like a living conversation, not a cold text box.',
    hint: 'This maps your social/relational energy onto technology: voice, visual response, warmth, and dialogue.',
    low: 'Text box is enough',
    high: 'Living presence matters',
  },
  {
    id: 'e6',
    axis: 'socialEnergy',
    level: 3,
    part: 'Part 3 / Relational Intelligence',
    text: 'Part of my intelligence appears through performance, music, movement, or speaking.',
    hint: 'This asks whether your mind is partly embodied and performative, not only analytical.',
    low: 'Mostly private thought',
    high: 'Expression reveals it',
  },
  {
    id: 'a5',
    axis: 'care',
    level: 3,
    part: 'Part 4 / Care and Standards',
    text: 'My growth needs kindness and high standards at the same time.',
    hint: 'This asks whether you need both tenderness and rigor, instead of choosing only comfort or pressure.',
    low: 'One is enough',
    high: 'I need both',
  },
  {
    id: 'a6',
    axis: 'care',
    level: 3,
    part: 'Part 4 / Care and Standards',
    text: 'I want my work to help others understand themselves, not only help me.',
    hint: 'This checks whether the personal map wants to become a shared tool.',
    low: 'Mostly personal',
    high: 'Shared purpose',
  },
  {
    id: 'n5',
    axis: 'emotionalWeather',
    level: 3,
    part: 'Part 5 / Weather and Letting Go',
    text: 'I can practice letting a feeling move without forcing it to disappear.',
    hint: 'This is about letting go: allowing weather to pass while still taking care of the day.',
    low: 'I force or resist',
    high: 'I can let it move',
  },
  {
    id: 'n6',
    axis: 'emotionalWeather',
    level: 3,
    part: 'Part 5 / Weather and Letting Go',
    text: 'When I stop fighting the struggle, I can sometimes find the next small step.',
    hint: 'This asks whether surrender reduces noise enough for action to appear.',
    low: 'Struggle stays stuck',
    high: 'A step appears',
  },
  {
    id: 'story5',
    axis: 'storyLens',
    level: 3,
    part: 'Part 6 / Story and Next Scene',
    text: 'A difficult chapter can become part of my power without needing to be romanticized.',
    hint: 'This is honest recontextualization: pain is not good because it hurt, but it can still become material for wisdom.',
    low: 'Not yet',
    high: 'Yes, honestly',
  },
  {
    id: 'story6',
    axis: 'storyLens',
    level: 3,
    part: 'Part 6 / Story and Next Scene',
    text: 'I can imagine a wiser next scene for my life, even before I fully feel ready.',
    hint: 'This asks whether vision can gently lead behavior before certainty arrives.',
    low: 'Need readiness first',
    high: 'Can move before ready',
  },
];

function col(color: string, alpha: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function scoreAxis(
  axis: AxisId,
  answers: Record<string, number>,
  questions: PersonalityQuestion[],
) {
  const axisQuestions = questions.filter((question) => question.axis === axis);
  const values = axisQuestions.map((question) => answers[question.id] ?? 2);
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round(((sum - axisQuestions.length) / (axisQuestions.length * 2)) * 100);
}

function personalityProfile(scores: Record<AxisId, number>) {
  if (scores.openness >= 66 && scores.structure < 55) {
    return STYLE_PROFILES['visionary-improviser'];
  }
  if (scores.openness >= 66 && scores.structure >= 66) return STYLE_PROFILES['vision-builder'];
  if (scores.care >= 66 && scores.socialEnergy >= 60) return STYLE_PROFILES['warm-connector'];
  if (scores.emotionalWeather >= 66 && scores.openness >= 60) {
    return STYLE_PROFILES['sensitive-creator'];
  }
  if (scores.structure >= 66 && scores.openness < 55) return STYLE_PROFILES['grounded-operator'];
  return STYLE_PROFILES['living-mix'];
}

function storyReflection(scores: Record<AxisId, number>) {
  if (scores.storyLens < 45) {
    return {
      title: 'The protective story is active',
      text: 'A part of you may be trying to keep you safe by making the painful moment smaller, harder, or more final than it really is.',
      question: 'What else could this moment mean besides failure?',
    };
  }
  if (scores.storyLens > 70 && scores.emotionalWeather > 65) {
    return {
      title: 'Transformation needs grief included',
      text: 'You can turn difficulty into meaning, but the story becomes stronger when it makes room for sadness before extracting the lesson.',
      question: 'What needs to be mourned before it becomes wisdom?',
    };
  }
  return {
    title: 'The story can become a bridge',
    text: 'Your current pattern can support recontextualizing pain into direction, as long as the next step stays small and real.',
    question: 'What is the next reaction that gives you power back?',
  };
}

function educationRecommendations(scores: Record<AxisId, number>): EducationRecommendation[] {
  const recommendations: EducationRecommendation[] = [];

  if (scores.emotionalWeather >= 62) {
    recommendations.push({
      title: 'Stabilize the weather first',
      program: 'Nervous System + Room to Breathe',
      reason:
        'Your answers suggest strong inner weather. Learning works better when the body has one anchor before the mind tries to solve everything.',
      practice: 'Name the feeling as weather, then choose one physical anchor for two minutes.',
      color: '#8faeb5',
    });
  }

  if (scores.openness >= 62 && scores.structure < 55) {
    recommendations.push({
      title: 'Give vision a container',
      program: 'Creativity + Organisational Intelligence',
      reason:
        'Imagination is active, but structure may be the bridge that lets the idea become real instead of multiplying into pressure.',
      practice: 'Put one idea inside one tiny box: one page, one timer, one next action.',
      color: '#d8a7c4',
    });
  }

  if (scores.care >= 62 || (scores.care >= 54 && scores.socialEnergy >= 58)) {
    recommendations.push({
      title: 'Protect care with boundaries',
      program: 'Belonging + Conflict Repair',
      reason:
        'Care and relationship signals are important here. The learning path is not less care; it is warmth with clearer edges.',
      practice: 'Write one kind sentence and one clear need before entering a difficult exchange.',
      color: '#9fbf8a',
    });
  }

  if (scores.storyLens < 48 || scores.storyLens > 70) {
    recommendations.push({
      title: 'Work with the story lens',
      program: 'Self-Talk + Identity Becoming',
      reason:
        'The meaning you give the moment is a major lever. The next lesson is how to recontextualize without denying the pain.',
      practice:
        'Ask: what else could this mean besides failure, and what reaction gives power back?',
      color: '#e0b66e',
    });
  }

  if (scores.socialEnergy < 45) {
    recommendations.push({
      title: 'Check the isolation loop',
      program: 'Belonging + Relational Intelligence',
      reason:
        'Quiet processing may be useful, but the result suggests one small relational bridge could keep the inner story from becoming absolute.',
      practice: 'Send one honest message or ask for one low-pressure point of contact.',
      color: '#d99e9a',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Turn recognition into movement',
      program: 'Agency + Struggle & Letting Go',
      reason:
        'The profile is balanced enough that the best path is practical: learn how small actions change the inner field.',
      practice:
        'Choose one five-minute bridge action and notice whether the state changes even slightly.',
      color: '#c4a060',
    });
  }

  return recommendations.slice(0, 3);
}

function resultGlimpse(scores: Record<AxisId, number>, styleTitle: string) {
  const highAxis = AXES.reduce((winner, axis) =>
    scores[axis.id] > scores[winner.id] ? axis : winner,
  );
  const lowAxis = AXES.reduce((winner, axis) =>
    scores[axis.id] < scores[winner.id] ? axis : winner,
  );

  return {
    title: styleTitle,
    pattern: `${highAxis.label} is loudest right now.`,
    tension: `${lowAxis.label} may need a gentler bridge, not force.`,
    move:
      scores.structure < 50
        ? 'Make one tiny visible container before opening more possibilities.'
        : scores.emotionalWeather > 62
          ? 'Regulate the body first, then decide what the story means.'
          : 'Choose one small action that turns recognition into movement.',
    color: highAxis.color,
  };
}

function reverseTipi(value: number) {
  return 8 - value;
}

function scoreTipi(answers: Record<string, number>) {
  return Object.fromEntries(
    TIPI_TRAITS.map((trait) => {
      const items = TIPI_QUESTIONS.filter((question) => question.trait === trait.id);
      const values = items.map((item) => {
        const raw = answers[item.id] ?? 4;
        return item.reverse ? reverseTipi(raw) : raw;
      });
      const average = values.reduce((total, value) => total + value, 0) / values.length;
      return [trait.id, Math.round((average / 7) * 100)];
    }),
  ) as Record<TipiTrait, number>;
}

function scoreImageLens(answers: Record<string, number>) {
  return Object.fromEntries(
    AXES.map((axis) => {
      const items = IMAGE_LENS_ITEMS.filter((item) => item.axis === axis.id);
      const values = items.map((item) => answers[item.id] ?? 2);
      const average = values.reduce((total, value) => total + value, 0) / values.length;
      return [axis.id, Math.round(((average - 1) / 2) * 100)];
    }),
  ) as Record<AxisId, number>;
}

function ImageLensIllustration({ item }: { item: ImageLensItem }) {
  return (
    <svg viewBox="0 0 360 360" role="img" aria-label={item.title} style={{ width: '100%' }}>
      <rect width="360" height="360" rx="24" fill="#21160f" />
      <rect x="18" y="18" width="324" height="324" rx="20" fill="#ead6ad" />
      <path
        d="M44 280c58-25 112-25 162 0 49-37 92-45 130-24"
        fill="none"
        stroke="#6f452b"
        strokeWidth="5"
        opacity=".2"
      />
      <g fill="none" stroke="#2a1710" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        {item.symbol === 'gate' && (
          <>
            <path d="M104 286V126c0-44 34-72 76-72s76 28 76 72v160" />
            <path d="M135 286V132c0-25 19-43 45-43s45 18 45 43v154" />
          </>
        )}
        {item.symbol === 'river' && (
          <>
            <path d="M58 129c51-33 101-33 150 0s99 33 150 0" />
            <path d="M58 190c51 33 101 33 150 0s99-33 150 0" />
            <path d="M92 261c50-21 108-21 176 0" />
          </>
        )}
        {item.symbol === 'tower' && (
          <>
            <rect x="108" y="72" width="144" height="214" />
            <path d="M108 132h144M108 194h144M156 72v214M204 72v214" />
          </>
        )}
        {item.symbol === 'fire' && (
          <>
            <path d="M180 285c-53-43-61-93-24-150 29-37 37-64 24-91 70 52 102 111 97 176-4 35-36 58-97 65z" />
            <path d="M179 253c-28-28-31-59-9-92 30 22 44 49 42 82" />
          </>
        )}
        {item.symbol === 'seed' && (
          <>
            <path d="M180 285V128" />
            <path d="M180 161c-54-47-95-45-122 6 52 30 93 28 122-6z" />
            <path d="M180 137c53-54 98-55 135-3-52 38-97 39-135 3z" />
          </>
        )}
        {item.symbol === 'mirror' && (
          <>
            <path d="M112 64h136l36 54-104 178L76 118z" />
            <path d="M112 64l68 232 68-232" />
          </>
        )}
        {item.symbol === 'road' && (
          <>
            <path d="M133 292c17-76 33-151 47-225 22 74 42 149 60 225" />
            <path d="M59 292h242M160 188h43M147 241h66" />
          </>
        )}
        {item.symbol === 'storm' && (
          <>
            <path d="M92 143c29-50 74-61 134-33 45-4 75 20 90 72-42 43-98 58-168 46-48-7-78-36-56-85z" />
            <path d="M150 244l-24 49M205 244l-18 49M256 238l-25 55" />
          </>
        )}
        {item.symbol === 'sun' && (
          <>
            <circle cx="180" cy="180" r="66" />
            <path d="M180 54v45M180 261v45M54 180h45M261 180h45M91 91l32 32M237 237l32 32M269 91l-32 32M123 237l-32 32" />
          </>
        )}
        {item.symbol === 'room' && (
          <>
            <path d="M84 264V98h192v166" />
            <path d="M84 98l96-48 96 48M142 264V165h76v99" />
          </>
        )}
        {item.symbol === 'bridge' && (
          <>
            <path d="M56 244c83-88 166-88 248 0" />
            <path d="M76 244h208M112 208v36M180 184v60M248 208v36" />
          </>
        )}
        {item.symbol === 'mask' && (
          <>
            <path d="M93 94c45-38 129-38 174 0v96c0 63-38 97-87 116-49-19-87-53-87-116z" />
            <path d="M130 160h54M206 160h24M151 221c21 18 40 18 58 0" />
          </>
        )}
        {item.symbol === 'garden' && (
          <>
            <path d="M70 270c72-43 146-43 220 0" />
            <path d="M126 246V135M180 246V104M235 246V148" />
            <path d="M126 158c-35-30-62-27-82 9 34 21 61 18 82-9zM180 126c37-35 69-34 96 3-37 25-69 24-96-3zM235 169c34-26 62-22 83 12-34 20-62 16-83-12z" />
          </>
        )}
        {item.symbol === 'mountain' && (
          <>
            <path d="M48 286L153 88l48 86 35-54 76 166z" />
            <path d="M153 88l8 90 40-4" />
          </>
        )}
        {item.symbol === 'star' && (
          <>
            <path d="M180 61l31 78 84 7-64 54 20 82-71-44-71 44 20-82-64-54 84-7z" />
            <path d="M78 292c69-34 137-34 204 0" />
          </>
        )}
      </g>
      <g fill={item.color} stroke="#2a1710" strokeWidth="4">
        <circle cx="180" cy="180" r="14" />
        <circle cx="96" cy="92" r="9" />
        <circle cx="276" cy="100" r="8" />
        <circle cx="276" cy="266" r="10" />
      </g>
    </svg>
  );
}

function EducationRecommendationPanel({
  title = 'Recommended learning path',
  recommendations,
}: {
  title?: string;
  recommendations: EducationRecommendation[];
}) {
  return (
    <article
      style={{
        marginTop: 12,
        border: '1px solid rgba(196,160,96,0.24)',
        background:
          'radial-gradient(circle at 10% 0%, rgba(196,160,96,0.13), transparent 34%), rgba(255,255,255,0.04)',
        padding: 14,
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontFamily: SERIF,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(255,218,168,0.68)',
        }}
      >
        Education bridge
      </p>
      <h4 style={{ margin: '0 0 10px', fontFamily: SERIF, fontSize: 18 }}>{title}</h4>
      <div style={{ display: 'grid', gap: 9 }}>
        {recommendations.map((item) => (
          <div
            key={item.title}
            style={{
              border: `1px solid ${col(item.color, 0.22)}`,
              background: col(item.color, 0.07),
              padding: 11,
            }}
          >
            <strong
              style={{
                display: 'block',
                fontFamily: SERIF,
                fontSize: 14,
                color: 'rgba(255,241,210,0.92)',
              }}
            >
              {item.title}
            </strong>
            <span
              style={{
                display: 'block',
                marginTop: 4,
                fontFamily: SERIF,
                fontSize: 12,
                color: col(item.color, 0.86),
              }}
            >
              {item.program}
            </span>
            <p style={{ ...resultTextStyle, marginTop: 7 }}>{item.reason}</p>
            <p style={{ ...resultTextStyle, color: 'rgba(255,232,176,0.9)' }}>
              <b>Practice:</b> {item.practice}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ResultGlimpseCard({ glimpse }: { glimpse: ReturnType<typeof resultGlimpse> }) {
  return (
    <article
      style={{
        marginTop: 14,
        border: `1px solid ${col(glimpse.color, 0.28)}`,
        background:
          `radial-gradient(circle at 16% 0%, ${col(glimpse.color, 0.18)}, transparent 38%), ` +
          'rgba(255,255,255,0.045)',
        padding: 14,
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontFamily: SERIF,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: col(glimpse.color, 0.76),
        }}
      >
        Glimpse / read this first
      </p>
      <h4 style={{ margin: 0, fontFamily: SERIF, fontSize: 21, color: 'rgba(255,241,196,0.95)' }}>
        {glimpse.title}
      </h4>
      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          marginTop: 12,
        }}
      >
        {[
          ['Pattern', glimpse.pattern],
          ['Tension', glimpse.tension],
          ['Bridge', glimpse.move],
        ].map(([label, text]) => (
          <div
            key={label}
            style={{
              border: `1px solid ${col(glimpse.color, 0.16)}`,
              background: col(glimpse.color, 0.055),
              padding: 10,
            }}
          >
            <strong
              style={{
                display: 'block',
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: col(glimpse.color, 0.82),
              }}
            >
              {label}
            </strong>
            <span
              style={{
                display: 'block',
                marginTop: 5,
                fontFamily: SERIF,
                fontSize: 13,
                lineHeight: 1.45,
                color: 'rgba(250,238,205,0.72)',
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function PersonalityTypeProgram({
  onClose,
  onBack,
  hubBg,
}: {
  onClose: () => void;
  onBack?: () => void;
  hubBg?: string;
}) {
  const [step, setStep] = useState(0);
  const [testMode, setTestMode] = useState<TestMode>('colourmap');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('field');
  const [depthLevel, setDepthLevel] = useState<DepthLevel>(1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [unsureAnswers, setUnsureAnswers] = useState<Record<string, boolean>>({});
  const [tipiStep, setTipiStep] = useState(0);
  const [tipiAnswers, setTipiAnswers] = useState<Record<string, number>>({});
  const [tipiUnsureAnswers, setTipiUnsureAnswers] = useState<Record<string, boolean>>({});
  const [imageStep, setImageStep] = useState(0);
  const [imageAnswers, setImageAnswers] = useState<Record<string, number>>({});
  const [showQuestionHelp, setShowQuestionHelp] = useState(false);
  const activeQuestions = useMemo(
    () => QUESTIONS.filter((question) => question.level <= depthLevel),
    [depthLevel],
  );
  const current = activeQuestions[step];
  const tipiCurrent = TIPI_QUESTIONS[tipiStep];
  const imageCurrent = IMAGE_LENS_ITEMS[imageStep];
  const axis = AXES.find((item) => item.id === current?.axis) ?? AXES[0];
  const complete = activeQuestions.every((question) => answers[question.id] !== undefined);
  const tipiComplete = Object.keys(tipiAnswers).length >= TIPI_QUESTIONS.length;
  const imageComplete = Object.keys(imageAnswers).length >= IMAGE_LENS_ITEMS.length;
  const scores = useMemo(
    () =>
      Object.fromEntries(
        AXES.map((item) => [item.id, scoreAxis(item.id, answers, activeQuestions)]),
      ) as Record<AxisId, number>,
    [answers, activeQuestions],
  );
  const tipiScores = useMemo(() => scoreTipi(tipiAnswers), [tipiAnswers]);
  const story = storyReflection(scores);
  const styleProfile = useMemo(() => personalityProfile(scores), [scores]);
  const glimpse = useMemo(() => resultGlimpse(scores, styleProfile.title), [scores, styleProfile]);
  const recommendedPaths = useMemo(() => educationRecommendations(scores), [scores]);
  const imageScores = useMemo(() => scoreImageLens(imageAnswers), [imageAnswers]);
  const imageProfile = useMemo(() => personalityProfile(imageScores), [imageScores]);
  const imageGlimpse = useMemo(
    () => resultGlimpse(imageScores, imageProfile.title),
    [imageScores, imageProfile],
  );
  const imageRecommendedPaths = useMemo(() => educationRecommendations(imageScores), [imageScores]);
  const imageSource =
    testMode === 'tipi' || complete
      ? complete
        ? styleProfile.image
        : visualStyle === 'symbolic'
          ? '/personality/personality-symbolic-results.svg'
          : '/personality/personality-results.svg'
      : visualStyle === 'symbolic'
        ? axis.symbolicImage
        : axis.image;
  const unsureQuestionIds = useMemo(
    () => activeQuestions.filter((question) => unsureAnswers[question.id]),
    [activeQuestions, unsureAnswers],
  );
  const tipiUnsureCount = Object.values(tipiUnsureAnswers).filter(Boolean).length;

  function answer(value: number, unsure = false) {
    if (!current) return;
    setAnswers((existing) => ({ ...existing, [current.id]: value }));
    setUnsureAnswers((existing) => {
      const next = { ...existing };
      if (unsure) next[current.id] = true;
      else delete next[current.id];
      return next;
    });
    setShowQuestionHelp(false);
    if (step < activeQuestions.length - 1) setStep(step + 1);
  }

  function answerTipi(value: number, unsure = false) {
    if (!tipiCurrent) return;
    setTipiAnswers((existing) => ({ ...existing, [tipiCurrent.id]: value }));
    setTipiUnsureAnswers((existing) => {
      const next = { ...existing };
      if (unsure) next[tipiCurrent.id] = true;
      else delete next[tipiCurrent.id];
      return next;
    });
    setShowQuestionHelp(false);
    if (tipiStep < TIPI_QUESTIONS.length - 1) setTipiStep(tipiStep + 1);
  }

  function changeDepthLevel(level: DepthLevel) {
    setDepthLevel(level);
    setStep(0);
    setAnswers({});
    setUnsureAnswers({});
    setShowQuestionHelp(false);
  }

  const progress = Math.round(
    (activeQuestions.filter((question) => answers[question.id] !== undefined).length /
      activeQuestions.length) *
      100,
  );
  const activeProgress =
    testMode === 'tipi'
      ? Math.round((Object.keys(tipiAnswers).length / TIPI_QUESTIONS.length) * 100)
      : testMode === 'imageLens'
        ? Math.round((Object.keys(imageAnswers).length / IMAGE_LENS_ITEMS.length) * 100)
        : progress;

  function answerImageLens(value: number) {
    if (!imageCurrent) return;
    setImageAnswers((existing) => ({ ...existing, [imageCurrent.id]: value }));
    if (imageStep < IMAGE_LENS_ITEMS.length - 1) setImageStep(imageStep + 1);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        justifyContent: 'center',
        background: 'rgba(4,2,0,0.66)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 740,
          height: '100%',
          background: hubBg ?? 'rgba(18,10,4,0.99)',
          color: 'rgba(250,238,205,0.92)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            flexShrink: 0,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            borderBottom: '1px solid rgba(196,160,96,0.16)',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: col('#C4A060', 0.72),
              }}
            >
              Personality Map
            </p>
            <h2 style={{ margin: '3px 0 0', fontFamily: SERIF, fontSize: 20 }}>
              {testMode === 'tipi' ? 'Free Big Five glimpse' : 'Traits, story, and next reaction'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
            {onBack && (
              <button type="button" onClick={onBack} style={pillStyle('#C4A060')}>
                all
              </button>
            )}
            <button type="button" onClick={onClose} style={pillStyle('#C4A060')}>
              close
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          <div
            style={{
              overflow: 'hidden',
              border: `1px solid ${col(axis.color, 0.2)}`,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <img
              src={imageSource}
              alt=""
              style={{ width: '100%', height: 168, objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${activeProgress}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${col('#C4A060', 0.9)}, ${col(axis.color, 0.92)})`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 14,
            }}
          >
            {(
              [
                ['colourmap', 'Story Lens test'],
                ['imageLens', 'Image Lens'],
                ['tipi', 'TIPI Big Five'],
              ] as Array<[TestMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTestMode(mode)}
                style={{
                  ...pillStyle(mode === 'tipi' ? '#8faeb5' : '#C4A060'),
                  background:
                    testMode === mode
                      ? col(mode === 'tipi' ? '#8faeb5' : '#C4A060', 0.18)
                      : 'rgba(255,255,255,0.025)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 10,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(250,238,205,0.48)',
              }}
            >
              image language
            </span>
            {(
              [
                ['field', 'soft field'],
                ['symbolic', 'comic symbols'],
              ] as Array<[VisualStyle, string]>
            ).map(([styleId, label]) => (
              <button
                key={styleId}
                type="button"
                onClick={() => setVisualStyle(styleId)}
                style={{
                  ...pillStyle(styleId === 'symbolic' ? '#e0b66e' : '#C4A060'),
                  background:
                    visualStyle === styleId
                      ? col(styleId === 'symbolic' ? '#e0b66e' : '#C4A060', 0.18)
                      : 'rgba(255,255,255,0.025)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {testMode === 'imageLens' ? (
            !imageComplete ? (
              <section style={{ marginTop: 20 }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontFamily: SERIF,
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: col(imageCurrent.color, 0.78),
                  }}
                >
                  {imageCurrent.block} / image {imageStep + 1} of {IMAGE_LENS_ITEMS.length}
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1fr)',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  <ImageLensIllustration item={imageCurrent} />
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: SERIF,
                        fontSize: 'clamp(21px, 5vw, 31px)',
                        lineHeight: 1.08,
                        color: 'rgba(255,241,196,0.95)',
                      }}
                    >
                      {imageCurrent.title}
                    </h3>
                    <p style={{ ...resultTextStyle, fontSize: 14, marginTop: 10 }}>
                      {imageCurrent.prompt}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
                  {IMAGE_LENS_CHOICES.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => answerImageLens(choice.value)}
                      style={{
                        minHeight: 46,
                        border: `1px solid ${col(imageCurrent.color, 0.26)}`,
                        background: col(imageCurrent.color, 0.07 + choice.value * 0.018),
                        color: 'rgba(255,241,210,0.88)',
                        fontFamily: SERIF,
                        fontSize: 14,
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: '10px 12px',
                      }}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section style={{ marginTop: 20 }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontFamily: SERIF,
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: col('#e0b66e', 0.78),
                  }}
                >
                  Image Lens result
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontSize: 'clamp(26px, 7vw, 38px)',
                    lineHeight: 1.04,
                    color: 'rgba(255,241,196,0.95)',
                  }}
                >
                  {imageProfile.title}
                </h3>
                <p style={{ ...resultTextStyle, marginTop: 10, fontSize: 14 }}>
                  {imageProfile.essence}
                </p>
                <ResultGlimpseCard glimpse={imageGlimpse} />
                <EducationRecommendationPanel
                  title="What to learn from this image pattern"
                  recommendations={imageRecommendedPaths}
                />
                <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                  {AXES.map((item) => {
                    const score = imageScores[item.id];
                    return (
                      <article
                        key={item.id}
                        style={{
                          border: `1px solid ${col(item.color, 0.22)}`,
                          background: col(item.color, 0.07),
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <strong style={{ fontFamily: SERIF }}>{item.label}</strong>
                          <span style={{ color: col(item.color, 0.9) }}>{score}</span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${score}%`,
                              height: '100%',
                              background: col(item.color, 0.9),
                            }}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )
          ) : testMode === 'tipi' ? (
            !tipiComplete ? (
              <section style={{ marginTop: 20 }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontFamily: SERIF,
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: col('#8faeb5', 0.78),
                  }}
                >
                  TIPI / public-use quick glimpse / item {tipiStep + 1} of {TIPI_QUESTIONS.length}
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontSize: 'clamp(24px, 6vw, 34px)',
                    lineHeight: 1.08,
                    color: 'rgba(255,241,196,0.95)',
                  }}
                >
                  I see myself as: {tipiCurrent.text}
                </h3>
                <div style={{ display: 'grid', gap: 8, marginTop: 20 }}>
                  {TIPI_CHOICES.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => answerTipi(choice.value)}
                      style={{
                        minHeight: 44,
                        border: `1px solid ${col('#8faeb5', 0.24)}`,
                        background: col('#8faeb5', 0.05 + choice.value * 0.012),
                        color: 'rgba(255,241,210,0.88)',
                        fontFamily: SERIF,
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: '9px 12px',
                      }}
                    >
                      {choice.value}. {choice.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => answerTipi(4, true)}
                    style={{
                      minHeight: 44,
                      border: '1px dashed rgba(255,232,176,0.32)',
                      background: 'rgba(255,255,255,0.035)',
                      color: 'rgba(255,232,176,0.82)',
                      fontFamily: SERIF,
                      fontSize: 13,
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '9px 12px',
                    }}
                  >
                    confused / not sure
                  </button>
                </div>
                <p style={{ ...resultTextStyle, marginTop: 14 }}>
                  TIPI is useful as a fast signal, not as a full portrait. Colourmap uses it as a
                  first glimpse before deeper IPIP and story-lens mapping.
                </p>
              </section>
            ) : (
              <section style={{ marginTop: 20 }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontFamily: SERIF,
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: col('#8faeb5', 0.78),
                  }}
                >
                  TIPI Big Five glimpse
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontSize: 'clamp(26px, 7vw, 38px)',
                    lineHeight: 1.04,
                    color: 'rgba(255,241,196,0.95)',
                  }}
                >
                  Five fast trait signals
                </h3>
                <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                  {TIPI_TRAITS.map((trait) => {
                    const score = tipiScores[trait.id];
                    const high = score >= 50;
                    return (
                      <article
                        key={trait.id}
                        style={{
                          border: `1px solid ${col(trait.color, 0.22)}`,
                          background: col(trait.color, 0.07),
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <strong style={{ fontFamily: SERIF }}>{trait.label}</strong>
                          <span style={{ color: col(trait.color, 0.9) }}>
                            {score < 50 ? trait.low : trait.high} / {score}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${score}%`,
                              height: '100%',
                              background: col(trait.color, 0.9),
                            }}
                          />
                        </div>
                        <p style={{ ...resultTextStyle, marginTop: 10 }}>
                          <b>Meaning:</b> {trait.meaning}
                        </p>
                        <p style={resultTextStyle}>
                          <b>Gift:</b> {high ? trait.highGift : trait.lowGift}
                        </p>
                        <p style={resultTextStyle}>
                          <b>Friction:</b> {high ? trait.highFriction : trait.lowFriction}
                        </p>
                        <p style={resultTextStyle}>
                          <b>Under pressure:</b> {trait.pressure}
                        </p>
                        <p style={resultTextStyle}>
                          <b>Bridge:</b> {trait.bridge}
                        </p>
                      </article>
                    );
                  })}
                </div>
                <p style={{ ...resultTextStyle, marginTop: 14 }}>
                  Source: Ten-Item Personality Inventory by Gosling, Rentfrow, and Swann. It is
                  included here as a free quick glimpse. For a serious deeper version, Colourmap
                  should add IPIP Big Five next.
                </p>
                {tipiUnsureCount > 0 && (
                  <p style={{ ...resultTextStyle, color: 'rgba(255,232,176,0.9)' }}>
                    {tipiUnsureCount} answer{tipiUnsureCount === 1 ? '' : 's'} marked confused or
                    not sure. Treat this as a soft signal, not a fixed score.
                  </p>
                )}
              </section>
            )
          ) : !complete ? (
            <section style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {DEPTH_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => changeDepthLevel(level.id)}
                    style={{
                      ...pillStyle(
                        level.id === 3 ? '#d8a7c4' : level.id === 2 ? '#8faeb5' : '#C4A060',
                      ),
                      background:
                        depthLevel === level.id
                          ? col(
                              level.id === 3 ? '#d8a7c4' : level.id === 2 ? '#8faeb5' : '#C4A060',
                              0.18,
                            )
                          : 'rgba(255,255,255,0.025)',
                    }}
                    title={level.short}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              <p
                style={{
                  margin: '0 0 8px',
                  fontFamily: SERIF,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: col(axis.color, 0.76),
                }}
              >
                {current.part ? `${current.part} / ` : ''}
                {axis.label} / {axis.short} / item {step + 1} of {activeQuestions.length}
              </p>
              <h3
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 'clamp(24px, 6vw, 34px)',
                  lineHeight: 1.08,
                  color: 'rgba(255,241,196,0.95)',
                }}
              >
                {current.text}
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionHelp((value) => !value)}
                style={{ ...pillStyle(axis.color), marginTop: 14 }}
              >
                what does this mean?
              </button>
              {showQuestionHelp && (
                <p
                  style={{
                    margin: '12px 0 0',
                    border: `1px solid ${col(axis.color, 0.2)}`,
                    background: col(axis.color, 0.06),
                    padding: 12,
                    fontFamily: SERIF,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'rgba(250,238,205,0.74)',
                  }}
                >
                  {current.hint}
                </p>
              )}
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  marginTop: 20,
                }}
              >
                {CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => answer(choice.value)}
                    style={{
                      minHeight: 54,
                      border: `1px solid ${col(axis.color, 0.28)}`,
                      background: col(axis.color, 0.08 + choice.value * 0.025),
                      color: 'rgba(255,241,210,0.88)',
                      fontFamily: SERIF,
                      fontSize: 15,
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '12px 14px',
                    }}
                  >
                    {choice.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => answer(2, true)}
                  style={{
                    minHeight: 54,
                    border: '1px dashed rgba(255,232,176,0.34)',
                    background: 'rgba(255,255,255,0.035)',
                    color: 'rgba(255,232,176,0.84)',
                    fontFamily: SERIF,
                    fontSize: 15,
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '12px 14px',
                  }}
                >
                  confused / not sure
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginTop: 12,
                  fontSize: 11,
                  color: 'rgba(250,238,205,0.48)',
                }}
              >
                <span>{current.low}</span>
                <span>{current.high}</span>
              </div>
            </section>
          ) : (
            <section style={{ marginTop: 20 }}>
              <p
                style={{
                  margin: '0 0 8px',
                  fontFamily: SERIF,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: col('#C4A060', 0.76),
                }}
              >
                Your current style
              </p>
              <h3
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 'clamp(26px, 7vw, 38px)',
                  lineHeight: 1.04,
                  color: 'rgba(255,241,196,0.95)',
                }}
              >
                {styleProfile.title}
              </h3>
              <p style={{ ...resultTextStyle, marginTop: 10, fontSize: 14 }}>
                {styleProfile.essence}
              </p>
              <ResultGlimpseCard glimpse={glimpse} />

              <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                {AXES.map((item) => {
                  const score = scores[item.id];
                  const high = score >= 55;
                  return (
                    <article
                      key={item.id}
                      style={{
                        border: `1px solid ${col(item.color, 0.22)}`,
                        background: col(item.color, 0.07),
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <strong style={{ fontFamily: SERIF, color: 'rgba(255,241,210,0.92)' }}>
                          {item.label}
                        </strong>
                        <span style={{ fontFamily: SERIF, color: col(item.color, 0.9) }}>
                          {high ? item.highName : item.lowName} / {score}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            width: `${score}%`,
                            height: '100%',
                            background: col(item.color, 0.9),
                          }}
                        />
                      </div>
                      <p style={resultTextStyle}>
                        <b>Gift:</b> {high ? item.giftHigh : item.giftLow}
                      </p>
                      <p style={resultTextStyle}>
                        <b>Friction:</b> {high ? item.frictionHigh : item.frictionLow}
                      </p>
                      <p style={resultTextStyle}>
                        <b>Bridge:</b> {high ? item.bridgeHigh : item.bridgeLow}
                      </p>
                    </article>
                  );
                })}
              </div>

              <article
                style={{
                  marginTop: 12,
                  border: `1px solid ${col('#e0b66e', 0.28)}`,
                  background:
                    'radial-gradient(circle at 18% 10%, rgba(224,182,110,0.18), transparent 34%), rgba(255,255,255,0.045)',
                  padding: 14,
                }}
              >
                <h4 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: 18 }}>
                  {story.title}
                </h4>
                <p style={{ ...resultTextStyle, fontSize: 14 }}>{story.text}</p>
                <p style={{ ...resultTextStyle, color: 'rgba(255,232,176,0.92)' }}>
                  {story.question}
                </p>
              </article>

              <EducationRecommendationPanel recommendations={recommendedPaths} />

              {unsureQuestionIds.length > 0 && (
                <article
                  style={{
                    marginTop: 12,
                    border: '1px dashed rgba(255,232,176,0.28)',
                    background: 'rgba(255,255,255,0.035)',
                    padding: 14,
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontFamily: SERIF,
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,218,168,0.68)',
                    }}
                  >
                    Soft spots / not wrong, just unclear
                  </p>
                  <h4 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: 18 }}>
                    {unsureQuestionIds.length} question
                    {unsureQuestionIds.length === 1 ? '' : 's'} need a second look
                  </h4>
                  <p style={{ ...resultTextStyle, fontSize: 14 }}>
                    These answers were counted as neutral. They are useful because confusion often
                    marks a place where personality changes by context: rested self, pressure self,
                    creative self, or survival self.
                  </p>
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    {unsureQuestionIds.map((question) => {
                      const item =
                        AXES.find((axisItem) => axisItem.id === question.axis) ?? AXES[0];
                      return (
                        <div
                          key={question.id}
                          style={{
                            border: `1px solid ${col(item.color, 0.18)}`,
                            background: col(item.color, 0.045),
                            padding: 10,
                          }}
                        >
                          <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 13 }}>
                            {item.label}
                          </strong>
                          <span
                            style={{
                              display: 'block',
                              marginTop: 5,
                              fontFamily: SERIF,
                              fontSize: 12,
                              lineHeight: 1.45,
                              color: 'rgba(250,238,205,0.6)',
                            }}
                          >
                            {question.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              )}

              <article
                style={{
                  marginTop: 12,
                  border: '1px solid rgba(216,167,196,0.24)',
                  background:
                    'linear-gradient(135deg, rgba(216,167,196,0.1), rgba(196,160,96,0.06))',
                  padding: 14,
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    fontFamily: SERIF,
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,218,168,0.68)',
                  }}
                >
                  AI story companion / next layer
                </p>
                <h4 style={{ margin: '0 0 8px', fontFamily: SERIF, fontSize: 18 }}>
                  Your story, seen through your lens
                </h4>
                <p style={{ ...resultTextStyle, fontSize: 14 }}>
                  The next version lets you speak or write the story you are telling yourself. AI
                  reflects the chapters, roles, protective beliefs, grief points, and possible next
                  reactions without reducing you to a type.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gap: 8,
                    marginTop: 12,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  }}
                >
                  {[
                    ['Chapter', 'What moment are you inside?'],
                    ['Lens', 'How are you interpreting it?'],
                    ['Role', 'Who do you become there?'],
                    ['Next scene', 'What reaction gives power back?'],
                  ].map(([title, text]) => (
                    <div
                      key={title}
                      style={{
                        border: '1px solid rgba(255,232,176,0.14)',
                        background: 'rgba(255,255,255,0.035)',
                        padding: 10,
                      }}
                    >
                      <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 13 }}>
                        {title}
                      </strong>
                      <span
                        style={{
                          display: 'block',
                          marginTop: 5,
                          fontFamily: SERIF,
                          fontSize: 12,
                          lineHeight: 1.45,
                          color: 'rgba(250,238,205,0.58)',
                        }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}
        </main>

        <footer
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(196,160,96,0.12)',
            padding: '12px 18px max(16px, env(safe-area-inset-bottom, 16px))',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() =>
              testMode === 'imageLens'
                ? setImageStep(Math.max(0, imageStep - 1))
                : testMode === 'tipi'
                  ? setTipiStep(Math.max(0, tipiStep - 1))
                  : setStep(Math.max(0, step - 1))
            }
            disabled={
              testMode === 'imageLens'
                ? imageStep === 0 || imageComplete
                : testMode === 'tipi'
                  ? tipiStep === 0 || tipiComplete
                  : step === 0 || complete
            }
            style={pillStyle(
              '#C4A060',
              testMode === 'imageLens'
                ? imageStep === 0 || imageComplete
                : testMode === 'tipi'
                  ? tipiStep === 0 || tipiComplete
                  : step === 0 || complete,
            )}
          >
            prev
          </button>
          {testMode === 'imageLens' && imageComplete ? (
            <button
              type="button"
              onClick={() => {
                setImageAnswers({});
                setImageStep(0);
              }}
              style={pillStyle('#e0b66e')}
            >
              restart image lens
            </button>
          ) : testMode === 'tipi' && tipiComplete ? (
            <button
              type="button"
              onClick={() => {
                setTipiAnswers({});
                setTipiUnsureAnswers({});
                setTipiStep(0);
                setShowQuestionHelp(false);
              }}
              style={pillStyle('#8faeb5')}
            >
              restart TIPI
            </button>
          ) : complete ? (
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setUnsureAnswers({});
                setStep(0);
                setShowQuestionHelp(false);
              }}
              style={pillStyle('#C4A060')}
            >
              restart
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                testMode === 'imageLens'
                  ? setImageStep(Math.min(IMAGE_LENS_ITEMS.length - 1, imageStep + 1))
                  : testMode === 'tipi'
                    ? setTipiStep(Math.min(TIPI_QUESTIONS.length - 1, tipiStep + 1))
                    : setStep(Math.min(activeQuestions.length - 1, step + 1))
              }
              style={pillStyle(axis.color)}
            >
              skip
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

const resultTextStyle: React.CSSProperties = {
  margin: '5px 0 0',
  fontFamily: SERIF,
  fontSize: 13,
  lineHeight: 1.55,
  color: 'rgba(250,238,205,0.72)',
};

function pillStyle(color: string, disabled = false): React.CSSProperties {
  return {
    borderRadius: 999,
    border: `1px solid ${col(color, disabled ? 0.12 : 0.35)}`,
    background: disabled ? 'rgba(255,255,255,0.02)' : col(color, 0.1),
    color: disabled ? 'rgba(250,238,205,0.24)' : 'rgba(255,232,176,0.86)',
    fontFamily: SERIF,
    fontSize: 12,
    letterSpacing: '0.08em',
    cursor: disabled ? 'default' : 'pointer',
    padding: '7px 14px',
    textTransform: 'uppercase',
  };
}
