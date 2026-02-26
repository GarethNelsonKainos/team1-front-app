import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APPLICANT } from '../../config/test-users';
import { AddRolePage } from '../../pages/AddRolePage';
import { JobRolesListPage } from '../../pages/JobRolesListPage';
import { LoginPage } from '../../pages/LoginPage';
import type { PlaywrightWorld } from '../support/world';

Given(
  'that I am signed in as a standard user',
  async function (this: PlaywrightWorld) {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);
    expect(await loginPage.getUrl()).toContain('/job-roles');
  },
);

When(
  'I navigate to the {string} section',
  async function (this: PlaywrightWorld, url: string) {
    await this.page.goto(url);
  },
);

Then(
  'I should not see the {string} button',
  async function (this: PlaywrightWorld, buttonText: string) {
    const jobRolesListPage = new JobRolesListPage(this.page);
    const buttonCount = await jobRolesListPage.getButtonCount(buttonText);
    expect(buttonCount).toBe(0);
  },
);

Then(
  'I should see the {string} message',
  async function (this: PlaywrightWorld, message: string) {
    const addRolePage = new AddRolePage(this.page);
    const isVisible = await addRolePage.isErrorMessageVisible(message);
    expect(isVisible).toBe(true);
  },
);
