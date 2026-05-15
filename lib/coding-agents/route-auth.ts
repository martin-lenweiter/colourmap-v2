import { jsonError, requireAuthenticatedUser } from '@/lib/api/route-helpers';

import { canAccessBuildLab } from './access';

export async function requireBuildLabAccess() {
  const result = await requireAuthenticatedUser();
  if (!result.ok) return result;

  if (!canAccessBuildLab(result.value)) {
    return {
      ok: false as const,
      response: jsonError('Build Lab is creator-only for now.', 403),
    };
  }

  return result;
}
