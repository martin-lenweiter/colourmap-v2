import { NextResponse } from 'next/server';

import { parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';

// POST /api/tts/elevenlabs
// Proxies to ElevenLabs so the API key stays server-side.
// body: { text, voiceId?, model?, stability?, similarity? }
export async function POST(request: Request) {
  return withAuthenticatedUser(async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 503 });
    }

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const {
      text,
      voiceId = '21m00Tcm4TlvDq8ikWAM', // Rachel default
      model = 'eleven_multilingual_v2',
      stability = 0.45,
      similarity = 0.8,
    } = bodyResult.value as {
      text?: string;
      voiceId?: string;
      model?: string;
      stability?: number;
      similarity?: number;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }

    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: model,
        voice_settings: { stability, similarity_boost: similarity },
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text().catch(() => 'upstream error');
      return NextResponse.json({ error: err }, { status: upstream.status });
    }

    const audio = await upstream.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  });
}
