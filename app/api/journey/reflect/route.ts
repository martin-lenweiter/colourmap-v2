import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import {
  parseJsonBody,
  unauthorizedTextResponse,
  withAuthenticatedUser,
} from '@/lib/api/route-helpers';
import {
  buildJourneyReflectionPrompt,
  normalizeJourneyReflectionInput,
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
        const { prompt, tonePrompt } = await buildJourneyReflectionPrompt(
          user.id,
          normalizeJourneyReflectionInput(bodyResult.value),
        );

        const result = streamText({
          model: anthropic('claude-haiku-4-5-20251001'),
          system: `You are a companion cat inside Colourmap, a personal journey app.
${tonePrompt}
You are reflecting on the user's journey — their emotional patterns, their challenges, their growth.
Do not advise unless asked. Name what you see. Be warm, not clinical.
If the user is in a dark period, acknowledge it with compassion. Darkness is part of the path.`,
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
