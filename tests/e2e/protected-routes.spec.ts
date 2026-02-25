import { test } from '@playwright/test';
import { ProtectedRoutesPage } from '../pages/ProtectedRoutesPage';

test.describe('Protected Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated user to login when accessing /job-roles', async ({
    page,
  }) => {
    const protectedRoutesPage = new ProtectedRoutesPage(page);
    await protectedRoutesPage.gotoJobRoles();
    await protectedRoutesPage.expectRedirectedToLogin();
  });

  test('should redirect unauthenticated user to login when accessing /add-role', async ({
    page,
  }) => {
    const protectedRoutesPage = new ProtectedRoutesPage(page);
    await protectedRoutesPage.gotoAddRole();
    await protectedRoutesPage.expectRedirectedToLogin();
  });
});