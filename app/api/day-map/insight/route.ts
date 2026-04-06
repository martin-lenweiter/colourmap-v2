import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import {
  parseJsonBody,
  unauthorizedTextResponse,
  withAuthenticatedUser,
} from '@/lib/api/route-helpers';
import {
  buildDayMapInsightPrompt,
  normalizeDayMapInsightInput,
  ReflectionValidationError,
} from '@/lib/services/reflections';

export async function POST(req: Request) {
  return withAuthenticatedUser(
    async (user) => {
      const bodyResult = await parseJsonBody(req);
      if (!bodyResult.ok) {
        return bodyResult.response;
      }

      try {
        const prompt = await buildDayMapInsightPrompt(
          user.id,
          normalizeDayMapInsightInput(bodyResult.value),
        );
        const result = streamText({
          model: anthropic('claude-haiku-4-5-20251001'),
          system: `You are an energy pattern observer inside Colourmap.
Generate exactly 1 sentence connecting the user's day map activities to their emotional check-ins.
Look for: energy peaks/drops after specific activities, meal patterns, correlations between activity type and emotional state.
Be specific — name the activity, name the time, name the pattern.
Do not advise. Just observe.`,
          prompt,
        });

        return result.toTextStreamResponse();
      } catch (error) {
        if (error instanceof ReflectionValidationError) {
          return new Response(error.message, { status: 400 });
        }

        throw error;
      }
    },
    { unauthorizedResponse: unauthorizedTextResponse },
  );
}
