import { NextResponse } from 'next/server';

import type { BuildLabQueuedMissionStatus } from '@/lib/coding-agents/queue';
import { listQueuedMissions, updateQueuedMission } from '@/lib/coding-agents/queue';
import { requireBuildLabAccess } from '@/lib/coding-agents/route-auth';

export const runtime = 'nodejs';

const statuses = new Set<BuildLabQueuedMissionStatus>([
  'draft',
  'queued',
  'running',
  'complete',
  'failed',
]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireBuildLabAccess();
  if (!access.ok) return access.response;

  let body: {
    status?: BuildLabQueuedMissionStatus;
    title?: string;
    prompt?: string;
    event?: { type?: string; text?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (body.status && !statuses.has(body.status)) {
    return NextResponse.json({ error: 'Invalid queue status.' }, { status: 400 });
  }

  const { id } = await params;
  const current = listQueuedMissions(access.value.id).find((mission) => mission.id === id);
  if (!current) return NextResponse.json({ error: 'Queued mission not found.' }, { status: 404 });

  const nextEvents = body.event?.type
    ? [
        {
          id: Date.now(),
          type: body.event.type,
          text: body.event.text ?? '',
          createdAt: new Date().toISOString(),
        },
        ...current.events,
      ]
    : current.events;

  const updated = updateQueuedMission(access.value.id, id, {
    status: body.status ?? current.status,
    title: body.title?.trim() || current.title,
    prompt: body.prompt?.trim() || current.prompt,
    events: nextEvents,
  });

  return NextResponse.json(updated);
}
