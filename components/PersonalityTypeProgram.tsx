'use client';

import { useMemo, useState } from 'react';

const SERIF = 'var(--font-serif)';

type AxisId = 'openness' | 'structure' | 'socialEnergy' | 'care' | 'emotionalWeather' | 'storyLens';

type TestMode = 'colourmap' | 'tipi';

type Choice = {
  label: string;
  value: number;
};

type PersonalityQuestion = {
  id: string;
  axis: AxisId;
  text: string;
  low: string;
  high: string;
};

type AxisDefinition = {
  id: AxisId;
  label: string;
  short: string;
  color: string;
  image: string;
  lowName: string;
  highName: string;
  giftLow: string;
  giftHigh: string;
  frictionLow: string;
  frictionHigh: string;
  bridgeLow: string;
  bridgeHigh: string;
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
}> = [
  {
    id: 'extraversion',
    label: 'Extraversion',
    color: '#d99e9a',
    low: 'quiet processing',
    high: 'social charge',
  },
  {
    id: 'agreeableness',
    label: 'Agreeableness',
    color: '#9fbf8a',
    low: 'firm boundaries',
    high: 'warm harmony',
  },
  {
    id: 'conscientiousness',
    label: 'Conscientiousness',
    color: '#c4a060',
    low: 'flexible flow',
    high: 'steady structure',
  },
  {
    id: 'emotionalStability',
    label: 'Emotional Stability',
    color: '#8faeb5',
    low: 'sensitive weather',
    high: 'steady weather',
  },
  {
    id: 'openness',
    label: 'Openness',
    color: '#d8a7c4',
    low: 'concrete realism',
    high: 'imaginative range',
  },
];

const AXES: AxisDefinition[] = [
  {
    id: 'openness',
    label: 'Imagination',
    short: 'ideas, beauty, possibility',
    color: '#d8a7c4',
    image: '/personality/personality-openness.svg',
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
    text: 'When pressure rises, I generate images, ideas, or future possibilities quickly.',
    low: 'I stay concrete',
    high: 'I open many worlds',
  },
  {
    id: 'o2',
    axis: 'openness',
    text: 'Beauty, music, symbols, or atmosphere can change how I understand my life.',
    low: 'Not central',
    high: 'Very central',
  },
  {
    id: 's1',
    axis: 'structure',
    text: 'Small unfinished practical things affect my emotional state.',
    low: 'I can ignore them',
    high: 'They weigh on me',
  },
  {
    id: 's2',
    axis: 'structure',
    text: 'I feel stronger when my next steps are visible and ordered.',
    low: 'I prefer flow',
    high: 'I need order',
  },
  {
    id: 'e1',
    axis: 'socialEnergy',
    text: 'Being with people, rhythm, conversation, or shared energy brings me back to life.',
    low: 'I recharge alone',
    high: 'I recharge through contact',
  },
  {
    id: 'e2',
    axis: 'socialEnergy',
    text: 'When I am stuck, speaking it out loud changes the problem.',
    low: 'Writing is enough',
    high: 'Voice changes it',
  },
  {
    id: 'a1',
    axis: 'care',
    text: 'I often sense what other people need before I name what I need.',
    low: 'My boundary comes first',
    high: 'The room affects me',
  },
  {
    id: 'a2',
    axis: 'care',
    text: 'Conflict or distance can stay in my body even when the practical problem is small.',
    low: 'I detach fast',
    high: 'I carry it',
  },
  {
    id: 'n1',
    axis: 'emotionalWeather',
    text: 'A mood can become a full atmosphere around the day.',
    low: 'It passes through',
    high: 'It colors everything',
  },
  {
    id: 'n2',
    axis: 'emotionalWeather',
    text: 'I notice subtle signals in my body before I know what they mean.',
    low: 'Not usually',
    high: 'Very often',
  },
  {
    id: 'story1',
    axis: 'storyLens',
    text: 'When something hurts, part of me turns it into a story about who I am.',
    low: 'Less true',
    high: 'Very true',
  },
  {
    id: 'story2',
    axis: 'storyLens',
    text: 'I can reframe struggle as material for growth without pretending it did not hurt.',
    low: 'Hard for me now',
    high: 'Possible for me',
  },
];

function col(color: string, alpha: number) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function scoreAxis(axis: AxisId, answers: Record<string, number>) {
  const axisQuestions = QUESTIONS.filter((question) => question.axis === axis);
  const values = axisQuestions.map((question) => answers[question.id] ?? 2);
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round(((sum - axisQuestions.length) / (axisQuestions.length * 2)) * 100);
}

function personalityStyle(scores: Record<AxisId, number>) {
  if (scores.openness >= 66 && scores.structure < 55) return 'The Visionary Improviser';
  if (scores.openness >= 66 && scores.structure >= 66) return 'The Vision Builder';
  if (scores.care >= 66 && scores.socialEnergy >= 60) return 'The Warm Connector';
  if (scores.emotionalWeather >= 66 && scores.openness >= 60) return 'The Sensitive Creator';
  if (scores.structure >= 66 && scores.openness < 55) return 'The Grounded Operator';
  return 'The Living Mix';
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
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [tipiStep, setTipiStep] = useState(0);
  const [tipiAnswers, setTipiAnswers] = useState<Record<string, number>>({});
  const current = QUESTIONS[step];
  const tipiCurrent = TIPI_QUESTIONS[tipiStep];
  const axis = AXES.find((item) => item.id === current?.axis) ?? AXES[0];
  const complete = Object.keys(answers).length >= QUESTIONS.length;
  const tipiComplete = Object.keys(tipiAnswers).length >= TIPI_QUESTIONS.length;
  const scores = useMemo(
    () =>
      Object.fromEntries(AXES.map((item) => [item.id, scoreAxis(item.id, answers)])) as Record<
        AxisId,
        number
      >,
    [answers],
  );
  const tipiScores = useMemo(() => scoreTipi(tipiAnswers), [tipiAnswers]);
  const story = storyReflection(scores);

  function answer(value: number) {
    if (!current) return;
    setAnswers((existing) => ({ ...existing, [current.id]: value }));
    if (step < QUESTIONS.length - 1) setStep(step + 1);
  }

  function answerTipi(value: number) {
    if (!tipiCurrent) return;
    setTipiAnswers((existing) => ({ ...existing, [tipiCurrent.id]: value }));
    if (tipiStep < TIPI_QUESTIONS.length - 1) setTipiStep(tipiStep + 1);
  }

  const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);
  const activeProgress =
    testMode === 'tipi'
      ? Math.round((Object.keys(tipiAnswers).length / TIPI_QUESTIONS.length) * 100)
      : progress;

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
              src={
                testMode === 'tipi' || complete
                  ? '/personality/personality-results.svg'
                  : axis.image
              }
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

          {testMode === 'tipi' ? (
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
                      </article>
                    );
                  })}
                </div>
                <p style={{ ...resultTextStyle, marginTop: 14 }}>
                  Source: Ten-Item Personality Inventory by Gosling, Rentfrow, and Swann. It is
                  included here as a free quick glimpse. For a serious deeper version, Colourmap
                  should add IPIP Big Five next.
                </p>
              </section>
            )
          ) : !complete ? (
            <section style={{ marginTop: 20 }}>
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
                {axis.label} / {axis.short}
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
                {personalityStyle(scores)}
              </h3>

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
              testMode === 'tipi'
                ? setTipiStep(Math.max(0, tipiStep - 1))
                : setStep(Math.max(0, step - 1))
            }
            disabled={testMode === 'tipi' ? tipiStep === 0 || tipiComplete : step === 0 || complete}
            style={pillStyle(
              '#C4A060',
              testMode === 'tipi' ? tipiStep === 0 || tipiComplete : step === 0 || complete,
            )}
          >
            prev
          </button>
          {testMode === 'tipi' && tipiComplete ? (
            <button
              type="button"
              onClick={() => {
                setTipiAnswers({});
                setTipiStep(0);
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
                setStep(0);
              }}
              style={pillStyle('#C4A060')}
            >
              restart
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                testMode === 'tipi'
                  ? setTipiStep(Math.min(TIPI_QUESTIONS.length - 1, tipiStep + 1))
                  : setStep(Math.min(QUESTIONS.length - 1, step + 1))
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
