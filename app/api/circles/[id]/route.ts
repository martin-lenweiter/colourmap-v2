import { NextResponse } from 'next/server';

import { jsonError, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { CircleValidationError, getCircleDetail } from '@/lib/services/circles';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAuthenticatedUser(async (user) => {
    const { id } = await params;

    try {
      const detail = await getCircleDetail(user.id, id);
      return NextResponse.json(detail);
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 404);
      }
      throw error;
    }
  });
}
