import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import {
  parseJsonBody,
  unauthorizedTextResponse,
  withAuthenticatedUser,
} from '@/lib/api/route-helpers';

const MAX_MESSAGE_LENGTH = 5_000;
const MAX_SURFACE_LENGTH = 80;
const MAX_SPEC_CHARS = 28_000;

const SPEC_FILES = [
  'docs/product.md',
  'docs/specs/ai-presence.md',
  'docs/specs/build-lab.md',
  'docs/specs/infinite-comic-billy.md',
  'docs/specs/billy-new-babylon-150.md',
  'docs/specs/ai-reflection-menu.md',
];

async function loadSpecContext() {
  const chunks = await Promise.all(
    SPEC_FILES.map(async (file) => {
      try {
        const content = await readFile(path.join(process.cwd(), file), 'utf8');
        return `\n\n--- ${file} ---\n${content}`;
      } catch {
        return '';
      }
    }),
  );
  return chunks.join('').slice(0, MAX_SPEC_CHARS);
}

function normalizePresenceInput(input: unknown) {
  if (typeof input !== 'object' || input === null) {
    return { ok: false as const, response: new Response('Invalid input', { status: 400 }) };
  }

  const { message, surface } = input as { message?: unknown; surface?: unknown };
  if (typeof message !== 'string' || !message.trim()) {
    return { ok: false as const, response: new Response('Message is required', { status: 400 }) };
  }

  const normalizedMessage = message.trim();
  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    return { ok: false as const, response: new Response('Message too long', { status: 400 }) };
  }

  if (surface !== undefined && surface !== null && typeof surface !== 'string') {
    return { ok: false as const, response: new Response('Invalid surface', { status: 400 }) };
  }

  return {
    ok: true as const,
    value: {
      message: normalizedMessage,
      surface:
        typeof surface === 'string' && surface.trim()
          ? surface.trim().slice(0, MAX_SURFACE_LENGTH)
          : 'Colourmap',
    },
  };
}

export async function POST(req: Request) {
  return withAuthenticatedUser(
    async () => {
      const bodyResult = await parseJsonBody(req);
      if (!bodyResult.ok) return bodyResult.response;

      const input = normalizePresenceInput(bodyResult.value);
      if (!input.ok) return input.response;
      const specContext = await loadSpecContext();

      const result = streamText({
        model: anthropic('claude-haiku-4-5-20251001'),
        system: `You are Colourmap's AI Presence: a calm reflective interface inside a personal cockpit app.
The user is speaking or writing from the ${input.value.surface} surface.
You have access to a compact bundle of the live Colourmap product/spec documents below.
Use it when the user asks about product direction, strategy, Build Lab, AI, education, Billy/Pineapple Planet, or what to do next.
If the answer depends on the specs, say what the specs imply. If the docs do not contain something, say that clearly.
Spec context:
${specContext || 'Spec context unavailable.'}

Your job is to help them find the core simple challenge underneath the fragment.
Write in 3 short parts:
1. "I notice..." with one specific reflection.
2. "The simple tension may be..." with the clearest possible tension.
3. One gentle question that helps them choose the next small move.
For product/spec questions, you may answer more directly and practically, but stay concise.
Do not diagnose. Do not claim certainty. Do not overload. Do not use bullet points unless the user explicitly asks.`,
        prompt: input.value.message,
      });

      return result.toTextStreamResponse();
    },
    { unauthorizedResponse: unauthorizedTextResponse },
  );
}
