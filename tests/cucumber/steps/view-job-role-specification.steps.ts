import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APPLICANT } from '../../config/test-users';
import { JobRoleDetailPage } from '../../pages/JobRoleDetailPage';
import { JobRolesListPage } from '../../pages/JobRolesListPage';
import { LoginPage } from '../../pages/LoginPage';
import type { PlaywrightWorld } from '../support/world';

let loginPage: LoginPage;
let jobRolesPage: JobRolesListPage;
let detailPage: JobRoleDetailPage;

Given('I am logged in as an applicant', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.login(APPLICANT.email, APPLICANT.password);
  expect(await loginPage.getUrl()).toContain('/job-roles');
});
When('I view the first job role', async function (this: PlaywrightWorld) {
  if (!this.page) {
    throw new Error('Playwright page is not available in the current world');
  }
  jobRolesPage = new JobRolesListPage(this.page);
  await jobRolesPage.clickFirstRole();
  detailPage = new JobRoleDetailPage(this.page);
});
Then(
  'I should see the job role heading',
  async function (this: PlaywrightWorld) {
    expect(await detailPage.isHeadingVisible()).toBe(true);
  },
);
Then('I should see the location', async function (this: PlaywrightWorld) {
  expect(await detailPage.getLocation()).toBeTruthy();
});
Then('I should see the capability', async function (this: PlaywrightWorld) {
  expect(await detailPage.getCapability()).toBeTruthy();
});
Then('I should see the band', async function (this: PlaywrightWorld) {
  expect(await detailPage.getBand()).toBeTruthy();
});
Then(
  'I should see the closing date in DD/MM/YYYY format',
  async function (this: PlaywrightWorld) {
    const closingDate = await detailPage.getClosingDate();
    expect(closingDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  },
);
Then('I should see the open positions', async function (this: PlaywrightWorld) {
  expect(await detailPage.getOpenPositions()).toBeTruthy();
});
Then('I should see the apply button', async function (this: PlaywrightWorld) {
  expect(await detailPage.isApplyButtonVisible()).toBe(true);
});
Then(
  'the apply button should be enabled',
  async function (this: PlaywrightWorld) {
    expect(await detailPage.isApplyButtonDisabled()).toBe(false);
  },
);
When('there are no open positions', async function (this: PlaywrightWorld) {
  await this.page?.request.delete('/api/positions');
  await this.page?.reload();
  const openPositions = await detailPage.getOpenPositions();
  expect(openPositions).toBe('0');
});
Then(
  'the apply button should be disabled',
  async function (this: PlaywrightWorld) {
    expect(await detailPage.isApplyButtonDisabled()).toBe(true);
  },
);
When(
  'I navigate to a non-existent job role',
  async function (this: PlaywrightWorld) {
    if (!this.page) {
      throw new Error('Playwright page is not available in the current world');
    }
    await this.page.goto('/job-roles/99999');
    detailPage = new JobRoleDetailPage(this.page);
  },
);

Then('I should see an error message', async () => {
  expect(await detailPage.isErrorMessageVisible()).toBe(true);
});
