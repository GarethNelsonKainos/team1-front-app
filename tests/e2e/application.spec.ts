import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ADMIN, APPLICANT } from './test-users';

// APPLICANT (Alice) has no seeded application for 'Low Code Principal Architect' — safe to apply each run
const TARGET_ROLE = 'Low Code Principal Architect';

test.describe('Apply for Role', () => {
  test('full flow: login → view role → submit application', async ({
    page,
  }) => {
    // 1. Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);
    await expect(page).toHaveURL('/job-roles');

    // 2. Find the target role on the list and click it
    await page.getByRole('link', { name: new RegExp(TARGET_ROLE) }).click();
    await expect(page).toHaveURL(/\/job-roles\/\d+/);
    await expect(page.locator('h1')).toContainText(TARGET_ROLE);

    // 3. Click the Apply Now button
    await page.getByRole('link', { name: /Apply Now/i }).click();
    await expect(page).toHaveURL(/\/job-roles\/\d+\/apply/);
    await expect(page.locator('h2')).toContainText('Apply for');

    // 4. Upload a minimal valid PDF using an in-memory buffer
    const fileInput = page.locator('#cv');
    await fileInput.setInputFiles({
      name: 'test-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>endobj'),
    });

    // 5. Submit the form
    await page.locator('#submitButton').click();

    // 6. Expect redirect to success page
    await expect(page).toHaveURL('/application-success');
  });

  test('admin should not be able to apply for a role', async ({ page }) => {
    // 1. Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);
    await expect(page).toHaveURL('/job-roles');

    // 2. Navigate to a job role detail page and click Apply Now
    await page.getByRole('link', { name: new RegExp(TARGET_ROLE) }).click();
    await expect(page).toHaveURL(/\/job-roles\/\d+/);
    await page.getByRole('link', { name: /Apply Now/i }).click();
    await expect(page).toHaveURL(/\/job-roles\/\d+\/apply/);

    // 3. Upload a CV and submit
    await page.locator('#cv').setInputFiles({
      name: 'test-cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>endobj'),
    });
    await page.locator('#submitButton').click();

    // 4. Expect an error — admins should not be permitted to submit applications
    await expect(page).not.toHaveURL('/application-success');
    await expect(page.locator('h1, h2')).toContainText(/error|not permitted|access denied/i);
  });
});
