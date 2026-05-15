import { notFound } from 'next/navigation';

import BuildLab from '@/components/BuildLab';
import { canAccessBuildLab } from '@/lib/coding-agents/access';
import { createClient } from '@/lib/supabase/server';

export default async function BuildLabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessBuildLab(user)) notFound();

  return <BuildLab />;
}
