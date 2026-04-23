import { NextResponse } from 'next/server';
import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { getDb } from '@/lib/db/client';
import { insertLifeCategory, listLifeCategories } from '@/lib/db/queries/life-categories';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const categories = await listLifeCategories(getDb(), user.id);
    return NextResponse.json(categories);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const { name, color, compass, position } = bodyResult.value as Record<string, unknown>;
    if (!name || typeof name !== 'string') return jsonError('name is required', 400);

    const category = await insertLifeCategory(getDb(), {
      userId: user.id,
      name: (name as string).trim(),
      color: typeof color === 'string' ? color : '#C4A060',
      compass: typeof compass === 'string' ? compass : undefined,
      position: typeof position === 'number' ? position : 0,
    });
    return NextResponse.json(category, { status: 201 });
  });
}
