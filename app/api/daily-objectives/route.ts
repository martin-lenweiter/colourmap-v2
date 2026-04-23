import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { insertDailyObjective, listDailyObjectives } from '@/lib/db/queries/daily-objectives';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const objectives = await listDailyObjectives(getDb(), user.id);
    return NextResponse.json(objectives);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const { text, list, position } = bodyResult.value as {
      text?: string;
      list?: string;
      position?: number;
    };
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return jsonError('text is required', 400);
    }

    const objective = await insertDailyObjective(getDb(), {
      userId: user.id,
      text: text.trim(),
      list: list === 'tomorrow' ? 'tomorrow' : 'today',
      position: typeof position === 'number' ? position : 0,
    });
    return NextResponse.json(objective, { status: 201 });
  });
}
