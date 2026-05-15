import { NextResponse } from 'next/server';

import { codingAgentAdapters } from '@/lib/coding-agents/adapters';
import { requireBuildLabAccess } from '@/lib/coding-agents/route-auth';

export const runtime = 'nodejs';

export async function GET() {
  const access = await requireBuildLabAccess();
  if (!access.ok) return access.response;

  const agents = await Promise.all(
    codingAgentAdapters.map(async (adapter) => ({
      id: adapter.id,
      name: adapter.name,
      available: await adapter.isAvailable(),
    })),
  );

  return NextResponse.json({ agents });
}
