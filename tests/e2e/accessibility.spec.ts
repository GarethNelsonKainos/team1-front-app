import { test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';
import { ADMIN, APPLICANT } from '../config/test-users';
import { AddRolePage } from '../pages/AddRolePage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { JobRolesListPage } from '../pages/JobRolesListPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Accessibility - Axe Scans', () => {
  test('login page should have no accessibility violations', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('job roles list page should have no accessibility violations', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('job role detail page should have no accessibility violations', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);

    const jobRolesPage = new JobRolesListPage(page);
    await jobRolesPage.clickFirstRole();

    const detailPage = new JobRoleDetailPage(page);
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('add job role page should have no accessibility violations', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);

    const addRolePage = new AddRolePage(page);
    await addRolePage.goto();

    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
});
