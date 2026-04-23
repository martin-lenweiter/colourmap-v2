import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

import ColourmapBrandButton from '@/components/ColourmapBrandButton';
import MobileViewportBoot from '@/components/MobileViewportBoot';
import NavLinks from '@/components/NavLinks';
import StepBack from '@/components/StepBack';
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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-3">
            <div className="flex items-center justify-center">
              <ColourmapBrandButton />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <StepBack />
                <p className="text-xs text-muted-foreground/50">
                  {user.email ?? 'your Google account'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ViewModeSwitcher />
                <ThemeSwitcher />
                <form action="/logout" method="post">
                  <button
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    type="submit"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
          <NavLinks />
        </header>
        <AppShell>{children}</AppShell>
      </div>
    </ViewModeProvider>
  );
}
