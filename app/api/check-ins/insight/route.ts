import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import {
  parseJsonBody,
  unauthorizedTextResponse,
  withAuthenticatedUser,
} from '@/lib/api/route-helpers';
import {
  buildCheckInInsightPrompt,
  normalizeCheckInInsightInput,
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
        const prompt = await buildCheckInInsightPrompt(
          user.id,
          normalizeCheckInInsightInput(bodyResult.value),
        );
        const result = streamText({
          model: anthropic('claude-haiku-4-5-20251001'),
          system: `You are a reflection companion inside Colourmap, a personal cockpit app.
The user just checked in. Generate exactly 2 sentences.
Sentence 1: Name what you notice about this moment — the emotional state, what they wrote, or the shift from before. Be specific, use their words.
Sentence 2: Connect it to something — a trend from recent check-ins, a mission they're working on, or a fear/strength from their life scan. If there's no connection, name the texture of this moment.
Do not advise. Do not prescribe. Do not use bullet points. Speak as a wise friend noticing something aloud.`,
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
