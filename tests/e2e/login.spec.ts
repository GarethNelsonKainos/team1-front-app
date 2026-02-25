import { expect, test } from '@playwright/test';
import { ADMIN, APPLICANT } from '../config/test-users';
import { LoginPage } from '../pages/LoginPage';

const VALID_USER = APPLICANT;
const ADMIN_USER = ADMIN;

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should show the login page', async ({ page }) => {
    expect(await loginPage.isSignInHeadingVisible()).toBe(true);
    expect(await loginPage.isEmailInputVisible()).toBe(true);
    expect(await loginPage.isPasswordInputVisible()).toBe(true);
    expect(await loginPage.isLoginButtonVisible()).toBe(true);
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
    expect(await loginPage.getUrl()).toContain('/login');
    expect(await loginPage.getErrorMessage()).toContain('Invalid Credentials');
  });

  test('should show an error with non-existent email', async () => {
    await loginPage.login('notauser@example.com', 'password1');
    expect(await loginPage.getUrl()).toContain('/login');
    expect(await loginPage.getErrorMessage()).toContain('Invalid Credentials');
  });

  test('should redirect unauthenticated user to login when accessing /job-roles', async ({
    page,
  }) => {
    await page.goto('/job-roles');
    await expect(page).toHaveURL('/login');
  });
});
