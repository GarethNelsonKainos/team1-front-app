import { expect, test } from '@playwright/test';
import { ADMIN } from '../config/test-users';
import { AddRolePage } from '../pages/AddRolePage';
import { JobRolesListPage } from '../pages/JobRolesListPage';
import { LoginPage } from '../pages/LoginPage';

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
    const jobRolesPage = new JobRolesListPage(page);
    expect(await jobRolesPage.isRoleVisible(roleName)).toBe(true);
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
    expect(await addRolePage.isRoleNameValueMissing()).toBe(true);
  });

  test('should block submission when role name is too short', async ({
    page,
  }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm({ roleName: 'AB' });
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    expect(await addRolePage.isRoleNameTooShort()).toBe(true);
  });

  test('should block submission when no capability is selected', async ({
    page,
  }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm();
    await addRolePage.clearCapabilitySelection();
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    expect(await addRolePage.isCapabilityValueMissing()).toBe(true);
  });

  test('should block submission when no band is selected', async ({ page }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm();
    await addRolePage.clearBandSelection();
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    expect(await addRolePage.isBandValueMissing()).toBe(true);
  });

  // JS validation (description has no minlength HTML attribute — JS catches this)

  test('should show error when description is too short', async ({ page }) => {
    const addRolePage = new AddRolePage(page);
    await addRolePage.fillValidForm({ description: 'Too short' });
    await addRolePage.submit();

    await expect(page).toHaveURL('/add-role');
    expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);
    expect(await addRolePage.getDescriptionErrorText()).toContain(
      'at least 10 characters',
    );
  });
});
