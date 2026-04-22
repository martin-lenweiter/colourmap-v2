import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <p
                className="text-[18px] font-normal tracking-[0.1em] font-serif text-center"
                style={{ color: '#B33A2B' }}
              >
                Colourmap
              </p>
              <svg width={16} height={16} viewBox="0 0 20 20" style={{ marginTop: 3 }}>
                {(() => {
                  const cx = 10;
                  const cy = 10;
                  const r1 = 9;
                  const r2 = 3.5;
                  const pts: string[] = [];
                  for (let i = 0; i < 8; i++) {
                    const a = -Math.PI / 2 + (i * Math.PI) / 4;
                    const r = i % 2 === 0 ? r1 : r2;
                    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
                  }
                  return <polygon points={pts.join(' ')} fill="#B33A2B" opacity={0.85} />;
                })()}
              </svg>
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
