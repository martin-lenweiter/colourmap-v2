import { NextResponse } from 'next/server';

import { createQueuedMission, listQueuedMissions } from '@/lib/coding-agents/queue';
import { requireBuildLabAccess } from '@/lib/coding-agents/route-auth';

export const runtime = 'nodejs';

function titleFromPrompt(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, ' ').trim();
  return cleaned.length > 58 ? `${cleaned.slice(0, 58)}...` : cleaned || 'Untitled mission';
}

export async function GET() {
  const access = await requireBuildLabAccess();
  if (!access.ok) return access.response;

  return NextResponse.json({ missions: listQueuedMissions(access.value.id) });
}

export async function POST(request: Request) {
  const access = await requireBuildLabAccess();
  if (!access.ok) return access.response;

  let body: {
    channelId?: string;
    agentId?: string;
    projectPath?: string;
    prompt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Mission prompt is required.' }, { status: 400 });
  }
  if (!body.projectPath?.trim()) {
    return NextResponse.json({ error: 'Project path is required.' }, { status: 400 });
  }

  const mission = createQueuedMission(access.value.id, {
    title: titleFromPrompt(body.prompt),
    channelId: body.channelId ?? 'general',
    agentId: body.agentId ?? 'codex',
    projectPath: body.projectPath,
    prompt: body.prompt,
  });

  return NextResponse.json(mission, { status: 201 });
}
