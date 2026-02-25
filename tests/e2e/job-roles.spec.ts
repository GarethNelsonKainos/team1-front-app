import { expect, test } from '@playwright/test';
import { ADMIN, APPLICANT } from '../config/test-users';
import { JobRolesListPage } from '../pages/JobRolesListPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Job Roles List', () => {
  test('applicant should see a populated job roles list with no admin controls', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    expect(await jobRolesPage.getUrl()).toContain('/job-roles');
    expect(await jobRolesPage.getHeadingState()).toBe(true);
    await expect(jobRolesPage.jobRoleCards.first()).toBeVisible();
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
