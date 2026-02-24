import { expect, test } from '@playwright/test';
import { JobRolesListPage } from '../pages/JobRolesListPage';
import { LoginPage } from '../pages/LoginPage';

const APPLICANT = { email: 'alice@example.com', password: 'password1' };
const ADMIN = { email: 'charlie@example.com', password: 'adminpass' };

test.describe('Job Roles List', () => {
  test('should display the job roles list after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.expectToBeOnJobRolesPage();
  });

  test('should show at least one job role card', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await expect(jobRolesPage.jobRoleCards.first()).toBeVisible();
  });

  test('applicant should NOT see the Add New Job Role button', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await expect(jobRolesPage.addNewRoleButton).not.toBeVisible();
  });

  test('admin should see the Add New Job Role button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);

    const jobRolesPage = new JobRolesListPage(page);
    await expect(jobRolesPage.addNewRoleButton).toBeVisible();
  });

  test('should navigate to job role detail page on click', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.clickFirstRole();

    await expect(page).toHaveURL(/\/job-roles\/\d+/);
    await expect(page.locator('h1')).toBeVisible();
  });
});
