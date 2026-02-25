import { expect, test } from '@playwright/test';

test.describe('Protected Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated user to login when accessing /job-roles', async ({
    page,
  }) => {
    await page.goto('/job-roles');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated user to login when accessing /add-role', async ({
    page,
  }) => {
    await page.goto('/add-role');
    await expect(page).toHaveURL('/login');
  });
});
