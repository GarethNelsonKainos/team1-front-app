import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Demo users from README
const VALID_USER = { email: 'alice@example.com', password: 'password1' };
const ADMIN_USER = { email: 'charlie@example.com', password: 'adminpass' };

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show the login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should log in successfully with valid applicant credentials', async ({
    page,
  }) => {
    await loginPage.login(VALID_USER.email, VALID_USER.password);
    await expect(page).toHaveURL('/job-roles');
  });

  test('should log in successfully with valid admin credentials', async ({
    page,
  }) => {
    await loginPage.login(ADMIN_USER.email, ADMIN_USER.password);
    await expect(page).toHaveURL('/job-roles');
  });

  test('should show an error with wrong password', async () => {
    await loginPage.login(VALID_USER.email, 'wrongpassword');
    await loginPage.expectToBeOnLoginPage();
    await loginPage.expectErrorMessage('Invalid Credentials');
  });

  test('should show an error with non-existent email', async () => {
    await loginPage.login('notauser@example.com', 'password1');
    await loginPage.expectToBeOnLoginPage();
    await loginPage.expectErrorMessage('Invalid Credentials');
  });

  test('should redirect unauthenticated user to login when accessing /job-roles', async ({
    page,
  }) => {
    await page.goto('/job-roles');
    await expect(page).toHaveURL('/login');
  });
});
