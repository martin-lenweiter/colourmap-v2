import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import ChatPageClient from './ChatPageClient';

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <ChatPageClient currentUserId={user.id} />;
}
