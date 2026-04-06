import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import {
  LifeScanValidationError,
  listLatestLifeScans,
  normalizeSubmitLifeScanInput,
  submitLifeScan,
} from '@/lib/services/life-scans';

export async function GET() {
  return withAuthenticatedUser(async (user) => {
    const scans = await listLatestLifeScans(user.id);
    return NextResponse.json(scans);
  });
}

export async function POST(request: Request) {
  return withAuthenticatedUser(async (user) => {
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const result = await submitLifeScan(user.id, normalizeSubmitLifeScanInput(bodyResult.value));
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof LifeScanValidationError) {
        return jsonError(error.message, 400);
      }

      throw error;
    }
  });
}
