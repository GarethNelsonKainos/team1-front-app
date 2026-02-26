import { expect, test } from '@playwright/test';
import { ADMIN, APPLICANT } from '../config/test-users';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { JobRolesListPage } from '../pages/JobRolesListPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('View Job Role Specification', () => {
  test('should display complete job role details with all information', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.clickFirstRole();

    const detailPage = new JobRoleDetailPage(page);
    const closingDate = await detailPage.getClosingDate();
    expect(await detailPage.isHeadingVisible()).toBe(true);
    expect(await detailPage.getLocation()).toBeTruthy();
    expect(await detailPage.getCapability()).toBeTruthy();
    expect(await detailPage.getBand()).toBeTruthy();
    expect(await detailPage.getClosingDate()).toBeTruthy();
    expect(await detailPage.getOpenPositions()).toBeTruthy();
    expect(closingDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  test('should show apply button for open roles with available positions', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.clickFirstRole();

    const detailPage = new JobRoleDetailPage(page);
    expect(await detailPage.isApplyButtonVisible()).toBe(true);
    expect(await detailPage.isApplyButtonDisabled()).toBe(false);
  });

  test('should disable apply button when no positions available', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.clickFirstRole();

    const detailPage = new JobRoleDetailPage(page);
    const openPositions = await detailPage.getOpenPositions();
    if (openPositions === '0') {
      expect(await detailPage.isApplyButtonDisabled()).toBe(true);
    }
  });

  test('should show error when job role not found', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    await page.goto('/job-roles/99999');
    const detailPage = new JobRoleDetailPage(page);
    expect(await detailPage.isErrorMessageVisible()).toBe(true);
  });
});
