import { expect, test } from '@playwright/test';
import { AddRolePage } from '../pages/AddRolePage';
import { LoginPage } from '../pages/LoginPage';
import { ADMIN } from './test-users';

test.describe('Add New Job Role', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(ADMIN.email, ADMIN.password);
    const addRolePage = new AddRolePage(page);
    await addRolePage.goto();
    await expect(page).toHaveURL('/add-role');
  });

  test('admin can successfully create a new job role', async ({ page }) => {
    const roleName = `E2E Test Role ${Date.now()}`;
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm({ roleName });
    await addRolePage.submit();

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
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm({ roleName: '' });
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    const valueMissing = await addRolePage.roleNameInput.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing,
    );
    expect(valueMissing).toBe(true);
  });

  test('should block submission when role name is too short', async ({
    page,
  }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm({ roleName: 'AB' });
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    const tooShort = await addRolePage.roleNameInput.evaluate(
      (el: HTMLInputElement) => el.validity.tooShort,
    );
    expect(tooShort).toBe(true);
  });

  test('should block submission when no capability is selected', async ({
    page,
  }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm();
    await addRolePage.capabilitySelect.selectOption('');
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    const valueMissing = await addRolePage.capabilitySelect.evaluate(
      (el: HTMLSelectElement) => el.validity.valueMissing,
    );
    expect(valueMissing).toBe(true);
  });

  test('should block submission when no band is selected', async ({ page }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm();
    await addRolePage.bandSelect.selectOption('');
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    const valueMissing = await addRolePage.bandSelect.evaluate(
      (el: HTMLSelectElement) => el.validity.valueMissing,
    );
    expect(valueMissing).toBe(true);
  });

  // JS validation (description has no minlength HTML attribute — JS catches this)

  test('should show error when description is too short', async ({ page }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm({ description: 'Too short' });
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    await expect(addRolePage.descriptionError).toBeVisible();
    await expect(addRolePage.descriptionError).toContainText(
      'at least 10 characters',
    );
  });
});
