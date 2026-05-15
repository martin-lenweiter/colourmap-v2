import { getCodingAgentAdapter } from '@/lib/coding-agents/adapters';
import { createCheckpoint, listChangedFiles } from '@/lib/coding-agents/git';
import { resolveProjectDirectory } from '@/lib/coding-agents/paths';
import { requireBuildLabAccess } from '@/lib/coding-agents/route-auth';
import type { AgentMode } from '@/lib/coding-agents/types';

export const runtime = 'nodejs';

function encodeEvent(event: unknown) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  const access = await requireBuildLabAccess();
  if (!access.ok) return access.response;

  let body: {
    agentId?: string;
    projectPath?: string;
    prompt?: string;
    mode?: AgentMode;
  };

  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const adapter = getCodingAgentAdapter(body.agentId ?? '');
  if (!adapter) return new Response('Unknown coding agent.', { status: 400 });
  if (!body.prompt?.trim()) return new Response('Mission prompt is required.', { status: 400 });

  let projectPath: string;
  try {
    projectPath = await resolveProjectDirectory(body.projectPath ?? '');
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Invalid project path.', {
      status: 400,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: unknown) {
        controller.enqueue(encoder.encode(encodeEvent(event)));
      }

      try {
        const checkpoint = await createCheckpoint(projectPath);
        send({ type: 'checkpoint', checkpoint });

        for await (const event of adapter.runMission({
          projectPath,
          prompt: body.prompt ?? '',
          mode: body.mode ?? 'build',
        })) {
          send(event);
        }

        const changedFiles = await listChangedFiles(projectPath);
        for (const filePath of changedFiles) {
          send({ type: 'file_changed', path: filePath });
        }
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Mission failed.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
