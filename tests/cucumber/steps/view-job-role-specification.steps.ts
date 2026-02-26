import { Given, Then, When } from '@cucumber/cucumber';
import { type Page, expect } from '@playwright/test';
import { APPLICANT } from '../../config/test-users';
import { JobRoleDetailPage } from '../../pages/JobRoleDetailPage';
import { JobRolesListPage } from '../../pages/JobRolesListPage';
import { LoginPage } from '../../pages/LoginPage';

let page: Page;
let loginPage: LoginPage;
let jobRolesPage: JobRolesListPage;
let detailPage: JobRoleDetailPage;

Given('I am currently logged in as an applicant', async function () {
  loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.login(APPLICANT.email, APPLICANT.password);
});

When('I view the first job role', async function () {
  jobRolesPage = new JobRolesListPage(this.page);
  await jobRolesPage.clickFirstRole();
  detailPage = new JobRoleDetailPage(this.page);
});

Then('I should see the job role heading', async () => {
  expect(await detailPage.isHeadingVisible()).toBe(true);
});

Then('I should see the location', async () => {
  expect(await detailPage.getLocation()).toBeTruthy();
});

Then('I should see the capability', async () => {
  expect(await detailPage.getCapability()).toBeTruthy();
});

Then('I should see the band', async () => {
  expect(await detailPage.getBand()).toBeTruthy();
});

Then('I should see the closing date in DD/MM/YYYY format', async () => {
  const closingDate = await detailPage.getClosingDate();
  expect(closingDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
});

Then('I should see the open positions', async () => {
  expect(await detailPage.getOpenPositions()).toBeTruthy();
});

Then('I should see the apply button', async () => {
  expect(await detailPage.isApplyButtonVisible()).toBe(true);
});

Then('the apply button should be enabled', async () => {
  expect(await detailPage.isApplyButtonDisabled()).toBe(false);
});

When('there are no open positions', async function () {
  const openPositions = await detailPage.getOpenPositions();
  if (openPositions !== '0') {
    this.skip();
  }
});

Then('the apply button should be disabled', async () => {
  expect(await detailPage.isApplyButtonDisabled()).toBe(true);
});

When('I navigate to a non-existent job role', async function () {
  await this.page.goto('/job-roles/99999');
  detailPage = new JobRoleDetailPage(this.page);
});

Then('I should see an error message', async () => {
  expect(await detailPage.isErrorMessageVisible()).toBe(true);
});
