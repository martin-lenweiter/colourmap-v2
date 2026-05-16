import { NextResponse } from 'next/server';

import { parseJsonBody } from '@/lib/api/route-helpers';
import { getGitDiff, listChangedFiles } from '@/lib/coding-agents/git';
import { resolveProjectDirectory } from '@/lib/coding-agents/paths';
import { requireBuildLabAccess } from '@/lib/coding-agents/route-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const access = await requireBuildLabAccess();
  if (!access.ok) return access.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const { projectPath } = body.value as { projectPath?: string };

  try {
    const resolvedPath = await resolveProjectDirectory(projectPath ?? '', process.cwd());
    const [diff, changedFiles] = await Promise.all([
      getGitDiff(resolvedPath),
      listChangedFiles(resolvedPath),
    ]);
    return NextResponse.json({ diff, changedFiles });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not read diff.' },
      { status: 400 },
    );
  }
}
