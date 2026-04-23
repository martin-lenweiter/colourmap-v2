import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { insertOuting, listOutings } from '@/lib/db/queries/outings';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const list = await listOutings(getDb(), user.id);
    return NextResponse.json(list);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const { text, date, color } = bodyResult.value as Record<string, unknown>;
    if (!text || typeof text !== 'string') return jsonError('text is required', 400);
    if (!date || typeof date !== 'string') return jsonError('date is required', 400);

    const outing = await insertOuting(getDb(), {
      userId: user.id,
      text: (text as string).trim(),
      date: date as string,
      color: typeof color === 'string' ? color : '#6B7F4E',
    });
    return NextResponse.json(outing, { status: 201 });
  });
}
