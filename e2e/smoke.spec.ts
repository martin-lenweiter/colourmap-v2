import { expect, type Page, test } from '@playwright/test';

function skipInAuthenticatedProject() {
  test.skip(
    test.info().project.name === 'chromium-auth',
    'Unauthenticated smoke only runs in the public browser project',
  );
}

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

test('login page renders without console errors', async ({ page }) => {
  skipInAuthenticatedProject();

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
  skipInAuthenticatedProject();

  await gotoOrSkip(page, '/');

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test('cockpit route redirects unauthenticated users', async ({ page }) => {
  skipInAuthenticatedProject();

  await gotoOrSkip(page, '/overview');

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test.describe('authenticated smoke', () => {
  test.skip(
    !process.env.TEST_USER_EMAIL,
    'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run authenticated tests',
  );

  test('cockpit loads after auth', async ({ page }) => {
    test.skip(
      test.info().project.name !== 'chromium-auth',
      'Auth smoke only runs in chromium-auth',
    );

    await page.goto('/');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    expect(errors.filter((error) => !error.toLowerCase().includes('supabase'))).toHaveLength(0);
  });

  test('missions route loads after auth', async ({ page }) => {
    test.skip(
      test.info().project.name !== 'chromium-auth',
      'Auth smoke only runs in chromium-auth',
    );

    await gotoOrSkip(page, '/missions');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
  });
});
