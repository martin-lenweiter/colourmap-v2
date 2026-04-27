import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  closeDesireFromMap,
  DesireValidationError,
  fulfillDesire,
  getDesireDetail,
  openDesireToMap,
  removeDesire,
} from '@/lib/services/desires';

// GET /api/desires/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async () => {
    const { id } = await params;
    const detail = await getDesireDetail(id);
    if (!detail) return jsonError('Desire not found', 404);
    return NextResponse.json(detail);
  });
}

// PATCH /api/desires/[id]
// Body: { action: 'fulfill' | 'open' | 'close', lat?, lng?, zoneLabel? }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.value as {
      action?: string;
      lat?: number;
      lng?: number;
      zoneLabel?: string;
    };

    try {
      if (body.action === 'fulfill') {
        await fulfillDesire(id, user.id);
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'open') {
        if (body.lat == null || body.lng == null) return jsonError('lat and lng required', 400);
        await openDesireToMap(id, user.id, body.lat, body.lng, body.zoneLabel ?? null);
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'close') {
        await closeDesireFromMap(id, user.id);
        return NextResponse.json({ ok: true });
      }
      return jsonError('unknown action', 400);
    } catch (err) {
      if (err instanceof DesireValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}

// DELETE /api/desires/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    try {
      await removeDesire(id, user.id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof DesireValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}
