import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { insertAgendaBlock, listAgendaBlocks } from '@/lib/db/queries/agenda-blocks';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const blocks = await listAgendaBlocks(getDb(), user.id);
    return NextResponse.json(blocks);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const {
      text,
      date,
      startHour,
      durationMinutes,
      color,
      kind,
      tagName,
      tagColor,
      tagCategoryId,
    } = bodyResult.value as Record<string, unknown>;

    if (!text || typeof text !== 'string') return jsonError('text is required', 400);
    if (!date || typeof date !== 'string') return jsonError('date is required', 400);
    if (typeof startHour !== 'number') return jsonError('startHour is required', 400);

    const block = await insertAgendaBlock(getDb(), {
      userId: user.id,
      text: (text as string).trim(),
      date: date as string,
      startHour: startHour as number,
      durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : 60,
      color: typeof color === 'string' ? color : '#C4A060',
      kind: kind === 'emotion' ? 'emotion' : 'mission',
      tagName: typeof tagName === 'string' ? tagName : undefined,
      tagColor: typeof tagColor === 'string' ? tagColor : undefined,
      tagCategoryId: typeof tagCategoryId === 'string' ? tagCategoryId : undefined,
    });
    return NextResponse.json(block, { status: 201 });
  });
}
