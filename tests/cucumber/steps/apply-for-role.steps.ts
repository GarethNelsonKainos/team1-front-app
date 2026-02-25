import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APPLICANT } from '../../config/test-users';
import { ApplicationPage } from '../../pages/ApplicationPage';
import { LoginPage } from '../../pages/LoginPage';
import type { PlaywrightWorld } from '../support/world';

const MOCK_PDF = Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>endobj');

Given('I am logged in as an applicant', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.login(APPLICANT.email, APPLICANT.password);
  expect(await loginPage.getUrl()).toContain('/job-roles');
});

When(
  'I navigate to the {string} role',
  async function (this: PlaywrightWorld, roleName: string) {
    const appPage = new ApplicationPage(this.page);
    await appPage.clickRoleByName(roleName);
    expect(await appPage.getRoleHeadingText()).toContain(roleName);
  },
);

When('I click Apply Now', async function (this: PlaywrightWorld) {
  const appPage = new ApplicationPage(this.page);
  await appPage.clickApplyNow();
  expect(await appPage.getApplyFormHeadingText()).toContain('Apply for');
});

When('I upload my CV', async function (this: PlaywrightWorld) {
  const appPage = new ApplicationPage(this.page);
  await appPage.uploadCv(MOCK_PDF);
});

When('I submit the application', async function (this: PlaywrightWorld) {
  const appPage = new ApplicationPage(this.page);
  await appPage.submitApplication();
});

Then(
  'I should see the application success page',
  async function (this: PlaywrightWorld) {
    expect(this.page.url()).toContain('/application-success');
  },
);
