import { expect, test } from '@playwright/test';
import { ADMIN, APPLICANT } from '../config/test-users';
import { ApplicationPage } from '../pages/ApplicationPage';
import { LoginPage } from '../pages/LoginPage';

// APPLICANT (Alice) has no seeded application for 'Low Code Principal Architect' — safe to apply each run
const TARGET_ROLE = 'Low Code Principal Architect';
const MOCK_PDF = Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>endobj');

test.describe('Apply for Role', () => {
  test('full flow: login → view role → submit application', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const appPage = new ApplicationPage(page);

    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);
    await expect(page).toHaveURL('/job-roles');

    await appPage.clickRoleByName(TARGET_ROLE);
    await expect(page).toHaveURL(/\/job-roles\/\d+/);
    await expect(appPage.roleHeading).toContainText(TARGET_ROLE);

    await appPage.clickApplyNow();
    await expect(page).toHaveURL(/\/job-roles\/\d+\/apply/);
    await expect(appPage.applyFormHeading).toContainText('Apply for');

    await appPage.uploadCv(MOCK_PDF);
    await appPage.submitApplication();

    await expect(page).toHaveURL('/application-success');
  });

  test('admin should not be able to apply for a role', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const appPage = new ApplicationPage(page);

    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL('/job-roles');

    await appPage.clickRoleByName(TARGET_ROLE);
    await expect(page).toHaveURL(/\/job-roles\/\d+/);
    await appPage.clickApplyNow();
    await expect(page).toHaveURL(/\/job-roles\/\d+\/apply/);

    await appPage.uploadCv(MOCK_PDF);
    await appPage.submitApplication();

    // Admins should not be permitted to submit applications
    await expect(page).not.toHaveURL('/application-success');
    await expect(appPage.errorHeading).toContainText(
      /error|not permitted|access denied/i,
    );
  });
});
