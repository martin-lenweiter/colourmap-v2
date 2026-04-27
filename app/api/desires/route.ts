import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import type { DesireCategory, DesireTimeWindow } from '@/lib/db/schema';
import {
  createDesire,
  DesireValidationError,
  listMyDesires,
  listNearbyDesires,
} from '@/lib/services/desires';

// GET /api/desires?lat=48.85&lng=2.35&radius=10
// Returns nearby open desires (map) OR the user's own desires (no lat/lng).
export async function GET(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (latStr && lngStr) {
      const lat = Number.parseFloat(latStr);
      const lng = Number.parseFloat(lngStr);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return jsonError('invalid lat/lng', 400);
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return jsonError('lat/lng out of range', 400);
      }
      const radius = Math.min(Number.parseFloat(searchParams.get('radius') ?? '10'), 50);
      const results = await listNearbyDesires(lat, lng, radius);
      return NextResponse.json(results);
    }

    const mine = await listMyDesires(user.id);
    return NextResponse.json(mine);
  });
}

// POST /api/desires
export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.value as {
      text?: string;
      category?: DesireCategory;
      timeWindow?: DesireTimeWindow;
      circleId?: string;
      isOpen?: boolean;
      lat?: number;
      lng?: number;
      zoneLabel?: string;
    };

    try {
      const desire = await createDesire(user.id, {
        text: body.text ?? '',
        category: body.category ?? 'fun',
        timeWindow: body.timeWindow ?? 'this_week',
        circleId: body.circleId ?? null,
        isOpen: body.isOpen ?? false,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        zoneLabel: body.zoneLabel ?? null,
      });
      return NextResponse.json(desire, { status: 201 });
    } catch (err) {
      if (err instanceof DesireValidationError) return jsonError(err.message, 400);
      throw err;
    }
  });
}
