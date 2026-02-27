import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { ADMIN, APPLICANT } from '../config/test-users';
import { AddRolePage } from '../pages/AddRolePage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { JobRolesListPage } from '../pages/JobRolesListPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Accessibility - Axe Scans', () => {
  test('login page should have no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('job roles list page should have no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('job role detail page should have no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.clickFirstRole();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('add job role page should have no accessibility violations', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);

    const addRolePage = new AddRolePage(page);
    await addRolePage.goto();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });
});