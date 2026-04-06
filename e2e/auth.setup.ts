import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { test as setup } from '@playwright/test';

const AUTH_FILE = path.resolve(process.cwd(), 'e2e/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.log('TEST_USER_EMAIL or TEST_USER_PASSWORD not set, skipping auth setup');
    return;
  }

  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  await page.goto('/login');

  const response = await page.request.post('/api/e2e-auth', {
    data: { email, password },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`e2e-auth failed: ${response.status()} ${body}`);
  }

  await page.context().storageState({ path: AUTH_FILE });
});
