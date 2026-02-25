import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { APPLICANT } from '../../config/test-users';
import { ApplicationPage } from '../../pages/ApplicationPage';
import { JobRoleDetailPage } from '../../pages/JobRoleDetailPage';
import { JobRolesListPage } from '../../pages/JobRolesListPage';
import { LoginPage } from '../../pages/LoginPage';
import type { PlaywrightWorld } from '../support/world';

Given('I log in as an applicant', async function (this: PlaywrightWorld) {
    const loginPage = new LoginPage(this.page);
    await loginPage.goto();
    await loginPage.login(APPLICANT.email, APPLICANT.password);
    expect(await loginPage.getUrl()).toContain('/job-roles');
});

When('I navigate to the {string} role details page', async function (this: PlaywrightWorld, roleName: string) {
    const detailsPage = new ApplicationPage(this.page);
    await detailsPage.clickRoleByName(roleName);
    expect(await detailsPage.getRoleHeadingText()).toContain(roleName);
});

Then('I should see the job role details page for {string}', async function (this: PlaywrightWorld, roleName: string) {
    const detailsPage = new ApplicationPage(this.page);
    expect(await detailsPage.getRoleHeadingText()).toContain(roleName);
});

When('I click the Back to Job Roles button', async function (this: PlaywrightWorld) {
    const detailsPage = new JobRoleDetailPage(this.page);
    await detailsPage.clickBackToJobRoles();
    expect(await detailsPage.getUrl()).toContain('/job-roles');
});

Then('I should be taken back to the {string} page', async function (this: PlaywrightWorld, route: string) {
    expect(this.page.url()).toContain(route);
});