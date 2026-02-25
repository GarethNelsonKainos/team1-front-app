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
  });

  test('should successfully create a job role with valid data', async ({
    page,
  }) => {
    const roleName = `E2E Test Role ${Date.now()}`;
    const addRolePage = new AddRolePage(page);

    await addRolePage.fillValidForm({ roleName });
    await addRolePage.submit();

    await expect(page).toHaveURL('/job-roles');
    const jobRolesPage = new JobRolesListPage(page);
    expect(await jobRolesPage.isRoleVisible(roleName)).toBe(true);
  });

  test('should successfully create a job role with multiple locations', async ({
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

  test('should validate all required fields and show appropriate errors', async ({
    page,
  }) => {
    const addRolePage = new AddRolePage(page);

    // Submit empty form
    await addRolePage.submit();
    await expect(page).toHaveURL('/add-role');

    // Check required field errors are shown (excluding fields with default values)
    expect(await addRolePage.isRoleNameErrorVisible()).toBe(true);
    expect(await addRolePage.isCapabilityErrorVisible()).toBe(true);
    expect(await addRolePage.isBandErrorVisible()).toBe(true);
    expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);
    expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(true);
    expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(true);
    // Note: openPositions has default value of 1, so no error expected
    expect(await addRolePage.isLocationErrorVisible()).toBe(true);
    expect(await addRolePage.isClosingDateErrorVisible()).toBe(true);

    // Verify error messages contain expected text
    expect(await addRolePage.getRoleNameErrorText()).toContain('required');
    expect(await addRolePage.getDescriptionErrorText()).toContain('required');
    expect(await addRolePage.getJobSpecLinkErrorText()).toContain('required');
    expect(await addRolePage.getResponsibilitiesErrorText()).toContain(
      'required',
    );
    expect(await addRolePage.getLocationErrorText()).toContain('location');
    expect(await addRolePage.getClosingDateErrorText()).toContain('required');
  });

  test('should validate field length constraints', async ({ page }) => {
    const addRolePage = new AddRolePage(page);

    // Test role name too short
    await addRolePage.fillValidForm({ roleName: 'AB' });
    await addRolePage.submit();
    expect(await addRolePage.getRoleNameErrorText()).toContain(
      'at least 3 characters',
    );

    // Test role name too long
    await addRolePage.fillRoleName('A'.repeat(101));
    await addRolePage.submit();
    expect(await addRolePage.getRoleNameErrorText()).toContain(
      'cannot exceed 100 characters',
    );

    // Test description too short
    await addRolePage.fillValidForm({
      roleName: 'Valid Name',
      description: 'Short',
    });
    await addRolePage.submit();
    expect(await addRolePage.getDescriptionErrorText()).toContain(
      'at least 10 characters',
    );

    // Test description too long
    await addRolePage.fillDescription('A'.repeat(501));
    await addRolePage.submit();
    expect(await addRolePage.getDescriptionErrorText()).toContain(
      '500 characters or less',
    );

    // Test responsibilities too short
    await addRolePage.fillValidForm({
      roleName: 'Valid Name',
      description: 'Valid description text here',
      responsibilities: 'Short',
    });
    await addRolePage.submit();
    expect(await addRolePage.getResponsibilitiesErrorText()).toContain(
      'at least 10 characters',
    );

    // Test responsibilities too long
    await addRolePage.fillResponsibilities('A'.repeat(1001));
    await addRolePage.submit();
    expect(await addRolePage.getResponsibilitiesErrorText()).toContain(
      '1000 characters or less',
    );
  });

  test('should validate business rules', async ({ page }) => {
    const addRolePage = new AddRolePage(page);

    // Invalid job spec link (not SharePoint)
    await addRolePage.fillValidForm({ jobSpecLink: 'https://google.com/doc' });
    await addRolePage.submit();
    expect(await addRolePage.getJobSpecLinkErrorText()).toContain(
      'Kainos SharePoint link',
    );

    // Open positions less than 1
    await addRolePage.fillValidForm({ openPositions: '0' });
    await addRolePage.submit();
    expect(await addRolePage.getOpenPositionsErrorText()).toContain(
      'At least 1',
    );

    // Open positions greater than 100
    await addRolePage.fillValidForm({ openPositions: '101' });
    await addRolePage.submit();
    expect(await addRolePage.getOpenPositionsErrorText()).toContain(
      'Cannot exceed 100',
    );

    // Closing date in the past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await addRolePage.fillValidForm({
      closingDate: yesterday.toISOString().split('T')[0],
    });
    await addRolePage.submit();
    expect(await addRolePage.getClosingDateErrorText()).toContain(
      'must be in the future',
    );

    // Closing date today
    const today = new Date().toISOString().split('T')[0];
    await addRolePage.fillValidForm({ closingDate: today });
    await addRolePage.submit();
    expect(await addRolePage.getClosingDateErrorText()).toContain(
      'must be in the future',
    );
  });

  test('should clear validation errors when user corrects input', async ({
    page,
  }) => {
    const addRolePage = new AddRolePage(page);

    // Submit form with errors
    await addRolePage.fillValidForm({
      roleName: 'A'.repeat(101),
      description: 'Short',
      responsibilities: 'Short',
      jobSpecLink: 'https://google.com/doc',
    });
    await addRolePage.submit();

    // Verify errors are shown
    expect(await addRolePage.isRoleNameErrorVisible()).toBe(true);
    expect(await addRolePage.isDescriptionErrorVisible()).toBe(true);
    expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(true);
    expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(true);

    // Correct the errors
    await addRolePage.fillRoleName('Valid Role Name');
    await addRolePage.fillDescription(
      'This is a valid description with enough characters',
    );
    await addRolePage.fillResponsibilities(
      'These are valid responsibilities with enough characters',
    );
    await addRolePage.fillJobSpecLink(
      'https://kainossoftwareltd.sharepoint.com/sites/test/doc.pdf',
    );

    // Verify errors are cleared
    expect(await addRolePage.isRoleNameErrorVisible()).toBe(false);
    expect(await addRolePage.isDescriptionErrorVisible()).toBe(false);
    expect(await addRolePage.isResponsibilitiesErrorVisible()).toBe(false);
    expect(await addRolePage.isJobSpecLinkErrorVisible()).toBe(false);
  });

  test('should update character counters in real-time', async ({ page }) => {
    const addRolePage = new AddRolePage(page);

    const descriptionText = 'This is a test description';
    await addRolePage.fillDescription(descriptionText);
    expect(await addRolePage.getDescriptionCharCount()).toBe(
      `${descriptionText.length}/500`,
    );

    const responsibilitiesText = 'These are test responsibilities';
    await addRolePage.fillResponsibilities(responsibilitiesText);
    expect(await addRolePage.getResponsibilitiesCharCount()).toBe(
      `${responsibilitiesText.length}/1000`,
    );
  });

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
