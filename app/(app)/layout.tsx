import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

import ColourmapBrandButton from '@/components/ColourmapBrandButton';
import DevBranchHud from '@/components/DevBranchHud';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import MobileViewportBoot from '@/components/MobileViewportBoot';
import NavLinks from '@/components/NavLinks';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import UserInitialsMenu from '@/components/UserInitialsMenu';
import { ViewModeProvider } from '@/components/ViewModeContext';
import ViewModeSwitcher from '@/components/ViewModeSwitcher';
import { createClient } from '@/lib/supabase/server';

function deriveInitials(fullName: string | undefined, email: string): string {
  const source = fullName?.trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  const local = (email.split('@')[0] || '').trim();
  if (!local) return '';
  if (local.includes('.')) {
    const parts = local.split('.').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

import AppShell from './AppShell';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser().catch((error: unknown) => ({
    data: {
      user: null,
    },
    error,
  }));

  if (error && !isAuthSessionMissingError(error)) {
    throw error;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <ViewModeProvider>
      <MobileViewportBoot />
      <div className="min-h-svh bg-background">
        <header className="border-b border-border">
          {/* Three-column grid so the Colourmap brand stays visually
              centered on every viewport — not just desktop. Left column
              is an empty spacer matching the width of the right column
              so the middle is truly centered even on phone. */}
          <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2">
            <div />
            <ColourmapBrandButton />
            <div className="flex items-center justify-end gap-2">
              <ViewModeSwitcher />
              <ThemeSwitcher />
              <UserInitialsMenu
                initials={deriveInitials(
                  user.user_metadata?.full_name as string | undefined,
                  user.email ?? '',
                )}
                email={user.email ?? ''}
              />
            </div>
          </div>
          <NavLinks />
        </header>
        <AppShell>{children}</AppShell>
      </div>
      <FeedbackOverlay />
      <DevBranchHud />
    </ViewModeProvider>
  );
}
