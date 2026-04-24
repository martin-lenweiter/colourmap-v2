import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

import ColourmapBrandButton from '@/components/ColourmapBrandButton';
import DevBranchHud from '@/components/DevBranchHud';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import MobileViewportBoot from '@/components/MobileViewportBoot';
import NavLinks from '@/components/NavLinks';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { ViewModeProvider } from '@/components/ViewModeContext';
import ViewModeSwitcher from '@/components/ViewModeSwitcher';
import { createClient } from '@/lib/supabase/server';

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
          {/* Compact phone-friendly header. Logo + controls on one row;
              email hidden on phone (it's on the Sign out form target
              anyway, and takes too much space on narrow screens). */}
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-2">
            <div className="flex-1 flex justify-center">
              <ColourmapBrandButton />
            </div>
            <p className="hidden md:block text-xs text-muted-foreground/50 mr-2">
              {user.email ?? 'your Google account'}
            </p>
            <div className="flex items-center gap-2">
              <ViewModeSwitcher />
              <ThemeSwitcher />
              <form action="/logout" method="post">
                <button
                  className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
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
