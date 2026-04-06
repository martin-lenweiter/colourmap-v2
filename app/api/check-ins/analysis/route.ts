import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import { unauthorizedTextResponse, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { buildCheckInAnalysisPrompt, ReflectionValidationError } from '@/lib/services/reflections';

export async function POST() {
  return withAuthenticatedUser(
    async (user) => {
      try {
        const prompt = await buildCheckInAnalysisPrompt(user.id);

        const result = streamText({
          model: anthropic('claude-haiku-4-5-20251001'),
          system: `You are a warm, insightful reflection companion inside a personal cockpit app called Colourmap.
The user checks in with how they feel (slider from 0=Crushed to 100=Expansive) and tracks missions.
Your role: reflect on their recent emotional pattern and connect it to what they're doing.
Be poetic but grounded. Short — 3-5 sentences max. No bullet points, no headers.
Speak as a wise friend, not a therapist. Name what you see, don't prescribe.
Use their actual words and emotional states. If you notice a pattern, name it gently.`,
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
