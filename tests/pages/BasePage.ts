import type { Locator, Page } from '@playwright/test';

/**
 * BasePage (MasterPage Pattern)
 * Holds common UI elements present on every page - nav, header, logout button.
 * All page classes extend this.
 */
export class BasePage {
  readonly page: Page;
  readonly navJobRolesLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navJobRolesLink = page.getByRole('link', {
      name: 'Current Vacancies',
    });
    this.logoutButton = page.locator(
      'button[type="submit"][form], form[action="/logout"] button',
    );
  }
}
