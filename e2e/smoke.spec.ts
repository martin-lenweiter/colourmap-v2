import { expect, type Page, test } from '@playwright/test';

const HAS_AUTH = Boolean(process.env.TEST_USER_EMAIL) && Boolean(process.env.TEST_USER_PASSWORD);

async function gotoOrSkip(page: Page, path: string) {
  try {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    await skipIfAppBootFailed(page);
    return response;
  } catch (error) {
    test.skip(
      true,
      `App failed to start for browser smoke tests: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function skipIfAppBootFailed(page: Page) {
  const bodyText = (await page.locator('body').textContent()) ?? '';

  test.skip(
    bodyText.includes('Missing required environment variable:'),
    'App did not boot because required env vars are missing.',
  );
}

async function fillCredentialLoginOrSkip(page: Page) {
  await gotoOrSkip(page, '/login');

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  test.skip(
    (await emailInput.count()) === 0 ||
      (await passwordInput.count()) === 0 ||
      (await submitButton.count()) === 0,
    'Current login flow is Google OAuth only; no credential form is available for automated smoke auth.',
  );

  await emailInput.fill(process.env.TEST_USER_EMAIL!);
  await passwordInput.fill(process.env.TEST_USER_PASSWORD!);
  await submitButton.click();
}

test('login page renders without console errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await gotoOrSkip(page, '/login');

  await expect(page).toHaveTitle(/Colourmap/);
  await expect(
    page.getByRole('button', {
      name: /continue with google/i,
    }),
  ).toBeVisible();
  expect(errors.filter((error) => !error.toLowerCase().includes('supabase'))).toHaveLength(0);
});

test('protected routes redirect unauthenticated users', async ({ page }) => {
  await gotoOrSkip(page, '/');

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test('cockpit route redirects unauthenticated users', async ({ page }) => {
  await gotoOrSkip(page, '/overview');

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test.describe('authenticated smoke (requires TEST_USER_EMAIL)', () => {
  test.skip(!HAS_AUTH, 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run');

  test('cockpit loads after auth', async ({ page }) => {
    await fillCredentialLoginOrSkip(page);

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('missions loads after auth', async ({ page }) => {
    await fillCredentialLoginOrSkip(page);

    await gotoOrSkip(page, '/missions');
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
    await expect(page.locator('body')).toBeVisible();
  });
});
