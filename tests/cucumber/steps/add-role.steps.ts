import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ADMIN } from '../../config/test-users';
import { AddRolePage } from '../../pages/AddRolePage';
import { JobRolesListPage } from '../../pages/JobRolesListPage';
import { LoginPage } from '../../pages/LoginPage';

let addRolePage: AddRolePage;
let jobRolesPage: JobRolesListPage;
let testRoleName: string;

Given('I am logged in as an admin', async function () {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.login(ADMIN.email, ADMIN.password);
  await this.page.waitForURL('**/job-roles', { timeout: 10000 });
});

Given('I am on the add job role page', async function () {
  if (!this.page) throw new Error('Page is not initialized');
  addRolePage = new AddRolePage(this.page);
  await addRolePage.goto();
  await expect(this.page).toHaveURL('/add-role');
});

Given('I have filled in all required fields with valid data', async () => {
  testRoleName = `E2E Test Role ${Date.now()}`;
  await addRolePage.fillValidForm({ roleName: testRoleName });
});

When('I submit the form', async () => {
  await addRolePage.submit();
});

Then('I should be redirected to the job roles list page', async function () {
  if (!this.page) throw new Error('Page is not initialized');
  await expect(this.page).toHaveURL('/job-roles');
});

Then('the new job role should be visible in the list', async function () {
  if (!this.page) throw new Error('Page is not initialized');
  jobRolesPage = new JobRolesListPage(this.page);
  expect(await jobRolesPage.isRoleVisible(testRoleName)).toBe(true);
});