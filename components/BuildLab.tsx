'use client';

import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  FolderOpen,
  GitBranch,
  Heart,
  ImagePlus,
  Mic,
  MicOff,
  Network,
  Palette,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
} from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useSpeechToText } from '@/lib/hooks/use-speech-to-text';

type Agent = {
  id: string;
  name: string;
  available: boolean;
};

type RunnerStatus = {
  online: boolean;
  executionOwner: string;
  remoteRunReady: boolean;
  host: string;
  machine: string;
  platform: string;
  workingDirectory: string;
};

type AgentMode = 'plan' | 'build' | 'fix' | 'review';

type ConsoleEvent = {
  id: number;
  type: string;
  text: string;
  tone?: 'normal' | 'error' | 'success' | 'meta';
};

type CheckpointInfo = {
  created: boolean;
  path?: string;
  reason?: string;
  changedFiles?: string[];
};

type ProjectInfo = {
  projectPath: string;
  git: boolean;
  branch: string | null;
  changedFiles: string[];
};

type MissionMemory = {
  id: string;
  title: string;
  channelId?: string;
  mode: AgentMode;
  agentId: string;
  projectPath: string;
  status: 'complete' | 'failed' | 'draft';
  prompt: string;
  changedFiles: string[];
  createdAt: string;
  reflection?: string;
};

type QueuedMissionStatus = 'draft' | 'queued' | 'running' | 'complete' | 'failed';

type QueuedMission = {
  id: string;
  title: string;
  channelId: string;
  agentId: string;
  projectPath: string;
  prompt: string;
  status: QueuedMissionStatus;
  createdAt: string;
  updatedAt: string;
  events: Array<{
    id: number;
    type: string;
    text: string;
    createdAt: string;
  }>;
};

type ScreenshotNote = {
  id: string;
  channelId: string;
  title: string;
  note: string;
  image: string;
  createdAt: string;
};

type WorkChannel = {
  id: string;
  name: string;
  focus: string;
  next: string;
};

type GardenAngle =
  | 'spec'
  | 'reflection'
  | 'business'
  | 'education'
  | 'philosophy'
  | 'wellbeing'
  | 'art'
  | 'practice'
  | 'future';

type GardenNode = {
  id: string;
  title: string;
  tag: string;
  angle: GardenAngle;
  summary: string;
  next: string;
  geometry?: string;
};

type GardenDisplay = 'glimpse' | 'bubble' | 'board' | 'road' | 'constellation' | 'curriculum';

const HISTORY_LS = 'colourmap:build-lab-history';
const RECENT_PROJECTS_LS = 'colourmap:build-lab-recent-projects';
const ACTIVE_CHANNEL_LS = 'colourmap:build-lab-active-channel';
const SCREENSHOT_NOTES_LS = 'colourmap:build-lab-screenshot-notes';
const PHONE_PREP_LS = 'colourmap:build-lab-phone-prep';

const DEFAULT_CHANNELS: WorkChannel[] = [
  {
    id: 'dot-walker',
    name: 'Dot Walker',
    focus: 'Character visuals, arena, golden-dot presence, movement language.',
    next: 'Keep game, dialogue, and geometry character work together.',
  },
  {
    id: 'lab',
    name: 'Build Lab',
    focus: 'Creator Space, mission memory, channels, Garden, agent cockpit.',
    next: 'Make coding work readable and organized instead of one terminal stream.',
  },
  {
    id: 'phone-runner',
    name: 'Phone Level 2',
    focus: 'Phone control surface for sending missions to the home computer runner.',
    next: 'Queue prompts, screenshots, runner status, and permission approvals.',
  },
  {
    id: 'general',
    name: 'General',
    focus: 'Unsorted missions, quick fixes, and temporary experiments.',
    next: 'Use this only when a mission does not yet belong to a clearer channel.',
  },
];

const gardenAngles: Array<{
  id: GardenAngle;
  label: string;
  icon: typeof Network;
  question: string;
}> = [
  {
    id: 'spec',
    label: 'Spec Map',
    icon: Network,
    question: 'What exists, what connects, and what is unfinished?',
  },
  {
    id: 'reflection',
    label: 'Reflection',
    icon: Sparkles,
    question: 'What is the human meaning behind the system?',
  },
  {
    id: 'business',
    label: 'Business Plan',
    icon: BriefcaseBusiness,
    question: 'What makes this shippable, understandable, and profitable?',
  },
  {
    id: 'education',
    label: 'Education Atlas',
    icon: BookOpen,
    question: 'How do the learning programs explain wellbeing as one coherent map?',
  },
  {
    id: 'philosophy',
    label: 'Philosophy',
    icon: Compass,
    question: 'How do we turn big questions into lived clarity and better choices?',
  },
  {
    id: 'wellbeing',
    label: 'Wellbeing',
    icon: Heart,
    question: 'How can inner clarity grow into better relationships and collective happiness?',
  },
  {
    id: 'art',
    label: 'Artistic',
    icon: Palette,
    question: 'What visual language makes the idea felt before it is explained?',
  },
  {
    id: 'practice',
    label: 'Practical',
    icon: ShieldCheck,
    question: 'What tiny next cuts turn complexity into movement?',
  },
  {
    id: 'future',
    label: 'Intelligence',
    icon: Compass,
    question: 'How does this become a new way to understand information?',
  },
];

const gardenNodes: GardenNode[] = [
  {
    id: 'field',
    title: 'Field -> Tensions -> Action -> Patterns',
    tag: 'core',
    angle: 'spec',
    summary:
      'The central product grammar: notice the day field, name the pressure, choose a bridge action, then learn the recurring pattern.',
    next: 'Turn this into the top-level map that explains why Check In, Missions, Progress, Geometry, and AI belong together.',
  },
  {
    id: 'build-lab',
    title: 'Build Lab',
    tag: 'creator',
    angle: 'spec',
    summary:
      'The coding-agent room: prompt, stream, diff, checkpoint, and readable mission memory in one creator cockpit.',
    next: 'Add phone mission queue and screenshot context once Supabase/local runner wiring is ready.',
  },
  {
    id: 'education',
    title: 'Education Atlas',
    tag: 'learning',
    angle: 'education',
    summary:
      'The education program can become the illustrated explanation layer for wellbeing: simple emotional mechanics shown as roads, maps, comics, and examples.',
    next: 'Create one overview map that groups programs by pressure, avoidance, energy, attention, and repair.',
  },
  {
    id: 'education-compass',
    title: 'Wellbeing Curriculum Compass',
    tag: 'learning',
    angle: 'education',
    summary:
      'The whole education program can be explained as a path from inner weather, to repeated loops, to repair skills, to relationships, to meaning.',
    next: 'Group education programs into five routes: Notice, Understand, Stabilize, Act, Connect.',
  },
  {
    id: 'comic-layer',
    title: 'Comic And Atlas Layer',
    tag: 'format',
    angle: 'education',
    summary:
      'Some ideas need comics, some need maps, some need roads, and some need tiny practical exercises. The format should match the kind of insight.',
    next: 'For every education program, choose the best visual format before designing the lesson.',
  },
  {
    id: 'philosophy-center',
    title: 'The Question That Organizes Life',
    tag: 'program',
    angle: 'philosophy',
    summary:
      'A philosophy program should begin with the living question, not a list of famous names: what kind of life am I trying to understand and practice?',
    next: 'Let the user choose one current question, then map it through self, values, reality, practice, and community.',
    geometry: 'Mode Sun',
  },
  {
    id: 'philosophy-self',
    title: 'Self And Attention',
    tag: 'self',
    angle: 'philosophy',
    summary:
      'The first philosophical territory is the observer: attention, identity, habits, desire, fear, and the stories that define what seems possible.',
    next: 'Connect this to Check In and Mode Bridge so philosophy becomes daily observation.',
    geometry: 'Brain Topography',
  },
  {
    id: 'philosophy-values',
    title: 'Values And Action',
    tag: 'ethics',
    angle: 'philosophy',
    summary:
      'Ethics becomes practical when values are translated into small actions under pressure: what do I do when creation, survival, comfort, and truth collide?',
    next: 'Make a values-to-action worksheet that ends in one bridge action.',
    geometry: 'Dot Heart',
  },
  {
    id: 'philosophy-reality',
    title: 'Reality And Meaning',
    tag: 'meaning',
    angle: 'philosophy',
    summary:
      'Metaphysics and meaning can be shown as maps of assumptions: what do I believe is real, valuable, changeable, connected, or mysterious?',
    next: 'Use Bubble Map to show belief clusters without forcing one answer.',
    geometry: 'Alchemical Dot Sun',
  },
  {
    id: 'philosophy-practice',
    title: 'Practice, Not Theory',
    tag: 'practice',
    angle: 'philosophy',
    summary:
      'The point is not to collect abstract ideas. The point is to live with more awareness, courage, compassion, precision, and freedom.',
    next: 'Each philosophy lesson should end with a tiny experiment in the next 24 hours.',
    geometry: 'Fire Dot Sun',
  },
  {
    id: 'human-loop',
    title: 'The Repeating Valley',
    tag: 'human',
    angle: 'reflection',
    summary:
      'People often do not fail because life is too complex. They get stuck in a repeated flow: fear, avoidance, relief, consequence, fear again.',
    next: 'Garden should show loops as visible rivers, not only as text explanations.',
  },
  {
    id: 'simple-challenge',
    title: 'Core Simple Challenge',
    tag: 'clarity',
    angle: 'reflection',
    summary:
      'Colourmap should reduce the fog to the few forces that matter now, so the user sees the problem as smaller and more workable.',
    next: 'Every map needs a "what is the one load-bearing tension?" block.',
  },
  {
    id: 'store',
    title: 'App Store Path',
    tag: 'ship',
    angle: 'business',
    summary:
      'The business map turns vision into gates: stable backend, phone performance, privacy wording, demo flow, screenshots, pricing, and retention.',
    next: 'Keep a release readiness board separate from dreamy future ideas.',
  },
  {
    id: 'market',
    title: 'Audience And Offer',
    tag: 'market',
    angle: 'business',
    summary:
      'Start with reflective creators and overwhelmed builders, then expand toward coaches, musicians, and visual intelligence tools.',
    next: 'Write a 30-second explanation for each audience and test which one feels clear.',
  },
  {
    id: 'inner-peace',
    title: 'Inner Peace Mechanics',
    tag: 'wellbeing',
    angle: 'wellbeing',
    summary:
      'Colourmap helps people notice pressure before it becomes identity, reduce the core challenge, and move energy between modes with less fear.',
    next: 'Make the app show one stuck pattern and one bridge action instead of flooding the user with advice.',
  },
  {
    id: 'relationship-field',
    title: 'Relationship Field',
    tag: 'social',
    angle: 'wellbeing',
    summary:
      'If people understand their own pressure loops, they can communicate with less projection and more timing, clarity, and care.',
    next: 'Future sharing should be built around readable state, consent, and simple repair signals.',
  },
  {
    id: 'collective-happiness',
    title: 'Collective Happiness',
    tag: 'world',
    angle: 'wellbeing',
    summary:
      'The long arc is not only self-optimization. It is better collective intelligence: calmer people, clearer teams, kinder decisions, and less wasted suffering.',
    next: 'Keep the first product personal, but let the philosophy guide education, groups, and future world maps.',
  },
  {
    id: 'gold-dots',
    title: 'Golden Dot Language',
    tag: 'visual',
    angle: 'art',
    summary:
      'Dots can become fields, suns, hearts, brains, characters, trails, and maps. They are the bridge between data and felt intelligence.',
    next: 'Use dot systems for the Garden itself: ideas as clusters, decisions as bright nodes, risks as pressure zones.',
  },
  {
    id: 'info-forms',
    title: 'Infographic Forms',
    tag: 'forms',
    angle: 'art',
    summary:
      'The same content can be shown as cards, rivers, constellations, detective boards, comics, 3D landscapes, or game-like journeys.',
    next: 'Let the user switch view angle before switching raw data.',
  },
  {
    id: 'next-cut',
    title: 'Next Cut Discipline',
    tag: 'action',
    angle: 'practice',
    summary:
      'The system must always answer: what is the smallest concrete move that changes the field?',
    next: 'Attach every idea node to one next action, one blocker, and one evidence screenshot or spec link.',
  },
  {
    id: 'habit',
    title: 'Clarity Habits',
    tag: 'ritual',
    angle: 'practice',
    summary:
      'After every mission: capture the prompt, changed files, decision, reflection, visual proof, and next cut. Weekly: compress into one map.',
    next: 'Make Build Lab generate Garden entries automatically after missions.',
  },
  {
    id: 'visual-ai',
    title: 'Graphical Intelligence',
    tag: 'future',
    angle: 'future',
    summary:
      'The long-term intelligence is not only text. AI helps choose the visual form that makes a situation easiest to understand and act on.',
    next: 'Prototype comparison lenses: business, emotional, artistic, practical, risk, and learning.',
  },
  {
    id: 'world',
    title: 'Wellbeing Knowledge Maps',
    tag: 'world',
    angle: 'future',
    summary:
      'Education, reflection, and personal data can become living maps that help people understand pressure, repair, attention, and peace.',
    next: 'Use the education program as the first full knowledge atlas test.',
  },
];

const gardenRelations = [
  ['field', 'human-loop'],
  ['field', 'education'],
  ['education', 'education-compass'],
  ['education-compass', 'comic-layer'],
  ['build-lab', 'habit'],
  ['habit', 'visual-ai'],
  ['gold-dots', 'info-forms'],
  ['info-forms', 'visual-ai'],
  ['store', 'market'],
  ['simple-challenge', 'next-cut'],
  ['education', 'world'],
  ['philosophy-center', 'philosophy-self'],
  ['philosophy-center', 'philosophy-values'],
  ['philosophy-values', 'philosophy-practice'],
  ['philosophy-reality', 'philosophy-practice'],
  ['inner-peace', 'relationship-field'],
  ['relationship-field', 'collective-happiness'],
];

const gardenPasses = [
  {
    title: '1. Decompose',
    text: 'Break the fog into nodes: idea, tension, evidence, decision, risk, next cut.',
  },
  {
    title: '2. Translate',
    text: 'Choose the right form: map, road, comic, board, constellation, comparison, or landscape.',
  },
  {
    title: '3. Move',
    text: 'End every reflection with one concrete bridge action and one way to verify it changed the field.',
  },
];

const gardenDisplays: Array<{
  id: GardenDisplay;
  label: string;
  description: string;
}> = [
  {
    id: 'glimpse',
    label: 'Glimpse',
    description: 'Best first view: understand the subject visually before reading deeply into it.',
  },
  {
    id: 'bubble',
    label: 'Bubble Map',
    description: 'Best default: a few calm idea bubbles with visible lines between them.',
  },
  {
    id: 'board',
    label: 'Board',
    description: 'Best for decisions, specs, open questions, and practical next cuts.',
  },
  {
    id: 'road',
    label: 'Road',
    description: 'Best for sequences: education paths, launch plans, and habit journeys.',
  },
  {
    id: 'constellation',
    label: 'Constellation',
    description: 'Best for seeing relationships between ideas without forcing chronology.',
  },
  {
    id: 'curriculum',
    label: 'Curriculum',
    description: 'Best for explaining a complex subject as learning routes.',
  },
];

const curriculumRoutes: Record<
  'default' | 'philosophy',
  Array<{ title: string; summary: string }>
> = {
  default: [
    {
      title: 'Notice',
      summary: 'Name the field and see the pressure before becoming it.',
    },
    {
      title: 'Understand',
      summary: 'Find the repeated valley, loop, or hidden tension.',
    },
    {
      title: 'Stabilize',
      summary: 'Regulate enough that reflection becomes possible.',
    },
    {
      title: 'Act',
      summary: 'Choose the smallest bridge action that changes the field.',
    },
    {
      title: 'Connect',
      summary: 'Turn clarity into kinder communication and shared repair.',
    },
  ],
  philosophy: [
    {
      title: 'Wonder',
      summary: 'Begin with a real question that has emotional weight today.',
    },
    {
      title: 'Self',
      summary: 'Notice who is asking: attention, fear, desire, identity, and habit.',
    },
    {
      title: 'Values',
      summary: 'Name what matters when comfort, truth, survival, and creation pull apart.',
    },
    {
      title: 'Reality',
      summary: 'Map the assumptions underneath the question without rushing to certainty.',
    },
    {
      title: 'Practice',
      summary: 'Turn the insight into one lived experiment in the next 24 hours.',
    },
  ],
};

const gardenPastels: Record<GardenAngle, { bg: string; border: string; accent: string }> = {
  spec: { bg: 'rgba(221,235,255,0.72)', border: 'rgba(92,126,170,0.22)', accent: '#5d7898' },
  reflection: { bg: 'rgba(237,226,255,0.72)', border: 'rgba(126,96,158,0.22)', accent: '#80639d' },
  business: { bg: 'rgba(218,240,224,0.72)', border: 'rgba(83,132,91,0.22)', accent: '#5a875f' },
  education: { bg: 'rgba(255,232,205,0.72)', border: 'rgba(171,118,63,0.22)', accent: '#a46f3f' },
  philosophy: { bg: 'rgba(228,238,230,0.75)', border: 'rgba(88,122,97,0.24)', accent: '#5f7e66' },
  wellbeing: { bg: 'rgba(255,225,229,0.72)', border: 'rgba(176,92,105,0.2)', accent: '#aa6570' },
  art: { bg: 'rgba(232,230,255,0.72)', border: 'rgba(102,98,177,0.2)', accent: '#6965aa' },
  practice: { bg: 'rgba(230,243,238,0.72)', border: 'rgba(79,138,118,0.2)', accent: '#547f70' },
  future: { bg: 'rgba(223,241,248,0.72)', border: 'rgba(73,134,156,0.2)', accent: '#527f91' },
};

const sunDots = Array.from({ length: 280 }, (_, index) => {
  const field = index / 279;
  const angle = index * 2.399963229728653;
  const radius = Math.min(1.12, Math.sqrt(field) * (0.83 + ((index * 13) % 17) / 100));
  const x = 50 + Math.cos(angle) * radius * 39;
  const y = 50 + Math.sin(angle) * radius * 39;
  const size = 1.35 + (1 - Math.min(radius, 1)) * 1.85 + (index % 5) * 0.12;
  const heat = 1 - Math.min(radius, 1);
  const flow = 2.2 + radius * 9.5;
  const sway = 0.72 + ((index * 7) % 11) * 0.18;
  const tangent = angle + Math.PI / 2;
  return {
    id: index,
    x: x.toFixed(3),
    y: y.toFixed(3),
    size: size.toFixed(3),
    delay: ((index % 37) * 0.19).toFixed(3),
    duration: (5.8 + (index % 13) * 0.42 + radius * 2.4).toFixed(3),
    flowAx: (Math.cos(tangent) * flow * sway).toFixed(3),
    flowAy: (Math.sin(tangent) * flow * sway).toFixed(3),
    flowBx: (Math.cos(angle + 1.7) * flow * 0.55).toFixed(3),
    flowBy: (Math.sin(angle + 1.7) * flow * 0.55).toFixed(3),
    flowCx: (Math.cos(tangent + 2.2) * flow * 0.78).toFixed(3),
    flowCy: (Math.sin(tangent + 2.2) * flow * 0.78).toFixed(3),
    glint: index % 19 === 0 || index % 31 === 0,
    heat: Number(heat.toFixed(3)),
  };
});

const sunGlints = Array.from({ length: 34 }, (_, index) => {
  const angle = index * 2.399963229728653 + 0.42;
  const radius = 0.56 + ((index * 17) % 41) / 100;
  return {
    id: index,
    x: (50 + Math.cos(angle) * radius * 44).toFixed(3),
    y: (50 + Math.sin(angle) * radius * 44).toFixed(3),
    size: (1.2 + (index % 4) * 0.45).toFixed(3),
    delay: ((index % 11) * 0.34).toFixed(3),
    duration: (2.8 + (index % 7) * 0.36).toFixed(3),
  };
});

const sunVoices = [
  {
    id: 'calm',
    label: 'Calm',
    text: 'I am listening. Let us make the next thought smaller, clearer, and possible.',
    rate: 0.86,
    pitch: 0.92,
  },
  {
    id: 'story',
    label: 'Story',
    text: 'A field of dots becomes a sun, and the sun becomes a patient voice for the work ahead.',
    rate: 0.78,
    pitch: 1.02,
  },
  {
    id: 'focus',
    label: 'Focus',
    text: 'Name the center. Find the next cut. Keep the system simple enough to move.',
    rate: 0.94,
    pitch: 0.86,
  },
];

function SunPresence({
  active,
  speaking = false,
  compact = false,
  livingText,
}: {
  active: boolean;
  speaking?: boolean;
  compact?: boolean;
  livingText: string;
}) {
  const visibleLivingText =
    livingText.length > (compact ? 96 : 220)
      ? `${livingText.slice(livingText.length - (compact ? 96 : 220))}`
      : livingText;
  const energy = active ? 1 : Math.min(0.72, 0.28 + livingText.trim().length / 220);
  const sunSize = compact ? 'h-32 w-32' : 'h-56 w-56';
  const dotLimit = compact ? 190 : sunDots.length;

  return (
    <div
      className={
        compact
          ? 'relative overflow-hidden rounded-2xl border border-[#8f6232]/18 bg-[#2a140a] p-3'
          : 'relative overflow-hidden rounded-2xl border border-[#8f6232]/18 bg-[#2a140a] p-4'
      }
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: active
            ? 'radial-gradient(circle at 50% 42%, rgba(255,196,74,0.25), transparent 48%)'
            : 'radial-gradient(circle at 50% 42%, rgba(255,196,74,0.13), transparent 44%)',
        }}
      />
      <div
        className={
          compact
            ? 'relative flex min-h-[236px] flex-col items-center justify-center gap-3'
            : 'relative flex min-h-[330px] flex-col items-center justify-center gap-4'
        }
      >
        <div
          className={`build-lab-sun-field relative ${sunSize} rounded-full`}
          style={{
            filter: active
              ? 'drop-shadow(0 0 34px rgba(255,138,34,0.8))'
              : 'drop-shadow(0 0 20px rgba(255,138,34,0.38))',
            transform: active
              ? `translateY(${speaking ? '-4px' : '0'}) scale(1.04)`
              : `translateY(${Math.round((energy - 0.28) * -10)}px) scale(${(0.96 + energy * 0.06).toFixed(3)})`,
            transition: 'transform 220ms ease, filter 220ms ease',
            animation: active ? 'build-lab-sun-breathe 1.8s ease-in-out infinite' : 'none',
          }}
        >
          <span
            className="build-lab-sun-corona absolute inset-[7%] rounded-full"
            style={{ opacity: active ? 1 : 0.54 }}
          />
          <span
            className="build-lab-sun-wave absolute inset-[15%] rounded-full"
            style={{ opacity: active ? 1 : 0.28 }}
          />
          {sunDots.slice(0, dotLimit).map((dot) => {
            const color = dot.heat > 0.66 ? '#ffd86b' : dot.heat > 0.34 ? '#ffc044' : '#f59d2d';
            const flowScale = active ? 1.12 : speaking ? 0.96 : 0.62 + energy * 0.28;
            const baseScale = active
              ? (0.92 + dot.heat * 0.38).toFixed(3)
              : (0.72 + energy * 0.22 + dot.heat * 0.1).toFixed(3);
            return (
              <span
                key={dot.id}
                className={`build-lab-sun-dot absolute rounded-full ${
                  active ? 'build-lab-sun-dot-active' : ''
                } ${dot.glint ? 'build-lab-sun-dot-glint' : ''}`}
                style={
                  {
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    '--dot-size': `${dot.size}px`,
                    '--dot-color': color,
                    '--dot-shadow': active
                      ? `${(11 + dot.heat * 18).toFixed(2)}px rgba(255,188,63,0.88)`
                      : `${(5 + dot.heat * 9).toFixed(2)}px rgba(255,176,55,0.5)`,
                    '--dot-opacity': active
                      ? (0.74 + dot.heat * 0.22).toFixed(3)
                      : (0.38 + dot.heat * 0.2 + energy * 0.18).toFixed(3),
                    '--base-scale': baseScale,
                    '--flow-duration': `${dot.duration}s`,
                    '--flow-delay': `-${dot.delay}s`,
                    '--flow-a-x': `${Number(dot.flowAx) * flowScale}px`,
                    '--flow-a-y': `${Number(dot.flowAy) * flowScale}px`,
                    '--flow-b-x': `${Number(dot.flowBx) * flowScale}px`,
                    '--flow-b-y': `${Number(dot.flowBy) * flowScale}px`,
                    '--flow-c-x': `${Number(dot.flowCx) * flowScale}px`,
                    '--flow-c-y': `${Number(dot.flowCy) * flowScale}px`,
                  } as CSSProperties
                }
              />
            );
          })}
          {sunGlints.slice(0, compact ? 18 : sunGlints.length).map((glint) => (
            <span
              key={`glint-${glint.id}`}
              className="build-lab-sun-glint absolute rounded-full"
              style={{
                left: `${glint.x}%`,
                top: `${glint.y}%`,
                width: `${glint.size}px`,
                height: `${glint.size}px`,
                animationDelay: `-${glint.delay}s`,
                animationDuration: `${glint.duration}s`,
                opacity: active ? 0.9 : 0.46,
              }}
            />
          ))}
        </div>
        <div className="relative w-full rounded-2xl border border-[#ffd36c]/22 bg-[#130905]/72 p-3 shadow-[0_0_34px_rgba(255,166,49,0.12)]">
          <div className="pointer-events-none absolute inset-0 opacity-35">
            {sunDots.slice(0, compact ? 18 : 28).map((dot) => (
              <span
                key={`transcript-${dot.id}`}
                className="absolute h-1 w-1 rounded-full bg-[#ffd36c]"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  boxShadow: '0 0 9px rgba(255,190,70,0.75)',
                  opacity: '0.55',
                }}
              />
            ))}
          </div>
          <p className="relative text-[10px] uppercase tracking-[0.2em] text-[#ffca72]/75">
            {compact ? 'mission sun' : 'living transcript'}
          </p>
          <p
            className={
              compact
                ? 'relative mt-2 min-h-12 font-serif text-sm leading-6 text-[#ffe0a0]'
                : 'relative mt-2 min-h-16 font-serif text-lg leading-7 text-[#ffe0a0]'
            }
            style={{ textShadow: '0 0 18px rgba(255,180,62,0.42)' }}
          >
            {visibleLivingText}
            {active && <span className="ml-1 animate-pulse text-[#ffd36c]">|</span>}
          </p>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-full border border-[#ffd36c]/20 bg-[#1a0d07]/72 px-3 py-2 text-xs text-[#ffd99a]">
        <span>{active ? (speaking ? 'speaking' : 'listening') : 'waiting'}</span>
        <span>{dotLimit} dots</span>
      </div>
    </div>
  );
}

function nextId() {
  return Date.now() + Math.random();
}

function estimateMission(prompt: string) {
  const text = prompt.toLowerCase();
  let score = 0;
  if (text.length > 180) score += 1;
  if (text.length > 420) score += 1;
  if (/\b(api|backend|supabase|database|auth|migration|queue|stream|agent|tests?)\b/.test(text))
    score += 1;
  if (/\b(refactor|architecture|deep|multiple|all|system|music|geometry|voice)\b/.test(text))
    score += 1;
  if (/\b(fix|button|copy|text|small|simple|move|label)\b/.test(text)) score -= 1;

  const difficulty = score <= 0 ? 'easy' : score <= 2 ? 'medium' : 'hard';
  const time =
    difficulty === 'easy'
      ? 'loose: 5-15 min'
      : difficulty === 'medium'
        ? 'loose: 15-45 min'
        : 'loose: 45+ min';
  const challenge =
    difficulty === 'easy'
      ? 'Mostly a focused UI or behavior adjustment with limited blast radius.'
      : difficulty === 'medium'
        ? 'Needs a few connected changes and verification so the interaction stays coherent.'
        : 'Likely touches several moving parts, so the challenge is sequencing, testing, and avoiding regressions.';

  return { difficulty, time, challenge };
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function shortPath(path: string) {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 2) return normalized;
  return `${parts.at(-2)}/${parts.at(-1)}`;
}

function missionTitleFromPrompt(prompt: string) {
  const firstLine = prompt
    .trim()
    .split(/\r?\n/)
    .find((line) => line.trim());
  if (!firstLine) return 'Untitled coding mission';
  return firstLine.length > 82 ? `${firstLine.slice(0, 79)}...` : firstLine;
}

function missionReflection(status: MissionMemory['status'], files: string[]) {
  if (status === 'complete') {
    return files.length
      ? `The agent finished and left ${files.length} changed file${files.length === 1 ? '' : 's'} to review.`
      : 'The agent finished without leaving changed files in the current diff.';
  }
  return files.length
    ? `The run did not fully complete, but it touched ${files.length} file${files.length === 1 ? '' : 's'} that may need review.`
    : 'The run did not complete and no changed files were detected.';
}

function GardenNodeCard({
  node,
  index,
  compact = false,
  selected = false,
  onSelect,
}: {
  node: GardenNode;
  index: number;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative rounded-[20px] border bg-[#fff8e8]/92 p-5 text-left shadow-[0_18px_34px_rgba(76,45,19,0.08)] transition"
      style={{ marginTop: compact ? 0 : index % 3 === 1 ? 34 : index % 3 === 2 ? 12 : 0 }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full border border-[#b98d52]/24 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8d653d]">
          {node.tag}
        </span>
        <span
          className="h-2 w-2 rounded-full shadow-[0_0_14px_rgba(155,49,40,0.45)]"
          style={{ background: selected ? '#f05d2c' : '#9b3128' }}
        />
      </div>
      <h3 className="font-serif text-lg leading-6 text-[#3f2817]">{node.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f4229]">{node.summary}</p>
      <div className="mt-3 rounded-xl border border-[#d9b879]/35 bg-[#fffdf2]/75 p-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#8d653d]">Next cut</p>
        <p className="mt-1 text-xs leading-5 text-[#704923]">{node.next}</p>
      </div>
    </button>
  );
}

function GardenOfIdeas() {
  const [angle, setAngle] = useState<GardenAngle>('spec');
  const [expanded, setExpanded] = useState(false);
  const [display, setDisplay] = useState<GardenDisplay>('glimpse');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('field');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const active = gardenAngles.find((item) => item.id === angle) ?? gardenAngles[0];
  const ActiveIcon = active.icon;
  const tint = gardenPastels[angle];
  const activeDisplay = gardenDisplays.find((item) => item.id === display) ?? gardenDisplays[0];
  const visibleNodes = gardenNodes.filter((node) => node.angle === angle || node.tag === 'core');
  const primaryNodes = visibleNodes.slice(0, display === 'constellation' ? 6 : 4);
  const selectedNode =
    visibleNodes.find((node) => node.id === selectedNodeId) ?? primaryNodes[0] ?? gardenNodes[0];
  const activeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleRelations = gardenRelations.filter(
    ([from, to]) => activeIds.has(from) && activeIds.has(to),
  );
  const activeRoutes =
    angle === 'philosophy' ? curriculumRoutes.philosophy : curriculumRoutes.default;
  const selectedRoute = activeRoutes[selectedRouteIndex] ?? activeRoutes[0];

  function selectAngle(nextAngle: GardenAngle) {
    setAngle(nextAngle);
    const firstNode = gardenNodes.find((node) => node.angle === nextAngle) ?? gardenNodes[0];
    setSelectedNodeId(firstNode.id);
    setSelectedRouteIndex(0);
    setCategoryOpen(false);
  }

  return (
    <section
      className={
        expanded
          ? 'fixed inset-3 z-50 overflow-auto rounded-[26px] border border-[#b98d52]/25 bg-[#f7e7c2] shadow-[0_30px_90px_rgba(45,25,10,0.38)] sm:inset-5'
          : 'overflow-hidden rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/72'
      }
    >
      <div
        className={
          expanded
            ? 'sticky top-0 z-10 border-b border-[#b98d52]/18 bg-[#f7e7c2]/96 p-5 backdrop-blur'
            : 'border-b border-[#b98d52]/18 p-4'
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#704923]">
              <Network size={14} />
              Garden of Ideas
            </p>
            <h2
              className={
                expanded
                  ? 'mt-1 font-serif text-4xl text-[#3f2817]'
                  : 'mt-1 font-serif text-2xl text-[#3f2817]'
              }
            >
              Visual intelligence board
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#775638]">
              A first map for turning Colourmap's specs, reflections, education programs, and
              business strategy into visible relationships instead of a pile of text.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-[#b98d52]/25 bg-[#fffdf2]/70 px-3 py-2 text-xs text-[#704923]">
              Spec document as test subject
            </div>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-full bg-[#704923] px-4 py-2 text-xs text-[#fff8e8]"
            >
              {expanded ? 'Close Garden' : 'Open Garden'}
            </button>
          </div>
        </div>

        <div
          className="mt-4 rounded-2xl border p-3"
          style={{ background: tint.bg, borderColor: tint.border }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full border bg-[#fff8e8] p-2"
                style={{ borderColor: tint.border, color: tint.accent }}
              >
                <ActiveIcon size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d653d]">Category</p>
                <p className="font-serif text-lg text-[#3f2817]">{active.label}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCategoryOpen((value) => !value)}
              className="rounded-full border border-[#8f6232]/25 px-3 py-2 text-xs text-[#704923]"
            >
              {categoryOpen ? 'Close categories' : 'Change category'}
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#775638]">{active.question}</p>

          {categoryOpen && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {gardenAngles.map((item) => {
                const Icon = item.icon;
                const selected = item.id === angle;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectAngle(item.id)}
                    className="flex min-h-16 items-start gap-2 rounded-2xl border p-3 text-left transition"
                    style={{
                      borderColor: selected ? '#704923' : 'rgba(112,73,38,0.16)',
                      background: selected ? 'rgba(112,73,35,0.1)' : 'rgba(255,253,242,0.72)',
                      color: selected ? '#3f2817' : '#704923',
                    }}
                  >
                    <Icon size={15} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-xs font-medium">{item.label}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-[#8d653d]">
                        {item.question}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {expanded && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-[0.16em] text-[#8d653d]">Display</span>
            {gardenDisplays.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDisplay(item.id)}
                className="rounded-full border px-3 py-2 text-xs"
                style={{
                  borderColor: display === item.id ? tint.accent : 'rgba(112,73,38,0.18)',
                  background: display === item.id ? tint.bg : '#fffdf2',
                  color: display === item.id ? tint.accent : '#704923',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!expanded && (
        <div className="grid gap-4 bg-[#fffdf2]/55 p-4 lg:grid-cols-[1fr_220px]">
          <div
            className="rounded-2xl border bg-[#fff8e8]/88 p-5"
            style={{ borderColor: tint.border }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Current focus</p>
            <h3 className="mt-1 font-serif text-2xl text-[#3f2817]">{selectedNode.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#775638]">
              {selectedNode.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#8d653d]">
              <span
                className="rounded-full border px-3 py-1"
                style={{ background: tint.bg, borderColor: tint.border, color: tint.accent }}
              >
                {active.label}
              </span>
              <span className="rounded-full border border-[#b98d52]/24 px-3 py-1">
                {activeDisplay.label}
              </span>
              <span className="rounded-full border border-[#b98d52]/24 px-3 py-1">
                low attention preview
              </span>
            </div>
          </div>
          <div
            className="flex flex-col justify-between rounded-2xl border bg-[#fffdf2]/78 p-4"
            style={{ borderColor: tint.border }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">One next move</p>
              <p className="mt-2 text-sm leading-6 text-[#775638]">{selectedNode.next}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-4 rounded-full px-4 py-2 text-sm text-[#fff8e8]"
              style={{ background: tint.accent }}
            >
              Open visual map
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="min-h-[calc(100vh-190px)]">
          <div
            className="grid gap-4 border-b p-5 lg:grid-cols-[1fr_260px_1fr]"
            style={{ background: tint.bg, borderColor: tint.border }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Lens question</p>
              <h3 className="mt-1 font-serif text-2xl text-[#3f2817]">{active.label}</h3>
              <p className="mt-2 text-sm leading-6 text-[#775638]">{active.question}</p>
            </div>
            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fffdf2]/72 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Display mode</p>
              <h4 className="mt-1 font-serif text-xl text-[#3f2817]">{activeDisplay.label}</h4>
              <p className="mt-2 text-sm leading-6 text-[#775638]">{activeDisplay.description}</p>
            </div>
            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fffdf2]/72 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Clarity rule</p>
              <p className="mt-2 text-sm leading-6 text-[#775638]">
                {angle === 'philosophy'
                  ? 'Start from one living question. Philosophy becomes useful when it clarifies life, not when it multiplies concepts.'
                  : 'Show only the few nodes needed for this lens. Details can open later; the first read should feel calm.'}
              </p>
            </div>
          </div>

          <div
            className="relative min-h-[620px] p-7"
            style={{ background: 'rgba(255,253,242,0.54)' }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(112,73,35,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(112,73,35,0.08) 1px, transparent 1px)',
                backgroundSize: '42px 42px',
              }}
            />
            {display === 'glimpse' && (
              <div
                className="relative mx-auto min-h-[620px] max-w-5xl overflow-hidden rounded-[30px] border bg-[#fff8e8]/72 p-8"
                style={{ borderColor: tint.border }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 50% 42%, ${tint.bg}, transparent 42%)`,
                  }}
                />
                <div className="relative mx-auto flex min-h-[560px] max-w-4xl flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: tint.accent }}>
                    Glimpse view
                  </p>
                  <h3 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-[#3f2817]">
                    {selectedNode.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[#775638]">
                    {selectedNode.summary}
                  </p>
                  <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3">
                    {[
                      ['Category', active.label],
                      ['Shape', activeDisplay.label],
                      ['Next', selectedNode.next],
                    ].map(([label, value]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setDisplay(label === 'Next' ? 'board' : 'bubble')}
                        className="rounded-[24px] border bg-[#fffdf2]/78 p-4 text-left shadow-[0_14px_30px_rgba(76,45,19,0.08)]"
                        style={{ borderColor: tint.border }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d653d]">
                          {label}
                        </p>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#3f2817]">
                          {value}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {primaryNodes.slice(0, 4).map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        className="rounded-full border px-3 py-2 text-xs"
                        style={{
                          borderColor: selectedNode.id === node.id ? tint.accent : tint.border,
                          background: selectedNode.id === node.id ? tint.bg : '#fffdf2',
                          color: selectedNode.id === node.id ? tint.accent : '#704923',
                        }}
                      >
                        {node.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {display === 'bubble' && (
              <div className="relative mx-auto min-h-[620px] max-w-5xl overflow-hidden rounded-[28px] border border-[#b98d52]/18 bg-[#fff8e8]/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,219,139,0.45),transparent_42%)]" />
                <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                  {visibleRelations
                    .filter(([from, to]) =>
                      primaryNodes.some((node) => node.id === from || node.id === to),
                    )
                    .slice(0, 6)
                    .map(([from, to], index) => {
                      const fromIndex = Math.max(
                        0,
                        primaryNodes.findIndex((node) => node.id === from),
                      );
                      const toIndex = Math.max(
                        0,
                        primaryNodes.findIndex((node) => node.id === to),
                      );
                      const positions = [
                        [50, 22],
                        [25, 45],
                        [72, 47],
                        [44, 72],
                        [72, 76],
                        [18, 74],
                      ];
                      const [x1, y1] = positions[fromIndex] ?? positions[0];
                      const [x2, y2] = positions[toIndex] ?? positions[1];
                      return (
                        <line
                          key={`${from}-${to}-${index}`}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke="rgba(143,73,46,0.3)"
                          strokeWidth="1.6"
                          strokeDasharray={index % 2 ? '5 8' : undefined}
                        />
                      );
                    })}
                </svg>
                {primaryNodes.map((node, index) => {
                  const positions = [
                    [50, 22],
                    [25, 45],
                    [72, 47],
                    [44, 72],
                    [72, 76],
                    [18, 74],
                  ];
                  const [x, y] = positions[index] ?? positions[0];
                  const isCore = node.tag === 'core';
                  return (
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      key={node.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border p-5 text-center shadow-[0_18px_45px_rgba(83,45,18,0.12)]"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: isCore ? 255 : 220,
                        minHeight: isCore ? 255 : 220,
                        borderColor:
                          selectedNode.id === node.id
                            ? 'rgba(240,93,44,0.72)'
                            : isCore
                              ? 'rgba(112,73,35,0.38)'
                              : 'rgba(185,141,82,0.3)',
                        background: isCore
                          ? 'radial-gradient(circle at 38% 32%, rgba(255,220,139,0.98), rgba(255,248,232,0.94))'
                          : 'rgba(255,253,242,0.9)',
                      }}
                    >
                      <div className="mx-auto mb-3 h-3 w-3 rounded-full bg-[#9b3128] shadow-[0_0_18px_rgba(155,49,40,0.45)]" />
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#8d653d]">
                        {node.tag}
                      </p>
                      <h3 className="mt-2 font-serif text-lg leading-6 text-[#3f2817]">
                        {node.title}
                      </h3>
                      <p className="mt-2 line-clamp-4 text-xs leading-5 text-[#775638]">
                        {node.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {display === 'board' && (
              <div className="relative mx-auto grid max-w-5xl auto-rows-min gap-5 md:grid-cols-2">
                {primaryNodes.map((node, index) => (
                  <GardenNodeCard
                    key={node.id}
                    node={node}
                    index={index}
                    selected={selectedNode.id === node.id}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                ))}
              </div>
            )}

            {display === 'road' && (
              <div className="relative mx-auto flex max-w-4xl flex-col gap-5">
                <div className="absolute top-8 bottom-8 left-6 w-px bg-[#9b3128]/30 md:left-1/2" />
                {primaryNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className={`relative flex ${index % 2 ? 'md:justify-end' : 'md:justify-start'}`}
                  >
                    <div className="absolute top-6 left-4 h-4 w-4 rounded-full border-2 border-[#f7e7c2] bg-[#9b3128] shadow-[0_0_18px_rgba(155,49,40,0.35)] md:left-1/2 md:-translate-x-1/2" />
                    <div className="ml-12 w-[calc(100%-3rem)] md:ml-0 md:w-[44%]">
                      <GardenNodeCard
                        node={node}
                        index={index}
                        compact
                        selected={selectedNode.id === node.id}
                        onSelect={() => setSelectedNodeId(node.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {display === 'constellation' && (
              <div className="relative mx-auto min-h-[620px] max-w-5xl overflow-hidden rounded-[24px] border border-[#b98d52]/18 bg-[#2a140a]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,196,74,0.18),transparent_38%)]" />
                {visibleRelations
                  .filter(([from, to]) =>
                    primaryNodes.some((node) => node.id === from || node.id === to),
                  )
                  .slice(0, 5)
                  .map(([from, to], index) => {
                    const fromIndex = Math.max(
                      0,
                      primaryNodes.findIndex((node) => node.id === from),
                    );
                    const toIndex = Math.max(
                      0,
                      primaryNodes.findIndex((node) => node.id === to),
                    );
                    const x1 = 18 + ((fromIndex * 29) % 66);
                    const y1 = 22 + ((fromIndex * 37) % 52);
                    const x2 = 18 + ((toIndex * 29) % 66);
                    const y2 = 22 + ((toIndex * 37) % 52);
                    return (
                      <svg
                        key={`${from}-${to}-${index}`}
                        className="absolute inset-0 h-full w-full"
                        aria-hidden="true"
                      >
                        <line
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke="rgba(255,122,68,0.34)"
                          strokeWidth="1.4"
                        />
                      </svg>
                    );
                  })}
                {primaryNodes.map((node, index) => {
                  const x = 18 + ((index * 29) % 66);
                  const y = 22 + ((index * 37) % 52);
                  return (
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      key={node.id}
                      className="absolute max-w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#ffd36c]/20 bg-[#1a0d07]/82 p-4 text-[#ffe2a5] shadow-[0_0_28px_rgba(255,137,47,0.18)]"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#ffb766]">
                        {node.tag}
                      </p>
                      <h3 className="mt-1 font-serif text-base leading-5">{node.title}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#ffdca0]/82">
                        {node.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {display === 'curriculum' && (
              <div className="relative mx-auto grid max-w-6xl gap-4 lg:grid-cols-5">
                {activeRoutes.map((route, index) => (
                  <div
                    key={route.title}
                    className="min-h-[360px] rounded-[22px] border border-[#8f6232]/20 bg-[#fff8e8]/86 p-4"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRouteIndex(index)}
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-full text-sm text-[#fff8e8]"
                      style={{ background: selectedRouteIndex === index ? '#9b3128' : '#704923' }}
                    >
                      {index + 1}
                    </button>
                    <h3 className="font-serif text-xl text-[#3f2817]">{route.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#775638]">{route.summary}</p>
                    <div className="mt-5 space-y-3">
                      {primaryNodes
                        .filter((_, nodeIndex) => nodeIndex % 5 === index)
                        .map((node) => (
                          <div
                            key={node.id}
                            className="rounded-2xl border border-[#b98d52]/20 bg-[#fffdf2]/78 p-3"
                          >
                            <p className="text-xs font-medium leading-5 text-[#3f2817]">
                              {node.title}
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-[#8d653d]">{node.tag}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="relative mx-auto mt-6 max-w-5xl rounded-2xl border border-[#b98d52]/20 bg-[#fffdf2]/78 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Deeper layer</p>
                <p className="text-xs text-[#8d653d]">
                  {visibleNodes.length - primaryNodes.length > 0
                    ? `${visibleNodes.length - primaryNodes.length} more nodes available later`
                    : 'All nodes for this lens are visible'}
                </p>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
                <div className="border-l border-[#9b3128]/35 pl-3">
                  <p className="text-sm font-medium text-[#3f2817]">{selectedNode.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#775638]">{selectedNode.summary}</p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#8d653d]">
                    Next reflection
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#704923]">{selectedNode.next}</p>
                </div>
                <div className="border-l border-[#9b3128]/35 pl-3">
                  <p className="text-sm font-medium text-[#3f2817]">
                    {display === 'curriculum' ? selectedRoute.title : 'Visual form'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#775638]">
                    {display === 'curriculum' ? selectedRoute.summary : activeDisplay.description}
                  </p>
                </div>
                <div className="border-l border-[#9b3128]/35 pl-3">
                  <p className="text-sm font-medium text-[#3f2817]">Geometry bridge</p>
                  <p className="mt-1 text-xs leading-5 text-[#775638]">
                    Open this idea as a living visual so the map can become an explainer, not only a
                    diagram.
                  </p>
                  <Link
                    href={`/geometry-field?preset=${encodeURIComponent(selectedNode.geometry ?? 'Mode Sun')}`}
                    className="mt-3 inline-flex rounded-full border border-[#8f6232]/25 px-3 py-2 text-xs text-[#704923]"
                  >
                    Open {selectedNode.geometry ?? 'Mode Sun'}
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {gardenPasses.map((pass) => (
                  <div key={pass.title} className="rounded-xl bg-[#fff8e8]/70 p-3">
                    <p className="text-xs font-medium text-[#3f2817]">{pass.title}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#775638]">{pass.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SunDialoguePrototype() {
  const [note, setNote] = useState('');
  const [voiceId, setVoiceId] = useState(sunVoices[0].id);
  const [speaking, setSpeaking] = useState(false);
  const speech = useSpeechToText({ lang: 'en-US' });
  const activeVoice = sunVoices.find((voice) => voice.id === voiceId) ?? sunVoices[0];
  const livingText =
    note.trim() || 'Speak and the words begin writing themselves under the golden presence.';
  const visibleLivingText =
    livingText.length > 220 ? `${livingText.slice(livingText.length - 220)}` : livingText;

  function toggleListening() {
    speech.resetError();
    if (speech.listening) {
      speech.stop();
    } else {
      speech.start(note, setNote);
    }
  }

  function speakFromSun() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeVoice.text);
    utterance.rate = activeVoice.rate;
    utterance.pitch = activeVoice.pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  const active = speech.listening || speaking;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#b98d52]/20 p-4"
      style={{
        background:
          'radial-gradient(circle at 28% 34%, rgba(255,178,65,0.28), transparent 34%), linear-gradient(135deg, rgba(255,248,224,0.9), rgba(89,44,21,0.16))',
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[0.78fr_1fr]">
        <SunPresence active={active} speaking={speaking} livingText={visibleLivingText} />

        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#704923]">
              <Sparkles size={14} />
              Sun Dialogue
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#3f2817]">Talk to the visual system</h2>
            <p className="mt-2 text-sm leading-6 text-[#775638]">
              First prototype for a future computer presence: you speak, the dot sun glows and
              records words; the program can answer with a browser voice and movement.
            </p>
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Speak to the sun or type a thought..."
            className="min-h-28 w-full resize-y rounded-2xl border border-[#b98d52]/25 bg-[#fffdf2] p-3 text-sm leading-6 text-[#3f2817] outline-none focus:border-[#8f6232]"
          />

          <div className="flex flex-wrap gap-2">
            {sunVoices.map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => setVoiceId(voice.id)}
                className="rounded-full border px-3 py-2 text-xs"
                style={{
                  borderColor: voice.id === voiceId ? '#704923' : 'rgba(112,73,38,0.18)',
                  background: voice.id === voiceId ? 'rgba(112,73,35,0.1)' : '#fffdf2',
                  color: '#704923',
                }}
              >
                {voice.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleListening}
              disabled={!speech.supported}
              className="inline-flex items-center gap-2 rounded-full border border-[#8f6232]/25 px-4 py-2 text-sm text-[#704923] disabled:opacity-45"
            >
              {speech.listening ? <MicOff size={15} /> : <Mic size={15} />}
              {speech.listening ? 'Stop listening' : 'Speak to sun'}
            </button>
            <button
              type="button"
              onClick={speakFromSun}
              className="rounded-full bg-[#704923] px-4 py-2 text-sm text-[#fff8e8]"
            >
              Let sun answer
            </button>
          </div>

          <p className="text-xs leading-5 text-[#8d653d]">
            {speech.error ||
              (speech.supported
                ? 'Long term this becomes AI voice, stories, emotional reflection, and geometry that reacts to speech rhythm.'
                : 'This browser does not expose speech recognition. Typing and speech synthesis can still be used.')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function BuildLab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState('codex');
  const mode: AgentMode = 'build';
  const [projectPath, setProjectPath] = useState('');
  const [prompt, setPrompt] = useState('');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [events, setEvents] = useState<ConsoleEvent[]>([]);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [diff, setDiff] = useState('');
  const [checkpoints, setCheckpoints] = useState<CheckpointInfo[]>([]);
  const [history, setHistory] = useState<MissionMemory[]>([]);
  const [activeChannelId, setActiveChannelId] = useState(DEFAULT_CHANNELS[0].id);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus | null>(null);
  const [queuedMissions, setQueuedMissions] = useState<QueuedMission[]>([]);
  const [openPanels, setOpenPanels] = useState({
    channels: false,
    setup: true,
    phone: false,
    phonePrep: false,
    memory: false,
    garden: false,
    sun: false,
    console: true,
    diff: false,
  });
  const [showRawConsole, setShowRawConsole] = useState(false);
  const [consoleDesignMode, setConsoleDesignMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [phonePrep, setPhonePrep] = useState('');
  const [screenshotNotes, setScreenshotNotes] = useState<ScreenshotNote[]>([]);
  const [autoRunQueue, setAutoRunQueue] = useState(true);
  const [activeMissionTitle, setActiveMissionTitle] = useState('');
  const [missionPhase, setMissionPhase] = useState<
    'idle' | 'starting' | 'working' | 'checking' | 'done'
  >('idle');
  const [showMissionDetails, setShowMissionDetails] = useState(false);
  const missionAbortRef = useRef<AbortController | null>(null);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);
  const queueRunnerRef = useRef(false);
  const queuedMissionsRef = useRef<QueuedMission[]>([]);
  const speech = useSpeechToText({ lang: 'en-US' });

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === agentId) ?? agents[0],
    [agents, agentId],
  );
  const activeChannel =
    DEFAULT_CHANNELS.find((channel) => channel.id === activeChannelId) ?? DEFAULT_CHANNELS[0];
  const channelHistory = history.filter(
    (mission) => (mission.channelId ?? 'general') === activeChannel.id,
  );
  const channelScreenshotNotes = screenshotNotes.filter(
    (note) => note.channelId === activeChannel.id,
  );
  const missionEstimate = estimateMission(prompt || activeMissionTitle);

  useEffect(() => {
    setHistory(loadJson<MissionMemory[]>(HISTORY_LS, []));
    setActiveChannelId(localStorage.getItem(ACTIVE_CHANNEL_LS) ?? DEFAULT_CHANNELS[0].id);
    setRecentProjects(loadJson<string[]>(RECENT_PROJECTS_LS, []));
    setPhonePrep(localStorage.getItem(PHONE_PREP_LS) ?? '');
    setScreenshotNotes(loadJson<ScreenshotNote[]>(SCREENSHOT_NOTES_LS, []));

    async function loadAgents() {
      const response = await fetch('/api/build-lab/availability');
      if (!response.ok) {
        setError(await response.text());
        return;
      }
      const data = (await response.json()) as { agents: Agent[] };
      setAgents(data.agents);
      setAgentId(data.agents.find((agent) => agent.available)?.id ?? data.agents[0]?.id ?? 'codex');
    }

    async function loadRunner() {
      const response = await fetch('/api/build-lab/runner');
      if (!response.ok) return;
      const data = (await response.json()) as { runner: RunnerStatus };
      setRunnerStatus(data.runner);
      setProjectPath((current) => current || data.runner.workingDirectory);
    }

    async function loadQueue() {
      const response = await fetch('/api/build-lab/queue');
      if (!response.ok) return;
      const data = (await response.json()) as { missions: QueuedMission[] };
      setQueuedMissions(data.missions);
    }

    loadAgents();
    loadRunner();
    loadQueue();
  }, []);

  useEffect(() => {
    queuedMissionsRef.current = queuedMissions;
    if (typeof consoleEndRef.current?.scrollIntoView === 'function') {
      consoleEndRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  });

  function selectChannel(channelId: string) {
    setActiveChannelId(channelId);
    localStorage.setItem(ACTIVE_CHANNEL_LS, channelId);
  }

  function addEvent(type: string, text: string, tone: ConsoleEvent['tone'] = 'normal') {
    setEvents((prev) => [...prev, { id: nextId(), type, text, tone }]);
  }

  function togglePanel(panel: keyof typeof openPanels) {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }

  function composedPrompt() {
    return prompt.trim();
  }

  function rememberProject(nextPath: string) {
    const next = [nextPath, ...recentProjects.filter((path) => path !== nextPath)].slice(0, 5);
    setRecentProjects(next);
    saveJson(RECENT_PROJECTS_LS, next);
  }

  function updatePhonePrep(value: string) {
    setPhonePrep(value);
    localStorage.setItem(PHONE_PREP_LS, value);
  }

  function addScreenshotNote(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Choose an image screenshot.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const note: ScreenshotNote = {
        id: crypto.randomUUID(),
        channelId: activeChannel.id,
        title: file.name,
        note: phonePrep.trim(),
        image: String(reader.result ?? ''),
        createdAt: new Date().toISOString(),
      };
      const next = [note, ...screenshotNotes].slice(0, 12);
      setScreenshotNotes(next);
      saveJson(SCREENSHOT_NOTES_LS, next);
      setError('');
    };
    reader.onerror = () => setError('Could not read this screenshot.');
    reader.readAsDataURL(file);
  }

  function rememberMission(
    status: MissionMemory['status'],
    files: string[],
    overrides?: { prompt?: string; projectPath?: string; agentId?: string; channelId?: string },
  ) {
    const missionPrompt = overrides?.prompt ?? prompt;
    const mission: MissionMemory = {
      id: crypto.randomUUID(),
      title: missionTitleFromPrompt(missionPrompt),
      channelId: overrides?.channelId ?? activeChannel.id,
      mode,
      agentId: overrides?.agentId ?? agentId,
      projectPath: overrides?.projectPath ?? projectPath,
      status,
      prompt: missionPrompt,
      changedFiles: files,
      createdAt: new Date().toISOString(),
      reflection: missionReflection(status, files),
    };
    const next = [mission, ...history].slice(0, 8);
    setHistory(next);
    saveJson(HISTORY_LS, next);
  }

  function loadMission(mission: MissionMemory) {
    if (mission.channelId) selectChannel(mission.channelId);
    setAgentId(mission.agentId);
    setProjectPath(mission.projectPath);
    setPrompt(mission.prompt);
    addEvent('memory', `Loaded mission memory: ${mission.title}`, 'meta');
  }

  async function patchQueuedMission(
    missionId: string,
    patch: { status?: QueuedMissionStatus; event?: { type: string; text: string } },
  ) {
    const response = await fetch(`/api/build-lab/queue/${missionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return null;
    const updated = (await response.json()) as QueuedMission;
    setQueuedMissions((prev) =>
      prev.map((mission) => (mission.id === missionId ? updated : mission)),
    );
    queuedMissionsRef.current = queuedMissionsRef.current.map((mission) =>
      mission.id === missionId ? updated : mission,
    );
    return updated;
  }

  async function queueMission() {
    const missionPrompt = composedPrompt();
    const missionProjectPath = projectPath || runnerStatus?.workingDirectory || '';
    if (!missionPrompt.trim()) {
      setError('Write or dictate a mission prompt first.');
      return;
    }
    if (!missionProjectPath.trim()) {
      setError('Open Build Lab from the desktop runner or choose a project folder first.');
      return;
    }
    setError('');
    if (!projectPath.trim() && missionProjectPath.trim()) setProjectPath(missionProjectPath);
    const response = await fetch('/api/build-lab/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: activeChannel.id,
        agentId,
        projectPath: missionProjectPath,
        prompt: missionPrompt,
      }),
    });
    if (!response.ok) {
      setError((await response.json().catch(() => null))?.error ?? 'Could not queue mission.');
      return;
    }
    const mission = (await response.json()) as QueuedMission;
    setQueuedMissions((prev) => [mission, ...prev.filter((item) => item.id !== mission.id)]);
    queuedMissionsRef.current = [
      mission,
      ...queuedMissionsRef.current.filter((item) => item.id !== mission.id),
    ];
    addEvent('queue', `Queued mission: ${mission.title}`, 'meta');
    setPrompt('');
    if (autoRunQueue && !running && !queueRunnerRef.current) {
      queueRunnerRef.current = true;
      runQueuedMission(mission).finally(() => {
        queueRunnerRef.current = false;
      });
    }
  }

  function loadQueuedMission(mission: QueuedMission) {
    selectChannel(mission.channelId);
    setAgentId(mission.agentId);
    setProjectPath(mission.projectPath);
    setPrompt(mission.prompt);
    addEvent('queue', `Loaded queued mission: ${mission.title}`, 'meta');
  }

  async function runQueuedMission(mission: QueuedMission) {
    selectChannel(mission.channelId);
    setAgentId(mission.agentId);
    setProjectPath(mission.projectPath);
    addEvent('queue', `Running queued mission: ${mission.title}`, 'meta');
    await patchQueuedMission(mission.id, {
      status: 'running',
      event: { type: 'claimed', text: 'Desktop runner claimed this mission.' },
    });
    await runMission({
      promptOverride: mission.prompt,
      projectPathOverride: mission.projectPath,
      agentIdOverride: mission.agentId,
      channelIdOverride: mission.channelId,
      onDone: async (status, files) => {
        await patchQueuedMission(mission.id, {
          status,
          event: {
            type: status,
            text:
              status === 'complete'
                ? `Completed with ${files.length} changed files.`
                : 'Mission failed on the desktop runner.',
          },
        });
        const nextMission = [...queuedMissionsRef.current]
          .reverse()
          .find(
            (item) =>
              item.id !== mission.id &&
              item.channelId === mission.channelId &&
              item.status === 'queued',
          );
        if (autoRunQueue && nextMission) await runQueuedMission(nextMission);
      },
    });
  }

  async function inspectProject() {
    setError('');
    const response = await fetch('/api/build-lab/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath }),
    });
    if (!response.ok) {
      setError((await response.json().catch(() => null))?.error ?? 'Could not inspect project.');
      return;
    }
    const data = (await response.json()) as ProjectInfo;
    setProjectInfo(data);
    setProjectPath(data.projectPath);
    setChangedFiles(data.changedFiles);
    rememberProject(data.projectPath);
    addEvent('project', `Loaded ${data.projectPath}`, 'meta');
  }

  async function refreshDiff(pathOverride?: string) {
    const diffProjectPath = pathOverride ?? projectPath;
    if (!diffProjectPath.trim()) return null;
    const response = await fetch('/api/build-lab/diff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath: diffProjectPath }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { diff: string; changedFiles: string[] };
    setDiff(data.diff);
    setChangedFiles(data.changedFiles);
    return data;
  }

  async function runMission(options?: {
    promptOverride?: string;
    projectPathOverride?: string;
    agentIdOverride?: string;
    channelIdOverride?: string;
    onDone?: (status: 'complete' | 'failed', files: string[]) => void | Promise<void>;
  }) {
    const missionPrompt = options?.promptOverride ?? composedPrompt();
    const missionProjectPath =
      (options?.projectPathOverride ?? projectPath) || (runnerStatus?.workingDirectory ?? '');
    const missionAgentId = options?.agentIdOverride ?? agentId;
    const missionAgent = agents.find((agent) => agent.id === missionAgentId);
    if (!missionPrompt.trim()) {
      setError('Write or dictate a mission prompt first.');
      return;
    }
    if (!missionAgent?.available) {
      setError(`${missionAgent?.name ?? missionAgentId} is not ready on this computer.`);
      return;
    }
    setError('');
    if (!projectPath.trim() && missionProjectPath.trim()) setProjectPath(missionProjectPath);
    missionAbortRef.current?.abort();
    const controller = new AbortController();
    missionAbortRef.current = controller;
    setRunning(true);
    setActiveMissionTitle(missionTitleFromPrompt(missionPrompt));
    setMissionPhase('starting');
    setDiff('');
    setCheckpoints([]);
    addEvent('mission', `Starting: ${missionTitleFromPrompt(missionPrompt)}`, 'meta');
    let missionSucceeded = false;

    try {
      const response = await fetch('/api/build-lab/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          agentId: missionAgentId,
          projectPath: missionProjectPath,
          prompt: missionPrompt,
          mode,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await response.text());
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          const line = chunk
            .split('\n')
            .find((item) => item.startsWith('data: '))
            ?.slice(6);
          if (!line) continue;
          const event = JSON.parse(line) as {
            type: string;
            text?: string;
            stream?: string;
            message?: string;
            command?: string;
            args?: string[];
            path?: string;
            success?: boolean;
            checkpoint?: CheckpointInfo;
          };
          if (event.type === 'output') {
            setMissionPhase('working');
            addEvent(event.stream ?? 'output', event.text ?? '');
          } else if (event.type === 'error') addEvent('error', event.message ?? 'Error', 'error');
          else if (event.type === 'command_started') {
            setMissionPhase('starting');
            addEvent('command', `$ ${event.command} ${(event.args ?? []).join(' ')}`, 'meta');
          } else if (event.type === 'command_finished') {
            setMissionPhase('checking');
            addEvent('command', 'Command finished', 'meta');
          } else if (event.type === 'file_changed' && event.path) {
            setMissionPhase('working');
            setChangedFiles((prev) => Array.from(new Set([...prev, event.path as string])));
          } else if (event.type === 'mission_complete') {
            setMissionPhase('done');
            missionSucceeded = Boolean(event.success);
            addEvent(
              'complete',
              event.success ? 'Mission complete' : 'Mission failed',
              event.success ? 'success' : 'error',
            );
          } else if (event.type === 'checkpoint') {
            if (event.checkpoint)
              setCheckpoints((prev) => [...prev, event.checkpoint as CheckpointInfo]);
            addEvent('checkpoint', 'Git checkpoint saved', 'meta');
          }
        }
      }
      const refreshed = await refreshDiff(missionProjectPath);
      const status = missionSucceeded ? 'complete' : 'failed';
      const files = refreshed?.changedFiles ?? [];
      rememberMission(status, files, {
        prompt: missionPrompt,
        projectPath: missionProjectPath,
        agentId: missionAgentId,
        channelId: options?.channelIdOverride,
      });
      await options?.onDone?.(status, files);
    } catch (missionError) {
      if (missionError instanceof DOMException && missionError.name === 'AbortError') {
        addEvent('mission', 'Mission stopped from the console.', 'meta');
        return;
      }
      setError(missionError instanceof Error ? missionError.message : 'Mission failed.');
      rememberMission('failed', changedFiles, {
        prompt: missionPrompt,
        projectPath: missionProjectPath,
        agentId: missionAgentId,
        channelId: options?.channelIdOverride,
      });
      await options?.onDone?.('failed', changedFiles);
    } finally {
      if (missionAbortRef.current === controller) missionAbortRef.current = null;
      setRunning(false);
      setActiveMissionTitle('');
      setMissionPhase('idle');
    }
  }

  function stopMission() {
    missionAbortRef.current?.abort();
    missionAbortRef.current = null;
    setRunning(false);
    setActiveMissionTitle('');
    setMissionPhase('idle');
    addEvent('mission', 'Mission stopped from the console.', 'meta');
  }

  function toggleSpeech() {
    speech.resetError();
    if (speech.listening) {
      speech.stop();
    } else {
      speech.start(prompt, setPrompt);
    }
  }

  const activeQueuedMissions = queuedMissions.filter(
    (mission) => mission.channelId === activeChannel.id,
  );
  const runnableQueuedMissions = queuedMissions.filter(
    (mission) => mission.status === 'queued' || mission.status === 'failed',
  );
  const runHint = !prompt.trim()
    ? 'Write a mission prompt.'
    : !selectedAgent?.available
      ? `${selectedAgent?.name ?? 'Agent'} is not ready.`
      : projectPath.trim() || runnerStatus?.workingDirectory
        ? 'Ready to run on this computer.'
        : 'Ready to use the desktop runner folder.';

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5">
      <style>{`
        @keyframes build-lab-voice-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.72; }
        }
        @keyframes build-lab-sun-breathe {
          0%, 100% { transform: translateY(0) scale(1.02); }
          50% { transform: translateY(-5px) scale(1.07); }
        }
        .build-lab-sun-field {
          isolation: isolate;
        }
        .build-lab-sun-field::before,
        .build-lab-sun-field::after {
          content: "";
          position: absolute;
          inset: 6%;
          border-radius: 9999px;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .build-lab-sun-field::before {
          background:
            radial-gradient(circle at 42% 39%, rgba(255,231,152,0.52), transparent 9%),
            radial-gradient(circle at 55% 53%, rgba(255,179,54,0.22), transparent 38%),
            radial-gradient(circle, rgba(255,192,68,0.12), transparent 65%);
          filter: blur(7px);
          animation: build-lab-sun-inner-flow 7.6s ease-in-out infinite;
        }
        .build-lab-sun-field::after {
          inset: -2%;
          background:
            radial-gradient(circle, transparent 46%, rgba(255,208,94,0.22) 47%, transparent 65%),
            conic-gradient(from 24deg, transparent, rgba(255,210,94,0.24), transparent 18%, rgba(255,146,38,0.16), transparent 38%);
          filter: blur(11px);
          animation: build-lab-sun-corona-turn 14s linear infinite;
        }
        .build-lab-sun-corona {
          border: 1px solid rgba(255,210,101,0.22);
          box-shadow:
            0 0 34px rgba(255,176,55,0.2),
            inset 0 0 28px rgba(255,221,130,0.08);
          transform: scale(0.98);
          animation: build-lab-sun-corona-drift 5.6s ease-in-out infinite;
        }
        .build-lab-sun-wave {
          border: 1px solid rgba(255,218,120,0.2);
          box-shadow: 0 0 24px rgba(255,190,70,0.18);
          animation: build-lab-sun-expand 2.8s ease-out infinite;
        }
        .build-lab-sun-dot {
          z-index: 2;
          width: var(--dot-size);
          height: var(--dot-size);
          background: var(--dot-color);
          opacity: var(--dot-opacity);
          box-shadow: 0 0 var(--dot-shadow);
          transform: translate(-50%, -50%) translate(var(--flow-a-x), var(--flow-a-y)) scale(var(--base-scale));
          animation: build-lab-sun-dot-flow var(--flow-duration) ease-in-out var(--flow-delay) infinite;
          will-change: transform, opacity, box-shadow;
        }
        .build-lab-sun-dot-active {
          animation-name: build-lab-sun-dot-flow, build-lab-sun-dot-pulse;
          animation-duration: var(--flow-duration), 1.7s;
          animation-timing-function: ease-in-out, ease-in-out;
          animation-delay: var(--flow-delay), var(--flow-delay);
          animation-iteration-count: infinite, infinite;
        }
        .build-lab-sun-dot-glint {
          background: #fff0b6;
          box-shadow: 0 0 14px rgba(255,236,176,0.9);
        }
        .build-lab-sun-glint {
          z-index: 3;
          background: #fff0b6;
          box-shadow: 0 0 14px rgba(255,236,176,0.94), 0 0 28px rgba(255,181,49,0.38);
          transform: translate(-50%, -50%);
          animation-name: build-lab-sun-glint;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes build-lab-sun-dot-flow {
          0%, 100% {
            transform: translate(-50%, -50%) translate(var(--flow-a-x), var(--flow-a-y)) scale(var(--base-scale));
          }
          33% {
            transform: translate(-50%, -50%) translate(var(--flow-b-x), var(--flow-b-y)) scale(calc(var(--base-scale) * 1.16));
          }
          66% {
            transform: translate(-50%, -50%) translate(var(--flow-c-x), var(--flow-c-y)) scale(calc(var(--base-scale) * 0.92));
          }
        }
        @keyframes build-lab-sun-dot-pulse {
          0%, 100% { opacity: var(--dot-opacity); }
          50% { opacity: 1; }
        }
        @keyframes build-lab-sun-glint {
          0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) scale(0.72); }
          42% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.8); }
          62% { opacity: 0.36; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes build-lab-sun-inner-flow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          40% { transform: translate(5px, -7px) scale(1.08); opacity: 0.9; }
          72% { transform: translate(-6px, 4px) scale(0.96); opacity: 0.62; }
        }
        @keyframes build-lab-sun-corona-turn {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes build-lab-sun-corona-drift {
          0%, 100% { transform: scale(0.98); opacity: 0.54; }
          50% { transform: scale(1.08); opacity: 0.92; }
        }
        @keyframes build-lab-sun-expand {
          0% { transform: scale(0.68); opacity: 0; }
          18% { opacity: 0.72; }
          100% { transform: scale(1.72); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .build-lab-sun-field,
          .build-lab-sun-field::before,
          .build-lab-sun-field::after,
          .build-lab-sun-corona,
          .build-lab-sun-wave,
          .build-lab-sun-dot,
          .build-lab-sun-dot-active,
          .build-lab-sun-glint {
            animation: none !important;
          }
        }
      `}</style>
      <section
        className="overflow-hidden rounded-[22px] border"
        style={{
          background: 'linear-gradient(135deg, rgba(255,248,224,0.96), rgba(225,197,143,0.9))',
          borderColor: 'rgba(112,73,38,0.18)',
          boxShadow: '0 18px 55px rgba(62,38,17,0.14)',
        }}
      >
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.3fr]">
          <div className="border-b border-[rgba(112,73,38,0.16)] p-5 lg:border-r lg:border-b-0">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d653d]">
                  Creator Space
                </p>
                <h1 className="mt-1 font-serif text-3xl text-[#442510]">Creator Space</h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#775638]">
                  Build Lab is the coding-agent room inside Colourmap's creator space: a quiet
                  mission desk for prompts, logs, checkpoints, and diffs.
                </p>
              </div>
              <div className="rounded-full border border-[#b98d52]/30 bg-[#fff7df]/70 p-3 text-[#704923]">
                <SquareTerminal size={22} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#704923]">
                      <Sparkles size={14} />
                      Mission Sun
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8d653d]">
                      A first voice-reactive geometry presence next to the dev desk.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSpeech}
                    aria-label={speech.listening ? 'Pause mission sun' : 'Speak with mission sun'}
                    title={speech.listening ? 'Pause mission sun' : 'Speak with mission sun'}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border"
                    style={{
                      borderColor: speech.listening
                        ? 'rgba(245,132,38,0.75)'
                        : 'rgba(143,98,50,0.22)',
                      background: speech.listening
                        ? 'radial-gradient(circle at 30% 30%, rgba(255,178,76,0.58), rgba(255,126,35,0.2))'
                        : '#fffdf2',
                      boxShadow: speech.listening
                        ? '0 0 0 5px rgba(255,145,49,0.14), 0 0 28px rgba(255,126,35,0.42)'
                        : '0 0 0 3px rgba(196,154,81,0.1)',
                      color: speech.listening ? '#7a310c' : '#704923',
                    }}
                  >
                    {speech.listening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                </div>
                <SunPresence
                  compact
                  active={speech.listening || running}
                  livingText={
                    speech.transcript ||
                    prompt ||
                    'Speak the mission and the sun glistens while the desk writes it down.'
                  }
                />
                {(speech.error || speech.listening) && (
                  <p className="mt-3 text-xs leading-5 text-[#8d653d]">
                    {speech.error ||
                      'Listening. Your words are also written into the mission prompt.'}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                <button
                  type="button"
                  onClick={() => togglePanel('channels')}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Channel</p>
                    <p className="mt-1 text-xs leading-5 text-[#8d653d]">
                      {activeChannel.name} / {activeChannel.focus}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#8f6232]/20 bg-[#fffdf2] px-3 py-1 text-xs text-[#704923]">
                    {openPanels.channels ? 'close' : 'change'}
                  </span>
                </button>
                {openPanels.channels && (
                  <div className="mt-3 grid gap-2">
                    {DEFAULT_CHANNELS.map((channel) => {
                      const selected = channel.id === activeChannel.id;
                      const count = history.filter(
                        (mission) => (mission.channelId ?? 'general') === channel.id,
                      ).length;
                      return (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => selectChannel(channel.id)}
                          className="rounded-2xl border p-3 text-left"
                          style={{
                            borderColor: selected ? '#704923' : 'rgba(112,73,38,0.16)',
                            background: selected ? 'rgba(112,73,35,0.1)' : '#fffdf2',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium text-[#3f2817]">
                              {channel.name}
                            </span>
                            <span className="text-xs text-[#8d653d]">{count}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[#775638]">{channel.focus}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                <button
                  type="button"
                  onClick={() => togglePanel('phone')}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                      Phone Level 2
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8d653d]">
                      Phone writes the mission. This computer stays the trusted runner for Codex,
                      files, checkpoints, and diffs.
                    </p>
                  </div>
                  <span
                    className="rounded-full border px-2 py-1 text-xs"
                    style={{
                      borderColor: runnerStatus?.remoteRunReady ? '#6f8b4a55' : '#b98d5255',
                      color: runnerStatus?.remoteRunReady ? '#4f6f31' : '#8d653d',
                    }}
                  >
                    {openPanels.phone
                      ? 'close'
                      : runnerStatus?.remoteRunReady
                        ? 'runner ready'
                        : 'local only'}
                  </span>
                </button>
                {openPanels.phone && (
                  <div className="mt-3 grid gap-2 text-xs leading-5 text-[#775638]">
                    <div className="rounded-xl bg-[#fffdf2]/80 px-3 py-2">
                      <span className="font-medium text-[#3f2817]">Run host: </span>
                      {runnerStatus?.host || 'open this page on the desktop first'}
                    </div>
                    <div className="rounded-xl bg-[#fffdf2]/80 px-3 py-2">
                      <span className="font-medium text-[#3f2817]">Next practical cut: </span>
                      save phone prompts to a queue, then let this desktop runner execute them.
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => togglePanel('setup')}
                className="flex w-full items-center justify-between rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3 text-left"
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-[#704923]">
                    Project + agent
                  </span>
                  <span className="mt-1 block text-xs text-[#8d653d]">
                    {projectPath ? shortPath(projectPath) : 'choose project'} /{' '}
                    {selectedAgent?.name ?? 'agent'}
                  </span>
                </span>
                <span className="rounded-full border border-[#8f6232]/20 bg-[#fffdf2] px-3 py-1 text-xs text-[#704923]">
                  {openPanels.setup ? 'close' : 'open'}
                </span>
              </button>

              {openPanels.setup && (
                <>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                      Project folder
                    </span>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={projectPath}
                        onChange={(event) => setProjectPath(event.target.value)}
                        placeholder="C:/Users/victor/colourmap-v2"
                        className="min-w-0 flex-1 rounded-xl border border-[#b98d52]/30 bg-[#fff8e8] px-3 py-2 text-sm text-[#3f2817] outline-none focus:border-[#8f6232]"
                      />
                      <button
                        type="button"
                        onClick={inspectProject}
                        className="rounded-xl border border-[#8f6232]/30 bg-[#704923] px-3 text-sm text-[#fff8e8]"
                      >
                        Load
                      </button>
                    </div>
                  </label>

                  {recentProjects.length > 0 && (
                    <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/62 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                        <FolderOpen size={14} />
                        Recent projects
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentProjects.map((path) => (
                          <button
                            key={path}
                            type="button"
                            onClick={() => setProjectPath(path)}
                            className="rounded-full border border-[#8f6232]/20 px-3 py-1 text-xs text-[#704923]"
                            title={path}
                          >
                            {shortPath(path)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                      <GitBranch size={14} />
                      Branch
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#3f2817]">
                      {projectInfo?.branch ?? 'not loaded'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                      Agent
                    </span>
                    <div className="mt-2 grid gap-2">
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => setAgentId(agent.id)}
                          className="flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm"
                          style={{
                            borderColor: agentId === agent.id ? '#704923' : 'rgba(112,73,38,0.16)',
                            background: agentId === agent.id ? 'rgba(112,73,35,0.1)' : '#fff8e8',
                            color: '#3f2817',
                          }}
                        >
                          <span>{agent.name}</span>
                          <span className={agent.available ? 'text-[#32724d]' : 'text-[#a35b38]'}>
                            {agent.available ? 'ready' : 'not found'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <section className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/78 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Diff desk</p>
                  <button
                    type="button"
                    onClick={() => refreshDiff()}
                    className="inline-flex items-center gap-1 rounded-full border border-[#8f6232]/25 px-2 py-1 text-xs text-[#704923]"
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                </div>
                <div className="mb-3 rounded-xl border border-[#b98d52]/18 bg-[#fffdf2] p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    <ShieldCheck size={13} />
                    Checkpoints
                  </div>
                  {checkpoints.length === 0 ? (
                    <p className="text-sm text-[#8d653d]">No checkpoint yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-[#3f2817]">
                      {checkpoints.map((checkpoint, index) => (
                        <li
                          key={`${checkpoint.path ?? checkpoint.reason ?? 'checkpoint'}-${index}`}
                        >
                          {checkpoint.created
                            ? (checkpoint.path ?? 'Checkpoint saved')
                            : (checkpoint.reason ?? 'Checkpoint skipped')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-3 rounded-xl border border-[#b98d52]/18 bg-[#fffdf2] p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    Changed files
                  </p>
                  {changedFiles.length === 0 ? (
                    <p className="text-sm text-[#8d653d]">No changes detected.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-[#3f2817]">
                      {changedFiles.map((file) => (
                        <li key={file}>{file}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <pre className="max-h-[250px] overflow-auto rounded-xl bg-[#24180f] p-3 text-xs leading-5 text-[#f8e8bd]">
                  {diff || 'No diff loaded.'}
                </pre>
              </section>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Runner inbox</p>
                  <p className="mt-1 text-xs leading-5 text-[#8d653d]">
                    Local Phone Level 2 queue. Supabase will replace this storage later.
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoRunQueue((value) => !value)}
                    className="rounded-full border border-[#8f6232]/20 px-2 py-1 text-xs text-[#704923]"
                  >
                    {autoRunQueue ? 'auto-run on' : 'auto-run off'}
                  </button>
                  <span className="rounded-full border border-[#8f6232]/20 px-2 py-1 text-xs text-[#704923]">
                    {runnableQueuedMissions.length} ready
                  </span>
                </div>
              </div>
              {activeQueuedMissions.length === 0 ? (
                <p className="text-sm text-[#8d653d]">
                  Queue a mission from this channel to see how the phone runner workflow will feel.
                </p>
              ) : (
                <div className="grid gap-3">
                  {activeQueuedMissions.slice(0, 5).map((mission) => (
                    <div
                      key={mission.id}
                      className="rounded-2xl border border-[#b98d52]/22 bg-[#fffdf2]/75 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium leading-5 text-[#3f2817]">
                            {mission.title}
                          </p>
                          <p className="mt-1 text-xs text-[#8d653d]">
                            {shortPath(mission.projectPath)} / {mission.agentId}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#8f6232]/18 px-2 py-1 text-xs text-[#704923]">
                          {mission.status}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5f4229]">
                        {mission.prompt}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadQueuedMission(mission)}
                          className="rounded-full border border-[#8f6232]/25 px-3 py-1 text-xs text-[#704923]"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => runQueuedMission(mission)}
                          disabled={
                            running ||
                            !selectedAgent?.available ||
                            (mission.status !== 'queued' && mission.status !== 'failed')
                          }
                          className="rounded-full bg-[#704923] px-3 py-1 text-xs text-[#fff8e8] disabled:opacity-45"
                        >
                          Run on this computer
                        </button>
                      </div>
                      {mission.events.length > 0 && (
                        <p className="mt-3 text-xs leading-5 text-[#8d653d]">
                          Last event: {mission.events[0]?.type} - {mission.events[0]?.text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-4">
              <button
                type="button"
                onClick={() => togglePanel('phonePrep')}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span>
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#704923]">
                    <ImagePlus size={14} />
                    Phone notes + screenshots
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#8d653d]">
                    Prepare app feedback, screenshots, and next moves away from the computer.
                  </span>
                </span>
                <span className="rounded-full border border-[#8f6232]/20 bg-[#fffdf2] px-3 py-1 text-xs text-[#704923]">
                  {openPanels.phonePrep ? 'close' : `${channelScreenshotNotes.length} shots`}
                </span>
              </button>
              {openPanels.phonePrep && (
                <div className="mt-4 grid gap-3">
                  <textarea
                    value={phonePrep}
                    onChange={(event) => updatePhonePrep(event.target.value)}
                    placeholder="Write what you see on the phone, what feels broken, and what the next agent should do..."
                    className="min-h-28 w-full resize-y rounded-2xl border border-[#b98d52]/25 bg-[#fffdf2] p-3 text-sm leading-6 text-[#3f2817] outline-none focus:border-[#8f6232]"
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#8f6232]/25 bg-[#fffdf2] px-4 py-2 text-sm text-[#704923]">
                    <ImagePlus size={15} />
                    Add screenshot
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) addScreenshotNote(file);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>
                  {channelScreenshotNotes.length === 0 ? (
                    <p className="text-sm text-[#8d653d]">
                      Screenshots added here stay attached to the whole app on this device.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {channelScreenshotNotes.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setPrompt((current) => `${current}\n\n${item.note}`.trim())
                          }
                          className="overflow-hidden rounded-2xl border border-[#b98d52]/22 bg-[#fffdf2] text-left"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-32 w-full object-cover"
                          />
                          <div className="p-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <p className="mt-1 line-clamp-3 text-sm leading-5 text-[#5f4229]">
                              {item.note || item.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
              <button
                type="button"
                onClick={() => togglePanel('garden')}
                className="flex w-full items-center justify-between text-left"
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-[#704923]">
                    Garden of Ideas
                  </span>
                  <span className="mt-1 block text-xs text-[#8d653d]">
                    visual map, spec, reflection, business, philosophy
                  </span>
                </span>
                <span className="rounded-full border border-[#8f6232]/20 bg-[#fffdf2] px-3 py-1 text-xs text-[#704923]">
                  {openPanels.garden ? 'close' : 'open'}
                </span>
              </button>
            </div>
            {openPanels.garden && <GardenOfIdeas />}

            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
              <button
                type="button"
                onClick={() => togglePanel('sun')}
                className="flex w-full items-center justify-between text-left"
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-[#704923]">
                    Display mode
                  </span>
                  <span className="mt-1 block text-xs text-[#8d653d]">
                    Sun Dialogue visual prompt mode
                  </span>
                </span>
                <span className="rounded-full border border-[#8f6232]/20 bg-[#fffdf2] px-3 py-1 text-xs text-[#704923]">
                  {openPanels.sun ? 'close' : 'open'}
                </span>
              </button>
            </div>
            {openPanels.sun && <SunDialoguePrototype />}

            <div className="grid gap-4">
              <section
                className={
                  consoleDesignMode
                    ? 'min-w-0 rounded-2xl border border-[#d9b65f]/25 bg-[#07080f] p-4 text-[#ffd983] shadow-[0_0_42px_rgba(232,169,58,0.16)]'
                    : 'min-w-0 rounded-2xl border border-[#2b2118]/15 bg-[#24180f] p-4 text-[#f8e8bd]'
                }
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d7b978]">
                    Agent console
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConsoleDesignMode((value) => !value)}
                      className="rounded-full border border-[#d7b978]/20 px-2 py-1 text-xs text-[#d7b978]"
                    >
                      {consoleDesignMode ? 'Classic' : 'Night gold'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRawConsole((value) => !value)}
                      className="rounded-full border border-[#d7b978]/20 px-2 py-1 text-xs text-[#d7b978]"
                    >
                      {showRawConsole ? 'Readable' : 'Raw'}
                    </button>
                    <span className="text-xs text-[#a98b5c]">{running ? 'streaming' : 'idle'}</span>
                  </div>
                </div>
                <div className="mb-3 rounded-xl border border-[#d7b978]/12 bg-[#150f0a] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: running ? '#ffd36c' : '#7b684d',
                          boxShadow: running ? '0 0 18px rgba(255,211,108,0.78)' : 'none',
                          animation: running
                            ? 'build-lab-voice-pulse 1.1s ease-in-out infinite'
                            : 'none',
                        }}
                      />
                      <p className="truncate text-xs text-[#d7b978]">
                        {running
                          ? `${missionPhase === 'starting' ? 'Starting' : missionPhase === 'checking' ? 'Checking' : missionPhase === 'done' ? 'Almost done' : 'Working'}: ${activeMissionTitle || 'mission'}`
                          : autoRunQueue
                            ? 'Ready. Queued missions will run in order.'
                            : 'Ready. Auto-run queue is off.'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-[#d7b978]/18 px-2 py-1 text-[11px] text-[#d7b978]">
                        {missionEstimate.difficulty}
                      </span>
                      <span className="hidden text-xs text-[#a98b5c] sm:inline">
                        {missionEstimate.time}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowMissionDetails((value) => !value)}
                        className="rounded-full border border-[#d7b978]/18 px-2 py-1 text-[11px] text-[#d7b978]"
                      >
                        {showMissionDetails ? 'hide' : 'details'}
                      </button>
                    </div>
                  </div>
                  {showMissionDetails && (
                    <div className="mt-2 rounded-lg border border-[#d7b978]/10 bg-[#0f0a07] p-2 text-xs leading-5 text-[#a98b5c]">
                      <p>
                        Challenge: {missionEstimate.challenge} Time estimate is intentionally loose
                        until the agent has inspected the files.
                      </p>
                      <p className="mt-1">
                        Progress: {running ? missionPhase : 'idle'} /{' '}
                        {runnableQueuedMissions.length} queued.
                      </p>
                    </div>
                  )}
                </div>
                <div
                  className={
                    consoleDesignMode
                      ? 'max-h-[360px] overflow-auto rounded-xl border border-[#d9b65f]/12 bg-[radial-gradient(circle_at_20%_10%,rgba(255,209,111,0.16),transparent_32%),linear-gradient(180deg,#080914,#02030a)] p-3 font-mono text-xs leading-5 shadow-inner'
                      : 'max-h-[360px] overflow-auto rounded-xl bg-[#150f0a] p-3 font-mono text-xs leading-5'
                  }
                >
                  {events.length === 0 ? (
                    <p className={consoleDesignMode ? 'text-[#9e7f42]' : 'text-[#8e7658]'}>
                      No mission output yet.
                    </p>
                  ) : (
                    (showRawConsole ? events : events.filter((event) => event.text.trim())).map(
                      (event) => (
                        <div
                          key={event.id}
                          className={
                            consoleDesignMode
                              ? event.tone === 'error'
                                ? 'text-[#ff9b7d]'
                                : event.tone === 'success'
                                  ? 'text-[#e8f0a2]'
                                  : event.tone === 'meta'
                                    ? 'text-[#f2b64c]'
                                    : 'text-[#ffd983] drop-shadow-[0_0_8px_rgba(255,205,105,0.42)]'
                              : event.tone === 'error'
                                ? 'text-[#ff9b7d]'
                                : event.tone === 'success'
                                  ? 'text-[#aee0a8]'
                                  : event.tone === 'meta'
                                    ? 'text-[#d7b978]'
                                    : 'text-[#f8e8bd]'
                          }
                        >
                          <span className="opacity-50">[{event.type}] </span>
                          <span>{event.text}</span>
                        </div>
                      ),
                    )
                  )}
                  <div ref={consoleEndRef} />
                </div>
                <div className="mt-3 rounded-2xl border border-[#d7b978]/14 bg-[#150f0a] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-[#d7b978]">
                        Mission prompt
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#a98b5c]">
                        {activeChannel.name} / {selectedAgent?.name ?? 'No agent'} /{' '}
                        {projectPath ? shortPath(projectPath) : 'desktop folder'} / {runHint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSpeech}
                      aria-label={speech.listening ? 'Stop voice input' : 'Start voice input'}
                      title={speech.listening ? 'Stop voice input' : 'Start voice input'}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                      style={{
                        borderColor: speech.listening
                          ? 'rgba(245,132,38,0.75)'
                          : 'rgba(215,185,120,0.22)',
                        background: speech.listening
                          ? 'radial-gradient(circle at 30% 30%, rgba(255,178,76,0.52), rgba(255,126,35,0.18))'
                          : '#c49a51',
                        boxShadow: speech.listening
                          ? '0 0 0 5px rgba(255,145,49,0.14), 0 0 28px rgba(255,126,35,0.42)'
                          : '0 0 0 3px rgba(196,154,81,0.12)',
                        color: speech.listening ? '#7a310c' : '#fff8e8',
                        animation: speech.listening
                          ? 'build-lab-voice-pulse 1s ease-in-out infinite'
                          : 'none',
                      }}
                    >
                      {speech.listening ? <MicOff size={14} /> : <Mic size={14} />}
                    </button>
                  </div>
                  {(speech.listening || speech.error || speech.transcript) && (
                    <div className="mb-3 rounded-xl border border-[#d7b978]/12 bg-[#24180f] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="block h-3 w-3 rounded-full"
                            style={{
                              background: speech.listening ? '#ff8a22' : '#c9a76e',
                              boxShadow: speech.listening
                                ? '0 0 0 6px rgba(255,138,34,0.13), 0 0 22px rgba(255,138,34,0.6)'
                                : 'none',
                              animation: speech.listening
                                ? 'build-lab-voice-pulse 1s ease-in-out infinite'
                                : 'none',
                            }}
                          />
                          <span className="text-xs uppercase tracking-[0.14em] text-[#d7b978]">
                            {speech.listening ? 'Listening' : 'Voice note'}
                          </span>
                        </div>
                        {speech.transcript && (
                          <span className="text-[11px] text-[#a98b5c]">transcript captured</span>
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#a98b5c]">
                        {speech.error ||
                          (speech.listening
                            ? 'Speak now. Your words appear in the prompt below.'
                            : `Last heard: ${speech.transcript}`)}
                      </p>
                    </div>
                  )}
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Tell the agent what to build, fix, review, or plan..."
                    className="min-h-32 w-full resize-y rounded-xl border border-[#d7b978]/18 bg-[#0f0a07] p-3 text-sm leading-6 text-[#f8e8bd] outline-none placeholder:text-[#8e7658] focus:border-[#d7b978]/55"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#a98b5c]">
                      Channel: {activeChannel.next}
                      {error && <span className="ml-2 text-[#ff9b7d]">{error}</span>}
                    </div>
                    <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => (running ? stopMission() : runMission())}
                        className="inline-flex justify-center gap-2 rounded-full bg-[#d7b978] px-4 py-2 text-sm text-[#24180f] disabled:opacity-45"
                      >
                        <Play size={15} />
                        {running ? 'Stop mission' : 'Send mission'}
                      </button>
                      <button
                        type="button"
                        onClick={queueMission}
                        className="inline-flex justify-center gap-2 rounded-full border border-[#d7b978]/22 px-4 py-2 text-sm text-[#d7b978] disabled:opacity-45"
                      >
                        Add to queue
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-[#d7b978]/12 bg-[#0f0a07] p-3">
                    <button
                      type="button"
                      onClick={() => togglePanel('memory')}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#d7b978]">
                        <Archive size={14} />
                        Mission memory
                      </span>
                      <span className="rounded-full border border-[#d7b978]/18 px-3 py-1 text-xs text-[#d7b978]">
                        {openPanels.memory ? 'close' : `${history.length} saved`}
                      </span>
                    </button>
                    {openPanels.memory && channelHistory.length === 0 ? (
                      <p className="mt-3 text-sm leading-6 text-[#a98b5c]">
                        Clear work blocks for {activeChannel.name} will appear here: what you asked,
                        what happened, and what to check next.
                      </p>
                    ) : openPanels.memory ? (
                      <div className="mt-3 grid gap-3">
                        {channelHistory.slice(0, 4).map((mission) => (
                          <button
                            key={mission.id}
                            type="button"
                            onClick={() => loadMission(mission)}
                            className="rounded-xl border border-[#d7b978]/14 bg-[#150f0a] p-3 text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium leading-5 text-[#f8e8bd]">
                                {mission.title}
                              </span>
                              <span
                                className={
                                  mission.status === 'complete'
                                    ? 'text-xs text-[#aee0a8]'
                                    : 'text-xs text-[#ffb089]'
                                }
                              >
                                {mission.status}
                              </span>
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#a98b5c]">
                              Last order
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#d7b978]">
                              {mission.prompt || 'No prompt saved.'}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#a98b5c]">
                              Reflection
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#f8e8bd]">
                              {mission.reflection ??
                                missionReflection(mission.status, mission.changedFiles)}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
