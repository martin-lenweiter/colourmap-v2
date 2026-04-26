import { NextResponse } from 'next/server';

import { jsonError, parseJsonBody, withAuthenticatedUser } from '@/lib/api/route-helpers';
import { CircleValidationError, castDecisionVote } from '@/lib/services/circles';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; decisionId: string }> },
) {
  return withAuthenticatedUser(async (user) => {
    const { id, decisionId } = await params;

    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const body = bodyResult.value as {
      value?: 'yes' | 'no' | 'unsure';
      memberName?: string;
    };

    if (body.value !== 'yes' && body.value !== 'no' && body.value !== 'unsure') {
      return jsonError('value must be yes, no, or unsure', 400);
    }
    if (!body.memberName || typeof body.memberName !== 'string') {
      return jsonError('memberName is required', 400);
    }

    try {
      const vote = await castDecisionVote(user.id, id, decisionId, body.value, body.memberName);
      return NextResponse.json(vote, { status: 201 });
    } catch (error) {
      if (error instanceof CircleValidationError) {
        return jsonError(error.message, 400);
      }
      throw error;
    }
  });
}
