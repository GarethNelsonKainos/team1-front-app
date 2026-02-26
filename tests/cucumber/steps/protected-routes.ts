import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ADMIN } from '../../config/test-users';
import { LoginPage } from '../../pages/LoginPage';
import type { PlaywrightWorld } from '../support/world';

function getPage(world: PlaywrightWorld) {
  if (!world.page) {
    throw new Error('Playwright page is not initialized in World');
  }
  return world.page;
}

Given('I am not logged in', async function (this: PlaywrightWorld) {
  await this.context?.clearCookies();
});

Given('I am logged in as an admin', async function (this: PlaywrightWorld) {
  const page = getPage(this);
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(ADMIN.email, ADMIN.password);
  await expect(page).toHaveURL(/\/job-roles$/);
});

When('I go to {string}', async function (this: PlaywrightWorld, route: string) {
  await this.page?.goto(route);
});

Then(
  'I should be redirected to {string}',
  async function (this: PlaywrightWorld, route: string) {
    const page = getPage(this);
    await expect(page).toHaveURL(
      new RegExp(`${route.replace('/', '\\/')}(\\?.*)?$`),
    );
  },
);

Then('I should be given an error', async function (this: PlaywrightWorld) {
  const page = getPage(this);
  await expect(page.locator('body')).toContainText(
    /error|not permitted|access denied|unauthori[sz]ed|forbidden/i,
  );
});

Then('I should see the add role page', async function (this: PlaywrightWorld) {
  const page = getPage(this);
  await expect(page).toHaveURL(/\/add-role$/);
  await expect(
    page.getByRole('heading', { name: 'Add New Job Role' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add Job Role' }),
  ).toBeVisible();
});
