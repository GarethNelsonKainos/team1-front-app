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

  test.describe('Successful Form Submission', () => {
    test('admin can successfully create a new job role', async ({ page }) => {
      const roleName = `E2E Test Role ${Date.now()}`;
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ roleName });
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
      const jobRolesPage = new JobRolesListPage(page);
      expect(await jobRolesPage.isRoleVisible(roleName)).toBe(true);
    });

    test('should submit successfully with multiple locations', async ({
      page,
    }) => {
      const roleName = `Multi Location Role ${Date.now()}`;
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ roleName });
      await addRolePage.selectMultipleLocations();
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
      const jobRolesPage = new JobRolesListPage(page);
      expect(await jobRolesPage.isRoleVisible(roleName)).toBe(true);
    });
  });

  test.describe('Role Name Validation', () => {
    test('should block submission when role name is missing', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ roleName: '' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isRoleNameErrorVisible()).toBe(true);
      expect(await addRolePage.getRoleNameErrorText()).toContain('required');
    });

    test('should block submission when role name is too short', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ roleName: 'AB' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isRoleNameErrorVisible()).toBe(true);
      expect(await addRolePage.getRoleNameErrorText()).toContain(
        'at least 3 characters',
      );
    });

    test('should show JS error when role name exceeds 100 characters', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const longName = 'A'.repeat(101);

      await addRolePage.fillValidForm({ roleName: '' });
      await addRolePage.fillRoleName(longName);

      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isRoleNameErrorVisible()).toBe(true);
      expect(await addRolePage.getRoleNameErrorText()).toContain(
        'cannot exceed 100 characters',
      );
    });

    test('should accept valid role name (3-100 characters)', async ({
      page,
    }) => {
      const roleName = `Valid Role Name ${Date.now()}`;
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ roleName });
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
    });
  });

  test.describe('Capability Validation', () => {
    test('should block submission when no capability is selected', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm();
      await addRolePage.clearCapabilitySelection();
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isCapabilityErrorVisible()).toBe(true);
      expect(await addRolePage.getCapabilityErrorText()).toContain(
        'select a capability',
      );
    });
  });

  test.describe('Band Validation', () => {
    test('should block submission when no band is selected', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm();
      await addRolePage.clearBandSelection();
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isBandErrorVisible()).toBe(true);
      expect(await addRolePage.getBandErrorText()).toContain('select a band');
    });
  });

  test.describe('Description Validation', () => {
    test('should show error when description is missing', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ description: '' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);
      expect(await addRolePage.getDescriptionErrorText()).toContain('required');
    });

    test('should show error when description is too short', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ description: 'Too short' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);
      expect(await addRolePage.getDescriptionErrorText()).toContain(
        'at least 10 characters',
      );
    });

    test('should show error when description exceeds 500 characters', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const longDescription = 'A'.repeat(501);
      await addRolePage.fillValidForm({ description: longDescription });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);
      expect(await addRolePage.getDescriptionErrorText()).toContain(
        '500 characters or less',
      );
    });

    test('should update character counter for description', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const testText = 'This is a test description';
      await addRolePage.fillDescription(testText);

      const count = await addRolePage.getDescriptionCharCount();
      expect(count).toBe(`${testText.length}/500`);
    });
  });

  test.describe('Responsibilities Validation', () => {
    test('should show error when responsibilities are missing', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ responsibilities: '' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(true);
      expect(await addRolePage.getResponsibilitiesErrorText()).toContain(
        'required',
      );
    });

    test('should show error when responsibilities are too short', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ responsibilities: 'Too short' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(true);
      expect(await addRolePage.getResponsibilitiesErrorText()).toContain(
        'at least 10 characters',
      );
    });

    test('should show error when responsibilities exceed 1000 characters', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const longResponsibilities = 'A'.repeat(1001);
      await addRolePage.fillValidForm({
        responsibilities: longResponsibilities,
      });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(true);
      expect(await addRolePage.getResponsibilitiesErrorText()).toContain(
        '1000 characters or less',
      );
    });

    test('should update character counter for responsibilities', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const testText = 'These are test responsibilities';
      await addRolePage.fillResponsibilities(testText);

      const count = await addRolePage.getResponsibilitiesCharCount();
      expect(count).toBe(`${testText.length}/1000`);
    });
  });

  test.describe('Job Spec Link Validation', () => {
    test('should show error when job spec link is missing', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ jobSpecLink: '' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(true);
      expect(await addRolePage.getJobSpecLinkErrorText()).toContain('required');
    });

    test('should show error when job spec link is not a Kainos SharePoint URL', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({
        jobSpecLink: 'https://google.com/doc',
      });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(true);
      expect(await addRolePage.getJobSpecLinkErrorText()).toContain(
        'Kainos SharePoint link',
      );
    });

    test('should accept valid Kainos SharePoint URL', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({
        jobSpecLink:
          'https://kainossoftwareltd.sharepoint.com/sites/test/doc.pdf',
      });
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
    });
  });

  test.describe('Open Positions Validation', () => {
    test('should show error when open positions is less than 1', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ openPositions: '0' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isOpenPositionsErrorVisible()).toBe(true);
      expect(await addRolePage.getOpenPositionsErrorText()).toContain(
        'At least 1',
      );
    });

    test('should show error when open positions exceeds 100', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ openPositions: '101' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isOpenPositionsErrorVisible()).toBe(true);
      expect(await addRolePage.getOpenPositionsErrorText()).toContain(
        'Cannot exceed 100',
      );
    });

    test('should accept valid open positions (1-100)', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ openPositions: '5' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
    });
  });

  test.describe('Location Validation', () => {
    test('should show error when no location is selected', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm();
      await addRolePage.clearLocationSelection();
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isLocationErrorVisible()).toBe(true);
      expect(await addRolePage.getLocationErrorText()).toContain(
        'at least one location',
      );
    });

    test('should accept single location selection', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm();
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
    });
  });

  test.describe('Closing Date Validation', () => {
    test('should show error when closing date is missing', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ closingDate: '' });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isClosingDateErrorVisible()).toBe(true);
      expect(await addRolePage.getClosingDateErrorText()).toContain('required');
    });

    test('should show error when closing date is today', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      const today = new Date().toISOString().split('T')[0];
      await addRolePage.fillValidForm({ closingDate: today });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isClosingDateErrorVisible()).toBe(true);
      expect(await addRolePage.getClosingDateErrorText()).toContain(
        'must be in the future',
      );
    });

    test('should show error when closing date is in the past', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      await addRolePage.fillValidForm({ closingDate: pastDate });
      await addRolePage.submit();

      await expect(page).toHaveURL('/add-role');
      expect(await addRolePage.isClosingDateErrorVisible()).toBe(true);
      expect(await addRolePage.getClosingDateErrorText()).toContain(
        'must be in the future',
      );
    });

    test('should accept future closing date', async ({ page }) => {
      const addRolePage = new AddRolePage(page);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      await addRolePage.fillValidForm({ closingDate: futureDateStr });
      await addRolePage.submit();

      await expect(page).toHaveURL('/job-roles');
    });
  });

  test.describe('Error Clearing', () => {
    test('should clear role name error when user corrects input', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      const longName = 'A'.repeat(101);
      await addRolePage.fillValidForm({ roleName: longName });
      await addRolePage.submit();

      expect(await addRolePage.isRoleNameErrorVisible()).toBe(true);

      await addRolePage.fillRoleName('Valid Role Name');
      expect(await addRolePage.isRoleNameErrorVisible()).toBe(false);
    });

    test('should clear description error when user types valid text', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ description: 'Short' });
      await addRolePage.submit();

      expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);

      await addRolePage.fillDescription(
        'This is now a valid description with enough characters',
      );
      expect(await addRolePage.isDescriptionErrorVisible()).toBe(false);
    });

    test('should clear responsibilities error when user types valid text', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({ responsibilities: 'Short' });
      await addRolePage.submit();

      expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(true);

      await addRolePage.fillResponsibilities(
        'These are now valid responsibilities with enough characters',
      );
      expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(false);
    });

    test('should clear job spec link error when user corrects URL', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillValidForm({
        jobSpecLink: 'https://google.com/doc',
      });
      await addRolePage.submit();

      expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(true);

      await addRolePage.fillJobSpecLink(
        'https://kainossoftwareltd.sharepoint.com/sites/test/doc.pdf',
      );
      expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(false);
    });
  });

  test.describe('Form Cancellation', () => {
    test('should navigate back to job roles list when cancel is clicked', async ({
      page,
    }) => {
      const addRolePage = new AddRolePage(page);
      await addRolePage.fillRoleName('Test Role That Will Be Cancelled');
      await addRolePage.cancel();

      await expect(page).toHaveURL('/job-roles');
      const jobRolesPage = new JobRolesListPage(page);
      expect(
        await jobRolesPage.isRoleVisible('Test Role That Will Be Cancelled'),
      ).toBe(false);
    });
  });
});
