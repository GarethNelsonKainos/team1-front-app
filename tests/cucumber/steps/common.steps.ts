import { Given } from "@cucumber/cucumber";
import { LoginPage } from "../../pages/LoginPage";
import type { PlaywrightWorld } from "../support/world";
import { APPLICANT } from "../../config/test-users";
import { expect } from "@playwright/test";

Given('I am logged in as an applicant', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.login(APPLICANT.email, APPLICANT.password);
  expect(await loginPage.getUrl()).toContain('/job-roles');
});