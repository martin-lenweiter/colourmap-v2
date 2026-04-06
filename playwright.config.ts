import { defineConfig } from '@playwright/test';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://example.supabase.co';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_example';
const hasAuthTestUser = Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = supabasePublishableKey;

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    ...(hasAuthTestUser
      ? [
          {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
          },
        ]
      : []),
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
      testIgnore: /auth\.setup\.ts/,
    },
    ...(hasAuthTestUser
      ? [
          {
            name: 'chromium-auth',
            use: {
              browserName: 'chromium' as const,
              storageState: 'e2e/.auth/user.json',
            },
            testMatch: /smoke\.spec\.ts/,
            dependencies: ['setup'],
          },
        ]
      : []),
  ],
  webServer: {
    command: 'bun run dev -- --hostname 127.0.0.1 --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      // Keep browser smoke tests isolated from local auth bypass convenience flags.
      DEV_BYPASS_AUTH: 'false',
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
    },
  },
});
