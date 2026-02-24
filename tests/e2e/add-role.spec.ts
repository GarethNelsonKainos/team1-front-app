import { type Page, expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const ADMIN = { email: 'charlie@example.com', password: 'password1' };

const VALID_FORM = {
  roleName: `E2E Test Role ${Date.now()}`,
  capability: 'Engineering',
  band: 'Associate',
  description: 'This is an e2e test role created by Playwright automation.',
  jobSpecLink:
    'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20profile%20-%20Senior%20Software%20Engieneer%20(Senior%20Associate).pdf',
  responsibilities:
    'Write automated tests, maintain the test framework, report bugs.',
  openPositions: '2',
  location: 'Remote',
};

async function fillValidForm(
  page: Page,
  overrides: Record<string, string> = {},
) {
  const values = { ...VALID_FORM, ...overrides };

  await page.locator('#roleName').fill(values.roleName);
  await page.locator('#capability').selectOption({ label: values.capability });
  await page.locator('#band').selectOption({ label: values.band });
  await page.locator('#description').fill(values.description);
  await page.locator('#jobSpecLink').fill(values.jobSpecLink);
  await page.locator('#responsibilities').fill(values.responsibilities);
  await page.locator('#openPositions').fill(values.openPositions);
  await page.locator('#location').selectOption({ label: values.location });

  const closingDate = new Date();
  closingDate.setFullYear(closingDate.getFullYear() + 1);
  await page
    .locator('#closingDate')
    .fill(closingDate.toISOString().split('T')[0]);
}

test.describe('Add New Job Role', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);
    await page.locator('a[href="/add-role"]').click();
    await expect(page).toHaveURL('/add-role');
  });

  test('admin can successfully create a new job role', async ({ page }) => {
    const roleName = `E2E Test Role ${Date.now()}`;
    await fillValidForm(page, { roleName });

    await page.getByRole('button', { name: 'Add Job Role' }).click();

    await expect(page).toHaveURL('/job-roles');
    await expect(
      page.getByRole('link', { name: new RegExp(roleName) }),
    ).toBeVisible();
  });

  // Browser native validation (required / minlength HTML attributes block submission
  // before JS runs — assert the field is invalid via the browser validity API)

  test('should block submission when role name is missing', async ({
    page,
  }) => {
    await fillValidForm(page, { roleName: '' });
    await page.getByRole('button', { name: 'Add Job Role' }).click();

    await expect(page).toHaveURL('/add-role');
    const valueMissing = await page
      .locator('#roleName')
      .evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(valueMissing).toBe(true);
  });

  test('should block submission when role name is too short', async ({
    page,
  }) => {
    await fillValidForm(page, { roleName: 'AB' });
    await page.getByRole('button', { name: 'Add Job Role' }).click();

    await expect(page).toHaveURL('/add-role');
    const tooShort = await page
      .locator('#roleName')
      .evaluate((el: HTMLInputElement) => el.validity.tooShort);
    expect(tooShort).toBe(true);
  });

  test('should block submission when no capability is selected', async ({
    page,
  }) => {
    await fillValidForm(page);
    await page.locator('#capability').selectOption('');
    await page.getByRole('button', { name: 'Add Job Role' }).click();

    await expect(page).toHaveURL('/add-role');
    const valueMissing = await page
      .locator('#capability')
      .evaluate((el: HTMLSelectElement) => el.validity.valueMissing);
    expect(valueMissing).toBe(true);
  });

  test('should block submission when no band is selected', async ({ page }) => {
    await fillValidForm(page);
    await page.locator('#band').selectOption('');
    await page.getByRole('button', { name: 'Add Job Role' }).click();

    await expect(page).toHaveURL('/add-role');
    const valueMissing = await page
      .locator('#band')
      .evaluate((el: HTMLSelectElement) => el.validity.valueMissing);
    expect(valueMissing).toBe(true);
  });

  // JS validation (description has no minlength HTML attribute — JS catches this)

  test('should show error when description is too short', async ({ page }) => {
    await fillValidForm(page, { description: 'Too short' });
    await page.getByRole('button', { name: 'Add Job Role' }).click();

    await expect(page).toHaveURL('/add-role');
    await expect(page.locator('#descriptionError')).toBeVisible();
    await expect(page.locator('#descriptionError')).toContainText(
      'at least 10 characters',
    );
  });
});
