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

  getErrorMessage(message: string): Locator {
    return this.page.locator('h1, p, div').filter({ hasText: message }).first();
  }

  async isErrorMessageVisible(message: string): Promise<boolean> {
    const errorLocator = this.getErrorMessage(message);
    return await errorLocator.isVisible({ timeout: 10000 });
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  async signOut() {
    await this.logoutButton.click();
  }
}
