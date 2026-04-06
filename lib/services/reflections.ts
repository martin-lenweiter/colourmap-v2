import { desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import { getRecentCheckIns } from '@/lib/db/queries/check-ins';
import { getMissions } from '@/lib/db/queries/missions';
import { lifeScanAnswers } from '@/lib/db/schema';
import { getEmotionalWord } from '@/lib/emotional-vocabulary';

export class ReflectionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReflectionValidationError';
  }
}

export function normalizeCheckInInsightInput(input: unknown): { checkInId: string | null } {
  if (typeof input !== 'object' || input === null) {
    throw new ReflectionValidationError('Invalid body');
  }

  const { checkInId } = input as { checkInId?: unknown };
  return { checkInId: typeof checkInId === 'string' ? checkInId : null };
}

type DayMapEntry = {
  time: string;
  activity: string;
  energy: number;
  category?: string;
  tag?: string;
};

export function normalizeDayMapInsightInput(input: unknown): { dayMapEntries: DayMapEntry[] } {
  if (typeof input !== 'object' || input === null) {
    throw new ReflectionValidationError('Invalid body');
  }

  const { dayMapEntries } = input as { dayMapEntries?: unknown };
  const normalized = Array.isArray(dayMapEntries)
    ? dayMapEntries.flatMap((entry) => {
        if (typeof entry !== 'object' || entry === null) {
          return [];
        }

        const { time, activity, energy, category, tag } = entry as {
          time?: unknown;
          activity?: unknown;
          energy?: unknown;
          category?: unknown;
          tag?: unknown;
        };

        if (
          typeof time !== 'string' ||
          typeof activity !== 'string' ||
          typeof energy !== 'number'
        ) {
          return [];
        }

        return [
          {
            time,
            activity,
            energy,
            category: typeof category === 'string' ? category : undefined,
            tag: typeof tag === 'string' ? tag : undefined,
          },
        ];
      })
    : [];

  return { dayMapEntries: normalized };
}

export function normalizeJourneyReflectionInput(input: unknown): { prompt: string; tone: string } {
  if (typeof input !== 'object' || input === null) {
    throw new ReflectionValidationError('Invalid body');
  }

  const { prompt, tone } = input as { prompt?: unknown; tone?: unknown };

  return {
    prompt: typeof prompt === 'string' ? prompt : '',
    tone: typeof tone === 'string' ? tone : 'cowboy',
  };
}

const TONE_PROMPTS: Record<string, string> = {
  cowboy:
    'Speak like a wise cowboy - laconic, honest, earthy metaphors. Short sentences. "Reckon you been riding hard." Keep it to 3-4 sentences.',
  warrior:
    'Speak like a warrior mentor - direct, disciplined, respectful. Martial metaphors. "The blade is sharpened in difficulty." Keep it to 3-4 sentences.',
  princess:
    'Speak with grace and warmth - poetic, nurturing, empowering. Royal metaphors. "Your inner kingdom grows." Keep it to 3-4 sentences.',
  mythic:
    'Speak like a mythic oracle - symbolic, archetypal, layered. "The hero descends before ascending." Keep it to 3-4 sentences.',
  practical:
    'Speak practically - data-driven, clear, structured. No metaphors. Use numbers and patterns. Keep it to 3-4 sentences.',
};

export async function buildCheckInAnalysisPrompt(userId: string) {
  const db = getDb();
  const [checkIns, missions] = await Promise.all([
    getRecentCheckIns(db, userId, 20),
    getMissions(db, userId),
  ]);

  if (checkIns.length === 0) {
    throw new ReflectionValidationError('No check-ins to analyze');
  }

  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));

  const checkInSummary = checkIns
    .map((checkIn) => {
      const word = getEmotionalWord(checkIn.sliderValue);
      const time = new Date(checkIn.createdAt).toLocaleString();
      const mission = checkIn.missionId ? missionMap.get(checkIn.missionId) : null;
      const parts = [`${word} (${checkIn.sliderValue}/100) at ${time}`];
      if (checkIn.note) parts.push(`Note: "${checkIn.note}"`);
      if (checkIn.tags?.length) parts.push(`Tags: ${checkIn.tags.join(', ')}`);
      if (mission) {
        parts.push(`Mission: "${mission.title}"`);
        if (mission.blocking) parts.push(`Challenge: "${mission.blocking}"`);
      }
      return parts.join(' | ');
    })
    .join('\n');

  const activeMissions = missions
    .filter((mission) => !mission.completed)
    .map((mission) => {
      const parts = [mission.title];
      if (mission.nextStep) parts.push(`Objective: ${mission.nextStep}`);
      if (mission.blocking) parts.push(`Challenge: ${mission.blocking}`);
      return parts.join(' - ');
    })
    .join('\n');

  return `Here are the user's recent check-ins (most recent first):
${checkInSummary}

${activeMissions ? `Active missions:\n${activeMissions}` : 'No active missions right now.'}

Reflect on their emotional trajectory and how it connects to what they're working on. What pattern do you see?`;
}

async function getLatestLifeScanAnswers(userId: string) {
  const rows = await getDb()
    .select()
    .from(lifeScanAnswers)
    .where(eq(lifeScanAnswers.userId, userId))
    .orderBy(desc(lifeScanAnswers.updatedAt));

  const answers: Record<string, string> = {};
  const seen = new Set<string>();
  for (const row of rows) {
    if (!seen.has(row.key)) {
      seen.add(row.key);
      answers[row.key] = row.value;
    }
  }

  return answers;
}

export async function buildCheckInInsightPrompt(
  userId: string,
  input: { checkInId: string | null },
) {
  const db = getDb();
  const [checkIns, missions, scanAnswers] = await Promise.all([
    getRecentCheckIns(db, userId, 5),
    getMissions(db, userId),
    getLatestLifeScanAnswers(userId),
  ]);

  const current = checkIns.find((checkIn) => checkIn.id === input.checkInId) ?? checkIns[0];
  if (!current) {
    throw new ReflectionValidationError('No check-in found');
  }

  const previous = checkIns.filter((checkIn) => checkIn.id !== current.id).slice(0, 3);
  const linkedMission = current.missionId
    ? missions.find((mission) => mission.id === current.missionId)
    : null;

  const fears = (scanAnswers.block_fears_list || '').split('|||').filter(Boolean);
  const strengths = (scanAnswers.flow_strengths_list || '').split('|||').filter(Boolean);

  const currentWord = current.emotionName || getEmotionalWord(current.sliderValue);
  const trajectory = previous
    .map(
      (checkIn) =>
        `${checkIn.emotionName || getEmotionalWord(checkIn.sliderValue)} (${checkIn.sliderValue}/100)`,
    )
    .join(' -> ');

  const contextParts = [`Just checked in: ${currentWord} (${current.sliderValue}/100)`];
  if (current.note) contextParts.push(`Note: "${current.note}"`);
  if (trajectory) contextParts.push(`Recent trajectory: ${trajectory}`);
  if (linkedMission) {
    contextParts.push(`Working on: "${linkedMission.title}"`);
    if (linkedMission.blocking) {
      contextParts.push(`Challenge: "${linkedMission.blocking}"`);
    }
  }
  if (fears.length > 0) contextParts.push(`Self-identified fears: ${fears.join(', ')}`);
  if (strengths.length > 0) contextParts.push(`Self-identified strengths: ${strengths.join(', ')}`);

  return contextParts.join('\n');
}

export async function buildDayMapInsightPrompt(
  userId: string,
  input: { dayMapEntries: DayMapEntry[] },
) {
  const checkIns = await getRecentCheckIns(getDb(), userId, 20);
  const today = new Date().toDateString();
  const todayCheckIns = checkIns.filter(
    (checkIn) => new Date(checkIn.createdAt).toDateString() === today,
  );

  if (input.dayMapEntries.length === 0 && todayCheckIns.length === 0) {
    throw new ReflectionValidationError('Not enough data');
  }

  const dayMapSummary = input.dayMapEntries
    .map(
      (entry) =>
        `${entry.time} ${entry.activity}${entry.category ? ` (${entry.category})` : ''}${entry.tag === 'good' ? ' [works]' : entry.tag === 'drop' ? ' [drops]' : ''}`,
    )
    .join('\n');

  const checkInSummary = todayCheckIns
    .map((checkIn) => {
      const word = checkIn.emotionName || getEmotionalWord(checkIn.sliderValue);
      const time = new Date(checkIn.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${time} ${word} (${checkIn.sliderValue}/100)${checkIn.note ? ` - ${checkIn.note.slice(0, 80)}` : ''}`;
    })
    .join('\n');

  return `Day map:\n${dayMapSummary || 'No entries yet.'}\n\nCheck-ins:\n${checkInSummary || 'No check-ins yet.'}`;
}

export async function buildJourneyReflectionPrompt(
  userId: string,
  input: { prompt: string; tone: string },
) {
  const [checkIns, scanAnswers] = await Promise.all([
    getRecentCheckIns(getDb(), userId, 20),
    getLatestLifeScanAnswers(userId),
  ]);

  const fears = (scanAnswers.block_fears_list || '').split('|||').filter(Boolean);
  const strengths = (scanAnswers.flow_strengths_list || '').split('|||').filter(Boolean);
  const vision = scanAnswers.vision_where || '';

  const checkInSummary = checkIns
    .slice(0, 10)
    .map((checkIn) => {
      const word = checkIn.emotionName || getEmotionalWord(checkIn.sliderValue);
      return `${word} (${checkIn.sliderValue}/100)${checkIn.note ? ` - ${checkIn.note.slice(0, 60)}` : ''}`;
    })
    .join('\n');

  const tonePrompt = TONE_PROMPTS[input.tone] || TONE_PROMPTS.cowboy;
  const prompt = [
    input.prompt,
    checkInSummary ? `\nRecent emotional states:\n${checkInSummary}` : '',
    fears.length > 0 ? `\nFears they identified: ${fears.join(', ')}` : '',
    strengths.length > 0 ? `\nStrengths they identified: ${strengths.join(', ')}` : '',
    vision ? `\nTheir vision: ${vision}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { prompt, tonePrompt };
}
