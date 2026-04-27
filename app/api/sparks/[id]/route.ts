import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  closeSparkFromMap,
  fulfillSpark,
  getSparkDetail,
  openSparkToMap,
  removeSpark,
  SparkValidationError,
} from '@/lib/services/sparks';

// GET /api/sparks/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async () => {
    const { id } = await params;
    const detail = await getSparkDetail(id);
    if (!detail) return jsonError('Spark not found', 404);
    return NextResponse.json(detail);
  });
}

// PATCH /api/sparks/[id]
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
        await fulfillSpark(id, user.id);
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'open') {
        if (body.lat == null || body.lng == null) return jsonError('lat and lng required', 400);
        await openSparkToMap(id, user.id, body.lat, body.lng, body.zoneLabel ?? null);
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'close') {
        await closeSparkFromMap(id, user.id);
        return NextResponse.json({ ok: true });
      }
      return jsonError('unknown action', 400);
    } catch (err) {
      if (err instanceof SparkValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}

// DELETE /api/sparks/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;
    try {
      await removeSpark(id, user.id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      if (err instanceof SparkValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}
