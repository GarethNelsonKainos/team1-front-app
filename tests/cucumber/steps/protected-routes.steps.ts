import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { PlaywrightWorld } from '../support/world';

Given('I am not logged in', async function (this: PlaywrightWorld) {
  await this.context.clearCookies();
});

When(
  'I navigate to {string}',
  async function (this: PlaywrightWorld, route: string) {
    await this.page.goto(route);
  },
);

Then(
  'I should be redirected to {string}',
  async function (this: PlaywrightWorld, route: string) {
    await expect(this.page).toHaveURL(route);
  },
);
